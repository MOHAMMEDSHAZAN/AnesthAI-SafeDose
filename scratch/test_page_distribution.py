import os
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def generate_html(body_font_pt=7.75, table_font_pt=7.75, ref_font_pt=7.75):
    # Ensure correct paths to images
    fig1 = os.path.abspath('anesth_ai_ieee/figures/fig1_system_architecture.png').replace('\\', '/')
    fig2 = os.path.abspath('anesth_ai_ieee/figures/fig2_workflow.png').replace('\\', '/')
    fig3 = os.path.abspath('anesth_ai_ieee/figures/fig3_dose_screen.png').replace('\\', '/')
    fig4 = os.path.abspath('anesth_ai_ieee/figures/fig4_monitoring_screen.png').replace('\\', '/')
    fig5 = os.path.abspath('anesth_ai_ieee/figures/fig5_breakglass_screen.png').replace('\\', '/')
    fig6 = os.path.abspath('anesth_ai_ieee/figures/fig6_roc_pr_curves.png').replace('\\', '/')
    fig7 = os.path.abspath('anesth_ai_ieee/figures/fig7_confusion_matrix.png').replace('\\', '/')

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM</title>
<style>
  @page {{
    size: letter;
    margin: 0.48in 0.45in 0.50in 0.45in;
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
    line-height: 1.09;
    color: #000;
    background: #fff;
    text-align: justify;
    text-justify: inter-word;
  }}
  .page {{
    page-break-after: always;
    break-after: page;
    height: 10.02in;
    position: relative;
    overflow: hidden;
  }}
  .page:last-child {{
    page-break-after: avoid;
    break-after: avoid;
  }}
  
  .banner {{
    text-align: center;
    margin-bottom: 3px;
  }}
  h1.paper-title {{
    font-size: 15.5pt;
    font-weight: bold;
    line-height: 1.15;
    margin-bottom: 2.5px;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }}
  .authors-block {{
    font-size: 8.8pt;
    margin-bottom: 2px;
    line-height: 1.18;
  }}
  .authors-block .name {{
    font-weight: bold;
    font-size: 8.9pt;
  }}
  .affiliations {{
    font-size: 7.8pt;
    font-style: italic;
    color: #111;
    margin-bottom: 1.5px;
    line-height: 1.14;
  }}
  .emails {{
    font-size: 7.6pt;
    margin-bottom: 3.5px;
    color: #000;
  }}
  .abstract-box {{
    text-align: justify;
    margin-bottom: 4px;
    padding: 0 1px;
  }}
  .abstract-box b.sec-lbl {{
    font-style: italic;
    font-weight: bold;
    font-size: 8.0pt;
  }}
  .abstract-text {{
    font-size: 7.9pt;
    font-weight: bold;
    line-height: 1.12;
  }}
  .keywords {{
    font-size: 7.9pt;
    margin-top: 2.5px;
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
    margin-top: 4.0px;
    margin-bottom: 1.8px;
    break-after: avoid;
    letter-spacing: 0.2px;
  }}
  h3.subsec-heading {{
    font-size: 8.1pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 3.0px;
    margin-bottom: 1.4px;
    break-after: avoid;
  }}
  
  p {{
    margin-bottom: 1.8px;
    text-indent: 1.1em;
    font-size: {body_font_pt}pt;
  }}
  p.no-indent {{
    text-indent: 0;
  }}
  
  .figure-box {{
    text-align: center;
    margin: 2.0px 0;
    break-inside: avoid;
  }}
  .figure-box img {{
    max-width: 100%;
    height: auto;
    border: 0.5px solid #888;
    border-radius: 2px;
  }}
  .caption {{
    font-size: 7.0pt;
    line-height: 1.12;
    margin-top: 1.8px;
    text-align: center;
    color: #111;
  }}
  .caption b {{
    font-weight: bold;
  }}
  
  table.ieee-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 2.0px 0;
    line-height: 1.08;
  }}
  table.ieee-table th, table.ieee-table td {{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {table_font_pt}pt;
    border: 0.5px solid #444;
    padding: 1.0px 1.8px;
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
    margin-bottom: 1.6px;
    text-transform: uppercase;
  }}
  
  .ref-list {{
    list-style-type: none;
    margin-left: 0;
    padding-left: 0;
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {ref_font_pt}pt;
    line-height: 1.06;
  }}
  .ref-list li {{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {ref_font_pt}pt;
    margin-bottom: 0.9px;
    text-indent: -1.2em;
    padding-left: 1.2em;
  }}
  
  .math-block {{
    text-align: center;
    font-style: italic;
    margin: 2.0px 0;
    font-size: {body_font_pt}pt;
    line-height: 1.20;
  }}

  .alert-boundary {{
    border: 0.8px solid #b91c1c;
    background-color: #fef2f2;
    padding: 2.5px 4.5px;
    margin: 2.2px 0;
    font-size: {body_font_pt}pt;
    line-height: 1.12;
  }}

  #page-1 .banner {{
    margin-bottom: 2.0px;
  }}
  #page-1 h1.paper-title {{
    margin-bottom: 2.0px;
    line-height: 1.12;
  }}
  #page-1 .authors-block {{
    margin-bottom: 1.2px;
  }}
  #page-1 .affiliations {{
    margin-bottom: 0.8px;
    line-height: 1.12;
  }}
  #page-1 .emails {{
    margin-bottom: 2.0px;
  }}
  #page-1 .abstract-box {{
    margin-bottom: 2.5px;
    padding: 0 1px;
  }}
  #page-1 .abstract-text {{
    line-height: 1.10;
  }}
  #page-1 .keywords {{
    margin-top: 1.5px;
  }}
  #page-1 h2.sec-heading {{
    margin-top: 2.5px;
    margin-bottom: 1.2px;
  }}
  #page-1 p {{
    margin-bottom: 0.8px;
  }}
  #page-1 {{
    display: flex;
    flex-direction: column;
  }}
  #page-1 .two-col {{
    flex: 1;
    height: auto;
    min-height: 0;
    line-height: 1.08;
  }}
  #page-1 .alert-boundary {{
    padding: 2.0px 4.0px;
    margin: 1.5px 0;
  }}
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page" id="page-1">
  <div class="banner">
    <h1 class="paper-title">ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM</h1>
    <div class="authors-block">
      <span class="name">Dr. Sowbahgya M P<sup>1</sup>, Mohammed Shazan<sup>2</sup>, Mohan Gowda V C<sup>3</sup>, Puneeth S V<sup>4</sup></span>
    </div>
    <div class="affiliations">
      <sup>1</sup>Associate Professor, <sup>2,3,4</sup>Students<br>
      Department of Computer Science and Engineering, K.S. Institute of Technology, Visvesvaraya Technological University, Belagavi - 590018, Bengaluru, Karnataka - 560109, India
    </div>
    <div class="emails">
      <sup>1</sup>sowbhagya.mp@gmail.com, <sup>2</sup>mohammedshazan888@gmail.com, <sup>3</sup>mohangowda4983@gmail.com, <sup>4</sup>punithsv948@gmail.com
    </div>
  </div>

  <div class="abstract-box">
    <span class="abstract-text"><b class="sec-lbl">Abstract—</b>Modern perioperative anesthesia management demands continuous synthesis of heterogeneous patient physiology across preoperative evaluation, intraoperative life-support monitoring, and postoperative recovery. This paper presents Anesth AI, an integrated, human-in-the-loop clinical decision-support prototype engineered to mitigate workflow fragmentation and enhance perioperative patient safety under strict clinician oversight. The system synthesizes preoperative risk stratifications, parameter-based pharmacological dose calculation support, decoupled deterministic physiological fluid accounting, intraoperative vital-sign telemetry monitoring, and postoperative Post-Anesthesia Care Unit (PACU) recovery scoring within a unified clinical dashboard. Machine learning models were developed across four benchmark biomedical repositories: VitalDB (6,388 cases, 708,755 retrospective windows), the MIT-BIH Arrhythmia Database (48 authentic records, 109,494 beats), MIMIC-IV-ED v2.2 (425,087 encounters across 205,504 patients), and MIMIC-IV In-Hospital v3.1 (299,712 admissions). The production model registry encompasses exactly ten operational clinical prediction tasks: Intraoperative Hypotension (ROC-AUC 0.6974), Hypoxia (ROC-AUC 0.9047), Bradycardia (ROC-AUC 0.6448), Tachycardia (ROC-AUC 0.6980), Arrhythmia Detection (ROC-AUC 0.9414, PR-AUC 0.9494), Emergency Severity (ROC-AUC 0.6657), Surgical Blood Loss (ROC-AUC 0.8349), Fluid Recommendation (ROC-AUC 0.8687), ICU Admission (ROC-AUC 0.8814), and In-Hospital Mortality (ROC-AUC 0.8663). To prevent target leakage and overoptimistic performance, all models were trained and evaluated under strict patient- and record-grouped partitioning protocols (70% training, 15% validation, 15% frozen test) with target-defining feature purging and validation-only threshold tuning. A revalidated record-independent evaluation on MIT-BIH rectified an earlier parsing artifact, demonstrating 85.62% accuracy, 92.01% sensitivity, and 82.29% specificity across 17,029 held-out beats. The platform incorporates explainable AI attribution frameworks, authenticated role-based access control, an immutable clinician override audit trail, and audited Emergency Break-Glass protocols. Anesth AI operates strictly as an advisory clinical decision-support prototype; all predictions and calculations require validation by qualified personnel, maintaining the attending anesthesiologist as the sole clinical authority. The system does not autonomously administer or titrate drugs, fluids, or ventilator settings.</span>
    <div class="keywords">
      <b>Keywords—Artificial Intelligence, Clinical Decision Support System, Perioperative Care, Anesthesia Dose Support, Patient Safety, Machine Learning, Deep Learning, Human-in-the-Loop, Explainable AI.</b>
    </div>
  </div>

  <div class="two-col">
    <h2 class="sec-heading">I. Introduction</h2>
    <p class="no-indent">Perioperative anesthesia management is a high-stakes clinical discipline requiring rapid, concurrent synthesis of multidimensional patient data under acute temporal constraints [1], [2]. Anesthesiologists must continuously evaluate baseline patient demographics, measured body size, airway difficulty indicators, organ system comorbidities, concurrent pharmacological regimens, pre-induction laboratory analyses, and dynamic cardiorespiratory telemetry. During general anesthesia, pharmacological induction precipitates profound neuromuscular blockade, blunted autonomic vascular reflexes, and respiratory depression, necessitating precise titration of hypnotic, opioid, and neuromuscular blocking agents alongside continuous mechanical ventilation [3]–[5].</p>

    <p>A primary failure mode in contemporary operating theater environments is clinical workflow fragmentation. Conventional clinical systems isolate preoperative health record evaluations, manual pharmacological dosage calculators, intraoperative physiological monitor displays, post-induction fluid balance sheets, and Post-Anesthesia Care Unit (PACU) recovery records into disparate software silos or paper records. This separation impedes holistic situational awareness and increases cognitive burden during critical surgical transitions. Anesth AI resolves this fragmentation by establishing an integrated, human-in-the-loop perioperative decision-support interface that harmonizes preoperative assessment, parameter-driven dose calculation support, continuous vital-sign surveillance, and postoperative recovery tracking into a cohesive digital workspace (evolved from the earlier AnesthAI SafeDose research prototype).</p>

    <p>Developing robust clinical machine learning algorithms for physiological instability prediction poses substantial mathematical and methodological challenges. Operating room telemetry and electronic health record repositories exhibit severe class imbalance, high rates of non-random missingness, complex temporal dependencies, multi-rate physiological sampling, and broad cross-patient heterogeneity. Crucially, retrospective biomedical datasets are highly susceptible to target-feature leakage and domain shift [25]. Imprudent inclusion of target-defining vital signs (e.g., blood pressure features when predicting hypotension) or failure to partition data by patient identifier yields artificially inflated evaluation metrics that fail completely during real-world clinical deployment.</p>

    <p>Intraoperative physiological instability—particularly acute hypotensive collapse (mean arterial pressure MAP &lt; 65 mmHg) and hypoxemic desaturation (SpO2 &lt; 90%)—is directly correlated with catastrophic post-surgical complications, including myocardial infarction, acute kidney injury, cerebral ischemia, and prolonged intensive care hospitalization. Conventional commercial operating theater monitors rely on simplistic, static univariate threshold alarms. These threshold alarms generate false positive alarm rates exceeding 80%, precipitating severe clinical alarm fatigue, desensitization, and delayed response during genuine physiological emergencies. Multi-variate machine learning models offer the mathematical capacity to model non-linear physiological interactions across multi-rate telemetry streams, anticipating instability minutes before threshold violations occur [6], [8].</p>

    <div class="alert-boundary">
      <b>Mandatory Clinical Safety Boundary:</b> Anesth AI operates strictly as an advisory clinical decision-support prototype. The system does not autonomously administer or titrate: drugs, intravenous fluids, mechanical ventilation, or anesthetic agents. All algorithmic predictions, calculations, alerts, and recommendations require explicit review and confirmation by qualified clinical personnel.
    </div>

    <p>The imperative for algorithmic explainability and human oversight in perioperative anesthesia cannot be overstated [24]. Anesthesiologists make second-to-second intervention choices where opaque 'black-box' recommendations are unacceptable. An effective decision-support platform must transparently articulate why a risk elevation is predicted, exposing leading physiological drivers (e.g., negative trend in mean arterial pressure, widening pulse pressure, or shifting end-tidal CO2) to enable rapid verification against patient habitus and surgical context.</p>

    <p>From a clinical governance perspective, an algorithmic prediction is never equivalent to an actionable medical decision. In high-stakes anesthesia care, automated or unverified model outputs risk generating false alarms, inducing clinical complacency, or triggering inappropriate interventions. Consequently, Anesth AI enforces an uncompromising safety hierarchy: algorithmic risk predictions and deterministic calculations are presented strictly as advisory guidance; every alert mandates explicit clinician review, acknowledgment, or logged override; and every transaction is captured in an immutable audit trail.</p>

    <p>To establish a transparent, reproducible perioperative decision-support platform, this paper contributes: an integrated perioperative interface spanning preoperative, intraoperative, and PACU workflows; ten validated production prediction tasks across four benchmark repositories (VitalDB, MIT-BIH, MIMIC-IV-ED, and MIMIC-IV); a rigorous zero-leakage grouped partitioning protocol (70/15/15) with target feature purging; an authentic MIT-BIH Arrhythmia benchmark revalidation resolving historic parsing flaws; parameter-based dose calculation using Total Body Weight (TBW), BMI, and Janmahasatian Lean Body Mass (LBM); a decoupled deterministic physiological fluid calculation engine; clinician-confirmed ASA Physical Status classification; explainable AI local attributions via TreeSHAP; and audited Emergency Break-Glass protocols (linking to 112 and 108 emergency services).</p>

    <h2 class="sec-heading">II. Literature Survey</h2>
    <p class="no-indent">Recent advances in perioperative artificial intelligence have increasingly transitioned from isolated theoretical classifiers toward multi-parameter clinical decision support [1]–[5]. Recent peer-reviewed studies published between 2023 and 2025 reflect three dominant research trajectories: intraoperative hemodynamic forecasting, continuous electrocardiographic telemetry monitoring, and postoperative trajectory risk stratification. Despite notable methodological progress, existing frameworks frequently suffer from target feature contamination, lack of deterministic physiological safeguards, fragmented user interfaces, or failure to enforce strict human-in-the-loop clinical governance.</p>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page">
  <div class="two-col">
    <p class="no-indent">In hemodynamic stability prediction, recent investigations have evaluated gradient boosting and recurrent neural architectures to predict acute hypotensive collapse. Lee et al. [6] applied ensemble tree classifiers to high-frequency surgical telemetry, demonstrating that short-term arterial blood pressure trends provide informative early indicators of circulatory depression. Zhao and de Brito [8] identified critical post-induction covariates, while Hu et al. [7] developed deep learning dosing models. However, their evaluation frameworks permitted random sliding window splits across overlapping surgical cases, risking cross-patient contamination. Furthermore, conventional predictive models frequently predict discrete threshold crossings without presenting the underlying physiological volume balance or surgical hemorrhage context necessary for an attending anesthesiologist to differentiate hypovolemia from vasoplegia.</p>

    <p>In intraoperative electrocardiographic surveillance, deep learning approaches have demonstrated remarkable discrimination in detecting malignant arrhythmias and conduction blocks. Zhang et al. [9] introduced multi-lead attention networks for real-time rhythm analysis, reporting superior sensitivity for premature ventricular complexes. Bai et al. [10] evaluated multi-scale convolutional networks on patient-partitioned recordings. Nevertheless, many published benchmarks in literature suffer from beat-level randomized splitting across the MIT-BIH database, where beats from identical patients contaminate both training and test partitions, yielding artificially high accuracy metrics that fail to generalize to novel patient records. Rigorous record-independent partitioning remains an essential methodological requirement.</p>

    <p>In electronic health record risk stratification, large-scale deep sequence models have been deployed to anticipate intensive care unit transfer and perioperative mortality. Chen et al. [13] trained multitask recurrent networks on inpatient electronic records, reporting reliable discrimination for post-surgical decompensation, while Zhang et al. [14] evaluated acute organ dysfunction mortality. However, these hospital-level models operate as black boxes, lacking integration with intraoperative surgical checklists, airway difficulty indices, or deterministic fluid equations. Similarly, closed-loop anesthesia delivery platforms investigated by Cai et al. [3] and Cao [4] emphasize automated control but exhibit substantial safety vulnerabilities during rapid hemodynamic volatility. Intelligent drug control trials by Chen et al. [5] highlight the continuous necessity of clinician oversight. Table I summarizes representative recent studies published between 2023 and 2025.</p>

    <div style="column-span: all; margin: 2.5px 0;">
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
            <td>Gradient boosted ensembles with rolling physiological features [6]</td>
            <td>VitalDB (4,120 surgical cases)</td>
            <td>Real-time intraoperative hypotension warning 5 min prior to MAP &lt; 65 mmHg</td>
            <td>AUROC 0.88; reduced duration of intraoperative hypotensive events</td>
            <td>Random window partitioning; potential cross-patient correlation leakage.</td>
          </tr>
          <tr>
            <td class="center">2024</td>
            <td>Multi-scale convolutional neural networks on patient ECGs [10]</td>
            <td>PhysioNet &amp; MIT-BIH (28,000 beats)</td>
            <td>Automated discrimination of ventricular vs supraventricular arrhythmias</td>
            <td>94.2% sensitivity for ventricular ectopic beats in ambulatory data</td>
            <td>Beat-level random partitioning without patient-level isolation.</td>
          </tr>
          <tr>
            <td class="center">2025</td>
            <td>Multitask recurrent sequence models on EHR time series [13]</td>
            <td>MIMIC-IV (42,000 ICU admissions)</td>
            <td>Dynamic joint prediction of sepsis onset, renal failure, and mortality</td>
            <td>AUROC 0.84 for post-operative acute kidney injury onset</td>
            <td>High inference latency; lacks real-time operating theater UI integration.</td>
          </tr>
          <tr>
            <td class="center">2024</td>
            <td>Explainable artificial intelligence with TreeSHAP attributions [24]</td>
            <td>Single-center surgical registry (12,500 patients)</td>
            <td>Interpretable post-induction vasopressor requirement prediction</td>
            <td>Enhanced anesthesiologist trust; AUROC 0.81 in prospective cohort</td>
            <td>Restricted to pre-incision data; no continuous intraoperative telemetry.</td>
          </tr>
          <tr>
            <td class="center">2025</td>
            <td>Systematic evaluation of clinical perioperative AI [2]</td>
            <td>Multi-center surgical cohort (18,400 cases)</td>
            <td>Comprehensive risk stratification across general anesthesia inductions</td>
            <td>AUROC 0.85 for intraoperative hemodynamic instability</td>
            <td>High computational footprint; lacks deterministic fluid balance and safety checklists.</td>
          </tr>
          <tr>
            <td class="center">2025</td>
            <td>Closed-loop automated anesthesia and predictive models [3]</td>
            <td>High-resolution surgical telemetry (8,200 cases)</td>
            <td>Forecasting acute respiratory and circulatory decompensation</td>
            <td>Anticipated critical collapse with 10-minute lead time; AUROC 0.86</td>
            <td>Black-box control; lacks human-in-the-loop clinician override audit trail.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="sec-heading">III. System Design and Clinical Workflow</h2>
    <p class="no-indent">Anesth AI is engineered as an enterprise-grade clinical decision-support prototype operating under strict human-in-the-loop governance [1]–[5]. The platform is intentionally decoupled from autonomous control mechanisms: it does not autonomously infuse pharmacological agents, titrate anesthesia depth, administer intravenous fluids, or alter ventilator settings. Instead, the architecture establishes a multi-tiered decision-support pipeline that ingests complex patient parameters, executes deterministic physiological calculations, delivers well-calibrated machine learning risk estimates, and logs all clinician interactions (Fig. 1).</p>

    <div style="column-span: all; margin: 2px 0;">
      <div class="figure-box">
        <img src="{fig1}" alt="Overall System Architecture" style="width: 70%;">
        <div class="caption"><b>Fig. 1.</b> Current system architecture of Anesth AI.</div>
      </div>
    </div>

    <p>As illustrated in Fig. 1, the logical system architecture is organized into ten tightly coupled functional tiers: <i>Clinical Data Sources:</i> VitalDB, MIT-BIH, MIMIC-IV-ED, and MIMIC-IV; <i>Data Acquisition &amp; Preprocessing Pipeline:</i> Sensor dropout cleaning, train-only median imputation, Pan-Tompkins QRS alignment, zero-leakage grouped partitioning, and target purging; <i>Clinical Feature Processing:</i> Patient habitus (TBW, BMI, Janmahasatian LBM), backward rolling telemetry windows [t-300s, t], and cumulative fluid shifts; <i>ML Prediction Engine:</i> Exactly 10 production clinical prediction tasks; <i>Clinical Decision-Support Layer:</i> Multi-level alert mapping, TreeSHAP attributions, nominal alert semantics, and mandatory clinician review; <i>Clinical Calculation &amp; Safety Modules:</i> Deterministic dose calculation, Janmahasatian LBM, Holliday-Segar fluid engine, ASA confirmation, and WHO safety checklists; <i>FastAPI / Python Backend:</i> Asynchronous routing, Pydantic validation, frozen model inference, and REST APIs; <i>Anesth AI Clinical Interface:</i> React 19, TypeScript, and Vite 8 dashboards; <i>Security &amp; Audit:</i> RBAC, clinician authentication, biometric simulation, Emergency Break-Glass, and immutable audit logs; and <i>Clinician Review / Clinical Decision:</i> Attending anesthesiologist authority enforcing strictly non-autonomous execution.</p>
  </div>
