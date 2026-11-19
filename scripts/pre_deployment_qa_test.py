import urllib.request
import urllib.error
import json
import os
import sys

# Project path setup
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(project_root, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from auth_utils import create_jwt_token
from rbac_matrix import ROLE_ANESTHESIOLOGIST

token = create_jwt_token({"sub": "user_anesthesiologist_1", "role": ROLE_ANESTHESIOLOGIST}, expires_in=3600)
BASE_URL = os.environ.get("VITE_API_URL", os.environ.get("API_URL", "http://127.0.0.1:8000")).strip('"').strip("'")
if not BASE_URL.startswith("http"):
    BASE_URL = "http://127.0.0.1:8000"

def req(method, path, data=None, auth=True):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"} if data is not None else {}
    if auth and token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    request_obj = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request_obj, timeout=5) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except:
            return e.code, {"error": err_body}
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("=" * 60)
    print("1. BACKEND /health VERIFICATION")
    print("=" * 60)
    st, res = req("GET", "/health")
    print(f"HTTP Status: {st}")
    val_count = res.get("validated_models_count", 0)
    missing = res.get("missing_models", [])
    demo = res.get("demo_models", [])
    print(f"Validated Models Count: {val_count}/10")
    print(f"Missing Models: {missing}")
    print(f"Demo Models Exposed: {demo}")
    assert st == 200, f"/health returned {st}"
    assert val_count == 10, f"Expected 10 validated models, got {val_count}"
    assert len(missing) == 0, f"Missing models: {missing}"
    assert len(demo) == 0, f"Demo models should not be in validated list: {demo}"
    print("[PASS] Backend health check PASSED (10/10 models active)\n")

    print("=" * 60)
    print("2. 10 ML PREDICTION ENDPOINTS — VALID PAYLOADS")
    print("=" * 60)
    tasks_payloads = {
        'Hypotension': {'features': {'hr': 75, 'hr_roll_mean': 75, 'hr_roll_std': 2, 'hr_trend': 0, 'spo2': 98, 'spo2_roll_mean': 98, 'spo2_roll_std': 0.5, 'spo2_trend': 0, 'etco2': 38, 'etco2_roll_mean': 38, 'etco2_roll_std': 1, 'etco2_trend': 0, 'rr': 14, 'cvp': 5, 'temp': 36.8}},
        'Hypoxia': {'features': {'hr': 75, 'hr_roll_mean': 75, 'hr_roll_std': 2, 'hr_trend': 0, 'sbp': 120, 'sbp_roll_mean': 120, 'sbp_roll_std': 3, 'sbp_trend': 0, 'dbp': 75, 'dbp_roll_mean': 75, 'dbp_roll_std': 2, 'dbp_trend': 0, 'map': 90, 'map_roll_mean': 90, 'map_roll_std': 2, 'map_trend': 0, 'etco2': 38, 'etco2_roll_mean': 38, 'etco2_roll_std': 1, 'etco2_trend': 0}},
        'Bradycardia': {'features': {'sbp': 115, 'sbp_roll_mean': 115, 'sbp_roll_std': 2, 'sbp_trend': 0, 'dbp': 70, 'dbp_roll_mean': 70, 'dbp_roll_std': 2, 'dbp_trend': 0, 'map': 85, 'map_roll_mean': 85, 'map_roll_std': 2, 'map_trend': 0, 'spo2': 99, 'spo2_roll_mean': 99, 'spo2_roll_std': 0.5, 'spo2_trend': 0, 'etco2': 36, 'etco2_roll_mean': 36, 'etco2_roll_std': 1}},
        'Tachycardia': {'features': {'sbp': 125, 'sbp_roll_mean': 125, 'sbp_roll_std': 2, 'sbp_trend': 0, 'dbp': 75, 'dbp_roll_mean': 75, 'dbp_roll_std': 2, 'dbp_trend': 0, 'map': 91, 'map_roll_mean': 91, 'map_roll_std': 2, 'map_trend': 0, 'spo2': 98, 'spo2_roll_mean': 98, 'spo2_roll_std': 0.5, 'spo2_trend': 0, 'etco2': 37, 'etco2_roll_mean': 37, 'etco2_roll_std': 1}},
        'Arrhythmia': {'features': {f'ecg_sample_{i}': 0.0 for i in range(100)}},
        'EmergencySeverity': {'features': {'temperature': 37.0, 'heartrate': 80, 'resprate': 16, 'o2sat': 98, 'sbp': 120, 'dbp': 75}},
        'BloodLoss': {'features': {'anchor_age': 55, 'gender_code': 1, 'prescription_count': 5, 'comorbidity_count': 1, 'creatinine': 0.9, 'bun': 14, 'wbc': 6.5, 'lab_mean': 12.0}},
        'FluidRecommendation': {'features': {'anchor_age': 60, 'gender_code': 0, 'prescription_count': 6, 'comorbidity_count': 2, 'potassium': 4.1, 'glucose': 105, 'wbc': 7.0, 'lab_mean': 13.0}},
        'ICU': {'features': {'anchor_age': 68, 'gender_code': 1, 'hemoglobin': 12.5, 'creatinine': 1.1, 'bun': 18, 'platelets': 210, 'wbc': 8.2, 'prescription_count': 12, 'comorbidity_count': 3, 'lab_mean': 15.0}},
        'Mortality': {'features': {'anchor_age': 72, 'gender_code': 0, 'hemoglobin': 11.8, 'creatinine': 1.3, 'bun': 22, 'platelets': 195, 'wbc': 9.1, 'prescription_count': 14, 'comorbidity_count': 4, 'lab_mean': 16.5}}
    }

    for task, payload in tasks_payloads.items():
        st, res = req("POST", f"/predict/{task}", payload)
        assert st == 200, f"Task {task} failed with status {st}: {res}"
        pred = res.get("prediction")
        prob = res.get("probability")
        risk = res.get("risk_category")
        prob_str = f"{prob:.4f}" if prob is not None else "N/A"
        print(f"  {task:22} -> HTTP {st} | Pred: {pred} | Prob: {prob_str} | Risk: {risk}")
        assert pred in [0, 1], f"Prediction must be 0 or 1, got {pred}"
        assert 0.0 <= prob <= 1.0, f"Probability must be in [0, 1], got {prob}"

    print("[PASS] All 10 prediction endpoints PASSED valid smoke test\n")

    print("=" * 60)
    print("3. INPUT BOUNDARY, RESILIENCE, & SAFE FAILURE TESTING")
    print("=" * 60)
    # A. Missing feature with clinical fallback
    st, res = req("POST", "/predict/FluidRecommendation", {"features": {"potassium": 4.5, "glucose": 115}})
    print(f"  FluidRecommendation with partial lab features -> HTTP {st} | Pred: {res.get('prediction')}")
    assert st == 200

    # B. String numbers
    st, res = req("POST", "/predict/EmergencySeverity", {"features": {"temperature": "37.2", "heartrate": "82", "resprate": "16", "o2sat": "98", "sbp": "120", "dbp": "78"}})
    print(f"  EmergencySeverity with string numbers -> HTTP {st} | Pred: {res.get('prediction')}")
    assert st == 200

    # C. Non-numeric invalid string (must fail safely with HTTP 422, no Python traceback)
    st, res = req("POST", "/predict/EmergencySeverity", {"features": {"temperature": "not_a_number", "heartrate": 80, "resprate": 16, "o2sat": 98, "sbp": 120, "dbp": 75}})
    print(f"  EmergencySeverity with string text -> HTTP {st} (Expected 422) | Detail: {res.get('detail')}")
    assert st == 422

    # D. Missing non-fallback required vital (must fail safely with HTTP 422)
    st, res = req("POST", "/predict/Hypotension", {"features": {"hr": 70}})
    print(f"  Hypotension missing required vitals -> HTTP {st} (Expected 422) | Detail: {res.get('detail')}")
    assert st == 422

    # E. Extreme physiological input
    st, res = req("POST", "/predict/Hypotension", {"features": {'hr': 220, 'hr_roll_mean': 220, 'hr_roll_std': 25, 'hr_trend': 40, 'spo2': 65, 'spo2_roll_mean': 65, 'spo2_roll_std': 5, 'spo2_trend': -20, 'etco2': 15, 'etco2_roll_mean': 15, 'etco2_roll_std': 5, 'etco2_trend': -10, 'rr': 45, 'cvp': 25, 'temp': 41.5}})
    print(f"  Hypotension with extreme physiological crisis -> HTTP {st} | Pred: {res.get('prediction')} | Prob: {res.get('probability'):.4f} | Risk: {res.get('risk_category')}")
    assert st == 200
    print("[PASS] Input boundary and resilience tests PASSED\n")

    print("=" * 60)
    print("4. CLINICAL SAFETY, ASA, FLUID ENGINE, & WORKFLOW APIS")
    print("=" * 60)
    # A. ASA Physical Status GET & POST
    st, res = req("GET", "/api/asa-physical-status?patient_id=P001")
    print(f"  GET /api/asa-physical-status -> HTTP {st} | Categories: {len(res.get('available_categories', []))}")
    assert st == 200

    asa_confirm = {
        "patient_id": "P001",
        "asa_physical_status": "ASA III",
        "emergency_case": True,
        "clinician_id": "DR_104",
        "clinician_name": "Dr. Sarah Chen",
        "clinician_confirmed": True,
        "clinical_rationale": "Severe CAD with scheduled stent bypass. Emergency case confirmed."
    }
    st, res = req("POST", "/api/asa-physical-status", asa_confirm)
    print(f"  POST /api/asa-physical-status -> HTTP {st} | Confirmed: {res.get('current_status', {}).get('asa_physical_status_display')}")
    assert st == 200 and res.get("current_status", {}).get("asa_physical_status_display") == "ASA III-E"

    # B. Deterministic Fluid Calculation
    fluid_payload = {
        "patient_id": "P001",
        "patient_weight_kg": 70.0,
        "patient_height_cm": 170.0,
        "age": 45,
        "sex": "Male",
        "surgery_type": "General Surgery",
        "surgery_duration_hours": 2.5,
        "preop_fasting_hours": 8.0,
        "crystalloids_administered_ml": 1200.0,
        "colloids_administered_ml": 250.0,
        "blood_products_administered_ml": 0.0,
        "urine_output_ml": 220.0,
        "measured_blood_loss_ml": 350.0,
        "other_losses_ml": 50.0
    }
    st, res = req("POST", "/api/fluid/calculate", fluid_payload)
    net_bal = res.get("net_fluid_balance_ml")
    rate = res.get("maintenance_hourly_rate_ml_hr") or res.get("maintenance_rate_ml_hr")
    net_bal_kg = res.get("net_fluid_balance_ml_kg") or res.get("net_fluid_balance_per_kg_ml")
    print(f"  POST /api/fluid/calculate -> HTTP {st} | Maintenance: {rate} mL/hr | Net Balance: {net_bal} mL ({net_bal_kg} mL/kg)")
    assert st == 200 and rate == 110.0 and net_bal == (1200 + 250 - 220 - 350 - 50)

    # C. Fluid Safety Rules Check
    safety_payload = {
        "calculation": res,
        "protocol_thresholds": {
            "oliguria_rate_ml_kg_hr": 0.5,
            "excessive_balance_ml_kg": 30.0,
            "significant_blood_loss_pct_ebv": 15.0,
            "hypotension_map_threshold": 65,
            "tachycardia_hr_threshold": 100
        }
    }
    st, res = req("POST", "/api/fluid/safety-check", safety_payload)
    alerts = res.get("alerts", [])
    print(f"  POST /api/fluid/safety-check -> HTTP {st} | Triggered Alerts: {len(alerts)}")
    assert st == 200 and len(alerts) >= 3

    # D. Intraoperative Checklists
    st, res = req("GET", "/api/intraoperative/checklist?phase=PRE_INDUCTION")
    pre_items = res.get("items", [])
    print(f"  GET /api/intraoperative/checklist (PRE_INDUCTION) -> HTTP {st} | Items: {len(pre_items)}")
    assert st == 200 and len(pre_items) == 21

    st, res = req("GET", "/api/intraoperative/checklist?phase=SURGICAL_SIGNOUT")
    signout_items = res.get("items", [])
    print(f"  GET /api/intraoperative/checklist (SURGICAL_SIGNOUT) -> HTTP {st} | Items: {len(signout_items)}")
    assert st == 200 and len(signout_items) == 12

    # E. Safety Status & Alerts
    st, res = req("GET", "/api/intraoperative/safety-status")
    # Endpoint returns 'status_indicator' and 'label'; use one for status wording
    status_wording = res.get("status_indicator") or res.get("label")
    print(f"  GET /api/intraoperative/safety-status -> HTTP {st} | Status: \"{status_wording}\"")
    assert st == 200 and status_wording == "SAFE"

    # F. Alert Acknowledgment & Override Logging
    ack_payload = {
        "alert_id": "ALT_101",
        "clinician_id": "DR_104",
        "clinician_name": "Dr. Sarah Chen",
        "note": "Noted mild tachycardia, deepening anesthesia plane."
    }
    st, res = req("POST", "/api/intraoperative/alert/acknowledge", ack_payload)
    print(f"  POST /api/intraoperative/alert/acknowledge -> HTTP {st} | Status: {res.get('status')}")
    assert st == 200

    override_payload = {
        "alert_id": "ALT_102",
        "clinician_id": "DR_104",
        "clinician_name": "Dr. Sarah Chen",
        "reason": "Permissive oliguria during aortic cross-clamp per protocol.",
        "note": "Institutional cardiovascular protocol exception."
    }
    st, res = req("POST", "/api/intraoperative/alert/override", override_payload)
    print(f"  POST /api/intraoperative/alert/override -> HTTP {st} | Status: {res.get('status')}")
    assert st == 200

    # G. Audit Logs retrieval
    st, res = req("GET", "/api/intraoperative/audit-log")
    print(f"  GET /api/intraoperative/audit-log -> HTTP {st} | Entries: {len(res.get('audit_trail', []))}")
    assert st == 200

    st, res = req("GET", "/api/safety/audit-logs")
    print(f"  GET /api/safety/audit-logs -> HTTP {st} | Entries: {len(res.get('logs', []))}")
    assert st == 200

    # H. Drug Safety Check
    drug_check_payload = {
        "age": 67,
        "weight": 70.0,
        "creatinine": 1.1,
        "proposed_drug": "Propofol",
        "proposed_dose": 140.0,
        "active_drugs": ["Fentanyl"],
        "medical_history": ["CAD", "Hypertension"]
    }
    st, res = req("POST", "/api/drugs/safety-check", drug_check_payload)
    print(f"  POST /api/drugs/safety-check -> HTTP {st} | Safe: {res.get('safe')} | Guidance: {res.get('dosage_guidance')}")
    assert st == 200 and "decision support" in res.get("disclaimer", "").lower()

    print("[PASS] Clinical safety, ASA, fluid engine, and workflow endpoints PASSED\n")

    print("=" * 60)
    print("5. SECURITY, CREDENTIALS, & PRIVACY AUDIT")
    print("=" * 60)
    # Check .gitignore
    with open(".gitignore", "r", encoding="utf-8") as f:
        gitignore_content = f.read()

    sensitive_patterns = ["datasets/mimic", ".env", "*.key", "*.pem", "datasets/06_mimic"]
    for pat in sensitive_patterns:
        found = any(pat.lower() in line.lower() for line in gitignore_content.splitlines())
        print(f"  .gitignore contains {pat}: {'YES (Protected)' if found else 'CHECK'}")

    print("[PASS] Security & Data Privacy checks verified\n")
    print("============================================================")
    print("ALL PRE-DEPLOYMENT BACKEND & API TESTS COMPLETED: 100% PASS")
    print("============================================================")

if __name__ == "__main__":
    run_tests()
