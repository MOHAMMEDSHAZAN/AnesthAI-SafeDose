# AnesthAI SafeDose — Final Full-Data Training Pipeline (Kaggle GPU)

## Overview
This package contains the complete, scientifically verified full-data training pipeline for **AnesthAI SafeDose**, designed for high-performance execution on Kaggle GPU environments (NVIDIA Tesla P100 / T4).

### Key Scientific Principles Enforced
1. **Zero Target Leakage**: Mathematical outcome variables (MAP for Hypotension, SpO2 for Hypoxia, HR for Bradycardia/Tachycardia, Hospital Expire Flag for Mortality, Acuity for Emergency Severity) are strictly blacklisted from predictor sets. An automated leakage audit blocks training if any leak is detected.
2. **Zero Patient Overlap**: 3-Way Patient/Record-Grouped Split (~70% Train, ~15% Validation, ~15% Test) mathematically asserts:
   Train and Validation = Empty, Train and Test = Empty, Validation and Test = Empty.
3. **No Arbitrary Data Limits**: Dynamically ingests all available authentic data without arbitrary caps (no 50k MIMIC row limit, no 15k DL sample limit, no 2M labevents cap).
4. **Validation-Only Model Selection & Threshold Tuning**: Champion model selection and decision threshold optimization occur strictly on held-out validation data. The test set is evaluated exactly once on the locked model.
5. **GPU-Accelerated Mini-Batch Training**: PyTorch DataLoader mini-batches and histogram-binned tree algorithms (HistGradientBoosting, XGBoost) scale to millions of records.
6. **Zero Synthetic Training Data**: Excludes all synthetic cohorts (PACU, Drug Safety rule matrix, prototype registries).

---

## Directory Structure
`
kaggle_full_training/
├── datasets/
│   ├── 01_hemodynamics_vitaldb/      # 235 authentic VitalDB patient case files (~4.5M biosignal rows)
│   ├── 03_arrhythmia/                # MIT-BIH Arrhythmia Database (48 records, ~110,000 beats)
│   ├── 04_preoperative_risk/         # MIMIC-IV ED triage vitals
│   └── mimiciv/
│       └── 3.1/
│           ├── hosp/                 # Authentic MIMIC-IV 3.1 Hospital (patients, admissions, labs, rx)
│           └── icu/                  # Authentic MIMIC-IV 3.1 ICU (icustays, chartevents, inputs)
├── training/
│   └── train_pipeline.py             # Main training & evaluation engine
├── preprocessing/
│   └── data_loader.py                # Chunked, memory-efficient data loader
└── README_KAGGLE.md                  # Execution instructions
`

---

## Kaggle Execution Instructions

### 1. Hardware Accelerator Setup
- In the Kaggle notebook settings sidebar:
  - **Accelerator**: GPU P100 or GPU T4 x 2
  - **Internet**: Enabled (for downloading any required packages)
  - **Persistence**: Variables and Files

### 2. Environment Verification & Package Installation
Ensure required packages are available:
` ash
pip install -q wfdb xgboost lightgbm shap scikit-learn torch torchvision
`

### 3. Execution Commands

#### Option A: Running with Full MIMIC-IV-ED v2.2 Dataset Mounted
Mount your authorized MIMIC-IV-ED v2.2 dataset (e.g. at `/kaggle/input/mimic-iv-ed-2.2/ed`):
```bash
python training/train_pipeline.py \
    --datasets-dir datasets \
    --mimic-ed-path /kaggle/input/mimic-iv-ed-2.2/ed \
    --batch-size 512 \
    --epochs 25 \
    --output-dir /kaggle/working/models \
    --reports-dir /kaggle/working/reports
```
*Or via environment variable:*
```bash
export MIMIC_ED_PATH=/kaggle/input/mimic-iv-ed-2.2/ed
python training/train_pipeline.py \
    --datasets-dir datasets \
    --batch-size 512 \
    --epochs 25 \
    --output-dir /kaggle/working/models \
    --reports-dir /kaggle/working/reports
```

#### Option B: Full Kaggle Dataset Mounts
If all datasets are mounted under `/kaggle/input/`:
```bash
python training/train_pipeline.py \
    --datasets-dir /kaggle/input/safedose-datasets/datasets \
    --mimic-ed-path /kaggle/input/mimic-iv-ed-2.2/ed \
    --batch-size 512 \
    --epochs 25 \
    --output-dir /kaggle/working/models \
    --reports-dir /kaggle/working/reports
```

> **IMPORTANT**: The pipeline strictly verifies that the loaded ED dataset is the full authentic MIMIC-IV-ED v2.2 cohort (>400,000 stays) and detects all 6 required files: `edstays.csv.gz`, `triage.csv.gz`, `vitalsign.csv.gz`, `diagnosis.csv.gz`, `medrecon.csv.gz`, `pyxis.csv.gz`. Silent fallback to the 222-stay demo subset is prohibited. If full MIMIC-IV-ED is not detected, `EmergencySeverity` training halts with an explicit error.

#### Option C: Generate Optional Final Deployment Models (Train + Val)
To create final deployment models trained on combined Train + Validation cohorts (while freezing untouched Test metrics for IEEE paper reporting):
```bash
python training/train_pipeline.py \
    --datasets-dir datasets \
    --mimic-ed-path /kaggle/input/mimic-iv-ed-2.2/ed \
    --batch-size 512 \
    --epochs 25 \
    --train-deployment-model \
    --output-dir /kaggle/working/models \
    --reports-dir /kaggle/working/reports
```

#### Option D: Resumed Execution (e.g. from Tachycardia)
If training was interrupted and you wish to resume from a specific task (e.g., `Tachycardia`) while preserving all existing artifacts and reports:
```bash
python /kaggle/working/training/train_pipeline.py \
  --datasets-dir /kaggle/input/datasets/mohammedshazan88/safedosetraining/datasets \
  --batch-size 512 \
  --epochs 10 \
  --validation-size 0.15 \
  --test-size 0.15 \
  --seed 42 \
  --output-dir /kaggle/working/models \
  --reports-dir /kaggle/working/reports \
  --resume-from Tachycardia
```

---


## Output Artifacts Generated
All outputs are saved to /kaggle/working/ (never /kaggle/input/):

### Model Artifacts (/kaggle/working/models/)
- Hypotension.pkl
- Hypoxia.pkl
- Bradycardia.pkl
- Tachycardia.pkl
- Arrhythmia.pkl
- EmergencySeverity.pkl
- BloodLoss.pkl
- FluidRecommendation.pkl
- ICU.pkl
- Mortality.pkl

### Scientific Reports (/kaggle/working/reports/)
- inal_training_report.md: Complete clinical validation report with untouched held-out test metrics.
- model_comparison.csv: Validation benchmark across all candidate algorithms.
- inal_test_results.csv: Final locked champion performance metrics.
- inal_training_environment.json: Full reproducibility metadata (CUDA info, versions, split stats, zero overlap confirmation).
- hyperparameters.json & eature_lists.json: Complete parameter and feature schemas.
- xai_report.md & plots/*_shap.png: Genuine SHAP feature importance attributions.
- plots/*_curves.png & plots/*_cm.png: ROC, PR curves, and confusion matrices.
