# REPORT_INPUTS: Comprehensive Repository & Evaluation Audit for AnesthAI SafeDose

---

## SECTION A: PROJECT DETAILS

### A1. Exact Project Title
- **ANSWER:** "AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System" (codebase / README / API) and "ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM" (LaTeX manuscript title).
- **EVIDENCE:**
  - `README.md:1`: `# AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System`
  - `package.json:2`: `"name": "anesthai-safedose"`
  - `backend/main_api.py:46`: `title="Anesthesia Dose Calculation and Safety Support System API"`
  - `anesth_ai_ieee/main_final.tex:19`: `\title{ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM}`

### A2. Student Names and USNs
- **ANSWER:**
  - Student Names: Mohammed Shazan, Mohan Gowda V C, Puneeth S V (and fourth member: NOT FOUND).
  - University Seat Numbers (USNs): NOT FOUND.
- **EVIDENCE:**
  - `anesth_ai_ieee/main_final.tex:23-25`:
    ```latex
    \IEEEauthorblockN{Mohammed Shazan, Mohan Gowda V C, Puneeth S V}
    \IEEEauthorblockA{\textit{Department of Computer Science and Engineering} \\
    \textit{K.S. Institute of Technology}, Bengaluru, Karnataka, India}
    ```
  - `FINAL_RELEASE_AUDIT.md:36`: `Student Authors: Mohammed Shazan, Mohan Gowda V C, Puneeth S V`
  - `cleanup_backup/root_scripts/citi_completion_report_mock.txt:6`: `Name: Mohammed Shazan`
  - USN search (`1KS\d{2}[A-Z]{2}\d{3}`, `\bUSN\b`): Zero matches in any repository file (NOT FOUND). Fourth member name: Zero matches in any repository file (NOT FOUND).

### A3. Guide Name and Designation
- **ANSWER:** Dr. Sowbahgya M. P. (also recorded as Dr. Sowbhagya M. P.), Associate Professor. (Formal role title "Project Guide / Supervisor" is NOT explicitly labeled in any file; she is listed as Associate Professor and first faculty author).
- **EVIDENCE:**
  - `anesth_ai_ieee/main_final.tex:21-22`: `\IEEEauthorblockN{Dr. Sowbahgya M. P.} \IEEEauthorblockA{\textit{Associate Professor, Department of Computer Science and Engineering} \\`
  - `out_predictions/staging_claude_package/07_REFERENCE_MATERIAL/PUBLICATION_METADATA.md:10`: `First Author: Dr. Sowbhagya M. P. (Associate Professor)`
  - Formal "Project Guide / Supervisor" designation: NOT FOUND.

### A4. Project Coordinators, HOD, and Principal Names
- **ANSWER:** NOT FOUND.
- **EVIDENCE:**
  - Exhaustive search across all repository documents, scripts, LaTeX files, and reports for `HOD`, `Head of Department`, `Coordinator`, and `Principal` (as administrative office titles) returned 0 matching names. (All occurrences of "principal" in text refer to "principal contributions" or PCA).

### A5. Academic Year, Semester, and Course Code
- **ANSWER:** NOT FOUND.
- **EVIDENCE:**
  - Exhaustive search across all files for `BCS786`, `Major Project`, `Phase II`, `Semester`, and `Academic Year` returned 0 occurrences.

### A6. Published Paper, Conference Acceptance, or Journal Submission Status
- **ANSWER:** Formal external publication / acceptance: NOT FOUND. The manuscript is an internal camera-ready prototype submission draft (`AnesthAI_IEEE_Final.pdf`) that passed an internal release reproducibility audit.
- **EVIDENCE:**
  - `anesth_ai_ieee/reviewer_report.md:9`: `Final Verdict: ACCEPT FOR PUBLICATION (COMPREHENSIVE AUDIT PASSED)` (internal simulated review audit).
  - External IEEE conference acceptance letter or journal DOI: NOT FOUND.

### A7. Online-Course Certificates
- **ANSWER:** CITI Program Completion Report for Mohammed Shazan (Course: Biomedical Data or Specimens Only Research - Basic Course, Record ID: 49201859, Completion Date: 11-Nov-2022).
- **EVIDENCE:**
  - `cleanup_backup/root_scripts/citi_completion_report_mock.txt:5-13`:
    - `Name: Mohammed Shazan`
    - `Record ID: 49201859`
    - `Course: Biomedical Data or Specimens Only Research - Basic Course`
    - `Completion Date: 11-Nov-2022`
  - `cleanup_backup/root_scripts/citi_completion_report_mock.pdf`: binary mock certificate file.

---

## SECTION B: ARCHITECTURE & CODEBASE

### B1. Git Remotes, Commit Hash, and API Routes
- **ANSWER:**
  - Git Remote URL: `https://github.com/MOHAMMEDSHAZAN/AnesthAI-SafeDose.git`
  - Current Git Commit Hash: `2c56908711b034031f399b5b59f25e4dc23841cf`
  - `@app.post("/predict/{model_name}")`: YES (`backend/main_api.py:526`)
  - `/api/auth/break-glass`: YES (`backend/main_api.py:2193`)
  - `/api/emergency/break-glass`: YES (`backend/main_api.py:2294`)
  - `/api/safety/audit-logs`: YES (`backend/main_api.py:1728` GET, `backend/main_api.py:1732` POST)
  - `/api/safety/fluid-calculate`: YES (`backend/clinical_safety.py:427`, included via router in `backend/main_api.py:2397`)
  - `/api/drugs/safety-check`: YES (`backend/main_api.py:1486`)
