#!/usr/bin/env node

/**
 * WhatsApp Ticket System - Complete Workflow Test
 * 
 * This script demonstrates the complete ticket workflow:
 * 1. Simulate WhatsApp message creating a ticket
 * 2. User login and ticket assignment
 * 3. Reply to ticket (sends to WhatsApp)
 * 4. Close ticket
 */

const axios = require('axios');
const readline = require('readline');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function makeRequest(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: useAuth ? { 'Authorization': `Bearer ${authToken}` } : {},
      data
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    log(`Error: ${error.response?.data?.error || error.message}`, 'red');
    throw error;
  }
}

async function testHealthCheck() {
  log('\n=== 🏥 Health Check ===', 'cyan');
  try {
    const health = await makeRequest('GET', '/health');
    log(`✅ Server Status: ${health.status}`, 'green');
    log(`📅 Timestamp: ${health.timestamp}`, 'blue');
    log(`🗄️  Database: ${health.services.database}`, 'green');
    log(`📱 WhatsApp: ${health.services.whatsapp}`, 'green');
    log(`🔌 Socket.IO: ${health.services.socketio}`, 'green');
    return true;
  } catch (error) {
    log('❌ Health check failed!', 'red');
    return false;
  }
}

async function loginUser() {
  log('\n=== 🔐 User Login ===', 'cyan');
  
  const username = await question('Enter username (or press Enter for "support_user"): ') || 'support_user';
  const password = await question('Enter password (or press Enter for "user123"): ') || 'user123';

  try {
    const response = await makeRequest('POST', '/auth/login', { username, password });
    authToken = response.token;
    log(`✅ Login successful! Welcome ${response.user.username}`, 'green');
    log(`👤 Role: ${response.user.role}`, 'blue');
    return response.user;
  } catch (error) {
    log('❌ Login failed!', 'red');
    throw error;
  }
}

async function simulateWhatsAppMessage() {
  log('\n=== 📱 Simulating WhatsApp Message ===', 'cyan');
  
  const phoneNumber = await question('Enter customer phone number (or press Enter for "+1234567890"): ') || '+1234567890';
  const customerName = await question('Enter customer name (or press Enter for "John Doe"): ') || 'John Doe';
  const message = await question('Enter message (or press Enter for default): ') || 'Hi, I need help with my order. It was supposed to arrive yesterday but I haven\'t received it yet.';

  try {
    const response = await makeRequest('POST', '/whatsapp/simulate-message', {
      phone_number: phoneNumber,
      customer_name: customerName,
      message: message
    });

    log(`✅ ${response.message}`, 'green');
    log(`📨 Message: "${message}"`, 'yellow');
    log(`👤 From: ${customerName} (${phoneNumber})`, 'blue');
    
    // Give the system a moment to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { phoneNumber, customerName, message };
  } catch (error) {
    log('❌ Failed to simulate WhatsApp message!', 'red');
    throw error;
  }
}

async function viewTickets() {
  log('\n=== 🎫 Viewing Available Tickets ===', 'cyan');
  
  try {
    const tickets = await makeRequest('GET', '/tickets', null, true);
    
    if (tickets.length === 0) {
      log('📭 No tickets found.', 'yellow');
      return [];
    }

    log(`📊 Found ${tickets.length} tickets:`, 'green');
    
    tickets.forEach((ticket, index) => {
      const statusColor = ticket.status === 'open' ? 'yellow' : 
                         ticket.status === 'assigned' ? 'blue' : 
                         ticket.status === 'in_progress' ? 'magenta' : 'green';
      
      log(`\n${index + 1}. Ticket #${ticket.id}`, 'bright');
      log(`   👤 Customer: ${ticket.customer_name}`, 'blue');
      log(`   📞 Phone: ${ticket.phone_number}`, 'blue');
      log(`   📝 Message: ${ticket.message.substring(0, 60)}${ticket.message.length > 60 ? '...' : ''}`, 'reset');
      log(`   🏷️  Status: ${ticket.status}`, statusColor);
      log(`   🕒 Created: ${new Date(ticket.created_at).toLocaleString()}`, 'reset');
      if (ticket.assigned_user_name) {
        log(`   👨‍💼 Assigned to: ${ticket.assigned_user_name}`, 'blue');
      }
    });

    return tickets;
  } catch (error) {
    log('❌ Failed to fetch tickets!', 'red');
    throw error;
  }
}

