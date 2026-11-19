# 01_MANUSCRIPT: Source Files and Compiled Deliverables

This directory contains the complete source code, bibliography, layout engine, and compiled PDF for the IEEE manuscript:
**"Anesthesia Dose Calculation and Safety Support System" (AnesthAI SafeDose)**.

## Contents
1. **`AnesthAI_IEEE_Final.pdf`**: The official compiled 6.0-page IEEE conference publication deliverable.
   - Formatted in two-column IEEE format.
   - Verified 6 pages exactly (zero spillover).
   - Zero undefined tokens (`??`, `[?]`, `TODO`, `NaN`).
   - Tables I–VI and Figs. 1–7 sequentially cited and balanced across columns.
2. **`main_final.tex`**: The latest, fully edited LaTeX source code incorporating all audit corrections, verified sample counts, author queries, and exact table data.
3. **`main.tex`**: The baseline LaTeX draft preserved for historical provenance.
4. **`references.bib`**: Complete BibTeX database containing 25 verified peer-reviewed publications (2023–2025 IEEE, Elsevier, Nature, Springer citations with active DOIs).
5. **`IEEEtran.cls`**: Official IEEE Transactions/Conference document class file (version 1.8b).
6. **`figures_polished/`**: Contains the 7 high-resolution publication figures referenced by `main_final.tex`.
7. **`build_submission_final_6page.py`**: The Python compilation pipeline that manages exact column balance and micro-typography to guarantee the 6.0-page budget.

## Compilation Instructions
To compile `main_final.tex` locally with standard LaTeX:
```bash
pdflatex main_final.tex
bibtex main_final
pdflatex main_final.tex
pdflatex main_final.tex
```
Note: Ensure `IEEEtran.cls` and `figures_polished/` reside in the working directory.
