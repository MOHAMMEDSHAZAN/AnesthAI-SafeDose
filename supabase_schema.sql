-- =========================================================================
-- AnesthAI SafeDose Database Schema
-- 
-- Paste this script into the Supabase SQL Editor (https://supabase.com) 
-- to initialize the database tables for Patient Records, Operating Rooms,
-- and Clinical Notifications.
-- =========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------
-- 1. Create Patients Table
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INT,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    weight NUMERIC, -- in kg
    height NUMERIC, -- in cm
    allergies TEXT[] DEFAULT '{}',
    medical_history TEXT[] DEFAULT '{}',
    drug_history TEXT[] DEFAULT '{}',
    asa_score INT CHECK (asa_score BETWEEN 1 AND 5),
    mallampati INT CHECK (mallampati BETWEEN 1 AND 4),
    comorbidities TEXT[] DEFAULT '{}',
    investigations JSONB DEFAULT '{}'::jsonb,
    vitals JSONB DEFAULT '{}'::jsonb,
    anesthesia_plan JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------
-- 2. Create Operating Rooms Table
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS operating_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Idle', 'Emergency')),
    patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
    anesthesiologist TEXT,
    surgery_name TEXT,
    elapsed_time INT DEFAULT 0,
    current_vitals JSONB DEFAULT '{}'::jsonb,
    alert_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------
-- 3. Create Clinical Notifications Table
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'critical')),
    title TEXT NOT NULL,
    message TEXT,
    timestamp TEXT,
    patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------
