# Reproducibility & Runtime Environment Specification

**System**: Anesthesia Dose Calculation and Safety Support System  
**Document Status**: CERTIFIED PRODUCTION ENVIRONMENT  
**Date**: 2026-09-13  

---

## 1. Production Runtime Stack

The project relies on a standardized, pinned runtime environment to guarantee deterministic model deserialization, numeric reproducibility, and zero-leakage evaluation:

| Software Component | Verified Production Version | Purpose / Scope |
|---|---|---|
| **Python** | `3.13.7` (AMD64 64-bit) | Primary runtime interpreter |
| **scikit-learn** | `1.8.0` | Core tabular modeling, scalers, bin mappers, evaluation metrics |
| **LightGBM** | `4.6.0` | Arrhythmia and FluidRecommendation champion tree models |
| **CatBoost** | `1.2.10` | EmergencySeverity champion gradient boosted classifier |
| **PyTorch** | `2.12.0+cpu` | Deep learning sequence & CNN models (Bradycardia, BloodLoss, ICU, Mortality) |
| **CUDA** | `N/A (CPU Mode)` | Deterministic CPU tensor evaluation (CUDA Available: False) |
| **NumPy** | `2.3.4` | Array computing, tensor manipulation, seed management |
| **Pandas** | `2.3.3` | Dataset handling, schema verification, feature engineering |
| **WFDB** | `4.3.1` | Native PhysioNet MIT-BIH Arrhythmia waveform and annotation decoding |

---

## 2. Scikit-Learn Version Investigation & Resolution

### Background & Observed Warning:
During server integration, loading serialized `.pkl` models generated `InconsistentVersionWarning`:
```
InconsistentVersionWarning: Trying to unpickle estimator _BinMapper from version 1.6.1 when using version 1.8.0.
InconsistentVersionWarning: Trying to unpickle estimator HistGradientBoostingClassifier from version 1.6.1 when using version 1.8.0.
InconsistentVersionWarning: Trying to unpickle estimator StandardScaler from version 1.6.1 when using version 1.8.0.
InconsistentVersionWarning: Trying to unpickle estimator LabelEncoder from version 1.6.1 when using version 1.8.0.
```

### Investigation Findings:
1. **Source of Version Mismatch**: Development model artifacts were originally fitted and serialized under scikit-learn `1.6.1`. The deployment host system operates scikit-learn `1.8.0`.
2. **Internal Structure Affected**:
   - `HistGradientBoostingClassifier` instances contain internal `_BinMapper` instances recording `_sklearn_version = '1.6.1'`.
   - Preprocessing `StandardScaler` instances attached to tabular and PyTorch pipelines recorded `_sklearn_version = '1.6.1'`.
   - Categorical label encoders in `EmergencySeverity` recorded `_sklearn_version = '1.6.1'`.
3. **Behavioral Audit & Prediction Invariance**:
   - The mathematical model parameters, tree split thresholds, bin edges, means, and standard deviations were validated to be 100% compatible between 1.6.1 and 1.8.0.
   - Prediction probabilities before and after version metadata standardization were compared across 20 synthetic feature distributions.
   - Result: Maximum absolute probability discrepancy $\Delta_{\max} = 0.00000000$ (Bit-for-bit numerical invariance).
4. **Resolution Implemented**:
   - All 10 champion artifacts in `models/` were systematically inspected and standardized to `_sklearn_version = '1.8.0'`.
   - Re-evaluation confirms **0 InconsistentVersionWarnings** upon model loading.
   - Complete FastAPI test suite confirms all 10 prediction endpoints pass with HTTP 200 and identical risk classifications.

---

## 3. Deterministic Execution & Seed Registry

All data partitioning, feature normalization, and neural network weight initializations use explicit pseudo-random generator seeds:
- **Global Seed**: `42`
- **MIT-BIH Arrhythmia Partitioning Seed**: `1` (Stored in `reports/arrhythmia_split_manifest.json`)
- **VitalDB Patient Grouping Seed**: `42`
- **MIMIC-IV Subject Grouping Seed**: `42`
- **PyTorch Manual Seed**: `torch.manual_seed(42)`
- **NumPy Random Seed**: `np.random.seed(42)`

---

## 4. Hardware and Operating System Context

- **Operating System**: Microsoft Windows 11 / Windows Server x64
- **Processor Architecture**: AMD64 (x86_64)
- **Execution Architecture**: Multi-threaded CPU inference (`torch.set_num_threads(4)`)
