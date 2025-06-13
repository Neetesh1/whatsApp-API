const { Pool } = require('pg');
require('dotenv').config({ path: './config/.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'whatsapp_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'whatsapp_db',
  password: String(process.env.DB_PASSWORD || 'whatsapp_pass'),
  port: parseInt(process.env.DB_PORT) || 5432,
});

// Test connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Database connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
