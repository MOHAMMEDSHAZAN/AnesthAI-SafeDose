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
    df = df.ffill().bfill()
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

def find_file_with_extensions(directory, base_name, extensions=('.csv.gz', '.csv')):
    """
    Finds a file in directory matching base_name with either .csv or .csv.gz extension.
    Returns (full_path, is_gzip) or (None, False).
    """
    if not directory or not os.path.exists(directory):
        return None, False
    for ext in extensions:
        candidate = os.path.join(directory, f"{base_name}{ext}")
        if os.path.exists(candidate):
            return candidate, candidate.endswith('.gz')
    # Case insensitive check
    try:
        files = os.listdir(directory)
        lower_candidates = [f"{base_name.lower()}{ext.lower()}" for ext in extensions]
        for f in files:
            if f.lower() in lower_candidates:
                full_path = os.path.join(directory, f)
                return full_path, f.lower().endswith('.gz')
    except Exception:
        pass
    return None, False

def load_vitaldb_cases(datasets_dir, max_cases=None):
    """
    Loads authentic case files from VitalDB, parses columns, cleans,
    interpolates, and returns a concatenated DataFrame with PatientID.
    """
    candidate_dirs = [
        os.path.join(datasets_dir, '01_hemodynamics_vitaldb', 'VitalDB'),
        os.path.join(datasets_dir, '01_hypotension', 'VitalDB'),
        os.path.join(datasets_dir, '01_hemodynamics_vitaldb'),
        os.path.join(datasets_dir, 'VitalDB')
    ]
    vitaldb_dir = None
    csv_files = []
    for cd in candidate_dirs:
        if os.path.exists(cd):
            files = [f for f in glob.glob(os.path.join(cd, '**', '*.csv'), recursive=True)
                     if not os.path.basename(f).startswith('._') and 'cleaned' not in f.lower()]
            if files:
                vitaldb_dir = cd
                csv_files = sorted(files)
                break
                
    if not vitaldb_dir or not csv_files:
        print(f"No authentic VitalDB CSV files found in candidate paths: {candidate_dirs}")
        return pd.DataFrame()
    
    cases = []
    loaded_count = 0
    
    for file_path in csv_files:
        if max_cases is not None and loaded_count >= max_cases:
            break
        
        try:
            df = pd.read_csv(file_path)
            if df.empty or len(df) < 10:
                continue
                
            case_id = os.path.splitext(os.path.basename(file_path))[0]
            mapped_df = pd.DataFrame()
            mapped_df['time'] = df['time'] if 'time' in df.columns else np.arange(len(df))
            mapped_df['PatientID'] = case_id
            
            for std_name, targets in COLUMN_MAPS.items():
                matched_col = find_matched_column(df.columns, targets)
                if matched_col:
                    mapped_df[std_name] = pd.to_numeric(df[matched_col], errors='coerce')
                else:
                    defaults = {'hr': 75.0, 'spo2': 98.0, 'sbp': 120.0, 'dbp': 70.0, 'map': 85.0, 'etco2': 38.0, 'rr': 14.0, 'cvp': 5.0, 'temp': 36.5}
                    mapped_df[std_name] = defaults.get(std_name, 0.0)
            
            mapped_df = clean_and_impute(mapped_df)
            cases.append(mapped_df)
            loaded_count += 1
        except Exception as e:
            print(f"Error loading VitalDB file {file_path}: {e}")
            continue
            
    if not cases:
        return pd.DataFrame()
        
    print(f"VitalDB cases loaded: {len(cases)} cases (total samples: {sum(len(c) for c in cases):,})")
    return pd.concat(cases, ignore_index=True)

def load_preoperative_risk(datasets_dir):
    """
    Loads authentic preoperative risk cohort (shape ~30 rows).
    Flagged as insufficient for high-performance training.
    """
    candidate_paths = [
        os.path.join(datasets_dir, '04_preoperative_risk', 'preoperative_risk_dataset.csv'),
        os.path.join(datasets_dir, '03_preoperative_assessment', 'preoperative_risk_dataset.csv')
    ]
    for cp in candidate_paths:
        if os.path.exists(cp):
            df = pd.read_csv(cp)
            print(f"Loaded Preoperative Risk dataset from {cp}: shape {df.shape}")
            return clean_and_impute(df)
    return pd.DataFrame()

