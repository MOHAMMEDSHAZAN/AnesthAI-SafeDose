# AnesthAI SafeDose — Clinical Safety & Decision-Support Update Report
**Document Version:** 2.0  
**Clinical Review Date:** September 13, 2026  
**Status:** Implemented, Verified, and System Acceptance Passed  
**Disclaimer:** *AnesthAI SafeDose is a clinical decision-support research prototype. It does not replace the judgment of a qualified anesthesiologist or clinician. All recommendations require clinician review and confirmation. This prototype has not undergone prospective clinical trials.*

---

## 1. Executive Summary & Clinical Review Context

Following an anesthesiology clinical safety and governance audit, the AnesthAI SafeDose software platform was updated to align with contemporary perioperative safety standards, transparent clinical arithmetic, and strict human-in-the-loop decision boundaries.

**Crucially, all 10 validated machine learning models (Hypotension, Hypoxia, Bradycardia, Tachycardia, Arrhythmia, EmergencySeverity, BloodLoss, FluidRecommendation, ICU, and Mortality) remain completely untouched, unretrained, and intact.** Their model artifacts, feature specifications, scalers, thresholds, and performance metrics have been strictly preserved.

This update focused exclusively on:
1. Standardizing **ASA Physical Status Classification** terminology and clinician confirmation workflows.
2. Developing a **Transparent Deterministic Fluid Calculation & Balance Engine** strictly decoupled from the statistical ML prediction model.
3. Implementing **Protocolized Fluid Safety Rules** with configurable institutional thresholds.
4. Expanding the **Intraoperative Safety Check Module** into a structured 3-phase framework (Pre-Induction / Sign-In with 21 items, Continuous Hemodynamic Safety with explainable alerts and overrides, and Surgical Sign-Out with 12 items).
5. Establishing a **10-Step Structured Emergency / Critical Event Workflow** with immutable audit logging.

---

## 2. ASA Physical Status Classification Overhaul

### 2.1 Terminology Audit & Correction
All legacy and non-standard nomenclature across the frontend, backend, patient models, and UI views was systematically audited and replaced:
- **Removed:** "EASA", "ASA Score", "ASA Class", "ASA grade", "ASA Rating".
- **Standardized:** **"ASA Physical Status Classification"** (or "ASA Physical Status" in compact tables).
- ASA Physical Status is explicitly recognized as a qualitative clinical classification of physical health status, not a numerical risk score.

### 2.2 Classification Options & Emergency Modifier
The system displays standard ASA Physical Status categories:
- `[ASA I]`: A normal healthy patient (healthy, non-smoking, no or minimal alcohol use).
- `[ASA II]`: A patient with mild systemic disease without substantive functional limitation.
- `[ASA III]`: A patient with severe systemic disease with substantive functional limitation.
- `[ASA IV]`: A patient with severe systemic disease that is a constant threat to life.
- `[ASA V]`: A moribund patient who is not expected to survive without the operation.
- `[ASA VI]`: A declared brain-dead patient whose organs are being removed for donor purposes.
- **Emergency Case:** `[Yes / No]` toggle. When set to `Yes`, the standard emergency modifier **"E"** is appended (e.g., `ASA III-E`).

### 2.3 Clinician Responsibility & Audit Trail
- **No Autonomous Assignment:** The AI decision-support system does not autonomously assign ASA status. The clinician is strictly responsible for selecting and confirming the classification.
- **Data Persistence:** Stored attributes include `asa_physical_status`, `emergency_case`, `clinician_confirmed`, `confirmation_timestamp`, `clinician_id`, `clinician_name`, and `clinical_rationale`.
- **Dedicated Endpoints:**
  - `GET /api/asa-physical-status`: Retrieves current status, available categories, and full patient audit history.
  - `POST /api/asa-physical-status`: Clinician confirms or modifies classification, recording an immutable entry into the audit trail.

---

## 3. Transparent Fluid Calculation & Balance Engine

### 3.1 Separation of ML vs Deterministic Engine
In clinical anesthesia, fluid administration must never be dictated by an opaque "black-box" model output. The architecture strictly separates:
- **ML FluidRecommendation Prediction:** The validated LightGBM classifier provides statistical probability and risk categorization regarding whether clinical intervention was historically required in similar hemodynamic patterns. It does not prescribe or invent fluid volumes.
- **Deterministic Fluid Calculation Engine:** A transparent, deterministic arithmetic service that calculates physical fluid balances and requirements based on physiological inputs.

