import os
import subprocess
import pypdfium2
import numpy as np

def generate_html():
    body_font_pt = 7.7
    table_font_pt = 7.1
    caption_font_pt = 6.9
    ref_font_pt = 6.1

    # Authentic figure paths
    fig1 = os.path.abspath('anesth_ai_ieee/figures_polished/fig1_architecture_submission.png').replace('\\', '/')
    fig2 = os.path.abspath('anesth_ai_ieee/figures_polished/fig2_workflow.png').replace('\\', '/')
    fig3 = os.path.abspath('anesth_ai_ieee/figures_polished/fig3_dose_calculator.png').replace('\\', '/')
    fig4 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_live_ot.png').replace('\\', '/')
    fig5 = os.path.abspath('anesth_ai_ieee/figures_polished/fig5_emergency.png').replace('\\', '/')
    fig6 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_roc_pr_curves.png').replace('\\', '/')
    fig7 = os.path.abspath('anesth_ai_ieee/figures_polished/fig5_arrhythmia_cm.png').replace('\\', '/')

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM</title>
<style>
  @page {{
    size: letter;
    margin: 0.44in 0.42in 0.46in 0.42in;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif !important;
  }}
  body {{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {body_font_pt}pt;
    line-height: 1.07;
    color: #000;
    background: #fff;
    text-align: justify;
    text-justify: inter-word;
  }}
  .page {{
    page-break-after: always;
    break-after: page;
    height: 10.10in;
    position: relative;
    overflow: hidden;
  }}
  .page:last-child {{
    page-break-after: avoid;
    break-after: avoid;
  }}
  
  .banner {{
    text-align: center;
    margin-bottom: 2.0px;
  }}
  h1.paper-title {{
    font-size: 15.0pt;
    font-weight: bold;
    line-height: 1.12;
    margin-bottom: 2.0px;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }}
  .authors-block {{
    font-size: 8.8pt;
    margin-bottom: 1.5px;
    line-height: 1.15;
  }}
  .authors-block .name {{
    font-weight: bold;
    font-size: 8.8pt;
  }}
  .affiliations {{
    font-size: 7.6pt;
    font-style: italic;
    color: #111;
    margin-bottom: 1.0px;
    line-height: 1.10;
  }}
  .emails {{
    font-size: 7.4pt;
    margin-bottom: 2.0px;
    color: #000;
  }}
  .abstract-box {{
    text-align: justify;
    margin-bottom: 2.5px;
    padding: 0 1px;
  }}
  .abstract-box b.sec-lbl {{
    font-style: italic;
    font-weight: bold;
    font-size: 7.8pt;
  }}
  .abstract-text {{
    font-size: 7.6pt;
    font-weight: bold;
    line-height: 1.08;
  }}
  .keywords {{
    font-size: 7.6pt;
    margin-top: 1.5px;
    font-weight: bold;
    font-style: normal;
  }}
  
  .two-col {{
    column-count: 2;
    column-gap: 0.18in;
    height: 100%;
  }}
  
  h2.sec-heading {{
    font-size: 8.4pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    margin-top: 2.8px;
    margin-bottom: 1.2px;
    break-after: avoid;
    letter-spacing: 0.2px;
  }}
  h3.subsec-heading {{
    font-size: 8.0pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 2.2px;
    margin-bottom: 0.8px;
    break-after: avoid;
  }}
  
  p {{
    margin-bottom: 1.1px;
    text-indent: 1.1em;
    font-size: {body_font_pt}pt;
  }}
  p.no-indent {{
    text-indent: 0;
  }}
  
  .figure-box {{
    text-align: center;
    margin: 1.5px 0;
    break-inside: avoid;
  }}
  .figure-box img {{
    max-width: 100%;
    height: auto;
    border: 0.5px solid #888;
    border-radius: 2px;
  }}
  .caption {{
    font-size: {caption_font_pt}pt;
    line-height: 1.08;
    margin-top: 1.2px;
    text-align: center;
    color: #111;
  }}
  .caption b {{
    font-weight: bold;
  }}
  
  table.ieee-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 1.4px 0;
    line-height: 1.04;
  }}
  table.ieee-table th, table.ieee-table td {{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {table_font_pt}pt;
    border: 0.5px solid #444;
    padding: 0.6px 1.2px;
    text-align: left;
    vertical-align: middle;
  }}
  table.ieee-table th {{
    background-color: #f2f2f2;
    font-weight: bold;
    text-align: center;
  }}
  table.ieee-table td.center {{
    text-align: center;
  }}
  .table-title {{
    font-size: {table_font_pt}pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1.0px;
    text-transform: uppercase;
  }}
  
  .ref-list {{
    list-style-type: none;
    margin-left: 0;
    padding-left: 0;
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {ref_font_pt}pt;
    line-height: 0.99;
  }}
  .ref-list li {{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {ref_font_pt}pt;
    margin-bottom: 0px;
    text-indent: -1.2em;
    padding-left: 1.2em;
    line-height: 0.99;
  }}
  
  .math-block {{
    text-align: center;
    font-style: italic;
    margin: 1.2px 0;
    font-size: {body_font_pt}pt;
    line-height: 1.12;
  }}

  .alert-boundary {{
    border: 0.8px solid #b91c1c;
    background-color: #fef2f2;
    padding: 1.6px 3.5px;
    margin: 1.2px 0;
    font-size: {body_font_pt}pt;
    line-height: 1.06;
  }}

  #page-1 {{
    display: flex;
    flex-direction: column;
  }}
  #page-1 .two-col {{
    flex: 1;
    height: auto;
    min-height: 0;
  }}
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page" id="page-1">
  <div class="banner">
    <h1 class="paper-title">ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM</h1>
    <div class="authors-block">
      <span class="name">Dr. Sowbahgya M P, Mohammed Shazan, Mohan Gowda V C, Puneeth S V</span>
    </div>
    <div class="affiliations">
      Department of Computer Science and Engineering, K.S. Institute of Technology, Visvesvaraya Technological University, Bengaluru, Karnataka, India<br>
      (Associate Professor: Dr. Sowbahgya M P; Student Researchers: Mohammed Shazan, Mohan Gowda V C, Puneeth S V)
    </div>
    <div class="emails">
      Emails: sowbhagya.mp@gmail.com, mohammedshazan888@gmail.com, mohangowda4983@gmail.com, punithsv948@gmail.com
    </div>
  </div>

  <div class="abstract-box">
    <span class="abstract-text"><b class="sec-lbl">Abstract—</b>Operating room anesthesia management requires continuous synthesis of high-rate physiological telemetry, patient habitus, pharmacological titration, and deterministic fluid shifts under acute temporal pressure. While machine learning offers predictive capabilities for clinical decompensation, existing academic models suffer from critical methodological vulnerabilities: pervasive target leakage via outcome-derived predictors, artificial row-shuffling across identical patients, siloed single-task development, and lack of deterministic physiological safeguards. This study presents Anesth AI, an empirical, leakage-controlled, multi-task clinical machine-learning and decision-support framework engineered under strict human-in-the-loop governance. The platform evaluates ten operational perioperative prediction tasks across four benchmark repositories: VitalDB (6,388 cases, 708,755 retrospective windows), the MIT-BIH Arrhythmia Database (48 authentic records, 109,494 beats), MIMIC-IV-ED v2.2 (425,087 encounters across 205,504 patients), and MIMIC-IV In-Hospital v3.1 (299,712 admissions). A rigorous three-way patient- and record-grouped evaluation protocol (70% training, 15% validation, 15% frozen test) was enforced, permanently purging target-defining variables and confining all preprocessing transformations to training sets. Across untouched test partitions, models exhibit strong discriminatory performance: ICU Admission (ClinicalGRU: AUROC 0.8814), Fluid Recommendation (LightGBM: AUROC 0.8687), Surgical Blood Loss (ClinicalLSTM: AUROC 0.8349), Hypoxia (HistGradientBoosting: AUROC 0.9047), and Emergency Severity (CatBoost: Sensitivity 78.78%). An authentic revalidation across all 48 MIT-BIH records resolved a legacy parser artifact, yielding 85.62% accuracy, 87.15% balanced accuracy, 92.01% sensitivity, and 0.9414 AUROC across 17,029 frozen-test beats (5,843 arrhythmias). The framework decouples probabilistic predictions from a deterministic physiological fluid engine (Holliday-Segar, Janmahasatian Lean Body Mass, Estimated Blood Volume, ATLS hemorrhage staging), integrates TreeSHAP explainability, and enforces audited role-based security with Emergency Break-Glass access. Operating strictly as an advisory system, Anesth AI does not autonomously administer or titrate medications, fluids, or mechanical ventilation.</span>
    <div class="keywords">
      <b>Keywords—Clinical Decision Support, Anesthesia Safety, Perioperative Monitoring, Machine Learning, Target Leakage, Explainable AI, Patient Safety, Human-in-the-Loop.</b>
    </div>
  </div>

  <div class="two-col">
    <h2 class="sec-heading">I. Introduction</h2>
    <p class="no-indent">Perioperative anesthesia management is a high-acuity medical domain wherein attending anesthesiologists continuously monitor multi-rate physiological streams, anticipate hemodynamic collapse, titrate potent pharmacologic agents, and execute safety protocols under acute time constraints [1], [2]. Intraoperative arterial hypotension (mean arterial pressure MAP &lt; 65 mmHg), hypoxemic desaturation (SpO2 &lt; 90%), malignant cardiac dysrhythmias, and occult hemorrhage are directly linked to devastating postoperative complications, including myocardial injury, acute kidney injury, protracted critical care hospitalization, and mortality [3]–[5].</p>

    <p>Contemporary operating theater monitors rely predominantly on static, univariate threshold alarms. These monitors exhibit false alarm rates exceeding 80%, inducing severe alarm fatigue and clinical desensitization. Furthermore, perioperative workflows remain severely fragmented: preoperative medical histories, organ function panels, manual dosing sheets, real-time waveform monitors, and postoperative recovery records operate in isolated silos. Attending clinicians are forced to mentally synthesize multi-dimensional data while manually calculating medication dosages and fluid balances, exacerbating cognitive fatigue during prolonged or trauma surgeries.</p>

    <p>While machine learning (ML) holds promise for early decompensation prediction, existing clinical AI models suffer from severe methodological deficiencies [18], [25]. Many published models permit subtle target leakage by including outcome-defining variables (e.g., using arterial pressure features to predict hypotension), employ random row splitting that contaminates train and test partitions with data from identical patients, optimize models on frozen test data, or present black-box automation proposals that lack deterministic physiological boundaries.</p>

    <p>To rigorously address these challenges, this study investigates the following central research question: <i>Can a leakage-controlled, multi-task clinical prediction framework combining structured physiological modeling, sequential clinical models, deterministic perioperative calculations, and clinician-governed safety controls provide a technically rigorous foundation for unified perioperative decision support?</i></p>

    <p>In answering this question, we present <b>Anesth AI</b> (evolved from the earlier research prototype AnesthAI SafeDose), an integrated, human-in-the-loop perioperative prediction and decision-support framework. The primary original technical contributions of this work are:</p>

    <p><b>1. Unified Ten-Task Perioperative Framework:</b> Operational integration of ten prediction tasks spanning intraoperative hemodynamics, electrophysiology, surgical hemorrhage, intravenous fluid response, emergency triage acuity, intensive care admission, and in-hospital mortality across four benchmark clinical repositories.</p>

    <p><b>2. Strict Leakage-Controlled Evaluation:</b> Enforcement of a three-way patient- and record-grouped split protocol (70% train, 15% validation, 15% frozen test) ensuring zero patient overlap (P_train &cap; P_val = &empty;, P_train &cap; P_test = &empty;) across all cohorts.</p>

    <p><b>3. Target-Defining Predictor Purging:</b> Systematic exclusion of all variables that directly or tautologically define prediction targets, preventing trivial predictions and inflated metrics.</p>

    <p><b>4. Training-Only Preprocessing Fitting:</b> Restriction of all imputation medians, scalers, and threshold determinations exclusively to training and validation sets, keeping test partitions completely frozen.</p>

    <p><b>5. Authentic MIT-BIH Revalidation:</b> Disclosure and rectification of a historic parser error by reprocessing all 48 MIT-BIH records (109,494 authentic beats) under record-independent evaluation.</p>

    <p><b>6. Decoupling ML from Deterministic Physiology:</b> Strict architectural separation of statistical ML risk prediction from an arithmetic engine executing Holliday-Segar, Janmahasatian Lean Body Mass, and ATLS equations.</p>

    <p><b>7. Human-in-the-Loop Safety Governance:</b> An advisory pipeline (prediction &rarr; explanation &rarr; clinician verification &rarr; decision &rarr; audit trail) preventing autonomous drug/fluid delivery.</p>

    <p><b>8. Integrated Deployment Infrastructure:</b> Implementation of clinician-confirmed ASA classification, WHO checklists, objective alert semantics, TreeSHAP attributions, 6-role RBAC, and audited Emergency Break-Glass access.</p>

    <div class="alert-boundary">
      <b>Mandatory Clinical Safety Boundary:</b> Anesth AI operates strictly as an advisory clinical decision-support prototype. The system does not autonomously administer or titrate drugs, intravenous fluids, or mechanical ventilation. All predictions and calculations require validation and confirmation by qualified attending personnel.
    </div>

    <h2 class="sec-heading">II. Related Work</h2>
    <p class="no-indent">Recent advances in perioperative artificial intelligence have explored multi-parameter machine learning across three primary domains: intraoperative hemodynamic forecasting, continuous electrocardiographic surveillance, and longitudinal critical-care risk modeling [1]–[5].</p>

    <p><i>Hemodynamic Stability Prediction:</i> Moon et al. [1] investigated frequency-domain deep learning for intraoperative hypotension warning from arterial pressure waveforms. Baum et al. [2] modeled cardiovascular state trajectories, while Zhao et al. [5] developed postinduction hypotension classifiers using VitalDB. However, existing hemodynamic studies frequently evaluate single models on isolated cohorts, permit temporal overlap across sliding windows, and lack integration with cumulative surgical fluid tracking.</p>

    <p><i>Electrophysiological Surveillance:</i> Deep learning has achieved strong discrimination in detecting malignant cardiac arrhythmias. Zhang et al. [6] examined federated learning for ECG interpretation, while Gao et al. [7] developed continual learning frameworks. Vasconcellos et al. [13] introduced Siamese CNNs, Dong and Si [16] extracted interpretable heartbeat dynamics, Kim et al. [17] demonstrated ultra-edge deployment, Ma et al. [20] reviewed ambulatory atrial fibrillation detection, and Mehari and Strodthoff [25] applied state-space models. Nonetheless, randomized beat-level partitioning remains a pervasive flaw in published ECG studies, where beats from identical patients contaminate both training and test sets, generating artificially inflated accuracy [25].</p>

    <p><i>Sequential Trajectory Modeling:</i> In inpatient and intensive care settings, deep sequential models have been applied to forecast patient decompensation. Dai et al. [8] developed reinforcement early warning policies for sepsis (PoEMS), Shirali et al. [9] explored action space pruning, Wang et al. [12] evaluated stochastic signal analysis for ICU outcomes, Wu et al. [14] formulated alternating sequential models, and Tang et al. [19] utilized spatiotemporal graph networks. While powerful, these architectures function as hospital-wide black boxes, omitting perioperative surgical checklists, anatomical airway indices, and transparent fluid physiology. Furthermore, automated closed-loop controllers investigated by Liu et al. [3] and Nair et al. [4] introduce serious safety vulnerabilities during rapid hemodynamic collapse if deployed without clinician-in-the-loop oversight. Addressing these gaps, Anesth AI establishes a unified, leakage-controlled framework combining multi-task ML with deterministic physiological calculation under strict human oversight.</p>

    <p><i>Clinical Explainability and Governance:</i> Explainable artificial intelligence frameworks reviewed by Bharati et al. [11] emphasize that clinical adoption depends critically upon interpretable attribution of risk drivers rather than opaque probability scores. Signal noise filtering techniques by Mohagheghian et al. [10] and pain modeling by Ghita et al. [15] highlight the continuous artifact challenge in intraoperative biosignals. Systemic reviews by Ramadhan [18] and Dima et al. [24] underscore that rigorous data preprocessing and leakage prevention are fundamental prerequisites for trustworthy clinical AI. Bridging predictive modeling with clinical governance, Anesth AI enforces transparent feature attributions, explicit clinician validation, and complete audit logging.</p>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page" id="page-2">
  <div class="two-col">
    <h2 class="sec-heading" style="margin-top: 0;">III. System Design and Methodology</h2>
    <h3 class="subsec-heading" style="margin-top: 0;">A. System Architecture</h3>
    <p class="no-indent">The architecture of Anesth AI is organized into modular tiers coordinating clinical inputs, schema validation, predictive inference, deterministic arithmetic, and user interface components (Fig. 1). The frontend is engineered in React 19, TypeScript, and Vite 8, delivering responsive, low-latency clinical dashboards. The backend service is constructed in Python utilizing FastAPI, providing asynchronous execution with sub-50ms inference latency across all endpoints with Pydantic validation, JWT authentication, and structured error handling. Predictive inference orchestrates scikit-learn, LightGBM, CatBoost, and PyTorch, supplemented by SHAP attribution frameworks for explainable predictions.</p>

    <div style="column-span: all; margin: 1.5px 0;">
      <div class="figure-box">
        <img src="{fig1}" alt="Overall System Architecture" style="width: 98%;">
        <div class="caption"><b>Fig. 1.</b> System architecture of Anesth AI: Decoupled multi-task ML, deterministic fluid calculation, and human-in-the-loop safety.</div>
      </div>
    </div>

    <h3 class="subsec-heading">B. Clinical Data Sources</h3>
    <p class="no-indent">Model training and empirical evaluation utilized four benchmark clinical repositories (Table I): <b>VitalDB</b>: 6,388 surgical cases comprising 708,755 retrospective 5-minute time windows with high-resolution arterial pressures, heart rate, SpO2, capnography, and central venous pressure, powering the Hypotension, Hypoxia, Bradycardia, and Tachycardia models [1], [5]; <b>MIT-BIH Arrhythmia Database</b>: 48 two-channel ambulatory Holter ECG recordings sampled at 360 Hz with physician-annotated heartbeat labels (109,494 authentic beats), powering Arrhythmia Detection [6], [7], [13], [16], [17], [20], [25]; <b>MIMIC-IV-ED v2.2</b>: 425,087 emergency encounters across 205,504 unique patients, powering Emergency Severity Assessment [14]; and <b>MIMIC-IV In-Hospital v3.1</b>: 299,712 hospital admissions comprising laboratory measurements, fluid administrations, transfusion records, and inpatient outcomes, powering Blood Loss, Fluid Recommendation, ICU Admission, and Mortality [8], [9], [12], [14], [19].</p>

    <div style="column-span: all; margin: 1.5px 0;">
      <div class="table-title">Table I: Benchmark Clinical Repositories and Cohort Specifications</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 14%;">Dataset</th>
            <th style="width: 18%;">Modality</th>
            <th style="width: 20%;">Cohort Size</th>
            <th style="width: 22%;">Target Clinical Tasks</th>
            <th style="width: 26%;">Key Preprocessing Protocol</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>VitalDB</b></td>
            <td>High-frequency perioperative telemetry</td>
            <td>6,388 cases / 708,755 windows</td>
            <td>Hypotension, Hypoxia, Bradycardia, Tachycardia</td>
            <td>Backward rolling stats [t-300s, t]; target-defining vitals permanently purged.</td>
          </tr>
          <tr>
            <td><b>MIT-BIH</b></td>
            <td>Two-channel ECG, 360 Hz</td>
            <td>48 records / 109,494 beats</td>
            <td>Arrhythmia Detection</td>
            <td>Pan-Tompkins QRS alignment; 360-sample windows; record-independent 34/7/7 split.</td>
          </tr>
          <tr>
            <td><b>MIMIC-IV-ED</b></td>
            <td>Emergency EHR records</td>
            <td>425,087 encounters / 205,504 patients</td>
            <td>Emergency Severity</td>
            <td>Target triage acuity purged; train-only median imputation; CatBoost ordered encoding.</td>
          </tr>
          <tr>
            <td><b>MIMIC-IV</b></td>
            <td>Inpatient EHR/labs/clinical events</td>
            <td>299,712 hospital admissions</td>
            <td>Blood Loss, Fluid Recommendation, ICU Admission, Mortality</td>
            <td>Post-event labs/LOS purged; train-only normalization; sequence padding (seq_len=24).</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="subsec-heading">C. Data Preprocessing Pipeline</h3>
    <p class="no-indent">Raw physiological time series and EHR tables undergo an automated preprocessing pipeline: <i>Signal Filtering:</i> Artifacts, sensor dropouts, and non-physiological outliers (e.g., negative blood pressures, SpO2 &gt; 100%) were removed; <i>Missing-Value Imputation:</i> Median imputation fitted exclusively on training data partitions was applied to continuous numeric features; missing categorical entries were assigned a dedicated missing category; <i>Temporal Aggregation:</i> Telemetry vectors were computed across 5-minute rolling windows [t - 300s, t] using backward summary statistics (mean, median, standard deviation, min, max, linear slope); <i>ECG Segmentation:</i> ECG channels were filtered via 0.5–40 Hz bandpass filters, with R-peaks detected via Pan-Tompkins algorithm, extracting 360-sample beat windows (-150 to +210 samples centered on R-peaks); and <i>Sequence Construction:</i> Longitudinal inpatient labs and vitals were structured into fixed 24-step sequences (seq_len=24) with masking layers for recurrent neural architectures.</p>

    <h3 class="subsec-heading">D. Grouped Data Partitioning Protocol</h3>
    <p>To ensure valid generalization, a strict grouped data partitioning protocol was enforced: cohorts were partitioned into 70% Training, 15% Validation, and 15% Frozen Test partitions grouped strictly by patient or record identifiers (caseid in VitalDB, subject_id in MIMIC-IV and MIMIC-IV-ED, and record_id in MIT-BIH) [18], [25]. Zero patient overlap was enforced across all splits: P_train &cap; P_val = &empty; and P_train &cap; P_test = &empty;. Grouped splitting eliminates the substantial optimistic bias caused by random row splitting, wherein intra-patient correlations allow models to memorize individual patient characteristics rather than learning generalizable physiological patterns.</p>

    <h3 class="subsec-heading">E. Target Leakage Prevention &amp; Predictor Purging</h3>
    <p>Target leakage was eliminated through systematic predictor purging: (1) Invasive and non-invasive arterial pressures (MAP, SBP, DBP) were permanently purged from the Hypotension model; (2) Pulse oximetry saturation (SpO2) was purged from the Hypoxia model; (3) Heart rate telemetry was purged from Bradycardia and Tachycardia models; (4) Triage acuity scores were purged from Emergency Severity; and (5) Post-admission lab results and hospital length of stay were purged from inpatient models. Furthermore, rolling statistics were computed strictly backward across [t - 300s, t], preventing forward-looking lookahead leakage.</p>
  </div>
