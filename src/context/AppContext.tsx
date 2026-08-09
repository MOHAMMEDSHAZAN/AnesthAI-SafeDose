import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

// ==========================================
// SCHEMAS AND TYPES
// ==========================================

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number; // in kg
  height: number; // in cm
  allergies: string[];
  medicalHistory: string[];
  drugHistory: string[];
  asaScore: number;
  mallampati: 1 | 2 | 3 | 4;
  comorbidities: string[];
  investigations: {
    hb: number;       // Hemoglobin g/dL
    plt: number;      // Platelets x10^3/uL
    cr: number;       // Creatinine mg/dL
    k: number;        // Potassium mEq/L
    ecg: string;      // Summary of ECG
    echo: string;     // Summary of Echo
    pft: string;      // Pulmonary function tests
    pregnancy: boolean;
    bloodGroup: string;
  };
  vitals: {
    hr: number;
    bpSys: number;
    bpDia: number;
    spo2: number;
    temp: number;
  };
  anesthesiaPlan?: {
    recommendation: 'General' | 'Spinal' | 'Epidural' | 'Combined' | 'Regional' | 'MAC' | 'Sedation' | 'Local';
    confidence: number;
    reasoning: string[];
    alternatives: string[];
    warnings: string[];
    contraindications: string[];
  };
}

export interface OperatingRoom {
  id: string;
  name: string;
  status: 'Active' | 'Idle' | 'Emergency';
  patientId?: string;
  anesthesiologist: string;
  surgeryName: string;
  elapsedTime: number; // in minutes
  currentVitals?: {
    hr: number;
    bpSys: number;
    bpDia: number;
    spo2: number;
    etco2: number;
    temp: number;
  };
  alertMessage?: string;
}

export interface ClinicalNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  patientId?: string;
  dismissed: boolean;
}

export type UserRole = 
  | 'Anesthesiologist' 
  | 'Doctor' 
  | 'Resident' 
  | 'OT Nurse' 
  | 'PACU Nurse' 
  | 'Hospital Admin' 
  | 'Researcher' 
  | 'Student';

export interface SafetyChecklist {
  caseId: string;
  patientId: string;
  preAnesthesiaStatus: 'not_started' | 'in_progress' | 'completed';
  machineCheckStatus: 'not_started' | 'in_progress' | 'completed';
  preInductionStatus: 'not_started' | 'in_progress' | 'completed';
  timeoutStatus: 'not_started' | 'in_progress' | 'completed';
  intraopStatus: 'not_started' | 'in_progress' | 'completed';
  recoveryStatus: 'not_started' | 'in_progress' | 'completed';
  completedChecks: number;
  totalChecks: number;
  data: Record<string, any>;
  updatedAt?: string;
}

export interface AnesthesiaIncident {
  id?: string;
  caseId: string;
  patientId: string;
  preventable: 'yes' | 'no' | 'uncertain';
  narrative: string;
  severity: 'near_miss' | 'no_harm' | 'minor_harm' | 'moderate_harm' | 'severe_harm' | 'death';
  categories: string[];
  vitalsAtIncident: Record<string, any>;
  medicationInvolved: boolean;
  medicationDetails: Record<string, any>;
  airwayInvolved: boolean;
  airwayDetails: Record<string, any>;
  contributingFactors: string[];
  injuryOccurred: boolean;
  injuryDetails: Record<string, any>;
  outcome: string;
  reportedBy?: string;
  reporterDetails: Record<string, any>;
  followupStatus?: 'open' | 'review' | 'resolved' | 'closed';
  reviewer?: string;
  reviewerDate?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  followupNotes?: string;
  createdAt?: string;
}

export interface AuditLogEntry {
  userId: string;
  role: string;
  action: string;
  entity: string;
  reason?: string;
  timestamp?: string;
}

