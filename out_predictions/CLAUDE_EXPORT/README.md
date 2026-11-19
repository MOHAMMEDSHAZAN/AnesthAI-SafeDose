# AnesthAI SafeDose: Four Verified ML Prediction Export Bundle
**Author / Project:** AnesthAI SafeDose (IEEE Engineering in Medicine and Biology / IEEE Transactions Submission)
**Scope:** Verified test cohort predictions, thresholds, and performance metrics for the four core machine learning safety models.

## Bundle Contents
1. `Arrhythmia_test_predictions.csv` (17,026 samples from 7 held-out MIT-BIH patient records: 102, 103, 200, 210, 213, 217, 220)
2. `Hypotension_test_predictions.csv` (708,755 samples from 35 held-out VitalDB patient cases; 0 blood-pressure target leakage)
3. `Hypoxia_test_predictions.csv` (708,755 samples from 35 held-out VitalDB patient cases)
4. `Tachycardia_test_predictions.csv` (708,755 samples from 35 held-out VitalDB patient cases)
5. `Arrhythmia_threshold.txt`, `Hypotension_threshold.txt`, `Hypoxia_threshold.txt`, `Tachycardia_threshold.txt`
6. `verified_metrics.csv`: Consolidated tabular metrics across all 4 tasks
7. `confusion_matrices.csv`: Exact contingency table counts (TN, FP, FN, TP) for test cohort figures
8. `prediction_export_summary.md`: Detailed protocol, split verification, feature leakage audit, and visualization guide

## Schema of Prediction CSVs
All four prediction files adhere to the strict five-column contract:
- `sample_id` (integer / string): Unique row identifier within the evaluation cohort.
- `group_id` (string / integer): Subject / Record / Case ID preventing intra-subject data leakage.
- `y_true` (integer {0, 1}): Ground truth binary clinical label.
- `y_score` (float [0.0, 1.0]): Unthresholded predicted probability / confidence score from the trained model.
- `y_pred` (integer {0, 1}): Binary classification output determined at the stated operational threshold (`y_score >= threshold`).

## Re-generating Figures (Python snippet)
```python
import pandas as pd
from sklearn.metrics import roc_curve, precision_recall_curve, confusion_matrix

df = pd.read_csv("Hypotension_test_predictions.csv")
fpr, tpr, _ = roc_curve(df["y_true"], df["y_score"])
precision, recall, _ = precision_recall_curve(df["y_true"], df["y_score"])
cm = confusion_matrix(df["y_true"], df["y_pred"])
```
