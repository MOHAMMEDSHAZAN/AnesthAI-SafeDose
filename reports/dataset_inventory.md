# SafeDose AI: Clinical Dataset Inventory

**Generated**: 2026-09-13 11:12:31 UTC

| Dataset | Path | Type | Authenticity | Status | Purpose |
|---|---|---|:---:|:---:|---|
| **VitalDB** | `datasets/01_hemodynamics_vitaldb/` | Continuous Biosignals | Authentic | Active | Intraoperative Hemodynamics (Hypotension, Hypoxia, Bradycardia, Tachycardia) |
| **MIT-BIH Arrhythmia** | `datasets/03_arrhythmia/` | WFDB ECG Waveforms | Authentic | Active | Arrhythmia Beat Classification |
| **MIMIC-IV 3.1** | `datasets/mimiciv/3.1/` | Inpatient EHR / Labs | Authentic | Active | Blood Loss, Fluid Recommendation, ICU Admission, Mortality Risk |
| **MIMIC-IV ED** | `datasets/04_preoperative_risk/mimic-iv-ed-demo-2.2/` | Triage Vitals | Authentic | Active | Emergency Department Severity Triage |
| **Preoperative Risk** | `datasets/04_preoperative_risk/` | Demographics | Authentic (Tiny, N=30) | Disabled | Insufficient authentic data for reliable training |
| **PACU Postanesthesia**| `datasets/05_pacu_recovery/` | Tabular | Fabricated/Synthetic | Excluded | Refused (Synthetic cohort) |
| **Drug Safety Rules** | `datasets/06_drug_safety/` | Interaction Rules | Fabricated/Synthetic | Excluded | Refused (Synthetic rule matrix) |
| **Prototype Baseline** | `datasets/07_prototype_registry/` | Prototype Registry | Synthetic Prototype | Excluded | Excluded from clinical validation |
