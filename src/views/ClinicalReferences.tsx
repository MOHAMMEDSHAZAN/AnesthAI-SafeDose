import React from 'react';

export const ClinicalReferences: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
        Clinical & Technical References
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Peer-reviewed literature, clinical practice guidelines, and open benchmark dataset references.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>
            1. ASA Physical Status Classification System
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            American Society of Anesthesiologists (ASA) House of Delegates. <em>ASA Physical Status Classification System.</em> Last amended October 2020. ASA Committee on Economics.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>
            2. VitalDB Biosignal & Clinical Dataset
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Lee HC, Park Y, Yoon SB, et al. <em>VitalDB, a high-fidelity open dataset in perioperative medicine.</em> Sci Data. 2022;9(1):278. DOI: 10.1038/s41597-022-01411-5.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>
            3. MIMIC-IV Clinical & Emergency Department Database
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Johnson AEW, Pollard TJ, Shen L, et al. <em>MIMIC-IV, a freely accessible electronic health record dataset.</em> Sci Data. 2023;10(1):1. DOI: 10.1038/s41597-022-01899-7.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>
            4. Intraoperative Fluid Management Physiology (4-2-1 Rule)
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Holliday MA, Segar WE. <em>The maintenance need for water in parenteral fluid therapy.</em> Pediatrics. 1957;19(5):823-832.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>
            5. Explainable AI & SHAP Feature Contributions
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Lundberg SM, Lee SI. <em>A unified approach to interpreting model predictions.</em> Advances in Neural Information Processing Systems (NeurIPS). 2017;30:4765-4774.
          </p>
        </div>

      </div>
    </div>
  );
};
