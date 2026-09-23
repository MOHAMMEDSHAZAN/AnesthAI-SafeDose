import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config/api';

interface Drug {
  name: string;
  category: 'Induction' | 'Opioid' | 'Paralytic' | 'Emergency' | 'Reversal' | 'Sedative';
  adultDoseRange: string; // e.g. "1.5 - 2.5 mg/kg"
  pediatricDoseRange: string; // e.g. "2.0 - 3.0 mg/kg"
  bolusFactor: number; // standard mg per kg
  maxAdultBolus: number; // standard mg absolute max
  concentration: number; // e.g. 10 mg/mL
  infusionRange?: string; // e.g. "100 - 200 mcg/kg/min"
  infusionFactor?: number; // standard mcg/kg/min
}

const drugDatabase: Drug[] = [
  { name: 'Propofol', category: 'Induction', adultDoseRange: '1.5 - 2.5 mg/kg', pediatricDoseRange: '2.5 - 3.0 mg/kg', bolusFactor: 2.0, maxAdultBolus: 250, concentration: 10, infusionRange: '100 - 200 mcg/kg/min', infusionFactor: 150 },
  { name: 'Fentanyl', category: 'Opioid', adultDoseRange: '1.0 - 3.0 mcg/kg', pediatricDoseRange: '1.0 - 2.0 mcg/kg', bolusFactor: 2.0, maxAdultBolus: 250, concentration: 50, infusionRange: '1.0 - 2.0 mcg/kg/hr', infusionFactor: 1.5 },
  { name: 'Rocuronium', category: 'Paralytic', adultDoseRange: '0.6 - 1.2 mg/kg', pediatricDoseRange: '0.6 - 1.0 mg/kg', bolusFactor: 0.6, maxAdultBolus: 100, concentration: 10 },
  { name: 'Epinephrine', category: 'Emergency', adultDoseRange: '10 - 100 mcg IV bolus', pediatricDoseRange: '10 mcg/kg IV (ACLS)', bolusFactor: 0.1, maxAdultBolus: 1000, concentration: 0.1, infusionRange: '0.05 - 0.5 mcg/kg/min', infusionFactor: 0.1 },
  { name: 'Atropine', category: 'Emergency', adultDoseRange: '0.5 - 1.0 mg IV', pediatricDoseRange: '0.02 mg/kg IV', bolusFactor: 0.015, maxAdultBolus: 3, concentration: 0.6 },
  { name: 'Succinylcholine', category: 'Paralytic', adultDoseRange: '1.0 - 1.5 mg/kg', pediatricDoseRange: '1.5 - 2.0 mg/kg', bolusFactor: 1.0, maxAdultBolus: 150, concentration: 20 },
  { name: 'Neostigmine', category: 'Reversal', adultDoseRange: '0.03 - 0.07 mg/kg', pediatricDoseRange: '0.05 mg/kg', bolusFactor: 0.05, maxAdultBolus: 5, concentration: 0.5 },
  { name: 'Midazolam', category: 'Sedative', adultDoseRange: '0.01 - 0.05 mg/kg', pediatricDoseRange: '0.05 - 0.1 mg/kg', bolusFactor: 0.03, maxAdultBolus: 5, concentration: 1 }
];

