# SafeDose AI: Kaggle Resume-From-Task Training Suite

This package contains the updated, verified, resume-capable training pipeline for **SafeDose AI (AnesthAI)** on Kaggle GPU.

---

## 1. Package Structure
```text
kaggle_resume_training/
├── training/
│   └── train_pipeline.py      # Full scientific training pipeline with --resume-from
├── preprocessing/
│   └── data_loader.py         # Leakage-free clinical data loader (VitalDB, MIT-BIH, MIMIC-IV)
└── README_KAGGLE_RESUME.md    # Step-by-step execution guide
```

---

## 2. Quick Setup on Kaggle

### Step A: Extract to `/kaggle/working/`
In your Kaggle notebook, run:
```bash
!unzip -q -o /kaggle/input/kaggle-resume-training/kaggle_resume_training.zip -d /kaggle/working/
```
*Or if uploaded as raw files/dataset:*
```bash
!cp -r /kaggle/input/kaggle-resume-training/* /kaggle/working/
```

### Step B: Verify the Pipeline & `--resume-from` Support
```bash
!python /kaggle/working/training/train_pipeline.py --help
```
You should see `--resume-from RESUME_FROM` registered in the argument list.

---

## 3. Resume Execution Commands

### Scenario 1: Resume from Tachycardia
(Skips Hypotension, Hypoxia, Bradycardia; preserves existing models & reports)
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

**Expected Startup Output**:
```text
================================================================================
RESUME MODE: TRUE
SKIPPING: Hypotension, Hypoxia, Bradycardia
STARTING: Tachycardia
REMAINING: Tachycardia, Arrhythmia, EmergencySeverity, BloodLoss, FluidRecommendation, ICU, Mortality
================================================================================
```

---

### Scenario 2: Resume from Arrhythmia
(Skips Hypotension, Hypoxia, Bradycardia, Tachycardia; preserves existing models & reports)
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
  --resume-from Arrhythmia
```

**Expected Startup Output**:
```text
================================================================================
RESUME MODE: TRUE
SKIPPING: Hypotension, Hypoxia, Bradycardia, Tachycardia
STARTING: Arrhythmia
REMAINING: Arrhythmia, EmergencySeverity, BloodLoss, FluidRecommendation, ICU, Mortality
================================================================================
```

---

### Scenario 3: Resume from Any Other Task
The pipeline supports case-insensitive resume from any valid clinical task:
- `--resume-from EmergencySeverity`
- `--resume-from BloodLoss`
- `--resume-from FluidRecommendation`
- `--resume-from ICU`
- `--resume-from Mortality`

---

## 4. Key Guarantees & Clinical Safeguards

1. **Artifact Preservation**:
   - Automatically scans `/kaggle/working/models/` for completed models (`Hypotension.pkl`, `Hypoxia.pkl`, `Bradycardia.pkl`, etc.).
   - Loads model weights and test metrics without deleting, retraining, or overwriting them.
2. **Incremental Report Generation**:
   - Saves each model and updates `reports/final_test_results.csv`, `reports/model_comparison.csv`, and research summaries **immediately** after each task finishes.
   - If the kernel dies or is interrupted, all completed tasks remain completely saved and usable.
3. **RAM & VRAM Management**:
   - Triggers explicit garbage collection (`gc.collect()` and `torch.cuda.empty_cache()`) after each task and phase to prevent OOM kernel termination.
4. **MIMIC-IV-ED Strict Authenticity Guardrail**:
   - If full authentic MIMIC-IV-ED v2.2 (>400k stays) is not detected, demo substitution is strictly refused.
   - The pipeline logs a clinical notice, skips `EmergencySeverity`, and proceeds smoothly to Phase 4 (MIMIC-IV 3.1) without crashing.
5. **No Synthetic Data & No Sample Limits**:
   - Excludes synthetic cohorts (PACU, DrugSafety).
   - Ingests all authentic available data without hardcoded caps.
