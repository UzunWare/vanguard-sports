const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vanguard_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

/**
 * Run database migrations
 */
const runMigrations = async () => {
  console.log('🔄 Running database migrations...\n');

  try {
    // Get all migration files
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Execute in order

    if (files.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    // Execute each migration
    for (const file of files) {
      console.log(`📄 Executing: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await pool.query(sql);
        console.log(`✅ ${file} - SUCCESS\n`);
      } catch (error) {
        console.error(`❌ ${file} - FAILED`);
        console.error(`   Error: ${error.message}\n`);
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migrations
runMigrations();
