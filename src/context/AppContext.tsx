import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // CRUD for Patients
  const addPatient = (patient: Patient) => {
    setPatients((prev) => [...prev, patient]);
  };

  const updatePatient = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  // OR Management
  const updateORStatus = (id: string, updates: Partial<OperatingRoom>) => {
    setOperatingRooms((prev) =>
      prev.map((or) => (or.id === id ? { ...or, ...updates } : or))
    );
  };

  // Notification Feed
  const addNotification = (n: Omit<ClinicalNotification, 'id' | 'timestamp' | 'dismissed'>) => {
    const newNotif: ClinicalNotification = {
      ...n,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dismissed: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    );
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addStudentPoints = (pts: number) => {
    setStudentScore((prev) => prev + pts);
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