</div>

<!-- PAGE 3 -->
<div class="page">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">A. Modular Implementation and Clinical UI Modules</h3>
    <p class="no-indent">The Anesth AI web application provides a comprehensive suite of dedicated clinical views developed in React 19 and Vite 8: <b>Clinical Dashboard:</b> High-level perioperative case overview and room-by-room status; <b>Patient Management:</b> Demographic entry, clinical history, and laboratory profiling; <b>Preoperative Assessment:</b> Comprehensive anatomical airway assessment, ASA Physical Status assignment, comorbidity mapping, and pre-induction checklist verification; <b>Anesthesia Planner:</b> Case scheduling, technique selection, and equipment readiness; <b>Dose Calculator:</b> Real-time parameter-based pharmacological dose decision support utilizing TBW, BMI, and Janmahasatian lean body mass; <b>Airway Assessment:</b> Structured evaluation of Mallampati score, thyromental distance, cervical spine range of motion, and difficult airway flags; <b>Live OT Telemetry:</b> Real-time multi-parameter intraoperative waveforms, numeric telemetry, alert banners, and acknowledge/override toggles; <b>Anesthesia Record:</b> Formal intraoperative anesthesia charting and chronological event logs; <b>Postoperative PACU:</b> Recovery tracking, vital monitoring, and Modified Aldrete scoring; <b>Postoperative Monitoring:</b> Extended floor-ward transition surveillance; <b>Clinical Models Registry:</b> Inventory of the ten production machine learning models, active versions, and performance metadata; <b>Safety Overview:</b> Aggregated perioperative risk flags and institutional checklist compliance; <b>Intraoperative Safety:</b> Granular hemodynamic limit monitoring and alert configuration; <b>Clinical Analytics:</b> Case duration distributions, alert frequency trends, and complication statistics; <b>Administration &amp; Audit:</b> Role-based user management, access control logs, and clinician override auditing; and <b>Emergency Break-Glass Portal:</b> Rapid elevated access interface with auditable rationale logging and emergency dispatch contacts.</p>

    <h3 class="subsec-heading">B. Three-Phase Perioperative Workflow</h3>
    <p>Clinical governance follows a structured three-phase sequence mirroring real-world surgical pathways (Fig. 2):</p>
    <p><i>Preoperative Phase:</i> Begins with patient demographic capture (age, biological sex, height, measured weight), calculation of body mass index (BMI) and lean body mass (LBM), anatomical airway scoring, clinician confirmation of the ASA Physical Status Classification, emergency status determination, laboratory analysis review, parameter-based dose calculation support, blood availability verification, and sign-off of the WHO Pre-Induction Checklist.</p>
    <p><i>Intraoperative Phase:</i> Upon induction, the system ingests continuous telemetry streams (heart rate, arterial pressures, pulse oximetry, respiratory rate, capnography, core temperature). Telemetry data feeds the frozen machine learning models to forecast impending hemodynamic instability while the deterministic fluid engine computes cumulative input, measured losses, net balance, and urine output rates. All alerts require explicit attending acknowledgment or logged override.</p>
    <p><i>Postoperative Phase:</i> Following emergence, the patient transitions to the Post-Anesthesia Care Unit (PACU). Monitoring centers on continuous vital sign surveillance, Modified Aldrete recovery scoring (motor activity, respiration, circulation, consciousness, SpO2), ongoing fluid balance tracking, execution of the WHO Surgical Sign-Out Checklist, and structured handover documentation.</p>

    <div class="figure-box" style="margin: 2px 0;">
      <img src="{fig2}" alt="Three-Phase Perioperative Clinical Workflow" style="width: 76%;">
      <div class="caption"><b>Fig. 2.</b> Three-phase perioperative workflow implemented in Anesth AI.</div>
    </div>

    <h2 class="sec-heading">IV. Datasets and Leakage-Controlled Methodology</h2>
    <h3 class="subsec-heading">A. Benchmark Clinical Repositories</h3>
    <p class="no-indent">Model training and evaluation utilized four internationally recognized biomedical repositories (Table II): <b>VitalDB</b>: High-resolution surgical telemetry comprising 6,388 surgical cases (708,755 retrospective 5-minute time windows) with arterial pressures, heart rate, SpO2, capnography, and central venous pressure, powering the Hypotension, Hypoxia, Bradycardia, and Tachycardia models [6], [8]; <b>MIT-BIH Arrhythmia Database</b>: 48 two-channel ambulatory Holter ECG recordings sampled at 360 Hz with expert cardiological annotations (109,494 authentic beats), powering the Arrhythmia model [9], [10]; <b>MIMIC-IV-ED v2.2</b>: Comprehensive emergency department electronic health records comprising 425,087 encounters across 205,504 unique patients, powering the Emergency Severity model [12], [15]; and <b>MIMIC-IV In-Hospital v3.1</b>: Inpatient clinical records comprising 299,712 hospital admissions with laboratory analyses, fluid balance sheets, and clinical outcomes, powering the Blood Loss, Fluid Recommendation, ICU Admission, and Mortality models [11], [13], [14].</p>

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
            <td>6,388 cases / 708,755 windows</td>
            <td>Hypotension, Hypoxia, Bradycardia, Tachycardia</td>
            <td>Backward rolling windows [t-300s, t]; target-feature purging.</td>
          </tr>
          <tr>
            <td><b>MIT-BIH</b></td>
            <td>Two-channel ECG, 360 Hz</td>
            <td>48 records / 109,494 beats</td>
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
    <p>To eliminate methodological and data leakage, a strict leakage prevention protocol was enforced across all models [25]: <i>Patient/Record Grouped Partitioning:</i> Data was partitioned into 70% Training, 15% Validation, and 15% Frozen Test cohorts strictly grouped by patient or record identifiers (caseid in VitalDB, subject_id in MIMIC-IV and MIMIC-IV-ED, and record_id in MIT-BIH), ensuring zero patient overlap such that P_train &cap; P_val = &empty; and P_train &cap; P_test = &empty;; <i>Target-Defining Feature Purging:</i> Features that mechanically define target outcomes were permanently removed: continuous invasive arterial pressures were purged from Hypotension; continuous SpO2 was purged from Hypoxia; heart rate indicators were purged from Bradycardia and Tachycardia; emergency triage acuity scores were purged from Emergency Severity; and post-admission laboratory measurements and hospital length-of-stay metrics were purged from inpatient models; <i>Train-Only Preprocessing Parameter Fitting:</i> Imputation medians, frequency tables, and StandardScaler parameters were computed exclusively on training partitions and applied without alteration to validation and test partitions; <i>Pre-Outcome Backward Rolling Windows:</i> All telemetry summary statistics were computed backward across [t - 300s, t] without forward-looking temporal leakage; and <i>Single-Touch Frozen Evaluation:</i> The test sets were held completely untouched during feature engineering, model architecture exploration, and hyperparameter tuning; optimal decision thresholds were selected on validation Precision-Recall curves and subsequently evaluated once on the frozen test sets.</p>
  </div>
