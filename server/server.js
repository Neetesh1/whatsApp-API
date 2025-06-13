const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../config/.env' }); // Fix dotenv path

// Debug: Check if JWT_SECRET is loaded
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('JWT_SECRET value:', process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'undefined');

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

// Make io accessible to routes
app.set('io', io);

// Modular routes
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/auth', require('./routes/auth'));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected', // You can add actual DB health check here
      whatsapp: 'ready',
      socketio: 'active'
    }
  });
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send welcome message
  socket.emit('connected', { 
    message: 'Connected to WhatsApp Ticket System',
    timestamp: new Date().toISOString()
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Handle custom events
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 WhatsApp Ticket System Server running on port ${PORT}`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/api/whatsapp/webhook`);
  console.log(`🎫 Tickets API: http://localhost:${PORT}/api/tickets`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
