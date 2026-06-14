import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizQuestions: MCQ[] = [
  {
    question: "Which of the following is the primary mechanism of action of Propofol?",
    options: [
      "Antagonism of NMDA receptors",
      "Potentiation of GABA-A receptor chloride currents",
      "Activation of alpha-2 adrenergic receptors",
      "Inhibition of voltage-gated sodium channels"
    ],
    correctAnswer: 1,
    explanation: "Propofol acts as a positive allosteric modulator of GABA-A receptors, facilitating inhibitory neurotransmission and causing rapid sedation."
  },
  {
    question: "What is the standard weight-based dose of Succinylcholine for adult rapid sequence induction?",
    options: [
      "0.1 - 0.2 mg/kg IV",
      "0.5 - 0.8 mg/kg IV",
      "1.0 - 1.5 mg/kg IV",
      "2.0 - 2.5 mg/kg IV"
    ],
    correctAnswer: 2,
    explanation: "Succinylcholine is administered at 1.0 - 1.5 mg/kg IV for rapid sequence intubation, ensuring rapid onset and excellent relaxation."
  },
  {
    question: "Which clinical condition is an absolute contraindication for Spinal/Epidural anesthesia?",
    options: [
      "History of stable asthma",
      "Patient refusal",
      "Controlled diabetes",
      "Age greater than 80"
    ],
    correctAnswer: 1,
    explanation: "Patient refusal is an absolute contraindication for any regional anesthetic technique. Asthmatics and elderly usually benefit from regional blocks."
  }
];

interface CaseChoice {
  text: string;
  nextIndex: number;
  scoreDelta: number;
  feedback: string;
}

interface CaseStage {
  text: string;
  choices: CaseChoice[];
}

interface CaseScenario {
  id: number;
  title: string;
  description: string;
  stages: CaseStage[];
}

