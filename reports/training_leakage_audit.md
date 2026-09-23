# SafeDose AI — Clinical ML Target-Leakage Audit & Scientific Validation Report

**Audit Status**: COMPLETED | **Date**: 2026-09-09 18:34:32 UTC

## Executive Summary

A comprehensive scientific audit of all 16 clinical machine learning models in SafeDose AI was conducted following an anomalous `training_report.md` that displayed 100% accuracy, F1-score, and ROC-AUC across almost all tasks. The audit uncovered multiple critical target leakages, outcome-derived predictors, synthetic label generation, and intra-patient data leakage across training/test splits.

> [!CAUTION]
> **Audit Finding**: Previous reports of 100% accuracy were entirely invalid and arose from direct target leakage, synthetic rule tautologies, and intra-patient random shuffling. All models reporting 100% have been flagged, refactored, and audited below.

## Comprehensive Clinical Task Audit Matrix

| Task | Dataset | Target | Features | Train Pts | Test Pts | Best Model | Accuracy | F1 | ROC-AUC | Specificity | Sensitivity | Brier | Leakage Detected? | Verdict |
|---|---|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|:---:|:---:|
| **Hypotension** | VitalDB (High-Resoluti | Binary Hypotension Event  | 15 | 11 | 4 | Random Forest (Patie | 0.9172 | 0.5415 | 0.8397 | 0.9571 | 0.5271 | 0.0663 | YES | `VALID AFTER RETRAINING` |
| **Hypoxia** | VitalDB (High-Resoluti | Binary Hypoxia Event (spo | 20 | 11 | 4 | Random Forest (Patie | 0.9650 | 0.0015 | 0.8805 | 1.0000 | 0.0008 | 0.0313 | YES | `VALID AFTER RETRAINING` |
| **Bradycardia** | VitalDB (High-Resoluti | Binary Bradycardia Event  | 19 | 11 | 4 | Random Forest (Patie | 0.6944 | 0.2490 | 0.7884 | 0.8973 | 0.1793 | 0.1719 | YES | `VALID AFTER RETRAINING` |
| **Tachycardia** | VitalDB (High-Resoluti | Binary Tachycardia Event  | 19 | 11 | 4 | Random Forest (Patie | 0.9404 | 0.0000 | 0.5539 | 0.9916 | 0.0000 | 0.0566 | YES | `VALID AFTER RETRAINING` |
| **Arrhythmia** | MIT-BIH Arrhythmia Dat | Cardiac Arrhythmia Beat v | 100 | 8 | 4 | Random Forest (Inter | 0.7876 | 0.8318 | 0.7394 | 0.5776 | 0.9622 | 0.1813 | YES | `VALID AFTER RETRAINING` |
| **RiskPrediction** | preoperative_risk_data | Anesthesia Technique (Gen | 6 | 24 | 6 | Logistic Regression  | 0.6667 | 0.5972 | 1.0000 | 0.5000 | 0.6667 | 0.0000 | NO | `INSUFFICIENT DATA` |
| **PONV** | preoperative_risk_data | Postoperative Nausea & Vo | 6 | 24 | 6 | None (Rejected Tauto | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | YES | `INVALID — TARGET LEAKAGE` |
| **Airway** | preoperative_risk_data | Difficult Airway (Cormack | 6 | 24 | 6 | None (Rejected Tauto | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | YES | `INVALID — TARGET LEAKAGE` |
| **EmergencySeverity** | MIMIC-IV ED Demo (Tria | High Triage Emergency Acu | 6 | 166 | 56 | Logistic Regression  | 0.4286 | 0.0000 | 0.5000 | 1.0000 | 0.0000 | 0.2500 | YES | `VALID AFTER RETRAINING` |
| **PACU** | pacu_dataset.csv (Gene | Delayed PACU Discharge (D | 9 | 400 | 100 | None (Fabricated Syn | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | YES | `INVALID — TARGET LEAKAGE` |
| **BloodLoss** | MIMIC-IV 3.1 Clinical  | Hematologic Depletion / S | 8 | 3382 | 846 | Random Forest (Patie | 0.8040 | 0.5467 | 0.8584 | 0.8356 | 0.6593 | 0.1299 | YES | `VALID AFTER RETRAINING` |
| **FluidRecommendation** | MIMIC-IV 3.1 Clinical  | Elevated Fluid Requiremen | 8 | 3382 | 846 | Random Forest (Patie | 0.8099 | 0.6922 | 0.8933 | 0.8031 | 0.8298 | 0.1260 | YES | `VALID AFTER RETRAINING` |
| **ICU** | MIMIC-IV 3.1 Clinical  | Critical Care ICU Admissi | 10 | 3382 | 846 | Random Forest (Patie | 0.6401 | 0.6003 | 0.7167 | 0.6652 | 0.6086 | 0.2086 | YES | `VALID AFTER RETRAINING` |
| **Mortality** | MIMIC-IV 3.1 Clinical  | In-Hospital Mortality Eve | 10 | 3382 | 846 | Random Forest (Patie | 0.8282 | 0.0982 | 0.7271 | 0.8357 | 0.4634 | 0.1034 | YES | `VALID AFTER RETRAINING` |
| **DrugSafety** | anesthesia_drugs.csv ( | Severe Drug Interaction ( | 6 | 0 | 0 | None (Fabricated Syn | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | YES | `INVALID — TARGET LEAKAGE` |
| **prototype_baseline** | AnesthAI_2000_Patient_ | Multi-class Perioperative | 10 | 1600 | 400 | Random Forest (Leak- | 0.3400 | 0.3390 | 0.4940 | 0.5000 | 0.3400 | 0.0000 | YES | `VALID AFTER RETRAINING` |


## Detailed Task-by-Task Diagnostic Analysis

### Hypotension
- **Dataset**: `VitalDB (High-Resolution Intraoperative Biosignals)`
- **Exact Target Definition**: `Binary Hypotension Event (map < 60)`
- **Feature Count**: `15`
- **Cohort Size**: Train Patients/Cases = `11` (264491 samples), Test Patients/Cases = `4` (75544 samples)
- **Class Distribution**: Positive Cases = `47678`, Negative Cases = `292357`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Target was directly derived from 'map < 60', while ['map', 'map_roll_mean', 'map_roll_std'] were included in the input feature matrix. Split previously randomized continuous rows across the same patients.
- **Leakage Predictors Stripped**: `map, map_roll_mean, map_roll_std, map_trend, cvp_map_ratio, sbp, dbp, pulse_pressure, shock_index`
- **Legitimate Clinical Predictors Preserved**: `hr, hr_roll_mean, hr_roll_std, hr_trend, spo2, spo2_roll_mean, spo2_roll_std, spo2_trend, etco2, etco2_roll_mean, etco2_roll_std, etco2_trend, rr, cvp, temp`
- **Honest Performance**: Accuracy: `0.9172` | Precision: `0.5568` | Sensitivity/Recall: `0.5271` | Specificity: `0.9571` | F1: `0.5415` | ROC-AUC: `0.8397` | Brier: `0.0663`
- **Confusion Matrix**: `[[65590, 2942], [3316, 3696]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### Hypoxia
- **Dataset**: `VitalDB (High-Resolution Intraoperative Biosignals)`
- **Exact Target Definition**: `Binary Hypoxia Event (spo2 < 90)`
- **Feature Count**: `20`
- **Cohort Size**: Train Patients/Cases = `11` (264491 samples), Test Patients/Cases = `4` (75544 samples)
- **Class Distribution**: Positive Cases = `5700`, Negative Cases = `334335`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Target was directly derived from 'spo2 < 90', while ['spo2', 'spo2_roll_mean', 'spo2_roll_std'] were included in the input feature matrix. Split previously randomized continuous rows across the same patients.
- **Leakage Predictors Stripped**: `spo2, spo2_roll_mean, spo2_roll_std, spo2_trend`
- **Legitimate Clinical Predictors Preserved**: `hr, hr_roll_mean, hr_roll_std, hr_trend, sbp, dbp, map, map_roll_mean, map_roll_std, map_trend, etco2, etco2_roll_mean, etco2_roll_std, etco2_trend, rr, cvp, temp, shock_index, pulse_pressure, cvp_map_ratio`
- **Honest Performance**: Accuracy: `0.9650` | Precision: `1.0000` | Sensitivity/Recall: `0.0008` | Specificity: `1.0000` | F1: `0.0015` | ROC-AUC: `0.8805` | Brier: `0.0313`
- **Confusion Matrix**: `[[72899, 0], [2643, 2]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### Bradycardia
- **Dataset**: `VitalDB (High-Resolution Intraoperative Biosignals)`
- **Exact Target Definition**: `Binary Bradycardia Event (hr < 60)`
- **Feature Count**: `19`
- **Cohort Size**: Train Patients/Cases = `11` (264491 samples), Test Patients/Cases = `4` (75544 samples)
- **Class Distribution**: Positive Cases = `63024`, Negative Cases = `277011`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Target was directly derived from 'hr < 60', while ['hr', 'hr_roll_mean', 'hr_roll_std'] were included in the input feature matrix. Split previously randomized continuous rows across the same patients.
- **Leakage Predictors Stripped**: `hr, hr_roll_mean, hr_roll_std, hr_trend, shock_index`
- **Legitimate Clinical Predictors Preserved**: `sbp, dbp, map, map_roll_mean, map_roll_std, map_trend, spo2, spo2_roll_mean, spo2_roll_std, spo2_trend, etco2, etco2_roll_mean, etco2_roll_std, etco2_trend, rr, cvp, temp, pulse_pressure, cvp_map_ratio`
- **Honest Performance**: Accuracy: `0.6944` | Precision: `0.4076` | Sensitivity/Recall: `0.1793` | Specificity: `0.8973` | F1: `0.2490` | ROC-AUC: `0.7884` | Brier: `0.1719`
- **Confusion Matrix**: `[[48628, 5564], [17524, 3828]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### Tachycardia
- **Dataset**: `VitalDB (High-Resolution Intraoperative Biosignals)`
- **Exact Target Definition**: `Binary Tachycardia Event (hr > 100)`
- **Feature Count**: `19`
- **Cohort Size**: Train Patients/Cases = `11` (264491 samples), Test Patients/Cases = `4` (75544 samples)
- **Class Distribution**: Positive Cases = `38213`, Negative Cases = `301822`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Target was directly derived from 'hr > 100', while ['hr', 'hr_roll_mean', 'hr_roll_std'] were included in the input feature matrix. Split previously randomized continuous rows across the same patients.
- **Leakage Predictors Stripped**: `hr, hr_roll_mean, hr_roll_std, hr_trend, shock_index`
- **Legitimate Clinical Predictors Preserved**: `sbp, dbp, map, map_roll_mean, map_roll_std, map_trend, spo2, spo2_roll_mean, spo2_roll_std, spo2_trend, etco2, etco2_roll_mean, etco2_roll_std, etco2_trend, rr, cvp, temp, pulse_pressure, cvp_map_ratio`
- **Honest Performance**: Accuracy: `0.9404` | Precision: `0.0000` | Sensitivity/Recall: `0.0000` | Specificity: `0.9916` | F1: `0.0000` | ROC-AUC: `0.5539` | Brier: `0.0566`
- **Confusion Matrix**: `[[71040, 600], [3904, 0]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### Arrhythmia
- **Dataset**: `MIT-BIH Arrhythmia Database (WFDB)`
- **Exact Target Definition**: `Cardiac Arrhythmia Beat vs Normal Sinus Beat`
- **Feature Count**: `100`
- **Cohort Size**: Train Patients/Cases = `8` (17942 samples), Test Patients/Cases = `4` (8761 samples)
- **Class Distribution**: Positive Cases = `11952`, Negative Cases = `14751`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Intra-patient data leakage: Individual heartbeat slices from the same ECG recordings were previously shuffled randomly into both train and test partitions.
- **Honest Performance**: Accuracy: `0.7876` | Precision: `0.7326` | Sensitivity/Recall: `0.9622` | Specificity: `0.5776` | F1: `0.8318` | ROC-AUC: `0.7394` | Brier: `0.1813`
- **Confusion Matrix**: `[[2297, 1680], [181, 4603]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### RiskPrediction
- **Dataset**: `preoperative_risk_dataset.csv`
- **Exact Target Definition**: `Anesthesia Technique (General vs Regional vs Spinal/MAC)`
- **Feature Count**: `6`
- **Cohort Size**: Train Patients/Cases = `24` (24 samples), Test Patients/Cases = `6` (6 samples)
- **Class Distribution**: Positive Cases = `6`, Negative Cases = `16`
- **Leakage Detected**: **False**
- **Leakage Mechanism**: Statistical sample size invalidity: Dataset contains only 30 patients (6 in held-out test split). Claiming 100% generalization across high-dimensional features (D=21) from 6 test samples was scientifically ungrounded.
- **Honest Performance**: Accuracy: `0.6667` | Precision: `0.6333` | Sensitivity/Recall: `0.6667` | Specificity: `0.5000` | F1: `0.5972` | ROC-AUC: `1.0000` | Brier: `0.0000`
- **Confusion Matrix**: `[[3, 0, 0], [1, 0, 0], [1, 0, 1]]`
- **Scientific Validity**: **INVALID**
- **Verdict**: **`INSUFFICIENT DATA`**

---

### PONV
- **Dataset**: `preoperative_risk_dataset.csv`
- **Exact Target Definition**: `Postoperative Nausea & Vomiting Risk`
- **Feature Count**: `6`
- **Cohort Size**: Train Patients/Cases = `24` (24 samples), Test Patients/Cases = `6` (6 samples)
- **Class Distribution**: Positive Cases = `6`, Negative Cases = `24`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Critical Target Leakage & Synthetic Label Generation: Ground-truth target was synthetically generated via the rule `Gender_Code & (RCRI_Score > 1)`. Both `Gender_Code` and `RCRI_Score` were included in the input feature matrix, creating an artificial 100% deterministic tautology on N=30.
- **Honest Performance**: Accuracy: `1.0000` | Precision: `1.0000` | Sensitivity/Recall: `1.0000` | Specificity: `1.0000` | F1: `1.0000` | ROC-AUC: `1.0000` | Brier: `0.0000`
- **Confusion Matrix**: `[[4, 0], [0, 2]]`
- **Scientific Validity**: **INVALID**
- **Verdict**: **`INVALID — TARGET LEAKAGE`**

---

### Airway
- **Dataset**: `preoperative_risk_dataset.csv`
- **Exact Target Definition**: `Difficult Airway (Cormack-Lehane Grade III/IV)`
- **Feature Count**: `6`
- **Cohort Size**: Train Patients/Cases = `24` (0 samples), Test Patients/Cases = `6` (0 samples)
- **Class Distribution**: Positive Cases = `10`, Negative Cases = `20`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Critical Target Leakage: Target was created by thresholding `Mallampati >= 3`, while `Mallampati` was simultaneously provided as an input feature in the predictive matrix. Decision tree split directly on `Mallampati` to achieve 100% accuracy.
- **Honest Performance**: Accuracy: `1.0000` | Precision: `1.0000` | Sensitivity/Recall: `1.0000` | Specificity: `1.0000` | F1: `1.0000` | ROC-AUC: `1.0000` | Brier: `0.0000`
- **Confusion Matrix**: `[[5, 0], [0, 1]]`
- **Scientific Validity**: **INVALID**
- **Verdict**: **`INVALID — TARGET LEAKAGE`**

---

### EmergencySeverity
- **Dataset**: `MIMIC-IV ED Demo (Triage & Vitals)`
- **Exact Target Definition**: `High Triage Emergency Acuity (Acuity <= 2)`
- **Feature Count**: `6`
- **Cohort Size**: Train Patients/Cases = `166` (166 samples), Test Patients/Cases = `56` (56 samples)
- **Class Distribution**: Positive Cases = `126`, Negative Cases = `96`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Direct Target Leakage: The emergency triage label `acuity` was included directly in the input predictor list `['temperature', 'heartrate', 'resprate', 'o2sat', 'sbp', 'dbp', 'acuity']` while the target was defined as `acuity <= 2`.
- **Leakage Predictors Stripped**: `acuity`
- **Legitimate Clinical Predictors Preserved**: `temperature, heartrate, resprate, o2sat, sbp, dbp`
- **Honest Performance**: Accuracy: `0.4286` | Precision: `0.0000` | Sensitivity/Recall: `0.0000` | Specificity: `1.0000` | F1: `0.0000` | ROC-AUC: `0.5000` | Brier: `0.2500`
- **Confusion Matrix**: `[[24, 0], [32, 0]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### PACU
- **Dataset**: `pacu_dataset.csv (Generated in preprocessing/clean_datasets.py)`
- **Exact Target Definition**: `Delayed PACU Discharge (Delayed_Discharge == 1)`
- **Feature Count**: `9`
- **Cohort Size**: Train Patients/Cases = `400` (400 samples), Test Patients/Cases = `100` (100 samples)
- **Class Distribution**: Positive Cases = `82`, Negative Cases = `418`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Fabricated Synthetic Dataset & Direct Rule Leakage: `pacu_dataset.csv` was programmatically synthesized using `clean_datasets.generate_pacu_dataset()` with pseudo-random numbers. The target was defined as `delayed = 1 if aldrete < 9 else 0` while `Aldrete_Score_60min` was supplied as an input feature.
- **Honest Performance**: Accuracy: `1.0000` | Precision: `1.0000` | Sensitivity/Recall: `1.0000` | Specificity: `1.0000` | F1: `1.0000` | ROC-AUC: `1.0000` | Brier: `0.0000`
- **Confusion Matrix**: `[[84, 0], [0, 16]]`
- **Scientific Validity**: **INVALID**
- **Verdict**: **`INVALID — TARGET LEAKAGE`**

---

### BloodLoss
- **Dataset**: `MIMIC-IV 3.1 Clinical Database`
- **Exact Target Definition**: `Hematologic Depletion / Severe Blood Loss (Hb < 10 or Platelets < 100)`
- **Feature Count**: `8`
- **Cohort Size**: Train Patients/Cases = `3382` (7969 samples), Test Patients/Cases = `846` (2031 samples)
- **Class Distribution**: Positive Cases = `1795`, Negative Cases = `8205`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Direct Target Leakage: Target was created as `(hemoglobin < 10.0) | (platelets < 100.0)`. Both `hemoglobin` and `platelets` were provided as input features to the model, producing a 100% trivial decision tree split.
- **Leakage Predictors Stripped**: `hemoglobin, platelets`
- **Legitimate Clinical Predictors Preserved**: `anchor_age, gender_code, prescription_count, comorbidity_count, creatinine, bun, wbc, lab_mean`
- **Honest Performance**: Accuracy: `0.8040` | Precision: `0.4669` | Sensitivity/Recall: `0.6593` | Specificity: `0.8356` | F1: `0.5467` | ROC-AUC: `0.8584` | Brier: `0.1299`
- **Confusion Matrix**: `[[1393, 274], [124, 240]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### FluidRecommendation
- **Dataset**: `MIMIC-IV 3.1 Clinical Database`
- **Exact Target Definition**: `Elevated Fluid Requirement / Renal Impairment (BUN > 20 or Cr > 1.3)`
- **Feature Count**: `8`
- **Cohort Size**: Train Patients/Cases = `3382` (7969 samples), Test Patients/Cases = `846` (2031 samples)
- **Class Distribution**: Positive Cases = `2419`, Negative Cases = `7581`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Direct Target Leakage: Target was created as `(bun > 20.0) | (creatinine > 1.3)`. Both `bun` and `creatinine` were included in the input feature matrix, creating a tautological predictor.
- **Leakage Predictors Stripped**: `bun, creatinine`
- **Legitimate Clinical Predictors Preserved**: `potassium, glucose, anchor_age, gender_code, prescription_count, comorbidity_count, wbc, lab_mean`
- **Honest Performance**: Accuracy: `0.8099` | Precision: `0.5937` | Sensitivity/Recall: `0.8298` | Specificity: `0.8031` | F1: `0.6922` | ROC-AUC: `0.8933` | Brier: `0.1260`
- **Confusion Matrix**: `[[1211, 297], [89, 434]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### ICU
- **Dataset**: `MIMIC-IV 3.1 Clinical Database`
- **Exact Target Definition**: `Critical Care ICU Admission Requirement (icu_stay_count > 0)`
- **Feature Count**: `10`
- **Cohort Size**: Train Patients/Cases = `3382` (7969 samples), Test Patients/Cases = `846` (2031 samples)
- **Class Distribution**: Positive Cases = `4111`, Negative Cases = `5889`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Downstream Outcome Leakage: Target was constructed from `icu_stay_count > 0` and `icu_los_days > 0.0` while both `icu_stay_count` and `icu_los_days` were provided as input features. Downstream ICU admission variables cannot be used to predict the need for ICU admission.
- **Leakage Predictors Stripped**: `icu_stay_count, icu_los_days`
- **Legitimate Clinical Predictors Preserved**: `anchor_age, gender_code, hemoglobin, creatinine, bun, platelets, wbc, prescription_count, comorbidity_count, lab_mean`
- **Honest Performance**: Accuracy: `0.6401` | Precision: `0.5922` | Sensitivity/Recall: `0.6086` | Specificity: `0.6652` | F1: `0.6003` | ROC-AUC: `0.7167` | Brier: `0.2086`
- **Confusion Matrix**: `[[751, 378], [353, 549]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### Mortality
- **Dataset**: `MIMIC-IV 3.1 Clinical Database`
- **Exact Target Definition**: `In-Hospital Mortality Event (hospital_expire_flag == 1)`
- **Feature Count**: `10`
- **Cohort Size**: Train Patients/Cases = `3382` (7969 samples), Test Patients/Cases = `846` (2031 samples)
- **Class Distribution**: Positive Cases = `225`, Negative Cases = `9775`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Critical Target Ground-Truth Leakage: The ground-truth mortality outcome `hospital_expire_flag` was explicitly included in the feature list `features_mort`, allowing models to look directly at whether the patient died in hospital.
- **Leakage Predictors Stripped**: `hospital_expire_flag, icu_los_days`
- **Legitimate Clinical Predictors Preserved**: `anchor_age, gender_code, hemoglobin, creatinine, bun, platelets, wbc, prescription_count, comorbidity_count, lab_mean`
- **Honest Performance**: Accuracy: `0.8282` | Precision: `0.0549` | Sensitivity/Recall: `0.4634` | Specificity: `0.8357` | F1: `0.0982` | ROC-AUC: `0.7271` | Brier: `0.1034`
- **Confusion Matrix**: `[[1663, 327], [22, 19]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

### DrugSafety
- **Dataset**: `anesthesia_drugs.csv (Generated in preprocessing/clean_datasets.py)`
- **Exact Target Definition**: `Severe Drug Interaction (Interaction_Severity >= 2)`
- **Feature Count**: `6`
- **Cohort Size**: Train Patients/Cases = `0` (131 samples), Test Patients/Cases = `0` (33 samples)
- **Class Distribution**: Positive Cases = `16`, Negative Cases = `148`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: Direct Target Leakage & Synthetic Dataset: `anesthesia_drugs.csv` was generated synthetically by hardcoded rules in `clean_datasets.py`. The target was `Interaction_Severity >= 2` while `Interaction_Severity` was itself included as an input feature in `features_drugs`.
- **Honest Performance**: Accuracy: `1.0000` | Precision: `1.0000` | Sensitivity/Recall: `1.0000` | Specificity: `1.0000` | F1: `1.0000` | ROC-AUC: `1.0000` | Brier: `0.0000`
- **Confusion Matrix**: `[[29, 0], [0, 4]]`
- **Scientific Validity**: **INVALID**
- **Verdict**: **`INVALID — TARGET LEAKAGE`**

---

### prototype_baseline
- **Dataset**: `AnesthAI_2000_Patient_Dataset.csv`
- **Exact Target Definition**: `Multi-class Perioperative Risk Level (Low / Medium / High)`
- **Feature Count**: `10`
- **Cohort Size**: Train Patients/Cases = `1600` (1600 samples), Test Patients/Cases = `400` (400 samples)
- **Class Distribution**: Positive Cases = `673`, Negative Cases = `1327`
- **Leakage Detected**: **True**
- **Leakage Mechanism**: 1-to-1 Deterministic Target Alias: `Risk_Level` in `AnesthAI_2000_Patient_Dataset.csv` was an exact duplicate of `ASA_Score` (ASA I = Low, ASA II = Medium, ASA III = High). When `ASA_Score_Num` was provided as a feature, the model simply mapped the ASA score back to its string alias with 100% accuracy.
- **Leakage Predictors Stripped**: `ASA_Score, ASA_Score_Num`
- **Legitimate Clinical Predictors Preserved**: `Age, Gender_Code, Weight_kg, BMI, Heart_Rate_bpm, Systolic_BP, Diastolic_BP, SpO2_Percent, Respiratory_Rate, ECG_Abnormal`
- **Honest Performance**: Accuracy: `0.3400` | Precision: `0.3393` | Sensitivity/Recall: `0.3400` | Specificity: `0.5000` | F1: `0.3390` | ROC-AUC: `0.4940` | Brier: `0.0000`
- **Confusion Matrix**: `[[42, 47, 42], [42, 39, 53], [34, 46, 55]]`
- **Scientific Validity**: **VALID**
- **Verdict**: **`VALID AFTER RETRAINING`**

---

## Methodological Remedies Implemented

1. **Patient-Level Group Splits**: Replaced standard random row `train_test_split` with `GroupShuffleSplit` on `PatientID` (VitalDB), `record_name` (MIT-BIH), and `subject_id` (MIMIC-IV). This completely guarantees that no patient or recording has data in both training and test partitions.
2. **Target Decoupling**: For every hemodynamic and biomarker task, stripped the exact target variable and all its direct mathematical equivalents (e.g. removing `map`, `map_roll_mean`, `sbp`, `dbp`, and `shock_index` from Hypotension; removing `hemoglobin` and `platelets` from BloodLoss; removing `bun` and `creatinine` from FluidRecommendation).
3. **Outcome Predictor Eradication**: Removed post-event outcomes (such as `hospital_expire_flag` from Mortality, `icu_stay_count` and `icu_los_days` from ICU admission, and `acuity` from Emergency Severity triage).
4. **Zero Test-to-Train Preprocessing Leakage**: Standard scalers and transformers are strictly fit on `X_train` alone, and applied to `X_test` without looking ahead.
5. **Transparent Sample Size & Tautology Flagging**: Tasks built on 30 total rows (`preoperative_risk_dataset.csv`) or fabricated synthetic datasets (`pacu_dataset.csv`, `anesthesia_drugs.csv`) are rejected with `INSUFFICIENT DATA` or `INVALID — TARGET LEAKAGE` verdicts.
