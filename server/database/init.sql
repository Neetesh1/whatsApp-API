-- Create database and tables for WhatsApp Ticket System

-- Create database (run separately if needed)
-- CREATE DATABASE whatsapp_tickets;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced tickets table for your workflow
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP,
    closed_by INTEGER REFERENCES users(id),
    closed_at TIMESTAMP,
    resolution_note TEXT,
    from_whatsapp BOOLEAN DEFAULT true,
    last_reply_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket replies table for conversation history
CREATE TABLE IF NOT EXISTS ticket_replies (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    sent_to_whatsapp BOOLEAN DEFAULT false,
    whatsapp_sent BOOLEAN DEFAULT false,
    is_from_customer BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp message logs (for tracking all WhatsApp interactions)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
    ticket_id INTEGER REFERENCES tickets(id),
    message_id VARCHAR(255), -- WhatsApp message ID
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, read, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message templates for quick responses
CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table for WhatsApp contacts
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    last_message_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, blocked
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_phone ON tickets(phone_number);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_ticket_id ON whatsapp_messages(ticket_id);

-- Insert default admin user (password: 'admin123')
INSERT INTO users (username, password, role, email) 
VALUES ('admin', '$2a$10$8Ej9q1QZ8ZqKZKvF5JnE8OoQGZKJjvJKgQgfOiK5vZzLGhB1hZoQu', 'admin', 'admin@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample user (password: 'user123')
INSERT INTO users (username, password, role, email) 
VALUES ('support_user', '$2a$10$rF8ZH8rJgLUiJr8QZqKZKO3QGZKJjvJKgQgfOiK5vZzLGhB1hZoQu', 'user', 'support@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample message templates
INSERT INTO message_templates (name, content, category, created_by) VALUES 
('Welcome Message', 'Hello! Thank you for contacting us. We have received your message and will respond shortly.', 'greeting', 1),
('Ticket Assigned', 'Your ticket has been assigned to our support team. We will help you resolve your issue.', 'notification', 1),
('Resolution Confirmation', 'Your issue has been resolved. If you need further assistance, please let us know.', 'resolution', 1),
('Closing Ticket', 'We are closing this ticket. If you have any other questions, feel free to contact us again.', 'closing', 1)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