export interface AppContextType {
  patients: Patient[];
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;
  operatingRooms: OperatingRoom[];
  updateORStatus: (id: string, updates: Partial<OperatingRoom>) => void;
  notifications: ClinicalNotification[];
  addNotification: (notification: Omit<ClinicalNotification, 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissNotification: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Live OT simulation controls
  simulatedState: 'normal' | 'bradycardia' | 'hypoxia' | 'hypotension' | 'tachycardia' | 'hyperthermia';
  setSimulatedState: (state: 'normal' | 'bradycardia' | 'hypoxia' | 'hypotension' | 'tachycardia' | 'hyperthermia') => void;

  // Student portal scores
  studentScore: number;
  addStudentPoints: (pts: number) => void;

  // Safety & Quality additions
  checklists: SafetyChecklist[];
  incidents: AnesthesiaIncident[];
  auditLogs: AuditLogEntry[];
  saveSafetyChecklist: (checklist: SafetyChecklist) => Promise<void>;
  submitIncidentReport: (report: AnesthesiaIncident) => Promise<string>;
  updateIncidentStatus: (incidentId: string, updates: Partial<AnesthesiaIncident>) => Promise<void>;
  logSafetyAudit: (action: string, entity: string, reason?: string) => Promise<void>;
  activeCaseId: string;
  setActiveCaseId: (id: string) => void;
  activePatientId: string;
  setActivePatientId: (id: string) => void;
}

// ==========================================
// DEFAULT MOCK DATA
// ==========================================

const defaultPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Robert Miller',
    age: 67,
    gender: 'Male',
    weight: 84,
    height: 178,
    allergies: ['Penicillin', 'Sulfa Drugs'],
    medicalHistory: ['Coronary Artery Disease', 'Hypertension', 'Type 2 Diabetes'],
    drugHistory: ['Aspirin 81mg', 'Lisinopril 10mg', 'Metformin 500mg'],
    asaScore: 3,
    mallampati: 3,
    comorbidities: ['Hypertension', 'CAD'],
    investigations: {
      hb: 12.4,
      plt: 198,
      cr: 1.2,
      k: 4.1,
      ecg: 'Sinus rhythm, Q waves in inferior leads (old infarct)',
      echo: 'LVEF 45%, mild diastolic dysfunction',
      pft: 'Mild obstructive pattern',
      pregnancy: false,
      bloodGroup: 'A Positive',
    },
    vitals: { hr: 72, bpSys: 142, bpDia: 88, spo2: 95, temp: 36.8 },
    anesthesiaPlan: {
      recommendation: 'General',
      confidence: 90,
      reasoning: [
        'Complex laparoscopic prostatectomy requires secure airway protection via endotracheal intubation.',
        'Length of procedure and steep Trendelenburg position contraindicates pure regional techniques.',
        'Patient has high cardiac risk profile requiring controlled hemodynamic monitoring.'
      ],
      alternatives: ['Combined General-Epidural for post-op analgesia'],
      warnings: ['Post-induction hypotension risk due to ACE inhibitors and poor myocardial compliance.'],
      contraindications: ['Spinal anesthesia as sole technique (inadequate procedural time).']
    }
  },
  {
    id: 'P002',
    name: 'Sophia Patel',
    age: 28,
    gender: 'Female',
    weight: 62,
    height: 165,
    allergies: ['Latex'],
    medicalHistory: ['Mild Intermittent Asthma'],
    drugHistory: ['Albuterol Inhaler PRN'],
    asaScore: 2,
    mallampati: 1,
    comorbidities: ['Asthma'],
    investigations: {
      hb: 13.8,
      plt: 250,
      cr: 0.7,
      k: 4.3,
      ecg: 'Normal Sinus Rhythm',
      echo: 'Normal LVEF 60%',
      pft: 'Within normal limits',
      pregnancy: false,
      bloodGroup: 'O Positive',
    },
    vitals: { hr: 80, bpSys: 118, bpDia: 74, spo2: 99, temp: 37.0 },
    anesthesiaPlan: {
      recommendation: 'Spinal',
      confidence: 95,
      reasoning: [
        'Elective Cesarean Section is ideal for spinal anesthesia, preserving maternal consciousness.',
        'Avoids potential airway irritation and bronchospasm from general anesthesia in an asthmatic.',
        'Excellent post-procedure analgesic profile.'
      ],
      alternatives: ['Epidural', 'General Anesthesia (Rapid Sequence Induction for emergency only)'],
      warnings: ['Potential asthma flare-up; keep albuterol available and use preservative-free spinal meds.'],
      contraindications: ['Refusal', 'Coagulopathy (normal platelets of 250k rules this out).']
    }
  },
  {
    id: 'P003',
    name: 'Liam Chen',
    age: 9,
    gender: 'Male',
    weight: 31,
    height: 132,
    allergies: [],
    medicalHistory: ['No significant past medical history'],
    drugHistory: [],
    asaScore: 1,
    mallampati: 2,
    comorbidities: [],
    investigations: {
      hb: 14.1,
      plt: 290,
      cr: 0.4,
      k: 4.5,
      ecg: 'Normal Sinus Rhythm for age',
      echo: 'Unremarkable',
      pft: 'Not indicated',
      pregnancy: false,
      bloodGroup: 'B Negative',
    },
    vitals: { hr: 95, bpSys: 104, bpDia: 62, spo2: 98, temp: 36.6 },
    anesthesiaPlan: {
      recommendation: 'General',
      confidence: 98,
      reasoning: [
        'Pediatric patient undergoing tonsillectomy requiring active airway preservation (cuffed ETT or LMA).',
        'Inhalation induction (sevoflurane/N2O/O2) is highly tolerated.'
      ],
      alternatives: ['None (MAC or Regional is clinically inappropriate for pediatric tonsillectomy)'],
      warnings: ['Laryngospasm risk post-extubation. Assure deep suctioning and extubate fully awake.'],
      contraindications: ['Scoliosis (unrelated, but spinal isn\'t indicated).']
    }
  }
];

