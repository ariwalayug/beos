-- BEOS Production PostgreSQL Schema
-- Optimized for high concurrency (10k+ requests)

-- ==========================================
-- USERS & AUTHENTICATION
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'hospital', 'blood_bank', 'donor', 'government')),
    phone VARCHAR(20),
    sms_consent BOOLEAN DEFAULT FALSE,
    sms_consent_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);

-- ==========================================
-- DONORS
-- ==========================================
CREATE TABLE IF NOT EXISTS donors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    available BOOLEAN DEFAULT TRUE,
    last_donation DATE,
    total_donations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donors_blood_type ON donors(blood_type);
CREATE INDEX idx_donors_available ON donors(available);
CREATE INDEX idx_donors_city ON donors(city);
CREATE INDEX idx_donors_blood_city ON donors(blood_type, city, available);
CREATE INDEX idx_donors_phone ON donors(phone);

-- ==========================================
-- HOSPITALS
-- ==========================================
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_verified ON hospitals(is_verified);

-- ==========================================
-- BLOOD BANKS
-- ==========================================
CREATE TABLE IF NOT EXISTS blood_banks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blood_banks_city ON blood_banks(city);

-- ==========================================
-- BLOOD INVENTORY
-- ==========================================
CREATE TABLE IF NOT EXISTS blood_inventory (
    id SERIAL PRIMARY KEY,
    blood_bank_id INTEGER NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
    blood_type VARCHAR(5) NOT NULL,
    units INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blood_bank_id, blood_type)
);

CREATE INDEX idx_inventory_blood_bank ON blood_inventory(blood_bank_id);
CREATE INDEX idx_inventory_type ON blood_inventory(blood_type);

-- ==========================================
-- BLOOD BATCHES (Expiry Tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS blood_batches (
    id SERIAL PRIMARY KEY,
    blood_bank_id INTEGER NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
    blood_type VARCHAR(5) NOT NULL,
    units INTEGER NOT NULL,
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(50),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batches_blood_bank ON blood_batches(blood_bank_id);
CREATE INDEX idx_batches_expiry ON blood_batches(expiry_date);
CREATE INDEX idx_batches_type ON blood_batches(blood_type);

-- ==========================================
-- BLOOD REQUESTS (Critical Table)
-- ==========================================
CREATE TABLE IF NOT EXISTS blood_requests (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
    donor_id INTEGER REFERENCES donors(id) ON DELETE SET NULL,
    
    -- Patient Info (encrypted in production)
    patient_name VARCHAR(255),
    patient_name_hash VARCHAR(64),  -- For retention policy
    age INTEGER,
    gender VARCHAR(20),
    
    -- Medical Details
    blood_type VARCHAR(5) NOT NULL,
    units INTEGER DEFAULT 1,
    component_type VARCHAR(50) DEFAULT 'Whole Blood',
    hemoglobin DECIMAL(4, 2),
    platelets INTEGER,
    diagnosis TEXT,
    past_reaction TEXT,
    allergies TEXT,
    doctor_name VARCHAR(255),
    
    -- Status & Urgency
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'fulfilled', 'cancelled', 'expired')),
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'critical')),
    is_critical BOOLEAN DEFAULT FALSE,
    
    -- Contact
    contact_phone VARCHAR(20),
    notes TEXT,
    
    -- SMS Tracking
    sms_source BOOLEAN DEFAULT FALSE,
    sms_request_id VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    matched_at TIMESTAMP,
    fulfilled_at TIMESTAMP,
    expires_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Critical indexes for high-concurrency queries
CREATE INDEX idx_requests_status ON blood_requests(status);
CREATE INDEX idx_requests_urgency ON blood_requests(urgency);
CREATE INDEX idx_requests_status_urgency ON blood_requests(status, urgency);
CREATE INDEX idx_requests_hospital ON blood_requests(hospital_id);
CREATE INDEX idx_requests_blood_type ON blood_requests(blood_type);
CREATE INDEX idx_requests_created ON blood_requests(created_at DESC);
CREATE INDEX idx_requests_critical ON blood_requests(status, urgency) WHERE urgency = 'critical' AND status = 'pending';

-- ==========================================
-- DONATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    blood_bank_id INTEGER REFERENCES blood_banks(id) ON DELETE SET NULL,
    request_id INTEGER REFERENCES blood_requests(id) ON DELETE SET NULL,
    blood_type VARCHAR(5) NOT NULL,
    units INTEGER DEFAULT 1,
    donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_request ON donations(request_id);

-- ==========================================
-- SMS QUEUE (Outbox Pattern)
-- ==========================================
CREATE TABLE IF NOT EXISTS sms_queue (
    id SERIAL PRIMARY KEY,
    to_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    error_message TEXT,
    related_request_id INTEGER REFERENCES blood_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sms_status ON sms_queue(status, scheduled_at);
CREATE INDEX idx_sms_priority ON sms_queue(priority DESC, scheduled_at);

-- ==========================================
-- AUDIT LOGS (Compliance)
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    changes JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON donors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_blood_banks_updated_at BEFORE UPDATE ON blood_banks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_blood_requests_updated_at BEFORE UPDATE ON blood_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- DATA RETENTION POLICY (HIPAA/GDPR)
-- ==========================================

-- Anonymize patient data after 90 days (run via cron)
-- SELECT anonymize_old_requests();
CREATE OR REPLACE FUNCTION anonymize_old_requests()
RETURNS void AS $$
BEGIN
    UPDATE blood_requests
    SET 
        patient_name = NULL,
        contact_phone = NULL,
        diagnosis = NULL,
        allergies = NULL
    WHERE status = 'fulfilled'
      AND fulfilled_at < NOW() - INTERVAL '90 days'
      AND patient_name IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
