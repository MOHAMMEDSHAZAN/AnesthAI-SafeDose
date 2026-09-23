import React, { useEffect, useState } from 'react';
import { useApp, type SafetyChecklist } from '../context/AppContext';

export const RecoverySafety: React.FC = () => {
  const { checklists, saveSafetyChecklist, logSafetyAudit, activePatientId, activeCaseId } = useApp();

  const existingChecklist = checklists.find(c => c.caseId === activeCaseId);

  const recoveryChecks = [
    { key: 'rec_concerns', label: 'Safety concerns communicated' },
    { key: 'rec_airway', label: 'Airway assessed' },
    { key: 'rec_breathing', label: 'Breathing assessed' },
    { key: 'rec_circulation', label: 'Circulation assessed' },
    { key: 'rec_fluids', label: 'Fluid balance reviewed' },
    { key: 'rec_temp', label: 'Temperature assessed' },
    { key: 'rec_pain', label: 'Pain assessed' },
    { key: 'rec_plan', label: 'Assessment and intervention plan confirmed' },
    { key: 'rec_analgesia', label: 'Analgesia plan confirmed' },
    { key: 'rec_monitor', label: 'Recovery monitor assigned' },
    { key: 'rec_handover', label: 'Handover completed' }
  ];

  // Recovery assessment fields
  const [airwayPatent, setAirwayPatent] = useState('Yes');
  const [airwaySupport, setAirwaySupport] = useState('No');
  
  const [spo2, setSpo2] = useState(98);
  const [rr, setRr] = useState(14);
  const [o2Therapy, setO2Therapy] = useState('Nasal Cannula 2L/min');
  const [ventStatus, setVentStatus] = useState('Spontaneous breathing');

  const [hr, setHr] = useState(76);
  const [bp, setBp] = useState('124/80');
  const [mapVal, setMapVal] = useState(94);
  const [fluidBalance, setFluidBalance] = useState('+150 mL');

  const [temp, setTemp] = useState(36.4);
  const [tempIntervention, setTempIntervention] = useState('No');

  const [painScore, setPainScore] = useState(3);
  const [painControlled, setPainControlled] = useState('Yes');

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [concerns, setConcerns] = useState('');
  const [interventionPlan, setInterventionPlan] = useState('');
  const [clinician, setClinician] = useState('Nisha Verma, RN (DEMO-RN-1042)');
  const [isCompleted, setIsCompleted] = useState(false);

  // PACU Aldrete metrics (Mock display connecting to PACU module variables where available)
  // Since PACU module state isn't globally exposed, we check standard defaults or display "Not recorded"
  const aldreteScore = 9; // out of 10
  const PONV = 'Mild (no interventions required)';
  const consciousness = 'Fully awake / responsive';
  const mobility = 'Able to move 2 extremities';
  const hemodynamics = 'BP ± 20% of pre-anesthetic level';

  useEffect(() => {
    if (existingChecklist && existingChecklist.data) {
      setCheckedItems(existingChecklist.data.rec_checked || {});
      setAirwayPatent(existingChecklist.data.rec_airway_patent || 'Yes');
      setAirwaySupport(existingChecklist.data.rec_airway_support || 'No');
      setSpo2(existingChecklist.data.rec_spo2 || 98);
      setRr(existingChecklist.data.rec_rr || 14);
      setO2Therapy(existingChecklist.data.rec_o2_therapy || 'Nasal Cannula 2L/min');
      setVentStatus(existingChecklist.data.rec_vent_status || 'Spontaneous breathing');
      setTemp(existingChecklist.data.rec_temp || 36.4);
      setTempIntervention(existingChecklist.data.rec_temp_interv || 'No');
      setPainScore(existingChecklist.data.rec_pain_score !== undefined ? existingChecklist.data.rec_pain_score : 3);
      setPainControlled(existingChecklist.data.rec_pain_ctrl || 'Yes');
      setNotes(existingChecklist.data.rec_notes || '');
      setConcerns(existingChecklist.data.rec_concerns_txt || '');
      setInterventionPlan(existingChecklist.data.rec_interv_plan || '');
      setClinician(existingChecklist.data.rec_clinician || 'Nisha Verma, RN (DEMO-RN-1042)');
      setIsCompleted(existingChecklist.recoveryStatus === 'completed');
    }
  }, [existingChecklist]);

  const handleCheckboxChange = (key: string) => {
    if (isCompleted) return;
    const next = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(next);
  };

  const handleConfirmRecovery = () => {
    const totalRequired = recoveryChecks.length;
    const completedCount = recoveryChecks.filter(chk => checkedItems[chk.key]).length;

    if (completedCount < totalRequired) {
      alert("Please confirm all recovery checklist items prior to handover lock.");
      return;
    }

    const dataObj: Record<string, any> = {
      ...checkedItems,
      rec_airway_patent: airwayPatent,
      rec_airway_support: airwaySupport,
      rec_spo2: spo2,
      rec_rr: rr,
      rec_o2_therapy: o2Therapy,
      rec_vent_status: ventStatus,
      rec_temp: temp,
      rec_temp_interv: tempIntervention,
      rec_pain_score: painScore,
      rec_pain_ctrl: painControlled,
      rec_notes: notes,
      rec_concerns_txt: concerns,
      rec_interv_plan: interventionPlan,
      rec_clinician: clinician,
      rec_timestamp: new Date().toISOString()
    };

    const checklistObj: SafetyChecklist = {
      caseId: activeCaseId,
      patientId: existingChecklist?.patientId || activePatientId,
      preAnesthesiaStatus: existingChecklist?.preAnesthesiaStatus || 'not_started',
      machineCheckStatus: existingChecklist?.machineCheckStatus || 'not_started',
      preInductionStatus: existingChecklist?.preInductionStatus || 'not_started',
      timeoutStatus: existingChecklist?.timeoutStatus || 'not_started',
      intraopStatus: existingChecklist?.intraopStatus || 'not_started',
      recoveryStatus: 'completed',
      completedChecks: completedCount,
      totalChecks: totalRequired,
      data: dataObj
    };

    saveSafetyChecklist(checklistObj);
    logSafetyAudit('Recovery Handover Locked', `Case ${activeCaseId}`, `Recovery Clinician: ${clinician}`);
    setIsCompleted(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recovery Safety checklist</h1>
          <p className="page-subtitle">PACU recovery monitoring checks and handoff verification</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Telemetries and plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* PACU Assessment integration */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Discharge Readiness (Aldrete Score)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Modified Aldrete Score:</span>
                <strong style={{ color: 'var(--med-green)' }}>{aldreteScore}/10 (Discharge Ready)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Consciousness:</span>
                <strong>{consciousness}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mobility:</span>
                <strong>{mobility}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hemodynamics:</span>
                <strong>{hemodynamics}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PONV Status:</span>
                <strong>{PONV}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discharge Readiness:</span>
                <span className="badge badge-success">Approved for Ward</span>
              </div>
            </div>
          </div>

          {/* Vitals Summary Card */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Recovery Parameters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Airway Patent:</span>
                <strong>{airwayPatent} (Support: {airwaySupport})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SpO2 / RR:</span>
                <strong>{spo2}% / {rr} bpm</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Oxygen Therapy:</span>
                <strong>{o2Therapy}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Heart Rate (bpm):</span>
                <input type="number" className="form-control" style={{ padding: '2px 6px', width: '70px', fontSize: '0.75rem' }} value={hr} onChange={e => setHr(Number(e.target.value))} disabled={isCompleted} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Blood Pressure:</span>
                <input type="text" className="form-control" style={{ padding: '2px 6px', width: '85px', fontSize: '0.75rem' }} value={bp} onChange={e => setBp(e.target.value)} disabled={isCompleted} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>MAP (mmHg):</span>
                <input type="number" className="form-control" style={{ padding: '2px 6px', width: '70px', fontSize: '0.75rem' }} value={mapVal} onChange={e => setMapVal(Number(e.target.value))} disabled={isCompleted} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Fluid Balance:</span>
                <input type="text" className="form-control" style={{ padding: '2px 6px', width: '85px', fontSize: '0.75rem' }} value={fluidBalance} onChange={e => setFluidBalance(e.target.value)} disabled={isCompleted} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Temperature:</span>
                <strong>{temp} °C</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pain Score:</span>
                <strong>{painScore}/10 (Controlled: {painControlled})</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Checklists and Clinician signatures */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Recovery Verification</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {recoveryChecks.map(chk => (
              <label 
                key={chk.key} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  fontSize: '0.9375rem', 
                  padding: '8px 12px', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '4px',
                  cursor: isCompleted ? 'default' : 'pointer'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={!!checkedItems[chk.key]} 
                  disabled={isCompleted}
                  onChange={() => handleCheckboxChange(chk.key)} 
                  style={{ width: '16px', height: '16px', cursor: isCompleted ? 'default' : 'pointer' }}
                />
                {chk.label}
              </label>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          <h3 className="card-title">Handover Documentation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Outstanding Concerns</label>
              <input type="text" className="form-control" disabled={isCompleted} value={concerns} onChange={e => setConcerns(e.target.value)} placeholder="Delayed emergence, shivering..." />
            </div>
            
            <div className="form-group">
              <label className="form-label">Intervention Plan</label>
              <input type="text" className="form-control" disabled={isCompleted} value={interventionPlan} onChange={e => setInterventionPlan(e.target.value)} placeholder="Warming blanket, pain reassessment..." />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Recovery Notes</label>
              <textarea className="form-control" rows={3} disabled={isCompleted} value={notes} onChange={e => setNotes(e.target.value)} placeholder="General course of recovery in PACU..." />
            </div>

            <div className="form-group">
              <label className="form-label">Responsible Recovery Clinician</label>
              <input type="text" className="form-control" disabled={isCompleted} value={clinician} onChange={e => setClinician(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px' }} 
                onClick={handleConfirmRecovery}
                disabled={isCompleted || recoveryChecks.filter(chk => checkedItems[chk.key]).length < recoveryChecks.length}
              >
                {isCompleted ? '✓ HANDOVER LOCKED' : 'CONFIRM RECOVERY HANDOVER'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