const defaultORs: OperatingRoom[] = [
  {
    id: 'OR-01',
    name: 'Operating Room 1',
    status: 'Active',
    patientId: 'P001',
    anesthesiologist: 'Dr. Sarah Jenkins',
    surgeryName: 'Laparoscopic Prostatectomy',
    elapsedTime: 45,
    currentVitals: { hr: 74, bpSys: 138, bpDia: 82, spo2: 96, etco2: 38, temp: 36.5 }
  },
  {
    id: 'OR-02',
    name: 'Operating Room 2',
    status: 'Active',
    patientId: 'P003',
    anesthesiologist: 'Dr. Alex Rivera',
    surgeryName: 'Tonsillectomy & Adenoidectomy',
    elapsedTime: 15,
    currentVitals: { hr: 98, bpSys: 102, bpDia: 60, spo2: 99, etco2: 40, temp: 36.7 }
  },
  {
    id: 'OR-03',
    name: 'Operating Room 3',
    status: 'Idle',
    anesthesiologist: 'Dr. Michael Chang',
    surgeryName: 'N/A',
    elapsedTime: 0
  }
];

const defaultNotifications: ClinicalNotification[] = [
  {
    id: 'n1',
    type: 'warning',
    title: 'Penicillin Allergy Alert',
    message: 'Patient Robert Miller (P001) has documented severe Penicillin allergy. Avoid beta-lactam antibiotics.',
    timestamp: '12:30 PM',
    patientId: 'P001',
    dismissed: false
  },
  {
    id: 'n2',
    type: 'critical',
    title: 'Hypoxia Alarm OR 1',
    message: 'OR 1 patient SpO2 dropped below 92% (Currently 89%). Verify ventilation circuit and oxygen delivery.',
    timestamp: '12:44 PM',
    patientId: 'P001',
    dismissed: false
  },
  {
    id: 'n3',
    type: 'info',
    title: 'PACU Clearance Requested',
    message: 'Sophia Patel (P002) has reached Aldrete score 9/10 and is candidate for discharge to ward.',
    timestamp: '12:40 PM',
    patientId: 'P002',
    dismissed: false
  }
];

