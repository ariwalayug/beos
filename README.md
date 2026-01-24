# 🩸 BEOS: Blood Emergency Operating System

> **"Be the Reason a Heart Keeps Beating."**

![BEOS Banner](https://img.shields.io/badge/Status-Operational-green?style=for-the-badge) ![Version](https://img.shields.io/badge/Version-2.0_Masterpiece-crimson?style=for-the-badge) ![Tech](https://img.shields.io/badge/Stack-MERN_Light-blue?style=for-the-badge)

**BEOS** is not just an app; it's a **Digital First Responder Network**. It connects Hospitals, Blood Banks, and Donors in a real-time, high-stakes ecosystem designed to slash response times for critical blood requests.

---

## 🌟 Mission Control (Key Features)

### 🚨 For the Command Center (Admin & Hospitals)
- **Live "Pulse" Map:** Real-time visualization of active emergencies and donor positions using Leaflet.js.
- **Critical Broadcast System:** One-click SOS alerts that trigger immediate notifications to nearby matched donors.
- **Inventory Heatmap:** Visual logistics grid showing stock levels (Healthy/Low/Critical) across the network.

### 🦸 For the Heroes (Donors)
- **"Guardian" Rank System:** Gamified progression from *Rookie* to *Guardian Angel* based on lives saved.
- **Instant mobilization:** WebSocket-powered alerts that arrive faster than an ambulance dispatch.
- **Privacy First:** Location data is only shared during active response missions.

### 🚄 Implementation Details (The Secret Sauce)
- **Glassmorphic UI:** Ultra-premium, dark-mode design with floating gradients to reduce eye strain during night shifts.
- **Zero-Latency Updates:** Powered by `Socket.io` for millisecond-level data sync.
- **Smart Routing:** Geospacial queries (simulated) to find the nearest source of rare blood types.

---

## 🛠️ The Arsenal (Tech Stack)

### Frontend (The Face)
- **React (Vite)**: Blazing fast performance.
- **Neon/Glass CSS**: Custom-built design system (No bulky frameworks like Bootstrap).
- **React-Leaflet**: Tactical map overlays.
- **Socket.io-Client**: The nervous system of the app.

### Backend (The Brain)
- **Node.js & Express**: Industrial-grade server framework.
- **SQLite (Better-SQLite3)**: High-performance local SQL engine (Mission-ready for rapid deployment).
- **JWT Auth**: Military-grade session security.
- **Socket.io**: Real-time event orchestrator.

---

## 🚀 Deployment Protocols (Setup)

### Prerequisites
- Node.js (v18+)
- A brave heart ❤️

### 1. Clone the Frequency
```bash
git clone https://github.com/ariwalayug/beos.git
cd beos
```

### 2. Ignite the Engines (One-Shot Command)
We've prepared a master launch script for Windows.
```bash
# Double click 'run.bat' 
# OR execute:
./run.bat
```

### 3. Manual Override (If you prefer control)

**Backend uplink:**
```bash
cd backend
npm install
npm run start
# Server listens on port 5000
```

**Frontend uplink:**
```bash
cd frontend
npm install
npm run dev
# Interface launches on http://localhost:5173
```

---

## 📡 API Transmission (Endpoints)

| Channel | Method | Frequency (URL) | Payload |
|:---|:---:|:---|:---|
| **Identify** | `POST` | `/api/auth/login` | `{email, password}` |
| **Recruit** | `POST` | `/api/auth/register` | `{name, role, blood_type...}` |
| **SOS** | `POST` | `/api/requests` | `{blood_type, urgency, units}` |
| **Radar** | `GET` | `/api/hospitals` | `?lat=xx&lng=yy` |
| **Logistics** | `GET` | `/api/bloodbanks` | `?inventory=true` |

---

## 🔮 Future Horizon
Check `future_enhancements.md` for our classified roadmap involving **AI Prediction Models** and **Drone Delivery Networks**.

---
*Built with ❤️ and 🩸 code by the BEOS Engineering Team.*
