-- Announcements Table Migration
-- Stores announcements sent by admins and coaches to parents

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role VARCHAR(50) NOT NULL CHECK (sender_role IN ('admin', 'coach')),
  target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'session', 'coach-sessions')),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_announcements_sender ON announcements(sender_id);
CREATE INDEX IF NOT EXISTS idx_announcements_session ON announcements(session_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);

-- Comments
COMMENT ON TABLE announcements IS 'Stores announcements sent by admins and coaches to parents';
COMMENT ON COLUMN announcements.sender_role IS 'Role of the person sending the announcement (admin or coach)';
COMMENT ON COLUMN announcements.target_audience IS 'Defines who receives the announcement: all (everyone), session (specific session), coach-sessions (all sessions by this coach)';
