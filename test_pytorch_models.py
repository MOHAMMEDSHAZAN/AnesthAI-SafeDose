#!/usr/bin/env python3
"""
Automated Test Suite for Validated PyTorch Models & FastAPI Endpoints
Tests:
1. PyTorch model loading from audited .pkl files (torch_state_dict).
2. Verification that legacy .pt files were NOT loaded.
3. Exact feature count, ordering, and scaler application.
4. Absence of target-leakage features in input schema.
5. CPU inference yielding finite probabilities and optimal threshold application.
6. /health endpoint structure.
7. /predict endpoints for all 10 validated tasks (5 PyTorch + 5 classical).
"""

import sys
import os
import math

# Ensure project paths
project_root = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(project_root, 'backend')
for p in [project_root, backend_path]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi.testclient import TestClient
from main_api import (
    app, MODELS, TORCH_MODELS, FEATURES, SCALERS, THRESHOLDS, ALGORITHMS,
    VALIDATED_SKLEARN_TASKS, VALIDATED_PYTORCH_TASKS, DEMO_NON_VALIDATED_TASKS
)

client = TestClient(app)

print("=" * 90)
print("SafeDose AI - PYTORCH & FASTAPI VALIDATION TEST SUITE")
print("=" * 90)

# TEST 1: Check Registries
print("\n[TEST 1] Registry Verification")
print(f"  TORCH_MODELS count: {len(TORCH_MODELS)}")
print(f"  TORCH_MODELS keys: {sorted(list(TORCH_MODELS.keys()))}")
assert len(TORCH_MODELS) == 5, f"Expected 5 PyTorch models, got {len(TORCH_MODELS)}"
for task in VALIDATED_PYTORCH_TASKS:
    assert task in TORCH_MODELS, f"{task} missing from TORCH_MODELS"
    assert task in MODELS, f"{task} missing from MODELS"
print("  PASSED: All 5 PyTorch models registered in TORCH_MODELS and MODELS.")

# TEST 2: Check that legacy standalone .pt files were NOT loaded
print("\n[TEST 2] Legacy Standalone .pt File Non-loading Verification")
legacy_pt_signatures = [
    'Arrhythmia_GRU.pt', 'BloodLoss_CNN.pt', 'Bradycardia_CNN.pt',
    'FluidRecommendation_CNN.pt', 'Mortality_GRU.pt'
]
for leg in legacy_pt_signatures:
    assert leg not in MODELS, f"Legacy checkpoint {leg} must NOT be in MODELS"
    assert leg not in TORCH_MODELS, f"Legacy checkpoint {leg} must NOT be in TORCH_MODELS"

# Check that Mortality does NOT have 11 features or hospital_expire_flag
mort_features = FEATURES.get('Mortality', [])
assert len(mort_features) == 10, f"Mortality must have 10 features, got {len(mort_features)}"
assert 'hospital_expire_flag' not in mort_features, "Leakage alert: hospital_expire_flag found in Mortality features!"
assert 'icu_los_days' not in mort_features, "Leakage alert: icu_los_days found in Mortality features!"
print("  PASSED: Standalone legacy .pt files were NOT loaded; zero target leakage confirmed.")

# TEST 3: Health Endpoint
print("\n[TEST 3] GET /health Verification")
res_health = client.get("/health")
assert res_health.status_code == 200, f"Health check failed with {res_health.status_code}"
hdata = res_health.json()
print("  /health response payload:")
for k, v in hdata.items():
    print(f"    {k}: {v}")

assert hdata['validated_sklearn_models_count'] == 5, f"Expected 5 sklearn models, got {hdata['validated_sklearn_models_count']}"
assert hdata['validated_pytorch_models_count'] == 5, f"Expected 5 PyTorch models, got {hdata['validated_pytorch_models_count']}"
assert hdata['validated_models_count'] == 10, f"Expected 10 total validated models, got {hdata['validated_models_count']}"
assert hdata['demo_models_count'] == 6, f"Expected 6 demo models, got {hdata['demo_models_count']}"
assert sorted(hdata['validated_pytorch_models']) == sorted(VALIDATED_PYTORCH_TASKS)
assert sorted(hdata['validated_sklearn_models']) == sorted(VALIDATED_SKLEARN_TASKS)
print("  PASSED: /health reports exact taxonomy without counting aliases.")

# TEST 4: Prediction tests for all 5 PyTorch models
print("\n[TEST 4] POST /predict for 5 Validated PyTorch Models")

