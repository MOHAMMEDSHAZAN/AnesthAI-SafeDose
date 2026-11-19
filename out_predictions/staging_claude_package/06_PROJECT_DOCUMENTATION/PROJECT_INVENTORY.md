# Verified Project Codebase & Asset Inventory

## 1. Directory Tree
- ackend/: FastAPI application (main_api.py), clinical safety formulas (clinical_safety.py), test suite.
- src/: React 18 / TypeScript frontend application, components, hooks, canvas monitors.
- models/: Production machine learning checkpoints (hypotension_lgbm.pkl, 	achycardia_lgbm.pkl, hypoxia_lgbm.pkl, rrhythmia_model.pkl, etc.).
- out_predictions/: Verified test predictions (,143,291$ samples) in CLAUDE_EXPORT/.
- 
eports/: Audit reports, verification logs, and task performance plots.
- nesth_ai_ieee/: IEEE conference LaTeX manuscript sources, figures, and bib database.

## 2. Dataset Benchmarks
- **VitalDB Cohort:** 235 high-fidelity surgical cases ($ train, $ validation, $ test). ,755$ consecutive 1-second monitoring windows.
- **MIT-BIH Arrhythmia Database:** 48 ambulatory two-channel ECG records, ,026$ revalidated test cardiac beats (,183$ normal sinus, ,843$ arrhythmia).
- **MIMIC-IV-ED / MIMIC-IV:** Emergency department and intensive care cohorts used for audit-baseline model training.
