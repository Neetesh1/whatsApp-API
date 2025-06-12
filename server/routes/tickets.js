const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign ticket
router.post('/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tickets SET assigned_to = $1, status = $2 WHERE id = $3 RETURNING *',
      [userId, 'in_progress', id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reply to ticket
router.post('/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { reply, userId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO replies (ticket_id, user_id, reply) VALUES ($1, $2, $3) RETURNING *',
      [id, userId, reply]
    );
    await pool.query('UPDATE tickets SET status = $1 WHERE id = $2', ['responded', id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Close ticket
router.post('/:id/close', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE tickets SET status = $1, closed_at = NOW() WHERE id = $2 RETURNING *',
      ['closed', id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
