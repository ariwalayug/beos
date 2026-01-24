-- Blood Emergency Platform Database Schema

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'hospital', 'blood_bank')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Donors table
CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    blood_type TEXT NOT NULL CHECK(blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT NOT NULL,
    address TEXT,
    available INTEGER DEFAULT 1,
    last_donation DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    latitude REAL,
    longitude REAL,
    emergency_contact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Blood Banks table
CREATE TABLE IF NOT EXISTS blood_banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    latitude REAL,
    longitude REAL,
    operating_hours TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Blood Inventory for Blood Banks (Summary)
CREATE TABLE IF NOT EXISTS blood_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blood_bank_id INTEGER NOT NULL,
    blood_type TEXT NOT NULL CHECK(blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id),
    UNIQUE(blood_bank_id, blood_type)
);

-- Blood Batches (Detailed Inventory)
CREATE TABLE IF NOT EXISTS blood_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blood_bank_id INTEGER NOT NULL,
    blood_type TEXT NOT NULL CHECK(blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INTEGER NOT NULL,
    expiry_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id)
);

-- Emergency Requests
CREATE TABLE IF NOT EXISTS blood_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER,
    donor_id INTEGER, -- Link to donor who fulfilled it
    patient_name TEXT,
    age INTEGER,
    hemoglobin REAL,
    platelets INTEGER,
    blood_type TEXT NOT NULL CHECK(blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INTEGER NOT NULL DEFAULT 1,
    urgency TEXT DEFAULT 'normal' CHECK(urgency IN ('normal', 'urgent', 'critical')),
    past_reaction TEXT, -- Optional field for past blood injecting reaction
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'fulfilled', 'cancelled')),
    contact_phone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at DATETIME,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (donor_id) REFERENCES donors(id)
);

-- Donations (History of Completed Donations)
CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    blood_bank_id INTEGER, -- If donated at blood bank
    request_id INTEGER,    -- If specific emergency request
    blood_type TEXT NOT NULL,
    units INTEGER DEFAULT 1,
    donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (donor_id) REFERENCES donors(id),
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id),
    FOREIGN KEY (request_id) REFERENCES blood_requests(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donors_blood_type ON donors(blood_type);
CREATE INDEX IF NOT EXISTS idx_donors_city ON donors(city);
CREATE INDEX IF NOT EXISTS idx_donors_available ON donors(available);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON blood_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_type ON blood_inventory(blood_type);
CREATE INDEX IF NOT EXISTS idx_blood_batches_expiry ON blood_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);

