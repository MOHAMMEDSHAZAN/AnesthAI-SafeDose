# Claude Upload Package Manifest & Verification
**Directory:** `out_predictions/CLAUDE_UPLOAD_READY/`  
**Created:** November 6, 2026  
**Compression Engine:** ZIP DEFLATED (Compression Level 9)  
**Maximum Target Size:** Strictly < 15 MB per package  

---

## 1. Package Summary & Checksums

| Package Filename | File Count | Uncompressed Focus | Compressed Size | SHA-256 Checksum |
| :--- | :---: | :--- | :---: | :--- |
| **`AnesthAI_01_Manuscript.zip`** | 17 | Final 6.0-page IEEE PDF, LaTeX (`main_final.tex`, `main.tex`), `references.bib`, `IEEEtran.cls`, `figures_polished/` | **6.55 MB** | `a3bf439f7979e8e48d80af6447cc83b63e25322a8804a1098de399efd18c420c` |
| **`AnesthAI_02_Audit_and_Metrics.zip`** | 8 | `FINAL_RELEASE_AUDIT.md`, `reviewer_report.md`, `corrections_summary.md`, `Metrics_Verification.md`, author queries | **0.03 MB** | `8d14dcc928e2ceda07e41cdd455c0d32f07cc76cca9da0cfcbae04fdf0b8ec30` |
| **`AnesthAI_03_Prediction_Evidence.zip`** | 14 | 4 verified CSV prediction files ($2,143,291$ rows), threshold specs, contingency tables, export scripts | **9.80 MB** | `fbe4f6de38868857f3859c8f4994cac442ac5855fc33a8eb16163c9c12d8add1` |
| **`AnesthAI_04_Project_Documentation.zip`** | 11 | System architecture, API catalog, database schema, clinical formulas (Holliday-Segar, EBV), test QA logs | **0.02 MB** | `d240226b23c4f4367964fbfce8c2fa04911b2296acd637b699beb2de1e141f0c` |
| **`AnesthAI_05_Figures_and_Screenshots.zip`** | 76 | Figs. 1–7 publication figures, 12 authentic UI screenshots, all 10 clinical task ROC/CM plots, figure scripts | **11.17 MB** | `aa717b954f7bbc8ee6121dc5e3cf7100e4b7a540b3db4225b52c0619adb23f58` |
| **`AnesthAI_06_Claude_Instructions.zip`** | 8 | `START_HERE.md`, `PROJECT_EVIDENCE_GUIDE.md`, `FINAL_CLAUDE_PAPER_PROMPT.md`, 25 verified reference audit | **0.01 MB** | `3b6b802dcbeaf420f23dfec05f095858e209c74b530cb18b3f2011f01b5c060e` |

---

## 2. Detailed Internal Contents per Package

### `AnesthAI_01_Manuscript.zip` (6.55 MB)
- `AnesthAI_IEEE_Final.pdf`
- `IEEEtran.cls`
- `README_MANUSCRIPT.md`
- `build_submission_final_6page.py`
- `figures_polished/fig1_architecture.png`
- `figures_polished/fig1_architecture_original.png`
- `figures_polished/fig1_architecture_submission.png`
- `figures_polished/fig2_workflow.png`
- `figures_polished/fig3_dose_calculator.png`
- `figures_polished/fig4_live_ot.png`
- `figures_polished/fig4_live_ot_old.png`
- `figures_polished/fig4_roc_pr_curves.png`
- `figures_polished/fig5_arrhythmia_cm.png`
- `figures_polished/fig5_emergency.png`
- `main.tex`
- `main_final.tex`
- `references.bib`

### `AnesthAI_02_Audit_and_Metrics.zip` (0.03 MB)
- `FINAL_RELEASE_AUDIT.md`
- `Metrics_Verification.md`
- `corrections_summary.md`
- `final_paper_verification.md`
- `final_verified_10_task_report.md`
- `final_verified_10_task_results.csv`
- `reviewer_report.md`
- `unresolved_author_queries.md`

### `AnesthAI_03_Prediction_Evidence.zip` (9.80 MB)
- `Arrhythmia_test_predictions.csv`
- `Arrhythmia_threshold.txt`
- `Hypotension_test_predictions.csv`
- `Hypotension_threshold.txt`
- `Hypoxia_test_predictions.csv`
- `Hypoxia_threshold.txt`
- `README.md`
- `Tachycardia_test_predictions.csv`
- `Tachycardia_threshold.txt`
- `confusion_matrices.csv`
- `copy_mitbih_eval.py`
- `copy_vitaldb_eval.py`
- `prediction_export_summary.md`
- `verified_metrics.csv`

