"""
SafeDose AI - MIT-BIH Arrhythmia Evaluation & Predictions Exporter
Standalone evaluation script adhering strictly to the verified project pipeline.
Reads authentic records from datasets/03_arrhythmia, applies record-independent split (manifest),
runs models/Arrhythmia.pkl (LightGBM), exports per-sample test predictions, and evaluates metrics.
"""
import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.metrics import (
    roc_auc_score, average_precision_score, confusion_matrix,
    accuracy_score, f1_score, recall_score, precision_score
)

def run_mitbih_eval():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(project_root, 'out_predictions')
    os.makedirs(out_dir, exist_ok=True)

    sys.path.insert(0, os.path.join(project_root, 'preprocessing'))
    import data_loader

    print("=" * 80)
    print("STEP 1 & 3: MIT-BIH ARRHYTHMIA EVALUATION & EXPORT")
    print("=" * 80)

    # 1. Load split manifest
    manifest_path = os.path.join(project_root, 'reports', 'arrhythmia_split_manifest.json')
    with open(manifest_path, 'r') as fp:
        mit_manifest = json.load(fp)

    test_records = set(mit_manifest['test_records'])
    print(f"Loaded split manifest: {len(test_records)} test records: {sorted(list(test_records))}")

    # 2. Load authentic MIT-BIH ECG records
    datasets_dir = os.path.join(project_root, 'datasets')
    mit_ecg = data_loader.load_mit_bih_ecg(datasets_dir, max_records=48)
    print(f"Loaded {len(mit_ecg)} MIT-BIH ECG records.")

    # 3. Extract 100-sample beat segments (filtering non-beat annotations '+', '~', '|')
    X_beats = []
    y_beats = []
    rec_ids = []
    sample_ids = []

    global_sample_counter = 0
    for record in mit_ecg:
        sig = record['signal'][:, 0]
        peaks = record['ann_sample']
        symbols = record['ann_type']
        rec_id = str(record['id'])

        for peak, sym in zip(peaks, symbols):
            if sym in ['+', '~', '|', '[', ']', '!', '"', 'x']:
                continue
            if 50 < peak < len(sig) - 50:
                beat = sig[peak - 50 : peak + 50]
                beat_norm = (beat - np.mean(beat)) / (np.std(beat) + 1e-6)
                X_beats.append(beat_norm)
                y_beats.append(0 if sym == 'N' else 1)
                rec_ids.append(rec_id)
                sample_ids.append(f"{rec_id}_{peak}")
                global_sample_counter += 1

    X_beats = np.array(X_beats, dtype=np.float32)
    y_beats = np.array(y_beats, dtype=int)
    rec_ids = np.array(rec_ids)
    sample_ids = np.array(sample_ids)

    # 4. Filter strictly to held-out test partition
    te_mask = np.isin(rec_ids, list(test_records))
    X_te = X_beats[te_mask]
    y_te = y_beats[te_mask]
    recs_te = rec_ids[te_mask]
    samples_te = sample_ids[te_mask]

    n_test = len(y_te)
    n_pos = int(np.sum(y_te == 1))
    n_neg = int(np.sum(y_te == 0))
    print(f"Test cohort extracted: {n_test} beats (Normal: {n_neg}, Arrhythmia: {n_pos})")

    # 5. Load production champion model
    model_path = os.path.join(project_root, 'models', 'Arrhythmia.pkl')
    with open(model_path, 'rb') as fp:
        pkg = pickle.load(fp)

    clf = pkg['model']
    scaler = pkg.get('scaler', None)
    th = pkg.get('optimal_threshold', 0.220)

    # Preprocessing transformation
    if scaler is not None:
        X_te_scaled = scaler.transform(X_te)
    else:
        X_te_scaled = X_te

    # 6. Predict probabilities and classes
    y_score = clf.predict_proba(X_te_scaled)[:, 1]
    y_pred = (y_score >= th).astype(int)

    # 7. Compute test metrics
    auc = roc_auc_score(y_te, y_score)
    pr_auc = average_precision_score(y_te, y_score)
    cm = confusion_matrix(y_te, y_pred)
    tn, fp, fn, tp = cm.ravel()
    sens = recall_score(y_te, y_pred)
    spec = tn / (tn + fp)
    prec = precision_score(y_te, y_pred)
    f1 = f1_score(y_te, y_pred)
    acc = accuracy_score(y_te, y_pred)

    print("\n--- MIT-BIH Arrhythmia Test Metrics ---")
    print(f"  Model              : {pkg.get('algorithm', 'LightGBM')}")
    print(f"  Threshold          : {th:.3f}")
    print(f"  ROC-AUC            : {auc:.4f}")
    print(f"  PR-AUC             : {pr_auc:.4f}")
    print(f"  Sensitivity        : {sens:.4f}")
    print(f"  Specificity        : {spec:.4f}")
    print(f"  Precision          : {prec:.4f}")
    print(f"  F1-Score           : {f1:.4f}")
    print(f"  Accuracy           : {acc:.4f}")
    print(f"  Confusion Matrix   : TN={tn}, FP={fp}, FN={fn}, TP={tp}")

    # 8. Export per-sample test predictions CSV
    csv_path = os.path.join(out_dir, 'Arrhythmia_test_predictions.csv')
    df_out = pd.DataFrame({
        'sample_id': samples_te,
        'group_id': recs_te,
        'y_true': y_te,
        'y_score': np.round(y_score, 6),
        'y_pred': y_pred
    })
    df_out.to_csv(csv_path, index=False)
    print(f"[EXPORT] Saved {len(df_out)} predictions to: {csv_path}")

    # 9. Export threshold documentation
    th_path = os.path.join(out_dir, 'Arrhythmia_threshold.txt')
    with open(th_path, 'w') as fp:
        fp.write(f"Task: Arrhythmia\n")
        fp.write(f"Model: {pkg.get('algorithm', 'LightGBM')}\n")
        fp.write(f"Threshold: {th}\n")
        fp.write(f"Method: Optimized on validation split (7 patient records) to maximize validation F1 score; evaluated once on held-out test split.\n")
        fp.write(f"Metrics: ROC-AUC={auc:.4f}, PR-AUC={pr_auc:.4f}, Sensitivity={sens:.4f}, Specificity={spec:.4f}, TN={tn}, FP={fp}, FN={fn}, TP={tp}\n")
    print(f"[EXPORT] Saved threshold documentation to: {th_path}")

    return {
        'task': 'Arrhythmia', 'model': 'LightGBM', 'n_test': n_test, 'positives': n_pos,
        'auc': auc, 'pr_auc': pr_auc, 'threshold': th, 'tn': tn, 'fp': fp, 'fn': fn, 'tp': tp,
        'sens': sens, 'spec': spec, 'prec': prec, 'f1': f1, 'acc': acc, 'csv_path': csv_path
    }

if __name__ == '__main__':
    run_mitbih_eval()

