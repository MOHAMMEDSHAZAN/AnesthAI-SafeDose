import React, { useState } from 'react';
import { useApp, type Patient } from '../context/AppContext';

export const Patients: React.FC = () => {
  const { patients, addPatient, updatePatient, deletePatient } = useApp();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [asaFilter, setAsaFilter] = useState<string>('All');

  // CRUD Form State
  const [formState, setFormState] = useState<Omit<Patient, 'id' | 'vitals'>>({
    name: '',
    age: 45,
    gender: 'Male',
    weight: 70,
    height: 170,
    allergies: [],
    medicalHistory: [],
    drugHistory: [],
    asaScore: 2,
    mallampati: 2,
    comorbidities: [],
    investigations: {
      hb: 13.5,
      plt: 250,
      cr: 0.9,
      k: 4.2,
      ecg: 'Normal Sinus Rhythm',
      echo: 'EF 55-60%, normal chambers',
      pft: 'Normal spirometry',
      pregnancy: false,
      bloodGroup: 'O Positive'
    }
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [historyInput, setHistoryInput] = useState('');
  const [drugInput, setDrugInput] = useState('');

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleOpenAdd = () => {
    setModalType('add');
    setFormState({
      name: '',
      age: 45,
      gender: 'Male',
      weight: 70,
      height: 170,
      allergies: [],
      medicalHistory: [],
      drugHistory: [],
      asaScore: 2,
      mallampati: 2,
      comorbidities: [],
      investigations: {
        hb: 13.5,
        plt: 250,
        cr: 0.9,
        k: 4.2,
        ecg: 'Normal Sinus Rhythm',
        echo: 'EF 55-60%, normal chambers',
        pft: 'Normal spirometry',
        pregnancy: false,
        bloodGroup: 'O Positive'
      }
    });
    setAllergyInput('');
    setHistoryInput('');
    setDrugInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setModalType('edit');
    setFormState({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      weight: patient.weight,
      height: patient.height,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      drugHistory: patient.drugHistory,
      asaScore: patient.asaScore,
      mallampati: patient.mallampati,
      comorbidities: patient.comorbidities,
      investigations: { ...patient.investigations }
    });
    setAllergyInput('');
    setHistoryInput('');
    setDrugInput('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'add') {
      const newPatient: Patient = {
        ...formState,
        id: `P${Math.floor(100 + Math.random() * 900)}`,
        vitals: { hr: 75, bpSys: 120, bpDia: 80, spo2: 98, temp: 36.8 }
      };
      addPatient(newPatient);
      setSelectedPatientId(newPatient.id);
    } else {
      const updated: Patient = {
        ...formState,
        id: selectedPatient.id,
        vitals: selectedPatient.vitals,
        anesthesiaPlan: selectedPatient.anesthesiaPlan
      };
      updatePatient(updated);
    }
    setIsModalOpen(false);
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setFormState(prev => ({ ...prev, allergies: [...prev.allergies, allergyInput.trim()] }));
      setAllergyInput('');
    }
  };

  const handleAddHistory = () => {
    if (historyInput.trim()) {
      setFormState(prev => ({ 
        ...prev, 
        medicalHistory: [...prev.medicalHistory, historyInput.trim()],
        comorbidities: [...prev.comorbidities, historyInput.trim()]
      }));
      setHistoryInput('');
    }
  };

  const handleAddDrug = () => {
    if (drugInput.trim()) {
      setFormState(prev => ({ ...prev, drugHistory: [...prev.drugHistory, drugInput.trim()] }));
      setDrugInput('');
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAsa = asaFilter === 'All' || p.asaScore.toString() === asaFilter;
    return matchesSearch && matchesAsa;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Surgical Patient Records</h1>
          <p className="page-subtitle">Demographics, histories, allergy screening, and pre-op profiles</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Register New Patient
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass" style={{ padding: '14px 20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search patient name or clinical ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-secondary)' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ASA Rating:</span>
          <select 
            className="form-control" 
            style={{ width: '100px', padding: '6px 12px' }}
            value={asaFilter}
            onChange={(e) => setAsaFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="1">ASA I</option>
            <option value="2">ASA II</option>
            <option value="3">ASA III</option>
          </select>
        </div>
      </div>

      {/* Main Grid splits List and Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Side: Patient Checklist list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPatients.map(p => (
            <div 
              key={p.id}
              className="glass" 
              onClick={() => setSelectedPatientId(p.id)}
              style={{ 
                padding: '16px', 
                cursor: 'pointer',
                borderColor: selectedPatientId === p.id ? 'var(--med-blue)' : 'var(--border-color)',
                boxShadow: selectedPatientId === p.id ? 'var(--shadow-glow)' : 'none',
                backgroundColor: selectedPatientId === p.id ? 'rgba(0,102,255,0.03)' : 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{p.name}</span>
                <span className={`badge ${p.asaScore >= 3 ? 'badge-danger' : 'badge-success'}`}>
                  ASA {p.asaScore}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>ID: {p.id} • {p.age} yrs • {p.gender}</span>
                <span>{p.weight} kg</span>
              </div>
              {p.allergies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                  {p.allergies.map(a => (
                    <span key={a} style={{ fontSize: '0.625rem', background: 'rgba(239,68,68,0.1)', color: 'var(--med-red)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      ⚠ {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              No matching clinical records found.
            </div>
          )}
        </div>

        {/* Right Side: Detailed clinical chart file */}
        {selectedPatient ? (
          <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedPatient.name}</h2>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Registered Patient Profile ID: {selectedPatient.id}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => handleOpenEdit(selectedPatient)}>
                  Edit Chart
                </button>
                <button className="btn btn-danger" onClick={() => { if(confirm("Archive record?")) { deletePatient(selectedPatient.id); setSelectedPatientId(patients[0]?.id || ''); }}}>
                  Archive Record
                </button>
              </div>
            </div>

            {/* Patient Vitals baseline strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>AGE / GENDER</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{selectedPatient.age} / {selectedPatient.gender.charAt(0)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>WEIGHT</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{selectedPatient.weight} kg</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>HEIGHT</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{selectedPatient.height} cm</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>MALLAMPATI</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px', color: selectedPatient.mallampati >= 3 ? 'var(--med-orange)' : 'var(--med-green)' }}>Class {selectedPatient.mallampati}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>BLOOD GROUP</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px', color: 'var(--med-cyan)' }}>{selectedPatient.investigations.bloodGroup}</div>
              </div>
            </div>

            {/* Medical details tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>History & Comorbidities</h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selectedPatient.medicalHistory.map((h, i) => <li key={i}>{h}</li>)}
                  {selectedPatient.medicalHistory.length === 0 && <span style={{ color: 'var(--text-muted)' }}>None recorded</span>}
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>Home Medications</h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selectedPatient.drugHistory.map((d, i) => <li key={i}>{d}</li>)}
                  {selectedPatient.drugHistory.length === 0 && <span style={{ color: 'var(--text-muted)' }}>None recorded</span>}
                </ul>
              </div>
            </div>

            {/* Lab Values & Investigations */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>Lab Work & Investigations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '0.8125rem', marginBottom: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Hemoglobin (Hb)</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedPatient.investigations.hb < 12 ? 'var(--med-orange)' : 'var(--text-primary)' }}>
                    {selectedPatient.investigations.hb} <span style={{ fontSize: '0.6875rem', fontWeight: 400 }}>g/dL</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Platelets (PLT)</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {selectedPatient.investigations.plt} <span style={{ fontSize: '0.6875rem', fontWeight: 400 }}>k/uL</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Creatinine (Cr)</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedPatient.investigations.cr > 1.1 ? 'var(--med-orange)' : 'var(--text-primary)' }}>
                    {selectedPatient.investigations.cr} <span style={{ fontSize: '0.6875rem', fontWeight: 400 }}>mg/dL</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Potassium (K+)</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {selectedPatient.investigations.k} <span style={{ fontSize: '0.6875rem', fontWeight: 400 }}>mEq/L</span>
                  </div>
                </div>
              </div>

              {/* Special diagnostics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div><strong>ECG:</strong> {selectedPatient.investigations.ecg}</div>
                <div><strong>ECHO:</strong> {selectedPatient.investigations.echo}</div>
                <div><strong>PFT:</strong> {selectedPatient.investigations.pft}</div>
              </div>
            </div>

            {/* AI Assistant patient summary card */}
            {selectedPatient.anesthesiaPlan && (
              <div style={{ background: 'rgba(0,102,255,0.03)', border: '1px dashed var(--med-blue)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--med-blue)' }}>✦ AI Recommendation plan</span>
                  <span className="badge badge-info">{selectedPatient.anesthesiaPlan.confidence}% Confidence</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Recommended Technique: <strong>{selectedPatient.anesthesiaPlan.recommendation} Anesthesia</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {selectedPatient.anesthesiaPlan.reasoning.map((r, i) => <div key={i}>• {r}</div>)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a patient chart from the left panel to review histories.
          </div>
        )}
      </div>

      {/* CRUD Add/Edit Overlay Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color-glow)' }}>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
              {modalType === 'add' ? 'Register Patient Record' : 'Edit Patient Chart'}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Patient Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formState.age}
                    onChange={(e) => setFormState(prev => ({ ...prev, age: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    value={formState.gender}
                    onChange={(e) => setFormState(prev => ({ ...prev, gender: e.target.value as any }))}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formState.weight}
                    onChange={(e) => setFormState(prev => ({ ...prev, weight: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formState.height}
                    onChange={(e) => setFormState(prev => ({ ...prev, height: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ASA Score (1-4)</label>
                  <select
                    className="form-control"
                    value={formState.asaScore}
                    onChange={(e) => setFormState(prev => ({ ...prev, asaScore: Number(e.target.value) }))}
                  >
                    <option value={1}>ASA I (Normal Healthy)</option>
                    <option value={2}>ASA II (Mild Systemic)</option>
                    <option value={3}>ASA III (Severe Systemic)</option>
                    <option value={4}>ASA IV (Threat to Life)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mallampati (1-4)</label>
                  <select
                    className="form-control"
                    value={formState.mallampati}
                    onChange={(e) => setFormState(prev => ({ ...prev, mallampati: Number(e.target.value) as any }))}
                  >
                    <option value={1}>Class I</option>
                    <option value={2}>Class II</option>
                    <option value={3}>Class III</option>
                    <option value={4}>Class IV</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Lists */}
              <div className="form-group">
                <label className="form-label">Allergies</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Latex"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddAllergy}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {formState.allergies.map(a => (
                    <span key={a} style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: 'var(--med-red)', padding: '2px 8px', borderRadius: '4px' }}>
                      {a} <span style={{ cursor: 'pointer', marginLeft: '6px' }} onClick={() => setFormState(prev => ({ ...prev, allergies: prev.allergies.filter(x => x !== a) }))}>&times;</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comorbidities / History</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Asthma"
                    value={historyInput}
                    onChange={(e) => setHistoryInput(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddHistory}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {formState.medicalHistory.map(h => (
                    <span key={h} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                      {h} <span style={{ cursor: 'pointer', marginLeft: '6px' }} onClick={() => setFormState(prev => ({ ...prev, medicalHistory: prev.medicalHistory.filter(x => x !== h) }))}>&times;</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Home Medications</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Lisinopril"
                    className="form-control"
                    value={drugInput}
                    onChange={(e) => setDrugInput(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddDrug}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {formState.drugHistory.map(d => (
                    <span key={d} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                      {d} <span style={{ cursor: 'pointer', marginLeft: '6px' }} onClick={() => setFormState(prev => ({ ...prev, drugHistory: prev.drugHistory.filter(x => x !== d) }))}>&times;</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Lab Values form block */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Laboratory Values</label>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hemoglobin</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={formState.investigations.hb}
                      onChange={(e) => setFormState(prev => ({ ...prev, investigations: { ...prev.investigations, hb: Number(e.target.value) } }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Platelets</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formState.investigations.plt}
                      onChange={(e) => setFormState(prev => ({ ...prev, investigations: { ...prev.investigations, plt: Number(e.target.value) } }))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Creatinine</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={formState.investigations.cr}
                      onChange={(e) => setFormState(prev => ({ ...prev, investigations: { ...prev.investigations, cr: Number(e.target.value) } }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Potassium</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={formState.investigations.k}
                      onChange={(e) => setFormState(prev => ({ ...prev, investigations: { ...prev.investigations, k: Number(e.target.value) } }))}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Save Patient Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
