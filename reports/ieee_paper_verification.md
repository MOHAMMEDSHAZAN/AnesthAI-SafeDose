# IEEE Research Paper Verification & Compliance Report — AnesthAI SafeDose

**Date:** September 13, 2026  
**Manuscript Title:** *AnesthAI SafeDose: An AI-Based Clinical Decision Support System for Perioperative Anesthesia Safety and Risk Prediction*  
**Authors:** Dr. Sowbhagya M P, Mohammed Shazan, Mohan Gowda V C, Puneeth S V  
**Target Format:** IEEE Conference / Transactions 2-Column Format (`IEEEtran.cls`)  

---

## 1. Item-by-Item Verification Checklist

| Requirement / Item | Verification Status | Notes & Implementation Evidence |
| :--- | :---: | :--- |
| **1. All PDFs in `ieee_paper` inspected** | **PASS** | Inspected `AnesthAI_SafeDose_Workflow_Flows.pdf`, `IEEEtran_HOWTO.pdf`, `conference_101719.pdf`. |
| **2. Current project code inspected** | **PASS** | Audited `backend/main_api.py`, `backend/clinical_safety.py`, `training/train_pipeline.py`, models, and frontend views. |
| **3. Current final reports inspected** | **PASS** | Verified against `reports/final_test_results.csv`, `reports/model_comparison.csv`, and `reports/final_training_report.md`. |
| **4. Author and affiliation extraction** | **PASS** | Verified authors (Dr. Sowbhagya M P, Mohammed Shazan, Mohan Gowda V C, Puneeth S V), K.S. Institute of Technology, VTU, and authentic emails. |
| **5. Original academic prose** | **PASS** | Zero paragraphs copied from old text or source PDFs. Original academic writing throughout `ieee_paper/main.tex`. |
| **6. Exactly 10 validated ML tasks** | **PASS** | Hypotension, Hypoxia, Bradycardia, Tachycardia, Arrhythmia, EmergencySeverity, BloodLoss, FluidRecommendation, ICU, Mortality. |
| **7. Exclusion of invalid / demo tasks** | **PASS** | Airway, RiskPrediction, PONV, PACU, and DrugSafety are explicitly excluded from validated results tables and noted as non-validated prototypes. |
| **8. Latest final metrics utilized** | **PASS** | Test metrics in Table I match `reports/final_test_results.csv` to 4 decimal places. |
| **9. Arrhythmia caveat documented** | **PASS** | Explicitly stated in Abstract, Results, and Limitations that frozen test cohort had 0 positive cases ($n=9,706$ normal beats; confusion matrix $[[9706, 0], [0, 0]]$), and 100% accuracy is NOT evidence of clinical detection efficacy. |
| **10. ASA terminology standardized** | **PASS** | Uses standard "ASA Physical Status Classification" (ASA I–VI). Deprecated terms ("EASA", "ASA Score", "ASA grade") completely removed. |
| **11. Clinician-confirmed ASA status** | **PASS** | States clearly that ASA status is confirmed by attending anesthesiologist with timestamped audit trail, not assigned by ML. |
| **12. Emergency modifier handled separately** | **PASS** | Documented as emergency modifier "E" (e.g., ASA III-E) rather than conflated with baseline systemic disease grade. |
| **13. Decoupling of ML vs fluid calculation** | **PASS** | System distinguished into (A) LightGBM statistical recommendation model, and (B) transparent deterministic Holliday-Segar + ATLS fluid balance engine. |
| **14. Universal fluid formula avoided** | **PASS** | Avoids rigid universal 4-2-1 mandates or fixed third-space rules; highlights institutional protocols and dynamic volume responsiveness. |
| **15. Intraoperative safety workflow** | **PASS** | Documents 3-phase structured safety checklist: Pre-Induction (21 items), Continuous Hemodynamic Telemetry, and Surgical Sign-Out (12 items). |
| **16. Human-in-the-loop oversight** | **PASS** | Prominently stated: AI outputs are advisory; system never automatically administers drugs, alters ventilator settings, or titrates fluids. |
| **17. Target leakage prevention explained** | **PASS** | Section V-E details elimination of target-defining variables (MAP for hypotension, SpO2 for hypoxia, HR for bradycardia/tachycardia, hospital_expire_flag for mortality). |
| **18. Patient-grouped splitting detailed** | **PASS** | Formally defined: VitalDB by PatientID, MIMIC by subject_id, MIT-BIH by record_id. Verified $\mathcal{P}_{\text{train}} \cap \mathcal{P}_{\text{val}} = \emptyset$ and $\mathcal{P}_{\text{train}} \cap \mathcal{P}_{\text{test}} = \emptyset$. |
| **19. Train-only preprocessing** | **PASS** | Standard scalers and imputers fitted strictly on training partition, transformed on validation and test partitions. |
| **20. Explainable AI described** | **PASS** | TreeSHAP exact additive attributions detailed and illustrated with Fig. 1 (FluidRecommendation) and Fig. 2 (Hypotension). |
| **21. Data governance & MIMIC ethics** | **PASS** | Section XII details PhysioNet credentialed access compliance, HIPAA Safe Harbor de-identification, and non-redistribution of restricted raw files. |
| **22. Comprehensive limitations section** | **PASS** | Retrospective data source, institutional biases, class imbalance, uninformative Arrhythmia test partition, lack of prospective randomized trials. |
| **23. Genuine, verified references** | **PASS** | 18 peer-reviewed citations in `references.bib` covering VitalDB, MIMIC-IV, MIT-BIH, ASA standards, WHO surgical checklist, ATLS, KDIGO, Holliday-Segar, and SHAP. No fabricated DOIs. |
| **24. Official IEEE template formatting** | **PASS** | Uses `\documentclass[conference]{IEEEtran}`, two-column layout, standard IEEE headings, table formatting, and `IEEEtran.cls`. |
| **25. Deliverables generated** | **PASS** | `ieee_paper/main.tex`, `ieee_paper/references.bib`, `ieee_paper/IEEEtran.cls`, `ieee_paper/clinical_reference_mapping.md`, `ieee_paper/README.md`. |

---

## 2. Scientific Authenticity Confirmation
- **Zero Fabricated Results:** All reported accuracies, sensitivities, specificities, F1-scores, AUROC, PR-AUC, and Brier scores originate directly from the empirical, frozen test evaluations in `reports/final_test_results.csv`.
- **Zero Fabricated Citations:** Every reference in `references.bib` corresponds to an established, verifiable clinical guideline or peer-reviewed publication.
- **Plagiarism-Free:** The text represents newly authored scholarly discourse crafted specifically for IEEE academic conference/transactions submission.