// ==========================================
// CONTEXT PROVIDER IMPLEMENTATION
// ==========================================

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(defaultPatients);
  const [operatingRooms, setOperatingRooms] = useState<OperatingRoom[]>(defaultORs);
  const [notifications, setNotifications] = useState<ClinicalNotification[]>(defaultNotifications);
  const [userRole, setUserRole] = useState<UserRole>('Anesthesiologist');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [simulatedState, setSimulatedState] = useState<'normal' | 'bradycardia' | 'hypoxia' | 'hypotension' | 'tachycardia' | 'hyperthermia'>('normal');
  const [studentScore, setStudentScore] = useState<number>(180);

  const [checklists, setChecklists] = useState<SafetyChecklist[]>([]);
  const [incidents, setIncidents] = useState<AnesthesiaIncident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>('OR-01');
  const [activePatientId, setActivePatientId] = useState<string>('P001');

  // Local storage caching helpers to keep the app operational offline
  const saveLocalPatients = (newPatients: Patient[]) => {
    localStorage.setItem('anesthai_patients', JSON.stringify(newPatients));
  };
  const saveLocalORs = (newORs: OperatingRoom[]) => {
    localStorage.setItem('anesthai_operating_rooms', JSON.stringify(newORs));
  };
  const saveLocalNotifs = (newNotifs: ClinicalNotification[]) => {
    localStorage.setItem('anesthai_notifications', JSON.stringify(newNotifs));
  };
  const saveLocalChecklists = (items: SafetyChecklist[]) => {
    localStorage.setItem('anesthai_checklists', JSON.stringify(items));
  };
  const saveLocalIncidents = (items: AnesthesiaIncident[]) => {
    localStorage.setItem('anesthai_incidents', JSON.stringify(items));
  };
  const saveLocalAuditLogs = (items: AuditLogEntry[]) => {
    localStorage.setItem('anesthai_audit_logs', JSON.stringify(items));
  };

  // Sync with Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      // Fallback: If Supabase credentials are not filled, use localStorage or default mock data
      if (!isSupabaseConfigured || !supabase) {
        const storedPatients = localStorage.getItem('anesthai_patients');
        if (storedPatients) {
          try { setPatients(JSON.parse(storedPatients)); } catch (e) { console.error('Error parsing local patients:', e); }
        } else {
          saveLocalPatients(defaultPatients);
        }
        
        const storedORs = localStorage.getItem('anesthai_operating_rooms');
        if (storedORs) {
          try { setOperatingRooms(JSON.parse(storedORs)); } catch (e) { console.error('Error parsing local ORs:', e); }
        } else {
          saveLocalORs(defaultORs);
        }

        const storedNotifs = localStorage.getItem('anesthai_notifications');
        if (storedNotifs) {
          try { setNotifications(JSON.parse(storedNotifs)); } catch (e) { console.error('Error parsing local notifications:', e); }
        } else {
          saveLocalNotifs(defaultNotifications);
        }
        return;
      }

      try {
        console.log('Supabase: Fetching patients...');
        const { data: dbPatients, error: pError } = await supabase.from('patients').select('*');
        if (pError) throw pError;

        if (dbPatients && dbPatients.length > 0) {
          const mappedPatients: Patient[] = dbPatients.map((p: any) => ({
            id: p.id,
            name: p.name,
            age: p.age,
            gender: p.gender,
            weight: Number(p.weight),
            height: Number(p.height),
            allergies: p.allergies || [],
            medicalHistory: p.medical_history || [],
            drugHistory: p.drug_history || [],
            asaScore: p.asa_score,
            mallampati: p.mallampati,
            comorbidities: p.comorbidities || [],
            investigations: p.investigations || {},
            vitals: p.vitals || {},
            anesthesiaPlan: p.anesthesia_plan || undefined
          }));
          setPatients(mappedPatients);
          saveLocalPatients(mappedPatients);
        } else {
          console.log('Supabase: Seeding empty patients table...');
          for (const p of defaultPatients) {
            await supabase.from('patients').insert({
              id: p.id,
              name: p.name,
              age: p.age,
              gender: p.gender,
              weight: p.weight,
              height: p.height,
              allergies: p.allergies,
              medical_history: p.medicalHistory,
              drug_history: p.drugHistory,
              asa_score: p.asaScore,
              mallampati: p.mallampati,
              comorbidities: p.comorbidities,
              investigations: p.investigations,
              vitals: p.vitals,
              anesthesia_plan: p.anesthesiaPlan
            });
          }
        }

        console.log('Supabase: Fetching operating rooms...');
        const { data: dbORs, error: orError } = await supabase.from('operating_rooms').select('*');
        if (orError) throw orError;

        if (dbORs && dbORs.length > 0) {
          const mappedORs: OperatingRoom[] = dbORs.map((or: any) => ({
            id: or.id,
            name: or.name,
            status: or.status,
            patientId: or.patient_id || undefined,
            anesthesiologist: or.anesthesiologist || 'N/A',
            surgeryName: or.surgery_name || 'N/A',
            elapsedTime: or.elapsed_time || 0,
            currentVitals: or.current_vitals || undefined,
            alertMessage: or.alert_message || undefined
          }));
          setOperatingRooms(mappedORs);
          saveLocalORs(mappedORs);
        } else {
          console.log('Supabase: Seeding empty operating rooms table...');
          for (const or of defaultORs) {
            await supabase.from('operating_rooms').insert({
              id: or.id,
              name: or.name,
              status: or.status,
              patient_id: or.patientId || null,
              anesthesiologist: or.anesthesiologist,
              surgery_name: or.surgeryName,
              elapsed_time: or.elapsedTime,
              current_vitals: or.currentVitals || {}
            });
          }
        }

        console.log('Supabase: Fetching notifications...');
        const { data: dbNotifs, error: nError } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (nError) throw nError;

        if (dbNotifs && dbNotifs.length > 0) {
          const mappedNotifs: ClinicalNotification[] = dbNotifs.map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message || '',
            timestamp: n.timestamp || '',
            patientId: n.patient_id || undefined,
            dismissed: n.dismissed || false
          }));
          setNotifications(mappedNotifs);
          saveLocalNotifs(mappedNotifs);
        } else {
          console.log('Supabase: Seeding empty notifications table...');
          for (const n of defaultNotifications) {
            await supabase.from('notifications').insert({
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              timestamp: n.timestamp,
              patient_id: n.patientId || null,
              dismissed: n.dismissed
            });
          }
        }

      } catch (err) {
        console.error('Supabase load failed, falling back to local database values:', err);
      }
    };

    loadData();
  }, []);

  // Load safety checklist and incident data on mount
  useEffect(() => {
    const loadSafetyData = async () => {
      // 1. Try checklists
      try {
        const res = await fetch('http://localhost:8000/api/safety/checklists');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((c: any) => ({
            caseId: c.case_id,
            patientId: c.patient_id,
            preAnesthesiaStatus: c.pre_anesthesia_status,
            machineCheckStatus: c.machine_check_status,
            preInductionStatus: c.pre_induction_status,
            timeoutStatus: c.timeout_status,
            intraopStatus: c.intraop_status,
            recoveryStatus: c.recovery_status,
            completedChecks: c.completed_checks,
            totalChecks: c.total_checks,
            data: c.data || {}
          }));
          setChecklists(mapped);
          saveLocalChecklists(mapped);
        }
      } catch (e) {
        const local = localStorage.getItem('anesthai_checklists');
        if (local) {
          try { setChecklists(JSON.parse(local)); } catch (err) { console.error(err); }
        }
      }

      // 2. Try incidents
      try {
        const res = await fetch('http://localhost:8000/api/safety/incidents');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((i: any) => ({
            id: i.id,
            caseId: i.case_id,
            patientId: i.patient_id,
            preventable: i.preventable,
            narrative: i.narrative,
            severity: i.severity,
            categories: i.categories || [],
            vitalsAtIncident: i.vitals_at_incident || {},
            medicationInvolved: i.medication_involved || false,
            medicationDetails: i.medication_details || {},
            airwayInvolved: i.airway_involved || false,
            airwayDetails: i.airway_details || {},
            contributingFactors: i.contributing_factors || [],
            injuryOccurred: i.injury_occurred || false,
            injuryDetails: i.injury_details || {},
            outcome: i.outcome,
            reportedBy: i.reported_by,
            reporterDetails: i.reporter_details || {},
            followupStatus: i.followup_status || 'open',
            reviewer: i.reviewer,
            reviewerDate: i.reviewer_date,
            correctiveAction: i.corrective_action,
            preventiveAction: i.preventive_action,
            followupNotes: i.followup_notes,
            createdAt: i.created_at
          }));
          setIncidents(mapped);
          saveLocalIncidents(mapped);
        }
      } catch (e) {
        const local = localStorage.getItem('anesthai_incidents');
        if (local) {
          try { setIncidents(JSON.parse(local)); } catch (err) { console.error(err); }
        }
      }

      // 3. Try audit logs
      try {
        const res = await fetch('http://localhost:8000/api/safety/audit-logs');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((a: any) => ({
            userId: a.user_id,
            role: a.role,
            action: a.action,
            entity: a.entity,
            reason: a.reason,
            timestamp: a.timestamp
          }));
          setAuditLogs(mapped);
          saveLocalAuditLogs(mapped);
        }
      } catch (e) {
        const local = localStorage.getItem('anesthai_audit_logs');
        if (local) {
          try { setAuditLogs(JSON.parse(local)); } catch (err) { console.error(err); }
        }
      }
    };

    loadSafetyData();
  }, []);

  // Sync index.css theme class on body
  useEffect(() => {
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('light-mode');
    } else {
      body.classList.remove('light-mode');
    }
  }, [theme]);

  // Handle live OT simulation state changes
  useEffect(() => {
    if (simulatedState === 'normal') return;

    // Trigger notification if simulation is anything else than normal
    const title = `Simulated Alert: ${simulatedState.toUpperCase()}`;
    let desc = '';
    let level: 'warning' | 'critical' = 'warning';

    if (simulatedState === 'hypoxia') {
      desc = 'SpO2 critical drop. Check ETT placement and circuit leaks.';
      level = 'critical';
    } else if (simulatedState === 'hypotension') {
      desc = 'MAP is below 60 mmHg. Recommend bolus fluid or vasopressor.';
      level = 'critical';
    } else if (simulatedState === 'bradycardia') {
      desc = 'Heart rate dropping. Consider atropine.';
      level = 'warning';
    } else if (simulatedState === 'hyperthermia') {
      desc = 'Core temp rising fast. Evaluate for Malignant Hyperthermia.';
      level = 'critical';
    } else {
      desc = 'Patient vitals fluctuating outside normal thresholds.';
    }

    addNotification({
      type: level,
      title,
      message: desc,
      patientId: 'P001'
    });
  }, [simulatedState]);

  // CRUD for Patients with live database sync
  const addPatient = async (patient: Patient) => {
    setPatients((prev) => {
      const updated = [...prev, patient];
      saveLocalPatients(updated);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('patients').insert({
          id: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          weight: patient.weight,
          height: patient.height,
          allergies: patient.allergies,
          medical_history: patient.medicalHistory,
          drug_history: patient.drugHistory,
          asa_score: patient.asaScore,
          mallampati: patient.mallampati,
          comorbidities: patient.comorbidities,
          investigations: patient.investigations,
          vitals: patient.vitals,
          anesthesia_plan: patient.anesthesiaPlan
        });
      } catch (err) {
        console.error('Failed to sync added patient to Supabase:', err);
      }
    }
  };

  const updatePatient = async (updated: Patient) => {
    setPatients((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      saveLocalPatients(next);
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('patients')
          .update({
            name: updated.name,
            age: updated.age,
            gender: updated.gender,
            weight: updated.weight,
            height: updated.height,
            allergies: updated.allergies,
            medical_history: updated.medicalHistory,
            drug_history: updated.drugHistory,
            asa_score: updated.asaScore,
            mallampati: updated.mallampati,
            comorbidities: updated.comorbidities,
            investigations: updated.investigations,
            vitals: updated.vitals,
            anesthesia_plan: updated.anesthesiaPlan
          })
          .eq('id', updated.id);
      } catch (err) {
        console.error('Failed to sync updated patient to Supabase:', err);
      }
    }
  };

  const deletePatient = async (id: string) => {
    setPatients((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveLocalPatients(next);
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('patients').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to sync deleted patient to Supabase:', err);
      }
    }
  };

  // OR Management with live database sync
  const updateORStatus = async (id: string, updates: Partial<OperatingRoom>) => {
    setOperatingRooms((prev) => {
      const next = prev.map((or) => (or.id === id ? { ...or, ...updates } : or));
      saveLocalORs(next);
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.patientId !== undefined) dbUpdates.patient_id = updates.patientId;
        if (updates.anesthesiologist !== undefined) dbUpdates.anesthesiologist = updates.anesthesiologist;
        if (updates.surgeryName !== undefined) dbUpdates.surgery_name = updates.surgeryName;
        if (updates.elapsedTime !== undefined) dbUpdates.elapsed_time = updates.elapsedTime;
        if (updates.currentVitals !== undefined) dbUpdates.current_vitals = updates.currentVitals;
        if (updates.alertMessage !== undefined) dbUpdates.alert_message = updates.alertMessage;

        await supabase.from('operating_rooms').update(dbUpdates).eq('id', id);
      } catch (err) {
        console.error('Failed to sync OR status updates to Supabase:', err);
      }
    }
  };

  // Notification Feed with live database sync
  const addNotification = async (n: Omit<ClinicalNotification, 'id' | 'timestamp' | 'dismissed'>) => {
    const newNotif: ClinicalNotification = {
      ...n,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dismissed: false,
    };

    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      saveLocalNotifs(next);
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').insert({
          id: newNotif.id,
          type: newNotif.type,
          title: newNotif.title,
          message: newNotif.message,
          timestamp: newNotif.timestamp,
          patient_id: newNotif.patientId || null,
          dismissed: newNotif.dismissed
        });
      } catch (err) {
        console.error('Failed to sync notification to Supabase:', err);
      }
    }
  };

  const dismissNotification = async (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n));
      saveLocalNotifs(next);
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('notifications')
          .update({ dismissed: true })
          .eq('id', id);
      } catch (err) {
        console.error('Failed to sync dismissed notification to Supabase:', err);
      }
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addStudentPoints = (pts: number) => {
    setStudentScore((prev) => prev + pts);
  };

  const saveSafetyChecklist = async (checklist: SafetyChecklist) => {
    // Update local state
    setChecklists((prev) => {
      const exists = prev.find((c) => c.caseId === checklist.caseId);
      let next;
      if (exists) {
        next = prev.map((c) => (c.caseId === checklist.caseId ? { ...c, ...checklist, updatedAt: new Date().toISOString() } : c));
      } else {
        next = [...prev, { ...checklist, updatedAt: new Date().toISOString() }];
      }
      saveLocalChecklists(next);
      return next;
    });

    // Send to backend
    try {
      await fetch('http://localhost:8000/api/safety/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklist),
      });
    } catch (e) {
      console.warn('FastAPI offline, checklist stored locally');
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const dbRow = {
          case_id: checklist.caseId,
          patient_id: checklist.patientId,
          pre_anesthesia_status: checklist.preAnesthesiaStatus,
          machine_check_status: checklist.machineCheckStatus,
          pre_induction_status: checklist.preInductionStatus,
          timeout_status: checklist.timeoutStatus,
          intraop_status: checklist.intraopStatus,
          recovery_status: checklist.recoveryStatus,
          completed_checks: checklist.completedChecks,
          total_checks: checklist.totalChecks,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('safety_checklists').upsert(dbRow, { onConflict: 'case_id' });
        if (error) console.error('Supabase checklist sync error:', error);
      } catch (err) {
        console.error('Supabase checklist sync error:', err);
      }
    }
  };

  const submitIncidentReport = async (report: AnesthesiaIncident): Promise<string> => {
    let newIncidentId = report.id || `ASI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullReport = {
      ...report,
      id: newIncidentId,
      followupStatus: report.followupStatus || 'open',
      createdAt: report.createdAt || new Date().toISOString(),
    };

    setIncidents((prev) => {
      const next = [fullReport, ...prev.filter((i) => i.id !== newIncidentId)];
      saveLocalIncidents(next);
      return next;
    });

    try {
      const res = await fetch('http://localhost:8000/api/safety/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullReport),
      });
      if (res.ok) {
        const data = await res.json();
        newIncidentId = data.incident_id;
      }
    } catch (e) {
      console.warn('FastAPI offline, incident report stored locally');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const dbRow = {
          id: newIncidentId,
          case_id: fullReport.caseId,
          patient_id: fullReport.patientId,
          preventable: fullReport.preventable,
          narrative: fullReport.narrative,
          severity: fullReport.severity,
          categories: fullReport.categories,
          vitals_at_incident: fullReport.vitalsAtIncident,
          medication_involved: fullReport.medicationInvolved,
          medication_details: fullReport.medicationDetails,
          airway_involved: fullReport.airwayInvolved,
          airway_details: fullReport.airwayDetails,
          contributing_factors: fullReport.contributingFactors,
          injury_occurred: fullReport.injuryOccurred,
          injury_details: fullReport.injuryDetails,
          outcome: fullReport.outcome,
          followup_status: fullReport.followupStatus,
        };
        await supabase.from('anesthesia_incidents').upsert(dbRow, { onConflict: 'id' });
      } catch (err) {
        console.error('Supabase incident sync error:', err);
      }
    }

    return newIncidentId;
  };

  const updateIncidentStatus = async (incidentId: string, updates: Partial<AnesthesiaIncident>) => {
    setIncidents((prev) => {
      const next = prev.map((inc) => (inc.id === incidentId ? { ...inc, ...updates } : inc));
      saveLocalIncidents(next);
      return next;
    });

    try {
      await fetch(`http://localhost:8000/api/safety/incidents/${incidentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('FastAPI offline, update incident stored locally');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const dbUpdates: any = {};
        if (updates.followupStatus !== undefined) dbUpdates.followup_status = updates.followupStatus;
        if (updates.reviewer !== undefined) dbUpdates.reviewer = updates.reviewer;
        if (updates.correctiveAction !== undefined) dbUpdates.corrective_action = updates.correctiveAction;
        if (updates.preventiveAction !== undefined) dbUpdates.preventive_action = updates.preventiveAction;
        if (updates.followupNotes !== undefined) dbUpdates.followup_notes = updates.followupNotes;

        await supabase.from('anesthesia_incidents').update(dbUpdates).eq('id', incidentId);
      } catch (err) {
        console.error('Supabase update incident error:', err);
      }
    }
  };

  const logSafetyAudit = async (action: string, entity: string, reason?: string) => {
    const newEntry: AuditLogEntry = {
      userId: 'Staff ID #4289',
      role: userRole,
      action,
      entity,
      reason,
      timestamp: new Date().toISOString(),
    };

    setAuditLogs((prev) => {
      const next = [newEntry, ...prev];
      saveLocalAuditLogs(next);
      return next;
    });

    try {
      await fetch('http://localhost:8000/api/safety/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch (e) {
      console.warn('FastAPI offline, audit log stored locally');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('safety_audit_logs').insert({
          user_id: newEntry.userId,
          role: newEntry.role,
          action: newEntry.action,
          entity: newEntry.entity,
          reason: newEntry.reason || null,
        });
      } catch (err) {
        console.error('Supabase audit log error:', err);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        patients,
        addPatient,
        updatePatient,
        deletePatient,
        operatingRooms,
        updateORStatus,
        notifications,
        addNotification,
        dismissNotification,
        userRole,
        setUserRole,
        theme,
        toggleTheme,
        isSearchOpen,
        setIsSearchOpen,
        simulatedState,
        setSimulatedState,
        studentScore,
        addStudentPoints,
        checklists,
        incidents,
        auditLogs,
        saveSafetyChecklist,
        submitIncidentReport,
        updateIncidentStatus,
        logSafetyAudit,
        activeCaseId,
        setActiveCaseId,
        activePatientId,
        setActivePatientId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