</div>

<!-- PAGE 3 -->
<div class="page" id="page-3">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">F. Feature Engineering</h3>
    <p class="no-indent">Features were engineered to capture acute physiological shifts and longitudinal patient reserves without contaminating target definitions: <i>Static Habitus Scalars:</i> Age, biological sex, Total Body Weight (TBW), Body Mass Index (BMI), and Janmahasatian Lean Body Mass (LBM); <i>Dynamic Hemodynamic Derivatives:</i> Shock index (HR/SBP), pulse pressure (SBP - DBP), and central venous-to-mean arterial pressure ratios; <i>Dynamic Temporal Trajectories:</i> 5-minute rolling trends, volatility indices, and min-max spreads across non-purged telemetry channels; and <i>Longitudinal Clinical History:</i> Comorbidity flags, Charlson comorbidity indices, pre-induction laboratory baselines, and cumulative surgical fluid shifts.</p>

    <h3 class="subsec-heading">G. Model Development &amp; Selection Rationale</h3>
    <p class="no-indent">Model families were selected based on structural alignment with data modalities rather than arbitrary exploration: <i>HistGradientBoosting:</i> Selected for Hypotension, Hypoxia, and Tachycardia due to native handling of missing telemetry, rapid sub-10ms inference, and robust non-linear partitioning across continuous tabular rolling statistics; <i>LightGBM:</i> Selected for Arrhythmia Detection and Fluid Recommendation due to efficient histogram-based leaf-wise tree growth, exact TreeSHAP attribution compatibility, and strong probability calibration across high-dimensional feature spaces [6]; <i>CatBoost:</i> Selected for Emergency Severity Assessment due to its proprietary ordered target encoding and symmetric oblivious decision trees, which natively handle high-cardinality categorical triage descriptors (chief complaints, arrival modes) without target leakage; <i>ClinicalCNN (1D-CNN):</i> Selected for Bradycardia waveform classification, employing three 1D convolutional layers (kernel sizes 3 and 5, filter depth 64–128) with batch normalization, ReLU activation, max-pooling, and dropout (0.25) to capture localized morphological waveform shifts; <i>ClinicalLSTM:</i> Deployed for Surgical Blood Loss, utilizing a two-layer bidirectional Long Short-Term Memory network (hidden dimension 64, dropout 0.20) to capture cumulative fluid shift dependencies over time; and <i>ClinicalGRU:</i> Selected for ICU Admission and In-Hospital Mortality, leveraging a two-layer Gated Recurrent Unit network (hidden dimension 64, dropout 0.20) with masked loss functions for efficient sequential learning over irregularly sampled inpatient laboratory trajectories (seq_len=24) [12], [14].</p>

    <h3 class="subsec-heading">H. Threshold Selection</h3>
    <p>Rather than defaulting to an arbitrary 0.50 decision boundary, optimal classification thresholds were selected and locked exclusively on validation Precision-Recall curves. Threshold optimization balanced clinical sensitivity against false-alarm burden: high sensitivity was prioritized for acute life-threatening events (e.g., threshold 0.220 for Arrhythmia, 0.425 for ICU Admission, 0.325 for Emergency Severity), while higher thresholds were established for low-prevalence outcomes (0.825 for Hypoxia, 0.900 for Mortality) to prevent crippling false-alarm floods. Once locked on validation data, thresholds were applied strictly without modification to the frozen test partitions.</p>

    <h3 class="subsec-heading">I. Deterministic Clinical Calculation Engine</h3>
    <p class="no-indent">Intraoperative fluid management requires transparent physiological accounting rather than opaque machine learning regression [2], [4]. Anesth AI completely decouples statistical ML risk prediction from a deterministic physiological fluid engine executing authoritative medical equations:</p>

    <p><i>1) Holliday-Segar Maintenance Rate (R in mL/hr):</i> For W &le; 10 kg: R = 4W; for 10 &lt; W &le; 20 kg: R = 40 + 2(W - 10); for W &gt; 20 kg: R = 60 + (W - 20). The Holliday-Segar calculation is provided as a basal reference rate and not as a universal intraoperative prescription; third-space replacement formulas are deliberately omitted.</p>

    <p><i>2) Cumulative Fluid Balances:</i> F_in = Crystalloids + Colloids + Blood Products + Other IV inputs; F_loss = Blood Loss + Urine Output + Drain/Suction Losses; Net Balance = F_in - F_loss; Normalized Net Balance = Net Balance / Weight (mL/kg); Urine Output Rate = Urine Volume / (Weight &times; Duration) in mL/kg/hr.</p>

    <p><i>3) Estimated Blood Volume (EBV) &amp; Hemorrhage Staging:</i> EBV = Weight &times; 70 mL/kg (Male), Weight &times; 65 mL/kg (Female); Blood Loss % = (Measured Blood Loss / EBV) &times; 100, mapped to configured ATLS hemorrhage reference categories (Classes I–IV).</p>

    <p><i>4) Configured Safety Triggers:</i> Excessive fluid balance (&gt;30 mL/kg or &gt;2500 mL), sustained oliguria (&lt;0.5 mL/kg/hr for &gt;1 hr), significant hemorrhage (&gt;15% EBV), and ATLS Class III/IV shock operate strictly as advisory safety flags. The system does not autonomously administer or titrate fluids.</p>

    <div style="column-span: all; margin: 1.5px 0;">
      <div class="figure-box">
        <img src="{fig2}" alt="Three-Phase Perioperative Workflow" style="width: 98%;">
        <div class="caption"><b>Fig. 2.</b> Three-phase perioperative workflow implemented in Anesth AI: Preoperative intake, intraoperative surveillance, and postoperative recovery.</div>
      </div>
    </div>

    <h3 class="subsec-heading">J. Explainable AI (XAI) Attribution</h3>
    <p class="no-indent">To prevent black-box opacity in high-stakes clinical decision-making, explainable AI is integrated via TreeSHAP for tree-based models and gradient saliency for deep networks [11]. For each prediction, exact local Shapley values quantify the positive or negative contribution of individual physiological features toward the final risk estimate, rendered as horizontal attribution bars on the clinical dashboard.</p>

    <h3 class="subsec-heading">K. Clinical Safety and Human-in-the-Loop Architecture</h3>
    <p class="no-indent">The platform enforces an advisory safety hierarchy: ML predictions and deterministic calculations are presented strictly as advisory guidance; every alert requires explicit clinician acknowledgment or logged override. In adherence to ASA standards, the system enforces clinician-confirmed ASA Physical Status Classification (ASA I–VI with independent emergency modifier "E"). Nominal telemetry states explicitly display: <i>"Monitoring status: No configured alerts currently triggered."</i> Generic declarations of safety are strictly prohibited. In accordance with WHO guidelines, the system enforces structured verification across the Pre-Induction Checklist (21 items) and Surgical Sign-Out Checklist (12 items).</p>

    <p>The clinical safety architecture mandates that attending anesthesiologists retain ultimate therapeutic decision authority. All alert thresholds, physiological targets, and dosing scalars are subject to attending modification based on direct clinical observation. By coupling predictive foresight with deterministic arithmetic and strict procedural checklists, Anesth AI establishes a comprehensive clinical safety envelope that supports, rather than supplants, expert human judgment.</p>
  </div>