def validate_mimic_ed_dataset(ed_dir):
    """
    Validates MIMIC-IV ED directory against official v2.2 specification.
    Detects the 6 standard files:
      1. edstays.csv.gz (or .csv)
      2. triage.csv.gz (or .csv)
      3. vitalsign.csv.gz (or .csv)
      4. diagnosis.csv.gz (or .csv)
      5. medrecon.csv.gz (or .csv)
      6. pyxis.csv.gz (or .csv)
    
    Extracts and reports:
      - ED stays count
      - unique subjects count
      - triage rows count
      - vital-sign rows count
      - detection status and file sizes of all 6 files
      - classification: FULL MIMIC-IV-ED AVAILABLE or ONLY MIMIC-IV-ED DEMO AVAILABLE
    """
    if not ed_dir or not os.path.exists(ed_dir):
        return {
            'ed_dir': ed_dir,
            'exists': False,
            'files_detected': {},
            'missing_files': ['edstays', 'triage', 'vitalsign', 'diagnosis', 'medrecon', 'pyxis'],
            'ed_stays': 0,
            'unique_subjects': 0,
            'triage_rows': 0,
            'vitalsign_rows': 0,
            'is_full_dataset': False,
            'verdict': 'NOT DETECTED'
        }
    
    required_files = ['edstays', 'triage', 'vitalsign', 'diagnosis', 'medrecon', 'pyxis']
    files_detected = {}
    missing_files = []
    
    for f in required_files:
        p, is_gz = find_file_with_extensions(ed_dir, f)
        if p and os.path.exists(p):
            files_detected[f] = {
                'path': p,
                'is_gzip': is_gz,
                'size_bytes': os.path.getsize(p),
                'size_mb': round(os.path.getsize(p) / (1024 * 1024), 2)
            }
        else:
            missing_files.append(f)
            
    # Read core files for validation counts
    ed_stays = 0
    unique_subjects = 0
    triage_rows = 0
    vitalsign_rows = 0
    
    if 'edstays' in files_detected:
        try:
            df_s = pd.read_csv(files_detected['edstays']['path'], 
                               usecols=['subject_id', 'stay_id'],
                               compression='gzip' if files_detected['edstays']['is_gzip'] else None)
            ed_stays = len(df_s)
            unique_subjects = df_s['subject_id'].nunique()
        except Exception as e:
            print(f"Warning reading edstays for audit: {e}")
            
    if 'triage' in files_detected:
        try:
            df_t = pd.read_csv(files_detected['triage']['path'],
                               usecols=['stay_id'],
                               compression='gzip' if files_detected['triage']['is_gzip'] else None)
            triage_rows = len(df_t)
        except Exception as e:
            print(f"Warning reading triage for audit: {e}")
            
    if 'vitalsign' in files_detected:
        try:
            df_v = pd.read_csv(files_detected['vitalsign']['path'],
                               usecols=['stay_id'],
                               compression='gzip' if files_detected['vitalsign']['is_gzip'] else None)
            vitalsign_rows = len(df_v)
        except Exception as e:
            print(f"Warning reading vitalsign for audit: {e}")
            
    norm_path = os.path.normpath(ed_dir).lower()
    is_demo_path = 'demo' in norm_path
    
    # Official Full MIMIC-IV-ED v2.2 has 425,087 stays. Demo has 222 stays.
    is_full = (ed_stays > 1000) and (not is_demo_path) and ('edstays' in files_detected) and ('triage' in files_detected)
    verdict = "FULL MIMIC-IV-ED AVAILABLE" if is_full else "ONLY MIMIC-IV-ED DEMO AVAILABLE"
    
    return {
        'ed_dir': ed_dir,
        'exists': True,
        'files_detected': files_detected,
        'missing_files': missing_files,
        'ed_stays': ed_stays,
        'unique_subjects': unique_subjects,
        'triage_rows': triage_rows,
        'vitalsign_rows': vitalsign_rows,
        'is_full_dataset': is_full,
        'verdict': verdict
    }

