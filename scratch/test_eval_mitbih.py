import os, sys, json, pickle
import numpy as np
from sklearn.metrics import roc_auc_score, average_precision_score, confusion_matrix, accuracy_score, f1_score, recall_score

manifest_path = 'reports/arrhythmia_split_manifest.json'
with open(manifest_path, 'r') as fp:
    mit_manifest = json.load(fp)

sys.path.insert(0, 'preprocessing')
import data_loader

mit_ecg = data_loader.load_mit_bih_ecg('datasets', max_records=48)
X_beats, y_beats, rec_ids = [], [], []
for record in mit_ecg:
    sig = record['signal'][:, 0]
    peaks = record['ann_sample']
    symbols = record['ann_type']
    rec_id = str(record['id'])
    for peak, sym in zip(peaks, symbols):
        if sym in ['+', '~', '|', '[', ']', '!', '"', 'x']:
            continue
        if 50 < peak < len(sig) - 50:
            beat = sig[peak-50 : peak+50]
            beat_norm = (beat - np.mean(beat)) / (np.std(beat) + 1e-6)
            X_beats.append(beat_norm)
            y_beats.append(0 if sym == 'N' else 1)
            rec_ids.append(rec_id)

X_beats = np.array(X_beats, dtype=np.float32)
y_beats = np.array(y_beats, dtype=int)
rec_ids = np.array(rec_ids)

te_recs = set(mit_manifest['test_records'])
te_idx = np.where(np.isin(rec_ids, list(te_recs)))[0]
print(f'Test beats: {len(te_idx)}, Normal: {np.sum(y_beats[te_idx]==0)}, Arrhythmia: {np.sum(y_beats[te_idx]==1)}')

with open('models/Arrhythmia.pkl', 'rb') as fp:
    model_data = pickle.load(fp)

clf = model_data['model']
scaler = model_data.get('scaler', None)
X_te = scaler.transform(X_beats[te_idx]) if scaler else X_beats[te_idx]
y_te = y_beats[te_idx]

y_score = clf.predict_proba(X_te)[:, 1]
th = model_data.get('optimal_threshold', 0.220)
y_pred = (y_score >= th).astype(int)

auc = roc_auc_score(y_te, y_score)
pr_auc = average_precision_score(y_te, y_score)
cm = confusion_matrix(y_te, y_pred)
acc = accuracy_score(y_te, y_pred)
f1 = f1_score(y_te, y_pred)
sens = recall_score(y_te, y_pred)
spec = cm[0, 0] / (cm[0, 0] + cm[0, 1])

print(f'AUC: {auc:.4f}, PR-AUC: {pr_auc:.4f}, Accuracy: {acc:.4f}, F1: {f1:.4f}, Sens: {sens:.4f}, Spec: {spec:.4f}')
print(f'Confusion Matrix:\n{cm}')

