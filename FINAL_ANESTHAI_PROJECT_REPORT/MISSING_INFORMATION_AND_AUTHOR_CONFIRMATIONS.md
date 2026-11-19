# MISSING INFORMATION AND AUTHOR CONFIRMATIONS
## AnesthAI SafeDose — Final BE Project Report

**Prepared by:** Repository Audit System  
**Date:** November 2026  
**Purpose:** This document lists every piece of information required to complete the final BE project report that was NOT FOUND in the project repository. The student/team must supply these before final submission.

---

> [!CAUTION]
> Do NOT submit the report with placeholder values. Replace every item below with the correct information before printing and binding.

---

## SECTION 1: STUDENT IDENTITY INFORMATION

| # | Required Field | Status | Notes |
|---|---|---|---|
| 1 | **Mohammed Shazan — USN** | ❌ NOT FOUND | Searched all repository files for `1KS\d{2}[A-Z]{2}\d{3}` pattern — zero matches. Format: 1KSxxCSxxx |
| 2 | **Mohan Gowda V C — USN** | ❌ NOT FOUND | Same search — zero matches |
| 3 | **Puneeth S V — USN** | ❌ NOT FOUND | Same search — zero matches |
| 4 | **Fourth team member name and USN** | ❌ NOT FOUND | Only 3 student authors appear across ALL repository files. If a 4th member exists, they must be added. If the team is 3 students only, confirm this. |

**Action required:** Provide all USNs in format `1KSxxCSxxx`. If 4th member exists, provide full name and USN.

---

## SECTION 2: GUIDE AND FACULTY INFORMATION

| # | Required Field | Status | Notes |
|---|---|---|---|
| 5 | **Guide's formal role title** | ❌ NOT FOUND | In repository files, Dr. Sowbahgya M. P. is listed as Associate Professor. The formal designation "Project Guide / Project Supervisor" does not appear in any file. Use whichever is official at KSIT. |
| 6 | **Guide's exact name spelling** | ⚠️ CONFLICT | Spelled "Dr. Sowbahgya M. P." in `main_final.tex` but "Dr. Sowbhagya M. P." in PUBLICATION_METADATA.md and email `sowbhagya.mp@gmail.com`. Confirm: **Sowbahgya** or **Sowbhagya**? |
| 7 | **Guide's employee ID / staff ID** | ❌ NOT FOUND | May be required on the certificate page |
| 8 | **Project Coordinator name and designation** | ❌ NOT FOUND | Not present in any repository file |
| 9 | **HOD (Head of Department) name** | ❌ NOT FOUND | Not present in any repository file |
| 10 | **HOD's signature block details** | ❌ NOT FOUND | Required for certificate |
| 11 | **Principal name** | ❌ NOT FOUND | Not present in any repository file |
| 12 | **Internal Examiner name** | ❌ NOT FOUND | Required for viva certificate |
| 13 | **External Examiner name** | ❌ NOT FOUND | Required for viva certificate |

---

## SECTION 3: INSTITUTIONAL INFORMATION

| # | Required Field | Status | Notes |
|---|---|---|---|
| 14 | **Academic year (confirmed)** | ⚠️ ASSUMED | Report uses "2026–27". Confirm exact academic year. |
| 15 | **Semester** | ❌ NOT FOUND | 7th or 8th semester? Course is likely 8th semester major project. |
| 16 | **Course code** | ❌ NOT FOUND | Expected to be BCS786 (Major Project Phase II) under VTU 2021 scheme — NOT confirmed in any repository file. Verify from VTU syllabus. |
| 17 | **VTU scheme year** | ❌ NOT FOUND | 2021 Scheme? 2022 Scheme? |
| 18 | **KSIT official logo** | ❌ NOT FOUND | High-resolution KSIT logo PNG/PDF required for title page |
| 19 | **VTU official logo** | ❌ NOT FOUND | May be required on title page |
| 20 | **College address (complete)** | ⚠️ PARTIAL | Available: "K. S. Institute of Technology, Bengaluru — 560 109" but full postal address with street not found in repo |

