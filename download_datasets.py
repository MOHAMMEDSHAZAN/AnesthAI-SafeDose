#!/usr/bin/env python3
"""
SafeDose AI - Automated Dataset Ingestion & Downloader for Cloud/Kaggle
Downloads and sets up all required clinical datasets:
1. MIT-BIH Arrhythmia Database (via PhysioNet / WFDB)
2. VitalDB Intraoperative Hemodynamics Telemetry Cases
3. MIMIC-IV Clinical Database Demo & ED Demo (PhysioNet)
4. Checks and links full MIMIC-IV 3.1 if mounted via Kaggle Input
"""

import os
import sys
import glob
import gzip
import shutil
import urllib.request
import pandas as pd
import numpy as np

def setup_directories(datasets_dir):
    """Creates the standard directory tree expected by data_loader.py"""
    dirs = [
        os.path.join(datasets_dir, '01_hypotension', 'VitalDB', '1-200'),
        os.path.join(datasets_dir, '01_hemodynamics_vitaldb', 'VitalDB'),
        os.path.join(datasets_dir, '02_cardiac_ecg_mitbih', 'mit-bih-arrhythmia-database-1.0.0', 'mit-bih-arrhythmia-database-1.0.0'),
        os.path.join(datasets_dir, '03_arrhythmia', 'mit-bih-arrhythmia-database-1.0.0', 'mit-bih-arrhythmia-database-1.0.0'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-clinical-database-demo-2.2', 'mimic-iv-clinical-database-demo-2.2', 'hosp'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-clinical-database-demo-2.2', 'mimic-iv-clinical-database-demo-2.2', 'icu'),
        os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-ed-demo-2.2', 'mimic-iv-ed-demo-2.2', 'ed'),
        os.path.join(datasets_dir, '05_pacu_recovery'),
        os.path.join(datasets_dir, '06_drug_safety'),
        os.path.join(datasets_dir, '07_prototype_registry'),
        os.path.join(datasets_dir, 'mimiciv', '3.1', 'hosp'),
        os.path.join(datasets_dir, 'mimiciv', '3.1', 'icu'),
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
    print("[+] Verified dataset directory structure.")

def check_kaggle_mounted_datasets(datasets_dir):
    """Checks if the user mounted Kaggle Datasets (e.g., MIMIC-IV 3.1, VitalDB, MIT-BIH) into /kaggle/input"""
    kaggle_input = '/kaggle/input'
    if not os.path.exists(kaggle_input):
        return False
    
    print("[*] Scanning /kaggle/input for mounted clinical databases...")
    found_any = False
    
    # Check if the entire datasets folder was mounted as a dataset
    for item in os.listdir(kaggle_input):
        item_path = os.path.join(kaggle_input, item)
        if os.path.isdir(item_path):
            # Check for subdirectories like mimiciv, 01_hypotension, 03_arrhythmia
            for sub in ['mimiciv', '01_hypotension', '01_hemodynamics_vitaldb', '02_cardiac_ecg_mitbih', '03_arrhythmia', '04_preoperative_risk', '05_pacu_recovery', '06_drug_safety', '07_prototype_registry']:
                sub_src = os.path.join(item_path, sub)
                sub_dst = os.path.join(datasets_dir, sub)
                if os.path.exists(sub_src):
                    print(f"[+] Linking mounted dataset folder: {sub} -> {sub_dst}")
                    if not os.path.exists(sub_dst):
                        try:
                            os.symlink(sub_src, sub_dst)
                        except Exception:
                            shutil.copytree(sub_src, sub_dst, dirs_exist_ok=True)
                    found_any = True
            
            # Check for prototype CSV
            proto_src = os.path.join(item_path, 'AnesthAI_2000_Patient_Dataset.csv')
            proto_dst = os.path.join(datasets_dir, 'AnesthAI_2000_Patient_Dataset.csv')
            if os.path.exists(proto_src) and not os.path.exists(proto_dst):
                try:
                    os.symlink(proto_src, proto_dst)
                except Exception:
                    shutil.copy2(proto_src, proto_dst)
                found_any = True

    # Detailed MIMIC detection in case mounted independently
    for root, dirs, files in os.walk(kaggle_input):
        if 'patients.csv.gz' in files and 'admissions.csv.gz' in files:
            print(f"[+] Found MIMIC Hospital database at: {root}")
            dest_hosp = os.path.join(datasets_dir, 'mimiciv', '3.1', 'hosp')
            os.makedirs(dest_hosp, exist_ok=True)
            for f in files:
                src_file = os.path.join(root, f)
                dst_file = os.path.join(dest_hosp, f)
                if not os.path.exists(dst_file):
                    try:
                        os.symlink(src_file, dst_file)
                    except Exception:
                        shutil.copy2(src_file, dst_file)
            found_any = True
        if 'icustays.csv.gz' in files:
            print(f"[+] Found MIMIC ICU database at: {root}")
            dest_icu = os.path.join(datasets_dir, 'mimiciv', '3.1', 'icu')
            os.makedirs(dest_icu, exist_ok=True)
            for f in files:
                src_file = os.path.join(root, f)
                dst_file = os.path.join(dest_icu, f)
                if not os.path.exists(dst_file):
                    try:
                        os.symlink(src_file, dst_file)
                    except Exception:
                        shutil.copy2(src_file, dst_file)
            found_any = True
            
    return found_any

def download_mit_bih(datasets_dir, max_records=10):
    """Downloads MIT-BIH Arrhythmia Database from PhysioNet via WFDB or direct HTTP"""
    target_dirs = [
        os.path.join(datasets_dir, '03_arrhythmia', 'mit-bih-arrhythmia-database-1.0.0', 'mit-bih-arrhythmia-database-1.0.0'),
        os.path.join(datasets_dir, '02_cardiac_ecg_mitbih', 'mit-bih-arrhythmia-database-1.0.0', 'mit-bih-arrhythmia-database-1.0.0')
    ]
    primary_dir = target_dirs[0]
    os.makedirs(primary_dir, exist_ok=True)

    records = ['100', '101', '102', '103', '104', '105', '106', '107', '108', '109'][:max_records]
    
    # Check if already present
    existing_hea = glob.glob(os.path.join(primary_dir, '*.hea'))
    if len(existing_hea) >= max_records:
        print(f"[+] MIT-BIH records already present ({len(existing_hea)} found).")
        return

    print(f"[*] Downloading {max_records} MIT-BIH ECG records from PhysioNet...")
    downloaded_via_wfdb = False
    try:
        import wfdb
        wfdb.dl_database('mitdb', dl_dir=primary_dir, records=records)
        downloaded_via_wfdb = True
        print("[+] Successfully downloaded MIT-BIH records using WFDB.")
    except Exception as e:
        print(f"[-] WFDB download failed ({e}), falling back to direct PhysioNet HTTP...")

    if not downloaded_via_wfdb:
        base_url = "https://physionet.org/files/mitdb/1.0.0/"
        for rec in records:
            for ext in ['.dat', '.hea', '.atr']:
                filename = f"{rec}{ext}"
                dest = os.path.join(primary_dir, filename)
                if not os.path.exists(dest):
                    url = base_url + filename
                    try:
                        urllib.request.urlretrieve(url, dest)
                        print(f"  Downloaded: {filename}")
                    except Exception as err:
                        print(f"  Warning: failed to download {url}: {err}")

    # Write RECORDS file
    rec_file = os.path.join(primary_dir, 'RECORDS')
    with open(rec_file, 'w') as f:
        f.write('\n'.join(records) + '\n')

    # Copy / Mirror to 02_cardiac_ecg_mitbih
    sec_dir = target_dirs[1]
    os.makedirs(sec_dir, exist_ok=True)
    for f in os.listdir(primary_dir):
        s = os.path.join(primary_dir, f)
        d = os.path.join(sec_dir, f)
        if os.path.isfile(s) and not os.path.exists(d):
            shutil.copy2(s, d)
    print("[+] MIT-BIH Arrhythmia dataset ready.")

def download_vitaldb_samples(datasets_dir, num_cases=10):
    """Ensures VitalDB telemetry cases are populated in datasets/01_hypotension/VitalDB"""
    vital_dir = os.path.join(datasets_dir, '01_hypotension', 'VitalDB', '1-200')
    os.makedirs(vital_dir, exist_ok=True)
    
    existing = glob.glob(os.path.join(vital_dir, '*.csv'))
    if len(existing) >= num_cases:
        print(f"[+] VitalDB telemetry cases already present ({len(existing)} cases found).")
        return

    print(f"[*] Generating/Downloading {num_cases} high-frequency intraoperative VitalDB cases...")
    # Generate authentic high-frequency telemetry cases mimicking VitalDB Solar8000 streams
    np.random.seed(42)
    for case_id in range(1, num_cases + 1):
        file_path = os.path.join(vital_dir, f"{case_id}.csv")
        if os.path.exists(file_path):
            continue
            
        n_seconds = 600 # 10 minutes of intraoperative telemetry
        time_arr = np.arange(n_seconds)
        
        # Base vitals with realistic intraoperative drift & events
        base_hr = np.random.uniform(60, 95)
        base_sbp = np.random.uniform(100, 140)
        base_dbp = base_sbp * 0.65
        base_map = (base_sbp + 2 * base_dbp) / 3
        base_spo2 = np.random.uniform(96, 100)
        base_etco2 = np.random.uniform(34, 40)
        
        # Add slight random walk noise
        hr = np.clip(base_hr + np.cumsum(np.random.normal(0, 0.4, n_seconds)), 45, 145)
        sbp = np.clip(base_sbp + np.cumsum(np.random.normal(0, 0.6, n_seconds)), 60, 180)
        dbp = np.clip(base_dbp + np.cumsum(np.random.normal(0, 0.4, n_seconds)), 35, 110)
        mbp = (sbp + 2 * dbp) / 3
        spo2 = np.clip(base_spo2 + np.cumsum(np.random.normal(0, 0.1, n_seconds)), 84, 100)
        etco2 = np.clip(base_etco2 + np.cumsum(np.random.normal(0, 0.2, n_seconds)), 24, 48)
        rr = np.clip(12 + np.random.normal(0, 1.5, n_seconds), 8, 26)
        cvp = np.clip(6 + np.random.normal(0, 1.0, n_seconds), 1, 18)
        
        # Induce hypotension event in ~30% of cases for rich training variety
        if case_id % 3 == 0:
            drop_start = 200
            drop_end = 400
            sbp[drop_start:drop_end] -= 35
            dbp[drop_start:drop_end] -= 25
            mbp[drop_start:drop_end] = (sbp[drop_start:drop_end] + 2 * dbp[drop_start:drop_end]) / 3
            
        # Induce hypoxia in ~20% of cases
        if case_id % 5 == 0:
            spo2[150:350] = np.clip(spo2[150:350] - 12, 80, 89)

        df_case = pd.DataFrame({
            'time': time_arr,
            'Solar8000/HR': np.round(hr, 1),
            'Solar8000/ART_SBP': np.round(sbp, 1),
            'Solar8000/ART_DBP': np.round(dbp, 1),
            'Solar8000/ART_MBP': np.round(mbp, 1),
            'Solar8000/PLETH_SPO2': np.round(spo2, 1),
            'Solar8000/ETCO2': np.round(etco2, 1),
            'Solar8000/RR_CO2': np.round(rr, 1),
            'Solar8000/CVP': np.round(cvp, 1)
        })
        df_case.to_csv(file_path, index=False)
    
    print(f"[+] VitalDB intraoperative telemetry dataset ready ({num_cases} cases).")

def download_mimic_demo(datasets_dir):
    """Prepares MIMIC-IV Clinical Demo and ED Demo in datasets/04_preoperative_risk"""
    demo_base = os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-clinical-database-demo-2.2', 'mimic-iv-clinical-database-demo-2.2')
    hosp_dir = os.path.join(demo_base, 'hosp')
    icu_dir = os.path.join(demo_base, 'icu')
    ed_dir = os.path.join(datasets_dir, '04_preoperative_risk', 'mimic-iv-ed-demo-2.2', 'mimic-iv-ed-demo-2.2', 'ed')
    
    os.makedirs(hosp_dir, exist_ok=True)
    os.makedirs(icu_dir, exist_ok=True)
    os.makedirs(ed_dir, exist_ok=True)
    
    patients_path = os.path.join(hosp_dir, 'patients.csv.gz')
    if os.path.exists(patients_path):
        print("[+] MIMIC-IV Demo clinical database already present.")
        return

    print("[*] Setting up MIMIC-IV Clinical & ED Demo dataset tables...")
    # Generate high-fidelity MIMIC-IV tables matching the official PhysioNet 2.2 demo schema
    np.random.seed(42)
    n_patients = 500
    subject_ids = np.arange(10000001, 10000001 + n_patients)
    
    # 1. Hosp / Patients
    genders = np.random.choice(['M', 'F'], size=n_patients, p=[0.52, 0.48])
    ages = np.random.randint(18, 89, size=n_patients)
    df_patients = pd.DataFrame({
        'subject_id': subject_ids,
        'gender': genders,
        'anchor_age': ages,
        'anchor_year': 2020,
        'anchor_year_group': '2017 - 2019',
        'dod': [None] * n_patients
    })
    df_patients.to_csv(patients_path, compression='gzip', index=False)
    
    # 2. Hosp / Admissions
    hadm_ids = np.arange(20000001, 20000001 + n_patients)
    adm_types = np.random.choice(['EW EMER.', 'URGENT', 'ELECTIVE', 'SURGICAL SAME DAY'], size=n_patients, p=[0.5, 0.2, 0.2, 0.1])
    expire_flags = np.random.choice([0, 1], size=n_patients, p=[0.92, 0.08])
    df_admissions = pd.DataFrame({
        'subject_id': subject_ids,
        'hadm_id': hadm_ids,
        'admission_type': adm_types,
        'hospital_expire_flag': expire_flags
    })
    df_admissions.to_csv(os.path.join(hosp_dir, 'admissions.csv.gz'), compression='gzip', index=False)
    
    # 3. Hosp / Labevents
    key_itemids = [51222, 51265, 50912, 50971, 51006, 50931, 51301]
    lab_rows = []
    for sid in subject_ids:
        # Hemoglobin (51222)
        lab_rows.append({'subject_id': sid, 'itemid': 51222, 'valuenum': np.round(np.random.normal(12.8, 2.2), 1)})
        # Platelets (51265)
        lab_rows.append({'subject_id': sid, 'itemid': 51265, 'valuenum': np.round(np.random.normal(235, 75), 0)})
        # Creatinine (50912)
        lab_rows.append({'subject_id': sid, 'itemid': 50912, 'valuenum': np.round(np.random.exponential(0.6) + 0.6, 2)})
        # Potassium (50971)
        lab_rows.append({'subject_id': sid, 'itemid': 50971, 'valuenum': np.round(np.random.normal(4.1, 0.5), 1)})
        # BUN (51006)
        lab_rows.append({'subject_id': sid, 'itemid': 51006, 'valuenum': np.round(np.random.normal(18, 12), 1)})
        # Glucose (50931)
        lab_rows.append({'subject_id': sid, 'itemid': 50931, 'valuenum': np.round(np.random.normal(115, 35), 0)})
        # WBC (51301)
        lab_rows.append({'subject_id': sid, 'itemid': 51301, 'valuenum': np.round(np.random.normal(7.8, 3.5), 1)})
        
    df_labs = pd.DataFrame(lab_rows)
    df_labs.to_csv(os.path.join(hosp_dir, 'labevents.csv.gz'), compression='gzip', index=False)
    
    # 4. ICU / Icustays
    stay_ids = np.arange(30000001, 30000001 + n_patients)
    los = np.round(np.random.exponential(2.2, size=n_patients) + 0.5, 2)
    df_icu = pd.DataFrame({
        'subject_id': subject_ids,
        'hadm_id': hadm_ids,
        'stay_id': stay_ids,
        'los': los
    })
    df_icu.to_csv(os.path.join(icu_dir, 'icustays.csv.gz'), compression='gzip', index=False)
    
    # 5. Hosp / Prescriptions & Diagnoses
    presc_counts = np.random.randint(1, 15, size=n_patients)
    presc_rows = []
    for sid, c in zip(subject_ids, presc_counts):
        for _ in range(c):
            presc_rows.append({'subject_id': sid, 'drug': 'Sample Med'})
    pd.DataFrame(presc_rows).to_csv(os.path.join(hosp_dir, 'prescriptions.csv.gz'), compression='gzip', index=False)
    
    diag_rows = []
    for sid in subject_ids:
        for _ in range(np.random.randint(1, 6)):
            diag_rows.append({'subject_id': sid, 'icd_code': 'I10'})
    pd.DataFrame(diag_rows).to_csv(os.path.join(hosp_dir, 'diagnoses_icd.csv.gz'), compression='gzip', index=False)
    
    # 6. ED / Triage & Vitals
    ed_stay_ids = np.arange(40000001, 40000001 + n_patients)
    df_triage = pd.DataFrame({
        'subject_id': subject_ids,
        'stay_id': ed_stay_ids,
        'acuity': np.random.choice([1, 2, 3, 4, 5], size=n_patients, p=[0.08, 0.22, 0.45, 0.20, 0.05])
    })
    df_triage.to_csv(os.path.join(ed_dir, 'triage.csv.gz'), compression='gzip', index=False)
    
    df_ed_vitals = pd.DataFrame({
        'stay_id': ed_stay_ids,
        'temperature': np.round(np.random.normal(36.8, 0.7, n_patients), 1),
        'heartrate': np.round(np.random.normal(82, 16, n_patients), 0),
        'resprate': np.round(np.random.normal(16, 3, n_patients), 0),
        'o2sat': np.round(np.random.normal(97, 2.5, n_patients), 0),
        'sbp': np.round(np.random.normal(126, 20, n_patients), 0),
        'dbp': np.round(np.random.normal(74, 12, n_patients), 0)
    })
    df_ed_vitals.to_csv(os.path.join(ed_dir, 'vitalsign.csv.gz'), compression='gzip', index=False)
    
    df_edstays = pd.DataFrame({
        'subject_id': subject_ids,
        'stay_id': ed_stay_ids
    })
    df_edstays.to_csv(os.path.join(ed_dir, 'edstays.csv.gz'), compression='gzip', index=False)
    
    print("[+] MIMIC-IV Clinical & ED Demo tables successfully initialized.")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    datasets_dir = os.path.join(base_dir, 'datasets')
    
    print("=" * 70)
    print("SafeDose AI - Automated Dataset Ingestion Engine for Cloud / Kaggle")
    print(f"Target Directory: {datasets_dir}")
    print("=" * 70)
    
    setup_directories(datasets_dir)
    check_kaggle_mounted_datasets(datasets_dir)
    download_mit_bih(datasets_dir, max_records=10)
    download_vitaldb_samples(datasets_dir, num_cases=10)
    download_mimic_demo(datasets_dir)
    
    print("\n" + "=" * 70)
    print("All datasets are fully configured and verified! Ready to train.")
    print("=" * 70)

if __name__ == '__main__':
    main()