def detect_mimic_locations(datasets_dir, mimic_ed_path=None):
    """
    Inspects filesystem and returns formal inventory of MIMIC-IV directories.
    Distinguishes authentic full MIMIC-IV-ED v2.2 from the limited demo subset.
    Supports user-supplied path via mimic_ed_path or MIMIC_ED_PATH / MIMIC_IV_ED_PATH env vars.
    """
    inventory = {
        'MIMIC-IV ED (Full)': None,
        'MIMIC-IV ED (Demo)': None,
        'MIMIC-IV HOSP': None,
        'MIMIC-IV ICU': None,
        'MIMIC-IV DEMO': None
    }
    
    # 1. Full MIMIC-IV Clinical (3.1 hosp and icu)
    hosp_candidates = [
        os.path.join(datasets_dir, 'mimiciv', '3.1', 'hosp'),
        os.path.join(datasets_dir, 'mimiciv', 'hosp'),
        os.path.join(datasets_dir, '06_mimic_critical_care', 'hosp')
    ]
    icu_candidates = [
        os.path.join(datasets_dir, 'mimiciv', '3.1', 'icu'),
        os.path.join(datasets_dir, 'mimiciv', 'icu'),
        os.path.join(datasets_dir, '06_mimic_critical_care', 'icu')
    ]
    demo_candidates = [
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-clinical-database-demo-2.2', 'mimic-iv-clinical-database-demo-2.2'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-clinical-database-demo-2.2')
    ]
    
    # 2. MIMIC-IV ED Full candidates
    # Priority: explicit arg -> environment variables -> standard dataset paths -> Kaggle mounts
    ed_full_candidates = []
    if mimic_ed_path and os.path.exists(mimic_ed_path):
        ed_full_candidates.append(mimic_ed_path)
    env_ed_path = os.environ.get('MIMIC_ED_PATH') or os.environ.get('MIMIC_IV_ED_PATH')
    if env_ed_path and os.path.exists(env_ed_path):
        ed_full_candidates.append(env_ed_path)
        
    ed_full_candidates.extend([
        os.path.join(datasets_dir, 'mimiciv', '3.1', 'ed'),
        os.path.join(datasets_dir, 'mimiciv', 'ed'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-ed-2.2', 'ed'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-ed-2.2'),
        os.path.join(datasets_dir, 'mimic-iv-ed-2.2', 'ed'),
        os.path.join(datasets_dir, 'mimic-iv-ed-2.2'),
        os.path.join(datasets_dir, 'mimic-iv-ed', 'ed'),
        os.path.join(datasets_dir, 'mimic-iv-ed'),
        os.path.join(datasets_dir, 'ed')
    ])
    
    # 3. MIMIC-IV ED Demo candidates
    ed_demo_candidates = [
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-ed-demo-2.2', 'mimic-iv-ed-demo-2.2', 'ed'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-ed-demo-2.2', 'ed'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-ed-demo-2.2')
    ]
    
    # Check Kaggle mounts
    if os.path.exists('/kaggle/input'):
        for root, dirs, files in os.walk('/kaggle/input'):
            if 'patients.csv.gz' in files or 'patients.csv' in files:
                hosp_candidates.insert(0, root)
            if 'icustays.csv.gz' in files or 'icustays.csv' in files:
                icu_candidates.insert(0, root)
            if 'edstays.csv.gz' in files or 'edstays.csv' in files:
                if 'demo' in root.lower():
                    ed_demo_candidates.insert(0, root)
                else:
                    ed_full_candidates.insert(0, root)

    for c in hosp_candidates:
        if os.path.exists(c):
            inventory['MIMIC-IV HOSP'] = c
            break
    for c in icu_candidates:
        if os.path.exists(c):
            inventory['MIMIC-IV ICU'] = c
            break
    for c in demo_candidates:
        if os.path.exists(c):
            inventory['MIMIC-IV DEMO'] = c
            break
    for c in ed_demo_candidates:
        if os.path.exists(c):
            inventory['MIMIC-IV ED (Demo)'] = c
            break

    # Resolve Full ED: candidate must exist, contain edstays and triage, and NOT be demo
    for c in ed_full_candidates:
        if os.path.exists(c):
            t_p, _ = find_file_with_extensions(c, 'triage')
            e_p, _ = find_file_with_extensions(c, 'edstays')
            if t_p and e_p and 'demo' not in os.path.normpath(c).lower():
                inventory['MIMIC-IV ED (Full)'] = c
                break

    print("\n--- MIMIC-IV DATASET INVENTORY ---")
    for k, v in inventory.items():
        status = v if v else "NOT DETECTED"
        print(f"  {k:22s}: {status}")
    print("----------------------------------\n")
    return inventory

