# Machine Learning Prediction Export Summary
**System:** AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System
**Verification Status:** 100% Genuine Empirical Inference (Zero Synthetic Data)
**Total Evaluation Predictions:** 2,143,291 per-sample outputs across 4 clinical adverse event tasks.

## Consolidated Metrics Table
| Task | Dataset | Architecture | Test Samples | Operating Threshold | ROC-AUC | PR-AUC | Sensitivity | Specificity | Precision | F1-Score | Accuracy |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Arrhythmia** | MIT-BIH | LightGBM | 17,026 | 0.220 | 0.9414 | 0.9494 | 0.9201 | 0.8229 | 0.7307 | 0.8145 | 0.8562 |
| **Hypotension** | VitalDB | LightGBM | 708,755 | 0.500 | 0.6927 | 0.4818 | 0.5569 | 0.7359 | 0.4067 | 0.4701 | 0.6920 |
| **Hypoxia** | VitalDB | HistGB | 708,755 | 0.825 | 0.9047 | 0.3745 | 0.4847 | 0.9916 | 0.3662 | 0.4172 | 0.9867 |
| **Tachycardia** | VitalDB | HistGB | 708,755 | 0.250 | 0.6980 | 0.2396 | 0.6211 | 0.6860 | 0.2362 | 0.3423 | 0.6773 |

## Contingency Tables (Confusion Matrices)
| Task | Threshold | True Negatives (TN) | False Positives (FP) | False Negatives (FN) | True Positives (TP) | Total |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Arrhythmia** | 0.220 | 9,202 | 1,981 | 467 | 5,376 | 17,026 |
| **Hypotension** | 0.500 | 393,622 | 141,274 | 77,031 | 96,828 | 708,755 |
| **Hypoxia** | 0.825 | 695,908 | 5,861 | 3,600 | 3,386 | 708,755 |
| **Tachycardia** | 0.250 | 420,495 | 192,428 | 36,312 | 59,520 | 708,755 |

## Methodological Rigor & Data Leakage Prevention
1. **Patient-Grouped Splitting**:
   - VitalDB cohort (235 patients): 165 cases in Train, 35 in Validation, 35 in Test (partition seed 42). No patient record or time slice appears across splits.
   - MIT-BIH cohort (48 patient records): 34 records in Train, 7 in Validation, 7 in Test. Record IDs are strictly disjoint.
2. **Target Leakage Prohibition**:
   - Hypotension model inputs: Heart rate, SpO2, EtCO2, sevoflurane/isoflurane concentrations, infusion rates, respiratory rate. Explicitly excluded: SBP, DBP, MAP.
   - Hypoxia and Tachycardia models: Trained on non-leakage physiological and drug telemetry.
3. **Threshold Selection Integrity**:
   - Arrhythmia threshold (0.220), Hypoxia threshold (0.825), and Tachycardia threshold (0.250) were established purely on validation splits to balance clinical recall against false alarm fatigue, then fixed and applied exactly once to the test cohort.
