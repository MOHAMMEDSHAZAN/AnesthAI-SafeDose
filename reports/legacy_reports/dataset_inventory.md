# SafeDose AI: Clinical Dataset Inventory

**Generated**: 2026-09-13 06:34:37 UTC

| Dataset | Path | Type | Authenticity | Status | Purpose |
|---|---|---|:---:|:---:|---|
| **VitalDB** | `datasets/01_hypotension/VitalDB/` | Continuous Biosignals | Authentic | Active | Intraoperative Hemodynamics (Hypotension, Hypoxia, Bradycardia, Tachycardia) |
| **MIT-BIH Arrhythmia** | `datasets/03_arrhythmia/` | WFDB ECG Waveforms | Authentic | Active | Arrhythmia Beat Classification |
| **MIMIC-IV 3.1** | `datasets/mimiciv/3.1/` | Inpatient EHR / Labs | Authentic | Active | Blood Loss, Fluid Recommendation, ICU Admission, Mortality Risk |
| **MIMIC-IV ED** | `datasets/04_preoperative_risk/mimic-iv-ed-demo-2.2/` | Triage Vitals | Authentic (Demo Only) | Blocked for Full Training | Emergency Department Severity Triage (Demo isolated separately) |
| **Preoperative Risk** | `datasets/04_preoperative_risk/` | Demographics | Authentic (Tiny, N=30) | Disabled | Insufficient authentic data for reliable training |
| **PACU Postanesthesia**| `datasets/04_pacu_postanesthesia/` | Tabular | Fabricated/Synthetic | Excluded | Refused (Synthetic cohort) |
| **Drug Safety Rules** | `datasets/05_clinical_pharmacology/` | Interaction Rules | Fabricated/Synthetic | Excluded | Refused (Synthetic rule matrix) |
| **Prototype Baseline** | `datasets/07_prototype_registry/` | Prototype Registry | Synthetic Prototype | Excluded | Excluded from clinical validation |