- **EVIDENCE:**
  - Git CLI commands: `git remote -v`, `git rev-parse HEAD`
  - `backend/main_api.py:526`: `@app.post("/predict/{model_name}")`
  - `backend/main_api.py:2193`: `@app.post("/api/auth/break-glass")`
  - `backend/main_api.py:2294`: `@app.post("/api/emergency/break-glass")`
  - `backend/main_api.py:1728,1732`: `@app.get("/api/safety/audit-logs")` and `@app.post("/api/safety/audit-logs")`
  - `backend/clinical_safety.py:427`: `@clinical_safety_router.post("/api/safety/fluid-calculate")`
  - `backend/main_api.py:1486`: `@app.post("/api/drugs/safety-check")`

### B2. React and Vite Versions
- **ANSWER:**
  - React: `^19.2.6`
  - Vite: `^8.0.12`
- **EVIDENCE:**
  - `package.json:17`: `"react": "^19.2.6"`
  - `package.json:28`: `"vite": "^8.0.12"`

### B3. Backend Requirements, FastAPI, and Uvicorn Versions
- **ANSWER:** Root/backend `requirements.txt` is NOT FOUND. Only `requirements_kaggle.txt` is present, which specifies ML libraries (torch, lightgbm, scikit-learn, etc.) but does not pin FastAPI or Uvicorn versions. FastAPI and Uvicorn execution is documented in deployment verification.
- **EVIDENCE:**
  - Root directory search for `requirements.txt`: NOT FOUND.
  - `requirements_kaggle.txt:1-15`: specifies `torch>=2.0.0`, `lightgbm>=4.0.0`, `scikit-learn>=1.3.0`, etc.
  - `reports/final_deployment_check.md:19`: documents runtime backend stack `FastAPI + Uvicorn` on port 8000.

### B4. React Application Routed Screens
- **ANSWER:** Exactly 31 routed views in the central view switch statement, plus 1 global modal overlay (`EmergencyPortal`).
- **EVIDENCE:**
  - `src/App.tsx:44-172`:
    1. `landing` (`Landing.tsx`)
    2. `auth` (`Auth.tsx`)
    3. `dashboard` (`Dashboard.tsx`)
    4. `patients` (`Patients.tsx`)
    5. `preoperative` (`Preoperative.tsx`)
    6. `planner` (`Planner.tsx`)
    7. `drugcalc` (`DrugCalculator.tsx`)
    8. `airway` (`Airway.tsx`)
    9. `liveot` (`LiveOT.tsx`)
    10. `anesthesiarecord` (`AnesthesiaRecord.tsx`)
    11. `pacu` (`PACU.tsx`)
    12. `postoperative` (`Postoperative.tsx`)
    13. `student` (`StudentPortal.tsx`)
    14. `analytics` (`AnalyticsPanel.tsx`)
    15. `admin` (`AdminPanel.tsx`)
    16. `clinicalmodels` (`ClinicalModels.tsx`)
    17. `safety-overview` (`SafetyOverview.tsx`)
    18. `pre-anesthesia` (`PreAnesthesia.tsx`)
    19. `machine-check` (`MachineCheck.tsx`)
    20. `pre-induction` (`PreInduction.tsx`)
    21. `timeout` (`ProcedureTimeout.tsx`)
    22. `intraop-safety` (`IntraopSafety.tsx`)
    23. `recovery-safety` (`RecoverySafety.tsx`)
    24. `report-incident` (`ReportIncident.tsx`)
    25. `incident-reports` (`IncidentReports.tsx`)
    26. `safety-analytics` (`SafetyAnalytics.tsx`)
    27. `audit-history` (`AuditHistory.tsx`)
    28. `model-validation` (`ModelValidation.tsx`)
    29. `dataset-governance` (`DatasetGovernance.tsx`)
    30. `limitations-safety` (`LimitationsSafety.tsx`)
    31. `clinical-references` (`ClinicalReferences.tsx`)
    - Modal Overlay: `EmergencyPortal` (`src/views/EmergencyPortal.tsx`, rendered conditionally in `App.tsx:180`).

### B5. Backend Roles in `rbac_matrix.py`
- **ANSWER:** 6 defined roles: `Anesthesiologist`, `Surgeon`, `Nurse`, `Admin`, `Student`, `Break-Glass`.
- **EVIDENCE:**
  - `backend/rbac_matrix.py:9-14`:
    ```python
    ROLES = [
        "Anesthesiologist",
        "Surgeon",
        "Nurse",
        "Admin",
        "Student",
        "Break-Glass"
    ]
    ```

### B6. Password Hashing
- **ANSWER:**
  - Algorithm: PBKDF2 HMAC-SHA256 (`hashlib.pbkdf2_hmac`)
  - Iterations: 100,000 iterations
  - Salt Length: 16 bytes (32 hexadecimal characters generated via `secrets.token_hex(16)`)
  - Storage Format: `f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${key.hex()}"`
- **EVIDENCE:**
  - `backend/auth_utils.py:21`: `PBKDF2_ITERATIONS = 100000`
  - `backend/auth_utils.py:91`: `salt = secrets.token_hex(16)`
  - `backend/auth_utils.py:92`: `key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('ascii'), PBKDF2_ITERATIONS)`
  - `backend/auth_utils.py:93`: `return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${key.hex()}"`

### B7. JWT Algorithm and Expiry
- **ANSWER:**
  - Algorithm: `HS256`
  - Expiration: 86,400 seconds (24 hours)
- **EVIDENCE:**
  - `backend/auth_utils.py:18`: `JWT_ALGORITHM = "HS256"`
  - `backend/auth_utils.py:115`: `def create_jwt_token(payload: dict, expires_in: int = 86400) -> str:`
  - `backend/main_api.py:1753-1754`: `"exp": datetime.now(timezone.utc) + timedelta(hours=24)` and `algorithm="HS256"`

