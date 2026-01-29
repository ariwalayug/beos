# Backend Implementation & Data Persistence Plan

## Goal Description
The goal is to establish a robust backend for the Blood Emergency Platform (BEOS) that ensures reliable data storage and real-time communication. We have identified an existing Node.js backend that is well-structured but needs validation and proper initialization. We will finalize this backend, ensuring it uses SQLite for data persistence and Socket.io for real-time updates, as this matches the frontend's technology stack perfectly.

## User Review Required
> [!NOTE]
> We are proceeding with the **Node.js** backend (located in `beos/backend`) as it naturally integrates with the React frontend and handles real-time sockets efficiently. The Python backend attempt will be disregarded to avoid fragmentation.

## Proposed Changes

### Backend (`beos/backend`)
- **Database Initialization**: Ensure `schema.sql` is correctly applied to `blood_emergency.db` to store Users, BloodRequests, and Donations.
- **Server Startup**: Fix local execution issues (PowerShell policies) by using direct node commands.
- **Validation**: Verify that all API endpoints (Auth, Requests, Inventory) are functional and connected to the database.

### Frontend (`beos/frontend`)
- **Connection Check**: Verify `socket.ts` and `api.ts` point to the correct backend URL (default `http://localhost:5000`).
- **Integration**: Ensure forms (Login, Register, Create Request) actually send data to the backend.

## Verification Plan

### Automated Tests
- Run backend unit tests if available (check `backend/tests`).

### Manual Verification
1. **Start Backend**: Run `node server.js` in `beos/backend`.
2. **Start Frontend**: Run `npm run dev` in `beos/frontend`.
3. **Register User**: Create a new account on the frontend.
4. **Check Database**: Verify the user is created in `blood_emergency.db`.
5. **Create Request**: Submit a blood request and verify it appears in the database and triggers a socket event (if observable).
