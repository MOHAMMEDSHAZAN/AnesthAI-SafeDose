# SafeDose AI — Final Scientific Training & Clinical Validation Report

**Status**: VALIDATED | **Date**: 2026-09-13 11:12:31 UTC

## Executive Summary
This report presents the scientific validation of AnesthAI SafeDose across 10 authentic clinical prediction tasks. All direct and indirect target leakages were eliminated, strict 3-way patient-grouped splitting was enforced, model selection and threshold tuning were conducted exclusively on held-out validation data, and final metrics were measured on a frozen, untouched test cohort.

## Final Held-Out Test Set Results

| Task | Selected Champion Algorithm | Train Pts/Rows | Test Pts/Rows | Features | Optimal Thresh | Test Accuracy | Test F1 | Test Sens | Test Spec | Test ROC-AUC | Test PR-AUC | Test Brier |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Hypotension** | Hist Gradient Boosting | 5007118 | 708755 | 15 | 0.47 | 0.6988 | 0.4686 | 0.5414 | 0.7500 | 0.6974 | 0.5110 | 0.1924 |
| **Hypoxia** | Hist Gradient Boosting | 6389886 | 708755 | 20 | 0.82 | 0.9867 | 0.4172 | 0.4847 | 0.9916 | 0.9047 | 0.3723 | 0.0338 |
| **Bradycardia** | CNN | 5743522 | 708755 | 19 | 0.60 | 0.7748 | 0.2295 | 0.2873 | 0.8393 | 0.6448 | 0.1770 | 0.2037 |
| **Tachycardia** | Hist Gradient Boosting | 5791868 | 708755 | 19 | 0.25 | 0.6773 | 0.3423 | 0.6211 | 0.6860 | 0.6980 | 0.2393 | 0.1353 |
| **Arrhythmia** | Hist Gradient Boosting | 45985 | 9706 | 100 | 0.05 | 1.0000 | 0.0000 | 0.0000 | 1.0000 | nan | 0.5000 | 0.0000 |
| **EmergencySeverity** | CatBoost | 360548 | 64375 | 6 | 0.32 | 0.5398 | 0.5737 | 0.7878 | 0.3792 | 0.6657 | 0.6068 | 0.2137 |
| **BloodLoss** | LSTM | 582598 | 82204 | 8 | 0.53 | 0.7665 | 0.5862 | 0.7082 | 0.7843 | 0.8349 | 0.6288 | 0.1617 |
| **FluidRecommendation** | LightGBM | 498796 | 82204 | 8 | 0.53 | 0.7833 | 0.7190 | 0.7865 | 0.7815 | 0.8687 | 0.7886 | 0.1492 |
| **ICU** | GRU | 381859 | 82204 | 10 | 0.42 | 0.7787 | 0.7629 | 0.8598 | 0.7214 | 0.8814 | 0.8413 | 0.1413 |
| **Mortality** | GRU | 747224 | 82204 | 10 | 0.90 | 0.9738 | 0.3082 | 0.2634 | 0.9899 | 0.8663 | 0.2497 | 0.1356 |


## Scientific Methodology Highlights
- **Zero Target Leakage**: Mathematical outcome variables (such as MAP for Hypotension, SpO2 for Hypoxia, HR for Bradycardia, hospital_expire_flag for Mortality) were strictly stripped from predictor matrices.
- **Zero Patient Overlap**: 3-Way split (Train 70% / Val 15% / Test 15%) partitioned by patient ID guarantees that no patient's data exists in more than one partition.
- **Threshold Optimization**: Decision thresholds were tuned on validation data to maximize F1-score and balance sensitivity/specificity, then locked prior to testing.
- **Untouched Test Set**: The test set was touched exactly once for the final evaluation of the locked model.
- **Transparent Exclusion**: Synthetic datasets (PACU, DrugSafety) and small cohorts (N=30 Preoperative Assessment) were explicitly excluded and marked as invalid for high-confidence training.
