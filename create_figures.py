import os

out_dir = 'anesth_ai_ieee/figures_v2'
os.makedirs(out_dir, exist_ok=True)

# 1. High-resolution vector SVG for Fig. 1: System Architecture
svg_arch = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="100%" height="auto">
  <defs>
    <style>
      .title-box { fill: #0f172a; }
      .title-txt { font-family: 'Times New Roman', serif; font-size: 16px; font-weight: bold; fill: #ffffff; text-anchor: middle; }
      .box { fill: #ffffff; stroke: #2563eb; stroke-width: 1.8; rx: 6; ry: 6; }
      .box-header { font-family: 'Times New Roman', serif; font-size: 13.5px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
      .item-txt { font-family: 'Times New Roman', serif; font-size: 12px; fill: #1e293b; }
      .arrow { stroke: #1e3a8a; stroke-width: 2.2; fill: none; marker-end: url(#arrowhead); }
      .badge-secure { fill: #fef2f2; stroke: #dc2626; stroke-width: 1.4; rx: 5; }
      .badge-calc { fill: #f0fdf4; stroke: #16a34a; stroke-width: 1.4; rx: 5; }
      .badge-ai { fill: #eff6ff; stroke: #2563eb; stroke-width: 1.4; rx: 5; }
      .badge-review { fill: #faf5ff; stroke: #9333ea; stroke-width: 1.4; rx: 5; }
    </style>
    <marker id="arrowhead" markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#1e3a8a" />
    </marker>
  </defs>

  <rect x="5" y="5" width="990" height="440" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" rx="8" />

  <!-- Title Banner -->
  <rect x="5" y="5" width="990" height="36" fill="#0f172a" rx="8" />
  <text x="500" y="28" class="title-txt">ANESTH AI MODULAR SYSTEM ARCHITECTURE &amp; CLINICAL GOVERNANCE</text>

  <!-- Col 1: Clinical Inputs -->
  <rect x="18" y="50" width="205" height="385" class="box" />
  <rect x="18" y="50" width="205" height="32" fill="#e2e8f0" rx="6" />
  <text x="120" y="72" class="box-header">1. Clinical Inputs</text>
  <text x="30" y="105" class="item-txt" font-weight="bold">Preoperative Assessment:</text>
  <text x="38" y="125" class="item-txt">&#8226; Patient Demographics</text>
  <text x="38" y="143" class="item-txt">&#8226; Weight, Height, Calculated BMI</text>
  <text x="38" y="161" class="item-txt">&#8226; Airway Risk (Mallampati)</text>
  <text x="38" y="179" class="item-txt">&#8226; Lab Tests &amp; Comorbidities</text>
  <text x="30" y="210" class="item-txt" font-weight="bold">Intraoperative Telemetry:</text>
  <text x="38" y="230" class="item-txt">&#8226; Continuous HR &amp; ECG Stream</text>
  <text x="38" y="248" class="item-txt">&#8226; SBP, DBP, MAP Pressures</text>
  <text x="38" y="266" class="item-txt">&#8226; SpO2, Capnography (EtCO2)</text>
  <text x="38" y="284" class="item-txt">&#8226; Administered Inputs &amp; Blood Loss</text>
  <text x="30" y="315" class="item-txt" font-weight="bold">PACU Recovery Data:</text>
  <text x="38" y="335" class="item-txt">&#8226; Modified Aldrete Score</text>
  <text x="38" y="353" class="item-txt">&#8226; Post-Op Urine &amp; Fluid Balance</text>
  <text x="38" y="380" class="item-txt" fill="#0369a1" font-style="italic">WHO Checklists (21 pre / 12 post)</text>

  <!-- Arrow Col 1 -> Col 2 -->
  <line x1="223" y1="185" x2="258" y2="185" class="arrow" />

  <!-- Col 2: Presentation & Security Layer -->
  <rect x="260" y="50" width="215" height="385" class="box" />
  <rect x="260" y="50" width="215" height="32" fill="#e2e8f0" rx="6" />
  <text x="367" y="72" class="box-header">2. Presentation &amp; Security</text>
  
  <rect x="272" y="92" width="190" height="98" class="badge-ai" />
  <text x="367" y="112" class="box-header" font-size="12px">React 18 / Vite Client</text>
  <text x="282" y="132" class="item-txt">&#8226; Preoperative Planning UI</text>
  <text x="282" y="150" class="item-txt">&#8226; Dose Calculation CDS</text>
  <text x="282" y="168" class="item-txt">&#8226; Live OT Telemetry Grid</text>
  <text x="282" y="182" class="item-txt">&#8226; PACU Recovery Dashboard</text>

  <rect x="272" y="198" width="190" height="120" class="badge-secure" />
  <text x="367" y="218" class="box-header" font-size="12px" fill="#b91c1c">Security &amp; Emergency RBAC</text>
  <text x="282" y="238" class="item-txt">&#8226; 6-Tier Role Access Control</text>
  <text x="282" y="256" class="item-txt">&#8226; JWT HMAC-SHA256 Auth</text>
  <text x="282" y="274" class="item-txt" font-weight="bold" fill="#b91c1c">&#8226; Emergency Break-Glass</text>
  <text x="292" y="291" class="item-txt">- Scoped Temp Token</text>
  <text x="292" y="307" class="item-txt">- Justification (&gt;= 10 chars)</text>

  <rect x="272" y="326" width="190" height="98" class="badge-review" />
  <text x="367" y="344" class="box-header" font-size="12px" fill="#7e22ce">Clinical Governance &amp; Audit</text>
  <text x="282" y="364" class="item-txt">&#8226; Clinician-Confirmed ASA</text>
  <text x="282" y="382" class="item-txt">&#8226; Alert Ack / Override Log</text>
  <text x="282" y="400" class="item-txt">&#8226; Immutable Event Audit Trail</text>

  <!-- Arrow Col 2 -> Col 3 -->
  <line x1="475" y1="185" x2="510" y2="185" class="arrow" />

  <!-- Col 3: FastAPI Backend -->
  <rect x="512" y="50" width="215" height="385" class="box" />
  <rect x="512" y="50" width="215" height="32" fill="#e2e8f0" rx="6" />
  <text x="619" y="72" class="box-header">3. FastAPI Orchestration</text>
  
  <text x="524" y="105" class="item-txt" font-weight="bold">Async Backend Microservice:</text>
  <text x="532" y="124" class="item-txt">&#8226; Pydantic Schema Validation</text>
  <text x="532" y="142" class="item-txt">&#8226; Sub-50ms Inference Latency</text>
  <text x="532" y="160" class="item-txt">&#8226; 5-Min Rolling Windows (t-300s)</text>

  <rect x="522" y="175" width="195" height="118" class="badge-calc" />
  <text x="619" y="195" class="box-header" font-size="12px" fill="#15803d">Deterministic Engines</text>
  <text x="530" y="215" class="item-txt">&#8226; Janmahasatian LBM Formula</text>
  <text x="530" y="233" class="item-txt">&#8226; Holliday-Segar Maintenance</text>
  <text x="530" y="251" class="item-txt">&#8226; EBV (70/65 mL/kg) &amp; ATLS</text>
  <text x="530" y="269" class="item-txt">&#8226; Net Fluid Balance &amp; Oliguria</text>

  <rect x="522" y="302" width="195" height="122" class="badge-ai" />
  <text x="619" y="322" class="box-header" font-size="12px" fill="#1d4ed8">Explainability &amp; Human-in-Loop</text>
  <text x="530" y="342" class="item-txt">&#8226; TreeSHAP Feature Attribution</text>
  <text x="530" y="360" class="item-txt">&#8226; Objective Alert Semantics</text>
  <text x="530" y="378" class="item-txt" font-weight="bold" fill="#b91c1c">&#8226; NO AUTONOMOUS DELIVERY</text>
  <text x="530" y="396" class="item-txt" font-style="italic">- Decision Support Advisory Only</text>

  <!-- Arrow Col 3 -> Col 4 -->
  <line x1="727" y1="185" x2="762" y2="185" class="arrow" />

  <!-- Col 4: ML Model Registry -->
  <rect x="764" y="50" width="220" height="385" class="box" />
  <rect x="764" y="50" width="220" height="32" fill="#e2e8f0" rx="6" />
  <text x="874" y="72" class="box-header">4. ML Model Registry</text>

  <text x="774" y="103" class="item-txt" font-weight="bold">10 Clinical Prediction Tasks:</text>
  <text x="778" y="122" class="item-txt"><b>VitalDB Cohort (6,388 cases):</b></text>
  <text x="786" y="140" class="item-txt">&#8226; Hypotension (HistGradBoost)</text>
  <text x="786" y="157" class="item-txt">&#8226; Hypoxia (HistGradBoost)</text>
  <text x="786" y="174" class="item-txt">&#8226; Bradycardia (ClinicalCNN)</text>
  <text x="786" y="191" class="item-txt">&#8226; Tachycardia (HistGradBoost)</text>

  <text x="778" y="213" class="item-txt"><b>MIT-BIH (48 records, 109K beats):</b></text>
  <text x="786" y="231" class="item-txt">&#8226; Arrhythmia Detection (LightGBM)</text>
  <text x="794" y="247" class="item-txt" fill="#047857">Verified Sens: 92.01%, AUC: 0.94</text>

  <text x="778" y="271" class="item-txt"><b>MIMIC-IV-ED (425K encounters):</b></text>
  <text x="786" y="289" class="item-txt">&#8226; Emergency Severity (CatBoost)</text>

  <text x="778" y="312" class="item-txt"><b>MIMIC-IV In-Hospital (300K cases):</b></text>
  <text x="786" y="330" class="item-txt">&#8226; Blood Loss (ClinicalLSTM)</text>
  <text x="786" y="347" class="item-txt">&#8226; Fluid Recommendation (LightGBM)</text>
  <text x="786" y="364" class="item-txt">&#8226; ICU Admission (ClinicalGRU)</text>
  <text x="786" y="381" class="item-txt">&#8226; Mortality (ClinicalGRU)</text>

  <text x="774" y="415" class="item-txt" font-weight="bold" fill="#1e3a8a">Zero Patient Overlap (70/15/15)</text>
</svg>"""

with open(f'{out_dir}/system_architecture.svg', 'w', encoding='utf-8') as f:
    f.write(svg_arch)
print('Saved system_architecture.svg successfully')

# 2. High-resolution vector SVG for Fig. 2: Three-Phase Clinical Workflow
svg_flow = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 370" width="100%" height="auto">
  <defs>
    <style>
      .phase-title { font-family: 'Times New Roman', serif; font-size: 15px; font-weight: bold; fill: #ffffff; text-anchor: middle; }
      .phase-sub { font-family: 'Times New Roman', serif; font-size: 12px; font-style: italic; fill: #e2e8f0; text-anchor: middle; }
      .box { fill: #ffffff; stroke: #94a3b8; stroke-width: 1.5; rx: 7; }
      .item-header { font-family: 'Times New Roman', serif; font-size: 12.5px; font-weight: bold; fill: #0f172a; }
      .item-txt { font-family: 'Times New Roman', serif; font-size: 11.5px; fill: #1e293b; }
      .flow-arrow { stroke: #0284c7; stroke-width: 3.5; fill: none; marker-end: url(#big-arrow); }
      .badge { rx: 4; stroke-width: 1; }
    </style>
    <marker id="big-arrow" markerWidth="9" markerHeight="8" refX="8" refY="4" orient="auto">
      <polygon points="0 0, 9 4, 0 8" fill="#0284c7" />
    </marker>
  </defs>

  <rect x="5" y="5" width="990" height="360" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="8" />

  <!-- PHASE 1: PREOPERATIVE -->
  <g transform="translate(15, 15)">
    <rect x="0" y="0" width="300" height="335" class="box" stroke="#2563eb" />
    <rect x="0" y="0" width="300" height="52" fill="#1d4ed8" rx="7" />
    <text x="150" y="25" class="phase-title">PHASE 1 &#8212; PREOPERATIVE</text>
    <text x="150" y="43" class="phase-sub">Clinical Assessment &amp; Planning</text>
    
    <rect x="12" y="64" width="276" height="52" fill="#eff6ff" stroke="#bfdbfe" class="badge" />
    <text x="20" y="81" class="item-header">1. Patient Registration &amp; Demographics</text>
    <text x="28" y="100" class="item-txt">&#8226; Age, Gender, Measured Weight &amp; Height</text>

    <rect x="12" y="122" width="276" height="52" fill="#eff6ff" stroke="#bfdbfe" class="badge" />
    <text x="20" y="139" class="item-header">2. Body-Size &amp; Airway Evaluation</text>
    <text x="28" y="158" class="item-txt">&#8226; Calculated BMI, Janmahasatian Lean Body Mass</text>

    <rect x="12" y="180" width="276" height="58" fill="#eff6ff" stroke="#bfdbfe" class="badge" />
    <text x="20" y="197" class="item-header">3. Clinician-Confirmed ASA Classification</text>
    <text x="28" y="216" class="item-txt">&#8226; ASA I–VI with Independent Emergency 'E'</text>
    <text x="28" y="230" class="item-txt" font-style="italic" fill="#1e40af">Attending clinician review required</text>

    <rect x="12" y="244" width="276" height="78" fill="#eff6ff" stroke="#bfdbfe" class="badge" />
    <text x="20" y="261" class="item-header">4. Dose Support &amp; Safety Checklist</text>
    <text x="28" y="279" class="item-txt">&#8226; Parameter-based dosing basis (TBW vs. LBM)</text>
    <text x="28" y="296" class="item-txt">&#8226; WHO Pre-Induction Checklist (21 items verified)</text>
    <text x="28" y="312" class="item-txt" fill="#dc2626">&#8226; Organ dysfunction &amp; contraindication alerts</text>
  </g>

  <!-- Arrow Phase 1 -> Phase 2 -->
  <line x1="322" y1="180" x2="346" y2="180" class="flow-arrow" />

  <!-- PHASE 2: INTRAOPERATIVE -->
  <g transform="translate(350, 15)">
    <rect x="0" y="0" width="300" height="335" class="box" stroke="#059669" />
    <rect x="0" y="0" width="300" height="52" fill="#047857" rx="7" />
    <text x="150" y="25" class="phase-title">PHASE 2 &#8212; INTRAOPERATIVE</text>
    <text x="150" y="43" class="phase-sub">Continuous Surveillance &amp; Decision Support</text>
    
    <rect x="12" y="64" width="276" height="52" fill="#ecfdf5" stroke="#a7f3d0" class="badge" />
    <text x="20" y="81" class="item-header">1. Multi-Parameter Vital Streaming</text>
    <text x="28" y="100" class="item-txt">&#8226; HR, ECG, SBP, DBP, MAP, SpO2, EtCO2, Temp</text>

    <rect x="12" y="122" width="276" height="52" fill="#ecfdf5" stroke="#a7f3d0" class="badge" />
    <text x="20" y="139" class="item-header">2. Multi-Task Predictive ML Risk</text>
    <text x="28" y="158" class="item-txt">&#8226; Hypotension, Hypoxia, Brady/Tachycardia, ECG</text>

    <rect x="12" y="180" width="276" height="58" fill="#ecfdf5" stroke="#a7f3d0" class="badge" />
    <text x="20" y="197" class="item-header">3. Decoupled Deterministic Fluid Engine</text>
    <text x="28" y="216" class="item-txt">&#8226; Holliday-Segar basal maintenance &amp; EBV</text>
    <text x="28" y="230" class="item-txt">&#8226; Net fluid balance, measured blood loss, oliguria</text>

    <rect x="12" y="244" width="276" height="78" fill="#ecfdf5" stroke="#a7f3d0" class="badge" />
    <text x="20" y="261" class="item-header">4. Clinical Alert Semantics &amp; Break-Glass</text>
    <text x="28" y="279" class="item-txt">&#8226; 'No configured alerts triggered' nominal status</text>
    <text x="28" y="296" class="item-txt">&#8226; TreeSHAP explanations &amp; clinician override log</text>
    <text x="28" y="312" class="item-txt" fill="#b91c1c">&#8226; Audited Emergency Break-Glass (112, 108)</text>
  </g>

  <!-- Arrow Phase 2 -> Phase 3 -->
  <line x1="657" y1="180" x2="681" y2="180" class="flow-arrow" />

  <!-- PHASE 3: POSTOPERATIVE -->
  <g transform="translate(685, 15)">
    <rect x="0" y="0" width="300" height="335" class="box" stroke="#7c3aed" />
    <rect x="0" y="0" width="300" height="52" fill="#6d28d9" rx="7" />
    <text x="150" y="25" class="phase-title">PHASE 3 &#8212; POSTOPERATIVE</text>
    <text x="150" y="43" class="phase-sub">PACU Surveillance &amp; Recovery</text>
    
    <rect x="12" y="64" width="276" height="52" fill="#faf5ff" stroke="#ddd6fe" class="badge" />
    <text x="20" y="81" class="item-header">1. PACU Physiological Monitoring</text>
    <text x="28" y="100" class="item-txt">&#8226; Post-anesthetic hemodynamics &amp; SpO2 recovery</text>

    <rect x="12" y="122" width="276" height="52" fill="#faf5ff" stroke="#ddd6fe" class="badge" />
    <text x="20" y="139" class="item-header">2. Modified Aldrete Recovery Score</text>
    <text x="28" y="158" class="item-txt">&#8226; Motor, respiration, circulation, consciousness</text>

    <rect x="12" y="180" width="276" height="58" fill="#faf5ff" stroke="#ddd6fe" class="badge" />
    <text x="20" y="197" class="item-header">3. Surgical Sign-Out Checklist</text>
    <text x="28" y="216" class="item-txt">&#8226; WHO 12-point post-op verification</text>
    <text x="28" y="230" class="item-txt">&#8226; Instrument / swab counts &amp; specimen labels</text>

    <rect x="12" y="244" width="276" height="78" fill="#faf5ff" stroke="#ddd6fe" class="badge" />
    <text x="20" y="261" class="item-header">4. Handover &amp; Discharge Readiness</text>
    <text x="28" y="279" class="item-txt">&#8226; Cumulative operative fluid balance summary</text>
    <text x="28" y="296" class="item-txt">&#8226; Ward transfer handover documentation</text>
    <text x="28" y="312" class="item-txt" fill="#6d28d9">&#8226; Immutable audit trail recording all events</text>
  </g>
</svg>"""

with open(f'{out_dir}/clinical_workflow.svg', 'w', encoding='utf-8') as f:
    f.write(svg_flow)
print('Saved clinical_workflow.svg successfully')