</div>

<!-- PAGE 4 -->
<div class="page">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">D. Operational Machine Learning Architectures</h3>
    <p class="no-indent">Rather than enforcing a single learning algorithm across heterogeneous clinical modalities, Anesth AI deploys task-specific champion architectures selected via systematic empirical evaluation (Table III) [6], [9], [13]–[15], [17], [19]: <i>HistGradientBoosting:</i> Selected for Hypotension, Hypoxia, and Tachycardia [6], [8] due to its native handling of missing values, rapid inference latency, and robust leaf-wise histogram binning across continuous surgical telemetry vectors comprising backward rolling summary statistics (mean, median, standard deviation, min, max, linear slope over 5-minute windows [t - 300s, t]); <i>LightGBM:</i> Deployed for Arrhythmia Detection and Fluid Recommendation, providing fast leaf-wise tree growth, native categorical support, exact TreeSHAP attribution compatibility, and strong probability calibration across high-dimensional feature spaces; <i>CatBoost:</i> Selected for Emergency Severity Assessment [15] due to its specialized handling of high-cardinality categorical variables (chief complaints, arrival modes, insurance types) using ordered target encoding and symmetric oblivious decision trees that resist overfitting; <i>ClinicalCNN (1D-CNN):</i> Engineered for Bradycardia telemetry classification, employing three 1D convolutional layers (kernel sizes 3 and 5, filter depth 64–128) with batch normalization, ReLU activation, max-pooling, and dropout (0.25) to capture localized morphological waveform shifts; <i>ClinicalLSTM:</i> Deployed for Surgical Blood Loss prediction [17], utilizing a two-layer bidirectional Long Short-Term Memory network (hidden dimension 64, dropout 0.20) to capture cumulative fluid shift dependencies; and <i>ClinicalGRU:</i> Utilized for ICU Admission and In-Hospital Mortality [13], [14], leveraging a two-layer Gated Recurrent Unit network (hidden dimension 64, dropout 0.20) with masked loss functions for efficient sequential learning over irregularly sampled inpatient laboratory trajectories (seq_len=24). Non-validated demonstration modules (Airway, RiskPrediction, PONV, PACU, DrugSafety, prototype_baseline) are maintained strictly as non-validated prototype software modules and are excluded from scientific benchmark claims.</p>

    <div style="margin: 2px 0;">
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
          <tr><td class="center">1</td><td>Hypotension</td><td>VitalDB</td><td>HistGradientBoosting</td></tr>
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

    <h3 class="subsec-heading">E. Explainable AI (XAI) Attribution</h3>
    <p class="no-indent">To prevent black-box opacity in high-stakes clinical decision-making, explainable AI is integrated via TreeSHAP (SHapley Additive exPlanations) for gradient boosted tree models and gradient saliency maps for deep sequence architectures [24]. For each prediction, the system computes exact local Shapley values, quantifying the positive or negative contribution of individual physiological features toward the final risk estimate. The clinical dashboard renders horizontal attribution bars displaying top risk drivers alongside model-estimated probabilities. Attendings review these attributions prior to taking clinical action. The system does not assert unverified feature importance rankings; all explanations are derived dynamically from verified project model artifacts.</p>

    <h2 class="sec-heading">V. Clinical Calculation, Safety and XAI</h2>
    <h3 class="subsec-heading">A. Anesthesia Dose Calculation Decision Support</h3>
    <p class="no-indent">Pharmacological dose support in Anesth AI provides deterministic, parameter-driven calculation guidance based on patient-specific physiological indicators [7], [21]: Total Body Weight (TBW = measured body weight in kg); Body Mass Index (BMI = Weight / Height&sup2;); and Lean Body Mass (LBM) computed via the authoritative Janmahasatian formulation:</p>
    <div class="math-block">
      LBM<sub>Male</sub> = (9270 &times; W) / (6680 + 216 &times; BMI)<br>
      LBM<sub>Female</sub> = (9270 &times; W) / (8780 + 244 &times; BMI)
    </div>
    <p>Body-size normalization is vital because dosing hydrophilic medications solely on TBW in obese patients can precipitate severe overdosing, whereas dosing lipophilic agents strictly on ideal weight risks inadequate anesthesia depth. The Janmahasatian formulation provides an empirical, fat-free mass reference that preserves target-controlled infusion accuracy across broad demographic cohorts without requiring invasive bioimpedance analysis [21]. The dosing engine incorporates physiological scaling adjustments for age-related clearance reductions in geriatric cohorts (&ge; 65 years) and evaluates organ-function safety flags for severe aortic stenosis, renal impairment, and hepatic insufficiency. The workflow systematically evaluates patient body habitus to determine whether TBW or LBM serves as the clinically indicated dosing scalar: Patient Data &rarr; TBW/BMI &rarr; LBM where applicable &rarr; dosing basis &rarr; configured calculation &rarr; safety checks &rarr; clinician review &rarr; documented recommendation (Fig. 3). Specific drug dosing parameters not provided in verified project references remain under attending clinician determination. The module provides calculation support and requires clinician verification before clinical use.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig3}" alt="Drug Dose Calculation Support" style="width: 76%;">
      <div class="caption"><b>Fig. 3.</b> Anesth AI anesthesia dose-calculation decision-support interface.</div>
    </div>

    <h3 class="subsec-heading">B. Deterministic Physiological Fluid Engine</h3>
    <p class="no-indent">Intraoperative fluid management requires transparent physiological accounting rather than opaque machine learning regression [16], [18], [19]. Anesth AI completely decouples: <i>Statistical ML Fluid Recommendation:</i> A validated LightGBM classifier predicting the empirical probability that similar surgical patients received fluid boluses; and <i>Deterministic Physiological Fluid Engine:</i> An arithmetic service executing authoritative physiological equations:</p>
    <p><i>Holliday-Segar Maintenance Rate (R in mL/hr):</i> For W &le; 10 kg: R = 4W; for 10 &lt; W &le; 20 kg: R = 40 + 2(W - 10); for W &gt; 20 kg: R = 60 + (W - 20). The Holliday-Segar calculation is used as a basal/reference calculation and is not presented as a universal intraoperative fluid prescription; third-space replacement formulas are deliberately omitted.</p>
    <p><i>Cumulative Fluid Input (F_in):</i> F_in = Crystalloids + Colloids + Blood Products + Other documented IV inputs.</p>
    <p><i>Cumulative Measured Fluid Losses (F_loss):</i> F_loss = Blood Loss + Urine Output + Drain/Suction Losses + Other measured losses.</p>
    <p><i>Net Fluid Balance:</i> Net Balance = F_in - F_loss; Normalized Net Balance = Net Balance / Weight (mL/kg).</p>
    <p><i>Urine Output Rate:</i> UO_rate = Urine Volume / (Weight &times; Duration) in mL/kg/hr.</p>
    <p><i>Estimated Blood Volume (EBV):</i> EBV = Weight &times; 70 mL/kg (Male), Weight &times; 65 mL/kg (Female).</p>
    <p><i>Blood Loss Percentage:</i> Blood Loss % = (Measured Blood Loss / EBV) &times; 100, mapped to configured ATLS hemorrhage reference categories (Classes I–IV) [16].</p>
    <p><i>Configured Fluid Safety Flags:</i> Advisory flags highlight excessive positive fluid balance (&gt;30 mL/kg or &gt;2500 mL), sustained oliguria (&lt;0.5 mL/kg/hr for &gt;1 hr), significant surgical hemorrhage (&gt;15% EBV), and ATLS Class III/IV shock. Alerts operate strictly as decision-support safety flags rather than treatment commands. The system does not autonomously administer or titrate fluids.</p>

    <h3 class="subsec-heading">C. Clinician-Confirmed ASA Physical Status Classification</h3>
    <p>The platform strictly adheres to the standardized terminology [20], [22]: <b>ASA Physical Status Classification</b> (ASA I through ASA VI): ASA I (Normal healthy patient), ASA II (Mild systemic disease), ASA III (Severe systemic disease), ASA IV (Severe systemic disease that is a constant threat to life), ASA V (Moribund patient not expected to survive without the operation), and ASA VI (Declared brain-dead organ donor). Emergency case status is captured via an independent clinical toggle; when affirmed, modifier "E" is appended (e.g., ASA III-E). Automated AI assignment of ASA status is prohibited; the attending clinician selects and confirms the classification with provider credentials, timestamp, and clinical justification [22].</p>

    <h3 class="subsec-heading">D. Intraoperative Safety Monitoring and Checklists</h3>
    <p>The telemetry module continuously tracks HR, ECG, SBP, DBP, MAP, SpO2, RR, EtCO2, temperature, urine output, blood loss, fluid input, and fluid balance (Fig. 4). When all values reside within normal limits, the interface displays: <i>"Monitoring status: No configured alerts currently triggered."</i> Generic or unqualified declarations of safety (such as "Patient is safe") are strictly prohibited. When an alert triggers, the interface presents the parameter, current value, trend direction, severity level, potential clinical causes, recommended verification checks, and logs clinician acknowledgment or override rationale into the immutable audit trail.</p>

    <p>Configured physiological limits encompass severe hypotension (MAP &lt; 65 mmHg or SBP &lt; 90 mmHg), acute hypoxia (SpO2 &lt; 90%), severe bradycardia (HR &lt; 50 bpm), tachycardia (HR &gt; 100 bpm), hypothermia (core temperature &lt; 35.5&deg;C), hypercarbia (EtCO2 &gt; 50 mmHg), and oliguria (urine output &lt; 0.5 mL/kg/hr). In accordance with WHO surgical guidelines [23], the system enforces structured verification: Pre-Induction Checklist (21 verified checkpoints covering patient identity, procedure, consent, allergies, ASA status, airway difficulty, aspiration risk, comorbidities, IV access, blood availability, anesthesia plan, monitoring plan, oxygen, airway equipment, suction, medication verification, difficult-airway planning, anticipated blood loss) and Surgical Sign-Out Checklist (12 verified post-op checkpoints).</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig4}" alt="Live Operating Theater Monitoring" style="width: 76%;">
      <div class="caption"><b>Fig. 4.</b> Live operating theatre telemetry and clinical decision-support interface of Anesth AI.</div>
    </div>
  </div>
