# SafeDose AI Clinical ML Report - SafeDose Pipeline v1.0

Generated for AnesthAI Clinical Evaluation & Undergraduate Project.

## Overview of Dataset Loading & Cleaning
- **VitalDB**: Preprocessed hemodynamics signals. Missing fields imputed, continuous resampling configured.
- **MIMIC-IV Clinical & ED**: Aggregated triage, vitals, prescriptions and lab markers.
- **MIT-BIH Arrhythmia & Normal Sinus**: 12-bit binary signal parsing, annotations aligned.

## Algorithm Comparison & Performance Grid

| Model Name | Selected Best Algorithm | Test Accuracy | F1-Score | ROC AUC | Sensitivity | Specificity | Brier Score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hypotension | Decision Tree | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Hypoxia | Decision Tree | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Bradycardia | Decision Tree | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Tachycardia | Decision Tree | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Arrhythmia | XGBoost | 0.9909 | 0.9898 | 0.9991 | 0.9867 | 0.9943 | 0.0073 |
| RiskPrediction | Logistic Regression | 0.8333 | 0.7619 | 0.9259 | 0.8333 | 0.5000 | 0.0000 |
| PONV | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0214 |
| Airway | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0150 |
| EmergencySeverity | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0011 |
| PACU | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0025 |
| FluidRecommendation | Decision Tree | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Mortality | XGBoost | 0.9273 | 0.3333 | 0.6763 | 0.3333 | 0.9615 | 0.0830 |
| DrugSafety | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0035 |


## Explainable AI (XAI) Plots Summary
Plots detailing Receiver Operating Characteristics, Precision-Recall Curves, and Feature Importance listings are saved under `reports/plots/`.
