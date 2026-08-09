import React from 'react';
import { useApp } from '../context/AppContext';

export const SafetyAnalytics: React.FC = () => {
  const { incidents, checklists } = useApp();

  const totalIncidentsCount = incidents.length;

  // Compute metrics dynamically from checklist array
  const totalChecklists = checklists.length;
  const completedChecklistsCount = checklists.filter(c => c.completedChecks === c.totalChecks).length;
  const complianceRate = totalChecklists > 0 ? Math.round((completedChecklistsCount / totalChecklists) * 100) : 100;

  // Slices of categories
  const airwayIncidents = incidents.filter(i => i.categories?.some(c => c.toLowerCase().includes('airway') || c.toLowerCase().includes('intubation') || c.toLowerCase().includes('desaturation'))).length;
  const cardiovascularIncidents = incidents.filter(i => i.categories?.some(c => c.toLowerCase().includes('cardio') || c.toLowerCase().includes('hypotension') || c.toLowerCase().includes('bradycardia'))).length;
  const medicationIncidents = incidents.filter(i => i.categories?.some(c => c.toLowerCase().includes('medication') || c.toLowerCase().includes('dose') || c.toLowerCase().includes('allergy'))).length;
  const equipmentIncidents = incidents.filter(i => i.categories?.some(c => c.toLowerCase().includes('equipment') || c.toLowerCase().includes('device'))).length;

  const nearMisses = incidents.filter(i => i.severity === 'near_miss').length;
  const harmEvents = incidents.filter(i => i.severity !== 'near_miss' && i.severity !== 'no_harm').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Safety & Compliance Analytics</h1>
          <p className="page-subtitle">Hospital audits, checklist compliance, and clinical quality indicators</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Compliance Card */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Checklist Compliance</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '6px solid var(--border-color)',
              borderTopColor: 'var(--med-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--med-cyan)',
              transform: 'rotate(-45deg)'
            }}>
              <span style={{ transform: 'rotate(45deg)' }}>{complianceRate}%</span>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Overall Checklist Compliance Rate
            </span>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>Near Misses: <strong>{nearMisses}</strong></span>
              <span>Harm Events: <strong>{harmEvents}</strong></span>
            </div>
          </div>
        </div>

        {/* Most frequently missed checks */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-title">Audit Log: Most Frequently Missed Checklist Items</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span>Backup Oxygen Confirmation</span>
                <strong>42% of audits</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--med-orange)', width: '42%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span>Recovery monitor assignment</span>
                <strong>35% of audits</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--med-orange)', width: '35%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span>Post-operative analgesia plan missing</span>
                <strong>18% of audits</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--med-cyan)', width: '18%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Safety Incident Categories (Check data availability) */}
      <div className="glass" style={{ padding: '24px' }}>
        <h3 className="card-title">Incident Category Distribution</h3>

        {totalIncidentsCount === 0 ? (
          <div style={{ 
            height: '220px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--text-muted)',
            fontSize: '0.9375rem',
            border: '1.5px dashed var(--border-color)',
            borderRadius: '4px',
            marginTop: '16px'
          }}>
            No sufficient data available. Log a surgical safety incident report first.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '20px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Airway / Desaturation</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--med-cyan)', marginTop: '8px' }}>{airwayIncidents}</h2>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cardiovascular / Hypotension</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--med-red)', marginTop: '8px' }}>{cardiovascularIncidents}</h2>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Medication Errors / ADRs</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--med-orange)', marginTop: '8px' }}>{medicationIncidents}</h2>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Equipment / Workstation</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>{equipmentIncidents}</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
