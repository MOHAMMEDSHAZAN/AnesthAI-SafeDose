# -*- coding: utf-8 -*-
"""
Generate Publication Figures from Prediction CSVs
Generates:
1. Multi-task ROC Curves and PR Curves (Fig. 6)
2. Revalidated Arrhythmia Confusion Matrix (Fig. 7)
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, precision_recall_curve, auc, confusion_matrix

PRED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "03_PREDICTION_DATA"))
OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "publication_figures"))

def load_data(task_name):
    path = os.path.join(PRED_DIR, f"{task_name}_test_predictions.csv")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing {path}")
    df = pd.read_csv(path)
    return df['y_true'].values, df['y_prob'].values

def plot_roc_pr_curves():
    tasks = [
        ('Arrhythmia', 'MIT-BIH Arrhythmia (RF)'),
        ('Hypotension', 'VitalDB Hypotension (LGBM)'),
        ('Hypoxia', 'VitalDB Hypoxia (LGBM)'),
        ('Tachycardia', 'VitalDB Tachycardia (LGBM)')
    ]
    colors = ['#1f77b4', '#d62728', '#2ca02c', '#ff7f0e']
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=300)
    
    for (task, label), color in zip(tasks, colors):
        y_true, y_prob = load_data(task)
        fpr, tpr, _ = roc_curve(y_true, y_prob)
        roc_auc = auc(fpr, tpr)
        ax1.plot(fpr, tpr, label=f"{task} (AUC = {roc_auc:.3f})", color=color, lw=1.8)
        
        prec, rec, _ = precision_recall_curve(y_true, y_prob)
        pr_auc = auc(rec, prec)
        ax2.plot(rec, prec, label=f"{task} (AUC = {pr_auc:.3f})", color=color, lw=1.8)
        
    ax1.plot([0, 1], [0, 1], 'k--', lw=1, alpha=0.6)
    ax1.set_title("Receiver Operating Characteristic (ROC)", fontsize=11, fontweight='bold')
    ax1.set_xlabel("False Positive Rate", fontsize=10)
    ax1.set_ylabel("True Positive Rate", fontsize=10)
    ax1.set_xlim([0, 1])
    ax1.set_ylim([0, 1.02])
    ax1.grid(True, linestyle=':', alpha=0.6)
    ax1.legend(loc='lower right', fontsize=8.5)
    
    ax2.set_title("Precision-Recall (PR) Curves", fontsize=11, fontweight='bold')
    ax2.set_xlabel("Recall", fontsize=10)
    ax2.set_ylabel("Precision", fontsize=10)
    ax2.set_xlim([0, 1])
    ax2.set_ylim([0, 1.02])
    ax2.grid(True, linestyle=':', alpha=0.6)
    ax2.legend(loc='upper right', fontsize=8.5)
    
    plt.tight_layout()
    out_file = os.path.join(OUT_DIR, "fig4_roc_pr_curves_regenerated.png")
    plt.savefig(out_file, dpi=300)
    plt.close()
    print(f"Saved: {out_file}")

def plot_arrhythmia_cm():
    y_true, y_prob = load_data('Arrhythmia')
    tau = 0.220
    y_pred = (y_prob >= tau).astype(int)
    cm = confusion_matrix(y_true, y_pred)
    
    fig, ax = plt.subplots(figsize=(4.5, 3.8), dpi=300)
    labels = ['Normal Sinus', 'Arrhythmia']
    
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
                xticklabels=labels, yticklabels=labels, ax=ax,
                annot_kws={'size': 12, 'weight': 'bold'})
    
    ax.set_title(f"Arrhythmia Confusion Matrix\n(N=17,026, tau=0.220)", fontsize=11, fontweight='bold')
    ax.set_xlabel("Predicted Diagnosis", fontsize=10, fontweight='bold')
    ax.set_ylabel("Ground Truth ECG", fontsize=10, fontweight='bold')
    
    plt.tight_layout()
    out_file = os.path.join(OUT_DIR, "fig5_arrhythmia_cm_regenerated.png")
    plt.savefig(out_file, dpi=300)
    plt.close()
    print(f"Saved: {out_file}")

if __name__ == '__main__':
    plot_roc_pr_curves()
    plot_arrhythmia_cm()
