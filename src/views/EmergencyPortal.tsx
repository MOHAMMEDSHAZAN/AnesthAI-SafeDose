import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

interface EmergencyPortalProps {
  onClose: () => void;
  setView?: (v: string) => void;
}

interface CrisisAlgorithm {
  id: string;
  title: string;
  steps: string[];
  drugs: Array<{ name: string; doseFormula: string; notes: string; baseFactor: number }>;
}

const crisisAlgorithms: CrisisAlgorithm[] = [
  {
    id: 'cardiac_arrest',
    title: 'ACLS Cardiac Arrest Algorithm',
    steps: [
      'Call for immediate assistance / Crash Cart to Operating Room',
      'Begin high-quality CPR (100-120/min; 30:2 ratio or continuous if intubated)',
      'Attach defibrillator/monitor — analyze rhythm (VF / Pulseless VT vs Asystole / PEA)',
      'Deliver shock if shockable rhythm; immediately resume CPR for 2 minutes',
      'Administer Epinephrine 1 mg IV/IO every 3–5 minutes',
      'Administer Amiodarone 300 mg IV/IO bolus for refractory VF/VT (second dose 150 mg)',
      'Verify advanced airway with continuous quantitative waveform capnography'
    ],
    drugs: [
      { name: 'Epinephrine IV Bolus', doseFormula: '10 mcg/kg IV (or 1mg ACLS standard)', notes: 'Standard ACLS adult dose 1 mg IV every 3-5 min.', baseFactor: 0.014 },
      { name: 'Amiodarone IV Bolus', doseFormula: '300 mg IV / IO bolus', notes: 'First line for shock-refractory VF/pulseless VT.', baseFactor: 0 },
      { name: 'Atropine IV', doseFormula: '1.0 mg IV bolus', notes: 'Indicated for severe symptomatic bradycardia. Max 3 mg.', baseFactor: 0.015 }
    ]
  },
  {
    id: 'anaphylaxis',
    title: 'Severe Perioperative Anaphylaxis Protocol',
    steps: [
      'Immediately stop administration of all suspect agents, infusions, and triggers',
      'Maintain airway with 100% high-flow Oxygen; prepare for rapid airway edema',
      'Administer Epinephrine IM (anterolateral thigh) or titrated IV boluses',
      'Rapid IV crystalloid resuscitation (20–30 mL/kg rapid bolus under pressure)',
      'Administer H1 Antihistamine (Diphenhydramine 50 mg IV)',
      'Administer Corticosteroid (Hydrocortisone 100–200 mg IV or Methylprednisolone)',
      'Monitor for biphasic reaction and refractory vasodilation'
    ],
    drugs: [
      { name: 'Epinephrine IV Titration', doseFormula: '10 - 50 mcg IV bolus', notes: 'Titrate to mean arterial pressure. Keep infusion ready.', baseFactor: 0.5 },
      { name: 'Diphenhydramine IV', doseFormula: '1 mg/kg IV (max 50 mg)', notes: 'Administer slowly over 2-3 minutes.', baseFactor: 0.7 },
      { name: 'Hydrocortisone IV', doseFormula: '2 mg/kg IV (max 200 mg)', notes: 'Prevents biphasic inflammatory relapse.', baseFactor: 2.0 }
    ]
  },
  {
    id: 'malignant_hyperthermia',
    title: 'Malignant Hyperthermia (MH) Crisis Protocol',
    steps: [
      'Immediately DISCONTINUE volatile anesthetics (Sevoflurane/Desflurane) & Succinylcholine',
      'Hyperventilate with 100% Oxygen at maximal fresh gas flows (>10 L/min)',
      'Call for MH Cart / Reconstitute Dantrolene sodium immediately',
      'Administer Dantrolene 2.5 mg/kg IV rapid bolus; repeat until signs subside (max 10 mg/kg)',
      'Aggressive cooling: cold saline IV, surface ice packs; stop cooling at 38.5°C',
      'Treat metabolic acidosis (Sodium Bicarbonate 1-2 mEq/kg) and hyperkalemia',
      'Insert Foley catheter; maintain target urine output >2 mL/kg/hr'
    ],
    drugs: [
      { name: 'Dantrolene Sodium Bolus', doseFormula: '2.5 mg/kg IV rapid', notes: 'Reconstitute each 20mg vial with 60mL sterile water.', baseFactor: 2.5 },
      { name: 'Sodium Bicarbonate', doseFormula: '1 - 2 mEq/kg IV', notes: 'For severe lactic/metabolic acidosis guided by ABG.', baseFactor: 1.0 },
      { name: 'Insulin + Dextrose (50%)', doseFormula: '10 units Insulin in 50mL D50W', notes: 'Treat acute hyperkalemic cardiac instability.', baseFactor: 0.14 }
    ]
  }
];

