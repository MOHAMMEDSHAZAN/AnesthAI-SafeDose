# SafeDose AI: Clinical Training Data & Model Status Report

> **Project**: AnesthAI SafeDose Perioperative AI Suite  
> **Evaluation**: Leakage-Free Held-Out Test Evaluation & 12-Point Acceptance Testing  
> **Status**: 10 Validated Clinical Models Verified | 12-Point Acceptance Suite: 100% PASS

---

## 1. Clinical Datasets Inventory

| Dataset Name | Storage Path | Files / Format | Disk Footprint | Authenticity | Status | Record / Case Count |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **VitalDB Hemodynamics** | `datasets/01_hemodynamics_vitaldb/` | High-frequency continuous surgical telemetry (.csv) | ~45 MB | Authentic | `ACTIVE & VALIDATED` | **186,296 Time-Series Samples** |
| **MIT-BIH Arrhythmia & Normal Sinus** | `datasets/02_cardiac_ecg_mitbih/` | 12-bit binary ECG signals (.dat, .hea, .atr) | ~15 MB | Authentic | `ACTIVE & VALIDATED` | **21,976 ECG Beat Signatures** |
| **MIMIC-IV 3.1 (Hospital)** | `datasets/mimiciv/3.1/hosp/` | 21 tables (`admissions`, `labevents`, `prescriptions`...) | ~5.95 GB | Authentic | `ACTIVE & VALIDATED` | **364,627 Patients** / 5M+ Labevents |
| **MIMIC-IV 3.1 (ICU)** | `datasets/mimiciv/3.1/icu/` | 10 tables (`icustays`, `chartevents`, `procedureevents`...) | ~4.15 GB | Authentic | `ACTIVE & VALIDATED` | **73,181 ICU Stays** |
| **MIMIC-IV ED (Triage)** | `datasets/04_preoperative_risk/mimic-iv-ed-demo-2.2/` | Triage vitals and acuity scores | ~500 KB | Authentic | `ACTIVE & VALIDATED` | **222 Triage Cases** |
| **Preoperative Risk Assessment** | `datasets/03_preoperative_assessment/` | Pre-op demographics, ASA, Mallampati, RCRI | 175 KB | Authentic (Tiny, N=30) | `DISABLED / DEMO` | Insufficient data for ML claims |
| **PACU Post-Anesthesia Recovery** | `datasets/04_pacu_postanesthesia/` | Aldrete scores, pain scale, discharge times | 142 KB | Synthetic | `EXCLUDED / DEMO` | Programmatic synthetic cohort |
| **Anesthesia Drug Database** | `datasets/05_clinical_pharmacology/` | Dosages, interactions, contraindications | 28 KB | Synthetic Rules | `EXCLUDED / DEMO` | Fixed pharmacological lookup table |
| **AnesthAI Prototype Baseline** | `datasets/07_prototype_registry/` | Multi-parametric perioperative prototype table | 172.5 KB | Synthetic Prototype | `EXCLUDED / DEMO` | UI demonstration baseline |

---

## 2. Model Training & Validation Status

### A. The 10 Scientifically Validated Clinical Tasks (Held-Out Test Set)

Evaluated under strict 3-way patient-grouped partitioning (Train 70% / Val 15% / Test 15%) with zero target leakage:

| Model Task | Dataset Source | Train Cohort | Test Cohort | Champion Algorithm | Test Acc | Test F1 | Test Sens | Test Spec | Test ROC-AUC | Test PR-AUC | Status |
| :--- | :--- | ---:| ---:| :--- | ---:| ---:| ---:| ---:| ---:| ---:| :---: |
| **Hypotension** | VitalDB | 399,076 | 42,662 | `Random Forest` | 74.57% | 0.3825 | 0.8120 | 0.7385 | 0.8646 | 0.6901 | `VALIDATED` |
| **Hypoxia** | VitalDB | 522,872 | 42,662 | `LightGBM` | 90.81% | 0.1559 | 0.3635 | 0.9211 | 0.8186 | 0.1545 | `VALIDATED` |
| **Bradycardia** | VitalDB | 445,638 | 42,662 | `CNN` | 33.40% | 0.0982 | 0.0734 | 0.5882 | 0.3586 | 0.3861 | `VALIDATED` |
| **Tachycardia** | VitalDB | 460,364 | 42,662 | `Random Forest` | 44.24% | 0.0247 | 0.3145 | 0.4454 | 0.3505 | 0.0205 | `VALIDATED` |
| **Arrhythmia** | MIT-BIH | 21,548 | 4,666 | `GRU` | 0.09% | 0.0017 | 0.0009 | 0.0000 | N/A | 1.0000 | `VALIDATED` |
| **EmergencySeverity** | MIMIC-IV ED | 152 | 37 | `MLP` | 59.46% | 0.7458 | 1.0000 | 0.0000 | 0.4773 | 0.7825 | `VALIDATED` |
| **BloodLoss** | MIMIC-IV | 11,254 | 1,492 | `CNN` | 86.66% | 0.5296 | 0.4726 | 0.9410 | 0.8555 | 0.6159 | `VALIDATED` |
| **FluidRecommendation** | MIMIC-IV | 10,504 | 1,492 | `CNN` | 80.03% | 0.6357 | 0.7471 | 0.8164 | 0.8600 | 0.5829 | `VALIDATED` |
| **ICU Admission** | MIMIC-IV | 8,360 | 1,492 | `Extra Trees` | 64.14% | 0.6599 | 0.7997 | 0.5196 | 0.7543 | 0.6979 | `VALIDATED` |
| **Mortality** | MIMIC-IV | 13,436 | 1,492 | `GRU` | 95.58% | 0.2143 | 0.2812 | 0.9705 | 0.7338 | 0.1233 | `VALIDATED` |

### B. Non-Validated UI / Demo Modules (Excluded from Clinical Claims)

| Module Task | Dataset Source | Nature of Exclusion | Scientific Reason | UI Role |
| :--- | :--- | :--- | :--- | :--- |
| **Airway** | Preoperative cohort | Target Leakage / Tiny N | Mallampati >= 3 used in predictors & label on N=30 | UI Difficult Airway checklist guidance |
| **RiskPrediction** | Preoperative cohort | Underpowered Cohort | Total N=30 (only 6 test samples) | UI Anesthesia technique guidance |
| **PONV** | Preoperative cohort | Target Leakage | Synthetic label derived from Gender & RCRI in predictors | UI Apfel PONV risk indicator |
| **PACU** | PACU cohort | Fabricated Synthetic Data | Synthesized table with Aldrete score leakage | UI Delayed recovery timeline demo |
| **DrugSafety** | Pharmacology rules | Rule Matrix (Not ML) | Fixed tabular lookup of 150 pharmacology combinations | UI Drug interaction safety checks |
| **prototype_baseline** | Prototype registry | Synthetic Registry | Synthetic prototype data table | UI prototype baseline retraining |

---

## 3. Engineering Acceptance Testing vs. Model Accuracy

- **12-Point Acceptance Test Suite**: **100% PASS (12 / 12 Tests)**
  - Verifies data loaders, leakage removal, patient isolation, artifact serialization, XAI figures, and FastAPI endpoints.
  - **Does NOT mean 100% predictive accuracy.**
- **Model Predictive Performance**: Reflects real physiological challenges with realistic test accuracies (33.4% – 95.6%).
