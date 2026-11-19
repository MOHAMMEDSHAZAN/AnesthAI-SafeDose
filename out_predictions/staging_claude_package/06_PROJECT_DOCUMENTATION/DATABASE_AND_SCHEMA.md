# Database Architecture & Audit Schema Specification

## 1. Persistence Engine
- Primary Datastore: PostgreSQL via Supabase / Local SQLite fallback.
- Client Interface: REST / PostgREST with Row Level Security (RLS).

## 2. Relational Schemas
### Table: udit_logs
- id: UUID (Primary Key)
- 	imestamp: TIMESTAMPTZ (Server-enforced UTC)
- clinician_id: VARCHAR(64) (Anesthesiologist identity)
- event_type: VARCHAR(32) ('LOGIN', 'FLUID_CALC', 'SAFETY_OVERRIDE', 'CHECKLIST_SIGN')
- payload: JSONB (Complete calculation or alert payload)
- justification: TEXT (Mandatory for safety threshold overrides)

### Table: patient_episodes
- id: UUID
- case_id: VARCHAR(64)
- sa_score: INT (1 to 5)
- 	bw_kg: NUMERIC(5,2)
- lbm_kg: NUMERIC(5,2)
- asting_hours: NUMERIC(4,1)
- created_at: TIMESTAMPTZ
