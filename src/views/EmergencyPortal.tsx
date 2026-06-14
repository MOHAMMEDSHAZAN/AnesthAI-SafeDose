import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface EmergencyPortalProps {
  onClose: () => void;
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
      'Call for assistance / Bring emergency crash cart',
      'Begin CPR (30:2 ratio or continuous compressions if intubated)',
      'Attach monitor/defibrillator - Analyze rhythm',
      'Shock if Shockable (VF/Pulseless VT); otherwise resume CPR immediately',
      'Epinephrine 1mg IV/IO every 3-5 minutes',
      'Amiodarone 300mg IV/IO bolus (for refractory VF/VT), second dose 150mg',
      'Secure advanced airway (ET tube / LMA) with capnography monitoring'
    ],
    drugs: [
      { name: 'Epinephrine Bolus', doseFormula: '10 mcg/kg IV', notes: 'ACLS dose is 1mg standard. Pediatric: 0.01 mg/kg IV.', baseFactor: 0.01 },
      { name: 'Amiodarone Bolus', doseFormula: '300 mg IV', notes: 'Refractory VF/VT. Secondary dose 150 mg IV.', baseFactor: 0 },
      { name: 'Atropine IV', doseFormula: '1.0 mg IV', notes: 'For bradycardic arrest. Max total dose 3mg.', baseFactor: 0.015 }
    ]
  },
  {
    id: 'anaphylaxis',
    title: 'Severe Anaphylaxis Protocol',
    steps: [
      'Stop administration of all triggers/anesthetics immediately',
      'Secure airway & Administer 100% Oxygen (high flow)',
      'Administer Epinephrine IM or IV titrated',
      'Aggressive fluid resuscitation (20-30 mL/kg saline)',
      'Administer antihistamines (H1 blocker - Diphenhydramine 50mg IV)',
      'Administer hydrocortisone 100-200mg IV or Methylprednisolone',
      'Prepare for prolonged bronchospasm / severe vasodilation'
    ],
    drugs: [
      { name: 'Epinephrine IV titration', doseFormula: '10 - 50 mcg IV boluses', notes: 'Titrate to effect. Keep infusion ready.', baseFactor: 0.5 },
      { name: 'Diphenhydramine IV', doseFormula: '1 mg/kg IV', notes: 'Max 50 mg.', baseFactor: 0.6 },
      { name: 'Methylprednisolone', doseFormula: '2 mg/kg IV', notes: 'Max 125 mg IV.', baseFactor: 1.5 }
    ]
  },
  {
    id: 'malignant_hyperthermia',
    title: 'Malignant Hyperthermia (MH) Crisis Protocol',
    steps: [
      'Immediately DISCONTINUE Sevoflurane/Desflurane & Succinylcholine',
      'Hyperventilate with 100% Oxygen at high flows (>10 L/min)',
      'Call for MH Cart / Reconstitute Dantrolene immediately',
      'Administer Dantrolene 2.5 mg/kg IV bolus rapidly; repeat as needed (max 10mg/kg)',
      'Cool patient aggressively (cold saline IV, surface ice bags)',
      'Treat acidosis (Sodium Bicarbonate 1-2 mEq/kg) and hyperkalemia (Insulin/Dextrose)',
      'Place Foley catheter and monitor urine output (>2 mL/kg/hr target)'
    ],
    drugs: [
      { name: 'Dantrolene Bolus', doseFormula: '2.5 mg/kg IV', notes: 'Reconstitute each 20mg vial in 60mL sterile water. Repeat if vitals stay elevated.', baseFactor: 2.5 },
      { name: 'Sodium Bicarbonate', doseFormula: '1 - 2 mEq/kg IV', notes: 'For severe metabolic acidosis.', baseFactor: 1.0 },
      { name: 'Insulin (Regular)', doseFormula: '0.1 units/kg IV', notes: 'Give with 50% Dextrose (50mL) to treat hyperkalemia.', baseFactor: 0.1 }
    ]
  }
];