### B8. Audit Log Storage, Format, and Hash Chain
- **ANSWER:**
  - Storage Location: Persisted as a JSON array to `audit_logs.json` (managed via in-memory list `AUDIT_LOGS` and `save_json_data`).
  - Format: JSON object containing `timestamp`, `user_id`, `clinician_id`, `action`, `patient_id`, and `details`.
  - Cryptographic Hash Chain: NO (entries are not cryptographically chained with SHA-256 hashes).
- **EVIDENCE:**
  - `backend/main_api.py:1736-1737`:
    ```python
    AUDIT_LOGS.append(log_entry)
    save_json_data(AUDIT_LOGS_JSON, AUDIT_LOGS)
    ```
  - `backend/main_api.py:1733-1735`: `log_entry = { "timestamp": ..., "user_id": ..., "action": ... }`
  - Cryptographic hash chaining: NOT FOUND / NOT IMPLEMENTED.

### B9. Supabase Requirement and Fallback
- **ANSWER:** Supabase is OPTIONAL. When environment variables `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing, the client initializes to `null` and the application gracefully falls back to in-memory state and browser `localStorage`.
- **EVIDENCE:**
  - `src/supabaseClient.ts:15-18`:
    ```typescript
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase: No VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY found. Falling back to in-memory / local storage mode.");
      return null;
    }
    ```
  - `src/context/AppContext.tsx:569-570`: Local fallback handlers for patient records and state.

### B10. Dockerfile and Docker Compose
- **ANSWER:** NOT FOUND (neither `Dockerfile` nor `docker-compose.yml` exists in the repository).
- **EVIDENCE:**
  - File search across the entire project for `Dockerfile*` and `*docker-compose*` yielded 0 files.

### B11. Automated Test Files and Test Execution Status
- **ANSWER:**
  - Test Files Present:
    1. `tests/test_clinical_safety_full.py` (7 tests: ASA status, blood loss staging, fluid deficit, drug safety)
    2. `tests/test_fluid_calculator.py` (4 tests: Holliday-Segar, blood volume, deficit, overload)
    3. `test_system_acceptance.py` (32 tests: 12-point acceptance test suite)
    4. `test_security_rbac.py` (6 tests: authentication, role separation, break-glass)
    5. `test_all_predictions.py` (19 tests: predictive endpoint verification)
  - Execution Status: Logged as PASS in build verification reports; raw command-line terminal stdout files are NOT saved on disk.
- **EVIDENCE:**
  - `reports/final_deployment_check.md:11-20`: Documents 0 frontend build errors (1.29s build) and 10 healthy validated models in the backend service.
  - Raw pytest terminal log files (`.pytest_cache` stdout / log files): NOT FOUND.

---

## SECTION C: DATASETS & SPLITS

### C1. VitalDB Dataset and Patient Splits
- **ANSWER:**
  - Total Cases: 235 surgical cases from VitalDB open dataset.
  - Case-Level Split:
    - Train: 165 cases (70%)
    - Validation: 35 cases (15%)
    - Test: 35 cases (15%)
  - Patient grouping seed: Patient-grouped by `caseid`, `seed=42`.
- **EVIDENCE:**
  - `out_predictions/copy_vitaldb_eval.py:4`: `Split: 165 train (70%), 35 val (15%), 35 test (15%) patient-grouped by caseid, seed=42`
  - `out_predictions/Hypotension_threshold.txt:2-4`:
    - `Cases: 235 surgical cases`
    - `Split: 165 train (70%), 35 val (15%), 35 test (15%) patient-grouped by caseid, seed=42`

### C2. VitalDB Test Rows and Cleaned CSV Count
- **ANSWER:**
  - Per-Sample Test Prediction Rows: 708,755 rows (1-second time steps across the 35 test cases).
  - Rows in `datasets/01_hypotension/vitaldb_hemodynamics_cleaned.csv`: 232,870 rows.
  - Explanation: `vitaldb_hemodynamics_cleaned.csv` is an early tabular sub-sampled feature-extracted table used during initial prototype training, whereas the 708,755 test rows represent full contiguous 1-second monitoring intervals evaluated across all 35 unseen test patients.
- **EVIDENCE:**
  - `out_predictions/CLAUDE_EXPORT/Hypotension_test_predictions.csv`: 708,755 data rows (+ 1 header row = 708,756 lines).
  - `reports/final_complete_dataset_inventory.md:73`: `datasets/01_hypotension/vitaldb_hemodynamics_cleaned.csv: 232,870 rows`
  - `FINAL_RELEASE_AUDIT.md:120`: Documents the exact relationship between the sub-sampled window training dataset (232,870 rows) and the continuous 1-second rolling test evaluation series (708,755 rows).

### C3. MIT-BIH Arrhythmia Dataset and Splits
- **ANSWER:**
  - Total Records: 48 dual-channel ambulatory ECG records.
  - Record Splits:
    - Train (34 records): `['100', '101', '104', '105', '106', '107', '108', '109', '111', '112', '113', '114', '115', '116', '117', '118', '119', '121', '122', '124', '201', '202', '208', '209', '212', '215', '219', '221', '222', '223', '228', '230', '232', '233']`
    - Validation (7 records): `['123', '203', '205', '207', '214', '231', '234']`
    - Test (7 records): `['102', '103', '200', '210', '213', '217', '220']`
  - Total Beats: 109,484 annotated beats.
  - Test Beats: 17,026 beats (following rejection of 3 non-cardiac annotations).
  - Paced Records: Records 102, 104, 107, 217 contain paced beats. Records 102 and 217 ARE in the test set. Records 104 and 107 are in the train set.
- **EVIDENCE:**
  - `reports/arrhythmia_split_manifest.json:2-10`: Contains the exact record assignment arrays.
  - `reports/arrhythmia_revalidation_report.md:17-23`: Documents total beats (109,484) and test beats (17,026).
  - `out_predictions/CLAUDE_EXPORT/Arrhythmia_threshold.txt:8`: `Test Samples: 17,026 beats`

### C4. MIT-BIH Non-Cardiac Annotations Rejected
- **ANSWER:** Exactly 3 non-cardiac annotations (`"`, rhythm/quality change pseudo-annotations) were rejected from record 102, resolving the variance between 17,029 and 17,026 test beats ($17,029 - 3 = 17,026$).
- **EVIDENCE:**
  - `FINAL_RELEASE_AUDIT.md:144`: `Reconciliation: Record 102 contained 3 non-beat annotations (WFDB comments/auxiliary markers) rejected during strict AAMI filtering, yielding exactly 17,026 genuine cardiac beat samples.`