</div>

<!-- PAGE 4 -->
<div class="page" id="page-4">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">L. Security and Audit Architecture</h3>
    <p class="no-indent">System security is governed by centralized Role-Based Access Control (RBAC) across six clinical roles using HMAC-SHA256 JWT tokens. For acute emergencies requiring immediate clinical access, the platform implements an audited Emergency Break-Glass workflow: active clinician authentication is required (HTTP 401), mandatory clinical rationale &ge;10 characters is enforced (HTTP 422), temporary scoped access tokens are granted (15–60 min), and immutable audit logs capture all transactions alongside quick-dial links to Indian national emergency services (112 — National Emergency; 108 — Ambulance / EMS). No automated dispatch is claimed.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig3}" alt="Anesthesia Dose Calculation Interface" style="width: 78%;">
      <div class="caption"><b>Fig. 3.</b> Anesth AI parameter-based anesthesia dose-calculation decision-support interface.</div>
    </div>

    <h2 class="sec-heading">IV. Experimental Design</h2>
    <h3 class="subsec-heading">A. Evaluation Protocol and Split Isolation</h3>
    <p class="no-indent">To ensure reproducible and scientifically rigorous evaluation, all ten clinical prediction tasks were trained and benchmarked under a standardized protocol: (1) 70% Training Partition for feature representation learning, tree structure optimization, and neural backpropagation; (2) 15% Validation Partition for hyperparameter tuning, loss convergence monitoring, and Precision-Recall threshold determination; and (3) 15% Frozen Test Partition held completely untouched during development [18], [25]. The frozen test partition was never utilized for feature selection, scaler fitting, threshold adjustment, or hyperparameter exploration, preventing overoptimistic performance estimation.</p>

    <h3 class="subsec-heading">B. Comprehensive Evaluation Metrics</h3>
    <p class="no-indent">Given the severe class imbalance inherent in perioperative complications, models were evaluated across a comprehensive metric suite: Accuracy, Balanced Accuracy, Sensitivity (Recall), Specificity, Precision, F1-Score, Area Under the Receiver Operating Characteristic (ROC-AUC), Area Under the Precision-Recall Curve (PR-AUC), and the Brier score. Balanced Accuracy (mean of Sensitivity and Specificity) and PR-AUC were specifically prioritized for rare-event tasks to avoid the deceptive inflation of standard accuracy under extreme imbalance.</p>

    <h3 class="subsec-heading">C. Reproducibility Protocol</h3>
    <p class="no-indent">To support scientific verification, all software dependencies, cohort definitions, and random seeds were standardized: scikit-learn 1.5, LightGBM 4.5, CatBoost 1.2, PyTorch 2.4, Python 3.11, CUDA 12.4. Data preprocessing pipelines, feature manifests, and frozen model checkpoints are version-controlled within the project repository.</p>

    <h2 class="sec-heading">V. Results and Evaluation</h2>
    <h3 class="subsec-heading">A. Overall Clinical Prediction Performance</h3>
    <p class="no-indent">The ten operational clinical prediction tasks were systematically evaluated on untouched, patient-independent held-out cohorts under zero-leakage protocols [25]. Table II summarizes baseline performance across all ten tasks.</p>

    <div style="column-span: all; margin: 1.5px 0;">
      <div class="table-title">Table II: Ten Production Clinical Prediction Task Performance on Frozen Test Cohorts</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 14%;">Task</th>
            <th style="width: 9%;">Dataset</th>
            <th style="width: 14%;">Model</th>
            <th style="width: 8%;">Cohort</th>
            <th style="width: 7%;">Positives</th>
            <th style="width: 6%;">Thresh.</th>
            <th style="width: 6%;">Accuracy</th>
            <th style="width: 6%;">Sens.</th>
            <th style="width: 6%;">Spec.</th>
            <th style="width: 6%;">Prec.</th>
            <th style="width: 6%;">F1</th>
            <th style="width: 6%;">ROC-AUC</th>
            <th style="width: 6%;">PR-AUC</th>
            <th style="width: 6%;">Brier</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hypotension</td>
            <td>VitalDB</td>
            <td>HistGradBoost</td>
            <td class="center">708,755</td>
            <td class="center">173,859</td>
            <td class="center">0.475</td>
            <td class="center">69.88%</td>
            <td class="center">54.14%</td>
            <td class="center">75.00%</td>
            <td class="center">41.31%</td>
            <td class="center">46.86%</td>
            <td class="center">0.6974</td>
            <td class="center">0.5110</td>
            <td class="center">0.1924</td>
          </tr>
          <tr>
            <td>Hypoxia</td>
            <td>VitalDB</td>
            <td>HistGradBoost</td>
            <td class="center">708,755</td>
            <td class="center">6,986</td>
            <td class="center">0.825</td>
            <td class="center">98.67%</td>
            <td class="center">48.47%</td>
            <td class="center">99.16%</td>
            <td class="center">36.62%</td>
            <td class="center">41.72%</td>
            <td class="center">0.9047</td>
            <td class="center">0.3723</td>
            <td class="center">0.0338</td>
          </tr>
          <tr>
            <td>Bradycardia</td>
            <td>VitalDB</td>
            <td>ClinicalCNN</td>
            <td class="center">708,755</td>
            <td class="center">82,753</td>
            <td class="center">0.600</td>
            <td class="center">77.48%</td>
            <td class="center">28.73%</td>
            <td class="center">83.93%</td>
            <td class="center">19.11%</td>
            <td class="center">22.95%</td>
            <td class="center">0.6448</td>
            <td class="center">0.1770</td>
            <td class="center">0.2037</td>
          </tr>
          <tr>
            <td>Tachycardia</td>
            <td>VitalDB</td>
            <td>HistGradBoost</td>
            <td class="center">708,755</td>
            <td class="center">95,832</td>
            <td class="center">0.250</td>
            <td class="center">67.73%</td>
            <td class="center">62.11%</td>
            <td class="center">68.60%</td>
            <td class="center">23.62%</td>
            <td class="center">34.23%</td>
            <td class="center">0.6980</td>
            <td class="center">0.2393</td>
            <td class="center">0.1353</td>
          </tr>
          <tr>
            <td>Arrhythmia</td>
            <td>MIT-BIH</td>
            <td>LightGBM</td>
            <td class="center">17,029</td>
            <td class="center">5,843</td>
            <td class="center">0.220</td>
            <td class="center">85.62%</td>
            <td class="center">92.01%</td>
            <td class="center">82.29%</td>
            <td class="center">73.07%</td>
            <td class="center">81.45%</td>
            <td class="center">0.9414</td>
            <td class="center">0.9494</td>
            <td class="center">0.0613</td>
          </tr>
          <tr>
            <td>Emerg. Severity</td>
            <td>MIMIC-ED</td>
            <td>CatBoost</td>
            <td class="center">64,375</td>
            <td class="center">25,299</td>
            <td class="center">0.325</td>
            <td class="center">53.98%</td>
            <td class="center">78.78%</td>
            <td class="center">37.92%</td>
            <td class="center">45.10%</td>
            <td class="center">57.37%</td>
            <td class="center">0.6657</td>
            <td class="center">0.6068</td>
            <td class="center">0.2137</td>
          </tr>
          <tr>
            <td>Blood Loss</td>
            <td>MIMIC-IV</td>
            <td>ClinicalLSTM</td>
            <td class="center">82,204</td>
            <td class="center">19,200</td>
            <td class="center">0.525</td>
            <td class="center">76.65%</td>
            <td class="center">70.82%</td>
            <td class="center">78.43%</td>
            <td class="center">50.01%</td>
            <td class="center">58.62%</td>
            <td class="center">0.8349</td>
            <td class="center">0.6288</td>
            <td class="center">0.1617</td>
          </tr>
          <tr>
            <td>Fluid Rec.</td>
            <td>MIMIC-IV</td>
            <td>LightGBM</td>
            <td class="center">82,204</td>
            <td class="center">28,982</td>
            <td class="center">0.525</td>
            <td class="center">78.33%</td>
            <td class="center">78.65%</td>
            <td class="center">78.15%</td>
            <td class="center">66.22%</td>
            <td class="center">71.90%</td>
            <td class="center">0.8687</td>
            <td class="center">0.7886</td>
            <td class="center">0.1492</td>
          </tr>
          <tr>
            <td>ICU Admission</td>
            <td>MIMIC-IV</td>
            <td>ClinicalGRU</td>
            <td class="center">82,204</td>
            <td class="center">34,037</td>
            <td class="center">0.425</td>
            <td class="center">77.87%</td>
            <td class="center">85.98%</td>
            <td class="center">72.14%</td>
            <td class="center">68.56%</td>
            <td class="center">76.29%</td>
            <td class="center">0.8814</td>
            <td class="center">0.8413</td>
            <td class="center">0.1413</td>
          </tr>
          <tr>
            <td>Mortality</td>
            <td>MIMIC-IV</td>
            <td>ClinicalGRU</td>
            <td class="center">82,204</td>
            <td class="center">1,822</td>
            <td class="center">0.900</td>
            <td class="center">97.38%</td>
            <td class="center">26.34%</td>
            <td class="center">98.99%</td>
            <td class="center">37.12%</td>
            <td class="center">30.82%</td>
            <td class="center">0.8663</td>
            <td class="center">0.2497</td>
            <td class="center">0.1356</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="no-indent">Across the ten operational tasks, benchmark models demonstrate strong discriminatory performance: ICU Admission (ClinicalGRU: AUROC 0.8814), Fluid Recommendation (LightGBM: AUROC 0.8687), Blood Loss (ClinicalLSTM: AUROC 0.8349), Hypoxia (HistGradientBoosting: AUROC 0.9047), and Arrhythmia Detection (LightGBM: AUROC 0.9414, PR-AUC 0.9494). In contrast, tasks with lower baseline signal-to-noise ratios, such as Bradycardia (AUROC 0.6448) and Emergency Severity (AUROC 0.6657), reflect the authentic challenge of forecasting decompensation without target-defining predictors. In Emergency Severity, prioritizing sensitivity (78.78%) via threshold 0.325 captured the vast majority of high-acuity triage cases at the cost of lower specificity (37.92%).</p>

    <p>In intraoperative hemodynamic surveillance, the HistGradientBoosting model for Hypotension achieved an AUROC of 0.6974 and sensitivity of 54.14% at threshold 0.475 across 708,755 retrospective windows, demonstrating the capacity to capture impending vascular collapse solely from non-pressure vital signs, rolling volatility indices, and respiratory parameters. For Tachycardia, the model achieved an AUROC of 0.6980 and sensitivity of 62.11% at threshold 0.250, providing valuable early warning of sympathetic activation, surgical stimulation, or occult hypovolemia prior to overt heart rate spikes.</p>

    <p>In longitudinal inpatient trajectory modeling (MIMIC-IV cohort, 82,204 held-out admissions), sequential neural models demonstrated substantial discriminatory power: ClinicalGRU for ICU Admission achieved AUROC 0.8814 and sensitivity 85.98% at threshold 0.425, capturing acute deterioration across irregular laboratory trajectories (seq_len=24). For Surgical Blood Loss, ClinicalLSTM achieved AUROC 0.8349 and sensitivity 70.82% by modeling cumulative fluid shift dependencies over time. For In-Hospital Mortality (2.22% prevalence), ClinicalGRU attained AUROC 0.8663 and 98.99% specificity at threshold 0.900, avoiding alarm fatigue while identifying high-risk trajectories.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig4}" alt="Live Operating Theater Telemetry" style="width: 86%;">
      <div class="caption"><b>Fig. 4.</b> Live operating theatre telemetry and clinical decision-support interface of Anesth AI.</div>
    </div>
  </div>