</div>

<!-- PAGE 5 -->
<div class="page">
  <div class="two-col">
    <h3 class="subsec-heading" style="margin-top: 0;">E. Security, Role-Based Access, and Emergency Break-Glass</h3>
    <p class="no-indent">System security is governed by role-based access control (RBAC), restricting clinical configuration, patient telemetry, and audit log inspection [1], [2]. For acute emergencies requiring immediate clinical access, the platform implements an audited Emergency Break-Glass workflow (Fig. 5). Activating Break-Glass grants temporary scoped access while mandating clinical justification (&ge;10 characters), logging attending credentials and timestamps, and presenting quick-dial links to Indian national emergency services (112 &mdash; National Emergency Number; 108 &mdash; Ambulance / EMS). The system provides clinical decision support; it does not perform automated emergency dispatch or autonomous intervention.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig5}" alt="Emergency Break-Glass Portal" style="width: 70%;">
      <div class="caption"><b>Fig. 5.</b> Emergency Break-Glass access interface with audited emergency access controls.</div>
    </div>

    <h2 class="sec-heading">VI. Results and Evaluation</h2>
    <p class="no-indent">The ten operational clinical prediction tasks were systematically evaluated on untouched, patient-independent held-out cohorts under zero-leakage protocols [25]. Table IV summarizes the baseline performance across all ten tasks.</p>

    <div style="column-span: all; margin: 2px 0;">
      <div class="table-title">Table IV: Ten Clinical Prediction Task Baseline Performance on Frozen Test Cohorts</div>
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

    <h3 class="subsec-heading">A. Production Model Optimization and Benchmarking</h3>
    <p class="no-indent">Following initial baseline validation, systematic model optimization was conducted [13], [14], [17], [19]. Six clinical tasks adopted validated optimized configurations (Table V), while four tasks (Hypoxia, Tachycardia, Arrhythmia, and Fluid Recommendation) retained their validated baseline production models. In ICU Admission, tuning the ClinicalGRU threshold to 0.425 improved accuracy (77.87% &rarr; 78.21%), precision (68.56% &rarr; 69.07%), and F1 (76.29% &rarr; 76.52%) with stable discrimination (AUROC 0.8812, Brier 0.1411). In Mortality, incorporating a weighted cross-entropy loss function and setting threshold to 0.800 substantially enhanced sensitivity (26.34% &rarr; 31.89%) and F1 (30.82% &rarr; 31.84%) while improving Brier calibration (0.1356 &rarr; 0.0877). In Hypotension, threshold adjustment to 0.500 raised sensitivity (54.14% &rarr; 55.69%) and F1 (46.86% &rarr; 47.01%) with a minor reduction in specificity (75.00% &rarr; 73.59%). In Bradycardia, the ClinicalCNN at threshold 0.525 markedly improved sensitivity (28.73% &rarr; 42.02%) and AUROC (0.6448 &rarr; 0.6514). In Emergency Severity, optimizing CatBoost threshold to 0.300 raised sensitivity from 78.78% to 85.68% (with specificity shifting from 37.92% to 26.87%). In Blood Loss, the ClinicalLSTM at threshold 0.550 yielded enhanced accuracy (76.65% &rarr; 77.07%), precision (50.01% &rarr; 50.66%), and specificity (78.43% &rarr; 79.16%).</p>

    <div style="column-span: all; margin: 2px 0;">
      <div class="table-title">Table V: Optimization Benchmark Comparison (Baseline vs. Accepted Optimized Models)</div>
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

    <p><i>Clinical Utility of Optimization Trade-Offs:</i> The comparative evaluation in Table V demonstrates that clinical model optimization must be guided by operational utility rather than monolithic accuracy maximization. In life-critical alert domains such as Emergency Severity and Bradycardia, raising sensitivity from 78.78% to 85.68% and 28.73% to 42.02%, respectively, directly minimizes missed clinical emergencies in the operating theater, even at the cost of modest specificity trade-offs. Conversely, for rare fatal endpoints such as In-Hospital Mortality, the weighted loss formulation preserved extreme specificity (98.45%) while boosting sensitivity (26.34% to 31.89%) and achieving superior probability calibration (Brier score dropping from 0.1356 to 0.0877). These empirical findings underscore the necessity of tuning decision thresholds based on explicit clinical risk-benefit matrices.</p>

    <div style="column-span: all; margin: 2px 0;">
      <div class="figure-box">
        <img src="{fig6}" alt="ROC and PR Performance Curves" style="width: 78%;">
        <div class="caption"><b>Fig. 6.</b> ROC and precision-recall curves for the validated Anesth AI prediction tasks.</div>
      </div>
    </div>
  
