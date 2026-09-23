"""
Unit Tests for Deterministic Fluid Calculator & Safety Checks
Tests exact formula calculation for 70 kg patient
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.clinical_safety import (
    FluidCalculationRequest,
    compute_deterministic_fluid,
    FluidSafetyCheckRequest,
    check_fluid_safety,
    ASARequest
)

def test_fluid_calculation_70kg():
    print("=== TEST 1: 70 KG PATIENT FLUID CALCULATION ===")
    req = FluidCalculationRequest(
        patient_weight_kg=70.0,
        patient_height_cm=175.0,
        age=55,
        sex="Male",
        surgery_type="Laparoscopic Cholecystectomy",
        surgery_duration_hours=2.0,
        preop_fasting_hours=8.0,
        crystalloids_administered_ml=1000.0,
        colloids_administered_ml=0.0,
        blood_products_administered_ml=0.0,
        existing_iv_fluids_ml=200.0,
        oral_intake_ml=0.0,
        urine_output_ml=140.0,
        measured_blood_loss_ml=100.0,
        other_losses_ml=50.0,
        systolic_bp=120.0,
        diastolic_bp=75.0,
        map=90.0,
        heart_rate=72.0,
        spo2=99.0,
        renal_impairment=False,
        cardiac_impairment=False,
        fluid_restriction=False
    )

    res = compute_deterministic_fluid(req)

    # 1. Maintenance verification:
    # 70 kg -> 60 + 1 * (70 - 20) = 110 mL/hr
    expected_maint_rate = 110.0
    expected_total_maint = 110.0 * 2.0  # 220.0 mL
    assert res.maintenance_hourly_rate_ml_hr == expected_maint_rate, f"Maint rate mismatch: {res.maintenance_hourly_rate_ml_hr} != {expected_maint_rate}"
    assert res.total_maintenance_estimate_ml == expected_total_maint, f"Total maint mismatch: {res.total_maintenance_estimate_ml} != {expected_total_maint}"

    # 2. Cumulative intake verification:
    # 1000 (cryst) + 200 (existing) = 1200 mL
    expected_total_in = 1200.0
    assert res.cumulative_fluid_administered_ml == expected_total_in, f"Total in mismatch: {res.cumulative_fluid_administered_ml} != {expected_total_in}"

    # 3. Cumulative loss verification:
    # 140 (urine) + 100 (blood) + 50 (other) = 290 mL
    expected_total_out = 290.0
    assert res.total_fluid_losses_ml == expected_total_out, f"Total loss mismatch: {res.total_fluid_losses_ml} != {expected_total_out}"

    # 4. Urine output rate:
    # 140 / (70 * 2) = 1.0 mL/kg/hr
    expected_uop_rate = 1.0
    assert res.urine_output_rate_ml_kg_hr == expected_uop_rate, f"UOP rate mismatch: {res.urine_output_rate_ml_kg_hr} != {expected_uop_rate}"

    # 5. Net fluid balance:
    # 1200 - 290 = +910.0 mL
    expected_net = 910.0
    assert res.net_fluid_balance_ml == expected_net, f"Net balance mismatch: {res.net_fluid_balance_ml} != {expected_net}"

    # 6. Net balance per kg:
    # 910 / 70 = 13.0 mL/kg
    expected_net_kg = 13.0
    assert res.net_fluid_balance_ml_kg == expected_net_kg, f"Net per kg mismatch: {res.net_fluid_balance_ml_kg} != {expected_net_kg}"

    # 7. Estimated blood volume for 70 kg Male:
    # 70 * 70 = 4900 mL. Blood loss % = (100 / 4900) * 100 = 2.0%
    assert res.estimated_blood_volume_ml == 4900.0, f"EBV mismatch: {res.estimated_blood_volume_ml}"
    assert res.blood_loss_percentage_ebv == 2.0, f"Blood loss % mismatch: {res.blood_loss_percentage_ebv}"

    print("PASS: All 70 kg patient deterministic fluid formulas mathematically verified!")

def test_fluid_safety_checks():
    print("\n=== TEST 2: FLUID SAFETY ALERT RULES ===")
    # High positive balance test (> 15 mL/kg)
    req_high_fluid = FluidCalculationRequest(
        patient_weight_kg=70.0,
        age=60,
        surgery_duration_hours=2.0,
        crystalloids_administered_ml=2500.0, # large volume -> net balance > 15 mL/kg
        urine_output_ml=100.0,
        measured_blood_loss_ml=50.0,
        map=60.0, # Hypotension with oliguria
        renal_impairment=True
    )
    calc_res = compute_deterministic_fluid(req_high_fluid)
    safety_req = FluidSafetyCheckRequest(
        calculation=calc_res.model_dump(),
        max_positive_balance_ml_kg=15.0,
        oliguria_threshold_ml_kg_hr=0.5
    )
    safety_res = check_fluid_safety(safety_req)
    rule_codes = [a["rule_code"] for a in safety_res["alerts"]]
    print("Triggered rules:", rule_codes)
    assert "EXCESSIVE_POSITIVE_FLUID_BALANCE" in rule_codes
    assert "RENAL_IMPAIRMENT_FLAG" in rule_codes
    print("PASS: Safety alert rules triggered and validated!")

def test_input_validation():
    print("\n=== TEST 3: INPUT VALIDATION REJECTIONS ===")
    import pydantic
    try:
        FluidCalculationRequest(patient_weight_kg=-5.0, age=50, surgery_duration_hours=2.0)
        assert False, "Failed to reject negative weight!"
    except pydantic.ValidationError as e:
        print("PASS: Negative weight correctly rejected by Pydantic validator.")

    try:
        FluidCalculationRequest(patient_weight_kg=70.0, age=50, surgery_duration_hours=-1.0)
        assert False, "Failed to reject negative surgery duration!"
    except pydantic.ValidationError as e:
        print("PASS: Negative duration correctly rejected by Pydantic validator.")

    try:
        FluidCalculationRequest(patient_weight_kg=70.0, age=50, surgery_duration_hours=2.0, crystalloids_administered_ml=-500.0)
        assert False, "Failed to reject negative fluid!"
    except pydantic.ValidationError as e:
        print("PASS: Negative fluid correctly rejected by Pydantic validator.")

def test_asa_classification():
    print("\n=== TEST 4: ASA CLASSIFICATION VALIDATION ===")
    asa_req = ASARequest(
        asa_physical_status="ASA III",
        emergency_case=True,
        clinician_name="Dr. Smith",
        notes="Severe COPD presenting for emergency laparotomy"
    )
    assert asa_req.asa_physical_status == "ASA III"
    assert asa_req.emergency_case is True
    print("PASS: ASA Physical Status Classification validated.")

if __name__ == "__main__":
    test_fluid_calculation_70kg()
    test_fluid_safety_checks()
    test_input_validation()
    test_asa_classification()
    print("\nALL FLUID CALCULATOR & SAFETY UNIT TESTS PASSED!")
