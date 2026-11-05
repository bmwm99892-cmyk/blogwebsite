# THE JOURNAL

An independent digital editorial publication and magazine blogging platform built with React.js, Node.js, and MySQL.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Axios, React Router, Lucide Icons
- **Backend**: Node.js, Express.js, MySQL (`mysql2`), JWT Authentication, BcryptJS

## Database (MySQL)
The backend automatically creates the `blogwebsite` database and required tables (`users`, `blogs`, `newsletters`, `contacts`) upon server start.

### Configure `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=blogwebsite
DB_PORT=3306
JWT_SECRET=premium_blog_secret_key_2026
```

## Installation & Running

1. **Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