export const EmergencyPortal: React.FC<EmergencyPortalProps> = ({ onClose }) => {
  const { patients } = useApp();
  const patient = patients[0]; // Robert Miller (84kg)

  const [activeAlgoId, setActiveAlgoId] = useState<string>('cardiac_arrest');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  
  // Timers
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds
  const [cprTime, setCprTime] = useState<number>(120); // 2 min cycle count down

  const currentAlgo = crisisAlgorithms.find(a => a.id === activeAlgoId) || crisisAlgorithms[0];

  // Run elapsed code timer
  useEffect(() => {
    const codeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(codeInterval);
  }, []);

  // Run 2-minute CPR countdown timer
  useEffect(() => {
    const cprInterval = setInterval(() => {
      setCprTime(prev => {
        if (prev <= 1) {
          // Play simulated alarm sound cue or alert visual triggers
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          return 120; // restart cycle
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
    setCheckedSteps(prev => ({ ...prev, [stepText]: !prev[stepText] }));
  };

  const handleResetCpr = () => {
    setCprTime(120);
  };

  // Dose calculation helper for crisis drugs
  const getCrisisDose = (drug: CrisisAlgorithm['drugs'][0]) => {
    if (!patient || drug.baseFactor === 0) return drug.doseFormula;
    const computed = (patient.weight * drug.baseFactor).toFixed(0);
    const unit = drug.name.toLowerCase().includes('epinephrine') ? 'mcg' : 'mg';
    return `${computed} ${unit}`;
  };

  return (
    <div className="emergency-hud">
      <div className="emergency-header">
        <div className="emergency-title">
          <span style={{ animation: 'heart-pulse 0.6s infinite', fontSize: '1.75rem' }}>⚠</span>
          <span>CRITICAL PATIENT CODE PORTAL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#1e0808', padding: '6px 16px', borderRadius: '4px', border: '1px solid #ef4444' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>LOADED WEIGHT (ROBERT MILLER)</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>84 kg</div>
          </div>
          <button className="emergency-close-btn" onClick={onClose}>
            Exit Emergency Mode
          </button>
        </div>
      </div>

      <div className="emergency-grid">
        {/* Left Side: Algorithm Selectors */}
        <div className="emergency-menu-sidebar">
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: '10px', display: 'block' }}>CHOOSE CODE GUIDELINE</span>
          {crisisAlgorithms.map(algo => (
            <button
              key={algo.id}
              className={`emergency-menu-item ${activeAlgoId === algo.id ? 'active' : ''}`}
              onClick={() => { setActiveAlgoId(algo.id); setCheckedSteps({}); }}
              style={{ width: '100%', textAlign: 'left', color: 'white' }}
            >
              {algo.title}
            </button>
          ))}
        </div>

        {/* Middle: Step-by-Step checklist and flowchart */}
        <div className="emergency-workspace">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid rgba(239,68,68,0.2)', paddingBottom: '10px' }}>
            {currentAlgo.title} Checklist
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                  onChange={() => {}} // handled by click
                  style={{ pointerEvents: 'none' }}
                />
                <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{step}</span>
              </div>
            ))}
          </div>

          {/* Emergency Drug calculator details */}
          <div style={{ background: '#190a0a', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', marginBottom: '12px' }}>Weight-Adjusted Crisis Drug Dosing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {currentAlgo.drugs.map((drug, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{drug.name}</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                    {getCrisisDose(drug)}
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{drug.notes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: CPR timer and Code Counters */}
        <div className="emergency-timers-sidebar">
          {/* CPR Compression Cycle Timer */}
          <div className="timer-box" style={{ borderColor: cprTime < 15 ? '#ef4444' : 'rgba(239,68,68,0.2)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CPR CYCLE COUNTDOWN</span>
            <div className="timer-digits" style={{ animation: cprTime < 15 ? 'heart-pulse 0.5s infinite' : 'none' }}>
              {formatTimer(cprTime)}
            </div>
            <button className="btn btn-danger" style={{ width: '100%', fontSize: '0.8125rem', marginTop: '6px' }} onClick={handleResetCpr}>
              RESET CPR CYCLE (2 MIN)
            </button>
          </div>

          {/* Total Code Duration Timer */}
          <div className="timer-box" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL ELAPSED CODE TIME</span>
            <div className="timer-digits" style={{ color: 'white' }}>
              {formatTimer(elapsedTime)}
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <strong>ACLS Guidelines:</strong> Focus on high-quality chest compressions (100-120/min), minimize interruptions, and prepare defibrillator discharge early.
          </div>
        </div>
      </div>
    </div>
  );
};
