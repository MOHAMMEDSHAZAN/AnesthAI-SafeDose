import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export const IntraopSafety: React.FC = () => {
  const { simulatedState } = useApp();

  // Vitals State
  const [vitals, setVitals] = useState({
    hr: 74,
    bpSys: 122,
    bpDia: 78,
    map: 92,
    spo2: 98,
    etco2: 38,
    temp: 36.6,
    rr: 14,
    bis: 48,
    tof: '4/4',
    cvp: 5,
    pip: 17,
    peep: 5,
    tv: 480
  });

  // Predictions State
  const [predictions, setPredictions] = useState<Record<string, { risk: string; confidence: number }>>({
    Hypotension: { risk: 'Low Risk', confidence: 95 },
    Hypoxia: { risk: 'Low Risk', confidence: 98 },
    Bradycardia: { risk: 'Low Risk', confidence: 94 },
    Tachycardia: { risk: 'Low Risk', confidence: 92 }
  });

  // Fluid management log states
  const [fluidLog, setFluidLog] = useState<Array<{ time: string; type: string; volume: number }>>([
    { time: '08:45', type: 'Crystalloids (Ringer\'s Lactate)', volume: 500 },
    { time: '09:15', type: 'Colloids (Albumin 5%)', volume: 250 }
  ]);
  const [newFluidType, setNewFluidType] = useState('Crystalloids (Ringer\'s Lactate)');
  const [newFluidVol, setNewFluidVol] = useState(250);

  const [bloodLoss, setBloodLoss] = useState(150);
  const [urineOutput, setUrineOutput] = useState(100);

  // Temperature
  const [warmingMethod, setWarmingMethod] = useState('Forced-air warming');
  const [tempMonitorType, setTempMonitorType] = useState('Continuous');
  const [tempConcern, setTempConcern] = useState('No');
  const [tempNotes, setTempNotes] = useState('');

  // Pain
  const [preopAnalgesia, setPreopAnalgesia] = useState('Acetaminophen 1g PO, Celecoxib 200mg PO');
  const [intraopAnalgesia, setIntraopAnalgesia] = useState('Fentanyl 150mcg IV, Ketamine 20mg IV');
  const [postopAnalgesia, setPostopAnalgesia] = useState('Patient-Controlled Analgesia (PCA) Hydromorphone');
  const [painAssessment, setPainAssessment] = useState('FLACC/Numerical Rating Scale');
  const [painScore, setPainScore] = useState(2);
  const [rescueRequired, setRescueRequired] = useState('No');

  // Vitals simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setVitals(prev => {
        let hr = prev.hr + (Math.random() - 0.5) * 1.5;
        let bpSys = prev.bpSys + (Math.random() - 0.5) * 2.5;
        let bpDia = prev.bpDia + (Math.random() - 0.5) * 1.5;
        let etco2 = prev.etco2 + (Math.random() - 0.5) * 0.5;
        let temp = prev.temp + (Math.random() - 0.5) * 0.02;
        let rr = prev.rr;
        let spo2 = prev.spo2;

        if (simulatedState === 'hypotension') {
          bpSys = 82 + (Math.random() - 0.5) * 2;
          bpDia = 48 + (Math.random() - 0.5) * 1.5;
          hr = 95 + (Math.random() - 0.5) * 2;
        } else if (simulatedState === 'hypoxia') {
          spo2 = 89 + (Math.random() - 0.5) * 1;
          hr = 104 + (Math.random() - 0.5) * 2;
        } else if (simulatedState === 'bradycardia') {
          hr = 38 + (Math.random() - 0.5) * 1.5;
          bpSys = 96 + (Math.random() - 0.5) * 2;
        } else if (simulatedState === 'tachycardia') {
          hr = 138 + (Math.random() - 0.5) * 2;
        }

        const mapVal = Math.round(bpDia + (bpSys - bpDia) / 3);

        return {
          ...prev,
          hr: Math.round(Math.max(30, Math.min(180, hr))),
          bpSys: Math.round(Math.max(60, Math.min(200, bpSys))),
          bpDia: Math.round(Math.max(30, Math.min(120, bpDia))),
          map: mapVal,
          spo2: Math.min(100, Math.max(70, Math.round(spo2))),
          etco2: Math.round(Math.max(10, Math.min(80, etco2))),
          temp: parseFloat(Math.max(33, Math.min(42, temp)).toFixed(1)),
          rr: Math.round(rr)
        };
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [simulatedState]);

  // Fetch ML predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      const payload = {
        features: {
          hr: vitals.hr,
          sbp: vitals.bpSys,
          dbp: vitals.bpDia,
          map: vitals.map,
          spo2: vitals.spo2,
          etco2: vitals.etco2,
          rr: vitals.rr,
          cvp: vitals.cvp,
          temp: vitals.temp,
          shock_index: vitals.hr / vitals.bpSys,
          pulse_pressure: vitals.bpSys - vitals.bpDia,
          cvp_map_ratio: vitals.cvp / vitals.map
        }
      };

      const models = ['Hypotension', 'Hypoxia', 'Bradycardia', 'Tachycardia'];
      const next: Record<string, { risk: string; confidence: number }> = {};

      await Promise.all(
        models.map(async mId => {
          try {
            const res = await fetch(`http://localhost:8000/predict/${mId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const data = await res.json();
              next[mId] = {
                risk: data.risk_category || 'Low Risk',
                confidence: Math.round((data.probability || (data.confidence_score / 100)) * 100)
              };
            }
          } catch (e) {
            if (mId === 'Hypotension') {
              const r = vitals.map < 65 ? 'High Risk' : vitals.map < 75 ? 'Medium Risk' : 'Low Risk';
              next.Hypotension = { risk: r, confidence: 85 };
            } else if (mId === 'Hypoxia') {
              const r = vitals.spo2 < 92 ? 'High Risk' : vitals.spo2 < 95 ? 'Medium Risk' : 'Low Risk';
              next.Hypoxia = { risk: r, confidence: 90 };
            } else if (mId === 'Bradycardia') {
              const r = vitals.hr < 50 ? 'High Risk' : 'Low Risk';
              next.Bradycardia = { risk: r, confidence: 95 };
            } else if (mId === 'Tachycardia') {
              const r = vitals.hr > 110 ? 'High Risk' : 'Low Risk';
              next.Tachycardia = { risk: r, confidence: 92 };
            }
          }
        })
      );
      setPredictions(next);
    };

    fetchPredictions();
  }, [vitals.hr, vitals.bpSys, vitals.bpDia, vitals.map, vitals.spo2]);

  // Compute fluid calculations
  const totalFluidsIn = fluidLog.reduce((acc, curr) => acc + curr.volume, 0);
  const fluidBalanceVal = totalFluidsIn - (bloodLoss + urineOutput);

  const handleAddFluid = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setFluidLog(prev => [...prev, { time: now, type: newFluidType, volume: newFluidVol }]);
  };

  // Find threshold alerts
  const concerns: string[] = [];
  if (vitals.bpSys < 90 || vitals.map < 60) concerns.push("Severe Hypotension (MAP < 60 mmHg)");
  if (vitals.spo2 < 92) concerns.push("Critical Hypoxia (SpO2 < 92%)");
  if (vitals.etco2 > 45) concerns.push("Hypercapnia (EtCO2 > 45 mmHg)");
  if (vitals.temp < 36.0) concerns.push("Hypothermia Warning (Temp < 36°C)");

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Intraoperative Safety Panel</h1>
          <p className="page-subtitle">Real-time vitals alerts, drug interaction telemetry, and fluid logs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        
        {/* Left Column: Live Vitals Dashboard + Concerns + Predictions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Live telemetry monitors */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 className="card-title">Live OT Telemetry Room OR-01</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '14px' }}>
              <div className="vital-box vital-green" style={{ border: '1px solid rgba(0, 184, 148, 0.15)', borderRadius: '4px' }}>
                <div className="vital-box-header"><span>HR (bpm)</span></div>
                <div className="vital-box-value">{vitals.hr}</div>
              </div>

              <div className="vital-box vital-red" style={{ border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '4px' }}>
                <div className="vital-box-header"><span>NIBP (Sys/Dia)</span></div>
                <div className="vital-box-value" style={{ fontSize: '1.75rem' }}>{vitals.bpSys}/{vitals.bpDia}</div>
                <div style={{ fontSize: '0.7rem', textAlign: 'right' }}>MAP: <strong>{vitals.map}</strong></div>
              </div>

              <div className="vital-box vital-cyan" style={{ border: '1px solid rgba(0, 229, 255, 0.15)', borderRadius: '4px' }}>
                <div className="vital-box-header"><span>SpO2</span></div>
                <div className="vital-box-value">{vitals.spo2}%</div>
              </div>

              <div className="vital-box vital-orange" style={{ border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '4px' }}>
                <div className="vital-box-header"><span>EtCO2</span></div>
                <div className="vital-box-value">{vitals.etco2}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.8125rem' }}>
                <span>Temp:</span> <strong style={{ color: vitals.temp < 36 ? 'var(--med-orange)' : 'inherit' }}>{vitals.temp} °C</strong>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.8125rem' }}>
                <span>Sedation (BIS):</span> <strong>{vitals.bis}</strong>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.8125rem' }}>
                <span>CVP:</span> <strong>{vitals.cvp} mmHg</strong>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.8125rem' }}>
                <span>PEEP/PIP:</span> <strong>{vitals.peep}/{vitals.pip}</strong>
              </div>
            </div>
          </div>

          {/* Current Safety Concerns */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 className="card-title">Current Safety Concerns</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {concerns.map((con, idx) => (
                <div key={idx} style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid var(--med-red)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                  <strong>ALERT:</strong> {con}
                </div>
              ))}
              {concerns.length === 0 && (
                <div style={{ padding: '10px', background: 'rgba(0, 184, 148, 0.05)', borderLeft: '4px solid var(--med-green)', color: 'var(--med-green)', fontSize: '0.8125rem' }}>
                  ✓ No clinical safety concern violations detected from current vitals.
                </div>
              )}
            </div>
          </div>

          {/* AI Decision Support Models */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 className="card-title">AI Prognostic Decision Support</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Dynamic risk probabilities updated continuously from clinical AI endpoints. Model calculations are for decision support only.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {Object.keys(predictions).map(mId => {
                const pred = predictions[mId];
                const isHigh = pred.risk === 'High Risk';
                return (
                  <div key={mId} style={{ 
                    padding: '12px', 
                    background: isHigh ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', 
                    border: `1.5px solid ${isHigh ? 'var(--med-red)' : 'var(--border-color)'}`,
                    borderRadius: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ fontWeight: 600 }}>{mId} Predictor</span>
                      <span className={`badge ${isHigh ? 'badge-danger' : 'badge-success'}`}>
                        {pred.risk}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                      <span>Model Confidence:</span>
                      <strong>{pred.confidence}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Fluid, Temp, Pain management plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Fluid and circulation */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 className="card-title">Fluid & Circulation Safety</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Fluid Input:</span> <strong>{totalFluidsIn} mL</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Estimated Blood Loss:</span> 
                <input type="number" className="form-control" style={{ padding: '4px', width: '80px', fontSize: '0.75rem' }} value={bloodLoss} onChange={e => setBloodLoss(Number(e.target.value))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Urine Output:</span> 
                <input type="number" className="form-control" style={{ padding: '4px', width: '80px', fontSize: '0.75rem' }} value={urineOutput} onChange={e => setUrineOutput(Number(e.target.value))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                <span>Fluid Balance:</span> 
                <strong style={{ color: fluidBalanceVal < 0 ? 'var(--med-orange)' : 'var(--med-green)' }}>
                  {fluidBalanceVal} mL
                </strong>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '14px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Fluid Type</label>
                <select className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={newFluidType} onChange={e => setNewFluidType(e.target.value)}>
                  <option>Crystalloids (Ringer's Lactate)</option>
                  <option>Crystalloids (Normal Saline)</option>
                  <option>Colloids (Albumin 5%)</option>
                  <option>Packed Red Blood Cells (PRBC)</option>
                  <option>Fresh Frozen Plasma (FFP)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Volume (mL)</label>
                <input type="number" className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={newFluidVol} onChange={e => setNewFluidVol(Number(e.target.value))} />
              </div>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px' }} onClick={handleAddFluid}>
                Add Fluid Entry
              </button>
            </div>
          </div>

          {/* Temperature Management */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 className="card-title">Temperature Management</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Warming Method</label>
                <input type="text" className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={warmingMethod} onChange={e => setWarmingMethod(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Temp Monitoring Mode</label>
                <select className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={tempMonitorType} onChange={e => setTempMonitorType(e.target.value)}>
                  <option>Continuous</option>
                  <option>Intermittent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Hypothermia Concern?</label>
                <select className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={tempConcern} onChange={e => setTempConcern(e.target.value)}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Temperature Notes</label>
                <textarea className="form-control" rows={2} style={{ padding: '6px', fontSize: '0.75rem' }} value={tempNotes} onChange={e => setTempNotes(e.target.value)} placeholder="Temperature notes..." />
              </div>
            </div>
          </div>

          {/* Analgesia & Pain Plan */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 className="card-title">Analgesia & Pain Plan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Pre-op Analgesics Given</label>
                <input type="text" className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={preopAnalgesia} onChange={e => setPreopAnalgesia(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Intra-op Analgesics Administered</label>
                <textarea className="form-control" rows={2} style={{ padding: '6px', fontSize: '0.75rem' }} value={intraopAnalgesia} onChange={e => setIntraopAnalgesia(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Post-op Analgesia Plan</label>
                <input type="text" className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={postopAnalgesia} onChange={e => setPostopAnalgesia(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Pain Assessment Method</label>
                <input type="text" className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={painAssessment} onChange={e => setPainAssessment(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Current Pain Score (0-10): {painScore}</label>
                <input type="range" min="0" max="10" value={painScore} onChange={e => setPainScore(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Rescue Analgesia Required?</label>
                <select className="form-control" style={{ padding: '6px', fontSize: '0.75rem' }} value={rescueRequired} onChange={e => setRescueRequired(e.target.value)}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
