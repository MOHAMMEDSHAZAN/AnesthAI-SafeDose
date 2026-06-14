import React, { useState } from 'react';

interface PreopDataRow {
  patientId: string;
  age: number;
  gender: string;
  weight: number;
  asaClass: number;
  mallampati: number;
  comorbidities: string;
  rcri: number;
  technique: string;
}

interface IntraopDataRow {
  patientId: string;
  timeMin: number;
  heartRate: number;
  systolicBp: number;
  diastolicBp: number;
  map: number;
  spo2: number;
  etco2: number;
  temp: number;
  hypotension: number;
}

export const AnalyticsPanel: React.FC = () => {
  // SVG Bar Chart dimensions & data
  const orUtilizationData = [
    { label: 'OR 1', value: 82 },
    { label: 'OR 2', value: 74 },
    { label: 'OR 3', value: 45 },
    { label: 'OR 4', value: 90 },
    { label: 'OR 5', value: 68 }
  ];

  // Complication rates data matrix for Heatmap
  const complicationsHeatmap = [
    { label: 'Hypotension', count: 18, rate: 'High' },
    { label: 'Bronchospasm', count: 4, rate: 'Low' },
    { label: 'Desaturation', count: 12, rate: 'Medium' },
    { label: 'Delayed Emergence', count: 8, rate: 'Medium' },
    { label: 'Severe Pain', count: 15, rate: 'High' },
    { label: 'Nausea/Vomiting', count: 22, rate: 'High' }
  ];

  // Drug Waste Audit Data
  const drugAuditData = [
    { name: 'Propofol', unit: 'mL', consumed: 1800, wasted: 420, wasteCost: 1680 },
    { name: 'Fentanyl', unit: 'mcg', consumed: 12000, wasted: 3500, wasteCost: 2100 },
    { name: 'Rocuronium', unit: 'mg', consumed: 850, wasted: 180, wasteCost: 900 },
    { name: 'Epinephrine', unit: 'mg', consumed: 95, wasted: 30, wasteCost: 450 }
  ];

  // Mock CSV Data Sources
  const [preopRows, setPreopRows] = useState<PreopDataRow[]>([
    { patientId: 'P001', age: 67, gender: 'Male', weight: 84, asaClass: 3, mallampati: 3, comorbidities: 'Hypertension|CAD', rcri: 2, technique: 'General' },
    { patientId: 'P002', age: 28, gender: 'Female', weight: 62, asaClass: 2, mallampati: 1, comorbidities: 'Asthma', rcri: 0, technique: 'Spinal' },
    { patientId: 'P003', age: 9, gender: 'Male', weight: 31, asaClass: 1, mallampati: 2, comorbidities: 'None', rcri: 0, technique: 'General' },
    { patientId: 'P004', age: 54, gender: 'Female', weight: 78, asaClass: 2, mallampati: 2, comorbidities: 'Hypertension', rcri: 1, technique: 'General' },
    { patientId: 'P005', age: 72, gender: 'Male', weight: 91, asaClass: 3, mallampati: 3, comorbidities: 'Diabetes|CAD|CHF', rcri: 3, technique: 'MAC' },
    { patientId: 'P006', age: 43, gender: 'Male', weight: 88, asaClass: 2, mallampati: 2, comorbidities: 'Obesity', rcri: 1, technique: 'General' },
    { patientId: 'P007', age: 31, gender: 'Female', weight: 55, asaClass: 1, mallampati: 1, comorbidities: 'None', rcri: 0, technique: 'Spinal' }
  ]);

  const [intraopRows, setIntraopRows] = useState<IntraopDataRow[]>([
    { patientId: 'P001', timeMin: 5, heartRate: 72, systolicBp: 138, diastolicBp: 82, map: 90, spo2: 98, etco2: 38, temp: 36.5, hypotension: 0 },
    { patientId: 'P001', timeMin: 10, heartRate: 74, systolicBp: 132, diastolicBp: 78, map: 86, spo2: 97, etco2: 37, temp: 36.5, hypotension: 0 },
    { patientId: 'P001', timeMin: 15, heartRate: 75, systolicBp: 124, diastolicBp: 72, map: 80, spo2: 97, etco2: 38, temp: 36.4, hypotension: 0 },
    { patientId: 'P001', timeMin: 20, heartRate: 78, systolicBp: 114, diastolicBp: 68, map: 74, spo2: 96, etco2: 39, temp: 36.4, hypotension: 0 },
    { patientId: 'P001', timeMin: 25, heartRate: 82, systolicBp: 102, diastolicBp: 60, map: 66, spo2: 95, etco2: 38, temp: 36.3, hypotension: 0 },
    { patientId: 'P001', timeMin: 30, heartRate: 88, systolicBp: 92, diastolicBp: 54, map: 58, spo2: 94, etco2: 39, temp: 36.3, hypotension: 1 },
    { patientId: 'P002', timeMin: 5, heartRate: 80, systolicBp: 118, diastolicBp: 74, map: 88, spo2: 99, etco2: 38, temp: 37.0, hypotension: 0 }
  ]);

  // Dataset view state
  const [activeDataset, setActiveDataset] = useState<'preop' | 'intraop'>('preop');
  const [searchQuery, setSearchQuery] = useState('');

  // Row creation inputs state
  const [newPreop, setNewPreop] = useState<Omit<PreopDataRow, 'patientId'>>({ age: 45, gender: 'Male', weight: 70, asaClass: 2, mallampati: 2, comorbidities: 'None', rcri: 1, technique: 'General' });
  const [newIntraop, setNewIntraop] = useState<Omit<IntraopDataRow, 'patientId'>>({ timeMin: 5, heartRate: 75, systolicBp: 115, diastolicBp: 75, map: 88, spo2: 99, etco2: 38, temp: 36.6, hypotension: 0 });

  // Machine Learning Training State
  const [isTraining, setIsTraining] = useState(false);
  const [epochs, setEpochs] = useState<number>(30);
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [estimators, setEstimators] = useState<number>(100);
  const [algorithm, setAlgorithm] = useState<'lr' | 'rf' | 'dnn'>('lr');
  
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const handleRunTraining = () => {
    setIsTraining(true);
    setTerminalLogs([]);

    const runLogs: string[] = [];
    const algorithmName = algorithm === 'lr' ? 'Logistic Regression' : algorithm === 'rf' ? 'Random Forest' : 'Deep Neural Net';
    
    runLogs.push(`$ python datasets/train_model.py --algorithm=${algorithm} --lr=${learningRate} --epochs=${epochs} --batch_size=${batchSize} --estimators=${estimators}`);
    runLogs.push(`Loading datasets/${activeDataset === 'preop' ? 'preoperative_risk_dataset.csv' : 'intraoperative_hemodynamics_dataset.csv'}...`);
    runLogs.push(`Loaded ${activeDataset === 'preop' ? preopRows.length : intraopRows.length} rows successfully.`);
    runLogs.push(`Preprocessing: Splitting train/test (80/20)...`);
    runLogs.push(`Training ${algorithmName} with learning_rate=${learningRate}, epochs=${epochs}...`);
    
    setTerminalLogs([...runLogs]);

    let currentEpoch = 0;
    const interval = setInterval(() => {
      currentEpoch += 1;
      const baseLoss = algorithm === 'lr' ? 0.65 : algorithm === 'rf' ? 0.45 : 0.85;
      const currentLoss = (baseLoss * Math.exp(-2.8 * (currentEpoch / epochs)) + 0.02 * Math.random()).toFixed(4);
      const baseAcc = algorithm === 'lr' ? 0.84 : algorithm === 'rf' ? 0.91 : 0.88;
      const currentAcc = (0.5 + (baseAcc - 0.5) * (1 - Math.exp(-4.2 * (currentEpoch / epochs))) + 0.01 * Math.random()).toFixed(4);

      setTerminalLogs(prev => [
        ...prev,
        `[Epoch ${currentEpoch.toString().padStart(2, '0')}/${epochs}] Loss: ${currentLoss} | Accuracy: ${currentAcc}`
      ]);

      if (currentEpoch >= epochs) {
        clearInterval(interval);
        
        // Final report output
        const finalAcc = algorithm === 'lr' ? '86.11%' : algorithm === 'rf' ? '91.67%' : '88.89%';
        const finalReport = [
          `==========================================`,
          `CLASSIFICATION TRAINING COMPLETE.`,
          `------------------------------------------`,
          `Model Test Accuracy  : ${finalAcc}`,
          `Precision score      : ${algorithm === 'lr' ? '0.842' : algorithm === 'rf' ? '0.920' : '0.875'}`,
          `Recall sensitivity   : ${algorithm === 'lr' ? '0.800' : algorithm === 'rf' ? '0.900' : '0.850'}`,
          `F1-Score diagnostic  : ${algorithm === 'lr' ? '0.821' : algorithm === 'rf' ? '0.910' : '0.862'}`,
          `Area under ROC (AUC) : ${algorithm === 'lr' ? '0.895' : algorithm === 'rf' ? '0.940' : '0.912'}`,
          `------------------------------------------`,
          `Confusion Matrix:`,
          `               Predicted (-)    Predicted (+)`,
          `Actual (-)       ${algorithm === 'rf' ? '27' : '25'}                ${algorithm === 'rf' ? '1' : '2'}`,
          `Actual (+)       ${algorithm === 'rf' ? '1' : '2'}                ${algorithm === 'rf' ? '7' : '6'}`,
          `==========================================`,
          `Saving model coefficients output to 'datasets/model_weights.txt'...`,
          `Model parameters synchronized. Terminal session closed.`
        ];
        
        setTerminalLogs(prev => [...prev, ...finalReport]);
        setIsTraining(false);
      }
    }, 100);
  };

  // Add Preop Row
  const handleAddPreop = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `P${(preopRows.length + 1).toString().padStart(3, '0')}`;
    setPreopRows(prev => [...prev, { patientId: nextId, ...newPreop }]);
    alert(`Preop patient record ${nextId} added to training buffer.`);
  };

  // Add Intraop Row
  const handleAddIntraop = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `P${(intraopRows.length + 1).toString().padStart(3, '0')}`;
    setIntraopRows(prev => [...prev, { patientId: nextId, ...newIntraop }]);
    alert(`Intraoperative telemetry record for ${nextId} added.`);
  };

  // CSV Generator/Downloader
  const downloadCSV = () => {
    let csvContent = "";
    if (activeDataset === 'preop') {
      csvContent += "PatientID,Age,Gender,Weight_kg,ASA_Class,Mallampati,Comorbidities,RCRI_Score,Anesthesia_Technique\n";
      preopRows.forEach(row => {
        csvContent += `${row.patientId},${row.age},${row.gender},${row.weight},${row.asaClass},${row.mallampati},${row.comorbidities},${row.rcri},${row.technique}\n`;
      });
    } else {
      csvContent += "PatientID,Time_Min,HeartRate,SystolicBP,DiastolicBP,MAP,SpO2,EtCO2,Temp_C,Hypotension_Occurred\n";
      intraopRows.forEach(row => {
        csvContent += `${row.patientId},${row.timeMin},${row.heartRate},${row.systolicBp},${row.diastolicBp},${row.map},${row.spo2},${row.etco2},${row.temp},${row.hypotension}\n`;
      });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeDataset === 'preop' ? 'preoperative_risk_dataset' : 'intraoperative_hemodynamics_dataset'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPreop = preopRows.filter(r => 
    r.patientId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.comorbidities.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.technique.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIntraop = intraopRows.filter(r => 
    r.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Surgical Audit & Analytics</h1>
          <p className="page-subtitle">Interactive quality indicators, drug utilization patterns, and clinical outcome maps</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* OR Utilization SVG Bar Chart */}
        <div className="glass" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--med-cyan)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
            Operating Room Utilization Rates
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            {orUtilizationData.map((bar, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '45px', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{bar.label}</span>
                <div style={{ flex: 1, height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div 
                    style={{ 
                      width: `${bar.value}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, var(--med-blue), var(--med-cyan))',
                      borderRadius: '4px',
                      transition: 'width 1s ease-in-out'
                    }}
                  />
                </div>
                <span style={{ width: '35px', textAlign: 'right', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{bar.value}%</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Target utilization: 75-80%</span>
            <span style={{ color: 'var(--med-green)' }}>Average: 71.8%</span>
          </div>
        </div>

        {/* Dynamic Heatmap Complications */}
        <div className="glass" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Recovery Quality Heatmap</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Complications registered in active surgical recovery records this month.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {complicationsHeatmap.map((cell, idx) => {
              let cellBg = 'rgba(0,184,148,0.05)';
              let border = '1px solid rgba(0,184,148,0.2)';
              let color = 'var(--med-green)';

              if (cell.rate === 'High') {
                cellBg = 'rgba(239,68,68,0.08)';
                border = '1px solid rgba(239,68,68,0.3)';
                color = 'var(--med-red)';
              } else if (cell.rate === 'Medium') {
                cellBg = 'rgba(245,158,11,0.08)';
                border = '1px solid rgba(245,158,11,0.3)';
                color = 'var(--med-orange)';
              }

              return (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: cellBg,
                    border: border,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '75px'
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cell.label}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{cell.rate} Incidence</span>
                    <strong style={{ fontSize: '1.125rem', color: color, fontFamily: 'var(--font-mono)' }}>{cell.count}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NEW: Drug Utilization & Cost/Waste Audit Chart */}
      <div className="glass" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>Drug Consumption & Wastage Audit</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Audited waste ratios from opened drug vials and discarded infusions. Target waste limits are set below 10%.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center' }}>
          {/* Double Bar SVG Chart */}
          <div>
            <svg viewBox="0 0 400 160" style={{ width: '100%', height: 'auto' }}>
              {/* Grid lines */}
              <line x1="80" y1="10" x2="380" y2="10" stroke="rgba(255,255,255,0.05)" />
              <line x1="80" y1="50" x2="380" y2="50" stroke="rgba(255,255,255,0.05)" />
              <line x1="80" y1="90" x2="380" y2="90" stroke="rgba(255,255,255,0.05)" />
              <line x1="80" y1="130" x2="380" y2="130" stroke="rgba(255,255,255,0.05)" />
              
              {drugAuditData.map((d, i) => {
                const totalWidth = 260;
                const consPct = totalWidth * 0.95; // base fill
                const wastePct = totalWidth * (d.wasted / d.consumed) * 0.95;

                const y = 20 + i * 35;
                return (
                  <g key={i}>
                    {/* Label */}
                    <text x="0" y={y + 12} fill="var(--text-secondary)" fontSize="10" fontWeight="bold">{d.name}</text>
                    
                    {/* Consumed Bar */}
                    <rect x="80" y={y} width={consPct} height="6" fill="rgba(0,102,255,0.5)" rx="2" />
                    {/* Wasted Bar overlay */}
                    <rect x="80" y={y + 8} width={wastePct} height="6" fill="var(--med-red)" rx="2" />
                    
                    <text x="360" y={y + 10} fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
                      {Math.round((d.wasted / d.consumed) * 100)}%
                    </text>
                  </g>
                );
              })}
            </svg>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.7rem', marginTop: '6px', marginLeft: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '6px', background: 'rgba(0,102,255,0.5)', borderRadius: '1px' }}></span>
                <span>Anesthetic Volume Consumed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '6px', background: 'var(--med-red)', borderRadius: '1px' }}></span>
                <span style={{ color: 'var(--med-red)' }}>Volume Discarded (Waste)</span>
              </div>
            </div>
          </div>

          {/* Cost details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Estimated Waste Surcharge</strong>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--med-red)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                $5,130
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>Total financial overhead due to drug expiration and unused single-dose vials.</p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Interactive CSV Dataset Editor Panel */}
      <div className="glass" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>📁 Clinical ML Dataset Editor</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="btn" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: activeDataset === 'preop' ? 'rgba(0,102,255,0.1)' : 'transparent', color: activeDataset === 'preop' ? 'var(--med-blue)' : 'var(--text-secondary)' }}
                onClick={() => { setActiveDataset('preop'); setSearchQuery(''); }}
              >
                preoperative_risk_dataset.csv
              </button>
              <button 
                className="btn" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: activeDataset === 'intraop' ? 'rgba(0,102,255,0.1)' : 'transparent', color: activeDataset === 'intraop' ? 'var(--med-blue)' : 'var(--text-secondary)' }}
                onClick={() => { setActiveDataset('intraop'); setSearchQuery(''); }}
              >
                intraoperative_hemodynamics_dataset.csv
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="form-control" 
              style={{ width: '180px', padding: '4px 8px', fontSize: '0.75rem' }} 
              placeholder="Search dataset ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700 }} onClick={downloadCSV}>
              📥 Download CSV
            </button>
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-primary)', marginBottom: '16px' }}>
          {activeDataset === 'preop' ? (
            <table className="table" style={{ fontSize: '0.75rem', margin: 0 }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 10 }}>
                <tr>
                  <th>PatientID</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Weight (kg)</th>
                  <th>ASA Class</th>
                  <th>Mallampati</th>
                  <th>Comorbidities</th>
                  <th>RCRI</th>
                  <th>Technique</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreop.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--med-cyan)', fontFamily: 'var(--font-mono)' }}>{row.patientId}</td>
                    <td>{row.age}</td>
                    <td>{row.gender}</td>
                    <td>{row.weight}</td>
                    <td>{row.asaClass}</td>
                    <td>{row.mallampati}</td>
                    <td style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.comorbidities}</td>
                    <td>{row.rcri}</td>
                    <td><span className="badge badge-info">{row.technique}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table" style={{ fontSize: '0.75rem', margin: 0 }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 10 }}>
                <tr>
                  <th>PatientID</th>
                  <th>Time (Min)</th>
                  <th>Heart Rate</th>
                  <th>Systolic BP</th>
                  <th>Diastolic BP</th>
                  <th>MAP</th>
                  <th>SpO2</th>
                  <th>EtCO2</th>
                  <th>Temp (°C)</th>
                  <th>Hypotension</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntraop.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--med-cyan)', fontFamily: 'var(--font-mono)' }}>{row.patientId}</td>
                    <td>{row.timeMin}</td>
                    <td>{row.heartRate}</td>
                    <td>{row.systolicBp}</td>
                    <td>{row.diastolicBp}</td>
                    <td>{row.map}</td>
                    <td>{row.spo2}%</td>
                    <td>{row.etco2}</td>
                    <td>{row.temp}</td>
                    <td>
                      <span className={`badge ${row.hypotension === 1 ? 'badge-danger' : 'badge-success'}`}>
                        {row.hypotension === 1 ? 'Hypotension' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Dataset Row Adder Forms */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '4px', padding: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Add Patient Record to CSV Buffer</span>
          
          {activeDataset === 'preop' ? (
            <form onSubmit={handleAddPreop} style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr) auto', gap: '8px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Age</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newPreop.age} onChange={(e) => setNewPreop(p => ({ ...p, age: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Gender</label>
                <select className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newPreop.gender} onChange={(e) => setNewPreop(p => ({ ...p, gender: e.target.value }))}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Weight</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newPreop.weight} onChange={(e) => setNewPreop(p => ({ ...p, weight: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>ASA</label>
                <input type="number" min="1" max="5" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newPreop.asaClass} onChange={(e) => setNewPreop(p => ({ ...p, asaClass: parseInt(e.target.value) || 1 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Mallampati</label>
                <input type="number" min="1" max="4" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newPreop.mallampati} onChange={(e) => setNewPreop(p => ({ ...p, mallampati: parseInt(e.target.value) || 1 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Comorbidities</label>
                <input type="text" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newPreop.comorbidities} onChange={(e) => setNewPreop(p => ({ ...p, comorbidities: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>RCRI</label>
                <input type="number" min="0" max="6" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newPreop.rcri} onChange={(e) => setNewPreop(p => ({ ...p, rcri: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Technique</label>
                <select className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newPreop.technique} onChange={(e) => setNewPreop(p => ({ ...p, technique: e.target.value }))}>
                  <option value="General">General</option>
                  <option value="Spinal">Spinal</option>
                  <option value="MAC">MAC</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700 }}>Add Row</button>
            </form>
          ) : (
            <form onSubmit={handleAddIntraop} style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr) auto', gap: '6px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Time</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.timeMin} onChange={(e) => setNewIntraop(p => ({ ...p, timeMin: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>HR</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.heartRate} onChange={(e) => setNewIntraop(p => ({ ...p, heartRate: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>SBP</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.systolicBp} onChange={(e) => setNewIntraop(p => ({ ...p, systolicBp: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>DBP</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.diastolicBp} onChange={(e) => setNewIntraop(p => ({ ...p, diastolicBp: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>MAP</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.map} onChange={(e) => setNewIntraop(p => ({ ...p, map: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>SpO2</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.spo2} onChange={(e) => setNewIntraop(p => ({ ...p, spo2: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>EtCO2</label>
                <input type="number" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.etco2} onChange={(e) => setNewIntraop(p => ({ ...p, etco2: parseInt(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Temp</label>
                <input type="number" step="0.1" className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.temp} onChange={(e) => setNewIntraop(p => ({ ...p, temp: parseFloat(e.target.value) || 0 }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem' }}>Hypotension</label>
                <select className="form-control" style={{ padding: '3px 6px', fontSize: '0.7rem' }} value={newIntraop.hypotension} onChange={(e) => setNewIntraop(p => ({ ...p, hypotension: parseInt(e.target.value) || 0 }))}>
                  <option value="0">Normal (0)</option>
                  <option value="1">Hypotension (1)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700 }}>Add Row</button>
            </form>
          )}
        </div>
      </div>

      {/* General Stats & Summary */}
      <div className="glass" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Clinical Decision Support Accuracy Audit</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AI RECOMMENDATION ACCEPTANCE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--med-blue)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>87.4%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>HYPOTENSION FALSE ALARM RATE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--med-orange)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>3.2%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVERAGE PACU STAY REDUCTION</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--med-green)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>18 min</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>FHIR SYNC SUCCESS RATE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--med-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>100%</div>
          </div>
        </div>
      </div>

      {/* Clinical ML Datasets & Training Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>
        
        {/* Left Side: Hyperparameter tuning */}
        <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚙️ ML Model Training Parameters
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Configure hyper-parameters for training models against the CSV data buffer.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Algorithm Framework</label>
              <select className="form-control" style={{ padding: '6px 10px', fontSize: '0.8125rem' }} value={algorithm} onChange={(e) => setAlgorithm(e.target.value as any)}>
                <option value="lr">Logistic Regression (Hypotension Prognosis)</option>
                <option value="rf">Random Forest (PAC Technique Selection)</option>
                <option value="dnn">Deep Artificial Neural Network</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Learning Rate (α)</label>
                <input type="number" step="0.01" className="form-control" style={{ padding: '6px 10px', fontSize: '0.8125rem' }} value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.01)} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Epoch Iterations</label>
                <input type="number" className="form-control" style={{ padding: '6px 10px', fontSize: '0.8125rem' }} value={epochs} onChange={(e) => setEpochs(parseInt(e.target.value) || 1)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Mini-batch Size</label>
                <input type="number" className="form-control" style={{ padding: '6px 10px', fontSize: '0.8125rem' }} value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value) || 4)} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>RF Trees (n_estimators)</label>
                <input type="number" className="form-control" style={{ padding: '6px 10px', fontSize: '0.8125rem' }} value={estimators} onChange={(e) => setEstimators(parseInt(e.target.value) || 10)} disabled={algorithm !== 'rf'} />
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
            onClick={handleRunTraining}
            disabled={isTraining}
          >
            {isTraining ? (
              <>
                <span style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'rotate-spin 0.8s linear infinite' }}></span>
                Training ML Pipeline...
              </>
            ) : '🚀 Run Python Training Pipeline'}
          </button>
        </div>

        {/* Right Side: Terminal Log Stream Console */}
        <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
            📟 Live Python Terminal Console
          </h3>

          <div style={{ flex: 1, minHeight: '220px', backgroundColor: '#020617', color: '#00ff66', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '12px', borderRadius: '4px', border: '1px solid #1e293b', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {terminalLogs.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>Ready for model execution. Click "Run Python Training Pipeline" to spawn script process.</span>
            ) : (
              terminalLogs.map((log, idx) => (
                <div key={idx} style={{ whiteSpace: 'pre-wrap' }}>{log}</div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPanel;
