import os
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def generate_ieee_6page_html():
    body_font_pt = 7.75
    table_font_pt = 7.45
    caption_font_pt = 7.15
    ref_font_pt = 7.35

    # Authentic figure paths
    fig1 = os.path.abspath('anesth_ai_ieee/figures_polished/fig1_architecture.png').replace('\\', '/')
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
    margin: 0.46in 0.44in 0.48in 0.44in;
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
    line-height: 1.065;
    color: #000;
    background: #fff;
    text-align: justify;
    text-justify: inter-word;
  }}
  .page {{
    page-break-after: always;
    break-after: page;
    height: 10.06in;
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
    font-size: 15.2pt;
    font-weight: bold;
    line-height: 1.12;
    margin-bottom: 2.0px;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }}
  .authors-block {{
    font-size: 8.7pt;
    margin-bottom: 1.5px;
    line-height: 1.15;
  }}
  .authors-block .name {{
    font-weight: bold;
    font-size: 8.8pt;
  }}
  .affiliations {{
    font-size: 7.7pt;
    font-style: italic;
    color: #111;
    margin-bottom: 1.0px;
    line-height: 1.11;
  }}
  .emails {{
    font-size: 7.5pt;
    margin-bottom: 2.5px;
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
    font-size: 7.9pt;
  }}
  .abstract-text {{
    font-size: 7.75pt;
    font-weight: bold;
    line-height: 1.085;
  }}
  .keywords {{
    font-size: 7.75pt;
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
    font-size: 8.8pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 3.5px;
    margin-bottom: 2.0px;
    break-after: avoid;
  }}
  h3.subsec-heading {{
    font-size: 8.2pt;
    font-style: italic;
    font-weight: bold;
    text-align: left;
    margin-top: 2.5px;
    margin-bottom: 1.5px;
    break-after: avoid;
  }}
  
  p {{
    text-indent: 1.0em;
    margin-bottom: 1.5px;
  }}
  p.no-indent {{
    text-indent: 0;
  }}
  
  .figure-box {{
    text-align: center;
    margin: 2px 0;
    break-inside: avoid;
  }}
  .figure-box img {{
    max-width: 100%;
    height: auto;
  }}
  .caption {{
    font-size: {caption_font_pt}pt;
    text-align: justify;
    line-height: 1.08;
    margin-top: 1.5px;
    margin-bottom: 2.5px;
  }}
  .caption b {{
    font-weight: bold;
  }}
  
  .table-title {{
    font-size: {table_font_pt}pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 2.5px;
    margin-bottom: 1.5px;
    line-height: 1.1;
  }}
  table.ieee-table {{
    width: 100%;
    border-collapse: collapse;
    font-size: {table_font_pt}pt;
    line-height: 1.07;
    margin-bottom: 2.0px;
    border-top: 1.1px solid #000;
    border-bottom: 1.1px solid #000;
  }}
  table.ieee-table th {{
    font-weight: bold;
    border-bottom: 0.8px solid #000;
    padding: 1.5px 2.0px;
    text-align: left;
    background-color: #fafafa;
  }}
  table.ieee-table td {{
    padding: 1.2px 2.0px;
    vertical-align: top;
    border-bottom: 0.4px solid #e2e8f0;
  }}
  table.ieee-table tr:last-child td {{
    border-bottom: none;
  }}
  td.center, th.center {{
    text-align: center;
  }}
  
  ul.ref-list {{
    list-style: none;
    padding-left: 0;
    font-size: {ref_font_pt}pt;
    line-height: 1.07;
  }}
  ul.ref-list li {{
    padding-left: 1.4em;
    text-indent: -1.4em;
    margin-bottom: 1.4px;
    text-align: justify;
  }}
  
  .math-block {{
    text-align: center;
    font-style: italic;
    font-size: 7.7pt;
    line-height: 1.12;
    margin: 2px 0;
  }}
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page" id="page-1">
  <div class="banner">
    <h1 class="paper-title">Anesthesia Dose Calculation and Safety Support System</h1>
    <div class="authors-block">
      <span class="name">Dr. Sowbahgya M. P.<sup>1</sup></span>, 
      <span class="name">Mohammed Shazan<sup>2</sup></span>, 
      <span class="name">Mohan Gowda V. C.<sup>3</sup></span>, and 
      <span class="name">Puneeth S. V.<sup>4</sup></span>
    </div>
    <div class="affiliations">
      Department of Computer Science and Engineering, K. S. Institute of Technology, Visvesvaraya Technological University, Belagavi, Bengaluru, Karnataka &ndash; 560109, India
    </div>
    <div class="emails">
      sowbhagya.mp@gmail.com, mohammedshazan888@gmail.com, mohangowda4983@gmail.com, punithsv948@gmail.com
    </div>
  </div>

  <div class="abstract-box">
    <div class="abstract-text">
      <b class="sec-lbl">Abstract</b>&mdash;Perioperative anesthesia care requires continuous clinical judgment across preoperative planning, drug dosing, multi-parameter hemodynamic monitoring, fluid accounting, and postoperative recovery. While predictive machine learning (ML) models offer clinical decision-support potential, translational utility requires strict methodological hygiene, zero data leakage, transparent calibration, and fail-safe human oversight. This paper presents Anesth AI (derived from the SafeDose platform), a human-in-the-loop perioperative decision-support system integrating parameter-based pharmacological dose support, a decoupled deterministic fluid engine, intraoperative surveillance, and ten operational clinical prediction tasks trained and evaluated across benchmark biomedical repositories (VitalDB, MIT-BIH Arrhythmia Database, MIMIC-IV-ED v2.2, and MIMIC-IV v3.1). Under strict 70/15/15 patient- and record-grouped partitions with target-feature purging, frozen test evaluations achieved: LightGBM Arrhythmia detection on 17,026 beats across 7 held-out MIT-BIH records yielded 85.62% accuracy, 92.01% sensitivity, 82.29% specificity, 0.9414 ROC-AUC, and 0.9494 PR-AUC at validation-locked threshold &tau; = 0.220; LightGBM Hypotension prediction on 708,755 seconds across 35 held-out VitalDB patients yielded 69.20% accuracy, 55.69% sensitivity, 73.59% specificity, 0.6927 ROC-AUC, and 0.4818 PR-AUC at operational threshold &tau; = 0.500; HistGradientBoosting Hypoxia prediction yielded 98.67% accuracy, 48.47% sensitivity, 99.16% specificity, 0.9047 ROC-AUC, and 0.3745 PR-AUC at &tau; = 0.825; and HistGradientBoosting Tachycardia prediction yielded 67.73% accuracy, 62.11% sensitivity, 68.60% specificity, 0.6980 ROC-AUC, and 0.2396 PR-AUC at &tau; = 0.250. The deterministic fluid engine implements Holliday-Segar basal requirements, Estimated Blood Volume, and ATLS hemorrhage classification without automated infusion. Role-based access controls, clinician overrides, and an audited Emergency Break-Glass portal guarantee attending authority. Anesth AI functions strictly in an advisory capacity without autonomous drug delivery, fluid titration, or mechanical ventilation adjustments.
    </div>
    <div class="keywords">
      <b class="sec-lbl">Index Terms</b>&mdash;Anesthesia decision support, perioperative monitoring, physiological risk prediction, ECG arrhythmia detection, clinical safety, human-in-the-loop, zero data leakage.
    </div>
  </div>

  <div class="two-col">
    <h2 class="sec-heading" style="margin-top: 1.5px;">I. Introduction</h2>
    <p class="no-indent">Perioperative anesthesia management requires vigilant vigilance across every surgical phase [1], [2]. Prior to induction, the anesthesia care team assesses anatomical airway difficulty, documents allergies and comorbidities, computes body-habitus metrics, determines ASA Physical Status, and formulates medication strategies. During surgical intervention, continuous telemetry streams&mdash;including arterial pressure waveforms, heart rate, electrocardiography, capnography, and pulse oximetry&mdash;must be interpreted alongside surgical blood loss and intravenous infusions [2]&ndash;[5]. Following emergence, recovery trajectory and postoperative floor transition must be monitored.</p>

    <p>In modern operating suites, critical information is routinely fragmented across standalone monitors, electronic health records (EHR), infusion pumps, and manual charting [3], [4]. This cognitive division increases clinical workload during acute intraoperative volatility. While artificial intelligence and machine learning hold substantial promise for anticipating physiological instability, translational deployment has been severely constrained by methodological flaws: unstratified random data splitting that induces cross-partition patient leakage, incorporation of target-defining physiological predictors, uncalibrated probability thresholds, and opaque architectures lacking human-in-the-loop boundaries [18], [25].</p>

    <p>To address these challenges, we introduce Anesth AI, a comprehensive perioperative decision-support platform designed to unify clinical workflow while maintaining strict safety controls. The core contributions of this investigation are:</p>
    <p>&bull; <i>Multi-Phase Perioperative Architecture:</i> Seamless integration of preoperative assessment, parameter-driven dose support, continuous intraoperative surveillance, and PACU recovery scoring within a unified, high-performance web interface.</p>
    <p>&bull; <i>Ten Operational Production Models:</i> Systematic training and benchmark evaluation across four international repositories (VitalDB, MIT-BIH, MIMIC-IV-ED, MIMIC-IV) spanning hemodynamic instability, electrophysiology, surgical hemorrhage, fluid responsiveness, and critical care transfer.</p>
    <p>&bull; <i>Strict Zero-Leakage Protocol:</i> Patient- and record-grouped 70/15/15 partitioning (P_train &cap; P_val = &empty;, P_train &cap; P_test = &empty;) coupled with absolute purging of target-defining variables and train-only transformation fitting.</p>
    <p>&bull; <i>Decoupled Deterministic Fluid Engine:</i> Complete mathematical separation of empirical machine learning fluid recommendations from an arithmetic service executing Holliday-Segar, Estimated Blood Volume (EBV), and ATLS hemorrhage grading.</p>
    <p>&bull; <i>Authentic Electrophysiological Revalidation:</i> Complete cardiological revalidation on 48 MIT-BIH records (109,494 beats) eliminating legacy parsing artifacts, achieving 85.62% accuracy and 92.01% sensitivity on 17,026 held-out test beats.</p>
    <p>&bull; <i>Human-in-the-Loop Governance:</i> Centralized role-based access control (RBAC), auditable clinician override logging, nominal alert semantics, and an audited Emergency Break-Glass portal.</p>

    <h2 class="sec-heading">II. Related Work</h2>
    <p class="no-indent">Intraoperative risk prediction has advanced rapidly through machine learning. Moon et al. [1] engineered frequency-domain deep neural networks with non-invasive features for intraoperative hypotension (IOH) prediction on VitalDB, demonstrating that continuous arterial waveform dynamics provide early warning before mean arterial pressure falls below 65 mmHg. Baum et al. [2] developed dynamic estimation models of cardiovascular state from arterial lines, enabling real-time vascular resistance tracking. Zhao et al. [5] utilized machine learning classifiers on pre-induction patient features to anticipate post-induction arterial collapse. However, these systems focus primarily on isolated hemodynamic endpoints without integrating surgical fluid shifts or operating theater checklists.</p>

    <p>In electrocardiology, automated arrhythmia detection has evolved from single-lead heuristics to deep feature learning. Zhang, Chen, and Wu [6] proposed explainable federated learning for cardiac arrhythmia detection across distributed clinical silos. Gao et al. [7] formulated ECG-CL, a continual learning framework for multi-label interpretation. Vasconcellos et al. [13] evaluated Siamese convolutional architectures for heartbeat classification, while Dong and Si [16] extracted interpretable heartbeat dynamics for rhythm discrimination. Kim et al. [17] developed edge-optimized lightweight arrhythmia models, and Ma et al. [20] provided an extensive survey on ambulatory atrial fibrillation surveillance. Crucially, Mehari and Strodthoff [25] demonstrated that non-grouped beat splitting induces severe optimistic performance bias, establishing record-independent evaluation as the definitive benchmark standard.</p>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page" id="page-2">
  <div class="two-col">
    <p class="no-indent">In electronic health record risk stratification, large-scale deep sequence models have been deployed to anticipate intensive care unit transfer and perioperative mortality. Dai, Hwang, and Tseng [8] engineered deep reinforcement policy systems for critical care early warning (PoEMS), while Shirali, Schubert, and Alaa [9] introduced action space pruning for reliable critical care policies. Wang et al. [12] evaluated stochastic signal analysis for ICU outcome prediction, and Tang et al. [19] formulated multimodal graph networks for hospital readmission. Wu et al. [14] developed alternating deep sequential models for treatment forecasting, and Ramadhan [18] emphasized structured data preprocessing and leakage prevention. However, hospital-level models operate as black boxes, lacking integration with intraoperative surgical checklists, airway difficulty indices, or deterministic fluid equations. Similarly, closed-loop anesthesia delivery platforms investigated by Liu et al. [3] and Nair et al. [4] emphasize automated control but exhibit substantial safety vulnerabilities during rapid hemodynamic volatility. Table I summarizes representative recent studies published between 2023 and 2025.</p>

    <div style="column-span: all; margin: 2.0px 0;">
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

    <h2 class="sec-heading">III. System Design and Clinical Workflow</h2>
    <p class="no-indent">Anesth AI is engineered as an enterprise-grade clinical decision-support prototype operating under strict human-in-the-loop governance [1]–[5]. The platform is intentionally decoupled from autonomous control mechanisms: it does not autonomously infuse pharmacological agents, titrate anesthesia depth, administer intravenous fluids, or alter ventilator settings. Instead, the architecture establishes a multi-tiered decision-support pipeline that ingests complex patient parameters, executes deterministic physiological calculations, delivers well-calibrated machine learning risk estimates, and logs all clinician interactions (Fig. 1).</p>

    <div style="column-span: all; margin: 2px 0;">
      <div class="figure-box">
        <img src="{fig1}" alt="Overall System Architecture" style="width: 96%;">
        <div class="caption"><b>Fig. 1.</b> System architecture of Anesth AI displaying verified production modules and explicitly labeled demonstration/simulated components.</div>
      </div>
    </div>

    <p>As illustrated in Fig. 1, the logical system architecture is organized into ten tightly coupled functional tiers: <i>Clinical Data Sources:</i> VitalDB (235 study cases / 6,388 registry cases), MIT-BIH (48 records), MIMIC-IV-ED, and MIMIC-IV; <i>Data Acquisition &amp; Preprocessing Pipeline:</i> Sensor dropout cleaning, train-only median imputation, Pan-Tompkins QRS alignment, zero-leakage grouped partitioning, and target purging; <i>Clinical Feature Processing:</i> Patient habitus (TBW, BMI, Janmahasatian LBM), backward rolling telemetry windows [t-300s, t], and cumulative fluid shifts; <i>ML Prediction Engine:</i> Exactly 10 production clinical prediction tasks evaluated on frozen test sets (experimental modules such as Airway and PONV return HTTP 503 and are excluded from benchmarks); <i>Clinical Decision-Support Layer:</i> Multi-level alert mapping, TreeSHAP attributions, nominal alert semantics, and mandatory clinician review; <i>Clinical Calculation &amp; Safety Modules:</i> Deterministic dose calculation, Janmahasatian LBM, Holliday-Segar fluid engine, ASA confirmation, and WHO safety checklists; <i>FastAPI / Python Backend:</i> Asynchronous routing, Pydantic validation, frozen model inference, and REST APIs; <i>Anesth AI Clinical Interface:</i> React 19, TypeScript, and Vite 8 dashboards (incorporating simulated telemetry playback demonstration); <i>Security &amp; Audit:</i> RBAC, clinician authentication, Emergency Break-Glass, immutable audit logs, and Indian emergency contact advisory display (112/108); and <i>Clinician Review / Clinical Decision:</i> Attending anesthesiologist authority enforcing strictly non-autonomous execution.</p>
  </div>
