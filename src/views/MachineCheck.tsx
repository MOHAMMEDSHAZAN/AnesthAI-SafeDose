import React, { useEffect, useState } from 'react';
import { useApp, type SafetyChecklist } from '../context/AppContext';

export const MachineCheck: React.FC = () => {
  const { checklists, saveSafetyChecklist, activePatientId, activeCaseId } = useApp();

  // Retrieve checklist or fallback
  const existingChecklist = checklists.find(c => c.caseId === activeCaseId);

  const coreChecks = [
    { key: 'primary_oxygen', label: 'Primary oxygen source checked' },
    { key: 'backup_oxygen', label: 'Backup oxygen source available' },
    { key: 'oxygen_alarm', label: 'Oxygen alarm tested' },
    { key: 'flowmeters', label: 'Flowmeters functioning' },
    { key: 'vaporizer', label: 'Vaporizer checked' },
    { key: 'leak_test', label: 'Anaesthesia machine leak test passed' },
    { key: 'breathing_circuit', label: 'Breathing circuit connected' },
    { key: 'circuit_leak', label: 'Breathing circuit leak test completed' },
    { key: 'scavenging', label: 'Scavenging system checked' },
    { key: 'suction', label: 'Suction functioning' },
    { key: 'ventilator', label: 'Ventilator checked' },
    { key: 'monitoring', label: 'Monitoring equipment functioning' },
    { key: 'emergency_equip', label: 'Emergency equipment available' },
    { key: 'emergency_meds', label: 'Emergency medications available' }
  ];

  const secondaryChecks = [
    { key: 'ecg_monitor', label: 'ECG Monitor' },
    { key: 'pulse_oximeter', label: 'Pulse Oximeter' },
    { key: 'nibp_monitor', label: 'NIBP Monitor' },
    { key: 'capnography', label: 'Capnography' },
    { key: 'temp_monitor', label: 'Temperature Monitor' },
    { key: 'nm_monitor', label: 'Neuromuscular Monitor' },
    { key: 'bis_monitor', label: 'BIS Monitor' },
    { key: 'defibrillator', label: 'Defibrillator' },
    { key: 'infusion_pumps', label: 'Infusion Pumps' },
    { key: 'syringe_pumps', label: 'Syringe Pumps' }
  ];

  // States
  const [statuses, setStatuses] = useState<Record<string, 'passed' | 'warning' | 'failed' | 'na'>>({});
  const [checkedBy, setCheckedBy] = useState<string>('Staff ID #4289');
  const [checkDate, setCheckDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [checkTime, setCheckTime] = useState<string>(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [notes, setNotes] = useState<string>('');

  // Initial load
  useEffect(() => {
    if (existingChecklist && existingChecklist.data) {
      const dbStatuses: Record<string, any> = {};
      [...coreChecks, ...secondaryChecks].forEach(chk => {
        dbStatuses[chk.key] = existingChecklist.data[`status_${chk.key}`] || 'passed';
      });
      setStatuses(dbStatuses);
      setCheckedBy(existingChecklist.data.checked_by || 'Staff ID #4289');
      setNotes(existingChecklist.data.machine_notes || '');
    } else {
      // Default to passed
      const initial: Record<string, 'passed'> = {};
      [...coreChecks, ...secondaryChecks].forEach(chk => {
        initial[chk.key] = 'passed';
      });
      setStatuses(initial);
    }
  }, [existingChecklist]);

  // Save changes
  const triggerSave = (newStatuses: Record<string, 'passed' | 'warning' | 'failed' | 'na'>, newNotes: string, newUser: string) => {
    // Count checklist values
    const totalChecks = coreChecks.length;
    const completedCount = coreChecks.filter(chk => newStatuses[chk.key] === 'passed').length;

    const dataObj: Record<string, any> = {
      checked_by: newUser,
      check_date: checkDate,
      check_time: checkTime,
      machine_notes: newNotes
    };
    [...coreChecks, ...secondaryChecks].forEach(chk => {
      dataObj[`status_${chk.key}`] = newStatuses[chk.key] || 'passed';
    });

    const checklistObj: SafetyChecklist = {
      caseId: activeCaseId,
      patientId: existingChecklist?.patientId || activePatientId,
      preAnesthesiaStatus: existingChecklist?.preAnesthesiaStatus || 'not_started',
      machineCheckStatus: completedCount === totalChecks ? 'completed' : 'in_progress',
      preInductionStatus: existingChecklist?.preInductionStatus || 'not_started',
      timeoutStatus: existingChecklist?.timeoutStatus || 'not_started',
      intraopStatus: existingChecklist?.intraopStatus || 'not_started',
      recoveryStatus: existingChecklist?.recoveryStatus || 'not_started',
      completedChecks: completedCount,
      totalChecks: totalChecks,
      data: dataObj
    };
    saveSafetyChecklist(checklistObj);
  };

  const handleStatusChange = (key: string, val: 'passed' | 'warning' | 'failed' | 'na') => {
    const next = { ...statuses, [key]: val };
    setStatuses(next);
    triggerSave(next, notes, checkedBy);
  };

  // Compute status summary
  const completedChecks = coreChecks.filter(chk => statuses[chk.key] === 'passed').length;
  const warningChecksCount = coreChecks.filter(chk => statuses[chk.key] === 'warning').length;
  const failedChecksCount = coreChecks.filter(chk => statuses[chk.key] === 'failed').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Anesthesia Workstation Readiness</h1>
          <p className="page-subtitle">Pre-operative machine safety audit and equipment parameters (Autosaved)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        {/* Left Column: Workstation Status summary card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Anesthesia Workstation Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>Workstation Checks</span>
                <strong>{completedChecks} / 14 Passed</strong>
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: failedChecksCount > 0 ? 'var(--med-red)' : warningChecksCount > 0 ? 'var(--med-orange)' : 'var(--med-green)',
                  width: `${(completedChecks / 14) * 100}%` 
                }} />
              </div>

              {/* Safety notification rule */}
              <div style={{ 
                padding: '12px', 
                background: failedChecksCount > 0 ? 'rgba(239, 68, 68, 0.05)' : warningChecksCount > 0 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(0, 184, 148, 0.05)', 
                borderLeft: `4px solid ${failedChecksCount > 0 ? 'var(--med-red)' : warningChecksCount > 0 ? 'var(--med-orange)' : 'var(--med-green)'}`,
                borderRadius: '4px',
                fontSize: '0.8125rem'
              }}>
                {failedChecksCount > 0 ? (
                  <span style={{ color: 'var(--med-red)', fontWeight: 600 }}>
                    ❌ {failedChecksCount} required checks failed. Blocked from induction!
                  </span>
                ) : warningChecksCount > 0 ? (
                  <span style={{ color: 'var(--med-orange)', fontWeight: 600 }}>
                    ⚠ {warningChecksCount} required safety item requires attention.
                  </span>
                ) : (
                  <span style={{ color: 'var(--med-green)', fontWeight: 600 }}>
                    ✓ Workstation fully ready. All critical checks passed!
                  </span>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

              {/* Quick Status Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Primary Oxygen</span>
                  <span style={{ color: statuses.primary_oxygen === 'passed' ? 'var(--med-green)' : 'var(--med-orange)', fontWeight: 700 }}>
                    {statuses.primary_oxygen?.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Backup Oxygen</span>
                  <span style={{ color: statuses.backup_oxygen === 'passed' ? 'var(--med-green)' : 'var(--med-orange)', fontWeight: 700 }}>
                    {statuses.backup_oxygen?.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Leak Test</span>
                  <span style={{ color: statuses.leak_test === 'passed' ? 'var(--med-green)' : 'var(--med-red)', fontWeight: 700 }}>
                    {statuses.leak_test?.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ventilator</span>
                  <span style={{ color: statuses.ventilator === 'passed' ? 'var(--med-green)' : 'var(--med-red)', fontWeight: 700 }}>
                    {statuses.ventilator?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Sign-off */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Sign-off</h3>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Checked By</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={checkedBy} 
                  onChange={e => { setCheckedBy(e.target.value); triggerSave(statuses, notes, e.target.value); }} 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={checkDate} onChange={e => setCheckDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-control" value={checkTime} onChange={e => setCheckTime(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive checklists */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Readiness Checklist</h3>
          
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {coreChecks.map(chk => (
              <div key={chk.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.875rem' }}>{chk.label}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['passed', 'warning', 'failed', 'na'] as const).map(opt => {
                    const isActive = statuses[chk.key] === opt;
                    let label = 'N/A';
                    let activeBg = 'rgba(255,255,255,0.08)';
                    let activeColor = 'inherit';

                    if (opt === 'passed') { label = '✓ Pass'; activeBg = 'rgba(0, 184, 148, 0.12)'; activeColor = 'var(--med-green)'; }
                    if (opt === 'warning') { label = '⚠ Warn'; activeBg = 'rgba(245, 158, 11, 0.12)'; activeColor = 'var(--med-orange)'; }
                    if (opt === 'failed') { label = '✕ Fail'; activeBg = 'rgba(239, 68, 68, 0.12)'; activeColor = 'var(--med-red)'; }

                    return (
                      <button 
                        key={opt}
                        onClick={() => handleStatusChange(chk.key, opt)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: isActive ? `1px solid ${activeColor}` : '1px solid transparent',
                          background: isActive ? activeBg : 'transparent',
                          color: isActive ? activeColor : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          <h3 className="card-title">Secondary Monitors & Pumps</h3>
          
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {secondaryChecks.map(chk => (
              <div key={chk.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.8125rem' }}>{chk.label}</span>
                <select 
                  className="form-control" 
                  style={{ width: '100px', padding: '4px', fontSize: '0.75rem' }}
                  value={statuses[chk.key] || 'passed'}
                  onChange={e => handleStatusChange(chk.key, e.target.value as any)}
                >
                  <option value="passed">Passed</option>
                  <option value="warning">Attention</option>
                  <option value="failed">Failed</option>
                  <option value="na">N/A</option>
                </select>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">Optional Notes</label>
            <textarea 
              className="form-control" 
              rows={3} 
              value={notes} 
              onChange={e => { setNotes(e.target.value); triggerSave(statuses, e.target.value, checkedBy); }} 
              placeholder="Any details about cylinder pressures, pipeline status, vaporizer fillings..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
