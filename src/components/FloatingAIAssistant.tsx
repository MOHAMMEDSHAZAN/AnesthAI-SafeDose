import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const FloatingAIAssistant: React.FC = () => {
  const { patients } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string; citations?: string[] }>>([
    { 
      sender: 'ai', 
      text: "Hello! I am your clinical anesthesia assistant. Ask me about drug dosages, airway calculations, anesthetic plans, or ask me to review a patient record.",
      citations: ["ASA Guidelines 2024"]
    }
  ]);

  const endOfChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfChatRef.current) {
      endOfChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, isOpen]);

  const handleVoiceSimulate = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const voicePrompts = [
        "Suggest propofol bolus for 80kg patient.",
        "What is the airway plan for Priya Nair (SD-2026-0002)?",
        "Check anesthesia plan contraindications for Rahul Sharma (SD-2026-0003)."
      ];
      const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
      setQuery(randomPrompt);
    }, 2000);
  };

  const handleSend = (textToSend?: string) => {
    const activeText = textToSend || query;
    if (!activeText.trim()) return;

    // Add user message
    const updatedLog = [...chatLog, { sender: 'user' as const, text: activeText }];
    setChatLog(updatedLog);
    setQuery('');

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateMockClinicalResponse(activeText);
      setChatLog(prev => [...prev, response]);
    }, 800);
  };

  const generateMockClinicalResponse = (userInput: string): { sender: 'ai'; text: string; citations?: string[] } => {
    const cleanInput = userInput.toLowerCase();
    
    // Drug checks
    if (cleanInput.includes('propofol') || cleanInput.includes('dose') || cleanInput.includes('dosing')) {
      return {
        sender: 'ai',
        text: "For Propofol general anesthesia induction, the standard adult dose is 1.5 - 2.5 mg/kg IV. For a standard 70kg patient, that is 105 - 175 mg IV. In elderly or cardiac-compromised patients, reduce induction dose to 1.0 - 1.5 mg/kg IV titrated slowly to avoid profound hypotension. Maintenance infusion is 100 - 200 mcg/kg/min. Requires clinician review.",
        citations: ["Miller's Anesthesia, 9th Ed (p. 642)", "Barash Clinical Anesthesia, 8th Ed"]
      };
    }

    // Rahul Sharma / SD-2026-0003 review
    if (cleanInput.includes('rahul') || cleanInput.includes('sharma') || cleanInput.includes('sd-2026-0003')) {
      const patient = patients.find(p => p.id === 'SD-2026-0003') || patients[0];
      if (!patient) return { sender: 'ai', text: "Synthetic patient record not found." };
      return {
        sender: 'ai',
        text: `Synthetic Patient ${patient.name} (${patient.id}, Age ${patient.age}): History of CAD and Hypertension with ASA Physical Status III. Critical flags: documented Penicillin anaphylaxis (avoid cefazolin / beta-lactams). Model-estimated hypotension risk 62%. Suggested induction: slow titration of Propofol or Etomidate (0.2-0.3 mg/kg) with invasive arterial line monitoring. Decision-support advisory only; requires clinician review.`,
        citations: ["AHA/ACC Perioperative Cardiac Guidelines 2022", "Miller's Anesthesia, 9th Ed"]
      };
    }

    // Priya Nair / SD-2026-0002 review
    if (cleanInput.includes('priya') || cleanInput.includes('nair') || cleanInput.includes('sd-2026-0002')) {
      return {
        sender: 'ai',
        text: "Synthetic Patient Priya Nair (SD-2026-0002, Age 29, ASA II-E): Elective Cesarean Section. Recommendation: Subarachnoid spinal block (0.5% Hyperbaric Bupivacaine 10 mg + Fentanyl 15 mcg). Monitor for sympathetic blockade hypotension (phenylephrine titration ready; 15° left uterine tilt). Apfel PONV risk score 3/4. Decision-support advisory only; requires clinician review.",
        citations: ["SOAP Obstetric Anesthesia Consensus 2023", "ASA Practice Guidelines for Obstetric Anesthesia"]
      };
    }

    // Airway / Mallampati
    if (cleanInput.includes('airway') || cleanInput.includes('mallampati') || cleanInput.includes('intubate')) {
      return {
        sender: 'ai',
        text: "A difficult airway assessment is based on the Mallampati score, thyromental distance (< 6cm indicates difficulty), and neck range of motion. Mallampati III/IV represents a high correlation with difficult direct laryngoscopy. Recommendations: Video laryngoscopy as first-line, keep Bougie/LMA immediately available, and follow the ASA Difficult Airway Algorithm.",
        citations: ["ASA Practice Guidelines for Management of the Difficult Airway 2022"]
      };
    }

    // Hypotension prediction
    if (cleanInput.includes('hypotension') || cleanInput.includes('predict') || cleanInput.includes('pressure')) {
      return {
        sender: 'ai',
        text: "Hypotension prediction parameters include pre-induction baseline MAP < 70 mmHg, history of chronic ACE-inhibitor/ARB therapy, and compromised cardiac ejection fraction. Maintaining MAP > 65 mmHg is critical to prevent myocardial injury and acute kidney injury (AKI) postoperatively.",
        citations: ["POISE-3 Trial Findings", "Anesthesiology Journal 2021; 134:867-879"]
      };
    }

    // General fallback
    return {
      sender: 'ai',
      text: "I analyzed your clinical query. Let me know if you would like me to compute weight-adjusted drug infusions, verify comorbidities warnings, or fetch emergency ACLS checklists. Remember, this tool is for clinical support and never replaces direct physician judgment.",
      citations: ["Clinical Reference Database"]
    };
  };

  return (
    <div className="floating-assistant-widget">
      {isOpen && (
        <div className="assistant-chat-window glass">
          <div className="assistant-chat-header">
            <div className="assistant-avatar">AI</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Anesth AI Co-Pilot</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--med-cyan)', fontWeight: 600 }}>Active decision support</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              &times;
            </button>
          </div>

          <div className="chat-message-list">
            {chatLog.map((chat, idx) => (
              <div key={idx} className={`chat-message ${chat.sender}`}>
                <p style={{ lineHeight: '1.4' }}>{chat.text}</p>
                {chat.citations && (
                  <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.6875rem', color: 'var(--med-cyan)' }}>
                    {chat.citations.map(c => `📚 ${c}`).join(' | ')}
                  </div>
                )}
              </div>
            ))}
            <div ref={endOfChatRef} />
          </div>

          <div style={{ padding: '0 12px', display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
            <button 
              onClick={() => handleSend("Review synthetic patient Rahul Sharma (SD-2026-0003)")}
              style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.6875rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🔎 Rahul Sharma (SD-2026-0003)
            </button>
            <button 
              onClick={() => handleSend("Propofol dosing guidelines")}
              style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.6875rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              💊 Propofol Doses
            </button>
            <button 
              onClick={() => handleSend("Hypotension prediction factors")}
              style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.6875rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              ⚠️ Hypotension Risks
            </button>
          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              className="chat-input-control"
              placeholder={isListening ? "Listening..." : "Ask AI Assistant..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isListening}
            />
            <button 
              className="icon-btn" 
              onClick={handleVoiceSimulate}
              style={{
                width: '34px',
                height: '34px',
                borderColor: isListening ? 'var(--med-red)' : 'var(--border-color)',
                backgroundColor: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                color: isListening ? 'var(--med-red)' : 'var(--text-secondary)'
              }}
              title="Voice Commands"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </button>
            <button 
              className="icon-btn"
              onClick={() => handleSend()}
              style={{ width: '34px', height: '34px', backgroundColor: 'var(--med-blue)', color: 'white', border: 'none' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button 
        className="assistant-trigger-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant Co-Pilot"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
};
