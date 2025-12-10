const { Pool } = require('pg');

// Konfigurace připojení k PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'productdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  max: 20, // Maximální počet připojení v poolu
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event handlers pro monitoring
pool.on('connect', () => {
  console.log('📊 Nové připojení k PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Neočekávaná chyba v PostgreSQL poolu:', err);
});

// Testování připojení
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('Chyba při testování připojení k databázi:', error);
    throw error;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testDatabaseConnection
};