---

## SECTION 4: SUBMISSION DETAILS

| # | Required Field | Status | Notes |
|---|---|---|---|
| 21 | **Date of project submission** | ❌ NOT FOUND | Month and year for title page |
| 22 | **Date of viva voce** | ❌ NOT FOUND | For the certificate page |
| 23 | **Internal assessment marks** | ❌ NOT FOUND | Not in scope of technical audit |
| 24 | **Batch / Section** | ❌ NOT FOUND | E.g., "2022–26 Batch, Section A" |

---

## SECTION 5: PUBLICATION AND CONFERENCE INFORMATION

| # | Required Field | Status | Notes |
|---|---|---|---|
| 25 | **IEEE conference name and acceptance** | ❌ NOT FOUND | The PDF `AnesthAI_IEEE_Final.pdf` is a camera-ready draft. No external acceptance letter found. If a formal acceptance was received, include it in Appendix. |
| 26 | **Publication DOI or paper ID** | ❌ NOT FOUND | Not in repository |
| 27 | **CITI completion certificates for all team members** | ⚠️ PARTIAL | Only Mohammed Shazan's CITI certificate (mock/training) found. Certificates for Mohan Gowda V C and Puneeth S V: NOT FOUND |

---

## SECTION 6: TECHNICAL INFORMATION TO CONFIRM

| # | Required Field | Status | Notes |
|---|---|---|---|
| 28 | **Exact Python version** | ⚠️ NOT PINNED | requirements_kaggle.txt specifies library versions but not Python version. Likely 3.10 or 3.11 based on library compatibility. |
| 29 | **FastAPI version** | ❌ NOT PINNED | Not in requirements_kaggle.txt. Check `pip show fastapi` in your environment. |
| 30 | **Uvicorn version** | ❌ NOT PINNED | Same — check with `pip show uvicorn`. |
| 31 | **Supabase project URL / instance** | ❌ NOT FOUND | Only `.env.example` or similar referenced but no actual Supabase URL in repo (security-correctly excluded). Confirm if Supabase is actively used in demo or if it runs fully in localStorage mode. |
| 32 | **Training compute environment** | ❌ NOT FOUND | Was training done on Kaggle GPU? Local GPU? Cloud? Kaggle notebook IDs not in repository. |
| 33 | **Training time per model** | ❌ NOT FOUND | Not documented in any report file |

---

## SECTION 7: FIGURES AND ASSETS TO CONFIRM

| # | Required Field | Status | Notes |
|---|---|---|---|
| 34 | **High-resolution screenshots** | ⚠️ AVAILABLE | 12 screenshots exist in staging_claude_package/05_WEBSITE_SCREENSHOTS/. Confirm these are from the actual live application. |
| 35 | **Additional custom diagrams** | ❌ REQUESTED | ER diagram, sequence diagram, use case diagram — these are described in text but no separate diagram files were generated by the team. |

---

## HOW TO COMPLETE THE REPORT

1. **Replace all placeholders** (`[USN PLACEHOLDER]`, `[HOD Name]`, etc.) with actual values.
2. **Add KSIT and VTU logos** to the title page.
3. **Confirm guide name spelling** (Sowbahgya vs Sowbhagya).
4. **Provide viva voce date** for the certificate.
5. **Provide course code** for the declaration page.
6. **Sign all pages** requiring signatures (certificate, declaration).
7. **Print and bind** according to VTU/KSIT formatting guidelines.

---

## WHAT IS CONFIRMED AND DOES NOT NEED CHANGES

The following are verified from repository evidence and should NOT be changed:
- Project title: **AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System**
- Student names: Mohammed Shazan, Mohan Gowda V C, Puneeth S V
- Guide: Dr. Sowbahgya / Sowbhagya M. P., Associate Professor, Dept. of CSE
- Institution: K. S. Institute of Technology, Bengaluru — 560 109
- University: Visvesvaraya Technological University, Belagavi
- All technical metrics (ML results, clinical formulas, API routes)
- All 25 references (verified against published literature)

