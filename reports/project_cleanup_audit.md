# AnesthAI SafeDose — Comprehensive Project Cleanup Audit

**Date:** September 11, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Status:** Audit Complete — Awaiting Approval Before Deletion  

---

## Executive Summary

This audit catalogs every module, model artifact, dataset, configuration file, and temporary folder within the `AnesthAI-SafeDose` project repository. The objective is to transition the codebase from an exploratory research/development state into a clean, scientifically validated, deployment-ready production standard for IEEE publication.

### Core Guiding Principle: 10 Validated Tasks Only
Only **10 clinical tasks** are scientifically validated with clinical datasets and verified pipelines:
1. **Hypotension** (VitalDB — Random Forest)
2. **Hypoxia** (VitalDB — LightGBM)
3. **Bradycardia** (VitalDB — ClinicalCNN)
4. **Tachycardia** (VitalDB — Random Forest)
5. **Arrhythmia** (MIT-BIH Arrhythmia — ClinicalGRU)
6. **EmergencySeverity** (MIMIC-IV-ED v2.2 — MLP)
7. **BloodLoss** (MIMIC-IV 3.1 — ClinicalCNN)
8. **FluidRecommendation** (MIMIC-IV 3.1 — ClinicalCNN)
9. **ICU** (MIMIC-IV 3.1 — Extra Trees)
10. **Mortality** (MIMIC-IV 3.1 — ClinicalGRU)

All other tasks (`Airway`, `RiskPrediction`, `PONV`, `PACU`, `DrugSafety`, `prototype_baseline`) were unverified mock/rule/demo prototypes and are designated for safe removal or decoupling.

---

## 1. Inventory by Category

| Category | Path | Total Files | Size (MB) | Purpose | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Source** | `src/` | 41 | 0.81 MB | React 18 / TypeScript / Vite UI | **RETAIN & CLEAN** (Decouple 6 demo models) |
| **Backend API** | `backend/` | 4 | 0.21 MB | FastAPI `main_api.py` | **RETAIN & CLEAN** (Enforce 10 validated tasks) |
| **Data Preprocessing** | `preprocessing/` | 3 | 0.08 MB | Unified chunked data loader | **RETAIN** (Canonical data pipeline) |
| **Training Pipeline** | `training/` | 4 | 0.21 MB | Multi-task GPU training pipeline | **RETAIN** (Canonical scientific training) |
| **Validated Model Payloads**| `models/*.pkl` (10 tasks)| 15 | ~81.1 MB | Audited champion payloads (.pkl) | **STRICTLY PROTECT & RETAIN** |
| **Legacy Standalone Models**| `models/*.(pt\|zip)` | 115 | ~10.2 MB | Standalone .pt / TabNet .zip | **MOVE TO BACKUP & REMOVE** |
| **Unvalidated Model Files** | `models/(Airway\|PACU...)`| 16 | ~2.5 MB | Demo/prototype model weights | **MOVE TO BACKUP & REMOVE** |
| **Model Backup Folders** | `models/*backup*/` | ~20 | ~15.0 MB | Pre-audit snapshot backups | **MOVE TO BACKUP & REMOVE** |
| **Authentic Clinical Data** | `datasets/` (VitalDB, MIT, MIMIC)| 2,128 | 11,690 MB | Authentic training datasets | **STRICTLY PROTECT & RETAIN** |
| **Research Reports** | `reports/` | 63 | 4.06 MB | IEEE validation & leakage audits | **RETAIN** |
| **Kaggle Training Package** | `kaggle_full_training/` | 985 | 10,486 MB | Prepared Kaggle source bundle | **RETAIN CANONICAL FOLDER** |
| **Kaggle Zip (Original)** | `kaggle_full_training.zip` | 1 | 10,224 MB | Original zip with wrapper | **RETAIN AS ARCHIVE (User constraint)** |
| **Kaggle Zip (Fixed)** | `kaggle_full_training_fixed.zip`| 1 | 10,255 MB | Verified root-structured zip | **RETAIN (Final verified upload)** |
| **Old Bundle Zip** | `safedose_training_bundle.zip`| 1 | 29.9 MB | Early small training bundle | **MOVE TO BACKUP & REMOVE** |
| **External Template** | `Clinic-1.0.0/` | 172 | 13.62 MB | Unused HTML web template | **MOVE TO BACKUP & REMOVE** |
| **Old Backups Directory** | `backups/` | 197 | 21.37 MB | Legacy code/model snapshots | **MOVE TO BACKUP & REMOVE** |
| **Temporary Build/Cache** | `catboost_info/`, `__pycache__`| ~20 | ~0.5 MB | Temporary training & python cache| **SAFE REMOVE** |
| **One-off Scratch Scripts** | Root test/upload scripts | 9 | ~0.08 MB | Ad-hoc one-off python scripts | **ARCHIVE TO SCRATCH & CLEAN** |

