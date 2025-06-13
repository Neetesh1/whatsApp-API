const express = require('express');
const router = express.Router();
const pool = require('../db');

// WhatsApp webhook for receiving messages
router.post('/webhook', async (req, res) => {
  try {
    console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2));
    
    // Handle different webhook events
    const { entry } = req.body;
    
    if (entry && entry.length > 0) {
      for (const entryItem of entry) {
        const { changes } = entryItem;
        
        if (changes && changes.length > 0) {
          for (const change of changes) {
            const { value } = change;
            
            // Handle incoming messages
            if (value.messages && value.messages.length > 0) {
              for (const message of value.messages) {
                await handleIncomingMessage(message, value, req.app.get('io'));
              }
            }
            
            // Handle message status updates
            if (value.statuses && value.statuses.length > 0) {
              for (const status of value.statuses) {
                await handleMessageStatus(status, req.app.get('io'));
              }
            }
          }
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// WhatsApp webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Verify webhook (use your verify token from WhatsApp Business API)
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Get WhatsApp connection status
router.get('/status', async (req, res) => {
  try {
    // Check if WhatsApp is connected (implement your logic)
    const status = {
      connected: true, // Replace with actual status check
      phone_number: process.env.WHATSAPP_PHONE_NUMBER || '+1234567890',
      connection_time: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };
    
    res.json(status);
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Send WhatsApp message
router.post('/send-message', async (req, res) => {
  const { phone_number, message, template_id } = req.body;
  
  try {
    // Log the outbound message
    const messageResult = await pool.query(
      'INSERT INTO whatsapp_messages (phone_number, message, direction, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [phone_number, message, 'outbound', 'sending']
    );
    
    // TODO: Implement actual WhatsApp API call here
    // For now, we'll simulate sending
    console.log(`Sending WhatsApp message to ${phone_number}: ${message}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update message status to sent
    await pool.query(
      'UPDATE whatsapp_messages SET status = $1 WHERE id = $2',
      ['sent', messageResult.rows[0].id]
    );
    
    // Emit socket event
    req.app.get('io').emit('whatsapp_message_sent', {
      phone_number,
      message,
      status: 'sent'
    });
    
    res.json({ 
      success: true, 
      message_id: messageResult.rows[0].id,
      status: 'sent' 
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get message templates
router.get('/templates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM message_templates WHERE status = $1 ORDER BY category, name',
      ['active']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get contacts
router.get('/contacts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM whatsapp_contacts WHERE status = $1 ORDER BY name',
      ['active']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Handle incoming WhatsApp message
async function handleIncomingMessage(message, webhookValue, io) {
  try {
    const { from, text, timestamp } = message;
    const messageText = text?.body || '';
    
    // Get sender info
    const senderInfo = webhookValue.contacts?.find(contact => contact.wa_id === from);
    const customerName = senderInfo?.profile?.name || `Customer ${from}`;
    
    // Check if there's an existing open ticket for this phone number
    const existingTicketResult = await pool.query(
      'SELECT * FROM tickets WHERE phone_number = $1 AND status IN ($2, $3, $4) ORDER BY created_at DESC LIMIT 1',
      [from, 'open', 'assigned', 'in_progress']
    );
    
    if (existingTicketResult.rows.length > 0) {
      // Add as reply to existing ticket
      const ticket = existingTicketResult.rows[0];
      
      const replyResult = await pool.query(
        'INSERT INTO ticket_replies (ticket_id, message, is_from_customer, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [ticket.id, messageText, true, new Date(parseInt(timestamp) * 1000)]
      );
      
      // Update ticket's last reply time
      await pool.query(
        'UPDATE tickets SET last_reply_at = $1, status = $2 WHERE id = $3',
        [new Date(), 'in_progress', ticket.id]
      );
      
      // Log the message
      await pool.query(
        'INSERT INTO whatsapp_messages (phone_number, message, direction, ticket_id, message_id) VALUES ($1, $2, $3, $4, $5)',
        [from, messageText, 'inbound', ticket.id, message.id]
      );
      
      // Emit socket event for real-time updates
      io.emit('ticket_reply', {
        ticketId: ticket.id,
        reply: {
          ...replyResult.rows[0],
          user_name: customerName
        }
      });
      
      console.log(`Added reply to existing ticket #${ticket.id} from ${customerName}`);
    } else {
      // Create new ticket
      const ticketResult = await pool.query(
        'INSERT INTO tickets (customer_name, phone_number, subject, message, status, priority, from_whatsapp, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [customerName, from, 'WhatsApp Message', messageText, 'open', 'medium', true, new Date(parseInt(timestamp) * 1000)]
      );
      
      const newTicket = ticketResult.rows[0];
      
      // Log the message
      await pool.query(
        'INSERT INTO whatsapp_messages (phone_number, message, direction, ticket_id, message_id) VALUES ($1, $2, $3, $4, $5)',
        [from, messageText, 'inbound', newTicket.id, message.id]
      );
      
      // Add/update contact
      await pool.query(
        'INSERT INTO whatsapp_contacts (name, phone_number, last_message_at) VALUES ($1, $2, $3) ON CONFLICT (phone_number) DO UPDATE SET name = $1, last_message_at = $3',
        [customerName, from, new Date()]
      );
      
      // Emit socket event for real-time updates
      io.emit('new_ticket', newTicket);
      
      console.log(`Created new ticket #${newTicket.id} from ${customerName}: ${messageText}`);
    }
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

// Handle message status updates
async function handleMessageStatus(status, io) {
  try {
    const { id, status: messageStatus, timestamp, recipient_id } = status;
    
    // Update message status in database
    await pool.query(
      'UPDATE whatsapp_messages SET status = $1 WHERE message_id = $2',
      [messageStatus, id]
    );
    
    // Emit socket event for real-time updates
    io.emit('whatsapp_message_status', {
      message_id: id,
      status: messageStatus,
      timestamp: new Date(parseInt(timestamp) * 1000),
      recipient_id
    });
    
    console.log(`Message ${id} status updated to: ${messageStatus}`);
  } catch (error) {
    console.error('Error handling message status:', error);
  }
}

// Test endpoint to simulate incoming WhatsApp message
router.post('/simulate-message', async (req, res) => {
  const { phone_number, customer_name, message } = req.body;
  
  try {
    // Create the webhook-like structure
    const simulatedWebhook = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: phone_number,
              id: `sim_${Date.now()}`,
              timestamp: Math.floor(Date.now() / 1000).toString(),
              text: { body: message },
              type: 'text'
            }],
            contacts: [{
              profile: { name: customer_name },
              wa_id: phone_number
            }]
          }
        }]
      }]
    };
    
    // Process the simulated message
    const changes = simulatedWebhook.entry[0].changes;
    for (const change of changes) {
      const { value } = change;
      if (value.messages && value.messages.length > 0) {
        for (const msg of value.messages) {
          await handleIncomingMessage(msg, value, req.app.get('io'));
        }
      }
    }
    
    res.json({ success: true, message: 'Simulated message processed' });
  } catch (error) {
    console.error('Error simulating message:', error);
    res.status(500).json({ error: 'Failed to simulate message' });
  }
});

module.exports = router;