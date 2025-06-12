const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database connection (configuration to be set in .env)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});

// Secret key for JWT (to be set in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Placeholder for WhatsApp Business API webhook
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const messageData = req.body;
    console.log('Received WhatsApp message:', messageData);

    // Store message and create ticket in database
    const messageText = messageData.message.text || 'No text content';
    const sender = messageData.from || 'Unknown sender';
    const result = await pool.query(
      'INSERT INTO tickets (sender, message, status) VALUES ($1, $2, $3) RETURNING id',
      [sender, messageText, 'open']
    );
    const ticketId = result.rows[0].id;

    // Notify connected clients of new ticket
    io.emit('newTicket', {
      id: ticketId,
      sender,
      message: messageText,
      status: 'open',
      created_at: new Date().toISOString()
    });

    res.status(200).send('Message received and ticket created');
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    res.status(500).send('Error processing message');
  }
});

// User authentication endpoint (placeholder)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // Implement proper authentication logic here
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Check password (use bcrypt in production)
      if (password === user.password) {
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign ticket to user
app.post('/api/tickets/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tickets SET assigned_to = $1, status = $2 WHERE id = $3 RETURNING *',
      [userId, 'in_progress', id]
    );
    if (result.rows.length > 0) {
      const ticket = result.rows[0];
      io.emit('ticketUpdated', ticket);
      res.json(ticket);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reply to ticket (placeholder for sending reply via WhatsApp API)
app.post('/api/tickets/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { reply, userId } = req.body;
  try {
    // Store reply in database
    const result = await pool.query(
      'INSERT INTO replies (ticket_id, user_id, reply) VALUES ($1, $2, $3) RETURNING *',
      [id, userId, reply]
    );
    const replyData = result.rows[0];

    // Update ticket status
    await pool.query('UPDATE tickets SET status = $1 WHERE id = $2', ['responded', id]);

    // TODO: Send reply to WhatsApp user (implement WhatsApp API call here)
    console.log(`Sending reply to WhatsApp user for ticket ${id}: ${reply}`);

    io.emit('ticketUpdated', { id, status: 'responded', reply });
    res.json(replyData);
  } catch (error) {
    console.error('Error replying to ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Close ticket
app.post('/api/tickets/:id/close', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE tickets SET status = $1, closed_at = NOW() WHERE id = $2 RETURNING *',
      ['closed', id]
    );
    if (result.rows.length > 0) {
      const ticket = result.rows[0];
      io.emit('ticketUpdated', ticket);
      res.json(ticket);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
