# Smart Leads Dashboard - Server

This is the backend REST API for the Smart Leads Dashboard, built with Node.js, Express, and MongoDB.

## Features
- **JWT Authentication:** Secure token-based auth with automatic expiration.
- **Role-Based Access Control (RBAC):** 
  - `Admin`: Full access to all leads and analytics.
  - `Sales`: Restricted access to only the leads they have created.
- **Data Validation:** Zod schema validation for all incoming requests.
- **Export Capabilities:** Native generation of CSV data for leads export.
- **Error Handling:** Centralized asynchronous error handling.

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the server in development mode using `ts-node-dev`. The server runs on port 5001 by default.

### `npm run build`
Compiles the TypeScript code into JavaScript in the `dist` folder.

### `npm run start`
Starts the production server from the compiled `dist/server.js` file.

### `npm run test`
Runs the Jest test suite. The test setup connects to a dedicated `smart-leads-test` MongoDB database to safely execute integration tests without affecting development or production data.

### `npm run test:watch`
Runs the tests in interactive watch mode.

## API Documentation

- `POST /api/auth/register` - Register a new user (defaults to `sales` role).
- `POST /api/auth/login` - Authenticate a user and receive a JWT.
- `GET /api/leads` - Get all leads (paginated, supports filtering and search).
- `POST /api/leads` - Create a new lead.
- `GET /api/leads/:id` - Get a specific lead.
- `PUT /api/leads/:id` - Update a lead.
- `DELETE /api/leads/:id` - Delete a lead.
- `GET /api/leads/stats` - Get aggregate statistics for the dashboard.
- `GET /api/leads/export/csv` - Export leads as a raw CSV file.
- `PATCH /api/leads/bulk/status` - Bulk update the status of multiple leads.
- `DELETE /api/leads/bulk` - Bulk delete multiple leads.
