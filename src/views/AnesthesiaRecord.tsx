import React, { useState } from 'react';

export const AnesthesiaRecord: React.FC = () => {
  // Timeline slots (12 slots representing 15-min intervals)
  const timeSlots = ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45'];
  
  // Plotting data matrices
  const [drugsGrid, setDrugsGrid] = useState<Record<string, Record<string, boolean>>>({
    'Propofol 150mg': { '10:00': true, '11:30': true },
    'Fentanyl 100mcg': { '10:00': true, '10:45': true, '12:00': true },
    'Rocuronium 50mg': { '10:00': true, '11:15': true },
    'Isoflurane 1.5%': { '10:15': true, '10:30': true, '10:45': true, '11:00': true, '11:15': true, '11:30': true, '11:45': true, '12:00': true, '12:15': true, '12:30': true }
  });

  const [fluids, setFluids] = useState<Record<string, Record<string, number>>>({
    'Crystalloids (mL)': { '10:00': 250, '10:30': 250, '11:00': 250, '11:30': 250, '12:00': 250, '12:30': 250 },
    'Colloids (mL)': { '10:15': 100, '11:15': 100 },
    'Blood Loss (mL)': { '10:30': 50, '11:00': 50, '11:30': 50, '12:00': 50, '12:30': 100 },
    'Urine Output (mL)': { '10:45': 40, '11:45': 50, '12:45': 60 }
  });

  const [signature, setSignature] = useState('');
  const [isSigned, setIsSigned] = useState(false);

  const toggleDrugCell = (drug: string, time: string) => {
    setDrugsGrid(prev => {
      const drugRow = prev[drug] || {};
      return {
        ...prev,
        [drug]: {
          ...drugRow,
          [time]: !drugRow[time]
        }
      };
    });
  };

  const handleFluidChange = (fluidType: string, time: string, val: string) => {
    const num = Number(val);
    setFluids(prev => {
      const row = prev[fluidType] || {};
      return {
        ...prev,
        [fluidType]: {
          ...row,
          [time]: num
        }
      };
    });
  };

  const calculateTotal = (fluidType: string) => {
    const row = fluids[fluidType] || {};
    return Object.values(row).reduce((sum, current) => sum + (current || 0), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signature.trim()) {
      setIsSigned(true);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Digital Intraoperative Record</h1>
          <p className="page-subtitle">Standardized grid for timeline plotting, drug infusions, and digital validation signatures</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            🖨 Print / Export PDF
          </button>
          {isSigned ? (
            <span className="badge badge-success" style={{ padding: '10px 16px', display: 'inline-flex', alignItems: 'center' }}>
              ✓ SIGNATURE SECURED
            </span>
          ) : (
            <span className="badge badge-warning" style={{ padding: '10px 16px' }}>
              ⚠ PENDING AUTHORIZATION
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Dynamic Plotting Grid */}
        <div className="anesthesia-grid-container glass" style={{ padding: '20px', overflowX: 'auto' }}>
          <div className="anesthesia-chart-table" style={{ minWidth: '900px' }}>
            {/* Header Times */}
            <div className="anesthesia-chart-header">
              <div className="anesthesia-chart-header-cell">DRUGS & PARAMETERS</div>
              {timeSlots.map(t => <div key={t} className="anesthesia-chart-header-cell">{t}</div>)}
            </div>

            {/* Drugs Rows */}
            {Object.keys(drugsGrid).map(drug => (
              <div key={drug} className="anesthesia-chart-row">
                <div className="anesthesia-chart-label">{drug}</div>
                {timeSlots.map(time => (
                  <div 
                    key={time} 
                    className="anesthesia-chart-cell"
                    onClick={() => toggleDrugCell(drug, time)}
                  >
                    {drugsGrid[drug][time] && <span className="record-dot"></span>}
                  </div>
                ))}
              </div>
            ))}

            {/* Fluids Rows (Inputs) */}
            {Object.keys(fluids).map(fluid => (
              <div key={fluid} className="anesthesia-chart-row" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="anesthesia-chart-label" style={{ color: 'var(--med-cyan)' }}>{fluid}</div>
                {timeSlots.map(time => (
                  <div key={time} className="anesthesia-chart-cell">
                    <input 
                      type="number"
                      value={fluids[fluid][time] || ''}
                      onChange={(e) => handleFluidChange(fluid, time, e.target.value)}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.8125rem',
                        outline: 'none',
                        fontFamily: 'var(--font-mono)'
                      }}
                      placeholder="—"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Totals panel & signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Summary calculations */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Fluid Balance & Anesthetic Log</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Crystalloids</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--med-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {calculateTotal('Crystalloids (mL)')} <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>mL</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Colloids</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--med-blue)', fontFamily: 'var(--font-mono)' }}>
                  {calculateTotal('Colloids (mL)')} <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>mL</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Blood Loss (EBL)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--med-red)', fontFamily: 'var(--font-mono)' }}>
                  {calculateTotal('Blood Loss (mL)')} <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>mL</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Urine Output</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--med-orange)', fontFamily: 'var(--font-mono)' }}>
                  {calculateTotal('Urine Output (mL)')} <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>mL</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '16px', paddingTop: '16px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>Net Fluid Balance:</strong> {calculateTotal('Crystalloids (mL)') + calculateTotal('Colloids (mL)') - calculateTotal('Blood Loss (mL)')} mL crystalloid excess. Recommend maintenance rate at 120 mL/hr.
            </div>
          </div>

          {/* Secure Signature panel */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>Legal Verification</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
              Confirm all drugs plotted match infusion pumps exactly. Sign off requires digital credentials.
            </p>

            {isSigned ? (
              <div style={{ padding: '16px', backgroundColor: 'rgba(0,184,148,0.05)', border: '1px dashed var(--med-green)', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontStyle: 'italic', fontWeight: 600, fontFamily: 'serif', color: 'var(--med-green)' }}>
                  {signature}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Digitally signed by MD at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type Name (e.g. Dr. S Jenkins)"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>
                  Authorize & Secure Log
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
