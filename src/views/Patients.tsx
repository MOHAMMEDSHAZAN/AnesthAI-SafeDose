import React, { useState } from 'react';
import { useApp, type Patient } from '../context/AppContext';
import { API_BASE_URL } from '../config/api';

export const Patients: React.FC = () => {
  const { patients, addPatient, updatePatient, deletePatient } = useApp();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [asaFilter, setAsaFilter] = useState<string>('All');
  const [isMimicImportOpen, setIsMimicImportOpen] = useState(false);
  const [mimicPatients, setMimicPatients] = useState<any[]>([]);
  const [mimicLoading, setMimicLoading] = useState(false);
  const [mimicSearch, setMimicSearch] = useState('');

  const fetchMimicPatients = async () => {
    setMimicLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/datasets/mimic-patients?limit=25${mimicSearch ? `&search=${encodeURIComponent(mimicSearch)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setMimicPatients(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMimicLoading(false);
    }
  };

  const handleImportMimicPatient = (mp: any) => {
    const newId = `MIMIC-${mp.subject_id}`;
    const nameMap = mp.gender === 'F' ? `Patient #${mp.subject_id} (F, ${mp.anchor_age}y)` : `Patient #${mp.subject_id} (M, ${mp.anchor_age}y)`;
    const newPatient: Patient = {
      id: newId,
      name: nameMap,
      age: mp.anchor_age || 60,
      gender: mp.gender === 'F' ? 'Female' : 'Male',
      weight: mp.gender === 'F' ? 68 : 78,
      height: mp.gender === 'F' ? 164 : 176,
      allergies: mp.comorbidity_count > 10 ? ['Penicillin (Moderate)'] : [],
      medicalHistory: [
        `Admission Type: ${mp.admission_type || 'EW EMER.'}`,
        `Demographic Race: ${mp.race || 'WHITE'}`,
        `Comorbidities Identified: ${mp.comorbidity_count || 3} Diagnoses`,
        `ICU Length of Stay: ${mp.icu_los_days ? mp.icu_los_days.toFixed(1) : 0} days`
      ],
      drugHistory: [`Active Prescriptions: ${mp.prescription_count || 6} inpatient orders`],
      asaScore: mp.icu_los_days > 2 ? 4 : (mp.comorbidity_count > 5 ? 3 : 2),
      mallampati: mp.anchor_age > 65 ? 3 : 2,
      comorbidities: [mp.admission_type || 'General Medical', `ICD Diagnoses (${mp.comorbidity_count || 3})`],
      procedure: `${mp.admission_type === 'EW EMER.' ? 'Emergent Exploratory Laparotomy' : 'Elective Surgical Procedure'}`,
      datasetRef: `MIMIC-IV 3.1 Patient #${mp.subject_id}`,
      admissionType: mp.admission_type || 'EW EMER.',
      icuDays: mp.icu_los_days || 0.0,
      investigations: {
        hb: mp.hemoglobin ? parseFloat(mp.hemoglobin.toFixed(1)) : 13.2,
        plt: mp.platelets ? Math.round(mp.platelets) : 240,
        cr: mp.creatinine ? parseFloat(mp.creatinine.toFixed(2)) : 1.05,
        k: mp.potassium ? parseFloat(mp.potassium.toFixed(2)) : 4.15,
        ecg: mp.icu_los_days > 0 ? 'Sinus Tachycardia with non-specific ST-T wave abnormalities' : 'Normal Sinus Rhythm',
        echo: 'Cardiac chamber dimensions evaluated per hospital stay',
        pft: 'Normal baseline ventilation',
        pregnancy: false,
        bloodGroup: 'O Positive'
      },
      vitals: {
        hr: mp.icu_los_days > 0 ? 94 : 76,
        bpSys: 130,
        bpDia: 80,
        spo2: mp.icu_los_days > 2 ? 94 : 98,
        temp: 36.8
      },
      anesthesiaPlan: {
        recommendation: mp.icu_los_days > 1 ? 'General' : 'Spinal',
        confidence: 95,
        reasoning: [
          `Derived from institutional MIMIC-IV 3.1 clinical cohort record #${mp.subject_id}.`,
          `Admission classification: ${mp.admission_type}, Age ${mp.anchor_age} (${mp.gender}).`,
          `Measured biomarkers: Hb ${mp.hemoglobin ? mp.hemoglobin.toFixed(1) : 13.2} g/dL, Creatinine ${mp.creatinine ? mp.creatinine.toFixed(2) : 1.05} mg/dL, Platelets ${mp.platelets ? Math.round(mp.platelets) : 240} k/uL.`
        ],
        alternatives: ['Combined Regional-General Anesthesia with Invasive Arterial Line'],
        warnings: [mp.creatinine > 1.4 ? 'Renal impairment noted; adjust medication clearance dosing.' : 'Standard hemodynamic vigilance.'],
        contraindications: []
      }
    };
    addPatient(newPatient);
    setSelectedPatientId(newId);
    setIsMimicImportOpen(false);
  };

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

  // Form Template states
  const [templateName, setTemplateName] = useState('');
  const [templateGender, setTemplateGender] = useState('Male');
  const [templateMobile, setTemplateMobile] = useState('');
  const [templateDay, setTemplateDay] = useState('1');
  const [templateMonth, setTemplateMonth] = useState('January');
  const [templateYear, setTemplateYear] = useState('1980');
  const [templateStreet, setTemplateStreet] = useState('');
  const [templateStreet2, setTemplateStreet2] = useState('');
  const [templateCity, setTemplateCity] = useState('');
  const [templateState, setTemplateState] = useState('');
  const [templateZip, setTemplateZip] = useState('');
  const [templateCountry, setTemplateCountry] = useState('');
  const [templateEmail, setTemplateEmail] = useState('');
  const [templatePrevious, setTemplatePrevious] = useState('');
  const [templateAppointments, setTemplateAppointments] = useState<string[]>([]);

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
    // Reset templates
    setTemplateName('');
    setTemplateGender('Male');
    setTemplateMobile('');
    setTemplateDay('1');
    setTemplateMonth('January');
    setTemplateYear('1980');
    setTemplateStreet('');
    setTemplateStreet2('');
    setTemplateCity('');
    setTemplateState('');
    setTemplateZip('');
    setTemplateCountry('');
    setTemplateEmail('');
    setTemplatePrevious('');
    setTemplateAppointments([]);
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
      const birthYear = parseInt(templateYear) || 1980;
      const computedAge = new Date().getFullYear() - birthYear;
      const addressString = `${templateStreet}${templateStreet2 ? ', ' + templateStreet2 : ''}, ${templateCity}, ${templateState} ${templateZip}, ${templateCountry}`;
      
      const newPatient: Patient = {
        name: templateName,
        age: computedAge,
        gender: templateGender as any,
        weight: formState.weight || 70,
        height: formState.height || 170,
        allergies: formState.allergies,
        medicalHistory: [
          ...formState.medicalHistory,
          `Address: ${addressString}`,
          `Mobile: ${templateMobile}`,
          `Email: ${templateEmail}`,
          templatePrevious.trim() ? `Previous Consulting: ${templatePrevious.trim()}` : ''
        ].filter(x => x !== ''),
        drugHistory: formState.drugHistory,
        asaScore: formState.asaScore,
        mallampati: formState.mallampati,
        comorbidities: [...formState.comorbidities, ...templateAppointments],
        investigations: formState.investigations,
        id: `SD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
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
      {/* Research & Clinical Decision-Support Banner */}
      <div className="prototype-advisory-banner">
        <span>
          <strong>RESEARCH PROTOTYPE</strong> • Synthetic Cohort Registry (SD-2026-XXXX). Clinical decision-support demonstration; not cleared for standalone primary diagnostic or treatment use. All entries represent simulated, non-identifiable test subjects.
        </span>
        <span className="badge badge-info">SYNTHETIC REGISTRY</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Surgical Patient Records</h1>
          <p className="page-subtitle">Demographics, histories, allergy screening, and pre-op profiles</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setIsMimicImportOpen(true);
              fetchMimicPatients();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(59,130,246,0.4)', color: '#60a5fa' }}
          >
            <span>⚡</span> Import from MIMIC-IV 3.1
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            + Register New Patient
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass" style={{ padding: '14px 20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search patient name, procedure, or clinical ID..."
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
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ASA Physical Status:</span>
          <select 
            className="form-control" 
            style={{ width: '120px', padding: '6px 12px' }}
            value={asaFilter}
            onChange={(e) => setAsaFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="1">ASA I</option>
            <option value="2">ASA II</option>
            <option value="3">ASA III</option>
            <option value="4">ASA IV</option>
            <option value="5">ASA V</option>
            <option value="6">ASA VI</option>
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
              {p.procedure && (
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#38bdf8', marginTop: '4px' }}>
                  🔪 {p.procedure}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>ID: {p.id} • {p.age} yrs • {p.gender}</span>
                <span>{p.weight} kg</span>
              </div>
              {p.datasetRef && (
                <div style={{ marginTop: '6px' }}>
                  <span style={{ fontSize: '0.6875rem', background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-block' }}>
                    📁 {p.datasetRef}
                  </span>
                </div>
              )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedPatient.name}</h2>
                  {selectedPatient.admissionType && (
                    <span className="badge badge-info">{selectedPatient.admissionType}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Patient ID: {selectedPatient.id}</span>
                  {selectedPatient.datasetRef && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Clinical Source: {selectedPatient.datasetRef}
                    </span>
                  )}
                  {selectedPatient.procedure && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Procedure: {selectedPatient.procedure}
                    </span>
                  )}
                  {selectedPatient.icuDays !== undefined && selectedPatient.icuDays > 0 && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      ICU Stay: {selectedPatient.icuDays.toFixed(1)} Days
                    </span>
                  )}
                </div>
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
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          {modalType === 'add' ? (
            /* Register Patient Form Template (matching the uploaded image) */
            <div className="glass" style={{
              width: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '40px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(26,28,35,0.85)',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.4)',
              color: '#f3f4f6',
              position: 'relative'
            }}>
              <button 
                className="modal-close-btn" 
                style={{ 
                  position: 'absolute', 
                  right: '20px', 
                  top: '20px', 
                  background: 'none', 
                  border: 'none', 
                  color: '#9ca3af', 
                  fontSize: '1.75rem', 
                  cursor: 'pointer',
                  lineHeight: '1'
                }} 
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '0.5px', fontFamily: 'var(--font-heading)' }}>
                  Please Enter Patients Details
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px' }}>
                  Fill the form below and submit your query we will contact you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Full Name */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '150px', fontSize: '0.85rem', fontWeight: 600 }}>Full Name <span style={{ color: 'var(--med-red)' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Patients Name"
                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    required
                  />
                </div>

                {/* Gender */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '150px', fontSize: '0.85rem', fontWeight: 600 }}>Gender <span style={{ color: 'var(--med-red)' }}>*</span></label>
                  <select
                    className="form-control"
                    style={{ flex: 1, backgroundColor: 'rgba(26,28,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={templateGender}
                    onChange={(e) => setTemplateGender(e.target.value)}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Mobile Number */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '150px', fontSize: '0.85rem', fontWeight: 600 }}>Mobile Number <span style={{ color: 'var(--med-red)' }}>*</span></label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Mobile Number"
                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={templateMobile}
                    onChange={(e) => setTemplateMobile(e.target.value)}
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '150px', fontSize: '0.85rem', fontWeight: 600 }}>Date of Birth <span style={{ color: 'var(--med-red)' }}>*</span></label>
                  <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                    {/* Day Dropdown */}
                    <select
                      className="form-control"
                      style={{ flex: 1, backgroundColor: 'rgba(26,28,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      value={templateDay}
                      onChange={(e) => setTemplateDay(e.target.value)}
                      required
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {/* Month Dropdown */}
                    <select
                      className="form-control"
                      style={{ flex: 1, backgroundColor: 'rgba(26,28,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      value={templateMonth}
                      onChange={(e) => setTemplateMonth(e.target.value)}
                      required
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {/* Year Input */}
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter Year"
                      style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      value={templateYear}
                      onChange={(e) => setTemplateYear(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <label style={{ width: '150px', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>Address <span style={{ color: 'var(--med-red)' }}>*</span></label>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <input type="text" className="form-control" placeholder="Street Address" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }} value={templateStreet} onChange={(e) => setTemplateStreet(e.target.value)} required />
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>Street Address</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="text" className="form-control" placeholder="Street Line 2" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }} value={templateStreet2} onChange={(e) => setTemplateStreet2(e.target.value)} />
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>Street Line 2</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <input type="text" className="form-control" placeholder="City" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }} value={templateCity} onChange={(e) => setTemplateCity(e.target.value)} required />
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>City</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="text" className="form-control" placeholder="State / Province" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }} value={templateState} onChange={(e) => setTemplateState(e.target.value)} required />
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>State / Province</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <input type="text" className="form-control" placeholder="Postal / Zip Code" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }} value={templateZip} onChange={(e) => setTemplateZip(e.target.value)} required />
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>Postal / Zip Code</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="text" className="form-control" placeholder="Country" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }} value={templateCountry} onChange={(e) => setTemplateCountry(e.target.value)} required />
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>Country</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* E-Mail Address */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '150px', fontSize: '0.85rem', fontWeight: 600 }}>E-Mail Address <span style={{ color: 'var(--med-red)' }}>*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="myname@example.com"
                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={templateEmail}
                    onChange={(e) => setTemplateEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Previous consultings details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mention the details of previous consultings with us.</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide notes or clinical history summary here..."
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', resize: 'none' }}
                    value={templatePrevious}
                    onChange={(e) => setTemplatePrevious(e.target.value)}
                  />
                </div>

                {/* Appointment type checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Select which types of appointment you require. <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      'Heart Checkup', 'Eye Checkup', 'Hearing Test',
                      'Blood Test', 'Normal Consulting', 'Skin Care'
                    ].map(appt => {
                      const isChecked = templateAppointments.includes(appt);
                      return (
                        <label key={appt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTemplateAppointments(prev => [...prev, appt]);
                              } else {
                                setTemplateAppointments(prev => prev.filter(x => x !== appt));
                              }
                            }}
                          />
                          <span>{appt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Collapsible Anesthesia-Specific Details (to satisfy the data-loading needs of the ML models) */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
                  <details style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                    <summary style={{ fontWeight: 700, color: 'var(--med-cyan)', marginBottom: '8px' }}>Clinical Anesthesia Metrics (Default Fallbacks)</summary>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px 0' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Weight (kg)</label>
                        <input type="number" className="form-control" style={{ fontSize: '0.8rem' }} value={formState.weight} onChange={(e) => setFormState(p => ({ ...p, weight: Number(e.target.value) }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Height (cm)</label>
                        <input type="number" className="form-control" style={{ fontSize: '0.8rem' }} value={formState.height} onChange={(e) => setFormState(p => ({ ...p, height: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>ASA Physical Status</label>
                        <select className="form-control" style={{ fontSize: '0.8rem' }} value={formState.asaScore} onChange={(e) => setFormState(p => ({ ...p, asaScore: Number(e.target.value) }))}>
                          <option value={1}>ASA I</option>
                          <option value={2}>ASA II</option>
                          <option value={3}>ASA III</option>
                          <option value={4}>ASA IV</option>
                          <option value={5}>ASA V</option>
                          <option value={6}>ASA VI</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Mallampati</label>
                        <select className="form-control" style={{ fontSize: '0.8rem' }} value={formState.mallampati} onChange={(e) => setFormState(p => ({ ...p, mallampati: Number(e.target.value) as any }))}>
                          <option value={1}>Class I</option>
                          <option value={2}>Class II</option>
                          <option value={3}>Class III</option>
                          <option value={4}>Class IV</option>
                        </select>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Submission button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontWeight: 800, fontSize: '0.95rem', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Save Patient Record & Submit Query
                </button>
              </form>
            </div>
          ) : (
            /* Original Edit Modal Content */
            <div className="modal-content glass" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color-glow)' }}>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
                Edit Patient Chart
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
                    <label className="form-label">ASA Physical Status Classification</label>
                    <select
                      className="form-control"
                      value={formState.asaScore}
                      onChange={(e) => setFormState(prev => ({ ...prev, asaScore: Number(e.target.value) }))}
                    >
                      <option value={1}>ASA I (Normal Healthy)</option>
                      <option value={2}>ASA II (Mild Systemic Disease)</option>
                      <option value={3}>ASA III (Severe Systemic Disease)</option>
                      <option value={4}>ASA IV (Severe Disease Constant Threat to Life)</option>
                      <option value={5}>ASA V (Moribund Not Expected to Survive Without Surgery)</option>
                      <option value={6}>ASA VI (Declared Brain-Dead Organ Donor)</option>
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
                  Save Changes
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* MIMIC-IV 3.1 Live Clinical Importer Modal */}
      {isMimicImportOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass" style={{
            width: '850px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '16px',
            border: '1px solid rgba(59,130,246,0.3)',
            backgroundColor: 'rgba(17,24,39,0.95)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            color: '#f3f4f6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏥</span> MIMIC-IV 3.1 Live Clinical Patient Cohort
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Select any real patient from the 364,627 institutional records to import into your perioperative plan
                </p>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsMimicImportOpen(false)}
                style={{ padding: '6px 14px' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search by Subject ID (e.g. 10000084, 10000032) or admission type..."
                value={mimicSearch}
                onChange={(e) => setMimicSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchMimicPatients(); }}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={fetchMimicPatients}>
                Search MIMIC-IV
              </button>
            </div>

            {mimicLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Streaming live MIMIC-IV 3.1 patient cohort...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                {mimicPatients.map(mp => (
                  <div 
                    key={mp.subject_id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#f3f4f6', fontSize: '0.95rem' }}>
                          Subject #{mp.subject_id}
                        </span>
                        <span className="badge badge-info">{mp.gender} • {mp.anchor_age} yrs</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#9ca3af' }}>
                          {mp.admission_type}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#9ca3af' }}>
                          {mp.race}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        <span><strong>Hb:</strong> {mp.hemoglobin ? mp.hemoglobin.toFixed(1) : 13.2} g/dL</span>
                        <span><strong>Platelets:</strong> {mp.platelets ? Math.round(mp.platelets) : 240} k/uL</span>
                        <span><strong>Creatinine:</strong> {mp.creatinine ? mp.creatinine.toFixed(2) : 1.05} mg/dL</span>
                        <span><strong>BUN:</strong> {mp.bun ? mp.bun.toFixed(1) : 16.0} mg/dL</span>
                        <span><strong>ICU LOS:</strong> {mp.icu_los_days ? `${mp.icu_los_days.toFixed(1)}d` : 'None'}</span>
                      </div>
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={() => handleImportMimicPatient(mp)}
                      style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                    >
                      + Import Patient
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