</div>

<!-- PAGE 3 -->
<div class="page" id="page-3">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">A. Modular Implementation and Clinical UI Modules</h3>
    <p class="no-indent">The Anesth AI web application provides a comprehensive suite of dedicated clinical views developed in React 19 and Vite 8: <b>Clinical Dashboard:</b> High-level perioperative case overview and room-by-room status; <b>Patient Management:</b> Demographic entry, clinical history, and laboratory profiling; <b>Preoperative Assessment:</b> Comprehensive anatomical airway assessment, ASA Physical Status assignment, comorbidity mapping, and pre-induction checklist verification; <b>Anesthesia Planner:</b> Case scheduling, technique selection, and equipment readiness; <b>Dose Calculator:</b> Real-time parameter-based pharmacological dose decision support utilizing TBW, BMI, and Janmahasatian lean body mass; <b>Airway Assessment:</b> Structured evaluation of Mallampati score, thyromental distance, cervical spine range of motion, and difficult airway flags; <b>Live OT Telemetry:</b> Real-time multi-parameter intraoperative waveforms, numeric telemetry, alert banners, and acknowledge/override toggles; <b>Anesthesia Record:</b> Formal intraoperative anesthesia charting and chronological event logs; <b>Postoperative PACU:</b> Recovery tracking, vital monitoring, and Modified Aldrete scoring; <b>Postoperative Monitoring:</b> Extended floor-ward transition surveillance; <b>Clinical Models Registry:</b> Inventory of the ten production machine learning models, active versions, and performance metadata; <b>Safety Overview:</b> Aggregated perioperative risk flags and institutional checklist compliance; <b>Intraoperative Safety:</b> Granular hemodynamic limit monitoring and alert configuration; <b>Clinical Analytics:</b> Case duration distributions, alert frequency trends, and complication statistics; <b>Administration &amp; Audit:</b> Role-based user management, access control logs, and clinician override auditing; and <b>Emergency Break-Glass Portal:</b> Rapid elevated access interface with auditable rationale logging and emergency dispatch contacts.</p>

    <h3 class="subsec-heading">B. Three-Phase Perioperative Workflow</h3>
    <p>Clinical governance follows a structured three-phase sequence mirroring real-world surgical pathways (Fig. 2):</p>
    <p><i>Preoperative Phase:</i> Begins with patient demographic capture (age, biological sex, height, measured weight), calculation of body mass index (BMI) and lean body mass (LBM), anatomical airway scoring, clinician confirmation of the ASA Physical Status Classification, emergency status determination, laboratory analysis review, parameter-based dose calculation support, blood availability verification, and sign-off of the WHO Pre-Induction Checklist.</p>
    <p><i>Intraoperative Phase:</i> Upon induction, the system ingests continuous telemetry streams (heart rate, arterial pressures, pulse oximetry, respiratory rate, capnography, core temperature). Telemetry data feeds the frozen machine learning models to forecast impending hemodynamic instability while the deterministic fluid engine computes cumulative input, measured losses, net balance, and urine output rates. All alerts require explicit attending acknowledgment or logged override.</p>
    <p><i>Postoperative Phase:</i> Following emergence, the patient transitions to the Post-Anesthesia Care Unit (PACU). Monitoring centers on continuous vital sign surveillance, Modified Aldrete recovery scoring (motor activity, respiration, circulation, consciousness, SpO2), ongoing fluid balance tracking, execution of the WHO Surgical Sign-Out Checklist, and structured handover documentation.</p>

    <div style="column-span: all; margin: 2px 0;">
      <div class="figure-box">
        <img src="{fig2}" alt="Three-Phase Perioperative Clinical Workflow" style="width: 96%;">
        <div class="caption"><b>Fig. 2.</b> Three-phase perioperative workflow implemented in Anesth AI.</div>
      </div>
    </div>

    <h2 class="sec-heading">IV. Datasets and Leakage-Controlled Methodology</h2>
    <h3 class="subsec-heading">A. Benchmark Clinical Repositories</h3>
    <p class="no-indent">Model training and evaluation utilized four internationally recognized biomedical repositories (Table II): <b>VitalDB</b>: The public online repository contains 6,388 cases; our local experimental investigation utilizes 235 high-fidelity surgical cases with 1-second continuous recordings (708,755 retrospective 5-minute time windows across 35 held-out test patients under seed 42) with arterial pressures, heart rate, SpO2, capnography, and central venous pressure, powering the Hypotension, Hypoxia, Bradycardia, and Tachycardia models [1], [5]; <b>MIT-BIH Arrhythmia Database</b>: 48 two-channel ambulatory Holter ECG recordings sampled at 360 Hz with expert cardiological annotations (109,494 authentic beats), powering the Arrhythmia model [6], [7], [13], [16], [17], [20], [25]; <b>MIMIC-IV-ED v2.2</b>: Comprehensive emergency department electronic health records comprising 425,087 encounters across 205,504 unique patients, powering the Emergency Severity model [14]; and <b>MIMIC-IV In-Hospital v3.1</b>: Inpatient clinical records comprising 299,712 hospital admissions with laboratory analyses, fluid balance sheets, and clinical outcomes, powering the Blood Loss, Fluid Recommendation, ICU Admission, and Mortality models [8], [9], [12], [14], [19].</p>

    <div style="margin: 2px 0;">
      <div class="table-title">Table II: Dataset and Preprocessing Specifications</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 14%;">Dataset</th>
            <th style="width: 18%;">Modality</th>
            <th style="width: 20%;">Cohort</th>
            <th style="width: 22%;">Clinical Tasks</th>
            <th style="width: 26%;">Preprocessing Protocol</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>VitalDB</b></td>
            <td>High-frequency perioperative telemetry</td>
            <td>235 cases (6,388 registry) / 708,755 test sec</td>
            <td>Hypotension, Hypoxia, Bradycardia, Tachycardia</td>
            <td>Backward rolling windows [t-300s, t]; target-feature purging.</td>
          </tr>
          <tr>
            <td><b>MIT-BIH</b></td>
            <td>Two-channel ECG, 360 Hz</td>
            <td>48 records / 109,494 beats (17,026 test)</td>
            <td>Arrhythmia Detection</td>
            <td>QRS Pan-Tompkins alignment, 360-sample beat windows, record split.</td>
          </tr>
          <tr>
            <td><b>MIMIC-IV-ED</b></td>
            <td>Emergency EHR records</td>
            <td>425,087 encounters / 205,504 patients</td>
            <td>Emergency Severity</td>
            <td>Target acuity removal, train-only median imputation, target encoding.</td>
          </tr>
          <tr>
            <td><b>MIMIC-IV</b></td>
            <td>Inpatient EHR/labs/clinical events</td>
            <td>299,712 hospital admissions</td>
            <td>Blood Loss, Fluid Recommendation, ICU Admission, Mortality</td>
            <td>Target variable purging, train-only normalization, sequence padding (seq_len=24).</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="subsec-heading">B. Rigorous Preprocessing and Feature Pipeline</h3>
    <p class="no-indent">Raw physiological time series and EHR tables undergo a standardized, automated preprocessing pipeline: <i>Data Ingestion and Cleaning:</i> Artifacts, sensor dropouts, and non-physiological outliers (e.g., negative blood pressures, SpO2 &gt; 100%) were filtered; <i>Missing-Value Handling:</i> Median imputation fitted strictly on training data partitions was applied to numeric features, while missing categorical values were mapped to a distinct missing indicator; <i>Temporal Aggregation:</i> For telemetry data, 5-minute rolling windows [t - 300s, t] were aggregated using backward summary statistics (mean, median, standard deviation, minimum, maximum, linear slope); <i>ECG Beat Segmentation:</i> ECG channels were filtered using bandpass filtering (0.5–40 Hz), with R-peaks detected via Pan-Tompkins algorithm, extracting 360-sample windows (-150 to +210 samples around R-peaks); <i>Sequence Construction:</i> Inpatient temporal lab and vital sequences were padded to standardized sequence lengths (seq_len=24) with masking layers for recurrent deep networks; and <i>Target-Definition Review:</i> Ground truth clinical targets were cross-referenced against published clinical consensus definitions (e.g., MAP &lt; 65 mmHg for Hypotension, SpO2 &lt; 90% for Hypoxia, HR &lt; 60 bpm for Bradycardia, HR &gt; 100 bpm for Tachycardia).</p>

    <h3 class="subsec-heading">C. Leakage Prevention Protocol</h3>
    <p>To eliminate methodological and data leakage, a strict leakage prevention protocol was enforced across all models [18], [25]: <i>Patient/Record Grouped Partitioning:</i> Data was partitioned into 70% Training, 15% Validation, and 15% Frozen Test cohorts strictly grouped by patient or record identifiers (caseid in VitalDB, subject_id in MIMIC-IV and MIMIC-IV-ED, and record_id in MIT-BIH), ensuring zero patient overlap such that P_train &cap; P_val = &empty; and P_train &cap; P_test = &empty;; <i>Target-Defining Feature Purging:</i> Features that mechanically define target outcomes were permanently removed: continuous invasive arterial pressures (SBP, DBP, MAP) were purged from Hypotension; continuous SpO2 was purged from Hypoxia; heart rate indicators were purged from Bradycardia and Tachycardia; emergency triage acuity scores were purged from Emergency Severity; and post-admission laboratory measurements and hospital length-of-stay metrics were purged from inpatient models; <i>Train-Only Preprocessing Parameter Fitting:</i> Imputation medians, frequency tables, and StandardScaler parameters were computed exclusively on training partitions and applied without alteration to validation and test partitions; <i>Pre-Outcome Backward Rolling Windows:</i> All telemetry summary statistics were computed backward across [t - 300s, t] without forward-looking temporal leakage; and <i>Single-Touch Frozen Evaluation:</i> The test sets were held completely untouched during feature engineering, model architecture exploration, and hyperparameter tuning; optimal decision thresholds were selected on validation Precision-Recall curves and subsequently evaluated once on the frozen test sets.</p>
  </div>
