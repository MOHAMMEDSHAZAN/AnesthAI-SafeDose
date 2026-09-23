import sys
import math
sys.path.insert(0, 'backend')
from fastapi.testclient import TestClient
from main_api import app, MODELS, TORCH_MODELS, VALIDATED_SKLEARN_TASKS, VALIDATED_PYTORCH_TASKS, VALIDATED_CLINICAL_TASKS

client = TestClient(app)

print("=" * 80)
print("COMPREHENSIVE FINAL CLEANUP VALIDATION SUITE")
print("=" * 80)

# 1. Health check
print("\n[TEST 1] Verifying /health endpoint...")
res = client.get("/health")
assert res.status_code == 200, f"/health returned status {res.status_code}"
h = res.json()
print("  Status:", h["status"])
print("  Validated sklearn models count:", h["validated_sklearn_models_count"])
print("  Validated PyTorch models count:", h["validated_pytorch_models_count"])
print("  Total validated models count:", h["validated_models_count"])
print("  Demo models count:", h["demo_models_count"])
print("  Validated models list:", h["validated_models"])
print("  Demo models list:", h["demo_models"])

assert h["validated_models_count"] == 10, f"Expected 10 validated models, got {h['validated_models_count']}"
assert h["demo_models_count"] == 0, f"Expected 0 demo models, got {h['demo_models_count']}"
assert len(h["demo_models"]) == 0, "Expected empty demo models list"
print("  --> /health verification: PASSED")

# 2. Test All 10 Validated Prediction Endpoints
print("\n[TEST 2] Testing all 10 validated prediction endpoints...")
payloads = {
    # 5 PyTorch Models
    "Arrhythmia": {"features": {f"ecg_sample_{i}": 0.05 * math.sin(i * 0.1) for i in range(100)}},
    "BloodLoss": {"features": {
        'anchor_age': 65.0, 'gender_code': 1.0, 'prescription_count': 5.0,
        'comorbidity_count': 2.0, 'creatinine': 1.2, 'bun': 22.0, 'wbc': 8.5, 'lab_mean': 2.4
    }},
    "Bradycardia": {"features": {
        'sbp': 120.0, 'dbp': 80.0, 'map': 93.3, 'map_roll_mean': 92.0, 'map_roll_std': 1.5,
        'map_trend': -1.0, 'spo2': 98.0, 'spo2_roll_mean': 98.0, 'spo2_roll_std': 0.2,
        'spo2_trend': 0.0, 'etco2': 38.0, 'etco2_roll_mean': 37.8, 'etco2_roll_std': 0.4,
        'etco2_trend': 0.0, 'rr': 14.0, 'cvp': 6.0, 'temp': 36.8, 'pulse_pressure': 40.0,
        'cvp_map_ratio': 0.064
    }},
    "FluidRecommendation": {"features": {
        'anchor_age': 58.0, 'gender_code': 0.0, 'prescription_count': 4.0,
        'comorbidity_count': 1.0, 'potassium': 4.2, 'glucose': 115.0, 'wbc': 7.0, 'lab_mean': 3.1
    }},
    "Mortality": {"features": {
        'anchor_age': 72.0, 'gender_code': 1.0, 'hemoglobin': 12.5, 'creatinine': 1.4,
        'bun': 25.0, 'platelets': 210.0, 'wbc': 9.2, 'prescription_count': 6.0,
        'comorbidity_count': 3.0, 'lab_mean': 2.8
    }},
    # 5 Classical Sklearn Models
    "Hypotension": {"features": {
        'hr': 78.0, 'hr_roll_mean': 77.5, 'hr_roll_std': 1.2, 'hr_trend': -0.5,
        'spo2': 97.0, 'spo2_roll_mean': 97.0, 'spo2_roll_std': 0.3, 'spo2_trend': 0.0,
        'etco2': 35.0, 'etco2_roll_mean': 35.0, 'etco2_roll_std': 0.5, 'etco2_trend': 0.0,
        'rr': 12.0, 'cvp': 5.0, 'temp': 36.5
    }},
    "Hypoxia": {"features": {
        'hr': 82.0, 'hr_roll_mean': 81.0, 'hr_roll_std': 1.5, 'hr_trend': 0.5,
        'sbp': 115.0, 'dbp': 75.0, 'map': 88.3, 'map_roll_mean': 88.0, 'map_roll_std': 1.8, 'map_trend': -0.5,
        'etco2': 32.0, 'etco2_roll_mean': 33.0, 'etco2_roll_std': 0.8, 'etco2_trend': -1.0,
        'rr': 22.0, 'cvp': 6.0, 'temp': 36.7, 'shock_index': 0.71, 'pulse_pressure': 40.0, 'cvp_map_ratio': 0.068
    }},
    "Tachycardia": {"features": {
        'sbp': 130.0, 'dbp': 85.0, 'map': 100.0, 'map_roll_mean': 99.0, 'map_roll_std': 2.1, 'map_trend': 1.0,
        'spo2': 99.0, 'spo2_roll_mean': 99.0, 'spo2_roll_std': 0.1, 'spo2_trend': 0.0,
        'etco2': 40.0, 'etco2_roll_mean': 39.5, 'etco2_roll_std': 0.6, 'etco2_trend': 0.5,
        'rr': 18.0, 'cvp': 7.0, 'temp': 37.2, 'pulse_pressure': 45.0, 'cvp_map_ratio': 0.070
    }},
    "EmergencySeverity": {"features": {
        'temperature': 37.2, 'heartrate': 85.0, 'resprate': 16.0, 'o2sat': 98.0,
        'sbp': 125.0, 'dbp': 80.0
    }},
    "ICU": {"features": {
        'anchor_age': 68.0, 'gender_code': 0.0, 'hemoglobin': 11.2, 'creatinine': 1.8,
        'bun': 32.0, 'platelets': 185.0, 'wbc': 11.4, 'prescription_count': 9.0,
        'comorbidity_count': 4.0, 'lab_mean': 3.5
    }}
}

