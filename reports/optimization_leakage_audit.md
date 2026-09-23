# Optimization Target Leakage and Patient Isolation Audit Report — AnesthAI SafeDose

**Date:** September 13, 2026  
**Status:** PASSED (Zero Target Leakage, Zero Patient Overlap, Train-Only Preprocessing Enforced)  

---

## 1. Mathematical Patient Grouping & Overlap Audit

In accordance with strict clinical protocol requirements, data splitting for every task is partitioned into **Train (~70%)**, **Validation (~15%)**, and **Final Test (~15%)** strictly by patient/record group identifiers.

### Overlap Invariant Verification
$$\text{Train} \cap \text{Validation} = \emptyset$$
$$\text{Train} \cap \text{Final Test} = \emptyset$$
$$\text{Validation} \cap \text{Final Test} = \emptyset$$

| Task | Dataset Source | Grouping Identifier | Total Groups | Train Groups | Val Groups | Test Groups | Inter-Partition Overlap | Audit Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hypotension** | VitalDB | `PatientID` (Surgical Case) | 235 | 165 | 35 | 35 | 0 (EMPTY) | **PASSED** |
| **Hypoxia** | VitalDB | `PatientID` (Surgical Case) | 235 | 165 | 35 | 35 | 0 (EMPTY) | **PASSED** |
| **Bradycardia** | VitalDB | `PatientID` (Surgical Case) | 235 | 165 | 35 | 35 | 0 (EMPTY) | **PASSED** |
| **Tachycardia** | VitalDB | `PatientID` (Surgical Case) | 235 | 165 | 35 | 35 | 0 (EMPTY) | **PASSED** |
| **Arrhythmia** | MIT-BIH | `record_id` (ECG Subject) | 48 | 34 | 7 | 7 | 0 (EMPTY) | **PASSED** |
| **EmergencySeverity** | MIMIC-IV-ED | `subject_id` (Patient) | 205,504 | 143,852 | 30,826 | 30,826 | 0 (EMPTY) | **PASSED** |
| **BloodLoss** | MIMIC-IV | `subject_id` (Patient) | 180,733 | 126,513 | 27,110 | 27,110 | 0 (EMPTY) | **PASSED** |
| **FluidRecommendation**| MIMIC-IV | `subject_id` (Patient) | 180,733 | 126,513 | 27,110 | 27,110 | 0 (EMPTY) | **PASSED** |
| **ICU Admission** | MIMIC-IV | `subject_id` (Patient) | 180,733 | 126,513 | 27,110 | 27,110 | 0 (EMPTY) | **PASSED** |
| **Mortality** | MIMIC-IV | `subject_id` (Patient) | 180,733 | 126,513 | 27,110 | 27,110 | 0 (EMPTY) | **PASSED** |

---

## 2. Target Leakage & Feature Blacklist Audit

Every feature in each task was programmatically inspected against the target outcome definition. Any direct, mathematical, or derived proxies were completely removed prior to model ingestion.

| Task | Target Outcome Definition | Prohibited / Blacklisted Leakage Features | Features Removed | Retained Features Count | Audit Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Hypotension** | $\text{MAP} < 65\text{ mmHg}$ | `map`, `sbp`, `dbp`, `pulse_pressure`, `shock_index`, `cvp_map_ratio`, and their rolling mean/std/trend statistics | All blood pressure measurements and pressure ratios stripped | 15 | **PASSED** |
| **Hypoxia** | $\text{SpO}_2 < 90\%$ | `spo2`, `spo2_roll_mean`, `spo2_roll_std`, `spo2_trend`, `o2sat` | Pulse oximetry saturation and rolling dynamics stripped | 20 | **PASSED** |
| **Bradycardia** | $\text{HR} < 60\text{ bpm}$ | `hr`, `hr_roll_mean`, `hr_roll_std`, `hr_trend`, `heartrate`, `shock_index` | All heart rate measurements and shock index stripped | 19 | **PASSED** |
| **Tachycardia** | $\text{HR} > 100\text{ bpm}$ | `hr`, `hr_roll_mean`, `hr_roll_std`, `hr_trend`, `heartrate`, `shock_index` | All heart rate measurements and shock index stripped | 19 | **PASSED** |
| **Arrhythmia** | Non-Normal ECG Annotation | `ann_type`, `annotation`, `symbol`, `Arrhythmia_Occurred` | Annotation symbols and label flags excluded from input voltage slice | 100 | **PASSED** |
| **EmergencySeverity**| $\text{Acuity} \le 2$ | `acuity`, `triage_acuity`, `ed_acuity` | Acuity rating stripped from input triage vital array | 6 | **PASSED** |
| **BloodLoss** | $\text{Hb} < 10\text{ g/dL}$ or $\text{Plt} < 100\text{ K}$ | `hemoglobin`, `platelets`, `postop_transfusion` | Target-defining hemoglobin and platelet laboratory values stripped | 8 | **PASSED** |
| **FluidRecommendation**| $\text{BUN} > 20$ or $\text{Cr} > 1.3$ | `bun`, `creatinine` | Target-defining renal nitrogen and creatinine laboratory values stripped | 8 | **PASSED** |
| **ICU Admission** | $\text{ICU Stay Count} > 0$ | `icu_stay_count`, `icu_los_days`, `stay_id`, `icustays` | Downstream ICU admission counters and length of stay stripped | 10 | **PASSED** |
| **Mortality** | $\text{Hospital Mortality} = 1$ | `hospital_expire_flag`, `icu_los_days`, `dod`, `deathtime`, `discharge_location` | Post-outcome mortality flags and discharge disposition stripped | 10 | **PASSED** |

---

## 3. Preprocessing Isolation Protocol

- **Scaler & Imputer Fitting:** All `StandardScaler` transformations and missing value imputations are fitted **strictly on the training partition** ($\mathcal{P}_{\text{train}}$).
- **Zero Leakage to Validation / Test:** The validation ($\mathcal{P}_{\text{val}}$) and test ($\mathcal{P}_{\text{test}}$) partitions are transformed using only the parameters (mean $\mu_{\text{train}}$ and standard deviation $\sigma_{\text{train}}$) learned from $\mathcal{P}_{\text{train}}$.
- **Frozen Test Set Integrity:** The test set remains untouched during hyperparameter tuning, threshold optimization, feature selection, and model selection.