</div>

<!-- PAGE 4 -->
<div class="page" id="page-4">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">D. Operational Machine Learning Architectures</h3>
    <p class="no-indent">Rather than enforcing a single learning algorithm across heterogeneous clinical modalities, Anesth AI deploys task-specific champion architectures selected via systematic empirical evaluation (Table III) [1], [6], [12]–[14]: <i>LightGBM:</i> Deployed for Hypotension, Arrhythmia Detection, and Fluid Recommendation, providing fast leaf-wise tree growth, native categorical support, exact TreeSHAP attribution compatibility, and strong probability calibration across high-dimensional feature spaces; <i>HistGradientBoosting:</i> Selected for Hypoxia and Tachycardia [1], [4] due to its native handling of missing values, rapid inference latency, and robust leaf-wise histogram binning across continuous surgical telemetry vectors comprising backward rolling summary statistics (mean, median, standard deviation, min, max, linear slope over 5-minute windows [t - 300s, t]); <i>CatBoost:</i> Selected for Emergency Severity Assessment [14] due to its specialized handling of high-cardinality categorical variables (chief complaints, arrival modes, insurance types) using ordered target encoding and symmetric oblivious decision trees that resist overfitting; <i>ClinicalCNN (1D-CNN):</i> Engineered for Bradycardia telemetry classification, employing three 1D convolutional layers (kernel sizes 3 and 5, filter depth 64–128) with batch normalization, ReLU activation, max-pooling, and dropout (0.25) to capture localized morphological waveform shifts; <i>ClinicalLSTM:</i> Deployed for Surgical Blood Loss prediction, utilizing a two-layer bidirectional Long Short-Term Memory network (hidden dimension 64, dropout 0.20) to capture cumulative fluid shift dependencies; and <i>ClinicalGRU:</i> Utilized for ICU Admission and In-Hospital Mortality [12], [14], leveraging a two-layer Gated Recurrent Unit network (hidden dimension 64, dropout 0.20) with masked loss functions for efficient sequential learning over irregularly sampled inpatient laboratory trajectories (seq_len=24). Non-validated demonstration modules (Airway, RiskPrediction, PONV, PACU, DrugSafety, prototype_baseline) return HTTP 503 Service Unavailable and are maintained strictly as non-validated prototype software modules excluded from scientific benchmark claims.</p>

    <div style="margin: 2.5px 0;">
      <div class="table-title">Table III: Ten Operational Production Clinical Tasks</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 8%;">No.</th>
            <th style="width: 28%;">Clinical Task</th>
            <th style="width: 28%;">Benchmark Dataset</th>
            <th style="width: 36%;">Production Model</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="center">1</td><td>Hypotension</td><td>VitalDB</td><td>LightGBM</td></tr>
          <tr><td class="center">2</td><td>Hypoxia</td><td>VitalDB</td><td>HistGradientBoosting</td></tr>
          <tr><td class="center">3</td><td>Bradycardia</td><td>VitalDB</td><td>ClinicalCNN</td></tr>
          <tr><td class="center">4</td><td>Tachycardia</td><td>VitalDB</td><td>HistGradientBoosting</td></tr>
          <tr><td class="center">5</td><td>Arrhythmia</td><td>MIT-BIH</td><td>LightGBM</td></tr>
          <tr><td class="center">6</td><td>Emergency Severity</td><td>MIMIC-IV-ED</td><td>CatBoost</td></tr>
          <tr><td class="center">7</td><td>Blood Loss</td><td>MIMIC-IV</td><td>ClinicalLSTM</td></tr>
          <tr><td class="center">8</td><td>Fluid Recommendation</td><td>MIMIC-IV</td><td>LightGBM</td></tr>
          <tr><td class="center">9</td><td>ICU Admission</td><td>MIMIC-IV</td><td>ClinicalGRU</td></tr>
          <tr><td class="center">10</td><td>Mortality</td><td>MIMIC-IV</td><td>ClinicalGRU</td></tr>
        </tbody>
      </table>
    </div>

    <h3 class="subsec-heading" style="margin-top: 2.5px;">E. Explainable AI (XAI) Attribution</h3>
    <p class="no-indent">To prevent black-box opacity in high-stakes clinical decision-making, explainable AI is integrated via TreeSHAP (SHapley Additive exPlanations) for gradient boosted tree models and gradient saliency maps for deep sequence architectures [11]. For each prediction, the system computes exact local Shapley values, quantifying the positive or negative contribution of individual physiological features toward the final risk estimate. The clinical dashboard renders horizontal attribution bars displaying top risk drivers alongside model-estimated probabilities. Attendings review these attributions prior to taking clinical action. The system does not assert unverified feature importance rankings; all explanations are derived dynamically from verified project model artifacts.</p>

    <h2 class="sec-heading" style="margin-top: 3.5px;">V. Clinical Calculation, Safety and XAI</h2>
    <h3 class="subsec-heading" style="margin-top: 2px;">A. Anesthesia Dose Calculation Decision Support</h3>
    <p class="no-indent">Pharmacological dose support in Anesth AI provides deterministic, parameter-driven calculation guidance based on patient-specific physiological indicators [3], [5]: Total Body Weight (TBW = measured body weight in kg); Body Mass Index (BMI = Weight / Height&sup2;); and Lean Body Mass (LBM) computed via the authoritative Janmahasatian formulation:</p>
    <div class="math-block" style="margin: 3px 0; padding: 2px 4px;">
      LBM<sub>Male</sub> = (9270 &times; W) / (6680 + 216 &times; BMI)<br>
      LBM<sub>Female</sub> = (9270 &times; W) / (8780 + 244 &times; BMI)
    </div>
    <p>Body-size normalization is vital because dosing hydrophilic medications solely on TBW in obese patients can precipitate severe overdosing, whereas dosing lipophilic agents strictly on ideal weight risks inadequate anesthesia depth. The Janmahasatian formulation provides an empirical, fat-free mass reference that preserves target-controlled infusion accuracy across broad demographic cohorts without requiring invasive bioimpedance analysis. The dosing engine incorporates physiological scaling adjustments for age-related clearance reductions in geriatric cohorts (&ge; 65 years) and evaluates organ-function safety flags for severe aortic stenosis, renal impairment, and hepatic insufficiency. The workflow systematically evaluates patient body habitus to determine whether TBW or LBM serves as the clinically indicated dosing scalar: Patient Data &rarr; TBW/BMI &rarr; LBM where applicable &rarr; dosing basis &rarr; configured calculation &rarr; safety checks &rarr; clinician review &rarr; documented recommendation (Fig. 3). Specific drug dosing parameters not provided in verified project references remain under attending clinician determination. The module provides calculation support and requires clinician verification before clinical use.</p>

    <h3 class="subsec-heading" style="margin-top: 2.5px;">B. Deterministic Physiological Fluid Engine</h3>
    <p class="no-indent">Intraoperative fluid management requires transparent physiological accounting rather than opaque machine learning regression [2], [4]. Anesth AI completely decouples: <i>Statistical ML Fluid Recommendation:</i> A validated LightGBM classifier predicting the empirical probability that similar surgical patients received fluid boluses; and <i>Deterministic Physiological Fluid Engine:</i> An arithmetic service executing authoritative physiological equations:</p>
    <p><i>Holliday-Segar Maintenance Rate (R in mL/hr):</i> For W &le; 10 kg: R = 4W; for 10 &lt; W &le; 20 kg: R = 40 + 2(W - 10); for W &gt; 20 kg: R = 60 + (W - 20). The Holliday-Segar calculation is used as a basal/reference calculation and is not presented as a universal intraoperative fluid prescription; third-space replacement formulas are deliberately omitted.</p>

    <div class="figure-box" style="margin: 2px 0;">
      <img src="{fig3}" alt="Drug Dose Calculation Support" style="width: 75%;">
      <div class="caption"><b>Fig. 3.</b> Anesth AI anesthesia dose-calculation decision-support interface.</div>
    </div>

    <p><i>Cumulative Fluid Input (F_in):</i> F_in = Crystalloids + Colloids + Blood Products + Other documented IV inputs.</p>
    <p><i>Cumulative Measured Fluid Losses (F_loss):</i> F_loss = Blood Loss + Urine Output + Drain/Suction Losses + Other measured losses.</p>
    <p><i>Net Fluid Balance:</i> Net Balance = F_in - F_loss; Normalized Net Balance = Net Balance / Weight (mL/kg).</p>
    <p><i>Urine Output Rate:</i> UO_rate = Urine Volume / (Weight &times; Duration) in mL/kg/hr.</p>
    <p><i>Estimated Blood Volume (EBV):</i> EBV = Weight &times; 70 mL/kg (Male), Weight &times; 65 mL/kg (Female).</p>
    <p><i>Blood Loss Percentage:</i> Blood Loss % = (Measured Blood Loss / EBV) &times; 100, mapped to configured ATLS hemorrhage reference categories (Classes I–IV).</p>
    <p><i>Configured Fluid Safety Flags:</i> Advisory flags highlight excessive positive fluid balance (&gt;30 mL/kg or &gt;2500 mL), sustained oliguria (&lt;0.5 mL/kg/hr for &gt;1 hr), significant surgical hemorrhage (&gt;15% EBV), and ATLS Class III/IV shock. Alerts operate strictly as decision-support safety flags rather than treatment commands. The system does not autonomously administer or titrate fluids.</p>

    <h3 class="subsec-heading" style="margin-top: 2.5px;">C. Clinician-Confirmed ASA Physical Status Classification</h3>
    <p>The platform strictly adheres to the standardized terminology: <b>ASA Physical Status Classification</b> (ASA I through ASA VI): ASA I (Normal healthy patient), ASA II (Mild systemic disease), ASA III (Severe systemic disease), ASA IV (Severe systemic disease that is a constant threat to life), ASA V (Moribund patient not expected to survive without the operation), and ASA VI (Declared brain-dead organ donor). Emergency case status is captured via an independent clinical toggle; when affirmed, modifier "E" is appended (e.g., ASA III-E). Automated AI assignment of ASA status is prohibited; the attending clinician selects and confirms the classification with provider credentials, timestamp, and clinical justification.</p>

    <h3 class="subsec-heading" style="margin-top: 2.5px;">D. Intraoperative Safety Monitoring and Checklists</h3>
    <p>The telemetry module continuously tracks HR, ECG, SBP, DBP, MAP, SpO2, RR, EtCO2, temperature, urine output, blood loss, fluid input, and fluid balance (Fig. 4). When all values reside within normal limits, the interface displays: <i>"Monitoring status: No configured alerts currently triggered."</i> Generic or unqualified declarations of safety (such as "Patient is safe") are strictly prohibited. When an alert triggers, the interface presents the parameter, current value, trend direction, severity level, potential clinical causes, recommended verification checks, and logs clinician acknowledgment or override rationale into the immutable audit trail.</p>

    <p>Configured physiological limits encompass severe hypotension (MAP &lt; 65 mmHg or SBP &lt; 90 mmHg), acute hypoxia (SpO2 &lt; 90%), severe bradycardia (HR &lt; 50 bpm), tachycardia (HR &gt; 100 bpm), hypothermia (core temperature &lt; 35.5&deg;C), hypercarbia (EtCO2 &gt; 50 mmHg), and oliguria (urine output &lt; 0.5 mL/kg/hr). In accordance with WHO surgical guidelines, the system enforces structured verification: Pre-Induction Checklist (21 verified checkpoints covering patient identity, procedure, consent, allergies, ASA status, airway difficulty, aspiration risk, comorbidities, IV access, blood availability, anesthesia plan, monitoring plan, oxygen, airway equipment, suction, medication verification, difficult-airway planning, anticipated blood loss) and Surgical Sign-Out Checklist (12 verified post-op checkpoints).</p>

    <div class="figure-box" style="margin: 2px 0;">
      <img src="{fig4}" alt="Live Operating Theater Monitoring" style="width: 72%;">
      <div class="caption"><b>Fig. 4.</b> Live operating theatre telemetry and clinical decision-support interface of Anesth AI.</div>
    </div>
  </div>
