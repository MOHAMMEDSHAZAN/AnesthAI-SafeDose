import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Postoperative: React.FC = () => {
  const { patients } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || '');
  const patient = patients.find(p => p.id === selectedId) || patients[0];

  // PCA States
  const [pcaDrug, setPcaDrug] = useState<'Morphine' | 'Fentanyl' | 'Hydromorphone'>('Morphine');
  const [basalRate, setBasalRate] = useState<number>(0.5); // mg/hr or mcg/hr
  const [demandBolus, setDemandBolus] = useState<number>(1.0); // mg or mcg
  const [lockoutInterval, setLockoutInterval] = useState<number>(8); // minutes
  const [fourHourLimit, setFourHourLimit] = useState<number>(10);

  // Follow-up notes
  const [followUpNotes, setFollowUpNotes] = useState('Patient alert, verbalizing mild surgical pain (VAS 3). Lungs clear, voided spontaneously. Wound dressing dry and intact. No active PONV.');

  if (!patient) {
    return <div className="page-container">No patient records available. Create a patient first.</div>;
  }

  const handleApplyPCA = () => {
    alert(`PCA settings configured successfully for ${patient.name}:\nDrug: ${pcaDrug}\nBasal Rate: ${basalRate}\nDemand: ${demandBolus}\nLockout: ${lockoutInterval} mins`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Postoperative Module</h1>
          <p className="page-subtitle">Configure Patient-Controlled Analgesia (PCA) and formulate formal discharge summaries</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Patient:</span>
          <select 
            className="role-selector" 
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        {/* Left column: PCA Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px', color: 'var(--med-cyan)' }}>
              📟 Patient-Controlled Analgesia (PCA)
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleApplyPCA(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Infusion Drug Select</label>
                <select 
                  className="form-control"
                  value={pcaDrug}
                  onChange={(e) => setPcaDrug(e.target.value as any)}
                >
                  <option value="Morphine">Morphine (1 mg/mL)</option>
                  <option value="Fentanyl">Fentanyl (10 mcg/mL)</option>
                  <option value="Hydromorphone">Hydromorphone (0.2 mg/mL)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Basal Rate ({pcaDrug === 'Fentanyl' ? 'mcg/hr' : 'mg/hr'})</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={basalRate}
                    onChange={(e) => setBasalRate(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Demand Bolus ({pcaDrug === 'Fentanyl' ? 'mcg' : 'mg'})</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={demandBolus}
                    onChange={(e) => setDemandBolus(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Lockout (Minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={lockoutInterval}
                    onChange={(e) => setLockoutInterval(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">4-Hour Max Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={fourHourLimit}
                    onChange={(e) => setFourHourLimit(Number(e.target.value))}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Deploy PCA Syringe Pump
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Discharge Summary Generator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Formal Discharge & Ward Transition Notes</h3>
            
            <div className="form-group">
              <label className="form-label">Follow-up Notes & Status Details</label>
              <textarea 
                className="form-control"
                rows={5}
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                style={{ resize: 'none', lineHeight: '1.5' }}
              />
            </div>

            {/* Structured Report Preview */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', marginTop: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>DISCHARGE SUMMARY REPORT</span>
                <span style={{ color: 'var(--med-cyan)' }}>FHIR / HL7 COMPLIANT</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Patient Name:</strong> {patient.name} ({patient.id})</div>
                <div><strong>Age / Gender:</strong> {patient.age} / {patient.gender}</div>
                <div><strong>Anesthetic Tech:</strong> {patient.anesthesiaPlan?.recommendation || 'General Anesthesia'}</div>
                <div><strong>Intraoperative Fluids:</strong> crystalloids balance secure</div>
                <div><strong>PCA Regimen:</strong> {pcaDrug} active (Basal: {basalRate}, Lockout: {lockoutInterval} mins)</div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <strong>Clinician Summary Note:</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>{followUpNotes}</p>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-secondary" 
              onClick={() => alert("HL7 / FHIR data transmission completed successfully!")}
              style={{ width: '100%', marginTop: '20px' }}
            >
              ✓ Send HL7 Transition Message to Ward EMR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
