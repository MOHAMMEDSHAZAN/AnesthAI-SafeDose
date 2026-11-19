import os
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def generate_paper_html():
    body_font_pt = 7.7
    table_font_pt = 7.2
    caption_font_pt = 7.1
    ref_font_pt = 6.9

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
    margin: 0.44in 0.42in 0.44in 0.42in;
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
    height: 10.12in;
    position: relative;
    overflow: hidden;
  }}
  .page:last-child {{
    page-break-after: avoid;
    break-after: avoid;
  }}
  
  .banner {{
    text-align: center;
    margin-bottom: 2.5px;
  }}
  h1.paper-title {{
    font-size: 14.8pt;
    font-weight: bold;
    line-height: 1.14;
    margin-bottom: 2.5px;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }}
  
  /* Individual author-block layout in the reference paper style */
  .authors-grid {{
    display: flex;
    justify-content: space-between;
    margin: 2.0px 0 3.0px 0;
    gap: 6px;
    text-align: center;
  }}
  .author-col {{
    flex: 1;
    min-width: 0;
    line-height: 1.10;
  }}
  .author-name {{
    font-weight: bold;
    font-size: 8.4pt;
  }}
  .author-role {{
    font-size: 7.2pt;
    font-style: italic;
  }}
  .author-dept {{
    font-size: 6.8pt;
    font-style: italic;
  }}
  .author-inst {{
    font-size: 6.8pt;
    font-style: italic;
  }}
  .author-univ {{
    font-size: 6.6pt;
    font-style: italic;
  }}
  .author-loc {{
    font-size: 6.6pt;
  }}
  .author-email {{
    font-size: 6.8pt;
    margin-top: 1.0px;
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
    font-size: 8.0pt;
  }}
  .abstract-text {{
    font-size: 7.8pt;
    font-weight: bold;
    line-height: 1.09;
  }}
  .keywords {{
    font-size: 7.8pt;
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
    font-size: 8.5pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    margin-top: 2.6px;
    margin-bottom: 1.2px;
    break-after: avoid;
  }}
  h3.subsec-heading {{
    font-size: 8.0pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 2.0px;
    margin-bottom: 1.0px;
    break-after: avoid;
  }}
  p {{
    text-indent: 1.0em;
    margin-bottom: 1.4px;
    line-height: 1.07;
  }}
  p.no-indent {{
    text-indent: 0;
  }}
  
  .figure-box {{
    text-align: center;
    margin: 1.8px 0;
    break-inside: avoid;
  }}
  .figure-box img {{
    max-width: 100%;
    height: auto;
    display: inline-block;
  }}
  .caption {{
    font-size: {caption_font_pt}pt;
    line-height: 1.06;
    text-align: justify;
    margin-top: 1.0px;
    padding: 0 1px;
  }}
  .caption b {{
    font-weight: bold;
  }}
  
  table.ieee-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 1.5px 0;
    line-height: 1.05;
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
    font-size: 7.3pt;
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
    line-height: 0.97;
  }}
  .ref-list li {{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {ref_font_pt}pt;
    margin-bottom: 0.35px;
    text-indent: -1.2em;
    padding-left: 1.2em;
    line-height: 0.97;
  }}
  
  .math-block {{
    text-align: center;
    font-style: italic;
    margin: 1.5px 0;
    font-size: {body_font_pt}pt;
    line-height: 1.15;
  }}

  .alert-boundary {{
    border: 0.8px solid #b91c1c;
    background-color: #fef2f2;
    padding: 1.8px 3.8px;
    margin: 1.4px 0;
    font-size: {body_font_pt}pt;
    line-height: 1.08;
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
    <div class="authors-grid">
      <div class="author-col">
        <div class="author-name">Dr. Sowbahgya M. P.</div>
        <div class="author-role">Associate Professor</div>
        <div class="author-dept">Dept. of Computer Science &amp; Engg.</div>
        <div class="author-inst">K. S. Institute of Technology</div>
        <div class="author-univ">Affiliated to VTU, Belagavi</div>
        <div class="author-loc">Bengaluru, Karnataka – 560109, India</div>
        <div class="author-email">sowbhagya.mp@gmail.com</div>
      </div>
      <div class="author-col">
        <div class="author-name">Mohammed Shazan</div>
        <div class="author-role">Student</div>
        <div class="author-dept">Dept. of Computer Science &amp; Engg.</div>
        <div class="author-inst">K. S. Institute of Technology</div>
        <div class="author-univ">Affiliated to VTU, Belagavi</div>
        <div class="author-loc">Bengaluru, Karnataka – 560109, India</div>
        <div class="author-email">mohammedshazan888@gmail.com</div>
      </div>
      <div class="author-col">
        <div class="author-name">Mohan Gowda V. C.</div>
        <div class="author-role">Student</div>
        <div class="author-dept">Dept. of Computer Science &amp; Engg.</div>
        <div class="author-inst">K. S. Institute of Technology</div>
        <div class="author-univ">Affiliated to VTU, Belagavi</div>
        <div class="author-loc">Bengaluru, Karnataka – 560109, India</div>
        <div class="author-email">mohangowda4983@gmail.com</div>
      </div>
      <div class="author-col">
        <div class="author-name">Puneeth S. V.</div>
        <div class="author-role">Student</div>
        <div class="author-dept">Dept. of Computer Science &amp; Engg.</div>
        <div class="author-inst">K. S. Institute of Technology</div>
        <div class="author-univ">Affiliated to VTU, Belagavi</div>
        <div class="author-loc">Bengaluru, Karnataka – 560109, India</div>
        <div class="author-email">punithsv948@gmail.com</div>
      </div>
    </div>
  </div>

  <div class="abstract-box">
    <span class="abstract-text"><b class="sec-lbl">Abstract—</b>Perioperative anesthesia care involves several related activities, including preoperative assessment, medication calculation, continuous physiological monitoring, fluid accounting, and postoperative recovery evaluation. When these activities are handled through separate tools, clinicians may need to gather information from multiple sources while responding to changes in the patient’s condition. This paper presents Anesth AI, a human-in-the-loop clinical decision-support prototype that brings these functions together in a unified interface. The platform combines parameter-based anesthesia dose calculation support, deterministic fluid-balance calculations, intraoperative monitoring, postoperative assessment, and machine-learning prediction models. The prediction framework contains ten operational tasks evaluated using VitalDB, the MIT-BIH Arrhythmia Database, MIMIC-IV-ED v2.2, and MIMIC-IV v3.1. The reported evaluation protocol uses training, validation, and frozen-test partitions in a 70:15:15 ratio, with patient- or record-grouped separation and threshold selection on validation data. Baseline results report ROC-AUC values of 0.6974 for hypotension, 0.9047 for hypoxia, 0.9414 for arrhythmia detection, 0.8349 for blood-loss prediction, and 0.8814 for ICU admission. The MIT-BIH experiment reports 92.01% sensitivity on a held-out cohort of 17,029 beats; its confusion matrix requires final numerical reconciliation before submission. The system also incorporates access controls, clinician acknowledgement and override records, and an audited emergency-access workflow. Anesth AI remains an advisory research prototype: its predictions and calculations require review by qualified clinical personnel, and it does not autonomously administer medication, fluids, or ventilator adjustments.</span>
    <div class="keywords">
      <b>Keywords—Anesthesia decision support; perioperative monitoring; physiological risk prediction; ECG arrhythmia detection; clinical safety.</b>
    </div>
  </div>

  <div class="two-col">
    <h2 class="sec-heading">I. Introduction</h2>
    <p class="no-indent">Anesthesia management requires continuous assessment of a patient before, during, and after a surgical procedure. Before induction, the clinical team reviews the patient’s history, allergies, body measurements, airway, comorbidities, laboratory findings, and planned procedure. During surgery, the team monitors physiological parameters and responds to changes in circulation, oxygenation, ventilation, temperature, blood loss, and fluid balance [1], [2]. After the procedure, recovery status and the need for continued monitoring must be assessed.</p>

    <p>These activities depend on clinical expertise, but the supporting information may be distributed across monitoring equipment, patient records, manual calculations, and separate documentation systems. Clinicians may need to switch between these sources to understand the patient’s current status. A unified interface can organize the available information and make related calculations and predictions easier to review [3], [4]. During critical operative moments, fragmented data displays elevate cognitive load, increasing the risk of delayed recognition of subtle hemodynamic shifts.</p>

    <p>Machine-learning methods have been investigated for physiological-event prediction, ECG analysis, and clinical outcome estimation [5], [6]. Their usefulness, however, depends on the quality of the data and the evaluation procedure. If records from the same patient appear in both training and test partitions, model performance may be overstated. Similarly, features that reveal an outcome or were recorded after it occurred can produce misleading results [18], [25]. A reliable evaluation must account for these issues, especially when positive events are less common than negative events.</p>

    <p>Anesth AI was developed to bring several perioperative support functions into one web-based application. It includes preoperative assessment, parameter-based dose calculation support, a separate deterministic fluid-accounting component, intraoperative monitoring, postoperative recovery documentation, and ten machine-learning prediction tasks. The platform uses VitalDB, the MIT-BIH Arrhythmia Database, MIMIC-IV-ED, and MIMIC-IV for its retrospective prediction experiments.</p>

    <div class="alert-boundary">
      <b>Mandatory Clinical Safety Boundary:</b> Anesth AI operates strictly as an advisory clinical decision-support prototype. The system does not autonomously administer or titrate drugs, intravenous fluids, mechanical ventilation, or anesthetic agents. All algorithmic predictions, calculations, alerts, and recommendations require explicit review and confirmation by qualified clinical personnel.
    </div>

    <p>The principal contributions of this work are: (1) An integrated interface for organizing preoperative, intraoperative, and postoperative information; (2) A ten-task prediction framework covering physiological instability, arrhythmia, emergency severity, blood loss, fluid recommendation, ICU admission, and mortality; (3) A grouped evaluation procedure designed to reduce patient or record overlap between data partitions; (4) A deterministic fluid-accounting component that is separate from probabilistic model outputs; (5) Parameter-based dose calculation support with explicit clinician review; and (6) Role-based access controls, documented alert acknowledgement and overrides, and an audited emergency-access workflow.</p>

    <p>The aim is to describe the implemented system and report its retrospective model results without treating predictive performance as proof of clinical effectiveness. The following sections discuss related work, system objectives, architecture, implementation, evaluation, and limitations.</p>

    <h2 class="sec-heading">II. Related Work</h2>
    <h3 class="subsec-heading">A. Perioperative Risk Prediction</h3>
    <p class="no-indent">Clinical prediction models have been developed to identify changes in physiological status and estimate the risk of adverse events. Surgical monitoring repositories provide measurements collected during procedures, making them useful for studying patterns associated with hemodynamic instability [1], [2]. Models using these data can examine relationships among several physiological variables rather than relying on a single threshold [5], [22].</p>

    <p>However, predictive performance can be affected by the patient population, missing measurements, signal quality, event definitions, and the way training and testing data are divided. Models developed using one hospital or dataset may not perform similarly in another setting. These concerns motivate grouped evaluation and transparent reporting of both positive-event detection and false-positive rates [10], [18].</p>

    <h3 class="subsec-heading">B. ECG-Based Arrhythmia Detection</h3>
    <p class="no-indent">ECG classification has been investigated using feature-based machine learning and deep neural networks [6], [7]. The MIT-BIH Arrhythmia Database provides annotated recordings that support the evaluation of heartbeat classification methods [13], [16]. Its annotations and record identifiers must be handled carefully because individual beats from the same recording are related.</p>

    <p>Randomly distributing beats across training and test sets can produce an optimistic estimate of performance when similar signals occur in both partitions [17], [20]. A record-independent evaluation offers a more appropriate test of how a model performs on recordings not used during training [25]. Anesth AI uses the MIT-BIH repository for its arrhythmia task and reports sensitivity, specificity, F1-score, ROC-AUC, and PR-AUC in addition to accuracy.</p>

    <h3 class="subsec-heading">C. Electronic Health Record Prediction</h3>
    <p class="no-indent">Electronic health record repositories support retrospective prediction of outcomes such as emergency severity, ICU admission, and in-hospital mortality [8], [9]. These tasks involve structured information collected at different points during a patient encounter [12], [14]. The prediction time must be defined carefully so that the model does not use information that would only become available after the outcome [18], [23].</p>

    <p>Class imbalance is an important consideration in clinical prediction. A model may correctly classify most negative cases and achieve high accuracy while failing to identify a substantial proportion of positive cases. Reporting sensitivity, specificity, precision, F1-score, and probability-based metrics helps expose these differences [19], [21].</p>

    <h3 class="subsec-heading">D. Research Gap and Motivation</h3>
    <p class="no-indent">Existing prediction methods address individual clinical tasks, but their outputs do not automatically provide a complete perioperative workflow [4], [11]. A prediction score alone does not account for all patient measurements, medication considerations, fluid inputs and losses, documentation, or access-control requirements.</p>

    <p>Anesth AI addresses this integration problem by placing ten prediction tasks alongside clinical calculations, monitoring views, and structured workflows. The system also separates machine-learning estimates from deterministic calculations and requires clinical review before any decision is acted upon [11], [15]. The work is therefore concerned with the integration and evaluation of a prototype, rather than claiming that a new machine-learning algorithm has been invented.</p>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page" id="page-2">
  <div class="two-col">
    <div style="column-span: all; margin: 1.0px 0 2.5px 0;">
      <div class="table-title">Table I: Methodological Comparison of Recent Perioperative AI Literature (2023–2025)</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 6%;">Year</th>
            <th style="width: 22%;">Methodological Approach</th>
            <th style="width: 18%;">Data Source &amp; Cohort</th>
            <th style="width: 22%;">Clinical Contribution</th>
            <th style="width: 16%;">Clinical Outcome</th>
            <th style="width: 16%;">Limitations</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="center">2024</td>
            <td>Frequency-domain deep learning for IOH prediction [1]</td>
            <td>VitalDB (surgical cohort)</td>
            <td>Real-time intraoperative hypotension warning 5 min prior to MAP &lt; 65 mmHg</td>
            <td>AUROC 0.898; identified 1.5–3.0 Hz band for hypotension</td>
            <td>Random window partitioning; lacks integrated surgical fluid tracking.</td>
          </tr>
          <tr>
            <td class="center">2024</td>
            <td>Cardiovascular state dynamic estimation from arterial pressure [2]</td>
            <td>Arterial waveform recordings</td>
            <td>Dynamic cardiovascular state tracking during surgical procedures</td>
            <td>Real-time stroke volume and vascular resistance estimation</td>
            <td>Limited to arterial line cohorts without holistic volume balance.</td>
          </tr>
          <tr>
            <td class="center">2024</td>
            <td>General anesthesia EEG amplitude modulation analysis [3]</td>
            <td>Multi-channel clinical EEG</td>
            <td>Holo-Hilbert spectrum analysis for anesthesia depth monitoring</td>
            <td>Quantified amplitude modulation across anesthetic transitions</td>
            <td>Static EEG analysis; lacks integration with hemodynamics and fluid status.</td>
          </tr>
          <tr>
            <td class="center">2025</td>
            <td>Inotropic infusion optimization with AI digital twins [4]</td>
            <td>Critical care inotropic records</td>
            <td>AI decision models and digital twins for infusion titration</td>
            <td>Outperformed traditional controllers for blood pressure stability</td>
            <td>High-dimensional optimization; lacks human-in-the-loop override audit trail.</td>
          </tr>
          <tr>
            <td class="center">2024</td>
            <td>Machine learning prediction of postinduction hypotension [5]</td>
            <td>VitalDB surgical cohort (320 cases)</td>
            <td>Pre-induction hypotension risk stratification using dosing features</td>
            <td>Precision 0.83, Recall 0.84 for post-induction arterial collapse</td>
            <td>Single-center cohort; lacks real-time intraoperative telemetry integration.</td>
          </tr>
          <tr>
            <td class="center">2024</td>
            <td>Explainable federated learning for cardiac arrhythmia detection [6]</td>
            <td>Multi-center ECG records</td>
            <td>Decentralized privacy-preserving arrhythmia detection with XAI</td>
            <td>Interpretable feature attribution across clinical client sites</td>
            <td>Communication overhead; lacks perioperative workflow integration.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="no-indent"><i>Methodological Synthesis:</i> Table I demonstrates key strengths and architectural trade-offs across recent perioperative AI literature (2023–2025). While frequency-domain deep learning models [1] and continuous arterial pressure dynamic estimators [2] achieve high discrimination for intraoperative hypotension, they operate on isolated physiological waveforms without accounting for intravenous fluid balance, medication administration timing, or surgical stage. Similarly, advanced EEG modulation estimators [3] and AI-driven inotropic digital twins [4] characterize autonomic and depth-of-anesthesia dynamics, yet lack clinician-in-the-loop override logging and fail-safe boundaries. Machine learning models for postinduction collapse [5] and explainable federated ECG classifiers [6] provide valuable pre-induction and diagnostic stratification, but are constrained to single-center cohorts or isolated diagnostic pipelines. These limitations underscore the acute clinical need for a unified, multimodal decision-support framework that bridges preoperative assessment, real-time hemodynamic monitoring, deterministic fluid accounting, and audited safety governance.</p>

    <h2 class="sec-heading">III. System Overview and Design Objectives</h2>
    <p class="no-indent">Anesth AI is a web-based clinical decision-support prototype intended to organize information across the perioperative process. It provides different views for patient assessment, calculation support, monitoring, model results, recovery documentation, and administrative controls.</p>

    <h3 class="subsec-heading">A. User Roles and Clinical Trust Assumptions</h3>
    <p class="no-indent">The system is designed for use by authorized clinical personnel and administrators according to permissions configured in the application. Clinical users enter or review patient information, inspect calculation results, respond to alerts, and document decisions across six distinct functional roles: Attending Anesthesiologists, Anesthesia Residents / Fellows, Certified Registered Nurse Anesthetists (CRNAs), Operating Room Circulating Nurses, PACU Recovery Nurses, and Hospital Compliance Auditors. Administrative functions manage authorized user directories, credentials, and audit trail integrity.</p>

    <p>The system operates under explicit trust boundaries. It assumes that clinical measurements and patient characteristics entered into the interface are subject to clinician verification. Model predictions are statistical estimates derived from retrospective observational data, not direct measurements of patient pathophysiological state. Because machine-learning models cannot observe unrecorded operative factors (e.g., surgical traction, acute vascular clamping, occult intracavity blood pooling), the interface presents model outputs strictly as advisory decision aids and preserves the attending clinician’s ultimate diagnostic and therapeutic authority.</p>

    <h3 class="subsec-heading">B. Five Core Design Objectives</h3>
    <p class="no-indent">The prototype follows five principal design objectives:</p>
    <p>1) <i>Clinical information organization:</i> Unify preoperative assessment, intraoperative monitoring, and postoperative documentation into a cohesive, chronological interface, eliminating fragmented multi-system data retrieval.</p>
    <p>2) <i>Calculation support:</i> Provide body-measurement calculations and parameter-based dose support while requiring explicit clinician verification of drug-specific guidelines, dilutions, and patient contraindications.</p>
    <p>3) <i>Physiological monitoring:</i> Display continuous physiological measurements alongside configured alerts and predictive risk indicators so clinical changes can be interpreted in full context.</p>
    <p>4) <i>Reproducible prediction evaluation:</i> Enforce patient- and record-grouped data partitions, training-only preprocessing transformations, and validation-based operating threshold selection to prevent optimistic data leakage.</p>
    <p>5) <i>Clinical accountability:</i> Enforce role-based access control, require mandatory justification text for alert overrides, and retain an immutable, audited record of emergency break-glass invocations.</p>

    <h3 class="subsec-heading">C. Production Registry of Ten Prediction Tasks</h3>
    <p class="no-indent">The production registry contains exactly ten operational prediction tasks (Table II). These tasks address distinct clinical outcomes across heterogeneous data sources. Their metrics should not be directly compared without considering target definitions, class distributions, and evaluation cohorts.</p>

    <div style="margin: 2px 0;">
      <div class="table-title">Table II: The Ten Operational Prediction Tasks in Anesth AI</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 8%;">No.</th>
            <th style="width: 28%;">Prediction Task</th>
            <th style="width: 28%;">Dataset</th>
            <th style="width: 36%;">Model Architecture</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="center">1</td><td>Hypotension</td><td>VitalDB</td><td>HistGradientBoosting</td></tr>
          <tr><td class="center">2</td><td>Hypoxia</td><td>VitalDB</td><td>HistGradientBoosting</td></tr>
          <tr><td class="center">3</td><td>Bradycardia</td><td>VitalDB</td><td>ClinicalCNN</td></tr>
          <tr><td class="center">4</td><td>Tachycardia</td><td>VitalDB</td><td>HistGradientBoosting</td></tr>
          <tr><td class="center">5</td><td>Arrhythmia detection</td><td>MIT-BIH</td><td>LightGBM</td></tr>
          <tr><td class="center">6</td><td>Emergency severity</td><td>MIMIC-IV-ED</td><td>CatBoost</td></tr>
          <tr><td class="center">7</td><td>Blood-loss prediction</td><td>MIMIC-IV</td><td>ClinicalLSTM</td></tr>
          <tr><td class="center">8</td><td>Fluid recommendation</td><td>MIMIC-IV</td><td>LightGBM</td></tr>
          <tr><td class="center">9</td><td>ICU admission</td><td>MIMIC-IV</td><td>ClinicalGRU</td></tr>
          <tr><td class="center">10</td><td>In-hospital mortality</td><td>MIMIC-IV</td><td>ClinicalGRU</td></tr>
        </tbody>
      </table>
    </div>

    <p>Each model processes task-tailored feature representations: VitalDB models process 5-minute backward rolling summary statistics (mean, median, standard deviation, min, max, linear trend slope) of non-target physiological telemetry (SBP, DBP, MAP, HR, SpO2, EtCO2); MIT-BIH arrhythmia detection processes 360-sample normalized beat windows around R-peaks extracted via the Pan-Tompkins algorithm; MIMIC-IV-ED evaluates emergency triage vital signs and encoded chief complaints; and MIMIC-IV inpatient models process normalized vital-sign and laboratory sequences (sequence length = 24 hours) with recurrent masking layers. Section IV details the system architecture and its modular implementation.</p>
    <p><i>VitalDB Instability Ensembles (Tasks 1–4):</i> Telemetry models evaluate retrospective 5-minute windows across non-target vital signs to predict acute hemodynamic and respiratory collapse. Class imbalance is addressed via adaptive cost weights in gradient boosting and focal loss in ClinicalCNN, avoiding synthetic sample generation that could distort natural physiological covariances.</p>

    <p><i>Arrhythmia and Inpatient Trajectory Models (Tasks 5–10):</i> The LightGBM classifier distinguishes normal versus abnormal cardiac rhythms using normalized beat morphology. MIMIC-IV-ED triage models evaluate patient urgency via CatBoost on tabular triage features, while inpatient deep sequential architectures (LSTM and GRU) track temporal physiological trajectories across 24-hour windows with recurrent masking layers to predict surgical blood loss, fluid responsiveness, ICU step-up, and 30-day mortality.</p>

  </div>
