# SafeDose AI Clinical ML Report - SafeDose Pipeline v1.0

Generated for AnesthAI Clinical Evaluation & Undergraduate Project.

## Overview of Dataset Loading & Cleaning
- **VitalDB**: Preprocessed hemodynamics signals. Missing fields imputed, continuous resampling configured.
- **MIMIC-IV Clinical & ED**: Aggregated triage, vitals, prescriptions and lab markers.
- **MIT-BIH Arrhythmia & Normal Sinus**: 12-bit binary signal parsing, annotations aligned.

## Algorithm Comparison & Performance Grid

| Model Name | Selected Best Algorithm | Test Accuracy | F1-Score | ROC AUC | Sensitivity | Specificity | Brier Score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hypotension | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0019 |
| Hypoxia | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Bradycardia | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0017 |
| Tachycardia | Decision Tree | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| RiskPrediction | Extra Trees | 1.0000 | 1.0000 | 0.5000 | 1.0000 | 0.5000 | 0.0000 |
| PONV | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0138 |
| Airway | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0103 |
| EmergencySeverity | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0042 |
| PACU | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0259 |
| BloodLoss | Logistic Regression | 1.0000 | 1.0000 | nan | 1.0000 | 0.0000 | 0.0000 |
| FluidRecommendation | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| DrugSafety | Logistic Regression | 1.0000 | 1.0000 | nan | 1.0000 | 0.0000 | 0.0000 |
| Mortality | Random Forest | 0.8727 | 0.2222 | 0.5441 | 0.2500 | 0.9216 | 0.1033 |


## Explainable AI (XAI) Plots Summary
Plots detailing Receiver Operating Characteristics, Precision-Recall Curves, and Feature Importance listings are saved under `backend/reports/plots/`.
