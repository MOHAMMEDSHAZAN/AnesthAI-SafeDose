import os, sys, glob, time, pickle
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, average_precision_score, confusion_matrix, accuracy_score, f1_score, recall_score

sys.path.insert(0, 'preprocessing')
import data_loader

test_cases = ['1123', '1132', '1191', '1211', '1215', '125', '1261', '1307', '1548', '1640', '1735', '1785', '1959', '1988', '2117', '2161', '2327', '2337', '2493', '2504', '264', '2706', '2735', '2738', '448', '490', '587', '631', '703', '733', '869', '885', '917', '931', '945']

print('Loading 35 VitalDB test cases...')
t0 = time.time()
cases = []
for tc in test_cases:
    matches = glob.glob(f'datasets/01_hemodynamics_vitaldb/VitalDB/**/{tc}.csv', recursive=True)
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

df_vital = pd.concat(cases, ignore_index=True)
print(f'Loaded {len(df_vital)} test rows in {time.time()-t0:.2f}s')

# Feature engineering
for col in ['hr', 'map', 'spo2', 'etco2']:
    df_vital[f'{col}_roll_mean'] = df_vital.groupby('PatientID')[col].transform(lambda x: x.rolling(5, min_periods=1).mean())
    df_vital[f'{col}_roll_std'] = df_vital.groupby('PatientID')[col].transform(lambda x: x.rolling(5, min_periods=1).std().fillna(0.0))
    df_vital[f'{col}_trend'] = df_vital.groupby('PatientID')[col].transform(lambda x: x.diff(5).fillna(0.0))

df_vital['shock_index'] = df_vital['hr'] / df_vital['sbp'].replace(0, 1)
df_vital['pulse_pressure'] = df_vital['sbp'] - df_vital['dbp']
df_vital['cvp_map_ratio'] = df_vital['cvp'] / df_vital['map'].replace(0, 1)

# Hypoxia
print('\n--- Hypoxia ---')
with open('models/Hypoxia.pkl', 'rb') as f:
    pkg = pickle.load(f)
clf = pkg['model']
scaler = pkg.get('scaler', None)
feat = pkg['features']
th = pkg.get('optimal_threshold', 0.825)
X = df_vital[feat].values
if scaler: X = scaler.transform(X)
y = (df_vital['spo2'] < 90).astype(int).values
p = clf.predict_proba(X)[:, 1]
pred = (p >= th).astype(int)
print(f'AUC: {roc_auc_score(y, p):.4f}, PR-AUC: {average_precision_score(y, p):.4f}, Threshold: {th}')
print(f'CM:\n{confusion_matrix(y, pred)}')

# Tachycardia
print('\n--- Tachycardia ---')
with open('models/Tachycardia.pkl', 'rb') as f:
    pkg = pickle.load(f)
clf = pkg['model']
scaler = pkg.get('scaler', None)
feat = pkg['features']
th = pkg.get('optimal_threshold', 0.250)
X = df_vital[feat].values
if scaler: X = scaler.transform(X)
y = (df_vital['hr'] > 100).astype(int).values
p = clf.predict_proba(X)[:, 1]
pred = (p >= th).astype(int)
print(f'AUC: {roc_auc_score(y, p):.4f}, PR-AUC: {average_precision_score(y, p):.4f}, Threshold: {th}')
print(f'CM:\n{confusion_matrix(y, pred)}')
