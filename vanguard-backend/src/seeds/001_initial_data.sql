-- =====================================================
-- Vanguard Sports Academy - Initial Seed Data
-- =====================================================

-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE evaluation_ratings, evaluations, attendance_logs, enrollments,
             emergency_contacts, medical_info, parent_athletes, athletes,
             session_features, sessions, refresh_tokens, password_resets,
             payment_methods, transactions, invoices, activity_logs,
             notifications, users CASCADE;

-- =====================================================
-- 1. USERS
-- =====================================================
-- Password for all users: their role + '123' (e.g., admin123, coach123, parent123)
-- Hashed with bcrypt rounds=10

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status, email_verified) VALUES
-- Admin user (password: admin123)
('11111111-1111-1111-1111-111111111111', 'admin@vanguard.com', '$2b$10$O.12N1oHFRNyp.5bgVsfsOl0O9.sSbPAdeyWJ10aHLIDLh1NFm2yC', 'Admin', 'User', '(210) 555-0000', 'admin', 'active', true),

-- Coach users (password: coach123)
('22222222-2222-2222-2222-222222222222', 'ugur@vanguard.com', '$2b$10$3A/YVo/61JbtskR5AbbNheayrGXSBETjyFphefCWa22Mx5IuMNHKW', 'Ugur', 'Yildiz', '(210) 555-0001', 'coach', 'active', true),
('22222222-2222-2222-2222-222222222223', 'tuba@vanguard.com', '$2b$10$3A/YVo/61JbtskR5AbbNheayrGXSBETjyFphefCWa22Mx5IuMNHKW', 'Tuba', 'Yildiz', '(210) 555-0002', 'coach', 'active', true),

-- Parent users (password: parent123)
('33333333-3333-3333-3333-333333333333', 'parent@vanguard.com', '$2b$10$z0Y92RhImeA4YQmu62iuFeMpDM1YIMloBzd2RxAUr1gHOQQJF1deu', 'John', 'Smith', '(210) 555-0100', 'parent', 'active', true),
('33333333-3333-3333-3333-333333333334', 'sarah.johnson@example.com', '$2b$10$z0Y92RhImeA4YQmu62iuFeMpDM1YIMloBzd2RxAUr1gHOQQJF1deu', 'Sarah', 'Johnson', '(210) 555-0101', 'parent', 'active', true),
('33333333-3333-3333-3333-333333333335', 'mike.davis@example.com', '$2b$10$z0Y92RhImeA4YQmu62iuFeMpDM1YIMloBzd2RxAUr1gHOQQJF1deu', 'Mike', 'Davis', '(210) 555-0102', 'parent', 'active', true);

-- =====================================================
-- 2. SESSIONS
-- =====================================================

INSERT INTO sessions (id, sport, level, grades, gender, min_age, max_age, day_of_week, start_time, end_time, duration_minutes, location, capacity, price, registration_fee, head_coach_id, description, status) VALUES
-- Basketball Junior Boys
('44444444-4444-4444-4444-444444444441', 'Basketball', 'Junior Boys', 'Grades 4-6', 'Male', 9, 12, 'Saturday', '16:15:00', '17:15:00', 60, 'Vanguard Main Gym', 20, 90.00, 30.00, '22222222-2222-2222-2222-222222222222', 'Fundamental training: ball-handling, shooting form, footwork, and game IQ.', 'Open'),

-- Basketball Senior Boys
('44444444-4444-4444-4444-444444444442', 'Basketball', 'Senior Boys', 'Grades 7-12', 'Male', 12, 18, 'Saturday', '17:15:00', '18:30:00', 75, 'Vanguard Main Gym', 20, 90.00, 30.00, '22222222-2222-2222-2222-222222222222', 'Elite training: competitive play, complex strategy, conditioning, and leadership.', 'Limited'),

