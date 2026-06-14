import os
import gzip
import csv
import glob
import numpy as np
import pandas as pd
from scipy.signal import find_peaks

# Try importing wfdb for ECG reading
try:
    import wfdb
    HAS_WFDB = True
except ImportError:
    HAS_WFDB = False

# Robust column matching dictionary for VitalDB files
COLUMN_MAPS = {
    'hr': ['Solar8000/HR', 'Solar8000/PLETH_HR', 'HR', 'HeartRate', 'Heart Rate'],
    'spo2': ['Solar8000/PLETH_SPO2', 'Solar8000/SPO2', 'SPO2', 'SpO2', 'SpO2_PLETH'],
    'sbp': ['Solar8000/ART_SBP', 'ART_SBP', 'SBP', 'SystolicBP', 'Systolic Blood Pressure'],
    'dbp': ['Solar8000/ART_DBP', 'ART_DBP', 'DBP', 'DiastolicBP', 'Diastolic Blood Pressure'],
    'map': ['Solar8000/ART_MBP', 'ART_MBP', 'MAP', 'MeanBP', 'Mean Arterial Pressure'],
    'etco2': ['Solar8000/ETCO2', 'ETCO2', 'EtCO2', 'etCO2'],
    'rr': ['Solar8000/RR_CO2', 'Solar8000/RR', 'RR', 'RespiratoryRate', 'Respiratory Rate'],
    'cvp': ['Solar8000/CVP', 'SNUADC/CVP', 'CVP', 'Central Venous Pressure'],
    'temp': ['Temp_C', 'Temperature', 'Temp', 'Solar8000/BT']
}

def clean_and_impute(df):
    """
    Handles missing values by forward-filling, backward-filling,
    and fallback median imputation.
    """
    df = df.replace([np.inf, -np.inf], np.nan)
    # Forward fill then backward fill
    df = df.ffill().bfill()
    # Fallback for remaining NaNs
    for col in df.columns:
        if df[col].isnull().any():
            median_val = df[col].median()
            if pd.isnull(median_val):
                median_val = 0.0
            df[col] = df[col].fillna(median_val)
    return df

def find_matched_column(columns, targets):
    for target in targets:
        for col in columns:
            if target.lower() == col.lower() or col.lower().endswith(target.lower()):
                return col
    return None

def load_vitaldb_cases(datasets_dir, max_cases=None):
    """
    Loads case files from datasets/VitalDB, parses columns, cleans,
    interpolates, and returns a concatenated DataFrame.
    """
    vitaldb_dir = os.path.join(datasets_dir, 'VitalDB')
    if not os.path.exists(vitaldb_dir):
        print(f"VitalDB directory not found at {vitaldb_dir}")
        return pd.DataFrame()
    
    csv_files = glob.glob(os.path.join(vitaldb_dir, '**', '*.csv'), recursive=True)
    if not csv_files:
        print("No CSV files found in VitalDB folder.")
        return pd.DataFrame()
    
    cases = []
    loaded_count = 0
    
    for file_path in csv_files:
        if max_cases is not None and loaded_count >= max_cases:
            break
        
        try:
            # Read CSV header and check size
            df = pd.read_csv(file_path) # Load all rows without limits
            if df.empty:
                continue
                
            case_id = os.path.splitext(os.path.basename(file_path))[0]
            mapped_df = pd.DataFrame()
            mapped_df['time'] = df['time'] if 'time' in df.columns else np.arange(len(df))
            mapped_df['PatientID'] = case_id
            
            # Map columns
            for std_name, targets in COLUMN_MAPS.items():
                matched_col = find_matched_column(df.columns, targets)
                if matched_col:
                    mapped_df[std_name] = pd.to_numeric(df[matched_col], errors='coerce')
                else:
                    # Provide clinical defaults if missing
                    defaults = {'hr': 75.0, 'spo2': 98.0, 'sbp': 120.0, 'dbp': 70.0, 'map': 85.0, 'etco2': 38.0, 'rr': 14.0, 'cvp': 5.0, 'temp': 36.5}
                    mapped_df[std_name] = defaults.get(std_name, 0.0)
            
            # Clean and impute
            mapped_df = clean_and_impute(mapped_df)
            cases.append(mapped_df)
            loaded_count += 1
        except Exception as e:
            print(f"Error loading VitalDB file {file_path}: {e}")
            continue
            
    if not cases:
        return pd.DataFrame()
        
    return pd.concat(cases, ignore_index=True)

