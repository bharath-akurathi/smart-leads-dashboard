# Smart Leads Dashboard

A production-grade lead management dashboard built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Authentication & RBAC:** Secure JWT-based authentication with Admin and Sales roles.
- **Lead Management:** Full CRUD operations for leads, with role-based access control.
- **Dashboard & Analytics:** Real-time metrics and visualizations using Recharts.
- **Bulk Actions:** Update or delete multiple leads simultaneously.
- **CSV Export:** Seamlessly export filtered leads to a CSV file.
- **Dark Mode:** System-aware, persistent dark mode UI.
- **Testing:** Comprehensive test coverage with Jest, Supertest, Vitest, and React Testing Library.

## Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- Axios
- Vitest & React Testing Library

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Zod (Validation)
- Jest & Supertest

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)

### Installation

1. Clone the repository and install dependencies for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. Setup Environment Variables
   - Duplicate `server/.env.example` as `server/.env` and fill in the values (especially `MONGO_URI` and `JWT_SECRET`).
   - Ensure `client/.env` has `VITE_API_URL=http://localhost:5001`.

### Running the App

Run both the frontend and backend concurrently:
```bash
# In the root, client, or server directory (depending on your setup)
# Start Backend
cd server
npm run dev

# Start Frontend (in a separate terminal)
cd client
npm run dev
```
The backend runs on `http://localhost:5001` to avoid macOS AirPlay port conflicts.
The frontend runs on `http://localhost:5173` or `5174`.

## Testing

Both frontend and backend are fully covered by integration and unit tests.

### Backend Tests
```bash
cd server
npm run test
```

### Frontend Tests
```bash
cd client
npm run test
```
