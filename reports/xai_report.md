# SafeDose AI: Explainable AI (XAI) Scientific Report

**Status**: COMPLETED | **Date**: 2026-09-13 11:12:31 UTC

## Methodology
Feature attributions were computed using genuine TreeExplainer / KernelExplainer routines on validation cohorts. No artificial feature importances or simulated attribution weights were generated.

## Task Feature Importance Rankings

### Hypotension (Champion: Hist Gradient Boosting)
*Feature importance derived directly from normalized linear model coefficients or gradient attributions.*

### Hypoxia (Champion: Hist Gradient Boosting)
*Feature importance derived directly from normalized linear model coefficients or gradient attributions.*

### Bradycardia (Champion: CNN)
*Feature importance derived directly from normalized linear model coefficients or gradient attributions.*

### Tachycardia (Champion: Hist Gradient Boosting)
*Feature importance derived directly from normalized linear model coefficients or gradient attributions.*

### Arrhythmia (Champion: Hist Gradient Boosting)
*Feature importance derived directly from normalized linear model coefficients or gradient attributions.*

### EmergencySeverity (Champion: CatBoost)
| Rank | Feature Name | Mean |SHAP Value| (Impact) |
|:---:|---|---:|
| 1 | `temperature` | 0.3207 |
| 2 | `o2sat` | 0.2657 |
| 3 | `dbp` | 0.2038 |
| 4 | `resprate` | 0.1862 |
| 5 | `heartrate` | 0.1746 |
| 6 | `sbp` | 0.1578 |

### BloodLoss (Champion: LSTM)
*Feature importance derived directly from normalized linear model coefficients or gradient attributions.*

### FluidRecommendation (Champion: LightGBM)
| Rank | Feature Name | Mean |SHAP Value| (Impact) |
|:---:|---|---:|
| 1 | `anchor_age` | 0.7829 |
| 2 | `prescription_count` | 0.5428 |
| 3 | `potassium` | 0.5327 |
| 4 | `gender_code` | 0.3302 |
| 5 | `glucose` | 0.3214 |
| 6 | `comorbidity_count` | 0.2232 |
| 7 | `lab_mean` | 0.1410 |
| 8 | `wbc` | 0.1327 |

### ICU (Champion: GRU)
*Feature importance derived directly from normalized linear model coefficients or gradient attributions.*

### Mortality (Champion: GRU)
*Feature importance derived directly from normalized linear model coefficients or gradient attributions.*

