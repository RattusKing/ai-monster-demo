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

async function runMigrations() {
    console.log('🚀 Starting database migrations...\n');

    try {
        // Read migration file
        const migrationFile = path.join(__dirname, '001_initial_schema.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        // Execute migration
        console.log('📝 Running migration: 001_initial_schema.sql');
        await pool.query(sql);
        console.log('✅ Migration completed successfully\n');

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
