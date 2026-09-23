import React, { useEffect, useState } from 'react';
import { useApp, type SafetyChecklist } from '../context/AppContext';

export const PreInduction: React.FC = () => {
  const { checklists, saveSafetyChecklist, logSafetyAudit, activePatientId, activeCaseId } = useApp();

  const existingChecklist = checklists.find(c => c.caseId === activeCaseId);

  // Grouped pre-induction check items
  const safetySections = [
    {
      group: 'PATIENT',
      checks: [
        { key: 'confirm_id', label: 'Patient identity confirmed' },
        { key: 'confirm_proc', label: 'Procedure confirmed' },
        { key: 'confirm_consent', label: 'Consent status confirmed' },
        { key: 'review_allergies', label: 'Allergies reviewed' },
        { key: 'review_asa', label: 'ASA Physical Status Classification confirmed' }
      ]
    },
    {
      group: 'ACCESS',
      checks: [
        { key: 'iv_access', label: 'IV access established' },
        { key: 'iv_patent', label: 'IV access patent' }
      ]
    },
    {
      group: 'AIRWAY',
      checks: [
        { key: 'airway_eval', label: 'Airway assessment completed' },
        { key: 'airway_equip', label: 'Airway equipment available' },
        { key: 'ett_cuff', label: 'ETT cuff checked where applicable' },
        { key: 'backup_airway_plan', label: 'Backup airway plan available if required' }
      ]
    },
    {
      group: 'EQUIPMENT',
      checks: [
        { key: 'machine_checked', label: 'Anaesthesia machine checked' },
        { key: 'oxygen_supply', label: 'Oxygen supply confirmed' },
        { key: 'breathing_sys', label: 'Breathing system checked' },
        { key: 'suction_avail', label: 'Suction available' },
        { key: 'monitoring_avail', label: 'Monitoring attached/available' }
      ]
    },
    {
      group: 'MEDICATION',
      checks: [
        { key: 'meds_prepared', label: 'Planned medications prepared' },
        { key: 'meds_labeled', label: 'Medication labels verified' },
        { key: 'emerg_meds_avail', label: 'Emergency medications available where required' }
      ]
    },
    {
      group: 'SAFETY',
      checks: [
        { key: 'monitor_assigned', label: 'Responsible monitor assigned' },
        { key: 'risks_communicated', label: 'Identified risks communicated' },
        { key: 'interventions_ready', label: 'Emergency interventions available' },
        { key: 'team_ready', label: 'Team ready' }
      ]
    }
  ];

  // Airway specific sub-checks
  const airwayChecks = [
    { key: 'ett_avail', label: 'Appropriate endotracheal tubes available' },
    { key: 'ett_cuffs_check', label: 'ETT cuffs checked' },
    { key: 'laryngoscope_ok', label: 'Laryngoscope functioning' },
    { key: 'video_lary_ok', label: 'Video laryngoscope available if required' },
    { key: 'stylet_avail', label: 'Stylet available' },
    { key: 'bougie_avail', label: 'Bougie available' },
    { key: 'suction_ok', label: 'Suction functioning' },
    { key: 'sg_airway_avail', label: 'Supraglottic airway available' },
    { key: 'bm_vent_ok', label: 'Bag-mask ventilation equipment available' },
    { key: 'diff_airway_avail', label: 'Difficult airway equipment available' },
    { key: 'emerg_surgical_airway', label: 'Emergency surgical airway equipment available' }
  ];

  // Emergency readiness sub-checks
  const emergencyChecks = [
    { key: 'emerg_med_set', label: 'Emergency medication set' },
    { key: 'reversal_agents', label: 'Reversal agents' },
    { key: 'iv_access_equip', label: 'IV access equipment' },
    { key: 'iv_fluids_avail', label: 'IV fluids' },
    { key: 'fluid_admin_equip', label: 'Fluid administration equipment' },
    { key: 'defib_avail', label: 'Defibrillator' },
    { key: 'emerg_airway_equip', label: 'Emergency airway equipment' },
    { key: 'resus_equip', label: 'Resuscitation equipment' }
  ];

  // State hooks
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [overrideActive, setOverrideActive] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideUser, setOverrideUser] = useState<string>('Dr. Sarah Jenkins');
  
  // Airway details
  const [airwayDevice, setAirwayDevice] = useState<string>('ETT');
  const [ettSize, setEttSize] = useState<string>('7.5 cuffed');
  const [laryngoscopeType, setLaryngoscopeType] = useState<string>('Macintosh 3');
  const [diffAirwayExpected, setDiffAirwayExpected] = useState<string>('No');
  const [diffAirwayPlan, setDiffAirwayPlan] = useState<string>('Video laryngoscope primary');
  const [backupAirwayPlan, setBackupAirwayPlan] = useState<string>('LMA supreme backup, needle cricothyroidotomy emergency kit');

  // Emergency fields
  const [protocolAvailable, setProtocolAvailable] = useState<string>('Standard ACLS 2026');
  const [emergContact, setEmergContact] = useState<string>('Code Blue Team - Ext 5555');
  const [emergLocation, setEmergLocation] = useState<string>('OR-01 Emergency Cart, Shelf A');

  // Load from database
  useEffect(() => {
    if (existingChecklist && existingChecklist.data) {
      const dbChecked: Record<string, boolean> = {};
      
      // Load main checks
      safetySections.forEach(sec => {
        sec.checks.forEach(chk => {
          dbChecked[chk.key] = !!existingChecklist.data[chk.key];
        });
      });
      // Load airway & emergency checklists
      airwayChecks.forEach(chk => {
        dbChecked[chk.key] = !!existingChecklist.data[chk.key];
      });
      emergencyChecks.forEach(chk => {
        dbChecked[chk.key] = !!existingChecklist.data[chk.key];
      });

      setCheckedItems(dbChecked);

      // Load airway detail strings
      setAirwayDevice(existingChecklist.data.airway_device || 'ETT');
      setEttSize(existingChecklist.data.ett_size || '7.5 cuffed');
      setLaryngoscopeType(existingChecklist.data.laryngoscope_type || 'Macintosh 3');
      setDiffAirwayExpected(existingChecklist.data.diff_airway_expected || 'No');
      setDiffAirwayPlan(existingChecklist.data.diff_airway_plan || 'Video laryngoscope primary');
      setBackupAirwayPlan(existingChecklist.data.backup_airway_plan || 'LMA supreme backup');
      
      // Load emergency readiness details
      setProtocolAvailable(existingChecklist.data.protocol_available || 'Standard ACLS 2026');
      setEmergContact(existingChecklist.data.emerg_contact || 'Code Blue Team - Ext 5555');
      setEmergLocation(existingChecklist.data.emerg_location || 'OR-01 Emergency Cart');
      
      // Load override
      if (existingChecklist.data.pre_induction_overridden) {
        setOverrideActive(true);
        setOverrideReason(existingChecklist.data.override_reason || '');
        setOverrideUser(existingChecklist.data.override_user || '');
      }
    }
  }, [existingChecklist]);

  // Save checklist helper
  const triggerSave = (
    newChecked: Record<string, boolean>,
    newOverride: boolean,
    newOverrideReason: string,
    newOverrideUser: string
  ) => {
    const totalRequired = safetySections.reduce((acc, curr) => acc + curr.checks.length, 0);
    const completedCount = safetySections.reduce((acc, curr) => {
      const activeCount = curr.checks.filter(chk => newChecked[chk.key]).length;
      return acc + activeCount;
    }, 0);

    const dataObj: Record<string, any> = {
      ...newChecked,
      airway_device: airwayDevice,
      ett_size: ettSize,
      laryngoscope_type: laryngoscopeType,
      diff_airway_expected: diffAirwayExpected,
      diff_airway_plan: diffAirwayPlan,
      backup_airway_plan: backupAirwayPlan,
      protocol_available: protocolAvailable,
      emerg_contact: emergContact,
      emerg_location: emergLocation,
      pre_induction_overridden: newOverride,
      override_reason: newOverrideReason,
      override_user: newOverrideUser,
      override_timestamp: newOverride ? new Date().toISOString() : null
    };

    const isFinished = completedCount === totalRequired || newOverride;

    const checklistObj: SafetyChecklist = {
      caseId: activeCaseId,
      patientId: existingChecklist?.patientId || activePatientId,
      preAnesthesiaStatus: existingChecklist?.preAnesthesiaStatus || 'not_started',
      machineCheckStatus: existingChecklist?.machineCheckStatus || 'not_started',
      preInductionStatus: isFinished ? 'completed' : 'in_progress',
      timeoutStatus: existingChecklist?.timeoutStatus || 'not_started',
      intraopStatus: existingChecklist?.intraopStatus || 'not_started',
      recoveryStatus: existingChecklist?.recoveryStatus || 'not_started',
      completedChecks: completedCount,
      totalChecks: totalRequired,
      data: dataObj
    };
    saveSafetyChecklist(checklistObj);
  };

  const handleCheckboxChange = (key: string) => {
    const next = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(next);
    triggerSave(next, overrideActive, overrideReason, overrideUser);
  };

  const handleOverrideTrigger = () => {
    const nextOverride = !overrideActive;
    setOverrideActive(nextOverride);
    if (nextOverride) {
      logSafetyAudit('Induction Override Authorized', `Case ${activeCaseId}`, overrideReason || 'Authorized clinical urgency');
    }
    triggerSave(checkedItems, nextOverride, overrideReason, overrideUser);
  };

  // Find remaining outstanding checklist items
  const outstandingChecks: string[] = [];
  safetySections.forEach(sec => {
    sec.checks.forEach(chk => {
      if (!checkedItems[chk.key]) {
        outstandingChecks.push(chk.label);
      }
    });
  });

  const totalRequired = safetySections.reduce((acc, curr) => acc + curr.checks.length, 0);
  const completedChecks = totalRequired - outstandingChecks.length;
  const isComplete = outstandingChecks.length === 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pre-Induction Safety Gate ({completedChecks} / {totalRequired} Checked)</h1>
          <p className="page-subtitle">Critical check prior to anesthesia administration (Autosaved)</p>
        </div>
      </div>

      {/* Safety Gate Warning/Incomplete Banner */}
      {!isComplete && !overrideActive && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          borderLeft: '4px solid var(--med-red)',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: 'var(--med-red)', fontWeight: 700, fontSize: '0.9375rem' }}>
            ⚠ Pre-Induction Checklist Incomplete
          </h4>
          <p style={{ fontSize: '0.8125rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
            The following required checks must be confirmed prior to proceeding with anesthesia induction:
          </p>
          <ul style={{ fontSize: '0.8125rem', paddingLeft: '20px', marginTop: '8px', color: 'var(--text-primary)' }}>
            {outstandingChecks.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {overrideActive && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.05)',
          borderLeft: '4px solid var(--med-orange)',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ color: 'var(--med-orange)', fontWeight: 700, fontSize: '0.9375rem' }}>
              ⚠ Clinical Override Active
            </h4>
            <p style={{ fontSize: '0.8125rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
              Authorized By: <strong>{overrideUser}</strong> • Reason: <em>"{overrideReason || 'Emergency clinical urgency'}"</em>
            </p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={handleOverrideTrigger}>
            Remove Override
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Airway check & emergency setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Airway Equipment Card */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 className="card-title">Airway Equipment Assessment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {airwayChecks.map(chk => (
                <label key={chk.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={!!checkedItems[chk.key]} 
                    onChange={() => handleCheckboxChange(chk.key)} 
                    style={{ width: '14px', height: '14px' }}
                  />
                  {chk.label}
                </label>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '14px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Planned Airway Device</label>
                <input type="text" className="form-control" style={{ padding: '6px' }} value={airwayDevice} onChange={e => { setAirwayDevice(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, overrideUser); }} />
              </div>
              <div className="form-group">
                <label className="form-label">ET Tube Size</label>
                <input type="text" className="form-control" style={{ padding: '6px' }} value={ettSize} onChange={e => { setEttSize(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, overrideUser); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Laryngoscope Type</label>
                <input type="text" className="form-control" style={{ padding: '6px' }} value={laryngoscopeType} onChange={e => { setLaryngoscopeType(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, overrideUser); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Difficult Airway Expected?</label>
                <select className="form-control" style={{ padding: '6px' }} value={diffAirwayExpected} onChange={e => { setDiffAirwayExpected(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, overrideUser); }}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Backup Airway Plan</label>
                <textarea className="form-control" rows={2} style={{ padding: '6px' }} value={backupAirwayPlan} onChange={e => { setBackupAirwayPlan(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, overrideUser); }} />
              </div>
            </div>
          </div>

          {/* Emergency Readiness Card */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 className="card-title">Emergency Readiness Setup</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {emergencyChecks.map(chk => (
                <label key={chk.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={!!checkedItems[chk.key]} 
                    onChange={() => handleCheckboxChange(chk.key)} 
                    style={{ width: '14px', height: '14px' }}
                  />
                  {chk.label}
                </label>
              ))}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '14px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Emergency Protocol Available</label>
                <input type="text" className="form-control" style={{ padding: '6px' }} value={protocolAvailable} onChange={e => { setProtocolAvailable(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, overrideUser); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact / Team</label>
                <input type="text" className="form-control" style={{ padding: '6px' }} value={emergContact} onChange={e => { setEmergContact(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, overrideUser); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Equipment Location</label>
                <input type="text" className="form-control" style={{ padding: '6px' }} value={emergLocation} onChange={e => { setEmergLocation(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, overrideUser); }} />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Pre-Induction Checklist sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Induction Safety Gates</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
              {safetySections.map(sec => (
                <div key={sec.group}>
                  <h4 style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'var(--med-cyan)', 
                    borderBottom: '1px solid var(--border-color)', 
                    paddingBottom: '4px',
                    marginBottom: '10px',
                    letterSpacing: '0.05em'
                  }}>
                    {sec.group}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {sec.checks.map(chk => (
                      <label key={chk.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={!!checkedItems[chk.key]} 
                          onChange={() => handleCheckboxChange(chk.key)} 
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        {chk.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Override configuration trigger */}
          {!isComplete && (
            <div className="glass" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <h3 className="card-title" style={{ color: 'var(--med-orange)' }}>Emergency Checklist Override</h3>
              <p style={{ fontSize: '0.8125rem', marginTop: '4px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                If this is an emergency case and checklist steps cannot be performed immediately, authorized clinicians may force an override to unlock the workflow.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Reason for Override</label>
                  <textarea 
                    className="form-control" 
                    rows={2} 
                    value={overrideReason} 
                    onChange={e => { setOverrideReason(e.target.value); triggerSave(checkedItems, overrideActive, e.target.value, overrideUser); }} 
                    placeholder="Enter urgent clinical reason for override..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Authorized Clinician (Signature)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={overrideUser} 
                    onChange={e => { setOverrideUser(e.target.value); triggerSave(checkedItems, overrideActive, overrideReason, e.target.value); }} 
                  />
                </div>
                <button 
                  className="btn btn-danger" 
                  style={{ width: '100%', marginTop: '8px' }} 
                  onClick={handleOverrideTrigger}
                  disabled={!overrideReason.trim()}
                >
                  Confirm Override & Proceed
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
