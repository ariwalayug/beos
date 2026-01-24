# Blood Emergency Platform

A modern full-stack web application for managing blood donation emergencies, connecting donors, hospitals, and blood banks in real-time.

## 🩸 Features

- **Real-time Emergency Alerts**: Instant notifications for critical blood requests via Socket.IO
- **Donor Management**: Register, search, and filter blood donors by type and location
- **Hospital Directory**: Partner hospital listings with emergency contacts
- **Blood Bank Inventory**: Live blood inventory tracking across multiple banks
- **Emergency Requests**: Create, track, and fulfill blood requests with urgency levels
- **Responsive Design**: Modern glassmorphic UI that works on all devices

## 🏗️ Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Socket.IO Client for real-time updates
- Vanilla CSS with custom design system

### Backend
- Node.js with Express
- SQLite database (better-sqlite3)
- Socket.IO for WebSocket connections
- JWT for authentication

## 📁 Project Structure

```
beos/
├── backend/
│   ├── server.js           # Express server with Socket.IO
│   ├── package.json
│   ├── .env
│   ├── database/
│   │   ├── db.js           # Database connection & seeding
│   │   └── schema.sql      # SQLite schema
│   ├── models/
│   │   ├── Donor.js
│   │   ├── Hospital.js
│   │   ├── BloodBank.js
│   │   └── BloodRequest.js
│   ├── routes/
│   │   ├── donors.js
│   │   ├── hospitals.js
│   │   ├── bloodBanks.js
│   │   └── bloodRequests.js
│   └── socket/
│       └── handler.js
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css        # Design system
        ├── components/
        ├── pages/
        ├── services/
        └── hooks/
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone and navigate to project**
   ```bash
   cd beos
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on http://localhost:5000

2. **Start Frontend Dev Server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   App opens on http://localhost:5173

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/donors` | List all donors |
| POST | `/api/donors` | Create new donor |
| GET | `/api/hospitals` | List all hospitals |
| GET | `/api/blood-banks` | List blood banks |
| GET | `/api/blood-banks?inventory=true` | With inventory |
| GET | `/api/requests` | List blood requests |
| POST | `/api/requests` | Create blood request |
| PUT | `/api/requests/:id/fulfill` | Fulfill request |

## 🔴 Real-time Events

| Event | Description |
|-------|-------------|
| `new-request` | New blood request created |
| `critical-alert` | Critical urgency request |
| `request-updated` | Request status changed |
| `request-fulfilled` | Request completed |

## 🎨 Design System

- **Primary Color**: Deep Red (#DC2626) - Blood/Emergency theme
- **Dark Theme**: Slate gradients with glassmorphism
- **Typography**: Inter font family
- **Animations**: Smooth transitions and pulse effects

## 📱 Pages

1. **Home** - Dashboard with stats, blood type availability, critical alerts
2. **Donors** - Searchable donor directory with filters
3. **Hospitals** - Partner hospital listings
4. **Blood Banks** - Inventory tracking by blood type
5. **Emergency** - Create and manage blood requests
6. **Register** - Donor registration form

## 🔮 Future Enhancements

- [ ] User authentication system
- [ ] SMS/Email notifications
- [ ] Location-based donor matching
- [ ] Blood donation scheduling
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

Built with ❤️ to save lives.
