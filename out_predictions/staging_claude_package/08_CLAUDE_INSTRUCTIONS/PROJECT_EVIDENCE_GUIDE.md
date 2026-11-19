# Project Evidence Mapping Guide for Paper Sections

This document maps every section of the 6-page IEEE manuscript directly to the supporting files in this package.

| Manuscript Section | Core Topic & Requirements | Authoritative Evidence Files to Consult |
| :--- | :--- | :--- |
| **Title & Authors** | Author order, designations, emails, affiliations, and title framing | `07_REFERENCE_MATERIAL/PUBLICATION_METADATA.md`<br>`02_INDEPENDENT_AUDIT/unresolved_author_queries.md` |
| **Abstract & Index Terms** | Summary of 10 tasks, 4 verified models, deterministic fluid engine, zero-leakage, key AUCs | `02_INDEPENDENT_AUDIT/FINAL_RELEASE_AUDIT.md`<br>`02_INDEPENDENT_AUDIT/Metrics_Verification.md` |
| **Section I: Introduction** | Perioperative clinical challenge, fluid errors, anesthesia morbidity, contributions | `06_PROJECT_DOCUMENTATION/README.md`<br>`06_PROJECT_DOCUMENTATION/SYSTEM_ARCHITECTURE.md` |
| **Section II: Related Work** | Modern ML in anesthesiology, closed-loop systems, dataset benchmarks | `07_REFERENCE_MATERIAL/references.bib`<br>`07_REFERENCE_MATERIAL/REFERENCE_VERIFICATION_REPORT.md` |
| **Section III: System Architecture & Perioperative Workflow** | Multi-tier architecture, deterministic vs ML separation, WHO checklists, simulated telemetry | `04_FIGURES_AND_GRAPHS/publication_figures/fig1_architecture.png`<br>`04_FIGURES_AND_GRAPHS/publication_figures/fig2_workflow.png`<br>`06_PROJECT_DOCUMENTATION/SYSTEM_ARCHITECTURE.md`<br>`06_PROJECT_DOCUMENTATION/CLINICAL_CALCULATIONS_AND_SAFETY_RULES.md`<br>`05_WEBSITE_SCREENSHOTS/screenshot_inventory.md` |
| **Section IV: Dataset Cohorts & Preprocessing Protocol** | VitalDB (235 cases, 165/35/35 split, 708,755 test windows), MIT-BIH (48 records, 17,026 beats), MIMIC-IV | `02_INDEPENDENT_AUDIT/FINAL_RELEASE_AUDIT.md` (Section 4)<br>`06_PROJECT_DOCUMENTATION/MODEL_REGISTRY_AND_EVALUATION.md`<br>`03_PREDICTION_DATA/copy_vitaldb_eval.py`<br>`03_PREDICTION_DATA/copy_mitbih_eval.py` |
| **Section V: Experimental Results & Cardiological Revalidation** | 4 CSV prediction tasks (Table IV), confusion matrices (Table V, Fig. 7), ROC/PR curves (Fig. 6), 6 audit-baseline tasks (Table III) | `03_PREDICTION_DATA/*.csv`<br>`02_INDEPENDENT_AUDIT/Metrics_Verification.md`<br>`04_FIGURES_AND_GRAPHS/publication_figures/fig4_roc_pr_curves.png`<br>`04_FIGURES_AND_GRAPHS/publication_figures/fig5_arrhythmia_cm.png` |
| **Section VI: Discussion, Limitations & Safety Governance** | Human-in-the-loop safeguards, alert fatigue mitigation, retrospective limitations, simulated OT disclosure | `06_PROJECT_DOCUMENTATION/LIMITATIONS_AND_FUTURE_WORK.md`<br>`02_INDEPENDENT_AUDIT/reviewer_report.md` |
| **Section VII: Conclusion & Acknowledgment** | Concluding summary, institutional thanks to KSIT & VTU | `01_MANUSCRIPT/main_final.tex`<br>`02_INDEPENDENT_AUDIT/unresolved_author_queries.md` |
| **References** | 25 verified peer-reviewed publications | `01_MANUSCRIPT/references.bib`<br>`07_REFERENCE_MATERIAL/REFERENCE_VERIFICATION_REPORT.md` |
