import React from 'react';
import { useApp } from '../context/AppContext';
import { getSyntheticDashboardMetrics } from '../data/syntheticDemoData';

interface DashboardProps {
  setView: (view: string) => void;
  onEmergencyTrigger: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView, onEmergencyTrigger }) => {
  const { patients, operatingRooms, notifications } = useApp();
  const metrics = getSyntheticDashboardMetrics(patients as any, operatingRooms as any);

  const criticalAlerts = notifications.filter(n => !n.dismissed && n.type === 'critical');
  const drugAlerts = notifications.filter(n => !n.dismissed && n.type === 'warning');

  return (
    <div className="page-container">
      {/* Research & Clinical Decision-Support Banner */}
      <div className="prototype-advisory-banner">
        <span>
          <strong>ANESTH AI</strong> • <strong>RESEARCH PROTOTYPE</strong> • Synthetic Demonstration Dataset (SD-2026-XXXX). Clinical decision-support demonstration only; not cleared for standalone primary diagnostic or treatment use. Requires clinician review.
        </span>
        <span className="badge badge-info">SIMULATION ACTIVE</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Anesth AI Command Center</h1>
          <p className="page-subtitle">Real-time perioperative telemetry & clinical safety decision support</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setView('patients')}>
            View Patient Database
          </button>
          <button className="btn btn-danger" onClick={onEmergencyTrigger}>
            🚨 Trigger Crisis Mode
          </button>
        </div>
      </div>

      {/* Clinical Telemetry Monitor Cards */}
      <div className="monitor-grid">
        <div className="monitor-card glass monitor-cyan">
          <div className="monitor-header">
            <span className="monitor-label">ACTIVE OPERATING SUITES</span>
            <span style={{ fontSize: '0.875rem' }}>Live OT</span>
          </div>
          <div className="monitor-value">
            {metrics.activeORs} <span className="monitor-unit">/ {operatingRooms.length}</span>
          </div>
          <div className="monitor-trend" style={{ color: 'var(--med-green)' }}>
            ✓ Ventilators & infusions streaming
          </div>
        </div>

        <div className="monitor-card glass monitor-blue">
          <div className="monitor-header">
            <span className="monitor-label">PACU RECOVERY OCCUPANCY</span>
            <span style={{ fontSize: '0.875rem' }}>Step-down</span>
          </div>
          <div className="monitor-value">
            {metrics.pacuOccupancyBeds} <span className="monitor-unit">/ {metrics.totalPACUBeds} beds</span>
          </div>
          <div className="monitor-trend" style={{ color: 'var(--med-orange)' }}>
            ⚠ 1 synthetic patient ready for Aldrete evaluation
          </div>
        </div>

        <div className="monitor-card glass monitor-red">
          <div className="monitor-header">
            <span className="monitor-label">CONFIGURED CRITICAL ALERTS</span>
            <span style={{ fontSize: '0.875rem' }}>Active</span>
          </div>
          <div className="monitor-value" style={{ color: criticalAlerts.length > 0 ? 'var(--med-red)' : 'var(--med-green)' }}>
            {criticalAlerts.length}
          </div>
          <div className="monitor-trend">
            {criticalAlerts.length > 0 ? '⚠ Requires immediate clinician review' : '✓ Monitoring status: No configured alerts currently triggered'}
          </div>
        </div>

        <div className="monitor-card glass monitor-orange">
          <div className="monitor-header">
            <span className="monitor-label">HIGH-RISK CASES (ASA III+)</span>
            <span style={{ fontSize: '0.875rem' }}>Complex</span>
          </div>
          <div className="monitor-value">
            {metrics.highRiskReview}
          </div>
          <div className="monitor-trend" style={{ color: 'var(--med-cyan)' }}>
            1 arterial line protocol active
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout Grid */}
      <div className="dashboard-grid">
        {/* Left Side: OR Statuses and Schedules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* Active Operating Rooms */}
          <div className="glass" style={{ padding: '20px', minWidth: 0 }}>
            <h2 className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--med-cyan)' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Active Surgical Operating Rooms
            </h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Operating Room</th>
                    <th>Patient (Synthetic)</th>
                    <th>Attending Anesthesiologist</th>
                    <th>Procedure</th>
                    <th>Elapsed</th>
                    <th>SpO2</th>
                    <th>HR</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {operatingRooms.map(or => {
                    const patient = patients.find(p => p.id === or.patientId);
                    return (
                      <tr key={or.id}>
                        <td style={{ fontWeight: 700 }}>{or.name}</td>
                        <td>
                          {patient ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>{patient.name}</div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{patient.id} • ASA {patient.asaScore}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Empty (Idle)</span>
                          )}
                        </td>
                        <td>{or.anesthesiologist}</td>
                        <td>{or.surgeryName}</td>
                        <td>{(or.status === 'Active' || or.status === 'Emergency') ? `${or.elapsedTime ?? (or as any).elapsedTimeMin ?? 0}m` : 'N/A'}</td>
                        <td>
                          {or.currentVitals ? (
                            <span style={{ color: or.currentVitals.spo2 < 92 ? 'var(--med-red)' : 'var(--med-cyan)', fontWeight: 700 }}>
                              {or.currentVitals.spo2}%
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {or.currentVitals ? (
                            <span style={{ color: or.currentVitals.hr > 100 || or.currentVitals.hr < 55 ? 'var(--med-orange)' : 'var(--med-green)', fontWeight: 700 }}>
                              {or.currentVitals.hr}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {or.status === 'Active' ? (
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setView('liveot')}>
                              Join Feed
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Standby</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Launcher Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="glass" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setView('preoperative')}>
              <div style={{ color: 'var(--med-blue)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '4px' }}>📝 Pre-Op PAC Evaluation</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ASA classification & PONV risk</p>
            </div>
            <div className="glass" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setView('drugcalc')}>
              <div style={{ color: 'var(--med-green)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '4px' }}>💊 Dosing Calculator</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weight & age based limits</p>
            </div>
            <div className="glass" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setView('airway')}>
              <div style={{ color: 'var(--med-cyan)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '4px' }}>📐 Airway Assessor</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LMA & ETT tube calculations</p>
            </div>
            <div className="glass" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setView('student')}>
              <div style={{ color: 'var(--med-orange)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '4px' }}>🎓 Education Hub</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clinical scenarios & quizzes</p>
            </div>
          </div>
        </div>

        {/* Right Side: Alerts Feed and AI Assistant Recommender */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* Active Drug Alerts */}
          <div className="glass" style={{ padding: '20px', minWidth: 0 }}>
            <h2 className="card-title" style={{ color: 'var(--med-orange)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Safety & Interaction Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {drugAlerts.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Monitoring status: No configured alerts currently triggered.</p>
              ) : (
                drugAlerts.map(a => (
                  <div key={a.id} style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--med-orange)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--med-orange)' }}>
                      <span>{a.title}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{a.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Clinical Recommendations Panel */}
          <div className="glass" style={{ padding: '20px', minWidth: 0 }}>
            <h2 className="card-title" style={{ color: 'var(--med-blue)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l-7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              AI Clinical Decision Support
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8125rem' }}>
              <div style={{ padding: '10px', backgroundColor: 'rgba(0, 102, 255, 0.04)', borderLeft: '3px solid var(--med-blue)', borderRadius: '4px' }}>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Model-Estimated Hypotension Risk (OR-03)</strong>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Synthetic Patient Rahul Sharma (SD-2026-0003): Model-estimated risk probability 62% for mean arterial pressure drift &lt; 65 mmHg. Preemptive phenylephrine titration ready. Requires clinician review.
                </span>
              </div>
              
              <div style={{ padding: '10px', backgroundColor: 'rgba(0, 184, 148, 0.04)', borderLeft: '3px solid var(--med-green)', borderRadius: '4px' }}>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>PONV Prophylaxis Protocol (Priya Nair, SD-2026-0002)</strong>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Apfel score 3/4 (Female, non-smoker, laparoscopy). Clinical protocol suggests multimodal prophylaxis (Dexamethasone 4mg IV post-induction + Ondansetron 4mg IV prior to emergence).
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
