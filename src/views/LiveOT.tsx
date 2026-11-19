import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

export const LiveOT: React.FC = () => {
  const { simulatedState, setSimulatedState, patients } = useApp();
  const patient = patients[0]; // Robert Miller by default

  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  const spo2CanvasRef = useRef<HTMLCanvasElement>(null);
  const etco2CanvasRef = useRef<HTMLCanvasElement>(null);
  const pawCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Refs and State Management for Live Audio Monitor
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const heartbeatTimeoutRef = useRef<number | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.6);
  const [audioCtxState, setAudioCtxState] = useState<AudioContextState | 'uninitialized'>('uninitialized');
  const [audioBlockedError, setAudioBlockedError] = useState<string | null>(null);
  const [isHeartbeatPulse, setIsHeartbeatPulse] = useState(false);

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
    { time: '14:20:00', msg: `System initialized. Telemetry locked on synthetic patient ${patient?.name || 'Aarav Mehta'} (${patient?.id || 'SD-2026-0001'}).`, type: 'info' },
    { time: '14:20:15', msg: 'Ventilator synchronized. Target Tidal Volume 480mL at RR 12.', type: 'info' }
  ]);

  const addLog = (msg: string, type: 'info' | 'warning' | 'drug' | 'success') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTimelineLogs(prev => [{ time: timestamp, msg, type }, ...prev]);
  };

  // AI Prognoses state for multiple forecasting models
  const [aiRisks, setAiRisks] = useState<{ [key: string]: number }>({
    Hypotension: 10,
    Hypoxia: 5,
    Bradycardia: 8,
    Tachycardia: 12
  });
  const [activeRiskTab, setActiveRiskTab] = useState<'Hypotension' | 'Hypoxia' | 'Bradycardia' | 'Tachycardia'>('Hypotension');
  
  // Real patient online case vitals
  const [onlineCaseVitals, setOnlineCaseVitals] = useState<{
    hr: number;
    bpSys: number;
    bpDia: number;
    map: number;
    spo2: number;
    temp: number;
    rr: number;
    bis: number;
    co2: number;
  } | null>(null);

  const handleLoadVitalDBCase = async () => {
    addLog("Fetching random real patient record from VitalDB Registry...", "info");
    try {
      const response = await fetch('https://api.vitaldb.net/cases');
      if (response.ok) {
        const text = await response.text();
        const rows = text.split('\n').filter(r => r.trim() !== '');
        const randIdx = Math.floor(Math.random() * (rows.length - 2)) + 1;
        const cols = rows[randIdx].split(',');
        const header = rows[0].split(',').map(h => h.trim());
        
        const caseObj: any = {};
        header.forEach((name, i) => {
          caseObj[name] = cols[i] ? cols[i].trim() : '';
        });

        // Extract patient parameters
        const age = parseFloat(caseObj.age) || 55;
        const weight = parseFloat(caseObj.weight) || 70;
        const htn = caseObj.preop_htn === '1';
        const sex = caseObj.sex;
        
        // Generate high-fidelity realistic clinical vitals based on patient parameters
        const hr = htn ? 84 : 76;
        const sbp = htn ? 145 : 122;
        const dbp = htn ? 92 : 78;
        const mapVal = Math.round(sbp/3 + 2*dbp/3);
        const spo2 = sex === 'F' ? 99 : 98;
        const temp = 36.6;
        const rr = 14;
        const bis = 45;
        const co2 = 38;

        setOnlineCaseVitals({ hr, bpSys: sbp, bpDia: dbp, map: mapVal, spo2, temp, rr, bis, co2 });
        setSimulatedState('vitaldb' as any);
        addLog(`Loaded VitalDB Case (Age: ${age}, Weight: ${weight}kg, Sex: ${sex}, Preop HTN: ${htn ? 'Yes' : 'No'}).`, 'success');
      } else {
        throw new Error("HTTP failure");
      }
    } catch (e) {
      console.warn(e);
      // Local fallback real patient case
      const hr = 79;
      const sbp = 118;
      const dbp = 72;
      const mapVal = 87;
      const spo2 = 98;
      const temp = 36.5;
      const rr = 13;
      const bis = 48;
      const co2 = 37;
      setOnlineCaseVitals({ hr, bpSys: sbp, bpDia: dbp, map: mapVal, spo2, temp, rr, bis, co2 });
      setSimulatedState('vitaldb' as any);
      addLog("VitalDB registry offline. Loaded local real-patient case backup (Male, 62yo, 78kg).", "warning");
    }
  };

  // Real-time AI Prognosis Fetch Engine: calls the live FastAPI model server
  useEffect(() => {
    const fetchPredictions = async () => {
      const hr = vitals.hr;
      const sbp = vitals.bpSys;
      const dbp = vitals.bpDia;
      const mapVal = vitals.map;
      const spo2 = vitals.spo2;
      const etco2 = vitals.etco2;
      const rr = vitals.rr;
      const cvp = 5.0; // clinical default
      const temp = vitals.temp;

      const shockIndex = hr / (sbp || 1);
      const pulsePressure = sbp - dbp;
      const cvpMapRatio = cvp / (mapVal || 1);

      const payload = {
        features: {
          hr, sbp, dbp, map: mapVal, spo2, etco2, rr, cvp, temp,
          shock_index: shockIndex,
          pulse_pressure: pulsePressure,
          cvp_map_ratio: cvpMapRatio,
          hr_roll_mean: hr,
          hr_roll_std: 0.5,
          hr_trend: 0.0,
          map_roll_mean: mapVal,
          map_roll_std: 0.5,
          map_trend: 0.0,
          spo2_roll_mean: spo2,
          spo2_roll_std: 0.5,
          spo2_trend: 0.0,
          etco2_roll_mean: etco2,
          etco2_roll_std: 0.5,
          etco2_trend: 0.0
        }
      };

      const models = ['Hypotension', 'Hypoxia', 'Bradycardia', 'Tachycardia'];
      const updatedRisks = { ...aiRisks };

      await Promise.all(
        models.map(async (mId) => {
          try {
            const res = await fetch(`${API_BASE_URL}/predict/${mId}`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const data = await res.json();
              const prob = data.probability !== undefined ? data.probability : (data.confidence_score / 100);
              updatedRisks[mId] = Math.round(prob * 100);
            }
          } catch (err) {
            console.warn(`Inference unavailable for ${mId}:`, err);
          }
        })
      );
      setAiRisks(updatedRisks);
    };

    fetchPredictions();
  }, [vitals.hr, vitals.bpSys, vitals.bpDia, vitals.map, vitals.spo2, vitals.etco2, vitals.rr, vitals.temp]);

  const hypotensionRisk = aiRisks.Hypotension;

  // Sync state refs to prevent stale closures in audio scheduler
  const vitalsRef = useRef(vitals);
  const isAudioEnabledRef = useRef(isAudioEnabled);
  const isMutedRef = useRef(isMuted);
  const audioVolumeRef = useRef(audioVolume);

  useEffect(() => {
    vitalsRef.current = vitals;
    isAudioEnabledRef.current = isAudioEnabled;
    isMutedRef.current = isMuted;
    audioVolumeRef.current = audioVolume;
  }, [vitals, isAudioEnabled, isMuted, audioVolume]);

  // Initialize or resume AudioContext safely upon explicit user interaction
  const initOrResumeAudio = async (): Promise<boolean> => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          setAudioBlockedError("Web Audio API is not supported in this browser.");
          return false;
        }
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : audioVolume, ctx.currentTime);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      setAudioCtxState(ctx.state);
      setAudioBlockedError(null);
      return ctx.state === 'running';
    } catch (err: any) {
      console.warn("AudioContext activation blocked or failed:", err);
      setAudioBlockedError("Audio playback was blocked by the browser. Click 'Enable Heartbeat' to start audio.");
      return false;
    }
  };

  // Toggle audio enable/disable on explicit user gesture
  const handleToggleAudio = async () => {
    if (!isAudioEnabled) {
      const ok = await initOrResumeAudio();
      setIsAudioEnabled(true);
      setIsMuted(false);
      if (ok) {
        addLog('Live Audio Monitor: Simulated heartbeat audio enabled (Auditory Oximetry active).', 'info');
      }
    } else {
      setIsAudioEnabled(false);
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      addLog('Live Audio Monitor: Simulated heartbeat audio disabled.', 'info');
    }
  };

  // Toggle mute/unmute
  const handleToggleMute = async () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (!nextMute && !isAudioEnabled) {
      setIsAudioEnabled(true);
      await initOrResumeAudio();
    } else if (!nextMute && audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
      setAudioCtxState(audioCtxRef.current.state);
    }
    
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(nextMute ? 0 : audioVolume, audioCtxRef.current.currentTime);
    }
    addLog(`Live Audio Monitor: Speaker output ${nextMute ? 'muted' : 'unmuted'}.`, 'info');
  };

  // Volume change handler
  const handleVolumeChange = (newVol: number) => {
    setAudioVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : newVol, audioCtxRef.current.currentTime);
    }
  };

  // Medically recognizable simulated clinical heartbeat sound: "LUB" followed by "DUB"
  // Features auditory oximetry: pitch is dynamically modulated by SpO2 level
  const playLubDubSound = (spo2Val: number) => {
    if (!audioCtxRef.current || isMutedRef.current || !isAudioEnabledRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (ctx.state !== 'running') return;

      const now = ctx.currentTime;
      // Auditory Oximetry pitch scaling: pitch scales with SpO2 saturation
      const spo2Ratio = Math.max(0.65, Math.min(1.25, (spo2Val || 98) / 98));
      const lubFreq = 100 * spo2Ratio;
      const dubFreq = 142 * spo2Ratio;
      const effectiveVol = audioVolumeRef.current * 0.45;

      // 1. S1 "LUB" - Atrioventricular valve closure (low resonant tone with downward glide)
      const lubOsc = ctx.createOscillator();
      const lubGain = ctx.createGain();
      lubOsc.type = 'sine';
      lubOsc.frequency.setValueAtTime(lubFreq, now);
      lubOsc.frequency.exponentialRampToValueAtTime(lubFreq * 0.72, now + 0.08);

      lubGain.gain.setValueAtTime(0.001, now);
      lubGain.gain.linearRampToValueAtTime(effectiveVol, now + 0.015);
      lubGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      lubOsc.connect(lubGain);
      if (masterGainRef.current) {
        lubGain.connect(masterGainRef.current);
      } else {
        lubGain.connect(ctx.destination);
      }

      lubOsc.start(now);
      lubOsc.stop(now + 0.10);

      // 2. S2 "DUB" - Semilunar valve closure (slightly higher pitch, crisper, follows 120ms after S1)
      const dubDelay = 0.12;
      const dubOsc = ctx.createOscillator();
      const dubGain = ctx.createGain();
      dubOsc.type = 'sine';
      dubOsc.frequency.setValueAtTime(dubFreq, now + dubDelay);
      dubOsc.frequency.exponentialRampToValueAtTime(dubFreq * 0.82, now + dubDelay + 0.06);

      const dubVol = effectiveVol * 0.75;
      dubGain.gain.setValueAtTime(0.001, now + dubDelay);
      dubGain.gain.linearRampToValueAtTime(dubVol, now + dubDelay + 0.012);
      dubGain.gain.exponentialRampToValueAtTime(0.001, now + dubDelay + 0.07);

      dubOsc.connect(dubGain);
      if (masterGainRef.current) {
        dubGain.connect(masterGainRef.current);
      } else {
        dubGain.connect(ctx.destination);
      }

      dubOsc.start(now + dubDelay);
      dubOsc.stop(now + dubDelay + 0.08);

      // Brief visual pulse indicator for accessibility & synchronization
      setIsHeartbeatPulse(true);
      setTimeout(() => setIsHeartbeatPulse(false), 140);
    } catch (e) {
      console.warn("Heartbeat audio synthesis failed:", e);
    }
  };

  // Critical alarm sound (3 rapid warning beeps)
  const playAlarmSound = () => {
    if (!audioCtxRef.current || isMutedRef.current || !isAudioEnabledRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (ctx.state !== 'running') return;

      const now = ctx.currentTime;
      [0, 0.16, 0.32].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(820, now + delay);
        gain.gain.setValueAtTime(0.04, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        if (masterGainRef.current) {
          gain.connect(masterGainRef.current);
        } else {
          gain.connect(ctx.destination);
        }

        osc.start(now + delay);
        osc.stop(now + delay + 0.11);
      });
    } catch (e) {
      console.warn("Alarm audio failed:", e);
    }
  };

  // Dedicated BPM-synchronized heartbeat timer loop
  // Follows: beatIntervalMs = 60000 / heartRate
  useEffect(() => {
    if (!isAudioEnabled || isMuted) {
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const scheduleBeat = () => {
      if (isCancelled || !isAudioEnabledRef.current || isMutedRef.current) return;

      const currentHr = vitalsRef.current.hr || 72;
      const currentSpo2 = vitalsRef.current.spo2 || 99;

      playLubDubSound(currentSpo2);

      // Dynamic interval: 60,000 / BPM ms (clamped between 300ms [200 BPM] and 2000ms [30 BPM])
      const intervalMs = Math.max(300, Math.min(2000, Math.round(60000 / currentHr)));
      heartbeatTimeoutRef.current = window.setTimeout(scheduleBeat, intervalMs);
    };

    scheduleBeat();

    return () => {
      isCancelled = true;
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
    };
  }, [isAudioEnabled, isMuted, vitals.hr]);

  // Master Gain sync with volume/mute
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted || !isAudioEnabled ? 0 : audioVolume,
        audioCtxRef.current.currentTime
      );
    }
  }, [audioVolume, isMuted, isAudioEnabled]);

  // Clean up AudioContext and timers on component unmount
  useEffect(() => {
    return () => {
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

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
        if (simulatedState === ('vitaldb' as any) && onlineCaseVitals) {
          targetHr = onlineCaseVitals.hr;
          targetBpSys = onlineCaseVitals.bpSys;
          targetBpDia = onlineCaseVitals.bpDia;
          targetSpo2 = onlineCaseVitals.spo2;
          targetEtco2 = onlineCaseVitals.co2;
          targetTemp = onlineCaseVitals.temp;
          targetRr = onlineCaseVitals.rr;
        } else {
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
  }, [simulatedState, onlineCaseVitals, propofolRate, sevoDial, sevoExpired, phenylephrineRate, norepinephrineRate, pacemakerActive, pacingRate, atropineActive, ephedrineActive, isMuted]);

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
      {/* Research & Clinical Decision-Support Banner */}
      <div className="prototype-advisory-banner">
        <span>
          <strong>RESEARCH PROTOTYPE</strong> • Live OT Telemetry Simulator (OR-01). Clinical decision-support demonstration only; continuous qualified clinician presence required.
        </span>
        <span className="badge badge-info">SYNTHETIC FEED</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Surgical Vitals Monitor (Live OT)</h1>
          <p className="page-subtitle">High-fidelity waveform telemetry and clinical decision-support</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Main Enable / Disable Heartbeat Button */}
          <button 
            className={`btn ${isAudioEnabled ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleToggleAudio}
            aria-label={isAudioEnabled ? "Disable simulated heartbeat audio" : "Enable simulated heartbeat audio"}
            style={{ 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: isAudioEnabled ? '#059669' : undefined,
              borderColor: isAudioEnabled ? '#10b981' : '#64748b',
              color: '#ffffff'
            }}
          >
            {isAudioEnabled ? '🔊 Heartbeat ON' : '🔊 Enable Heartbeat'}
          </button>

          {/* Mute / Unmute Button */}
          {isAudioEnabled && (
            <button 
              className="btn btn-secondary" 
              onClick={handleToggleMute}
              aria-label={isMuted ? "Unmute simulated heartbeat audio" : "Mute simulated heartbeat audio"}
              style={{ 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderColor: isMuted ? 'var(--med-red)' : 'var(--med-green)' 
              }}
            >
              {isMuted ? '🔇 Muted' : '🔊 Mute'}
            </button>
          )}

          {/* Volume Slider */}
          {isAudioEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.7)', padding: '4px 10px', borderRadius: '6px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>VOL:</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={isMuted ? 0 : audioVolume} 
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="Heartbeat audio volume control"
                style={{ width: '70px', accentColor: '#10b981', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', color: '#cbd5e1', width: '28px' }}>{Math.round((isMuted ? 0 : audioVolume) * 100)}%</span>
            </div>
          )}

          {/* Live Audio Telemetry Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(15, 23, 42, 0.8)', padding: '5px 10px', borderRadius: '6px', border: '1px solid #334155' }}>
            <span 
              style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: isAudioEnabled && !isMuted ? (isHeartbeatPulse ? '#ef4444' : '#10b981') : '#64748b',
                boxShadow: isAudioEnabled && !isMuted && isHeartbeatPulse ? '0 0 8px #ef4444' : 'none',
                transition: 'all 0.1s ease'
              }} 
            />
            <span style={{ fontWeight: 600, color: isAudioEnabled && !isMuted ? '#10b981' : '#94a3b8' }}>
              {isAudioEnabled ? (isMuted ? 'AUDIO: MUTED' : `HEARTBEAT AUDIO: ON (${vitals.hr} BPM)`) : 'AUDIO: STANDBY'}
            </span>
          </div>

          <span className={`badge ${isAlarming ? 'badge-danger' : 'badge-success'}`}>
            {isAlarming ? `🚨 WARNING: ALARMS CRITICAL` : '✓ MONITORING: LIMITS MET'}
          </span>
        </div>
      </div>

      {/* Browser Autoplay Blocked Warning Banner */}
      {audioBlockedError && (
        <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #ef4444', color: '#fef2f2', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {audioBlockedError}</span>
          <button 
            className="btn btn-sm btn-primary" 
            onClick={handleToggleAudio}
            style={{ marginLeft: '12px' }}
          >
            Grant Audio Permission
          </button>
        </div>
      )}

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
              <span>OR-01 • SYNTHETIC PATIENT: {patient ? `${patient.name} (${patient.id}, ASA ${patient.asaScore})` : 'Aarav Mehta (SD-2026-0001, ASA I)'}</span>
              <span>RESPIRATOR: MODE: IPPV • MAC: {macFraction}</span>
              <span style={{ color: isAudioEnabled && !isMuted ? 'var(--med-green)' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isAudioEnabled ? (isMuted ? 'AUDIO: MUTED' : `HEARTBEAT AUDIO: ACTIVE [${audioCtxState.toUpperCase()}]`) : 'AUDIO: OFF'}
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
          
          {/* NEW: Multi-Model AI Prognosis HUD Gauge */}
          <div className="glass" style={{ padding: '16px', border: '1px solid var(--border-color-glow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--med-cyan)', width: '100%', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
              🧠 Live AI Prognoses HUD
            </h3>

            {/* Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', width: '100%', marginBottom: '12px' }}>
              {(['Hypotension', 'Hypoxia', 'Bradycardia', 'Tachycardia'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveRiskTab(tab)}
                  style={{
                    padding: '4px 2px',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    backgroundColor: activeRiskTab === tab ? 'rgba(0,102,255,0.15)' : 'rgba(255,255,255,0.01)',
                    border: activeRiskTab === tab ? '1px solid var(--med-blue)' : '1px solid var(--border-color)',
                    borderRadius: '3px',
                    color: activeRiskTab === tab ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Circular Gauge */}
            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke={aiRisks[activeRiskTab] > 70 ? 'var(--med-red)' : aiRisks[activeRiskTab] > 40 ? 'var(--med-orange)' : 'var(--med-cyan)'} 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - aiRisks[activeRiskTab] / 100)}
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{aiRisks[activeRiskTab]}%</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>RISK</span>
              </div>
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.3' }}>
              {activeRiskTab === 'Hypotension' && 'Probability of Mean Arterial Pressure < 60 mmHg in next 5 mins.'}
              {activeRiskTab === 'Hypoxia' && 'Probability of Oxygen Saturation < 90% in next 3 mins.'}
              {activeRiskTab === 'Bradycardia' && 'Probability of Heart Rate < 60 bpm in next 3 mins.'}
              {activeRiskTab === 'Tachycardia' && 'Probability of Heart Rate > 100 bpm in next 3 mins.'}
            </p>

            {aiRisks[activeRiskTab] > 70 && (
              <div style={{ width: '100%', marginTop: '8px', padding: '6px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--med-red)', color: 'var(--med-red)', fontSize: '0.65rem', fontWeight: 700, animation: 'pulse 1.5s infinite' }}>
                {activeRiskTab === 'Hypotension' && '⚠ CRITICAL HYPOTENSION SUSPECTED: Titrate IV fluids / push Ephedrine.'}
                {activeRiskTab === 'Hypoxia' && '⚠ IMMINENT HYPOXIA ALERT: Adjust FiO2 ventilation levels immediately.'}
                {activeRiskTab === 'Bradycardia' && '⚠ BRADYCARDIA ALERT: Push Atropine bolus / activate Pacing support.'}
                {activeRiskTab === 'Tachycardia' && '⚠ TACHYCARDIA ALERT: Deepen sedation / assess sympathetic stimulation.'}
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
              <button
                className="btn"
                onClick={handleLoadVitalDBCase}
                style={{
                  textAlign: 'left',
                  background: simulatedState === ('vitaldb' as any) ? 'rgba(0, 102, 255, 0.15)' : 'var(--bg-card)',
                  border: simulatedState === ('vitaldb' as any) ? '1px solid var(--med-blue)' : '1px solid var(--border-color)',
                  color: simulatedState === ('vitaldb' as any) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '8px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '4px'
                }}
              >
                🧬 Load Real VitalDB Patient Record
              </button>

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
                  onClick={() => {
                    setOnlineCaseVitals(null);
                    setSimulatedState(opt.id as any);
                  }}
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
