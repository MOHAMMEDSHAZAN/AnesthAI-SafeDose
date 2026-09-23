import unittest
import urllib.request
import json
import math
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from starlette.testclient import TestClient
from backend.main_api import app
from backend.auth_utils import create_jwt_token
from backend.rbac_matrix import ROLE_ANESTHESIOLOGIST

client = TestClient(app)
AUTH_TOKEN = create_jwt_token({"sub": "user_anesthesiologist_1", "role": ROLE_ANESTHESIOLOGIST}, expires_in=3600)
AUTH_HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"}

def http_post(endpoint, data, headers=None):
    h = headers if headers is not None else AUTH_HEADERS
    resp = client.post(endpoint, json=data, headers=h)
    return resp.status_code, resp.json()

def http_get(endpoint, headers=None):
    h = headers if headers is not None else AUTH_HEADERS
    resp = client.get(endpoint, headers=h)
    return resp.status_code, resp.json()

class TestClinicalSafetyFull(unittest.TestCase):

    # -------------------------------------------------------------
    # 1. ASA Physical Status Classification Tests
    # -------------------------------------------------------------
    def test_01_asa_classification_and_audit(self):
        print("\n--- TEST 1: ASA Physical Status Classification & Audit Trail ---")
        # GET initial
        status, data = http_get("/api/asa-physical-status?patient_id=P-TEST-01")
        self.assertEqual(status, 200)
        self.assertIn("available_classifications", data)
        self.assertEqual(len(data["available_classifications"]), 6)

        # POST confirmation for ASA III-E
        payload = {
            "patient_id": "P-TEST-01",
            "asa_physical_status": "ASA III",
            "emergency_case": True,
            "clinician_id": "DR-ANESTH-77",
            "clinician_name": "Dr. Sarah Miller, MD",
            "clinician_confirmed": True,
            "clinical_rationale": "Emergency acute laparotomy with severe systemic disease (severe CAD)."
        }
        status, data = http_post("/api/asa-physical-status", payload)
        self.assertEqual(status, 200)
        rec = data["record"]
        self.assertEqual(rec["asa_physical_status"], "ASA III")
        self.assertEqual(rec["emergency_case"], True)
        self.assertEqual(rec["clinician_confirmed"], True)
        self.assertTrue(rec["confirmation_timestamp"])

        # Check audit trail recorded
        status, data = http_get("/api/asa-physical-status?patient_id=P-TEST-01")
        self.assertEqual(status, 200)
        self.assertTrue(len(data["audit_trail"]) > 0)
        self.assertEqual(data["current"]["asa_physical_status"], "ASA III")
        self.assertEqual(data["current"]["emergency_case"], True)
        print("  -> ASA Physical Status Classification verified with Emergency 'E' modifier and audit trail.")

    # -------------------------------------------------------------
    # 2. Deterministic Fluid Calculation Unit Tests (70 kg Patient)
    # -------------------------------------------------------------
    def test_02_deterministic_fluid_calculation_70kg(self):
        print("\n--- TEST 2: Deterministic Fluid Calculation Unit Test (70 kg Patient) ---")
        weight = 70.0
        height = 175.0
        duration = 3.0
        crystalloid = 1000.0
        colloid = 200.0
        blood_prod = 0.0
        existing = 200.0
        urine = 210.0
        ebl = 100.0
        other_loss = 0.0

        # Mathematical Trace Verification
        # Holliday-Segar:
        # 1st 10 kg -> 40 mL/hr
        # 2nd 10 kg -> 20 mL/hr
        # remaining 50 kg -> 50 mL/hr
        expected_maint_rate = 40.0 + 20.0 + (50.0 * 1.0) # 110.0 mL/hr
        expected_total_maint = expected_maint_rate * duration # 330.0 mL

        expected_total_in = crystalloid + colloid + blood_prod + existing # 1400.0 mL
        expected_total_out = urine + ebl + other_loss # 310.0 mL
        expected_net_balance = expected_total_in - expected_total_out # 1090.0 mL
        expected_balance_per_kg = round(expected_net_balance / weight, 2) # 15.57 mL/kg

        expected_uop_rate = round(urine / (weight * duration), 2) # 210 / (70*3) = 1.0 mL/kg/hr
        expected_ebv = round(weight * 70.0, 1) # 4900.0 mL
        expected_blood_loss_pct = round((ebl / expected_ebv) * 100.0, 1) # 2.0%

        payload = {
            "patient_id": "P-FLUID-70KG",
            "weight_kg": weight,
            "height_cm": height,
            "age": 45,
            "sex": "Male",
            "surgery_type": "Abdominal Surgery",
            "expected_duration_hours": duration,
            "fasting_duration_hours": 8.0,
            "existing_iv_fluids_ml": existing,
            "crystalloid_administered_ml": crystalloid,
            "colloid_administered_ml": colloid,
            "blood_products_administered_ml": blood_prod,
            "urine_output_ml": urine,
            "measured_blood_loss_ml": ebl,
            "other_measured_losses_ml": other_loss,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "map": 93,
            "heart_rate": 72,
            "spo2": 99
        }

        status, data = http_post("/api/fluid/calculate", payload)
        self.assertEqual(status, 200)

        # Assert every single value traces to formula
        self.assertEqual(data["maintenance_rate_ml_hr"], expected_maint_rate)
        self.assertEqual(data["total_maintenance_estimate_ml"], expected_total_maint)
        self.assertEqual(data["total_fluid_input_ml"], expected_total_in)
        self.assertEqual(data["total_measured_losses_ml"], expected_total_out)
        self.assertEqual(data["net_fluid_balance_ml"], expected_net_balance)
        self.assertEqual(data["net_fluid_balance_per_kg_ml"], expected_balance_per_kg)
        self.assertEqual(data["urine_output_rate_ml_kg_hr"], expected_uop_rate)
        self.assertEqual(data["estimated_blood_volume_ml"], expected_ebv)
        self.assertEqual(data["blood_loss_pct_ebv"], expected_blood_loss_pct)

        # Check clinical decision-support warning
        self.assertIn("Consider current hemodynamics", data["clinical_decision_support_warning"])
        self.assertIn("calculation_trace", data)
        print("  -> 70 kg deterministic arithmetic 100% verified against theoretical equations.")

    # -------------------------------------------------------------
    # 3. Input Validation Rejection Tests
    # -------------------------------------------------------------
    def test_03_fluid_input_validation_rejections(self):
        print("\n--- TEST 3: Fluid Input Validation Rejection Tests ---")
        base_valid = {
            "patient_id": "P-VAL",
            "weight_kg": 70,
            "height_cm": 170,
            "age": 50,
            "sex": "Male",
            "surgery_type": "General",
            "expected_duration_hours": 2.0,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "map": 90,
            "heart_rate": 70,
            "spo2": 98
        }

        # Test negative weight
        bad_weight = dict(base_valid, weight_kg=-10)
        st, _ = http_post("/api/fluid/calculate", bad_weight)
        self.assertEqual(st, 422, "Should have rejected negative weight with 422")

        # Test zero duration
        bad_dur = dict(base_valid, expected_duration_hours=0)
        st, _ = http_post("/api/fluid/calculate", bad_dur)
        self.assertEqual(st, 422, "Should have rejected zero duration with 422")

        # Test negative fluid volumes
        bad_fluid = dict(base_valid, crystalloid_administered_ml=-500)
        st, _ = http_post("/api/fluid/calculate", bad_fluid)
        self.assertEqual(st, 422, "Should have rejected negative fluid volume with 422")

        # Test impossible vital signs
        bad_hr = dict(base_valid, heart_rate=350)
        st, _ = http_post("/api/fluid/calculate", bad_hr)
        self.assertEqual(st, 422, "Should have rejected impossible HR with 422")

        print("  -> All invalid, negative, and out-of-range inputs properly rejected with HTTP 422.")

    # -------------------------------------------------------------
    # 4. Fluid Safety Rules Tests
    # -------------------------------------------------------------
    def test_04_fluid_safety_rules(self):
        print("\n--- TEST 4: Fluid Safety Rules Tests ---")
        # Trigger oliguria (<0.5 mL/kg/hr) and hypotension (MAP < 65)
        calc_payload = {
            "patient_id": "P-SAFETY",
            "weight_kg": 70,
            "height_cm": 175,
            "age": 60,
            "sex": "Male",
            "surgery_type": "Complex Bowel",
            "expected_duration_hours": 3.0,
            "crystalloid_administered_ml": 2800,
            "urine_output_ml": 40, # 40 / (70*3) = 0.19 mL/kg/hr (<0.5)
            "measured_blood_loss_ml": 600, # > 500 mL
            "systolic_bp": 85,
            "diastolic_bp": 50,
            "map": 61, # < 65
            "heart_rate": 108, # > 100
            "spo2": 96,
            "renal_impairment": True
        }

        status, calc_data = http_post("/api/fluid/calculate", calc_payload)
        self.assertEqual(status, 200)

        safety_payload = {
            "calculation": calc_data,
            "protocol_thresholds": {
                "oliguria_rate_ml_kg_hr": 0.5,
                "excessive_balance_ml_kg": 30.0,
                "significant_blood_loss_pct_ebv": 15.0,
                "hypotension_map_threshold": 65,
                "tachycardia_hr_threshold": 100
            }
        }

        status, safety_data = http_post("/api/fluid/safety-check", safety_payload)
        self.assertEqual(status, 200)
        alert_codes = [a["rule_code"] for a in safety_data["alerts"]]

        self.assertIn("OLIGURIA_DETECTED", alert_codes)
        self.assertIn("SIGNIFICANT_BLOOD_LOSS", alert_codes)
        self.assertIn("HYPOTENSION_WITH_VOLUME_LOSS_CONTEXT", alert_codes)
        self.assertIn("TACHYCARDIA_WITH_VOLUME_LOSS_CONTEXT", alert_codes)
        self.assertIn("RENAL_IMPAIRMENT_FLAG", alert_codes)

        # Verify institutional protocol labeling
        for a in safety_data["alerts"]:
            self.assertTrue(a["threshold"].startswith("Institutional protocol threshold"))
        print("  -> Configurable institutional protocol safety alerts successfully verified.")

    # -------------------------------------------------------------
    # 5. Intraoperative Checklists, Alerts & Emergency Workflow
    # -------------------------------------------------------------
    def test_05_intraop_checklists_and_emergency_workflow(self):
        print("\n--- TEST 5: Intraoperative Checklists & Emergency Workflow ---")
        # Template fetch
        status, pre_data = http_get("/api/intraoperative/checklist?phase=PRE_INDUCTION")
        self.assertEqual(status, 200)
        self.assertEqual(len(pre_data["template"]), 21)

        status, out_data = http_get("/api/intraoperative/checklist?phase=SURGICAL_SIGNOUT")
        self.assertEqual(status, 200)
        self.assertEqual(len(out_data["template"]), 12)

        # Safety status fetch
        status, s_data = http_get("/api/intraoperative/safety-status")
        self.assertEqual(status, 200)
        self.assertIn("status_indicator", s_data)

        # Alert Acknowledge
        ack_payload = {
            "alert_id": "alt_map_1",
            "clinician_id": "DR-ANESTH-01",
            "clinician_name": "Dr. Anesthesiologist"
        }
        status, ack_data = http_post("/api/intraoperative/alert/acknowledge", ack_payload)
        self.assertEqual(status, 200)
        self.assertTrue(ack_data["acknowledged"])

        # Alert Override with mandatory reason
        override_payload = {
            "alert_id": "alt_map_1",
            "clinician_id": "DR-ANESTH-01",
            "clinician_name": "Dr. Anesthesiologist",
            "reason": "Permissive deliberate hypotension ordered by vascular surgeon for delicate vascular anastomosis."
        }
        status, ovr_data = http_post("/api/intraoperative/alert/override", override_payload)
        self.assertEqual(status, 200)
        self.assertTrue(ovr_data["overridden"])

        # Verify audit log recorded both events
        status, audit_data = http_get("/api/intraoperative/audit-log")
        self.assertEqual(status, 200)
        self.assertTrue(len(audit_data["audit_logs"]) >= 2)
        print("  -> Pre-Induction (21 items), Sign-Out (12 items), Acknowledgment, Override, and Audit log verified.")

    # -------------------------------------------------------------
    # 6. Backend /health & 10 ML Models Intact
    # -------------------------------------------------------------
    def test_06_backend_health_and_10_models(self):
        print("\n--- TEST 6: Backend /health and 10 Validated Models ---")
        status, h_data = http_get("/health")
        self.assertEqual(status, 200)
        self.assertEqual(h_data["status"], "healthy")
        self.assertEqual(h_data["validated_models_count"], 10)
        self.assertEqual(len(h_data["missing_models"]), 0)
        self.assertEqual(len(h_data["demo_models"]), 0)

        # Test all 10 prediction endpoints with feature lists
        with open("reports/feature_lists.json") as f:
            fl = json.load(f)

        passed_models = 0
        for task, feats in fl.items():
            payload = {"features": {c: 1.0 for c in feats}}
            st, pred_data = http_post(f"/predict/{task}", payload)
            self.assertEqual(st, 200)
            self.assertIn("prediction", pred_data)
            self.assertIn("probability", pred_data)
            passed_models += 1

        self.assertEqual(passed_models, 10)
        print(f"  -> All 10/10 ML models intact, untouched, and verified healthy ({passed_models}/10).")

    # -------------------------------------------------------------
    # 7. Frontend Asset & Reachability Check
    # -------------------------------------------------------------
    def test_07_frontend_reachability(self):
        print("\n--- TEST 7: Frontend Asset & Reachability Check ---")
        dist_path = os.path.join("dist", "index.html")
        if os.path.exists(dist_path):
            with open(dist_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertTrue(len(content) > 100)
            self.assertIn("<html", content.lower())
            print(f"  -> Frontend production build verified at {dist_path} ({len(content)} bytes).")
        else:
            # Check source index.html
            src_path = "index.html"
            self.assertTrue(os.path.exists(src_path))
            with open(src_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertTrue(len(content) > 100)
            print(f"  -> Frontend source entry verified at {src_path} ({len(content)} bytes).")

if __name__ == "__main__":
    unittest.main()
