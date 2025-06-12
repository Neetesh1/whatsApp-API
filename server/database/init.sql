-- Create users table for team members
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Store hashed passwords in production
  email VARCHAR(100) UNIQUE,
  role VARCHAR(20) DEFAULT 'user', -- e.g., 'user', 'admin', 'manager'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table for WhatsApp messages
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(50) NOT NULL, -- WhatsApp sender ID or phone number
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- e.g., 'open', 'in_progress', 'responded', 'closed'
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP
);

-- Create replies table for responses to tickets
CREATE TABLE IF NOT EXISTS replies (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  reply TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users (passwords should be hashed in production)
INSERT INTO users (username, password, email, role) 
VALUES 
  ('admin', 'admin123', 'admin@example.com', 'admin'),
  ('user1', 'user123', 'user1@example.com', 'user'),
  ('manager', 'manager123', 'manager@example.com', 'manager')
ON CONFLICT (username) DO NOTHING;
