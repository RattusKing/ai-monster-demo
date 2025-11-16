// ========================================
// Database Migration Runner
// ========================================

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

const migrations = [
    '001_initial_schema.sql',
    '002_avatar_profiles.sql'
];

async function runMigrations() {
    console.log('🚀 Starting database migrations...\n');

    try {
        for (const migrationFile of migrations) {
            const migrationPath = path.join(__dirname, migrationFile);

            if (!fs.existsSync(migrationPath)) {
                console.log(`⏭️  Skipping ${migrationFile} (not found)`);
                continue;
            }

            const sql = fs.readFileSync(migrationPath, 'utf8');

            console.log(`📝 Running migration: ${migrationFile}`);
            await pool.query(sql);
            console.log(`✅ ${migrationFile} completed successfully\n`);
        }

        // Verify tables
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('📊 Database tables:');
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

        console.log('\n🎉 All migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigrations();
