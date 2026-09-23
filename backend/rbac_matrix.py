"""
SafeDose AI / Anesth AI - Centralized Role-Based Access Control (RBAC) Matrix
and Field-Level Data Minimization Policy.
"""

from typing import Dict, List, Set, Any, Optional

# Standard Roles
ROLE_ANESTHESIOLOGIST = "Anesthesiologist"
ROLE_SURGEON = "Surgeon"
ROLE_NURSE = "Nurse"
ROLE_ADMIN = "Admin"
ROLE_STUDENT = "Student"
ROLE_BREAK_GLASS = "Break-Glass"

ALL_ROLES = [
    ROLE_ANESTHESIOLOGIST,
    ROLE_SURGEON,
    ROLE_NURSE,
    ROLE_ADMIN,
    ROLE_STUDENT,
    ROLE_BREAK_GLASS,
]

# Permissions
PERM_VIEW_ASSIGNED_PATIENT = "VIEW_ASSIGNED_PATIENT"
PERM_VIEW_PREOP = "VIEW_PREOP"
PERM_VIEW_AIRWAY = "VIEW_AIRWAY"
PERM_VIEW_ANESTHESIA = "VIEW_ANESTHESIA"
PERM_VIEW_INTRAOP = "VIEW_INTRAOP"
PERM_VIEW_POSTOP = "VIEW_POSTOP"
PERM_VIEW_PREDICTIONS = "VIEW_PREDICTIONS"
PERM_VIEW_ALERTS = "VIEW_ALERTS"
PERM_ACKNOWLEDGE_ALERT = "ACKNOWLEDGE_ALERT"
PERM_OVERRIDE_ALERT = "OVERRIDE_ALERT"
PERM_CALCULATE_DRUG = "CALCULATE_DRUG"
PERM_VIEW_FLUIDS = "VIEW_FLUIDS"
PERM_EDIT_CLINICAL_RECORD = "EDIT_CLINICAL_RECORD"
PERM_CONFIRM_ASA = "CONFIRM_ASA"
PERM_VIEW_AUDIT = "VIEW_AUDIT"
PERM_VIEW_SECURITY_LOGS = "VIEW_SECURITY_LOGS"
PERM_MANAGE_USERS = "MANAGE_USERS"
PERM_MANAGE_ROLES = "MANAGE_ROLES"
PERM_VIEW_MODEL_REGISTRY = "VIEW_MODEL_REGISTRY"
PERM_USE_BREAK_GLASS = "USE_BREAK_GLASS"

ROLE_PERMISSIONS: Dict[str, Set[str]] = {
    ROLE_ANESTHESIOLOGIST: {
        PERM_VIEW_ASSIGNED_PATIENT, PERM_VIEW_PREOP, PERM_VIEW_AIRWAY,
        PERM_VIEW_ANESTHESIA, PERM_VIEW_INTRAOP, PERM_VIEW_POSTOP,
        PERM_VIEW_PREDICTIONS, PERM_VIEW_ALERTS, PERM_ACKNOWLEDGE_ALERT,
        PERM_OVERRIDE_ALERT, PERM_CALCULATE_DRUG, PERM_VIEW_FLUIDS,
        PERM_EDIT_CLINICAL_RECORD, PERM_CONFIRM_ASA, PERM_VIEW_AUDIT,
        PERM_USE_BREAK_GLASS
    },
    ROLE_SURGEON: {
        PERM_VIEW_ASSIGNED_PATIENT, PERM_VIEW_PREOP, PERM_VIEW_INTRAOP,
        PERM_VIEW_POSTOP, PERM_VIEW_ALERTS, PERM_ACKNOWLEDGE_ALERT,
        PERM_VIEW_FLUIDS, PERM_EDIT_CLINICAL_RECORD, PERM_USE_BREAK_GLASS
    },
    ROLE_NURSE: {
        PERM_VIEW_ASSIGNED_PATIENT, PERM_VIEW_INTRAOP, PERM_VIEW_POSTOP,
        PERM_VIEW_ALERTS, PERM_ACKNOWLEDGE_ALERT, PERM_VIEW_FLUIDS,
        PERM_EDIT_CLINICAL_RECORD, PERM_USE_BREAK_GLASS
    },
    ROLE_ADMIN: {
        PERM_VIEW_AUDIT, PERM_VIEW_SECURITY_LOGS, PERM_MANAGE_USERS,
        PERM_MANAGE_ROLES, PERM_VIEW_MODEL_REGISTRY
    },
    ROLE_STUDENT: {
        PERM_VIEW_ASSIGNED_PATIENT, PERM_VIEW_PREOP, PERM_VIEW_AIRWAY,
        PERM_VIEW_ANESTHESIA, PERM_VIEW_INTRAOP, PERM_VIEW_POSTOP,
        PERM_VIEW_PREDICTIONS, PERM_VIEW_ALERTS, PERM_CALCULATE_DRUG,
        PERM_VIEW_FLUIDS, PERM_VIEW_MODEL_REGISTRY
    },
    ROLE_BREAK_GLASS: {
        # Exceptional emergency access granted temporarily
        PERM_VIEW_ASSIGNED_PATIENT, PERM_VIEW_PREOP, PERM_VIEW_AIRWAY,
        PERM_VIEW_ANESTHESIA, PERM_VIEW_INTRAOP, PERM_VIEW_POSTOP,
        PERM_VIEW_PREDICTIONS, PERM_VIEW_ALERTS, PERM_ACKNOWLEDGE_ALERT,
        PERM_OVERRIDE_ALERT, PERM_VIEW_FLUIDS, PERM_CALCULATE_DRUG
    }
}

