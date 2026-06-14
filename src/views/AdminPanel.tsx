import React, { useState } from 'react';

interface AuditLog {
  timestamp: string;
  user: string;
  action: string;
  ip: string;
}

const initialAuditLogs: AuditLog[] = [
  { timestamp: '12:30:15', user: 'Dr. Sarah Jenkins', action: 'Accessed Patient P001 pre-op evaluation sheet', ip: '10.120.40.82' },
  { timestamp: '12:35:42', user: 'Dr. Alex Rivera', action: 'Computed Propofol induction dose (weight: 31kg)', ip: '10.120.40.104' },
  { timestamp: '12:40:08', user: 'Nurse Linda Cho', action: 'Modified Aldrete recovery rating for Sophia Patel', ip: '10.120.44.15' },
  { timestamp: '12:44:19', user: 'Dr. Sarah Jenkins', action: 'TRIGGERED EMERGENCY PORTAL - OR 1 HYPOXIA ALARM', ip: '10.120.40.82' }
];

export const AdminPanel: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [departmentName, setDepartmentName] = useState('Anesthesiology & Critical Care');
  const [autoTimeout, setAutoTimeout] = useState('15'); // minutes

  // Active sync patient selector
  const [selectedPatientId, setSelectedPatientId] = useState('P001');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [activeFHIRTab, setActiveFHIRTab] = useState<'Patient' | 'Observation'>('Patient');

  // Drug inventory stock details
  const [inventory, setInventory] = useState([
    { name: 'Propofol 1% 20mL', stock: 120, limit: 30, unit: 'Vials', status: 'In Stock' },
    { name: 'Fentanyl 100mcg 2mL', stock: 14, limit: 25, unit: 'Ampules', status: 'Reorder Alert' },
    { name: 'Rocuronium 50mg 5mL', stock: 48, limit: 15, unit: 'Vials', status: 'In Stock' },
    { name: 'Epinephrine 1mg 1mL', stock: 85, limit: 20, unit: 'Ampules', status: 'In Stock' },
    { name: 'Dantrolene 20mg IV', stock: 36, limit: 36, unit: 'Vials', status: 'Reorder Alert' }
  ]);

  const handleReorder = (drugName: string) => {
    setInventory(prev => prev.map(item => {
      if (item.name === drugName) {
        const now = new Date().toLocaleTimeString();
        const newLog = { timestamp: now, user: 'Admin User', action: `Reordered stock for ${drugName}`, ip: '127.0.0.1' };
        setLogs(prevLogs => [newLog, ...prevLogs]);
        return { ...item, stock: item.stock + 50, status: 'In Stock' };
      }
      return item;
    }));
  };

  // Mock patient data for FHIR JSON mapping
  const fhirPatientData: Record<string, { family: string, given: string, gender: string, birth: string }> = {
    P001: { family: 'Miller', given: 'Robert', gender: 'male', birth: '1959-05-12' },
    P002: { family: 'Patel', given: 'Sophia', gender: 'female', birth: '1998-09-18' },
    P003: { family: 'Chen', given: 'Liam', gender: 'male', birth: '2017-02-24' }
  };

  const currentPatient = fhirPatientData[selectedPatientId] || fhirPatientData.P001;

  // FHIR JSON Structures
  const patientFHIRJson = {
    resourceType: "Patient",
    id: selectedPatientId,
    active: true,
    name: [
      {
        use: "official",
        family: currentPatient.family,
        given: [currentPatient.given]
      }
    ],
    gender: currentPatient.gender,
    birthDate: currentPatient.birth,
    managingOrganization: {
      reference: "Organization/anes-dept-01",
      display: departmentName
    }
  };

  const observationFHIRJson = {
    resourceType: "Observation",
    id: `obs-${selectedPatientId}-vitals`,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs"
          }
        ]
      }
    ],
    subject: {
      reference: `Patient/${selectedPatientId}`,
      display: `${currentPatient.given} ${currentPatient.family}`
    },
    effectiveDateTime: new Date().toISOString(),
    component: [
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8867-4",
              display: "Heart rate"
            }
          ]
        },
        valueQuantity: {
          value: selectedPatientId === 'P001' ? 72 : selectedPatientId === 'P002' ? 80 : 95,
          unit: "beats/minute",
          system: "http://unitsofmeasure.org",
          code: "/min"
        }
      },
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "2708-6",
              display: "Oxygen saturation"
            }
          ]
        },
        valueQuantity: {
          value: selectedPatientId === 'P001' ? 95 : selectedPatientId === 'P002' ? 99 : 98,
          unit: "%",
          system: "http://unitsofmeasure.org",
          code: "%"
        }
      }
    ]
  };

  // EHR sync runner animation
  const handleEHRSync = () => {
    setIsSyncing(true);
    setSyncLogs([]);

    const steps = [
      "Establishing TLS 1.3 socket handshake with ehr.hospital-network.local...",
      "Handshake success. Cipher: TLS_AES_256_GCM_SHA384",
      "Verifying clinical authorization tokens... JWT verified.",
      `POST /fhir/r4/Patient/${selectedPatientId} HTTP/1.1... Status 201 Created`,
      `POST /fhir/r4/Observation/obs-${selectedPatientId}-vitals HTTP/1.1... Status 201 Created`,
      "Sync completed. 2 FHIR records transmitted successfully. Closing channel."
    ];

    let current = 0;
    const interval = setInterval(() => {
      setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[current]}`]);
      current += 1;

      if (current >= steps.length) {
        clearInterval(interval);
        setIsSyncing(false);
        // Add to active audit log
        const now = new Date().toLocaleTimeString();
        const newLog = { 
          timestamp: now, 
          user: 'System Sync (EHR)', 
          action: `Successfully pushed FHIR records for Patient ${selectedPatientId} to central database`, 
          ip: '10.120.2.14' 
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
      }
    }, 450);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospital Administration Portal</h1>
          <p className="page-subtitle">Department allocations, drug inventory stock thresholds, and security compliance audit trails</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Drug Inventory status */}
        <div className="glass" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--med-cyan)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Critical Drug Inventory Stock Status
          </h3>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Drug Identifier</th>
                  <th>Stock</th>
                  <th>Minimum Limit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{item.name}</td>
                    <td>{item.stock} {item.unit}</td>
                    <td>{item.limit} {item.unit}</td>
                    <td>
                      <span className={`badge ${item.status === 'In Stock' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleReorder(item.name)}
                      >
                        Reorder Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global settings */}
        <div className="glass" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Platform & Security Settings</h3>
          
          <form onSubmit={(e) => { e.preventDefault(); alert("Admin settings saved successfully."); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Department Identifier</label>
              <input
                type="text"
                className="form-control"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Session Idle Timeout (Minutes)</label>
              <select
                className="form-control"
                value={autoTimeout}
                onChange={(e) => setAutoTimeout(e.target.value)}
              >
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>Compliance Notice:</strong> Standard hospital rules mandate multi-factor authorization and audit trail tracking for class-II drug logs. Do not disable logs.
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Save Configuration Options
            </button>
          </form>
        </div>
      </div>

      {/* NEW: HL7 FHIR Interoperability Sync Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Left Side: FHIR JSON Resource Viewer */}
        <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>🔥 HL7 FHIR Sync Panel</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="btn" 
                  style={{ padding: '3px 8px', fontSize: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: activeFHIRTab === 'Patient' ? 'rgba(0,102,255,0.1)' : 'transparent', color: activeFHIRTab === 'Patient' ? 'var(--med-blue)' : 'var(--text-secondary)' }}
                  onClick={() => setActiveFHIRTab('Patient')}
                >
                  Patient Resource
                </button>
                <button 
                  className="btn" 
                  style={{ padding: '3px 8px', fontSize: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: activeFHIRTab === 'Observation' ? 'rgba(0,102,255,0.1)' : 'transparent', color: activeFHIRTab === 'Observation' ? 'var(--med-blue)' : 'var(--text-secondary)' }}
                  onClick={() => setActiveFHIRTab('Observation')}
                >
                  Observation (Vitals)
                </button>
              </div>
            </div>
            
            {/* Patient Sync selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target:</span>
              <select 
                className="form-control" 
                style={{ padding: '3px 6px', fontSize: '0.7rem', width: '110px' }}
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="P001">Robert (P001)</option>
                <option value="P002">Sophia (P002)</option>
                <option value="P003">Liam (P003)</option>
              </select>
            </div>
          </div>

          <div style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', backgroundColor: '#020617', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <pre style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#00d2ff' }}>
              {JSON.stringify(activeFHIRTab === 'Patient' ? patientFHIRJson : observationFHIRJson, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right Side: Animated Transmission log */}
        <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>EHR Sync Terminal</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Sync patient vitals logs and demographic charts with the hospital central Electronic Health Record database.
          </p>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginBottom: '12px' }} 
            onClick={handleEHRSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <span style={{ width: '10px', height: '10px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'rotate-spin 0.8s linear infinite' }}></span>
                Syncing FHIR Server...
              </>
            ) : '⚡ Trigger EHR Database Sync'}
          </button>

          <div style={{ flex: 1, minHeight: '130px', backgroundColor: '#020617', color: '#ffb700', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '8px', borderRadius: '4px', border: '1px solid #1e293b', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {syncLogs.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>Idle. Ready for socket transmit.</span>
            ) : (
              syncLogs.map((log, idx) => <div key={idx}>{log}</div>)
            )}
          </div>
        </div>

      </div>

      {/* Security Audit Log */}
      <div className="glass" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px', color: 'var(--med-red)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Active Security Audit Logs
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
          {logs.map((log, idx) => (
            <div 
              key={idx} 
              style={{ 
                padding: '10px 14px', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-color)',
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>[{log.timestamp}]</span>
                <span style={{ fontWeight: 600 }}>{log.user}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>IP: {log.ip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