### 3.2 Clinical Input Parameters Collected
- **Demographics & Anthropometrics:** Patient weight (kg), height (cm), age, sex.
- **Surgical Characteristics:** Surgery type, surgical duration (hours), preoperative fasting duration (hours).
- **Intake Volumes (mL):** Crystalloids administered, colloids administered, blood products, pre-existing IV fluids, oral/enteral intake.
- **Losses & Output (mL):** Measured urine output, measured surgical blood loss, other measured losses (drains, third-space/evaporative).
- **Live Hemodynamics:** Systolic BP, Diastolic BP, MAP, Heart Rate, SpO2.
- **Comorbidity Flags & Constraints:** Renal impairment / ESRD flag, Heart failure / cardiac dysfunction flag, Fluid restriction protocol flag, Clinician-entered fluid target (mL).

### 3.3 Output Metrics & Deterministic Formulas
Every displayed output is accompanied by standard clinical units:
1. **Maintenance Hourly Rate (`mL/hr`):** Holliday-Segar physiological reference estimate:
   $$\text{Rate} = (10 \times 4) + (10 \times 2) + (\text{Weight} - 20) \times 1 \quad (\text{for Weight} > 20\text{ kg})$$
   *(For a 70 kg adult: $40 + 20 + 50 = 110.0\text{ mL/hr}$)*.
2. **Total Maintenance Reference Estimate (`mL`):** $\text{Maintenance Rate} \times \text{Duration (hr)}$.
3. **Cumulative Fluid Administered (`mL`):** Sum of crystalloids, colloids, blood products, and pre-existing fluids.
4. **Current Fluid Infusion Rate (`mL/hr` & `mL/kg/hr`):** Cumulative intake divided by elapsed surgical duration.
5. **Urine Output (`mL`) & Excretion Rate (`mL/kg/hr`):** Measured urine volume divided by $(\text{Weight} \times \text{Duration})$.
6. **Estimated Blood Volume (`mL`):** Weight $\times 70\text{ mL/kg}$ (Male) or $65\text{ mL/kg}$ (Female).
7. **Measured Blood Loss (`mL` & `% EBV`):** $\frac{\text{Measured Blood Loss}}{\text{EBV}} \times 100\%$.
8. **Blood-Loss Replacement Assessment:** ATLS hemorrhage classification (Class I through IV) with guideline-based resuscitation context.
9. **Net Fluid Balance (`mL` & `mL/kg`):**
   $$\text{Net Balance} = \text{Total Fluid Administered} - (\text{Urine Output} + \text{Measured Blood Loss} + \text{Other Losses})$$

### 3.4 Clinical Decision-Support Warning
The system prominently displays the clinical caveat:
> *"Consider current hemodynamics, fluid responsiveness, ongoing losses, cardiac/renal status, and institutional protocol before administering additional fluid. The system must NEVER automatically administer fluid."*

---

## 4. Fluid Safety Rules Panel

The safety panel monitors physiological extremes and alerts clinicians to potential fluid discrepancies. All threshold-based alerts are explicitly designated as **"Institutional protocol threshold"** rather than universal medical axioms:

| Alert Trigger | Protocol Condition | Clinical Rationale |
| :--- | :--- | :--- |
| **Excessive Positive Balance** | Balance $> 30\text{ mL/kg}$ or $> 2500\text{ mL}$ | Mitigates risk of pulmonary edema, tissue edema, and impaired wound healing. |
| **Oliguria Detected** | Urine Output $< 0.5\text{ mL/kg/hr}$ ($> 1\text{ hr}$) | Signals potential renal hypoperfusion, AKI, or catheter obstruction. |
| **Significant Blood Loss** | Loss $> 15\%\text{ EBV}$ or $> 500\text{ mL}$ | Early detection of Class II+ surgical hemorrhage; prompts crossmatch / transfusion prep. |
| **Hypotension + Volume Loss Context** | $\text{MAP} < 65\text{ mmHg}$ with negative balance or active bleed | Differentiates vasodilation from hypovolemia; prompts targeted fluid challenge or vasopressor. |
| **Tachycardia + Volume Loss Context** | $\text{HR} > 100\text{ bpm}$ with fluid deficit | Evaluates compensatory tachycardia versus light anesthesia or hypercarbia. |
| **Renal Impairment Flag** | Documented CKD / ESRD | Prevents fluid overload; prompts strict restrictive volume strategy. |
| **Heart Failure / Cardiac Flag** | Documented CHF / low EF | Prevents acute decompensated heart failure and pulmonary capillary congestion. |
| **Fluid Restriction Flag** | Protocol active | Alerts against deviation from institutional restricted volume pathways. |
| **Rapid Administration** | Flow rate $> 15\text{ mL/kg/hr}$ | Guards against rapid fluid boluses without documented hemodynamic justification. |

---

## 5. Intraoperative Safety Check Module