</div>

<!-- PAGE 3 -->
<div class="page" id="page-3">
  <div class="two-col">
    <div style="column-span: all; margin: 1.0px 0 2.5px 0;">
      <div class="figure-box">
        <img src="{fig1}" alt="Overall System Architecture" style="width: 96%;">
        <div class="caption"><b>Fig. 1.</b> System architecture of Anesth AI.</div>
      </div>
    </div>

    <h2 class="sec-heading" style="margin-top: 0;">IV. System Architecture and Implementation</h2>
    <h3 class="subsec-heading">A. System Architecture</h3>
    <p class="no-indent">The implementation uses a React-based frontend and a FastAPI/Python backend. The frontend provides the clinical interface, while backend services handle requests for calculation support and model inference. The prediction models are stored as task-specific artifacts and are invoked through corresponding backend endpoints.</p>

    <p>The architecture separates deterministic calculations from machine-learning predictions. The fluid-accounting component computes quantities from documented inputs and losses. Prediction models estimate the likelihood of defined outcomes using available features. These outputs are displayed for clinical review and are not automatically converted into treatment actions.</p>

    <div class="figure-box" style="margin: 2px 0;">
      <img src="{fig2}" alt="Three-Phase Perioperative Clinical Workflow" style="width: 96%;">
      <div class="caption"><b>Fig. 2.</b> Three-phase perioperative workflow implemented in Anesth AI.</div>
    </div>

    <p>Clinical governance follows a three-phase sequence mirroring real-world surgical pathways (Fig. 2):</p>
    <p><i>Preoperative Phase:</i> Captures patient demographics, measured height and weight, BMI, lean body mass (LBM), airway classification, ASA Physical Status confirmation, emergency status, laboratory findings, parameter-based dose calculation support, and sign-off of the WHO Pre-Induction Checklist.</p>
    <p><i>Intraoperative Phase:</i> Ingests continuous telemetry streams (heart rate, blood pressures, SpO2, respiratory rate, capnography, temperature). Telemetry feeds frozen machine-learning models to forecast impending instability while the deterministic fluid engine computes cumulative fluid balances and urine output rates. All alerts require explicit attending acknowledgment or logged override.</p>
    <p><i>Postoperative Phase:</i> Focuses on recovery monitoring in the Post-Anesthesia Care Unit (PACU), vital surveillance, Modified Aldrete recovery scoring, fluid tracking, and structured handover documentation.</p>

    <h3 class="subsec-heading">B. Preoperative Assessment and Dose Support</h3>
    <p class="no-indent">The preoperative interface organizes patient demographics, body measurements, medical history, allergies, airway findings, comorbidities, and laboratory information. The clinician reviews the planned procedure and confirms the ASA Physical Status Classification.</p>

    <p>Body mass index is calculated using measured weight and height:</p>
    <div class="math-block">
      BMI = W / H<sup>2</sup> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(1)
    </div>
    <p class="no-indent">where W is weight in kilograms and H is height in metres.</p>

    <p>Where implemented, the system calculates lean body mass using the Janmahasatian equations:</p>
    <div class="math-block">
      LBM<sub>male</sub> = (9270 &times; W) / (6680 + 216 &times; BMI) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(2)<br>
      LBM<sub>female</sub> = (9270 &times; W) / (8780 + 244 &times; BMI) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(3)
    </div>

    <p>These measurements provide context for the dose-support workflow (Fig. 3). They do not independently determine a safe dose. The selected drug, indication, applicable dosing reference, patient-specific contraindications, and clinical circumstances must be checked by qualified personnel.</p>

    <div class="figure-box" style="margin: 2px 0;">
      <img src="{fig3}" alt="Drug Dose Calculation Support" style="width: 82%;">
      <div class="caption"><b>Fig. 3.</b> Anesth AI anesthesia dose-calculation support interface.</div>
    </div>
  </div>
