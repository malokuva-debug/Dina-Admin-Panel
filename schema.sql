-- Supabase Database Schema for Admin Panel
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CATEGORIES TABLE
-- ==========================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SERVICES TABLE
-- ==========================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- APPOINTMENTS TABLE
-- ==========================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker TEXT NOT NULL CHECK (worker IN ('dina', 'kida')),
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- EXPENSES TABLE
-- ==========================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  date DATE NOT NULL,
  worker TEXT NOT NULL CHECK (worker IN ('dina', 'kida')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BUSINESS HOURS TABLE
-- ==========================================
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker TEXT NOT NULL CHECK (worker IN ('dina', 'kida')),
  open TIME NOT NULL,
  close TIME NOT NULL,
  lunch_start TIME NOT NULL,
  lunch_end TIME NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker)
);

-- ==========================================
-- WEEKLY DAYS OFF TABLE
-- ==========================================
CREATE TABLE weekly_days_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker TEXT NOT NULL CHECK (worker IN ('dina', 'kida')),
  day TEXT NOT NULL CHECK (day IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  is_off BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker, day)
);

-- ==========================================
-- UNAVAILABLE DATES TABLE
-- ==========================================
CREATE TABLE unavailable_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker TEXT NOT NULL CHECK (worker IN ('dina', 'kida')),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker, date)
);

-- ==========================================
-- UNAVAILABLE TIMES TABLE
-- ==========================================
CREATE TABLE unavailable_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker TEXT NOT NULL CHECK (worker IN ('dina', 'kida')),
  date DATE NOT NULL,
  start TIME NOT NULL,
  "end" TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_appointments_worker ON appointments(worker);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_expenses_worker ON expenses(worker);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_services_category ON services(category_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_days_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailable_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailable_times ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to access everything
-- You can customize these policies based on your auth requirements
CREATE POLICY "Allow all operations for authenticated users" ON categories
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON services
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON appointments
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON expenses
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON business_hours
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON weekly_days_off
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON unavailable_dates
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON unavailable_times
  FOR ALL USING (true);

-- ==========================================
-- SAMPLE DATA (OPTIONAL)
-- ==========================================
-- Insert default business hours
INSERT INTO business_hours (worker, open, close, lunch_start, lunch_end) VALUES
  ('dina', '09:00', '17:00', '12:00', '13:00'),
  ('kida', '09:00', '17:00', '12:00', '13:00');

-- Insert default weekly days off
INSERT INTO weekly_days_off (worker, day, is_off) VALUES
  ('dina', 'Sunday', false),
  ('dina', 'Monday', false),
  ('dina', 'Tuesday', false),
  ('dina', 'Wednesday', false),
  ('dina', 'Thursday', false),
  ('dina', 'Friday', false),
  ('dina', 'Saturday', false),
  ('kida', 'Sunday', false),
  ('kida', 'Monday', false),
  ('kida', 'Tuesday', false),
  ('kida', 'Wednesday', false),
  ('kida', 'Thursday', false),
  ('kida', 'Friday', false),
  ('kida', 'Saturday', false);