---

## 2. Detailed Evaluation of Potentially Removable Items

### A. Model Artifacts (`models/`)

| File / Folder | What is it? | Referenced? | Backend Req? | Safe to Remove? | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `models/Hypotension.pkl`, `Hypotension_Random_Forest.pkl` | Champion Sklearn Payload | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/Hypoxia.pkl`, `Hypoxia_LightGBM.pkl` | Champion Sklearn Payload | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/Tachycardia.pkl`, `Tachycardia_Random_Forest.pkl` | Champion Sklearn Payload | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/EmergencySeverity.pkl`, `EmergencySeverity_MLP.pkl`| Champion Sklearn Payload | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/ICU.pkl`, `ICU_Extra_Trees.pkl` | Champion Sklearn Payload | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/Arrhythmia.pkl`, `Arrhythmia_GRU.pkl` | Champion PyTorch (torch_state_dict) | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/BloodLoss.pkl`, `BloodLoss_CNN.pkl` | Champion PyTorch (torch_state_dict) | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/Bradycardia.pkl`, `Bradycardia_CNN.pkl` | Champion PyTorch (torch_state_dict) | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/FluidRecommendation.pkl`, `FluidRecommendation_CNN.pkl` | Champion PyTorch (torch_state_dict) | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/Mortality.pkl`, `Mortality_GRU.pkl` | Champion PyTorch (torch_state_dict) | YES | YES | **NO (PROTECT)** | Retain as canonical champion |
| `models/*_GRU.pt`, `*_CNN.pt` (standalone) | Legacy unverified raw weights | NO (pkl has state_dict)| NO | **YES** | Backup & Remove |
| `models/*_LSTM.pt`, `*_Transformer.pt`, `*_CNN_LSTM.pt` | Experimental deep learning weights | NO | NO | **YES** | Backup & Remove |
| `models/*_TabNet.zip` | Obsolete TabNet checkpoints | NO | NO | **YES** | Backup & Remove |
| `models/Airway.*`, `RiskPrediction.*`, `PONV.*`, `PACU.*`, `DrugSafety.*`, `prototype_baseline.*` | Unverified demo models | NO (after decouple) | NO | **YES** | Backup & Remove |
| `models/pretraining_backup_*`, `models/unverified_backup_*` | Old local model backups | NO | NO | **YES** | Backup & Remove |

---

### B. Unvalidated Modules & UI Cleanliness (`src/`)

| Component / View | Current State | Issue | Required Change |
| :--- | :--- | :--- | :--- |
| `src/views/ClinicalModels.tsx` | Lists 16 models in model picker (including Airway, RiskPrediction, PONV, PACU, DrugSafety, prototype_baseline) | Exposes unvalidated demo tasks | Filter model list to strictly the 10 validated tasks. Remove input forms for removed demo tasks. |
| `src/views/AnalyticsPanel.tsx` | Mock table contains PACU, PONV, DrugSafety, prototype_baseline | Displays unverified 100% metrics for demo tasks | Clean model comparison table to only display the 10 scientific tasks. Retain interactive analytics for validated models. |
| `src/views/PACU.tsx` | Calls `/predict/PACU` | Calls unvalidated demo endpoint | Retain PACU view for clinical checklist/recovery score (Aldrete criteria), but decouple the demo ML call. |
| `backend/main_api.py` | Defines `DEMO_NON_VALIDATED_TASKS`, allows loading unvalidated pkl files | Loads demo models into memory if present | Remove `DEMO_NON_VALIDATED_TASKS`. Only load the 10 validated tasks. Set `demo_models_count: 0`. |

---

### C. Temporary Files & External Artifacts

| Item | What is it? | Action Plan |
| :--- | :--- | :--- |
| `Clinic-1.0.0/` | Extracted 3rd-party HTML landing template (13.6 MB, 172 files) | Move to `cleanup_backup/` and delete from project root |
| `catboost_info/` | CatBoost training cache directory | Delete safely |
| `backups/` | Stale backup folder from earlier iterations (21.4 MB) | Move to `cleanup_backup/` and delete from project root |
| `safedose_training_bundle.zip` | Obsolete early ZIP (31.4 MB) | Move to `cleanup_backup/` and delete from project root |
| `citi_completion_report_mock.*` | Synthetic compliance mockup | Move to `cleanup_backup/` |
| `detailed_inspection.py`, `inspect_5_dl_models.py`, `test_dl_load.py`, `verify_phase1_backend.py` | Scratch exploration scripts | Archive in `cleanup_backup/` |

---

## 3. GitHub & Security Pre-Check

- `.gitignore` verified:
  - `datasets/` containing restricted MIMIC data is ignored.
  - `.env` containing local secrets is ignored.
  - `kaggle_full_training*.zip` (huge archives) are ignored.
- No secrets or API keys are embedded in source code.
- No MIMIC raw data will be committed or tracked.