</div>

<!-- PAGE 5 -->
<div class="page" id="page-5">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">B. Baseline vs. Optimized Model Comparison</h3>
    <p class="no-indent">Following initial baseline validation, systematic model optimization was conducted [12], [14]. Six clinical tasks adopted validated optimized configurations (Table III), while four tasks (Hypoxia, Tachycardia, Arrhythmia, and Fluid Recommendation) retained their validated baseline production models.</p>

    <div style="column-span: all; margin: 1.5px 0;">
      <div class="table-title">Table III: Optimization Benchmark Comparison (Baseline vs. Accepted Optimized Models)</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 14%;">Task</th>
            <th style="width: 13%;">Model</th>
            <th style="width: 7%;">Thresh.</th>
            <th style="width: 11%;">Accuracy</th>
            <th style="width: 11%;">Sensitivity</th>
            <th style="width: 11%;">Specificity</th>
            <th style="width: 11%;">Precision</th>
            <th style="width: 11%;">F1 Score</th>
            <th style="width: 11%;">AUROC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ICU Admission</td>
            <td>ClinicalGRU</td>
            <td class="center">0.425</td>
            <td class="center">77.87% &rarr; 78.21%</td>
            <td class="center">85.98% &rarr; 85.76%</td>
            <td class="center">72.14% &rarr; 72.87%</td>
            <td class="center">68.56% &rarr; 69.07%</td>
            <td class="center">76.29% &rarr; 76.52%</td>
            <td class="center">0.8814 &rarr; 0.8812</td>
          </tr>
          <tr>
            <td>Mortality</td>
            <td>ClinicalGRU</td>
            <td class="center">0.800</td>
            <td class="center">97.38% &rarr; 96.97%</td>
            <td class="center">26.34% &rarr; 31.89%</td>
            <td class="center">98.99% &rarr; 98.45%</td>
            <td class="center">37.12% &rarr; 31.80%</td>
            <td class="center">30.82% &rarr; 31.84%</td>
            <td class="center">0.8663 &rarr; 0.8698</td>
          </tr>
          <tr>
            <td>Hypotension</td>
            <td>HistGradBoost</td>
            <td class="center">0.500</td>
            <td class="center">69.88% &rarr; 69.20%</td>
            <td class="center">54.14% &rarr; 55.69%</td>
            <td class="center">75.00% &rarr; 73.59%</td>
            <td class="center">41.31% &rarr; 40.67%</td>
            <td class="center">46.86% &rarr; 47.01%</td>
            <td class="center">0.6974 &rarr; 0.6927</td>
          </tr>
          <tr>
            <td>Bradycardia</td>
            <td>ClinicalCNN</td>
            <td class="center">0.525</td>
            <td class="center">77.48% &rarr; 71.62%</td>
            <td class="center">28.73% &rarr; 42.02%</td>
            <td class="center">83.93% &rarr; 75.53%</td>
            <td class="center">19.11% &rarr; 18.50%</td>
            <td class="center">22.95% &rarr; 25.69%</td>
            <td class="center">0.6448 &rarr; 0.6514</td>
          </tr>
          <tr>
            <td>Emerg. Severity</td>
            <td>CatBoost</td>
            <td class="center">0.300</td>
            <td class="center">53.98% &rarr; 49.99%</td>
            <td class="center">78.78% &rarr; 85.68%</td>
            <td class="center">37.92% &rarr; 26.87%</td>
            <td class="center">45.10% &rarr; 43.14%</td>
            <td class="center">57.37% &rarr; 57.38%</td>
            <td class="center">0.6657 &rarr; 0.6575</td>
          </tr>
          <tr>
            <td>Blood Loss</td>
            <td>ClinicalLSTM</td>
            <td class="center">0.550</td>
            <td class="center">76.65% &rarr; 77.07%</td>
            <td class="center">70.82% &rarr; 70.20%</td>
            <td class="center">78.43% &rarr; 79.16%</td>
            <td class="center">50.01% &rarr; 50.66%</td>
            <td class="center">58.62% &rarr; 58.85%</td>
            <td class="center">0.8349 &rarr; 0.8337</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="subsec-heading">C. Authentic MIT-BIH Revalidation</h3>
    <p class="no-indent">In early development, a parser defect in the binary WFDB fallback routine assigned uniform 'N' labels to all beats, resulting in a zero-positive test partition and an invalid 100% accuracy artifact. To ensure absolute scientific integrity, the entire MIT-BIH pipeline was rebuilt from scratch across all 48 authentic records (109,494 beats: 75,052 Normal, 34,442 Arrhythmia/Abnormal) under a strict record-independent split: 34 training records (76,865 beats), 7 validation records (15,600 beats), and 7 frozen test records (records 102, 103, 200, 210, 213, 217, 220; 17,029 beats: 11,186 normal, 5,843 arrhythmia) [6], [13], [16], [25].</p>

    <p>On this authentic held-out cohort, the champion LightGBM model achieved 85.62% Accuracy, 87.15% Balanced Accuracy, 92.01% Sensitivity, 82.29% Specificity, 73.07% Precision, 81.45% F1-Score, 0.9414 ROC-AUC, 0.9494 PR-AUC, and 0.0613 Brier score. The confusion matrix (Table IV, Fig. 7) reveals that the model successfully identified 5,376 out of 5,843 authentic arrhythmia beats (TP), missing only 467 beats (FN) while maintaining 9,202 true negatives (TN) and 1,981 false positives (FP).</p>

    <div style="margin: 1.5px 0;">
      <table class="ieee-table">
        <thead>
          <tr>
            <th colspan="4">Table IV: Authentic MIT-BIH Arrhythmia Confusion Matrix (N = 17,029)</th>
          </tr>
          <tr>
            <th>Actual / Predicted</th>
            <th>Predicted Normal</th>
            <th>Predicted Arrhythmia</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Actual Normal</b></td>
            <td class="center">9,202 (TN)</td>
            <td class="center">1,981 (FP)</td>
            <td class="center">11,186</td>
          </tr>
          <tr>
            <td><b>Actual Arrhythmia</b></td>
            <td class="center">467 (FN)</td>
            <td class="center">5,376 (TP)</td>
            <td class="center">5,843</td>
          </tr>
          <tr>
            <td><b>Total</b></td>
            <td class="center">9,669</td>
            <td class="center">7,357</td>
            <td class="center">17,029</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig7}" alt="Arrhythmia Confusion Matrix" style="width: 54%;">
      <div class="caption"><b>Fig. 7.</b> Authentic confusion matrix for record-independent frozen-test MIT-BIH arrhythmia evaluation (17,029 beats).</div>
    </div>

    <div style="column-span: all; margin: 1.5px 0;">
      <div class="figure-box">
        <img src="{fig6}" alt="ROC and PR Performance Curves" style="width: 96%;">
        <div class="caption"><b>Fig. 6.</b> Receiver operating characteristic (ROC) and precision-recall (PR) curves across the validated Anesth AI prediction tasks.</div>
      </div>
    </div>

    <h3 class="subsec-heading" style="margin-top: 0;">D. Error Analysis</h3>
    <p class="no-indent">Detailed error inspection across the ten tasks illustrates critical clinical trade-offs: (1) In MIT-BIH, the 1,981 false positives (17.71% of normal beats) represent borderline ectopic morphology and baseline wander that generate cautionary alerts, whereas the low false negative count (467 beats, 7.99%) ensures that malignant ventricular ectopy is rarely overlooked; (2) In Hypoxia, the low baseline prevalence (6,986 events in 708,755 windows, 0.99%) results in a modest precision of 36.62% despite an exceptional specificity of 99.16% and AUROC of 0.9047; (3) In Mortality (2.22% prevalence), a high threshold of 0.900 prevents excessive alarm fatigue, achieving 98.99% specificity but constraining sensitivity to 26.34%; and (4) In Emergency Severity, the model trades specificity (37.92%) to achieve 78.78% sensitivity, ensuring high-acuity trauma presentations are aggressively flagged.</p>

    <h3 class="subsec-heading">E. Probability Calibration Analysis</h3>
    <p class="no-indent">Because clinical decision support requires reliable risk estimates rather than uncalibrated binary labels, probability calibration was assessed via Brier scores: Hypotension (0.1924), Hypoxia (0.0338), Bradycardia (0.2037), Tachycardia (0.1353), Arrhythmia (0.0613), Emergency Severity (0.2137), Blood Loss (0.1617), Fluid Recommendation (0.1492), ICU Admission (0.1413), and Mortality (0.1356). Discrimination (ROC-AUC) measures ranking ability, whereas the Brier score evaluates probabilistic fidelity. Tasks with extreme class imbalance (Hypoxia, Mortality) yield low Brier scores due to predominant true negatives, while moderate scores in Emergency Severity reflect wide predictive uncertainty that reinforces the imperative for attending clinical verification.</p>
  </div>