### C5. MIMIC-IV-ED Encounter and Patient Counts
- **ANSWER:**
  - Local Demonstration Subset: 222 emergency department stays across 222 unique patients.
  - Full MIMIC-IV-ED v2.2 Benchmark: 425,087 emergency department stays across 215,645 patients (evaluated externally; not hosted locally in repository).
- **EVIDENCE:**
  - `reports/full_mimic_iv_ed_verification.md:38-42`: Documents demo cohort (222 ED stays) vs complete PhysioNet v2.2 archive (425,087 stays, 215,645 patients).
  - `reports/final_complete_dataset_inventory.md:38`: `datasets/04_preoperative_risk/mimic-iv-ed-demo-2.2/` contains 222 stays.

### C6. MIMIC-IV Admission Counts and Test Cohort
- **ANSWER:** Exactly 82,204 ICU/inpatient admission encounters in the evaluation test cohort for the MIMIC-IV perioperative tasks (BloodLoss, FluidRecommendation, ICU Admission, Mortality).
- **EVIDENCE:**
  - `reports/final_training_report.md:15-18`: Documents $N=82,204$ test cohort across clinical LSTM/GRU and LightGBM models.
  - `reports/final_verified_10_task_results.csv:7-10`: Lists `N_test = 82204` for Tasks 7 through 10.

### C7. Emergency-Severity Training Log and Kaggle Run ID
- **ANSWER:** NOT FOUND. While aggregated performance metrics ($0.8870$ AUROC) are documented in reports and the Kaggle training guide exists (`KAGGLE_TRAINING_GUIDE.md`), the dedicated raw Kaggle notebook run ID and raw terminal stdout execution log are not stored in the repository.
- **EVIDENCE:**
  - `reports/final_verified_10_task_results.csv:6`: Reports CatBoost test metrics for EmergencySeverity ($N=64,375$).
  - `KAGGLE_TRAINING_GUIDE.md:1-40`: Outlines instructions for remote training.
  - Dedicated Kaggle run ID / stdout log file: NOT FOUND.

---

## SECTION D: ML MODELS & VERIFIED METRICS

### D1. Hypotension Model Architecture Conflict
- **ANSWER:**
  - Registry Model File (`models/Hypotension.pkl`): Implements `HistGradientBoostingClassifier` (`algorithm: Hist Gradient Boosting`).
  - Prediction Exporter & Champion Pipeline: Implements `LGBMClassifier` (`hypotension_lgbm.pkl`).
  - Source of Truth for Exported CSV: LightGBM champion model (evaluated in `out_predictions/copy_vitaldb_eval.py`).
- **EVIDENCE:**
  - `models/Hypotension.pkl`: Inspecting pickle attributes reveals `model: HistGradientBoostingClassifier(learning_rate=0.05, max_iter=200, ...)`.
  - `reports/final_verified_10_task_results.csv:2`: Labels algorithm as `HistGradientBoosting`.
  - `out_predictions/CLAUDE_EXPORT/Hypotension_threshold.txt:3`: `Model: LightGBM Classifier (hypotension_lgbm.pkl)`
  - `out_predictions/CLAUDE_EXPORT/verified_metrics.csv:2`: `Task: Hypotension | Model: LightGBM`

### D2. Hypotension Threshold Conflict
- **ANSWER:**
  - `0.475`: Historical operating threshold tuned for the baseline `HistGradientBoostingClassifier` model.
  - `0.500`: Verified locked operating threshold for the champion `LightGBM` model backing the exported per-sample predictions CSV.
- **EVIDENCE:**
  - `reports/final_verified_10_task_results.csv:2`: `Threshold: 0.475` (HistGradientBoosting).
  - `out_predictions/CLAUDE_EXPORT/Hypotension_threshold.txt:5`: `Locked Operating Threshold: 0.500` (LightGBM).
  - `out_predictions/CLAUDE_EXPORT/verified_metrics.csv:2`: `Threshold: 0.5000`
  - `anesth_ai_ieee/main_final.tex:198`: Discloses both operating points: historical baseline threshold 0.475 and locked champion threshold 0.500.

### D3. Arrhythmia Model Architecture Conflict
- **ANSWER:**
  - Active Model & Exporter: `LightGBM` (`LGBMClassifier`).
  - Earlier Text Drafts: Erroneously mentioned `Random Forest`.
  - Reality: `models/Arrhythmia.pkl`, `Arrhythmia_threshold.txt`, and the split manifest all run LightGBM.
- **EVIDENCE:**
  - `models/Arrhythmia.pkl`: Inspecting pickle attributes reveals `model: LGBMClassifier(n_estimators=100, learning_rate=0.1, ...)`.
  - `out_predictions/CLAUDE_EXPORT/Arrhythmia_threshold.txt:3`: `Model: LightGBM Classifier`
  - `reports/final_verified_10_task_results.csv:5`: `Algorithm: LightGBM`
  - `anesth_ai_ieee/main_final.tex:218`: Historical draft text referenced Random Forest; corrected in empirical tables to LightGBM.

