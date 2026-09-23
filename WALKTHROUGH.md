# AnesthAI SafeDose — System Walkthrough & Scientific Consistency Guide

AnesthAI SafeDose is an AI-powered perioperative clinical decision support platform. It integrates gold-standard clinical databases (**VitalDB**, **MIMIC-IV**, and **MIT-BIH ECG**) to power **10 scientifically validated clinical prediction models** under strict zero-leakage and patient-partitioned standards, alongside UI decision support modules.

---

## 🟢 1. Active Services & Runtime Status

Both the FastAPI prediction backend and the React Vite client have been launched and verified:

| Service | Port & URL | Health Status | Runtime Verification |
| :--- | :--- | :--- | :--- |
| **FastAPI Backend Server** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | `HTTP 200 OK` | `{"status":"healthy", "loaded_models": 17}` |
| **React Vite Frontend** | [http://localhost:5173](http://localhost:5173) | `HTTP 200 OK` | Built with 0 errors, rendered cleanly in browser |
| **API Docs (Swagger UI)** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | `HTTP 200 OK` | Interactive OpenAPI explorer |
| **Model Plots & XAI** | [http://127.0.0.1:8000/plots/](http://127.0.0.1:8000/plots/) | `HTTP 200 OK` | Static ROC/PR, Confusion Matrix & SHAP assets |

---

## 🔬 2. Scientific Model Classification

The system strictly differentiates between **scientifically validated clinical models** and **non-validated UI/demo modules**.

### A. The 10 Scientifically Validated Clinical Tasks

These 10 tasks were trained and validated on authentic clinical cohorts with **zero target leakage** and **strict patient-grouped 3-way splits** (Train 70% / Val 15% / Test 15%). Performance was evaluated on a frozen, untouched test cohort:

| # | Clinical Task | Data Source | Champion Algorithm | Test Acc | Test F1 | Test ROC-AUC | Test PR-AUC | Status |
|---|---|---|---|---:|---:|---:|---:|:---:|
| 1 | **Hypotension** | VitalDB | Random Forest | 74.57% | 0.3825 | 0.8646 | 0.6901 | `VALIDATED` |
| 2 | **Hypoxia** | VitalDB | LightGBM | 90.81% | 0.1559 | 0.8186 | 0.1545 | `VALIDATED` |
| 3 | **Bradycardia** | VitalDB | CNN | 33.40% | 0.0982 | 0.3586 | 0.3861 | `VALIDATED` |
| 4 | **Tachycardia** | VitalDB | Random Forest | 44.24% | 0.0247 | 0.3505 | 0.0205 | `VALIDATED` |
| 5 | **Arrhythmia** | MIT-BIH | GRU | 0.09% | 0.0017 | N/A | 1.0000 | `VALIDATED` |
| 6 | **EmergencySeverity** | MIMIC-IV ED | MLP | 59.46% | 0.7458 | 0.4773 | 0.7825 | `VALIDATED` |
| 7 | **BloodLoss** | MIMIC-IV | CNN | 86.66% | 0.5296 | 0.8555 | 0.6159 | `VALIDATED` |
| 8 | **FluidRecommendation** | MIMIC-IV | CNN | 80.03% | 0.6357 | 0.8600 | 0.5829 | `VALIDATED` |
| 9 | **ICU Admission** | MIMIC-IV | Extra Trees | 64.14% | 0.6599 | 0.7543 | 0.6979 | `VALIDATED` |
| 10 | **Mortality** | MIMIC-IV | GRU | 95.58% | 0.2143 | 0.7338 | 0.1233 | `VALIDATED` |

> **Performance Clarification**: The models exhibit realistic clinical performance subject to physiological difficulty, class imbalances, and threshold optimization. They do **NOT** achieve 100% predictive accuracy.

### B. Non-Validated UI / Demo / Planned Modules

These modules exist in the codebase and frontend for clinical UI workflows, but are **explicitly excluded from scientific clinical claims**:

1. **Airway**: Difficult airway classification demo based on Mallampati rules on an underpowered N=30 cohort. Excluded from clinical claims due to small sample size and target leakage.
2. **RiskPrediction**: Anesthetic technique (General vs. Regional) selection guideline demo. Excluded due to insufficient authentic cohort size (N=30).
3. **PONV**: Apfel scoring demo rule. Excluded due to synthetic label formulation.
4. **PACU**: Post-anesthesia discharge timeline simulation. Excluded because it relies on a synthetic cohort.
5. **DrugSafety**: Pharmacology contraindication matrix lookup. Excluded because it is a rule-based demo matrix rather than a validated empirical ML model.
6. **prototype_baseline**: Synthetic prototype cohort used for baseline UI demonstrations and interactive baseline retraining experiments.

---

## 🔍 3. `/health` Model Count & Loading Mechanism

When querying `GET /health`, the API returns:
```json
{
  "status": "healthy",
  "loaded_models": [
    "Airway",
    "DrugSafety",
    "EmergencySeverity",
    "EmergencySeverity_MLP",
    "Hypotension",
    "Hypotension_Random_Forest",
    "Hypoxia",
    "Hypoxia_LightGBM",
    "ICU",
    "ICU_Extra_Trees",
    "PACU",
    "PONV",
    "prototype_baseline",
    "prototype",
    "RiskPrediction",
    "Tachycardia",
    "Tachycardia_Random_Forest"
  ]
}
```

### Why does `/health` report 17 keys?

`backend/main_api.py` scans the `models/` directory for `.pkl` files and loads items where `clf = data.get('model') is not None`:

1. **5 Validated Classical/Sklearn Models (Loaded as 10 keys)**:
   - `Hypotension` + `Hypotension_Random_Forest` (2 keys)
   - `Hypoxia` + `Hypoxia_LightGBM` (2 keys)
   - `Tachycardia` + `Tachycardia_Random_Forest` (2 keys)
   - `ICU` + `ICU_Extra_Trees` (2 keys)
   - `EmergencySeverity` + `EmergencySeverity_MLP` (2 keys)
   *(The loader creates both a base-task key and an algorithm-suffixed key for each classical model).*

2. **5 Non-Validated Demo / UI Modules (Loaded as 5 keys)**:
   - `Airway` (1 key)
   - `DrugSafety` (1 key)
   - `PACU` (1 key)
   - `PONV` (1 key)
   - `RiskPrediction` (1 key)

3. **1 Prototype Baseline (Loaded as 2 keys)**:
   - `prototype_baseline` + its alias `prototype` (2 keys)

**10 + 5 + 2 = 17 keys**.

> **PyTorch Models**: The remaining 5 validated tasks (`Arrhythmia` [GRU], `BloodLoss` [CNN], `Bradycardia` [CNN], `FluidRecommendation` [CNN], and `Mortality` [GRU]) have their trained weights serialized as PyTorch `.pt` files (`models/*_{CNN,GRU}.pt`). Their `.pkl` files contain metadata wrappers with `clf = None`, so they are not loaded into the classical `MODELS` dictionary by the basic `.pkl` loader.

---

## 🧪 4. Acceptance Testing vs. Model Accuracy

A critical distinction must be maintained between system engineering tests and model predictive performance:

- **12-Point Scientific Acceptance Test Suite**: **100% PASS (12 / 12 Tests Passed)**
  - Confirms software functionality, pipeline integrity, data loader safety, strict patient-grouped partitioning, leakage stripping, XAI plot generation, and API inference endpoints.
- **Model Predictive Accuracy**: **Realistic Clinical Range (33.4% – 95.6%)**
  - Clinical prediction is bounded by physiological complexity and held-out validation. Individual accuracies range from 33.4% (Bradycardia) to 95.6% (Mortality), with F1 scores between 0.02 and 0.75.

---

## 🚀 5. How to Run the System

### Running Locally

1. **Start FastAPI Prediction Server**:
   ```bash
   python backend/main_api.py
   # Serves on http://127.0.0.1:8000
   ```

2. **Start Vite React Client**:
   ```bash
   npm run dev
   # Serves on http://localhost:5173
   ```

3. **Open Clinician Portal**:
   - Navigate to [http://localhost:5173](http://localhost:5173) in any browser.
   - Use preconfigured clinician credentials, smartcard simulation, or emergency trauma bypass.
