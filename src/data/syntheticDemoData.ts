/**
 * AnesthAI SafeDose - Centralized Realistic Synthetic Demonstration Dataset
 *
 * CRITICAL CLINICAL SAFETY & RESEARCH PROTOTYPE GOVERNANCE:
 * - All patient and clinician identities herein are 100% FICTIONAL and SYNTHETIC.
 * - Explicitly labeled "DEMO DATA" / "SYNTHETIC PATIENT".
 * - Contains NO real protected health information (PHI), real MRNs, or real professional licenses.
 * - All model outputs represent advisory clinical decision support:
 *   "Model-estimated risk" requiring clinician review.
 * - Default status when no alarms triggered:
 *   "Monitoring status: No configured alerts currently triggered."
 * - NEVER states "Patient is safe".
 */

export interface SyntheticPatient {
  id: string; // Fictional ID: SD-2026-XXXX
  recordType: 'SYNTHETIC DEMO';
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number; // kg
  height: number; // cm
  bmi: number;
  asaScore: number;
  asaPhysicalStatus: string; // e.g. "ASA II", "ASA III", "ASA IV-E"
  emergencyCase: boolean;
  procedure: string;
  surgeryDurationMin: number;
  anesthesiaDurationMin: number;
  assignedOR: string;
  assignedAnesthesiologist: string;
  assignedNurse: string;
  allergies: string[];
  comorbidities: string[];
  medicalHistory: string[];
  drugHistory: string[];
  mallampati: 1 | 2 | 3 | 4;
  vitals: {
    hr: number;
    bpSys: number;
    bpDia: number;
    map: number;
    spo2: number;
    rr: number;
    etco2: number;
    temp: number;
  };
  investigations: {
    hb: number;
    plt: number;
    cr: number;
    bun: number;
    k: number;
    wbc: number;
    ecg: string;
    echo: string;
    pft: string;
    pregnancy: boolean;
    bloodGroup: string;
  };
  fluidBalance: {
    maintenanceRateMlHr: number;
    cumulativeInfusedMl: number;
    measuredBloodLossMl: number;
    urineOutputMl: number;
    netBalanceMl: number;
  };
  predictions: {
    hypotension: { riskPct: number; alertState: string; recommendation: string };
    hypoxia: { riskPct: number; alertState: string; recommendation: string };
    bradycardia: { riskPct: number; alertState: string; recommendation: string };
    tachycardia: { riskPct: number; alertState: string; recommendation: string };
    arrhythmia: { riskPct: number; alertState: string; recommendation: string };
    emergencySeverity: { riskPct: number; alertState: string; recommendation: string };
    bloodLoss: { riskPct: number; alertState: string; recommendation: string };
    fluidRecommendation: { riskPct: number; alertState: string; recommendation: string };
    icuAdmission: { riskPct: number; alertState: string; recommendation: string };
    mortality: { riskPct: number; alertState: string; recommendation: string };
  };
  monitoringStatus: string;
  alertHistory: {
    id: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    acknowledged: boolean;
  }[];
  auditTrail: {
    timestamp: string;
    clinician: string;
    role: string;
    action: string;
    rationale?: string;
  }[];
  anesthesiaPlan: {
    recommendation: 'General' | 'Spinal' | 'Epidural' | 'Combined' | 'Regional' | 'MAC';
    confidence: number;
    reasoning: string[];
    alternatives: string[];
    warnings: string[];
    contraindications: string[];
  };
  doseParameters: {
    lbmKg: number;
    propofolInductionMg: number;
    fentanylInductionMcg: number;
    rocuroniumInductionMg: number;
    maintenancePropofolMcgKgMin: number;
    maintenanceSevofluraneMac: number;
  };
}

export interface SyntheticStaff {
  id: string;
  name: string;
  role: string;
  licenseNumber: string;
  department: string;
  status: 'On Duty' | 'In Surgery' | 'Available' | 'On Break';
  assignedOR?: string;
}

export interface SyntheticOR {
  id: string;
  name: string;
  status: 'Active' | 'Idle' | 'Emergency' | 'Cleaning';
  patientId?: string;
  patientName?: string;
  anesthesiologist: string;
  nurse: string;
  surgeryName: string;
  elapsedTimeMin: number;
  elapsedTime: number; // in minutes (for AppContext & Dashboard compatibility)
  currentVitals?: {
    hr: number;
    bpSys: number;
    bpDia: number;
    map: number;
    spo2: number;
    etco2: number;
    temp: number;
  };
  alertMessage?: string;
}

