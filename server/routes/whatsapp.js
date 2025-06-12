const express = require('express');
const router = express.Router();
const pool = require('../db');

// WhatsApp webhook
router.post('/webhook/whatsapp', async (req, res) => {
  try {
    const messageData = req.body;
    const messageText = messageData.message.text || 'No text content';
    const sender = messageData.from || 'Unknown sender';
    const result = await pool.query(
      'INSERT INTO tickets (sender, message, status) VALUES ($1, $2, $3) RETURNING id',
      [sender, messageText, 'open']
    );
    const ticketId = result.rows[0].id;
    res.status(200).send('Message received and ticket created');
  } catch (error) {
    res.status(500).send('Error processing message');
  }
});

module.exports = router;