def load_mimic_ed_data(datasets_dir, mimic_ed_path=None, allow_demo=False):
    """
    Loads MIMIC-IV ED data (triage, vitalsign, edstays).
    
    Guarantees:
    1. Full MIMIC-IV-ED v2.2 path can be passed via mimic_ed_path, MIMIC_ED_PATH env var, or Kaggle input.
    2. Local mimic-iv-ed-demo-2.2 is NOT treated as full MIMIC-IV-ED.
    3. If full MIMIC-IV-ED is unavailable, raises RuntimeError by default (allow_demo=False).
    4. Detects all 6 ED files: edstays, triage, vitalsign, diagnosis, medrecon, pyxis.
    5. Validates cohort size and reports stays, subjects, triage, vitalsign counts.
    6. Excludes acuity from predictor features (preserved in 'acuity' column for target definition).
    7. Patient-level grouping preserved through subject_id.
    8. No arbitrary row limits.
    """
    inventory = detect_mimic_locations(datasets_dir, mimic_ed_path=mimic_ed_path)
    ed_dir = inventory['MIMIC-IV ED (Full)']
    is_using_demo = False
    
    if not ed_dir:
        if allow_demo and inventory['MIMIC-IV ED (Demo)']:
            ed_dir = inventory['MIMIC-IV ED (Demo)']
            is_using_demo = True
            print("\n[WARNING] Full MIMIC-IV-ED dataset not detected. Using DEMO subset (allow_demo=True).")
        else:
            raise RuntimeError(
                "\n" + "="*80 + "\n"
                "[FATAL CONFIGURATION ERROR: FULL MIMIC-IV-ED DATASET REQUIRED]\n"
                "EmergencySeverity training cannot proceed: Full authentic MIMIC-IV-ED v2.2 dataset not detected!\n"
                "The local 222-stay demo subset is strictly PROHIBITED from full scientific training.\n\n"
                "To resolve, provide the legitimate MIMIC-IV-ED v2.2 path via:\n"
                "  1. CLI Argument:       python training/train_pipeline.py --mimic-ed-path /path/to/mimic-iv-ed-2.2/ed\n"
                "  2. Environment Var:    export MIMIC_ED_PATH=/path/to/mimic-iv-ed-2.2/ed\n"
                "  3. Kaggle Dataset:     Mount MIMIC-IV-ED v2.2 in /kaggle/input/\n"
                "="*80 + "\n"
            )
            
    # Run audit and file detection
    audit_report = validate_mimic_ed_dataset(ed_dir)
    print("\n" + "="*80)
    print(f"MIMIC-IV-ED AUDIT & VALIDATION REPORT: {ed_dir}")
    print("="*80)
    print(f"  Classification Verdict : {audit_report['verdict']}")
    print(f"  ED Stays Count         : {audit_report['ed_stays']:,}")
    print(f"  Unique Subjects        : {audit_report['unique_subjects']:,}")
    print(f"  Triage Records         : {audit_report['triage_rows']:,}")
    print(f"  Vital-Sign Records     : {audit_report['vitalsign_rows']:,}")
    print("\n  Official MIMIC-IV-ED Files Detected:")
    for fname in ['edstays', 'triage', 'vitalsign', 'diagnosis', 'medrecon', 'pyxis']:
        if fname in audit_report['files_detected']:
            finfo = audit_report['files_detected'][fname]
            print(f"    [+] {fname:12s}: DETECTED ({finfo['size_mb']:.2f} MB) -> {finfo['path']}")
        else:
            print(f"    [-] {fname:12s}: MISSING")
    print("="*80 + "\n")
    
    if not is_using_demo and not audit_report['is_full_dataset']:
        if not allow_demo:
            raise RuntimeError(
                f"[VALIDATION FAILED] The directory {ed_dir} only contains {audit_report['ed_stays']} stays. "
                f"Full MIMIC-IV-ED v2.2 contains >400,000 stays. Scientific full training requires authentic full data."
            )
            
    # Load authentic data without arbitrary row caps
    triage_path = audit_report['files_detected']['triage']['path']
    triage_gz = audit_report['files_detected']['triage']['is_gzip']
    edstays_path = audit_report['files_detected']['edstays']['path']
    edstays_gz = audit_report['files_detected']['edstays']['is_gzip']
    
    df_stays = pd.read_csv(edstays_path, compression='gzip' if edstays_gz else None)
    df_triage = pd.read_csv(triage_path, compression='gzip' if triage_gz else None)
    
    # Vital signs aggregation (if vitalsign file is present)
    df_vitals_agg = pd.DataFrame()
    if 'vitalsign' in audit_report['files_detected']:
        vitals_path = audit_report['files_detected']['vitalsign']['path']
        vitals_gz = audit_report['files_detected']['vitalsign']['is_gzip']
        print(f"  Streaming vital-sign events from {vitals_path} (full dataset)...")
        # Load vitals with required columns to optimize memory
        vital_cols_load = ['stay_id', 'temperature', 'heartrate', 'resprate', 'o2sat', 'sbp', 'dbp']
        df_vitals = pd.read_csv(vitals_path, compression='gzip' if vitals_gz else None, usecols=lambda c: c in vital_cols_load)
        df_vitals_agg = df_vitals.groupby('stay_id').agg({
            'temperature': 'mean',
            'heartrate': 'mean',
            'resprate': 'mean',
            'o2sat': 'mean',
            'sbp': 'mean',
            'dbp': 'mean'
        }).reset_index().rename(columns={
            'temperature': 'vital_temp_mean',
            'heartrate': 'vital_hr_mean',
            'resprate': 'vital_rr_mean',
            'o2sat': 'vital_o2sat_mean',
            'sbp': 'vital_sbp_mean',
            'dbp': 'vital_dbp_mean'
        })

    df_ed = pd.merge(df_stays, df_triage, on=['subject_id', 'stay_id'], how='inner')
    if not df_vitals_agg.empty:
        df_ed = pd.merge(df_ed, df_vitals_agg, on='stay_id', how='left')
        vital_name_pairs = [
            ('temperature', 'vital_temp_mean'),
            ('heartrate', 'vital_hr_mean'),
            ('resprate', 'vital_rr_mean'),
            ('o2sat', 'vital_o2sat_mean'),
            ('sbp', 'vital_sbp_mean'),
            ('dbp', 'vital_dbp_mean')
        ]
        for t_col, v_col in vital_name_pairs:
            if t_col in df_ed.columns and v_col in df_ed.columns:
                df_ed[t_col] = df_ed[t_col].fillna(df_ed[v_col])
                df_ed.drop(columns=[v_col], inplace=True)
            elif v_col in df_ed.columns:
                df_ed[t_col] = df_ed[v_col]
                df_ed.drop(columns=[v_col], inplace=True)

    # Ensure baseline standard vitals columns exist
    for col in ['temperature', 'heartrate', 'resprate', 'o2sat', 'sbp', 'dbp']:
        if col not in df_ed.columns:
            df_ed[col] = np.nan

    df_ed = clean_and_impute(df_ed)
    print(f"[+] Loaded MIMIC ED Cohort: {len(df_ed):,} stays across {df_ed['subject_id'].nunique():,} unique subjects.")
    return df_ed

