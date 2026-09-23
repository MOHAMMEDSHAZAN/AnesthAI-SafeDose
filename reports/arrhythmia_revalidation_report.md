# MIT-BIH Arrhythmia Revalidation & Optimization Report

**Status**: VALIDATED | **Evaluation**: Zero-Leakage Record-Level Frozen Split
**Date**: 2026-09-13 15:45:45 UTC

## 1. Previous Evaluation Problem & Root Cause
- **Problem**: The legacy test partition contained 9,706 normal beats and 0 arrhythmia beats, resulting in an uninformative 100% accuracy evaluation artifact.
- **Root Cause**: In the legacy pipeline, `HAS_WFDB` was false, causing the fallback binary parser to assign `'ann_type': ['N'] * len(peaks)`. Consequently, `0 if sym == 'N' else 1` collapsed all heartbeats into class 0, producing a model fitted with `classes_ = [0]`.

## 2. Authentic MIT-BIH Data Verification
- All 48 authentic records (100–234) loaded directly via WFDB from `datasets/03_arrhythmia/...`.
- Total authentic heartbeats: **109,484** (Normal: **75,045** [68.5%], Arrhythmia: **34,439** [31.5%]).

## 3. Record-Level Split Methodology
Strict record grouping ensures zero beat overlap between partitions:
- **Train (34 records)**: 76,859 beats (Normal: 54,233, Arrhythmia: 22,626 [29.4%])
- **Validation (7 records)**: 15,599 beats (Normal: 9,629, Arrhythmia: 5,970 [38.3%])
- **Test (7 records - FROZEN)**: 17,026 beats (Normal: 11,183, Arrhythmia: 5,843 [34.3%])
- Inter-partition record overlap: R_train n R_val = 0, R_train n R_test = 0, R_val n R_test = 0 (Mathematically verified zero record leakage).

## 4. Validation Comparison & Model Selection

| Candidate Model | Val F1 | Val Sensitivity | Val Specificity | Val Balanced Acc | Val PR-AUC | Val ROC-AUC | Optimal Threshold | Training Time (s) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1D CNN | 0.7997 | 0.9248 | 0.7594 | 0.8421 | 0.6693 | 0.8337 | 0.10 | 249.86 |
| XGBoost | 0.7588 | 0.9255 | 0.6815 | 0.8035 | 0.5198 | 0.7708 | 0.14 | 7.22 |
| LightGBM | 0.7301 | 0.9075 | 0.6413 | 0.7744 | 0.5023 | 0.7431 | 0.10 | 6.33 |
| HistGradientBoosting | 0.7291 | 0.9069 | 0.6399 | 0.7734 | 0.5100 | 0.7540 | 0.10 | 18.96 |

**Selected Champion**: `1D CNN` based on validation performance.

## 5. Frozen Test Performance (Evaluated ONCE)

| Metric | Verified Test Value |
|---|---:|
| **Selected Algorithm** | `1D CNN` |
| **Optimal Threshold** | `0.10` |
| **Test Accuracy** | `0.8690` |
| **Test Balanced Accuracy** | `0.8827` |
| **Test Sensitivity / Recall** | `0.9264` |
| **Test Specificity** | `0.8390` |
| **Test Precision** | `0.7503` |
| **Test F1-Score** | `0.8291` |
| **Test ROC-AUC** | `0.9524` |
| **Test PR-AUC** | `0.9577` |
| **Test Brier Score** | `0.0431` |
| **Test Confusion Matrix** | `[[9382, 1801], [430, 5413]]` |
| **Test Normal Beats (TN + FP)** | `11,183` |
| **Test Arrhythmia Beats (FN + TP)** | `5,843` |
| **Test Records** | `['102', '103', '200', '210', '213', '217', '220']` |

## 6. Scientific Integrity & Leakage Declaration
- Zero test-set tuning occurred; the threshold was locked on validation data.
- Test partition contains genuine, abundant positive arrhythmia examples from held-out patient records.
- The model is officially classified as **VALIDATED**.