export const DrugCalculator: React.FC = () => {
  const { patients } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || '');
  const patient = patients.find(p => p.id === selectedId) || patients[0];

  const [weight, setWeight] = useState<number>(70);
  const [age, setAge] = useState<number>(45);
  const [drugList, setDrugList] = useState<Drug[]>(drugDatabase);
  const [selectedDrug, setSelectedDrug] = useState<Drug>(drugDatabase[0]);
  const [favorites, setFavorites] = useState<string[]>(['Propofol', 'Fentanyl', 'Epinephrine']);
  const [searchQuery, setSearchQuery] = useState('');

  // Drug-drug interaction items
  const [activeRegimen, setActiveRegimen] = useState<string[]>([]);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'warning' | 'critical'>('safe');
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);
  const [safetyContraindications, setSafetyContraindications] = useState<string[]>([]);

  // Sync weight/age when patient changes
  useEffect(() => {
    if (patient) {
      setWeight(patient.weight);
      setAge(patient.age);
    }
  }, [selectedId, patient]);

  // Fetch verified drugs from FastAPI database on mount
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/drugs/database`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Map backend schema to local interface
            const mapped = data.map((d: any) => ({
              name: d.name,
              category: d.category,
              adultDoseRange: d.adultDoseRange,
              pediatricDoseRange: d.pediatricDoseRange,
              bolusFactor: d.bolusFactor,
              maxAdultBolus: d.maxAdultBolus,
              concentration: d.concentration,
              infusionRange: d.infusionRange,
              infusionFactor: d.infusionFactor,
              fda_class: d.fda_class,
              black_box_warning: d.black_box_warning,
              mechanism_of_action: d.mechanism_of_action
            }));
            setDrugList(mapped);
            setSelectedDrug(mapped[0]);
          }
        }
      } catch (e) {
        console.log("Offline or error fetching drug database, using defaults:", e);
      }
    };
    fetchDrugs();
  }, []);

  // Calculate standard dose to evaluate
  const isPediatric = age < 12;
  const doseRange = isPediatric ? selectedDrug.pediatricDoseRange : selectedDrug.adultDoseRange;
  const calculatedBolus = (weight * selectedDrug.bolusFactor).toFixed(2);

  // Interaction & rule checking engine via FastAPI backend
  useEffect(() => {
    const runSafetyCheck = async () => {
      if (!selectedDrug) return;
      try {
        const body = {
          patient_id: selectedId || "custom",
          age: age,
          weight: weight,
          creatinine: patient?.investigations?.cr || 1.0,
          proposed_drug: selectedDrug.name,
          proposed_dose: parseFloat(calculatedBolus) || 0,
          active_drugs: activeRegimen,
          medical_history: patient?.medicalHistory || []
        };
        
        const res = await fetch(`${API_BASE_URL}/api/drugs/safety-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (res.ok) {
          const data = await res.json();
          setSafetyStatus(data.status);
          setSafetyWarnings(data.warnings);
          setSafetyContraindications(data.contraindications);
        }
      } catch (err) {
        console.warn("Safety check unavailable:", err);
      }
    };
    
    runSafetyCheck();
  }, [selectedDrug, age, weight, calculatedBolus, activeRegimen, patient, selectedId]);

  const handleAddRegimen = (name: string) => {
    if (!activeRegimen.includes(name)) {
      setActiveRegimen([...activeRegimen, name]);
    }
  };

  const handleRemoveRegimen = (name: string) => {
    setActiveRegimen(activeRegimen.filter(n => n !== name));
  };

  const unit = selectedDrug.name === 'Fentanyl' || selectedDrug.name === 'Epinephrine' ? 'mcg' : 'mg';
  const calculatedVolume = (Number(calculatedBolus) / selectedDrug.concentration).toFixed(2);

  // Infusion calculator (if available)
  const isInfusion = !!selectedDrug.infusionFactor;
  const calculatedInfusionRate = isInfusion 
    ? (weight * (selectedDrug.infusionFactor || 0)).toFixed(2)
    : '0'; // mcg/min or mcg/hr
  
  // Rate in mL/hr based on drug concentration
  const calculatedMlHour = isInfusion
    ? ((Number(calculatedInfusionRate) * 60) / (selectedDrug.concentration * 1000)).toFixed(1)
    : '0';

  const toggleFavorite = (name: string) => {
    if (favorites.includes(name)) {
      setFavorites(favorites.filter(f => f !== name));
    } else {
      setFavorites([...favorites, name]);
    }
  };

  const filteredDrugs = drugList.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Research & Clinical Decision-Support Banner */}
      <div className="prototype-advisory-banner">
        <span>
          <strong>RESEARCH PROTOTYPE</strong> • Weight & Age-Adjusted Anesthetic Dosing Calculator. Clinical decision-support advisory only; verify all calculated dosages, dilution protocols, and syringe markings before administration.
        </span>
        <span className="badge badge-info">DECISION SUPPORT</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            Surgical Drug Dosing Calculator
            <span className="badge badge-warning" style={{ fontSize: '0.75rem', verticalAlign: 'middle', marginLeft: '10px' }}>
              Prototype Advisory
            </span>
          </h1>
          <p className="page-subtitle">Weight and age adjusted clinical formulas and interaction profiling</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Load Patient:</span>
          <select 
            className="role-selector" 
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Custom Weight Input</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.weight}kg)</option>)}
          </select>
        </div>
      </div>

      {/* Inputs strip */}
      <div className="glass" style={{ padding: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
          <label className="form-label">Patient Weight (kg)</label>
          <input
            type="number"
            className="form-control"
            value={weight}
            onChange={(e) => { setSelectedId(''); setWeight(Number(e.target.value)); }}
          />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
          <label className="form-label">Patient Age (years)</label>
          <input
            type="number"
            className="form-control"
            value={age}
            onChange={(e) => { setSelectedId(''); setAge(Number(e.target.value)); }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', margin: 0 }}>
          <span className={`badge ${isPediatric ? 'badge-danger' : 'badge-success'}`}>
            {isPediatric ? 'PEDIATRIC PROTOCOL ACTIVE' : 'ADULT PROTOCOL ACTIVE'}
          </span>
        </div>
      </div>

      {/* Main Grid splits Drug Search and Dosing Outputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        {/* Left Side: Drug index */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass" style={{ padding: '16px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search drug list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
              {favorites.map(f => (
                <span 
                  key={f} 
                  className="badge badge-info" 
                  onClick={() => setSelectedDrug(drugList.find(d => d.name === f) || drugList[0])}
                  style={{ cursor: 'pointer', fontSize: '0.6875rem' }}
                >
                  ★ {f}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
              {filteredDrugs.map(d => (
                <div
                  key={d.name}
                  onClick={() => setSelectedDrug(d)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: selectedDrug.name === d.name ? 'rgba(0,102,255,0.08)' : 'transparent',
                    border: selectedDrug.name === d.name ? '1px solid var(--border-color-glow)' : '1px solid transparent'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{d.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{
            padding: '16px',
            border: safetyStatus === 'critical' ? '1px solid var(--med-red)' : safetyStatus === 'warning' ? '1px solid var(--med-orange)' : '1px solid var(--border-color)'
          }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>Active Drug Interaction Profiler</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {activeRegimen.map(n => (
                <span key={n} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {n}
                  <span style={{ cursor: 'pointer', fontWeight: 800 }} onClick={() => handleRemoveRegimen(n)}>&times;</span>
                </span>
              ))}
              {activeRegimen.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No drugs added to test cart.</span>}
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.75rem', padding: '6px' }} onClick={() => handleAddRegimen(selectedDrug.name)}>
              + Add {selectedDrug.name} to Cart
            </button>

            {(safetyWarnings.length > 0 || safetyContraindications.length > 0) && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {safetyContraindications.map((alert: string, i: number) => (
                  <div key={`cart-contra-${i}`} style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid var(--med-red)', color: 'var(--text-primary)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                    <strong>CRITICAL:</strong> {alert}
                  </div>
                ))}
                {safetyWarnings.map((alert: string, i: number) => (
                  <div key={`cart-warn-${i}`} style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--med-orange)', color: 'var(--text-primary)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                    <strong>WARNING:</strong> {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Dosing panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px', border: '1px solid var(--border-color-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedDrug.category.toUpperCase()} DRUG</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedDrug.name}</h2>
              </div>
              <button className="icon-btn" onClick={() => toggleFavorite(selectedDrug.name)} title="Toggle Favorite">
                {favorites.includes(selectedDrug.name) ? '★' : '☆'}
              </button>
            </div>

            {/* Dose ranges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinical Dosing Range</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '4px' }}>{doseRange}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Concentration In Syringe</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '4px' }}>{selectedDrug.concentration} mg/mL</div>
              </div>
            </div>

            {/* Computed Bolus */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>COMPUTED INDUCTION BOLUS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div style={{ padding: '16px', background: 'rgba(0,102,255,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--med-blue-glow)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculated Dose</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {calculatedBolus} <span style={{ fontSize: '1rem', fontWeight: 500 }}>{unit}</span>
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volume to Draw</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {calculatedVolume} <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>mL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Infusion Maintenance (if exists) */}
            {isInfusion && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>COMPUTED MAINTENANCE INFUSION</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', alignItems: 'center' }}>
                  <div style={{ padding: '16px', background: 'rgba(0,184,148,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--med-green-glow)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Infusion Delivery Rate</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--med-green)', fontFamily: 'var(--font-mono)' }}>
                      {calculatedInfusionRate} <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{selectedDrug.name === 'Fentanyl' ? 'mcg/hr' : 'mcg/kg/min'}</span>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Syringe Pump Rate</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {calculatedMlHour} <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>mL/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time openFDA safety validation alerts */}
            {(safetyWarnings.length > 0 || safetyContraindications.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {safetyContraindications.map((c, i) => (
                  <div key={`contra-${i}`} style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '4px', borderLeft: '4px solid var(--med-red)', fontSize: '0.8125rem', color: 'white' }}>
                    <strong>CRITICAL CONTRAINDICATION:</strong> {c}
                  </div>
                ))}
                {safetyWarnings.map((w, i) => (
                  <div key={`warn-${i}`} style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '4px', borderLeft: '4px solid var(--med-orange)', fontSize: '0.8125rem', color: 'white' }}>
                    <strong>SAFETY WARNING:</strong> {w}
                  </div>
                ))}
              </div>
            )}

            {/* openFDA verified reference label card */}
            {selectedDrug && (selectedDrug as any).fda_class && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--med-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    openFDA Verified Clinical Reference
                  </strong>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(0,184,148,0.15)', color: 'var(--med-green)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                    FDA Compliant
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', lineHeight: '1.4' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>FDA Drug Class:</span>
                    <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{(selectedDrug as any).fda_class}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Mechanism of Action:</span>
                    <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{(selectedDrug as any).mechanism_of_action}</div>
                  </div>
                  {(selectedDrug as any).black_box_warning && (selectedDrug as any).black_box_warning !== 'None.' && (
                    <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.2)', borderRadius: '4px' }}>
                      <span style={{ color: 'var(--med-red)', fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>FDA WARNING LABEL:</span>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '2px' }}>{(selectedDrug as any).black_box_warning}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
