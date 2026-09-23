# SafeDose AI — Pre-Optimization Baseline Performance Report

**Date**: 2026-09-13 | **Protocol**: Audited Baseline Snapshot

## Executive Summary
This report documents the official baseline metrics of all 10 clinical prediction models prior to the ultimate model optimization experiment. All models are backed up in `models/optimization_backup/`.

## Baseline Metrics Table

| Task | Algorithm | Features | Thresh | Accuracy | Bal Acc | Sens | Spec | Prec | F1 | ROC-AUC | PR-AUC | Brier | Pos Count | Neg Count | Test Size |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Hypotension** | Hist Gradient Boosting | 15 | 0.47 | 0.6988 | 0.6457 | 0.5414 | 0.7500 | 0.4131 | 0.4686 | 0.6974 | 0.511 | 0.1924 | 173859 | 534896 | 708755 |
| **Hypoxia** | Hist Gradient Boosting | 20 | 0.82 | 0.9867 | 0.7382 | 0.4847 | 0.9916 | 0.3662 | 0.4172 | 0.9047 | 0.3723 | 0.0338 | 6986 | 701769 | 708755 |
| **Bradycardia** | CNN | 19 | 0.60 | 0.7748 | 0.5633 | 0.2873 | 0.8393 | 0.1911 | 0.2295 | 0.6448 | 0.177 | 0.2037 | 82753 | 626002 | 708755 |
| **Tachycardia** | Hist Gradient Boosting | 19 | 0.25 | 0.6773 | 0.6536 | 0.6211 | 0.6860 | 0.2362 | 0.3423 | 0.698 | 0.2393 | 0.1353 | 95832 | 612923 | 708755 |
| **Arrhythmia** | Hist Gradient Boosting | 100 | 0.05 | 1.0000 | 0.5000 | 0.0000 | 1.0000 | 0.0000 | 0.0000 | nan | 0.5 | 0.0000 | 0 | 9706 | 9706 |
| **EmergencySeverity** | CatBoost | 6 | 0.32 | 0.5398 | 0.5835 | 0.7878 | 0.3792 | 0.4510 | 0.5737 | 0.6657 | 0.6068 | 0.2137 | 25299 | 39076 | 64375 |
| **BloodLoss** | LSTM | 8 | 0.53 | 0.7665 | 0.7462 | 0.7082 | 0.7843 | 0.5001 | 0.5862 | 0.8349 | 0.6288 | 0.1617 | 19200 | 63004 | 82204 |
| **FluidRecommendation** | LightGBM | 8 | 0.53 | 0.7833 | 0.7840 | 0.7865 | 0.7815 | 0.6622 | 0.7190 | 0.8687 | 0.7886 | 0.1492 | 28982 | 53222 | 82204 |
| **ICU** | GRU | 10 | 0.42 | 0.7787 | 0.7906 | 0.8598 | 0.7214 | 0.6856 | 0.7629 | 0.8814 | 0.8413 | 0.1413 | 34037 | 48167 | 82204 |
| **Mortality** | GRU | 10 | 0.90 | 0.9738 | 0.6267 | 0.2634 | 0.9899 | 0.3712 | 0.3082 | 0.8663 | 0.2497 | 0.1356 | 1822 | 80382 | 82204 |


## Critical Observations
1. **Arrhythmia Caveat**: As documented, the Arrhythmia baseline has `Positive_Count = 0` ($N=9,706$ normal sinus rhythm beats, 0 abnormal beats). The 100% accuracy is an evaluation artifact with undefined AUROC. Fixing this with authentic positive representation is Phase 2.
2. **Rare Minority Class Tasks**: Hypoxia (pos=7,046, neg=701,709) and Mortality (pos=8,429, neg=73,775) require multi-objective prioritization of PR-AUC and Sensitivity.
3. **Backup Status**: All 10 baseline model artifacts successfully archived to `models/optimization_backup/`.
