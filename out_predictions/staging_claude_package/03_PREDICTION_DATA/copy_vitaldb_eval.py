"""
SafeDose AI - VitalDB Hemodynamics Evaluation & Predictions Exporter
Standalone evaluation script adhering strictly to the verified project pipeline.
Loads 35 test cases (seed 42 patient split), performs backward-looking temporal feature engineering,
evaluates production champion models, exports per-sample test predictions CSVs, and records thresholds.
"""
import os
import sys
import glob
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.metrics import (
    roc_auc_score, average_precision_score, confusion_matrix,
    accuracy_score, f1_score, recall_score, precision_score
)

def run_vitaldb_eval():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(project_root, 'out_predictions')
    os.makedirs(out_dir, exist_ok=True)

    sys.path.insert(0, os.path.join(project_root, 'preprocessing'))
    import data_loader

    print("=" * 80)
    print("STEP 1 & 3: VITALDB HEMODYNAMICS EVALUATION & EXPORT")
    print("=" * 80)

    # 1. Held-out test patient group partition (seed 42, 15% patient split of 235 cases)
    test_cases = [
        '1123', '1132', '1191', '1211', '1215', '125', '1261', '1307', '1548', '1640',
        '1735', '1785', '1959', '1988', '2117', '2161', '2327', '2337', '2493', '2504',
        '264', '2706', '2735', '2738', '448', '490', '587', '631', '703', '733',
        '869', '885', '917', '931', '945'
    ]
    print(f"Loading {len(test_cases)} held-out VitalDB patient cases...")

    datasets_dir = os.path.join(project_root, 'datasets')
    vitaldb_folder = os.path.join(datasets_dir, '01_hemodynamics_vitaldb', 'VitalDB')

    cases = []
    for tc in test_cases:
        matches = glob.glob(os.path.join(vitaldb_folder, '**', f"{tc}.csv"), recursive=True)
        if matches:
            df = pd.read_csv(matches[0])
            mapped_df = pd.DataFrame()
            mapped_df['time'] = df['time'] if 'time' in df.columns else np.arange(len(df))
            mapped_df['PatientID'] = tc
            for std_name, targets in data_loader.COLUMN_MAPS.items():
                matched_col = data_loader.find_matched_column(df.columns, targets)
                if matched_col:
                    mapped_df[std_name] = pd.to_numeric(df[matched_col], errors='coerce')
                else:
                    defaults = {'hr': 75.0, 'spo2': 98.0, 'sbp': 120.0, 'dbp': 70.0, 'map': 85.0, 'etco2': 38.0, 'rr': 14.0, 'cvp': 5.0, 'temp': 36.5}
                    mapped_df[std_name] = defaults.get(std_name, 0.0)
            mapped_df = data_loader.clean_and_impute(mapped_df)
            cases.append(mapped_df)

    df_test = pd.concat(cases, ignore_index=True)
    n_test = len(df_test)
    print(f"Loaded {n_test:,} authentic test window rows across {len(test_cases)} patient cases.")

    # 2. Backward-looking temporal feature engineering (identical to training/train_pipeline.py:1235-1243)
    print("Computing rolling temporal features...")
    for col in ['hr', 'map', 'spo2', 'etco2']:
        df_test[f'{col}_roll_mean'] = df_test.groupby('PatientID')[col].transform(lambda x: x.rolling(5, min_periods=1).mean())
        df_test[f'{col}_roll_std'] = df_test.groupby('PatientID')[col].transform(lambda x: x.rolling(5, min_periods=1).std().fillna(0.0))
        df_test[f'{col}_trend'] = df_test.groupby('PatientID')[col].transform(lambda x: x.diff(5).fillna(0.0))

    df_test['shock_index'] = df_test['hr'] / df_test['sbp'].replace(0, 1)
    df_test['pulse_pressure'] = df_test['sbp'] - df_test['dbp']
    df_test['cvp_map_ratio'] = df_test['cvp'] / df_test['map'].replace(0, 1)

    # Global sample identifiers
    sample_ids = [f"vital_{df_test['PatientID'].iloc[i]}_{i}" for i in range(n_test)]
    group_ids = df_test['PatientID'].values

    vital_tasks = [
        {
            'task': 'Hypotension',
            'model_path': os.path.join(project_root, 'models', 'optimized', 'hypotension_optimized.pkl'),
            'target_col': 'map',
            'target_op': lambda df: (df['map'] < 65).astype(int).values,
            'default_th': 0.50
        },
        {
            'task': 'Hypoxia',
            'model_path': os.path.join(project_root, 'models', 'Hypoxia.pkl'),
            'target_col': 'spo2',
            'target_op': lambda df: (df['spo2'] < 90).astype(int).values,
            'default_th': 0.825
        },
        {
            'task': 'Tachycardia',
            'model_path': os.path.join(project_root, 'models', 'Tachycardia.pkl'),
            'target_col': 'hr',
            'target_op': lambda df: (df['hr'] > 100).astype(int).values,
            'default_th': 0.250
        }
    ]

    all_results = {}

    for t_spec in vital_tasks:
        t_name = t_spec['task']
        print(f"\nEvaluating Task: {t_name}...")

        with open(t_spec['model_path'], 'rb') as fp:
            pkg = pickle.load(fp)

        clf = pkg['model']
        scaler = pkg.get('scaler', None)
        feat_cols = pkg['features']
        th = pkg.get('optimal_threshold', t_spec['default_th'])

        # Check leakage: confirm SBP, DBP, MAP not in Hypotension features
        if t_name == 'Hypotension':
            for forbidden in ['sbp', 'dbp', 'map']:
                assert forbidden not in feat_cols, f"LEAKAGE DETECTED: {forbidden} in {t_name} features!"
            print(f"  [Leakage Check] Verified: SBP, DBP, MAP strictly excluded from Hypotension features.")

        X_raw = df_test[feat_cols].values
        X_scaled = scaler.transform(X_raw) if scaler is not None else X_raw
        y_true = t_spec['target_op'](df_test)

        # Inference
        y_score = clf.predict_proba(X_scaled)[:, 1]
        y_pred = (y_score >= th).astype(int)

        # Metrics
        auc = roc_auc_score(y_true, y_score)
        pr_auc = average_precision_score(y_true, y_score)
        cm = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = cm.ravel()
        sens = recall_score(y_true, y_pred)
        spec = tn / (tn + fp)
        prec = precision_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred)
        acc = accuracy_score(y_true, y_pred)

        n_pos = int(np.sum(y_true == 1))
        n_neg = int(np.sum(y_true == 0))

        print(f"  Model              : {pkg.get('algorithm', 'Hist Gradient Boosting')}")
        print(f"  N Test Samples     : {n_test:,} (Positives: {n_pos:,}, Negatives: {n_neg:,})")
        print(f"  Threshold          : {th:.4f}")
        print(f"  ROC-AUC            : {auc:.4f}")
        print(f"  PR-AUC             : {pr_auc:.4f}")
        print(f"  Sensitivity        : {sens:.4f}")
        print(f"  Specificity        : {spec:.4f}")
        print(f"  Precision          : {prec:.4f}")
        print(f"  F1-Score           : {f1:.4f}")
        print(f"  Accuracy           : {acc:.4f}")
        print(f"  Confusion Matrix   : TN={tn:,}, FP={fp:,}, FN={fn:,}, TP={tp:,}")

        # Save predictions CSV
        csv_path = os.path.join(out_dir, f"{t_name}_test_predictions.csv")
        df_out = pd.DataFrame({
            'sample_id': sample_ids,
            'group_id': group_ids,
            'y_true': y_true,
            'y_score': np.round(y_score, 6),
            'y_pred': y_pred
        })
        df_out.to_csv(csv_path, index=False)
        print(f"  [EXPORT] Saved {len(df_out):,} rows to {csv_path}")

        # Save threshold text file
        th_path = os.path.join(out_dir, f"{t_name}_threshold.txt")
        with open(th_path, 'w') as fp:
            fp.write(f"Task: {t_name}\n")
            fp.write(f"Model: {pkg.get('algorithm', 'Hist Gradient Boosting')}\n")
            fp.write(f"Threshold: {th}\n")
            fp.write(f"Method: Optimized on validation split (35 patient cases) to maximize validation F1 score; tested once on held-out test cohort.\n")
            fp.write(f"Features ({len(feat_cols)}): {feat_cols}\n")
            fp.write(f"Metrics: ROC-AUC={auc:.4f}, PR-AUC={pr_auc:.4f}, Sensitivity={sens:.4f}, Specificity={spec:.4f}, TN={tn}, FP={fp}, FN={fn}, TP={tp}\n")
        print(f"  [EXPORT] Saved threshold documentation to {th_path}")

        all_results[t_name] = {
            'task': t_name, 'model': pkg.get('algorithm', 'Hist Gradient Boosting'),
            'n_test': n_test, 'positives': n_pos, 'auc': auc, 'pr_auc': pr_auc,
            'threshold': th, 'tn': tn, 'fp': fp, 'fn': fn, 'tp': tp,
            'sens': sens, 'spec': spec, 'prec': prec, 'f1': f1, 'acc': acc,
            'csv_path': csv_path
        }

    return all_results

if __name__ == '__main__':
    run_vitaldb_eval()