### `AnesthAI_04_Project_Documentation.zip` (0.02 MB)
- `API_ENDPOINTS.md`
- `BACKEND_FRONTEND_SPEC.md`
- `CLINICAL_CALCULATIONS_AND_SAFETY_RULES.md`
- `DATABASE_AND_SCHEMA.md`
- `DATASET_DESCRIPTIONS_AND_PREPROCESSING.md`
- `LIMITATIONS_AND_FUTURE_WORK.md`
- `MODEL_REGISTRY_AND_EVALUATION.md`
- `PROJECT_INVENTORY.md`
- `README.md`
- `SYSTEM_ARCHITECTURE.md`
- `TESTING_AND_SMOKE_TESTS.md`

### `AnesthAI_05_Figures_and_Screenshots.zip` (11.17 MB)
- `04_FIGURES_AND_GRAPHS/all_task_plots/Airway_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Airway_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Airway_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Arrhythmia_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Arrhythmia_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Arrhythmia_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/BloodLoss_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/BloodLoss_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/BloodLoss_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Bradycardia_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Bradycardia_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Bradycardia_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/DrugSafety_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/DrugSafety_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/EmergencySeverity_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/EmergencySeverity_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/EmergencySeverity_shap.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/FluidRecommendation_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/FluidRecommendation_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/FluidRecommendation_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/FluidRecommendation_shap.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Hypotension_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Hypotension_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Hypotension_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Hypotension_shap.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Hypoxia_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Hypoxia_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Hypoxia_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Hypoxia_shap.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/ICU_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/ICU_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/ICU_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/ICU_shap.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Mortality_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Mortality_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Mortality_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/PACU_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/PACU_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/PACU_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/PONV_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/PONV_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/RiskPrediction_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/RiskPrediction_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Tachycardia_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Tachycardia_curves.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Tachycardia_features.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/Tachycardia_shap.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/prototype_baseline_cm.png`
- `04_FIGURES_AND_GRAPHS/all_task_plots/prototype_baseline_features.png`
- `04_FIGURES_AND_GRAPHS/figure_inventory.md`
- `04_FIGURES_AND_GRAPHS/generate_figures_from_predictions.py`
- `04_FIGURES_AND_GRAPHS/publication_figures/AnesthAI_SafeDose_Workflow_Flows.pdf`
- `04_FIGURES_AND_GRAPHS/publication_figures/Workflow.jpeg`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig1_architecture.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig1_architecture_original.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig1_architecture_submission.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig2_workflow.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig3_dose_calculator.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig4_live_ot.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig4_live_ot_old.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig4_roc_pr_curves.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig5_arrhythmia_cm.png`
- `04_FIGURES_AND_GRAPHS/publication_figures/fig5_emergency.png`
- `05_WEBSITE_SCREENSHOTS/01_dashboard.png`
- `05_WEBSITE_SCREENSHOTS/02_patient_clinical_profile.png`
- `05_WEBSITE_SCREENSHOTS/03_preoperative_assessment.png`
- `05_WEBSITE_SCREENSHOTS/04_clinical_recommendations_planner.png`
- `05_WEBSITE_SCREENSHOTS/05_drug_calculator.png`
- `05_WEBSITE_SCREENSHOTS/06_airway_assessment.png`
- `05_WEBSITE_SCREENSHOTS/07_intraoperative_live_ot.png`
- `05_WEBSITE_SCREENSHOTS/08_intraoperative_safety_and_record.png`
- `05_WEBSITE_SCREENSHOTS/09_postoperative_pacu.png`
- `05_WEBSITE_SCREENSHOTS/10_emergency_portal.png`
- `05_WEBSITE_SCREENSHOTS/11_clinical_analytics.png`
- `05_WEBSITE_SCREENSHOTS/12_admin_security_audit.png`
- `05_WEBSITE_SCREENSHOTS/screenshot_inventory.md`

### `AnesthAI_06_Claude_Instructions.zip` (0.01 MB)
- `FINAL_CLAUDE_PAPER_PROMPT.md`
- `PROJECT_EVIDENCE_GUIDE.md`
- `REFERENCE_AUDIT/CLINICAL_FORMULA_AND_SCORING_REFERENCES.md`
- `REFERENCE_AUDIT/DATASET_OFFICIAL_REFERENCES.md`
- `REFERENCE_AUDIT/PUBLICATION_METADATA.md`
- `REFERENCE_AUDIT/REFERENCE_VERIFICATION_REPORT.md`
- `REFERENCE_AUDIT/references.bib`
- `START_HERE.md`
