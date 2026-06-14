import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const PACU: React.FC = () => {
  const { patients } = useApp();
  const [selectedId, setSelectedId] = useState(patients[1]?.id || patients[0]?.id || '');
  const patient = patients.find(p => p.id === selectedId) || patients[0];

  // Aldrete Parameters state
  const [activity, setActivity] = useState<2 | 1 | 0>(2);
  const [respiration, setRespiration] = useState<2 | 1 | 0>(2);
  const [circulation, setCirculation] = useState<2 | 1 | 0>(2);
  const [consciousness, setConsciousness] = useState<2 | 1 | 0>(1);
  const [o2Sat, setO2Sat] = useState<2 | 1 | 0>(2);

  // Pain / PONV state
  const [painScale, setPainScale] = useState<number>(4);
  const [hasPONV, setHasPONV] = useState(false);
  const [sedationLevel, setSedationLevel] = useState<'Awake' | 'Somnolent' | 'Deeply Sedated'>('Awake');

  if (!patient) {
    return <div className="page-container">No patient records available. Create a patient first.</div>;
  }

  // Calculate Aldrete
  const aldreteScore = activity + respiration + circulation + consciousness + o2Sat;
  const isReady = aldreteScore >= 9 && painScale < 4 && !hasPONV;

  const [aiPrediction, setAiPrediction] = useState<{
    riskCategory: string;
    action: string;
    reasoning: string;
  } | null>(null);

  React.useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch('http://localhost:8000/predict/PACU', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features: {
              los: aldreteScore >= 9 ? 0.5 : 2.5,
              subject_id: 1.0,
              aldrete: aldreteScore,
              pain: painScale,
              ponv: hasPONV ? 1 : 0
            }
          })
        });
        if (response.ok) {
          const data = await response.json();
          setAiPrediction({
            riskCategory: data.risk_category,
            action: data.recommended_action,
            reasoning: data.clinical_reasoning
          });
        }
      } catch (err) {
        console.warn("Failed fetching PACU prediction from API, executing local fallback.");
      }
    };
    fetchPrediction();
  }, [aldreteScore, painScale, hasPONV]);

  // AI predicted remaining minutes
  const getAIRemainingTime = () => {
    if (aiPrediction) {
      if (aiPrediction.riskCategory === 'Low Risk') return '0 minutes (Clear to Discharge)';
      if (aldreteScore >= 9) return '15 minutes (Monitor Pain)';
    }
    if (aldreteScore === 10) return '0 minutes (Clear to Discharge)';
    if (aldreteScore === 9) return '15 minutes (Monitor Pain)';
    if (aldreteScore === 8) return '45 minutes';
    if (aldreteScore === 7) return '75 minutes';
    return '120+ minutes';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Post-Anesthesia Care Unit (PACU)</h1>
          <p className="page-subtitle">Standardized Aldrete score checklists and discharge readiness trackers</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Side: Score checklist forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Aldrete Calculator Card */}
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Modified Aldrete Score Checklist</h3>
              <span className={`badge ${aldreteScore >= 9 ? 'badge-success' : aldreteScore >= 7 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.875rem', padding: '6px 12px' }}>
                Score: {aldreteScore} / 10
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Activity */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>1. Physical Activity (extremities range of motion)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { val: 2, label: 'Move 4 extremities' },
                    { val: 1, label: 'Move 2 extremities' },
                    { val: 0, label: 'Move 0 extremities' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      className="btn"
                      onClick={() => setActivity(opt.val as any)}
                      style={{
                        flex: 1, fontSize: '0.8125rem', padding: '10px',
                        background: activity === opt.val ? 'rgba(0,102,255,0.15)' : 'rgba(255,255,255,0.02)',
                        border: activity === opt.val ? '1px solid var(--med-blue)' : '1px solid var(--border-color)',
                        color: activity === opt.val ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {opt.label} (+{opt.val})
                    </button>
                  ))}
                </div>
              </div>

              {/* Respiration */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>2. Respiration Capacity</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { val: 2, label: 'Breathe / Cough freely' },
                    { val: 1, label: 'Dyspnea / Limited depth' },
                    { val: 0, label: 'Apneic / Intubated' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      className="btn"
                      onClick={() => setRespiration(opt.val as any)}
                      style={{
                        flex: 1, fontSize: '0.8125rem', padding: '10px',
                        background: respiration === opt.val ? 'rgba(0,102,255,0.15)' : 'rgba(255,255,255,0.02)',
                        border: respiration === opt.val ? '1px solid var(--med-blue)' : '1px solid var(--border-color)',
                        color: respiration === opt.val ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {opt.label} (+{opt.val})
                    </button>
                  ))}
                </div>
              </div>

              {/* Consciousness */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>3. Level of Consciousness</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { val: 2, label: 'Fully Awake' },
                    { val: 1, label: 'Arousable on calling' },
                    { val: 0, label: 'Unresponsive' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      className="btn"
                      onClick={() => setConsciousness(opt.val as any)}
                      style={{
                        flex: 1, fontSize: '0.8125rem', padding: '10px',
                        background: consciousness === opt.val ? 'rgba(0,102,255,0.15)' : 'rgba(255,255,255,0.02)',
                        border: consciousness === opt.val ? '1px solid var(--med-blue)' : '1px solid var(--border-color)',
                        color: consciousness === opt.val ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {opt.label} (+{opt.val})
                    </button>
                  ))}
                </div>
              </div>

              {/* Circulation */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>4. Circulation (BP deviation from baseline)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { val: 2, label: 'Deviation < ±20%' },
                    { val: 1, label: 'Deviation ±20-50%' },
                    { val: 0, label: 'Deviation > ±50%' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      className="btn"
                      onClick={() => setCirculation(opt.val as any)}
                      style={{
                        flex: 1, fontSize: '0.8125rem', padding: '10px',
                        background: circulation === opt.val ? 'rgba(0,102,255,0.15)' : 'rgba(255,255,255,0.02)',
                        border: circulation === opt.val ? '1px solid var(--med-blue)' : '1px solid var(--border-color)',
                        color: circulation === opt.val ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {opt.label} (+{opt.val})
                    </button>
                  ))}
                </div>
              </div>

              {/* Oxygenation */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>5. Oxygen Saturation (SpO2 limits)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { val: 2, label: 'SpO2 > 92% on Room Air' },
                    { val: 1, label: 'Needs O2 to stay > 90%' },
                    { val: 0, label: 'SpO2 < 90% with O2 support' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      className="btn"
                      onClick={() => setO2Sat(opt.val as any)}
                      style={{
                        flex: 1, fontSize: '0.8125rem', padding: '10px',
                        background: o2Sat === opt.val ? 'rgba(0,102,255,0.15)' : 'rgba(255,255,255,0.02)',
                        border: o2Sat === opt.val ? '1px solid var(--med-blue)' : '1px solid var(--border-color)',
                        color: o2Sat === opt.val ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {opt.label} (+{opt.val})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pain Scale assessment */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>VRS Pain Score & Recovery Flags</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <span className="form-label">Patient Visual Pain Scale (0-10)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  {[0, 2, 4, 6, 8, 10].map(val => (
                    <button
                      key={val}
                      className="btn flex-center"
                      onClick={() => setPainScale(val)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%', padding: 0,
                        backgroundColor: painScale === val ? 'var(--med-blue)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        color: painScale === val ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ width: '120px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem' }}>{painScale >= 8 ? '😭' : painScale >= 6 ? '😢' : painScale >= 4 ? '😐' : '🙂'}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{painScale >= 7 ? 'Severe Pain' : painScale >= 4 ? 'Moderate' : 'Mild/No Pain'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={hasPONV} onChange={(e) => setHasPONV(e.target.checked)} />
                <span>Active Nausea or Vomiting (PONV)</span>
              </label>

              <div className="form-group" style={{ margin: 0 }}>
                <select 
                  className="form-control"
                  value={sedationLevel}
                  onChange={(e) => setSedationLevel(e.target.value as any)}
                  style={{ padding: '8px' }}
                >
                  <option value="Awake">RASS 0: Alert & Calm</option>
                  <option value="Somnolent">RASS -2: Light Sedation</option>
                  <option value="Deeply Sedated">RASS -4: Deep Sedation</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Prediction Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px', border: isReady ? '1px solid var(--med-green)' : '1px dashed var(--med-blue)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: isReady ? 'var(--med-green)' : 'var(--med-blue)', marginBottom: '12px' }}>
              ✦ AI Recovery Prediction
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESTIMATED DISCHARGE READINESS</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginTop: '4px' }}>
                {isReady ? 'READY FOR WARD DISCHARGE' : getAIRemainingTime()}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Aldrete Limit Met (&gt;=9):</span>
                <strong style={{ color: aldreteScore >= 9 ? 'var(--med-green)' : 'var(--med-red)' }}>{aldreteScore >= 9 ? 'PASSED' : 'FAILED'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pain Controlled (&lt;4):</span>
                <strong style={{ color: painScale < 4 ? 'var(--med-green)' : 'var(--med-red)' }}>{painScale < 4 ? 'PASSED' : 'FAILED'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Nausea/Vomiting Free:</span>
                <strong style={{ color: !hasPONV ? 'var(--med-green)' : 'var(--med-red)' }}>{!hasPONV ? 'PASSED' : 'FAILED'}</strong>
              </div>
            </div>

            {isReady && (
              <button 
                className="btn btn-primary" 
                onClick={() => alert("Clearance report filed! Ward transfer team dispatched.")}
                style={{ width: '100%', marginTop: '24px', backgroundColor: 'var(--med-green)' }}
              >
                Clear Patient for Discharge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
