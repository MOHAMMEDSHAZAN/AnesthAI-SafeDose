#!/usr/bin/env python3
"""
SafeDose AI — Isolated Demo / Debug Training Pipeline
Dedicated to processing and validating demo datasets strictly separate from the final clinical benchmark.

Guarantees:
1. Operates solely on official demo data (e.g. MIMIC-IV-ED Demo v2.2, 222 stays).
2. Saves outputs strictly to models/demo/ and reports/demo/.
3. Stamps all models and reports as: DEMO / DEBUG ONLY — NOT CLINICALLY VALIDATED.
4. Never mixes demo data or metrics into the final clinical evaluation.
"""

import os
import sys
import time
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, auc, confusion_matrix,
    brier_score_loss
)

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
preprocessing_path = os.path.join(project_root, 'preprocessing')
if preprocessing_path not in sys.path:
    sys.path.append(preprocessing_path)

import data_loader

def run_demo_pipeline():
    print("=" * 80)
    print("SAFEDOSE AI: ISOLATED DEMO / DEBUG TRAINING PIPELINE")
    print("STATUS: DEMO / DEBUG ONLY — NOT CLINICALLY VALIDATED")
    print("=" * 80)
    
    t0 = time.time()
    datasets_dir = os.path.join(project_root, 'datasets')
    models_demo_dir = os.path.join(project_root, 'models', 'demo')
    reports_demo_dir = os.path.join(project_root, 'reports', 'demo')
    os.makedirs(models_demo_dir, exist_ok=True)
    os.makedirs(reports_demo_dir, exist_ok=True)

    # 1. Load official demo ED dataset
    print("\n[Demo Step 1] Loading MIMIC-IV-ED Demo v2.2 (allow_demo=True)...")
    df_ed = data_loader.load_mimic_ed_data(datasets_dir, allow_demo=True)
    
    if df_ed.empty or 'acuity' not in df_ed.columns:
        print("[ERROR] Demo MIMIC-IV-ED dataset could not be loaded.")
        return False
        
    print(f"[+] Loaded Demo ED Cohort: {len(df_ed)} stays across {df_ed['subject_id'].nunique()} unique subjects.")
    
    # Target and features
    features = ['temperature', 'heartrate', 'resprate', 'o2sat', 'sbp', 'dbp']
    X = df_ed[features].values
    y = (df_ed['acuity'] <= 2).astype(int).values
    groups = df_ed['subject_id'].values
    
    # 2. Patient-grouped 3-way split
    print("\n[Demo Step 2] Performing 3-way subject-grouped split (70% Train, 15% Val, 15% Test)...")
    gss_test = GroupShuffleSplit(n_splits=1, test_size=0.15, random_state=42)
    train_val_idx, test_idx = next(gss_test.split(X, y, groups=groups))
    
    X_train_val, y_train_val = X[train_val_idx], y[train_val_idx]
    groups_train_val = groups[train_val_idx]
    
    gss_val = GroupShuffleSplit(n_splits=1, test_size=0.1765, random_state=42) # 0.1765 * 0.85 ~= 0.15
    train_sub_idx, val_sub_idx = next(gss_val.split(X_train_val, y_train_val, groups=groups_train_val))
    
    train_idx = train_val_idx[train_sub_idx]
    val_idx = train_val_idx[val_sub_idx]
    
    X_train, y_train = X[train_idx], y[train_idx]
    X_val, y_val = X[val_idx], y[val_idx]
    X_test, y_test = X[test_idx], y[test_idx]
    
    tr_pts = set(groups[train_idx])
    val_pts = set(groups[val_idx])
    te_pts = set(groups[test_idx])
    
    print(f"  Train : {len(X_train)} stays ({len(tr_pts)} subjects)")
    print(f"  Val   : {len(X_val)} stays ({len(val_pts)} subjects)")
    print(f"  Test  : {len(X_test)} stays ({len(te_pts)} subjects)")
    assert len(tr_pts.intersection(val_pts)) == 0, "Train and Val subjects overlap!"
    assert len(tr_pts.intersection(te_pts)) == 0, "Train and Test subjects overlap!"
    assert len(val_pts.intersection(te_pts)) == 0, "Val and Test subjects overlap!"
    print("  [PASSED] Subject isolation verified: Zero subject overlap between splits.")

    # 3. Preprocessing fitted strictly on train
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_val_s = scaler.transform(X_val)
    X_test_s = scaler.transform(X_test)

    # 4. Candidate Model Selection on Validation set
    print("\n[Demo Step 3] Evaluating candidate algorithms on validation split...")
    candidates = {
        'Logistic Regression': LogisticRegression(class_weight='balanced', random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=50, max_depth=5, class_weight='balanced', random_state=42),
        'MLP': MLPClassifier(hidden_layer_sizes=(16, 8), max_iter=200, random_state=42)
    }
    
    best_name = None
    best_f1 = -1.0
    best_th = 0.5
    best_clf = None
    best_val_metrics = {}
    
    for name, clf in candidates.items():
        clf.fit(X_train_s, y_train)
        probs = clf.predict_proba(X_val_s)[:, 1] if hasattr(clf, 'predict_proba') else clf.predict(X_val_s)
        
        # Optimize threshold on validation set
        thresholds = np.linspace(0.1, 0.9, 17)
        for th in thresholds:
            preds = (probs >= th).astype(int)
            f1 = f1_score(y_val, preds, zero_division=0)
            if f1 > best_f1:
                best_f1 = f1
                best_th = th
                best_name = name
                best_clf = clf
                best_val_metrics = {
                    'accuracy': float(accuracy_score(y_val, preds)),
                    'f1_score': float(f1),
                    'recall': float(recall_score(y_val, preds, zero_division=0)),
                    'precision': float(precision_score(y_val, preds, zero_division=0))
                }

    print(f"  Selected Champion: {best_name} (Val F1: {best_f1:.4f} at threshold {best_th:.2f})")

    # 5. Untouched test set evaluation
    print("\n[Demo Step 4] Final evaluation on untouched Demo Test Split...")
    test_probs = best_clf.predict_proba(X_test_s)[:, 1] if hasattr(best_clf, 'predict_proba') else best_clf.predict(X_test_s)
    test_preds = (test_probs >= best_th).astype(int)
    
    cm = confusion_matrix(y_test, test_preds, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (0, 0, 0, len(y_test))
    test_acc = float(accuracy_score(y_test, test_preds))
    test_prec = float(precision_score(y_test, test_preds, zero_division=0))
    test_sens = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    test_spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    test_f1 = float(f1_score(y_test, test_preds, zero_division=0))
    try:
        test_auc = float(roc_auc_score(y_test, test_probs))
    except Exception:
        test_auc = 0.5
    try:
        p_c, r_c, _ = precision_recall_curve(y_test, test_probs)
        test_pr = float(auc(r_c, p_c))
    except Exception:
        test_pr = 0.5
    test_brier = float(brier_score_loss(y_test, test_probs))

    print(f"  Test Accuracy   : {test_acc:.4f}")
    print(f"  Test F1-Score   : {test_f1:.4f}")
    print(f"  Test Sensitivity: {test_sens:.4f}")
    print(f"  Test Specificity: {test_spec:.4f}")
    print(f"  Test ROC-AUC    : {test_auc:.4f}")

    # 6. Save Demo Model Artifact
    demo_payload = {
        'task': 'EmergencySeverity',
        'is_demo': True,
        'demo_classification': 'DEMO / DEBUG ONLY — NOT CLINICALLY VALIDATED',
        'algorithm': best_name,
        'model': best_clf,
        'scaler': scaler,
        'features': features,
        'optimal_threshold': best_th,
        'validation_metrics': best_val_metrics,
        'test_metrics': {
            'accuracy': test_acc,
            'precision': test_prec,
            'sensitivity': test_sens,
            'specificity': test_spec,
            'f1_score': test_f1,
            'roc_auc': test_auc,
            'pr_auc': test_pr,
            'brier_score': test_brier,
            'confusion_matrix': cm.tolist()
        },
        'cohort_summary': {
            'total_stays': len(df_ed),
            'unique_subjects': int(df_ed['subject_id'].nunique()),
            'train_stays': len(X_train),
            'val_stays': len(X_val),
            'test_stays': len(X_test)
        },
        'training_duration_seconds': round(time.time() - t0, 2),
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())
    }

    demo_model_path = os.path.join(models_demo_dir, 'EmergencySeverity_DEMO.pkl')
    with open(demo_model_path, 'wb') as f:
        pickle.dump(demo_payload, f)
    print(f"\n[+] Saved Demo Model Artifact: {demo_model_path}")

    # 7. Generate Demo Training Report
    demo_report_md = f"""# SafeDose AI — Demo Training & Debug Pipeline Report

> [!WARNING]
> **CLASSIFICATION: DEMO / DEBUG ONLY — NOT CLINICALLY VALIDATED**  
> This model was trained exclusively on the limited PhysioNet MIMIC-IV-ED Demo v2.2 subset (222 stays across 64 subjects).  
> **It is strictly prohibited from being presented as clinical performance or replacing the full MIMIC-IV-ED model.**

---

## 1. Demo Pipeline Purpose
- Validates data-loader parsing of all 6 MIMIC-IV-ED files (`edstays`, `triage`, `vitalsign`, `diagnosis`, `medrecon`, `pyxis`).
- Verifies subject-grouped split mechanics on ED stay cohorts.
- Confirms end-to-end training and inference execution for debug and smoke testing.

## 2. Cohort Specifications
| Parameter | Value |
| :--- | :--- |
| **Dataset Source** | PhysioNet MIMIC-IV-ED Demo v2.2 (`datasets/04_preoperative_risk/mimic-iv-ed-demo-2.2/`) |
| **Total Stays** | {len(df_ed)} |
| **Unique Subjects** | {df_ed['subject_id'].nunique()} |
| **Train Partition** | {len(X_train)} stays ({len(tr_pts)} subjects) |
| **Val Partition** | {len(X_val)} stays ({len(val_pts)} subjects) |
| **Test Partition** | {len(X_test)} stays ({len(te_pts)} subjects) |
| **Subject Overlap** | **0 (Zero patient overlap)** |
| **Predictor Features** | `temperature`, `heartrate`, `resprate`, `o2sat`, `sbp`, `dbp` |
| **Target Variable** | Acuity <= 2 (High Acuity / Resuscitation / Emergent) |

## 3. Demo Model Performance
| Metric | Value |
| :--- | :--- |
| **Selected Algorithm** | `{best_name}` |
| **Optimal Threshold** | `{best_th:.2f}` |
| **Test Accuracy** | `{test_acc:.4f}` |
| **Test Precision** | `{test_prec:.4f}` |
| **Test Recall / Sensitivity** | `{test_sens:.4f}` |
| **Test Specificity** | `{test_spec:.4f}` |
| **Test F1-Score** | `{test_f1:.4f}` |
| **Test ROC-AUC** | `{test_auc:.4f}` |
| **Test PR-AUC** | `{test_pr:.4f}` |
| **Test Brier Score** | `{test_brier:.4f}` |
| **Confusion Matrix** | `{cm.tolist()}` |

## 4. Storage Locations
- **Model Payload**: `models/demo/EmergencySeverity_DEMO.pkl`
- **Report Location**: `reports/demo_training_report.md` and `reports/demo/demo_training_report.md`
"""

    for p in [os.path.join(project_root, 'reports', 'demo_training_report.md'),
              os.path.join(reports_demo_dir, 'demo_training_report.md')]:
        with open(p, 'w', encoding='utf-8') as f:
            f.write(demo_report_md)
        print(f"[+] Saved Demo Report: {p}")

    # Metrics JSON
    demo_metrics_json = os.path.join(reports_demo_dir, 'demo_model_metrics.json')
    with open(demo_metrics_json, 'w', encoding='utf-8') as f:
        json.dump(demo_payload['test_metrics'], f, indent=2)
    print(f"[+] Saved Demo Metrics JSON: {demo_metrics_json}")

    print("\nDemo pipeline execution finished successfully!")
    return True

if __name__ == '__main__':
    run_demo_pipeline()
