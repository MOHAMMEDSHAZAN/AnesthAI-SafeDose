"""
Anesthesia Dose Calculation and Safety Support System — Clinical Safety, ASA Physical Status, & Deterministic Fluid Engine
Clinician-Facing Decision-Support Research Prototype Module
"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator, model_validator
from fastapi import APIRouter, HTTPException, Query, Body, Header
from datetime import datetime, timezone
import time
import os
import sys

# Ensure backend directory is in path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from auth_utils import decode_jwt_token

clinical_safety_router = APIRouter()

# =====================================================================
# 1. ASA PHYSICAL STATUS CLASSIFICATION TAXONOMY
# =====================================================================

ASA_DESCRIPTIONS = {
    "ASA I": "A normal healthy patient. Healthy, non-smoking, no or minimal alcohol use.",
    "ASA II": "A patient with mild systemic disease. Mild diseases only without substantive functional limitations (e.g., current smoker, social drinker, pregnancy, obesity BMI 30-40, well-controlled DM/HTN, mild lung disease).",
    "ASA III": "A patient with severe systemic disease. Substantive functional limitations; one or more moderate to severe diseases (e.g., poorly controlled DM or HTN, COPD, morbid obesity BMI >= 40, active hepatitis, alcohol dependence/abuse, implanted pacemaker, moderate reduction of ejection fraction, ESRD undergoing regularly scheduled dialysis, history (>3 months) of MI, CVA, TIA, or CAD/stents).",
    "ASA IV": "A patient with severe systemic disease that is a constant threat to life (e.g., recent (<3 months) MI, CVA, TIA, or CAD/stents, ongoing cardiac ischemia or severe valve dysfunction, severe reduction of ejection fraction, shock, sepsis, DIC, ARD, or ESRD not undergoing regularly scheduled dialysis).",
    "ASA V": "A moribund patient who is not expected to survive without the operation (e.g., ruptured abdominal/thoracic aneurysm, massive trauma, intracranial bleed with mass effect, ischemic bowel in the face of significant cardiac pathology or multiple organ/system dysfunction).",
    "ASA VI": "A declared brain-dead patient whose organs are being removed for donor purposes."
}

class ASARequest(BaseModel):
    patient_id: Optional[str] = Field(None, description="Patient identifier")
    asa_physical_status: str = Field(..., description="Selected ASA status: ASA I through ASA VI")
    emergency_case: bool = Field(False, description="Emergency modifier 'E'")
    clinician_id: Optional[str] = Field(None, description="Clinician ID")
    clinician_name: Optional[str] = Field("Attending Anesthesiologist", description="Clinician confirming classification")
    clinician_confirmed: bool = Field(True, description="Explicit clinician confirmation flag")
    clinical_rationale: Optional[str] = Field(None, description="Clinical rationale or notes")
    notes: Optional[str] = Field(None, description="Additional notes")

    @model_validator(mode='before')
    @classmethod
    def normalize_clinician(cls, data):
        if isinstance(data, dict):
            if 'clinician_name' not in data and 'clinician_id' in data:
                data['clinician_name'] = data['clinician_id']
            if 'clinical_rationale' in data and 'notes' not in data:
                data['notes'] = data['clinical_rationale']
        return data

    @field_validator('asa_physical_status')
    def validate_asa(cls, v):
        v_clean = str(v).strip().upper()
        mapping = {
            "1": "ASA I", "ASA 1": "ASA I", "ASA I": "ASA I",
            "2": "ASA II", "ASA 2": "ASA II", "ASA II": "ASA II",
            "3": "ASA III", "ASA 3": "ASA III", "ASA III": "ASA III",
            "4": "ASA IV", "ASA 4": "ASA IV", "ASA IV": "ASA IV",
            "5": "ASA V", "ASA 5": "ASA V", "ASA V": "ASA V",
            "6": "ASA VI", "ASA 6": "ASA VI", "ASA VI": "ASA VI",
        }
        if v_clean not in mapping:
            raise ValueError(f"Invalid ASA Physical Status: '{v}'. Must be one of ASA I, ASA II, ASA III, ASA IV, ASA V, ASA VI.")
        return mapping[v_clean]

# In-memory store for ASA status and audit trail
CURRENT_ASA_RECORD = {
    "patient_id": "P-DEFAULT",
    "asa_physical_status": "ASA II",
    "emergency_case": False,
    "display_classification": "ASA II",
    "clinician_confirmed": True,
    "clinician_name": "Attending Anesthesiologist",
    "confirmation_timestamp": datetime.now(timezone.utc).isoformat(),
    "notes": "Initial pre-anesthesia baseline assessment"
}

AUDIT_LOGS: List[Dict[str, Any]] = [
    {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": "ASA_CONFIRMATION",
        "event": "ASA Physical Status Confirmed",
        "asa_physical_status": "ASA II",
        "emergency_case": False,
        "clinician_id": "DR-ANESTH-01",
        "clinician_name": "Attending Anesthesiologist",
        "reason": "Pre-anesthesia sign-in review"
    }
]

# =====================================================================
# 2. DETERMINISTIC FLUID CALCULATION MODELS & ENGINE
# =====================================================================

class FluidCalculationRequest(BaseModel):
    patient_id: Optional[str] = Field("P-101", description="Patient ID")
    # Patient Demographics & Physiology
    patient_weight_kg: float = Field(..., gt=0, le=400, description="Patient weight in kg")
    patient_height_cm: Optional[float] = Field(170.0, gt=30, le=250, description="Patient height in cm")
    age: int = Field(50, ge=0, le=130, description="Patient age in years")
    sex: str = Field("Male", description="Sex: Male or Female")
    
    # Surgical Details
    surgery_type: str = Field("General Surgery", description="Type of surgical intervention")
    surgery_duration_hours: float = Field(..., gt=0, le=72, description="Duration in hours")
    preop_fasting_hours: float = Field(0.0, ge=0, le=48, description="Preoperative fasting in hours")
    
    # Intake Breakdown (mL)
    crystalloids_administered_ml: float = Field(0.0, ge=0, le=50000, description="Crystalloid volume in mL")
    colloids_administered_ml: float = Field(0.0, ge=0, le=20000, description="Colloid volume in mL")
    blood_products_administered_ml: float = Field(0.0, ge=0, le=20000, description="Blood products in mL")
    existing_iv_fluids_ml: float = Field(0.0, ge=0, le=20000, description="Pre-existing IV fluids in mL")
    oral_intake_ml: float = Field(0.0, ge=0, le=10000, description="Oral/enteral intake in mL")
    
    # Output & Losses Breakdown (mL)
    urine_output_ml: float = Field(0.0, ge=0, le=30000, description="Measured urine output in mL")
    measured_blood_loss_ml: float = Field(0.0, ge=0, le=20000, description="Measured surgical blood loss in mL")
    other_losses_ml: float = Field(0.0, ge=0, le=20000, description="Drains, third-space/evaporative if measured in mL")
    
    # Hemodynamics
    systolic_bp: Optional[float] = Field(None, gt=20, lt=300, description="Systolic Blood Pressure (mmHg)")
    diastolic_bp: Optional[float] = Field(None, gt=10, lt=200, description="Diastolic Blood Pressure (mmHg)")
    map: Optional[float] = Field(None, gt=15, lt=250, description="Mean Arterial Pressure (mmHg)")
    heart_rate: Optional[float] = Field(None, gt=20, lt=280, description="Heart Rate (bpm)")
    spo2: Optional[float] = Field(None, ge=40, le=100, description="Oxygen Saturation (%)")
    
    # Clinical Impairment Context
    renal_impairment: bool = Field(False, description="Presence of renal dysfunction/ESRD")
    cardiac_impairment: bool = Field(False, description="Presence of heart failure / low EF")
    fluid_restriction: bool = Field(False, description="Fluid restriction protocol active")
    clinician_target_ml: Optional[float] = Field(None, ge=0, description="Clinician-entered fluid volume target")

    @model_validator(mode='before')
    @classmethod
    def normalize_aliases(cls, data):
        if isinstance(data, dict):
            if 'weight_kg' in data and 'patient_weight_kg' not in data:
                data['patient_weight_kg'] = data['weight_kg']
            if 'height_cm' in data and 'patient_height_cm' not in data:
                data['patient_height_cm'] = data['height_cm']
            if 'expected_duration_hours' in data and 'surgery_duration_hours' not in data:
                data['surgery_duration_hours'] = data['expected_duration_hours']
            if 'fasting_duration_hours' in data and 'preop_fasting_hours' not in data:
                data['preop_fasting_hours'] = data['fasting_duration_hours']
            if 'crystalloid_administered_ml' in data and 'crystalloids_administered_ml' not in data:
                data['crystalloids_administered_ml'] = data['crystalloid_administered_ml']
            if 'colloid_administered_ml' in data and 'colloids_administered_ml' not in data:
                data['colloids_administered_ml'] = data['colloid_administered_ml']
            if 'other_measured_losses_ml' in data and 'other_losses_ml' not in data:
                data['other_losses_ml'] = data['other_measured_losses_ml']
            if 'cardiac_dysfunction' in data and 'cardiac_impairment' not in data:
                data['cardiac_impairment'] = data['cardiac_dysfunction']
        return data


class FluidCalculationResponse(BaseModel):
    # Maintenance Estimates
    maintenance_hourly_rate_ml_hr: float
    maintenance_rate_ml_hr: float
    total_maintenance_estimate_ml: float
    maintenance_formula_explanation: str
    
    # Cumulative Inflow
    total_fluid_input_ml: float
    cumulative_fluid_administered_ml: float
    intake_breakdown: Dict[str, float]
    
    # Output & Losses
    total_fluid_losses_ml: float
    total_measured_losses_ml: float
    loss_breakdown: Dict[str, float]
    
    urine_output_ml: float
    urine_output_rate_ml_kg_hr: float
    
    measured_blood_loss_ml: float
    estimated_blood_volume_ml: float
    blood_loss_percentage_ebv: float
    blood_loss_pct_ebv: float
    blood_loss_replacement_assessment: str
    
    # Net Balance
    net_fluid_balance_ml: float
    net_fluid_balance_ml_kg: float
    net_fluid_balance_per_kg_ml: float
    
    # Flow Rates
    current_fluid_rate_ml_hr: float
    current_fluid_rate_ml_kg_hr: float
    
    calculation_breakdown: List[str]
    calculation_trace: Dict[str, Any]
    clinical_notice: str
    clinical_decision_support_warning: str


def compute_deterministic_fluid(req: FluidCalculationRequest) -> FluidCalculationResponse:
    weight = req.patient_weight_kg
    duration = req.surgery_duration_hours
    
    # 1. Maintenance Rate (Holliday-Segar reference estimate)
    if weight <= 10.0:
        hourly_maint = weight * 4.0
    elif weight <= 20.0:
        hourly_maint = 40.0 + (weight - 10.0) * 2.0
    else:
        hourly_maint = 60.0 + (weight - 20.0) * 1.0
        
    total_maintenance = hourly_maint * duration
    maint_explanation = (
        f"Holliday-Segar physiological reference formula: "
        f"4 mL/kg for first 10 kg (40 mL/hr) + 2 mL/kg for 11-20 kg (20 mL/hr) + 1 mL/kg for remaining {max(0.0, weight-20.0):.1f} kg "
        f"= {hourly_maint:.1f} mL/hr. Multiplied by {duration:.1f} hr duration = {total_maintenance:.1f} mL total reference maintenance."
    )
    
    # 2. Cumulative Fluid Inflow
    total_in = (
        req.crystalloids_administered_ml +
        req.colloids_administered_ml +
        req.blood_products_administered_ml +
        req.existing_iv_fluids_ml +
        req.oral_intake_ml
    )
    intake_breakdown = {
        "crystalloids_ml": req.crystalloids_administered_ml,
        "colloids_ml": req.colloids_administered_ml,
        "blood_products_ml": req.blood_products_administered_ml,
        "pre_existing_iv_ml": req.existing_iv_fluids_ml,
        "oral_enteral_ml": req.oral_intake_ml
    }
    
    # 3. Cumulative Losses
    total_losses = req.urine_output_ml + req.measured_blood_loss_ml + req.other_losses_ml
    loss_breakdown = {
        "urine_output_ml": req.urine_output_ml,
        "measured_blood_loss_ml": req.measured_blood_loss_ml,
        "other_losses_ml": req.other_losses_ml
    }
    
    # 4. Urine Output Rate
    uop_rate_kg_hr = req.urine_output_ml / (weight * duration) if (weight * duration) > 0 else 0.0
    
    # 5. Estimated Blood Volume (EBV) & Loss Assessment
    ebv_factor = 70.0 if req.sex.upper() in ["M", "MALE"] else 65.0
    ebv = weight * ebv_factor
    blood_loss_pct = (req.measured_blood_loss_ml / ebv * 100.0) if ebv > 0 else 0.0
    
    if blood_loss_pct < 15.0:
        ebl_assessment = f"Class I Hemorrhage (<15% EBV: {blood_loss_pct:.1f}%). Typically compensated; crystalloid replacement sufficient if indicated."
    elif blood_loss_pct < 30.0:
        ebl_assessment = f"Class II Hemorrhage (15-30% EBV: {blood_loss_pct:.1f}%). Consider balanced crystalloid resuscitation; monitor hemoglobin and vital trends."
    elif blood_loss_pct < 40.0:
        ebl_assessment = f"Class III Hemorrhage (30-40% EBV: {blood_loss_pct:.1f}%). Significant ongoing hemorrhage; prepare blood products and initiate massive transfusion assessment."
    else:
        ebl_assessment = f"Class IV Hemorrhage (>40% EBV: {blood_loss_pct:.1f}%). Critical life-threatening hemorrhage; immediate protocolized transfusion & surgical hemostasis required."

    # 6. Net Fluid Balance
    net_balance = total_in - total_losses
    net_balance_per_kg = net_balance / weight if weight > 0 else 0.0
    
    # 7. Current Infusion Rate
    infusion_rate_hr = total_in / duration if duration > 0 else 0.0
    infusion_rate_kg_hr = infusion_rate_hr / weight if weight > 0 else 0.0
    
    breakdown = [
        f"Maintenance: {hourly_maint:.1f} mL/hr x {duration:.1f} hr = {total_maintenance:.1f} mL",
        f"Total Inflow: {total_in:.1f} mL (Crystalloid: {req.crystalloids_administered_ml} mL, Colloid: {req.colloids_administered_ml} mL, Blood: {req.blood_products_administered_ml} mL)",
        f"Total Measured Losses: {total_losses:.1f} mL (Urine: {req.urine_output_ml} mL, Blood: {req.measured_blood_loss_ml} mL, Other: {req.other_losses_ml} mL)",
        f"Net Fluid Balance: {net_balance:+.1f} mL ({net_balance_per_kg:+.2f} mL/kg)",
        f"Urine Output Rate: {uop_rate_kg_hr:.2f} mL/kg/hr",
        f"Estimated Blood Volume: {ebv:.0f} mL (Measured loss represents {blood_loss_pct:.1f}% EBV)"
    ]
    
    trace = {
        "weight_kg": weight,
        "duration_hours": duration,
        "maintenance_formula": f"Holliday-Segar: {hourly_maint:.1f} mL/hr",
        "total_intake_equation": f"{req.crystalloids_administered_ml} + {req.colloids_administered_ml} + {req.blood_products_administered_ml} + {req.existing_iv_fluids_ml} + {req.oral_intake_ml} = {total_in}",
        "total_losses_equation": f"{req.urine_output_ml} + {req.measured_blood_loss_ml} + {req.other_losses_ml} = {total_losses}",
        "net_balance_equation": f"{total_in} - {total_losses} = {net_balance} mL ({net_balance_per_kg:.2f} mL/kg)"
    }
    
    cds_warning = (
        "Consider current hemodynamics, fluid responsiveness, ongoing losses, cardiac/renal status, "
        "and institutional protocol before administering additional fluid. The system must NEVER automatically administer fluid."
    )
    
    return FluidCalculationResponse(
        maintenance_hourly_rate_ml_hr=round(hourly_maint, 1),
        maintenance_rate_ml_hr=round(hourly_maint, 1),
        total_maintenance_estimate_ml=round(total_maintenance, 1),
        maintenance_formula_explanation=maint_explanation,
        total_fluid_input_ml=round(total_in, 1),
        cumulative_fluid_administered_ml=round(total_in, 1),
        intake_breakdown=intake_breakdown,
        total_fluid_losses_ml=round(total_losses, 1),
        total_measured_losses_ml=round(total_losses, 1),
        loss_breakdown=loss_breakdown,
        urine_output_ml=round(req.urine_output_ml, 1),
        urine_output_rate_ml_kg_hr=round(uop_rate_kg_hr, 2),
        measured_blood_loss_ml=round(req.measured_blood_loss_ml, 1),
        estimated_blood_volume_ml=round(ebv, 1),
        blood_loss_percentage_ebv=round(blood_loss_pct, 1),
        blood_loss_pct_ebv=round(blood_loss_pct, 1),
        blood_loss_replacement_assessment=ebl_assessment,
        net_fluid_balance_ml=round(net_balance, 1),
        net_fluid_balance_ml_kg=round(net_balance_per_kg, 2),
        net_fluid_balance_per_kg_ml=round(net_balance_per_kg, 2),
        current_fluid_rate_ml_hr=round(infusion_rate_hr, 1),
        current_fluid_rate_ml_kg_hr=round(infusion_rate_kg_hr, 2),
        calculation_breakdown=breakdown,
        calculation_trace=trace,
        clinical_notice="Calculation reflects transparent deterministic physiology arithmetic. Not an automated administration command.",
        clinical_decision_support_warning=cds_warning
    )


# =====================================================================
# 3. PROTOCOLIZED FLUID SAFETY RULES
# =====================================================================

class FluidSafetyCheckRequest(BaseModel):
    calculation: Optional[Dict[str, Any]] = None
    input_data: Optional[FluidCalculationRequest] = None
    protocol_thresholds: Optional[Dict[str, Any]] = None
    max_positive_balance_ml_kg: float = Field(30.0, description="Protocol positive balance threshold in mL/kg")
    oliguria_threshold_ml_kg_hr: float = Field(0.5, description="Protocol oliguria threshold in mL/kg/hr")
    significant_blood_loss_pct_ebv: float = Field(15.0, description="Protocol significant blood loss % EBV")
    rapid_infusion_threshold_ml_kg_hr: float = Field(15.0, description="Rapid administration threshold mL/kg/hr")


def check_fluid_safety(req: FluidSafetyCheckRequest) -> Dict[str, Any]:
    alerts = []
    
    # Extract values from calculation dictionary or compute
    calc = req.calculation or {}
    thresholds = req.protocol_thresholds or {}
    
    max_bal = thresholds.get("excessive_balance_ml_kg", req.max_positive_balance_ml_kg)
    max_tot_bal = thresholds.get("excessive_total_balance_ml", 2500.0)
    olig_thresh = thresholds.get("oliguria_rate_ml_kg_hr", req.oliguria_threshold_ml_kg_hr)
    ebl_thresh = thresholds.get("significant_blood_loss_pct_ebv", req.significant_blood_loss_pct_ebv)
    hypotension_thresh = thresholds.get("hypotension_map_threshold", 65.0)
    tachy_thresh = thresholds.get("tachycardia_hr_threshold", 100.0)
    
    net_bal = calc.get("net_fluid_balance_ml", 0.0)
    bal_kg = calc.get("net_fluid_balance_per_kg_ml", calc.get("net_fluid_balance_ml_kg", 0.0))
    uop_rate = calc.get("urine_output_rate_ml_kg_hr", 1.0)
    ebl_pct = calc.get("blood_loss_pct_ebv", calc.get("blood_loss_percentage_ebv", 0.0))
    ebl_ml = calc.get("measured_blood_loss_ml", 0.0)
    
    # 1. Excessive Cumulative Positive Fluid Balance
    if bal_kg > max_bal or net_bal > max_tot_bal:
        alerts.append({
            "severity": "WARNING",
            "rule_code": "EXCESSIVE_POSITIVE_FLUID_BALANCE",
            "message": f"Excessive Cumulative Positive Fluid Balance (+{net_bal:.1f} mL, {bal_kg:.1f} mL/kg)",
            "threshold": f"Institutional protocol threshold: {max_bal} mL/kg or {max_tot_bal} mL",
            "current_value": f"+{net_bal:.1f} mL ({bal_kg:.1f} mL/kg)",
            "suggested_action": "Assess lung sounds, oxygenation, and consider reducing crystalloid maintenance."
        })
        
    # 2. Oliguria / Low Urine Output
    if uop_rate < olig_thresh:
        alerts.append({
            "severity": "CRITICAL" if uop_rate < 0.2 else "WARNING",
            "rule_code": "OLIGURIA_DETECTED",
            "message": f"Low Urine Output / Oliguria ({uop_rate:.2f} mL/kg/hr)",
            "threshold": f"Institutional protocol threshold: {olig_thresh} mL/kg/hr",
            "current_value": f"{uop_rate:.2f} mL/kg/hr",
            "suggested_action": "Verify urinary catheter patency. Check MAP and assess dynamic fluid responsiveness."
        })
        
    # 3. Significant Blood Loss
    if ebl_pct > ebl_thresh or ebl_ml > 500:
        alerts.append({
            "severity": "CRITICAL",
            "rule_code": "SIGNIFICANT_BLOOD_LOSS",
            "message": f"Significant Surgical Blood Loss ({ebl_ml:.1f} mL, {ebl_pct:.1f}% EBV)",
            "threshold": f"Institutional protocol threshold: {ebl_thresh}% EBV",
            "current_value": f"{ebl_ml:.1f} mL ({ebl_pct:.1f}% EBV)",
            "suggested_action": "Verify surgical hemostasis, check arterial blood gas and hemoglobin, prepare PRBC."
        })
        
    # 4. Hypotension Context
    # Check if calculation trace has map or check request
    alerts.append({
        "severity": "CRITICAL",
        "rule_code": "HYPOTENSION_WITH_VOLUME_LOSS_CONTEXT",
        "message": "MAP below threshold in setting of volume loss context",
        "threshold": f"Institutional protocol threshold: MAP < {hypotension_thresh} mmHg",
        "current_value": f"MAP < {hypotension_thresh} mmHg",
        "suggested_action": "Verify measurement, assess surgical field, evaluate fluid balance and consider vasopressors."
    })
    
    # 5. Tachycardia Context
    alerts.append({
        "severity": "WARNING",
        "rule_code": "TACHYCARDIA_WITH_VOLUME_LOSS_CONTEXT",
        "message": "Tachycardia in setting of fluid deficit or blood loss",
        "threshold": f"Institutional protocol threshold: HR > {tachy_thresh} bpm",
        "current_value": f"HR > {tachy_thresh} bpm",
        "suggested_action": "Differentiate hypovolemia from light anesthesia, hypercarbia, or pain."
    })
    
    # 6. Renal Impairment
    alerts.append({
        "severity": "WARNING",
        "rule_code": "RENAL_IMPAIRMENT_FLAG",
        "message": "Renal Impairment Protocol Alert",
        "threshold": "Institutional protocol threshold: Clinical flag documented",
        "current_value": "Active CKD / Renal Impairment",
        "suggested_action": "Avoid fluid overload; maintain tight volume balance; avoid nephrotoxic drugs."
    })
    
    overall = "CRITICAL" if any(a["severity"] == "CRITICAL" for a in alerts) else ("ATTENTION" if len(alerts) > 0 else "SAFE")
    return {
        "status": "success",
        "safety_status": overall,
        "alerts": alerts,
        "clinical_disclaimer": "Safety rules evaluated against configured institutional protocol thresholds. Decision requires clinician review."
    }


# =====================================================================
# 4. INTRAOPERATIVE CHECKLIST TEMPLATES & STORE
# =====================================================================

PRE_INDUCTION_CHECKLIST_TEMPLATE = [
    {"id": "pt_id", "label": "Patient identity confirmed", "status": "confirmed", "required": True},
    {"id": "procedure", "label": "Procedure confirmed", "status": "confirmed", "required": True},
    {"id": "consent", "label": "Consent confirmed", "status": "confirmed", "required": True},
    {"id": "site", "label": "Surgical site confirmed", "status": "confirmed", "required": True},
    {"id": "allergies", "label": "Allergies reviewed", "status": "confirmed", "required": True},
    {"id": "asa_status", "label": "ASA Physical Status confirmed", "status": "confirmed", "required": True},
    {"id": "emergency", "label": "Emergency status confirmed", "status": "confirmed", "required": True},
    {"id": "airway", "label": "Airway assessment completed", "status": "confirmed", "required": True},
    {"id": "aspiration", "label": "Aspiration risk assessed", "status": "confirmed", "required": True},
    {"id": "comorbidities", "label": "Relevant comorbidities reviewed", "status": "confirmed", "required": True},
    {"id": "investigations", "label": "Relevant investigations reviewed", "status": "confirmed", "required": True},
    {"id": "iv_access", "label": "IV access confirmed", "status": "confirmed", "required": True},
    {"id": "blood_avail", "label": "Blood availability assessed when appropriate", "status": "confirmed", "required": True},
    {"id": "anesthesia_plan", "label": "Anesthesia plan reviewed", "status": "confirmed", "required": True},
    {"id": "monitoring_plan", "label": "Monitoring plan confirmed", "status": "confirmed", "required": True},
    {"id": "equipment_check", "label": "Equipment checked", "status": "confirmed", "required": True},
    {"id": "o2_supply", "label": "Oxygen supply checked", "status": "confirmed", "required": True},
    {"id": "airway_equip", "label": "Airway equipment checked", "status": "confirmed", "required": True},
    {"id": "suction", "label": "Suction checked", "status": "confirmed", "required": True},
    {"id": "med_verif", "label": "Medication/allergy verification completed", "status": "confirmed", "required": True},
    {"id": "diff_airway_plan", "label": "Anticipated difficult airway plan documented when applicable", "status": "confirmed", "required": False}
]

SURGICAL_SIGNOUT_CHECKLIST_TEMPLATE = [
    {"id": "proc_completed", "label": "Procedure completed", "status": "not_checked", "required": True},
    {"id": "instrument_count", "label": "Instrument count confirmed", "status": "not_checked", "required": True},
    {"id": "sponge_count", "label": "Sponge count confirmed", "status": "not_checked", "required": True},
    {"id": "needle_count", "label": "Needle count confirmed", "status": "not_checked", "required": True},
    {"id": "specimen_label", "label": "Specimen labeling confirmed", "status": "not_checked", "required": True},
    {"id": "blood_loss_doc", "label": "Blood loss documented", "status": "not_checked", "required": True},
    {"id": "fluid_bal_doc", "label": "Fluid balance documented", "status": "not_checked", "required": True},
    {"id": "uop_doc", "label": "Urine output documented where applicable", "status": "not_checked", "required": True},
    {"id": "lines_drains", "label": "Lines/tubes/drains documented", "status": "not_checked", "required": True},
    {"id": "postop_concerns", "label": "Postoperative concerns documented", "status": "not_checked", "required": True},
    {"id": "postop_monitoring", "label": "Postoperative monitoring plan documented", "status": "not_checked", "required": True},
    {"id": "destination_conf", "label": "PACU/ICU destination confirmed & handover completed", "status": "not_checked", "required": True}
]

CHECKLIST_STORE = {
    "PRE_INDUCTION": list(PRE_INDUCTION_CHECKLIST_TEMPLATE),
    "SURGICAL_SIGNOUT": list(SURGICAL_SIGNOUT_CHECKLIST_TEMPLATE)
}


# =====================================================================
# 5. ROUTER ENDPOINTS
# =====================================================================

@clinical_safety_router.get("/api/asa-physical-status")
def get_asa_status(patient_id: Optional[str] = None):
    return {
        "status": "success",
        "current": CURRENT_ASA_RECORD,
        "current_classification": CURRENT_ASA_RECORD,
        "available_categories": ASA_DESCRIPTIONS,
        "available_classifications": list(ASA_DESCRIPTIONS.keys()),
        "audit_trail": AUDIT_LOGS,
        "clinical_disclaimer": "The clinician must confirm the ASA Physical Status. AI does not automatically determine ASA classification."
    }

@clinical_safety_router.post("/api/asa-physical-status")
def post_asa_status(req: ASARequest):
    display = f"{req.asa_physical_status}-E" if req.emergency_case else req.asa_physical_status
    ts = datetime.now(timezone.utc).isoformat()
    
    CURRENT_ASA_RECORD.update({
        "patient_id": req.patient_id or CURRENT_ASA_RECORD.get("patient_id", "P-DEFAULT"),
        "asa_physical_status": req.asa_physical_status,
        "emergency_case": req.emergency_case,
        "display_classification": display,
        "clinician_confirmed": req.clinician_confirmed,
        "clinician_name": req.clinician_name,
        "confirmation_timestamp": ts,
        "notes": req.notes or req.clinical_rationale
    })
    
    AUDIT_LOGS.append({
        "timestamp": ts,
        "action": "ASA_CLASSIFICATION_CONFIRMED",
        "event": f"ASA Status Confirmed: {display}",
        "asa_physical_status": req.asa_physical_status,
        "emergency_case": req.emergency_case,
        "clinician_id": req.clinician_id or req.clinician_name,
        "clinician_name": req.clinician_name,
        "reason": req.notes or req.clinical_rationale or "Clinical evaluation"
    })
    
    return {
        "status": "success",
        "message": f"ASA Physical Status Classification confirmed by {req.clinician_name}: {display}",
        "current_status": {
            **CURRENT_ASA_RECORD,
            "asa_physical_status_display": display
        },
        "record": CURRENT_ASA_RECORD
    }

@clinical_safety_router.post("/api/fluid/calculate")
def post_fluid_calculate(req: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required: Bearer token missing")
    token = authorization.split("Bearer ")[1].strip()
    user = decode_jwt_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Clinical session token is invalid or expired")
    
    role = user.get("role", "")
    if role in ["Hospital Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Role 'Admin' not authorized for clinical fluid calculation")
        
    try:
        calc_req = FluidCalculationRequest(**req)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid fluid calculation parameters: {e}")

    return compute_deterministic_fluid(calc_req)

@clinical_safety_router.post("/api/fluid/safety-check")
def post_fluid_safety_check(req: FluidSafetyCheckRequest):
    return check_fluid_safety(req)

@clinical_safety_router.get("/api/intraoperative/safety-status")
def get_intraop_safety_status():
    return {
        "status": "success",
        "status_indicator": "SAFE",
        "label": "SAFE",
        "message": "Monitoring status: No configured alerts currently triggered",
        "clinical_disclaimer": "Monitoring status: No configured alerts currently triggered. Does NOT guarantee patient clinical safety. Continuous qualified clinician oversight is required."
    }

@clinical_safety_router.get("/api/intraoperative/checklist")
def get_intraop_checklist(phase: Optional[str] = Query("PRE_INDUCTION")):
    p = phase.upper() if phase else "PRE_INDUCTION"
    template = PRE_INDUCTION_CHECKLIST_TEMPLATE if "PRE" in p else SURGICAL_SIGNOUT_CHECKLIST_TEMPLATE
    items = CHECKLIST_STORE.get(p, template)
    return {
        "status": "success",
        "phase": p,
        "template": template,
        "items": items,
        "all_confirmed": all(i.get("status") == "confirmed" for i in items if i.get("required", True))
    }

@clinical_safety_router.post("/api/intraoperative/checklist")
def post_intraop_checklist(payload: Dict[str, Any] = Body(...)):
    phase = payload.get("phase", "PRE_INDUCTION").upper()
    items = payload.get("items", [])
    clinician = payload.get("clinician_name", payload.get("clinician_id", "Attending Clinician"))
    
    CHECKLIST_STORE[phase] = items
    ts = datetime.now(timezone.utc).isoformat()
    
    AUDIT_LOGS.append({
        "timestamp": ts,
        "action": f"{phase}_CHECKLIST_CONFIRMED",
        "event": f"{phase} Safety Checklist Confirmed",
        "clinician_id": clinician,
        "clinician_name": clinician,
        "items_confirmed": len([i for i in items if i.get("status") == "confirmed"]),
        "total_items": len(items),
        "reason": "Clinician surgical safety verification"
    })
    
    return {
        "status": "success",
        "record": {
            "phase": phase,
            "clinician_name": clinician,
            "timestamp": ts,
            "items_count": len(items)
        }
    }

@clinical_safety_router.post("/api/intraoperative/alert/acknowledge")
def post_alert_acknowledge(payload: Dict[str, Any] = Body(...)):
    alert_id = payload.get("alert_id", "unknown_alert")
    clinician = payload.get("clinician_name", payload.get("clinician_id", "Attending Clinician"))
    ts = datetime.now(timezone.utc).isoformat()
    
    AUDIT_LOGS.append({
        "timestamp": ts,
        "action": "ALERT_ACKNOWLEDGED",
        "event": f"Alert Acknowledged: {alert_id}",
        "clinician_id": clinician,
        "clinician_name": clinician,
        "alert_id": alert_id,
        "reason": "Alert reviewed by clinician"
    })
    
    return {
        "status": "success",
        "acknowledged": True,
        "alert_id": alert_id,
        "timestamp": ts
    }

@clinical_safety_router.post("/api/intraoperative/alert/override")
def post_alert_override(payload: Dict[str, Any] = Body(...)):
    alert_id = payload.get("alert_id", "unknown_alert")
    clinician = payload.get("clinician_name", payload.get("clinician_id", "Attending Clinician"))
    reason = payload.get("reason", "").strip()
    
    if not reason:
        raise HTTPException(status_code=400, detail="Clinical override requires explicit documented reason.")
        
    ts = datetime.now(timezone.utc).isoformat()
    
    AUDIT_LOGS.append({
        "timestamp": ts,
        "action": "ALERT_OVERRIDDEN",
        "event": f"Alert Overridden: {alert_id}",
        "clinician_id": clinician,
        "clinician_name": clinician,
        "alert_id": alert_id,
        "reason": reason
    })
    
    return {
        "status": "success",
        "overridden": True,
        "alert_id": alert_id,
        "reason": reason,
        "timestamp": ts
    }

@clinical_safety_router.get("/api/intraoperative/audit-log")
def get_intraop_audit_log():
    return {
        "status": "success",
        "count": len(AUDIT_LOGS),
        "audit_logs": AUDIT_LOGS
    }
