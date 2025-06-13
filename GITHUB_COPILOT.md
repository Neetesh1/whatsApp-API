# WhatsApp Ticket Management System

This project is a WhatsApp Ticket Management System that integrates WhatsApp Business API, Node.js (Express), Angular, and PostgreSQL. It allows team members to manage incoming WhatsApp messages as tickets, assign, reply, and close them, with real-time updates and JWT authentication.

## Project Structure

- **/server**: Node.js backend (Express, Socket.IO, PostgreSQL)
  - `server.js`: Main server file, API endpoints, WebSocket events
  - `database/init.sql`: SQL for tables and sample data
- **/client**: Angular frontend
  - `src/app/`: Angular components (login, dashboard, ticket details)
- **/config/.env**: Environment variables (DB, JWT, API keys)
- **/docker-compose.yml**: Docker setup for PostgreSQL

## Key Features

- **Role-Based Authentication**: 
  - Admin users can create and manage user accounts
  - Regular users can manage tickets assigned to them
- **WhatsApp Integration**: Receives WhatsApp messages via webhook, creates tickets
- **Ticket Management**: 
  - View incoming WhatsApp messages as tickets
  - Assign tickets to yourself
  - Reply to tickets (responses sent via WhatsApp)
  - Close tickets once resolved
- **Real-time Updates**: Uses Socket.IO for live ticket updates
- **Database**: PostgreSQL with users, tickets, replies tables
- **Frontend**: Angular app for login, dashboard, and ticket management

## User Roles

1. **Admin**:
   - Can create regular user accounts
   - Has access to all system features
   - Can view all tickets and their statuses

2. **Regular User**:
   - Can view the list of WhatsApp message tickets
   - Can assign tickets to themselves
   - Can reply to assigned tickets (replies sent via WhatsApp)
   - Can close tickets after resolution

## Setup

1. `docker-compose up -d` to start PostgreSQL
2. Configure `/config/.env` for DB and secrets
3. `npm install` in root and `/client` for dependencies
4. `npm run dev` to start backend
5. `cd client && ng serve` to start frontend

## Usage
- Access frontend at `http://localhost:4200`
- Login with admin credentials to create user accounts
- Login with user credentials to manage WhatsApp tickets
- View, assign, reply to, and close tickets from the dashboard

---

*Last updated: June 13, 2025**