// ---------------------------------------------------------------------------
// 10 COHERENT SYNTHETIC DEMONSTRATION PATIENTS
// ---------------------------------------------------------------------------
export const DEMO_PATIENTS: SyntheticPatient[] = [
  {
    id: 'SD-2026-0001',
    recordType: 'SYNTHETIC DEMO',
    name: 'Aarav Mehta',
    age: 48,
    gender: 'Male',
    height: 174,
    weight: 76,
    bmi: 25.1,
    asaScore: 2,
    asaPhysicalStatus: 'ASA II',
    emergencyCase: false,
    procedure: 'Laparoscopic Cholecystectomy',
    surgeryDurationMin: 55,
    anesthesiaDurationMin: 70,
    assignedOR: 'OR-01',
    assignedAnesthesiologist: 'Dr. Arjun Malhotra',
    assignedNurse: 'Nisha Verma, RN',
    allergies: ['Penicillin (mild cutaneous rash)'],
    comorbidities: ['Controlled Primary Hypertension'],
    medicalHistory: ['Mild essential hypertension (controlled on Amlodipine)', 'GERD'],
    drugHistory: ['Amlodipine 5mg PO Daily', 'Pantoprazole 40mg PO Daily'],
    mallampati: 2,
    vitals: { hr: 72, bpSys: 128, bpDia: 80, map: 96, spo2: 98, rr: 14, etco2: 36, temp: 36.6 },
    investigations: {
      hb: 14.2, plt: 240, cr: 0.88, bun: 14.0, k: 4.2, wbc: 6.8,
      ecg: 'Normal sinus rhythm 72 bpm, normal axis, no ischemic changes',
      echo: 'Normal LV systolic function (LVEF 62%), no regional wall motion abnormalities',
      pft: 'Within normal limits (FEV1 96% predicted)',
      pregnancy: false, bloodGroup: 'B Positive'
    },
    fluidBalance: {
      maintenanceRateMlHr: 116, cumulativeInfusedMl: 850,
      measuredBloodLossMl: 60, urineOutputMl: 140, netBalanceMl: 650
    },
    predictions: {
      hypotension: { riskPct: 14, alertState: 'No configured alert', recommendation: 'Maintain standard crystalloid maintenance. Review recommended if MAP drifts < 65 mmHg.' },
      hypoxia: { riskPct: 4, alertState: 'No configured alert', recommendation: 'Standard protective mechanical ventilation with PEEP 5 cmH2O.' },
      bradycardia: { riskPct: 6, alertState: 'No configured alert', recommendation: 'Telemetry stable. Routine surveillance during peritoneal insufflation.' },
      tachycardia: { riskPct: 11, alertState: 'No configured alert', recommendation: 'Adequate anesthetic depth maintained with Sevoflurane 1.0 MAC.' },
      arrhythmia: { riskPct: 5, alertState: 'No configured alert', recommendation: 'Continuous Lead II/V5 monitoring; normal sinus baseline.' },
      emergencySeverity: { riskPct: 12, alertState: 'No configured alert', recommendation: 'Elective scheduled procedure.' },
      bloodLoss: { riskPct: 8, alertState: 'No configured alert', recommendation: 'Low blood loss procedure; hematocrit reserve optimal.' },
      fluidRecommendation: { riskPct: 18, alertState: 'No configured alert', recommendation: 'Balanced crystalloid replacement at 4-2-1 rule guideline.' },
      icuAdmission: { riskPct: 4, alertState: 'No configured alert', recommendation: 'Routine post-anesthesia recovery unit (PACU) discharge trajectory.' },
      mortality: { riskPct: 1, alertState: 'No configured alert', recommendation: 'Low perioperative risk profile.' }
    },
    monitoringStatus: 'Monitoring status: No configured alerts currently triggered.',
    alertHistory: [],
    auditTrail: [
      { timestamp: '08:15:00', clinician: 'Dr. Arjun Malhotra', role: 'Anesthesiologist', action: 'Preoperative Assessment Completed', rationale: 'Cleared for General Anesthesia with ETT' },
      { timestamp: '08:45:00', clinician: 'Nisha Verma, RN', role: 'OT Nurse', action: 'WHO Surgical Safety Sign-In', rationale: 'Allergies, airway, and equipment confirmed' }
    ],
    anesthesiaPlan: {
      recommendation: 'General',
      confidence: 96,
      reasoning: [
        'Laparoscopic procedure requires subdiaphragmatic pneumoperitoneum.',
        'Cuffed endotracheal intubation (ETT #8.0) ensures positive-pressure lung protection.',
        'Standard balanced general anesthesia with Propofol induction, Fentanyl analgesia, and Sevoflurane maintenance.'
      ],
      alternatives: ['Total Intravenous Anesthesia (TIVA with Propofol/Remifentanil)'],
      warnings: ['Transient peritoneal insufflation vagal reflex; observe heart rate during trochar insertion.'],
      contraindications: ['Neuraxial anesthesia as sole technique (inadequate for pneumoperitoneum).']
    },
    doseParameters: {
      lbmKg: 58.5, propofolInductionMg: 150, fentanylInductionMcg: 150,
      rocuroniumInductionMg: 45, maintenancePropofolMcgKgMin: 120, maintenanceSevofluraneMac: 1.0
    }
  },
  {
    id: 'SD-2026-0002',
    recordType: 'SYNTHETIC DEMO',
    name: 'Priya Nair',
    age: 31,
    gender: 'Female',
    height: 162,
    weight: 68,
    bmi: 25.9,
    asaScore: 2,
    asaPhysicalStatus: 'ASA II',
    emergencyCase: false,
    procedure: 'Elective Lower Segment Cesarean Section (LSCS)',
    surgeryDurationMin: 45,
    anesthesiaDurationMin: 60,
    assignedOR: 'OR-02',
    assignedAnesthesiologist: 'Dr. Priya Sundaram',
    assignedNurse: 'Sunita Patil, RN',
    allergies: ['Latex (mild contact dermatitis)'],
    comorbidities: ['Gestational Diabetes (Diet Controlled)'],
    medicalHistory: ['G1P0 at 39 weeks gestation', 'Diet-controlled gestational diabetes'],
    drugHistory: ['Prenatal Iron and Folate Supplements Daily'],
    mallampati: 1,
    vitals: { hr: 84, bpSys: 114, bpDia: 72, map: 86, spo2: 99, rr: 16, etco2: 34, temp: 36.8 },
    investigations: {
      hb: 12.1, plt: 215, cr: 0.65, bun: 10.5, k: 4.1, wbc: 9.4,
      ecg: 'Normal sinus rhythm 84 bpm, slight left axis shift consistent with pregnancy',
      echo: 'Normal gravid hemodynamics, LVEF 64%, no valvular disease',
      pft: 'Normal spirometry', pregnancy: true, bloodGroup: 'O Positive'
    },
    fluidBalance: {
      maintenanceRateMlHr: 108, cumulativeInfusedMl: 1100,
      measuredBloodLossMl: 400, urineOutputMl: 180, netBalanceMl: 520
    },
    predictions: {
      hypotension: { riskPct: 38, alertState: 'Review recommended', recommendation: 'Subarachnoid sympathetic blockade. Maintain Phenylephrine infusion/boluses ready; ensure 15° left uterine displacement.' },
      hypoxia: { riskPct: 3, alertState: 'No configured alert', recommendation: 'Supplemental O2 2 L/min via nasal cannula.' },
      bradycardia: { riskPct: 5, alertState: 'No configured alert', recommendation: 'Monitor maternal chronotropic response.' },
      tachycardia: { riskPct: 15, alertState: 'No configured alert', recommendation: 'Physiologic gravid chronotropy.' },
      arrhythmia: { riskPct: 4, alertState: 'No configured alert', recommendation: 'Normal sinus rhythm.' },
      emergencySeverity: { riskPct: 10, alertState: 'No configured alert', recommendation: 'Elective obstetric pathway.' },
      bloodLoss: { riskPct: 22, alertState: 'No configured alert', recommendation: 'Standard obstetric blood loss protocol; Oxytocin infusion 10 IU IV post-delivery.' },
      fluidRecommendation: { riskPct: 20, alertState: 'No configured alert', recommendation: 'Pre-load with 500 mL balanced crystalloid prior to subarachnoid block.' },
      icuAdmission: { riskPct: 2, alertState: 'No configured alert', recommendation: 'Standard post-delivery recovery room monitoring.' },
      mortality: { riskPct: 1, alertState: 'No configured alert', recommendation: 'Healthy parturient, minimal risk.' }
    },
    monitoringStatus: 'Monitoring status: No configured alerts currently triggered.',
    alertHistory: [],
    auditTrail: [
      { timestamp: '09:00:00', clinician: 'Dr. Priya Sundaram', role: 'Resident', action: 'Pre-Spinal Checklist Completed', rationale: 'Platelet count 215k verified; coagulation intact' }
    ],
    anesthesiaPlan: {
      recommendation: 'Spinal',
      confidence: 98,
      reasoning: [
        'Subarachnoid block (0.5% Hyperbaric Bupivacaine 10 mg + Fentanyl 15 mcg) is the technique of choice for elective LSCS.',
        'Avoids fetal drug depression, preserves maternal airway, and permits immediate mother-infant bonding.'
      ],
      alternatives: ['Combined Spinal-Epidural (CSE)', 'General Anesthesia (RSI reserved for emergency collapse)'],
      warnings: ['Left uterine tilt mandatory to avoid aortocaval compression.'],
      contraindications: ['Severe coagulopathy', 'Patient refusal', 'Local infection at puncture site.']
    },
    doseParameters: {
      lbmKg: 50.2, propofolInductionMg: 0, fentanylInductionMcg: 15,
      rocuroniumInductionMg: 0, maintenancePropofolMcgKgMin: 0, maintenanceSevofluraneMac: 0
    }
  },
  {
    id: 'SD-2026-0003',
    recordType: 'SYNTHETIC DEMO',
    name: 'Rahul Sharma',
    age: 67,
    gender: 'Male',
    height: 176,
    weight: 84,
    bmi: 27.1,
    asaScore: 3,
    asaPhysicalStatus: 'ASA III',
    emergencyCase: false,
    procedure: 'Radical Prostatectomy',
    surgeryDurationMin: 180,
    anesthesiaDurationMin: 210,
    assignedOR: 'OR-03',
    assignedAnesthesiologist: 'Dr. Arjun Malhotra',
    assignedNurse: 'Nisha Verma, RN',
    allergies: ['Sulfa Drugs (anaphylaxis history)', 'Iodinated Contrast (hives)'],
    comorbidities: ['Coronary Artery Disease (CAD, s/p DES 2021)', 'Essential Hypertension', 'Type 2 Diabetes Mellitus'],
    medicalHistory: ['Prior inferior MI (2021)', 'Hypertension on Lisinopril', 'Diabetes on Metformin'],
    drugHistory: ['Aspirin 81mg PO Daily', 'Lisinopril 10mg PO Daily', 'Metformin 500mg PO BID', 'Atorvastatin 40mg PO QHS'],
    mallampati: 3,
    vitals: { hr: 68, bpSys: 138, bpDia: 84, map: 102, spo2: 96, rr: 15, etco2: 38, temp: 36.4 },
    investigations: {
      hb: 13.0, plt: 260, cr: 1.15, bun: 22.0, k: 4.4, wbc: 7.2,
      ecg: 'Sinus rhythm 68 bpm, pathologic Q waves leads II/III/aVF (old inferior MI), no acute ST-T changes',
      echo: 'LVEF 48%, mild inferior wall hypokinesis, mild diastolic dysfunction Grade I',
      pft: 'Mild obstructive pattern (FEV1/FVC 71%)', pregnancy: false, bloodGroup: 'A Positive'
    },
    fluidBalance: {
      maintenanceRateMlHr: 124, cumulativeInfusedMl: 1400,
      measuredBloodLossMl: 280, urineOutputMl: 210, netBalanceMl: 910
    },
    predictions: {
      hypotension: { riskPct: 62, alertState: 'Review recommended', recommendation: 'Model-estimated risk elevated secondary to chronic ACE-inhibitor use and steep Trendelenburg position. Invasive arterial line active; maintain Phenylephrine/Ephedrine titrated boluses.' },
      hypoxia: { riskPct: 16, alertState: 'No configured alert', recommendation: 'PEEP 6 cmH2O to counteract cephalad diaphragmatic displacement from pneumoperitoneum.' },
      bradycardia: { riskPct: 14, alertState: 'No configured alert', recommendation: 'Monitor chronotropic balance; Glycopyrrolate available at bedside.' },
      tachycardia: { riskPct: 18, alertState: 'No configured alert', recommendation: 'Beta-blockade maintained.' },
      arrhythmia: { riskPct: 24, alertState: 'Review recommended', recommendation: 'Prior inferior MI history. Continuous ST-segment analysis on leads II and V5.' },
      emergencySeverity: { riskPct: 28, alertState: 'No configured alert', recommendation: 'Elective major oncologic resection.' },
      bloodLoss: { riskPct: 35, alertState: 'Review recommended', recommendation: 'Deep dorsal venous complex dissection; Type and Cross 2 units PRBCs reserved in blood bank.' },
      fluidRecommendation: { riskPct: 42, alertState: 'Review recommended', recommendation: 'Goal-directed fluid restriction to avoid facial/laryngeal edema under steep Trendelenburg.' },
      icuAdmission: { riskPct: 28, alertState: 'Review recommended', recommendation: 'Step-down telemetry observation bed recommended for post-op cardiac monitoring.' },
      mortality: { riskPct: 4, alertState: 'No configured alert', recommendation: 'Intermediate cardiac risk index (RCRI Class 2).' }
    },
    monitoringStatus: 'Model-estimated risk: Intraoperative hemodynamic drift review recommended.',
    alertHistory: [
      { id: 'ALT-301', timestamp: '10:15:00', severity: 'warning', title: 'Hemodynamic Drift Prediction', message: 'Model-estimated hypotension probability 62%. Requires clinician review.', acknowledged: true }
    ],
    auditTrail: [
      { timestamp: '07:30:00', clinician: 'Dr. Arjun Malhotra', role: 'Anesthesiologist', action: 'Pre-induction Radial Arterial Line Placement', rationale: 'Beat-to-beat pressure monitoring for CAD patient undergoing steep Trendelenburg' },
      { timestamp: '10:16:00', clinician: 'Dr. Arjun Malhotra', role: 'Anesthesiologist', action: 'Acknowledged Hypotension Prediction', rationale: 'Target MAP set > 70 mmHg to ensure coronary perfusion' }
    ],
    anesthesiaPlan: {
      recommendation: 'General',
      confidence: 94,
      reasoning: [
        'Prolonged steep Trendelenburg positioning with pneumoperitoneum necessitates secure endotracheal airway.',
        'High cardiovascular risk profile justifies pre-induction radial arterial line cannulation.'
      ],
      alternatives: ['Combined General-Epidural Anesthesia'],
      warnings: ['Risk of post-induction vasoplegia; keep vasopressor infusions primed.'],
      contraindications: ['Spinal anesthesia as sole modality.']
    },
    doseParameters: {
      lbmKg: 62.0, propofolInductionMg: 120, fentanylInductionMcg: 150,
      rocuroniumInductionMg: 50, maintenancePropofolMcgKgMin: 100, maintenanceSevofluraneMac: 0.9
    }
  },
  {
    id: 'SD-2026-0004',
    recordType: 'SYNTHETIC DEMO',
    name: 'Ananya Rao',
    age: 71,
    gender: 'Female',
    height: 158,
    weight: 56,
    bmi: 22.4,
    asaScore: 4,
    asaPhysicalStatus: 'ASA IV-E',
    emergencyCase: true,
    procedure: 'Emergency Exploratory Laparotomy & Hartmann Procedure',
    surgeryDurationMin: 140,
    anesthesiaDurationMin: 170,
    assignedOR: 'OR-04',
    assignedAnesthesiologist: 'Dr. Rajeshwar Rao',
    assignedNurse: 'Anita Deshmukh, RN',
    allergies: ['Ciprofloxacin (anaphylaxis)', 'Morphine (severe histamine release)'],
    comorbidities: ['Septic Shock secondary to Perforated Diverticulum', 'Severe COPD (GOLD III)', 'CKD Stage 3b'],
    medicalHistory: ['Perforated sigmoid diverticulitis with acute generalized peritonitis', 'Home oxygen 2L/min for COPD'],
    drugHistory: ['Tiotropium 18mcg Inhaler Daily', 'Formoterol/Budesonide BID', 'Furosemide 20mg PO Daily'],
    mallampati: 3,
    vitals: { hr: 118, bpSys: 92, bpDia: 54, map: 67, spo2: 92, rr: 24, etco2: 32, temp: 38.6 },
    investigations: {
      hb: 10.8, plt: 110, cr: 1.85, bun: 38.0, k: 5.2, wbc: 18.6,
      ecg: 'Sinus tachycardia 118 bpm, P-pulmonale, non-specific ST depressions in precordial leads',
      echo: 'Moderate pulmonary hypertension (sPAP 42 mmHg), LVEF 50%, right ventricular strain',
      pft: 'Severe obstructive ventilatory defect (FEV1 44% predicted)', pregnancy: false, bloodGroup: 'O Negative'
    },
    fluidBalance: {
      maintenanceRateMlHr: 96, cumulativeInfusedMl: 2200,
      measuredBloodLossMl: 450, urineOutputMl: 65, netBalanceMl: 1685
    },
    predictions: {
      hypotension: { riskPct: 84, alertState: 'Review recommended', recommendation: 'Model-estimated high risk secondary to septic vasodilation. Norepinephrine titrated via central venous line.' },
      hypoxia: { riskPct: 48, alertState: 'Review recommended', recommendation: 'Model-estimated hypoxia risk in severe COPD with peritonitis. Lung-protective ventilation (6 mL/kg PBW, PEEP 6 cmH2O).' },
      bradycardia: { riskPct: 4, alertState: 'No configured alert', recommendation: 'Hyperdynamic chronotropic state.' },
      tachycardia: { riskPct: 88, alertState: 'Review recommended', recommendation: 'Septic tachycardia; evaluate adequate intravascular filling vs vasopressor titration.' },
      arrhythmia: { riskPct: 32, alertState: 'Review recommended', recommendation: 'Electrolyte shift and RV strain. Continuous telemetry active.' },
      emergencySeverity: { riskPct: 92, alertState: 'Review recommended', recommendation: 'Emergency Category 1 resuscitation priority.' },
      bloodLoss: { riskPct: 65, alertState: 'Review recommended', recommendation: 'Platelets 110k, ongoing intra-abdominal sepsis. 2 units PRBCs checked in-room.' },
      fluidRecommendation: { riskPct: 78, alertState: 'Review recommended', recommendation: 'Oliguric response (Cr 1.85, BUN 38). Goal-directed crystalloid boluses with dynamic pulse pressure variation monitoring.' },
      icuAdmission: { riskPct: 94, alertState: 'Review recommended', recommendation: 'Mandatory post-operative Surgical ICU bed reservation confirmed.' },
      mortality: { riskPct: 22, alertState: 'Review recommended', recommendation: 'High perioperative mortality index (ASA IV-E). Consultant oversight required.' }
    },
    monitoringStatus: 'Model-estimated risk: Sepsis hemodynamic instability and ICU admission review recommended.',
    alertHistory: [
      { id: 'ALT-401', timestamp: '11:05:00', severity: 'critical', title: 'Septic Hemodynamic Instability', message: 'MAP drifting < 65 mmHg on induction. Norepinephrine initiated at 0.08 mcg/kg/min.', acknowledged: true },
      { id: 'ALT-402', timestamp: '11:20:00', severity: 'warning', title: 'Oliguria Alert', message: 'Urine output < 0.5 mL/kg/hr for preceding 60 min. Clinical review advised.', acknowledged: false }
    ],
    auditTrail: [
      { timestamp: '10:45:00', clinician: 'Dr. Rajeshwar Rao', role: 'Anesthesiologist', action: 'Rapid Sequence Induction with Ketamine/Rocuronium', rationale: 'Full stomach, acute abdomen, hemodynamically unstable' },
      { timestamp: '11:06:00', clinician: 'Dr. Rajeshwar Rao', role: 'Anesthesiologist', action: 'Initiated Norepinephrine Infusion', rationale: 'Vasoplegic septic shock; arterial line placed' }
    ],
    anesthesiaPlan: {
      recommendation: 'General',
      confidence: 99,
      reasoning: [
        'Emergency exploratory laparotomy for septic peritonitis requires modified Rapid Sequence Induction (RSI).',
        'Ketamine (1.2 mg/kg) preserves sympathetic vascular tone; avoid Succinylcholine secondary to hyperkalemia (K 5.2).',
        'Invasive arterial and central venous pressure monitoring mandatory.'
      ],
      alternatives: ['None (Emergency sepsis contraindicates neuraxial or regional sole modalities)'],
      warnings: ['High risk of post-induction circulatory collapse; prime vasopressor before induction.', 'Platelets 110k - monitor surgical field hemostasis.'],
      contraindications: ['Neuraxial anesthesia (septicemia, vasopressor dependence, coagulopathy risk).']
    },
    doseParameters: {
      lbmKg: 42.0, propofolInductionMg: 0, fentanylInductionMcg: 100,
      rocuroniumInductionMg: 50, maintenancePropofolMcgKgMin: 60, maintenanceSevofluraneMac: 0.8
    }
  },
  {
    id: 'SD-2026-0005',
    recordType: 'SYNTHETIC DEMO',
    name: 'Vikram Iyer',
    age: 54,
    gender: 'Male',
    height: 175,
    weight: 110,
    bmi: 35.9,
    asaScore: 3,
    asaPhysicalStatus: 'ASA III',
    emergencyCase: false,
    procedure: 'Total Knee Arthroplasty (TKA)',
    surgeryDurationMin: 90,
    anesthesiaDurationMin: 115,
    assignedOR: 'OR-01',
    assignedAnesthesiologist: 'Dr. Arjun Malhotra',
    assignedNurse: 'Nisha Verma, RN',
    allergies: ['Codeine (severe vomiting/dizziness)'],
    comorbidities: ['Severe Obstructive Sleep Apnea (AHI 42, CPAP compliant)', 'Class II Obesity', 'Essential Hypertension'],
    medicalHistory: ['Severe right knee osteoarthritis', 'Bilateral leg edema', 'CPAP user at 12 cmH2O'],
    drugHistory: ['Losartan 50mg PO Daily', 'Hydrochlorothiazide 12.5mg PO Daily'],
    mallampati: 4,
    vitals: { hr: 74, bpSys: 136, bpDia: 86, map: 103, spo2: 95, rr: 16, etco2: 38, temp: 36.7 },
    investigations: {
      hb: 15.0, plt: 230, cr: 1.05, bun: 16.0, k: 4.3, wbc: 7.8,
      ecg: 'Normal sinus rhythm with frequent premature ventricular contractions (PVCs)',
      echo: 'Concentric LV hypertrophy, normal systolic function (LVEF 58%), no wall motion defect',
      pft: 'Mild restrictive pattern secondary to elevated BMI (FEV1 78%, TLC 80%)', pregnancy: false, bloodGroup: 'A Positive'
    },
    fluidBalance: {
      maintenanceRateMlHr: 150, cumulativeInfusedMl: 1200,
      measuredBloodLossMl: 180, urineOutputMl: 190, netBalanceMl: 830
    },
    predictions: {
      hypotension: { riskPct: 22, alertState: 'No configured alert', recommendation: 'Standard spinal vasodilation precautions.' },
      hypoxia: { riskPct: 34, alertState: 'Review recommended', recommendation: 'Model-estimated hypoxia risk due to severe OSA (AHI 42). Use opioid-sparing regional technique; avoid heavy intraoperative sedation.' },
      bradycardia: { riskPct: 8, alertState: 'No configured alert', recommendation: 'Chronotropic parameters stable.' },
      tachycardia: { riskPct: 14, alertState: 'No configured alert', recommendation: 'Adequate analgesia under motor block.' },
      arrhythmia: { riskPct: 18, alertState: 'No configured alert', recommendation: 'Occasional PVCs noted on monitor; maintain Lead II surveillance.' },
      emergencySeverity: { riskPct: 15, alertState: 'No configured alert', recommendation: 'Elective joint arthroplasty.' },
      bloodLoss: { riskPct: 28, alertState: 'No configured alert', recommendation: 'IV Tranexamic Acid (TXA 1g) administered at induction.' },
      fluidRecommendation: { riskPct: 24, alertState: 'No configured alert', recommendation: 'Euvolumic maintenance.' },
      icuAdmission: { riskPct: 12, alertState: 'No configured alert', recommendation: 'PACU step-down with nocturnal CPAP re-initiation.' },
      mortality: { riskPct: 2, alertState: 'No configured alert', recommendation: 'Low mortality risk index.' }
    },
    monitoringStatus: 'Monitoring status: No configured alerts currently triggered.',
    alertHistory: [],
    auditTrail: [
      { timestamp: '08:00:00', clinician: 'Dr. Arjun Malhotra', role: 'Anesthesiologist', action: 'Regional Anesthesia Selected', rationale: 'Spinal + Adductor Canal Block selected to avoid general anesthesia difficult airway (Mallampati IV, BMI 36)' }
    ],
    anesthesiaPlan: {
      recommendation: 'Spinal',
      confidence: 95,
      reasoning: [
        'Spinal anesthesia with 0.5% Hyperbaric Bupivacaine (12.5 mg) combined with ultrasound-guided Adductor Canal Block.',
        'Avoids instrumentation of recognized difficult airway (Mallampati Class IV, short thick neck).',
        'Minimizes postoperative systemic opioid exposure, mitigating severe obstructive sleep apnea complications.'
      ],
      alternatives: ['General Anesthesia with Video Laryngoscopy (backup plan)'],
      warnings: ['Mallampati IV: Glidescope and LMA Fastrach placed in-room prior to start.'],
      contraindications: ['Patient refusal', 'Systemic bacteremia.']
    },
    doseParameters: {
      lbmKg: 68.0, propofolInductionMg: 0, fentanylInductionMcg: 0,
      rocuroniumInductionMg: 0, maintenancePropofolMcgKgMin: 0, maintenanceSevofluraneMac: 0
    }
  },
  {
    id: 'SD-2026-0006',
    recordType: 'SYNTHETIC DEMO',
    name: 'Sneha Kulkarni',
    age: 81,
    gender: 'Female',
    height: 154,
    weight: 51,
    bmi: 21.5,
    asaScore: 3,
    asaPhysicalStatus: 'ASA III',
    emergencyCase: false,
    procedure: 'Left Hemiarthroplasty (Femoral Neck Fracture)',
    surgeryDurationMin: 75,
    anesthesiaDurationMin: 95,
    assignedOR: 'OR-02',
    assignedAnesthesiologist: 'Dr. Priya Sundaram',
    assignedNurse: 'Sunita Patil, RN',
    allergies: ['Vancomycin (flushing/red man syndrome)'],
    comorbidities: ['Non-valvular Atrial Fibrillation', 'Mild Cognitive Impairment', 'Osteoporosis with Subcapital Fracture'],
    medicalHistory: ['Displaced femoral neck fracture following fall', 'Chronic atrial fibrillation on Apixaban (held > 48h)'],
    drugHistory: ['Apixaban 2.5mg PO BID (held 48h pre-op)', 'Metoprolol Succinate 25mg PO Daily', 'Calcium + Vitamin D3'],
    mallampati: 2,
    vitals: { hr: 82, bpSys: 124, bpDia: 70, map: 88, spo2: 95, rr: 16, etco2: 35, temp: 36.3 },
    investigations: {
      hb: 9.8, plt: 165, cr: 1.35, bun: 26.0, k: 3.9, wbc: 8.1,
      ecg: 'Atrial fibrillation with controlled ventricular response (HR 78-86 bpm), non-specific ST-T wave flattening',
      echo: 'Mild aortic sclerosis, biatrial enlargement, LVEF 50%, no left atrial appendage thrombus on recent TEE',
      pft: 'Age-appropriate mild diffusion reduction', pregnancy: false, bloodGroup: 'B Positive'
    },
    fluidBalance: {
      maintenanceRateMlHr: 91, cumulativeInfusedMl: 900,
      measuredBloodLossMl: 220, urineOutputMl: 110, netBalanceMl: 570
    },
    predictions: {
      hypotension: { riskPct: 44, alertState: 'Review recommended', recommendation: 'Geriatric autonomic fragility. Maintain MAP > 65 mmHg to preserve cerebral and coronary perfusion.' },
      hypoxia: { riskPct: 18, alertState: 'No configured alert', recommendation: 'Low baseline reserve; supplemental O2 via face mask.' },
      bradycardia: { riskPct: 12, alertState: 'No configured alert', recommendation: 'Monitor AV nodal conduction under Metoprolol therapy.' },
      tachycardia: { riskPct: 15, alertState: 'No configured alert', recommendation: 'Ventricular rate currently controlled.' },
      arrhythmia: { riskPct: 82, alertState: 'Review recommended', recommendation: 'Known baseline atrial fibrillation. Monitor for rapid ventricular response (RVR).' },
      emergencySeverity: { riskPct: 35, alertState: 'No configured alert', recommendation: 'Urgent hip fracture pathway.' },
      bloodLoss: { riskPct: 46, alertState: 'Review recommended', recommendation: 'Baseline Hb 9.8 g/dL; blood loss review recommended. Crossmatched 1 unit PRBCs on hold.' },
      fluidRecommendation: { riskPct: 38, alertState: 'No configured alert', recommendation: 'Carefully titrate fluid; borderline creatinine clearance ~35 mL/min.' },
      icuAdmission: { riskPct: 22, alertState: 'No configured alert', recommendation: 'High-dependency post-op surgical bed reservation.' },
      mortality: { riskPct: 5, alertState: 'No configured alert', recommendation: 'Frail geriatric patient; delicate hemodynamic optimization required.' }
    },
    monitoringStatus: 'Model-estimated risk: Baseline atrial fibrillation and anemia review recommended.',
    alertHistory: [
      { id: 'ALT-601', timestamp: '08:45:00', severity: 'warning', title: 'Atrial Fibrillation Rhythm Review', message: 'Model detects non-sinus rhythm (AFib). Ventricular rate stable at 82 bpm.', acknowledged: true }
    ],
    auditTrail: [
      { timestamp: '07:15:00', clinician: 'Dr. Priya Sundaram', role: 'Resident', action: 'DOAC Timing Checked', rationale: 'Apixaban verified held for 50 hours; CrCl 36 mL/min. Cleared for low-dose spinal' }
    ],
    anesthesiaPlan: {
      recommendation: 'Spinal',
      confidence: 92,
      reasoning: [
        'Low-dose unilateral subarachnoid block (0.5% Hyperbaric Bupivacaine 7.5 mg + Fentanyl 10 mcg) positioned left lateral for 10 minutes.',
        'Minimizes postoperative delirium (POD) compared to polypharmacy general anesthesia in an octogenarian.',
        'Combined with ultrasound-guided PENG (Pericapsular Nerve Group) block for post-op analgesia.'
      ],
      alternatives: ['General Anesthesia with TIVA Propofol/Remifentanil and BIS monitoring'],
      warnings: ['Maintain MAP > 65 mmHg to prevent geriatric watershed cerebral infarction.'],
      contraindications: ['Inadequate anticoagulant cessation window.']
    },
    doseParameters: {
      lbmKg: 38.2, propofolInductionMg: 0, fentanylInductionMcg: 10,
      rocuroniumInductionMg: 0, maintenancePropofolMcgKgMin: 0, maintenanceSevofluraneMac: 0
    }
  },
  {
    id: 'SD-2026-0007',
    recordType: 'SYNTHETIC DEMO',
    name: 'Arjun Menon',
    age: 42,
    gender: 'Male',
    height: 180,
    weight: 79,
    bmi: 24.4,
    asaScore: 2,
    asaPhysicalStatus: 'ASA II',
    emergencyCase: false,
    procedure: 'Arthroscopic Rotator Cuff Repair & Subacromial Decompression',
    surgeryDurationMin: 80,
    anesthesiaDurationMin: 105,
    assignedOR: 'OR-03',
    assignedAnesthesiologist: 'Dr. Arjun Malhotra',
    assignedNurse: 'Nisha Verma, RN',
    allergies: [],
    comorbidities: ['Mild Primary Hypertension (controlled)'],
    medicalHistory: ['Full thickness supraspinatus tear', 'Well-controlled hypertension'],
    drugHistory: ['Telmisartan 40mg PO Daily'],
    mallampati: 2,
    vitals: { hr: 64, bpSys: 122, bpDia: 76, map: 91, spo2: 99, rr: 14, etco2: 37, temp: 36.8 },
    investigations: {
      hb: 14.8, plt: 210, cr: 0.95, bun: 15.0, k: 4.1, wbc: 6.5,
      ecg: 'Normal sinus rhythm 64 bpm, normal PR and QTc intervals',
      echo: 'Normal LV cavity and wall thickness, LVEF 65%',
      pft: 'Normal spirometry', pregnancy: false, bloodGroup: 'O Positive'
    },
    fluidBalance: {
      maintenanceRateMlHr: 119, cumulativeInfusedMl: 950,
      measuredBloodLossMl: 40, urineOutputMl: 160, netBalanceMl: 750
    },
    predictions: {
      hypotension: { riskPct: 32, alertState: 'Review recommended', recommendation: 'Beach chair position requires strict cerebral perfusion pressure monitoring; avoid aggressive hypotensive anesthesia.' },
      hypoxia: { riskPct: 6, alertState: 'No configured alert', recommendation: 'Normal respiratory parameters.' },
      bradycardia: { riskPct: 14, alertState: 'No configured alert', recommendation: 'Monitor Bezold-Jarisch reflex during shoulder arthroscopy in sitting position.' },
      tachycardia: { riskPct: 8, alertState: 'No configured alert', recommendation: 'Optimal depth.' },
      arrhythmia: { riskPct: 4, alertState: 'No configured alert', recommendation: 'Sinus baseline.' },
      emergencySeverity: { riskPct: 8, alertState: 'No configured alert', recommendation: 'Elective ambulatory arthroscopy.' },
      bloodLoss: { riskPct: 6, alertState: 'No configured alert', recommendation: 'Minimal blood loss procedure.' },
      fluidRecommendation: { riskPct: 16, alertState: 'No configured alert', recommendation: 'Maintenance crystalloid.' },
      icuAdmission: { riskPct: 2, alertState: 'No configured alert', recommendation: 'Day-care ambulatory surgical discharge pathway.' },
      mortality: { riskPct: 1, alertState: 'No configured alert', recommendation: 'Minimal perioperative mortality probability.' }
    },
    monitoringStatus: 'Monitoring status: No configured alerts currently triggered.',
    alertHistory: [],
    auditTrail: [
      { timestamp: '08:30:00', clinician: 'Dr. Arjun Malhotra', role: 'Anesthesiologist', action: 'Interscalene Brachial Plexus Block Administered', rationale: 'Ultrasound-guided 0.5% Ropivacaine 15 mL with Dexamethasone 4 mg adjuvant' }
    ],
    anesthesiaPlan: {
      recommendation: 'Regional',
      confidence: 96,
      reasoning: [
        'Ultrasound-guided Interscalene Block provides dense 18-24 hour analgesia for shoulder repair.',
        'Combined with General Anesthesia via LMA #4 for airway maintenance in the beach chair position.'
      ],
      alternatives: ['Suprascapular + Axillary Nerve Block (phrenic-sparing alternative)'],
      warnings: ['Ipsilateral phrenic nerve blockade expected (~100%); verify patient has no contralateral diaphragmatic compromise.'],
      contraindications: ['Pre-existing severe contralateral pulmonary disease.']
    },
    doseParameters: {
      lbmKg: 61.2, propofolInductionMg: 160, fentanylInductionMcg: 100,
      rocuroniumInductionMg: 0, maintenancePropofolMcgKgMin: 120, maintenanceSevofluraneMac: 0.9
    }
  },
  {
    id: 'SD-2026-0008',
    recordType: 'SYNTHETIC DEMO',
    name: 'Kavya Reddy',
    age: 35,
    gender: 'Female',
    height: 166,
    weight: 62,
    bmi: 22.5,
    asaScore: 2,
    asaPhysicalStatus: 'ASA II',
    emergencyCase: false,
    procedure: 'Robotic Hemithyroidectomy with Intraoperative Neuromonitoring (IONM)',
    surgeryDurationMin: 110,
    anesthesiaDurationMin: 135,
    assignedOR: 'OR-01',
    assignedAnesthesiologist: 'Dr. Arjun Malhotra',
    assignedNurse: 'Nisha Verma, RN',
    allergies: ['Aspirin (urticaria/bronchospasm)'],
    comorbidities: ['Euthyroid Multinodular Goiter', 'Allergic Rhinitis'],
    medicalHistory: ['Benign solitary nodule on FNA', 'No airway compression on CT neck'],
    drugHistory: ['Levothyroxine 50mcg PO Daily', 'Cetirizine 10mg PO PRN'],
    mallampati: 2,
    vitals: { hr: 70, bpSys: 118, bpDia: 74, map: 89, spo2: 99, rr: 14, etco2: 36, temp: 36.7 },
    investigations: {
      hb: 13.4, plt: 280, cr: 0.72, bun: 12.0, k: 4.2, wbc: 6.2,
      ecg: 'Normal sinus rhythm 70 bpm', echo: 'Normal cardiac anatomy and function (LVEF 63%)',
      pft: 'Flow-volume loops demonstrate no tracheal extrathoracic stenosis', pregnancy: false, bloodGroup: 'A Negative'
    },
    fluidBalance: {
      maintenanceRateMlHr: 102, cumulativeInfusedMl: 750,
      measuredBloodLossMl: 50, urineOutputMl: 130, netBalanceMl: 570
    },
    predictions: {
      hypotension: { riskPct: 16, alertState: 'No configured alert', recommendation: 'Hemodynamics stable under TIVA infusion.' },
      hypoxia: { riskPct: 5, alertState: 'No configured alert', recommendation: 'EMG endotracheal tube secured at vocal cords.' },
      bradycardia: { riskPct: 6, alertState: 'No configured alert', recommendation: 'Sinus baseline.' },
      tachycardia: { riskPct: 10, alertState: 'No configured alert', recommendation: 'Adequate analgesia with Remifentanil.' },
      arrhythmia: { riskPct: 4, alertState: 'No configured alert', recommendation: 'Normal sinus rhythm.' },
      emergencySeverity: { riskPct: 8, alertState: 'No configured alert', recommendation: 'Elective robotic endocrine procedure.' },
      bloodLoss: { riskPct: 12, alertState: 'No configured alert', recommendation: 'Low blood loss expected with harmonic scalpel dissection.' },
      fluidRecommendation: { riskPct: 18, alertState: 'No configured alert', recommendation: 'Standard maintenance.' },
      icuAdmission: { riskPct: 3, alertState: 'No configured alert', recommendation: 'Floor admission post-PACU clearance.' },
      mortality: { riskPct: 1, alertState: 'No configured alert', recommendation: 'Low risk baseline.' }
    },
    monitoringStatus: 'Monitoring status: No configured alerts currently triggered.',
    alertHistory: [],
    auditTrail: [
      { timestamp: '09:15:00', clinician: 'Dr. Arjun Malhotra', role: 'Anesthesiologist', action: 'NIM EMG Endotracheal Tube Verification', rationale: 'Direct videolaryngoscopy electrode alignment verified at recurrent laryngeal nerve level' }
    ],
    anesthesiaPlan: {
      recommendation: 'General',
      confidence: 97,
      reasoning: [
        'Robotic hemithyroidectomy requires Intraoperative Neuromonitoring (IONM) of the Recurrent Laryngeal Nerve.',
        'Medtronic NIM EMG Endotracheal Tube #6.5 placed under direct videolaryngoscopy.',
        'Total Intravenous Anesthesia (TIVA with Propofol and Remifentanil); short-acting muscle relaxation (Rocuronium 0.6 mg/kg) only for intubation without intraoperative maintenance.'
      ],
      alternatives: ['Inhalational anesthesia with low-dose volatile agent (TIVA preferred to prevent EMG interference)'],
      warnings: ['No intraoperative muscle relaxant redosing to preserve RLN electrical signal transmission.'],
      contraindications: ['Ongoing neuromuscular blockade.']
    },
    doseParameters: {
      lbmKg: 46.5, propofolInductionMg: 130, fentanylInductionMcg: 100,
      rocuroniumInductionMg: 35, maintenancePropofolMcgKgMin: 140, maintenanceSevofluraneMac: 0
    }
  },
  {
    id: 'SD-2026-0009',
    recordType: 'SYNTHETIC DEMO',
    name: 'Rohan Desai',
    age: 59,
    gender: 'Male',
    height: 172,
    weight: 82,
    bmi: 27.7,
    asaScore: 4,
    asaPhysicalStatus: 'ASA IV',
    emergencyCase: false,
    procedure: 'Coronary Artery Bypass Grafting (CABG x 3)',
    surgeryDurationMin: 240,
    anesthesiaDurationMin: 270,
    assignedOR: 'OR-04',
    assignedAnesthesiologist: 'Dr. Rajeshwar Rao',
    assignedNurse: 'Anita Deshmukh, RN',
    allergies: ['Protamine (suspected reaction during prior cardiac catheterization)'],
    comorbidities: ['Triple Vessel Coronary Artery Disease', 'Severe LV Dysfunction (LVEF 32%)', 'Dyslipidemia', 'Post-Infarct Angina'],
    medicalHistory: ['Recent NSTEMI (3 weeks prior)', 'Left main equivalent disease (90% proximal LAD, 85% circumflex, 95% RCA)'],
    drugHistory: ['Aspirin 81mg PO Daily', 'Clopidogrel (held 5 days)', 'Metoprolol Tartrate 50mg PO BID', 'Atorvastatin 80mg PO Daily', 'Isosorbide Mononitrate 30mg PO Daily'],
    mallampati: 3,
    vitals: { hr: 62, bpSys: 112, bpDia: 68, map: 83, spo2: 97, rr: 14, etco2: 35, temp: 36.2 },
    investigations: {
      hb: 12.8, plt: 195, cr: 1.28, bun: 24.0, k: 4.5, wbc: 7.9,
      ecg: 'Sinus rhythm 62 bpm, first-degree AV block (PR 215 ms), anterior lead Q waves (old anteroseptal MI)',
      echo: 'Dilated left ventricle (LVEDD 62 mm), global hypokinesis, severe LV dysfunction (LVEF 32%), mild mitral regurgitation',
      pft: 'Moderate restriction secondary to cardiomegaly', pregnancy: false, bloodGroup: 'AB Positive'
    },
    fluidBalance: {
      maintenanceRateMlHr: 122, cumulativeInfusedMl: 2800,
      measuredBloodLossMl: 650, urineOutputMl: 340, netBalanceMl: 1810
    },
    predictions: {
      hypotension: { riskPct: 76, alertState: 'Review recommended', recommendation: 'Model-estimated high risk secondary to low baseline ejection fraction (32%). Epinephrine/Milrinone infusions prepared for cardiopulmonary bypass weaning.' },
      hypoxia: { riskPct: 28, alertState: 'Review recommended', recommendation: 'Post-bypass atelectasis prevention with recruitment maneuvers and positive end-expiratory pressure.' },
      bradycardia: { riskPct: 32, alertState: 'Review recommended', recommendation: 'First-degree AV block baseline. Epicardial pacing wires placed intraoperatively.' },
      tachycardia: { riskPct: 22, alertState: 'No configured alert', recommendation: 'Strict rate control to minimize myocardial oxygen demand.' },
      arrhythmia: { riskPct: 68, alertState: 'Review recommended', recommendation: 'Ischemic myocardium; high ventricular ectopy probability during reperfusion. Amiodarone and defibrillator on standby.' },
      emergencySeverity: { riskPct: 58, alertState: 'Review recommended', recommendation: 'High acuity surgical category.' },
      bloodLoss: { riskPct: 72, alertState: 'Review recommended', recommendation: 'Cardiopulmonary bypass systemic heparinization; 4 units PRBCs, 2 units FFP, and 1 pool platelets ordered in blood bank.' },
      fluidRecommendation: { riskPct: 64, alertState: 'Review recommended', recommendation: 'Goal-directed transesophageal echocardiography (TEE) guided fluid resuscitation.' },
      icuAdmission: { riskPct: 98, alertState: 'Review recommended', recommendation: 'Mandatory Cardiac Surgical Intensive Care Unit (CSICU) admission with invasive monitoring.' },
      mortality: { riskPct: 14, alertState: 'Review recommended', recommendation: 'EuroSCORE II calculated mortality risk: 6.8%. Senior cardiac anesthesiologist consultant in room.' }
    },
    monitoringStatus: 'Model-estimated risk: Cardiac ischemic risk and post-bypass inotropic review recommended.',
    alertHistory: [
      { id: 'ALT-901', timestamp: '07:45:00', severity: 'warning', title: 'Cardiogenic Hemodynamic Risk', message: 'Model predicts 76% hypotension probability post-induction. Inotropic support standby.', acknowledged: true }
    ],
    auditTrail: [
      { timestamp: '06:45:00', clinician: 'Dr. Rajeshwar Rao', role: 'Anesthesiologist', action: 'Swan-Ganz Pulmonary Artery Catheter Inserted', rationale: 'Cardiac output, continuous mixed venous SVO2, and PA pressure monitoring for LVEF 32%' }
    ],
    anesthesiaPlan: {
      recommendation: 'General',
      confidence: 99,
      reasoning: [
        'On-pump Coronary Artery Bypass Grafting requires deep general anesthesia, systemic heparinization, and hypothermic cardiopulmonary bypass.',
        'High-dose opioid induction (Sufentanil/Fentanyl + Midazolam + Vecuronium) preserves myocardial oxygen supply/demand balance.',
        'Continuous TEE monitoring to assess wall motion abnormalities and guide inotropic weaning.'
      ],
      alternatives: ['Off-Pump Coronary Artery Bypass (OPCAB)'],
      warnings: ['History of suspected Protamine reaction: pre-treat with Hydrocortisone and Diphenhydramine; slow test dose titration.'],
      contraindications: ['Regional sole modalities prohibited.']
    },
    doseParameters: {
      lbmKg: 59.8, propofolInductionMg: 60, fentanylInductionMcg: 300,
      rocuroniumInductionMg: 60, maintenancePropofolMcgKgMin: 60, maintenanceSevofluraneMac: 0.7
    }
  },
  {
    id: 'SD-2026-0010',
    recordType: 'SYNTHETIC DEMO',
    name: 'Neha Kapoor',
    age: 26,
    gender: 'Female',
    height: 164,
    weight: 58,
    bmi: 21.6,
    asaScore: 1,
    asaPhysicalStatus: 'ASA I',
    emergencyCase: false,
    procedure: 'Diagnostic Laparoscopy & Ovarian Cystectomy',
    surgeryDurationMin: 40,
    anesthesiaDurationMin: 55,
    assignedOR: 'OR-02',
    assignedAnesthesiologist: 'Dr. Priya Sundaram',
    assignedNurse: 'Sunita Patil, RN',
    allergies: [],
    comorbidities: [],
    medicalHistory: ['Benign dermoid cyst right ovary', 'No systemic comorbidities', 'Non-smoker'],
    drugHistory: ['None'],
    mallampati: 1,
    vitals: { hr: 76, bpSys: 112, bpDia: 70, map: 84, spo2: 99, rr: 14, etco2: 35, temp: 36.6 },
    investigations: {
      hb: 13.8, plt: 275, cr: 0.70, bun: 11.0, k: 4.0, wbc: 5.8,
      ecg: 'Normal sinus rhythm 76 bpm, pristine trace',
      echo: 'Normal cardiac anatomy and function', pft: 'Normal spirometry',
      pregnancy: false, bloodGroup: 'A Positive'
    },
    fluidBalance: {
      maintenanceRateMlHr: 98, cumulativeInfusedMl: 600,
      measuredBloodLossMl: 30, urineOutputMl: 100, netBalanceMl: 470
    },
    predictions: {
      hypotension: { riskPct: 8, alertState: 'No configured alert', recommendation: 'Hemodynamics within safe baseline bounds.' },
      hypoxia: { riskPct: 2, alertState: 'No configured alert', recommendation: 'Standard lung-protective ventilation.' },
      bradycardia: { riskPct: 5, alertState: 'No configured alert', recommendation: 'Normal chronotropic tone.' },
      tachycardia: { riskPct: 6, alertState: 'No configured alert', recommendation: 'Adequate analgesia and depth.' },
      arrhythmia: { riskPct: 2, alertState: 'No configured alert', recommendation: 'Normal sinus rhythm.' },
      emergencySeverity: { riskPct: 5, alertState: 'No configured alert', recommendation: 'Elective low-complexity outpatient surgery.' },
      bloodLoss: { riskPct: 4, alertState: 'No configured alert', recommendation: 'Minimal anticipated blood loss.' },
      fluidRecommendation: { riskPct: 10, alertState: 'No configured alert', recommendation: 'Standard maintenance crystalloid.' },
      icuAdmission: { riskPct: 1, alertState: 'No configured alert', recommendation: 'Direct day-surgery ambulatory discharge.' },
      mortality: { riskPct: 0.1, alertState: 'No configured alert', recommendation: 'Minimal perioperative mortality risk.' }
    },
    monitoringStatus: 'Monitoring status: No configured alerts currently triggered.',
    alertHistory: [],
    auditTrail: [
      { timestamp: '12:00:00', clinician: 'Dr. Priya Sundaram', role: 'Resident', action: 'Preoperative Assessment Completed', rationale: 'ASA Class I cleared for outpatient general anesthesia' }
    ],
    anesthesiaPlan: {
      recommendation: 'General',
      confidence: 99,
      reasoning: [
        'Laparoscopic pelvic visualization requires pneumoperitoneum.',
        'Standard balanced general anesthesia with LMA ProSeal / Endotracheal intubation.',
        'Multimodal PONV prophylaxis with Ondansetron 4 mg and Dexamethasone 4 mg.'
      ],
      alternatives: ['LMA Supreme with spontaneous-assisted ventilation'],
      warnings: ['Postoperative nausea and vomiting prophylaxis indicated for young female undergoing laparoscopy.'],
      contraindications: ['None.']
    },
    doseParameters: {
      lbmKg: 44.0, propofolInductionMg: 130, fentanylInductionMcg: 100,
      rocuroniumInductionMg: 35, maintenancePropofolMcgKgMin: 120, maintenanceSevofluraneMac: 1.0
    }
  }
];