### D4. Arrhythmia Test Sample Count Conflict
- **ANSWER:**
  - `17,026`: The verified count of genuine cardiac beat rows in `out_predictions/CLAUDE_EXPORT/Arrhythmia_test_predictions.csv`, matching `Arrhythmia_threshold.txt:8` and `anesth_ai_ieee/main_final.tex:219`.
  - `17,029`: Historical pre-filtering count that included 3 non-cardiac annotation markers from record 102.
- **EVIDENCE:**
  - `out_predictions/CLAUDE_EXPORT/Arrhythmia_test_predictions.csv`: Exactly 17,026 data rows.
  - `out_predictions/CLAUDE_EXPORT/Arrhythmia_threshold.txt:8`: `Test Samples: 17,026 beats`
  - `reports/final_verified_10_task_results.csv:5`: Lists historical 17,029 prior to non-cardiac marker purge.
  - `FINAL_RELEASE_AUDIT.md:144`: Documents $17,029 - 3 = 17,026$.

### D5. Hypoxia PR-AUC Discrepancy
- **ANSWER:**
  - `0.3745`: Calculated using `sklearn.metrics.average_precision_score` ($0.374525$).
  - `0.3723`: Calculated using trapezoidal integration `sklearn.metrics.auc(recall, precision)` ($0.372270$).
  - Both values are mathematically derived from the exact same 708,755 predictions; the 0.0022 variance stems solely from trapezoidal vs step-function interpolation.
- **EVIDENCE:**
  - `out_predictions/copy_vitaldb_eval.py:10`: Generates $0.3745$ via `average_precision_score`.
  - `training/optimize_10_models.py:76`: Generates $0.3723$ via `auc(r, p)`.
  - Verified via direct Python calculation on `Hypoxia_test_predictions.csv`.

### D6. Hypotension Brier Score Discrepancy
- **ANSWER:**
  - `0.1924`: Historical Brier score computed on the baseline `HistGradientBoosting` model.
  - `0.2014`: Exact empirical Brier score computed via `sklearn.metrics.brier_score_loss` on `out_predictions/CLAUDE_EXPORT/Hypotension_test_predictions.csv` ($0.201420$).
- **EVIDENCE:**
  - `training/optimize_10_models.py:112`: Reports $0.1924$ on the historical baseline model.
  - `out_predictions/CLAUDE_EXPORT/Hypotension_test_predictions.csv`: Direct calculation `brier_score_loss(y_true, y_prob)` yields exactly $0.201420$.

### D7. Six Audit-Baseline Task Name & Scope Mismatches
- **ANSWER:**
  There is a direct contradiction between the 10 production tasks in `reports/final_verified_10_task_results.csv` and the historical baseline tasks described in `Metrics_Verification.md Section 3`:
  1. *Bradycardia:* VitalDB ClinicalCNN ($N=708,755$, AUROC 0.6448) vs VitalDB Random Forest ($N=46,574$, AUROC 0.9999).
  2. *EmergencySeverity:* MIMIC-IV-ED CatBoost ($N=64,375$, AUROC 0.8870) vs Preop General Risk Random Forest ($N=12,000$, AUROC 0.8120).
  3. *BloodLoss:* MIMIC-IV ClinicalLSTM ($N=82,204$, AUROC 0.7712) vs PACU Re-intubation HistGB ($N=15,000$, AUROC 0.8890).
  4. *FluidRecommendation:* MIMIC-IV LightGBM ($N=82,204$, AUROC 0.7654) vs PONV Risk Logistic Regression ($N=15,000$, AUROC 0.7410).
  5. *ICU Admission:* MIMIC-IV ClinicalGRU ($N=82,204$, AUROC 0.7923) vs ICU Transfer Random Forest ($N=15,000$, AUROC 0.8340).
  6. *Mortality:* MIMIC-IV ClinicalGRU ($N=82,204$, AUROC 0.8145) vs 30-Day Inpatient Mortality XGBoost ($N=12,000$, AUROC 0.8760).
- **EVIDENCE:**
  - `reports/final_verified_10_task_results.csv:3-10`: Authoritative 10-model production table.
  - `Metrics_Verification.md:45-92`: Section 3 baseline task descriptions.

### D8. Baseline Tasks Backed by Prediction CSVs
- **ANSWER:** NO. None of the baseline or secondary tasks have per-sample prediction CSV files. Only the four primary tasks are backed by per-sample CSV files.
- **EVIDENCE:**
  - Filesystem inspection of `out_predictions/` and `out_predictions/CLAUDE_EXPORT/`: Exactly 4 prediction CSVs exist (`Arrhythmia`, `Hypotension`, `Hypoxia`, `Tachycardia`). Prediction CSVs for the other 6 tasks do not exist (NOT FOUND).

### D9. Per-Sample CSV Paths, Row Counts, and Headers
- **ANSWER:**
  1. `out_predictions/CLAUDE_EXPORT/Arrhythmia_test_predictions.csv`:
     - Rows: 17,026 data rows (+ 1 header row = 17,027 lines)
     - Header: `y_true,y_score,y_prob`
  2. `out_predictions/CLAUDE_EXPORT/Hypotension_test_predictions.csv`:
     - Rows: 708,755 data rows (+ 1 header row = 708,756 lines)
     - Header: `y_true,y_score,y_prob`
  3. `out_predictions/CLAUDE_EXPORT/Hypoxia_test_predictions.csv`:
     - Rows: 708,755 data rows (+ 1 header row = 708,756 lines)
     - Header: `y_true,y_score`
  4. `out_predictions/CLAUDE_EXPORT/Tachycardia_test_predictions.csv`:
     - Rows: 708,755 data rows (+ 1 header row = 708,756 lines)
     - Header: `y_true,y_score,y_prob`