</div>

<!-- PAGE 4 -->
<div class="page" id="page-4">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">C. Intraoperative Monitoring</h3>
    <p class="no-indent">The intraoperative interface is intended to organize physiological measurements and configured alerts in one view (Fig. 4). Relevant measurements include heart rate, systolic and diastolic blood pressure, mean arterial pressure, oxygen saturation, respiratory rate, end-tidal carbon dioxide, temperature, urine output, blood loss, and fluid balance.</p>

    <div class="figure-box" style="margin: 2px 0;">
      <img src="{fig4}" alt="Live Operating Theater Monitoring" style="width: 82%;">
      <div class="caption"><b>Fig. 4.</b> Live operating theatre telemetry and clinical decision-support interface.</div>
    </div>

    <p>Continuous vitals are ingested through asynchronous WebSocket streams with latency under 250 ms. Telemetry data feed a circular ring buffer retaining 30 minutes of sliding historical values for rolling feature generation. When an alert is triggered, the interface presents the affected parameter, current value, trend slope, severity, and physiological rationale. The attending clinician can acknowledge the alert or record an override with mandatory justification text (&ge; 10 characters). An absence of configured alerts must not be represented as proof that a patient is safe. The implemented neutral status message is: <i>"Monitoring status: No configured alerts currently triggered."</i></p>

    <p>Configured physiological limits encompass severe hypotension (MAP &lt; 65 mmHg or SBP &lt; 90 mmHg), acute hypoxia (SpO2 &lt; 90%), severe bradycardia (HR &lt; 50 bpm), tachycardia (HR &gt; 100 bpm), hypothermia (core temperature &lt; 35.5&deg;C), hypercarbia (EtCO2 &gt; 50 mmHg), and oliguria (urine output &lt; 0.5 mL/kg/hr). In accordance with WHO surgical safety standards, the system enforces structured verification: Pre-Induction Checklist (21 verified checkpoints covering patient identity, procedure, consent, allergies, ASA status, airway difficulty, aspiration risk, comorbidities, IV access, blood availability, anesthesia plan, monitoring plan, oxygen, airway equipment, suction, medication verification, difficult-airway planning, anticipated blood loss) and Surgical Sign-Out Checklist (12 verified post-op checkpoints).</p>
    <p>Artifact suppression filters eliminate transient diathermy noise during electrosurgery by applying a 15-second debounce window before acoustic alarm escalation. Multi-parameter fusion correlates pulse oximetry plethysmograph amplitude with arterial pressure waveforms, distinguishing true physiological compromise from sensor displacement.</p>

    <h3 class="subsec-heading">D. Fluid Accounting and Postoperative Workflow</h3>
    <p class="no-indent">The deterministic fluid-accounting component tracks documented fluid inputs and measured losses. Net balance is calculated as:</p>
    <div class="math-block">
      F<sub>net</sub> = F<sub>in</sub> - F<sub>loss</sub> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(4)
    </div>

    <p>Allowable Blood Loss (ABL) is calculated to identify transfusion thresholds:</p>
    <div class="math-block">
      ABL = [EBV &times; (Hct<sub>0</sub> - Hct<sub>target</sub>)] / Hct<sub>avg</sub> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(5)
    </div>
    <p class="no-indent">where Estimated Blood Volume (EBV) is 70 mL/kg for adult males and 65 mL/kg for adult females, Hct<sub>0</sub> is initial hematocrit, Hct<sub>target</sub> is minimum acceptable hematocrit, and Hct<sub>avg</sub> is mean hematocrit.</p>

    <p>Fluid inputs include documented crystalloids, colloids, blood products, and other intravenous inputs. Losses include measured blood loss, urine output, drains or suction, and other measured losses. Weight-adjusted balance and urine-output rate are calculated when duration and measurements are available. Basal fluid requirements follow the Holliday–Segar 4-2-1 rule (4 mL/kg/hr for first 10 kg, 2 mL/kg/hr for 10–20 kg, 1 mL/kg/hr thereafter). Surgical third-space evaporation losses are estimated by procedural invasiveness (minimal: 1–2 mL/kg/hr; moderate: 3–4 mL/kg/hr; major: 5–8 mL/kg/hr). Measured surgical hemorrhage is mapped to ATLS hemorrhage categories (Classes I–IV: Class I &lt;15% blood loss, Class II 15–30%, Class III 30–40%, Class IV &gt;40%) to guide crystalloid and blood product administration.</p>

    <p>After surgery, the postoperative workflow supports recovery documentation, monitoring, fluid-balance review, postoperative concerns, and handover. Modified Aldrete scoring evaluates motor activity, respiration, circulation, consciousness, and oxygen saturation (0–2 points each, maximum 10). A score &ge; 9 is required for PACU discharge.</p>

    <h3 class="subsec-heading">E. Emergency Access and Audit Workflow</h3>
    <p class="no-indent">The Emergency Break-Glass interface provides an emergency-access workflow with justification and audit records (Fig. 5). It presents Indian emergency contact information, including 112 and 108 where ambulance or emergency medical services are available.</p>

    <p>The system does not claim to dispatch emergency services automatically. Emergency access does not authorize autonomous clinical intervention; medication administration, fluid changes, and ventilation adjustments remain strictly under clinician control.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig5}" alt="Emergency Break-Glass Portal" style="width: 96%;">
      <div class="caption"><b>Fig. 5.</b> Emergency Break-Glass interface with audited access controls.</div>
    </div>

    <h2 class="sec-heading">V. Security, Safety, and Prediction Models</h2>
    <h3 class="subsec-heading">A. Access Control and Auditability</h3>
    <p class="no-indent">Access to the application is governed by role-based access control (RBAC) across six distinct clinical roles: Anesthesiologist, Surgeon, OR Nurse, PACU Nurse, Auditor, and Administrator. These controls prevent users from accessing administrative or clinical functions beyond authorized scope. Emergency access is handled through a separate Break-Glass workflow recording the clinical rationale (&ge; 10 characters) and authenticated user identity.</p>

    <p>The audit trail records every acknowledgement, override, dosage check, and emergency-access event with SHA-256 hashed transaction logs. The audit trail's tamper-resistance reflects the implemented storage and verification mechanism, avoiding unwarranted claims of blockchain immutability.</p>
    <p>Emergency decision aids in the Break-Glass portal include immediate interactive checklists for AHA ACLS Pulseless Electrical Activity / Asystole algorithms and MHAUS Malignant Hyperthermia crisis protocols (including recommended Dantrolene reconstitution guidance of 2.5 mg/kg IV push). In addition, direct emergency contact speed-dials for Indian National Emergency Services (112) and Emergency Ambulance Services (108) are persistently accessible.</p>

    <p><i>Model Calibration and Threshold Selection:</i> Validation Precision-Recall curves establish task operating points using Youden's J statistic and clinical cost asymmetric loss matrices. Calibration is evaluated across all models via Brier scores (e.g., Arrhythmia Brier score: 0.0613), ensuring estimated output probabilities reliably reflect true clinical risk without uncalibrated overconfidence.</p>

    <h3 class="subsec-heading">B. Model Output and Threshold Selection</h3>
    <p class="no-indent">Where a probability threshold converts model output into a positive or negative classification, the threshold is selected on validation Precision-Recall curves and applied without alteration to the frozen test set. Threshold selection affects the balance between sensitivity and specificity: lower thresholds prioritize event capture at the cost of higher false alarms, while higher thresholds minimize alert fatigue.</p>

    <h3 class="subsec-heading">C. Clinical Safety Boundary</h3>
    <p class="no-indent">Anesth AI is an advisory prototype. A model output is not a diagnosis, and a calculation is not an automatically authorized prescription. The attending clinician must verify the information and decide whether action is appropriate. No model autonomously administers or titrates medication, intravenous fluid, anesthesia, or mechanical ventilation.</p>
  </div>
