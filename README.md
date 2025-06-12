# WhatsApp Ticket Management System

A system to manage incoming WhatsApp messages by creating tickets, allowing team members to assign, reply, and close tickets, with replies sent back to the WhatsApp requester.

## Overview
This application integrates with the WhatsApp Business API to receive messages, store them as tickets in a database, and provide a web interface for team members to manage these tickets. It supports real-time updates for new tickets and status changes.

## Technology Stack
- **Backend**: Node.js with Express.js for API and server-side logic
- **Frontend**: Angular for the user interface
- **Database**: PostgreSQL for storing messages, tickets, and user data
- **Real-time Communication**: WebSockets via Socket.IO
- **Authentication**: JSON Web Tokens (JWT)
- **Hosting/Deployment**: AWS (planned)

## Project Structure
- **/server**: Backend code including Express.js server, API endpoints, and database scripts
  - **/server/database**: SQL scripts for database initialization
- **/client**: Frontend code (Angular project to be initialized)
- **/config**: Configuration files including environment variables
- **/package.json**: Node.js project manifest with dependencies and scripts

## Setup Instructions
### Prerequisites
- Node.js and npm installed on your system
- PostgreSQL database server (local or hosted, e.g., AWS RDS)
- WhatsApp Business API account and credentials
- Angular CLI for frontend development (`npm install -g @angular/cli`)

### Backend Setup
1. Navigate to the project root directory.
2. Install dependencies: `npm install`
3. Configure environment variables in `config/.env` with your database credentials and WhatsApp API details.
4. Set up the PostgreSQL database by running the script in `server/database/init.sql`.
5. Start the backend server: `npm run dev` (uses nodemon for development)

### Frontend Setup
1. Navigate to the `client` directory.
2. Initialize the Angular project: `ng new whatsapp-ticket-frontend --directory . --skip-git`
3. Follow prompts to configure routing and stylesheet format (e.g., SCSS).
4. Install dependencies: `npm install`
5. Start the development server: `ng serve`

### Database Setup
- Create a PostgreSQL database named as specified in `config/.env` (default: `whatsapp_tickets`).
- Execute the SQL script in `server/database/init.sql` to create necessary tables and sample data.

## Security Features
- Data encryption for sensitive information
- JWT-based authentication for secure user access
- Role-based access control for ticket management
- API security with rate limiting and input validation

## Usage
1. Ensure the backend server is running (`npm run dev` from root).
2. Ensure the frontend Angular app is running (`ng serve` from `client` directory).
3. Access the frontend application in your browser (default: `http://localhost:4200`).
4. Log in with credentials from the sample users in the database.
5. View, assign, reply to, and close tickets from the dashboard.

## WhatsApp Integration
- Configure webhooks in the WhatsApp Business API to point to your backend endpoint (`/webhook/whatsapp`).
- Implement sending replies via the WhatsApp API (placeholder in `server/server.js`).

## Deployment
- Planned for AWS using services like Elastic Beanstalk for the application and RDS for PostgreSQL.
- Detailed deployment instructions to be added once implemented.

## Contributing
This project is under development. Contributions and suggestions are welcome.

## License
ISC
