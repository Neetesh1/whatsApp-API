const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all tickets (for admin) or assigned tickets (for users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      // Admin can see all tickets
      query = `
        SELECT t.*, u.username as assigned_user_name,
               (SELECT COUNT(*) FROM ticket_replies tr WHERE tr.ticket_id = t.id) as reply_count
        FROM tickets t 
        LEFT JOIN users u ON t.assigned_to = u.id 
        ORDER BY t.created_at DESC
      `;
    } else {
      // Regular users can see unassigned tickets and their own assigned tickets
      query = `
        SELECT t.*, u.username as assigned_user_name,
               (SELECT COUNT(*) FROM ticket_replies tr WHERE tr.ticket_id = t.id) as reply_count
        FROM tickets t 
        LEFT JOIN users u ON t.assigned_to = u.id 
        WHERE t.assigned_to IS NULL OR t.assigned_to = $1
        ORDER BY t.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tickets by status
router.get('/status/:status', authenticateToken, async (req, res) => {
  const { status } = req.params;
  try {
    let query;
    let params = [status];

    if (req.user.role === 'admin') {
      query = `
        SELECT t.*, u.username as assigned_user_name 
        FROM tickets t 
        LEFT JOIN users u ON t.assigned_to = u.id 
        WHERE t.status = $1 
        ORDER BY t.created_at DESC
      `;
    } else {
      query = `
        SELECT t.*, u.username as assigned_user_name 
        FROM tickets t 
        LEFT JOIN users u ON t.assigned_to = u.id 
        WHERE t.status = $1 AND (t.assigned_to IS NULL OR t.assigned_to = $2)
        ORDER BY t.created_at DESC
      `;
      params = [status, req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single ticket with replies
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Get ticket details
    const ticketQuery = `
      SELECT t.*, u.username as assigned_user_name 
      FROM tickets t 
      LEFT JOIN users u ON t.assigned_to = u.id 
      WHERE t.id = $1
    `;
    const ticketResult = await pool.query(ticketQuery, [id]);
    
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // Check permissions
    if (req.user.role !== 'admin' && ticket.assigned_to && ticket.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get replies
    const repliesQuery = `
      SELECT tr.*, u.username as user_name 
      FROM ticket_replies tr 
      LEFT JOIN users u ON tr.user_id = u.id 
      WHERE tr.ticket_id = $1 
      ORDER BY tr.created_at ASC
    `;
    const repliesResult = await pool.query(repliesQuery, [id]);

    res.json({
      ...ticket,
      replies: repliesResult.rows
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create ticket (from WhatsApp webhook)
router.post('/', async (req, res) => {
  const { customer_name, phone_number, message, from_whatsapp = true } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO tickets (customer_name, phone_number, subject, message, status, priority, from_whatsapp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customer_name, phone_number, 'WhatsApp Message', message, 'open', 'medium', from_whatsapp]
    );

    const ticket = result.rows[0];

    // Emit socket event for real-time updates
    req.app.get('io').emit('new_ticket', ticket);

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign ticket to user (only unassigned tickets can be assigned)
router.post('/:id/assign', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assign to the current user
  
  try {
    // Check if ticket exists and is unassigned
    const checkResult = await pool.query(
      'SELECT * FROM tickets WHERE id = $1 AND assigned_to IS NULL',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(400).json({ error: 'Ticket not found or already assigned' });
    }

    // Assign ticket
    const result = await pool.query(
      'UPDATE tickets SET assigned_to = $1, status = $2, assigned_at = NOW() WHERE id = $3 RETURNING *',
      [userId, 'assigned', id]
    );

    const updatedTicket = result.rows[0];

    // Get user info for the response
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    updatedTicket.assigned_user_name = userResult.rows[0].username;

    // Emit socket event
    req.app.get('io').emit('ticket_assigned', updatedTicket);

    res.json(updatedTicket);
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reply to ticket (saves to DB and sends to WhatsApp)
router.post('/:id/reply', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if user can reply to this ticket
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id = $1 AND assigned_to = $2',
      [id, userId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(403).json({ error: 'You can only reply to tickets assigned to you' });
    }

    const ticket = ticketResult.rows[0];

    // Save reply to database
    const replyResult = await pool.query(
      `INSERT INTO ticket_replies (ticket_id, user_id, message, sent_to_whatsapp) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, userId, message, true]
    );

    // Update ticket status
    await pool.query(
      'UPDATE tickets SET status = $1, last_reply_at = NOW() WHERE id = $2',
      ['in_progress', id]
    );

    const reply = replyResult.rows[0];

    // Get user info
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    reply.user_name = userResult.rows[0].username;

    // TODO: Send message to WhatsApp (integrate with your WhatsApp API)
    try {
      await sendWhatsAppMessage(ticket.phone_number, message);
      await pool.query(
        'UPDATE ticket_replies SET whatsapp_sent = true WHERE id = $1',
        [reply.id]
      );
    } catch (whatsappError) {
      console.error('WhatsApp send error:', whatsappError);
      // Reply is still saved even if WhatsApp fails
    }

    // Emit socket event
    req.app.get('io').emit('ticket_reply', { ticketId: id, reply });

    res.json(reply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Close ticket
router.post('/:id/close', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { resolution_note } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if user can close this ticket
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id = $1 AND assigned_to = $2',
      [id, userId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(403).json({ error: 'You can only close tickets assigned to you' });
    }

    // Close ticket
    const result = await pool.query(
      `UPDATE tickets SET status = $1, closed_at = NOW(), closed_by = $2, resolution_note = $3 
       WHERE id = $4 RETURNING *`,
      ['closed', userId, resolution_note, id]
    );

    const closedTicket = result.rows[0];

    // Get user info
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    closedTicket.closed_by_name = userResult.rows[0].username;

    // Emit socket event
    req.app.get('io').emit('ticket_closed', closedTicket);

    res.json(closedTicket);
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reopen ticket (admin only)
router.post('/:id/reopen', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can reopen tickets' });
  }
  
  try {
    const result = await pool.query(
      `UPDATE tickets SET status = $1, closed_at = NULL, closed_by = NULL, resolution_note = NULL 
       WHERE id = $2 RETURNING *`,
      ['assigned', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const reopenedTicket = result.rows[0];

    // Emit socket event
    req.app.get('io').emit('ticket_reopened', reopenedTicket);

    res.json(reopenedTicket);
  } catch (error) {
    console.error('Error reopening ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to send WhatsApp message (implement based on your WhatsApp API)
async function sendWhatsAppMessage(phoneNumber, message) {
  // TODO: Implement WhatsApp API integration
  // This is a placeholder - replace with your actual WhatsApp API call
  console.log(`Sending WhatsApp message to ${phoneNumber}: ${message}`);
  
  // Example using a hypothetical WhatsApp API:
  // const response = await fetch('https://your-whatsapp-api/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ phone: phoneNumber, message })
  // });
  
  return Promise.resolve(); // Simulate success for now
}

module.exports = router;
