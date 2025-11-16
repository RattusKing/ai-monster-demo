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
    }
};

module.exports = db;