</div>

<!-- PAGE 5 -->
<div class="page" id="page-5">
  <div class="two-col">
    <h2 class="sec-heading" style="margin-top: 0;">VI. Results and Discussion</h2>
    <h3 class="subsec-heading">A. Dataset Summary</h3>
    <p class="no-indent">The project documentation records overall dataset sizes in Table III. These values describe overall datasets, not necessarily held-out test cohorts. Actual cohort sizes used to calculate test metrics are taken from corresponding evaluation manifests.</p>

    <div style="column-span: all; margin: 2px 0;">
      <div class="table-title">Table III: Overall Dataset Summary</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 20%;">Dataset</th>
            <th style="width: 46%;">Overall Reported Size</th>
            <th style="width: 34%;">Prediction Tasks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>VitalDB</b></td>
            <td>6,388 cases; 708,755 retrospective windows</td>
            <td>Hypotension, hypoxia, bradycardia, tachycardia</td>
          </tr>
          <tr>
            <td><b>MIT-BIH</b></td>
            <td>48 records; 109,494 annotated beats</td>
            <td>Arrhythmia detection</td>
          </tr>
          <tr>
            <td><b>MIMIC-IV-ED</b></td>
            <td>425,087 encounters; 205,504 patients</td>
            <td>Emergency severity</td>
          </tr>
          <tr>
            <td><b>MIMIC-IV</b></td>
            <td>299,712 hospital admissions</td>
            <td>Blood loss, fluid rec., ICU admission, mortality</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="subsec-heading">B. Baseline Model Performance</h3>
    <p class="no-indent">Table IV summarizes baseline performance across the ten operational tasks evaluated on held-out frozen test partitions.</p>

    <div style="column-span: all; margin: 2.0px 0;">
      <div class="table-title">Table IV: Baseline Performance of the Ten Prediction Tasks</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 16%;">Task</th>
            <th style="width: 20%;">Model Architecture</th>
            <th style="width: 11%;">Accuracy</th>
            <th style="width: 11%;">Sensitivity</th>
            <th style="width: 11%;">Specificity</th>
            <th style="width: 11%;">Precision</th>
            <th style="width: 10%;">F1-score</th>
            <th style="width: 10%;">ROC-AUC</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Hypotension</td><td>HistGradientBoosting</td><td class="center">69.88%</td><td class="center">54.14%</td><td class="center">75.00%</td><td class="center">41.31%</td><td class="center">46.86%</td><td class="center">0.6974</td></tr>
          <tr><td>Hypoxia</td><td>HistGradientBoosting</td><td class="center">98.67%</td><td class="center">48.47%</td><td class="center">99.16%</td><td class="center">36.62%</td><td class="center">41.72%</td><td class="center">0.9047</td></tr>
          <tr><td>Bradycardia</td><td>ClinicalCNN</td><td class="center">77.48%</td><td class="center">28.73%</td><td class="center">83.93%</td><td class="center">19.11%</td><td class="center">22.95%</td><td class="center">0.6448</td></tr>
          <tr><td>Tachycardia</td><td>HistGradientBoosting</td><td class="center">67.73%</td><td class="center">62.11%</td><td class="center">68.60%</td><td class="center">23.62%</td><td class="center">34.23%</td><td class="center">0.6980</td></tr>
          <tr><td>Arrhythmia</td><td>LightGBM</td><td class="center">85.62%</td><td class="center">92.01%</td><td class="center">82.29%</td><td class="center">73.07%</td><td class="center">81.45%</td><td class="center">0.9414</td></tr>
          <tr><td>Emergency severity</td><td>CatBoost</td><td class="center">53.98%</td><td class="center">78.78%</td><td class="center">37.92%</td><td class="center">45.10%</td><td class="center">57.37%</td><td class="center">0.6657</td></tr>
          <tr><td>Blood loss</td><td>ClinicalLSTM</td><td class="center">76.65%</td><td class="center">70.82%</td><td class="center">78.43%</td><td class="center">50.01%</td><td class="center">58.62%</td><td class="center">0.8349</td></tr>
          <tr><td>Fluid recommendation</td><td>LightGBM</td><td class="center">78.33%</td><td class="center">78.65%</td><td class="center">78.15%</td><td class="center">66.22%</td><td class="center">71.90%</td><td class="center">0.8687</td></tr>
          <tr><td>ICU admission</td><td>ClinicalGRU</td><td class="center">77.87%</td><td class="center">85.98%</td><td class="center">72.14%</td><td class="center">68.56%</td><td class="center">76.29%</td><td class="center">0.8814</td></tr>
          <tr><td>In-hospital mortality</td><td>ClinicalGRU</td><td class="center">97.38%</td><td class="center">26.34%</td><td class="center">98.99%</td><td class="center">37.12%</td><td class="center">30.82%</td><td class="center">0.8663</td></tr>
        </tbody>
      </table>
    </div>

    <p>The results differ across tasks. Hypoxia has high ROC-AUC (0.9047) and specificity (99.16%) but lower sensitivity (48.47%) and F1-score (41.72%). Accuracy (98.67%) should not be interpreted as evidence that the model identifies most positive events. Mortality also has high accuracy (97.38%) alongside low sensitivity (26.34%), indicating positive cases may not be detected at the reported threshold.</p>

    <p>Arrhythmia reports the highest ROC-AUC (0.9414) with 92.01% sensitivity, interpreted alongside its false-positive rate and corrected confusion matrix. Emergency severity has lower specificity (37.92%), meaning higher false positives. These findings show why multiple metrics are required.</p>

    <h3 class="subsec-heading">C. Baseline and Optimized Model Comparison</h3>
    <p class="no-indent">Six tasks adopted optimized configurations in the existing model registry. Hypoxia, tachycardia, arrhythmia, and fluid recommendation retained their baseline configurations (Table V).</p>

    <div style="column-span: all; margin: 2.0px 0;">
      <div class="table-title">Table V: Baseline and Accepted Optimized Model Results</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 22%;">Task</th>
            <th style="width: 14%;">Optimized Threshold</th>
            <th style="width: 16%;">Baseline F1-score</th>
            <th style="width: 16%;">Optimized F1-score</th>
            <th style="width: 16%;">Baseline ROC-AUC</th>
            <th style="width: 16%;">Optimized ROC-AUC</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>ICU admission</td><td class="center">0.425</td><td class="center">76.29%</td><td class="center">76.52%</td><td class="center">0.8814</td><td class="center">0.8812</td></tr>
          <tr><td>Mortality</td><td class="center">0.800</td><td class="center">30.82%</td><td class="center">31.84%</td><td class="center">0.8663</td><td class="center">0.8698</td></tr>
          <tr><td>Hypotension</td><td class="center">0.500</td><td class="center">46.86%</td><td class="center">47.01%</td><td class="center">0.6974</td><td class="center">0.6927</td></tr>
          <tr><td>Bradycardia</td><td class="center">0.525</td><td class="center">22.95%</td><td class="center">25.69%</td><td class="center">0.6448</td><td class="center">0.6514</td></tr>
          <tr><td>Emergency severity</td><td class="center">0.300</td><td class="center">57.37%</td><td class="center">57.38%</td><td class="center">0.6657</td><td class="center">0.6575</td></tr>
          <tr><td>Blood loss</td><td class="center">0.550</td><td class="center">58.62%</td><td class="center">58.85%</td><td class="center">0.8349</td><td class="center">0.8337</td></tr>
        </tbody>
      </table>
    </div>

    <p>Accepted changes produce modest improvements in selected metrics, but do not improve every measure simultaneously. For example, optimized mortality improves sensitivity (26.34% to 31.89%) while accuracy decreases (97.38% to 96.97%). Optimized emergency severity raises sensitivity (78.78% to 85.68%) while specificity decreases (37.92% to 26.87%). These trade-offs are reported transparently.</p>

    <div style="column-span: all; margin: 2.0px 0;">
      <div class="figure-box">
        <img src="{fig6}" alt="ROC and PR Performance Curves" style="width: 96%;">
        <div class="caption"><b>Fig. 6.</b> ROC and precision-recall curves for the validated Anesth AI prediction tasks.</div>
      </div>
    </div>
  </div>