-- Volleyball Junior Girls
('44444444-4444-4444-4444-444444444443', 'Volleyball', 'Junior Girls', 'Grades 3-6', 'Female', 8, 12, 'Saturday', '10:30:00', '11:30:00', 60, 'Court B', 20, 90.00, 30.00, '22222222-2222-2222-2222-222222222223', 'Introductory training: serving, passing, rotation, and team communication.', 'Open'),

-- Volleyball Senior Girls
('44444444-4444-4444-4444-444444444444', 'Volleyball', 'Senior Girls', 'Grades 7-12', 'Female', 12, 18, 'Saturday', '09:15:00', '10:30:00', 75, 'Court B', 20, 90.00, 30.00, '22222222-2222-2222-2222-222222222223', 'High-performance training: advanced serving, spiking, blocking, and systems.', 'Waitlist Soon');

-- =====================================================
-- 3. SESSION FEATURES
-- =====================================================

INSERT INTO session_features (session_id, feature) VALUES
-- Basketball Junior Boys features
('44444444-4444-4444-4444-444444444441', 'Ball handling mastery'),
('44444444-4444-4444-4444-444444444441', 'Shooting mechanics'),
('44444444-4444-4444-4444-444444444441', 'Defensive footwork'),
('44444444-4444-4444-4444-444444444441', '3v3 Concepts'),

-- Basketball Senior Boys features
('44444444-4444-4444-4444-444444444442', 'Advanced scoring moves'),
('44444444-4444-4444-4444-444444444442', 'Defensive schemes'),
('44444444-4444-4444-4444-444444444442', 'Conditioning'),
('44444444-4444-4444-4444-444444444442', 'College prep'),

-- Volleyball Junior Girls features
('44444444-4444-4444-4444-444444444443', 'Overhand serving'),
('44444444-4444-4444-4444-444444444443', 'Passing platform'),
('44444444-4444-4444-4444-444444444443', 'Court positions'),
('44444444-4444-4444-4444-444444444443', 'Game rules'),

-- Volleyball Senior Girls features
('44444444-4444-4444-4444-444444444444', 'Jump serving'),
('44444444-4444-4444-4444-444444444444', 'Offensive systems'),
('44444444-4444-4444-4444-444444444444', 'Blocking timing'),
('44444444-4444-4444-4444-444444444444', 'Tournament play');

-- =====================================================
-- 4. ATHLETES
-- =====================================================

INSERT INTO athletes (id, first_name, last_name, date_of_birth, gender, jersey_size, status) VALUES
-- John Smith's children
('55555555-5555-5555-5555-555555555551', 'Jordan', 'Smith', '2013-05-15', 'Male', 'YM', 'active'),
('55555555-5555-5555-5555-555555555552', 'Emma', 'Smith', '2014-08-22', 'Female', 'YS', 'active'),

-- Sarah Johnson's children
('55555555-5555-5555-5555-555555555553', 'Caleb', 'Johnson', '2014-03-10', 'Male', 'YL', 'active'),

-- Mike Davis's children
('55555555-5555-5555-5555-555555555554', 'Mia', 'Davis', '2013-11-05', 'Female', 'YM', 'active');

-- =====================================================
-- 5. PARENT-ATHLETE RELATIONSHIPS
-- =====================================================

INSERT INTO parent_athletes (parent_id, athlete_id, relationship, is_primary) VALUES
-- John Smith's children
('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555551', 'Father', true),
('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555552', 'Father', true),

-- Sarah Johnson's child
('33333333-3333-3333-3333-333333333334', '55555555-5555-5555-5555-555555555553', 'Mother', true),

-- Mike Davis's child
('33333333-3333-3333-3333-333333333335', '55555555-5555-5555-5555-555555555554', 'Father', true);

-- =====================================================
-- 6. MEDICAL INFO
-- =====================================================

