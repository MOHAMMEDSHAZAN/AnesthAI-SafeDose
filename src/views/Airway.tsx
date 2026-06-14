import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const Airway: React.FC = () => {
  const { patients } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || '');
  const patient = patients.find(p => p.id === selectedId) || patients[0];

  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(45);
  const [mallampati, setMallampati] = useState<1 | 2 | 3 | 4>(2);
  const [cormackGrade, setCormackGrade] = useState<1 | 2 | 3 | 4>(1);

  // Difficult Airway Checklist algorithm states
  const [checklist, setChecklist] = useState({
    oxygenationOptimized: false,
    backupPlanReady: false,
    videoLaryngoscopeAtHand: false,
    bougiePrepped: false,
    surgicalAirwayKitInRoom: false
  });

  // Sync weight/age/mallampati from patient
  useEffect(() => {
    if (patient) {
      setWeight(patient.weight);
      setAge(patient.age);
      setMallampati(patient.mallampati);
    }
  }, [selectedId, patient]);

  // ETT Size calculations
  const calculateETT = () => {
    if (age < 1) {
      return { sizeCuffed: '3.0 - 3.5', sizeUncuffed: '3.0', lengthOral: '10 - 11 cm' };
    }
    if (age < 12) {
      const uncuffed = (age / 4) + 4;
      const cuffed = (age / 4) + 3.5;
      const len = (age / 2) + 12;
      return { 
        sizeCuffed: cuffed.toFixed(1), 
        sizeUncuffed: uncuffed.toFixed(1), 
        lengthOral: `${Math.round(len)} cm` 
      };
    }
    // Adult
    if (patient && patient.gender === 'Female') {
      return { sizeCuffed: '7.0 - 7.5', sizeUncuffed: 'N/A', lengthOral: '20 - 21 cm' };
    }
    return { sizeCuffed: '7.5 - 8.0', sizeUncuffed: 'N/A', lengthOral: '21 - 22 cm' };
  };

  // LMA Size calculation based on weight range
  const calculateLMA = () => {
    if (weight < 5) return { size: '1', volume: 'up to 4 mL' };
    if (weight < 10) return { size: '1.5', volume: 'up to 7 mL' };
    if (weight < 20) return { size: '2', volume: 'up to 10 mL' };
    if (weight < 30) return { size: '2.5', volume: 'up to 14 mL' };
    if (weight < 50) return { size: '3', volume: 'up to 20 mL' };
    if (weight < 70) return { size: '4', volume: 'up to 30 mL' };
    if (weight < 100) return { size: '5', volume: 'up to 40 mL' };
    return { size: '6', volume: 'up to 50 mL' };
  };

  const ett = calculateETT();
  const lma = calculateLMA();

  const handleToggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [prediction, setPrediction] = useState<{
    riskCategory: string;
    action: string;
    reasoning: string;
    prob: number;
  } | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch('http://localhost:8000/predict/Airway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features: {
              Mallampati: mallampati,
              Age: age,
              Weight: weight,
              bmi: Math.round(weight / (1.75 ** 2)),
              neckMobility: 'Normal'
            }
          })
        });
        if (response.ok) {
          const data = await response.json();
          setPrediction({
            riskCategory: data.risk_category,
            action: data.recommended_action,
            reasoning: data.clinical_reasoning,
            prob: data.probability
          });
        }
      } catch (err) {
        console.warn("Failed fetching airway prediction, using local heuristic fallback.");
      }
    };
    fetchPrediction();
  }, [mallampati, weight, age]);

  const isDifficultAirway = prediction ? prediction.riskCategory === 'High Risk' : (mallampati >= 3 || cormackGrade >= 3);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Airway Assessment & Tube Sizing</h1>
          <p className="page-subtitle">Sizing calculations for intubation devices and difficult airway safety checklists</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Side: Calculations and Assessments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sizing Results Card */}
          <div className="glass" style={{ padding: '20px', borderLeft: `4px solid ${isDifficultAirway ? 'var(--med-orange)' : 'var(--med-cyan)'}` }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Device Sizing Recommendations</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suggested ETT Size (Cuffed)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--med-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ID {ett.sizeCuffed}
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Oral Placement: {ett.lengthOral}</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suggested LMA Size</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--med-blue)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  LMA {lma.size}
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Max Cuff Volume: {lma.volume}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>Suggested Blade Selection:</strong> {age < 2 ? 'Miller 1 or 2 (Straight)' : age < 8 ? 'Macintosh 2 (Curved)' : 'Macintosh 3 or 4 (Curved)'}
            </div>
          </div>

          {/* Visual Airway Classifications */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Airway Classification Inputs</h3>
            
            <div className="form-group">
              <label className="form-label">Mallampati Score (Visual Oropharynx)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    className="btn"
                    onClick={() => setMallampati(num as any)}
                    style={{
                      background: mallampati === num ? 'rgba(0,102,255,0.15)' : 'rgba(255,255,255,0.02)',
                      border: mallampati === num ? '1px solid var(--med-blue)' : '1px solid var(--border-color)',
                      color: mallampati === num ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      padding: '8px'
                    }}
                  >
                    Class {num}
                    <div style={{ fontSize: '0.55rem', marginTop: '2px', textTransform: 'none', color: 'var(--text-muted)' }}>
                      {num === 1 ? 'Full Tonsils' : num === 2 ? 'Uvula Clear' : num === 3 ? 'Base Only' : 'Hard Palate'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Cormack-Lehane Grade (Direct Laryngoscopy View)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    className="btn"
                    onClick={() => setCormackGrade(num as any)}
                    style={{
                      background: cormackGrade === num ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)',
                      border: cormackGrade === num ? '1px solid var(--med-orange)' : '1px solid var(--border-color)',
                      color: cormackGrade === num ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      padding: '8px'
                    }}
                  >
                    Grade {num}
                    <div style={{ fontSize: '0.55rem', marginTop: '2px', textTransform: 'none', color: 'var(--text-muted)' }}>
                      {num === 1 ? 'Full Vocal' : num === 2 ? 'Posterior' : num === 3 ? 'Epiglottis Only' : 'No Epiglottis'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Difficult Airway Algorithm Flowchart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px', border: isDifficultAirway ? '1px dashed var(--med-red)' : '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: isDifficultAirway ? 'var(--med-red)' : 'var(--text-primary)' }}>
                {isDifficultAirway ? '🚫 DIFFICULT AIRWAY ALGORITHM ACTIVE' : '✓ ASA Routine Airway Checklist'}
              </h3>
              <span className={`badge ${isDifficultAirway ? 'badge-danger' : 'badge-success'}`}>
                {isDifficultAirway ? 'Caution' : 'Routine'}
              </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              Follow standard ASA safety checks. For scores III/IV or Grade 3/4, ensure rescue ventilation devices are immediately available at the bedside.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div 
                className={`checklist-item ${checklist.oxygenationOptimized ? 'checked' : ''}`}
                onClick={() => handleToggleCheck('oxygenationOptimized')}
              >
                <span>1. Optimize pre-oxygenation (High-flow nasal cannula or 100% O2 facemask)</span>
              </div>

              <div 
                className={`checklist-item ${checklist.videoLaryngoscopeAtHand ? 'checked' : ''}`}
                onClick={() => handleToggleCheck('videoLaryngoscopeAtHand')}
              >
                <span>2. Video Laryngoscope plugged in and at bedside</span>
              </div>

              <div 
                className={`checklist-item ${checklist.bougiePrepped ? 'checked' : ''}`}
                onClick={() => handleToggleCheck('bougiePrepped')}
              >
                <span>3. Introduce Bougie or Stylet into ETT</span>
              </div>

              <div 
                className={`checklist-item ${checklist.backupPlanReady ? 'checked' : ''}`}
                onClick={() => handleToggleCheck('backupPlanReady')}
              >
                <span>4. Select backup LMA (Plan B) ready for rescue ventilation</span>
              </div>

              <div 
                className={`checklist-item ${checklist.surgicalAirwayKitInRoom ? 'checked' : ''}`}
                onClick={() => handleToggleCheck('surgicalAirwayKitInRoom')}
              >
                <span style={{ color: isDifficultAirway && !checklist.surgicalAirwayKitInRoom ? 'var(--med-red)' : 'inherit', fontWeight: isDifficultAirway ? 700 : 400 }}>
                  5. Front-of-Neck Surgical Airway Kit in operating room (Plan D)
                </span>
              </div>
            </div>

            {isDifficultAirway && !checklist.surgicalAirwayKitInRoom && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '4px', borderLeft: '4px solid var(--med-red)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                <strong>ALERT:</strong> Patient has a Mallampati {mallampati} rating. Do not induce anesthesia until Plan D surgical airway options are confirmed present in the room.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
