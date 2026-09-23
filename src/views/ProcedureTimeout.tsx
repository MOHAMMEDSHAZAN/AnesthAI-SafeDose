import React, { useEffect, useState } from 'react';
import { useApp, type SafetyChecklist } from '../context/AppContext';

export const ProcedureTimeout: React.FC = () => {
  const { checklists, saveSafetyChecklist, logSafetyAudit, activePatientId, activeCaseId } = useApp();

  const existingChecklist = checklists.find(c => c.caseId === activeCaseId);

  const timeoutChecks = [
    { key: 'to_patient_id', label: 'Patient identity confirmed' },
    { key: 'to_procedure', label: 'Procedure confirmed' },
    { key: 'to_site', label: 'Procedure site confirmed where applicable' },
    { key: 'to_plan', label: 'Anaesthesia plan confirmed' },
    { key: 'to_depth', label: 'Anaesthetic depth assessed where applicable' },
    { key: 'to_allergies', label: 'Allergies communicated' },
    { key: 'to_risks', label: 'Major patient-specific risks communicated' },
    { key: 'to_airway', label: 'Airway concerns communicated' },
    { key: 'to_meds', label: 'Medication concerns communicated' },
    { key: 'to_blood', label: 'Blood loss concerns communicated' },
    { key: 'to_equip', label: 'Required equipment confirmed' },
    { key: 'to_team', label: 'Team safety concerns discussed' }
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [anesthesiologist, setAnesthesiologist] = useState<string>('Dr. Arjun Malhotra (DEMO-LIC-2048)');
  const [surgeon, setSurgeon] = useState<string>('Dr. Vikram Sengupta, MS (Surg)');
  const [otNurse, setOtNurse] = useState<string>('Nisha Verma, RN (DEMO-RN-1042)');
  const [otherProvider, setOtherProvider] = useState<string>('Dr. Priya Sundaram (DEMO-RES-4019)');
  const [completedBy, setCompletedBy] = useState<string>('Dr. Arjun Malhotra (DEMO-LIC-2048)');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (existingChecklist && existingChecklist.data) {
      const dbChecked: Record<string, boolean> = {};
      timeoutChecks.forEach(chk => {
        dbChecked[chk.key] = !!existingChecklist.data[chk.key];
      });
      setCheckedItems(dbChecked);
      setAnesthesiologist(existingChecklist.data.to_anesthesiologist || 'Dr. Arjun Malhotra (DEMO-LIC-2048)');
      setSurgeon(existingChecklist.data.to_surgeon || 'Dr. Vikram Sengupta, MS (Surg)');
      setOtNurse(existingChecklist.data.to_nurse || 'Nisha Verma, RN (DEMO-RN-1042)');
      setOtherProvider(existingChecklist.data.to_other || 'Dr. Priya Sundaram (DEMO-RES-4019)');
      setCompletedBy(existingChecklist.data.to_completed_by || 'Dr. Arjun Malhotra (DEMO-LIC-2048)');
      setIsCompleted(existingChecklist.timeoutStatus === 'completed');
    }
  }, [existingChecklist]);

  const handleCheckboxChange = (key: string) => {
    if (isCompleted) return; // Prevent edits after complete
    const next = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(next);
  };

  const handleCompleteTimeout = () => {
    const totalRequired = timeoutChecks.length;
    const completedCount = timeoutChecks.filter(chk => checkedItems[chk.key]).length;

    if (completedCount < totalRequired) {
      alert("Please check all required time-out items before confirming.");
      return;
    }

    const dataObj: Record<string, any> = {
      ...checkedItems,
      to_anesthesiologist: anesthesiologist,
      to_surgeon: surgeon,
      to_nurse: otNurse,
      to_other: otherProvider,
      to_completed_by: completedBy,
      to_timestamp: new Date().toISOString()
    };

    const checklistObj: SafetyChecklist = {
      caseId: activeCaseId,
      patientId: existingChecklist?.patientId || activePatientId,
      preAnesthesiaStatus: existingChecklist?.preAnesthesiaStatus || 'not_started',
      machineCheckStatus: existingChecklist?.machineCheckStatus || 'not_started',
      preInductionStatus: existingChecklist?.preInductionStatus || 'not_started',
      timeoutStatus: 'completed',
      intraopStatus: existingChecklist?.intraopStatus || 'not_started',
      recoveryStatus: existingChecklist?.recoveryStatus || 'not_started',
      completedChecks: completedCount,
      totalChecks: totalRequired,
      data: dataObj
    };
    
    saveSafetyChecklist(checklistObj);
    logSafetyAudit('Pre-Procedure Time-Out Finalized', `Case ${activeCaseId}`, `Anesthesiologist: ${anesthesiologist}, Surgeon: ${surgeon}`);
    setIsCompleted(true);
  };

  const completedChecksCount = timeoutChecks.filter(chk => checkedItems[chk.key]).length;
  const isButtonDisabled = completedChecksCount < timeoutChecks.length || isCompleted;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pre-Procedure Time-Out Screen</h1>
          <p className="page-subtitle">Mandatory surgical team briefing prior to skin incision (Surgical Safety Check)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Team Sign-off */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Surgical Team Confirmation</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Verify that all critical providers are present and confirm agreement on patient, site, and procedure.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Anesthesiologist</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={isCompleted}
                  value={anesthesiologist} 
                  onChange={e => setAnesthesiologist(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Surgeon</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={isCompleted}
                  value={surgeon} 
                  onChange={e => setSurgeon(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">OT / Scrub Nurse</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={isCompleted}
                  value={otNurse} 
                  onChange={e => setOtNurse(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Other Required Member (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={isCompleted}
                  value={otherProvider} 
                  onChange={e => setOtherProvider(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Completed Signatures</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Time-Out Completed By</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={isCompleted}
                  value={completedBy} 
                  onChange={e => setCompletedBy(e.target.value)} 
                />
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '12px', padding: '12px' }} 
                onClick={handleCompleteTimeout}
                disabled={isButtonDisabled}
              >
                {isCompleted ? '✓ TIME-OUT COMPLETE & LOCKED' : 'COMPLETE TIME-OUT'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Time-Out verification checklists */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Time-Out Safety Checklist</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Verbally verify each item with the entire surgical team. All items must be checked to enable sign-off.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {timeoutChecks.map(chk => (
              <label 
                key={chk.key} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  fontSize: '0.9375rem', 
                  padding: '10px 14px', 
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
                  style={{ width: '18px', height: '18px', cursor: isCompleted ? 'default' : 'pointer' }}
                />
                {chk.label}
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Verification Status:</span>
            <strong>{completedChecksCount} / {timeoutChecks.length} Items Checked</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