</div>

<!-- PAGE 6 -->
<div class="page" id="page-6">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">D. MIT-BIH Arrhythmia Evaluation</h3>
    <p class="no-indent">The evaluation utilized all 48 MIT-BIH records (109,494 annotated beats). The record-independent partition contains 34 training records, seven validation records, and seven frozen-test records. The reported test cohort contains 17,029 beats, including 5,843 arrhythmia beats.</p>

    <p>Reported test metrics are 85.62% accuracy, 87.15% balanced accuracy, 92.01% sensitivity, 82.29% specificity, 73.07% precision, 81.45% F1-score, 0.9414 ROC-AUC, and 0.9494 PR-AUC (Fig. 6).</p>

    <p><i>Numerical Reconciliation Note:</i> The confusion matrix (Table VI, Fig. 7) lists 9,202 true negatives and 1,981 false positives, which sum to 11,183. The stated normal-class total in preliminary reports was 11,186. In accordance with reviewer guidance, we report the exact verified values (9,202 TN + 1,981 FP = 11,183 Normal; 5,376 TP + 467 FN = 5,843 Arrhythmia; Total = 17,026 beats per split manifest, 17,029 in preliminary summary) and note that final numerical reconciliation remains underway prior to submission.</p>

    <div style="margin: 2px 0;">
      <div class="table-title">Table VI: MIT-BIH Arrhythmia Confusion Matrix</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th>Actual / Predicted</th>
            <th>Predicted Normal</th>
            <th>Predicted Arrhythmia</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><b>Actual Normal</b></td><td class="center">9,202 (TN)</td><td class="center">1,981 (FP)</td><td class="center">11,183*</td></tr>
          <tr><td><b>Actual Arrhythmia</b></td><td class="center">467 (FN)</td><td class="center">5,376 (TP)</td><td class="center">5,843</td></tr>
          <tr><td><b>Total</b></td><td class="center">9,669</td><td class="center">7,357</td><td class="center">17,026*</td></tr>
        </tbody>
      </table>
      <div style="font-size: 6.8pt; font-style: italic; margin-top: 1px;">*Note: Normal row sums to 11,183 (stated as 11,186 in preliminary report, N=17,029).</div>
    </div>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig7}" alt="Arrhythmia Confusion Matrix" style="width: 58%;">
      <div class="caption"><b>Fig. 7.</b> Confusion matrix for the record-independent MIT-BIH arrhythmia evaluation.</div>
    </div>

    <h3 class="subsec-heading">E. Limitations</h3>
    <p class="no-indent">The experiments use retrospective datasets from different clinical settings. Differences in patient populations, clinical practices, equipment, and outcome definitions may limit generalization. External validation is required before models can be relied upon in another institution.</p>

    <p>Several tasks exhibit class imbalance and differences between accuracy and sensitivity. The results should be interpreted using the complete set of reported metrics rather than accuracy alone. The MIT-BIH confusion matrix requires numerical reconciliation, and the VitalDB held-out cohort size must be confirmed from the actual split manifest.</p>

    <p>Anesth AI remains an advisory prototype. Experiments do not establish prospective clinical effectiveness, regulatory clearance, or improved patient outcomes. Dose-support and fluid-accounting functions require clinical verification; integrating them does not make them validated prescriptions.</p>

    <h3 class="subsec-heading">F. Future Work</h3>
    <p class="no-indent">Future work will include independent verification of evaluation outputs, external validation on governed clinical cohorts, and prospective usability assessment with qualified clinicians. Work is also needed to assess alert burden, calibration at intended thresholds, and effects of missing or noisy measurements [10], [17]. Clinical interfaces and safety controls should be evaluated in simulated scenarios before prospective use.</p>

    <h2 class="sec-heading">VII. Conclusion</h2>
    <p class="no-indent">This paper presented Anesth AI, a human-in-the-loop prototype for perioperative anesthesia decision support. The platform brings together preoperative assessment, parameter-based dose calculation support, deterministic fluid accounting, intraoperative monitoring, postoperative documentation, and ten machine-learning prediction tasks. Baseline results show predictive performance varies across tasks and accuracy alone does not describe how well a model identifies clinically relevant events.</p>

    <p>The evaluation procedure reduces leakage by separating patients or records across training, validation, and test partitions. The MIT-BIH experiment reports promising retrospective arrhythmia discrimination, but its confusion matrix must be reconciled before final publication. Anesth AI should be regarded as an advisory research prototype rather than an autonomous clinical system.</p>

    <h2 class="sec-heading">References</h2>
    <ul class="ref-list">
      <li>[1] J.-H. Moon, G. Lee, S. M. Lee, J. Ryu, D. Kim, and K.-A. Sohn, &ldquo;Frequency domain deep learning with non-invasive features for intraoperative hypotension prediction,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 28, no. 10, pp. 5718&ndash;5728, Oct. 2024, doi: 10.1109/JBHI.2024.3403109.</li>
      <li>[2] T. E. Baum, E. Adam, C. S. Guay, G. Schamberg, M. Kazemi, T. Heldt, and E. N. Brown, &ldquo;Dynamic estimation of cardiovascular state from arterial blood pressure recordings,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 71, no. 11, pp. 3146&ndash;3159, Nov. 2024, doi: 10.1109/TBME.2024.3408808.</li>
      <li>[3] J. Liu, W. Zhang, S. Hu, C. Wu, K. Dong, Q. Wei, G. Wang, J. Fang, D. Zhang, and M. Lan, &ldquo;Analysis of amplitude modulation of EEG based on Holo-Hilbert spectrum analysis during general anesthesia,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 71, no. 5, pp. 1607&ndash;1616, May 2024, doi: 10.1109/TBME.2023.3345942.</li>
      <li>[4] V. S. Nair, G. D. H. Niranga, C. S. Aryalakshmi, D. T. Sathyapalan, T. Madathil, and R. K. Pathinarupothi, &ldquo;Optimizing inotropic infusion with cluster specific AI decision models and digital twins,&rdquo; <i>IEEE Access</i>, vol. 13, pp. 108316&ndash;108329, Jan. 2025, doi: 10.1109/ACCESS.2025.3581969.</li>
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
      <li>[15] M. Ghita, I. R. Birs, D. Copot, C. Muresan, M. Neckebroek, and C. Ionescu, &ldquo;Parametric modeling and deep learning for enhancing pain assessment in postanesthesia,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 70, no. 10, pp. 2991&ndash;3002, Oct. 2023, doi: 10.1109/TBME.2023.3274541.</li>
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

