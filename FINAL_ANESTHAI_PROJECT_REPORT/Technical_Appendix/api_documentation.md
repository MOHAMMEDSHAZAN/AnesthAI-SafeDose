# API DOCUMENTATION — AnesthAI SafeDose
## Technical Appendix: Verified API Endpoints

**Base URL (Development):** `http://localhost:8000`  
**Framework:** FastAPI (Python)  
**Authentication:** JWT Bearer Token (HS256)  
**Audit:** All write operations logged to `audit_logs.json`

---

## AUTHENTICATION ENDPOINTS

### POST `/api/auth/break-glass`
Initiates a break-glass emergency access session with elevated clinical permissions.

**Request Body:**
```json
{
  "clinician_id": "string",
  "patient_id": "string",
  "reason": "string (minimum 10 characters)",
  "auth_method": "string"
}
```

**Response (200 OK):**
```json
{
  "status": "granted",
  "session_token": "JWT_TOKEN",
  "expires_in_seconds": 14400,
  "audit_id": "string"
}
```

**Error Responses:**
- `400 Bad Request` — Reason shorter than 10 characters
- `401 Unauthorized` — Invalid credentials

**Source:** `backend/main_api.py:2193–2330`

---

### POST `/api/emergency/break-glass`
Alternative emergency break-glass endpoint (second access path).

**Source:** `backend/main_api.py:2294`

---

## PREDICTION ENDPOINTS

### POST `/predict/{model_name}`
Runs a clinical prediction model by name.

**URL Parameters:**
- `model_name` — One of: `arrhythmia`, `hypotension`, `hypoxia`, `tachycardia`, `bradycardia`, `emergency_severity`

**Active Models (HTTP 200):** arrhythmia, hypotension, hypoxia, tachycardia, bradycardia, emergency_severity

**Staging Models (HTTP 503):** pacu, ponv, icu, mortality, blood_loss, risk

**Request Body:**
```json
{
  "features": {
    "hr": 85.0,
    "map": 72.0,
    "sbp": 120.0,
    "dbp": 80.0,
    "spo2": 98.0,
    "rr": 14.0,
    "etco2": 35.0
  },
  "patient_id": "string",
  "clinician_id": "string"
}
```

**Response (200 OK):**
```json
{
  "task": "hypotension",
  "probability": 0.342,
  "threshold": 0.500,
  "prediction": "negative",
  "model_version": "1.0",
  "disclaimer": "This is an advisory estimate. Clinical judgment required."
}
```

**Response (503 Service Unavailable — Staging Models):**
```json
{
  "detail": "Model 'pacu' is currently in clinical validation staging."
}
```

**Source:** `backend/main_api.py:526–540`

---

## CLINICAL SAFETY ENDPOINTS

### POST `/api/safety/fluid-calculate`
Calculates fluid balance, maintenance requirements, and clinical alerts.

**Request Body:**
```json
{
  "patient_weight_kg": 70.0,
  "sex": "M",
  "age_years": 45,
  "npo_hours": 8.0,
  "fluid_input_ml": 500.0,
  "urine_output_ml": 150.0,
  "blood_loss_ml": 200.0,
  "drain_output_ml": 0.0,
  "other_loss_ml": 0.0,
  "duration_hours": 2.0,
  "hypotension_map_threshold": 65.0,
  "fluid_overload_threshold_ml_kg": 30.0,
  "oliguria_threshold_ml_kg_hr": 0.5,
  "significant_blood_loss_pct_ebv": 15.0
}
```

**Response (200 OK):**
```json
{
  "net_balance_ml": 150.0,
  "hourly_maintenance_ml_hr": 110.0,
  "daily_maintenance_ml": 2640.0,
  "npo_deficit_ml": 880.0,
  "estimated_blood_volume_ml": 4900.0,
  "blood_loss_pct_ebv": 4.08,
  "atls_hemorrhage_class": "Class I (<15%)",
  "net_balance_ml_kg": 2.14,
  "urine_output_ml_hr_kg": 1.07,
  "alerts": [],
  "clinical_disclaimer": "Safety rules evaluated against configured institutional protocol thresholds. Decision requires clinician review."
}
```

**Source:** `backend/clinical_safety.py:427`

---

### POST `/api/drugs/safety-check`
Checks a drug against patient creatinine and known contraindications.

**Request Body:**
```json
{
  "drug_name": "ketorolac",
  "patient_cr": 1.8,
  "patient_id": "string"
}
```

**Response (200 OK):**
```json
{
  "drug": "ketorolac",
  "alerts": [
    "Renal contraindication: NSAIDs contraindicated with Cr > 1.5 mg/dL"
  ],
  "safe_to_proceed": false
}
```

**Source:** `backend/main_api.py:1486`

---

## AUDIT LOG ENDPOINTS

### GET `/api/safety/audit-logs`
Retrieves the current audit event log.

**Response (200 OK):**
```json
{
  "logs": [
    {
      "timestamp": "2026-11-06T12:00:00Z",
      "action": "BREAK_GLASS_ACCESS",
      "user_id": "clinician_001",
      "clinician_id": "clinician_001",
      "patient_id": "patient_123",
      "reason": "Emergency intraoperative crisis requiring urgent medication review",
      "ip_address": "192.168.1.100",
      "auth_method": "break-glass"
    }
  ],
  "count": 1
}
```

### POST `/api/safety/audit-logs`
Appends a new audit entry.

**Source:** `backend/main_api.py:1728–1737`

---

## ASA STATUS ENDPOINTS

### GET `/api/asa-physical-status`
Returns the current ASA Physical Status for the active patient.

**Source:** `backend/clinical_safety.py:483`

### POST `/api/asa-physical-status`
Confirms the clinician-verified ASA Physical Status.

**Request Body:**
```json
{
  "asa_physical_status": "III",
  "emergency_case": false,
  "clinician_confirmed": true,
  "clinician_name": "Dr. Smith",
  "clinician_id": "DR001",
  "patient_id": "PAT123",
  "notes": "Stable COPD, well-controlled"
}
```

**Source:** `backend/clinical_safety.py:495`

---

## CLINICAL SAFETY RULES (Thresholds)

| Parameter | Default Threshold | Source Line |
|---|---|---|
| MAP (hypotension) | <65.0 mmHg | clinical_safety.py:348 |
| Heart Rate (tachycardia) | >100 bpm | clinical_safety.py:405 |
| Fluid balance (overload) | >30.0 mL/kg | clinical_safety.py:328 |
| Urine output (oliguria) | <0.5 mL/kg/h | clinical_safety.py:327 |
| Blood loss (significant) | >15.0% of EBV | clinical_safety.py:333 |
| Creatinine (renal warning) | >1.5 mg/dL | main_api.py:1510 |
| Renal-contraindicated drugs | Ketorolac, Ibuprofen, Sevoflurane (prolonged) | main_api.py:1511–1517 |

---

## DISCLAIMER

> All API endpoints in this system return advisory information only. No endpoint autonomously administers medication, fluids, anesthesia, or ventilation adjustments. All outputs require review and verification by qualified clinical personnel before any action is taken.
>
> This is an academic research prototype and is not a registered medical device. It has not been externally validated for clinical use.

