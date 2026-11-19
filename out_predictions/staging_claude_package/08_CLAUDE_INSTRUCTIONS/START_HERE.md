# START HERE: Guide for Claude AI Research Paper Assistant
**Project:** AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System  
**Objective:** Produce the authoritative, final, six-page IEEE research paper deliverable from verified evidence.

---

## 1. What This Project Is
**AnesthAI SafeDose** is an integrated perioperative clinical decision-support and safety monitoring platform for anesthesiologists and surgical teams. It features:
1. **Deterministic Clinical Calculators:** Hourly maintenance fluid rates (Holliday-Segar), fasting fluid deficit compensation, estimated blood volume (Nadler), allowable blood loss, and lean body mass (Janmahasatian).
2. **Four Verified Machine Learning Models:** Retrospective risk prediction for:
   - **Cardiac Arrhythmia** (MIT-BIH, Random Forest, $N=17,026$ beats, $\tau=0.220$, ROC-AUC 0.9414, PR-AUC 0.9494, Sensitivity 92.01%).
   - **Intraoperative Hypotension** (VitalDB, LightGBM, $N=708,755$ windows, $\tau=0.500$, ROC-AUC 0.6927, PR-AUC 0.4818, Sensitivity 55.69%).
   - **Intraoperative Hypoxia** (VitalDB, LightGBM, $N=708,755$ windows, $\tau=0.825$, ROC-AUC 0.9047, PR-AUC 0.3745, Specificity 99.16%).
   - **Intraoperative Tachycardia** (VitalDB, LightGBM, $N=708,755$ windows, $\tau=0.250$, ROC-AUC 0.6980, PR-AUC 0.2396, Sensitivity 62.11%).
3. **Safety Checklist & Protocol Engine:** WHO perioperative surgical safety checklists, critical emergency cognitive aids (Malignant Hyperthermia, Anaphylaxis), and immutable audit logging.

---

## 2. Organization of This ZIP Package
- **`01_MANUSCRIPT/`**: Contains the latest compiled PDF (`AnesthAI_IEEE_Final.pdf`), the primary LaTeX source (`main_final.tex`), class file (`IEEEtran.cls`), and bibliography (`references.bib`).
- **`02_INDEPENDENT_AUDIT/`**: Contains the authoritative release audit (`FINAL_RELEASE_AUDIT.md`), peer-review report (`reviewer_report.md`), corrections log (`corrections_summary.md`), and comprehensive verification data (`Metrics_Verification.md`).
- **`03_PREDICTION_DATA/`**: Contains the four genuine prediction CSV files ($2,143,291$ total inferences), operating threshold specs, and verification scripts.
- **`04_FIGURES_AND_GRAPHS/`**: Contains all 7 high-resolution publication figures (ROC/PR curves, confusion matrices, workflow, architecture) and figure generation code.
- **`05_WEBSITE_SCREENSHOTS/`**: Contains 12 authentic application screenshots and a detailed implementation status catalog.
- **`06_PROJECT_DOCUMENTATION/`**: Comprehensive documentation covering system architecture, API endpoints, physiological formulas, and test logs.
- **`07_REFERENCE_MATERIAL/`**: Verified 25-citation bibliography, DOI validation report, and publication metadata.
- **`08_CLAUDE_INSTRUCTIONS/`**: Specific task instructions and evidence maps for Claude.

---

## 3. Ground Truth Rules for Paper Generation
1. **Authoritative Source of Truth:** `02_INDEPENDENT_AUDIT/FINAL_RELEASE_AUDIT.md`.
2. **Prediction CSV Distinction:** Always clearly differentiate the **four CSV-backed prediction tasks** from the **six locked audit-baseline tasks**. Never state or imply that the other six tasks have per-sample CSV exports in the repository.
3. **Hypotension Threshold:** Strictly use $\tau = 0.500$ and LightGBM metrics (ROC-AUC 0.6927, PR-AUC 0.4818, Accuracy 69.20%, Sensitivity 55.69%, Specificity 73.59%, Precision 40.67%, F1 47.01%). Do not mix with historical exploratory thresholds ($0.220$ or $0.300$).
4. **Arrhythmia Test Sample Reconciliation:** Reconciled to exactly **17,026 verified cardiac beats** ($11,183\text{ normal sinus}$, $5,843\text{ arrhythmia}$).
5. **Exact Paper Title:** `AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System` (or streamlined `Anesthesia Dose Calculation and Safety Support System`).
6. **Author Details to Preserve:**
   - Dr. Sowbhagya M. P. (or Dr. Sowbahgya M. P. as flagged in AQ1) — Associate Professor — `sowbhagya.mp@gmail.com`
   - Mohammed Shazan — Student — `mohammedshazan888@gmail.com`
   - Mohan Gowda V. C. — Student — `mohangowda4983@gmail.com`
   - Puneeth S. V. — Student — `punithsv948@gmail.com`
   - Affiliation: Department of Computer Science and Engineering, K. S. Institute of Technology, affiliated with Visvesvaraya Technological University, Belagavi, Karnataka – 560109, India.
7. **Strict 6-Page IEEE Budget:** The final PDF must terminate cleanly at the bottom of Page 6 with balanced columns. Zero page 7 spillover.
