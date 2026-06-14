#!/usr/bin/env python3
"""
AnesthAI SafeDose - Clinical ML Model Training Script
Trains predictive models for:
1. Intraoperative Hypotension Forecasting (classification from vital trends)
2. Preoperative Anesthesia Technique Recommendation
"""

import os
import csv
import math

# Try importing standard ML packages. If missing, fall back to pure-Python implementations
# so that the script can execute on any standard python environment.
try:
    import numpy as np
    import pandas as pd
    from sklearn.model_selection import train_test_split
    from sklearn.linear_model import LogisticRegression
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False


def load_csv_pure_python(filepath):
    """Fallback parser using standard library csv reader"""
    data = []
    if not os.path.exists(filepath):
        print(f"Error: File {filepath} not found.")
        return None
    with open(filepath, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data


def train_hypotension_predictor_pure_python(data):
    """
    Trains a simple Logistic Regression classifier using pure Python gradient descent
    to predict hypotension (MAP < 60 mmHg) from Heart Rate, Systolic BP, Diastolic BP, and MAP.
    """
    print("\n--- Training Hypotension Predictor (Pure Python Implementation) ---")
    
    # Extract features (HR, SBP, DBP, MAP) and target (Hypotension_Occurred)
    X = []
    y = []
    for row in data:
        try:
            features = [
                float(row['HeartRate']),
                float(row['SystolicBP']),
                float(row['DiastolicBP']),
                float(row['MAP'])
            ]
            target = int(row['Hypotension_Occurred'])
            X.append(features)
            y.append(target)
        except ValueError:
            continue
            
    if not X:
        print("No valid rows for training.")
        return

    # Normalization (Z-score scaling)
    mean = [0.0] * len(X[0])
    std = [0.0] * len(X[0])
    n = len(X)
    
    for row in X:
        for j in range(len(row)):
            mean[j] += row[j]
    mean = [m / n for m in mean]
    
    for row in X:
        for j in range(len(row)):
            std[j] += (row[j] - mean[j]) ** 2
    std = [math.sqrt(s / n) if s > 0 else 1.0 for s in std]
    
    X_scaled = []
    for row in X:
        X_scaled.append([(row[j] - mean[j]) / std[j] for j in range(len(row))])

    # Add bias term (1.0)
    for i in range(n):
        X_scaled[i].append(1.0)

    # Sigmoid function
    def sigmoid(z):
        return 1.0 / (1.0 + math.exp(-max(min(z, 50), -50)))

    # Weights initialization (HR, SBP, DBP, MAP, Bias)
    w = [0.0] * len(X_scaled[0])
    lr = 0.1
    epochs = 200
    
    # Gradient Descent
    for epoch in range(epochs):
        loss = 0.0
        for i in range(n):
            z = sum(X_scaled[i][j] * w[j] for j in range(len(w)))
            pred = sigmoid(z)
            
            # Binary Cross Entropy Loss
            if y[i] == 1:
                loss += -math.log(max(pred, 1e-15))
            else:
                loss += -math.log(max(1.0 - pred, 1e-15))
                
            error = pred - y[i]
            for j in range(len(w)):
                w[j] -= lr * error * X_scaled[i][j] / n
                
        loss /= n
        if (epoch + 1) % 50 == 0:
            print(f"Epoch {epoch+1:03d} | Log-Loss: {loss:.5f}")

    # Evaluate model
    correct = 0
    tp, fp, tn, fn = 0, 0, 0, 0
    for i in range(n):
        z = sum(X_scaled[i][j] * w[j] for j in range(len(w)))
        pred = 1 if sigmoid(z) >= 0.5 else 0
        if pred == y[i]:
            correct += 1
        
        if pred == 1 and y[i] == 1:
            tp += 1
        elif pred == 1 and y[i] == 0:
            fp += 1
        elif pred == 0 and y[i] == 0:
            tn += 1
        elif pred == 0 and y[i] == 1:
            fn += 1

    accuracy = correct / n
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    print("\nTraining Metrics Summary:")
    print(f"Accuracy : {accuracy:.4f} ({correct}/{n} correct)")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"\nConfusion Matrix:")
    print(f"          Predicted (-)   Predicted (+)")
    print(f"Actual (-)     {tn:03d}             {fp:03d}")
    print(f"Actual (+)     {fn:03d}             {tp:03d}")
    
    print("\nModel Feature Coefficients (Weights):")
    feature_names = ['HeartRate', 'SystolicBP', 'DiastolicBP', 'MAP', 'Bias']
    for name, weight_val in zip(feature_names, w):
        print(f" - {name:12s} : {weight_val:.4f}")


