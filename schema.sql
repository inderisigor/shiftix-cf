-- Run this in Cloudflare D1 console to set up the database

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales',
  password TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  market TEXT DEFAULT 'india',
  company TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  gst_number TEXT,
  country TEXT,
  currency TEXT DEFAULT 'INR',
  equipment TEXT NOT NULL,
  sub_type TEXT,
  model TEXT,
  quantity INTEGER DEFAULT 1,
  usd_price REAL DEFAULT 0,
  exchange_rate REAL DEFAULT 91,
  freight REAL DEFAULT 80000,
  margin_pct REAL DEFAULT 25,
  cif_value REAL DEFAULT 0,
  landed_cost REAL DEFAULT 0,
  net_price REAL DEFAULT 0,
  quoted_price REAL DEFAULT 0,
  margin_value REAL DEFAULT 0,
  total_value REAL DEFAULT 0,
  status TEXT DEFAULT 'Sent',
  close_date TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  equipment TEXT,
  company_type TEXT,
  industry TEXT,
  city TEXT,
  size TEXT,
  turnover TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  score INTEGER DEFAULT 70,
  est_value REAL DEFAULT 0,
  units INTEGER DEFAULT 1,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Insert default users (password: Shiftix@2026)
INSERT OR IGNORE INTO users (id, email, name, role, password) VALUES
  ('usr-001', 'neha.singh@shiftix.in',        'Neha Singh',           'sales',   'Shiftix@2026'),
  ('usr-002', 'ritwik.kundu@shiftix.in',       'Ritwik Kundu',         'manager', 'Shiftix@2026'),
  ('usr-003', 'harshshikha.nandan@shiftix.in', 'Harshshikha Nandan',   'sales',   'Shiftix@2026'),
  ('usr-004', 'siddhant.prajapati@shiftix.in', 'Siddhant Prajapati',   'sales',   'Shiftix@2026');