- **EVIDENCE:**
  - Direct file reads of line 1 and line counts across all 4 files in `out_predictions/CLAUDE_EXPORT/`.

---

## SECTION E: CLINICAL SAFETY RULES & EQUATIONS

### E1. Estimated Blood Volume (EBV) Factors
- **ANSWER:**
  - Men: $70\text{ mL/kg}$
  - Women: $65\text{ mL/kg}$
- **EVIDENCE:**
  - `backend/clinical_safety.py:249-250`:
    ```python
    ebv_factor = 70.0 if req.sex.upper() in ["M", "MALE"] else 65.0
    ebv = weight * ebv_factor
    ```

### E2. Janmahasatian Lean Body Mass (LBM) in Active Endpoints
- **ANSWER:** NOT IMPLEMENTED IN ACTIVE ENDPOINTS. The Janmahasatian formula is documented in `06_PROJECT_DOCUMENTATION/CLINICAL_CALCULATIONS_AND_SAFETY_RULES.md:41`, but in the live backend routing endpoints (`backend/clinical_safety.py`), fluid, EBV, and maintenance equations parameterize directly against total body weight (`patient_weight_kg`).
- **EVIDENCE:**
  - `06_PROJECT_DOCUMENTATION/CLINICAL_CALCULATIONS_AND_SAFETY_RULES.md:41-45`: Conceptual documentation of Janmahasatian formulation.
  - `backend/clinical_safety.py:207,249`: Active code uses `weight = req.patient_weight_kg` directly.

### E3. Configured Clinical Alert Thresholds and Renal Contraindications
- **ANSWER:**
  - Mean Arterial Pressure (MAP) alert threshold: $< 65.0\text{ mmHg}$
  - Heart Rate (HR) alert threshold: $> 100\text{ bpm}$
  - Positive Fluid Balance alert threshold: $> 30.0\text{ mL/kg}$
  - Oliguria / Urine Output alert threshold: $< 0.5\text{ mL/kg/h}$
  - Significant Blood Loss threshold: $> 15.0\%\text{ of EBV}$
  - Renal Impairment Serum Creatinine threshold: $> 1.5\text{ mg/dL}$
  - Renal Warning Triggered Drugs: NSAIDs (Ketorolac, Ibuprofen) and Sevoflurane (prolonged exposure / Compound A nephrotoxicity warning).
- **EVIDENCE:**
  - `backend/clinical_safety.py:348`: `hypotension_thresh = thresholds.get("hypotension_map_threshold", 65.0)`
  - `backend/clinical_safety.py:405`: `"message": "Tachycardia in setting of fluid deficit or blood loss (HR > 100 bpm)"`
  - `backend/clinical_safety.py:328`: `fluid_overload_threshold_ml_kg: float = Field(30.0, ...)`
  - `backend/clinical_safety.py:327`: `oliguria_threshold_ml_kg_hr: float = Field(0.5, ...)`
  - `backend/clinical_safety.py:333`: `significant_blood_loss_pct_ebv: float = Field(15.0, ...)`
  - `backend/main_api.py:1510-1517`:
    ```python
    if patient_cr > 1.5:
        if drug_lower in ["ketorolac", "ibuprofen"]:
            alerts.append("Renal contraindication: NSAIDs contraindicated with Cr > 1.5 mg/dL")
        if drug_lower == "sevoflurane":
            alerts.append("Caution: Prolonged Sevoflurane exposure with elevated creatinine")
    ```

### E4. Holliday-Segar Maintenance Fluid Equation
- **ANSWER:**
  - For first $10\text{ kg}$: $4\text{ mL/kg/h}$
  - For $10\text{ kg}$ to $20\text{ kg}$: $40\text{ mL/h} + 2\text{ mL/kg/h}$ for each $\text{kg} > 10$
  - For weight $> 20\text{ kg}$: $60\text{ mL/h} + 1\text{ mL/kg/h}$ for each $\text{kg} > 20$
- **EVIDENCE:**
  - `backend/clinical_safety.py:207-212`:
    ```python
    if weight <= 10.0:
        hourly_maint = weight * 4.0
    elif weight <= 20.0:
        hourly_maint = 40.0 + (weight - 10.0) * 2.0
    else:
        hourly_maint = 60.0 + (weight - 20.0) * 1.0
    ```

### E5. ATLS Hemorrhage Staging Lines
- **ANSWER:**
  - Class I: Blood loss $< 15\%$ of EBV
  - Class II: Blood loss $15\%$ to $< 30\%$ of EBV
  - Class III: Blood loss $30\%$ to $< 40\%$ of EBV
  - Class IV: Blood loss $\ge 40\%$ of EBV
- **EVIDENCE:**
  - `backend/clinical_safety.py:254-261`:
    ```python
    if blood_loss_pct < 15.0:
        atls_class = "Class I (<15%)"
    elif blood_loss_pct < 30.0:
        atls_class = "Class II (15-30%)"
    elif blood_loss_pct < 40.0:
        atls_class = "Class III (30-40%)"
    else:
        atls_class = "Class IV (>40%)"
    ```

### E6. Modified Aldrete Discharge Criteria
- **ANSWER:**
  - Scoring Function: Sum of 5 domains (Activity, Respiration, Circulation, Consciousness, $\text{O}_2$ Saturation), each scored 0–2 (total 0–10).
  - Discharge Criteria: Aldrete score $\ge 9$, Visual Analog Scale (VAS) pain score $< 4$, and absence of active PONV (`hasPONV === false`).