def train_sklearn_models(intra_path, pre_path):
    """Helper method to train high-fidelity scikit-learn models"""
    print("\n--- Training sk-learn Machine Learning Models ---")
    
    # 1. Intraoperative Hypotension Predictor
    df_intra = pd.read_csv(intra_path)
    X_intra = df_intra[['HeartRate', 'SystolicBP', 'DiastolicBP', 'MAP', 'Temp_C']]
    y_intra = df_intra['Hypotension_Occurred']
    
    X_train_i, X_test_i, y_train_i, y_test_i = train_test_split(X_intra, y_intra, test_size=0.2, random_state=42)
    
    clf_lr = LogisticRegression(max_iter=1000)
    clf_lr.fit(X_train_i, y_train_i)
    
    preds_i = clf_lr.predict(X_test_i)
    probs_i = clf_lr.predict_proba(X_test_i)[:, 1]
    
    print("\n1. Hypotension Prediction Model (Logistic Regression) Results:")
    print("Test Accuracy: ", clf_lr.score(X_test_i, y_test_i))
    print("ROC AUC Score: ", roc_auc_score(y_test_i, probs_i))
    print("\nClassification Report:")
    print(classification_report(y_test_i, preds_i))
    
    # 2. Preoperative Anesthesia Technique Recommender
    df_pre = pd.read_csv(pre_path)
    # Factorize columns for categorical training
    df_pre['Gender_Code'] = pd.factorize(df_pre['Gender'])[0]
    
    X_pre = df_pre[['Age', 'Weight_kg', 'ASA_Class', 'Mallampati', 'RCRI_Score', 'Gender_Code']]
    y_pre = pd.factorize(df_pre['Anesthesia_Technique'])[0]
    tech_names = pd.factorize(df_pre['Anesthesia_Technique'])[1]
    
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_pre, y_pre, test_size=0.2, random_state=42)
    
    clf_rf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf_rf.fit(X_train_p, y_train_p)
    
    preds_p = clf_rf.predict(X_test_p)
    print("\n2. Preoperative Technique Recommender (Random Forest) Results:")
    print("Test Accuracy: ", clf_rf.score(X_test_p, y_test_p))
    print("\nClassification Report:")
    print(classification_report(y_test_p, preds_p, target_names=tech_names))
    
    # Save the models/coefficients to text file for UI reference
    print("\nSaving clinical weights output to 'datasets/model_weights.txt'...")
    with open('datasets/model_weights.txt', 'w') as out_f:
        out_f.write("ANES-AI LOGISTIC REGRESSION WEIGHTS:\n")
        for name, coef in zip(X_intra.columns, clf_lr.coef_[0]):
            out_f.write(f"{name}: {coef:.4f}\n")
        out_f.write(f"Intercept: {clf_lr.intercept_[0]:.4f}\n\n")
        out_f.write("ANES-AI RANDOM FOREST PREOP FEATURE IMPORTANCE:\n")
        for name, imp in zip(X_pre.columns, clf_rf.feature_importances_):
            out_f.write(f"{name}: {imp:.4f}\n")


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    intra_path = os.path.join(base_dir, 'intraoperative_hemodynamics_dataset.csv')
    pre_path = os.path.join(base_dir, 'preoperative_risk_dataset.csv')
    
    print("====================================================")
    print("  AnesthAI SafeDose - Medical ML Model Training V1   ")
    print("====================================================")
    
    if HAS_ML_LIBS:
        train_sklearn_models(intra_path, pre_path)
    else:
        print("\nNote: pandas, numpy or scikit-learn are not installed.")
        print("Falling back to pure Python gradient-descent optimization solver...")
        data = load_csv_pure_python(intra_path)
        if data:
            train_hypotension_predictor_pure_python(data)
            
    print("\n====================================================")
    print("Training job complete. Model details successfully synced.")
    print("====================================================")


if __name__ == '__main__':
    main()
