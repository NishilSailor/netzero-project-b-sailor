const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seed() {
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING`,
    ['admin', adminHash]
  );

  const clientHash = await bcrypt.hash('client123', 10);
  await pool.query(`UPDATE clients SET password_hash = $1`, [clientHash]);

  console.log('Seeded successfully');
  process.exit();
}

seed();