#!/usr/bin/env python3
import os
import re
import numpy as np
import pandas as pd

# Add preprocessing and training directories to sys.path
import sys
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for path in [os.path.join(project_root, 'preprocessing'), os.path.join(project_root, 'training')]:
    if path not in sys.path:
        sys.path.append(path)

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


def generate_anesthesia_drugs_dataset(output_path):
    print("Generating anesthesia_drugs.csv...")
    import csv
    header = ['Drug_A', 'Drug_B', 'Interaction_Severity', 'Synergistic_Sedation', 'Respiratory_Depression_Risk', 'Induction_Dose_mg_kg', 'Renal_Clearance_Req', 'Hepatic_Clearance_Req']
    drugs = ['Propofol', 'Fentanyl', 'Midazolam', 'Succinylcholine', 'Vecuronium', 'Neostigmine', 'Ephedrine', 'Atropine']
    data = []
    np.random.seed(42)
    for i in range(len(drugs)):
        for j in range(len(drugs)):
            drug_a = drugs[i]
            drug_b = drugs[j]
            severity = 0
            synergy = 0
            resp_risk = 0
            if (drug_a == 'Propofol' and drug_b == 'Fentanyl') or (drug_a == 'Fentanyl' and drug_b == 'Propofol'):
                severity = 2
                synergy = 1
                resp_risk = 1
            elif (drug_a == 'Midazolam' and drug_b == 'Fentanyl') or (drug_a == 'Fentanyl' and drug_b == 'Midazolam'):
                severity = 2
                synergy = 1
                resp_risk = 1
            elif (drug_a == 'Succinylcholine' and drug_b == 'Vecuronium') or (drug_a == 'Vecuronium' and drug_b == 'Succinylcholine'):
                severity = 3
                synergy = 0
                resp_risk = 1
            elif (drug_a == 'Neostigmine' and drug_b == 'Succinylcholine') or (drug_a == 'Succinylcholine' and drug_b == 'Neostigmine'):
                severity = 3
                synergy = 0
                resp_risk = 0
            elif (drug_a == 'Ephedrine' and drug_b == 'Atropine') or (drug_a == 'Atropine' and drug_b == 'Ephedrine'):
                severity = 1
                synergy = 0
                resp_risk = 0
            dose = 2.0 if drug_a == 'Propofol' else (0.002 if drug_a == 'Fentanyl' else (0.05 if drug_a == 'Midazolam' else (1.0 if drug_a == 'Succinylcholine' else 0.1)))
            renal = 1 if drug_a in ['Vecuronium', 'Neostigmine'] else 0
            hepatic = 1 if drug_a in ['Propofol', 'Midazolam', 'Fentanyl'] else 0
            data.append([drug_a, drug_b, severity, synergy, resp_risk, dose, renal, hepatic])
    for _ in range(100):
        drug_a = np.random.choice(drugs)
        drug_b = np.random.choice(drugs)
        severity = int(np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1]))
        synergy = 1 if severity >= 2 else int(np.random.choice([0, 1], p=[0.8, 0.2]))
        resp_risk = 1 if severity >= 2 else int(np.random.choice([0, 1], p=[0.9, 0.1]))
        dose = float(np.random.uniform(0.01, 2.0))
        renal = int(np.random.choice([0, 1]))
        hepatic = int(np.random.choice([0, 1]))
        data.append([drug_a, drug_b, severity, synergy, resp_risk, dose, renal, hepatic])
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(data)
    print(f"Successfully generated. Output saved to: {output_path}")

