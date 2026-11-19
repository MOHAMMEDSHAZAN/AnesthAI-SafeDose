# Dataset Descriptions & Preprocessing Protocol

## 1. Zero Forward Leakage Protocol
Across all surgical and physiologic datasets, data partitioning was executed strictly at the patient level:
\mathcal{P}_{\text{train}} \cap \mathcal{P}_{\text{val}} = \emptyset, \quad \mathcal{P}_{\text{train}} \cap \mathcal{P}_{\text{test}} = \emptyset, \quad \mathcal{P}_{\text{val}} \cap \mathcal{P}_{\text{test}} = \emptyset
Zero data points, running statistics, or model scalers from test cases were ever observed during model fitting.

## 2. VitalDB Intraoperative Telemetry
- **Source:** Seoul National University Hospital open surgical registry.
- **Experimental Cohort:** 235 surgical procedures with non-invasive and arterial blood pressure monitoring.
- **Split:** 165 cases train (\%$, seed 42), 35 cases validation (\%$), 35 cases test (\%$).
- **Features:** Backward-looking rolling 5-minute statistical windows ( - 300\text{s}$ to $).
- **Test Size:** ,755$ 1-second continuous telemetry frames.

## 3. MIT-BIH Arrhythmia Database
- **Source:** PhysioNet MIT-BIH Arrhythmia benchmark (48 half-hour 2-lead ECG records).
- **Partitioning:** Patient/record-grouped division ensuring patient-specific QRS morphologies are never shared between training and testing.
- **Revalidated Test Size:** Exactly ,026$ beats (,202$ true normal, ,981$ false arrhythmia, $ missed arrhythmia, ,376$ detected arrhythmia).
