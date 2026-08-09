import React, { useState } from 'react';
import { useApp, type AnesthesiaIncident } from '../context/AppContext';

interface IncidentReportsProps {
  setView: (v: string) => void;
}

export const IncidentReports: React.FC<IncidentReportsProps> = ({ setView }) => {
  const { incidents, updateIncidentStatus } = useApp();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // States for follow-up inputs
  const [reviewer, setReviewer] = useState('Dr. Sarah Jenkins');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [notes, setNotes] = useState('');

  const selected = incidents.find(i => i.id === selectedIncidentId);

  const handleUpdateStatus = (status: AnesthesiaIncident['followupStatus']) => {
    if (!selectedIncidentId) return;
    updateIncidentStatus(selectedIncidentId, {
      followupStatus: status,
      reviewer,
      reviewerDate: new Date().toISOString().split('T')[0],
      correctiveAction,
      preventiveAction,
      followupNotes: notes
    });
    alert(`Incident status updated to: ${status}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incident Reports Manager</h1>
          <p className="page-subtitle">Track, investigate, and review documented safety events</p>
        </div>
        <div>
          <button className="btn btn-secondary" onClick={() => setView('safety-overview')}>
            Back to Safety Overview
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1.2fr 1fr' : '1fr', gap: '24px' }}>
        
        {/* Left Column: Reports List */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Documented Incidents</h3>
          
          <div className="table-responsive" style={{ marginTop: '16px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Case ID</th>
                  <th>Severity</th>
                  <th>Preventable</th>
                  <th>Follow-up Status</th>
                  <th>Report Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => {
                  let badge = 'badge-info';
                  if (inc.severity === 'severe_harm' || inc.severity === 'death') badge = 'badge-danger';
                  else if (inc.severity === 'moderate_harm') badge = 'badge-warning';

                  return (
                    <tr key={inc.id} style={{ background: selectedIncidentId === inc.id ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                      <td><strong style={{ color: 'var(--med-cyan)' }}>{inc.id}</strong></td>
                      <td>{inc.caseId}</td>
                      <td><span className={`badge ${badge}`}>{inc.severity.replace('_', ' ').toUpperCase()}</span></td>
                      <td>{inc.preventable?.toUpperCase()}</td>
                      <td>
                        <span className={`badge ${inc.followupStatus === 'closed' || inc.followupStatus === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                          {inc.followupStatus?.toUpperCase()}
                        </span>
                      </td>
                      <td>{inc.createdAt ? new Date(inc.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => {
                          setSelectedIncidentId(inc.id || null);
                          setCorrectiveAction(inc.correctiveAction || '');
                          setPreventiveAction(inc.preventiveAction || '');
                          setNotes(inc.followupNotes || '');
                          setReviewer(inc.reviewer || 'Dr. Sarah Jenkins');
                        }}>
                          Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {incidents.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No incidents have been logged yet. Click "Report Incident" to file a report.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Details & Follow-up (displays if selected) */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Incident Details Card */}
            <div className="glass" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>Incident Details: {selected.id}</h3>
                <button className="icon-btn" onClick={() => setSelectedIncidentId(null)} title="Close Panel">✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
                <div>
                  <span className="text-muted">Narrative Description:</span>
                  <p style={{ marginTop: '4px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', lineHeight: 1.4 }}>
                    {selected.narrative}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span className="text-muted">Event Severity:</span>
                    <strong style={{ display: 'block', marginTop: '2px' }}>{selected.severity?.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Patient Preventable:</span>
                    <strong style={{ display: 'block', marginTop: '2px' }}>{selected.preventable?.toUpperCase()}</strong>
                  </div>
                </div>

                {selected.categories && selected.categories.length > 0 && (
                  <div>
                    <span className="text-muted">Event Categories:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {selected.categories.map((c, i) => (
                        <span key={i} className="badge badge-info" style={{ fontSize: '0.65rem' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.contributingFactors && selected.contributingFactors.length > 0 && (
                  <div>
                    <span className="text-muted">Contributing Factors:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {selected.contributingFactors.map((c, i) => (
                        <span key={i} className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up & Reviewer Sign-off Form */}
            <div className="glass" style={{ padding: '24px', border: '1px solid var(--border-color-glow)' }}>
              <h3 className="card-title">Incident Investigation & Follow-up</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Reviewer Name</label>
                  <input type="text" className="form-control" value={reviewer} onChange={e => setReviewer(e.target.value)} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Corrective Action Taken</label>
                  <textarea className="form-control" rows={2} value={correctiveAction} onChange={e => setCorrectiveAction(e.target.value)} placeholder="Immediate corrective actions implemented..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Preventive Action Plan</label>
                  <textarea className="form-control" rows={2} value={preventiveAction} onChange={e => setPreventiveAction(e.target.value)} placeholder="Long-term protocols adjusted to prevent reoccurrence..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Investigation Notes</label>
                  <textarea className="form-control" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleUpdateStatus('review')}>
                    Under Review
                  </button>
                  <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleUpdateStatus('resolved')}>
                    Resolve Case
                  </button>
                  <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleUpdateStatus('closed')}>
                    Close Case
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
