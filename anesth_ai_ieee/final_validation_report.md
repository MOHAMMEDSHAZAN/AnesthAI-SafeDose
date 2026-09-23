# Final IEEE Conference Paper Verification & Audit Report

**Document Title:** Anesthesia Dose Calculation and Safety Support System  
**Product / Platform Name:** Anesth AI  
**Compiled PDF Path:** [`anesth_ai_ieee/output/AnesthAI_IEEE_Final.pdf`](file:///c:/Users/moham/OneDrive/Desktop/Anasthesia%20Antigravity/anesth_ai_ieee/output/AnesthAI_IEEE_Final.pdf)  
**LaTeX Source:** [`anesth_ai_ieee/main.tex`](file:///c:/Users/moham/OneDrive/Desktop/Anasthesia%20Antigravity/anesth_ai_ieee/main.tex)  
**Class File:** [`anesth_ai_ieee/IEEEtran.cls`](file:///c:/Users/moham/OneDrive/Desktop/Anasthesia%20Antigravity/anesth_ai_ieee/IEEEtran.cls)  
**Rendered Verification Pages:** [`anesth_ai_ieee/output/pages/page_1.png`](file:///c:/Users/moham/OneDrive/Desktop/Anasthesia%20Antigravity/anesth_ai_ieee/output/pages/page_1.png) through [`page_6.png`](file:///c:/Users/moham/OneDrive/Desktop/Anasthesia%20Antigravity/anesth_ai_ieee/output/pages/page_6.png)  
**Date of Audit:** September 21, 2026  

---

## 1. Executive Summary & Page Count Verification

| Metric | Target Requirement | Measured / Achieved Value | Status |
| :--- | :--- | :--- | :--- |
| **Page Count** | **EXACTLY 6 PAGES** | **6 PAGES** (`pypdf.PdfReader` verified) | **PASS** |
| **File Size** | Valid PDF (< 10 MB) | **1,399,493 bytes** (1.39 MB) | **PASS** |
| **Font Uniformity** | Times New Roman throughout | Times New Roman throughout all sections, emails, headings, captions, tables | **PASS** |
| **Inline Brackets** | Remove square-bracket numbers in body | Replaced with natural author-year phrasing | **PASS** |
| **Author Block** | Verbatim match to institutional source | All 4 authors, designations, affiliations, emails in Times New Roman | **PASS** |
| **Title** | Approved conference paper title | `ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM` | **PASS** |
| **Product Branding** | Current project branding | `Anesth AI` consistently used | **PASS** |
| **Visual Evidence** | Previous paper's authentic figures & screenshots | Reused authentic architecture, dose calculator, live OT, and emergency UI | **PASS** |

---

## 2. Itemized Verification Checklist (Compliance Audit)

### A. Author & Affiliation Fidelity
- [x] **Author 1:** Dr. Sowbahgya M P (Associate Professor, `sowbhagya.mp@gmail.com`)
- [x] **Author 2:** Mohammed Shazan (Student, `mohammedshazan888@gmail.com`)
- [x] **Author 3:** Mohan Gowda V C (Student, `mohangowda4983@gmail.com`)
- [x] **Author 4:** Puneeth S V (Student, `punithsv948@gmail.com`)
- [x] **Institution:** Department of Computer Science and Engineering, K.S. Institute of Technology, Visvesvaraya Technological University, Bengaluru, Karnataka, India.
- [x] **Typography:** All author names, affiliations, and emails appear strictly in Times New Roman. No monospace font or blue hyperlink underlines.

### B. Title & Branding
- [x] Official Paper Title: `ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM`.
- [x] Platform/Product Name: `Anesth AI` used throughout.
- [x] Earlier prototype name `AnesthAI SafeDose` referenced only once to explain engineering evolution.

### C. Restructuring & Content Reductions
- [x] **Inline Square-Bracket Citations Removed:** Body text uses natural author-year citations (`Sessler et al. (2019)`, `Chen et al. (2023)`, `Hu et al. (2024)`, etc.).
- [x] **Research Objectives Section:** Completely removed.
- [x] **Research Gap Section:** Completely removed (limitations integrated naturally into literature review).
- [x] **Benchmark Performance Analysis Section:** Completely removed.
- [x] **Large Ten-Model Benchmark Table (Table III):** Completely removed.
- [x] **Excessive Model Performance / Accuracy Paradox Discussion:** Completely removed.

### D. Literature Survey & Table I
- [x] Synthesizes previous studies from the source paper:
  - Sessler et al. (2019)
  - Sowbhagya et al. (2022, 2024)
  - Chen et al. (2023)
  - Singhal et al. (2023)
  - Hu et al. (2024)
  - Bogoń et al. (2024)
  - Al Qahtani et al. (2024)
  - Cai et al. (2025)
  - Cao (2025)
  - Giri et al. (2025)
  - Zarei et al. (2025)
- [x] Each study covers: (1) Methodological Approach, (2) Data Source and Cohort, (3) Clinical Contribution, (4) Clinical Outcome, and (5) Limitations.
- [x] **Table I** follows exact required column schema:
  `Study / Year | Methodological Approach | Data Source & Cohort | Clinical Contribution | Clinical Outcome | Limitations` (no Ref column, no rankings, no competitive win claims).

### E. Clinical Workflow & Architecture Visuals
- [x] **Figure 1:** Reused authentic system architecture diagram from the previous paper (`old_paper_p5__IM58.png`) featuring numbered blocks 1 to 7, updated title `Anesth AI System Architecture`, and full-stack REST API and dashboard components.
- [x] **Figure 2:** Three-phase workflow diagram (`fig2_workflow.png`) featuring prominent, readable headers and Times New Roman typography:
  - `PHASE 1 — PREOPERATIVE (Clinical Assessment & Planning)`
  - `PHASE 2 — INTRAOPERATIVE (Continuous Monitoring & Decision Support)`
  - `PHASE 3 — POSTOPERATIVE (PACU & Recovery Surveillance)`

### F. Real Project Screenshots Reused from Previous Paper & Project
- [x] **Figure 3:** Real Dose Calculation Decision Support interface (`fig3_dose_calculator.png` from previous paper `old_paper_p6__IM74.png`), showing TBW, LBM, BMI, Atropine dosage calculation (1.26 mg, 2.10 mL), openFDA clinical reference, and clinician review gates.
- [x] **Figure 4:** Real Live Operating Theatre Telemetry Monitoring interface (`fig4_live_ot.png`), showing continuous vital streams (HR 72, BP 122/78, SpO2 99%, EtCO2 38), waveforms, net fluid balance, ventilator metrics, and status `MONITORING: LIMITS MET`.
- [x] **Figure 5:** Real Emergency Break-Glass interface (`fig5_emergency.png`), showing mandatory clinical justification ($\ge 10$ chars), scoped temporary token issuance, ACLS cardiac arrest algorithm checklist, CPR countdown, elapsed time, and Indian emergency numbers (112, 108).
- [x] No fake, synthetic, or stock screenshots used.

### G. Clinical Safety & Terminology Guardrails
- [x] Standardized ASA Physical Status Classification: `ASA I` through `ASA VI` with independent Emergency toggle (`Emergency Case: Yes/No`, appending `-E`). Clinician confirmation strictly required.
- [x] Alert semantics: `Monitoring status: No configured alerts currently triggered.`
- [x] `Patient is safe` permanently expunged.
- [x] Strictly decoupled physiological fluid arithmetic: Holliday-Segar formula presented as a basal calculation reference, Estimated Blood Volume (EBV), ATLS hemorrhage staging, and oliguria flags ($<0.5\text{ mL/kg/hr}$).
- [x] Non-autonomous operation: explicitly framed as an advisory clinical decision-support prototype under human-in-the-loop oversight. No claims of autonomous drug, fluid, or ventilator administration.

### H. Arrhythmia Revalidation
- [x] Kept concise: WFDB parsing correction across all 48 MIT-BIH records ($109,494$ beats).
- [x] Held-out record-independent evaluation (7 records, $17,029$ beats).
- [x] Verified metrics reported: Accuracy: $85.62\%$, Balanced Accuracy: $87.15\%$, Sensitivity: $92.01\%$, Specificity: $82.29\%$, ROC-AUC: $0.9414$, PR-AUC: $0.9494$, Brier Score: $0.0613$.

---

## 3. Page-by-Page Layout Inspection

- **Page 1:** Title, Authors, Abstract, Keywords, Section I (Introduction with concise problem statement and core contributions), Section II (Literature Survey chronological narrative beginning).
- **Page 2:** Section II (Literature Survey continued), Table I (Comparative Review of Existing Anesthesia AI Systems spanning both columns).
- **Page 3:** Section III (System Requirements and Clinical Design), Fig. 1 (Modular System Architecture from previous paper), Section IV (System Architecture and Clinical Workflow).
- **Page 4:** Fig. 2 (Three-Phase Clinical Workflow: Preoperative, Intraoperative, Postoperative), Section V (Datasets and Machine Learning Methodology), Section VI-A (Anesthesia Dose Calculation Decision Support).
- **Page 5:** Section VI-B (Deterministic Fluid Engine), Fig. 3 (Anesth AI Dose Calculator Interface from previous paper), Fig. 4 (Live OT Telemetry Interface), Section VII (Clinical Decision-Support Interfaces and Safety Governance).
- **Page 6:** Section VII-C (Dual-Tier RBAC and Emergency Break-Glass Access), Fig. 5 (Emergency Break-Glass Interface), Section VIII (Results and Validation Summary including verified Arrhythmia revalidation), Section IX (Limitations and Future Work), Section X (Conclusion), Acknowledgment, References ([1] through [26] filling column 2 cleanly).

**Visual Quality Check:**
- No orphan headings at the bottom of columns.
- No text or table collisions across columns.
- All figures and tables cited in text prior to appearance.
- References end right at the bottom of Page 6 without spilling onto Page 7.
- **Total Pages = Exactly 6 Pages.**
