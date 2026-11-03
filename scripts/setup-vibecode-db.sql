-- 1. Settings Table
CREATE TABLE IF NOT EXISTS vibecode_settings (
    key VARCHAR(100) PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    description TEXT
);

-- Seed base settings
INSERT INTO vibecode_settings (key, value, description)
VALUES 
    ('max_seats', '33', 'Maximum number of participants allowed in bootcamp'),
    ('golden_seats', '8', 'Number of seats qualifying for Google AI Pro bonus')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Coupons Table
CREATE TABLE IF NOT EXISTS vibecode_coupons (
    code VARCHAR(50) PRIMARY KEY,
    discount_pct NUMERIC(5, 2) NOT NULL CHECK (discount_pct >= 0 AND discount_pct <= 100),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INTEGER NOT NULL,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed test and temporal coupons
INSERT INTO vibecode_coupons (code, discount_pct, valid_until, max_uses, current_uses)
VALUES 
    ('ANTIGRAVITY', 100.00, '2026-12-31T23:59:59Z', 5, 0),
    ('CLAU55', 55.00, '2028-12-31T23:59:59Z', 1000, 0)
ON CONFLICT (code) DO NOTHING;

-- 3. Registrations Table
CREATE TABLE IF NOT EXISTS vibecode_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    coupon_code VARCHAR(50) REFERENCES vibecode_coupons(code),
    amount_paid INTEGER,
    mp_preference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 4. Capacity Enforcement Trigger function
CREATE OR REPLACE FUNCTION verify_vibecode_seat_capacity()
RETURNS TRIGGER AS $$
DECLARE
    seats_taken INT;
    max_capacity INT;
BEGIN
    -- Verify when transitioning to 'paid' status
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        -- Count all paid seats
        SELECT COUNT(*) INTO seats_taken FROM vibecode_registrations WHERE status = 'paid';
        SELECT value::INT INTO max_capacity FROM vibecode_settings WHERE key = 'max_seats';
        
        IF seats_taken >= max_capacity THEN
            RAISE EXCEPTION 'Vibecode bootcamp capacity reached (% seats)', max_capacity;
        END IF;
        
        NEW.paid_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid errors on run
DROP TRIGGER IF EXISTS trg_verify_vibecode_seat ON vibecode_registrations;

-- Create trigger
CREATE TRIGGER trg_verify_vibecode_seat
BEFORE UPDATE ON vibecode_registrations
FOR EACH ROW
EXECUTE FUNCTION verify_vibecode_seat_capacity();