</div>

<!-- PAGE 5 -->
<div class="page" id="page-5">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">E. Security, Role-Based Access, and Emergency Break-Glass</h3>
    <p class="no-indent">System security is governed by role-based access control (RBAC), restricting clinical configuration, patient telemetry, and audit log inspection [1], [4]. For acute emergencies requiring immediate clinical access, the platform implements an audited Emergency Break-Glass workflow (Fig. 5). Activating Break-Glass grants temporary scoped access while mandating clinical justification (&ge;10 characters), logging attending credentials and timestamps, and presenting quick-dial links to Indian national emergency services (112 &mdash; National Emergency Number; 108 &mdash; Ambulance / EMS). The system provides clinical decision support; it does not perform automated emergency dispatch or autonomous intervention.</p>

    <h2 class="sec-heading" style="margin-top: 2.0px;">VI. Results and Evaluation</h2>
    <p class="no-indent">The ten operational clinical prediction tasks were systematically evaluated on untouched, patient-independent held-out cohorts under zero-leakage protocols [25]. Table IV summarizes the verified baseline and champion performance across all ten tasks.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig5}" alt="Emergency Break-Glass Portal" style="width: 100%; height: auto; display: block; margin: 0 auto; border: 0.5px solid #888; border-radius: 2px;">
      <div class="caption"><b>Fig. 5.</b> Emergency Break-Glass access interface with audited emergency access controls.</div>
    </div>

    <div style="column-span: all; margin: 2px 0;">
      <div class="table-title">Table IV: Performance of the Ten Clinical Prediction Tasks on Frozen Test Cohorts</div>
      <table class="ieee-table">
        <thead>
          <tr>
            <th style="width: 14%;">Task</th>
            <th style="width: 9%;">Dataset</th>
            <th style="width: 14%;">Model</th>
            <th style="width: 8%;">Test Cohort</th>
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
            <td>LightGBM</td>
            <td class="center">708,755</td>
            <td class="center">173,859</td>
            <td class="center">0.500</td>
            <td class="center">69.20%</td>
            <td class="center">55.69%</td>
            <td class="center">73.59%</td>
            <td class="center">40.67%</td>
            <td class="center">47.01%</td>
            <td class="center">0.6927</td>
            <td class="center">0.4818</td>
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
            <td class="center">0.3745</td>
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
            <td class="center">0.2396</td>
            <td class="center">0.1353</td>
          </tr>
          <tr>
            <td>Arrhythmia</td>
            <td>MIT-BIH</td>
            <td>LightGBM</td>
            <td class="center">17,026</td>
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

    <h3 class="subsec-heading">A. Production Model Verification &amp; Operating Point Disclosure</h3>
    <p class="no-indent">For Hypotension prediction on VitalDB, initial exploratory modeling evaluated HistGradientBoosting at &tau; = 0.475 (AUROC 0.6974, F1 46.86%). However, the production model served by the platform API is LightGBM deployed at operating threshold &tau; = 0.500 (ROC-AUC 0.6927, PR-AUC 0.4818, Accuracy 69.20%, Sensitivity 55.69%, Specificity 73.59%, Precision 40.67%, F1 47.01%). In this investigation, we avoid mixing metrics across different thresholds and report the verified LightGBM &tau; = 0.500 production operating point directly. Across the other VitalDB tasks, Hypoxia demonstrates strong discrimination (AUROC 0.9047) with high specificity (99.16%) but low sensitivity (48.47%) due to extreme event sparsity (0.99% positive prevalence). In Tachycardia, the HistGradientBoosting model at &tau; = 0.250 balances sensitivity (62.11%) against false alerts. In Bradycardia, the 1D-CNN achieves 77.48% accuracy and 0.6448 AUROC.</p>

    <div style="column-span: all; margin: 2px 0;">
      <div class="table-title">Table V: Empirical Comparison of Evaluated Inpatient and Triage Architectures</div>
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
            <td>LightGBM</td>
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

    <div style="column-span: all; margin: 2px 0;">
      <div class="figure-box">
        <img src="{fig6}" alt="ROC and PR Performance Curves" style="width: 96%;">
        <div class="caption"><b>Fig. 6.</b> Genuine ROC and Precision-Recall characteristics generated directly from exported per-sample prediction cohorts for the four verified clinical tasks. Solid circles denote operational threshold operating points.</div>
      </div>
    </div>
  </div>