export const EmergencyPortal: React.FC<EmergencyPortalProps> = ({ onClose, setView }) => {
  const { patients, notifications, currentUser, logSafetyAudit, theme, toggleTheme } = useApp();
  const patient = patients.find(p => p.emergencyCase) || patients[0];

  const [activeAlgoId, setActiveAlgoId] = useState<string>('cardiac_arrest');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [supportChecklist, setSupportChecklist] = useState<Record<string, boolean>>({});
  const checklistSectionRef = useRef<HTMLDivElement>(null);

  // Timers
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [cprTime, setCprTime] = useState<number>(120);

  // Break-Glass Modal & State
  const [showBreakGlassModal, setShowBreakGlassModal] = useState<boolean>(false);
  const [breakGlassReason, setBreakGlassReason] = useState<string>('');
  const [breakGlassActivated, setBreakGlassActivated] = useState<boolean>(
    currentUser?.authMethod === 'trauma_break_glass'
  );

  const currentAlgo = crisisAlgorithms.find(a => a.id === activeAlgoId) || crisisAlgorithms[0];

  // Active clinical alerts from notifications
  const criticalNotifications = notifications.filter(
    n => !n.dismissed && (n.type === 'critical' || n.type === 'warning')
  );

  useEffect(() => {
    const codeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(codeInterval);
  }, []);

  useEffect(() => {
    const cprInterval = setInterval(() => {
      setCprTime(prev => {
        if (prev <= 1) {
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cprInterval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggleStep = (stepText: string) => {
    setCheckedSteps(prev => {
      const nextVal = !prev[stepText];
      if (logSafetyAudit) {
        logSafetyAudit('Emergency Protocol Step Toggled', `${currentAlgo.title}: ${stepText}`, `Checked: ${nextVal}`);
      }
      return { ...prev, [stepText]: nextVal };
    });
  };

  const handleToggleSupportItem = (key: string, label: string) => {
    setSupportChecklist(prev => {
      const nextVal = !prev[key];
      if (logSafetyAudit) {
        logSafetyAudit('Emergency Support Checklist Toggled', label, `Status: ${nextVal ? 'Verified' : 'Unchecked'}`);
      }
      return { ...prev, [key]: nextVal };
    });
  };

  const handleResetCpr = () => {
    setCprTime(120);
    if (logSafetyAudit) {
      logSafetyAudit('CPR 2-Min Cycle Reset', 'Emergency Portal Countdown', 'Clinician reset timer');
    }
  };

  const handleActivateBreakGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassReason.trim()) return;

    setBreakGlassActivated(true);
    setShowBreakGlassModal(false);

    if (logSafetyAudit) {
      logSafetyAudit(
        'Break-Glass Emergency Access Activated',
        `User: ${currentUser?.name || 'Dr. Arjun Malhotra'} (${currentUser?.badgeId || 'AN-9402'})`,
        `Rationale: ${breakGlassReason.trim()} • Target Patient: ${patient?.name || 'Aarav Mehta'} (${patient?.id || 'SD-2026-0001'}) • Clearance: Temporary Level-4 Clinical Elevation`
      );
    }
  };

  const getCrisisDose = (drug: CrisisAlgorithm['drugs'][0]) => {
    if (!patient || drug.baseFactor === 0) return drug.doseFormula;
    const computed = (patient.weight * drug.baseFactor).toFixed(0);
    const unit = drug.name.toLowerCase().includes('epinephrine') ? 'mcg' : 'mg';
    return `${computed} ${unit}`;
  };

  const handleScrollToChecklist = () => {
    if (checklistSectionRef.current) {
      checklistSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const emergencySupportItems = [
    { id: 'id_verify', text: 'Confirm patient identity & surgical procedure' },
    { id: 'vitals_alert', text: 'Verify vital signs / automated crisis alert telemetry' },
    { id: 'airway', text: 'Assess airway patency & confirm endotracheal tube depth' },
    { id: 'breathing', text: 'Assess ventilation, chest excursion & oxygen delivery' },
    { id: 'circulation', text: 'Assess circulation, pulse, rhythm & capillary refill' },
    { id: 'trends', text: 'Review ECG, SpO₂, arterial BP & capnography trends' },
    { id: 'blood_loss', text: 'Review surgical blood loss and suction canisters' },
    { id: 'fluid_bal', text: 'Review fluid balance, IV lines & infusion patency' },
    { id: 'recent_meds', text: 'Review recently administered medications & anesthetics' },
    { id: 'escalate', text: 'Escalate according to institutional resuscitation protocol' },
    { id: 'document', text: 'Document event, interventions & response in clinical log' }
  ];

  return (
    <div className="emergency-hud" role="dialog" aria-modal="true" aria-label="Emergency Support Portal">
      {/* ============================================================ */}
      {/* 1. EMERGENCY HEADER */}
      {/* ============================================================ */}
      <header className="emergency-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-heading)',
                margin: 0,
                color: '#ffffff',
                textTransform: 'uppercase'
              }}>
                EMERGENCY SUPPORT
              </h1>
              <span style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: '#ffffff'
              }}>
                CRITICAL CLINICAL ASSIST
              </span>
            </div>
            <p style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.95)',
              margin: '3px 0 0 0',
              fontWeight: 500
            }}>
              For life-threatening emergencies, contact emergency medical services immediately.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Active Patient Chip */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff'
          }}>
            <span style={{ fontSize: '0.65rem', color: '#fed7aa', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 800, display: 'block' }}>
              LOADED PATIENT ({patient?.name || 'Aarav Mehta'})
            </span>
            <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>
              {patient?.weight || 70} kg • Case {patient?.id || 'SD-2026-0001'}
            </div>
          </div>

          {/* Theme Toggle Button within HUD */}
          <button
            className="emergency-close-btn"
            onClick={toggleTheme}
            title="Toggle Light and Dark Mode"
            aria-label="Toggle Theme"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {/* Close HUD */}
          <button
            className="emergency-close-btn"
            onClick={onClose}
            aria-label="Close Emergency Support Mode"
            style={{ fontWeight: 800, fontSize: '0.875rem' }}
          >
            Close Emergency Mode &times;
          </button>
        </div>
      </header>

      {/* Main Clinical Emergency Workspace */}
      <div className="emergency-workspace" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        
        {/* ============================================================ */}
        {/* 2. IMMEDIATE ACTION INSTRUCTIONS & FAST ACTION LINKS */}
        {/* ============================================================ */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                IMMEDIATE ACTIONS & NAVIGATION
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Direct access to India emergency dispatch lines, crisis algorithms, and perioperative telemetry.
              </p>
            </div>
            <span style={{
              fontSize: '0.6875rem',
              color: 'var(--med-red)',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontWeight: 800,
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}>
              Direct Dial Ready
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="tel:112"
              className="btn btn-danger"
              aria-label="Call India National Emergency Number 112"
              style={{ padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>📞 Call 112</span>
            </a>
            <a
              href="tel:108"
              className="btn btn-secondary"
              aria-label="Call Ambulance / Emergency Medical Services 108"
              style={{
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--med-cyan)',
                borderColor: 'var(--border-color)'
              }}
            >
              <span>🚑 Call 108</span>
            </a>
            <button
              className="btn btn-secondary"
              onClick={handleScrollToChecklist}
              style={{ padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 700 }}
            >
              📋 Emergency Checklist
            </button>
            {setView && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => { onClose(); setView('safety-overview'); }}
                  style={{ padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 700 }}
                >
                  🛡 Review Safety Overview
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { onClose(); setView('liveot'); }}
                  style={{ padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 700 }}
                >
                  📊 View Live OT Monitor
                </button>
              </>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. INDIA EMERGENCY CONTACT SECTION (112 Primary, 108 Secondary) */}
        {/* ============================================================ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.1rem' }}>🚨</span>
            <h2 style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              INDIA EMERGENCY CONTACTS
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {/* PRIMARY CARD: 112 (India National Emergency Number) */}
            <div style={{
              background: 'var(--surface)',
              border: '2px solid #ef4444',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--med-red)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  PRIMARY
                </span>
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  letterSpacing: '0.05em'
                }}>
                  NATIONAL TOLL-FREE
                </span>
              </div>

              <div>
                <div style={{
                  fontSize: '3.25rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                  margin: '6px 0 4px 0',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px'
                }}>
                  <span>112</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--med-red)', fontWeight: 700 }}>24/7 Universal</span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  India National Emergency Number
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                  Unified all-in-one emergency response service active across all States and Union Territories of India (Medical, Police, Fire, and Disaster services).
                </p>
              </div>

              <div>
                <a
                  href="tel:112"
                  className="btn btn-danger"
                  aria-label="Call India National Emergency Number 112"
                  title="Call India National Emergency Number 112"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>📞</span>
                  <span>Call 112</span>
                </a>
              </div>
            </div>

            {/* SECONDARY CARD: 108 (Ambulance / Emergency Medical Services) */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--med-cyan)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  SECONDARY
                </span>
                <span style={{
                  background: 'rgba(2, 132, 199, 0.12)',
                  color: 'var(--med-cyan)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(2, 132, 199, 0.25)'
                }}>
                  where available
                </span>
              </div>

              <div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                  margin: '6px 0 4px 0',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px'
                }}>
                  <span>108</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--med-cyan)', fontWeight: 700 }}>Ambulance / EMS</span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Ambulance / Emergency Medical Services
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                  Government-supported emergency medical transport and ambulance response operated under the National Health Mission (NHM) across participating states.
                </p>
              </div>

              <div>
                <a
                  href="tel:108"
                  className="btn btn-secondary"
                  aria-label="Call Ambulance / Emergency Medical Services 108"
                  title="Call Ambulance / Emergency Medical Services 108"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    fontSize: '0.9375rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: 'var(--med-cyan)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>🚑</span>
                  <span>Call 108</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. EMERGENCY CLINICAL WORKFLOW (9-Step Sequence) */}
        {/* ============================================================ */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Emergency Clinical Workflow
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Standardized perioperative crisis decision-support workflow sequence
              </p>
            </div>
            <span style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              background: 'var(--surface-hover)',
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)'
            }}>
              Decision Support Only
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px'
          }}>
            {[
              { num: '1', title: 'Recognize the emergency', desc: 'Identify acute physiological collapse, airway obstruction, critical arrhythmia, severe hypoxia, or sudden hemodynamic instability.' },
              { num: '2', title: 'Verify the measurement/clinical finding', desc: 'Confirm telemetry sensor integrity, non-invasive / arterial line calibration, pulse oximeter signal, and capnography waveform.' },
              { num: '3', title: 'Assess patient status', desc: 'Perform immediate primary clinical survey: consciousness, spontaneous breathing, pulse presence, and surgical field status.' },
              { num: '4', title: 'Review vital trends', desc: 'Inspect heart rate, arterial pressure, SpO₂, EtCO₂, and temperature trajectories over the preceding 5–30 minutes.' },
              { num: '5', title: 'Review blood loss and fluid balance', desc: 'Quantify cumulative surgical suction volume, lap sponge weights, crystalloid/colloid infusions, and current fluid deficit.' },
              { num: '6', title: 'Review recent medications/interventions', desc: 'Audit bolus timing for neuromuscular blockers, induction agents, opioids, vasoactive drugs, and volatile anesthetic MAC.' },
              { num: '7', title: 'Follow institutional emergency protocol', desc: 'Initiate institutional Code Blue / ACLS / Malignant Hyperthermia guidelines and declare surgical pause.' },
              { num: '8', title: 'Escalate to appropriate clinical team', desc: 'Mobilize consultant anesthesiologist lead, senior surgical attendings, resuscitation nursing staff, and ICU team.' },
              { num: '9', title: 'Document the event', desc: 'Record all emergency steps, medication administrations, defibrillation energy, and physiological response in the immutable audit log.' }
            ].map(step => (
              <div
                key={step.num}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(23, 92, 221, 0.12)',
                  color: 'var(--med-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  flexShrink: 0
                }}>
                  {step.num}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <strong>Important Safety Notice:</strong> This clinical workflow is an advisory decision-support reminder. Anesth AI does not independently diagnose or treat patients, nor does it contact emergency dispatch services automatically.
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. BREAK-GLASS EMERGENCY ACCESS SECTION */}
        {/* ============================================================ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {/* Active Clinical Telemetry Alerts Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>🔔</span>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Active Clinical Telemetry Alerts
                </h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Continuous Monitoring
              </span>
            </div>

            {criticalNotifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--med-orange)', fontWeight: 600 }}>
                  Review active physiological alarms before initiating crisis pharmacotherapy.
                </p>
                {criticalNotifications.slice(0, 3).map(notif => (
                  <div
                    key={notif.id}
                    style={{
                      background: notif.type === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      borderLeft: `4px solid ${notif.type === 'critical' ? 'var(--med-red)' : 'var(--med-orange)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span>{notif.title}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{notif.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
                      {notif.message}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: 'rgba(5, 150, 82, 0.06)',
                border: '1px solid rgba(5, 150, 82, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--med-green)', fontWeight: 700, display: 'block' }}>
                  Monitoring status: No configured alerts currently triggered.
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Multi-parameter biosignals and hemodynamics streaming within nominal safety thresholds.
                </span>
              </div>
            )}
          </div>

          {/* Break-Glass / Elevated Access Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🛡</span>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Break-Glass Emergency Access
                  </h3>
                </div>
                <span style={{
                  background: breakGlassActivated ? 'rgba(239, 68, 68, 0.15)' : 'rgba(5, 150, 82, 0.12)',
                  color: breakGlassActivated ? 'var(--med-red)' : 'var(--med-green)',
                  border: `1px solid ${breakGlassActivated ? 'rgba(239, 68, 68, 0.3)' : 'rgba(5, 150, 82, 0.25)'}`,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.6875rem',
                  fontWeight: 800
                }}>
                  {breakGlassActivated ? 'ELEVATED BREAK-GLASS ACTIVE' : 'AUTHENTICATED'}
                </span>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  "Emergency access is intended for exceptional situations requiring temporary elevated clinical access."
                </p>
                <div><strong>Current Clinician:</strong> {currentUser?.name || 'Dr. Arjun Malhotra, MD'}</div>
                <div style={{ marginTop: '4px' }}><strong>Clearance:</strong> {currentUser?.clearanceLevel || 'Level 4 - Anesthesiology Lead'}</div>
                <div style={{ marginTop: '4px' }}><strong>Badge / Token:</strong> {currentUser?.badgeId || 'ID #AN-9402'}</div>
              </div>

              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                marginTop: '12px',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ color: 'var(--med-red)', fontWeight: 700 }}>
                  Break-Glass access is audited. Break-Glass does not grant administrator privileges.
                </div>
                <div style={{ marginTop: '2px', color: 'var(--text-muted)' }}>
                  All elevated clinical interventions, telemetry overrides, and dosage calculations are cryptographically appended to the audit ledger.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {!breakGlassActivated ? (
                <button
                  className="btn btn-danger"
                  onClick={() => setShowBreakGlassModal(true)}
                  style={{ width: '100%', fontSize: '0.8125rem', padding: '10px 16px' }}
                >
                  ⚡ Activate Break-Glass Elevation
                </button>
              ) : (
                <div style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--med-red)',
                  fontWeight: 700
                }}>
                  ✓ Break-Glass Session Verified & Logged
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Break-Glass Activation Modal Dialog */}
        {showBreakGlassModal && (
          <div
            className="modal-overlay"
            style={{ zIndex: 1200 }}
            onClick={() => setShowBreakGlassModal(false)}
          >
            <div
              className="glass"
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '520px',
                padding: '24px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--med-red)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem' }}>🚨</span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Break-Glass Emergency Elevation
                  </h3>
                </div>
                <button
                  onClick={() => setShowBreakGlassModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '16px' }}>
                Emergency access is intended for exceptional situations requiring temporary elevated clinical access. Break-Glass access is strictly audited and permanently logged. <strong>Break-Glass does not grant administrator privileges.</strong>
              </p>

              <form onSubmit={handleActivateBreakGlass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Clinician Identity Verification</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`${currentUser?.name || 'Dr. Arjun Malhotra'} — ${currentUser?.badgeId || 'AN-9402'} (Attending Anesthesiologist)`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loaded Emergency Case</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`${patient?.name || 'Aarav Mehta'} (${patient?.id || 'SD-2026-0001'}) • ${patient?.weight || 70} kg`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mandatory Clinical Emergency Rationale <span style={{ color: 'var(--med-red)' }}>*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Document clinical indication (e.g., Acute refractory hemodynamic collapse in OR-02; rapid drug titration & override needed)..."
                    value={breakGlassReason}
                    onChange={e => setBreakGlassReason(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBreakGlassModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={!breakGlassReason.trim()}
                    style={{ flex: 1.2, fontWeight: 800 }}
                  >
                    Confirm & Elevate Access
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 6. EMERGENCY CHECKLIST & CRISIS ALGORITHM TIMERS */}
        {/* ============================================================ */}
        <div ref={checklistSectionRef} className="emergency-grid" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Algorithm Menu Sidebar */}
          <div className="emergency-menu-sidebar">
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--text-secondary)',
              letterSpacing: '0.05em',
              marginBottom: '10px',
              display: 'block',
              textTransform: 'uppercase'
            }}>
              CRISIS PROTOCOLS
            </span>
            {crisisAlgorithms.map(algo => (
              <button
                key={algo.id}
                className={`emergency-menu-item ${activeAlgoId === algo.id ? 'active' : ''}`}
                onClick={() => { setActiveAlgoId(algo.id); setCheckedSteps({}); }}
                style={{ width: '100%', textAlign: 'left', fontSize: '0.8125rem' }}
              >
                {algo.title}
              </button>
            ))}

            {/* General Perioperative Emergency Support Checklist */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
                marginBottom: '8px',
                display: 'block',
                textTransform: 'uppercase'
              }}>
                SUPPORT CHECKLIST
              </span>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.35 }}>
                Perioperative resuscitation support reminders.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {emergencySupportItems.map(item => (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: supportChecklist[item.id] ? 'var(--med-green)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)',
                      background: supportChecklist[item.id] ? 'rgba(5, 150, 82, 0.08)' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!supportChecklist[item.id]}
                      onChange={() => handleToggleSupportItem(item.id, item.text)}
                    />
                    <span style={{ textDecoration: supportChecklist[item.id] ? 'line-through' : 'none' }}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Active Algorithm Steps & Weight-Adjusted Crisis Drug Dosing */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {currentAlgo.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Decision-support protocol steps
                </span>
              </div>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                fontWeight: 700,
                background: 'var(--surface-hover)',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                {Object.values(checkedSteps).filter(Boolean).length} / {currentAlgo.steps.length} Steps Completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentAlgo.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`checklist-item ${checkedSteps[step] ? 'checked' : ''}`}
                  onClick={() => handleToggleStep(step)}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedSteps[step]}
                    onChange={() => {}}
                    style={{ pointerEvents: 'none' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* Weight-Adjusted Crisis Dosing Table */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--med-red)', margin: 0 }}>
                  Weight-Adjusted Crisis Drug Dosing ({patient?.weight || 70} kg)
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Advisory Reference Only
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {currentAlgo.drugs.map((drug, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--surface)',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block' }}>
                      {drug.name}
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                      {getCrisisDose(drug)}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.3, display: 'block' }}>
                      {drug.notes}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timers Sidebar */}
          <div className="emergency-timers-sidebar">
            {/* CPR 2-min Countdown */}
            <div
              className="timer-box"
              style={{
                borderColor: cprTime < 15 ? 'var(--med-red)' : 'var(--border-color)',
                boxShadow: cprTime < 15 ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                CPR CYCLE COUNTDOWN
              </span>
              <div
                className="timer-digits"
                style={{
                  animation: cprTime < 15 ? 'heart-pulse 0.5s infinite' : 'none',
                  color: cprTime < 15 ? 'var(--med-red)' : 'var(--text-primary)'
                }}
              >
                {formatTimer(cprTime)}
              </div>
              <button
                className="btn btn-danger"
                style={{ width: '100%', fontSize: '0.8125rem', marginTop: '6px', fontWeight: 800 }}
                onClick={handleResetCpr}
              >
                RESET CPR CYCLE (2 MIN)
              </button>
            </div>

            {/* Elapsed Code Time */}
            <div className="timer-box">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                TOTAL ELAPSED CODE TIME
              </span>
              <div className="timer-digits" style={{ color: 'var(--text-primary)' }}>
                {formatTimer(elapsedTime)}
              </div>
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              padding: '12px',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              <strong>ACLS Reminder:</strong> Minimize interruptions in chest compressions (&lt;10s). Continuous waveform capnography is recommended; sudden increase in EtCO₂ (&gt;40 mmHg) is an indicator of Return of Spontaneous Circulation (ROSC).
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. MEDICAL SAFETY BOUNDARY & EMERGENCY DISCLAIMER */}
        {/* ============================================================ */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <strong style={{ color: 'var(--med-red)' }}>Clinical Decision-Support & Emergency Disclaimer:</strong> Anesth AI is a research prototype and clinical decision-support system. It does not replace professional clinical judgment and does not autonomously prescribe, administer, or modify medications, fluids, ventilation, or anesthesia. For immediate life-threatening emergencies, contact emergency medical services immediately. All therapeutic interventions remain under the sole direct responsibility of the licensed attending anesthesiologist and resuscitation team.
        </div>
      </div>
    </div>
  );
};
