import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']

fig, ax = plt.subplots(figsize=(10.5, 6.8), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

def draw_box(ax, x, y, w, h, title, subtitle='', items=None, bg='#f8fafc', border='#334155', title_color='#0f172a', rx=1.5):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle=f'round,pad=0.4,rounding_size={rx}',
                                 facecolor=bg, edgecolor=border, linewidth=1.2)
    ax.add_patch(rect)
    
    if title:
        ax.text(x + w/2, y + h - 2.8, title, ha='center', va='center', fontsize=9.5, fontweight='bold', color=title_color)
    if subtitle:
        ax.text(x + w/2, y + h - 5.2, subtitle, ha='center', va='center', fontsize=8.0, fontstyle='italic', color='#475569')
        
    if items:
        start_y = y + h - (6.8 if subtitle else 4.8)
        line_spacing = (h - (8.5 if subtitle else 6.5)) / max(len(items), 1)
        for idx, itm in enumerate(items):
            cur_y = start_y - idx * line_spacing - 1.0
            ax.text(x + 2.0, cur_y, itm, ha='left', va='center', fontsize=7.6, color='#1e293b')

def draw_arrow(ax, x1, y1, x2, y2, color='#334155', lw=1.5):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw, shrinkA=2, shrinkB=2, mutation_scale=12))

# Title of the figure
ax.text(50, 98.2, 'Anesth AI Current System Architecture', ha='center', va='center', fontsize=12, fontweight='bold', color='#0f172a')

# Row 1: Clinical Data Sources
draw_box(ax, 2, 85, 96, 10.5, '1. CLINICAL INPUTS & BENCHMARK REPOSITORIES', 
         items=[
             '- Preoperative: Patient Demographics, Measured Weight, Height, Airway (Mallampati), Comorbidities, Lab Panels',
             '- Intraoperative Telemetry (VitalDB): High-frequency Arterial Pressures (SBP, DBP, MAP), HR, SpO2, EtCO2, Temp',
             '- Electrophysiology (MIT-BIH): Dual-channel ECG waveforms (360 Hz)   |   Inpatient EHR (MIMIC-IV / ED): Labs, Fluids, Hemorrhage'
         ], bg='#f1f5f9', border='#64748b', title_color='#1e293b')

draw_arrow(ax, 50, 85, 50, 80.5)

# Row 2: Frontend & Backend
draw_box(ax, 2, 70.5, 46.5, 10.0, '2. CLINICAL WEB INTERFACE (React 19 + Vite 8)',
         items=[
             '- Responsive Dashboards: Preoperative, Dose Calculator, Live OT Telemetry, PACU',
             '- Real-Time Interactive Telemetry Streaming, Risk Visualizations, Emergency Portal'
         ], bg='#eff6ff', border='#3b82f6', title_color='#1d4ed8')

draw_box(ax, 51.5, 70.5, 46.5, 10.0, '3. FASTAPI / PYTHON BACKEND SERVICE',
         items=[
             '- Asynchronous REST API, Sub-50ms Inference Orchestration, Error Handling',
             '- Pydantic Schema Validation, Data Normalization, Secure Endpoint Routing'
         ], bg='#eff6ff', border='#3b82f6', title_color='#1d4ed8')

draw_arrow(ax, 48.5, 75.5, 51.5, 75.5)
draw_arrow(ax, 50, 70.5, 50, 66.0)

# Row 3: Processing & Preprocessing
draw_box(ax, 2, 57.0, 96, 9.0, '4. CLINICAL PROCESSING & LEAKAGE-PREVENTION PIPELINE',
         items=[
             '- Train-Only Imputation & Scalers   - Pan-Tompkins QRS Complex Alignment (360-sample windows)',
             '- 5-Minute Backward Rolling Windows [t-300s, t] (Lookahead Purged)   - Target-Defining Predictors Permanently Removed'
         ], bg='#f0fdf4', border='#16a34a', title_color='#15803d')

draw_arrow(ax, 26, 57.0, 26, 52.5)
draw_arrow(ax, 74, 57.0, 74, 52.5)

