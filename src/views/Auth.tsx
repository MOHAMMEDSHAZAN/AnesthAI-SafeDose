import React, { useState, useEffect } from 'react';
import { useApp, type UserRole } from '../context/AppContext';

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const { userRole, setUserRole } = useApp();
  const [email, setEmail] = useState('anesthesia.lead@hospital.org');
  const [password, setPassword] = useState('••••••••••••');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  // Tab states: 'credentials' | 'biometric' | 'emergency'
  const [authTab, setAuthTab] = useState<'credentials' | 'biometric' | 'emergency'>('credentials');
  
  // Biometric scanning state
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Ready for Iris Scan');

  // Left slide showcase states
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [
    {
      title: 'Precision Anesthesia Decision Support',
      desc: 'Integrated Apfel, RCRI, and Caprini clinical algorithm calculators to forecast patient risk profiles and recommend anesthetic techniques.',
      badge: 'CLINICAL INTELLIGENCE'
    },
    {
      title: 'Real-Time ECG & Vital Telemetry',
      desc: 'Simulated high-fidelity patient monitor channels displaying ECG sweeps, capnography, and SpO2 streams to train OT teams under pressure.',
      badge: 'TELEMETRY SYNC'
    },
    {
      title: 'ACLS Emergency Crisis HUD',
      desc: 'Interactive step-by-step algorithms for anaphylaxis, bronchospasms, and cardiac arrests complete with CPR chest compression cycle timers.',
      badge: 'CRISIS OVERLAYS'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setStep('otp');
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered === generatedOtp) {
      onLoginSuccess();
    } else {
      alert("Verification Failed: Passcode mismatch. Sync pager and try again.");
      setOtp(['', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    }
  };

  // Biometric login scanner sequence
  const startBiometricScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatus('Initializing camera & IR sensors...');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      
      if (progress === 30) {
        setScanStatus('Aligning iris to scan targets...');
      } else if (progress === 60) {
        setScanStatus('Verifying cryptographic signature on SAML Card...');
      } else if (progress === 90) {
        setScanStatus('Authorizing session credentials...');
      } else if (progress >= 100) {
        clearInterval(interval);
        setScanStatus('Access Granted. Redirecting...');
        setTimeout(() => {
          setIsScanning(false);
          setUserRole('Anesthesiologist');
          onLoginSuccess();
        }, 800);
      }
    }, 120);
  };

  // Fast-pass emergency bypass login
  const handleTraumaBypass = () => {
    setUserRole('Anesthesiologist');
    onLoginSuccess();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.2fr', backgroundColor: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      
      {/* Left Column: Clinical Slideshow Showcase */}
      <div style={{
        background: 'linear-gradient(135deg, #112344, #175cdd)',
        color: 'white',
        padding: '60px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract design elements matching Clinic style */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(63,187,192,0.1)', pointerEvents: 'none' }} />
        
        {/* Branding header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--med-cyan)' }}>
            <line x1="22" y1="12" x2="2" y2="12"/>
            <path d="M5.4 12h2.2l2.3-6 3.3 12 2.3-8 1.1 4.5 2 2.5h2"/>
          </svg>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            AnesthAI <span style={{ color: 'var(--med-cyan)' }}>SafeDose</span>
          </span>
        </div>

        {/* Dynamic Slideshow */}
        <div style={{ margin: '80px 0', minHeight: '220px', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--med-cyan)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>
            {slides[slideIndex].badge}
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px', fontFamily: 'var(--font-heading)', transition: 'all 0.5s' }}>
            {slides[slideIndex].title}
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '480px', transition: 'all 0.5s' }}>
            {slides[slideIndex].desc}
          </p>
          
          {/* Indicator Dots */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            {slides.map((_, idx) => (
              <span 
                key={idx}
                onClick={() => setSlideIndex(idx)}
                style={{
                  width: idx === slideIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: idx === slideIndex ? 'var(--med-cyan)' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer Authority Warning */}
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          🔒 SECURE PROTOCOL ACTIVE: All authorization requests are audited under HIPAA/HL7 specifications. Decision recommender support only.
        </div>
      </div>

      {/* Right Column: Dynamic Authentication Card */}
      <div style={{
        padding: '60px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        
        {step === 'credentials' ? (
          <div style={{ width: '100%', maxWidth: '460px' }}>
            {/* Tab navigation headers */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <button 
                className="btn"
                style={{ 
                  flex: 1, 
                  padding: '12px 6px', 
                  borderRadius: 0, 
                  borderBottom: authTab === 'credentials' ? '2px solid var(--med-blue)' : 'none',
                  color: authTab === 'credentials' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-nav)',
                  background: 'transparent'
                }}
                onClick={() => setAuthTab('credentials')}
              >
                🔐 Credentials Sign-In
              </button>
              <button 
                className="btn"
                style={{ 
                  flex: 1, 
                  padding: '12px 6px', 
                  borderRadius: 0, 
                  borderBottom: authTab === 'biometric' ? '2px solid var(--med-blue)' : 'none',
                  color: authTab === 'biometric' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-nav)',
                  background: 'transparent'
                }}
                onClick={() => setAuthTab('biometric')}
              >
                👁 Biometric Access
              </button>
              <button 
                className="btn"
                style={{ 
                  flex: 1, 
                  padding: '12px 6px', 
                  borderRadius: 0, 
                  borderBottom: authTab === 'emergency' ? '2px solid var(--med-red)' : 'none',
                  color: authTab === 'emergency' ? 'var(--med-red)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-nav)',
                  background: 'transparent'
                }}
                onClick={() => setAuthTab('emergency')}
              >
                🚨 Trauma Bypass
              </button>
            </div>

            {/* TAB 1: Standard Credentials */}
            {authTab === 'credentials' && (
              <div className="glass" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>SAML Hospital Login</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Provide credentials synchronized with hospital shifts</p>
                
                <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">SAML Hospital Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Passcode Key</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Access Role Designation</label>
                    <select 
                      className="form-control" 
                      value={userRole} 
                      onChange={(e) => setUserRole(e.target.value as UserRole)}
                    >
                      <option value="Anesthesiologist">Anesthesiologist (MD)</option>
                      <option value="Doctor">Surgeon (MD)</option>
                      <option value="Resident">Anesthesia Resident</option>
                      <option value="OT Nurse">Operating Room Nurse</option>
                      <option value="PACU Nurse">PACU Recovery Nurse</option>
                      <option value="Hospital Admin">Hospital Administrator</option>
                      <option value="Student">Medical Student</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', fontWeight: 700 }}>
                    Request Authenticator Token
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Biometric Iris Scanner */}
            {authTab === 'biometric' && (
              <div className="glass" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Iris Biometric Scanning</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Verify authentication via hospital badge scanner or camera feed</p>
                
                {/* Visual scanner animations */}
                <div style={{
                  position: 'relative',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  border: '3px double var(--med-blue)',
                  margin: '0 auto 24px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(23, 92, 221, 0.03)',
                  overflow: 'hidden'
                }}>
                  {/* Rotating target circles */}
                  <div style={{
                    position: 'absolute',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '1px dashed var(--med-cyan)',
                    animation: isScanning ? 'rotate-spin 4s linear infinite' : 'none'
                  }} />

                  {/* Iris lens image simulation */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #021418 30%, var(--med-blue) 70%, var(--med-cyan) 100%)',
                    boxShadow: isScanning ? '0 0 20px rgba(63, 187, 192, 0.6)' : 'none'
                  }} />

                  {/* Moving scanning beam */}
                  {isScanning && (
                    <div 
                      className="scan-line"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: 'var(--med-cyan)',
                        boxShadow: '0 0 10px var(--med-cyan)',
                        animation: 'scan-line 1.5s ease-in-out infinite'
                      }}
                    />
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isScanning ? 'var(--med-blue)' : 'var(--text-secondary)' }}>
                    {scanStatus}
                  </div>
                  {isScanning && (
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', marginTop: '10px' }}>
                      <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: 'var(--med-blue)', transition: 'width 0.1s' }}></div>
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', fontWeight: 700 }}
                  onClick={startBiometricScan}
                  disabled={isScanning}
                >
                  {isScanning ? 'Scanning Iris Feed...' : '👁 Scan Clinician Badge'}
                </button>
              </div>
            )}

            {/* TAB 3: Trauma Crisis Bypass */}
            {authTab === 'emergency' && (
              <div className="glass" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(223, 21, 41, 0.1)',
                  color: 'var(--med-red)',
                  fontSize: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  border: '2px solid rgba(223, 21, 41, 0.2)'
                }}>
                  🚨
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--med-red)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Trauma Bypass Mode</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                  CRITICAL ACCESS PROTOCOL: Bypass sign-in authentication for incoming acute trauma resuscitations. Access will be logged and audited automatically.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    className="btn btn-danger" 
                    style={{ width: '100%', padding: '12px', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(223,21,41,0.2)' }}
                    onClick={handleTraumaBypass}
                  >
                    ⚡ Authorize Trauma Fast-Pass
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%' }}
                    onClick={() => setAuthTab('credentials')}
                  >
                    Cancel & Return to Standard Login
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: OTP Entry Panel with Pager Assist */
          <div style={{ width: '100%', maxWidth: '580px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center' }}>
            
            {/* Left side: Simulated Hospital Pager Displaying MFA Code */}
            <div style={{
              background: '#2b2d31',
              borderRadius: 'var(--radius-md)',
              border: '6px solid #1a1b1e',
              padding: '16px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Pager LCD Screen */}
              <div style={{
                background: '#8fa89b',
                color: '#1a231f',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid #5a6a61',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                lineHeight: '1.5',
                minHeight: '110px',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #5a6a61', paddingBottom: '4px', marginBottom: '8px', fontSize: '0.65rem', fontWeight: 700 }}>
                  <span>PAGE RECEIVED</span>
                  <span>14:28 PM</span>
                </div>
                <div>💬 SafeDose Gate:</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', margin: '4px 0' }}>
                  Auth Code: <span style={{ textDecoration: 'underline' }}>{generatedOtp}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#3a443f', marginTop: '6px' }}>
                  Verify within 60 seconds.
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#3fbbc0', borderRadius: '50%', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.65rem', color: '#a9acb2', fontWeight: 700 }}>PAGER-SYNC: OK</span>
              </div>
            </div>

            {/* Right side: OTP Code submission */}
            <div className="glass" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>MFA Verification</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Type the code shown on your Hospital Pager.</p>

              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      className="form-control"
                      style={{ width: '42px', height: '42px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', padding: 0 }}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          const prevInput = document.getElementById(`otp-${idx - 1}`);
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      required
                    />
                  ))}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontWeight: 700 }}>
                  Verify & Log In
                </button>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setStep('credentials')}
                  style={{ width: '100%' }}
                >
                  Back
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Dynamic JWT token Claims inspector widget */}
        <div style={{ width: '100%', maxWidth: '460px', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              JWT Claims Diagnostic inspector
            </span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(23,92,221,0.05)', color: 'var(--med-blue)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
              EST. SECURE ISSUER
            </span>
          </div>
          
          <pre style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
            color: 'var(--text-secondary)'
          }}>
            {"{"}
            <br />
            {"  \"iss\": \"safe-dose-auth\","}
            <br />
            {`  "sub": "${email || 'staff-4289'}",`}
            <br />
            {`  "role": "${userRole}",`}
            <br />
            {`  "mfa_verified": ${step === 'otp' || authTab === 'biometric' || authTab === 'emergency' ? 'true' : 'false'},`}
            <br />
            {`  "exp": ${Math.floor(Date.now() / 1000) + 3600}`}
            <br />
            {"}"}
          </pre>
        </div>

      </div>
    </div>
  );
};
