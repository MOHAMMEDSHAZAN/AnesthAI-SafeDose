import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

export const LiveOT: React.FC = () => {
  const { simulatedState, setSimulatedState, patients } = useApp();
  const patient = patients[0]; // Robert Miller by default

  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  const spo2CanvasRef = useRef<HTMLCanvasElement>(null);
  const etco2CanvasRef = useRef<HTMLCanvasElement>(null);
  const pawCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Ref and Mute State
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Vitals State
  const [vitals, setVitals] = useState({
    hr: 72,
    bpSys: 122,
    bpDia: 78,
    map: 92,
    spo2: 99,
    etco2: 38,
    temp: 36.8,
    rr: 12,
    bis: 45, // Bispectral index (sedation depth: 40-60 is ideal)
    tof: '4/4', // Train of Four (muscle relaxation)
    pip: 18, // Peak inspiratory pressure
    peep: 5, // Positive end-expiratory pressure
    tv: 480, // Tidal volume (mL)
    bloodLoss: 150,
    urineOutput: 80,
    fluidBalance: 400
  });

  // Volatile Gas & MAC Analyzer states
  const [sevoDial, setSevoDial] = useState<number>(2.0); // Sevoflurane gas dial %
  const [sevoExpired, setSevoExpired] = useState<number>(1.8); // Expired gas concentration

  // Vasoactive Infusion rates
  const [phenylephrineRate, setPhenylephrineRate] = useState<number>(0); // mcg/min
  const [norepinephrineRate, setNorepinephrineRate] = useState<number>(0); // mcg/min

  // Temporary Pacemaker HUD states
  const [pacemakerActive, setPacemakerActive] = useState<boolean>(false);
  const [pacingRate, setPacingRate] = useState<number>(70); // bpm
  const [pacingCurrent, setPacingCurrent] = useState<number>(60); // mA

  // Drug & Infusion States (Emergency Boluses)
  const [atropineActive, setAtropineActive] = useState<number>(0); // active ticks remaining
  const [ephedrineActive, setEphedrineActive] = useState<number>(0); // active ticks remaining
  const [propofolRate, setPropofolRate] = useState<number>(150); // mcg/kg/min
  
  const [timelineLogs, setTimelineLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'warning' | 'drug' | 'success' }>>([
    { time: '14:20:00', msg: 'System initialized. Receiver telemetry locked on Patient Robert Miller.', type: 'info' },
    { time: '14:20:15', msg: 'Ventilator synchronized. Target Tidal Volume 480mL at RR 12.', type: 'info' }
  ]);

  const addLog = (msg: string, type: 'info' | 'warning' | 'drug' | 'success') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTimelineLogs(prev => [{ time: timestamp, msg, type }, ...prev]);
  };

  // Real-time AI Hypotension Risk calculation based on Logistic Regression weights
  const calculateHypotensionRisk = (hr: number, bpSys: number, bpDia: number, map: number, temp: number) => {
    // Normalization parameters matching datasets mean/std values
    const hr_scaled = (hr - 80) / 12;
    const sbp_scaled = (bpSys - 115) / 18;
    const dbp_scaled = (bpDia - 70) / 12;
    const map_scaled = (map - 85) / 14;
    const temp_scaled = (temp - 36.4) / 0.4;

    // Weights from datasets/train_model.py
    const z = 0.3541 * hr_scaled - 1.5421 * sbp_scaled - 0.8920 * dbp_scaled - 2.1052 * map_scaled - 0.1542 * temp_scaled - 0.5421;
    const prob = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
    return Math.round(prob * 100);
  };

  const hypotensionRisk = calculateHypotensionRisk(vitals.hr, vitals.bpSys, vitals.bpDia, vitals.map, vitals.temp);

  // Web Audio Synth - Play beat with frequency mapped to SpO2 (auditory oximetry)
  const playHeartbeatSound = (spo2Val: number) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Auditory Oximetry: Pitch maps to SpO2 level
      const freq = 120 + (spo2Val * 4.8);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("AudioContext failed:", e);
    }
  };

  // Web Audio Synth - Play triple beeping critical alarm
  const playAlarmSound = () => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      [0, 0.18, 0.36].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now + delay);
        gain.gain.setValueAtTime(0.05, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch (e) {
      console.warn("Alarm audio failed:", e);
    }
  };

  // Interactive drug bolus trigger handlers
  const handleAtropineBolus = () => {
    setAtropineActive(prev => prev + 6);
    addLog('Clinician Action: Administered Atropine 0.5mg IV Bolus.', 'drug');
  };

  const handleEphedrineBolus = () => {
    setEphedrineActive(prev => prev + 6);
    addLog('Clinician Action: Administered Ephedrine 10mg IV Bolus.', 'drug');
  };

  // Log simulation changes
  useEffect(() => {
    if (simulatedState !== 'normal') {
      addLog(`Alert Condition Triggered: ${simulatedState.toUpperCase()}`, 'warning');
    } else {
      addLog('Vitals returned to Standard normal baseline.', 'success');
    }
  }, [simulatedState]);

  // Vitals Drift Engine (interpolates current vitals to simulated target profiles)
  useEffect(() => {
    let interval: any;
    
    const updateVitals = () => {
      setVitals(prev => {
        // Standard random drift
        let hrDrift = (Math.random() - 0.5) * 1.5;
        let bpSysDrift = (Math.random() - 0.5) * 3;
        let bpDiaDrift = (Math.random() - 0.5) * 1.5;
        let spo2Drift = (Math.random() - 0.5) * 0.15;
        let tempDrift = (Math.random() - 0.5) * 0.03;
        let etco2Drift = (Math.random() - 0.5) * 0.8;

        let targetHr = 72;
        let targetBpSys = 120;
        let targetBpDia = 80;
        let targetSpo2 = 99;
        let targetEtco2 = 38;
        let targetTemp = 36.8;
        let targetRr = 12;

        // Apply active simulation profiles
        switch (simulatedState) {
          case 'bradycardia':
            targetHr = 38;
            targetBpSys = 95;
            targetBpDia = 55;
            targetRr = 8;
            break;
          case 'hypoxia':
            targetSpo2 = 88;
            targetHr = 105;
            targetRr = 18;
            break;
          case 'hypotension':
            targetBpSys = 82;
            targetBpDia = 44;
            targetHr = 94;
            break;
          case 'tachycardia':
            targetHr = 138;
            targetBpSys = 145;
            targetBpDia = 95;
            targetRr = 16;
            break;
          case 'hyperthermia':
            targetTemp = 39.8;
            targetHr = 122;
            targetEtco2 = 65;
            targetRr = 24;
            break;
          case 'normal':
          default:
            targetHr = 72;
            targetBpSys = 122;
            targetBpDia = 78;
            targetSpo2 = 99;
            targetEtco2 = 38;
            targetTemp = 36.8;
            targetRr = 12;
            break;
        }

        // Apply emergency boluses
        if (atropineActive > 0) {
          targetHr = Math.max(targetHr, 85);
          targetBpSys = Math.max(targetBpSys, 115);
          setAtropineActive(a => a - 1);
        }

        if (ephedrineActive > 0) {
          targetBpSys = Math.max(targetBpSys, 125);
          targetBpDia = Math.max(targetBpDia, 80);
          setEphedrineActive(e => e - 1);
        }

        // 1. Continuous Vasopressors infusion titration
        if (phenylephrineRate > 0) {
          targetBpSys += (phenylephrineRate * 0.25);
          targetBpDia += (phenylephrineRate * 0.16);
          targetHr -= (phenylephrineRate * 0.1); // Reflex bradycardia
        }
        if (norepinephrineRate > 0) {
          targetBpSys += (norepinephrineRate * 1.5);
          targetBpDia += (norepinephrineRate * 0.9);
          targetHr += (norepinephrineRate * 0.5);
        }

        // 2. Inhaled Sevoflurane concentration drift
        setSevoExpired(prevGas => {
          const delta = (sevoDial - prevGas) * 0.08;
          return parseFloat((prevGas + delta).toFixed(2));
        });

        // Sevoflurane vasodilator effect drops blood pressure
        targetBpSys -= (sevoExpired * 9);
        targetBpDia -= (sevoExpired * 5);

        // 3. Pacemaker capture
        if (pacemakerActive) {
          targetHr = pacingRate;
          if (simulatedState === 'bradycardia') {
            targetBpSys = Math.max(targetBpSys, 110);
            targetBpDia = Math.max(targetBpDia, 68);
          }
        }

        // Propofol + Sevoflurane sedation synergistic effect on BIS
        let targetBis = 45;
        if (propofolRate === 0 && sevoExpired < 0.3) {
          targetBis = 98; // Awake
          targetHr = Math.min(targetHr + 25, 140);
          targetBpSys = Math.min(targetBpSys + 30, 180);
        } else {
          targetBis = Math.max(10, Math.round(100 - (propofolRate * 0.35) - (sevoExpired * 22)));
        }

        // Interpolate slowly
        const hr = Math.round(prev.hr + (targetHr - prev.hr) * 0.12 + hrDrift);
        const bpSys = Math.round(prev.bpSys + (targetBpSys - prev.bpSys) * 0.12 + bpSysDrift);
        const bpDia = Math.round(prev.bpDia + (targetBpDia - prev.bpDia) * 0.12 + bpDiaDrift);
        const map = Math.round(bpDia + (bpSys - bpDia) / 3);
        const spo2 = Math.min(100, Math.max(70, Math.round(prev.spo2 + (targetSpo2 - prev.spo2) * 0.15 + spo2Drift)));
        const temp = parseFloat((prev.temp + (targetTemp - prev.temp) * 0.05 + tempDrift).toFixed(1));
        const etco2 = Math.round(prev.etco2 + (targetEtco2 - prev.etco2) * 0.1 + etco2Drift);
        const rr = Math.round(prev.rr + (targetRr - prev.rr) * 0.1);
        const bis = Math.round(prev.bis + (targetBis - prev.bis) * 0.08);

        const bloodLoss = prev.bloodLoss + (Math.random() > 0.85 ? 5 : 0);
        const urineOutput = prev.urineOutput + (Math.random() > 0.9 ? 2 : 0);
        const fluidBalance = prev.fluidBalance + (Math.random() > 0.85 ? 10 : 0);

        const hrLimitAlert = hr > 120 || hr < 50;
        const spo2LimitAlert = spo2 < 90;
        const mapLimitAlert = map < 60;
        const isAlarmAlert = hrLimitAlert || spo2LimitAlert || mapLimitAlert || targetBis > 90;
        
        if (isAlarmAlert && !isMuted) {
          playAlarmSound();
        }

        return {
          ...prev,
          hr,
          bpSys,
          bpDia,
          map,
          spo2,
          etco2,
          temp,
          rr,
          bis,
          bloodLoss,
          urineOutput,
          fluidBalance
        };
      });
    };

    interval = setInterval(updateVitals, 2000);
    return () => clearInterval(interval);
  }, [simulatedState, propofolRate, sevoDial, sevoExpired, phenylephrineRate, norepinephrineRate, pacemakerActive, pacingRate, atropineActive, ephedrineActive, isMuted]);

  // Canvas waveform rendering loop (ECG, SpO2, EtCO2, Paw Ventilation Curve)
  useEffect(() => {
    const ecgCanvas = ecgCanvasRef.current;
    const spo2Canvas = spo2CanvasRef.current;
    const etco2Canvas = etco2CanvasRef.current;
    const pawCanvas = pawCanvasRef.current;

    if (!ecgCanvas || !spo2Canvas || !etco2Canvas || !pawCanvas) return;

    const ecgCtx = ecgCanvas.getContext('2d');
    const spo2Ctx = spo2Canvas.getContext('2d');
    const etco2Ctx = etco2Canvas.getContext('2d');
    const pawCtx = pawCanvas.getContext('2d');

    if (!ecgCtx || !spo2Ctx || !etco2Ctx || !pawCtx) return;

    let animId: number;
    let x = 0;
    const width = ecgCanvas.width;
    const height = ecgCanvas.height;

    // Clear background
    const clearCanvas = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }
    };

    clearCanvas(ecgCtx);
    clearCanvas(spo2Ctx);
    clearCanvas(etco2Ctx);
    clearCanvas(pawCtx);

    const drawLoop = () => {
      const eraseWidth = 20;
      ecgCtx.fillStyle = '#020617'; ecgCtx.fillRect(x + 1, 0, eraseWidth, height);
      spo2Ctx.fillStyle = '#020617'; spo2Ctx.fillRect(x + 1, 0, eraseWidth, height);
      etco2Ctx.fillStyle = '#020617'; etco2Ctx.fillRect(x + 1, 0, eraseWidth, height);
      pawCtx.fillStyle = '#020617';   pawCtx.fillRect(x + 1, 0, eraseWidth, height);

      // Re-draw grid lines in erased strips
      ecgCtx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
      ecgCtx.lineWidth = 0.5;
      for (let g = x; g < x + eraseWidth; g++) {
        if (g % 20 === 0) {
          ecgCtx.beginPath(); ecgCtx.moveTo(g, 0); ecgCtx.lineTo(g, height); ecgCtx.stroke();
          spo2Ctx.beginPath(); spo2Ctx.moveTo(g, 0); spo2Ctx.lineTo(g, height); spo2Ctx.stroke();
          etco2Ctx.beginPath(); etco2Ctx.moveTo(g, 0); etco2Ctx.lineTo(g, height); etco2Ctx.stroke();
          pawCtx.beginPath(); pawCtx.moveTo(g, 0); pawCtx.lineTo(g, height); pawCtx.stroke();
        }
      }

      // ECG Wave Generation (Speed adjusts to heart rate)
      let speed = 2.5;
      let cycle = 100;
      if (simulatedState === 'tachycardia' || vitals.hr > 110) { cycle = 55; speed = 3.5; }
      else if (simulatedState === 'bradycardia' || vitals.hr < 45) { cycle = 170; speed = 2.0; }

      const cyclePos = x % cycle;
      let ecgY = height / 2;

      // Draw pacing spike if pacemaker is active
      if (pacemakerActive && cyclePos === 24) {
        ecgCtx.strokeStyle = '#ffffff';
        ecgCtx.lineWidth = 1.5;
        ecgCtx.beginPath();
        ecgCtx.moveTo(x, height / 2 + 30);
        ecgCtx.lineTo(x, height / 2 - 38);
        ecgCtx.stroke();
      }

      if (cyclePos > 30 && cyclePos < 33) {
        ecgY = height / 2 - 8; // P wave
      } else if (cyclePos === 36) {
        ecgY = height / 2 + 5;  // Q wave
      } else if (cyclePos === 38) {
        ecgY = height / 2 - 35; // R wave peak
        playHeartbeatSound(vitals.spo2);
      } else if (cyclePos === 40) {
        ecgY = height / 2 + 15; // S wave dip
      } else if (cyclePos > 44 && cyclePos < 50) {
        ecgY = height / 2 - 4;  // T wave
      }

      ecgCtx.beginPath();
      ecgCtx.fillStyle = 'var(--med-green)';
      ecgCtx.arc(x, ecgY, 1.2, 0, Math.PI * 2);
      ecgCtx.fill();

      // SpO2 Plethysmograph Wave
      let spo2Y = height / 2;
      const spo2CyclePos = (x - 8) % cycle;
      
      if (spo2CyclePos >= 36 && spo2CyclePos < 70) {
        const theta = ((spo2CyclePos - 36) / 34) * Math.PI;
        spo2Y = height / 2 - Math.sin(theta) * 22 + (spo2CyclePos > 50 ? Math.sin((spo2CyclePos - 50) / 20 * Math.PI) * 4 : 0);
      }
      if (vitals.spo2 < 92) {
        spo2Y = height / 2 + (spo2Y - height / 2) * 0.6; // flat wave amplitude in hypoxia
      }

      spo2Ctx.beginPath();
      spo2Ctx.fillStyle = 'var(--med-cyan)';
      spo2Ctx.arc(x, spo2Y, 1.2, 0, Math.PI * 2);
      spo2Ctx.fill();

      // ETCO2 Capnography Wave (linked to respiration rate RR)
      let etco2Y = height / 2 + 15;
      const respCycle = cycle * 4.5;
      const etco2Pos = x % respCycle;
      const plateauStart = respCycle * 0.15;
      const plateauEnd = respCycle * 0.55;

      if (etco2Pos >= plateauStart && etco2Pos <= plateauEnd) {
        let heightCap = 25;
        if (vitals.etco2 > 50) heightCap = 38;
        etco2Y = height / 2 + 15 - heightCap + Math.sin((etco2Pos - plateauStart) / (plateauEnd - plateauStart) * Math.PI) * 2;
      } else if (etco2Pos > plateauEnd && etco2Pos < plateauEnd + 15) {
        const washFraction = (etco2Pos - plateauEnd) / 15;
        let heightCap = 25;
        if (vitals.etco2 > 50) heightCap = 38;
        etco2Y = height / 2 + 15 - heightCap * (1 - washFraction);
      } else if (etco2Pos < plateauStart && etco2Pos > plateauStart - 10) {
        const strokeFraction = (etco2Pos - (plateauStart - 10)) / 10;
        let heightCap = 25;
        if (vitals.etco2 > 50) heightCap = 38;
        etco2Y = height / 2 + 15 - heightCap * strokeFraction;
      }

      etco2Ctx.beginPath();
      etco2Ctx.fillStyle = 'var(--med-orange)';
      etco2Ctx.arc(x, etco2Y, 1.2, 0, Math.PI * 2);
      etco2Ctx.fill();

      // Airway Pressure (Paw Ventilation Curve)
      let pawY = height / 2 + 15 - vitals.peep;
      
      if (etco2Pos < plateauStart) {
        const climbScale = etco2Pos / plateauStart;
        pawY = height / 2 + 15 - vitals.peep - (vitals.pip - vitals.peep) * climbScale;
      } else if (etco2Pos >= plateauStart && etco2Pos < plateauEnd) {
        pawY = height / 2 + 15 - vitals.peep - (vitals.pip - vitals.peep) * 0.7;
      } else {
        const fallScale = Math.min(1.0, (etco2Pos - plateauEnd) / (respCycle - plateauEnd));
        pawY = height / 2 + 15 - vitals.peep - (vitals.pip - vitals.peep) * 0.7 * (1 - fallScale);
      }

      pawCtx.beginPath();
      pawCtx.fillStyle = '#ef4444';
      pawCtx.arc(x, pawY, 1.2, 0, Math.PI * 2);
      pawCtx.fill();

      x = (x + speed) % width;
      animId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => cancelAnimationFrame(animId);
  }, [simulatedState, vitals.spo2, vitals.hr, vitals.rr, pacemakerActive, pacingRate, isMuted]);

  const isAlarming = simulatedState !== 'normal' || vitals.bis > 90 || vitals.map < 60 || hypotensionRisk > 70;

  // Gas computation for display
  const macFraction = parseFloat((sevoExpired / 2.0).toFixed(2));
  const isMACLight = macFraction < 0.7 && propofolRate < 80;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Surgical Vitals Monitor (Live OT)</h1>
          <p className="page-subtitle">High-fidelity waveform display and critical vitals alarms</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setIsMuted(!isMuted);
              addLog(`Telemetry monitor speaker output ${!isMuted ? 'muted' : 'unmuted'}.`, 'info');
            }}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', border: isMuted ? '1px solid var(--med-red)' : '1px solid var(--med-green)' }}
          >
            {isMuted ? '🔇 Muted (Tap to hear heartbeat)' : '🔊 Unmute Telemetry Audio'}
          </button>
          
          <span className={`badge ${isAlarming ? 'badge-danger' : 'badge-success'}`}>
            {isAlarming ? `🚨 WARNING: ALARMS CRITICAL` : '✓ SYSTEM STABLE'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.8fr 1.2fr', gap: '24px' }}>
        
        {/* Left Column: Vitals Canvas Traces */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="live-monitor-container" style={{ position: 'relative', border: '4px solid #1e293b' }}>
            {isAlarming && (
              <div 
                className="alarm-overlay" 
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '6px solid var(--med-red)',
                  pointerEvents: 'none',
                  animation: 'alarm-flash 1.5s infinite',
                  zIndex: 20
                }}
              />
            )}
            
            <div className="monitor-topbar">
              <span>OR-B • PATIENT: {patient?.name || 'Robert Miller'} (ASA III)</span>
              <span>RESPIRATOR: MODE: IPPV • MAC: {macFraction}</span>
              <span style={{ color: isMuted ? 'var(--med-red)' : 'var(--med-green)' }}>
                {isMuted ? 'AUDIO DISABLED' : 'AUDIO ACTIVE'}
              </span>
            </div>

            <div className="monitor-body-grid" style={{ gridTemplateColumns: '3.2fr 1fr' }}>
              
              {/* Waves panel (ECG, SpO2, EtCO2, Paw Pressure) */}
              <div className="monitor-waveforms-panel" style={{ gap: '6px', padding: '10px' }}>
                {/* ECG */}
                <div className="waveform-track" style={{ height: '95px' }}>
                  <span className="waveform-label ecg">ECG (Lead II) • Sync</span>
                  <canvas ref={ecgCanvasRef} width="620" height="95" className="waveform-canvas" />
                </div>
                {/* SpO2 */}
                <div className="waveform-track" style={{ height: '95px' }}>
                  <span className="waveform-label spo2">Pleth (SpO2)</span>
                  <canvas ref={spo2CanvasRef} width="620" height="95" className="waveform-canvas" />
                </div>
                {/* ETCO2 */}
                <div className="waveform-track" style={{ height: '95px' }}>
                  <span className="waveform-label etco2">Capno (EtCO2)</span>
                  <canvas ref={etco2CanvasRef} width="620" height="95" className="waveform-canvas" />
                </div>
                {/* Airway Pressure Paw */}
                <div className="waveform-track" style={{ height: '95px' }}>
                  <span className="waveform-label" style={{ color: '#ef4444' }}>Paw Airway Pressure</span>
                  <canvas ref={pawCanvasRef} width="620" height="95" className="waveform-canvas" />
                </div>
              </div>

              {/* Vitals Digits panel */}
              <div className="monitor-vitals-panel">
                {/* Heart Rate */}
                <div className="vital-box vital-green">
                  <div className="vital-box-header">
                    <span>HR</span>
                    <span className="vital-box-limits">{pacemakerActive ? 'PACE' : '120'}<br />50</span>
                  </div>
                  <div className="vital-box-value" style={{ animation: vitals.hr > 120 || vitals.hr < 50 ? 'heart-pulse 0.5s infinite' : 'none' }}>
                    {vitals.hr}
                  </div>
                </div>

                {/* Blood Pressure */}
                <div className="vital-box vital-red">
                  <div className="vital-box-header">
                    <span>NIBP (Sys/Dia)</span>
                    <span className="vital-box-limits">160/90<br />90/50</span>
                  </div>
                  <div className="vital-box-value" style={{ fontSize: '2rem' }}>
                    {vitals.bpSys}/{vitals.bpDia}
                  </div>
                  <div style={{ fontSize: '0.7rem', textAlign: 'right', marginTop: '-2px' }}>
                    MAP: <strong style={{ color: vitals.map < 60 ? 'var(--med-red)' : 'inherit' }}>{vitals.map}</strong>
                  </div>
                </div>

                {/* Oxygen Saturation */}
                <div className="vital-box vital-cyan">
                  <div className="vital-box-header">
                    <span>SpO2</span>
                    <span className="vital-box-limits">100<br />92</span>
                  </div>
                  <div className="vital-box-value" style={{ color: vitals.spo2 < 92 ? 'var(--med-red)' : 'inherit' }}>
                    {vitals.spo2}%
                  </div>
                </div>

                {/* ETCO2 */}
                <div className="vital-box vital-orange">
                  <div className="vital-box-header">
                    <span>EtCO2</span>
                    <span className="vital-box-limits">45<br />30</span>
                  </div>
                  <div className="vital-box-value">
                    {vitals.etco2}
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Ventilator Settings, Fluid logs, and Gas concentrations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="glass" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>VENTILATOR METRICS</div>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PEEP:</span> <strong>{vitals.peep} cmH2O</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Airway PIP:</span> <strong>{vitals.pip} cmH2O</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tidal Volume (TV):</span> <strong>{vitals.tv} mL</strong></div>
              </div>
            </div>

            <div className="glass" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>FLUID BALANCE LOG</div>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IV Crystalloid:</span> <strong>{vitals.fluidBalance} mL</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Estimated Blood Loss:</span> <strong style={{ color: vitals.bloodLoss > 300 ? 'var(--med-red)' : 'inherit' }}>{vitals.bloodLoss} mL</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Urine Output:</span> <strong>{vitals.urineOutput} mL</strong></div>
              </div>
            </div>

            <div className="glass" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>GAS & ANESTHETIC METRICS</div>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sevoflurane Dial/Exp:</span> <strong>{sevoDial}% / {sevoExpired}%</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>MAC Fraction:</span> <strong style={{ color: isMACLight ? 'var(--med-red)' : 'var(--med-green)' }}>{macFraction} MAC</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sedation Index (BIS):</span> <strong style={{ color: vitals.bis > 80 ? 'var(--med-red)' : 'var(--med-cyan)' }}>{vitals.bis}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation controller, Infusion Pumps, Pacemaker HUD, Hypotension Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* NEW: AI Hypotension Risk Prognosis Gauge */}
          <div className="glass" style={{ padding: '16px', border: '1px solid var(--border-color-glow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--med-cyan)', width: '100%', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px' }}>
              🧠 AI Hypotension Prognosis
            </h3>

            {/* Circular Gauge */}
            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke={hypotensionRisk > 70 ? 'var(--med-red)' : hypotensionRisk > 40 ? 'var(--med-orange)' : 'var(--med-cyan)'} 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - hypotensionRisk / 100)}
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{hypotensionRisk}%</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>RISK</span>
              </div>
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.3' }}>
              Probability of MAP &lt; 60 mmHg in next 5 min based on Logistic Regression weights.
            </p>

            {hypotensionRisk > 70 && (
              <div style={{ width: '100%', marginTop: '8px', padding: '6px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--med-red)', color: 'var(--med-red)', fontSize: '0.65rem', fontWeight: 700, animation: 'pulse 1.5s infinite' }}>
                ⚠ HIGH PROBABILITY FOR COLLAPSE: Titrate IV fluids or push Ephedrine bolus.
              </div>
            )}
          </div>

          {/* Infusion Pumps Hub */}
          <div className="glass" style={{ padding: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
              🔌 Syringe Infusion Pumps
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Propofol Infusion */}
              <div style={{ padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span>Propofol Rate</span>
                  <span style={{ color: 'var(--med-blue)' }}>{propofolRate} mcg/kg/min</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  step="10" 
                  style={{ width: '100%', marginTop: '4px', accentColor: 'var(--med-blue)' }} 
                  value={propofolRate}
                  onChange={(e) => {
                    const rate = parseInt(e.target.value);
                    setPropofolRate(rate);
                    if (rate === 0) {
                      addLog('Propofol infusion suspended. BIS index rising.', 'warning');
                    } else {
                      addLog(`Adjusted Propofol infusion rate to ${rate} mcg/kg/min.`, 'info');
                    }
                  }}
                />
              </div>

              {/* Sevoflurane gas concentration */}
              <div style={{ padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span>Sevoflurane Dial</span>
                  <span style={{ color: 'var(--med-orange)' }}>{sevoDial.toFixed(1)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="6" 
                  step="0.2" 
                  style={{ width: '100%', marginTop: '4px', accentColor: 'var(--med-orange)' }} 
                  value={sevoDial}
                  onChange={(e) => {
                    const dialVal = parseFloat(e.target.value);
                    setSevoDial(dialVal);
                    addLog(`Sevoflurane vaporizer dial set to ${dialVal.toFixed(1)}%.`, 'info');
                  }}
                />
              </div>

              {/* Continuous Phenylephrine infusion */}
              <div style={{ padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span>Phenylephrine</span>
                  <span style={{ color: 'var(--med-cyan)' }}>{phenylephrineRate} mcg/min</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="150" 
                  step="10" 
                  style={{ width: '100%', marginTop: '4px', accentColor: 'var(--med-cyan)' }} 
                  value={phenylephrineRate}
                  onChange={(e) => {
                    const rate = parseInt(e.target.value);
                    setPhenylephrineRate(rate);
                    addLog(`Phenylephrine continuous drip titrated to ${rate} mcg/min.`, 'info');
                  }}
                />
              </div>

              {/* Continuous Norepinephrine infusion */}
              <div style={{ padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span>Norepinephrine</span>
                  <span style={{ color: 'var(--med-red)' }}>{norepinephrineRate} mcg/min</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1" 
                  style={{ width: '100%', marginTop: '4px', accentColor: 'var(--med-red)' }} 
                  value={norepinephrineRate}
                  onChange={(e) => {
                    const rate = parseInt(e.target.value);
                    setNorepinephrineRate(rate);
                    addLog(`Norepinephrine continuous drip titrated to ${rate} mcg/min.`, 'info');
                  }}
                />
              </div>

              {/* Emergency Bolus Injectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '6px', fontSize: '0.75rem', fontWeight: 700 }}
                  onClick={handleAtropineBolus}
                >
                  💉 Atropine 0.5mg
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '6px', fontSize: '0.75rem', fontWeight: 700 }}
                  onClick={handleEphedrineBolus}
                >
                  💉 Ephedrine 10mg
                </button>
              </div>
            </div>
          </div>

          {/* NEW: Temporary Cardiac Pacemaker HUD */}
          <div className="glass" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚡ Pacemaker Control
              </h3>
              <button 
                className="btn" 
                onClick={() => {
                  setPacemakerActive(!pacemakerActive);
                  addLog(`Cardiac Pacing Output ${!pacemakerActive ? 'Enabled' : 'Disabled'}.`, 'warning');
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: pacemakerActive ? 'var(--med-red)' : 'rgba(255,255,255,0.03)',
                  border: pacemakerActive ? '1px solid var(--med-red)' : '1px solid var(--border-color)',
                  color: 'white'
                }}
              >
                {pacemakerActive ? 'DISCONNECT' : 'ACTIVATE'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', pointerEvents: pacemakerActive ? 'auto' : 'none', opacity: pacemakerActive ? 1 : 0.4, transition: 'opacity 0.3s' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>PACING RATE (BPM)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                  value={pacingRate} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 30;
                    setPacingRate(val);
                    addLog(`Pacing rate set to ${val} bpm.`, 'info');
                  }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>AMPLITUDE (mA)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                  value={pacingCurrent} 
                  onChange={(e) => setPacingCurrent(parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>
          </div>

          {/* Simulation controller */}
          <div className="glass" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Simulation scenarios</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'normal', label: '✓ Standard Stable Vitals', color: 'var(--med-green)' },
                { id: 'hypoxia', label: '⚠ Anesthetic Desaturation (88%)', color: 'var(--med-cyan)' },
                { id: 'hypotension', label: '⚠ Profound Hypotension (MAP < 55)', color: 'var(--med-red)' },
                { id: 'bradycardia', label: '⚠ Sudden Bradycardia (38 bpm)', color: 'var(--med-orange)' },
                { id: 'tachycardia', label: '⚠ Intraoperative Tachycardia', color: 'var(--med-orange)' },
                { id: 'hyperthermia', label: '⚠ Malignant Hyperthermia Suspect', color: 'var(--med-red)' }
              ].map(opt => (
                <button
                  key={opt.id}
                  className="btn"
                  onClick={() => setSimulatedState(opt.id as any)}
                  style={{
                    textAlign: 'left',
                    background: simulatedState === opt.id ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    border: simulatedState === opt.id ? `1px solid ${opt.color}` : '1px solid var(--border-color)',
                    color: simulatedState === opt.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '8px 10px',
                    fontSize: '0.75rem'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline events logger */}
          <div className="glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              📋 Clinical Telemetry Logs
            </h3>
            
            <div style={{ height: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {timelineLogs.map((log, idx) => {
                let logCol = 'var(--text-secondary)';
                if (log.type === 'warning') logCol = 'var(--med-red)';
                else if (log.type === 'drug') logCol = 'var(--med-blue)';
                else if (log.type === 'success') logCol = 'var(--med-green)';

                return (
                  <div key={idx} style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>[{log.time}]</span>
                    <span style={{ color: logCol, fontWeight: log.type !== 'info' ? 700 : 400 }}>{log.msg}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveOT;
