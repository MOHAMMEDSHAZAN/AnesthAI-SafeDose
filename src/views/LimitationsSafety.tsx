import React from 'react';

export const LimitationsSafety: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
        Limitations, Safety Declarations & Regulatory Disclosure
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Crucial clinical safety boundaries, decision-support restrictions, and non-autonomous operational rules.
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>

        {/* 1. Research Prototype Disclosure */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>
            1. Research Prototype Status
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            Anesth AI is an academic perioperative clinical decision-support <strong>research prototype</strong>. It has not received formal regulatory clearance (such as US FDA 510(k), EU MDR certification, or CDSCO approval) for autonomous medical diagnosis or treatment prescribing. Further institutional security assessments, clinical trials, and formal regulatory validation are required prior to real-world deployment in patient care settings.
          </p>
        </div>

        {/* 2. Clinician-in-the-Loop Requirement */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>
            2. Mandatory Clinician-in-the-Loop
          </h3>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', paddingLeft: '20px' }}>
            <li><strong>No Autonomous Drug Administration:</strong> All calculated medication doses represent advisory mathematical reference estimates and require explicit verification and manual administration by a licensed clinician.</li>
            <li><strong>No Autonomous Fluid Infusion:</strong> Fluid maintenance recommendations and blood product transfusion prompts are purely decision-support alerts.</li>
            <li><strong>No Autonomous Ventilator/Anesthesia Changes:</strong> Volatile anesthetic delivery, tidal volume settings, and PEEP adjustments remain under direct manual control of the attending anesthesiologist.</li>
            <li><strong>Clinician Confirmation of ASA Status:</strong> ASA Physical Status classification must be selected and confirmed by the attending clinician; AI does not autonomously assign ASA grades.</li>
          </ul>
        </div>

        {/* 3. Standardized Terminology Guidelines */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>
            3. Standardized Clinical Safety Language
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            To avoid dangerous over-reliance or false reassurance, Anesth AI strictly enforces standardized risk terminology:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ color: 'var(--med-red)', fontWeight: 'bold', marginBottom: '6px' }}>PROHIBITED TERMINOLOGY</div>
              <ul style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '16px', lineHeight: 1.6 }}>
                <li>"Patient is safe"</li>
                <li>"Clinically proven"</li>
                <li>"Guaranteed safe dose"</li>
                <li>"Autonomous treatment"</li>
                <li>"Patient will become hypotensive"</li>
              </ul>
            </div>
            <div style={{ backgroundColor: 'rgba(5, 150, 82, 0.08)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(5, 150, 82, 0.25)' }}>
              <div style={{ color: 'var(--med-green)', fontWeight: 'bold', marginBottom: '6px' }}>APPROVED STANDARD PHRASES</div>
              <ul style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '16px', lineHeight: 1.6 }}>
                <li>"Model-estimated risk"</li>
                <li>"Requires clinician review"</li>
                <li>"Monitoring status: No configured alerts currently triggered"</li>
                <li>"Benchmark evaluation"</li>
                <li>"Clinician confirmed"</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
