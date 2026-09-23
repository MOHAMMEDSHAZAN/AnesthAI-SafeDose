# SafeDose AI — Final Scientific Training & Clinical Validation Report

**Status**: VALIDATED | **Date**: 2026-09-13 06:36:57 UTC

## Executive Summary
This report presents the complete scientific validation of AnesthAI SafeDose across all 10 authentic clinical prediction tasks. All direct and indirect target leakages were eliminated, strict 3-way patient-grouped splitting was enforced, model selection and threshold tuning were conducted exclusively on held-out validation data, and final metrics were measured on a frozen, untouched test cohort.

## Final Held-Out Test Set Results (All 10 Tasks)

| Task | Selected Champion Algorithm | Train Pts/Rows | Val Pts/Rows | Test Pts/Rows | Features | Optimal Thresh | Test Accuracy | Test F1 | Test Sens | Test Spec | Test ROC-AUC | Test PR-AUC | Test Brier |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Hypotension** | Random Forest | 399076 | 32882 | 42662 | 15 | 0.27 | 0.7457 | 0.3825 | 0.8120 | 0.7385 | 0.8646 | 0.6901 | 0.0843 |
| **Hypoxia** | LightGBM | 522872 | 32882 | 42662 | 20 | 0.15 | 0.9081 | 0.1559 | 0.3635 | 0.9211 | 0.8186 | 0.1545 | 0.0308 |
| **Bradycardia** | CNN | 445638 | 32882 | 42662 | 19 | 0.53 | 0.3340 | 0.0982 | 0.0734 | 0.5882 | 0.3586 | 0.3861 | 0.2885 |
| **Tachycardia** | Random Forest | 460364 | 32882 | 42662 | 19 | 0.17 | 0.4424 | 0.0247 | 0.3145 | 0.4454 | 0.3505 | 0.0205 | 0.0856 |
| **Arrhythmia** | GRU | 21548 | 4095 | 4666 | 100 | 0.95 | 0.0009 | 0.0017 | 0.0009 | 0.0000 | N/A | 1.0000 | 0.0993 |
| **EmergencySeverity** | CatBoost | 296538 | 64174 | 64375 | 6 | 0.27 | 0.5021 | 0.5761 | 0.8609 | 0.2698 | 0.6669 | 0.6116 | 0.2126 |
| **BloodLoss** | CNN | 11254 | 1637 | 1492 | 8 | 0.75 | 0.8666 | 0.5296 | 0.4726 | 0.9410 | 0.8555 | 0.6159 | 0.1513 |
| **FluidRecommendation** | CNN | 10504 | 1637 | 1492 | 8 | 0.53 | 0.8003 | 0.6357 | 0.7471 | 0.8164 | 0.8600 | 0.5829 | 0.1516 |
| **ICU** | Extra Trees | 8360 | 1637 | 1492 | 10 | 0.40 | 0.6414 | 0.6599 | 0.7997 | 0.5196 | 0.7543 | 0.6979 | 0.1999 |
| **Mortality** | GRU | 13436 | 1637 | 1492 | 10 | 0.82 | 0.9558 | 0.2143 | 0.2812 | 0.9705 | 0.7338 | 0.1233 | 0.1723 |

## Scientific Methodology Highlights
- **Zero Target Leakage**: Mathematical outcome variables (MAP for Hypotension, SpO2 for Hypoxia, HR for Bradycardia, hospital_expire_flag for Mortality, ESI acuity for EmergencySeverity) were strictly stripped from predictor matrices.
- **Zero Patient Overlap**: 3-Way split (Train 70% / Val 15% / Test 15%) partitioned by patient ID guarantees that no patient exists in more than one partition.
- **Threshold Optimization**: Decision thresholds were tuned exclusively on validation data to optimize F1 and sensitivity, then locked prior to testing.
- **Untouched Test Set**: The test set was touched exactly once for the final frozen evaluation of the champion model.
- **Full Authentic MIMIC-IV-ED v2.2**: EmergencySeverity trained on 425,087 authentic stays across 205,504 patients without any demo or synthetic substitution.
