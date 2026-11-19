# Publication Figure Inventory & Evidence Provenance

This document catalogs all figures used in the IEEE research paper, their empirical sources, pixel resolutions, and captions.

## Primary Manuscript Figures (IEEE Publication Deliverable)

### Figure 1: System Architecture Diagram
- **Filename:** `publication_figures/fig1_architecture.png` (also `fig1_architecture_submission.png`)
- **Manuscript Label:** Fig. 1. End-to-end multi-tier architecture of the AnesthAI SafeDose platform.
- **Location in Paper:** Page 2, spanning both columns (width=0.98\textwidth).
- **Description:** Illustrates the React/TypeScript frontend, FastAPI clinical engine, deterministic calculation units (Holliday-Segar, EBV, ATLS), active LightGBM/RandomForest ML models, and explicitly distinguishes simulated telemetry playback and demonstration biometric modules from production components.
- **Source:** Authentic architecture diagram updated to comply with independent audit recommendations.

### Figure 2: Three-Stage Perioperative Workflow
- **Filename:** `publication_figures/fig2_workflow.png` (also `Workflow.jpeg`)
- **Manuscript Label:** Fig. 2. Three-stage perioperative clinical workflow.
- **Location in Paper:** Page 3, single-column (width=0.98\columnwidth).
- **Description:** Details Preoperative Assessment (ASA PS, Mallampati, STOP-Bang), Intraoperative Monitoring & Maintenance (deterministic fluid rates, vital sign anomaly detection, safety alerts), and Postoperative Recovery (PACU Aldrete scoring, nausea/vomiting risk evaluation).

### Figure 3: Clinical Dose & Fluid Calculator Interface
- **Filename:** `publication_figures/fig3_dose_calculator.png`
- **Manuscript Label:** Fig. 3. Clinical dose and deterministic fluid calculation module.
- **Location in Paper:** Page 3, single-column (width=0.98\columnwidth).
- **Description:** Screenshot of the live clinical calculator demonstrating Holliday-Segar 4-2-1 hourly maintenance fluid rates, 48-hour fluid deficit calculations, surgical trauma fluid adjustments, and safety threshold alerts.

### Figure 4: Intraoperative Live OT Monitoring Dashboard
- **Filename:** `publication_figures/fig4_live_ot.png`
- **Manuscript Label:** Fig. 4. Intraoperative live operating theatre monitoring dashboard.
- **Location in Paper:** Page 4, single-column (width=0.98\columnwidth).
- **Description:** Real-time waveform and numeric telemetry display featuring simulated hemodynamic replay (HR, ABP, SpO2, EtCO2, BIS) with advisory anomaly banners and safety checklist tracking.

### Figure 5: Emergency Portal & Break-Glass Protocol
- **Filename:** `publication_figures/fig5_emergency.png`
- **Manuscript Label:** Fig. 5. Emergency response portal and critical event protocols.
- **Location in Paper:** Page 5, single-column (width=0.98\columnwidth).
- **Description:** Emergency management portal illustrating immediate clinical action checklists (Malignant Hyperthermia, Cardiac Arrest, Anaphylaxis), quick-dial advisory emergency numbers, and emergency break-glass override logs.

### Figure 6: Multi-Task ROC and Precision–Recall Evaluation
- **Filename:** `publication_figures/fig4_roc_pr_curves.png`
- **Manuscript Label:** Fig. 6. Multi-task ROC curves (left) and Precision–Recall curves (right) across four verified clinical tasks.
- **Location in Paper:** Page 5, single-column (width=0.98\columnwidth).
- **Description:** Multi-panel evaluation displaying ROC and PR curves generated directly from the 2,143,291 real test predictions across Arrhythmia (AUC 0.9414 / PR 0.9494), Hypotension (AUC 0.6927 / PR 0.4818), Hypoxia (AUC 0.9047 / PR 0.3745), and Tachycardia (AUC 0.6980 / PR 0.2396).

### Figure 7: Revalidated Arrhythmia Confusion Matrix
- **Filename:** `publication_figures/fig5_arrhythmia_cm.png`
- **Manuscript Label:** Fig. 7. Cardiological revalidation confusion matrix for MIT-BIH Arrhythmia detection ($N = 17,026$ test beats, threshold $\tau = 0.220$).
- **Location in Paper:** Page 5, single-column (width=0.98\columnwidth).
- **Description:** High-contrast confusion matrix heatmap illustrating exact beat-level outcomes ($9,202\text{ TN}$, $1,981\text{ FP}$, $467\text{ FN}$, $5,376\text{ TP}$), confirming 92.01% sensitivity and 82.29% specificity.

---

## Figure Generation Scripts
- **`generate_figures_from_predictions.py`**: Python script that reads the 4 test prediction CSVs in `03_PREDICTION_DATA/` and automatically renders Figures 6 and 7 using matplotlib and seaborn.
