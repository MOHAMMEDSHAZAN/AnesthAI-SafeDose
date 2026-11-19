# FINAL INSTRUCTION PROMPT FOR CLAUDE

```text
Act as a distinguished senior research professor, biomedical informatics expert, and lead IEEE Transactions author.

You are provided with the complete AnesthAI SafeDose Research Paper Archive:
"AnesthAI_SafeDose_Claude_Final_Paper_Package.zip"

Your task is to write and polish the complete, original, publication-ready, six-page IEEE research paper:
"AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System"

Follow these mandatory instructions:

1. SOURCE OF TRUTH & EMPIRICAL INTEGRITY:
   - Read "02_INDEPENDENT_AUDIT/FINAL_RELEASE_AUDIT.md" as your primary authority.
   - You must NOT invent, guess, extrapolate, or alter any numerical metric.
   - For the four CSV-backed prediction tasks (Arrhythmia, Hypotension, Hypoxia, Tachycardia), use the EXACT values independently recomputed from the prediction CSVs (e.g., Arrhythmia AUC 0.9414, 17,026 beats; Hypotension AUC 0.6927 at threshold 0.500, 708,755 windows).
   - For the six remaining tasks (Bradycardia, PACU, PONV, ICU, Mortality, Risk), report them strictly as the "Locked Audit Baseline" from Table III of the audit report. Explicitly disclose that their runtime API endpoints return HTTP 503 and are not backed by per-sample CSV exports in this release.

2. TITLE & AUTHOR INTEGRITY:
   - Title: "AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System"
   - Authors:
     Dr. Sowbhagya M. P.* (Associate Professor) [sowbhagya.mp@gmail.com]
     Mohammed Shazan (Student) [mohammedshazan888@gmail.com]
     Mohan Gowda V. C. (Student) [mohangowda4983@gmail.com]
     Puneeth S. V. (Student) [punithsv948@gmail.com]
   - Affiliation: Department of Computer Science and Engineering, K. S. Institute of Technology, affiliated with Visvesvaraya Technological University, Belagavi, Karnataka – 560109, India.
   - Flag Author Query 1 (AQ1: spelling variance Sowbhagya vs Sowbahgya) in comments.

3. ARCHITECTURE & CLINICAL REASONING:
   - Clearly delineate deterministic algorithms (Holliday-Segar 4-2-1 fluid rule, Nadler EBV, ATLS hemorrhage stages, Janmahasatian LBM) from statistical ML models.
   - State clearly that AnesthAI SafeDose is a clinical decision-support prototype under physician supervision; it never autonomously administers drugs or titrates infusions.
   - Explicitly disclose simulated components: the Live OT waveform monitor uses canvas playback of retrospective physiological dynamics, and emergency dispatch quick-links are advisory references.

4. FORMATTING, LAYOUT & PAGE BUDGET:
   - Format in standard IEEE Transactions two-column format using IEEEtran.cls.
   - The manuscript must be EXACTLY 6.0 pages long. The 25 references must terminate in the second column of page 6 without spilling onto page 7.
   - Sequential citations: All figures (Figs. 1–7) and tables (Tables I–VI) must be sequentially cited and balanced across columns.
   - Zero undefined tokens: Ensure no "??", "[?]", "TODO", or "NaN" tokens exist.

5. OUTPUT DELIVERABLES:
   - Deliver the complete, beautifully written, compilable LaTeX code (main_final.tex).
   - Ensure it compiles cleanly with standard pdflatex and bibtex against the provided references.bib.
```
