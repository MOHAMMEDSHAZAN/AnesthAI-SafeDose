# SafeDose AI — Demo Training & Debug Pipeline Report

> [!WARNING]
> **CLASSIFICATION: DEMO / DEBUG ONLY — NOT CLINICALLY VALIDATED**  
> This model was trained exclusively on the limited PhysioNet MIMIC-IV-ED Demo v2.2 subset (222 stays across 64 subjects).  
> **It is strictly prohibited from being presented as clinical performance or replacing the full MIMIC-IV-ED model.**

---

## 1. Demo Pipeline Purpose
- Validates data-loader parsing of all 6 MIMIC-IV-ED files (`edstays`, `triage`, `vitalsign`, `diagnosis`, `medrecon`, `pyxis`).
- Verifies subject-grouped split mechanics on ED stay cohorts.
- Confirms end-to-end training and inference execution for debug and smoke testing.

## 2. Cohort Specifications
| Parameter | Value |
| :--- | :--- |
| **Dataset Source** | PhysioNet MIMIC-IV-ED Demo v2.2 (`datasets/04_preoperative_risk/mimic-iv-ed-demo-2.2/`) |
| **Total Stays** | 222 |
| **Unique Subjects** | 64 |
| **Train Partition** | 147 stays (44 subjects) |
| **Val Partition** | 38 stays (10 subjects) |
| **Test Partition** | 37 stays (10 subjects) |
| **Subject Overlap** | **0 (Zero patient overlap)** |
| **Predictor Features** | `temperature`, `heartrate`, `resprate`, `o2sat`, `sbp`, `dbp` |
| **Target Variable** | Acuity <= 2 (High Acuity / Resuscitation / Emergent) |

## 3. Demo Model Performance
| Metric | Value |
| :--- | :--- |
| **Selected Algorithm** | `MLP` |
| **Optimal Threshold** | `0.35` |
| **Test Accuracy** | `0.5405` |
| **Test Precision** | `0.5714` |
| **Test Recall / Sensitivity** | `0.9091` |
| **Test Specificity** | `0.0000` |
| **Test F1-Score** | `0.7018` |
| **Test ROC-AUC** | `0.4636` |
| **Test PR-AUC** | `0.6019` |
| **Test Brier Score** | `0.2750` |
| **Confusion Matrix** | `[[0, 15], [2, 20]]` |

## 4. Storage Locations
- **Model Payload**: `models/demo/EmergencySeverity_DEMO.pkl`
- **Report Location**: `reports/demo_training_report.md` and `reports/demo/demo_training_report.md`