### 5.1 Section A: Pre-Induction / Sign-In Checklist (21 Interactive Items)
1. Patient identity confirmed (2 identifiers & wristband)
2. Procedure confirmed with surgical schedule & consent
3. Informed consent confirmed & signed in chart
4. Surgical site marked & verified by operative team
5. Allergies reviewed & allergy band checked
6. ASA Physical Status Classification confirmed by clinician
7. Emergency status confirmed (Elective vs Emergency "E")
8. Airway assessment completed (Mallampati, thyromental, neck mobility)
9. Aspiration risk assessed & fasting hours verified
10. Relevant comorbidities reviewed (Cardiovascular, Pulmonary, Renal, Endocrine)
11. Relevant investigations reviewed (ECG, Echo, CBC, Coags, Chemistries)
12. IV access confirmed (Patent peripheral or central line verified)
13. Blood availability assessed when appropriate (Type & screen / crossmatch)
14. Anesthesia plan reviewed with patient & surgical team
15. Monitoring plan confirmed (Standard ASA monitors +/- invasive arterial/CVP)
16. Anesthesia machine & auxiliary equipment checked
17. Oxygen supply checked (Pipeline & reserve cylinders confirmed)
18. Airway equipment checked (ETT, LMAs, laryngoscope blades, video scope)
19. Suction apparatus checked & functioning properly
20. Medication/allergy verification completed & emergency drugs drawn
21. Anticipated difficult airway plan documented & anticipated blood loss assessed

*Each item features interactive states: `[ ] Not checked`, `[✓] Confirmed`, `[!] Requires attention`. The system does not allow automatic false completion; explicit clinician sign-off is required.*

### 5.2 Section B: Intraoperative Continuous Safety & Explainable Alerts
- **Live Telemetry Monitored:** Heart Rate (bpm), NIBP (Sys/Dia mmHg), MAP (mmHg), SpO2 (%), Respiratory Rate (/min), EtCO2 (mmHg), Temperature (°C), Net Fluid Balance (mL), Anesthesia Duration (mins), Surgical Duration (mins).
- **Safety Status Indicator:**
  - `SAFE`: *"Monitoring status: No configured alerts currently triggered"*. (Explicitly avoids claiming the patient is clinically guaranteed safe).
  - `ATTENTION`: Configured protocol threshold exceeded or non-critical telemetry drift.
  - `CRITICAL`: Severe hemodynamic threshold violation (e.g., MAP $< 55\text{ mmHg}$, SpO2 $< 90\%$).
- **Explainable Alert Architecture:**
  - **What Changed:** Specific parameter delta and timeframe.
  - **Why It Matters:** Pathophysiological explanation.
  - **Current Value & Trend:** Measured reading and direction of change.
  - **Suggested Clinical Checks:** Diagnostic checks for the anesthesia provider.
  - **Recommended Clinician Action:** Actionable items (anesthetic titration, fluid challenge, vasopressor).
  - **Human-in-the-Loop Controls:** `Acknowledge` button and `Override` button (mandating documented clinical reason).
  - **Governance Stamp:** `FINAL TREATMENT DECISION: ANESTHESIOLOGIST`.

### 5.3 Section C: Surgical Sign-Out Checklist (12 Interactive Items)
1. Procedure completed as intended & recorded in operative register
2. Instrument count confirmed correct by scrub & circulating nurses
3. Sponge & gauze count confirmed correct
4. Needle & sharp count confirmed correct
5. Surgical specimen labeling confirmed (Patient name, MRN, anatomical site)
6. Measured surgical blood loss documented in anesthesia record
7. Cumulative fluid balance documented & verified
8. Urine output documented where applicable (volume & color)
9. Lines, tubes, urinary catheters, and wound drains documented
10. Key postoperative concerns & recovery considerations documented
11. Postoperative monitoring & analgesia plan documented
12. PACU / ICU destination confirmed & formal handover completed

---

## 6. Emergency / Critical Event Workflow (10 Steps)

For critical hemodynamic events, the system provides a structured 10-step crisis response modal:
1. **Confirm Alert:** Verify threshold alarm on monitor & confirm patient clinical state.
2. **Verify Patient / Vitals:** Manual pulse check, repeat automated cuff cycle, inspect plethysmograph.
3. **Show Relevant Trends:** Display MAP, HR, EtCO2 15-minute trends and rate of change.
4. **Current Fluid Balance:** Present net balance in mL and mL/kg.
5. **Assess Blood Loss:** Inspect suction canisters, surgical field, and compute % EBV.
6. **Review Active Medications:** Volatile concentration, opioid boluses, neuromuscular blockers, vasoactive infusions.
7. **Crisis Checklist:** Display condition-specific emergency algorithm (e.g., ACLS, refractory hypotension, anaphylaxis, laryngospasm).
8. **Clinician Acknowledgement:** Attending anesthesiologist explicitly signs off alert review.
9. **Clinician Override with Reason:** Document clinical rationale if standard protocol is modified.
10. **Permanent Audit Trail:** Log timestamp, clinician ID, hemodynamics, and clinical actions.

