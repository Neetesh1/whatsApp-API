const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Authentication endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    // Test database connection first
    await pool.query('SELECT 1');
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log(`Login attempt for username: ${username}`);
    console.log(`User found in database: ${result.rows.length > 0}`);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`Stored password hash: ${user.password.substring(0, 20)}...`);
      console.log(`Input password: ${password}`);
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`Password match result: ${passwordMatch}`);
      
      if (passwordMatch) {
        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET is not defined in environment variables');
          throw new Error('JWT_SECRET is not defined');
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful, token generated');
        res.json({ token });
      } else {
        console.log('Password does not match');
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      console.log('User not found in database');
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(500).json({ error: 'Database connection failed', details: 'Please check database configuration' });
    } else {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
});

// User creation endpoint (Admin only)
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const checkUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUser = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role || 'user']
    );
    
    res.status(201).json(insertUser.rows[0]);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