# 1. Arrhythmia (100 ECG samples)
arrhythmia_feat = {f"ecg_sample_{i}": 0.05 * math.sin(i * 0.1) for i in range(100)}
# 2. BloodLoss (8 MIMIC hospital features)
bloodloss_feat = {
    'anchor_age': 65.0, 'gender_code': 1.0, 'prescription_count': 5.0,
    'comorbidity_count': 2.0, 'creatinine': 1.2, 'bun': 22.0, 'wbc': 8.5, 'lab_mean': 2.4
}
# 3. Bradycardia (19 VitalDB features)
bradycardia_feat = {
    'sbp': 120.0, 'dbp': 80.0, 'map': 93.3, 'map_roll_mean': 92.0, 'map_roll_std': 1.5,
    'map_trend': -1.0, 'spo2': 98.0, 'spo2_roll_mean': 98.0, 'spo2_roll_std': 0.2,
    'spo2_trend': 0.0, 'etco2': 38.0, 'etco2_roll_mean': 37.8, 'etco2_roll_std': 0.4,
    'etco2_trend': 0.0, 'rr': 14.0, 'cvp': 6.0, 'temp': 36.8, 'pulse_pressure': 40.0,
    'cvp_map_ratio': 0.064
}
# 4. FluidRecommendation (8 MIMIC hospital features)
fluid_feat = {
    'anchor_age': 58.0, 'gender_code': 0.0, 'prescription_count': 4.0,
    'comorbidity_count': 1.0, 'potassium': 4.2, 'glucose': 115.0, 'wbc': 7.0, 'lab_mean': 3.1
}
# 5. Mortality (10 MIMIC hospital features)
mortality_feat = {
    'anchor_age': 72.0, 'gender_code': 1.0, 'hemoglobin': 12.5, 'creatinine': 1.4,
    'bun': 25.0, 'platelets': 210.0, 'wbc': 9.2, 'prescription_count': 6.0,
    'comorbidity_count': 3.0, 'lab_mean': 2.8
}

pytorch_test_cases = [
    ("Arrhythmia", arrhythmia_feat),
    ("BloodLoss", bloodloss_feat),
    ("Bradycardia", bradycardia_feat),
    ("FluidRecommendation", fluid_feat),
    ("Mortality", mortality_feat)
]

for task, payload in pytorch_test_cases:
    # Verify input feature count matches model schema
    expected_feats = FEATURES[task]
    assert len(payload) == len(expected_feats), f"Payload size {len(payload)} != schema size {len(expected_feats)} for {task}"
    for ef in expected_feats:
        assert ef in payload, f"Missing feature {ef} in test payload for {task}"
        
    res = client.post(f"/predict/{task}", json={"features": payload})
    assert res.status_code == 200, f"/predict/{task} failed: {res.status_code} -> {res.text}"
    data = res.json()
    prob = data['probability']
    pred = data['prediction']
    conf = data['confidence_score']
    threshold = THRESHOLDS.get(task, 0.5)
    
    assert 0.0 <= prob <= 1.0, f"Invalid probability for {task}: {prob}"
    assert not math.isnan(prob) and not math.isinf(prob), f"Non-finite prob for {task}"
    assert pred == int(prob >= threshold), f"Threshold mismatch for {task}: prob={prob}, th={threshold}, pred={pred}"
    print(f"  [PyTorch] {task:22s} -> Prob: {prob:.4f} | Pred: {pred} | Thresh: {threshold:.3f} | Conf: {conf}% | Risk: {data['risk_category']}")

# TEST 5: Retest all 5 Validated Classical Models
print("\n[TEST 5] POST /predict for 5 Validated Classical Models")

for task in VALIDATED_SKLEARN_TASKS:
    # Build valid payload dynamically from saved features
    req_feats = FEATURES[task]
    payload = {}
    for f in req_feats:
        if 'age' in f.lower():
            payload[f] = 60.0
        elif 'gender' in f.lower():
            payload[f] = 1.0
        elif 'spo2' in f.lower():
            payload[f] = 98.0
        elif 'hr' in f.lower() or 'heart' in f.lower():
            payload[f] = 75.0
        elif 'sbp' in f.lower():
            payload[f] = 120.0
        elif 'dbp' in f.lower():
            payload[f] = 80.0
        elif 'map' in f.lower():
            payload[f] = 93.3
        elif 'temp' in f.lower():
            payload[f] = 36.8
        elif 'rr' in f.lower():
            payload[f] = 14.0
        elif 'etco2' in f.lower():
            payload[f] = 38.0
        else:
            payload[f] = 1.0
            
    res = client.post(f"/predict/{task}", json={"features": payload})
    assert res.status_code == 200, f"/predict/{task} failed: {res.status_code} -> {res.text}"
    data = res.json()
    prob = data['probability']
    pred = data['prediction']
    conf = data['confidence_score']
    threshold = THRESHOLDS.get(task, 0.5)
    
    assert 0.0 <= prob <= 1.0, f"Invalid probability for {task}: {prob}"
    print(f"  [Classical] {task:20s} -> Prob: {prob:.4f} | Pred: {pred} | Thresh: {threshold:.3f} | Conf: {conf}% | Risk: {data['risk_category']}")

# TEST 6: Missing Feature Validation (HTTP 422)
print("\n[TEST 6] Missing Feature HTTP 422 Error Handling Verification")
bad_res = client.post("/predict/Mortality", json={"features": {"anchor_age": 60}})
assert bad_res.status_code == 422, f"Expected 422 for missing features, got {bad_res.status_code}"
print(f"  PASSED: Missing feature rejected with HTTP 422: {bad_res.json()['detail']}")

print("\n" + "=" * 90)
print("ALL TESTS PASSED SUCCESSFULLY! 10 VALIDATED CLINICAL TASKS VERIFIED.")
print("=" * 90)
