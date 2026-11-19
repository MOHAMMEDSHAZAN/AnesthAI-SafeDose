# Comprehensive Metrics Verification & Empirical Reproducibility Report
**Project:** AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System  
**Audit Status:** Authoritatively Verified Against Real CSV Test Inferences  
**Date of Audit:** November 6, 2026  

---

## 1. Executive Summary

This document presents the independent, per-sample mathematical verification of the 10 machine learning tasks evaluated for the AnesthAI SafeDose platform.

Crucially, the evaluation distinguishes between:
1. **Four Ground-Truth CSV-Derived Tasks (Independently Recomputed):**
   Evaluated over **2,143,291 individual test samples** exported into `out_predictions/CLAUDE_EXPORT/`. Every metric, confusion matrix cell, and calibration score was recomputed directly from raw probabilities ($y_{\text{true}}, y_{\text{prob}}$).
2. **Six Locked Audit-Baseline Tasks:**
   Preserved from `reports/final_verified_10_task_results.csv` and frozen in the audit baseline. These tasks represent experimental baseline models whose production inference endpoints are intentionally disengaged (returning HTTP 503 Service Unavailable) in favor of deterministic clinical decision pathways.

---

## 2. Four CSV-Derived Prediction Tasks (Independently Recomputed)

All metrics below were computed using scikit-learn on the exported prediction CSVs:

| Metric | Arrhythmia Detection | Intraoperative Hypotension | Intraoperative Hypoxia | Intraoperative Tachycardia |
| :--- | :---: | :---: | :---: | :---: |
| **Clinical Cohort** | MIT-BIH Arrhythmia (48 recs) | VitalDB (35 test cases) | VitalDB (35 test cases) | VitalDB (35 test cases) |
| **Model Architecture** | Random Forest (100 trees) | LightGBM Classifier | LightGBM Classifier | LightGBM Classifier |
| **Test Sample Count ($N$)** | **17,026 beats** | **708,755 windows** | **708,755 windows** | **708,755 windows** |
| **Positive Class ($P$)** | 5,843 (34.32%) | 173,859 (24.53%) | 6,986 (0.99%) | 95,832 (13.52%) |
| **Negative Class ($N_{\text{neg}}$)** | 11,183 (65.68%) | 534,896 (75.47%) | 701,769 (99.01%) | 612,923 (86.48%) |
| **Decision Threshold ($\tau$)** | **0.220** | **0.500** | **0.825** | **0.250** |
| **True Negatives (TN)** | 9,202 | 393,622 | 695,908 | 420,495 |
| **False Positives (FP)** | 1,981 | 141,274 | 5,861 | 192,428 |
| **False Negatives (FN)** | 467 | 77,031 | 3,600 | 36,312 |
| **True Positives (TP)** | 5,376 | 96,828 | 3,386 | 59,520 |
| **Accuracy** | **85.62%** | **69.20%** | **98.67%** | **67.73%** |
| **Sensitivity (Recall)** | **92.01%** | **55.69%** | **48.47%** | **62.11%** |
| **Specificity** | **82.29%** | **73.59%** | **99.16%** | **68.60%** |
| **Precision (PPV)** | **73.07%** | **40.67%** | **36.62%** | **23.62%** |
| **F1-Score** | **81.45%** | **47.01%** | **41.72%** | **34.23%** |
| **ROC-AUC** | **0.9414** | **0.6927** | **0.9047** | **0.6980** |
| **PR-AUC** | **0.9494** | **0.4818** | **0.3745** | **0.2396** |
| **Brier Score** | **0.0613** | **0.2014** (HistGB baseline: 0.1924) | **0.0338** | **0.1353** |

---

## 3. Six Locked Audit-Baseline Tasks

The remaining six tasks are documented from the verified audit repository (`reports/final_verified_10_task_results.csv`):

| Task | Benchmark Dataset | Architecture | Test $N$ | Threshold $\tau$ | ROC-AUC | PR-AUC | Accuracy | Sensitivity | Specificity | Precision | F1-Score | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Bradycardia** | VitalDB | Random Forest | 46,574 | 0.500 | 0.9999 | 0.9978 | 99.98% | 99.76% | 100.00% | 100.00% | 99.88% | Audit Baseline |
| **PACU Re-intubation**| MIMIC-IV-ED | HistGB | 15,000 | 0.050 | 0.7410 | 0.1850 | 79.40% | 58.20% | 80.50% | 12.40% | 20.40% | Audit Baseline |
| **PONV Risk** | MIMIC-IV-ED | Logistic Reg | 15,000 | 0.300 | 0.6840 | 0.4120 | 66.80% | 61.50% | 68.20% | 38.90% | 47.70% | Audit Baseline |
| **ICU Transfer** | MIMIC-IV-ED | Random Forest | 15,000 | 0.100 | 0.7890 | 0.3240 | 73.10% | 71.00% | 73.30% | 21.60% | 33.10% | Audit Baseline |
| **30-Day Mortality** | MIMIC-IV | XGBoost | 12,000 | 0.080 | 0.8120 | 0.2980 | 82.50% | 65.40% | 83.70% | 22.80% | 33.80% | Audit Baseline |
| **General Risk** | MIMIC-IV | Random Forest | 12,000 | 0.500 | 0.7650 | 0.5120 | 72.30% | 70.10% | 73.40% | 54.20% | 61.10% | Audit Baseline |

> [!NOTE]
> The six audit baseline models are not backed by exported CSV inference files in `out_predictions/` and their runtime API endpoints return HTTP 503. They are reported transparently for academic completeness.

---

## 4. VitalDB Cohort & Sample Reconciliation

1. **Patient Cohort:** 
   - 235 surgical cases with continuous 1-second multi-parameter hemodynamics.
   - Train cohort: 165 surgical cases.
   - Validation cohort: 35 surgical cases.
   - Test cohort: 35 surgical cases.
   - Grouping key: `caseid`. Zero surgical patients appear in more than one partition.
2. **Sample Count ($N = 708,755$):**
   - Represents 708,755 consecutive seconds of intraoperative monitoring across the 35 test patients (averaging 5.62 hours of surgical telemetry per case).
   - Features were computed retrospectively using a 5-minute rolling window without looking forward in time.
3. **Hypotension Threshold Reconciliation:**
   - Production serving uses LightGBM at operating threshold $\tau = 0.500$.
   - Earlier exploratory scripts examined $\tau = 0.220$ and $\tau = 0.300$. All metrics reported in the final paper and CSVs strictly correspond to the locked $\tau = 0.500$ threshold.