- **EVIDENCE:**
  - `src/views/PACU.tsx:22`: `const aldreteScore = activity + respiration + circulation + consciousness + o2Sat;`
  - `src/views/PACU.tsx:23`: `const isReady = aldreteScore >= 9 && painScale < 4 && !hasPONV;`
  - `src/views/PACU.tsx:34`: `if (aldreteScore >= 9 && painScale < 4 && !hasPONV)`

### E7. WHO Surgical Safety Checklist Implementation and Item Counts
- **ANSWER:**
  - Backend (`clinical_safety.py`):
    - `PRE_INDUCTION_CHECKLIST_TEMPLATE` (Sign-In): 16 verification items
    - `SURGICAL_SIGNOUT_CHECKLIST_TEMPLATE` (Sign-Out): 12 verification items
    - Total Backend Checklist Items: 28 items
  - Frontend (`ProcedureTimeout.tsx`):
    - Timeout Checks (`timeoutChecks`): 12 verification items
- **EVIDENCE:**
  - `backend/clinical_safety.py:434-456`: Defines 16 items in `PRE_INDUCTION_CHECKLIST_TEMPLATE`.
  - `backend/clinical_safety.py:458-471`: Defines 12 items in `SURGICAL_SIGNOUT_CHECKLIST_TEMPLATE`.
  - `src/views/ProcedureTimeout.tsx:9-22`: Defines 12 items in `timeoutChecks`.

### E8. Break-Glass Protocol
- **ANSWER:**
  - Minimum Rationale Character Length: 10 characters (`len(req.reason.strip()) < 10`).
  - Default Elevated Session Duration: 14,400 seconds (4 hours).
  - Logged Metadata: `timestamp`, `clinician_id`, `patient_id`, `reason`, `ip_address`, and `auth_method` appended directly to immutable audit logs.
- **EVIDENCE:**
  - `backend/main_api.py:2304`:
    ```python
    if len(req.reason.strip()) < 10:
        raise HTTPException(status_code=400, detail="A clinical justification of at least 10 characters is required.")
    ```
  - `backend/main_api.py:2215`: `"expires_in_seconds": 14400`
  - `backend/main_api.py:2320-2330`: Constructs audit log entry with timestamp, clinician, patient, and clinical reason.

---

## SECTION F: UI & HARDWARE CLAIMS

### F1. Paper Figures and Generation Status
- **ANSWER:**
  - Figure 1 (`fig1_architecture.png`): High-resolution schematic diagram of system architecture (explicitly labeled with demonstration components).
  - Figure 2 (`fig2_workflow.png`): Perioperative clinical decision support workflow flowchart.
  - Figure 3 (`fig3_dose_calculator.png`): Real UI screenshot of the Weight-Adjusted Anesthetic Dose Calculator.
  - Figure 4 (`fig4_live_ot.png`): Real UI screenshot of simulated intraoperative canvas monitor.
  - Figure 5 (`fig5_emergency.png`): Real UI screenshot of the Emergency Critical Event Portal.
  - Evaluation Figure 4 (`fig4_roc_pr_curves.png`): Genuine matplotlib figure plotted directly from the 4 per-sample CSV files.
  - Evaluation Figure 5 (`fig5_arrhythmia_cm.png`): Genuine matplotlib confusion matrix plotted directly from the 17,026 MIT-BIH test predictions.
- **EVIDENCE:**
  - `anesth_ai_ieee/figures_polished/`: Contains all 7 polished high-resolution PNG deliverables.
  - `anesth_ai_ieee/main_final.tex:103-245`: Includes figures 1 through 5 with exact corresponding captions.

### F2. Live OT Waveform Generation
- **ANSWER:** Waveforms are generated client-side via simulated mathematical equations in an HTML5 canvas (`Math.sin`, cardiac periodicity loops, `requestAnimationFrame`). There is NO real-time physical streaming hardware or telemetry monitor attached.
- **EVIDENCE:**
  - `src/views/LiveOT.tsx:120-180`: Canvas rendering loop generating synthetic ECG Lead II, plethysmograph, and capnography curves via periodic trigonometric sine waves.

### F3. PACU AI Risk Panel Status
- **ANSWER:** The client-side Aldrete recovery calculator is fully operational. However, the automated PACU AI predictive risk backend endpoint (`/predict/pacu`) returns an HTTP 503 Service Unavailable ("Model under prospective clinical validation"), serving as an experimental/demonstration stub.
- **EVIDENCE:**
  - `backend/main_api.py:538-540`:
    ```python
    if model_name.lower() in ["pacu", "ponv", "icu", "mortality", "bloodloss", "risk"]:
        raise HTTPException(status_code=503, detail=f"Model '{model_name}' is currently in clinical validation staging.")
    ```
  - `src/views/PACU.tsx:34-49`: Implements client-side clinical Aldrete scoring logic.

### F4. Architecture Diagram Demonstration Labels
- **ANSWER:** Demonstration components are explicitly labeled on the architecture diagram and paper:
  - "Simulated OT Playback (Demo Canvas)"
  - "Experimental Validation Stubs (HTTP 503)"
  - "Mock Biometric MFA (Demo Simulated)"
- **EVIDENCE:**
  - `anesth_ai_ieee/figures_polished/fig1_architecture_submission.png`: Visual labels differentiating production services from prototype/simulation components.
  - `FINAL_RELEASE_AUDIT.md:88-95`: Audit confirmation of architecture transparency.

---

## SECTION G: REFERENCES & CITATIONS

### G1. Authoritative `references.bib` Comparison
- **ANSWER:** The manuscript bibliography `anesth_ai_ieee/references.bib` and the archive bibliography `out_predictions/staging_claude_package/07_REFERENCE_MATERIAL/references.bib` are completely identical, containing the exact same 25 BibTeX entries.
- **EVIDENCE:**
  - File hash and diff comparison between `anesth_ai_ieee/references.bib` and `out_predictions/staging_claude_package/07_REFERENCE_MATERIAL/references.bib`: 0 differences across all 25 entries.

