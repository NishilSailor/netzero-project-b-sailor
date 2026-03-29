-- BSMW Insurance Portal — Database Schema & Sample Data
-- Created for Net Zero Hosting Project B

-- Drop tables if they exist
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS policies;
DROP TABLE IF EXISTS quote_requests;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS brokers;

-- Brokers
CREATE TABLE brokers (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(100) NOT NULL,
  specialization   VARCHAR(100)
);

-- Clients
CREATE TABLE clients (
  id                  SERIAL PRIMARY KEY,
  full_name           VARCHAR(100) NOT NULL,
  email               VARCHAR(100) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  phone               VARCHAR(20),
  address             TEXT,
  assigned_broker_id  INT REFERENCES brokers(id),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies
CREATE TABLE policies (
  id            SERIAL PRIMARY KEY,
  client_id     INT REFERENCES clients(id),
  policy_type   VARCHAR(100) NOT NULL,
  insurer       VARCHAR(100),
  premium       DECIMAL(10,2),
  start_date    DATE,
  renewal_date  DATE,
  status        VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Quote Requests
CREATE TABLE quote_requests (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(100) NOT NULL,
  email               VARCHAR(100) NOT NULL,
  phone               VARCHAR(20),
  insurance_type      VARCHAR(100),
  details             TEXT,
  status              VARCHAR(20) DEFAULT 'SUBMITTED',
  assigned_broker_id  INT REFERENCES brokers(id),
  submitted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users
CREATE TABLE admin_users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

-- Messages
CREATE TABLE messages (
  id         SERIAL PRIMARY KEY,
  client_id  INT REFERENCES clients(id),
  broker_id  INT REFERENCES brokers(id),
  body       TEXT NOT NULL,
  sent_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at    TIMESTAMP
);

-- Sample Data
INSERT INTO brokers (name, email, specialization) VALUES
  ('Sarah Mitchell', 'sarah@bsmw.ca', 'Home & Auto'),
  ('James Barber',   'james@bsmw.ca', 'Commercial'),
  ('Linda Wallace',  'linda@bsmw.ca', 'Life & Health');

-- Note: password_hash below = bcrypt hash of 'client123'
INSERT INTO clients (full_name, email, password_hash, phone, address, assigned_broker_id) VALUES
  ('Tom Henderson', 'tom@email.com',   '$2b$10$examplehashfortom000000000000000000000000000', '613-555-0101', '45 King St, Kingston', 1),
  ('Maria Santos',  'maria@email.com', '$2b$10$examplehashformaria0000000000000000000000000', '613-555-0192', '12 Princess St, Kingston', 2);

INSERT INTO policies (client_id, policy_type, insurer, premium, start_date, renewal_date, status) VALUES
  (1, 'Home Insurance',    'Intact', 1200.00, '2024-01-01', '2026-01-01', 'ACTIVE'),
  (1, 'Auto Insurance',    'Aviva',   950.00, '2024-03-15', '2026-03-15', 'ACTIVE'),
  (2, 'Commercial Property','Intact', 3400.00, '2024-06-01', '2026-06-01', 'ACTIVE');

INSERT INTO quote_requests (name, email, phone, insurance_type, details, status, assigned_broker_id) VALUES
  ('Derek Brown', 'derek@email.com', '613-555-0188', 'Home Insurance',  'Looking for coverage on a new home purchase', 'SUBMITTED',  1),
  ('Priya Nair',  'priya@email.com', '613-555-0234', 'Life Insurance',  'Interested in 20-year term life coverage',   'IN_REVIEW',  3);

INSERT INTO messages (client_id, broker_id, body, sent_at) VALUES
  (1, 1, 'Hi Sarah, when does my home policy renew exactly?',           '2025-02-10 10:30:00'),
  (1, 1, 'Hi Tom, your renewal is January 1st. I will reach out soon!', '2025-02-10 11:00:00');

-- Note: Run seed.js to generate real bcrypt hashes for client passwords
-- "node seed.js" in the project folder
-- Admin login: username = admin, password = admin123 (set by seed.js)