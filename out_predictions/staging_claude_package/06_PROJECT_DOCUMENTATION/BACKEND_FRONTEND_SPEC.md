# Backend & Frontend Architecture Specifications

## 1. Frontend Architecture
- **Framework:** React 18 with TypeScript.
- **Styling:** Tailwind CSS with accessible color contrasts for clinical environments.
- **State Management:** React Context API & React Hooks for local session state.
- **Telemetry Simulation:** HTML5 Canvas rendering high-frame-rate synthetic ECG (Lead II) and plethysmograph waveforms at 60 FPS without DOM lag.
- **Client-Side Validation:** Form inputs constrained by physiological bounds (e.g., Heart Rate: 20–300 bpm, MAP: 30–200 mmHg, Weight: 2–350 kg).

## 2. Backend Architecture
- **Framework:** FastAPI with Uvicorn ASGI server.
- **Input Validation:** Strict Pydantic v2 schemas validating request types, numerical ranges, and required headers.
- **Model Registry:** Serialized `.pkl` models loaded on startup into memory.
- **Error Handling:** Standardized HTTP response codes:
  - `200 OK`: Successful inference or calculation.
  - `422 Unprocessable Entity`: Out-of-bounds physiological input.
  - `503 Service Unavailable`: Triggered when an experimental or unverified model endpoint is invoked, safeguarding clinical deployment.
