"""
Blood Emergency Platform - Python Backend
FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import socketio
import uvicorn
from datetime import datetime

from database.db import init_db, seed_data, seed_admin
from routes import auth, admin, donors, hospitals, blood_banks, requests
from socket_handlers.handler import setup_socket_handlers

# Socket.IO setup
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'https://beos-eta.vercel.app'
    ]
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("Initializing database...")
    await init_db()
    await seed_data()
    await seed_admin()
    print("Database initialized successfully!")
    yield
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Blood Emergency Platform API",
    description="Backend API for Blood Emergency Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'https://beos-eta.vercel.app'
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store sio in app state for routes to access
app.state.sio = sio

# Setup socket handlers
setup_socket_handlers(sio)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(donors.router, prefix="/api/donors", tags=["Donors"])
app.include_router(hospitals.router, prefix="/api/hospitals", tags=["Hospitals"])
app.include_router(blood_banks.router, prefix="/api/blood-banks", tags=["Blood Banks"])
app.include_router(requests.router, prefix="/api/requests", tags=["Blood Requests"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "success": True,
        "message": "Blood Emergency Platform API is running",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/dashboard")
async def get_dashboard():
    """Dashboard statistics"""
    from models.donor import Donor
    from models.hospital import Hospital
    from models.blood_bank import BloodBank
    from models.blood_request import BloodRequest

    try:
        stats = {
            "donors": await Donor.get_stats(),
            "hospitals": await Hospital.get_stats(),
            "requests": await BloodRequest.get_stats(),
            "inventory": await BloodBank.get_total_inventory(),
            "criticalRequests": await BloodRequest.get_critical()
        }
        return {"success": True, "data": stats}
    except Exception as e:
        return {"success": False, "error": str(e)}


# Create ASGI application with Socket.IO
socket_app = socketio.ASGIApp(sio, app)


if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🩸 Blood Emergency Platform API Server (Python)        ║
║                                                           ║
║   Server running on: http://localhost:5000               ║
║   Socket.IO enabled for real-time updates                ║
║                                                           ║
║   API Endpoints:                                          ║
║   • GET  /api/health          - Health check              ║
║   • GET  /api/dashboard       - Dashboard stats           ║
║   • CRUD /api/donors          - Donor management          ║
║   • CRUD /api/hospitals       - Hospital management       ║
║   • CRUD /api/blood-banks     - Blood bank management     ║
║   • CRUD /api/requests        - Blood request management  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)
    uvicorn.run(socket_app, host="0.0.0.0", port=5000)
