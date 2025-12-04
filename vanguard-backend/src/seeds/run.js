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
 * Run database seeds
 */
const runSeeds = async () => {
  console.log('🌱 Running database seeds...\n');

  try {
    // Get all seed files
    const seedsDir = __dirname;
    const files = fs.readdirSync(seedsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Execute in order

    if (files.length === 0) {
      console.log('⚠️  No seed files found');
      return;
    }

    // Execute each seed
    for (const file of files) {
      console.log(`📄 Executing: ${file}`);
      const filePath = path.join(seedsDir, file);
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

    console.log('✅ All seeds completed successfully!\n');
    console.log('📝 Test users created successfully. Check seed files for login details.\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run seeds
runSeeds();