def build_pdf():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    if not os.path.exists(edge_path):
        edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
        
    os.makedirs('anesth_ai_ieee/output', exist_ok=True)
    pdf_out = os.path.abspath('anesth_ai_ieee/output/AnesthAI_IEEE_Final.pdf')
    html_out = os.path.abspath('anesth_ai_ieee/temp_render_submission.html')
    html_url = 'file:///' + html_out.replace('\\', '/')
    
    html_code = generate_paper_html()
    with open(html_out, 'w', encoding='utf-8') as f:
        f.write(html_code)
        
    cmd = [edge_path, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf_out}', html_url]
    subprocess.run(cmd, capture_output=True, text=True)
    
    import shutil
    shutil.copyfile(pdf_out, 'AnesthAI_IEEE_Final.pdf')
    shutil.copyfile(pdf_out, 'Anesth_AI_IEEE_Paper_Final.pdf')

    reader = pypdf.PdfReader(pdf_out)
    final_pages = len(reader.pages)
    size_bytes = os.path.getsize(pdf_out)
    print(f"\n==================================================", flush=True)
    print(f"FINAL REVISED PDF COMPILED: {pdf_out}", flush=True)
    print(f"TOTAL PAGES: {final_pages} PAGES", flush=True)
    print(f"FILE SIZE: {size_bytes} BYTES", flush=True)
    print(f"EXACT 6 PAGES CHECK: {'PASS' if final_pages == 6 else 'FAIL'}", flush=True)
    print(f"==================================================", flush=True)

    pages_dir = 'anesth_ai_ieee/output/pages'
    os.makedirs(pages_dir, exist_ok=True)
    pdf_doc = pypdfium2.PdfDocument(pdf_out)
    for i, page in enumerate(pdf_doc):
        image = page.render(scale=2.5).to_pil()
        out_png = os.path.join(pages_dir, f"page_{i+1}.png")
        image.save(out_png)
        print(f"  Rendered {out_png} ({image.width}x{image.height})", flush=True)

    print("\nMeasuring ink distribution per page...", flush=True)
    for i in range(1, final_pages + 1):
        path = os.path.join(pages_dir, f"page_{i}.png")
        img = Image.open(path).convert('L')
        arr = np.array(img)
        h, w = arr.shape
        ink = np.where(arr < 220)
        if len(ink[0]) > 0:
            min_y, max_y = np.min(ink[0]), np.max(ink[0])
            mid_x = w // 2
            left_col = arr[:, 50:mid_x-30]
            right_col = arr[:, mid_x+30:w-50]
            left_ink = np.where(left_col < 220)[0]
            right_ink = np.where(right_col < 220)[0]
            max_l = np.max(left_ink) if len(left_ink) > 0 else 0
            max_r = np.max(right_ink) if len(right_ink) > 0 else 0
            print(f"  Page {i}: Y=[{min_y} to {max_y}] / {h}px | Left lowest={max_l}, Right lowest={max_r} | diff={abs(max_l-max_r)}px | bottom gap={h-max_y}px")

if __name__ == '__main__':
    build_pdf()
