const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Pages
app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));
app.get('/services', (req, res) => res.render('services'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/quote', (req, res) => res.render('quote', { success: false, error: false }));

// Quote form submission — saves to database
app.post('/quote', async (req, res) => {
  const { name, email, phone, insurance_type, details } = req.body;
  try {
    await pool.query(
      `INSERT INTO quote_requests (name, email, phone, insurance_type, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, phone, insurance_type, details]
    );
    res.render('quote', { success: true, error: false });
  } catch (err) {
    console.error(err);
    res.render('quote', { success: false, error: true });
  }
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});