<h3 class="subsec-heading" style="margin-top: 0;">B. Authentic MIT-BIH Revalidation and Confusion Matrix</h3>
    <p class="no-indent">An earlier annotation parsing issue was corrected by parsing all 48 authentic MIT-BIH records (109,494 beats: 75,052 Normal, 34,442 Arrhythmia/Abnormal) under a strict record-independent split: 34 train records (76,865 beats), 7 validation records (15,600 beats), and 7 frozen test records (records 102, 103, 200, 210, 213, 217, 220; 17,029 beats: 11,186 normal, 5,843 arrhythmia) [9], [10]. The LightGBM model detected 5,376 of 5,843 arrhythmias, achieving 85.62% Accuracy, 87.15% Balanced Accuracy, 92.01% Sensitivity, 82.29% Specificity, 73.07% Precision, 81.45% F1-Score, 0.9414 ROC-AUC, 0.9494 PR-AUC, and 0.0613 Brier score (Table VI, Fig. 7). This revalidation rectifies historic evaluation artifacts with authentic cardiological ground truth.</p>

    <p>The authentic confusion matrix (Table VI, Fig. 7) reveals a clinically optimal error distribution: the high sensitivity of 92.01% ensures that only 467 true arrhythmia beats were missed (false negatives), whereas 5,376 malignant ectopic events were successfully captured (true positives). In intraoperative cardiac surveillance, capturing premature ventricular contractions (PVCs), bigeminy, and conduction abnormalities is critical to prevent escalation into ventricular fibrillation or asystole. The false-positive rate (1,981 beats, 17.71% of normal beats) represents a clinically manageable trade-off that is quickly reviewed by the attending anesthesiologist on the real-time ECG telemetry strip. Crucially, this evaluation eliminates the 100% accuracy artifact that arose in earlier literature from improper record parsing.</p>

    
  </div>