# Row 4: Two core pillars: (A) 10 Production Models & (B) Deterministic Engines
draw_box(ax, 2, 23.0, 47.5, 30.0, '5A. ML MODEL REGISTRY (10 PRODUCTION TASKS)',
         subtitle='Frozen Held-Out Evaluation (Zero Leakage Protocol)',
         items=[
             '1. Hypotension Prediction (VitalDB): HistGradientBoosting (AUROC: 0.6974)',
             '2. Hypoxia Prediction (VitalDB): HistGradientBoosting (AUROC: 0.9047)',
             '3. Bradycardia Detection (VitalDB): ClinicalCNN 1D-CNN (AUROC: 0.6448)',
             '4. Tachycardia Prediction (VitalDB): HistGradientBoosting (AUROC: 0.6980)',
             '5. Arrhythmia Detection (MIT-BIH): LightGBM (AUROC: 0.9414, PR-AUC: 0.9494)',
             '6. Emergency Severity (MIMIC-IV-ED): CatBoost (Sensitivity: 78.78%)',
             '7. Surgical Blood Loss (MIMIC-IV): ClinicalLSTM (AUROC: 0.8349)',
             '8. Fluid Bolus Recommendation (MIMIC-IV): LightGBM (AUROC: 0.8687)',
             '9. ICU Admission Requirement (MIMIC-IV): ClinicalGRU (AUROC: 0.8814)',
             '10. In-Hospital Mortality Risk (MIMIC-IV): ClinicalGRU (AUROC: 0.8663)',
             '- Explainable AI (XAI): SHAP Tree & Deep Attribution Interpretability'
         ], bg='#fefce8', border='#ca8a04', title_color='#854d0e')

draw_box(ax, 50.5, 23.0, 47.5, 30.0, '5B. DETERMINISTIC PHYSIOLOGICAL ENGINES',
         subtitle='Authoritative Physiological Formulations & Safety Rule Checks',
         items=[
             '- Parameter-Based Anesthesia Dose Calculation Engine:',
             '   * Total Body Weight (TBW) & Body Mass Index (BMI = W / H^2)',
             '   * Janmahasatian Lean Body Mass (LBM) for Males & Females',
             '   * Geriatric (>=65 yr) Clearance Scaling & Organ Failure Risk Gatekeeping',
             '- Deterministic Physiological Fluid Calculation Engine:',
             '   * Holliday-Segar Maintenance Reference Rate: 4-2-1 Rule [mL/hr]',
             '   * Cumulative Input (Fin) = Crystalloids + Colloids + Blood Products',
             '   * Cumulative Loss (Floss) = Blood Loss + Urine Output + Drains',
             '   * Net Fluid Balance = Fin - Floss   |   Normalized Balance [mL/kg]',
             '   * Urine Output Rate [mL/kg/hr] & KDIGO Oliguria Screening (<0.5 mL/kg/hr)',
             '   * Estimated Blood Volume (EBV) & ATLS Class I-IV Hemorrhage Shock'
         ], bg='#fdf2f8', border='#db2777', title_color='#9d174d')

draw_arrow(ax, 26, 23.0, 48, 19.5)
draw_arrow(ax, 74, 23.0, 52, 19.5)

# Row 5: Decision Support & Clinician Review
draw_box(ax, 2, 9.5, 96, 9.5, '6. HUMAN-IN-THE-LOOP CLINICAL DECISION SUPPORT & GOVERNANCE',
         items=[
             '- Nominal Status: \"Monitoring status: No configured alerts currently triggered.\" (Unqualified declarations prohibited)',
             '- Clinician Review Gate: Attending Confirmation Required | No Autonomous Prescribing, Titration, or Ventilator Alteration',
             '- Clinician-Confirmed ASA Physical Status (ASA I-VI + E)   - WHO Checklists: Pre-Induction (21 items) & Sign-Out (12 items)'
         ], bg='#faf5ff', border='#9333ea', title_color='#6b21a8')

draw_arrow(ax, 50, 9.5, 50, 6.8)

# Row 6: Security & Audit
draw_box(ax, 2, 0.8, 96, 5.5, '7. SECURITY, ROLE-BASED ACCESS CONTROL (RBAC) & EMERGENCY BREAK-GLASS AUDITING',
         items=[
             '- Centralized RBAC (6 Clinical Roles)   - Audited Emergency Break-Glass (Mandatory Rationale >=10 chars, Temporary JWT)   - Advisory: 112 / 108'
         ], bg='#f8fafc', border='#475569', title_color='#1e293b')

plt.tight_layout()
os.makedirs('anesth_ai_ieee/figures_polished', exist_ok=True)
out_fig1 = 'anesth_ai_ieee/figures_polished/fig1_architecture.png'
plt.savefig(out_fig1, dpi=300, bbox_inches='tight')
plt.close()
print('SUCCESS: Generated correct Fig. 1 at', out_fig1)