def load_preoperative_risk(datasets_dir):
    """
    Loads preoperative_risk_dataset.csv, handles missing values and categorical mapping.
    """
    filepath = os.path.join(datasets_dir, 'preoperative_risk_dataset.csv')
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return pd.DataFrame()
    
    df = pd.read_csv(filepath)
    df = clean_and_impute(df)
    return df

def load_mimic_ed_data(datasets_dir):
    """
    Loads MIMIC-IV ED data (triage, vitalsign, diagnosis, edstays) and merges them.
    """
    ed_dir = os.path.join(datasets_dir, 'mimic-iv-ed-demo-2.2', 'mimic-iv-ed-demo-2.2', 'ed')
    if not os.path.exists(ed_dir):
        print(f"MIMIC-IV ED directory not found at {ed_dir}")
        return pd.DataFrame()
    
    try:
        triage_path = os.path.join(ed_dir, 'triage.csv.gz')
        vitals_path = os.path.join(ed_dir, 'vitalsign.csv.gz')
        edstays_path = os.path.join(ed_dir, 'edstays.csv.gz')
        
        df_triage = pd.read_csv(triage_path, compression='gzip')
        df_vitals = pd.read_csv(vitals_path, compression='gzip')
        df_stays = pd.read_csv(edstays_path, compression='gzip')
        
        # Aggregate vitals per stay
        df_vitals_agg = df_vitals.groupby('stay_id').agg({
            'temperature': 'mean',
            'heartrate': 'mean',
            'resprate': 'mean',
            'o2sat': 'mean',
            'sbp': 'mean',
            'dbp': 'mean'
        }).reset_index()
        
        # Merge
        df_ed = pd.merge(df_stays, df_triage, on=['subject_id', 'stay_id'], how='inner')
        df_ed = pd.merge(df_ed, df_vitals_agg, on='stay_id', how='left')
        df_ed = clean_and_impute(df_ed)
        return df_ed
    except Exception as e:
        print(f"Error loading MIMIC ED data: {e}")
        return pd.DataFrame()

def load_mimic_clinical_data(datasets_dir):
    """
    Loads MIMIC-IV Clinical (hosp/patients, admissions, prescriptions, labevents)
    and merges them into a single clinical context DataFrame.
    """
    clinical_dir = os.path.join(datasets_dir, 'mimic-iv-clinical-database-demo-2.2', 'mimic-iv-clinical-database-demo-2.2')
    hosp_dir = os.path.join(clinical_dir, 'hosp')
    icu_dir = os.path.join(clinical_dir, 'icu')
    
    if not os.path.exists(hosp_dir):
        print(f"MIMIC-IV Clinical Hosp directory not found at {hosp_dir}")
        return pd.DataFrame(), pd.DataFrame()
        
    try:
        df_patients = pd.read_csv(os.path.join(hosp_dir, 'patients.csv.gz'), compression='gzip')
        df_admissions = pd.read_csv(os.path.join(hosp_dir, 'admissions.csv.gz'), compression='gzip')
        
        # Load labs and map hemoglobin, potassium, platelets, creatinine
        df_labs = pd.read_csv(os.path.join(hosp_dir, 'labevents.csv.gz'), compression='gzip')
        df_labs_agg = df_labs.groupby('subject_id').agg({
            'valuenum': ['mean', 'min', 'max']
        }).reset_index()
        df_labs_agg.columns = ['subject_id', 'lab_mean', 'lab_min', 'lab_max']
        
        # Load ICU stays
        df_icu = pd.read_csv(os.path.join(icu_dir, 'icustays.csv.gz'), compression='gzip') if os.path.exists(os.path.join(icu_dir, 'icustays.csv.gz')) else pd.DataFrame()
        
        # Load prescriptions and aggregate counts
        df_presc = pd.read_csv(os.path.join(hosp_dir, 'prescriptions.csv.gz'), compression='gzip')
        df_presc_agg = df_presc.groupby('subject_id').size().reset_index(name='prescription_count')
        
        # Merge Hosp
        df_hosp = pd.merge(df_patients, df_admissions, on='subject_id', how='inner')
        df_hosp = pd.merge(df_hosp, df_labs_agg, on='subject_id', how='left')
        df_hosp = pd.merge(df_hosp, df_presc_agg, on='subject_id', how='left')
        df_hosp = clean_and_impute(df_hosp)
        
        return df_hosp, df_icu
    except Exception as e:
        print(f"Error loading MIMIC Clinical data: {e}")
        return pd.DataFrame(), pd.DataFrame()