def generate_pacu_dataset(output_path):
    print("Generating pacu_dataset.csv...")
    import csv
    header = ['Age', 'Gender_Code', 'Surgery_Duration_min', 'EBL_mL', 'Anesthesia_Type', 'Pain_Score', 'PONV_Score', 'Arrival_Temp_C', 'Aldrete_Score_60min', 'Delayed_Discharge']
    np.random.seed(42)
    data = []
    for _ in range(500):
        age = int(np.random.normal(54, 15))
        age = max(18, min(90, age))
        gender = int(np.random.choice([0, 1]))
        duration = int(np.random.normal(120, 45))
        duration = max(30, duration)
        ebl = int(np.random.exponential(150))
        ebl = max(10, min(2000, ebl))
        ane_type = int(np.random.choice([0, 1, 2], p=[0.2, 0.3, 0.5]))
        pain = int(np.random.choice([1, 2, 3, 4, 5, 6, 7, 8], p=[0.1, 0.15, 0.2, 0.2, 0.15, 0.1, 0.05, 0.05]))
        if ane_type == 2:
            pain = min(10, pain + 2)
        ponv = int(np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1]))
        if gender == 1 and pain > 5:
            ponv = int(np.random.choice([1, 2], p=[0.6, 0.4]))
        arrival_temp = float(np.random.normal(36.0, 0.6))
        arrival_temp = max(34.0, min(37.8, arrival_temp))
        aldrete = 10
        if pain > 7: aldrete -= 1
        if ponv == 2: aldrete -= 1
        if arrival_temp < 35.0: aldrete -= 1
        if ebl > 800: aldrete -= 2
        if duration > 240: aldrete -= 1
        aldrete = max(4, min(10, aldrete))
        delayed = 1 if aldrete < 9 else 0
        data.append([age, gender, duration, ebl, ane_type, pain, ponv, f"{arrival_temp:.1f}", aldrete, delayed])
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(data)
    print(f"Successfully generated. Output saved to: {output_path}")

def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    datasets_dir = os.path.join(project_root, 'datasets')
    
    print("====================================================")
    print("       AnesthAI - Dataset Cleaning Service          ")
    print("====================================================")
    
    # 1. Clean Anesthesia Dataset
    clean_anesthesia_dataset(
        os.path.join(datasets_dir, '05_pacu_recovery', 'Anesthesia_Dataset (1).csv'),
        os.path.join(datasets_dir, '05_pacu_recovery', 'Anesthesia_Dataset_cleaned.csv')
    )
    
    # 2. Clean Preoperative Risk Dataset
    clean_preoperative_risk(
        os.path.join(datasets_dir, '04_preoperative_risk', 'preoperative_risk_dataset.csv'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'preoperative_risk_dataset_cleaned.csv')
    )
    
    # 3. Clean Hemodynamics Dataset
    clean_hemodynamics(
        os.path.join(datasets_dir, '01_hypotension', 'intraoperative_hemodynamics_dataset.csv'),
        os.path.join(datasets_dir, '01_hypotension', 'intraoperative_hemodynamics_cleaned.csv')
    )
    
    # 4. Clean large Human Vital Signs dataset
    clean_human_vital_signs(
        os.path.join(datasets_dir, '02_hypoxia', 'human_vital_signs_dataset_2024.csv (1)', 'human_vital_signs_dataset_2024.csv'),
        os.path.join(datasets_dir, '02_hypoxia', 'human_vital_signs_dataset_cleaned.csv')
    )
    
    # 5. Decode binary WFDB records & align ECG heartbeats
    extract_ecg_beats(
        datasets_dir,
        os.path.join(datasets_dir, '03_arrhythmia', 'mit_bih_ecg_cleaned.csv')
    )
    
    # 6. Preprocess & resample raw VitalDB signals
    extract_vitaldb_hemodynamics(
        datasets_dir,
        os.path.join(datasets_dir, '01_hypotension', 'vitaldb_hemodynamics_cleaned.csv')
    )
    
    # 7. Generate anesthesia drugs dataset
    generate_anesthesia_drugs_dataset(
        os.path.join(datasets_dir, '06_drug_safety', 'anesthesia_drugs.csv')
    )
    
    # 8. Generate PACU recovery dataset
    generate_pacu_dataset(
        os.path.join(datasets_dir, '05_pacu_recovery', 'pacu_dataset.csv')
    )
    
    print("\n====================================================")
    print("All datasets successfully cleaned and ready for training!")
    print("====================================================")


if __name__ == '__main__':
    main()
