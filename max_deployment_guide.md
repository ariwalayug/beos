# Deployment Guide - Blood Emergency Platform

This project is built with a **Node.js/Express backend** (using SQLite) and a **React/Vite frontend**.

## Prerequisites
- Node.js (v18+)
- NPM

## 1. Backend Deployment

1.  **Navigate to backend**:
    ```bash
    cd backend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    # Production only: npm install --production
    ```
3.  **Environment Variables**:
    Copy `.env.example` to `.env` and update values:
    ```bash
    cp .env.example .env
    ```
    - `JWT_SECRET`: Set a strong secret.
    - `DB_PATH`: Path to SQLite file (ensure write permissions).
    - `CLIENT_URL`: URL of your deployed frontend.

4.  **Start Server**:
    ```bash
    npm start
    # Or with PM2: pm2 start server.js --name "beos-backend"
    ```

## 2. Frontend Deployment

1.  **Navigate to frontend**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create `.env` based on `.env.example`:
    ```env
    VITE_API_URL=https://your-backend-domain.com
    ```

4.  **Build**:
    ```bash
    npm run build
    ```
    This creates a `dist/` folder.

5.  **Serve**:
    Host the `dist/` folder using Nginx, Apache, Vercel, or Netlify.
    - **SPA Routing**: Ensure your server redirects 404s to `index.html`.

## 3. SQLite Database
- The database file (`blood_emergency.db`) is created automatically on first run.
- Ensure the backend process has **write access** to the directory containing the database file.

## 4. Troubleshooting
- **CORS Errors**: Check `CLIENT_URL` in backend `.env` matches your frontend domain.
- **Connection Refused**: Check `VITE_API_URL` in frontend.
