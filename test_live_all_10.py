import requests
import json
import math

BASE_URL = "http://127.0.0.1:8000"

print("=" * 80)
print("LIVE HTTP VERIFICATION FOR ALL 10 VALIDATED ENDPOINTS")
print("=" * 80)

# Fetch health
h_res = requests.get(f"{BASE_URL}/health")
assert h_res.status_code == 200, f"Health failed: {h_res.status_code}"
h_data = h_res.json()
print("GET /health -> STATUS 200")
print(f"  validated_sklearn_models ({h_data['validated_sklearn_models_count']}): {h_data['validated_sklearn_models']}")
print(f"  validated_pytorch_models ({h_data['validated_pytorch_models_count']}): {h_data['validated_pytorch_models']}")
print(f"  total validated models ({h_data['validated_models_count']}): {h_data['validated_models']}")
print(f"  demo models ({h_data['demo_models_count']}): {h_data['demo_models']}")

# 1. 5 PyTorch Models
print("\n" + "-" * 80)
print("TESTING 5 VALIDATED PYTORCH PREDICTION ENDPOINTS")
print("-" * 80)

# Arrhythmia (100 ECG samples)
arrhythmia_payload = {"features": {f"ecg_sample_{i}": 0.05 * math.sin(i * 0.1) for i in range(100)}}
# BloodLoss (8 MIMIC hospital features)
bloodloss_payload = {"features": {
    'anchor_age': 65.0, 'gender_code': 1.0, 'prescription_count': 5.0,
    'comorbidity_count': 2.0, 'creatinine': 1.2, 'bun': 22.0, 'wbc': 8.5, 'lab_mean': 2.4
}}
# Bradycardia (19 VitalDB features)
bradycardia_payload = {"features": {
    'sbp': 120.0, 'dbp': 80.0, 'map': 93.3, 'map_roll_mean': 92.0, 'map_roll_std': 1.5,
    'map_trend': -1.0, 'spo2': 98.0, 'spo2_roll_mean': 98.0, 'spo2_roll_std': 0.2,
    'spo2_trend': 0.0, 'etco2': 38.0, 'etco2_roll_mean': 37.8, 'etco2_roll_std': 0.4,
    'etco2_trend': 0.0, 'rr': 14.0, 'cvp': 6.0, 'temp': 36.8, 'pulse_pressure': 40.0,
    'cvp_map_ratio': 0.064
}}
# FluidRecommendation (8 MIMIC hospital features)
fluid_payload = {"features": {
    'anchor_age': 58.0, 'gender_code': 0.0, 'prescription_count': 4.0,
    'comorbidity_count': 1.0, 'potassium': 4.2, 'glucose': 115.0, 'wbc': 7.0, 'lab_mean': 3.1
}}
# Mortality (10 MIMIC hospital features)
mortality_payload = {"features": {
    'anchor_age': 72.0, 'gender_code': 1.0, 'hemoglobin': 12.5, 'creatinine': 1.4,
    'bun': 25.0, 'platelets': 210.0, 'wbc': 9.2, 'prescription_count': 6.0,
    'comorbidity_count': 3.0, 'lab_mean': 2.8
}}

pytorch_endpoints = [
    ("Arrhythmia", arrhythmia_payload),
    ("BloodLoss", bloodloss_payload),
    ("Bradycardia", bradycardia_payload),
    ("FluidRecommendation", fluid_payload),
    ("Mortality", mortality_payload)
]

pytorch_results = {}
for task, payload in pytorch_endpoints:
    r = requests.post(f"{BASE_URL}/predict/{task}", json=payload)
    assert r.status_code == 200, f"/predict/{task} failed: {r.status_code} -> {r.text}"
    data = r.json()
    pytorch_results[task] = data
    print(f"POST /predict/{task:<20} -> Status: 200 OK")
    print(f"     Probability: {data['probability']:.4f} | Prediction: {data['prediction']} | Confidence: {data['confidence_score']}%")
    print(f"     Risk Category: {data['risk_category']} | Uncertainty: {data['uncertainty_estimate']}")
    print(f"     Recommended Action: {data['recommended_action'][:80]}...")

print("\n" + "-" * 80)
print("TESTING 5 VALIDATED CLASSICAL PREDICTION ENDPOINTS")
print("-" * 80)

# 1. Hypotension
hypotension_payload = {"features": {
    'hr': 75.0, 'hr_roll_mean': 74.5, 'hr_roll_std': 1.2, 'hr_trend': 0.5,
    'spo2': 98.0, 'spo2_roll_mean': 98.0, 'spo2_roll_std': 0.1, 'spo2_trend': 0.0,
    'etco2': 38.0, 'etco2_roll_mean': 37.9, 'etco2_roll_std': 0.2, 'etco2_trend': 0.0,
    'rr': 14.0, 'cvp': 5.0, 'temp': 36.7
}}
# 2. Hypoxia (querying /metrics/Hypoxia to get exact feature schema)
m_hypoxia = requests.get(f"{BASE_URL}/metrics/Hypoxia").json()
hypoxia_feat_names = m_hypoxia['features']
hypoxia_payload = {"features": {
    f: (98.0 if 'spo2' in f else (75.0 if 'hr' in f else (93.3 if 'map' in f else (38.0 if 'etco2' in f else 1.0))))
    for f in hypoxia_feat_names
}}
# 3. Tachycardia
m_tachy = requests.get(f"{BASE_URL}/metrics/Tachycardia").json()
tachy_payload = {"features": {
    f: (98.0 if 'spo2' in f else (93.3 if 'map' in f else (38.0 if 'etco2' in f else (120.0 if 'sbp' in f else 1.0))))
    for f in m_tachy['features']
}}
# 4. EmergencySeverity
m_es = requests.get(f"{BASE_URL}/metrics/EmergencySeverity").json()
es_payload = {"features": {f: 1.0 for f in m_es['features']}}
# 5. ICU
m_icu = requests.get(f"{BASE_URL}/metrics/ICU").json()
icu_payload = {"features": {f: 1.0 for f in m_icu['features']}}

classical_endpoints = [
    ("Hypotension", hypotension_payload),
    ("Hypoxia", hypoxia_payload),
    ("Tachycardia", tachy_payload),
    ("EmergencySeverity", es_payload),
    ("ICU", icu_payload)
]

classical_results = {}
for task, payload in classical_endpoints:
    r = requests.post(f"{BASE_URL}/predict/{task}", json=payload)
    assert r.status_code == 200, f"/predict/{task} failed: {r.status_code} -> {r.text}"
    data = r.json()
    classical_results[task] = data
    print(f"POST /predict/{task:<20} -> Status: 200 OK")
    print(f"     Probability: {data['probability']:.4f} | Prediction: {data['prediction']} | Confidence: {data['confidence_score']}%")
    print(f"     Risk Category: {data['risk_category']} | Uncertainty: {data['uncertainty_estimate']}")
    print(f"     Recommended Action: {data['recommended_action'][:80]}...")

print("\n" + "=" * 80)
print("ALL 10 VALIDATED ENDPOINTS OPERATIONAL VIA LIVE FASTAPI SERVER!")
print("=" * 80)
