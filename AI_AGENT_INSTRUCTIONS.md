# AI Agent Instructions for WhatsApp Ticket System

## 🤖 Quick Start for AI Agents

This document provides specific instructions for AI agents (like GitHub Copilot, ChatGPT, Claude, etc.) working on this WhatsApp ticket system project.

## 🎯 Project Context

**System Type**: WhatsApp-based customer support ticket system  
**Architecture**: Node.js + Angular + PostgreSQL + Socket.IO  
**Primary Workflow**: WhatsApp message → Ticket creation → User assignment → Reply → Close

## 🔍 Understanding the Codebase

### Key Files to Reference
```
├── WORKFLOW_DOCUMENTATION.md     # Complete system documentation
├── test-workflow.js             # End-to-end workflow testing
├── server/
│   ├── server.js               # Main server with Socket.IO setup
│   ├── routes/tickets.js       # Core ticket management logic
│   ├── routes/whatsapp.js      # WhatsApp integration
│   └── database/init.sql       # Database schema
└── client/src/app/
    ├── core/services/tickets.service.ts    # Angular ticket service
    └── features/tickets/components/ticket-list.component.ts
```

### Current System State
- ✅ Complete ticket workflow implemented
- ✅ WhatsApp webhook integration
- ✅ Real-time Socket.IO updates
- ✅ User authentication and assignment rules
- ✅ Database schema with relationships
- ✅ Comprehensive testing framework

## 🛠️ Common Modification Patterns

### 1. Adding New Ticket Fields

**Steps to follow:**
1. Update database schema in `server/database/init.sql`
2. Modify API response in `server/routes/tickets.js`
3. Update TypeScript interface in `client/src/app/core/services/tickets.service.ts`
4. Add UI fields in `client/src/app/features/tickets/components/ticket-list.component.ts`

**Example**: Adding priority field
```sql
-- 1. Database
ALTER TABLE tickets ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
```

```javascript
// 2. API (server/routes/tickets.js)
const query = `
  SELECT t.*, u.username as assigned_user_name, t.priority
  FROM tickets t
  LEFT JOIN users u ON t.assigned_to = u.id
  ORDER BY t.created_at DESC
`;
```

```typescript
// 3. Interface (tickets.service.ts)
export interface Ticket {
  // ...existing fields...
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
```

```html
<!-- 4. UI Component -->
<td>
  <span class="badge" [ngClass]="{
    'bg-success': ticket.priority === 'low',
    'bg-warning': ticket.priority === 'medium',
    'bg-danger': ticket.priority === 'high'
  }">
    {{ ticket.priority | titlecase }}
  </span>
</td>
```

### 2. Adding New API Endpoints

**Pattern**: `server/routes/[module].js` → `client/src/app/core/services/[module].service.ts`

```javascript
// Server endpoint
router.get('/tickets/analytics', authenticateUser, async (req, res) => {
  // Implementation
});
```

```typescript
// Angular service method
getTicketAnalytics(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/tickets/analytics`);
}
```

### 3. Adding Real-time Events

**Pattern**: Server emits → Client listens

```javascript
// Server (in relevant route file)
req.io.emit('ticket_priority_changed', {
  ticketId: ticket.id,
  newPriority: priority,
  changedBy: req.user.username
});
```

```typescript
// Client (socket.service.ts)
onTicketPriorityChanged(): Observable<any> {
  return new Observable(observer => {
    this.socket.on('ticket_priority_changed', data => observer.next(data));
  });
}
```

### 4. Extending WhatsApp Functionality

**Key file**: `server/routes/whatsapp.js`

```javascript
// Add new message type handler
async function handleIncomingMessage(messageData) {
  if (messageData.type === 'image') {
    // Handle image messages
    await processImageMessage(messageData);
  }
  // ...existing code...
}
```

## 🔧 Testing Strategy

### Always Test Changes
```bash
# 1. Run automated workflow test
node test-workflow.js

# 2. Check specific endpoints
curl -X GET http://localhost:3000/api/health

# 3. Test real-time features
# Open multiple browser tabs to verify Socket.IO updates
```

### Validation Checklist
- [ ] Database changes applied correctly
- [ ] API endpoints return expected data structure
- [ ] Frontend displays new data properly
- [ ] Real-time updates work across clients
- [ ] Authentication still works
- [ ] No TypeScript compilation errors

## 🚨 Critical Business Rules (NEVER BREAK)

### Ticket Assignment Rules
```typescript
// ❌ NEVER allow reassignment once assigned
if (ticket.assigned_to && ticket.assigned_to !== userId) {
  throw new Error('Ticket already assigned to another user');
}

// ✅ ALWAYS check assignment before allowing actions
if (ticket.assigned_to !== req.user.id) {
  return res.status(403).json({ error: 'Not assigned to you' });
}
```

### WhatsApp Integration Rules
```javascript
// ✅ ALWAYS send replies to WhatsApp
await sendWhatsAppMessage(ticket.phone_number, replyMessage);

