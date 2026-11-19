import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os
import shutil

def generate_fig1():
    plt.rcParams['font.family'] = 'serif'
    plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif', 'Nimbus Roman No9 L']

    fig, ax = plt.subplots(figsize=(11.0, 7.8), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    def draw_box(x, y, w, h, title, subtitle='', items=None, bg='#ffffff', border='#334155', 
                 title_color='#0f172a', title_bg='#f1f5f9', rx=1.2, item_fontsize=6.6):
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle=f'round,pad=0.0,rounding_size={rx}',
                                     facecolor=bg, edgecolor=border, linewidth=1.1)
        ax.add_patch(rect)
        
        header_h = 3.2 if not subtitle else 4.2
        header_rect = patches.FancyBboxPatch((x, y + h - header_h), w, header_h, 
                                             boxstyle=f'round,pad=0.0,rounding_size={rx}',
                                             facecolor=title_bg, edgecolor=border, linewidth=1.0)
        ax.add_patch(header_rect)
        
        title_y = y + h - (1.6 if not subtitle else 1.5)
        ax.text(x + w/2, title_y, title, ha='center', va='center', fontsize=8.3, fontweight='bold', color=title_color)
        if subtitle:
            ax.text(x + w/2, y + h - 3.1, subtitle, ha='center', va='center', fontsize=6.8, fontstyle='italic', color='#475569')
            
        if items:
            avail_h = h - header_h - 1.2
            top_y = y + h - header_h - 0.8
            n = len(items)
            dy = avail_h / n
            for idx, itm in enumerate(items):
                cur_y = top_y - (idx + 0.5) * dy
                if isinstance(itm, tuple):
                    txt, is_bold, col = itm
                    weight = 'bold' if is_bold else 'normal'
                    ax.text(x + 2.0, cur_y, txt, ha='left', va='center', fontsize=item_fontsize, fontweight=weight, color=col)
                else:
                    ax.text(x + 2.0, cur_y, itm, ha='left', va='center', fontsize=item_fontsize, color='#1e293b')

    def draw_arrow(x1, y1, x2, y2, color='#334155', lw=1.3):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=color, lw=lw, shrinkA=1, shrinkB=2, mutation_scale=9))

    # ROW 1: CLINICAL DATA SOURCES (Y: 89.8 - 99.2, H: 9.4)
    draw_box(1.5, 89.8, 97.0, 9.4, 
             '1. CLINICAL DATA SOURCES & BENCHMARK REPOSITORIES [VERIFIED DATASETS]', 
             items=[
                 '• VitalDB: 235 surgical study cases (6,388 registry cases) / 708,755 test seconds (High-resolution telemetry: arterial BP, HR, SpO2, EtCO2)',
                 '• MIT-BIH Arrhythmia Database: 48 records / 109,494 authentic beats (Dual-channel ambulatory Holter ECG sampled at 360 Hz)',
                 '• MIMIC-IV-ED v2.2: 425,087 emergency encounters   |   • MIMIC-IV In-Hospital v3.1: 299,712 clinical hospital admissions'
             ], bg='#f8fafc', border='#64748b', title_color='#1e293b', title_bg='#e2e8f0', item_fontsize=6.6)

    draw_arrow(50, 89.8, 50, 87.8)

    # ROW 2: DATA ACQUISITION & PREPROCESSING (Y: 79.0 - 87.8, H: 8.8)
    draw_box(1.5, 79.0, 97.0, 8.8,
             '2. DATA ACQUISITION & RIGOROUS PREPROCESSING PIPELINE [VERIFIED IMPLEMENTATION]',
             items=[
                 '• Artifact Rejection & Sensor Dropout Cleaning   • Train-Only Median Imputation & Feature Normalization (StandardScaler)',
                 '• Pan-Tompkins QRS Alignment & Beat Segmentation (360 samples)   • Sequential Padding & Masking (seq_len=24 for EHR trajectories)',
                 '• Zero-Leakage Grouped Partitioning (70/15/15 by caseid / subject_id / record_id: Zero Patient Overlap)   • Target Feature Purging'
             ], bg='#f0fdf4', border='#16a34a', title_color='#15803d', title_bg='#dcfce7', item_fontsize=6.6)

    draw_arrow(50, 79.0, 50, 77.0)

    # ROW 3: CLINICAL FEATURE PROCESSING (Y: 68.2 - 77.0, H: 8.8)
    draw_box(1.5, 68.2, 97.0, 8.8,
             '3. CLINICAL FEATURE PROCESSING & TEMPORAL WINDOW EXTRACTION [VERIFIED IMPLEMENTATION]',
             items=[
                 '• Patient Habitus & Demographics: Measured Weight, Height, Calculated BMI, Janmahasatian LBM, Biological Sex, Age (Geriatric Scaling ≥65 yr)',
                 '• Dynamic Physiological Telemetry: 5-Minute Backward Rolling Windows [t-300s, t] (Mean, Std, Min, Max, Slope of SBP, DBP, MAP, HR, SpO2, EtCO2)',
                 '• Surgical & Inpatient Trajectory: Cumulative Fluids, Urine Output, Blood Loss, Preoperative Labs, Comorbidities, and ASA Physical Status'
             ], bg='#eff6ff', border='#2563eb', title_color='#1d4ed8', title_bg='#dbeafe', item_fontsize=6.6)

    draw_arrow(25.5, 68.2, 25.5, 66.2)
    draw_arrow(74.5, 68.2, 74.5, 66.2)

    # ROW 4: TWO CORE PILLARS (Y: 33.0 - 66.2, H: 33.2)
    # Left: 4. ML Prediction Engine (Width: 48.0)
    draw_box(1.5, 33.0, 48.0, 33.2,
             '4. MACHINE LEARNING PREDICTION ENGINE',
             subtitle='Ten Operational Benchmark Tasks & Explicitly Labeled Experimental Placeholders',
             items=[
                 ('1. Hypotension (VitalDB): LightGBM (tau=0.500, ROC-AUC: 0.6927, PR: 0.4818) [Verified Champion]', True, '#1e293b'),
                 ('2. Hypoxia (VitalDB): HistGradientBoosting (tau=0.825, ROC-AUC: 0.9047, PR: 0.3745) [Verified]', True, '#1e293b'),
                 ('3. Bradycardia (VitalDB): ClinicalCNN 1D-CNN (tau=0.600, ROC-AUC: 0.6448, PR: 0.1770) [Verified]', True, '#1e293b'),
                 ('4. Tachycardia (VitalDB): HistGradientBoosting (tau=0.250, ROC-AUC: 0.6980, PR: 0.2396) [Verified]', True, '#1e293b'),
                 ('5. Arrhythmia (MIT-BIH): LightGBM (tau=0.220, ROC-AUC: 0.9414, PR: 0.9494) [Verified Champion]', True, '#047857'),
                 ('6. Emergency Severity (MIMIC-IV-ED): CatBoost (tau=0.325, Sensitivity: 78.78%) [Verified]', True, '#1e293b'),
                 ('7. Surgical Blood Loss (MIMIC-IV): ClinicalLSTM (tau=0.525, ROC-AUC: 0.8349) [Verified]', True, '#1e293b'),
                 ('8. Fluid Recommendation (MIMIC-IV): LightGBM (tau=0.525, ROC-AUC: 0.8687) [Verified]', True, '#1e293b'),
                 ('9. ICU Admission (MIMIC-IV): ClinicalGRU (tau=0.425, ROC-AUC: 0.8814) [Verified]', True, '#1e293b'),
                 ('10. In-Hospital Mortality (MIMIC-IV): ClinicalGRU (tau=0.900, ROC-AUC: 0.8663) [Verified]', True, '#1e293b'),
                 ('[DEMONSTRATION ONLY: Excluded Experimental Endpoints (Airway, PONV, PACU, DrugSafety)', False, '#b91c1c'),
                 (' return HTTP 503 Service Unavailable and are strictly excluded from validated ML benchmarks]', False, '#b91c1c')
             ], bg='#fffbeb', border='#d97706', title_color='#b45309', title_bg='#fef3c7', rx=1.2, item_fontsize=6.3)

    # Right Upper: 5. Clinical Decision Support Layer (Y: 50.0 - 66.2, H: 16.2)
    draw_box(51.0, 50.0, 47.5, 16.2,
             '5. CLINICAL DECISION-SUPPORT LAYER [VERIFIED IMPLEMENTATION]',
             subtitle='Advisory Risk Guidance & Explainability (Human-in-the-Loop)',
             items=[
                 '• Model-Estimated Probabilities & Multi-Level Alert Severity Mapping',
                 '• Explainable AI (TreeSHAP Local Feature Attribution Vectors)',
                 '• Alert Semantics: Nominal \"Monitoring status: No configured alerts currently triggered\"',
                 '• Mandatory Clinician Review: Acknowledgment or Override with Reason Log',
                 '• Transparent Advisory Guidance (Strictly No Autonomous Treatment Actions)'
             ], bg='#faf5ff', border='#9333ea', title_color='#7e22ce', title_bg='#f3e8ff', rx=1.2, item_fontsize=6.5)

    draw_arrow(74.5, 50.0, 74.5, 48.0)

    # Right Lower: 6. Clinical Calculation & Safety Modules (Y: 33.0 - 48.0, H: 15.0)
    draw_box(51.0, 33.0, 47.5, 15.0,
             '6. CLINICAL CALCULATION & SAFETY MODULES [VERIFIED IMPLEMENTATION]',
             subtitle='Deterministic Physiological Formulations & Safety Rule Checks',
             items=[
                 '• Anesthesia Dose Support: Total Body Weight (TBW), BMI, Janmahasatian LBM',
                 '• Clinician-Confirmed ASA Physical Status: ASA I–VI with Emergency Modifier \"E\"',
                 '• Deterministic Physiological Fluid Engine (Decoupled from Statistical ML):',
                 '   * Holliday-Segar Maintenance Rate (4-2-1 Rule: mL/hr basal reference)',
                 '   * Cumulative Inputs (Fin), Measured Losses (Floss), Net Balance (Fin - Floss)',
                 '   * Urine Output Rate (mL/kg/hr), EBV (70/65 mL/kg), ATLS Class I–IV Hemorrhage',
                 '• Checklists: WHO Pre-Induction (21 items) & WHO Surgical Sign-Out (12 items)'
             ], bg='#fdf2f8', border='#db2777', title_color='#be185d', title_bg='#fce7f3', rx=1.2, item_fontsize=6.3)

    draw_arrow(25.5, 33.0, 25.5, 31.0)
    draw_arrow(74.5, 33.0, 74.5, 31.0)

    # ROW 5: BACKEND, INTERFACE, & SECURITY (Y: 17.5 - 31.0, H: 13.5)
    draw_box(1.5, 17.5, 31.0, 13.5,
             '7. FASTAPI BACKEND & API [VERIFIED]',
             items=[
                 '• FastAPI / Python Microservice',
                 '• Asynchronous Non-Blocking IO',
                 '• Strict Pydantic Schema Validation',
                 '• Frozen ML Model Inference',
                 '• Deterministic Calculation Services',
                 '• Structured JSON API Endpoints'
             ], bg='#f8fafc', border='#475569', title_color='#334155', title_bg='#e2e8f0', item_fontsize=6.5)

    draw_box(34.0, 17.5, 34.0, 13.5,
             '8. ANESTH AI CLINICAL UI [MIXED]',
             items=[
                 '• React 19, TypeScript, Vite 8 [Verified]',
                 '• Preop Intake & Planner [Verified]',
                 '• Anesthesia Dose Calculator [Verified]',
                 '• PACU Recovery & Checklist [Verified]',
                 ('• Live OT Telemetry: Simulated Playback Demo', False, '#b45309'),
                 ('• Biometric / SSO Login: Demonstration UI', False, '#b45309')
             ], bg='#eff6ff', border='#3b82f6', title_color='#1d4ed8', title_bg='#dbeafe', item_fontsize=6.5)

    draw_box(69.5, 17.5, 29.0, 13.5,
             '9. SECURITY & AUDIT [MIXED]',
             items=[
                 '• Role-Based Access Control [Verified]',
                 '• Clinician Authentication & JWT [Verified]',
                 '• Emergency Break-Glass [Verified]',
                 '• Mandatory Audit Rationale [Verified]',
                 ('• Emergency Dispatch: Advisory Contacts Only', False, '#b45309'),
                 ('  (112/108 advisory display - no auto-dispatch)', False, '#b45309')
             ], bg='#fef2f2', border='#dc2626', title_color='#b91c1c', title_bg='#fee2e2', item_fontsize=6.5)

    draw_arrow(32.5, 24.2, 34.0, 24.2)
    draw_arrow(68.0, 24.2, 69.5, 24.2)

    draw_arrow(17.0, 17.5, 17.0, 14.8)
    draw_arrow(51.0, 17.5, 51.0, 14.8)
    draw_arrow(84.0, 17.5, 84.0, 14.8)

    # ROW 6: CLINICAL OUTPUT & HUMAN-IN-THE-LOOP (Y: 1.5 - 14.8, H: 13.3)
    draw_box(1.5, 1.5, 97.0, 13.3,
             '10. CLINICAL OUTPUT & HUMAN-IN-THE-LOOP GOVERNANCE [STRICT SAFETY BOUNDARY]',
             subtitle='Clinical Decision Support & Verified Attending Medical Authority',
             items=[
                 '• Decision Support Outputs: Model-Estimated Risks, Safety Alert Banners, Dose Suggestions, and Deterministic Fluid Balances',
                 '• Comprehensive Clinical Documentation: Chronological Telemetry Logging, Electronic Anesthesia Record, and PACU Handover Charting',
                 ('CLINICIAN REVIEW & FINAL CLINICAL DECISION AUTHORITY (STRICTLY NO AUTOMATED TREATMENT)', True, '#7e22ce'),
                 ('The system operates in an advisory capacity: Anesth AI does not autonomously administer medications, titrate anesthesia, infuse fluids, or alter ventilators.', False, '#475569')
             ], bg='#faf5ff', border='#7e22ce', title_color='#6b21a8', title_bg='#ede9fe', rx=1.2, item_fontsize=6.8)

    plt.tight_layout()
    os.makedirs('anesth_ai_ieee/figures_polished', exist_ok=True)
    out_fig1 = 'anesth_ai_ieee/figures_polished/fig1_architecture.png'
    out_fig1_sub = 'anesth_ai_ieee/figures_polished/fig1_architecture_submission.png'
    plt.savefig(out_fig1, dpi=300, bbox_inches='tight')
    plt.close()
    shutil.copyfile(out_fig1, out_fig1_sub)
    print('SUCCESS: Re-generated Fig. 1 with clean padding at', out_fig1)

if __name__ == '__main__':
    generate_fig1()
