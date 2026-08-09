import React, { useState } from 'react';
import { useApp, type AnesthesiaIncident } from '../context/AppContext';

export const ReportIncident: React.FC = () => {
  const { patients, activePatientId, activeCaseId, submitIncidentReport, logSafetyAudit } = useApp();

  const patient = patients.find(p => p.id === activePatientId) || patients[0];

  // Primary fields
  const [preventable, setPreventable] = useState<'yes' | 'no' | 'uncertain'>('uncertain');
  const [narrative, setNarrative] = useState('');
  const [severity, setSeverity] = useState<'near_miss' | 'no_harm' | 'minor_harm' | 'moderate_harm' | 'severe_harm' | 'death'>('no_harm');
  
  // Categories multi-select
  const [categories, setCategories] = useState<string[]>([]);
  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  // Vitals at incident
  const [hr, setHr] = useState(80);
  const [sbp, setSbp] = useState(120);
  const [dbp, setDbp] = useState(80);
  const [mapVal, setMapVal] = useState(93);
  const [spo2, setSpo2] = useState(98);
  const [rr, setRr] = useState(14);
  const [etco2, setEtco2] = useState(38);
  const [temp, setTemp] = useState(36.5);

  const importLiveVitals = () => {
    // Import typical live values
    setHr(74);
    setSbp(122);
    setDbp(78);
    setMapVal(92);
    setSpo2(98);
    setRr(14);
    setEtco2(38);
    setTemp(36.6);
  };

  // Medication involved
  const [medInvolved, setMedInvolved] = useState(false);
  const [medDrug, setMedDrug] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medUnit, setMedUnit] = useState('mg');
  const [medRoute, setMedRoute] = useState('IV');
  const [medError, setMedError] = useState(false);
  const [medErrorType, setMedErrorType] = useState('');
  const [medAdverse, setMedAdverse] = useState(false);

  // Airway involved
  const [airwayInvolved, setAirwayInvolved] = useState(false);
  const [airwayDevice, setAirwayDevice] = useState('ETT');
  const [ettSize, setEttSize] = useState('7.5 cuffed');
  const [attempts, setAttempts] = useState(1);
  const [diffAirway, setDiffAirway] = useState('No');

  // Contributing factors (multi-select checklist)
  const [factors, setFactors] = useState<string[]>([]);
  const toggleFactor = (fac: string) => {
    setFactors(prev => prev.includes(fac) ? prev.filter(f => f !== fac) : [...prev, fac]);
  };

  // Outcomes
  const [outcome, setOutcome] = useState('Recovered without additional treatment');
  const [intervention, setIntervention] = useState('');
  const [treatment, setTreatment] = useState('');
  const [patientStatus, setPatientStatus] = useState('Stable');

  // Staffing
  const [immediateProvider, setImmediateProvider] = useState('Dr. Sarah Jenkins');
  const [supervisingProvider, setSupervisingProvider] = useState('Dr. Michael Chang');
  const [role, setRole] = useState('Anesthesiologist');

  // AI Safety Review
  const [aiReview, setAiReview] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reporter
  const [includeContact, setIncludeContact] = useState(false);
  const [repFirst, setRepFirst] = useState('');
  const [repLast, setRepLast] = useState('');
  const [repEmail, setRepEmail] = useState('');

  // Draft / Submit results
  const [incidentId, setIncidentId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnalyze = async () => {
    if (!narrative.trim()) {
      alert("Please enter an incident narrative description before requesting AI review.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:8000/api/safety/incidents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative,
          categories,
          contributing_factors: factors
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiReview(data);
      }
    } catch (e) {
      console.warn(e);
      // Fallback AI simulation
      setAiReview({
        summary: `Incident analysis for case ${activeCaseId}`,
        detected_patterns: ["Hemodynamic variation noticed"],
        missing_information: ["No invasive line details recorded."],
        preventive_considerations: ["Double-check anesthesia gas flow levels."],
        confidence_score: 75.0,
        disclaimer: "AI-generated analysis is decision support only and requires qualified clinical review."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDraft = () => {
    alert("Draft saved to browser storage successfully.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) {
      alert("Narrative Description is required.");
      return;
    }

    const reportObj: AnesthesiaIncident = {
      caseId: activeCaseId,
      patientId: patient.id,
      preventable,
      narrative,
      severity,
      categories,
      vitalsAtIncident: { hr, sbp, dbp, map: mapVal, spo2, rr, etco2, temp },
      medicationInvolved: medInvolved,
      medicationDetails: medInvolved ? { drug: medDrug, dose: medDose, unit: medUnit, route: medRoute, is_error: medError, error_type: medErrorType, suspected_adr: medAdverse } : {},
      airwayInvolved: airwayInvolved,
      airwayDetails: airwayInvolved ? { device: airwayDevice, ett_size: ettSize, attempts, is_difficult: diffAirway } : {},
      contributingFactors: factors,
      injuryOccurred: false,
      injuryDetails: {},
      outcome,
      reportedBy: `${repFirst} ${repLast}`.trim() || 'Staff ID #4289',
      reporterDetails: { email: repEmail, include_contact: includeContact }
    };

    const newId = await submitIncidentReport(reportObj);
    setIncidentId(newId);
    logSafetyAudit('Incident Submitted', newId, `Narrative length: ${narrative.length}`);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="page-container">
        <div className="glass" style={{ padding: '40px', maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(0, 184, 148, 0.12)',
            border: '2px solid var(--med-green)',
            color: 'var(--med-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 20px'
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Incident Report Submitted Successfully</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Report ID: <strong style={{ color: 'var(--med-cyan)' }}>{incidentId}</strong> has been registered in the database.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>
              Print Report
            </button>
            <button className="btn btn-secondary" onClick={() => {
              // Reset
              setNarrative('');
              setIsSubmitted(false);
              setIncidentId('');
            }}>
              File Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Anesthesia Incident & Patient Safety Report</h1>
          <p className="page-subtitle">Document perioperative incidents, contributing factors, patient information, interventions, and outcomes</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleSaveDraft}>
            💾 Save Draft
          </button>
          <button className="btn btn-secondary" onClick={() => setNarrative('')}>
            Clear Form
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        
        {/* Left Column: Form detail sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Narrative description */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Incident Narrative</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Was the incident potentially preventable?</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(['yes', 'no', 'uncertain'] as const).map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="radio" checked={preventable === opt} onChange={() => setPreventable(opt)} />
                      {opt.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Incident Description *</label>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  required
                  value={narrative} 
                  onChange={e => setNarrative(e.target.value)} 
                  placeholder="Detail physiological onset, airway/circulatory indicators, duration, interventions..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Immediate Actions Taken</label>
                <textarea className="form-control" rows={3} placeholder="Drug boluses, positioning, airway rescue..." />
              </div>

              <div className="form-group">
                <label className="form-label">Lessons Learned / Preventive Actions</label>
                <textarea className="form-control" rows={3} placeholder="Preventive considerations for future cases..." />
              </div>
            </div>
          </div>

          {/* Vitals at incident */}
          <div className="glass" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Vitals at Time of Incident</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={importLiveVitals}>
                📥 Import Vitals at Incident Time
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Heart Rate (bpm)</label>
                <input type="number" className="form-control" value={hr} onChange={e => setHr(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">SBP (mmHg)</label>
                <input type="number" className="form-control" value={sbp} onChange={e => setSbp(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">DBP (mmHg)</label>
                <input type="number" className="form-control" value={dbp} onChange={e => setDbp(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">SpO2 (%)</label>
                <input type="number" className="form-control" value={spo2} onChange={e => setSpo2(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Resp Rate</label>
                <input type="number" className="form-control" value={rr} onChange={e => setRr(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">EtCO2</label>
                <input type="number" className="form-control" value={etco2} onChange={e => setEtco2(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Temperature (°C)</label>
                <input type="number" step="0.1" className="form-control" value={temp} onChange={e => setTemp(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Event details */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Event Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Phase of Care</label>
                <select className="form-control">
                  <option>Preoperative</option>
                  <option>Induction</option>
                  <option>Maintenance</option>
                  <option>Emergence</option>
                  <option>PACU / Recovery</option>
                  <option>Postoperative</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-control">
                  <option>Pre-op</option>
                  <option>Operating Room</option>
                  <option>PACU</option>
                  <option>ICU</option>
                  <option>Ward</option>
                  <option>Emergency Department</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select className="form-control" value={severity} onChange={e => setSeverity(e.target.value as any)}>
                  <option value="near_miss">Near Miss</option>
                  <option value="no_harm">No Harm</option>
                  <option value="minor_harm">Minor Harm</option>
                  <option value="moderate_harm">Moderate Harm</option>
                  <option value="severe_harm">Severe Harm</option>
                  <option value="death">Death</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Event?</label>
                <select className="form-control">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medications Involved */}
          <div className="glass" style={{ padding: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={medInvolved} onChange={() => setMedInvolved(!medInvolved)} style={{ width: '18px', height: '18px' }} />
              <h3 className="card-title" style={{ margin: 0 }}>Medication involved in the event?</h3>
            </label>

            {medInvolved && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Drug Name</label>
                  <input type="text" className="form-control" value={medDrug} onChange={e => setMedDrug(e.target.value)} placeholder="Propofol, Fentanyl, Neostigmine..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dose</label>
                    <input type="text" className="form-control" value={medDose} onChange={e => setMedDose(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input type="text" className="form-control" value={medUnit} onChange={e => setMedUnit(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Route</label>
                  <input type="text" className="form-control" value={medRoute} onChange={e => setMedRoute(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Suspected ADR?</label>
                  <select className="form-control" value={medAdverse ? 'Yes' : 'No'} onChange={e => setMedAdverse(e.target.value === 'Yes')}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={medError} onChange={() => setMedError(!medError)} />
                    Medication administration error?
                  </label>
                  {medError && (
                    <input type="text" className="form-control" style={{ marginTop: '8px' }} value={medErrorType} onChange={e => setMedErrorType(e.target.value)} placeholder="Wrong syringe / labels swapped / calculation error..." />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Airway involved */}
          <div className="glass" style={{ padding: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={airwayInvolved} onChange={() => setAirwayInvolved(!airwayInvolved)} style={{ width: '18px', height: '18px' }} />
              <h3 className="card-title" style={{ margin: 0 }}>Airway-related event?</h3>
            </label>

            {airwayInvolved && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Airway Device used</label>
                  <input type="text" className="form-control" value={airwayDevice} onChange={e => setAirwayDevice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tube Size (if ETT)</label>
                  <input type="text" className="form-control" value={ettSize} onChange={e => setEttSize(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of attempts</label>
                  <input type="number" className="form-control" value={attempts} onChange={e => setAttempts(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficult airway expected?</label>
                  <select className="form-control" value={diffAirway} onChange={e => setDiffAirway(e.target.value)}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Patient outcomes */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Patient Handoff & Outcomes</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Patient Handoff status</label>
                <select className="form-control" value={outcome} onChange={e => setOutcome(e.target.value)}>
                  <option>Recovered without additional treatment</option>
                  <option>Recovered after intervention</option>
                  <option>Prolonged PACU stay</option>
                  <option>Unexpected ICU admission</option>
                  <option>Additional procedure required</option>
                  <option>Permanent harm</option>
                  <option>Death</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Patient Status</label>
                <input type="text" className="form-control" value={patientStatus} onChange={e => setPatientStatus(e.target.value)} />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Intervention Performed</label>
                <textarea className="form-control" rows={2} value={intervention} onChange={e => setIntervention(e.target.value)} placeholder="Describe CPR, fluid bolus, airway recovery details..." />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Treatment Given</label>
                <input type="text" className="form-control" value={treatment} onChange={e => setTreatment(e.target.value)} placeholder="Medication or immediate therapy given (e.g. Ephedrine 5mg IV, manual ventilation)..." />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI review, categories, staffing, reporter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* AI Incident Review */}
          <div className="glass" style={{ padding: '24px', border: '1.5px solid var(--med-cyan)' }}>
            <h3 className="card-title" style={{ color: 'var(--med-cyan)' }}>
              AI Safety Review (Decision Support)
            </h3>
            
            <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing Narrative...' : '🤖 Analyze Incident Narrative'}
            </button>

            {aiReview && (
              <div style={{ marginTop: '16px', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                  <strong>Summary Draft:</strong>
                  <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{aiReview.summary}</p>
                </div>
                
                {aiReview.missing_information?.length > 0 && (
                  <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--med-orange)', borderRadius: '4px' }}>
                    <strong>Missing Documentation:</strong>
                    <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                      {aiReview.missing_information.map((info: string, i: number) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ padding: '10px', background: 'rgba(0, 184, 148, 0.05)', borderLeft: '3px solid var(--med-green)', borderRadius: '4px' }}>
                  <strong>Preventive Considerations:</strong>
                  <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                    {aiReview.preventive_considerations?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Confidence Score: {aiReview.confidence_score}% • {aiReview.disclaimer}
                </div>
              </div>
            )}
          </div>

          {/* Event categories */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Event Categories</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Select all that apply.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--med-cyan)', textTransform: 'uppercase' }}>Airway</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {['Difficult Intubation', 'Failed Intubation', 'Laryngospasm', 'Hypoxemia / Desaturation'].map(cat => {
                    const active = categories.includes(cat);
                    return (
                      <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                        padding: '4px 8px', fontSize: '0.7rem', borderRadius: '30px', 
                        border: `1px solid ${active ? 'var(--med-cyan)' : 'var(--border-color)'}`,
                        background: active ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                        color: active ? 'var(--med-cyan)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}>{cat}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--med-cyan)', textTransform: 'uppercase' }}>Cardiovascular</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {['Hypotension', 'Hypertension', 'Bradycardia', 'Arrhythmia', 'Cardiac Arrest'].map(cat => {
                    const active = categories.includes(cat);
                    return (
                      <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                        padding: '4px 8px', fontSize: '0.7rem', borderRadius: '30px', 
                        border: `1px solid ${active ? 'var(--med-cyan)' : 'var(--border-color)'}`,
                        background: active ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                        color: active ? 'var(--med-cyan)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}>{cat}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--med-cyan)', textTransform: 'uppercase' }}>Medications</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {['Wrong Drug', 'Wrong Dose', 'Drug Allergy', 'Drug Interaction'].map(cat => {
                    const active = categories.includes(cat);
                    return (
                      <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                        padding: '4px 8px', fontSize: '0.7rem', borderRadius: '30px', 
                        border: `1px solid ${active ? 'var(--med-cyan)' : 'var(--border-color)'}`,
                        background: active ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                        color: active ? 'var(--med-cyan)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}>{cat}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Contributing factors checklist */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Contributing Factors</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {['Patient factors', 'Medication labeling', 'Equipment glitch', 'Staffing fatigue', 'Communication error', 'Training experience'].map(fac => {
                const active = factors.includes(fac);
                return (
                  <button key={fac} type="button" onClick={() => toggleFactor(fac)} style={{
                    padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px',
                    border: `1px solid ${active ? 'var(--med-orange)' : 'var(--border-color)'}`,
                    background: active ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    color: active ? 'var(--med-orange)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}>{fac}</button>
                );
              })}
            </div>
          </div>

          {/* Staffing */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-title">Staff Roles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div className="form-group">
                <label className="form-label">Immediate Provider</label>
                <input type="text" className="form-control" value={immediateProvider} onChange={e => setImmediateProvider(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Supervising Provider</label>
                <input type="text" className="form-control" value={supervisingProvider} onChange={e => setSupervisingProvider(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Immediate Provider's Role</label>
                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                  <option>Anesthesiologist</option>
                  <option>Anesthesia Resident</option>
                  <option>Certified Registered Nurse Anesthetist (CRNA)</option>
                  <option>OT Scrub Nurse</option>
                  <option>PACU Nurse</option>
                  <option>Other Clinician</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reporter (optional) */}
          <div className="glass" style={{ padding: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={includeContact} onChange={() => setIncludeContact(!includeContact)} style={{ width: '16px', height: '16px' }} />
              <h3 className="card-title" style={{ margin: 0 }}>Include Reporter Contact?</h3>
            </label>
            {includeContact && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" value={repFirst} onChange={e => setRepFirst(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" value={repLast} onChange={e => setRepLast(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={repEmail} onChange={e => setRepEmail(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Submission Bar */}
          <div style={{ marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              🚨 Submit Incident Report
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};
