import React from 'react';

export const DatasetGovernance: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
        Dataset Taxonomy & Data Governance
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Research data provenance, ethics compliance, and data minimization policy for Anesth AI.
      </p>

      {/* Security Governance Alert */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        borderLeft: '4px solid var(--med-orange)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '24px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <strong style={{ color: 'var(--med-orange)' }}>DATA GOVERNANCE NOTICE:</strong> Raw protected health datasets (VitalDB, MIT-BIH, MIMIC-IV v3.1, MIMIC-IV-ED v2.2) are <em>strictly excluded</em> from the public repository and client web applications. All demonstration patients rendered within this application are 100% synthetic research mock profiles.
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>

        {/* Dataset 1: VitalDB */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>1. VitalDB Open Surgical Dataset</h3>
            <span style={{ backgroundColor: 'rgba(2, 132, 199, 0.12)', color: 'var(--med-cyan)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(2, 132, 199, 0.25)' }}>Hemodynamics & Vitals</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            VitalDB is a high-fidelity open surgical dataset containing intraoperative multi-parameter biosignals and discrete clinical observations from non-cardiac surgical procedures at Seoul National University Hospital.
          </p>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>Mapped Production Models:</strong> Hypotension, Hypoxia, Bradycardia, Tachycardia.
          </div>
        </div>

        {/* Dataset 2: MIT-BIH */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>2. MIT-BIH Arrhythmia Database</h3>
            <span style={{ backgroundColor: 'rgba(217, 119, 6, 0.12)', color: 'var(--med-orange)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(217, 119, 6, 0.25)' }}>Electrocardiology</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            The MIT-BIH Arrhythmia Database contains 48 half-hour excerpts of two-channel ambulatory ECG recordings, annotated by cardiologists for arrhythmia classification and ectopy detection.
          </p>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>Mapped Production Models:</strong> Arrhythmia Classifier.
          </div>
        </div>

        {/* Dataset 3: MIMIC-IV */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>3. MIMIC-IV Clinical Database (v3.1)</h3>
            <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(168, 85, 247, 0.25)' }}>Critical Care & Outcomes</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            De-identified electronic health records from Beth Israel Deaconess Medical Center, covering hospital admissions, laboratory telemetry, fluid balances, blood product transfusions, and ICU outcomes.
          </p>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>Mapped Production Models:</strong> Blood Loss, Fluid Recommendation, ICU Admission, Mortality.
          </div>
        </div>

        {/* Dataset 4: MIMIC-IV-ED */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>4. MIMIC-IV Emergency Department (v2.2)</h3>
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--med-red)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.25)' }}>Emergency Triage</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            Emergency department visits dataset containing initial chief complaint, ED vital signs, emergency severity index (ESI), and triage acuity ratings.
          </p>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>Mapped Production Models:</strong> Emergency Severity Classifier.
          </div>
        </div>

      </div>
    </div>
  );
};