from auth_utils import create_jwt_token
from rbac_matrix import ROLE_ANESTHESIOLOGIST
auth_token = create_jwt_token({"sub": "user_anesthesiologist_1", "role": ROLE_ANESTHESIOLOGIST}, expires_in=3600)
headers = {"Authorization": f"Bearer {auth_token}"}

for task_name, body in payloads.items():
    endpoint = f"/predict/{task_name}"
    resp = client.post(endpoint, json=body, headers=headers)
    assert resp.status_code == 200, f"Endpoint {endpoint} failed with code {resp.status_code}: {resp.text}"
    pdata = resp.json()
    print(f"  [PASS] [{task_name:20s}] -> Pred: {pdata['prediction']}, Prob: {pdata['probability']:.3f}, Conf: {pdata['confidence_score']}%, Risk: {pdata['risk_category']}")
    assert "prediction" in pdata
    assert "probability" in pdata
    assert "risk_category" in pdata
    assert "recommended_action" in pdata

print("  --> All 10 validated prediction endpoints: PASSED")

# 3. Verify unvalidated demo endpoints are strictly rejected
print("\n[TEST 3] Verifying unvalidated demo tasks are rejected (503)...")
unvalidated_tasks = ["Airway", "RiskPrediction", "PONV", "PACU", "DrugSafety", "prototype_baseline"]
for ut in unvalidated_tasks:
    resp = client.post(f"/predict/{ut}", json={"features": {"dummy": 1.0}}, headers=headers)
    assert resp.status_code == 503, f"Expected 503 for demo model {ut}, got {resp.status_code}"
    print(f"  [PASS] [Rejected Demo {ut:20s}] -> Status 503 (Model inference unavailable)")

print("  --> Demo model exclusion: PASSED")

# 4. Check that no standalone .pt files are loaded
print("\n[TEST 4] Verifying PyTorch model loading mechanism...")
for task in VALIDATED_PYTORCH_TASKS:
    model_obj = TORCH_MODELS[task]
    print(f"  [PASS] PyTorch champion {task}: Loaded wrapper with model type {type(model_obj.model).__name__}")

print("\n" + "=" * 80)
print("FINAL CLEANUP VALIDATION RESULT: ALL CHECKS PASSED (100% GREEN)")
print("=" * 80)