</div>

<!-- PAGE 6 -->
<div class="page" id="page-6">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">B. Authentic MIT-BIH Revalidation and Confusion Matrix</h3>
    <p class="no-indent">An earlier annotation parsing issue was corrected by parsing all 48 authentic MIT-BIH records (109,494 beats: 75,052 Normal, 34,442 Arrhythmia/Abnormal) under a strict record-independent split: 34 train records (76,865 beats), 7 validation records (15,600 beats), and 7 frozen test records (records 102, 103, 200, 210, 213, 217, 220; 17,026 verified beats: 11,183 normal, 5,843 arrhythmia) [6], [7], [13], [16], [17], [20], [25]. The LightGBM model detected 5,376 of 5,843 arrhythmias, achieving 85.62% Accuracy, 87.15% Balanced Accuracy, 92.01% Sensitivity, 82.29% Specificity, 73.07% Precision, 81.45% F1-Score, 0.9414 ROC-AUC, 0.9494 PR-AUC, and 0.0613 Brier score (Table VI, Fig. 7). This revalidation rectifies historic evaluation artifacts with authentic cardiological ground truth.</p>

    <p>The authentic confusion matrix (Table VI, Fig. 7) reveals a clinically optimal error distribution: the high sensitivity of 92.01% ensures that only 467 true arrhythmia beats were missed (false negatives), whereas 5,376 malignant ectopic events were successfully captured (true positives). In intraoperative cardiac surveillance, capturing premature ventricular contractions (PVCs), bigeminy, and conduction abnormalities is critical to prevent escalation into ventricular fibrillation or asystole. The false-positive rate (1,981 beats, 17.71% of normal beats) represents a clinically manageable trade-off that is quickly reviewed by the attending anesthesiologist on the real-time ECG telemetry strip. Crucially, this evaluation eliminates the 100% accuracy artifact that arose in earlier literature from improper record parsing.</p>

    <div style="margin: 2px 0;">
      <table class="ieee-table">
        <thead>
          <tr>
            <th colspan="4">Table VI: MIT-BIH Arrhythmia Confusion Matrix (N = 17,026 Beats)</th>
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
            <td class="center">11,183</td>
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
            <td class="center">17,026</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig7}" alt="Arrhythmia Confusion Matrix" style="width: 54%;">
      <div class="caption"><b>Fig. 7.</b> Confusion matrix for the authentic frozen-test MIT-BIH arrhythmia evaluation.</div>
    </div>

    <h3 class="subsec-heading">C. Probability Calibration and Clinical Utility</h3>
    <p class="no-indent">Because clinical decision support requires trustworthy risk estimations rather than overconfident binary labels [11], [22], probabilistic calibration was quantified across all ten tasks using the Brier score: Hypotension (0.1924), Hypoxia (0.0338), Bradycardia (0.2037), Tachycardia (0.1353), Arrhythmia (0.0613), Emergency Severity (0.2137), Blood Loss (0.1617), Fluid Recommendation (0.1492), ICU Admission (0.1413), and Mortality (0.1356). The Brier score measures the mean squared difference between predicted probabilities and actual binary outcomes; lower values denote superior calibration. Rare events such as Hypoxia and Mortality demonstrate low Brier scores consistent with low baseline prevalence, whereas moderate scores in Emergency Severity and Bradycardia indicate that risk estimates should be interpreted in conjunction with real-time patient clinical context rather than as definitive diagnoses.</p>

    <p>In operating theater practice, well-calibrated probabilistic risk estimates enable multi-tiered alert semantics: green indicates nominal risk (&lt;20%), yellow denotes advisory surveillance (20–50%), orange signifies elevated warning (50–75%), and red triggers critical attending review (&gt;75%). This graded alert stratification prevents binary alert fatigue while preserving high clinical situational awareness across prolonged surgical procedures [10], [15].</p>

    <h2 class="sec-heading">VII. Limitations and Future Work</h2>
    <p class="no-indent"><b>Clinical and Methodological Limitations:</b> While Anesth AI establishes a rigorous, leakage-controlled foundation for perioperative decision support [18], [25], several key limitations must be emphasized: All ten prediction models were trained and benchmarked on retrospective observational cohorts (VitalDB from South Korea, MIT-BIH, and MIMIC-IV from the United States); differences in institutional protocols, surgical case mix, patient genetics, and drug administration habits across international hospitals may induce domain shift; Anesth AI is developed strictly as an academic research decision-support prototype and has not received regulatory clearance (such as FDA 510(k) or CE mark) as a commercial medical device; The platform has not undergone prospective randomized controlled clinical trial evaluation; In highly imbalanced tasks such as Hypoxia (0.99% prevalence) and In-Hospital Mortality (2.22% prevalence), positive predictive value remains modest despite high specificity, requiring clinicians to interpret flags within holistic clinical context; High-frequency operating theater ECG telemetry is susceptible to surgical electrocautery and motion artifacts that differ from clean ambulatory Holter recordings [10], [20]; and The system does not replace attending clinical judgment; all calculations, risk scores, and checklists require explicit attending confirmation.</p>

    <p><b>Future Research Trajectories:</b> Planned extensions focus on transitioning Anesth AI toward rigorous clinical translation [1], [2], [4]: High-fidelity simulation laboratory trials assessing anesthesiologist interaction dynamics, situational awareness, and cognitive workload under emergency scenarios; Prospective multi-center observational studies across tertiary academic teaching hospitals in India to validate model transportability across diverse clinical environments [23]; Conformal prediction frameworks to provide finite-sample, distribution-free statistical coverage guarantees around continuous physiological risk estimates; Context-aware adaptive alert suppression algorithms to mitigate intraoperative alert fatigue during non-critical surgical maneuvers; Multimodal foundation models capable of unified cardiorespiratory waveform and tabular EHR pretraining [19], [21], [24]; and Hardware-accelerated edge inference on bedside clinical displays ensuring robust sub-20ms inference latency during network interruptions [17].</p>

    <h2 class="sec-heading">VIII. Conclusion</h2>
    <p class="no-indent">This paper presented Anesth AI, an integrated, human-in-the-loop perioperative anesthesia dose calculation and safety support system. The platform unifies preoperative assessment, parameter-driven dose calculation support, decoupled deterministic physiological fluid accounting, continuous intraoperative vital-sign surveillance, and postoperative PACU recovery scoring within a single clinical dashboard. Ten operational clinical prediction tasks were trained across four benchmark repositories (VitalDB, MIT-BIH, MIMIC-IV-ED, and MIMIC-IV). Enforcing strict patient- and record-grouped 70/15/15 partitioning with target feature purging eliminated data leakage, while an authentic MIT-BIH revalidation demonstrated 85.62% accuracy, 92.01% sensitivity, and 0.9414 ROC-AUC across 17,026 held-out beats. Incorporating explainable AI attributions, authenticated role-based security, immutable clinician override logging, and audited Emergency Break-Glass protocols reinforces clinical safety. Anesth AI demonstrates the viability of transparent, human-governed clinical decision support in perioperative medicine.</p>

    <h2 class="sec-heading">Acknowledgment</h2>
    <p class="no-indent">The authors express their gratitude to the Department of Computer Science and Engineering at K. S. Institute of Technology, Visvesvaraya Technological University, for supporting this perioperative clinical decision-support research initiative.</p>

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
    
    html_code = generate_ieee_6page_html()
    with open(html_out, 'w', encoding='utf-8') as f:
        f.write(html_code)
        
    cmd = [edge_path, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf_out}', html_url]
    subprocess.run(cmd, capture_output=True, text=True)
    
    if os.path.exists(html_out):
        os.remove(html_out)
        
    import shutil
    shutil.copyfile(pdf_out, 'AnesthAI_IEEE_Final.pdf')

    reader = pypdf.PdfReader(pdf_out)
    final_pages = len(reader.pages)
    size_bytes = os.path.getsize(pdf_out)
    print(f"\n==================================================", flush=True)
    print(f"FINAL PDF COMPILED: {pdf_out}", flush=True)
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