# Synthetic Demo Patient Assignment Rules
# Maps User ID / Clinician Name to assigned patient IDs
DEMO_PATIENT_ASSIGNMENTS: Dict[str, List[str]] = {
    "user_anesthesiologist_1": ["SD-2026-0001", "SD-2026-0002"],
    "user_anesthesiologist_2": ["SD-2026-0003", "SD-2026-0004"],
    "user_surgeon_1": ["SD-2026-0001", "SD-2026-0004"],
    "user_surgeon_2": ["SD-2026-0002", "SD-2026-0003"],
    "user_nurse_1": ["SD-2026-0001", "SD-2026-0003"],
    "user_nurse_2": ["SD-2026-0002", "SD-2026-0004"],
    "user_student_1": ["SD-2026-0001", "SD-2026-0002"], # Demo synthetic cases only
    "user_admin_1": [], # Admin does not have routine patient clinical assignments
}

def has_role_permission(role: str, permission: str) -> bool:
    """Check if a given role has a specific permission."""
    perms = ROLE_PERMISSIONS.get(role, set())
    return permission in perms

def is_patient_assigned(user_id: str, patient_id: str, role: str, is_break_glass: bool = False) -> bool:
    """Verify patient assignment rule. Break-glass bypasses standard assignment."""
    if is_break_glass:
        return True
    assigned = DEMO_PATIENT_ASSIGNMENTS.get(user_id, [])
    return patient_id in assigned

def filter_patient_data_by_role(patient_data: Dict[str, Any], role: str) -> Dict[str, Any]:
    """
    Apply field-level data minimization based on the requesting user's role.
    Prevents unauthorized clinical fields from leaving the API.
    """
    if not patient_data:
        return {}
    
    # Deep copy representation
    filtered = dict(patient_data)
    
    if role in [ROLE_ANESTHESIOLOGIST, ROLE_BREAK_GLASS]:
        # Full necessary clinical record
        return filtered
    
    if role == ROLE_SURGEON:
        # Surgical view: Remove detailed airway mechanics and internal anesthesia dosing parameters
        filtered.pop("doseParameters", None)
        if "anesthesiaPlan" in filtered:
            filtered["anesthesiaPlan"] = {
                "recommendation": filtered["anesthesiaPlan"].get("recommendation"),
                "reasoning": filtered["anesthesiaPlan"].get("reasoning", [])
            }
        return filtered
        
    if role == ROLE_NURSE:
        # Nurse view: Remove internal model weight details and raw prediction metrics
        filtered.pop("predictions", None)
        filtered.pop("doseParameters", None)
        return filtered
        
    if role == ROLE_STUDENT:
        # Student view: Synthetic educational fields only
        filtered["isEducationalDemo"] = True
        return filtered
        
    if role == ROLE_ADMIN:
        # Admin view: Minimal clinical information (least privilege)
        return {
            "id": filtered.get("id"),
            "recordType": filtered.get("recordType"),
            "assignedOR": filtered.get("assignedOR"),
            "assignedAnesthesiologist": filtered.get("assignedAnesthesiologist"),
            "assignedNurse": filtered.get("assignedNurse"),
            "monitoringStatus": filtered.get("monitoringStatus"),
            "procedure": filtered.get("procedure"),
            "age": filtered.get("age"),
            "gender": filtered.get("gender"),
            "notice": "Administrative summary view — full clinical details restricted."
        }
        
    return filtered
