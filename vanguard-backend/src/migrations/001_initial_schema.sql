-- =====================================================
-- Vanguard Sports Academy - Initial Database Schema
-- Migration: 001
-- Description: Create all core tables
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'coach', 'parent')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TRAINING SESSIONS
-- =====================================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport VARCHAR(50) NOT NULL CHECK (sport IN ('Basketball', 'Volleyball')),
  level VARCHAR(100) NOT NULL,
  grades VARCHAR(50) NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Coed')),
  min_age INT NOT NULL CHECK (min_age >= 6 AND min_age <= 18),
  max_age INT NOT NULL CHECK (max_age >= 6 AND max_age <= 18),
  day_of_week VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  location VARCHAR(200) NOT NULL,
  capacity INT NOT NULL CHECK (capacity >= 8 AND capacity <= 50),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 50 AND price <= 500),
  registration_fee DECIMAL(10, 2) DEFAULT 30.00,
  head_coach_id UUID REFERENCES users(id),
  assistant_coach_id UUID REFERENCES users(id),
  description TEXT,
  status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Limited', 'Full', 'Waitlist Soon', 'Archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. ATHLETES & FAMILIES
-- =====================================================

CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female')),
  jersey_size VARCHAR(10),
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parent_athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL DEFAULT 'Parent',
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_id, athlete_id)
);

CREATE TABLE medical_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  allergies TEXT,
  conditions TEXT,
  medications TEXT,
  restrictions TEXT,
  insurance_provider VARCHAR(200),
  insurance_policy_number VARCHAR(100),
  physician_name VARCHAR(200),
  physician_phone VARCHAR(20),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(athlete_id)
);

CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. ENROLLMENTS & ATTENDANCE
-- =====================================================

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  start_date DATE NOT NULL,
  end_date DATE,
  pause_start_date DATE,
  pause_end_date DATE,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(athlete_id, session_id)
);

CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
  notes TEXT,
  marked_by UUID REFERENCES users(id),
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(athlete_id, session_id, date)
);

-- =====================================================
-- 5. EVALUATIONS
-- =====================================================

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluation_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. BILLING & PAYMENTS
-- =====================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id),
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMP,
  invoice_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(200) NOT NULL,
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INT,
  card_exp_year INT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method_id UUID REFERENCES payment_methods(id),
  stripe_payment_intent_id VARCHAR(200),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  error_message TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. SYSTEM & ACTIVITY
-- =====================================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Session indexes
CREATE INDEX idx_sessions_sport ON sessions(sport);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_day_of_week ON sessions(day_of_week);
CREATE INDEX idx_sessions_head_coach ON sessions(head_coach_id);

-- Athlete indexes
CREATE INDEX idx_athletes_status ON athletes(status);
CREATE INDEX idx_parent_athletes_parent ON parent_athletes(parent_id);
CREATE INDEX idx_parent_athletes_athlete ON parent_athletes(athlete_id);

-- Enrollment indexes
CREATE INDEX idx_enrollments_athlete ON enrollments(athlete_id);
CREATE INDEX idx_enrollments_session ON enrollments(session_id);
CREATE INDEX idx_enrollments_parent ON enrollments(parent_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Attendance indexes
CREATE INDEX idx_attendance_date ON attendance_logs(date);
CREATE INDEX idx_attendance_athlete ON attendance_logs(athlete_id);
CREATE INDEX idx_attendance_session ON attendance_logs(session_id);

-- Evaluation indexes
CREATE INDEX idx_evaluations_athlete ON evaluations(athlete_id);
CREATE INDEX idx_evaluations_coach ON evaluations(coach_id);
CREATE INDEX idx_evaluations_date ON evaluations(evaluation_date);

-- Billing indexes
CREATE INDEX idx_invoices_parent ON invoices(parent_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_transactions_parent ON transactions(parent_id);
CREATE INDEX idx_transactions_invoice ON transactions(invoice_id);

-- Activity indexes
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON athletes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA / SYSTEM SETTINGS
-- =====================================================

INSERT INTO system_settings (key, value, description) VALUES
('app_version', '"1.0.0"', 'Application version'),
('maintenance_mode', 'false', 'Maintenance mode flag'),
('registration_open', 'true', 'Allow new registrations'),
('max_athletes_per_parent', '5', 'Maximum athletes per parent account');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
