import React, { useEffect, useRef, useState } from 'react';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'hospital' | 'enterprise'>('hospital');

  // Sweep animation for ECG on Landing Page
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    ctx.strokeStyle = '#00b894';
    ctx.lineWidth = 2.5;

    // Draw baseline grid
    const drawGrid = () => {
      ctx.fillStyle = 'rgba(2, 6, 17, 0.2)';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    };

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    const animate = () => {
      drawGrid();
      
      // Clear a small strip ahead of the cursor to make it look like a sweeping monitor
      ctx.fillStyle = '#020617';
      ctx.fillRect(x + 1, 0, 15, height);

      ctx.beginPath();
      ctx.strokeStyle = '#00b894';
      ctx.lineWidth = 2.5;
      
      // Generate QRS complex wave points
      let y = height / 2;
      const cyclePos = x % 100;
      
      if (cyclePos > 40 && cyclePos < 43) {
        y = height / 2 - 15; // P wave
      } else if (cyclePos >= 43 && cyclePos < 46) {
        y = height / 2; // Flat
      } else if (cyclePos === 46) {
        y = height / 2 + 10; // Q wave
      } else if (cyclePos === 48) {
        y = height / 2 - 45; // R wave (Peak pulse)
      } else if (cyclePos === 50) {
        y = height / 2 + 20; // S wave
      } else if (cyclePos >= 51 && cyclePos < 54) {
        y = height / 2; // Flat
      } else if (cyclePos >= 54 && cyclePos < 60) {
        y = height / 2 - 8; // T wave
      } else {
        y = height / 2; // Baseline
      }

      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fillStyle = '#00b894';
      ctx.fill();
      
      x = (x + 2) % width;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', position: 'relative', color: 'var(--text-primary)' }}>
      {/* Landing Header */}
      <nav style={{ height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 800 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--med-blue)' }}>
            <line x1="22" y1="12" x2="2" y2="12"/>
            <path d="M5.4 12h2.2l2.3-6 3.3 12 2.3-8 1.1 4.5 2 2.5h2"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>AnesthAI <span style={{ color: 'var(--med-blue)' }}>SafeDose</span></span>
        </div>
        <button className="quick-action-btn" onClick={onGetStarted} style={{ fontFamily: 'var(--font-nav)', borderRadius: '30px' }}>
          Access Clinician Portal
        </button>
      </nav>

      {/* Hero Section (Clinic-1.0.0 Double-Column) */}
      <div className="landing-hero">
        <div className="landing-hero-grid">
          {/* Left Column: Content */}
          <div>
            <div className="trust-badges">
              <div className="badge-item">
                <span style={{ color: 'var(--med-blue)' }}>✔</span>
                <span>Clinical Decision Support</span>
              </div>
              <div className="badge-item">
                <span style={{ color: 'var(--med-green)' }}>●</span>
                <span>24/7 Crisis Assistance</span>
              </div>
              <div className="badge-item">
                <span style={{ color: 'var(--med-cyan)' }}>★</span>
                <span>Precision Dosing AI</span>
              </div>
            </div>

            <h1 className="landing-title">
              Precision Anesthesia Planning & <br />
              <span>Real-time Safety Decisions</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>
              AnesthAI SafeDose empowers surgical teams with AI perioperative planning, weight-adjusted drug safety calculators, interactive airway assessments, and instant ACLS emergency protocols.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '12px 28px', borderRadius: '30px', fontFamily: 'var(--font-nav)' }}>
                Get Started (Clinician Portal)
              </button>
              <a href="#features" className="btn btn-secondary" style={{ padding: '12px 28px', borderRadius: '30px', fontFamily: 'var(--font-nav)' }}>
                Explore Core Features
              </a>
            </div>

            {/* Emergency hotline banner matching template */}
            <div className="emergency-contact-banner">
              <div className="emergency-icon-box">
                ☎
              </div>
              <div className="emergency-text">
                <small>Crisis Hotline Indicator</small>
                <strong>+1 (555) 911-2468</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Doctor/Hospital Staff Image + Floating Cards */}
          <div className="hero-visual">
            <div className="main-image">
              <img src="/assets/img/health/staff-10.webp" alt="Modern Medical Team" />
              
              {/* Floating Card: Next Surgery */}
              <div className="floating-card appointment-card">
                <div className="card-icon">
                  📋
                </div>
                <div className="card-content">
                  <h6>Next Case Scheduled</h6>
                  <p>Today 2:30 PM (OR-1)</p>
                  <small>Dr. Sarah Jenkins</small>
                </div>
              </div>

              {/* Floating Card: Recommender Accuracy */}
              <div className="floating-card rating-card">
                <div className="card-content">
                  <div className="rating-stars">
                    ★★★★★
                  </div>
                  <h6 style={{ marginTop: '4px' }}>99.9% Plan Score</h6>
                  <small>Clinical Safety Consensus</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Patient Monitor Simulation Section Framed in Light card */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div className="glass" style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--med-green)', borderRadius: '50%', display: 'inline-block', animation: 'heart-pulse 1s infinite' }}></span>
            Ward OT-1 Telemetry Preview (Robert Miller, P001)
          </h3>
          
          <div style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              <span>LIVE ECG SWEEP TELEMETRY</span>
              <span style={{ color: 'var(--med-green)' }}>● RECEIVER LOCKED</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
              <div style={{ height: '140px', background: '#010409', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <canvas ref={ecgCanvasRef} width="560" height="140" className="waveform-canvas"></canvas>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#030712', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,184,148,0.2)' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--med-green)', fontWeight: 800 }}>HEART RATE</span>
                  <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--med-green)', animation: 'heart-pulse 1s infinite' }}>72</span>
                  <span style={{ fontSize: '0.5rem', color: '#64748b' }}>BPM</span>
                </div>
                <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#030712', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(63,187,192,0.2)' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--med-cyan)', fontWeight: 800 }}>SpO2</span>
                  <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--med-cyan)' }}>99%</span>
                  <span style={{ fontSize: '0.5rem', color: '#64748b' }}>OXYGEN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Stats Grid */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 80px auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', padding: '0 24px' }}>
        <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--med-blue)', fontFamily: 'var(--font-mono)' }}>120K+</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px' }}>Monitored Surgeries</p>
        </div>
        <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--med-green)', fontFamily: 'var(--font-mono)' }}>99.99%</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px' }}>Recommender Accuracy</p>
        </div>
        <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--med-cyan)', fontFamily: 'var(--font-mono)' }}>15+</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px' }}>Global Hospital Partners</p>
        </div>
      </div>

      {/* Feature Showcase */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>Comprehensive Clinical Architecture</h2>
        
        <div className="landing-features-grid">
          <div className="glass" style={{ padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0,102,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--med-blue)', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>Interactive Drug Doser</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Calculates precise bolus, maintenance, and continuous dilution values for adult and pediatric weights, factoring in renal/hepatic clearances.
            </p>
          </div>

          <div className="glass" style={{ padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0,184,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--med-green)', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>Preoperative Evaluation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Digital Pre-Anesthetic Assessment (PAC) integrating Mallampati, comorbidities, and automatic ASA, Caprini, and PONV risk calculators.
            </p>
          </div>

          <div className="glass" style={{ padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--med-red)', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>ACLS Emergency Portal</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              One-click access to critical algorithms (Cardiac Arrest, Anaphylaxis, Laryngospasm) complete with countdown compression timers.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ maxWidth: '900px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '12px' }}>Flexible Licensure Plans</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px' }}>Select the scale that matches your hospital infrastructure</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div 
            onClick={() => setSelectedPlan('individual')}
            className="glass" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer', 
              borderColor: selectedPlan === 'individual' ? 'var(--med-blue)' : 'var(--border-color)',
              transform: selectedPlan === 'individual' ? 'scale(1.03)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Individual</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 16px 0' }}>For students and residents</p>
            <h4 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px' }}>$0 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ mo</span></h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li>✓ Basic drug calculators</li>
              <li>✓ Student portals & flashcards</li>
              <li>✓ Single user active case</li>
            </ul>
          </div>

          <div 
            onClick={() => setSelectedPlan('hospital')}
            className="glass" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer', 
              borderColor: selectedPlan === 'hospital' ? 'var(--med-blue)' : 'var(--border-color)',
              transform: selectedPlan === 'hospital' ? 'scale(1.03)' : 'none',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <span style={{ position: 'absolute', top: '-10px', right: '20px', background: 'var(--med-blue)', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800 }}>MOST POPULAR</span>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Clinic & Ward</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 16px 0' }}>For localized medical departments</p>
            <h4 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px' }}>$249 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ ward</span></h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li>✓ Dynamic Live OT monitoring</li>
              <li>✓ AI Planner & Pre-op score check</li>
              <li>✓ Collaborative digital OT charts</li>
            </ul>
          </div>

          <div 
            onClick={() => setSelectedPlan('enterprise')}
            className="glass" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer', 
              borderColor: selectedPlan === 'enterprise' ? 'var(--med-blue)' : 'var(--border-color)',
              transform: selectedPlan === 'enterprise' ? 'scale(1.03)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Enterprise</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 16px 0' }}>For multi-site hospital networks</p>
            <h4 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px' }}>Custom <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>annual</span></h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li>✓ HL7 / FHIR database sync</li>
              <li>✓ Advanced audit log analytics</li>
              <li>✓ 24/7 dedicated clinical SLA</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer">
        <p>© 2026 AnesthAI SafeDose. Clinical decision support only. All final authority belongs to licensed clinicians.</p>
      </footer>
    </div>
  );
};