async function assignTicket(tickets) {
  log('\n=== ✋ Assigning Ticket ===', 'cyan');
  
  const openTickets = tickets.filter(t => t.status === 'open' && !t.assigned_to);
  
  if (openTickets.length === 0) {
    log('📭 No open tickets available for assignment.', 'yellow');
    return null;
  }

  log(`📋 Available tickets for assignment:`, 'green');
  openTickets.forEach((ticket, index) => {
    log(`${index + 1}. Ticket #${ticket.id} - ${ticket.customer_name}`, 'blue');
  });

  const selection = await question('\nEnter ticket number to assign (or press Enter for first): ') || '1';
  const ticketIndex = parseInt(selection) - 1;
  
  if (ticketIndex < 0 || ticketIndex >= openTickets.length) {
    log('❌ Invalid ticket selection!', 'red');
    return null;
  }

  const selectedTicket = openTickets[ticketIndex];

  try {
    const assignedTicket = await makeRequest('POST', `/tickets/${selectedTicket.id}/assign`, {}, true);
    log(`✅ Ticket #${assignedTicket.id} assigned successfully!`, 'green');
    log(`👨‍💼 Assigned to: ${assignedTicket.assigned_user_name}`, 'blue');
    return assignedTicket;
  } catch (error) {
    log('❌ Failed to assign ticket!', 'red');
    throw error;
  }
}

async function replyToTicket(ticket) {
  log('\n=== 💬 Replying to Ticket ===', 'cyan');
  
  log(`🎫 Ticket #${ticket.id} - ${ticket.customer_name}`, 'blue');
  log(`📞 Phone: ${ticket.phone_number}`, 'blue');
  log(`📝 Original message: "${ticket.message}"`, 'yellow');
  
  const replyMessage = await question('\nEnter your reply (or press Enter for default): ') || 
    'Hello! Thank you for contacting us. I understand you\'re having an issue with your order delivery. Let me check the status and get back to you with an update shortly.';

  try {
    const reply = await makeRequest('POST', `/tickets/${ticket.id}/reply`, {
      message: replyMessage
    }, true);

    log(`✅ Reply sent successfully!`, 'green');
    log(`💬 Your reply: "${replyMessage}"`, 'yellow');
    log(`📱 Message sent to WhatsApp: ${ticket.phone_number}`, 'green');
    log(`🕒 Sent at: ${new Date(reply.created_at).toLocaleString()}`, 'reset');
    
    return reply;
  } catch (error) {
    log('❌ Failed to send reply!', 'red');
    throw error;
  }
}

async function closeTicket(ticket) {
  log('\n=== ✅ Closing Ticket ===', 'cyan');
  
  const closeTicketChoice = await question('Do you want to close this ticket? (y/N): ');
  
  if (closeTicketChoice.toLowerCase() !== 'y' && closeTicketChoice.toLowerCase() !== 'yes') {
    log('🔄 Ticket remains open.', 'yellow');
    return ticket;
  }

  const resolutionNote = await question('Enter resolution note (optional): ') || 
    'Customer inquiry resolved. Order status clarified and delivery arranged.';

  try {
    const closedTicket = await makeRequest('POST', `/tickets/${ticket.id}/close`, {
      resolution_note: resolutionNote
    }, true);

    log(`✅ Ticket #${closedTicket.id} closed successfully!`, 'green');
    log(`📝 Resolution: "${resolutionNote}"`, 'yellow');
    log(`🕒 Closed at: ${new Date(closedTicket.closed_at).toLocaleString()}`, 'reset');
    
    return closedTicket;
  } catch (error) {
    log('❌ Failed to close ticket!', 'red');
    throw error;
  }
}