// ---------------------------------------------------------------------------
// SYNTHETIC DEMONSTRATION STAFF (All Fictional)
// ---------------------------------------------------------------------------
export const DEMO_STAFF: SyntheticStaff[] = [
  {
    id: 'STF-101',
    name: 'Dr. Arjun Malhotra',
    role: 'Consultant Anesthesiologist',
    licenseNumber: 'DEMO-LIC-2048',
    department: 'Anesthesiology & Perioperative Medicine',
    status: 'In Surgery',
    assignedOR: 'OR-01'
  },
  {
    id: 'STF-102',
    name: 'Nisha Verma, RN',
    role: 'Senior Operating Room Nurse',
    licenseNumber: 'DEMO-RN-1042',
    department: 'Surgical Nursing Division',
    status: 'In Surgery',
    assignedOR: 'OR-01'
  },
  {
    id: 'STF-103',
    name: 'Dr. Priya Sundaram',
    role: 'Senior Anesthesia Resident',
    licenseNumber: 'DEMO-RES-3012',
    department: 'Anesthesia Residency Program',
    status: 'In Surgery',
    assignedOR: 'OR-02'
  },
  {
    id: 'STF-104',
    name: 'Sunita Patil, RN',
    role: 'Staff Nurse',
    licenseNumber: 'DEMO-RN-1055',
    department: 'Post-Anesthesia Care Unit (PACU)',
    status: 'In Surgery',
    assignedOR: 'OR-02'
  },
  {
    id: 'STF-105',
    name: 'Dr. Rajeshwar Rao, MS, MCh',
    role: 'Consultant Cardiothoracic & Trauma Surgeon',
    licenseNumber: 'DEMO-SUR-1094',
    department: 'Division of Surgery & Critical Care',
    status: 'In Surgery',
    assignedOR: 'OR-04'
  },
  {
    id: 'STF-106',
    name: 'Anita Deshmukh, RN',
    role: 'Critical Care & Emergency Nurse',
    licenseNumber: 'DEMO-RN-1088',
    department: 'Operating Theater & Trauma Bay',
    status: 'In Surgery',
    assignedOR: 'OR-04'
  }
];