**Automated Safety Constraints:**
- The system NEVER automatically administers medication or fluid.
- The system NEVER automatically alters ventilator settings.
- The system NEVER automatically adjusts volatile anesthetic delivery.

---

## 7. Verification & Test Results

A dedicated automated test suite (`tests/test_clinical_safety_full.py`) was developed and executed alongside end-to-end integration tests:

| Test Category | Test Case Description | Result |
| :--- | :--- | :--- |
| **ASA Classification** | Verify ASA I-VI selection, Emergency "E" modifier (`ASA III-E`), clinician confirmation, and timestamped audit retrieval (`/api/asa-physical-status`). | **PASS** |
| **Deterministic Fluid Math** | 70 kg adult, 3.0 hr surgery: Holliday-Segar maintenance verified ($110\text{ mL/hr}$, $330\text{ mL}$ total). Intake: $1400\text{ mL}$, Losses: $310\text{ mL}$, Net: $+1090\text{ mL}$ ($15.57\text{ mL/kg}$), UOP: $1.0\text{ mL/kg/hr}$, EBL: $100\text{ mL}$ ($2.0\%\text{ EBV}$). All 10 displayed values trace 100% to theoretical formulas. | **PASS** |
| **Validation Rejections** | Rejection of negative weights ($< 0$), zero durations ($\le 0$), negative fluid volumes, and out-of-range vitals ($HR > 300$) with HTTP 422. | **PASS** |
| **Fluid Safety Rules** | Protocol alert triggers for oliguria ($< 0.5\text{ mL/kg/hr}$), blood loss ($> 500\text{ mL}$), hypotension context ($\text{MAP} < 65$), and renal impairment flag. Verified "Institutional protocol threshold" labeling. | **PASS** |
| **Checklist & Audit** | Pre-induction 21 items, Sign-out 12 items, alert acknowledgment, override with reason, and audit log persistence (`/api/intraoperative/*`). | **PASS** |
| **Backend & 10 ML Models** | FastAPI `/health` reports `healthy` with 10/10 validated champion models loaded (0 demo models). All 10 prediction endpoints pass inference. | **PASS** |
| **Frontend Build** | Production build (`tsc -b && vite build`) compiles with 0 errors (`dist/index.html`, `dist/assets/*`). | **PASS** |
| **End-to-End Test** | Full pipeline verified (`e2e_deployment_check.py` returns `OVERALL E2E STATUS: PASS`). | **PASS** |

---

## 8. Summary of Files Modified / Created

1. `backend/clinical_safety.py` *(New)*: Core deterministic fluid calculation engine, ASA classification models, protocol safety rule engine, and FastAPI router endpoints.
2. `backend/main_api.py` *(Modified)*: Integrated `clinical_safety_router`.
3. `src/context/AppContext.tsx` *(Modified)*: Added standard ASA Physical Status fields (`asaPhysicalStatus`, `emergencyCase`, `clinicianConfirmed`, `confirmationTimestamp`, `confirmedBy`) to `Patient` interface.
4. `src/views/Preoperative.tsx` *(Modified)*: Overhauled ASA UI with ASA I-VI buttons, Emergency "E" modifier toggle, clinical definition card, clinician confirmation controls, and audit log view.
5. `src/views/IntraopSafety.tsx` *(Modified)*: Completely rewritten with 3-phase checklist (21 pre-induction, 12 sign-out), continuous telemetry dashboard, explainable alerts with overrides, deterministic fluid calculation engine, and 10-step emergency workflow.
6. `src/views/Patients.tsx`, `src/views/Planner.tsx`, `src/views/PreAnesthesia.tsx`, `src/views/PreInduction.tsx`, `src/views/ClinicalModels.tsx`, `src/views/AnalyticsPanel.tsx`, `src/components/FloatingAIAssistant.tsx` *(Modified)*: Audited and updated terminology from "ASA Class" / "ASA Score" to standard "ASA Physical Status Classification".
7. `tests/test_clinical_safety_full.py` *(New)*: Automated test suite for ASA, fluid math, validation rejections, checklists, alerts, overrides, health, and all 10 ML models.
8. `reports/clinical_safety_update.md` *(New)*: Comprehensive clinical safety documentation report.
