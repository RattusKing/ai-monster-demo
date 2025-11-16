// ========================================
// PostgreSQL Database Configuration
// ========================================

const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false // Required for Render PostgreSQL
    } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully');
    }
});

// ========================================
// Database Helper Functions
// ========================================

const db = {
    // Execute a query
    query: (text, params) => pool.query(text, params),

    // Get a client from the pool (for transactions)
    getClient: () => pool.connect(),

    // User operations
    users: {
        async create(discordId, username, discriminator, avatar) {
            const query = `
                INSERT INTO users (discord_id, username, discriminator, avatar, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                ON CONFLICT (discord_id)
                DO UPDATE SET
                    username = EXCLUDED.username,
                    discriminator = EXCLUDED.discriminator,
                    avatar = EXCLUDED.avatar,
                    updated_at = NOW()
                RETURNING *
            `;
            const result = await pool.query(query, [discordId, username, discriminator, avatar]);
            return result.rows[0];
        },

        async findByDiscordId(discordId) {
            const query = 'SELECT * FROM users WHERE discord_id = $1';
            const result = await pool.query(query, [discordId]);
            return result.rows[0];
        },

        async getAll() {
            const query = 'SELECT * FROM users ORDER BY created_at DESC';
            const result = await pool.query(query);
            return result.rows;
        }
    },

    // Avatar operations
    avatars: {
        async upsert(userId, avatarData) {
            const query = `
                INSERT INTO avatars (user_id, idle_image, talking_image, muted_image, deafened_image, settings, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (user_id)
                DO UPDATE SET
                    idle_image = EXCLUDED.idle_image,
                    talking_image = EXCLUDED.talking_image,
                    muted_image = EXCLUDED.muted_image,
                    deafened_image = EXCLUDED.deafened_image,
                    settings = EXCLUDED.settings,
                    updated_at = NOW()
                RETURNING *
            `;
            const result = await pool.query(query, [
                userId,
                avatarData.idle,
                avatarData.talking,
                avatarData.muted || null,
                avatarData.deafened || null,
                JSON.stringify(avatarData.settings || {})
            ]);
            return result.rows[0];
        },

        async findByUserId(userId) {
            const query = 'SELECT * FROM avatars WHERE user_id = $1';
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        },

        async findByDiscordId(discordId) {
            const query = `
                SELECT a.* FROM avatars a
                JOIN users u ON a.user_id = u.id
                WHERE u.discord_id = $1
            `;
            const result = await pool.query(query, [discordId]);
            return result.rows[0];
        }
    },

    // Analytics operations
    analytics: {
        async logEvent(eventType, userId = null, metadata = {}) {
            const query = `
                INSERT INTO analytics (event_type, user_id, metadata, created_at)
                VALUES ($1, $2, $3, NOW())
                RETURNING *
            `;
            const result = await pool.query(query, [
                eventType,
                userId,
                JSON.stringify(metadata)
            ]);
            return result.rows[0];
        },

        async getStats(startDate, endDate) {
            const query = `
                SELECT
                    event_type,
                    COUNT(*) as count,
                    DATE_TRUNC('day', created_at) as date
                FROM analytics
                WHERE created_at >= $1 AND created_at <= $2
                GROUP BY event_type, date
                ORDER BY date DESC, count DESC
            `;
            const result = await pool.query(query, [startDate, endDate]);
            return result.rows;
        }
    },

    // Avatar Profile operations
    profiles: {
        // Create a new profile
        async create(userId, profileName, profileSlug, isActive = false) {
            const query = `
                INSERT INTO avatar_profiles (user_id, profile_name, profile_slug, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING *
            `;
            const result = await pool.query(query, [userId, profileName, profileSlug, isActive]);
            return result.rows[0];
        },

        // Update profile images and settings
        async update(profileId, avatarData) {
            const query = `
                UPDATE avatar_profiles
                SET
                    idle_image = $2,
                    talking_image = $3,
                    muted_image = $4,
                    deafened_image = $5,
                    settings = $6,
                    updated_at = NOW()
                WHERE id = $1
                RETURNING *
            `;
            const result = await pool.query(query, [
                profileId,
                avatarData.idle || null,
                avatarData.talking || null,
                avatarData.muted || null,
                avatarData.deafened || null,
                JSON.stringify(avatarData.settings || {})
            ]);
            return result.rows[0];
        },

        // Get all profiles for a user
        async findByUserId(userId) {
            const query = `
                SELECT * FROM avatar_profiles
                WHERE user_id = $1
                ORDER BY is_active DESC, created_at ASC
            `;
            const result = await pool.query(query, [userId]);
            return result.rows;
        },

        // Get a specific profile by user and slug
        async findByUserAndSlug(userId, profileSlug) {
            const query = `
                SELECT * FROM avatar_profiles
                WHERE user_id = $1 AND profile_slug = $2
            `;
            const result = await pool.query(query, [userId, profileSlug]);
            return result.rows[0];
        },

        // Get a specific profile by Discord ID and slug
        async findByDiscordIdAndSlug(discordId, profileSlug) {
            const query = `
                SELECT p.* FROM avatar_profiles p
                JOIN users u ON p.user_id = u.id
                WHERE u.discord_id = $1 AND p.profile_slug = $2
            `;
            const result = await pool.query(query, [discordId, profileSlug]);
            return result.rows[0];
        },

        // Get active profile for a user
        async getActive(userId) {
            const query = `
                SELECT * FROM avatar_profiles
                WHERE user_id = $1 AND is_active = TRUE
                LIMIT 1
            `;
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        },

        // Get active profile by Discord ID
        async getActiveByDiscordId(discordId) {
            const query = `
                SELECT p.* FROM avatar_profiles p
                JOIN users u ON p.user_id = u.id
                WHERE u.discord_id = $1 AND p.is_active = TRUE
                LIMIT 1
            `;
            const result = await pool.query(query, [discordId]);
            return result.rows[0];
        },

        // Set a profile as active (automatically deactivates others via trigger)
        async setActive(profileId, userId) {
            const query = `
                UPDATE avatar_profiles
                SET is_active = TRUE, updated_at = NOW()
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [profileId, userId]);
            return result.rows[0];
        },

        // Delete a profile
        async delete(profileId, userId) {
            const query = `
                DELETE FROM avatar_profiles
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [profileId, userId]);
            return result.rows[0];
        },

        // Rename a profile
        async rename(profileId, userId, newName, newSlug) {
            const query = `
                UPDATE avatar_profiles
                SET profile_name = $3, profile_slug = $4, updated_at = NOW()
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [profileId, userId, newName, newSlug]);
            return result.rows[0];
        },

        // Get profile count for a user
        async count(userId) {
            const query = `
                SELECT COUNT(*) as count
                FROM avatar_profiles
                WHERE user_id = $1
            `;
            const result = await pool.query(query, [userId]);
            return parseInt(result.rows[0].count);
        }
    }
};

module.exports = db;