async function viewTicketDetails(ticket) {
  log('\n=== 🔍 Ticket Details ===', 'cyan');
  
  try {
    const fullTicket = await makeRequest('GET', `/tickets/${ticket.id}`, null, true);
    
    log(`🎫 Ticket #${fullTicket.id}`, 'bright');
    log(`👤 Customer: ${fullTicket.customer_name}`, 'blue');
    log(`📞 Phone: ${fullTicket.phone_number}`, 'blue');
    log(`🏷️  Status: ${fullTicket.status}`, 'green');
    log(`📝 Original Message: "${fullTicket.message}"`, 'yellow');
    
    if (fullTicket.replies && fullTicket.replies.length > 0) {
      log(`\n💬 Conversation History (${fullTicket.replies.length} replies):`, 'cyan');
      fullTicket.replies.forEach((reply, index) => {
        const speaker = reply.is_from_customer ? fullTicket.customer_name : reply.user_name;
        const time = new Date(reply.created_at).toLocaleString();
        log(`\n${index + 1}. ${speaker} (${time}):`, 'blue');
        log(`   "${reply.message}"`, 'reset');
        if (!reply.is_from_customer && reply.whatsapp_sent) {
          log(`   📱 Sent to WhatsApp`, 'green');
        }
      });
    }
    
    return fullTicket;
  } catch (error) {
    log('❌ Failed to fetch ticket details!', 'red');
    throw error;
  }
}

async function runCompleteWorkflow() {
  log('🚀 WhatsApp Ticket System - Complete Workflow Test', 'bright');
  log('==================================================', 'bright');

  try {
    // 1. Health Check
    const healthOk = await testHealthCheck();
    if (!healthOk) {
      log('\n❌ Server is not healthy. Please start the server first.', 'red');
      log('Run: cd server && npm start', 'yellow');
      return;
    }

    // 2. User Login
    const user = await loginUser();

    // 3. Simulate WhatsApp Message (creates ticket)
    const messageData = await simulateWhatsAppMessage();

    // 4. View Tickets
    const tickets = await viewTickets();

    // 5. Assign Ticket
    const assignedTicket = await assignTicket(tickets);
    if (!assignedTicket) {
      log('\n⚠️  No ticket was assigned. Workflow incomplete.', 'yellow');
      return;
    }

    // 6. Reply to Ticket
    const reply = await replyToTicket(assignedTicket);

    // 7. View Updated Ticket Details
    const updatedTicket = await viewTicketDetails(assignedTicket);

    // 8. Close Ticket
    const finalTicket = await closeTicket(updatedTicket);

    // 9. Final Summary
    log('\n🎉 Workflow Complete!', 'green');
    log('==================', 'green');
    log(`✅ WhatsApp message received from ${messageData.customerName}`, 'green');
    log(`✅ Ticket #${finalTicket.id} created automatically`, 'green');
    log(`✅ Ticket assigned to ${user.username}`, 'green');
    log(`✅ Reply sent to customer via WhatsApp`, 'green');
    log(`✅ Ticket status: ${finalTicket.status}`, 'green');
    
    log('\n📊 Summary:', 'cyan');
    log(`🎫 Ticket ID: #${finalTicket.id}`, 'blue');
    log(`👤 Customer: ${finalTicket.customer_name}`, 'blue');
    log(`📞 Phone: ${finalTicket.phone_number}`, 'blue');
    log(`🏷️  Final Status: ${finalTicket.status}`, 'blue');
    log(`💬 Total Replies: ${finalTicket.replies ? finalTicket.replies.length : 0}`, 'blue');
    
  } catch (error) {
    log(`\n❌ Workflow failed: ${error.message}`, 'red');
  }
}

async function main() {
  try {
    await runCompleteWorkflow();
  } catch (error) {
    log(`\n💥 Fatal error: ${error.message}`, 'red');
  } finally {
    rl.close();
    log('\n👋 Test completed. Goodbye!', 'cyan');
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = {
  testHealthCheck,
  loginUser,
  simulateWhatsAppMessage,
  viewTickets,
  assignTicket,
  replyToTicket,
  closeTicket
};