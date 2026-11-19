# System Architecture & Technical Specifications

## 1. High-Level Architecture Overview
AnesthAI SafeDose is engineered as a decoupled, multi-tier clinical safety and decision-support platform:
- **Presentation Layer:** Single Page Application (SPA) built with React 18, TypeScript, and Vite.
- **Application & API Layer:** High-performance asynchronous REST API powered by FastAPI (Python).
- **Clinical Calculation Engine:** Pure deterministic algorithmic unit executing verified physiological formulas (Holliday-Segar, Nadler EBV, ATLS hemorrhage stages, Janmahasatian LBM).
- **Machine Learning Inference Subsystem:** Serialized gradient-boosted decision trees and ensemble classifiers (LightGBM, Random Forest) evaluating retrospective physiological feature windows.
- **Persistence & Audit Layer:** Structured relational storage (PostgreSQL/Supabase) capturing immutable event logs, clinician alert acknowledgments, and break-glass overrides.

## 2. Separation of Deterministic Algorithms vs. Statistical ML
A core design tenet of AnesthAI SafeDose is the strict boundary between deterministic physiological rules and empirical statistical machine learning:
1. **Critical Clinical Dosages & Fluid Balances:**
   Calculated strictly through deterministic equations. Machine learning models are **never** permitted to generate continuous drug doses or fluid rates autonomously.
2. **Predictive Anomaly Detection:**
   Machine learning is employed strictly for binary risk classification and advance warning (e.g., predicting impending hypotension, tachycardia, or cardiac arrhythmia within backward-looking telemetry windows).
3. **Advisory Human-in-the-Loop Safeguards:**
   All alerts and recommendations require affirmative physician verification before administration.