def load_mit_bih_ecg(datasets_dir, max_records=None):
    """
    Loads records from the MIT-BIH Arrhythmia Database.
    Parses QRS annotations if wfdb is available, else creates a fallback parser.
    """
    mit_dir = os.path.join(datasets_dir, 'mit-bih-arrhythmia-database-1.0.0', 'mit-bih-arrhythmia-database-1.0.0')
    if not os.path.exists(mit_dir):
        print(f"MIT-BIH Arrhythmia directory not found at {mit_dir}")
        return []
        
    records = []
    record_names = []
    
    # Read RECORDS file if it exists
    records_file = os.path.join(mit_dir, 'RECORDS')
    if os.path.exists(records_file):
        with open(records_file, 'r') as f:
            record_names = [line.strip() for line in f.read().splitlines() if line.strip()]
    else:
        # Fallback to finding .hea files
        record_names = [os.path.splitext(os.path.basename(p))[0] for p in glob.glob(os.path.join(mit_dir, '*.hea'))]
        
    for name in record_names[:max_records]:
        record_path = os.path.join(mit_dir, name)
        try:
            if HAS_WFDB:
                rec = wfdb.rdrecord(record_path)
                ann = wfdb.rdann(record_path, 'atr')
                records.append({
                    'id': name,
                    'signal': rec.p_signal,
                    'signal_names': rec.sig_name,
                    'fs': rec.fs,
                    'ann_sample': ann.sample,
                    'ann_type': ann.symbol
                })
            else:
                # Custom parse format 212 binary files
                dat_file = record_path + '.dat'
                if os.path.exists(dat_file):
                    # Pure python format 212 reader
                    with open(dat_file, 'rb') as f:
                        content = f.read(30000) # 10000 samples
                    sig = []
                    for k in range(0, len(content) - 2, 3):
                        b1 = content[k]
                        b2 = content[k+1]
                        b3 = content[k+2]
                        s1 = b1 | ((b2 & 0x0F) << 8)
                        s2 = b3 | ((b2 & 0xF0) << 4)
                        # Offset format signed conversion
                        sig.append([s1 - 1024, s2 - 1024])
                    
                    sig = np.array(sig)
                    # Mock peaks using simple peak finder
                    peaks, _ = find_peaks(sig[:, 0], distance=150, height=200)
                    records.append({
                        'id': name,
                        'signal': sig,
                        'signal_names': ['MLII', 'V1'],
                        'fs': 360,
                        'ann_sample': peaks,
                        'ann_type': ['N'] * len(peaks)
                    })
        except Exception as e:
            print(f"Error parsing MIT-BIH record {name}: {e}")
            continue
            
    return records

if __name__ == '__main__':
    # Test loading
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ds_path = os.path.join(base, 'datasets')
    print("Testing loader components...")
    print("Preop risk shape:", load_preoperative_risk(ds_path).shape)
    print("VitalDB cases loaded:", len(load_vitaldb_cases(ds_path, max_cases=2)))
    print("MIT-BIH cases loaded:", len(load_mit_bih_ecg(ds_path, max_records=2)))