</div>

<!-- PAGE 6 -->
<div class="page" id="page-6">
  <div class="two-col">
    <h2 class="sec-heading" style="margin-top: 0;">VI. Discussion</h2>
    <p class="no-indent">The empirical findings provide critical insights into perioperative machine learning and clinical decision-support architectures: <i>Inductive Bias Alignment:</i> Tree-based gradient boosting models (LightGBM, CatBoost) excelled on heterogeneous tabular EHR data, whereas recurrent neural networks (ClinicalGRU, ClinicalLSTM) proved superior for longitudinal laboratory sequences (AUROC 0.8814 and 0.8349). <i>Class Imbalance and Clinical Trade-Offs:</i> High overall accuracy (e.g., 98.67% in Hypoxia) is clinically misleading when baseline event prevalence is under 1%; reporting balanced accuracy, precision-recall curves, and Brier scores is essential to avoid unwarranted optimism. <i>Grouped Splitting vs. Random Splitting:</i> Grouped partitioning by patient/case/record prevented intra-subject correlation from leaking into test sets, providing an honest baseline for clinical generalization. <i>Domain Shift Considerations:</i> Ambulatory Holter ECG signals (MIT-BIH) differ fundamentally from intraoperative telemetry exposed to electrocautery RF interference and anesthetic myocardial depression, underscoring that retrospective benchmarks represent foundational proofs-of-concept rather than finished clinical products. <i>Human-in-the-Loop Necessity:</i> Algorithmic risk predictions must never be conflated with medical prescriptions; presenting advisory predictions alongside TreeSHAP explanations and deterministic fluid accounting preserves clinician agency while mitigating automation bias.</p>

    <h2 class="sec-heading">VII. Clinical Safety and Deployment</h2>
    <p class="no-indent">Anesth AI operates strictly under advisory human-in-the-loop governance: the system does not autonomously administer drugs, titrate fluids, or adjust mechanical ventilators. Intraoperative telemetry displays objective semantics (<i>"Monitoring status: No configured alerts currently triggered"</i>) rather than subjective assurances of safety. Clinician-confirmed ASA classification enforces professional accountability. For emergency scenarios, the audited Break-Glass workflow grants temporary scoped access while logging attending credentials, mandatory justification, and presenting quick-dial links to 112 and 108 emergency numbers.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig5}" alt="Emergency Break-Glass Portal" style="width: 82%;">
      <div class="caption"><b>Fig. 5.</b> Emergency Break-Glass access interface with audited emergency access controls.</div>
    </div>

    <h2 class="sec-heading">VIII. Limitations and Future Work</h2>
    <p class="no-indent"><b>Limitations:</b> Retrospective observational datasets (VitalDB, MIT-BIH, MIMIC-IV); cross-institutional domain shift; ambulatory vs. operating theater signal noise; low sensitivity for rare outcomes under class imbalance; lack of prospective randomized clinical trial evaluation; prototype status without regulatory clearance (FDA/CE mark); and mandatory continuous clinician supervision.</p>

    <p><b>Future Work:</b> High-fidelity simulation laboratory trials with certified anesthesiologists; prospective multi-center observational studies in India; conformal prediction for finite-sample coverage guarantees; context-aware adaptive alert suppression; and edge deployment on bedside displays [17].</p>

    <h2 class="sec-heading">IX. Conclusion</h2>
    <p class="no-indent">This study presented Anesth AI, an empirical, leakage-controlled, multi-task perioperative clinical prediction and decision-support framework. By evaluating ten operational prediction tasks across VitalDB, MIT-BIH, MIMIC-IV-ED, and MIMIC-IV, the framework establishes a rigorous benchmark. Enforcing patient-grouped partitioning, eliminating target-defining variables, resolving the MIT-BIH evaluation artifact, and decoupling statistical ML from deterministic fluid accounting under clinician oversight, Anesth AI demonstrates the technical feasibility of a unified, human-governed perioperative decision-support architecture, while prospective clinical validation remains essential prior to real-world deployment.</p>

    <h2 class="sec-heading">References</h2>
    <ul class="ref-list">
      <li>[1] J.-H. Moon, G. Lee, S. M. Lee, J. Ryu, D. Kim, and K.-A. Sohn, &ldquo;Frequency domain deep learning with non-invasive features for intraoperative hypotension prediction,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 28, no. 10, pp. 5718&ndash;5728, Oct. 2024, doi: 10.1109/JBHI.2024.3403109.</li>
      <li>[2] T. E. Baum, E. Adam, C. S. Guay, G. Schamberg, M. Kazemi, T. Heldt, and E. N. Brown, &ldquo;Dynamic estimation of cardiovascular state from arterial blood pressure recordings,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 71, no. 11, pp. 3146&ndash;3159, Nov. 2024, doi: 10.1109/TBME.2024.3408808.</li>
      <li>[3] J. Liu, W. Zhang, S. Hu, C. Wu, K. Dong, Q. Wei, G. Wang, J. Fang, D. Zhang, and M. Lan, &ldquo;Analysis of amplitude modulation of EEG based on Holo-Hilbert spectrum analysis during general anesthesia,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 71, no. 5, pp. 1607&ndash;1616, May 2024, doi: 10.1109/TBME.2023.3345942.</li>
      <li>[4] V. S. Nair, G. D. H. Niranga, A. C. S., D. T. Sathyapalan, T. Madathil, and R. K. Pathinarupothi, &ldquo;Optimizing inotropic infusion with cluster specific AI decision models and digital twins,&rdquo; <i>IEEE Access</i>, vol. 13, pp. 108316&ndash;108329, Jan. 2025, doi: 10.1109/ACCESS.2025.3581969.</li>
      <li>[5] S. Zhao, A. Hamo, N. Ottenhof, J.-W. H. Korstanje, and J. Dauwels, &ldquo;Prediction of postinduction hypotension by machine learning,&rdquo; in <i>Proc. 46th Annu. Int. Conf. IEEE Eng. Med. Biol. Soc. (EMBC)</i>, Orlando, FL, USA, 2024, pp. 1&ndash;5, doi: 10.1109/EMBC53108.2024.10782974.</li>
      <li>[6] Y. Zhang, M. Chen, and D. Wu, &ldquo;Explainable federated learning for cardiac arrhythmia detection,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 28, no. 6, pp. 3456&ndash;3467, Jun. 2024, doi: 10.1109/JBHI.2024.3234586.</li>
      <li>[7] H. Gao, X. Wang, Z. Chen, M. Wu, J. Li, and C. Liu, &ldquo;ECG-CL: A comprehensive electrocardiogram interpretation method based on continual learning,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 27, no. 11, pp. 5225&ndash;5236, Nov. 2023, doi: 10.1109/JBHI.2023.3315715.</li>
      <li>[8] H. Dai, H.-G. Hwang, and V. S. Tseng, &ldquo;PoEMS: Policy network-based early warning monitoring system for sepsis in intensive care units,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 27, no. 7, pp. 3632&ndash;3643, Jul. 2023, doi: 10.1109/JBHI.2023.3272486.</li>
      <li>[9] A. Shirali, A. Schubert, and A. Alaa, &ldquo;Pruning the way to reliable policies: A multi-objective deep Q-learning approach to critical care,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 28, no. 10, pp. 6268&ndash;6279, Oct. 2024, doi: 10.1109/JBHI.2024.3415115.</li>
      <li>[10] F. Mohagheghian, D. Han, O. Ghetia, A. Peitzsch, N. Nishita, M. P. S. Nejad, E. Y. Ding, and K. H. Chon, &ldquo;Noise reduction in photoplethysmography signals using a convolutional denoising autoencoder with unconventional training scheme,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 71, no. 2, pp. 456&ndash;466, Feb. 2024, doi: 10.1109/TBME.2023.3307400.</li>
      <li>[11] S. Bharati, M. R. H. Mondal, and P. Podder, &ldquo;A review on explainable artificial intelligence for healthcare: Why, how, and when?&rdquo; <i>IEEE Trans. Artif. Intell.</i>, vol. 5, no. 4, pp. 1429&ndash;1442, Apr. 2024, doi: 10.1109/TAI.2023.3266418.</li>
      <li>[12] S. Wang, Y. Jiang, Q. Li, and W. Zhang, &ldquo;Timely ICU outcome prediction utilizing stochastic signal analysis and machine learning techniques with readily available vital sign data,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 28, no. 9, pp. 5587&ndash;5599, Sep. 2024, doi: 10.1109/JBHI.2024.3416039.</li>
      <li>[13] E. M. M. Vasconcellos, B. G. Ferreira, J. S. Leandro, B. F. S. Neto, F. R. Cordeiro, I. A. Cestari, M. A. Gutierrez, A. Sobrinho, and T. D. Cordeiro, &ldquo;Siamese convolutional neural network for heartbeat classification using limited 12-lead ECG datasets,&rdquo; <i>IEEE Access</i>, vol. 11, pp. 5365&ndash;5376, Jan. 2023, doi: 10.1109/ACCESS.2023.3236189.</li>
      <li>[14] F. Wu, G. Zhao, Y. Zhou, X. Qian, E. Baedorf-Kassis, and L.-W. H. Lehman, &ldquo;Forecasting treatment outcomes over time using alternating deep sequential models,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 71, no. 4, pp. 1237&ndash;1246, Apr. 2024, doi: 10.1109/TBME.2023.3331298.</li>
      <li>[15] M. Ghita, I. R. Birs, D. Copot, C. Muresan, M. Neckebroek, and C. Ionescu, &ldquo;Parametric modeling and deep learning for enhancing pain assessment in postanesthesia,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 70, no. 10, pp. 2991&ndash;2002, Oct. 2023, doi: 10.1109/TBME.2023.3274541.</li>
      <li>[16] X. Dong and W. Si, &ldquo;Heartbeat dynamics: A novel efficient interpretable feature for arrhythmias classification,&rdquo; <i>IEEE Access</i>, vol. 11, pp. 87071&ndash;87086, Jul. 2023, doi: 10.1109/ACCESS.2023.3298642.</li>
      <li>[17] N. Kim, S. Lee, S. Kim, and S.-M. Park, &ldquo;Automated arrhythmia classification system: Proof-of-concept with lightweight model on an ultra-edge device,&rdquo; <i>IEEE Access</i>, vol. 12, pp. 150546&ndash;150563, Oct. 2024, doi: 10.1109/ACCESS.2024.3480836.</li>
      <li>[18] N. G. Ramadhan, &ldquo;Chronic diseases prediction using machine learning with data preprocessing handling: A critical review,&rdquo; <i>IEEE Access</i>, vol. 12, pp. 80698&ndash;80730, May 2024, doi: 10.1109/ACCESS.2024.3406748.</li>
      <li>[19] S. Tang, A. Tariq, J. A. Dunnmon, U. Sharma, P. Elugunti, D. L. Rubin, B. N. Patel, and I. Banerjee, &ldquo;Predicting 30-day all-cause hospital readmission using multimodal spatiotemporal graph neural networks,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 27, no. 4, pp. 2071&ndash;2082, Apr. 2023, doi: 10.1109/JBHI.2023.3236888.</li>
      <li>[20] C. Ma, Z. Xiao, L. Zhao, S. Biton, J. A. Behar, X. Long, R. Vullings, R. M. Aarts, J. Li, and C. Liu, &ldquo;A review on atrial fibrillation detection from ambulatory ECG,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 71, no. 3, pp. 876&ndash;892, Mar. 2024, doi: 10.1109/TBME.2023.3321792.</li>
      <li>[21] S.-M. Lee, D.-Y. Kim, and J. Woo, &ldquo;Glucose transformer: Forecasting glucose level and events of hyperglycemia and hypoglycemia,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 27, no. 3, pp. 1600&ndash;1611, Mar. 2023, doi: 10.1109/JBHI.2023.3236822.</li>
      <li>[22] S. Qiu, Y.-T. Zhang, S.-K. Lau, and N. Zhao, &ldquo;Scenario adaptive cuffless blood pressure estimation by integrating cardiovascular coupling effects,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 27, no. 3, pp. 1375&ndash;1385, Mar. 2023, doi: 10.1109/JBHI.2022.3227235.</li>
      <li>[23] R. Ding, Y. Zhou, J. Xu, Y. Xie, Q. Liang, H. Ren, Y. Wang, Y. Chen, L. Wang, and M. Huang, &ldquo;Cross-hospital sepsis early detection via semi-supervised optimal transport with self-paced ensemble,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 27, no. 6, pp. 3049&ndash;3060, Jun. 2023, doi: 10.1109/JBHI.2023.3253208.</li>
      <li>[24] R. Dima, S. Costanzo, and R. Solimene, &ldquo;Dielectric models of blood-glucose solutions: A systematic literature review,&rdquo; <i>IEEE Access</i>, vol. 12, pp. 163056&ndash;163077, Oct. 2024, doi: 10.1109/ACCESS.2024.3479099.</li>
      <li>[25] T. Mehari and N. Strodthoff, &ldquo;Towards quantitative precision for ECG analysis: Leveraging state space models, self-supervision and patient metadata,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 27, no. 11, pp. 5326&ndash;5334, Nov. 2023, doi: 10.1109/JBHI.2023.3310989.</li>
    </ul>
  </div>