// ✅ ALWAYS log WhatsApp messages
await logWhatsAppMessage(ticketId, message, direction);

// ✅ ALWAYS emit real-time updates
req.io.emit('ticket_reply', { ticketId, reply });
```

### Status Transition Rules
```javascript
// ✅ Valid transitions only
const validTransitions = {
  'open': ['assigned'],
  'assigned': ['in_progress', 'closed'],
  'in_progress': ['closed'],
  'closed': [] // No transitions from closed
};
```

## 🔍 Debugging Patterns

### Common Issues and Solutions

1. **Socket.IO not updating**
   ```javascript
   // Check if io is passed to routes
   app.use('/api/tickets', (req, res, next) => {
     req.io = io;
     next();
   }, ticketsRouter);
   ```

2. **Database connection issues**
   ```javascript
   // Always handle database errors
   try {
     const result = await db.query(query, params);
     return result.rows;
   } catch (error) {
     console.error('Database error:', error);
     throw error;
   }
   ```

3. **Authentication problems**
   ```typescript
   // Check token in Angular interceptor
   intercept(req: HttpRequest<any>, next: HttpHandler) {
     const token = localStorage.getItem('token');
     if (token) {
       req = req.clone({
         setHeaders: { Authorization: `Bearer ${token}` }
       });
     }
     return next.handle(req);
   }
   ```

## 📚 Code Examples for Common Tasks

### Adding a New Status Filter
```typescript
// tickets.service.ts
getTicketsByStatus(status: string): Observable<Ticket[]> {
  return this.http.get<Ticket[]>(`${this.apiUrl}/tickets?status=${status}`);
}

// ticket-list.component.ts
filterByStatus(status: string): void {
  this.ticketsService.getTicketsByStatus(status).subscribe(tickets => {
    this.tickets = tickets;
  });
}
```

### Adding Bulk Operations
```javascript
// server/routes/tickets.js
router.post('/tickets/bulk-assign', authenticateUser, async (req, res) => {
  const { ticketIds } = req.body;
  const userId = req.user.id;
  
  try {
    const result = await db.query(
      'UPDATE tickets SET assigned_to = $1, status = $2 WHERE id = ANY($3) AND status = $4',
      [userId, 'assigned', ticketIds, 'open']
    );
    
    req.io.emit('tickets_bulk_assigned', { ticketIds, userId });
    res.json({ success: true, updated: result.rowCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Adding Notification System
```javascript
// Add to Socket.IO events
req.io.to(`user_${assignedUserId}`).emit('ticket_notification', {
  type: 'new_reply',
  ticketId: ticket.id,
  message: 'New customer reply received'
});
```

## 🎯 Performance Considerations

### Database Queries
```sql
-- ✅ Use proper indexes
CREATE INDEX idx_tickets_status_created ON tickets(status, created_at);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);

-- ✅ Limit results in API calls
SELECT * FROM tickets ORDER BY created_at DESC LIMIT 50;
```

### Real-time Updates
```javascript
// ✅ Emit to specific users only when possible
io.to(`user_${userId}`).emit('personal_notification', data);

// ✅ Throttle high-frequency updates
const throttledEmit = throttle((data) => {
  io.emit('ticket_stats_update', data);
}, 5000); // Max once per 5 seconds
```

## 🔄 Integration Points

### External System Integration
```javascript
// Add webhook endpoints for external systems
router.post('/tickets/:id/external-update', async (req, res) => {
  const { status, externalId } = req.body;
  
  // Update ticket with external system data
  await db.query(
    'UPDATE tickets SET external_id = $1, external_status = $2 WHERE id = $3',
    [externalId, status, req.params.id]
  );
  
  // Notify frontend
  req.io.emit('ticket_external_update', { ticketId: req.params.id, status });
});
```

## 📋 Quick Reference

### File Modification Checklist
- [ ] Update database schema if needed
- [ ] Modify API endpoint
- [ ] Update Angular service
- [ ] Update TypeScript interfaces
- [ ] Modify component templates
- [ ] Add real-time Socket.IO events
- [ ] Test with `test-workflow.js`
- [ ] Check for compilation errors

### Socket.IO Event Naming Convention
- `ticket_*` - Ticket-related events
- `whatsapp_*` - WhatsApp-related events
- `user_*` - User-specific events
- `system_*` - System-wide notifications

### API Response Format
```javascript
// Success
{ data: [...], message: "Success", timestamp: "..." }

// Error
{ error: "Error message", code: "ERROR_CODE", timestamp: "..." }
```

This guide ensures AI agents can effectively understand, modify, and extend the WhatsApp ticket system while maintaining code quality and business rules.