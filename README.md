# AnesthAI SafeDose - AI-Powered Perioperative Decision Support

AnesthAI SafeDose is a medical artificial intelligence platform designed to assist anesthesiologists and clinical teams with real-time decision support, drug dosing safety checks, and postoperative recovery forecasts. It integrates multiple gold-standard clinical databases (VitalDB, MIMIC-IV, and MIT-BIH ECG) to power **15 clinical predictive models** across **20 machine learning and deep learning algorithms**.

---

## 🚀 Key Features

### 1. Unified Dataset loader & Imputation
- Handles outlier clipping, duplicate removal, and KNN/median imputation.
- Performs temporal alignment, resampling continuous vital sign streams to 1-second increments.
- Custom pure-Python binary format 212 parser to decode MIT-BIH ECG records without external dependencies.

### 2. Clinical AI Training Pipeline
- Trains **15 clinical classifiers** for:
  - **Hemodynamics**: Hypotension, Hypoxia, Bradycardia, Tachycardia.
  - **ECG Analysis**: Arrhythmia detection.
  - **Perioperative Risk**: Preoperative Technique recommendation (`RiskPrediction`), Apfel PONV risk, Difficult Airway risk.
  - **Clinical Triages**: Emergency severity, PACU delayed recovery, ICU transfers, in-hospital Mortality risk.
  - **Intraoperative Guidance**: High Blood Loss, Fluid recommendation (bolus volume), Drug Safety combination flags.
- Tests up to **20 algorithms**:
  - *Traditional Machine Learning*: Random Forest, LightGBM, CatBoost, XGBoost, Extra Trees, AdaBoost, Logistic Regression, SVM, KNN, Naive Bayes.
  - *Deep Learning (PyTorch)*: MLP, LSTM, GRU, CNN, CNN-LSTM, Clinical Transformer, and TabNet.
- Configured with stratified splits, class-imbalance handles (SMOTE), and weighted multiclass metric evaluations.

### 3. Central Datasets Cleaning Service
- Includes an execution utility to preprocess raw clinical datasets into clean, flat-file numerical structures ready for immediate training.

### 4. FastAPI Decision Portal
- Exposes predictions, confidence scores, uncertainty estimations, feature direction maps (SHAP proxy), and clinical recommendation guidelines.

---

## 📂 Project Architecture

```bash
├── backend/
│   ├── data_loader.py          # Data ingestion and cleaning wrapper
│   ├── train_pipeline.py       # AI model training and plotting engine
│   ├── main_api.py             # FastAPI prediction server
│   ├── models/                 # Serialized model artifacts (.pkl files)
│   └── reports/                # Performance plots & training reports
│
├── datasets/
│   ├── clean_datasets.py       # Preprocessing utility
│   ├── Anesthesia_Dataset_cleaned.csv
│   ├── preoperative_risk_dataset_cleaned.csv
│   ├── intraoperative_hemodynamics_cleaned.csv
│   ├── human_vital_signs_dataset_cleaned.csv
│   ├── mit_bih_ecg_cleaned.csv
│   └── vitaldb_hemodynamics_cleaned.csv
│
├── src/
│   ├── views/                  # React views querying prediction server
│   │   ├── Preoperative.tsx    # Preoperative checklist and technique recommendation
│   │   ├── Airway.tsx          # Airway management guidance
│   │   └── PACU.tsx            # Delayed PACU recovery analytics
│   └── context/
│       └── AppContext.tsx      # Application state container
```

---

## 🛠️ Getting Started

### 1. Requirements & Dependencies
Navigate to the root directory and install packages:
```bash
pip install torch pytorch-tabnet scikit-learn pandas numpy lightgbm catboost optuna shap lime wfdb imbalanced-learn matplotlib seaborn fastapi uvicorn pydantic
```

### 2. Preprocess Raw Datasets
To compile the raw database directories into the preprocessed cleaned CSV tables:
```bash
python datasets/clean_datasets.py
```

### 3. Run Pipeline Training
To run grid comparison across all algorithms and serialize the best classifiers:
```bash
python backend/train_pipeline.py
```
This writes the serialization objects under `backend/models/` and evaluation charts under `backend/reports/plots/`.

### 4. Start FastAPI Prediction Portal
To deploy the clinical API web-portal on port `8000`:
```bash
python backend/main_api.py
```

### 5. Launch React Frontend
To install node packages and run the Vite client development portal:
```bash
npm install
npm run dev
```

---

## 📊 API Reference

- `POST /predict/{model_name}`: Accepts feature payloads and returns predicted targets, confidence ranges, clinical reasoning summaries, and SHAP feature mappings.
- `POST /retrain`: Upload new VitalDB cases and triggers incremental pipeline training.
- `GET /metrics/{model_name}`: Retrieves training metrics (F1-score, Accuracy, ROC AUC) and active feature counts.
- `GET /health`: Checks FastAPI health status and loaded model profiles.