// ---------------------------------------------------------------------------
// SYNTHETIC DEMONSTRATION OPERATING ROOMS
// ---------------------------------------------------------------------------
export const DEMO_OPERATING_ROOMS: SyntheticOR[] = [
  {
    id: 'OR-01',
    name: 'Operating Room 1 (General / Laparoscopic)',
    status: 'Active',
    patientId: 'SD-2026-0001',
    patientName: 'Aarav Mehta',
    anesthesiologist: 'Dr. Arjun Malhotra',
    nurse: 'Nisha Verma, RN',
    surgeryName: 'Laparoscopic Cholecystectomy',
    elapsedTimeMin: 35,
    elapsedTime: 35,
    currentVitals: { hr: 72, bpSys: 128, bpDia: 80, map: 96, spo2: 98, etco2: 36, temp: 36.6 }
  },
  {
    id: 'OR-02',
    name: 'Operating Room 2 (Obstetrics & Gynecology)',
    status: 'Active',
    patientId: 'SD-2026-0002',
    patientName: 'Priya Nair',
    anesthesiologist: 'Dr. Priya Sundaram',
    nurse: 'Sunita Patil, RN',
    surgeryName: 'Elective Lower Segment Cesarean Section',
    elapsedTimeMin: 22,
    elapsedTime: 22,
    currentVitals: { hr: 84, bpSys: 114, bpDia: 72, map: 86, spo2: 99, etco2: 34, temp: 36.8 }
  },
  {
    id: 'OR-03',
    name: 'Operating Room 3 (Urology & Oncology)',
    status: 'Active',
    patientId: 'SD-2026-0003',
    patientName: 'Rahul Sharma',
    anesthesiologist: 'Dr. Arjun Malhotra',
    nurse: 'Nisha Verma, RN',
    surgeryName: 'Radical Prostatectomy',
    elapsedTimeMin: 85,
    elapsedTime: 85,
    currentVitals: { hr: 68, bpSys: 138, bpDia: 84, map: 102, spo2: 96, etco2: 38, temp: 36.4 },
    alertMessage: 'Model-estimated risk: Intraoperative MAP drift review advised.'
  },
  {
    id: 'OR-04',
    name: 'Operating Room 4 (Trauma & Emergency Bay)',
    status: 'Emergency',
    patientId: 'SD-2026-0004',
    patientName: 'Ananya Rao',
    anesthesiologist: 'Dr. Rajeshwar Rao',
    nurse: 'Anita Deshmukh, RN',
    surgeryName: 'Emergency Exploratory Laparotomy (Septic Shock)',
    elapsedTimeMin: 45,
    elapsedTime: 45,
    currentVitals: { hr: 118, bpSys: 92, bpDia: 54, map: 67, spo2: 92, etco2: 32, temp: 38.6 },
    alertMessage: 'CRITICAL: Septic hemodynamic drift. Norepinephrine infusion active at 0.08 mcg/kg/min.'
  }
];

