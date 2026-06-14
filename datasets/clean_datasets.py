#!/usr/bin/env python3
import os
import re
import numpy as np
import pandas as pd

# Add backend to path to import data_loader
import sys
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    import data_loader
    import train_pipeline
    HAS_LOADERS = True
except ImportError:
    HAS_LOADERS = False


def clean_anesthesia_dataset(filepath, output_path):
    print("Cleaning Anesthesia_Dataset (1).csv...")
    if not os.path.exists(filepath):
        print(f" - File not found: {filepath}")
        return
        
    df = pd.read_csv(filepath)
    
    # 1. Clean SurgeryDuration (e.g., "217 min" -> 217)
    df['SurgeryDuration'] = df['SurgeryDuration'].apply(
        lambda x: int(re.search(r'\d+', str(x)).group()) if re.search(r'\d+', str(x)) else 0
    )
    
    # 2. Encode gender
    df['Gender_Code'] = (df['Gender'].str.strip() == 'M').astype(int)
    
    # 3. Clean and map PreoperativeNotes (Hypertension, diabetes, stable)
    df['Preop_Hypertension'] = df['PreoperativeNotes'].str.contains('Hypertension', case=False, na=False).astype(int)
    df['Preop_Diabetes'] = df['PreoperativeNotes'].str.contains('diabetes', case=False, na=False).astype(int)
    df['Preop_Stable'] = df['PreoperativeNotes'].str.contains('stable', case=False, na=False).astype(int)
    
    # 4. Clean PostoperativeNotes (pain, nausea, bleeding, slow recovery)
    df['Postop_Pain'] = df['PostoperativeNotes'].str.contains('pain', case=False, na=False).astype(int)
    df['Postop_Nausea'] = df['PostoperativeNotes'].str.contains('nausea', case=False, na=False).astype(int)
    df['Postop_Bleeding'] = df['PostoperativeNotes'].str.contains('bleeding', case=False, na=False).astype(int)
    df['Postop_Slow_Recovery'] = df['PostoperativeNotes'].str.contains('slow recovery', case=False, na=False).astype(int)
    
    # 5. One-hot encode SurgeryType, AnesthesiaType, and Complications
    df = pd.get_dummies(df, columns=['SurgeryType', 'AnesthesiaType', 'Complications'], drop_first=False)
    
    # Convert all boolean dummies to 0/1 integers
    for col in df.columns:
        if df[col].dtype == bool:
            df[col] = df[col].astype(int)
            
    df.to_csv(output_path, index=False)
    print(f"Successfully cleaned. Output saved to: {output_path}")


def clean_preoperative_risk(filepath, output_path):
    print("Cleaning preoperative_risk_dataset.csv...")
    if not os.path.exists(filepath):
        print(f" - File not found: {filepath}")
        return
        
    df = pd.read_csv(filepath)
    
    # 1. Gender code
    df['Gender_Code'] = (df['Gender'].str.strip() == 'Female').astype(int)
    
    # 2. Comorbidities one-hot parser (split by '|')
    comorbidities = df['Comorbidities'].str.get_dummies(sep='|')
    comorbidities.columns = [f'Comorb_{col}' for col in comorbidities.columns]
    df = pd.concat([df.drop(columns=['Comorbidities']), comorbidities], axis=1)
    
    # 3. Label encode Anesthesia Technique target (General, Spinal, MAC)
    df['Anesthesia_Technique_Code'] = pd.factorize(df['Anesthesia_Technique'])[0]
    
    df.to_csv(output_path, index=False)
    print(f"Successfully cleaned. Output saved to: {output_path}")


def clean_hemodynamics(filepath, output_path):
    print("Cleaning intraoperative_hemodynamics_dataset.csv...")
    if not os.path.exists(filepath):
        print(f" - File not found: {filepath}")
        return
        
    df = pd.read_csv(filepath)
    
    # Forward/Backward fill missing values
    df = df.ffill().bfill()
    df.to_csv(output_path, index=False)
    print(f"Successfully cleaned. Output saved to: {output_path}")


def clean_human_vital_signs(filepath, output_path):
    print("Cleaning human_vital_signs_dataset_2024.csv...")
    if not os.path.exists(filepath):
        print(f" - File not found: {filepath}")
        return
        
    df = pd.read_csv(filepath)
    df = df.ffill().bfill()
    
    # Gender code
    df['Gender_Code'] = (df['Gender'].str.strip() == 'Female').astype(int)
    # Risk Category factorization (Low, Medium, High Risk)
    df['Risk_Category_Code'] = pd.factorize(df['Risk Category'])[0]
    
    df.to_csv(output_path, index=False)
    print(f"Successfully cleaned. Output saved to: {output_path}")


