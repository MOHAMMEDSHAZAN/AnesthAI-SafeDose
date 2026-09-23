# IEEE Paper Optimization Update Report — AnesthAI SafeDose

**Date:** September 13, 2026  
**Document Purpose:** Documents the optimization cycle findings, model selection decisions, hyperparameters, thresholds, and caveats to ensure future IEEE paper revisions remain synchronized with project reality.

---

## 1. Summary of Optimization Cycle Decisions
- **Models Retained:** All 10 pre-existing validated champion models were systematically backed up to `models/pre_optimization/` and retained as production champions in `models/`.
- **Reasoning:** In adherence to the scientific improvement acceptance criteria (Section 23), controlled hyperparameter and decision-threshold tuning on validation partitions confirmed that the baseline models represent the empirical optimal trade-off (Pareto frontier) under leakage-free conditions. Replacing them with marginally altered configurations produced no statistically meaningful validation gain while risking calibration drift.
- **Model Interface Stability:** The dual-naming artifact format (`{Task}.pkl` and `{Task}_{Algorithm}.pkl`) was preserved. Zero modifications were required for backend inference or FastAPI `/health` compatibility.

---

## 2. Definitive Model Specifications & Final Test Metrics

| Task | Dataset | Architecture / Model | Feature Count | Tuned Threshold | Test Accuracy | Test F1 | Test Sens | Test Spec | Test AUROC | Test PR-AUC | Test Brier |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hypotension** | VitalDB | HistGradientBoosting | 15 | 0.475 | 0.6988 | 0.4686 | 0.5414 | 0.7500 | 0.6974 | 0.5110 | 0.1924 |
| **Hypoxia** | VitalDB | HistGradientBoosting | 20 | 0.825 | 0.9867 | 0.4172 | 0.4847 | 0.9916 | 0.9047 | 0.3723 | 0.0338 |
| **Bradycardia** | VitalDB | PyTorch 1D-CNN | 19 | 0.600 | 0.7748 | 0.2295 | 0.2873 | 0.8393 | 0.6448 | 0.1770 | 0.2037 |
| **Tachycardia** | VitalDB | HistGradientBoosting | 19 | 0.250 | 0.6773 | 0.3423 | 0.6211 | 0.6860 | 0.6980 | 0.2393 | 0.1353 |
| **Arrhythmia\*** | MIT-BIH | HistGradientBoosting | 100 | 0.050 | 1.0000 | 0.0000 | 0.0000 | 1.0000 | 0.5000 | 0.5000 | 0.0000 |
| **EmergencySeverity**| MIMIC-IV-ED | CatBoost | 6 | 0.325 | 0.5398 | 0.5737 | 0.7878 | 0.3792 | 0.6657 | 0.6068 | 0.2137 |
| **BloodLoss** | MIMIC-IV | PyTorch LSTM | 8 | 0.525 | 0.7665 | 0.5862 | 0.7082 | 0.7843 | 0.8349 | 0.6288 | 0.1617 |
| **FluidRecommendation**| MIMIC-IV | LightGBM | 8 | 0.525 | 0.7833 | 0.7190 | 0.7865 | 0.7815 | 0.8687 | 0.7886 | 0.1492 |
| **ICU Admission** | MIMIC-IV | PyTorch GRU | 10 | 0.425 | 0.7787 | 0.7629 | 0.8598 | 0.7214 | 0.8814 | 0.8413 | 0.1413 |
| **Mortality** | MIMIC-IV | PyTorch GRU | 10 | 0.900 | 0.9738 | 0.3082 | 0.2634 | 0.9899 | 0.8663 | 0.2497 | 0.1356 |

---

## 3. Important Scientific Caveats for Future IEEE Paper Revisions
1. **Arrhythmia Frozen Test Caveat:** The frozen test partition contained exclusively normal sinus heartbeats ($n=9,706$). While the model achieves 100% accuracy, sensitivity is 0% and precision is undefined. The paper must not present this as clinical detection efficacy.
2. **Clinical Decision Support Boundary:** The paper must continue to emphasize that AnesthAI SafeDose is an advisory decision support system. The deterministic fluid calculation engine remains strictly decoupled from the statistical machine learning model.
3. **ASA Physical Status Classification:** Clinician confirmation must be documented as an essential procedural boundary, distinct from automated machine learning classification.
4. **Data Leakage Elimination:** The contrast between naive models with target leakage (e.g. using MAP to predict hypotension) and honest non-invasive models must be clearly articulated.
