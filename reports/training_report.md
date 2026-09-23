# SafeDose AI Clinical ML Report - SafeDose Pipeline v1.0

Generated for AnesthAI Clinical Evaluation & Undergraduate Project.

## Overview of Dataset Loading & Cleaning
- **VitalDB**: Preprocessed hemodynamics signals. Missing fields imputed, continuous resampling configured.
- **MIMIC-IV Clinical & ED**: Aggregated triage, vitals, prescriptions and lab markers.
- **MIT-BIH Arrhythmia & Normal Sinus**: 12-bit binary signal parsing, annotations aligned.

## Algorithm Comparison & Performance Grid

| Model Name | Selected Best Algorithm | Train Samples | Test Samples | Features | Training Seconds | Test Accuracy | Precision | Recall | F1-Score | ROC AUC | Sensitivity | Specificity | Brier Score |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Hypotension | Decision Tree | 314886 | 46574 | 24 | 191.668 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Hypoxia | Decision Tree | 365560 | 46574 | 24 | 172.918 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Bradycardia | Voting Ensemble | 275652 | 46574 | 24 | 144.457 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0002 |
| Tachycardia | Decision Tree | 329614 | 46574 | 24 | 132.533 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Arrhythmia | Random Forest | 17617 | 4405 | 100 | 721.794 | 0.9930 | 0.9974 | 0.9867 | 0.9921 | 0.9991 | 0.9867 | 0.9980 | 0.0082 |
| RiskPrediction | Decision Tree | 24 | 6 | 21 | 9.904 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.5000 | 0.0000 |
| PONV | Logistic Regression | 24 | 6 | 21 | 20.109 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0214 |
| Airway | Decision Tree | 32 | 6 | 21 | 54.663 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| EmergencySeverity | Logistic Regression | 177 | 45 | 7 | 16.448 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0011 |
| PACU | Logistic Regression | 772 | 100 | 9 | 51.952 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0025 |
| BloodLoss | CatBoost | 77900 | 10000 | 7 | 168.690 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0001 |
| FluidRecommendation | Random Forest | 77106 | 10000 | 6 | 138.763 | 0.9999 | 0.9972 | 1.0000 | 0.9986 | 1.0000 | 1.0000 | 0.9999 | 0.0003 |
| ICU | Decision Tree | 46236 | 10000 | 10 | 256.082 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| Mortality | Decision Tree | 68122 | 10000 | 11 | 57.059 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 |
| DrugSafety | Logistic Regression | 228 | 33 | 6 | 31.702 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0035 |
| prototype_baseline | Logistic Regression | 1600 | 400 | 11 | 66.084 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.5000 | 0.0000 |


## Explainable AI (XAI) Plots Summary
Plots detailing Receiver Operating Characteristics, Precision-Recall Curves, and Feature Importance listings are saved under `reports/plots/`.