def extract_ecg_beats(datasets_dir, output_path):
    print("Extracting and cleaning MIT-BIH ECG Heartbeats...")
    if not HAS_LOADERS:
        print(" - Loaders unavailable to extract ECG records.")
        return
        
    records = data_loader.load_mit_bih_ecg(datasets_dir, max_records=10)
    X_beats = []
    y_beats = []
    
    for record in records:
        sig = record['signal'][:, 0]
        peaks = record['ann_sample']
        symbols = record['ann_type']
        
        for peak, sym in zip(peaks, symbols):
            # 100 sample slice around the R-peak
            if peak > 50 and peak < len(sig) - 50:
                beat = sig[peak-50 : peak+50]
                X_beats.append(beat)
                y_beats.append(0 if sym == 'N' else 1) # 0: Normal, 1: Arrhythmia
                
    if X_beats:
        df = pd.DataFrame(X_beats, columns=[f'ecg_sample_{i}' for i in range(100)])
        df['Arrhythmia_Occurred'] = y_beats
        df.to_csv(output_path, index=False)
        print(f"Successfully cleaned and extracted {len(df)} beats to: {output_path}")
    else:
        print(" - No ECG peaks found to extract.")


def extract_vitaldb_hemodynamics(datasets_dir, output_path):
    print("Extracting and cleaning VitalDB hemodynamics records...")
    if not HAS_LOADERS:
        print(" - Loaders unavailable to extract VitalDB signals.")
        return
        
    df_vital = data_loader.load_vitaldb_cases(datasets_dir, max_cases=10)
    if df_vital.empty:
        print(" - No VitalDB case files loaded.")
        return
        
    pipeline = train_pipeline.ClinicalTrainingPipeline(datasets_dir)
    X_hemo, features_hemo = pipeline.prepare_hemodynamic_features(df_vital)
    
    df_clean = pd.DataFrame(X_hemo, columns=features_hemo)
    df_clean['Hypotension_Occurred'] = (df_vital['map'] < 60).astype(int)
    df_clean['Hypoxia_Occurred'] = (df_vital['spo2'] < 90).astype(int)
    df_clean['Bradycardia_Occurred'] = (df_vital['hr'] < 60).astype(int)
    df_clean['Tachycardia_Occurred'] = (df_vital['hr'] > 100).astype(int)
    
    df_clean.to_csv(output_path, index=False)
    print(f"Successfully cleaned and extracted hemodynamics to: {output_path}")


def main():
    datasets_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("====================================================")
    print("       AnesthAI - Dataset Cleaning Service          ")
    print("====================================================")
    
    # 1. Clean Anesthesia Dataset
    clean_anesthesia_dataset(
        os.path.join(datasets_dir, 'Anesthesia_Dataset (1).csv'),
        os.path.join(datasets_dir, 'Anesthesia_Dataset_cleaned.csv')
    )
    
    # 2. Clean Preoperative Risk Dataset
    clean_preoperative_risk(
        os.path.join(datasets_dir, 'preoperative_risk_dataset.csv'),
        os.path.join(datasets_dir, 'preoperative_risk_dataset_cleaned.csv')
    )
    
    # 3. Clean Hemodynamics Dataset
    clean_hemodynamics(
        os.path.join(datasets_dir, 'intraoperative_hemodynamics_dataset.csv'),
        os.path.join(datasets_dir, 'intraoperative_hemodynamics_cleaned.csv')
    )
    
    # 4. Clean large Human Vital Signs dataset
    clean_human_vital_signs(
        os.path.join(datasets_dir, 'human_vital_signs_dataset_2024.csv (1)', 'human_vital_signs_dataset_2024.csv'),
        os.path.join(datasets_dir, 'human_vital_signs_dataset_cleaned.csv')
    )
    
    # 5. Decode binary WFDB records & align ECG heartbeats
    extract_ecg_beats(
        datasets_dir,
        os.path.join(datasets_dir, 'mit_bih_ecg_cleaned.csv')
    )
    
    # 6. Preprocess & resample raw VitalDB signals
    extract_vitaldb_hemodynamics(
        datasets_dir,
        os.path.join(datasets_dir, 'vitaldb_hemodynamics_cleaned.csv')
    )
    
    print("\n====================================================")
    print("All datasets successfully cleaned and ready for training!")
    print("====================================================")


if __name__ == '__main__':
    main()
