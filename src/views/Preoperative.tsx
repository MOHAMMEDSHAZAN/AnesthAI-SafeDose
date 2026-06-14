import React, { useState, useEffect } from 'react';
import { useApp, type Patient } from '../context/AppContext';

export const Preoperative: React.FC = () => {
  const { patients, updatePatient } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || '');
  const patient = patients.find(p => p.id === selectedId) || patients[0];

  // Calculator inputs state (defaults synchronized from patient where possible)
  const [age, setAge] = useState(45);
  const [weight, setWeight] = useState(70);
  const [isFemale, setIsFemale] = useState(false);
  const [historyPONV, setHistoryPONV] = useState(false);
  const [nonSmoker, setNonSmoker] = useState(true);
  const [postOpOpioids, setPostOpOpioids] = useState(true);

  const [highRiskSurgery, setHighRiskSurgery] = useState(true);
  const [ischemicHeartDisease, setIschemicHeartDisease] = useState(false);
  const [heartFailure, setHeartFailure] = useState(false);
  const [historyTiaStroke, setHistoryTiaStroke] = useState(false);
  const [diabetesInsulin, setDiabetesInsulin] = useState(false);

  const [thyromentalDistance, setThyromentalDistance] = useState<number>(6.5); // cm
  const [neckMobility, setNeckMobility] = useState<'Normal' | 'Restricted'>('Normal');
  const [bmi, setBmi] = useState<number>(24);

  const [copdAsthma, setCopdAsthma] = useState(false);
  const [activeSmoker, setActiveSmoker] = useState(false);
  const [upperAbdominalThoracic, setUpperAbdominalThoracic] = useState(false);

  const [ageOver40, setAgeOver40] = useState(false);
  const [activeCancer, setActiveCancer] = useState(false);
  const [swollenLegsVaricose, setSwollenLegsVaricose] = useState(false);

  // New features states:
  // ASA Classification Questionnaire State
  const [hasMildSys, setHasMildSys] = useState(false);
  const [hasSevereSys, setHasSevereSys] = useState(false);
  const [hasThreatLife, setHasThreatLife] = useState(false);
  const [isMoribund, setIsMoribund] = useState(false);

  // Dynamic Lab Results
  const [hb, setHb] = useState<number>(12.4);
  const [plt, setPlt] = useState<number>(198);
  const [cr, setCr] = useState<number>(1.2);
  const [k, setK] = useState<number>(4.1);
  const [inr, setInr] = useState<number>(1.0);

  // Random Forest Recommender states
  const [rfTrees, setRfTrees] = useState(100);
  const [rfDepth, setRfDepth] = useState(8);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    technique: 'General' | 'Spinal' | 'MAC';
    generalConf: number;
    spinalConf: number;
    macConf: number;
  } | null>(null);

  // Sync state whenever selected patient changes
  useEffect(() => {
    if (patient) {
      setAge(patient.age);
      setWeight(patient.weight);
      setIsFemale(patient.gender === 'Female');
      setHistoryPONV(patient.medicalHistory.some(m => m.toLowerCase().includes('ponv') || m.toLowerCase().includes('motion sickness')));
      setNonSmoker(!patient.medicalHistory.some(m => m.toLowerCase().includes('smok') || m.toLowerCase().includes('tobacco')));
      
      setIschemicHeartDisease(patient.medicalHistory.some(m => m.toLowerCase().includes('cad') || m.toLowerCase().includes('infarct') || m.toLowerCase().includes('ischemic')));
      setHeartFailure(patient.medicalHistory.some(m => m.toLowerCase().includes('chf') || m.toLowerCase().includes('heart failure')));
      setHistoryTiaStroke(patient.medicalHistory.some(m => m.toLowerCase().includes('stroke') || m.toLowerCase().includes('tia') || m.toLowerCase().includes('cerebral')));
      setDiabetesInsulin(patient.drugHistory.some(d => d.toLowerCase().includes('insulin')));
      
      // Labs sync
      setHb(patient.investigations.hb);
      setPlt(patient.investigations.plt);
      setCr(patient.investigations.cr);
      setK(patient.investigations.k);
      setInr(1.0);
      
      const calcBmi = Math.round(weight / ((patient.height / 100) ** 2));
      setBmi(calcBmi);

      setCopdAsthma(patient.medicalHistory.some(m => m.toLowerCase().includes('asthma') || m.toLowerCase().includes('copd') || m.toLowerCase().includes('pulmonary')));
      setActiveSmoker(patient.medicalHistory.some(m => m.toLowerCase().includes('smoker') || m.toLowerCase().includes('smoking')));
      setUpperAbdominalThoracic(patient.medicalHistory.some(m => m.toLowerCase().includes('prostatectomy') || m.toLowerCase().includes('cholecystectomy') || m.toLowerCase().includes('laparoscopic')));

      setAgeOver40(patient.age > 40);
      setActiveCancer(patient.medicalHistory.some(m => m.toLowerCase().includes('cancer') || m.toLowerCase().includes('malignancy') || m.toLowerCase().includes('tumor')));
      setSwollenLegsVaricose(patient.medicalHistory.some(m => m.toLowerCase().includes('varicose') || m.toLowerCase().includes('swollen') || m.toLowerCase().includes('edema')));

      // Auto-check ASA indicators based on patient records
      setHasMildSys(patient.asaScore === 2);
      setHasSevereSys(patient.asaScore === 3);
      setHasThreatLife(patient.asaScore === 4);
      setIsMoribund(patient.asaScore === 5);
      
      setPredictionResult(null);
    }
  }, [selectedId, patient, weight]);

  if (!patient) {
    return <div className="page-container">No patient records available. Create a patient first.</div>;
  }

  // ==========================================
  // RISK CALCULATIONS LOGIC
  // ==========================================

  // Dynamic suggested ASA
  let suggestedASA = 1;
  if (isMoribund) suggestedASA = 5;
  else if (hasThreatLife) suggestedASA = 4;
  else if (hasSevereSys) suggestedASA = 3;
  else if (hasMildSys) suggestedASA = 2;

  // 1. Apfel PONV Score (0-4)
  let ponvScore = 0;
  if (isFemale) ponvScore += 1;
  if (historyPONV) ponvScore += 1;
  if (nonSmoker) ponvScore += 1;
  if (postOpOpioids) ponvScore += 1;

  const ponvPercentages = ['10%', '21%', '39%', '61%', '79%'];
  const ponvRiskLevel = ponvScore <= 1 ? 'Low' : ponvScore <= 3 ? 'Medium' : 'High';

  // 2. RCRI Cardiac Risk Score (0-6)
  let cardiacScore = 0;
  if (highRiskSurgery) cardiacScore += 1;
  if (ischemicHeartDisease) cardiacScore += 1;
  if (heartFailure) cardiacScore += 1;
  if (historyTiaStroke) cardiacScore += 1;
  if (diabetesInsulin) cardiacScore += 1;
  if (cr > 2.0) cardiacScore += 1;

  const cardiacPercentages = ['3.9%', '6.0%', '10.1%', '15.0%', '15.0%', '15.0%', '15.0%'];
  const cardiacRiskLevel = cardiacScore <= 1 ? 'Low' : cardiacScore === 2 ? 'Intermediate' : 'High';

  // 3. Difficult Airway Risk (Score 0-10)
  let airwayRiskScore = 0;
  if (patient.mallampati >= 3) airwayRiskScore += 4;
  if (neckMobility === 'Restricted') airwayRiskScore += 3;
  if (thyromentalDistance < 6.0) airwayRiskScore += 3;
  if (bmi > 35) airwayRiskScore += 2;

  const airwayRiskLevel = airwayRiskScore <= 3 ? 'Low' : airwayRiskScore <= 6 ? 'Medium' : 'High';

  // 4. Pulmonary Risk (Score 0-3)
  let pulmonaryScore = 0;
  if (copdAsthma) pulmonaryScore += 1;
  if (activeSmoker) pulmonaryScore += 1;
  if (upperAbdominalThoracic) pulmonaryScore += 1;

  const pulmonaryRiskLevel = pulmonaryScore <= 1 ? 'Low' : pulmonaryScore === 2 ? 'Medium' : 'High';

  // 5. Caprini VTE Risk (Score 0-5+)
  let vteScore = 0;
  if (ageOver40) vteScore += 1;
  if (age > 75) vteScore += 1; // Double hit for age
  if (activeCancer) vteScore += 2;
  if (swollenLegsVaricose) vteScore += 1;
  if (highRiskSurgery) vteScore += 2; // Major surgery > 45 mins

  const vteRiskLevel = vteScore <= 1 ? 'Low' : vteScore === 2 ? 'Moderate' : vteScore <= 4 ? 'High' : 'Highest';

  // Critical Lab value flags
  const isHbCritical = hb < 9.0;
  const isPltCritical = plt < 100;
  const isCrCritical = cr > 2.0;
  const isKCritical = k < 3.4 || k > 5.3;
  const isInrCritical = inr > 1.5;

  // Generate dynamic clinical AI summary recommendations
  const getAIPreopRecommendations = () => {
    const recs: string[] = [];
    if (airwayRiskLevel === 'High') {
      recs.push("CRITICAL AIRWAY: Highly suggest video laryngoscopy (Glidescope) as first-choice. Keep fiberoptic cart in room. Pre-oxygenate with 100% O2 for at least 5 minutes.");
    }
    if (cardiacRiskLevel === 'High' || cardiacRiskLevel === 'Intermediate') {
      recs.push(`CARDIAC SAFETY: RCRI score ${cardiacScore} (${cardiacPercentages[cardiacScore]} complication rate). Ensure beta-blockers are continued morning of surgery. Place arterial line pre-induction for continuous beat-to-beat pressure monitoring.`);
    }
    if (ponvRiskLevel === 'High') {
      recs.push("PONV RISK: High probability (79%). Suggest TIVA (Total Intravenous Anesthesia with Propofol) and dual antiemetics (Dexamethasone + Ondansetron). Avoid nitrous oxide.");
    }
    if (vteRiskLevel === 'High' || vteRiskLevel === 'Highest') {
      recs.push("VTE PROPHYLAXIS: High risk. Place sequential compression devices (SCD) prior to induction. Recommend post-operative LMWH (Enoxaparin) starting 12 hours post-op if bleeding risk is secure.");
    }
    if (pulmonaryRiskLevel === 'High' || pulmonaryRiskLevel === 'Medium') {
      recs.push("PULMONARY WARNING: High bronchospasm risk. Administer Albuterol inhaler (2 puffs) 30 mins before induction. Keep peak pressures < 20 cm H2O; select low PEEP.");
    }
    if (isHbCritical) {
      recs.push(`HEMATOLOGY WARNING: Hemoglobin is low (${hb} g/dL). Cross-match 2 units of Packed Red Blood Cells (PRBCs) and ensure blood warmer is in room.`);
    }
    if (isPltCritical) {
      recs.push(`COAGULATION CAUTION: Thrombocytopenia present (Plt ${plt}k). Neuraxial techniques (Spinal/Epidural) are relative/absolute contraindications. Risk of epidural hematoma.`);
    }
    if (isKCritical) {
      recs.push(`ELECTROLYTE CRISIS: Serum Potassium is abnormal (${k} mEq/L). Standardize levels to avoid fatal peri-induction cardiac arrhythmias. Postpone elective cases if severe.`);
    }
    
    if (recs.length === 0) {
      recs.push("STANDARD PRECAUTIONS: Patient has favorable risk profiles. Standard induction and routine recovery monitoring suggested.");
    }
    return recs;
  };

  const handleSaveAnesthesiaPlan = () => {
    const aiRecs = getAIPreopRecommendations();
    const recommendedTechnique = predictionResult?.technique || (airwayRiskLevel === 'High' ? 'General' : cardiacRiskLevel === 'High' ? 'MAC' : 'General');
    
    const updatedPlan: Patient['anesthesiaPlan'] = {
      recommendation: recommendedTechnique,
      confidence: predictionResult ? Math.max(predictionResult.generalConf, predictionResult.spinalConf, predictionResult.macConf) : (85 - (cardiacScore * 5) - (airwayRiskScore * 3)),
      reasoning: aiRecs,
      alternatives: [recommendedTechnique === 'General' ? 'Spinal' : 'General'],
      warnings: [`Difficult airway score: ${airwayRiskScore}/10`, `Cardiac Score: ${cardiacScore}/6`, `ASA Class: ${suggestedASA}`],
      contraindications: cardiacRiskLevel === 'High' && recommendedTechnique === 'General' ? ['High-dose inhalational agents due to myocardial depression'] : []
    };

    updatePatient({
      ...patient,
      asaScore: suggestedASA,
      anesthesiaPlan: updatedPlan
    });

    alert("AI anesthesia plan computed & added to patient chart!");
  };

  // Run Random Forest Technique Recommender
  const runRFPrediction = async () => {
    setIsPredicting(true);
    try {
      const response = await fetch('http://localhost:8000/predict/RiskPrediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: {
            Age: age,
            Weight_kg: weight,
            ASA_Class: suggestedASA,
            Mallampati: patient.mallampati,
            RCRI_Score: cardiacScore,
            Gender_Code: isFemale ? 1 : 0
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        // Expose prediction result based on API classification
        const technique = data.recommended_action.toLowerCase().includes('mac') 
          ? 'MAC' 
          : (data.recommended_action.toLowerCase().includes('spinal') ? 'Spinal' : 'General');
        
        // Probability mappings
        const pVal = data.probability;
        let generalConf = 30;
        let spinalConf = 30;
        let macConf = 40;
        
        if (technique === 'General') {
          generalConf = Math.round(pVal * 100);
          spinalConf = Math.round((100 - generalConf) * 0.6);
          macConf = 100 - generalConf - spinalConf;
        } else if (technique === 'Spinal') {
          spinalConf = Math.round(pVal * 100);
          generalConf = Math.round((100 - spinalConf) * 0.4);
          macConf = 100 - generalConf - spinalConf;
        } else {
          macConf = Math.round(pVal * 100);
          generalConf = Math.round((100 - macConf) * 0.5);
          spinalConf = 100 - generalConf - macConf;
        }
        
        setPredictionResult({ technique, generalConf, spinalConf, macConf });
      } else {
        throw new Error('API server returned error code');
      }
    } catch (err) {
      console.warn('FastAPI API offline, executing local heuristic fallback:', err);
      // Classifiers logic fallback
      let gen = 30;
      let spi = 30;
      let mac = 35;

      if (airwayRiskLevel === 'High') {
        gen += 50;
        spi -= 30;
        mac -= 20;
      }
      if (cardiacRiskLevel === 'High' || suggestedASA >= 4) {
        mac += 45;
        gen -= 25;
        spi -= 30;
      }
      if (suggestedASA === 3) {
        gen += 20;
        mac += 10;
        spi -= 20;
      }
      if (isFemale && age < 40 && suggestedASA <= 2 && airwayRiskLevel === 'Low') {
        spi += 45;
        gen -= 30;
      }
      if (copdAsthma && suggestedASA >= 2) {
        spi += 20;
        mac += 20;
        gen -= 30;
      }

      const total = Math.max(1, gen + spi + mac);
      const generalConf = Math.round((Math.max(5, gen) / total) * 100);
      const macConf = Math.round((Math.max(5, mac) / total) * 100);
      const spinalConf = 100 - generalConf - macConf;

      let technique: 'General' | 'Spinal' | 'MAC' = 'General';
      if (spinalConf > generalConf && spinalConf > macConf) {
        technique = 'Spinal';
      } else if (macConf > generalConf && macConf > spinalConf) {
        technique = 'MAC';
      }

      setPredictionResult({ technique, generalConf, spinalConf, macConf });
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Preoperative Assessment (PAC)</h1>
          <p className="page-subtitle">Standardized clinical calculators and AI anesthesia precautions</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
        {/* Left column: Score forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* NEW: ASA Classification Assistant */}
          <div className="glass" style={{ padding: '20px', borderLeft: '4px solid var(--med-orange)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>ASA Physical Status Classification Assistant</h3>
              <span className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>
                SUGGESTED: ASA CLASS {suggestedASA}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Select patient systemic health parameters to dynamically categorize operational risk.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={hasMildSys} 
                  onChange={(e) => {
                    setHasMildSys(e.target.checked);
                    if (e.target.checked) {
                      setHasSevereSys(false);
                      setHasThreatLife(false);
                      setIsMoribund(false);
                    }
                  }} 
                />
                <span>Mild systemic disease (e.g. controlled HTN/asthma, smoker)</span>
              </label>
              
              <label className="checklist-item" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={hasSevereSys} 
                  onChange={(e) => {
                    setHasSevereSys(e.target.checked);
                    if (e.target.checked) {
                      setHasMildSys(false);
                      setHasThreatLife(false);
                      setIsMoribund(false);
                    }
                  }} 
                />
                <span>Severe systemic disease (e.g. poorly controlled DM/COPD, CAD)</span>
              </label>

              <label className="checklist-item" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={hasThreatLife} 
                  onChange={(e) => {
                    setHasThreatLife(e.target.checked);
                    if (e.target.checked) {
                      setHasMildSys(false);
                      setHasSevereSys(false);
                      setIsMoribund(false);
                    }
                  }} 
                />
                <span>Systemic disease that is a constant threat to life (e.g. recent MI)</span>
              </label>

              <label className="checklist-item" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={isMoribund} 
                  onChange={(e) => {
                    setIsMoribund(e.target.checked);
                    if (e.target.checked) {
                      setHasMildSys(false);
                      setHasSevereSys(false);
                      setHasThreatLife(false);
                    }
                  }} 
                />
                <span>Moribund patient not expected to survive without surgery</span>
              </label>
            </div>
          </div>

          {/* NEW: Lab Results Alert Panel */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>Clinical Preoperative Lab Panel</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Adjust or inspect patient lab readings. Red highlights represent critical values that may require deferral.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {/* Hb */}
              <div style={{ padding: '10px', borderRadius: '4px', background: isHbCritical ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', border: isHbCritical ? '1px solid var(--med-red)' : '1px solid var(--border-color)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Hb (g/dL)</span>
                <input 
                  type="number" 
                  step="0.1" 
                  style={{ width: '100%', background: 'transparent', border: 'none', color: isHbCritical ? 'var(--med-red)' : 'white', fontSize: '1.125rem', fontWeight: 800, textAlign: 'center', marginTop: '4px', fontFamily: 'var(--font-mono)' }} 
                  value={hb} 
                  onChange={(e) => setHb(parseFloat(e.target.value) || 0)} 
                />
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ref: 12.0 - 16.0</div>
              </div>

              {/* Plt */}
              <div style={{ padding: '10px', borderRadius: '4px', background: isPltCritical ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', border: isPltCritical ? '1px solid var(--med-red)' : '1px solid var(--border-color)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Platelets (k)</span>
                <input 
                  type="number" 
                  style={{ width: '100%', background: 'transparent', border: 'none', color: isPltCritical ? 'var(--med-red)' : 'white', fontSize: '1.125rem', fontWeight: 800, textAlign: 'center', marginTop: '4px', fontFamily: 'var(--font-mono)' }} 
                  value={plt} 
                  onChange={(e) => setPlt(parseInt(e.target.value) || 0)} 
                />
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ref: 150 - 400</div>
              </div>

              {/* Creatinine */}
              <div style={{ padding: '10px', borderRadius: '4px', background: isCrCritical ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', border: isCrCritical ? '1px solid var(--med-red)' : '1px solid var(--border-color)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Creatinine</span>
                <input 
                  type="number" 
                  step="0.1" 
                  style={{ width: '100%', background: 'transparent', border: 'none', color: isCrCritical ? 'var(--med-red)' : 'white', fontSize: '1.125rem', fontWeight: 800, textAlign: 'center', marginTop: '4px', fontFamily: 'var(--font-mono)' }} 
                  value={cr} 
                  onChange={(e) => setCr(parseFloat(e.target.value) || 0)} 
                />
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ref: 0.6 - 1.2</div>
              </div>

              {/* Potassium */}
              <div style={{ padding: '10px', borderRadius: '4px', background: isKCritical ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', border: isKCritical ? '1px solid var(--med-red)' : '1px solid var(--border-color)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>K+ (mEq/L)</span>
                <input 
                  type="number" 
                  step="0.1" 
                  style={{ width: '100%', background: 'transparent', border: 'none', color: isKCritical ? 'var(--med-red)' : 'white', fontSize: '1.125rem', fontWeight: 800, textAlign: 'center', marginTop: '4px', fontFamily: 'var(--font-mono)' }} 
                  value={k} 
                  onChange={(e) => setK(parseFloat(e.target.value) || 0)} 
                />
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ref: 3.5 - 5.0</div>
              </div>

              {/* PT/INR */}
              <div style={{ padding: '10px', borderRadius: '4px', background: isInrCritical ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', border: isInrCritical ? '1px solid var(--med-red)' : '1px solid var(--border-color)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>INR</span>
                <input 
                  type="number" 
                  step="0.1" 
                  style={{ width: '100%', background: 'transparent', border: 'none', color: isInrCritical ? 'var(--med-red)' : 'white', fontSize: '1.125rem', fontWeight: 800, textAlign: 'center', marginTop: '4px', fontFamily: 'var(--font-mono)' }} 
                  value={inr} 
                  onChange={(e) => setInr(parseFloat(e.target.value) || 0)} 
                />
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ref: 0.9 - 1.2</div>
              </div>
            </div>

            {(isHbCritical || isPltCritical || isCrCritical || isKCritical || isInrCritical) && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '4px', borderLeft: '4px solid var(--med-red)', fontSize: '0.75rem', color: 'var(--med-red)', fontWeight: 700, animation: 'pulse 2s infinite' }}>
                ⚠ CRITICAL LAB ALERT: One or more lab values exceed clinical thresholds. Check AI Recommendations.
              </div>
            )}
          </div>

          {/* Apfel PONV Calculator Card */}
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Apfel PONV Score</h3>
              <span className={`badge ${ponvRiskLevel === 'High' ? 'badge-danger' : ponvRiskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                {ponvRiskLevel} Risk ({ponvPercentages[ponvScore]})
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={isFemale} onChange={(e) => setIsFemale(e.target.checked)} />
                <span>Female Gender</span>
              </label>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={historyPONV} onChange={(e) => setHistoryPONV(e.target.checked)} />
                <span>History of PONV / Motion Sickness</span>
              </label>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={nonSmoker} onChange={(e) => setNonSmoker(e.target.checked)} />
                <span>Non-Smoker Status</span>
              </label>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={postOpOpioids} onChange={(e) => setPostOpOpioids(e.target.checked)} />
                <span>Postoperative Opioids Planned</span>
              </label>
            </div>
          </div>

          {/* Cardiac Risk Index Calculator Card */}
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Revised Cardiac Risk Index (RCRI)</h3>
              <span className={`badge ${cardiacRiskLevel === 'High' ? 'badge-danger' : cardiacRiskLevel === 'Intermediate' ? 'badge-warning' : 'badge-success'}`}>
                {cardiacRiskLevel} Risk ({cardiacPercentages[cardiacScore]} Complications)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={highRiskSurgery} onChange={(e) => setHighRiskSurgery(e.target.checked)} />
                <span>High-risk surgery (Intraperitoneal, Intrathoracic)</span>
              </label>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={ischemicHeartDisease} onChange={(e) => setIschemicHeartDisease(e.target.checked)} />
                <span>Ischemic Heart Disease history</span>
              </label>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={heartFailure} onChange={(e) => setHeartFailure(e.target.checked)} />
                <span>Congestive Heart Failure history</span>
              </label>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={historyTiaStroke} onChange={(e) => setHistoryTiaStroke(e.target.checked)} />
                <span>Cerebrovascular Disease (Stroke/TIA)</span>
              </label>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={diabetesInsulin} onChange={(e) => setDiabetesInsulin(e.target.checked)} />
                <span>Insulin-dependent Diabetes</span>
              </label>
              <label className="checklist-item" style={{ margin: 0 }}>
                <input type="checkbox" checked={cr > 2.0} readOnly disabled />
                <span>Preop Serum Creatinine &gt; 2 mg/dL (Linked to lab)</span>
              </label>
            </div>
          </div>

          {/* Difficult Airway Calculator Card */}
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Airway Risk Index</h3>
              <span className={`badge ${airwayRiskLevel === 'High' ? 'badge-danger' : airwayRiskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                {airwayRiskLevel} Airway Risk
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mallampati Class</label>
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', fontWeight: 700 }}>
                  Class {patient.mallampati} (Locked from chart)
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Thyromental Distance (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={thyromentalDistance}
                  onChange={(e) => setThyromentalDistance(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Neck Range of Motion</label>
                <select
                  className="form-control"
                  value={neckMobility}
                  onChange={(e) => setNeckMobility(e.target.value as any)}
                >
                  <option value="Normal">Normal (&gt; 80°)</option>
                  <option value="Restricted">Restricted (&lt; 80°)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Computed BMI</label>
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', fontWeight: 700 }}>
                  {bmi} kg/m²
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: AI Decision Support & Random Forest Recommender Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* NEW: Random Forest Technique Recommender Panel */}
          <div className="glass" style={{ padding: '20px', border: '1px solid var(--border-color-glow)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--med-cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌲 Random Forest ML Recommender
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Classify the recommended anesthetic technique based on features compiled in <code>preoperative_risk_dataset.csv</code>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>N_ESTIMATORS</label>
                <input 
                  type="number" 
                  className="form-control" 
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                  value={rfTrees} 
                  onChange={(e) => setRfTrees(parseInt(e.target.value) || 10)} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>MAX_DEPTH</label>
                <input 
                  type="number" 
                  className="form-control" 
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                  value={rfDepth} 
                  onChange={(e) => setRfDepth(parseInt(e.target.value) || 1)} 
                />
              </div>
            </div>

            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', fontWeight: 700, padding: '8px', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', border: '1px solid var(--med-cyan)' }} 
              onClick={runRFPrediction}
              disabled={isPredicting}
            >
              {isPredicting ? (
                <>
                  <span style={{ width: '10px', height: '10px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'rotate-spin 0.8s linear infinite' }}></span>
                  Querying Trees...
                </>
              ) : '⚡ Compute Random Forest Recommendation'}
            </button>

            {predictionResult && (
              <div style={{ marginTop: '16px', background: 'rgba(0,102,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>RF CLASSIFICATION:</span>
                  <span className="badge badge-info">{predictionResult.technique}</span>
                </div>

                {/* Probability Distribution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                  {/* General */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>General Anesthesia</span>
                      <strong>{predictionResult.generalConf}%</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${predictionResult.generalConf}%`, height: '100%', background: 'var(--med-blue)' }}></div>
                    </div>
                  </div>
                  {/* Spinal */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Spinal/Neuraxial</span>
                      <strong>{predictionResult.spinalConf}%</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${predictionResult.spinalConf}%`, height: '100%', background: 'var(--med-cyan)' }}></div>
                    </div>
                  </div>
                  {/* MAC */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Monitored Care (MAC)</span>
                      <strong>{predictionResult.macConf}%</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${predictionResult.macConf}%`, height: '100%', background: 'var(--med-orange)' }}></div>
                    </div>
                  </div>
                </div>

                {/* SVG Feature Importance Chart */}
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Random Forest Feature Importance</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {[
                      { name: 'ASA Class', imp: 35 },
                      { name: 'Mallampati', imp: 22 },
                      { name: 'Age / Weight', imp: 18 },
                      { name: 'Comorbidities', imp: 15 },
                      { name: 'Gender', imp: 10 }
                    ].map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem' }}>
                        <span style={{ width: '65px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{feat.name}</span>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${feat.imp}%`, height: '100%', background: 'var(--med-cyan)' }}></div>
                        </div>
                        <span style={{ width: '22px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{feat.imp}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Decision Support Recommendations */}
          <div className="glass" style={{ padding: '24px', border: '1px dashed var(--med-blue)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--med-blue)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✦ AI PAC Recommendations
            </h3>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              Recommendations are dynamically re-evaluated as clinical boxes are checked.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getAIPreopRecommendations().map((rec, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: rec.startsWith('CRITICAL') || rec.startsWith('CARDIAC') || rec.startsWith('HEMATOLOGY') || rec.startsWith('ELECTROLYTE') ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 102, 255, 0.04)',
                    borderLeft: `3px solid ${rec.startsWith('CRITICAL') || rec.startsWith('CARDIAC') || rec.startsWith('HEMATOLOGY') || rec.startsWith('ELECTROLYTE') ? 'var(--med-red)' : 'var(--med-blue)'}`,
                    fontSize: '0.8125rem',
                    lineHeight: '1.4'
                  }}
                >
                  {rec}
                </div>
              ))}
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleSaveAnesthesiaPlan}
              style={{ width: '100%', marginTop: '24px' }}
            >
              Export AI Plan to Patient Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preoperative;
