import React from 'react';
import { useApp } from '../context/AppContext';

interface SafetyOverviewProps {
  setView: (v: string) => void;
}

export const SafetyOverview: React.FC<SafetyOverviewProps> = ({ setView }) => {
  const { patients, checklists, incidents, activeCaseId } = useApp();

  // Compute metrics dynamically from actual application data
  const totalCases = patients.length;
  const activeCases = 2; // OR-01 and OR-02
  const completedChecksToday = checklists.filter(c => c.completedChecks === c.totalChecks).length;
  const pendingChecks = checklists.filter(c => c.completedChecks < c.totalChecks).length;
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.followupStatus === 'open').length;
  const nearMisses = incidents.filter(i => i.severity === 'near_miss').length;
  const criticalItems = checklists.reduce((acc, curr) => {
    const outstanding = curr.totalChecks - curr.completedChecks;
    return acc + (outstanding > 0 ? 1 : 0);
  }, 0);

  // Active check item lists
  const currentChecklist = checklists.find(c => c.caseId === activeCaseId) || {
    caseId: activeCaseId,
    patientId: 'P001',
    preAnesthesiaStatus: 'completed',
    machineCheckStatus: 'in_progress',
    preInductionStatus: 'not_started',
    timeoutStatus: 'not_started',
    intraopStatus: 'not_started',
    recoveryStatus: 'not_started',
    completedChecks: 4,
    totalChecks: 16,
    data: {}
  };

  const workflowStages = [
    { label: 'Patient Selected', status: 'completed' },
    { label: 'Pre-Anaesthesia', status: currentChecklist.preAnesthesiaStatus },
    { label: 'Machine Check', status: currentChecklist.machineCheckStatus },
    { label: 'Pre-Induction', status: currentChecklist.preInductionStatus },
    { label: 'Time-Out', status: currentChecklist.timeoutStatus },
    { label: 'Intraop Monitor', status: currentChecklist.intraopStatus },
    { label: 'Recovery Safety', status: currentChecklist.recoveryStatus },
    { label: 'PACU Assessment', status: 'not_started' },
    { label: 'Case Completion', status: 'not_started' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Safety & Quality Overview</h1>
          <p className="page-subtitle">Real-time perioperative checklist tracking & quality audits</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setView('report-incident')}>
            🚨 Report Incident
          </button>
          <button className="btn btn-secondary" onClick={() => setView('safety-analytics')}>
            📊 View Safety Analytics
          </button>
        </div>
      </div>

      {/* Unified Workflow Stepper Timeline */}
      <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--med-cyan)" strokeWidth="2.5" style={{ marginRight: '6px' }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Active Safety Workflow: Patient Robert Miller (Case {activeCaseId})
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '20px', position: 'relative' }}>
          {/* Timeline connecting line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '2%',
            right: '2%',
            height: '3px',
            background: 'rgba(255,255,255,0.08)',
            zIndex: 1
          }} />

          {workflowStages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isAttention = stage.status === 'attention' || (isInProgress && currentChecklist.completedChecks < 5);
            
            let color = 'rgba(255,255,255,0.2)';
            let bgColor = 'var(--bg-secondary)';
            let borderColor = 'rgba(255,255,255,0.08)';

            if (isCompleted) {
              color = 'var(--med-green)';
              bgColor = 'rgba(0, 184, 148, 0.12)';
              borderColor = 'rgba(0, 184, 148, 0.4)';
            } else if (isInProgress) {
              color = 'var(--med-cyan)';
              bgColor = 'rgba(0, 229, 255, 0.12)';
              borderColor = 'rgba(0, 229, 255, 0.4)';
            } else if (isAttention) {
              color = 'var(--med-orange)';
              bgColor = 'rgba(245, 158, 11, 0.12)';
              borderColor = 'rgba(245, 158, 11, 0.4)';
            }

            return (
              <div key={idx} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                zIndex: 2, 
                flex: 1, 
                minWidth: '90px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  color: color,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  marginBottom: '8px',
                  boxShadow: isInProgress ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none'
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: color }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {stage.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Dashboard Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass monitor-card monitor-cyan">
          <span className="monitor-label">Active Surgical Cases</span>
          <div className="monitor-value">{activeCases}</div>
          <span className="monitor-trend">Monitoring {totalCases} patients</span>
        </div>
        <div className="glass monitor-card monitor-blue">
          <span className="monitor-label">Pending Safety Checks</span>
          <div className="monitor-value">{pendingChecks}</div>
          <span className="monitor-trend">Cases requiring checklist updates</span>
        </div>
        <div className="glass monitor-card monitor-green">
          <span className="monitor-label">Completed Checks Today</span>
          <div className="monitor-value">{completedChecksToday}</div>
          <span className="monitor-trend">100% compliance target</span>
        </div>
        <div className="glass monitor-card monitor-orange">
          <span className="monitor-label">Critical Safety Items</span>
          <div className="monitor-value">{criticalItems}</div>
          <span className="monitor-trend">Outstanding checklist checks</span>
        </div>
        <div className="glass monitor-card monitor-red">
          <span className="monitor-label">Open Incident Reports</span>
          <div className="monitor-value">{openIncidents}</div>
          <span className="monitor-trend">Active safety reviews ({totalIncidents} total)</span>
        </div>
        <div className="glass monitor-card monitor-orange">
          <span className="monitor-label">Near Misses Reported</span>
          <div className="monitor-value">{nearMisses}</div>
          <span className="monitor-trend">Preventative safety reporting active</span>
        </div>
      </div>

      {/* Checklist Completion & Demographics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Safety Checklist Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span>Pre-Anaesthesia Checklist</span>
                <strong>{currentChecklist.preAnesthesiaStatus === 'completed' ? '16/16' : '0/16'} Checks</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--med-green)', width: currentChecklist.preAnesthesiaStatus === 'completed' ? '100%' : '0%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span>Machine & Workstation readiness</span>
                <strong>{currentChecklist.machineCheckStatus === 'completed' ? '14/14' : '13/14'} Checks</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--med-orange)', width: currentChecklist.machineCheckStatus === 'completed' ? '100%' : '92.8%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span>Pre-Induction (Access, Airway, Meds)</span>
                <strong>{currentChecklist.preInductionStatus === 'completed' ? '20/20' : '0/20'} Checks</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--med-blue)', width: currentChecklist.preInductionStatus === 'completed' ? '100%' : '0%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span>Pre-Procedure Time-Out</span>
                <strong>{currentChecklist.timeoutStatus === 'completed' ? '12/12' : '0/12'} Checks</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--med-blue)', width: currentChecklist.timeoutStatus === 'completed' ? '100%' : '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setView('pre-anesthesia')} style={{ padding: '16px', flexDirection: 'column', fontSize: '0.8125rem' }}>
              📝 Pre-Anaesthesia Checklist
            </button>
            <button className="btn btn-secondary" onClick={() => setView('machine-check')} style={{ padding: '16px', flexDirection: 'column', fontSize: '0.8125rem' }}>
              🔧 Machine Check
            </button>
            <button className="btn btn-secondary" onClick={() => setView('pre-induction')} style={{ padding: '16px', flexDirection: 'column', fontSize: '0.8125rem' }}>
              ⚡ Pre-Induction Gate
            </button>
            <button className="btn btn-secondary" onClick={() => setView('timeout')} style={{ padding: '16px', flexDirection: 'column', fontSize: '0.8125rem' }}>
              👥 Perform Time-Out
            </button>
            <button className="btn btn-secondary" onClick={() => setView('report-incident')} style={{ padding: '16px', flexDirection: 'column', fontSize: '0.8125rem', gridColumn: 'span 2' }}>
              🚨 Report New Incident
            </button>
          </div>
        </div>
      </div>

      {/* Cases Requiring Attention Table */}
      <div className="glass" style={{ padding: '24px' }}>
        <h3 className="card-title">Cases Requiring Attention</h3>
        <div className="table-responsive" style={{ marginTop: '12px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Procedure</th>
                <th>OT Room</th>
                <th>Current Stage</th>
                <th>Checklist Status</th>
                <th>Outstanding Items</th>
                <th>Responsible Clinician</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>P001</strong> (Robert Miller)</td>
                <td>Laparoscopic Prostatectomy</td>
                <td>OR-01</td>
                <td><span className="badge badge-info">Machine Check</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>92.8% Completed</span>
                  </div>
                </td>
                <td><span style={{ color: 'var(--med-orange)', fontWeight: 600 }}>⚠ 1 required item</span></td>
                <td>Dr. Sarah Jenkins</td>
                <td>
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setView('machine-check')}>
                    Resolve
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>P003</strong> (Liam Chen)</td>
                <td>Tonsillectomy</td>
                <td>OR-02</td>
                <td><span className="badge badge-warning">Pre-op Eval</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>0% Completed</span>
                  </div>
                </td>
                <td><span style={{ color: 'var(--med-red)', fontWeight: 600 }}>⚠ 16 items pending</span></td>
                <td>Dr. Alex Rivera</td>
                <td>
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setView('pre-anesthesia')}>
                    Evaluate
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
