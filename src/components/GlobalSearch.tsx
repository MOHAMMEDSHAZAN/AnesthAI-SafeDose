import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

interface GlobalSearchProps {
  setView: (view: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ setView }) => {
  const { isSearchOpen, setIsSearchOpen, patients } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  // Search items database
  const drugs = ['Propofol', 'Fentanyl', 'Sevoflurane', 'Rocuronium', 'Epinephrine', 'Atropine', 'Midazolam', 'Neostigmine'];
  const protocols = [
    { title: 'ACLS Cardiac Arrest Algorithm', view: 'emergency' },
    { title: 'Malignant Hyperthermia Dantrolene Protocol', view: 'emergency' },
    { title: 'Difficult Airway Management', view: 'airway' },
    { title: 'Anaphylaxis Management Sheet', view: 'emergency' },
    { title: 'Aldrete Recovery Score Matrix', view: 'pacu' }
  ];

  const patientResults = patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()));
  const drugResults = drugs.filter(d => d.toLowerCase().includes(query.toLowerCase()));
  const protocolResults = protocols.filter(pr => pr.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (view: string) => {
    setView(view);
    setIsSearchOpen(false);
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={() => setIsSearchOpen(false)}
      style={{ zIndex: 1100 }}
    >
      <div 
        className="glass" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color-glow)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', marginRight: '12px' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="Type patient name, drug, or emergency protocol..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              fontSize: '1rem',
              boxShadow: 'none'
            }}
          />
          <button 
            onClick={() => setIsSearchOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '12px'
            }}
          >
            ESC
          </button>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '12px' }}>
          {query.length === 0 && (
            <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Pro Tip: Press <kbd style={{ padding: '2px 4px', border: '1px solid var(--border-color)', borderRadius: '3px', background: 'rgba(0,0,0,0.2)' }}>Ctrl+K</kbd> to open this console from anywhere in the platform.
            </div>
          )}

          {/* Patients */}
          {patientResults.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', paddingLeft: '8px' }}>Patient Chart Matches</div>
              {patientResults.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleSelect('patients')}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontWeight: 600 }}>{p.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({p.id})</span></span>
                  <span className={`badge ${p.asaScore >= 3 ? 'badge-danger' : 'badge-success'}`}>ASA {p.asaScore}</span>
                </div>
              ))}
            </div>
          )}

          {/* Drugs */}
          {drugResults.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', paddingLeft: '8px' }}>Clinical Drug Calculator</div>
              {drugResults.map(d => (
                <div 
                  key={d}
                  onClick={() => handleSelect('drugcalc')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--med-cyan)' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <span>Calculate weight-based dose for <strong>{d}</strong></span>
                </div>
              ))}
            </div>
          )}

          {/* Protocols */}
          {protocolResults.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', paddingLeft: '8px' }}>ACLS Protocols & Guidelines</div>
              {protocolResults.map(pr => (
                <div 
                  key={pr.title}
                  onClick={() => handleSelect(pr.view)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--med-red)' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{pr.title}</span>
                </div>
              ))}
            </div>
          )}

          {patientResults.length === 0 && drugResults.length === 0 && protocolResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No matches found. Try checking spellings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