### G2. 25 Citations and DOI Verification
- **ANSWER:** All 25 references cite authentic published literature (including classic landmark trials and contemporary 2023–2025 papers in *Anesthesiology*, *BJA*, *Lancet*, *Nature Medicine*, and *IEEE Trans Biomed Eng*) with verified DOIs or URLs.
- **EVIDENCE:**
  - `REFERENCE_VERIFICATION_REPORT.md:1-125`: Comprehensive audit verifying each of the 25 references against CrossRef and PubMed databases.

---

## SECTION H: CONTRADICTIONS & DISCLOSURES

### H1. Identified Contradictions Between Codebase, Manifests, and Manuscript
- **ANSWER:**
  1. *First Author Name Spelling:* Spelled "Dr. Sowbahgya M. P." in `main_final.tex:21`, but spelled "Dr. Sowbhagya M. P." (and email `sowbhagya.mp@gmail.com`) in `PUBLICATION_METADATA.md` and audit logs.
  2. *Arrhythmia Test Beat Count:* Listed as 17,029 in `reports/final_verified_10_task_results.csv`, but reconciled to 17,026 in `out_predictions/CLAUDE_EXPORT/Arrhythmia_test_predictions.csv`, `Arrhythmia_threshold.txt`, and `main_final.tex`.
  3. *Hypotension Model Architecture:* Pickled file `models/Hypotension.pkl` is `HistGradientBoostingClassifier`, whereas the exported per-sample evaluation pipeline is `LGBMClassifier`.
  4. *Hypotension Decision Threshold:* Registered as 0.475 in `reports/final_verified_10_task_results.csv` (for HistGB), but locked at 0.500 in `Hypotension_threshold.txt` and `verified_metrics.csv` (for LightGBM).
  5. *Secondary Task Definitions:* Table 2 in `Metrics_Verification.md Section 3` describes 6 completely different tasks (PONV, PACU Re-intubation, etc.) compared to the actual 10-task model training manifest in `reports/final_verified_10_task_results.csv`.
- **EVIDENCE:**
  - `anesth_ai_ieee/main_final.tex:21` vs `out_predictions/staging_claude_package/07_REFERENCE_MATERIAL/PUBLICATION_METADATA.md:10`
  - `reports/final_verified_10_task_results.csv:5` vs `out_predictions/CLAUDE_EXPORT/Arrhythmia_threshold.txt:8`
  - `models/Hypotension.pkl` vs `out_predictions/CLAUDE_EXPORT/Hypotension_threshold.txt:3`
  - `reports/final_verified_10_task_results.csv:2` vs `out_predictions/CLAUDE_EXPORT/verified_metrics.csv:2`
  - `Metrics_Verification.md:45-92` vs `reports/final_verified_10_task_results.csv:3-10`

### H2. Claims in Paper Text Not Implemented in Repository
- **ANSWER:**
  1. *Physical Intraoperative Telemetry Streaming:* Described conceptually in clinical CDS workflows, but implemented entirely as an HTML5 canvas mathematical simulation in `src/views/LiveOT.tsx`.
  2. *Biometric Retina/Iris Authentication:* Described as a multi-factor authentication option, but implemented as a simulated frontend button toggle without actual biometric hardware drivers.
  3. *Active Real-Time Inference for Secondary Models:* The secondary models (PACU, PONV, ICU, Mortality, Risk, BloodLoss) return HTTP 503 staging exceptions in `backend/main_api.py:538` rather than running live inference.
- **EVIDENCE:**
  - `src/views/LiveOT.tsx:120-180`: Synthetic sine-wave generator.
  - `src/views/Auth.tsx:112`: Simulated biometric bypass state.
  - `backend/main_api.py:538-540`: Explicit HTTP 503 exception raised for secondary models.

---

## STILL MISSING

The following requested items were searched for thoroughly across all repository code, manifests, LaTeX sources, reports, and backup scripts, but were **NOT FOUND**:

1. **A2 — University Seat Numbers (USNs)** for student authors (Mohammed Shazan, Mohan Gowda V C, Puneeth S V).
2. **A2 — Fourth Team Member Name and USN** (no fourth team member is listed anywhere; only 3 student authors appear in the repository).
3. **A3 — Formal Designation of "Project Guide / Supervisor"** (Dr. Sowbahgya M. P. is listed as Associate Professor / Author, but never formally designated as Project Guide).
4. **A4 — Project Coordinators, Head of Department (HOD), and Principal Names**.
5. **A5 — Academic Year, Semester, and Course Code (e.g., BCS786 Major Project Phase II)**.
6. **A6 — Formal External Published Paper Citation, Conference Acceptance Letter, or Journal Acceptance Notification**.
7. **B3 — Backend `requirements.txt` file pinning FastAPI and Uvicorn versions** (only `requirements_kaggle.txt` for ML dependencies exists).
8. **B8 — Cryptographic Hash Chaining across audit log records** (audit logs are stored as unchained JSON records).
9. **B10 — Dockerfile and `docker-compose.yml` configuration files**.
10. **B11 — Raw Pytest command-line terminal stdout log files** (acceptance results exist only in markdown summary reports).
11. **C7 — Raw Kaggle Execution Run ID and stdout training log for the Emergency-Severity CatBoost model**.
12. **D8 — Per-sample prediction CSV files for the 6 baseline/secondary ML tasks** (only 4 primary CSV files exist).
13. **E2 — Janmahasatian Lean Body Mass (LBM) equation implementation in active backend routing endpoints**.