INSERT INTO medical_info (athlete_id, allergies, conditions, medications) VALUES
('55555555-5555-5555-5555-555555555551', 'None', 'Asthma', 'Inhaler as needed'),
('55555555-5555-5555-5555-555555555552', 'Peanuts', 'None', 'EpiPen'),
('55555555-5555-5555-5555-555555555553', 'None', 'None', 'None'),
('55555555-5555-5555-5555-555555555554', 'None', 'None', 'None');

-- =====================================================
-- 7. EMERGENCY CONTACTS
-- =====================================================

INSERT INTO emergency_contacts (athlete_id, name, phone, relationship, is_primary) VALUES
-- Jordan Smith
('55555555-5555-5555-5555-555555555551', 'John Smith', '(210) 555-0100', 'Father', true),
('55555555-5555-5555-5555-555555555551', 'Mary Smith', '(210) 555-0199', 'Mother', false),

-- Emma Smith
('55555555-5555-5555-5555-555555555552', 'John Smith', '(210) 555-0100', 'Father', true),
('55555555-5555-5555-5555-555555555552', 'Mary Smith', '(210) 555-0199', 'Mother', false),

-- Caleb Johnson
('55555555-5555-5555-5555-555555555553', 'Sarah Johnson', '(210) 555-0101', 'Mother', true),

-- Mia Davis
('55555555-5555-5555-5555-555555555554', 'Mike Davis', '(210) 555-0102', 'Father', true);

-- =====================================================
-- 8. ENROLLMENTS
-- =====================================================

INSERT INTO enrollments (id, athlete_id, session_id, parent_id, status, start_date) VALUES
-- Jordan Smith enrolled in Basketball Junior Boys
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333', 'active', '2025-01-01'),

-- Emma Smith enrolled in Volleyball Junior Girls
('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333333', 'active', '2025-01-01'),

-- Caleb Johnson enrolled in Basketball Junior Boys
('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333334', 'active', '2025-01-01'),

-- Mia Davis enrolled in Volleyball Junior Girls
('66666666-6666-6666-6666-666666666664', '55555555-5555-5555-5555-555555555554', '44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333335', 'active', '2025-01-01');

-- =====================================================
-- 9. SAMPLE INVOICES
-- =====================================================

INSERT INTO invoices (invoice_number, parent_id, enrollment_id, amount, tax_amount, total_amount, description, status, due_date, invoice_date, paid_at) VALUES
-- John Smith invoices
('INV-2025-001', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666661', 90.00, 0.00, 120.00, 'Basketball - Junior Boys - January 2025 + Registration Fee', 'paid', '2025-01-15', '2025-01-01', '2025-01-10'),
('INV-2025-002', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666662', 90.00, 0.00, 120.00, 'Volleyball - Junior Girls - January 2025 + Registration Fee', 'paid', '2025-01-15', '2025-01-01', '2025-01-10'),
('INV-2025-007', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666661', 90.00, 0.00, 90.00, 'Basketball - Junior Boys - February 2025', 'paid', '2025-02-01', '2025-02-01', '2025-02-01'),
('INV-2025-012', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666661', 90.00, 0.00, 90.00, 'Basketball - Junior Boys - December 2025', 'pending', '2025-12-01', '2025-12-01', NULL),

-- Sarah Johnson invoices
('INV-2025-003', '33333333-3333-3333-3333-333333333334', '66666666-6666-6666-6666-666666666663', 90.00, 0.00, 120.00, 'Basketball - Junior Boys - January 2025 + Registration Fee', 'paid', '2025-01-15', '2025-01-01', '2025-01-12'),

-- Mike Davis invoices
('INV-2025-004', '33333333-3333-3333-3333-333333333335', '66666666-6666-6666-6666-666666666664', 90.00, 0.00, 120.00, 'Volleyball - Junior Girls - January 2025 + Registration Fee', 'paid', '2025-01-15', '2025-01-01', '2025-01-11');

-- =====================================================
-- SEED COMPLETE
-- =====================================================
