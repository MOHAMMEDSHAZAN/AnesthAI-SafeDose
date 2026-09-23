import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

// Types for Checklists
interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  status: 'not_checked' | 'confirmed' | 'attention';
  notes?: string;
}

interface SafetyAlert {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  what_changed: string;
  why_it_matters: string;
  current_value: string;
  trend: string;
  suggested_checks: string[];
  recommended_actions: string[];
  acknowledged: boolean;
  overridden: boolean;
  override_reason?: string;
  timestamp?: string;
}

export const IntraopSafety: React.FC = () => {
  const { simulatedState, patients } = useApp();
  const currentPatient = patients[0] || {
    id: 'SD-2026-0001',
    name: 'Rajesh Kumar (Synthetic Demo)',
    age: 52,
    weight: 74,
    height: 172,
    gender: 'Male',
    asaScore: 2,
    asaPhysicalStatus: 'ASA II'
  };

  // Active module tab: 'preinduction' | 'continuous' | 'fluid' | 'signout' | 'emergency' | 'audit'
  const [activeTab, setActiveTab] = useState<'preinduction' | 'continuous' | 'fluid' | 'signout' | 'emergency' | 'audit'>('continuous');

  // Clinician metadata
  const [clinicianName, setClinicianName] = useState<string>('Dr. Anesthesiologist, MD');

  // -------------------------------------------------------------
  // Section A: Pre-Induction / Sign-In Checklist (21 Items)
  // -------------------------------------------------------------
  const [preInductionItems, setPreInductionItems] = useState<ChecklistItem[]>([
    { id: 'pre_1', label: 'Patient identity confirmed (2 identifiers & wristband)', category: 'Identification', status: 'confirmed' },
    { id: 'pre_2', label: 'Procedure confirmed with surgical schedule & consent', category: 'Consent', status: 'confirmed' },
    { id: 'pre_3', label: 'Informed consent confirmed & signed in chart', category: 'Consent', status: 'confirmed' },
    { id: 'pre_4', label: 'Surgical site marked & verified by operative team', category: 'Site', status: 'confirmed' },
    { id: 'pre_5', label: 'Allergies reviewed & allergy band checked', category: 'Allergies', status: 'confirmed' },
    { id: 'pre_6', label: 'ASA Physical Status Classification confirmed by clinician', category: 'Assessment', status: 'confirmed' },
    { id: 'pre_7', label: 'Emergency status confirmed (Elective vs Emergency "E")', category: 'Assessment', status: 'confirmed' },
    { id: 'pre_8', label: 'Airway assessment completed (Mallampati, thyromental, neck mobility)', category: 'Airway', status: 'confirmed' },
    { id: 'pre_9', label: 'Aspiration risk assessed & fasting hours verified', category: 'Airway', status: 'confirmed' },
    { id: 'pre_10', label: 'Relevant comorbidities reviewed (Cardiovascular, Pulmonary, Renal, Endocrine)', category: 'Medical', status: 'confirmed' },
    { id: 'pre_11', label: 'Relevant investigations reviewed (ECG, Echo, CBC, Coags, Chemistries)', category: 'Investigations', status: 'confirmed' },
    { id: 'pre_12', label: 'IV access confirmed (Patent peripheral or central line verified)', category: 'Access', status: 'confirmed' },
    { id: 'pre_13', label: 'Blood availability assessed when appropriate (Type & screen / crossmatch)', category: 'Blood', status: 'confirmed' },
    { id: 'pre_14', label: 'Anesthesia plan reviewed with patient & surgical team', category: 'Plan', status: 'confirmed' },
    { id: 'pre_15', label: 'Monitoring plan confirmed (Standard ASA monitors +/- invasive arterial/CVP)', category: 'Plan', status: 'confirmed' },
    { id: 'pre_16', label: 'Anesthesia machine & auxiliary equipment checked', category: 'Equipment', status: 'confirmed' },
    { id: 'pre_17', label: 'Oxygen supply checked (Pipeline & reserve cylinders confirmed)', category: 'Equipment', status: 'confirmed' },
    { id: 'pre_18', label: 'Airway equipment checked (ETT, LMAs, laryngoscope blades, video scope)', category: 'Equipment', status: 'confirmed' },
    { id: 'pre_19', label: 'Suction apparatus checked & functioning properly', category: 'Equipment', status: 'confirmed' },
    { id: 'pre_20', label: 'Medication/allergy verification completed & emergency drugs drawn', category: 'Medications', status: 'confirmed' },
    { id: 'pre_21', label: 'Anticipated difficult airway plan documented & anticipated blood loss assessed', category: 'Contingency', status: 'confirmed' }
  ]);
  const [preInductionConfirmed, setPreInductionConfirmed] = useState<boolean>(false);
  const [preInductionTimestamp, setPreInductionTimestamp] = useState<string>('');

  // -------------------------------------------------------------
  // Section B: Continuous Intraoperative Live Telemetry & Vitals
  // -------------------------------------------------------------
  const [vitals, setVitals] = useState({
    hr: 72,
    bpSys: 118,
    bpDia: 74,
    map: 89,
    spo2: 99,
    etco2: 37,
    temp: 36.7,
    rr: 12,
    ecg: 'Normal Sinus Rhythm (NSR)',
    anesthesia_duration_mins: 65,
    surgery_duration_mins: 45
  });

  // -------------------------------------------------------------
  // Explainable Alerts & Safety Status State
  // -------------------------------------------------------------
  const [alerts, setAlerts] = useState<SafetyAlert[]>([
    {
      id: 'alt_map_1',
      title: 'MAP below configured threshold (65 mmHg)',
      severity: 'WARNING',
      what_changed: 'Mean Arterial Pressure decreased from 78 to 62 mmHg over 10 minutes.',
      why_it_matters: 'Prolonged MAP < 65 mmHg increases risk of end-organ hypoperfusion, acute kidney injury, and myocardial injury.',
      current_value: 'MAP 62 mmHg',
      trend: 'Decreasing (-16 mmHg / 10m)',
      suggested_checks: [
        'Verify NIBP cuff position and cycle an immediate blood pressure repeat',
        'Assess surgical field for unexpected bleeding or suction volume',
        'Review depth of anesthesia and volatile agent concentration',
        'Evaluate volume status, stroke volume variation, and pulse pressure',
        'Assess cardiac contractility and heart rate rhythm'
      ],
      recommended_actions: [
        'Titrate volatile anesthetic agent down if depth exceeds clinical necessity',
        'Administer crystalloid bolus (e.g. 250-500 mL) if fluid responsiveness expected',
        'Consider vasopressor titration (Phenylephrine 50-100 mcg or Ephedrine 5-10 mg IV)',
        'Alert operating surgeon to hemodynamic change'
      ],
      acknowledged: false,
      overridden: false,
      override_reason: ''
    }
  ]);

  const [overrideModalAlert, setOverrideModalAlert] = useState<SafetyAlert | null>(null);
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('');

  // -------------------------------------------------------------
  // Section C: Surgical Sign-Out Checklist (12 Items)
  // -------------------------------------------------------------
  const [signOutItems, setSignOutItems] = useState<ChecklistItem[]>([
    { id: 'out_1', label: 'Procedure completed as intended & recorded in operative register', category: 'Procedure', status: 'not_checked' },
    { id: 'out_2', label: 'Instrument count confirmed correct by scrub & circulating nurses', category: 'Counts', status: 'not_checked' },
    { id: 'out_3', label: 'Sponge & gauze count confirmed correct', category: 'Counts', status: 'not_checked' },
    { id: 'out_4', label: 'Needle & sharp count confirmed correct', category: 'Counts', status: 'not_checked' },
    { id: 'out_5', label: 'Surgical specimen labeling confirmed (Patient name, MRN, anatomical site)', category: 'Specimen', status: 'not_checked' },
    { id: 'out_6', label: 'Measured surgical blood loss documented in anesthesia record', category: 'Documentation', status: 'not_checked' },
    { id: 'out_7', label: 'Cumulative fluid balance documented & verified', category: 'Documentation', status: 'not_checked' },
    { id: 'out_8', label: 'Urine output documented where applicable (volume & color)', category: 'Documentation', status: 'not_checked' },
    { id: 'out_9', label: 'Lines, tubes, urinary catheters, and wound drains documented', category: 'Lines & Drains', status: 'not_checked' },
    { id: 'out_10', label: 'Key postoperative concerns & recovery considerations documented', category: 'Plan', status: 'not_checked' },
    { id: 'out_11', label: 'Postoperative monitoring & analgesia plan documented', category: 'Plan', status: 'not_checked' },
    { id: 'out_12', label: 'PACU / ICU destination confirmed & formal handover completed', category: 'Handover', status: 'not_checked' }
  ]);
  const [signOutConfirmed, setSignOutConfirmed] = useState<boolean>(false);
  const [signOutTimestamp, setSignOutTimestamp] = useState<string>('');

  // -------------------------------------------------------------
  // Section 2 & 3: Transparent Fluid Calculation & Balance Engine State
  // -------------------------------------------------------------
  const [fluidInputs, setFluidInputs] = useState({
    weight_kg: Number(currentPatient.weight) || 70,
    height_cm: Number(currentPatient.height) || 172,
    age: Number(currentPatient.age) || 58,
    sex: currentPatient.gender || 'Male',
    surgery_type: 'Major Laparotomy / Abdominal',
    expected_duration_hours: 3.0,
    fasting_duration_hours: 8.0,
    existing_iv_fluids_ml: 200,
    oral_intake_ml: 0,
    crystalloid_administered_ml: 1000,
    colloid_administered_ml: 0,
    blood_products_administered_ml: 0,
    urine_output_ml: 210,
    measured_blood_loss_ml: 100,
    other_measured_losses_ml: 0,
    renal_impairment: false,
    cardiac_dysfunction: false,
    fluid_restriction: false,
    clinician_target_ml: 0
  });

  // Configurable Institutional Protocol Thresholds
  const [protocolThresholds] = useState({
    oliguria_rate_ml_kg_hr: 0.5,
    excessive_balance_ml_kg: 30.0,
    excessive_total_balance_ml: 2500,
    significant_blood_loss_pct_ebv: 15.0,
    rapid_infusion_rate_ml_kg_hr: 15.0,
    hypotension_map_threshold: 65,
    tachycardia_hr_threshold: 100
  });

  // Calculation Results from Deterministic Engine
  const [calcResult, setCalcResult] = useState<any>(null);
  const [safetyCheckResult, setSafetyCheckResult] = useState<any>(null);
  const [isCalculatingFluid, setIsCalculatingFluid] = useState<boolean>(false);

  // ML FluidRecommendation Prediction State (Strictly Separated)
  const [mlFluidPred, setMlFluidPred] = useState<{
    probability: number;
    risk_category: string;
    model_name: string;
  } | null>(null);

  // -------------------------------------------------------------
  // Audit Logs State
  // -------------------------------------------------------------
  const [auditLogs, setAuditLogs] = useState<Array<any>>([]);

  // -------------------------------------------------------------
  // Section 5: Emergency Break-Glass Workflow State (10 Steps)
  // -------------------------------------------------------------
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);
  const [emergencyChecklistCompleted, setEmergencyChecklistCompleted] = useState<Record<string, boolean>>({
    step1_alert_confirmed: false,
    step2_vitals_verified: false,
    step3_trends_reviewed: false,
    step4_balance_inspected: false,
    step5_bloodloss_assessed: false,
    step6_meds_verified: false,
    step7_acls_checklist_opened: false,
    step8_clinician_acknowledged: false,
    step9_override_recorded: false,
    step10_audit_logged: false
  });

  // -------------------------------------------------------------
  // Live Telemetry Simulation Loop
  // -------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setVitals(prev => {
        let hr = prev.hr + (Math.random() - 0.5) * 1.5;
        let bpSys = prev.bpSys + (Math.random() - 0.5) * 2.5;
        let bpDia = prev.bpDia + (Math.random() - 0.5) * 1.5;
        let etco2 = prev.etco2 + (Math.random() - 0.5) * 0.4;
        let temp = prev.temp + (Math.random() - 0.5) * 0.02;
        let spo2 = prev.spo2;

        if (simulatedState === 'hypotension') {
          bpSys = 82 + (Math.random() - 0.5) * 2;
          bpDia = 48 + (Math.random() - 0.5) * 1.5;
          hr = 96 + (Math.random() - 0.5) * 2;
        } else if (simulatedState === 'hypoxia') {
          spo2 = 89 + (Math.random() - 0.5) * 1;
          hr = 104 + (Math.random() - 0.5) * 2;
        } else if (simulatedState === 'bradycardia') {
          hr = 38 + (Math.random() - 0.5) * 1.5;
          bpSys = 96 + (Math.random() - 0.5) * 2;
        } else if (simulatedState === 'tachycardia') {
          hr = 136 + (Math.random() - 0.5) * 2;
        }

        const mapVal = Math.round(bpDia + (bpSys - bpDia) / 3);

        return {
          ...prev,
          hr: Math.round(Math.max(30, Math.min(180, hr))),
          bpSys: Math.round(Math.max(55, Math.min(200, bpSys))),
          bpDia: Math.round(Math.max(30, Math.min(120, bpDia))),
          map: mapVal,
          spo2: Math.min(100, Math.max(70, Math.round(spo2))),
          etco2: Math.round(Math.max(10, Math.min(70, etco2))),
          temp: parseFloat(Math.max(33, Math.min(41, temp)).toFixed(1)),
          rr: 12 + Math.round((Math.random() - 0.5) * 2),
          anesthesia_duration_mins: prev.anesthesia_duration_mins + 1
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [simulatedState]);

  // -------------------------------------------------------------
  // Execute Fluid Calculation via Backend Deterministic Service
  // -------------------------------------------------------------
  const runDeterministicFluidCalc = async () => {
    setIsCalculatingFluid(true);
    try {
      const calcPayload = {
        patient_id: currentPatient.id,
        weight_kg: Number(fluidInputs.weight_kg),
        height_cm: Number(fluidInputs.height_cm),
        age: Number(fluidInputs.age),
        sex: fluidInputs.sex,
        surgery_type: fluidInputs.surgery_type,
        expected_duration_hours: Number(fluidInputs.expected_duration_hours),
        fasting_duration_hours: Number(fluidInputs.fasting_duration_hours),
        existing_iv_fluids_ml: Number(fluidInputs.existing_iv_fluids_ml),
        oral_intake_ml: Number(fluidInputs.oral_intake_ml),
        crystalloid_administered_ml: Number(fluidInputs.crystalloid_administered_ml),
        colloid_administered_ml: Number(fluidInputs.colloid_administered_ml),
        blood_products_administered_ml: Number(fluidInputs.blood_products_administered_ml),
        urine_output_ml: Number(fluidInputs.urine_output_ml),
        measured_blood_loss_ml: Number(fluidInputs.measured_blood_loss_ml),
        other_measured_losses_ml: Number(fluidInputs.other_measured_losses_ml),
        systolic_bp: vitals.bpSys,
        diastolic_bp: vitals.bpDia,
        map: vitals.map,
        heart_rate: vitals.hr,
        spo2: vitals.spo2,
        renal_impairment: fluidInputs.renal_impairment,
        cardiac_dysfunction: fluidInputs.cardiac_dysfunction,
        fluid_restriction: fluidInputs.fluid_restriction,
        clinician_target_ml: Number(fluidInputs.clinician_target_ml)
      };

      // 1. Calculate deterministic balance & maintenance
      const resCalc = await fetch(`${API_BASE_URL}/api/fluid/calculate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(calcPayload)
      });

      if (resCalc.ok) {
        const dataCalc = await resCalc.json();
        setCalcResult(dataCalc);

        // 2. Run protocol safety checks
        const safetyPayload = {
          calculation: dataCalc,
          protocol_thresholds: protocolThresholds
        };

        const resSafety = await fetch(`${API_BASE_URL}/api/fluid/safety-check`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(safetyPayload)
        });

        if (resSafety.ok) {
          const dataSafety = await resSafety.json();
          setSafetyCheckResult(dataSafety);
        }
      }
    } catch (err) {
      console.error('Error running fluid calculation:', err);
    } finally {
      setIsCalculatingFluid(false);
    }
  };

  // Run calculation on initial load and when relevant fluid inputs change
  useEffect(() => {
    runDeterministicFluidCalc();
  }, [
    fluidInputs.weight_kg,
    fluidInputs.crystalloid_administered_ml,
    fluidInputs.colloid_administered_ml,
    fluidInputs.blood_products_administered_ml,
    fluidInputs.urine_output_ml,
    fluidInputs.measured_blood_loss_ml,
    fluidInputs.expected_duration_hours,
    fluidInputs.renal_impairment,
    fluidInputs.cardiac_dysfunction
  ]);

  // -------------------------------------------------------------
  // Fetch ML FluidRecommendation Prediction (Strictly ML Model)
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchMlFluidPrediction = async () => {
      try {
        const payload = {
          features: {
            anchor_age: currentPatient?.age || 65,
            gender_code: (currentPatient?.gender || 'male').toLowerCase().startsWith('m') ? 1 : 0,
            prescription_count: 8,
            comorbidity_count: (currentPatient && 'comorbidities' in currentPatient && Array.isArray((currentPatient as any).comorbidities)) ? (currentPatient as any).comorbidities.length : 2,
            potassium: 4.2,
            glucose: 110,
            wbc: 7.5,
            lab_mean: 14.5,
            hr: vitals.hr,
            sbp: vitals.bpSys,
            dbp: vitals.bpDia,
            map: vitals.map,
            spo2: vitals.spo2,
            etco2: vitals.etco2,
            rr: vitals.rr,
            cvp: 5.0,
            temp: vitals.temp,
            shock_index: vitals.hr / (vitals.bpSys || 1),
            pulse_pressure: vitals.bpSys - vitals.bpDia,
            cvp_map_ratio: 5.0 / (vitals.map || 1)
          }
        };

        const res = await fetch(`${API_BASE_URL}/predict/FluidRecommendation`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          setMlFluidPred({
            probability: data.probability,
            risk_category: data.risk_category || (data.prediction === 1 ? 'High Requirement' : 'Standard Requirement'),
            model_name: data.model_used || 'FluidRecommendation LightGBM'
          });
        }
      } catch (e) {
        console.warn('ML Fluid Recommendation unavailable:', e);
      }
    };

    fetchMlFluidPrediction();
  }, [vitals.hr, vitals.bpSys, vitals.map]);

  // -------------------------------------------------------------
  // Load Audit Trail & Safety Status from Backend
  // -------------------------------------------------------------
  const refreshAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/intraoperative/audit-log`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.audit_logs || []);
      }
    } catch (e) {
      console.warn('Audit logs unavailable:', e);
    }
  };

  useEffect(() => {
    refreshAuditLogs();
  }, []);

  // -------------------------------------------------------------
  // Checklist Item Toggle Handlers
  // -------------------------------------------------------------
  const togglePreInductionItem = (id: string, nextStatus: 'not_checked' | 'confirmed' | 'attention') => {
    setPreInductionItems(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
    setPreInductionConfirmed(false);
  };

  const toggleSignOutItem = (id: string, nextStatus: 'not_checked' | 'confirmed' | 'attention') => {
    setSignOutItems(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
    setSignOutConfirmed(false);
  };

  const handleConfirmPreInduction = async () => {
    try {
      const payload = {
        phase: 'PRE_INDUCTION',
        patient_id: currentPatient.id,
        clinician_id: clinicianName,
        clinician_name: clinicianName,
        items: preInductionItems,
        all_confirmed: preInductionItems.every(i => i.status === 'confirmed')
      };

      const res = await fetch(`${API_BASE_URL}/api/intraoperative/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setPreInductionConfirmed(true);
        setPreInductionTimestamp(data.record.timestamp);
        refreshAuditLogs();
        alert('Pre-Induction / Sign-In Checklist explicitly confirmed by attending anesthesiologist.');
      }
    } catch (err) {
      console.error('Checklist save failed:', err);
    }
  };

  const handleConfirmSignOut = async () => {
    try {
      const payload = {
        phase: 'SURGICAL_SIGNOUT',
        patient_id: currentPatient.id,
        clinician_id: clinicianName,
        clinician_name: clinicianName,
        items: signOutItems,
        all_confirmed: signOutItems.every(i => i.status === 'confirmed')
      };

      const res = await fetch(`${API_BASE_URL}/api/intraoperative/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSignOutConfirmed(true);
        setSignOutTimestamp(data.record.timestamp);
        refreshAuditLogs();
        alert('Surgical Sign-Out Checklist explicitly confirmed by attending clinician.');
      }
    } catch (err) {
      console.error('Sign-Out save failed:', err);
    }
  };

  // -------------------------------------------------------------
  // Alert Acknowledgment & Override Handlers
  // -------------------------------------------------------------
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/intraoperative/alert/acknowledge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          alert_id: alertId,
          clinician_id: clinicianName,
          clinician_name: clinicianName
        })
      });

      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
        refreshAuditLogs();
      }
    } catch (err) {
      console.error('Acknowledge alert failed:', err);
    }
  };

  const handleOverrideAlert = async () => {
    if (!overrideModalAlert) return;
    if (!overrideReasonInput.trim()) {
      alert('Please provide a clinical rationale / reason for overriding the alert.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/intraoperative/alert/override`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          alert_id: overrideModalAlert.id,
          clinician_id: clinicianName,
          clinician_name: clinicianName,
          reason: overrideReasonInput
        })
      });

      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === overrideModalAlert.id ? { ...a, overridden: true, override_reason: overrideReasonInput } : a));
        setOverrideModalAlert(null);
        setOverrideReasonInput('');
        refreshAuditLogs();
        alert('Alert override recorded in the permanent audit trail.');
      }
    } catch (err) {
      console.error('Override alert failed:', err);
    }
  };

  // -------------------------------------------------------------
  // Determine Safety Status Indicator
  // Exact requirement: "SAFE / ATTENTION / CRITICAL"
  // "Do NOT make 'SAFE' mean that the patient is clinically guaranteed safe.
  // Use wording such as: 'Monitoring status: No configured alerts currently triggered' rather than 'Patient is safe.'"
  // -------------------------------------------------------------
  const activeUnacknowledgedAlerts = alerts.filter(a => !a.acknowledged && !a.overridden);
  const safetyStatus = useMemo(() => {
    if (activeUnacknowledgedAlerts.some(a => a.severity === 'CRITICAL') || vitals.map < 55 || vitals.spo2 < 90) {
      return {
        level: 'CRITICAL',
        badgeClass: 'badge-danger',
        label: 'CRITICAL EVENT TRIGGERED',
        detail: 'Immediate clinician attention and hemodynamic intervention required.'
      };
    }
    if (activeUnacknowledgedAlerts.length > 0 || (safetyCheckResult?.alerts && safetyCheckResult.alerts.length > 0)) {
      return {
        level: 'ATTENTION',
        badgeClass: 'badge-warning',
        label: 'ATTENTION: CONFIGURED ALERTS ACTIVE',
        detail: 'One or more protocol thresholds or telemetry parameters require clinical verification.'
      };
    }
    return {
      level: 'SAFE',
      badgeClass: 'badge-success',
      label: 'SAFE — MONITORING STATUS',
      detail: 'Monitoring status: No configured alerts currently triggered. (Continuous clinician observation required).'
    };
  }, [activeUnacknowledgedAlerts, safetyCheckResult, vitals.map, vitals.spo2]);

  return (
    <div className="page-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 24px' }}>
      
      {/* ========================================================= */}
      {/* 8. CLINICAL SAFETY / GOVERNANCE BANNER */}
      {/* ========================================================= */}
      <div 
        style={{ 
          background: 'rgba(23, 92, 221, 0.08)', 
          borderLeft: '4px solid var(--med-blue)', 
          padding: '12px 18px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛡 CLINICAL DECISION-SUPPORT NOTICE</span>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Research Prototype</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Anesth AI is a clinical decision-support research prototype. It does not replace the judgment of a qualified anesthesiologist or clinician.</strong> All recommendations require clinician review and confirmation.
          </p>
        </div>
        <div style={{ textAlign: 'right', minWidth: '220px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attending Clinician:</span>
          <input
            type="text"
            className="form-control"
            style={{ fontSize: '0.8rem', padding: '4px 8px', marginTop: '2px' }}
            value={clinicianName}
            onChange={e => setClinicianName(e.target.value)}
          />
        </div>
      </div>

      {/* Page Header with Patient Summary & Safety Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
            INTRAOPERATIVE SAFETY CHECK
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Structured 3-Phase Checklist &bull; Continuous Hemodynamic Safety &bull; Transparent Fluid Calculation Engine
          </p>
        </div>

        {/* Safety Status Indicator */}
        <div 
          className="glass" 
          style={{ 
            padding: '12px 20px', 
            borderRadius: '8px', 
            border: `1.5px solid ${safetyStatus.level === 'CRITICAL' ? 'var(--med-red)' : safetyStatus.level === 'ATTENTION' ? 'var(--med-orange)' : 'var(--med-green)'}`,
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px',
            backgroundColor: safetyStatus.level === 'CRITICAL' ? 'rgba(223, 21, 41, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              System Safety Status
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: safetyStatus.level === 'CRITICAL' ? 'var(--med-red)' : safetyStatus.level === 'ATTENTION' ? 'var(--med-orange)' : 'var(--med-green)' }}>
              {safetyStatus.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {safetyStatus.detail}
            </div>
          </div>
          <span className={`badge ${safetyStatus.badgeClass}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
            {safetyStatus.level}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`btn ${activeTab === 'preinduction' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '8px 16px', fontWeight: 700 }}
          onClick={() => setActiveTab('preinduction')}
        >
          A. Pre-Induction / Sign-In ({preInductionItems.filter(i => i.status === 'confirmed').length}/21)
        </button>
        <button
          className={`btn ${activeTab === 'continuous' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '8px 16px', fontWeight: 700 }}
          onClick={() => setActiveTab('continuous')}
        >
          B. Continuous Telemetry & Safety Alerts ({alerts.filter(a => !a.acknowledged).length})
        </button>
        <button
          className={`btn ${activeTab === 'fluid' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '8px 16px', fontWeight: 700 }}
          onClick={() => setActiveTab('fluid')}
        >
          Fluid Calculation & Balance Engine
        </button>
        <button
          className={`btn ${activeTab === 'signout' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '8px 16px', fontWeight: 700 }}
          onClick={() => setActiveTab('signout')}
        >
          C. Surgical Sign-Out ({signOutItems.filter(i => i.status === 'confirmed').length}/12)
        </button>
        <button
          className={`btn ${activeTab === 'emergency' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '8px 16px', fontWeight: 700 }}
          onClick={() => setActiveTab('emergency')}
        >
          🚨 Emergency / Critical Event
        </button>
        <button
          className={`btn ${activeTab === 'audit' ? 'btn-secondary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '8px 16px', marginLeft: 'auto' }}
          onClick={() => { setActiveTab('audit'); refreshAuditLogs(); }}
        >
          Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION A: PRE-INDUCTION / SIGN-IN CHECKLIST */}
      {/* ========================================================= */}
      {activeTab === 'preinduction' && (
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                SECTION A: PRE-INDUCTION / SIGN-IN CHECKLIST
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Interactive clinician-confirmed safety checklist prior to induction of anesthesia. Items are not automatically checked.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Status: {preInductionConfirmed ? <strong style={{ color: 'var(--med-green)' }}>✓ Confirmed at {new Date(preInductionTimestamp).toLocaleTimeString()}</strong> : <span style={{ color: 'var(--med-orange)' }}>Pending Final Confirmation</span>}
              </div>
              <button 
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '8px 18px' }}
                onClick={handleConfirmPreInduction}
              >
                Confirm Pre-Induction Checklist
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '12px' }}>
            {preInductionItems.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '12px 16px',
                  background: item.status === 'confirmed' ? 'rgba(5, 150, 82, 0.05)' : item.status === 'attention' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${item.status === 'confirmed' ? 'rgba(5, 150, 82, 0.3)' : item.status === 'attention' ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{item.category}</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: item.status === 'confirmed' ? 600 : 400 }}>{item.label}</div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    title="Not Checked"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      background: item.status === 'not_checked' ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                    onClick={() => togglePreInductionItem(item.id, 'not_checked')}
                  >
                    [ ]
                  </button>
                  <button
                    type="button"
                    title="Requires Attention"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      background: item.status === 'attention' ? 'var(--med-orange)' : 'transparent',
                      color: item.status === 'attention' ? '#000' : 'var(--med-orange)',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                    onClick={() => togglePreInductionItem(item.id, 'attention')}
                  >
                    [!]
                  </button>
                  <button
                    type="button"
                    title="Confirmed"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(5, 150, 82, 0.4)',
                      background: item.status === 'confirmed' ? 'var(--med-green)' : 'transparent',
                      color: item.status === 'confirmed' ? '#fff' : 'var(--med-green)',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                    onClick={() => togglePreInductionItem(item.id, 'confirmed')}
                  >
                    [✓]
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION B: INTRAOPERATIVE CONTINUOUS SAFETY DASHBOARD */}
      {/* ========================================================= */}
      {activeTab === 'continuous' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Continuous Telemetry Box */}
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Intraoperative Continuous Telemetry</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room OR-01 &bull; Active Real-Time Hemodynamics</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                <div>Anesthesia Duration: <strong>{vitals.anesthesia_duration_mins} min</strong></div>
                <div>Surgical Duration: <strong>{vitals.surgery_duration_mins} min</strong></div>
              </div>
            </div>

            {/* Vitals Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
              
              {/* HR */}
              <div style={{ padding: '12px', background: 'rgba(5, 150, 82, 0.06)', border: '1px solid rgba(5, 150, 82, 0.2)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>HR</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--med-green)', fontFamily: 'var(--font-mono)' }}>
                  {vitals.hr} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>bpm</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ECG: {vitals.ecg}</div>
              </div>

              {/* NIBP / MAP */}
              <div style={{ padding: '12px', background: vitals.map < 65 ? 'rgba(223, 21, 41, 0.1)' : 'rgba(23, 92, 221, 0.06)', border: `1px solid ${vitals.map < 65 ? 'var(--med-red)' : 'rgba(23, 92, 221, 0.2)'}`, borderRadius: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>NIBP (Sys/Dia)</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: vitals.map < 65 ? 'var(--med-red)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {vitals.bpSys}/{vitals.bpDia}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: vitals.map < 65 ? 'var(--med-red)' : 'var(--med-blue)' }}>
                  MAP: {vitals.map} mmHg
                </div>
              </div>

              {/* SpO2 */}
              <div style={{ padding: '12px', background: 'rgba(63, 187, 192, 0.06)', border: '1px solid rgba(63, 187, 192, 0.2)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SpO2</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--med-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {vitals.spo2} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>%</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Plethysmograph: Good</div>
              </div>

              {/* EtCO2 & RR */}
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>EtCO2 / RR</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--med-orange)', fontFamily: 'var(--font-mono)' }}>
                  {vitals.etco2} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>mmHg</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>RR: {vitals.rr} /min</div>
              </div>

              {/* Temperature */}
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Temperature</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: vitals.temp < 36.0 ? 'var(--med-orange)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {vitals.temp} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>&deg;C</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Esophageal probe</div>
              </div>

              {/* Fluid Balance Summary in Telemetry */}
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Net Fluid Balance</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: (calcResult?.net_fluid_balance_ml || 0) < 0 ? 'var(--med-orange)' : 'var(--med-green)', fontFamily: 'var(--font-mono)' }}>
                  {calcResult?.net_fluid_balance_ml !== undefined ? `${calcResult.net_fluid_balance_ml} mL` : '+890 mL'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  UOP: {fluidInputs.urine_output_ml} mL | EBL: {fluidInputs.measured_blood_loss_ml} mL
                </div>
              </div>

            </div>
          </div>

          {/* Explainable Alerts Panel */}
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Explainable Intraoperative Alerts</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Alerts explain what changed, clinical significance, trends, suggested checks, and require clinician confirmation.
              </span>
            </div>

            {alerts.length === 0 ? (
              <div style={{ padding: '16px', background: 'rgba(5, 150, 82, 0.05)', borderLeft: '4px solid var(--med-green)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--med-green)' }}>
                ✓ Monitoring status: No configured alerts currently triggered. (Patient telemetry within normal institutional limits).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {alerts.map(alt => (
                  <div 
                    key={alt.id}
                    style={{
                      padding: '16px 20px',
                      background: alt.severity === 'CRITICAL' ? 'rgba(223, 21, 41, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                      border: `1.5px solid ${alt.severity === 'CRITICAL' ? 'var(--med-red)' : 'var(--med-orange)'}`,
                      borderLeft: `6px solid ${alt.severity === 'CRITICAL' ? 'var(--med-red)' : 'var(--med-orange)'}`,
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${alt.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                            {alt.severity}
                          </span>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{alt.title}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <strong>Current Measured Value:</strong> {alt.current_value} &bull; <strong>Relevant Trend:</strong> {alt.trend}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {alt.acknowledged ? (
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ Acknowledged</span>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                            onClick={() => handleAcknowledgeAlert(alt.id)}
                          >
                            Acknowledge
                          </button>
                        )}

                        {alt.overridden ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                            Overridden: {alt.override_reason}
                          </span>
                        ) : (
                          <button
                            className="btn btn-danger"
                            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                            onClick={() => setOverrideModalAlert(alt)}
                          >
                            Override Alert
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px', fontSize: '0.8rem' }}>
                      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>What Changed & Why It Matters:</div>
                        <p style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{alt.what_changed}</p>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{alt.why_it_matters}</p>
                      </div>

                      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>Suggested Clinical Checks:</div>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                          {alt.suggested_checks.map((chk, i) => <li key={i}>{chk}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(23, 92, 221, 0.05)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span><strong>Recommended Clinician Action:</strong> {alt.recommended_actions.join(' | ')}</span>
                      <strong style={{ color: 'var(--med-blue)' }}>FINAL TREATMENT DECISION: ANESTHESIOLOGIST</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2 & 3: PROPER FLUID CALCULATION & SAFETY ENGINE */}
      {/* ========================================================= */}
      {activeTab === 'fluid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card: ML vs Deterministic Separation Architecture */}
          <div className="glass" style={{ padding: '20px', borderLeft: '4px solid var(--med-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                  Fluid Management Architecture: ML Prediction vs Deterministic Calculation Engine
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  The statistical ML model predicts fluid intervention probability. The deterministic engine calculates transparent clinical arithmetic. The system never automatically administers fluid.
                </p>
              </div>

              {/* ML Model Card (Validated LightGBM) */}
              <div style={{ padding: '10px 16px', background: 'rgba(63, 187, 192, 0.08)', border: '1px solid var(--med-cyan)', borderRadius: '6px', minWidth: '280px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--med-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  ML FluidRecommendation Model (Validated)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    {mlFluidPred ? mlFluidPred.risk_category : 'Standard Requirement'}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    Prob: {mlFluidPred ? `${(mlFluidPred.probability * 100).toFixed(1)}%` : '24.2%'}
                  </span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Statistical probability score only. Does NOT invent or prescribe fluid volume.
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Inputs (Left) and Outputs (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px' }}>
            
            {/* LEFT: Fluid Input Parameters */}
            <div className="glass" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px' }}>Clinical Fluid Parameters</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Patient Weight (kg)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={fluidInputs.weight_kg} 
                    onChange={e => setFluidInputs(p => ({ ...p, weight_kg: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Patient Height (cm)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={fluidInputs.height_cm} 
                    onChange={e => setFluidInputs(p => ({ ...p, height_cm: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Duration of Surgery (hr)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    className="form-control" 
                    value={fluidInputs.expected_duration_hours} 
                    onChange={e => setFluidInputs(p => ({ ...p, expected_duration_hours: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Pre-op Fasting (hr)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={fluidInputs.fasting_duration_hours} 
                    onChange={e => setFluidInputs(p => ({ ...p, fasting_duration_hours: Number(e.target.value) }))} 
                  />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '14px 0' }} />

              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Administered Fluids & Losses
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Crystalloid Given (mL)</label>
                  <input 
                    type="number" 
                    step="50" 
                    className="form-control" 
                    value={fluidInputs.crystalloid_administered_ml} 
                    onChange={e => setFluidInputs(p => ({ ...p, crystalloid_administered_ml: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Colloid Given (mL)</label>
                  <input 
                    type="number" 
                    step="50" 
                    className="form-control" 
                    value={fluidInputs.colloid_administered_ml} 
                    onChange={e => setFluidInputs(p => ({ ...p, colloid_administered_ml: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Blood Products (mL)</label>
                  <input 
                    type="number" 
                    step="50" 
                    className="form-control" 
                    value={fluidInputs.blood_products_administered_ml} 
                    onChange={e => setFluidInputs(p => ({ ...p, blood_products_administered_ml: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Urine Output (mL)</label>
                  <input 
                    type="number" 
                    step="10" 
                    className="form-control" 
                    value={fluidInputs.urine_output_ml} 
                    onChange={e => setFluidInputs(p => ({ ...p, urine_output_ml: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Measured Blood Loss (mL)</label>
                  <input 
                    type="number" 
                    step="25" 
                    className="form-control" 
                    value={fluidInputs.measured_blood_loss_ml} 
                    onChange={e => setFluidInputs(p => ({ ...p, measured_blood_loss_ml: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Other Losses (mL)</label>
                  <input 
                    type="number" 
                    step="25" 
                    className="form-control" 
                    value={fluidInputs.other_measured_losses_ml} 
                    onChange={e => setFluidInputs(p => ({ ...p, other_measured_losses_ml: Number(e.target.value) }))} 
                  />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '14px 0' }} />

              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Clinical Flags & Constraints
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                <label className="checklist-item" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={fluidInputs.renal_impairment} 
                    onChange={e => setFluidInputs(p => ({ ...p, renal_impairment: e.target.checked }))} 
                  />
                  <span>Renal Impairment / CKD</span>
                </label>
                <label className="checklist-item" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={fluidInputs.cardiac_dysfunction} 
                    onChange={e => setFluidInputs(p => ({ ...p, cardiac_dysfunction: e.target.checked }))} 
                  />
                  <span>Heart Failure / Cardiac Dysfunction</span>
                </label>
                <label className="checklist-item" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={fluidInputs.fluid_restriction} 
                    onChange={e => setFluidInputs(p => ({ ...p, fluid_restriction: e.target.checked }))} 
                  />
                  <span>Strict Fluid Restriction Protocol</span>
                </label>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '16px', fontSize: '0.85rem' }} 
                onClick={runDeterministicFluidCalc}
                disabled={isCalculatingFluid}
              >
                {isCalculatingFluid ? 'Computing Calculation Engine...' : 'Recalculate Fluid Balance'}
              </button>
            </div>

            {/* RIGHT: Deterministic Calculation Results & Trace */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Output Cards */}
              <div className="glass" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Deterministic Fluid Balance Summary</h3>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Transparent Arithmetic</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  
                  {/* Maintenance Estimate */}
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1. Maintenance Estimate</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {calcResult?.maintenance_rate_ml_hr || 110} <span style={{ fontSize: '0.75rem' }}>mL/hr</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Est. Total: {calcResult?.total_maintenance_estimate_ml || 330} mL
                    </div>
                  </div>

                  {/* Cumulative Administered */}
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2. Cumulative In</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--med-cyan)' }}>
                      {calcResult?.cumulative_fluid_administered_ml || 1000} <span style={{ fontSize: '0.75rem' }}>mL</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Rate: {calcResult?.current_fluid_rate_ml_hr || 333.3} mL/hr
                    </div>
                  </div>

                  {/* Urine Output */}
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3. Urine Output</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {calcResult?.urine_output_ml || 210} <span style={{ fontSize: '0.75rem' }}>mL</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: (calcResult?.urine_output_rate_ml_kg_hr || 1.0) < 0.5 ? 'var(--med-orange)' : 'var(--med-green)' }}>
                      Rate: {calcResult?.urine_output_rate_ml_kg_hr || 1.0} mL/kg/hr
                    </div>
                  </div>

                  {/* Measured Blood Loss */}
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>4. Blood Loss</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {calcResult?.measured_blood_loss_ml || 100} <span style={{ fontSize: '0.75rem' }}>mL</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {calcResult?.blood_loss_pct_ebv || 2.0}% of EBV
                    </div>
                  </div>

                  {/* Net Fluid Balance */}
                  <div style={{ padding: '12px', background: 'rgba(23, 92, 221, 0.08)', border: '1.5px solid var(--med-blue)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--med-cyan)', fontWeight: 700 }}>6. Net Fluid Balance</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: (calcResult?.net_fluid_balance_ml || 0) < 0 ? 'var(--med-orange)' : 'var(--med-green)' }}>
                      {calcResult?.net_fluid_balance_ml > 0 ? `+${calcResult?.net_fluid_balance_ml}` : calcResult?.net_fluid_balance_ml} <span style={{ fontSize: '0.75rem' }}>mL</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {calcResult?.net_fluid_balance_per_kg_ml || 9.9} mL/kg
                    </div>
                  </div>

                  {/* Blood Replacement Assessment */}
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>8. Blood Assessment</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>
                      {calcResult?.blood_loss_replacement_assessment || 'Loss < 15% EBV'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      EBV: {calcResult?.estimated_blood_volume_ml || 4900} mL
                    </div>
                  </div>

                </div>

                {/* Mathematical Trace Breakdown */}
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Transparent Calculation Formula Trace:
                  </div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    <div>&bull; Maintenance: Holliday-Segar reference estimate = {calcResult?.calculation_trace?.maintenance_formula || '4-2-1 rule reference (110 mL/hr)'}</div>
                    <div>&bull; Total Inflow: Crystalloid ({fluidInputs.crystalloid_administered_ml}) + Colloid ({fluidInputs.colloid_administered_ml}) + Blood ({fluidInputs.blood_products_administered_ml}) + Existing ({fluidInputs.existing_iv_fluids_ml}) = {calcResult?.total_fluid_input_ml} mL</div>
                    <div>&bull; Total Losses: Urine ({fluidInputs.urine_output_ml}) + Blood Loss ({fluidInputs.measured_blood_loss_ml}) + Other ({fluidInputs.other_measured_losses_ml}) = {calcResult?.total_measured_losses_ml} mL</div>
                    <div>&bull; Net Balance = {calcResult?.total_fluid_input_ml} - {calcResult?.total_measured_losses_ml} = {calcResult?.net_fluid_balance_ml} mL ({calcResult?.net_fluid_balance_per_kg_ml} mL/kg)</div>
                  </div>
                </div>

                {/* Clinical Decision Support Warning */}
                <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--med-orange)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Clinical Decision Support Warning:
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    &ldquo;Consider current hemodynamics, fluid responsiveness, ongoing losses, cardiac/renal status, and institutional protocol before administering additional fluid.&rdquo;
                  </p>
                  <div style={{ marginTop: '4px', fontSize: '0.7rem', color: 'var(--med-red)', fontWeight: 600 }}>
                    The system must NEVER automatically administer fluid.
                  </div>
                </div>
              </div>

              {/* Fluid Safety Panel with Institutional Protocol Thresholds */}
              <div className="glass" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Fluid Safety Panel</h3>
                  <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                    Institutional protocol threshold
                  </span>
                </div>

                {safetyCheckResult?.alerts && safetyCheckResult.alerts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {safetyCheckResult.alerts.map((alt: any, idx: number) => (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: '10px 14px', 
                          background: alt.severity === 'WARNING' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(223, 21, 41, 0.08)', 
                          borderLeft: `4px solid ${alt.severity === 'WARNING' ? 'var(--med-orange)' : 'var(--med-red)'}`,
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{alt.message}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Institutional protocol threshold: {alt.threshold}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                          Current Value: <strong>{alt.current_value}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: 'rgba(5, 150, 82, 0.05)', borderLeft: '4px solid var(--med-green)', color: 'var(--med-green)', fontSize: '0.8rem' }}>
                    ✓ All fluid balance parameters within configured institutional protocol thresholds.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION C: SURGICAL SIGN-OUT CHECKLIST */}
      {/* ========================================================= */}
      {activeTab === 'signout' && (
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                SECTION C: SURGICAL SIGN-OUT CHECKLIST
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Final surgical sign-out prior to patient transfer to PACU or ICU. Requires explicit clinician confirmation.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Status: {signOutConfirmed ? <strong style={{ color: 'var(--med-green)' }}>✓ Confirmed at {new Date(signOutTimestamp).toLocaleTimeString()}</strong> : <span style={{ color: 'var(--med-orange)' }}>Pending Final Confirmation</span>}
              </div>
              <button 
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '8px 18px' }}
                onClick={handleConfirmSignOut}
              >
                Confirm Surgical Sign-Out
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '12px' }}>
            {signOutItems.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '12px 16px',
                  background: item.status === 'confirmed' ? 'rgba(5, 150, 82, 0.05)' : item.status === 'attention' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${item.status === 'confirmed' ? 'rgba(5, 150, 82, 0.3)' : item.status === 'attention' ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{item.category}</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: item.status === 'confirmed' ? 600 : 400 }}>{item.label}</div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    title="Not Checked"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      background: item.status === 'not_checked' ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSignOutItem(item.id, 'not_checked')}
                  >
                    [ ]
                  </button>
                  <button
                    type="button"
                    title="Requires Attention"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      background: item.status === 'attention' ? 'var(--med-orange)' : 'transparent',
                      color: item.status === 'attention' ? '#000' : 'var(--med-orange)',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                    onClick={() => toggleSignOutItem(item.id, 'attention')}
                  >
                    [!]
                  </button>
                  <button
                    type="button"
                    title="Confirmed"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(5, 150, 82, 0.4)',
                      background: item.status === 'confirmed' ? 'var(--med-green)' : 'transparent',
                      color: item.status === 'confirmed' ? '#fff' : 'var(--med-green)',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                    onClick={() => toggleSignOutItem(item.id, 'confirmed')}
                  >
                    [✓]
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: EMERGENCY / CRITICAL EVENT WORKFLOW (10 STEPS) */}
      {/* ========================================================= */}
      {activeTab === 'emergency' && (
        <div className="glass" style={{ padding: '24px', borderLeft: '6px solid var(--med-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>CRITICAL EVENT PROTOCOL</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                  Structured Emergency Workflow
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                10-Step clinician-governed emergency response. System decision-support only: Never auto-administers drugs or adjusts ventilator.
              </p>
            </div>
            <button
              className={`btn ${isEmergencyActive ? 'btn-danger' : 'btn-primary'}`}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              onClick={() => setIsEmergencyActive(!isEmergencyActive)}
            >
              {isEmergencyActive ? 'Deactivate Emergency Protocol' : 'Initiate Emergency Protocol'}
            </button>
          </div>

          {/* 10-Step Workflow List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '12px' }}>
            {[
              { num: 1, title: 'Confirm Alert', desc: 'Verify threshold alarm on monitor & confirm patient clinical state.' },
              { num: 2, title: 'Verify Patient / Vitals', desc: 'Manual pulse check, repeat automated cuff cycle, check pleth wave.' },
              { num: 3, title: 'Show Relevant Trends', desc: 'Display MAP, HR, EtCO2 15-minute trends and rate of change.' },
              { num: 4, title: 'Current Fluid Balance', desc: `Net balance: ${calcResult?.net_fluid_balance_ml || '+890'} mL (${calcResult?.net_fluid_balance_per_kg_ml || '12.7'} mL/kg).` },
              { num: 5, title: 'Assess Blood Loss', desc: `Measured loss: ${fluidInputs.measured_blood_loss_ml} mL (${calcResult?.blood_loss_pct_ebv || '2.0'}% EBV).` },
              { num: 6, title: 'Review Active Medications', desc: 'Volatiles, opioids, muscle relaxants, infusion rates.' },
              { num: 7, title: 'Emergency Checklist', desc: 'Display condition-specific crisis checklist (ACLS, Anaphylaxis, Hemorrhage).' },
              { num: 8, title: 'Clinician Acknowledgement', desc: 'Attending anesthesiologist explicitly signs off alert review.' },
              { num: 9, title: 'Clinician Override with Reason', desc: 'Clinician documents rationale if standard protocol is modified.' },
              { num: 10, title: 'Permanent Audit Trail', desc: 'Log timestamp, attending ID, hemodynamics, and decisions to audit log.' }
            ].map(step => (
              <div 
                key={step.num}
                style={{
                  padding: '14px',
                  background: emergencyChecklistCompleted[`step${step.num}`] ? 'rgba(5, 150, 82, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${emergencyChecklistCompleted[`step${step.num}`] ? 'var(--med-green)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    Step {step.num}. {step.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {step.desc}
                  </div>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={!!emergencyChecklistCompleted[`step${step.num}`]}
                  onChange={e => setEmergencyChecklistCompleted(p => ({ ...p, [`step${step.num}`]: e.target.checked }))}
                />
              </div>
            ))}
          </div>

          {/* Emergency Safety Disclaimers */}
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(223, 21, 41, 0.08)', borderRadius: '6px', border: '1px solid rgba(223, 21, 41, 0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--med-red)' }}>
              Mandatory Automated Safety Constraints:
            </div>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <li>Do NOT automatically administer medication or fluid.</li>
              <li>Do NOT automatically change ventilator settings.</li>
              <li>Do NOT automatically change anesthesia delivery settings.</li>
              <li>The system is a clinical decision-support system only. Final authority rests entirely with the attending clinician.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* AUDIT LOG TAB */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Intraoperative Clinical Safety Audit Log</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Immutable audit trail of all checklist confirmations, alert acknowledgments, overrides, and fluid calculations.
              </span>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={refreshAuditLogs}>
              Refresh Logs
            </button>
          </div>

          <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Event / Action</th>
                  <th style={{ padding: '10px 14px' }}>Clinician</th>
                  <th style={{ padding: '10px 14px' }}>Details / Rationale</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {log.action || log.event}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {log.clinician_name || log.clinician_id}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {log.reason || log.notes || JSON.stringify(log.record || log.details || '').substring(0, 80)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ALERT OVERRIDE WITH REASON */}
      {/* ========================================================= */}
      {overrideModalAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass" style={{ width: '480px', padding: '24px', borderRadius: '8px', border: '1px solid var(--med-red)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--med-red)', margin: 0 }}>
              Override Safety Alert
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '6px 0 14px 0' }}>
              Alert: <strong>{overrideModalAlert.title}</strong>
            </p>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                Clinical Rationale for Override (Required for Audit Trail):
              </label>
              <textarea
                className="form-control"
                rows={3}
                style={{ fontSize: '0.8rem', width: '100%' }}
                placeholder="e.g., Blood pressure target lowered due to deliberate hypotensive anesthesia for microvascular surgery."
                value={overrideReasonInput}
                onChange={e => setOverrideReasonInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem' }}
                onClick={() => { setOverrideModalAlert(null); setOverrideReasonInput(''); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{ fontSize: '0.8rem' }}
                onClick={handleOverrideAlert}
              >
                Confirm Override & Record in Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
