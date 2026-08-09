import React from 'react';
import { useApp } from '../context/AppContext';

export const AuditHistory: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Safety Audit History</h1>
          <p className="page-subtitle">Immutable audit trail of safety checklists, clinical overrides, and incident reviews</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px' }}>
        <h3 className="card-title">Immutable Security Log</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          This log records all critical patient safety actions and is locked from modification.
        </p>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Clinician</th>
                <th>Professional Role</th>
                <th>Action performed</th>
                <th>Target Entity</th>
                <th>Override Details / Reason</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr key={idx}>
                  <td><strong>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</strong></td>
                  <td>{log.userId}</td>
                  <td><span className="badge badge-info">{log.role}</span></td>
                  <td><strong style={{ color: log.action.includes('Override') ? 'var(--med-orange)' : 'inherit' }}>{log.action}</strong></td>
                  <td>{log.entity}</td>
                  <td>{log.reason || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No audit records loaded. Create safety checklists or submit overrides to generate audit trails.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
