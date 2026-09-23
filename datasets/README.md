# SafeDose AI: Clinical Datasets Directory Architecture

This directory contains structured clinical, physiological, and pharmacological datasets utilized by the SafeDose AI Perioperative Decision Support System.

## Directory Hierarchy & Clinical Domain Mapping

| Directory | Clinical Domain | Primary Datasets & Formats | Target Clinical Tasks |
| :--- | :--- | :--- | :--- |
| `01_hemodynamics_vitaldb/` | Intraoperative Hemodynamics | VitalDB continuous telemetry (.csv) | Hypotension, Hypoxia, Bradycardia, Tachycardia |
| `02_cardiac_ecg_mitbih/` | Electrophysiology & ECG | MIT-BIH 12-bit binary signals (.dat, .hea, .atr) | Real-Time Arrhythmia Detection & Classification |
| `03_preoperative_assessment/` | Preoperative Evaluation | Preoperative risk tables (.csv) | Preoperative Risk Index, Difficult Airway, PONV |
| `04_pacu_postanesthesia/` | Post-Anesthesia Recovery | PACU recovery & Aldrete checklists (.csv) | Delayed Discharge Prediction, PACU Readiness |
| `05_clinical_pharmacology/` | Drug Safety & Dosing | Drug database & interaction matrix (.csv) | Dynamic Bolus/Infusion Limits, Interaction Alerts |
| `06_mimic_critical_care/` | ICU & Hospital Biomarkers | MIMIC-IV 3.1 (`datasets/mimiciv/3.1/`) | Blood Loss, Fluid Guidance, ICU Requirement, Mortality |
| `07_prototype_registry/` | Prototype Patient Registry | AnesthAI 2,000 Patient Cohort (.csv) | Baseline Perioperative Risk Prototyping |
| `08_safety_compliance_metadata/` | Audit & Safety Standards | WHO checklists & incident logs (.json) | WHO Surgical Safety Verification & Incident Audits |
