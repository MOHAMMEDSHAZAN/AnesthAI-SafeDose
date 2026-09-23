import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

def generate_fig1():
    plt.rcParams['font.family'] = 'serif'
    plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif', 'Nimbus Roman No9 L']

    # Dimensions suitable for an IEEE wide figure (10.5 x 7.6 inches, 300 DPI)
    fig, ax = plt.subplots(figsize=(10.5, 7.6), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    def draw_box(x, y, w, h, title, subtitle='', items=None, bg='#ffffff', border='#334155', 
                 title_color='#0f172a', title_bg='#f1f5f9', rx=1.2, item_fontsize=7.2):
        # Outer box
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle=f'round,pad=0.0,rounding_size={rx}',
                                     facecolor=bg, edgecolor=border, linewidth=1.1)
        ax.add_patch(rect)
        
        # Header banner inside box
        header_h = 3.8 if not subtitle else 4.8
        header_rect = patches.FancyBboxPatch((x, y + h - header_h), w, header_h, 
                                             boxstyle=f'round,pad=0.0,rounding_size={rx}',
                                             facecolor=title_bg, edgecolor=border, linewidth=1.0)
        ax.add_patch(header_rect)
        
        # Header text
        title_y = y + h - (1.9 if not subtitle else 1.8)
        ax.text(x + w/2, title_y, title, ha='center', va='center', fontsize=8.6, fontweight='bold', color=title_color)
        if subtitle:
            ax.text(x + w/2, y + h - 3.6, subtitle, ha='center', va='center', fontsize=7.2, fontstyle='italic', color='#475569')
            
        # Items
        if items:
            content_top = y + h - header_h - 1.0
            line_spacing = (content_top - y - 0.5) / max(len(items), 1)
            for idx, itm in enumerate(items):
                cur_y = content_top - (idx + 0.5) * line_spacing
                if isinstance(itm, tuple):
                    # (text, bold_flag, color)
                    txt, is_bold, col = itm
                    weight = 'bold' if is_bold else 'normal'
                    ax.text(x + 1.8, cur_y, txt, ha='left', va='center', fontsize=item_fontsize, fontweight=weight, color=col)
                else:
                    ax.text(x + 1.8, cur_y, itm, ha='left', va='center', fontsize=item_fontsize, color='#1e293b')

    def draw_arrow(x1, y1, x2, y2, color='#334155', lw=1.3):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=color, lw=lw, shrinkA=1, shrinkB=2, mutation_scale=10))

    # =========================================================================
    # ROW 1: 1. CLINICAL DATA SOURCES (Y: 92.5 - 99.5, H: 7.0)
    # =========================================================================
    draw_box(1.5, 92.5, 97.0, 7.0, 
             '1. CLINICAL DATA SOURCES', 
             items=[
                 '• VitalDB: 6,388 surgical cases / 708,755 retrospective windows (High-resolution telemetry: arterial BP, HR, SpO2, EtCO2, CVP)',
                 '• MIT-BIH Arrhythmia Database: 48 records / 109,494 authentic beats (Dual-channel ambulatory Holter ECG sampled at 360 Hz)',
                 '• MIMIC-IV-ED v2.2: 425,087 encounters / 205,504 unique patients   |   • MIMIC-IV In-Hospital v3.1: 299,712 hospital admissions'
             ], bg='#f8fafc', border='#64748b', title_color='#1e293b', title_bg='#e2e8f0', item_fontsize=7.3)

    draw_arrow(50, 92.5, 50, 89.5)

    # =========================================================================
    # ROW 2: 2. DATA ACQUISITION & PREPROCESSING (Y: 82.5 - 89.5, H: 7.0)
    # =========================================================================
    draw_box(1.5, 82.5, 97.0, 7.0,
             '2. DATA ACQUISITION & PREPROCESSING PIPELINE',
             items=[
                 '• Artifact Rejection & Sensor Dropout Cleaning   • Train-Only Median Imputation & Feature Normalization (StandardScaler)',
                 '• Pan-Tompkins QRS Alignment & Beat Segmentation (360 samples)   • Sequential Padding & Masking (seq_len=24 for EHR trajectories)',
                 '• Zero-Leakage Grouped Partitioning (70/15/15 by caseid / subject_id / record_id: Zero Patient Overlap)   • Target Feature Purging'
             ], bg='#f0fdf4', border='#16a34a', title_color='#15803d', title_bg='#dcfce7', item_fontsize=7.3)

    draw_arrow(50, 82.5, 50, 79.5)

    # =========================================================================
    # ROW 3: 3. CLINICAL FEATURE PROCESSING (Y: 72.5 - 79.5, H: 7.0)
    # =========================================================================
    draw_box(1.5, 72.5, 97.0, 7.0,
             '3. CLINICAL FEATURE PROCESSING & TEMPORAL EXTRACTION',
             items=[
                 '• Patient Habitus & Demographics: Measured Weight, Height, Calculated BMI, Janmahasatian LBM, Biological Sex, Age (Geriatric Scaling ≥65 yr)',
                 '• Dynamic Physiological Telemetry: 5-Minute Backward Rolling Windows [t-300s, t] (Mean, Std, Min, Max, Slope of SBP, DBP, MAP, HR, SpO2, EtCO2)',
                 '• Surgical & Inpatient Trajectory: Cumulative Fluids, Urine Output, Blood Loss, Preoperative Labs, Comorbidities, and ASA Physical Status'
             ], bg='#eff6ff', border='#2563eb', title_color='#1d4ed8', title_bg='#dbeafe', item_fontsize=7.3)

    draw_arrow(25.5, 72.5, 25.5, 69.5)
    draw_arrow(74.5, 72.5, 74.5, 69.5)

    # =========================================================================
    # ROW 4: TWO CORE PILLARS (Y: 34.0 - 69.5, H: 35.5)
    # Left: 4. ML PREDICTION ENGINE (Width: 48.0)
    # Right: 5. CLINICAL DECISION SUPPORT & 6. CLINICAL CALCULATION (Width: 47.5)
    # =========================================================================
    
    # Pillar 4: ML Prediction Engine
    draw_box(1.5, 34.0, 48.0, 35.5,
             '4. MACHINE LEARNING PREDICTION ENGINE',
             subtitle='Exactly 10 Production Clinical Prediction Tasks (Frozen Evaluation)',
             items=[
                 ('1. Hypotension Prediction (VitalDB): HistGradientBoosting (ROC-AUC: 0.6974)', True, '#1e293b'),
                 ('2. Hypoxia Prediction (VitalDB): HistGradientBoosting (ROC-AUC: 0.9047)', True, '#1e293b'),
                 ('3. Bradycardia Detection (VitalDB): ClinicalCNN 1D-CNN (ROC-AUC: 0.6448)', True, '#1e293b'),
                 ('4. Tachycardia Prediction (VitalDB): HistGradientBoosting (ROC-AUC: 0.6980)', True, '#1e293b'),
                 ('5. Arrhythmia Detection (MIT-BIH): LightGBM (ROC-AUC: 0.9414, PR: 0.9494)', True, '#047857'),
                 ('6. Emergency Severity (MIMIC-IV-ED): CatBoost (Sensitivity: 78.78%)', True, '#1e293b'),
                 ('7. Surgical Blood Loss (MIMIC-IV): ClinicalLSTM (ROC-AUC: 0.8349)', True, '#1e293b'),
                 ('8. Fluid Recommendation (MIMIC-IV): LightGBM (ROC-AUC: 0.8687)', True, '#1e293b'),
                 ('9. ICU Admission (MIMIC-IV): ClinicalGRU (ROC-AUC: 0.8814)', True, '#1e293b'),
                 ('10. In-Hospital Mortality (MIMIC-IV): ClinicalGRU (ROC-AUC: 0.8663)', True, '#1e293b'),
                 ('• Model Families: HistGradientBoosting, LightGBM, CatBoost, 1D-CNN, LSTM, GRU', False, '#475569'),
                 ('• Training Protocols: Class Weighting, Validation-Only PR Threshold Selection', False, '#475569'),
                 ('• Calibration: Evaluated via Brier Score Across All Tasks (e.g. Arrhythmia: 0.0613)', False, '#475569')
             ], bg='#fffbeb', border='#d97706', title_color='#b45309', title_bg='#fef3c7', rx=1.2, item_fontsize=6.9)

    # Pillar 5: Clinical Decision Support Layer (Upper Right, Y: 52.0 - 69.5, H: 17.5)
    draw_box(51.0, 52.0, 47.5, 17.5,
             '5. CLINICAL DECISION-SUPPORT LAYER',
             subtitle='Advisory Risk Guidance & Explainability (Human-in-the-Loop)',
             items=[
                 '• Model-Estimated Probabilities & Multi-Level Alert Severity Mapping',
                 '• Explainable AI (TreeSHAP Local Feature Attribution Vectors)',
                 '• Alert Semantics: Nominal \"Monitoring status: No configured alerts triggered\"',
                 '• Mandatory Clinician Review: Acknowledgment or Override with Reason Log',
                 '• Transparent Advisory Guidance (Strictly No Autonomous Treatment)'
             ], bg='#faf5ff', border='#9333ea', title_color='#7e22ce', title_bg='#f3e8ff', rx=1.2, item_fontsize=7.0)

    draw_arrow(74.5, 52.0, 74.5, 49.5)

    # Pillar 6: Clinical Calculation & Safety Modules (Lower Right, Y: 34.0 - 49.5, H: 15.5)
    draw_box(51.0, 34.0, 47.5, 15.5,
             '6. CLINICAL CALCULATION & SAFETY MODULES',
             subtitle='Deterministic Physiological Formulations & Safety Rule Checks',
             items=[
                 '• Anesthesia Dose Support: Total Body Weight (TBW), BMI, Janmahasatian LBM',
                 '• Clinician-Confirmed ASA Physical Status: ASA I–VI with Emergency Modifier \"E\"',
                 '• Deterministic Physiological Fluid Engine (Decoupled from ML):',
                 '   * Holliday-Segar Maintenance Rate (4-2-1 Rule: mL/hr basal reference)',
                 '   * Cumulative Inputs (Fin), Measured Losses (Floss), Net Balance (Fin - Floss)',
                 '   * Urine Output Rate (mL/kg/hr), EBV (70/65 mL/kg), ATLS Class I–IV Hemorrhage',
                 '• Checklists: WHO Pre-Induction (21 items) & WHO Surgical Sign-Out (12 items)'
             ], bg='#fdf2f8', border='#db2777', title_color='#be185d', title_bg='#fce7f3', rx=1.2, item_fontsize=6.8)

    draw_arrow(25.5, 34.0, 25.5, 31.0)
    draw_arrow(74.5, 34.0, 74.5, 31.0)

    # =========================================================================
    # ROW 5: BACKEND, INTERFACE, & SECURITY (Y: 17.5 - 31.0, H: 13.5)
    # 7. FastAPI Backend (Width: 31.0)
    # 8. Clinical UI (Width: 34.0)
    # 9. Security & Audit (Width: 30.0)
    # =========================================================================
    
    # 7. FastAPI Backend
    draw_box(1.5, 17.5, 31.0, 13.5,
             '7. FASTAPI BACKEND & API',
             items=[
                 '• FastAPI / Python Microservice',
                 '• Asynchronous Non-Blocking IO',
                 '• Strict Pydantic Schema Validation',
                 '• Frozen ML Model Inference',
                 '• Deterministic Calculation Services',
                 '• Structured JSON API Endpoints'
             ], bg='#f8fafc', border='#475569', title_color='#334155', title_bg='#e2e8f0', item_fontsize=6.9)

    # 8. Clinical UI
    draw_box(34.0, 17.5, 34.0, 13.5,
             '8. ANESTH AI CLINICAL UI',
             items=[
                 '• React 19, TypeScript, Vite 8',
                 '• Clinical Dashboard & Patient Mgmt',
                 '• Preoperative Evaluation & Planner',
                 '• Anesthesia Dose Calculator',
                 '• Live OT Telemetry & Safety Grid',
                 '• PACU Recovery & Emergency Portal'
             ], bg='#eff6ff', border='#3b82f6', title_color='#1d4ed8', title_bg='#dbeafe', item_fontsize=6.9)

    # 9. Security, Access & Audit
    draw_box(69.5, 17.5, 29.0, 13.5,
             '9. SECURITY, ACCESS & AUDIT',
             items=[
                 '• Role-Based Access Control (RBAC)',
                 '• Provider Authentication & JWT',
                 '• Audited Emergency Break-Glass',
                 '• Mandatory Rationale Logging',
                 '• Immutable Event Audit Trail',
                 '• Advisory Contacts: 112 / 108'
             ], bg='#fef2f2', border='#dc2626', title_color='#b91c1c', title_bg='#fee2e2', item_fontsize=6.9)

    # Horizontal connection arrows in Row 5
    draw_arrow(32.5, 24.2, 34.0, 24.2)
    draw_arrow(68.0, 24.2, 69.5, 24.2)

    # Downward arrows from Row 5 to Row 6
    draw_arrow(17.0, 17.5, 17.0, 14.5)
    draw_arrow(51.0, 17.5, 51.0, 14.5)
    draw_arrow(84.0, 17.5, 84.0, 14.5)

    # =========================================================================
    # ROW 6: 10. CLINICAL OUTPUT / HUMAN-IN-THE-LOOP (Y: 1.5 - 14.5, H: 13.0)
    # Emphasizing CLINICIAN REVIEW & CLINICAL DECISION
    # =========================================================================
    draw_box(1.5, 1.5, 97.0, 13.0,
             '10. CLINICAL OUTPUT & HUMAN-IN-THE-LOOP GOVERNANCE',
             subtitle='Clinical Decision Support & Verified Attending Medical Authority',
             items=[
                 '• Decision Support Outputs: Model-Estimated Risks, Safety Alert Banners, Dose Suggestions, and Deterministic Fluid Balances',
                 '• Comprehensive Clinical Documentation: Chronological Telemetry Logging, Electronic Anesthesia Record, and PACU Handover Charting',
                 ('CLINICIAN REVIEW & FINAL CLINICAL DECISION AUTHORITY (STRICTLY NO AUTOMATED TREATMENT)', True, '#7e22ce'),
                 ('The system operates in an advisory capacity: Anesth AI does not autonomously administer medications, titrate anesthesia, infuse fluids, or alter ventilators.', False, '#475569')
             ], bg='#faf5ff', border='#7e22ce', title_color='#6b21a8', title_bg='#ede9fe', rx=1.2, item_fontsize=7.2)

    plt.tight_layout()
    os.makedirs('anesth_ai_ieee/figures_polished', exist_ok=True)
    out_fig1 = 'anesth_ai_ieee/figures_polished/fig1_architecture.png'
    plt.savefig(out_fig1, dpi=300, bbox_inches='tight')
    plt.close()
    print('SUCCESS: Generated correct Fig. 1 at', out_fig1)

if __name__ == '__main__':
    generate_fig1()