// ---------------------------------------------------------------------------
// DYNAMIC DASHBOARD METRICS DERIVED FROM DEMO DATA
// ---------------------------------------------------------------------------
export const getSyntheticDashboardMetrics = (patients: SyntheticPatient[] = DEMO_PATIENTS, ors: SyntheticOR[] = DEMO_OPERATING_ROOMS) => {
  const totalPatients = patients.length;
  const activeORs = ors.filter(o => o.status === 'Active' || o.status === 'Emergency').length;
  const highRiskReview = patients.filter(p => p.asaScore >= 3).length;
  const emergencyCases = patients.filter(p => p.emergencyCase).length;
  
  // Alerts requiring review: any patient with a prediction marked 'Review recommended'
  const alertsRequiringReview = patients.filter(p => 
    p.predictions && Object.values(p.predictions).some((pred: any) => pred?.alertState === 'Review recommended')
  ).length;

  const stable = patients.filter(p => 
    !p.predictions || !Object.values(p.predictions).some((pred: any) => pred?.alertState === 'Review recommended')
  ).length;

  const underObservation = patients.filter(p => p.asaScore === 2).length;

  return {
    totalPatients,
    activeORs,
    totalORs: ors.length,
    alertsRequiringReview,
    stable,
    underObservation,
    highRiskReview,
    emergencyCases,
    pacuOccupancyBeds: 4,
    totalPACUBeds: 10
  };
};