-- Seed Initial Sample Data (Optional)
-- ----------------------------------------------------
-- Insert sample patients
INSERT INTO patients (id, name, age, gender, weight, height, allergies, medical_history, drug_history, asa_score, mallampati, comorbidities, investigations, vitals, anesthesia_plan)
VALUES 
(
    'P001', 'Robert Miller', 67, 'Male', 84, 178, 
    ARRAY['Penicillin', 'Sulfa Drugs'], 
    ARRAY['Coronary Artery Disease', 'Hypertension', 'Type 2 Diabetes'], 
    ARRAY['Aspirin 81mg', 'Lisinopril 10mg', 'Metformin 500mg'], 
    3, 3, 
    ARRAY['Hypertension', 'CAD'],
    '{"hb": 12.4, "plt": 198, "cr": 1.2, "k": 4.1, "ecg": "Sinus rhythm, Q waves in inferior leads (old infarct)", "echo": "LVEF 45%, mild diastolic dysfunction", "pft": "Mild obstructive pattern", "pregnancy": false, "bloodGroup": "A Positive"}'::jsonb,
    '{"hr": 72, "bpSys": 142, "bpDia": 88, "spo2": 95, "temp": 36.8}'::jsonb,
    '{"recommendation": "General", "confidence": 90, "reasoning": ["Complex laparoscopic prostatectomy requires secure airway protection via endotracheal intubation.", "Length of procedure and steep Trendelenburg position contraindicates regional.", "Patient has high cardiac risk profile requiring controlled hemodynamic monitoring."], "alternatives": ["Combined General-Epidural for post-op analgesia"], "warnings": ["Post-induction hypotension risk due to ACE inhibitors."], "contraindications": ["Spinal anesthesia as sole technique (inadequate procedural time)."]}'::jsonb
),
(
    'P002', 'Sophia Patel', 28, 'Female', 62, 165, 
    ARRAY['Latex'], 
    ARRAY['Mild Intermittent Asthma'], 
    ARRAY['Albuterol Inhaler PRN'], 
    2, 1, 
    ARRAY['Asthma'],
    '{"hb": 13.8, "plt": 250, "cr": 0.7, "k": 4.3, "ecg": "Normal Sinus Rhythm", "echo": "Normal LVEF 60%", "pft": "Within normal limits", "pregnancy": false, "bloodGroup": "O Positive"}'::jsonb,
    '{"hr": 80, "bpSys": 118, "bpDia": 74, "spo2": 99, "temp": 37.0}'::jsonb,
    '{"recommendation": "Spinal", "confidence": 95, "reasoning": ["Elective Cesarean Section is ideal for spinal anesthesia, preserving maternal consciousness.", "Avoids potential airway irritation and bronchospasm from general anesthesia in an asthmatic.", "Excellent post-procedure analgesic profile."], "alternatives": ["Epidural", "General Anesthesia (emergency only)"], "warnings": ["Potential asthma flare-up; keep albuterol available."], "contraindications": ["Refusal", "Coagulopathy."]}'::jsonb
),
(
    'P003', 'Liam Chen', 9, 'Male', 31, 132, 
    ARRAY[]::TEXT[], 
    ARRAY['No significant past medical history'], 
    ARRAY[]::TEXT[], 
    1, 2, 
    ARRAY[]::TEXT[],
    '{"hb": 14.1, "plt": 290, "cr": 0.4, "k": 4.5, "ecg": "Normal Sinus Rhythm for age", "echo": "Unremarkable", "pft": "Not indicated", "pregnancy": false, "bloodGroup": "B Negative"}'::jsonb,
    '{"hr": 95, "bpSys": 104, "bpDia": 62, "spo2": 98, "temp": 36.6}'::jsonb,
    '{"recommendation": "General", "confidence": 98, "reasoning": ["Pediatric patient undergoing tonsillectomy requiring active airway preservation (cuffed ETT or LMA).", "Inhalation induction (sevoflurane/N2O/O2) is highly tolerated."], "alternatives": ["None"], "warnings": ["Laryngospasm risk post-extubation. Extubate fully awake."], "contraindications": ["Scoliosis."]}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample operating rooms
INSERT INTO operating_rooms (id, name, status, patient_id, anesthesiologist, surgery_name, elapsed_time, current_vitals)
VALUES 
('OR-01', 'Operating Room 1', 'Active', 'P001', 'Dr. Sarah Jenkins', 'Laparoscopic Prostatectomy', 45, '{"hr": 74, "bpSys": 138, "bpDia": 82, "spo2": 96, "etco2": 38, "temp": 36.5}'::jsonb),
('OR-02', 'Operating Room 2', 'Active', 'P003', 'Dr. Alex Rivera', 'Tonsillectomy & Adenoidectomy', 15, '{"hr": 98, "bpSys": 102, "bpDia": 60, "spo2": 99, "etco2": 40, "temp": 36.7}'::jsonb),
('OR-03', 'Operating Room 3', 'Idle', NULL, 'Dr. Michael Chang', 'N/A', 0, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (id, type, title, message, timestamp, patient_id, dismissed)
VALUES
('n1', 'warning', 'Penicillin Allergy Alert', 'Patient Robert Miller (P001) has documented severe Penicillin allergy. Avoid beta-lactam antibiotics.', '12:30 PM', 'P001', false),
('n2', 'critical', 'Hypoxia Alarm OR 1', 'OR 1 patient SpO2 dropped below 92% (Currently 89%). Verify ventilation circuit and oxygen delivery.', '12:44 PM', 'P001', false),
('n3', 'info', 'PACU Clearance Requested', 'Sophia Patel (P002) has reached Aldrete score 9/10 and is candidate for discharge to ward.', '12:40 PM', 'P002', false)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------
-- 4. Safety & Quality Tables
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS safety_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id TEXT,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    pre_anesthesia_status TEXT DEFAULT 'not_started',
    machine_check_status TEXT DEFAULT 'not_started',
    pre_induction_status TEXT DEFAULT 'not_started',
    timeout_status TEXT DEFAULT 'not_started',
    intraop_status TEXT DEFAULT 'not_started',
    recovery_status TEXT DEFAULT 'not_started',
    completed_checks INT DEFAULT 0,
    total_checks INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pre_anesthesia_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id TEXT,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    history_reviewed BOOLEAN DEFAULT FALSE,
    clinical_exam_reviewed BOOLEAN DEFAULT FALSE,
    abnormalities_identified BOOLEAN DEFAULT FALSE,
    investigations_reviewed BOOLEAN DEFAULT FALSE,
    findings TEXT,
    plan_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id TEXT,
    primary_oxygen TEXT DEFAULT 'passed',
    backup_oxygen TEXT DEFAULT 'passed',
    leak_test TEXT DEFAULT 'passed',
    ventilator TEXT DEFAULT 'passed',
    emergency_meds TEXT DEFAULT 'passed',
    checked_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anesthesia_incidents (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    preventable TEXT,
    narrative TEXT,
    severity TEXT,
    categories TEXT[] DEFAULT '{}',
    vitals_at_incident JSONB DEFAULT '{}'::jsonb,
    medication_involved BOOLEAN DEFAULT FALSE,
    medication_details JSONB DEFAULT '{}'::jsonb,
    airway_involved BOOLEAN DEFAULT FALSE,
    airway_details JSONB DEFAULT '{}'::jsonb,
    contributing_factors TEXT[] DEFAULT '{}',
    injury_occurred BOOLEAN DEFAULT FALSE,
    injury_details JSONB DEFAULT '{}'::jsonb,
    outcome TEXT,
    followup_status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    role TEXT,
    action TEXT,
    entity TEXT,
    reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

