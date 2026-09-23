# AnesthAI SafeDose Final Training Verification

Date: 2026-09-07

## Execution

Training was run with the existing pipeline using local datasets:

```text
python training/train_pipeline.py --batch-size 64 --epochs 3 --datasets-dir datasets
```

Existing pickle artifacts were backed up to `models/unverified_backup_20260907/` before replacement. No dataset was uploaded, deleted, or regenerated during training.

## Final task models

| Clinical Task | Dataset | Final Model | Train | Test | Features | Accuracy | Precision | Recall | F1 | ROC-AUC | Saved Model | Inference | Status |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| Hypotension | VitalDB | Decision Tree | 314886 | 46574 | 24 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/Hypotension.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Hypoxia | VitalDB | Decision Tree | 365560 | 46574 | 24 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/Hypoxia.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Bradycardia | VitalDB | Voting Ensemble | 275652 | 46574 | 24 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/Bradycardia.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Tachycardia | VitalDB | Decision Tree | 329614 | 46574 | 24 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/Tachycardia.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| ECG Arrhythmia | MIT-BIH | Random Forest | 17617 | 4405 | 100 | 0.9930 | 0.9974 | 0.9867 | 0.9921 | 0.9991 | models/Arrhythmia.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Perioperative Risk | Preoperative cohort | Decision Tree | 24 | 6 | 21 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/RiskPrediction.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| PONV | Preoperative cohort | Logistic Regression | 24 | 6 | 21 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/PONV.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Difficult Airway | Preoperative cohort | Decision Tree | 32 | 6 | 21 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/Airway.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Emergency Severity | MIMIC-IV ED | Logistic Regression | 177 | 45 | 7 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/EmergencySeverity.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| PACU Recovery | Local PACU cohort | Logistic Regression | 772 | 100 | 9 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/PACU.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Blood Loss | MIMIC-IV | CatBoost | 77900 | 10000 | 7 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/BloodLoss.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Fluid Recommendation | MIMIC-IV | Random Forest | 77106 | 10000 | 6 | 0.9999 | 0.9972 | 1.0000 | 0.9986 | 1.0000 | models/FluidRecommendation.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| ICU Requirement | MIMIC-IV | Decision Tree | 46236 | 10000 | 10 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/ICU.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Mortality | MIMIC-IV | Decision Tree | 68122 | 10000 | 11 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/Mortality.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Drug Safety | Local pharmacology cohort | Logistic Regression | 228 | 33 | 6 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/DrugSafety.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |
| Prototype Baseline | AnesthAI 2000 | Logistic Regression | 1600 | 400 | 11 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | models/prototype_baseline.pkl | Pass | ⚠️ TRAINED BUT NEEDS REVIEW |

Metrics above are read from the final artifacts and were generated from held-out predictions. The previous forced metric assignments and idealized plots were removed from the pipeline.

## Deep learning outputs

Five PyTorch architectures were trained for each of the 16 task cohorts at three CPU epochs: CNN, LSTM, GRU, CNN-LSTM, and Clinical Transformer. This produced 80 CPU-loadable checkpoints under `models/*_{CNN,LSTM,GRU,CNN_LSTM,Transformer}.pt`. Each checkpoint contains the state dictionary, task, feature list, scaler, three-epoch loss/accuracy history, and measured evaluation metrics.

TabNet trained and saved eight archives for cohorts under the pipeline's 20,000-row limit:

- `models/Airway_TabNet.zip`
- `models/Arrhythmia_TabNet.zip`
- `models/DrugSafety_TabNet.zip`
- `models/EmergencySeverity_TabNet.zip`
- `models/PACU_TabNet.zip`
- `models/PONV_TabNet.zip`
- `models/RiskPrediction_TabNet.zip`
- `models/prototype_baseline_TabNet.zip`

The current FastAPI loader scans only `.pkl`, so PyTorch and TabNet artifacts are not automatically loaded by the API. The task-level classical `.pkl` artifacts are API-compatible and all 16 loaded successfully.

## Verification

- `python -m py_compile training/train_pipeline.py`: passed.
- All 16 `.pkl` files: loaded and predicted successfully.
- All 80 `.pt` files: loaded on CPU; each contains three epoch records.
- FastAPI backend import: passed; 16 models registered.
- Representative backend predictions for Hypotension, Arrhythmia, PACU, and DrugSafety: passed.
- Evaluation plots: regenerated from actual predictions in `reports/plots/`.
- Main measured report: `reports/training_report.md`.

## Review limitations

1. VitalDB labels are direct thresholds of input features (for example MAP < 60), so perfect scores indicate label leakage rather than clinical generalization.
2. BloodLoss, FluidRecommendation, ICU, and Mortality labels are constructed from overlapping input biomarkers, also creating leakage.
3. The preoperative source contains only 30 rows; the 6-row test sets are not sufficient for reliable model selection.
4. PACU and pharmacology data are local generated/curated cohorts, not independent clinical outcome datasets.
5. No separate encoder files were needed: scalers are embedded in `.pkl` artifacts and PyTorch checkpoints. TabNet archives currently do not include a backend loader integration.
6. These outputs are trained research artifacts, not clinically validated decision support.
