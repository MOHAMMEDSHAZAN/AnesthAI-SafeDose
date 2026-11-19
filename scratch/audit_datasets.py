import os, sys, glob, json
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

print("=== D4: MIT-BIH RECORDS ===")
mit_dirs = [
    'datasets/02_cardiac_ecg_mitbih',
    'datasets/mitbih',
    'datasets/02_cardiac_ecg_mitbih/mit-bih-arrhythmia-database-1.0.0'
]
for md in mit_dirs:
    if os.path.exists(md):
        print(f"Directory {md} exists:")
        files = os.listdir(md)
        hea_files = [f for f in files if f.endswith('.hea')]
        dat_files = [f for f in files if f.endswith('.dat')]
        atr_files = [f for f in files if f.endswith('.atr')]
        print(f"  Total files: {len(files)}, .hea: {len(hea_files)}, .dat: {len(dat_files)}, .atr: {len(atr_files)}")

# Check mit_bih_ecg_cleaned.csv or equivalent
for root, _, files in os.walk('datasets'):
    for f in files:
        if 'mit' in f.lower() and f.endswith('.csv'):
            p = os.path.join(root, f)
            print(f"Found CSV: {p}")
            try:
                # count lines
                with open(p, 'rb') as fp:
                    lines = sum(1 for _ in fp)
                print(f"  Rows (with header): {lines}")
            except Exception as e:
                print(f"  Error: {e}")

print("\n=== D5: MIMIC-IV-ED DEMO ROWS & KAGGLE LOG ===")
for root, _, files in os.walk('datasets'):
    for f in files:
        if 'ed' in f.lower() and f.endswith('.csv'):
            p = os.path.join(root, f)
            with open(p, 'rb') as fp:
                lines = sum(1 for _ in fp)
            print(f"ED CSV: {p} -> {lines} lines")

# Search for Kaggle log or references
for root, dirs, files in os.walk('.'):
    if any(x in root for x in ['venv', '.git', 'node_modules', 'datasets']): continue
    for f in files:
        if any(term in f.lower() for term in ['kaggle', 'training_log', 'full_training']):
            p = os.path.join(root, f)
            print(f"Kaggle/Training reference file: {p}")

print("\n=== D6: MIMIC-IV HOSP ADMISSIONS & PATIENTS ===")
mimic_hosp_dir = 'datasets/mimiciv/3.1/hosp'
if os.path.exists(mimic_hosp_dir):
    for f in os.listdir(mimic_hosp_dir):
        if f.endswith('.csv') or f.endswith('.csv.gz'):
            p = os.path.join(mimic_hosp_dir, f)
            print(f"HOSP file: {p} ({os.path.getsize(p)} bytes)")
            if 'admissions' in f:
                df = pd.read_csv(p)
                print(f"  Admissions count: {len(df)}, Unique subject_id: {df['subject_id'].nunique()}, Unique hadm_id: {df['hadm_id'].nunique()}")
            elif 'patients' in f:
                df = pd.read_csv(p)
                print(f"  Patients count: {len(df)}, Unique subject_id: {df['subject_id'].nunique()}")

print("\n=== D6: REGISTRY TEST PARTITION SIZES ===")
with open('reports/final_verified_10_task_results.csv', 'r', encoding='utf-8') as f:
    print(f.read())

