# API Endpoints Catalog

All endpoints are hosted under `/api` or `/predict`.

## 1. Clinical Calculation Endpoints (`backend/clinical_safety.py`)
- `POST /api/safety/fluid-calculate`
  - **Payload:** `weight_kg`, `duration_hours`, `fasting_hours`, `blood_loss_ml`, `trauma_degree`.
  - **Response:** Holliday-Segar hourly maintenance (`ml/hr`), fasting fluid deficit (`ml`), surgical trauma fluid (`ml/hr`), allowable blood loss (`ml`), total fluid recommendation (`ml`).
- `POST /api/safety/fluid-safety-check`
  - **Payload:** `hourly_rate_ml_hr`, `weight_kg`.
  - **Response:** `safe: boolean`, `status: str`, `warning: str` (triggers warning if infusion exceeds $4\times$ maintenance).
- `GET /api/safety/checklists?phase={PRE_INDUCTION|TIME_OUT|POST_PROCEDURE}`
  - **Response:** Active WHO surgical checklist items.
- `POST /api/safety/checklists`
  - **Payload:** Checklist completion acknowledgments with clinician ID.
- `POST /api/safety/alerts/acknowledge`
  - **Payload:** `alert_id`, `clinician_id`, `action_taken`.
- `POST /api/safety/alerts/override`
  - **Payload:** `alert_id`, `clinician_id`, `justification`, `timestamp`.
- `GET /api/safety/audit-logs`
  - **Response:** Complete audit trail of system events, overrides, and logins.

## 2. Machine Learning Inference Endpoints (`backend/main_api.py`)
- `POST /predict/hypotension`
  - **Payload:** Hemodynamic feature vector (`hr_mean`, `map_mean`, `sbp_mean`, `dbp_mean`, etc.).
  - **Response:** `risk_score` (probability), `alert_threshold` (0.500), `flag: boolean`, `model: LightGBM`.
- `POST /predict/tachycardia`
  - **Payload:** Hemodynamic feature vector.
  - **Response:** `risk_score`, `alert_threshold` (0.250), `flag: boolean`.
- `POST /predict/hypoxia`
  - **Payload:** Oxygenation feature vector (`spo2_mean`, `spo2_min`, etc.).
  - **Response:** `risk_score`, `alert_threshold` (0.825), `flag: boolean`.
- `POST /predict/arrhythmia`
  - **Payload:** R-R interval metrics, morphological ECG features.
  - **Response:** `arrhythmia_probability`, `threshold` (0.220), `flag: boolean`.
- `POST /predict/{experimental_model}`
  - **Response:** `503 Service Unavailable` with message: *"Model endpoint disabled: experimental baseline retained for audit documentation only."*
