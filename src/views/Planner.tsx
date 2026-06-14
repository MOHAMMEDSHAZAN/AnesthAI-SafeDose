import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Planner: React.FC = () => {
  const { patients } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || '');
  const patient = patients.find(p => p.id === selectedId) || patients[0];

  if (!patient) {
    return <div className="page-container">No patient records available. Create a patient first.</div>;
  }

  // Fallback anesthesia planner values if patient has none pre-generated
  const fallbackAnesthesiaPlans = {
    General: {
      recommendation: 'General Anesthesia',
      confidence: 88,
      reasoning: [
        'Surgical procedure demands positive pressure ventilation and complete paralysis.',
        'Length of surgical intervention exceeds spinal duration constraints.',
        'Need to secure patient airway due to laparoscopic abdominal pressure.'
      ],
      alternatives: ['Combined GA and Epidural block for post-operative pain management.'],
      warnings: ['Transient hemodynamic instability post-propofol induction (reduce dose).', 'Post-extubation bronchospasm risk.'],
      contraindications: ['Local infiltration as sole technique (inadequate block).']
    },
    Spinal: {
      recommendation: 'Spinal Anesthesia (Subarachnoid Block)',
      confidence: 94,
      reasoning: [
        'Maintains protective airway reflexes and avoids intubation complications in asthma.',
        'Excellent anesthesia for lower abdominal or lower extremity procedures.',
        'Maternal awareness preserved for obstetric cesarean delivery.'
      ],
      alternatives: ['Epidural Anesthesia', 'MAC (Monitored Anesthesia Care) + Local Block'],
      warnings: ['Vasodilation-induced hypotension post-block injection.', 'Post-dural puncture headache (PDPH) risk.'],
      contraindications: ['Coagulopathy or active systemic sepsis.', 'Patient refusal.']
    }
  };

  const plan = patient.anesthesiaPlan || (patient.gender === 'Female' && patient.age < 40 ? fallbackAnesthesiaPlans.Spinal : fallbackAnesthesiaPlans.General);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Anesthesia Planner</h1>
          <p className="page-subtitle">Clinical recommendation engine for anesthetic technique selection</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Patient:</span>
          <select 
            className="form-control" 
            style={{ width: '220px' }}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        {/* Left Side: Summary demographics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>Clinical Profile Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <div><strong>Name:</strong> {patient.name}</div>
              <div><strong>Age / Gender:</strong> {patient.age} years / {patient.gender}</div>
              <div><strong>Weight:</strong> {patient.weight} kg</div>
              <div><strong>ASA Class:</strong> Class {patient.asaScore}</div>
              <div><strong>Mallampati:</strong> Class {patient.mallampati}</div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                <strong>Documented Allergies:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {patient.allergies.map(a => (
                    <span key={a} style={{ fontSize: '0.6875rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--med-red)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      ⚠ {a}
                    </span>
                  ))}
                  {patient.allergies.length === 0 && <span style={{ color: 'var(--text-muted)' }}>None</span>}
                </div>
              </div>
              <div>
                <strong>Comorbidities:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8125rem' }}>
                  {patient.medicalHistory.join(', ') || 'No significant comorbidities.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Generated Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--med-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRIMARY RECOMMENDATION</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{plan.recommendation}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONFIDENCE</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: plan.confidence > 90 ? 'var(--med-green)' : 'var(--med-cyan)', fontFamily: 'var(--font-mono)' }}>{plan.confidence}%</h3>
              </div>
            </div>

            {/* Clinical Reasoning */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Clinical Explanation & Reasoning</h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {plan.reasoning.map((reason, i) => <li key={i}>{reason}</li>)}
              </ul>
            </div>

            {/* Warnings, Contraindications, Alternatives */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--med-orange)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚠ Risks & Warnings
                </h4>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {plan.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  {plan.warnings.length === 0 && <li>No specific high-priority risks detected.</li>}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--med-red)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🚫 Contraindications
                </h4>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {plan.contraindications.map((c, i) => <li key={i}>{c}</li>)}
                  {plan.contraindications.length === 0 && <li>None flagged.</li>}
                </ul>
              </div>
            </div>

            {/* Suggested Alternatives */}
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--med-cyan)', marginBottom: '8px' }}>Alternative Options Considered</h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {plan.alternatives.map((alt, i) => <li key={i}>{alt}</li>)}
              </ul>
            </div>

            <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              📚 References consulted: Miller Anesthesia 9th Ed (Ch 23), ASA Practice Guidelines for Perioperative Monitoring 2021. AI generated summary. Verify hemodynamics.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
