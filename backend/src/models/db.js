const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});


// -----------------------------
// RETRY LOGIC WRAPPER
// -----------------------------
async function queryWithRetry(text, params, retries = 3, delay = 300) {
  try {
    return await pool.query(text, params);
  
  } catch (err) {
    console.error(`Query failed. Retries left: ${retries}`, err.message);

    // if no retries left → throw error
    if (retries === 0) throw err;

    // wait before retry
    await new Promise((res) => setTimeout(res, delay));

    // exponential backoff: increase delay each retry
    return queryWithRetry(text, params, retries - 1, delay * 2);
  }
}

module.exports = {
  query: queryWithRetry,
  pool,
};
