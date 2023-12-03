# User Authentication System

This project implements a user authentication system using Node.js, Express, and MongoDB.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Configuration](#configuration)
  - [Database Setup](#database-setup)
- [Dependencies](#dependencies)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Session Management](#session-management)


## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Getting Started

### Configuration

1. Clone the repository:

   
   - git clone https://github.com/Ashutosh0891/User-Authentication-System
2 .env file
   - PORT=3000
   - MONGO_URI=mongodb+srv://ashuadya8:l3zOGLGRHP5EEVoe@cluster0.argvp6f.mongodb.net/UserAuthenticationSystem

### Dependencies
  - bcrypt
  - crypto
  - dotenv
  - express
  - express-session
  - express-validator
  - jsonwebtoken
  - mongoose
  - Install the dependencies using:
      - npm install

  
 ### Usage
   - Start the application:
       - npm run start
       - npm run watch(using nodemon)
    
 ### Endpoints
   - POST /api/users/register: Register a new user.
   - POST /api/users/login: Log in an existing user.
   - POST /api/users/logout: Log out the authenticated user.
   - GET /api/users/details: Get details of the authenticated user.
   - PUT /api/users/update: Update details of the authenticated user.
   - DELETE /api/users/delete: Delete the authenticated user's account.
   - GET /api/users/recover-account: Initiate the account recovery process.
   - POST /api/users/confirm-delete: Confirm account deletion with password.
   - GET /api/users/reset-password-token: Get a reset token for password reset.
   - POST /api/users/reset-password: Reset the user's password using a reset token.

### Session Management
  - The project uses express-session for session management. Sessions are stored in-memory by default, but for production, consider using a store like MongoDB to persist sessions.




         
   