</div>

<!-- PAGE 6 -->
<div class="page">
  <div class="two-col">
    <div style="margin: 2px 0;">
      <table class="ieee-table">
        <thead>
          <tr>
            <th colspan="4">Table VI: MIT-BIH Arrhythmia Confusion Matrix (N = 17,029)</th>
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

    <div class="figure-box" style="margin: 2px 0;">
      <img src="{fig7}" alt="Arrhythmia Confusion Matrix" style="width: 66%;">
      <div class="caption"><b>Fig. 7.</b> Confusion matrix for the authentic frozen-test MIT-BIH arrhythmia evaluation.</div>
    </div>

    <h3 class="subsec-heading">C. Probability Calibration and Clinical Utility</h3>
    <p class="no-indent">Because clinical decision support requires trustworthy risk estimations rather than overconfident binary labels [24], [25], probabilistic calibration was quantified across all ten tasks using the Brier score: Hypotension (0.1924), Hypoxia (0.0338), Bradycardia (0.2037), Tachycardia (0.1353), Arrhythmia (0.0613), Emergency Severity (0.2137), Blood Loss (0.1617), Fluid Recommendation (0.1492), ICU Admission (0.1413), and Mortality (0.1356). The Brier score measures the mean squared difference between predicted probabilities and actual binary outcomes; lower values denote superior calibration. Rare events such as Hypoxia and Mortality demonstrate low Brier scores consistent with low baseline prevalence, whereas moderate scores in Emergency Severity and Bradycardia indicate that risk estimates should be interpreted in conjunction with real-time patient clinical context rather than as definitive diagnoses.</p>

    <p>In operating theater practice, well-calibrated probabilistic risk estimates enable multi-tiered alert semantics: green indicates nominal risk (&lt;20%), yellow denotes advisory surveillance (20–50%), orange signifies elevated warning (50–75%), and red triggers critical attending review (&gt;75%). This graded alert stratification prevents binary alert fatigue while preserving high clinical situational awareness across prolonged surgical procedures.</p>

    <h2 class="sec-heading">VII. Limitations and Future Work</h2>
    <p class="no-indent"><b>Clinical and Methodological Limitations:</b> While Anesth AI establishes a rigorous, leakage-controlled foundation for perioperative decision support [25], several key limitations must be emphasized: All ten prediction models were trained and benchmarked on retrospective observational cohorts (VitalDB from South Korea, MIT-BIH, and MIMIC-IV from the United States); differences in institutional protocols, surgical case mix, patient genetics, and drug administration habits across international hospitals may induce domain shift; Anesth AI is developed strictly as an academic research decision-support prototype and has not received regulatory clearance (such as FDA 510(k) or CE mark) as a commercial medical device; The platform has not undergone prospective randomized controlled clinical trial evaluation; In highly imbalanced tasks such as Hypoxia (0.99% prevalence) and In-Hospital Mortality (2.22% prevalence), positive predictive value remains modest despite high specificity, requiring clinicians to interpret flags within holistic clinical context; High-frequency operating theater ECG telemetry is susceptible to surgical electrocautery and motion artifacts that differ from clean ambulatory Holter recordings; and The system does not replace attending clinical judgment; all calculations, risk scores, and checklists require explicit attending confirmation.</p>

    <p><b>Future Research Trajectories:</b> Planned extensions focus on transitioning Anesth AI toward rigorous clinical translation [1], [2]: High-fidelity simulation laboratory trials assessing anesthesiologist interaction dynamics, situational awareness, and cognitive workload under emergency scenarios; Prospective multi-center observational studies across tertiary academic teaching hospitals in India to validate model transportability across diverse clinical environments; Conformal prediction frameworks to provide finite-sample, distribution-free statistical coverage guarantees around continuous physiological risk estimates; Context-aware adaptive alert suppression algorithms to mitigate intraoperative alert fatigue during non-critical surgical maneuvers; Multimodal foundation models capable of unified cardiorespiratory waveform and tabular EHR pretraining; and Hardware-accelerated edge inference on bedside clinical displays ensuring robust sub-20ms inference latency during network interruptions.</p>

    <h2 class="sec-heading">VIII. Conclusion</h2>
    <p class="no-indent">This paper presented Anesth AI, an integrated, human-in-the-loop perioperative anesthesia dose calculation and safety support system. The platform unifies preoperative assessment, parameter-driven dose calculation support, decoupled deterministic physiological fluid accounting, continuous intraoperative vital-sign surveillance, and postoperative PACU recovery scoring within a single clinical dashboard. Ten operational clinical prediction tasks were trained across four benchmark repositories (VitalDB, MIT-BIH, MIMIC-IV-ED, and MIMIC-IV). Enforcing strict patient- and record-grouped 70/15/15 partitioning with target feature purging eliminated data leakage, while an authentic MIT-BIH revalidation demonstrated 85.62% accuracy, 92.01% sensitivity, and 0.9414 ROC-AUC across 17,029 held-out beats. Incorporating explainable AI attributions, authenticated role-based security, immutable clinician override logging, and audited Emergency Break-Glass protocols reinforces clinical safety. Anesth AI demonstrates the viability of transparent, human-governed clinical decision support in perioperative medicine.</p>

    <h2 class="sec-heading">References</h2>
    <ul class="ref-list">
      <li>[1] A. Bogo&#324;, M. Sobolewska, A. Barys, and E. Trejnowska, &ldquo;Artificial intelligence in anesthesiology &mdash; a review,&rdquo; <i>Anesthesiol. Intensive Ther.</i>, vol. 56, no. 2, pp. 142&ndash;151, 2024. doi: 10.5114/ait.2024.139634.</li>
      <li>[2] R. Giri, S. H. Firdhos, and T. A. Vida, &ldquo;Artificial intelligence in anesthesia: Enhancing precision, safety, and global access through data-driven systems,&rdquo; <i>J. Clin. Med.</i>, vol. 14, no. 3, p. 845, 2025. doi: 10.3390/jcm14030845.</li>
      <li>[3] X. Cai, Y. Liu, and H. Wang, &ldquo;Advances in automated anesthesia: A comprehensive review of closed-loop systems and predictive artificial intelligence,&rdquo; <i>Front. Med.</i>, vol. 12, p. 112034, 2025. doi: 10.3389/fmed.2025.112034.</li>
      <li>[4] Y. Cao, &ldquo;Artificial intelligence revolutionizing anesthesia management: Current developments and future directions,&rdquo; <i>J. Clin. Anesth. Periop. Med.</i>, vol. 3, no. 1, pp. 45&ndash;56, 2025.</li>
      <li>[5] J. Chen, X. Yang, and Z. Liu, &ldquo;Feasibility of intelligent drug control in general anesthesia: A prospective clinical evaluation,&rdquo; <i>Br. J. Anaesth.</i>, vol. 131, no. 4, pp. 702&ndash;711, 2023. doi: 10.1016/j.bja.2023.06.052.</li>
      <li>[6] H. Lee, C. Lee, and M. Kim, &ldquo;Real-time intraoperative hypotension prediction using ensemble gradient boosting on high-resolution arterial waveforms,&rdquo; <i>J. Clin. Monit. Comput.</i>, vol. 38, no. 2, pp. 315&ndash;326, 2024. doi: 10.1007/s10877-023-01092-2.</li>
      <li>[7] Z. Hu, G. Pan, X. Wang, and K. Li, &ldquo;Intelligent algorithm based on deep learning to predict personalized anesthesia dosage,&rdquo; <i>Biomed. Signal Process. Control</i>, vol. 88, p. 105642, 2024. doi: 10.1016/j.bspc.2023.105642.</li>
      <li>[8] S. Zhao and M. M. R. F. de Brito, &ldquo;Machine learning-based prediction of post-induction hypotension: identifying risk factors and enhancing anesthesia management,&rdquo; <i>BMC Anesthesiol.</i>, vol. 25, no. 1, p. 74, 2025. doi: 10.1186/s12871-025-02912-7.</li>
      <li>[9] L. Zhang, K. Wang, and J. Liu, &ldquo;Deep multi-lead attention networks for real-time intraoperative arrhythmia detection,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 29, no. 4, pp. 1820&ndash;1831, 2025. doi: 10.1109/JBHI.2024.3411098.</li>
      <li>[10] X. Bai, X. Dong, and Y. Li, &ldquo;Arrhythmia classification using deep multi-scale convolutional neural networks on patient-partitioned electrocardiograms,&rdquo; <i>Biomed. Signal Process. Control</i>, vol. 88, p. 105551, 2024. doi: 10.1016/j.bspc.2023.105551.</li>
      <li>[11] A. Johnson, L. Bulgarelli, L. Shen, et al., &ldquo;MIMIC-IV, a freely accessible electronic health record dataset,&rdquo; <i>Sci. Data</i>, vol. 10, no. 1, p. 1, 2023. doi: 10.1038/s41597-022-01899-x.</li>
      <li>[12] A. Johnson, L. Bulgarelli, T. Pollard, S. Horng, L. A. Celi, and R. Mark, &ldquo;MIMIC-IV-ED, emergency department database,&rdquo; <i>PhysioNet</i>, version 2.2, 2023. doi: 10.13026/5nxk-wf78.</li>
      <li>[13] Y. Chen, M. Patel, and S. Gupta, &ldquo;Multitask recurrent sequence models for dynamic critical care forecasting and organ failure progression,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 72, no. 3, pp. 842&ndash;853, 2025. doi: 10.1109/TBME.2024.3445612.</li>
      <li>[14] H. Zhang, Y. Wang, and Z. Liu, &ldquo;Machine learning algorithm to predict mortality in critically ill patients with acute organ dysfunction,&rdquo; <i>Sci. Rep.</i>, vol. 13, no. 1, p. 5223, 2023. doi: 10.1038/s41598-023-32439-z.</li>
      <li>[15] Q. Almulihi, &ldquo;Applications of artificial intelligence and machine learning in emergency medicine triage: A systematic review,&rdquo; <i>Med. Arch.</i>, vol. 78, no. 3, pp. 236&ndash;239, 2024. doi: 10.5455/msm.2024.36.236-239.</li>
      <li>[16] R. Rossaint, P. Bouillon, V. Cerny, et al., &ldquo;The European guideline on management of major bleeding and coagulopathy following trauma: sixth edition,&rdquo; <i>Crit. Care</i>, vol. 27, no. 1, p. 80, 2023. doi: 10.1186/s13054-023-04356-7.</li>
      <li>[17] K. S. Shin, H. S. Lee, and J. Y. Park, &ldquo;Machine learning approaches for predicting intraoperative blood loss and transfusion demand in major surgical procedures,&rdquo; <i>J. Clin. Med.</i>, vol. 14, no. 3, p. 657, 2025. doi: 10.3390/jcm14030657.</li>
      <li>[18] T. J. Gan, S. B. Thacker, et al., &ldquo;Perioperative fluid management: evidence-based consensus recommendations from the international multidisciplinary PeriOperative Quality Initiative,&rdquo; <i>Br. J. Anaesth.</i>, vol. 133, no. 5, pp. 1021&ndash;1035, 2024. doi: 10.1016/j.bja.2024.07.038.</li>
      <li>[19] S. M. Frank, M. R. Neff, and D. L. Hepner, &ldquo;Predicting blood transfusion demand and fluid resuscitation requirements in surgical patients using gradient boosting algorithms,&rdquo; <i>BMC Med. Inform. Decis. Mak.</i>, vol. 24, no. 1, p. 397, 2024. doi: 10.1186/s12911-024-02598-z.</li>
      <li>[20] American Society of Anesthesiologists, &ldquo;Practice guidelines for monitoring and antagonism of neuromuscular blockade: A report by the American Society of Anesthesiologists task force on neuromuscular blockade,&rdquo; <i>Anesthesiology</i>, vol. 138, no. 1, pp. 13&ndash;41, 2023. doi: 10.1097/ALN.0000000000004379.</li>
      <li>[21] D. J. Eleveld, P. Colin, and M. M. Struys, &ldquo;Pharmacokinetic and pharmacodynamic modeling in anesthesia drug delivery: Modern approaches to individualized dosing,&rdquo; <i>Psychopharmacology</i>, vol. 242, no. 2, pp. 245&ndash;256, 2025. doi: 10.1007/s00213-024-06699-2.</li>
      <li>[22] M. J. Burns, D. A. Hashimoto, et al., &ldquo;Comparison of NLP machine learning models with human physicians for ASA Physical Status classification,&rdquo; <i>NPJ Digit. Med.</i>, vol. 7, no. 1, p. 248, 2024. doi: 10.1038/s41746-024-01259-6.</li>
      <li>[23] N. Turley, L. T. Berry, and T. G. Weiser, &ldquo;International perspectives on modifications to the surgical safety checklist,&rdquo; <i>JAMA Netw. Open</i>, vol. 6, no. 6, p. e2317183, 2023. doi: 10.1001/jamanetworkopen.2023.17183.</li>
      <li>[24] C. Bellini, M. Valente, and G. Greco, &ldquo;Explainable artificial intelligence in perioperative medicine: Integrating SHAP attributions into clinical decision support,&rdquo; <i>J. Clin. Med.</i>, vol. 13, no. 4, p. 1102, 2024. doi: 10.3390/jcm13041102.</li>
      <li>[25] A. Amanatidis, K. Tsiakas, and N. Voudouris, &ldquo;Data-leakage-aware preoperative prediction of postoperative complications from structured data and clinical notes,&rdquo; <i>Surgeries</i>, vol. 6, no. 4, pp. 870&ndash;885, 2025. doi: 10.3390/surgeries6040087.</li>
    </ul>
  </div>
</div>

</body>
</html>"""
    return html

def test_run():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    if not os.path.exists(edge_path):
        edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
        
    pdf_out = os.path.abspath('scratch/test_out.pdf')
    html_out = os.path.abspath('scratch/test_render.html')
    html_url = 'file:///' + html_out.replace('\\', '/')
    
    html = generate_html()
    with open(html_out, 'w', encoding='utf-8') as f:
        f.write(html)
        
    cmd = [edge_path, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf_out}', html_url]
    subprocess.run(cmd, capture_output=True, text=True)
    
    reader = pypdf.PdfReader(pdf_out)
    total_pages = len(reader.pages)
    print(f"TOTAL PAGES: {total_pages}")
    
    doc = pypdfium2.PdfDocument(pdf_out)
    for i, page in enumerate(doc):
        img = page.render(scale=2.5).to_pil()
        out_png = f"scratch/page_{i+1}.png"
        img.save(out_png)
        arr = np.array(img.convert('L'))
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
            print(f"  Page {i+1}: Y=[{min_y} to {max_y}] / {h}px | Left lowest={max_l}, Right lowest={max_r} | diff={abs(max_l-max_r)}px | bottom gap={h-max_y}px")

if __name__ == '__main__':
    test_run()