</div>

</body>
</html>"""
    return html

def test_build():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    if not os.path.exists(edge_path):
        edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
        
    os.makedirs('scratch', exist_ok=True)
    pdf_out = os.path.abspath('scratch/test_tuned_output.pdf')
    html_out = os.path.abspath('scratch/test_tuned_output.html')
    html_url = 'file:///' + html_out.replace('\\', '/')
    
    html_code = generate_html()
    with open(html_out, 'w', encoding='utf-8') as f:
        f.write(html_code)
        
    cmd = [
        edge_path,
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        f'--print-to-pdf={pdf_out}',
        html_url
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    print("Edge returncode:", res.returncode)
    
    pdf = pypdfium2.PdfDocument(pdf_out)
    print('TOTAL PAGES:', len(pdf))
    for i, page in enumerate(pdf):
        pix = page.render(scale=2).to_pil()
        arr = np.array(pix.convert('L'))
        h, w = arr.shape
        mid = w // 2
        
        left_ink = np.where(arr[:, :mid-20] < 240)
        right_ink = np.where(arr[:, mid+20:] < 240)
        
        l_bot = left_ink[0].max() if len(left_ink[0]) > 0 else 0
        r_bot = right_ink[0].max() if len(right_ink[0]) > 0 else 0
        
        all_ink = np.where(arr < 240)
        top = all_ink[0].min() if len(all_ink[0]) > 0 else 0
        bot = all_ink[0].max() if len(all_ink[0]) > 0 else 0
        
        diff = abs(l_bot - r_bot)
        gap = h - bot
        print(f"Page {i+1}: Y=[{top} to {bot}] / {h}px | Left={l_bot}, Right={r_bot} | diff={diff}px | bottom gap={gap}px")

if __name__ == '__main__':
    test_build()
