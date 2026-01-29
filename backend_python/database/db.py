"""
Database connection and initialization for BEOS Python Backend
Uses aiosqlite for async SQLite operations
"""

import aiosqlite
import os
from pathlib import Path
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database path
DB_DIR = Path(__file__).parent
DB_PATH = os.environ.get("DB_PATH", str(DB_DIR / "blood_emergency.db"))

# Global connection (will be initialized on startup)
_db_connection = None


async def get_db():
    """Get database connection"""
    global _db_connection
    if _db_connection is None:
        _db_connection = await aiosqlite.connect(DB_PATH)
        _db_connection.row_factory = aiosqlite.Row
        await _db_connection.execute("PRAGMA foreign_keys = ON")
    return _db_connection


async def init_db():
    """Initialize database with schema"""
    db = await get_db()
    
    # Read and execute schema
    schema_path = DB_DIR / "schema.sql"
    if schema_path.exists():
        with open(schema_path, "r") as f:
            schema = f.read()
        await db.executescript(schema)
        await db.commit()
        print(f"Database initialized at: {DB_PATH}")
    else:
        print(f"Warning: schema.sql not found at {schema_path}")
    
    # Run migrations
    await run_migrations(db)


async def run_migrations(db):
    """Run database migrations"""
    
    # Migration: Add donor_id to blood_requests if not exists
    try:
        cursor = await db.execute("PRAGMA table_info(blood_requests)")
        columns = await cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        if "donor_id" not in column_names:
            print("Migrating: Adding donor_id column to blood_requests table...")
            await db.execute(
                "ALTER TABLE blood_requests ADD COLUMN donor_id INTEGER REFERENCES donors(id) ON DELETE SET NULL"
            )
            await db.commit()
    except Exception as e:
        print(f"Migration error (donor_id): {e}")
    
    # Migration: Create blood_batches table
    try:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS blood_batches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                blood_bank_id INTEGER NOT NULL,
                blood_type TEXT NOT NULL,
                units INTEGER NOT NULL,
                expiry_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id)
            )
        """)
        await db.commit()
    except Exception as e:
        print(f"Migration error (blood_batches): {e}")
    
    # Migration: Add latitude/longitude to donors if not exists
    try:
        cursor = await db.execute("PRAGMA table_info(donors)")
        columns = await cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        if "latitude" not in column_names:
            print("Migrating: Adding location columns to donors table...")
            await db.execute("ALTER TABLE donors ADD COLUMN latitude REAL")
            await db.execute("ALTER TABLE donors ADD COLUMN longitude REAL")
            await db.commit()
    except Exception as e:
        print(f"Migration error (donor location): {e}")
    
    # Migration: Create donations table
    try:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS donations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donor_id INTEGER NOT NULL,
                blood_bank_id INTEGER,
                request_id INTEGER,
                blood_type TEXT NOT NULL,
                units INTEGER DEFAULT 1,
                donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (donor_id) REFERENCES donors(id),
                FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id),
                FOREIGN KEY (request_id) REFERENCES blood_requests(id)
            )
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id)")
        await db.commit()
    except Exception as e:
        print(f"Migration error (donations): {e}")
    
    # Migration: Add missing columns to blood_requests
    try:
        cursor = await db.execute("PRAGMA table_info(blood_requests)")
        columns = await cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        columns_to_add = [
            ("gender", "TEXT"),
            ("component_type", 'TEXT DEFAULT "Whole Blood"'),
            ("is_critical", "INTEGER DEFAULT 0"),
            ("diagnosis", "TEXT"),
            ("allergies", "TEXT"),
            ("doctor_name", "TEXT")
        ]
        
        for name, col_type in columns_to_add:
            if name not in column_names:
                print(f"Migrating: Adding {name} column to blood_requests table...")
                await db.execute(f"ALTER TABLE blood_requests ADD COLUMN {name} {col_type}")
        await db.commit()
    except Exception as e:
        print(f"Migration error (blood_requests columns): {e}")


async def seed_data():
    """Seed initial data if tables are empty"""
    db = await get_db()
    
    cursor = await db.execute("SELECT COUNT(*) as count FROM donors")
    row = await cursor.fetchone()
    
    if row[0] == 0:
        print("Seeding initial data...")
        
        # Seed donors
        donors = [
            ('Rahul Sharma', 'O+', '+91 98765 43210', 'rahul@email.com', 'Mumbai', 1),
            ('Priya Patel', 'A+', '+91 98765 43211', 'priya@email.com', 'Delhi', 1),
            ('Amit Kumar', 'B+', '+91 98765 43212', 'amit@email.com', 'Bangalore', 1),
            ('Sneha Reddy', 'AB+', '+91 98765 43213', 'sneha@email.com', 'Hyderabad', 1),
            ('Vikram Singh', 'O-', '+91 98765 43214', 'vikram@email.com', 'Chennai', 1),
            ('Anjali Gupta', 'A-', '+91 98765 43215', 'anjali@email.com', 'Pune', 1),
            ('Rajesh Verma', 'B-', '+91 98765 43216', 'rajesh@email.com', 'Kolkata', 0),
            ('Meera Nair', 'AB-', '+91 98765 43217', 'meera@email.com', 'Jaipur', 1),
        ]
        
        for donor in donors:
            await db.execute(
                "INSERT INTO donors (name, blood_type, phone, email, city, available) VALUES (?, ?, ?, ?, ?, ?)",
                donor
            )
        
        # Seed hospitals
        hospitals = [
            ('City General Hospital', '123 Main Street', 'Mumbai', '+91 22 1234 5678', 'contact@citygeneral.com', '+91 22 1234 5679'),
            ('Apollo Hospital', '456 Health Avenue', 'Delhi', '+91 11 2345 6789', 'info@apollo.com', '+91 11 2345 6780'),
            ('Fortis Healthcare', '789 Medical Road', 'Bangalore', '+91 80 3456 7890', 'care@fortis.com', '+91 80 3456 7891'),
            ('AIIMS', '101 Hospital Lane', 'Delhi', '+91 11 4567 8901', 'aiims@gov.in', '+91 11 4567 8902'),
        ]
        
        for hospital in hospitals:
            await db.execute(
                "INSERT INTO hospitals (name, address, city, phone, email, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)",
                hospital
            )
        
        # Seed blood banks
        blood_banks = [
            ('Red Cross Blood Bank', '100 Donation Drive', 'Mumbai', '+91 22 5678 1234', 'redcross@bloodbank.org', '24/7'),
            ('LifeLine Blood Center', '200 Vital Street', 'Delhi', '+91 11 6789 2345', 'lifeline@bloodcenter.com', '8 AM - 10 PM'),
            ('National Blood Bank', '300 Health Hub', 'Bangalore', '+91 80 7890 3456', 'national@bloodbank.gov', '24/7'),
        ]
        
        for bank in blood_banks:
            await db.execute(
                "INSERT INTO blood_banks (name, address, city, phone, email, operating_hours) VALUES (?, ?, ?, ?, ?, ?)",
                bank
            )
        
        # Seed blood inventory
        import random
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        
        for bank_id in range(1, 4):
            for blood_type in blood_types:
                units = random.randint(5, 50)
                await db.execute(
                    "INSERT INTO blood_inventory (blood_bank_id, blood_type, units) VALUES (?, ?, ?)",
                    (bank_id, blood_type, units)
                )
        
        # Seed blood requests
        requests = [
            (1, 'Patient A', 'O+', 2, 'critical', 'pending', '+91 98888 88888', 'Emergency surgery required'),
            (2, 'Patient B', 'A-', 1, 'urgent', 'pending', '+91 97777 77777', 'Scheduled operation'),
            (3, 'Patient C', 'B+', 3, 'normal', 'fulfilled', '+91 96666 66666', 'Regular transfusion'),
        ]
        
        for request in requests:
            await db.execute(
                "INSERT INTO blood_requests (hospital_id, patient_name, blood_type, units, urgency, status, contact_phone, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                request
            )
        
        await db.commit()
        print("Initial data seeded successfully!")


async def seed_admin():
    """Seed admin user"""
    db = await get_db()
    
    email = "ariwalayug181@gmail.com"
    password = "ariwalayug@2008"
    role = "admin"
    
    try:
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = await cursor.fetchone()
        
        if not existing:
            print("Seeding admin user...")
            password_hash = pwd_context.hash(password)
            await db.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                (email, password_hash, role)
            )
            await db.commit()
            print("Admin user created successfully.")
        else:
            print("Admin user already exists.")
    except Exception as e:
        print(f"Admin seeding error: {e}")


async def close_db():
    """Close database connection"""
    global _db_connection
    if _db_connection:
        await _db_connection.close()
        _db_connection = None
