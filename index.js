const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ── Auth Middleware ──────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session.admin) return next();
  res.redirect('/admin/login');
}

function requireClient(req, res, next) {
  if (req.session.client) return next();
  res.redirect('/client/login');
}

// ── Public Pages ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));
app.get('/services', (req, res) => res.render('services'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/quote', (req, res) => res.render('quote', { success: false, error: false }));

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

// ── Admin Auth ────────────────────────────────────────────────────────
app.get('/admin/login', (req, res) => {
  res.render('admin/login', { error: false });
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE username = $1', [username]
    );
    const admin = result.rows[0];
    if (!admin) return res.render('admin/login', { error: true });

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.render('admin/login', { error: true });

    req.session.admin = { id: admin.id, username: admin.username };
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/login', { error: true });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ── Admin Dashboard ───────────────────────────────────────────────────
app.get('/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const quotes = await pool.query(
      `SELECT * FROM quote_requests ORDER BY submitted_at DESC`
    );
    const clients = await pool.query(
      `SELECT clients.*, brokers.name AS broker_name
       FROM clients LEFT JOIN brokers ON clients.assigned_broker_id = brokers.id`
    );
    const brokers = await pool.query(`SELECT * FROM brokers`);
    res.render('admin/dashboard', {
      admin: req.session.admin,
      quotes: quotes.rows,
      clients: clients.rows,
      brokers: brokers.rows
    });
  } catch (err) {
    console.error(err);
    res.send('Error loading dashboard');
  }
});

// ── Client Auth ───────────────────────────────────────────────────────
app.get('/client/login', (req, res) => {
  res.render('client/login', { error: false });
});

app.post('/client/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE email = $1', [email]
    );
    const client = result.rows[0];
    if (!client) return res.render('client/login', { error: true });

    const match = await bcrypt.compare(password, client.password_hash);
    if (!match) return res.render('client/login', { error: true });

    req.session.client = { id: client.id, name: client.full_name };
    res.redirect('/client/dashboard');
  } catch (err) {
    console.error(err);
    res.render('client/login', { error: true });
  }
});

app.get('/client/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/client/login');
});

// ── Client Dashboard ──────────────────────────────────────────────────
app.get('/client/dashboard', requireClient, async (req, res) => {
  try {
    const clientId = req.session.client.id;

    const policies = await pool.query(
      `SELECT * FROM policies WHERE client_id = $1`, [clientId]
    );
    const messages = await pool.query(
      `SELECT messages.*, brokers.name AS broker_name
       FROM messages
       LEFT JOIN brokers ON messages.broker_id = brokers.id
       WHERE messages.client_id = $1
       ORDER BY messages.sent_at DESC`,
      [clientId]
    );
    res.render('client/dashboard', {
      client: req.session.client,
      policies: policies.rows,
      messages: messages.rows
    });
  } catch (err) {
    console.error(err);
    res.send('Error loading dashboard');
  }
});

// ── Update Quote Status ───────────────────────────────────────────────
app.post('/admin/quote/status', requireAdmin, async (req, res) => {
  const { id, status } = req.body;
  try {
    await pool.query(
      `UPDATE quote_requests SET status = $1 WHERE id = $2`,
      [status, id]
    );
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
});

// ── Add New Client ────────────────────────────────────────────────────
app.post('/admin/client/add', requireAdmin, async (req, res) => {
  const { full_name, email, phone, address, assigned_broker_id } = req.body;
  try {
    const defaultHash = await bcrypt.hash('client123', 10);
    await pool.query(
      `INSERT INTO clients (full_name, email, password_hash, phone, address, assigned_broker_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [full_name, email, defaultHash, phone, address, assigned_broker_id || null]
    );
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
});

// ── Delete Client ─────────────────────────────────────────────────────
app.post('/admin/client/delete', requireAdmin, async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query(`DELETE FROM messages WHERE client_id = $1`, [id]);
    await pool.query(`DELETE FROM policies WHERE client_id = $1`, [id]);
    await pool.query(`DELETE FROM clients WHERE id = $1`, [id]);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
});

// ── Admin Send Message to Client ──────────────────────────────────────
app.post('/admin/message/send', requireAdmin, async (req, res) => {
  const { client_id, broker_id, body } = req.body;
  try {
    await pool.query(
      `INSERT INTO messages (client_id, broker_id, body) VALUES ($1, $2, $3)`,
      [client_id, broker_id, body]
    );
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
});

// ── Client Send Message to Broker ─────────────────────────────────────
app.post('/client/message/send', requireClient, async (req, res) => {
  const { body } = req.body;
  const clientId = req.session.client.id;
  try {
    const brokerResult = await pool.query(
      `SELECT assigned_broker_id FROM clients WHERE id = $1`, [clientId]
    );
    const brokerId = brokerResult.rows[0].assigned_broker_id;
    await pool.query(
      `INSERT INTO messages (client_id, broker_id, body) VALUES ($1, $2, $3)`,
      [clientId, brokerId, body]
    );
    res.redirect('/client/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/client/dashboard');
  }
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});