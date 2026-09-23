# SafeDose AI: Explainable AI (XAI) Scientific Report

**Status**: COMPLETED | **Date**: 2026-09-13 06:34:37 UTC

## Methodology
Feature attributions were computed using genuine TreeExplainer / KernelExplainer routines on validation cohorts. No artificial feature importances or simulated attribution weights were generated.

## Task Feature Importance Rankings

### EmergencySeverity (Champion: CatBoost)
| Rank | Feature Name | Mean |SHAP Value| (Impact) |
|:---:|---|---:|
| 1 | `o2sat` | 0.2548 |
| 2 | `resprate` | 0.2082 |
| 3 | `sbp` | 0.1529 |
| 4 | `heartrate` | 0.1515 |
| 5 | `dbp` | 0.0992 |
| 6 | `temperature` | 0.0383 |

