# Model Registry, Features & Evaluation Protocols

## 1. Production Model Registry (`models/`)
| Model Artifact | Clinical Task | Algorithm | Input Feature Dimension | Operating Threshold $\tau$ |
| :--- | :--- | :--- | :---: | :---: |
| `hypotension_lgbm.pkl` | Intraoperative Hypotension | LightGBM | 42 hemodynamic features | 0.500 |
| `tachycardia_lgbm.pkl` | Intraoperative Tachycardia | LightGBM | 42 hemodynamic features | 0.250 |
| `hypoxia_lgbm.pkl` | Intraoperative Hypoxia | LightGBM | 36 oxygenation features | 0.825 |
| `arrhythmia_model.pkl` | Arrhythmia Detection | Random Forest (100 trees) | 32 ECG wave features | 0.220 |

## 2. Input Feature Engineering (VitalDB 5-Minute Backward Windows)
To guarantee zero forward data leakage, features are calculated solely from retrospective $t - 300\text{s}$ to $t$ intervals:
1. `hr_mean`, `hr_std`, `hr_min`, `hr_max`, `hr_delta`
2. `map_mean`, `map_std`, `map_min`, `map_max`, `map_slope`
3. `sbp_mean`, `sbp_std`, `sbp_min`, `sbp_max`
4. `dbp_mean`, `dbp_std`, `dbp_min`, `dbp_max`
5. `pulse_pressure_mean`, `shock_index` (HR / SBP)
6. `spo2_mean`, `spo2_min`, `spo2_std`

## 3. Cardiological Beat Features (MIT-BIH Arrhythmia)
Extracted using pan-tompkins QRS detection and AAMI standard heartbeat segmentation:
1. Pre-RR interval, Post-RR interval, Local-RR average
2. QRS duration, Q-wave amplitude, R-wave peak amplitude, S-wave deflection
3. ST-segment elevation/depression, T-wave polarity and amplitude