const clinicalCases: CaseScenario[] = [
  {
    id: 1,
    title: "Case 1: Intraoperative Hypotension Crisis",
    description: "A 70-year-old male with severe hypertension is undergoing laparoscopic cholecystectomy under General Anesthesia. Five minutes post-pneumoperitoneum, his MAP drops from 85 to 52 mmHg.",
    stages: [
      {
        text: "The patient is hypotensive. What is your immediate diagnostic step?",
        choices: [
          { text: "Verify BP reading, check tidal volumes, and inspect circuit pressure.", nextIndex: 1, scoreDelta: 20, feedback: "Excellent. Always verify the reading and basic circuit integrity first." },
          { text: "Administer Epinephrine 1mg IV immediately.", nextIndex: 2, scoreDelta: -10, feedback: "Caution! Epinephrine 1mg is for cardiac arrest, not routine intraoperative hypotension." },
          { text: "Increase Sevoflurane dial concentration to 4% to settle patient.", nextIndex: 2, scoreDelta: -15, feedback: "Unacceptable. Inhalational anesthetics cause vasodilation and myocardial depression; this will worsen hypotension." }
        ]
      },
      {
        text: "The BP reading is verified at 82/40 (MAP 54). Heart rate is 65 bpm. Inhalational agent is Isoflurane at 1.2 MAC. How do you manage this hemodynamic drift?",
        choices: [
          { text: "Reduce Isoflurane, open IV fluids bolus, and administer Phenylephrine 100mcg IV.", nextIndex: 3, scoreDelta: 30, feedback: "Perfect! Reducing the anesthetic vasodilator, loading fluids, and giving a pure alpha-1 agonist is the standard protocol." },
          { text: "Give Atropine 0.6mg IV.", nextIndex: 3, scoreDelta: 5, feedback: "Acceptable, but heart rate is 65 (normal). Vasopressors and fluids are the primary treatments here." }
        ]
      },
      {
        text: "Emergency recovery branch. Patient hemodynamics stabilized to MAP 72. You successfully completed the case scenario.",
        choices: []
      },
      {
        text: "Vitals corrected! MAP is now 74 mmHg. Carbon dioxide and peak airway pressures are normal. What is your post-crisis plan?",
        choices: [
          { text: "Document the event, maintain MAP > 65, and proceed with standard emergence.", nextIndex: 2, scoreDelta: 20, feedback: "Excellent. Accurate charting and maintaining organ perfusion limits post-op complications." }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Case 2: Pediatric Emergence Laryngospasm",
    description: "A 6-year-old child undergoing tonsillectomy is extubated. Immediately post-extubation, the child develops inspiratory stridor, tracheal tugging, and the SpO2 drops rapidly to 84%.",
    stages: [
      {
        text: "Tracheal tugging and stridor indicate partial or complete airway closure. What is your immediate physical maneuver?",
        choices: [
          { text: "Apply high-flow 100% O2 facemask and perform a bilateral Larson's maneuver (jaw thrust with pressure at the styloid process).", nextIndex: 1, scoreDelta: 30, feedback: "Excellent! The Larson maneuver is highly effective in breaking laryngospasm by causing deep pain reflex." },
          { text: "Prepare for urgent surgical cricothyroidotomy.", nextIndex: 2, scoreDelta: -20, feedback: "Over-reaction! Try conservative airway management first before performing surgical intervention." },
          { text: "Push Fentanyl 50mcg IV to settle child.", nextIndex: 2, scoreDelta: -10, feedback: "Incorrect. Opioids cause respiratory depression and won't relieve the mechanical vocal cord closure." }
        ]
      },
      {
        text: "SpO2 is still 81% despite Larson's maneuver. Laryngospasm is complete. What is the next ventilation strategy?",
        choices: [
          { text: "Administer continuous positive pressure ventilation (CPAP) using the bag-valve-mask with 100% O2, holding a tight seal.", nextIndex: 3, scoreDelta: 25, feedback: "Great! CPAP pushes oxygen against the closed vocal cords to force them open and oxygenate." },
          { text: "Inject Epinephrine 1mg IV immediately.", nextIndex: 2, scoreDelta: -15, feedback: "Wrong. Epinephrine is not the drug of choice for laryngospasm. Airway management and relaxants are required." }
        ]
      },
      {
        text: "Urgent emergency branch. SpO2 has stabilized, but airway patency is unstable. You successfully finished the emergency scenario.",
        choices: []
      },
      {
        text: "SpO2 continues to decline to 76%. The child is bradycardic (HR 48). CPAP is failing to break the spasm. What drug intervention is mandatory?",
        choices: [
          { text: "Administer Succinylcholine 1.0 mg/kg IV along with Atropine 0.02 mg/kg IV.", nextIndex: 2, scoreDelta: 35, feedback: "Perfect! Succinylcholine paralyses the vocal cords immediately. Atropine treats the hypoxia-induced bradycardia in children." },
          { text: "Administer Rocuronium 1.2 mg/kg IV.", nextIndex: 2, scoreDelta: 10, feedback: "Acceptable, but rocuronium takes 60 seconds to act. Succinylcholine acts in 15 seconds, which is crucial here." }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Case 3: Malignant Hyperthermia Emergency",
    description: "During a general anesthesia case using Sevoflurane and Succinylcholine, the patient's EtCO2 spikes to 78 mmHg, heart rate climbs to 142 bpm, and core temperature rises to 39.2°C.",
    stages: [
      {
        text: "These are classic initial signs of Malignant Hyperthermia (MH). What is your first action?",
        choices: [
          { text: "Stop Sevoflurane, flush the circuit with 100% O2 (>10L/min), and call for help and the MH Cart.", nextIndex: 1, scoreDelta: 30, feedback: "Excellent! You must immediately stop the trigger agent (volatile gas) and hyperventilate to wash it out." },
          { text: "Increase Sevoflurane dial concentration to settle the hyperactive patient.", nextIndex: 2, scoreDelta: -30, feedback: "FATAL! Sevoflurane is the trigger agent causing the hypermetabolic crisis. Increasing it will result in cardiovascular collapse." },
          { text: "Administer IV Amiodarone for the tachycardia.", nextIndex: 2, scoreDelta: -10, feedback: "Incorrect. The tachycardia is a symptom of severe acidosis and hyperthermia, not a primary arrhythmia." }
        ]
      },
      {
        text: "Volatile agents are stopped, and the vaporizer is removed. What is the specific life-saving medication needed?",
        choices: [
          { text: "Request and administer Dantrolene sodium 2.5 mg/kg IV immediately, repeating as necessary.", nextIndex: 3, scoreDelta: 35, feedback: "Perfect! Dantrolene is the only antidote for MH, acting as a ryanodine receptor antagonist to stop calcium release." },
          { text: "Administer Rocuronium 50mg to stop muscle rigidity.", nextIndex: 2, scoreDelta: -10, feedback: "Wrong. Non-depolarizing relaxants do not treat the intracellular calcium release in MH." }
        ]
      },
      {
        text: "Emergency branch complete. Patient temp stabilized and acidosis resolved. You successfully finished the MH crisis simulation.",
        choices: []
      },
      {
        text: "Dantrolene has arrived. Active cooling measures are initiated. The patient is acidotic. What secondary treatment is required?",
        choices: [
          { text: "Administer Sodium Bicarbonate 1-2 mEq/kg IV to treat severe metabolic acidosis, and monitor serum potassium.", nextIndex: 2, scoreDelta: 25, feedback: "Excellent! Severe metabolic acidosis and hyperkalemia are common in MH and must be corrected." }
        ]
      }
    ]
  }
];

// RSI Game Steps
interface RsiStep {
  id: number;
  text: string;
}

const rsiCorrectSequence = [1, 2, 3, 4, 5, 6, 7];

export const StudentPortal: React.FC = () => {
  const { studentScore, addStudentPoints } = useApp();

  // Flashcards state
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  
  // MCQ state
  const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Case simulation states
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [scenarioStage, setScenarioStage] = useState(0);
  const [scenarioFeedback, setScenarioFeedback] = useState('');

  // RSI mini-game states
  const [rsiSteps, setRsiSteps] = useState<RsiStep[]>([
    { id: 6, text: "Perform Direct Laryngoscopy" },
    { id: 2, text: "Administer Premedication (Fentanyl)" },
    { id: 4, text: "Apply Cricoid Pressure (Sellick Maneuver)" },
    { id: 1, text: "Pre-oxygenate with 100% O2 via Mask" },
    { id: 5, text: "Administer Succinylcholine (Paralytic)" },
    { id: 3, text: "Administer Induction Agent (Propofol)" },
    { id: 7, text: "Inflate Cuff & Confirm Tube via Capnography" }
  ]);
  const [selectedSequence, setSelectedSequence] = useState<number[]>([]);
  const [gameSpO2, setGameSpO2] = useState<number>(99);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'failed' | 'success'>('idle');
  const [gameError, setGameError] = useState<string>('');

  const currentCase = clinicalCases[activeCaseIdx];

  const handleMcqSubmit = (ansIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(ansIndex);
    setIsAnswered(true);

    const question = quizQuestions[currentMcqIdx];
    if (ansIndex === question.correctAnswer) {
      addStudentPoints(10);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentMcqIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  const handleScenarioChoice = (choice: CaseChoice) => {
    addStudentPoints(choice.scoreDelta);
    setScenarioFeedback(choice.feedback);
    setScenarioStage(choice.nextIndex);
  };

  const resetScenario = () => {
    setScenarioStage(0);
    setScenarioFeedback('');
  };

  // RSI Game controls
  const handleSelectRsiStep = (stepId: number) => {
    if (gameStatus === 'failed' || gameStatus === 'success') return;
    if (gameStatus === 'idle') setGameStatus('playing');

    const nextSeq = [...selectedSequence, stepId];
    setSelectedSequence(nextSeq);

    // Verify if this selection matches correct sequence prefix
    const currentCorrectIndex = nextSeq.length - 1;
    const expectedStepId = rsiCorrectSequence[currentCorrectIndex];

    if (stepId !== expectedStepId) {
      // Failed! Simulate SpO2 crash
      setGameStatus('failed');
      
      let curSpO2 = 99;
      const interval = setInterval(() => {
        curSpO2 -= 3;
        setGameSpO2(Math.max(78, curSpO2));
        if (curSpO2 <= 78) {
          clearInterval(interval);
        }
      }, 80);

      // Analyze error reason
      let errorMsg = "Incorrect sequencing in RSI!";
      if (stepId === 5 && !nextSeq.includes(3)) {
        errorMsg = "❌ CRITICAL ERROR: You administered a neuromuscular blocker (Succinylcholine) to an awake, un-sedated patient! This causes severe airway panic and trauma.";
      } else if (stepId === 6 && !nextSeq.includes(3)) {
        errorMsg = "❌ CRITICAL ERROR: You attempted laryngoscopy on an awake patient! Patient experienced severe laryngospasm, choking, and cardiovascular stress.";
      } else if (nextSeq[0] !== 1) {
        errorMsg = "❌ CLINICAL FAILURE: You induced anesthesia without pre-oxygenation. The patient rapidly desaturated below 80% SpO2 during the apnea window.";
      } else if (stepId === 7 && !nextSeq.includes(6)) {
        errorMsg = "❌ ERROR: You attempted to inflate the ETT cuff before performing laryngoscopy or placing the tube.";
      }
      setGameError(errorMsg);
    } else {
      // Correct step
      if (nextSeq.length === rsiCorrectSequence.length) {
        setGameStatus('success');
        addStudentPoints(50);
      }
    }
  };

  const resetRsiGame = () => {
    setSelectedSequence([]);
    setGameSpO2(99);
    setGameStatus('idle');
    setGameError('');
    // Scramble steps again
    setRsiSteps(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const flashcards = [
    { drug: 'Propofol', receptors: 'GABA-A Receptor Modulator', dose: '1.5 - 2.5 mg/kg IV', contra: 'Egg/Soy allergy, severe aortic stenosis' },
    { drug: 'Succinylcholine', receptors: 'Depolarizing Neuromuscular Blocker', dose: '1.0 - 1.5 mg/kg IV', contra: 'Malignant Hyperthermia, severe burns, hyperkalemia' },
    { drug: 'Fentanyl', receptors: 'Mu-Opioid Receptor Agonist', dose: '1.0 - 3.0 mcg/kg IV', contra: 'Severe respiratory depression, raised intracranial pressure' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Anesthesia Education Portal</h1>
          <p className="page-subtitle">Test clinical decision skills, review flashcards, and complete clinical simulations</p>
        </div>
        <div className="glass" style={{ padding: '8px 16px', borderLeft: '4px solid var(--med-orange)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YOUR SCORE</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--med-orange)', fontFamily: 'var(--font-mono)' }}>
            🏆 {studentScore} pts
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '24px' }}>
        {/* Left Side: MCQ, Flashcards & RSI Game */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* MCQ Practice */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>MCQ Quiz Challenge</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Question {currentMcqIdx + 1} of {quizQuestions.length}</span>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginTop: '8px', marginBottom: '16px' }}>
              {quizQuestions[currentMcqIdx].question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quizQuestions[currentMcqIdx].options.map((opt, i) => {
                let btnStyle: React.CSSProperties = { textAlign: 'left', display: 'block', width: '100%', fontSize: '0.875rem' };
                if (isAnswered) {
                  if (i === quizQuestions[currentMcqIdx].correctAnswer) {
                    btnStyle = { ...btnStyle, backgroundColor: 'rgba(0,184,148,0.15)', borderColor: 'var(--med-green)', color: 'white' };
                  } else if (i === selectedAnswer) {
                    btnStyle = { ...btnStyle, backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'var(--med-red)', color: 'white' };
                  }
                }
                return (
                  <button
                    key={i}
                    className="btn btn-secondary"
                    style={btnStyle}
                    onClick={() => handleMcqSubmit(i)}
                    disabled={isAnswered}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
                <span style={{ fontWeight: 700, color: selectedAnswer === quizQuestions[currentMcqIdx].correctAnswer ? 'var(--med-green)' : 'var(--med-red)' }}>
                  {selectedAnswer === quizQuestions[currentMcqIdx].correctAnswer ? '✓ Correct! (+10 pts)' : '❌ Incorrect.'}
                </span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>{quizQuestions[currentMcqIdx].explanation}</p>
                <button className="btn btn-primary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.75rem' }} onClick={handleNextQuestion}>
                  Next Question
                </button>
              </div>
            )}
          </div>

          {/* NEW: RSI Intubation Sequencer Game */}
          <div className="glass" style={{ padding: '20px', border: '1px solid var(--border-color-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--med-cyan)' }}>🧬 RSI Sequencer Mini-Game</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SpO2 Telemetry:</span>
                <span className={`badge ${gameSpO2 < 90 ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  {gameSpO2}%
                </span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
              Select the correct sequence of steps to perform a **Rapid Sequence Induction (RSI)** without compromising airway protection or patient safety.
            </p>

            {/* Selected Sequence Steps list */}
            <div style={{ minHeight: '40px', padding: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {selectedSequence.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sequence Timeline (Click steps below in order...)</span>
              ) : (
                selectedSequence.map((stepId, idx) => {
                  const label = rsiSteps.find(s => s.id === stepId)?.text || '';
                  return (
                    <span key={idx} style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'var(--med-blue)', color: 'white', borderRadius: '3px', fontWeight: 700 }}>
                      {idx + 1}. {label.split(" (")[0]}
                    </span>
                  );
                })
              )}
            </div>

            {/* Scrambled buttons list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {rsiSteps.map((step) => {
                const isSelected = selectedSequence.includes(step.id);
                return (
                  <button
                    key={step.id}
                    className="btn btn-secondary"
                    style={{
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      opacity: isSelected ? 0.3 : 1,
                      pointerEvents: isSelected ? 'none' : 'auto'
                    }}
                    onClick={() => handleSelectRsiStep(step.id)}
                  >
                    {step.text}
                  </button>
                );
              })}
            </div>

            {/* Game feedback cards */}
            {gameStatus === 'failed' && (
              <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--med-red)', borderRadius: '4px' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--med-red)' }}>CRITICAL CLINICAL FAILURE</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{gameError}</p>
                <button className="btn btn-primary" style={{ marginTop: '10px', padding: '5px 12px', fontSize: '0.7rem' }} onClick={resetRsiGame}>
                  Try Again
                </button>
              </div>
            )}

            {gameStatus === 'success' && (
              <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(0,184,148,0.1)', border: '1px solid var(--med-green)', borderRadius: '4px' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--med-green)' }}>✓ SUCCESSFUL INDUCTION (+50 pts)</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  Perfect. You successfully pre-oxygenated, sedated, protected the esophagus via Sellick maneuver, paralyzed, and intubated the patient safely.
                </p>
                <button className="btn btn-primary" style={{ marginTop: '10px', padding: '5px 12px', fontSize: '0.7rem' }} onClick={resetRsiGame}>
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Flashcards */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>Anesthesia Pharmacology Flashcards</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {flashcards.map((card, index) => (
                <div 
                  key={index} 
                  className={`flashcard ${flippedIndex === index ? 'flipped' : ''}`}
                  onClick={() => setFlippedIndex(flippedIndex === index ? null : index)}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-front">
                      <span style={{ fontSize: '0.65rem', color: 'var(--med-cyan)', fontWeight: 800 }}>DRUG FILE</span>
                      <strong style={{ fontSize: '1.125rem' }}>{card.drug}</strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tap to inspect profile</span>
                    </div>
                    <div className="flashcard-back">
                      <div style={{ fontSize: '0.75rem', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong>Receptors:</strong> {card.receptors}</div>
                        <div><strong>Dose:</strong> {card.dose}</div>
                        <div><strong>Contra:</strong> {card.contra}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Case Simulation Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass" style={{ padding: '20px', border: '1px solid var(--border-color-glow)' }}>
            {/* Case selector tab bar */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              {clinicalCases.map((cs, i) => (
                <button
                  key={cs.id}
                  className="btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    border: '1px solid var(--border-color)',
                    backgroundColor: activeCaseIdx === i ? 'rgba(0,102,255,0.1)' : 'transparent',
                    color: activeCaseIdx === i ? 'var(--med-blue)' : 'var(--text-secondary)'
                  }}
                  onClick={() => {
                    setActiveCaseIdx(i);
                    resetScenario();
                  }}
                >
                  Case {cs.id}
                </button>
              ))}
            </div>

            <span className="badge badge-info" style={{ marginBottom: '8px' }}>CLINICAL SIMULATION</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentCase.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '4px', lineHeight: '1.5', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              {currentCase.description}
            </p>

            <div style={{ marginTop: '16px' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '16px', lineHeight: '1.4' }}>
                {currentCase.stages[scenarioStage].text}
              </p>

              {scenarioFeedback && (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--med-cyan)', fontSize: '0.8125rem', marginBottom: '16px', lineHeight: '1.4' }}>
                  <strong>Feedback:</strong> {scenarioFeedback}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentCase.stages[scenarioStage].choices.map((choice, i) => (
                  <button
                    key={i}
                    className="btn btn-secondary"
                    style={{ textAlign: 'left', fontSize: '0.8125rem', padding: '10px 14px' }}
                    onClick={() => handleScenarioChoice(choice)}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>

              {currentCase.stages[scenarioStage].choices.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={resetScenario}>
                    Restart Simulation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Department Leaderboard</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                <span>1. Sarah Miller (Resident III)</span>
                <strong>420 pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                <span>2. Alex Jenkins (Resident II)</span>
                <strong>310 pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(0,102,255,0.1)', borderRadius: '4px', border: '1px solid var(--border-color-glow)' }}>
                <span>3. You (Anesthesia Student)</span>
                <strong style={{ color: 'var(--med-cyan)' }}>{studentScore} pts</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
