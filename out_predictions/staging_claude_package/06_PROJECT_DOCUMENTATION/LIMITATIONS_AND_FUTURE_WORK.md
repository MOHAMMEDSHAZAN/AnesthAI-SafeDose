# Clinical Limitations & Future Research Roadmap

## 1. Acknowledged Limitations
1. **Retrospective Telemetry Benchmark:**
   The empirical ML evaluations were conducted on retrospective surgical registries (VitalDB, MIT-BIH Arrhythmia, MIMIC-IV). While zero patient overlap was strictly enforced, retrospective data may not capture prospective sensor artifacts, electrocautery noise, or patient motion artifacts.
2. **Simulated Frontend Telemetry:**
   The real-time operating theatre monitoring canvas runs on client-side waveform synthesis mimicking physiological dynamics rather than physical bedside cable interfacing (e.g., HL7 / FHIR / serial feeds).
3. **Single-Center VitalDB Origin:**
   VitalDB cohort data originates from Seoul National University Hospital. External demographic and institutional validation is required across diverse patient populations.

## 2. Future Research Roadmap
1. **Prospective Clinical Trial:**
   Execute an IRB-approved observational shadow trial in academic hospital operating theatres to evaluate clinician alert fatigue, override frequencies, and recommendation acceptance.
2. **Hardware Bedside Integration:**
   Develop an authenticated medical IoT gateway supporting IEEE 11073 and HL7 FHIR protocols for direct multi-parameter bedside monitor connectivity.
3. **Multimodal Deep Learning:**
   Incorporate raw continuous multi-lead ECG and EEG (bispectral index) waveforms into temporal transformer architectures.
