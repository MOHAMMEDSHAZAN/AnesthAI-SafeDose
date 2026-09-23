# Anesth AI: Anesthesia Dose Calculation and Safety Support System
## IEEE Conference Research Paper Suite

This repository contains the complete, submission-ready IEEE conference manuscript package for:

**Official Paper Title:**  
*Anesthesia Dose Calculation and Safety Support System*

**Product / Platform Branding:**  
*Anesth AI* (developed from the earlier research prototype *AnesthAI SafeDose*)

---

## 1. Authors and Affiliation

- **Dr. Sowbahgya M P$^1$** (Associate Professor) — `sowbhagya.mp@gmail.com`
- **Mohammed Shazan$^2$** (Student) — `mohammedshazan888@gmail.com`
- **Mohan Gowda V C$^3$** (Student) — `mohangowda4983@gmail.com`
- **Puneeth S V$^4$** (Student) — `punithsv948@gmail.com`

**Department & Institution:**  
Department of Computer Science and Engineering, K.S. Institute of Technology  
Visvesvaraya Technological University, Belagavi - 590018  
Bengaluru, Karnataka - 560109, India

---

## 2. Directory Structure

```
anesth_ai_ieee/
│
├── main.tex                    # Final submission-ready IEEE LaTeX source
├── references.bib              # 28 authentic peer-reviewed references
├── IEEEtran.cls                # Official IEEE LaTeX conference document class
├── README.md                   # Repository and compilation documentation
│
├── figures/                    # High-resolution diagrams and project UI captures
│   ├── system_architecture.png           # Fig. 1: Modular system architecture
│   ├── multitask_pipeline.png            # Data preprocessing & optimization pipeline
│   ├── clinical_workflow.png             # Fig. 2: 3-phase perioperative workflow
│   ├── security_break_glass.png          # Fig. 3: RBAC & Emergency Break-Glass
│   ├── experimental_methodology.png      # Fig. 4: Patient-grouped 3-way split protocol
│   ├── arrhythmia_confusion_matrix.png   # Fig. 5: Authentic MIT-BIH confusion matrix
│   ├── live_ot.png                       # Fig. 6: Live operating theater monitoring UI
│   ├── dashboard.png                     # Fig. 7: Preoperative clinical dashboard UI
│   ├── preoperative.png                  # Preoperative clinical intake UI
│   ├── drug_calculator.png               # Parameter-based drug calculator UI
│   ├── safety_overview.png               # Perioperative safety checklist UI
│   ├── emergency_portal.png              # Emergency Break-Glass portal UI
│   └── analytics.png                     # Model telemetry and clinical analytics UI
│
└── output/
    └── AnesthAI_IEEE_Final.pdf # Submission-ready PDF (EXACTLY 6 PAGES)
```

---

## 3. How to Compile the Paper

### Method A: Direct Compilation with Overleaf / Local TeX Distribution (TeX Live / MiKTeX)
1. Upload or open the `anesth_ai_ieee/` folder in your LaTeX environment.
2. Ensure `IEEEtran.cls`, `main.tex`, `references.bib`, and the `figures/` directory are in the same folder.
3. Execute standard four-pass compilation:
   ```bash
   pdflatex main.tex
   bibtex main
   pdflatex main.tex
   pdflatex main.tex
   ```
4. Output PDF will be generated as `main.pdf`.

### Method B: Automated Precision PDF Generator
To generate the submission-ready PDF formatted to **EXACTLY 6 PAGES** with optimal column balancing:
```bash
python build_anesth_ai_paper.py
```
This will compile the manuscript and output:
`anesth_ai_ieee/output/AnesthAI_IEEE_Final.pdf`.

---

## 4. Key Scientific and Clinical Contributions

1. **Ten Production Clinical Prediction Tasks:** Evaluated across four benchmark databases (VitalDB, MIT-BIH, MIMIC-IV-ED v2.2, MIMIC-IV v3.1) covering intraoperative hemodynamics, electrophysiology, surgical hemorrhage, fluid response, triage acuity, intensive care transfer, and mortality.
2. **Zero-Leakage Patient-Grouped Splitting:** Enforced 3-way grouped splitting ($\mathcal{P}_{\text{train}} \cap \mathcal{P}_{\text{val}} = \emptyset$, $\mathcal{P}_{\text{train}} \cap \mathcal{P}_{\text{test}} = \emptyset$) with complete exclusion of target-defining predictors and training-only feature transformation fitting.
3. **Authentic Arrhythmia Revalidation:** Disclosed and repudiated an earlier 100% evaluation artifact caused by a WFDB parser failure, replacing it with an authentic 48-record evaluation ($109,494$ beats; $5,843$ positive test arrhythmias) achieving $92.01\%$ sensitivity, $82.29\%$ specificity, and $0.9414$ AUROC on 7 held-out records.
4. **Decoupled Deterministic Fluid Engine:** Separated statistical ML recommendations from an arithmetic service executing Holliday-Segar basal requirements, Estimated Blood Volume ($70\text{ mL/kg}$ male, $65\text{ mL/kg}$ female), and ATLS hemorrhage classification (Classes I–IV).
5. **Standardized Clinical Terminology:** Enforced official terminology: *ASA Physical Status Classification* (ASA I–VI with independent emergency modifier "E") with mandatory clinician confirmation.
6. **Objective Intraoperative Safety Semantics:** Objective status display (*"Monitoring status: No configured alerts currently triggered"*) rather than misleading claims such as *"Patient is safe"*.
7. **Dual-Tier RBAC & Audited Emergency Break-Glass:** Centralized 6-role RBAC paired with emergency override requiring active authentication, mandatory clinical rationale ($\ge 10$ characters), temporary scoped tokens, and immutable audit logging.
8. **Human-in-the-Loop Governance:** Operates strictly as advisory clinical decision support; does not autonomously administer or titrate medication, intravenous fluids, or mechanical ventilation.