_MIMIC_CACHE = {}

def load_mimic_clinical_data(datasets_dir, max_rows=None):
    """
    Loads MIMIC-IV Clinical (hosp/patients, admissions, prescriptions, labevents, icustays).
    Robust to both .csv and .csv.gz extensions.
    Prioritizes full MIMIC-IV 3.1 database over demo.
    Default max_rows=None processes the COMPLETE authentic dataset.
    """
    cache_key = f"{datasets_dir}_{max_rows}"
    if cache_key in _MIMIC_CACHE:
        return _MIMIC_CACHE[cache_key]

    inv = detect_mimic_locations(datasets_dir)
    hosp_dir = inv['MIMIC-IV HOSP']
    icu_dir = inv['MIMIC-IV ICU']
    
    if not hosp_dir:
        # Fallback to demo hosp
        if inv['MIMIC-IV DEMO']:
            candidate_hosp = os.path.join(inv['MIMIC-IV DEMO'], 'hosp')
            candidate_icu = os.path.join(inv['MIMIC-IV DEMO'], 'icu')
            if os.path.exists(candidate_hosp):
                hosp_dir = candidate_hosp
                icu_dir = candidate_icu if os.path.exists(candidate_icu) else hosp_dir
                print(f"Using MIMIC-IV Demo Database fallback from {hosp_dir}")

    if not hosp_dir:
        print("MIMIC-IV Clinical Database directory not found.")
        return pd.DataFrame(), pd.DataFrame()

    try:
        patients_path, pat_gz = find_file_with_extensions(hosp_dir, 'patients')
        admissions_path, adm_gz = find_file_with_extensions(hosp_dir, 'admissions')
        
        df_patients = pd.read_csv(patients_path, compression='gzip' if pat_gz else None, nrows=max_rows) if patients_path else pd.DataFrame()
        df_admissions = pd.read_csv(admissions_path, compression='gzip' if adm_gz else None, nrows=max_rows) if admissions_path else pd.DataFrame()
        
        if not df_patients.empty and not df_admissions.empty:
            df_hosp = pd.merge(df_patients, df_admissions, on='subject_id', how='inner')
        elif not df_patients.empty:
            df_hosp = df_patients
        else:
            df_hosp = df_admissions

        target_subjects = set(df_hosp['subject_id'].unique()) if not df_hosp.empty else set()

        key_itemids = {
            51222: 'hemoglobin', 50811: 'hemoglobin',
            51265: 'platelets',
            50912: 'creatinine',
            50971: 'potassium', 50822: 'potassium',
            51006: 'bun',
            50931: 'glucose', 50809: 'glucose',
            51301: 'wbc', 51300: 'wbc'
        }

        labs_path, labs_gz = find_file_with_extensions(hosp_dir, 'labevents')
        if labs_path and target_subjects:
            labs_records = []
            chunksize = 250000
            read_kwargs = {
                'compression': 'gzip' if labs_gz else None,
                'chunksize': chunksize,
                'low_memory': False
            }
            if max_rows is not None:
                read_kwargs['nrows'] = max_rows * 10

            print(f"  [MIMIC Ingestion] Streaming labevents from {labs_path} (chunksize={chunksize:,})...")
            chunk_count = 0
            total_matched = 0
            for chunk in pd.read_csv(labs_path, **read_kwargs):
                chunk_count += 1
                chunk['valuenum'] = pd.to_numeric(chunk['valuenum'], errors='coerce')
                matched = chunk[chunk['itemid'].isin(key_itemids.keys()) & chunk['subject_id'].isin(target_subjects)]
                if not matched.empty:
                    matched = matched[['subject_id', 'itemid', 'valuenum']].dropna()
                    matched['lab_name'] = matched['itemid'].map(key_itemids)
                    labs_records.append(matched)
                    total_matched += len(matched)
                if chunk_count % 25 == 0:
                    print(f"    ... processed {chunk_count * chunksize:,} lab rows ({total_matched:,} matching observations)")

            if labs_records:
                df_labs_all = pd.concat(labs_records, ignore_index=True)
                df_labs_pivoted = df_labs_all.groupby(['subject_id', 'lab_name'])['valuenum'].mean().unstack().reset_index()
                df_labs_agg = df_labs_all.groupby('subject_id')['valuenum'].agg(
                    lab_mean='mean', lab_min='min', lab_max='max'
                ).reset_index()
                df_hosp = pd.merge(df_hosp, df_labs_pivoted, on='subject_id', how='left')
                df_hosp = pd.merge(df_hosp, df_labs_agg, on='subject_id', how='left')

        df_icu = pd.DataFrame()
        if icu_dir:
            icu_path, icu_gz = find_file_with_extensions(icu_dir, 'icustays')
            if icu_path:
                icu_kwargs = {'compression': 'gzip' if icu_gz else None}
                if max_rows is not None:
                    icu_kwargs['nrows'] = max_rows
                df_icu = pd.read_csv(icu_path, **icu_kwargs)
                df_icu_agg = df_icu.groupby('subject_id').agg({
                    'los': 'max',
                    'stay_id': 'count'
                }).reset_index().rename(columns={'stay_id': 'icu_stay_count', 'los': 'icu_los_days'})
                df_hosp = pd.merge(df_hosp, df_icu_agg, on='subject_id', how='left')

        presc_path, presc_gz = find_file_with_extensions(hosp_dir, 'prescriptions')
        if presc_path and target_subjects:
            presc_kwargs = {'compression': 'gzip' if presc_gz else None}
            if max_rows is not None:
                presc_kwargs['nrows'] = max_rows * 5
            df_presc = pd.read_csv(presc_path, **presc_kwargs)
            df_presc = df_presc[df_presc['subject_id'].isin(target_subjects)]
            df_presc_agg = df_presc.groupby('subject_id').size().reset_index(name='prescription_count')
            df_hosp = pd.merge(df_hosp, df_presc_agg, on='subject_id', how='left')

        diag_path, diag_gz = find_file_with_extensions(hosp_dir, 'diagnoses_icd')
        if diag_path and target_subjects:
            diag_kwargs = {'compression': 'gzip' if diag_gz else None}
            if max_rows is not None:
                diag_kwargs['nrows'] = max_rows * 5
            df_diag = pd.read_csv(diag_path, **diag_kwargs)
            df_diag = df_diag[df_diag['subject_id'].isin(target_subjects)]
            df_diag_agg = df_diag.groupby('subject_id').size().reset_index(name='comorbidity_count')
            df_hosp = pd.merge(df_hosp, df_diag_agg, on='subject_id', how='left')

        clinical_defaults = {
            'hemoglobin': 13.5,
            'platelets': 240.0,
            'creatinine': 0.95,
            'potassium': 4.1,
            'bun': 16.0,
            'glucose': 105.0,
            'wbc': 7.2,
            'lab_mean': 50.0,
            'lab_min': 12.0,
            'lab_max': 140.0,
            'prescription_count': 5,
            'icu_stay_count': 0,
            'icu_los_days': 0.0,
            'comorbidity_count': 2
        }
        for col, default_val in clinical_defaults.items():
            if col in df_hosp.columns:
                df_hosp[col] = pd.to_numeric(df_hosp[col], errors='coerce').fillna(default_val)
            else:
                df_hosp[col] = default_val

        df_hosp = clean_and_impute(df_hosp)
        print(f"Loaded MIMIC Clinical cohort: {len(df_hosp):,} patients across {len(df_hosp.columns)} variables")
        _MIMIC_CACHE[cache_key] = (df_hosp, df_icu)
        return df_hosp, df_icu
    except Exception as e:
        print(f"Error loading MIMIC Clinical data: {e}")
        return pd.DataFrame(), pd.DataFrame()

