import React, { useEffect, useState } from 'react';
import { useApp, type SafetyChecklist } from '../context/AppContext';

export const PreAnesthesia: React.FC = () => {
  const { patients, checklists, saveSafetyChecklist, activePatientId, activeCaseId } = useApp();
  
  // Load patient
  const patient = patients.find(p => p.id === activePatientId) || patients[0];

  // Retrieve existing checklist or load defaults
  const existingChecklist = checklists.find(c => c.caseId === activeCaseId);

  const initialItems = [
    { key: 'history_reviewed', label: 'Medical history reviewed' },
    { key: 'exam_reviewed', label: 'Clinical examination reviewed' },
    { key: 'abnormalities_flagged', label: 'Significant abnormalities identified' },
    { key: 'investigations_reviewed', label: 'Required investigations reviewed' },
    { key: 'correctable_addressed', label: 'Correctable abnormalities addressed' },
    { key: 'complications_documented', label: 'Anticipated complications documented' },
    { key: 'strategy_documented', label: 'Management strategy documented' },
    { key: 'premed_reviewed', label: 'Premedication plan reviewed' },
    { key: 'analgesia_reviewed', label: 'Analgesia plan reviewed' },
    { key: 'technique_planned', label: 'Anaesthesia technique planned' },
    { key: 'monitoring_established', label: 'Monitoring strategy established' },
    { key: 'temperature_planned', label: 'Temperature management planned' },
    { key: 'recovery_established', label: 'Post-anaesthesia/recovery plan established' },
    { key: 'personnel_available', label: 'Required personnel available' },
    { key: 'equipment_available', label: 'Required equipment available' },
    { key: 'medications_available', label: 'Required medications available' }
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [textFields, setTextFields] = useState<Record<string, string>>({
    findings: '',
    abnormal_investigations: '',
    complications: '',
    mitigation_plan: '',
    anesthesia_plan: '',
    analgesia_plan: '',
    monitoring_plan: '',
    temp_plan: '',
    recovery_plan: '',
    notes: ''
  });

  // Load from existing checklist state
  useEffect(() => {
    if (existingChecklist && existingChecklist.data) {
      const dbChecked: Record<string, boolean> = {};
      initialItems.forEach(item => {
        dbChecked[item.key] = !!existingChecklist.data[item.key];
      });
      setCheckedItems(dbChecked);
      
      const dbTexts: Record<string, string> = {};
      Object.keys(textFields).forEach(k => {
        dbTexts[k] = existingChecklist.data[k] || '';
      });
      setTextFields(dbTexts);
    }
  }, [existingChecklist]);

  // Compute BMI
  const weight = patient?.weight || 70;
  const heightMeters = (patient?.height || 170) / 100;
  const bmi = (weight / (heightMeters * heightMeters)).toFixed(1);

  // Handle changes and Autosave
  const triggerSave = (newChecked: Record<string, boolean>, newTexts: Record<string, string>) => {
    const completedCount = Object.values(newChecked).filter(Boolean).length;
    
    const checklistObj: SafetyChecklist = {
      caseId: activeCaseId,
      patientId: patient.id,
      preAnesthesiaStatus: completedCount === initialItems.length ? 'completed' : 'in_progress',
      machineCheckStatus: existingChecklist?.machineCheckStatus || 'not_started',
      preInductionStatus: existingChecklist?.preInductionStatus || 'not_started',
      timeoutStatus: existingChecklist?.timeoutStatus || 'not_started',
      intraopStatus: existingChecklist?.intraopStatus || 'not_started',
      recoveryStatus: existingChecklist?.recoveryStatus || 'not_started',
      completedChecks: completedCount,
      totalChecks: initialItems.length,
      data: {
        ...newChecked,
        ...newTexts
      }
    };
    saveSafetyChecklist(checklistObj);
  };

  const handleCheckboxChange = (key: string) => {
    const nextChecked = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(nextChecked);
    triggerSave(nextChecked, textFields);
  };

  const handleTextChange = (key: string, val: string) => {
    const nextTexts = { ...textFields, [key]: val };
    setTextFields(nextTexts);
    triggerSave(checkedItems, nextTexts);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pre-Anaesthesia Safety Assessment</h1>
          <p className="page-subtitle">Patient checklist and evaluation details (Autosaved)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        {/* Left Column: Patient Summary card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--med-cyan)" strokeWidth="2.5" style={{ marginRight: '6px' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Patient Details
            </h3>
            
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Patient ID</span>
                <strong>{patient.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Name</span>
                <strong>{patient.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Age / Sex</span>
                <strong>{patient.age} years / {patient.gender}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Weight / Height</span>
                <strong>{patient.weight} kg / {patient.height} cm</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">BMI</span>
                <strong>{bmi} (Normal)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">ASA Physical Status</span>
                <span className="badge badge-warning">{patient.asaPhysicalStatus || `ASA ${patient.asaScore}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Allergies</span>
                <span style={{ color: patient.allergies.length > 0 ? 'var(--med-red)' : 'inherit', fontWeight: 600 }}>
                  {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Comorbidities</span>
                <strong>{patient.comorbidities?.join(', ') || 'None'}</strong>
              </div>
            </div>
          </div>

          {/* Quick instructions alert */}
          <div className="glass" style={{ padding: '16px', borderLeft: '4px solid var(--med-blue)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--med-blue)', textTransform: 'uppercase' }}>Clinical Note</span>
            <p style={{ fontSize: '0.75rem', marginTop: '6px', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
              Checklist state is synchronized locally and to the hospital safety log dynamically on every user action. Do not proceed to induction without resolving critical assessments.
            </p>
          </div>
        </div>

        {/* Right Column: Checklists & Texts */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Preoperative Safety Checklist</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginTop: '16px' }}>
            {initialItems.map(item => (
              <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={!!checkedItems[item.key]} 
                  onChange={() => handleCheckboxChange(item.key)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                {item.label}
              </label>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          <h3 className="card-title" style={{ marginBottom: '16px' }}>Clinical Assessment Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Important Clinical Findings</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.findings} 
                onChange={e => handleTextChange('findings', e.target.value)} 
                placeholder="Findings from physical exam..."
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Abnormal Investigations</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.abnormal_investigations} 
                onChange={e => handleTextChange('abnormal_investigations', e.target.value)}
                placeholder="List abnormal ECG, lab results..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Anticipated Complications</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.complications} 
                onChange={e => handleTextChange('complications', e.target.value)}
                placeholder="Difficult airway, hemodynamic collapse risk..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Risk Mitigation Plan</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.mitigation_plan} 
                onChange={e => handleTextChange('mitigation_plan', e.target.value)}
                placeholder="Mitigation steps..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Anaesthesia Technique Plan</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.anesthesia_plan} 
                onChange={e => handleTextChange('anesthesia_plan', e.target.value)}
                placeholder="Planned technique..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Analgesia Plan</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.analgesia_plan} 
                onChange={e => handleTextChange('analgesia_plan', e.target.value)}
                placeholder="Post-op pain management..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monitoring Plan</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.monitoring_plan} 
                onChange={e => handleTextChange('monitoring_plan', e.target.value)}
                placeholder="ECG, SpO2, invasive monitoring..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temperature Management Plan</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.temp_plan} 
                onChange={e => handleTextChange('temp_plan', e.target.value)}
                placeholder="Forced-air warmer, fluid warming..."
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Additional Notes / Recommendations</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={textFields.notes} 
                onChange={e => handleTextChange('notes', e.target.value)}
                placeholder="Any special requests..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