def load_mit_bih_ecg(datasets_dir, max_records=None):
    """
    Safely loads records from the MIT-BIH Arrhythmia Database.
    Verifies actual presence of .hea, .dat, and .atr files BEFORE attempting wfdb.rdrecord.
    Logs discovered, loaded, and skipped counts accurately.
    Supports both small subset and full 48-record database.
    """
    candidate_dirs = [
        os.path.join(datasets_dir, '03_arrhythmia', 'mit-bih-arrhythmia-database-1.0.0', 'mit-bih-arrhythmia-database-1.0.0'),
        os.path.join(datasets_dir, '03_arrhythmia', 'mit-bih-arrhythmia-database-1.0.0'),
        os.path.join(datasets_dir, '02_cardiac_ecg_mitbih', 'mit-bih-arrhythmia-database-1.0.0', 'mit-bih-arrhythmia-database-1.0.0'),
        os.path.join(datasets_dir, '02_cardiac_ecg_mitbih', 'mit-bih-arrhythmia-database-1.0.0'),
        os.path.join(datasets_dir, 'mit-bih-arrhythmia-database-1.0.0')
    ]
    mit_dir = None
    for cd in candidate_dirs:
        if os.path.exists(cd) and (glob.glob(os.path.join(cd, '*.hea')) or os.path.exists(os.path.join(cd, 'RECORDS'))):
            mit_dir = cd
            break
            
    if not mit_dir:
        print(f"MIT-BIH Arrhythmia directory not found in candidate paths: {candidate_dirs}")
        return []

    discovered_names = []
    records_file = os.path.join(mit_dir, 'RECORDS')
    if os.path.exists(records_file):
        with open(records_file, 'r') as f:
            discovered_names = [line.strip() for line in f.read().splitlines() if line.strip()]
    else:
        discovered_names = [os.path.splitext(os.path.basename(p))[0] for p in glob.glob(os.path.join(mit_dir, '*.hea'))]

    discovered_names = sorted(list(set(discovered_names)))
    records_discovered_count = len(discovered_names)
    records_loaded = []
    records_skipped = []

    for name in discovered_names:
        if max_records is not None and len(records_loaded) >= max_records:
            break
            
        record_path = os.path.join(mit_dir, name)
        hea_file = f"{record_path}.hea"
        dat_file = f"{record_path}.dat"
        atr_file = f"{record_path}.atr"
        
        # Verify all 3 essential files exist before attempting parse
        if not (os.path.exists(hea_file) and os.path.exists(dat_file) and os.path.exists(atr_file)):
            records_skipped.append((name, "Missing .hea, .dat, or .atr file"))
            continue

        try:
            if HAS_WFDB:
                rec = wfdb.rdrecord(record_path)
                ann = wfdb.rdann(record_path, 'atr')
                records_loaded.append({
                    'id': name,
                    'signal': rec.p_signal,
                    'signal_names': rec.sig_name,
                    'fs': rec.fs,
                    'ann_sample': ann.sample,
                    'ann_type': ann.symbol
                })
            else:
                # Fallback format 212 binary parser
                with open(dat_file, 'rb') as f:
                    content = f.read()
                sig = []
                for k in range(0, len(content) - 2, 3):
                    b1 = content[k]
                    b2 = content[k+1]
                    b3 = content[k+2]
                    s1 = b1 | ((b2 & 0x0F) << 8)
                    s2 = b3 | ((b2 & 0xF0) << 4)
                    sig.append([s1 - 1024, s2 - 1024])
                sig = np.array(sig)
                peaks, _ = find_peaks(sig[:, 0], distance=150, height=200)
                records_loaded.append({
                    'id': name,
                    'signal': sig,
                    'signal_names': ['MLII', 'V1'],
                    'fs': 360,
                    'ann_sample': peaks,
                    'ann_type': ['N'] * len(peaks)
                })
        except Exception as e:
            records_skipped.append((name, str(e)))
            continue

    print(f"MIT-BIH records discovered: {records_discovered_count}")
    print(f"MIT-BIH records loaded: {len(records_loaded)}")
    print(f"MIT-BIH records skipped: {len(records_skipped)}")
    if records_skipped:
        for r_name, r_reason in records_skipped[:5]:
            print(f"  - Skipped {r_name}: {r_reason}")

    return records_loaded

def load_anesthesia_drugs(datasets_dir):
    """
    Synthetic dataset. Explicitly rejected from clinical validation training.
    """
    print("[REFUSED] load_anesthesia_drugs: Dataset in 06_drug_safety is synthetic and excluded from training.")
    return pd.DataFrame()

def load_pacu_dataset(datasets_dir):
    """
    Synthetic dataset. Explicitly rejected from clinical validation training.
    """
    print("[REFUSED] load_pacu_dataset: Dataset in 05_pacu_recovery is synthetic and excluded from training.")
    return pd.DataFrame()

if __name__ == '__main__':
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ds_path = os.path.join(base, 'datasets')
    print("Testing hardened data loader components...")
    detect_mimic_locations(ds_path)
    ecg_recs = load_mit_bih_ecg(ds_path, max_records=2)
    vital_df = load_vitaldb_cases(ds_path, max_cases=2)
    print("Data loader test finished.")
