"""
AnesthAI SafeDose — Full BE Project Report Generator
Part 1: Document setup, preliminary pages, Chapters 1-4
"""

import os
import sys
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

BASE = r"c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\FINAL_ANESTHAI_PROJECT_REPORT"
ARCH = os.path.join(BASE, "Project_Architecture_Diagrams")
SCRN = os.path.join(BASE, "Project_Screenshots")
MRST = os.path.join(BASE, "Model_Results_and_Graphs")

# ─── helpers ──────────────────────────────────────────────────────────────────

def add_page_break(doc):
    doc.add_page_break()

def set_para_spacing(para, before=0, after=6, line=1.5):
    pf = para.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after  = Pt(after)
    pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE

def heading(doc, text, level=1, page_break_before=False):
    if page_break_before:
        doc.add_page_break()
    h = doc.add_heading(text, level=level)
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after  = Pt(6)
    for run in h.runs:
        run.font.name = "Times New Roman"
        if level == 1:
            run.font.size = Pt(14)
            run.bold = True
        elif level == 2:
            run.font.size = Pt(12)
            run.bold = True
        else:
            run.font.size = Pt(12)
            run.bold = True
            run.italic = True
    return h

def body(doc, text, bold=False, italic=False, indent=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    run.bold = bold
    run.italic = italic
    if indent:
        p.paragraph_format.left_indent = Cm(1)
    set_para_spacing(p)
    return p

def bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet")
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    p.paragraph_format.left_indent  = Cm(1 + level)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(3)
    return p

def numbered(doc, text, level=0):
    p = doc.add_paragraph(style="List Number")
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    p.paragraph_format.left_indent  = Cm(1 + level)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(3)
    return p

def add_figure(doc, img_path, caption, width_cm=14):
    if os.path.exists(img_path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run()
        run.add_picture(img_path, width=Cm(width_cm))
    else:
        p = doc.add_paragraph(f"[Figure placeholder: {os.path.basename(img_path)} NOT FOUND]")
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.runs[0].font.italic = True
    cap = doc.add_paragraph(caption)
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_before = Pt(2)
    cap.paragraph_format.space_after  = Pt(10)
    for run in cap.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(11)
        run.italic = True
    return p

def simple_table(doc, headers, rows, col_widths=None):
    tbl = doc.add_table(rows=1 + len(rows), cols=len(headers))
    tbl.style = "Table Grid"
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Header row
    hdr = tbl.rows[0]
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        cell.text = h
        cell.paragraphs[0].runs[0].bold = True
        cell.paragraphs[0].runs[0].font.name = "Times New Roman"
        cell.paragraphs[0].runs[0].font.size = Pt(11)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        shading = OxmlElement("w:shd")
        shading.set(qn("w:fill"), "D9E1F2")
        shading.set(qn("w:color"), "auto")
        shading.set(qn("w:val"), "clear")
        cell._tc.get_or_add_tcPr().append(shading)
    # Data rows
    for ri, row in enumerate(rows):
        tr = tbl.rows[ri + 1]
        for ci, val in enumerate(row):
            cell = tr.cells[ci]
            cell.text = str(val)
            cell.paragraphs[0].runs[0].font.name = "Times New Roman"
            cell.paragraphs[0].runs[0].font.size = Pt(10)
    # Set column widths
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in tbl.rows:
                row.cells[i].width = Cm(w)
    doc.add_paragraph()
    return tbl

def set_margins(doc, top=2.54, bottom=2.54, left=3.5, right=2.54):
    for section in doc.sections:
        section.top_margin    = Cm(top)
        section.bottom_margin = Cm(bottom)
        section.left_margin   = Cm(left)
        section.right_margin  = Cm(right)
        section.page_height   = Cm(29.7)
        section.page_width    = Cm(21.0)

def add_header_footer(doc):
    section = doc.sections[0]
    # Header
    header = section.header
    hp = header.paragraphs[0] if header.paragraphs else header.add_paragraph()
    hp.clear()
    hp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = hp.add_run("AnesthAI SafeDose — BE Project Report | K.S. Institute of Technology, Bengaluru")
    run.font.name = "Times New Roman"
    run.font.size = Pt(9)
    run.italic = True
    # Footer with page number
    footer = section.footer
    fp = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
    fp.clear()
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = fp.add_run("Page ")
    run.font.name = "Times New Roman"
    run.font.size = Pt(9)
    # Add page number field
    fldChar1 = OxmlElement("w:fldChar")
    fldChar1.set(qn("w:fldCharType"), "begin")
    instrText = OxmlElement("w:instrText")
    instrText.set(qn("xml:space"), "preserve")
    instrText.text = "PAGE"
    fldChar2 = OxmlElement("w:fldChar")
    fldChar2.set(qn("w:fldCharType"), "end")
    new_run = OxmlElement("w:r")
    new_run.append(fldChar1)
    new_run.append(instrText)
    new_run.append(fldChar2)
    fp._p.append(new_run)

# ─── document init ─────────────────────────────────────────────────────────────

doc = Document()
set_margins(doc)

# Default Normal style
style = doc.styles["Normal"]
style.font.name = "Times New Roman"
style.font.size = Pt(12)

add_header_footer(doc)

# ══════════════════════════════════════════════════════════════════════════════
# TITLE PAGE
# ══════════════════════════════════════════════════════════════════════════════

sec = doc.sections[0]
sec.different_first_page_header_footer = False

# University name
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("VISVESVARAYA TECHNOLOGICAL UNIVERSITY, BELAGAVI")
r.font.name = "Times New Roman"; r.font.size = Pt(14); r.bold = True

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
r2 = p2.add_run("Accredited with 'A++' Grade by NAAC")
r2.font.name = "Times New Roman"; r2.font.size = Pt(12)

doc.add_paragraph()

# College logo placeholder
p_logo = doc.add_paragraph()
p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_logo = p_logo.add_run("[KSIT LOGO — Insert official college emblem here]")
r_logo.font.name = "Times New Roman"; r_logo.font.size = Pt(11); r_logo.italic = True

doc.add_paragraph()

p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
r3 = p3.add_run("K. S. INSTITUTE OF TECHNOLOGY, BENGALURU — 560 109")
r3.font.name = "Times New Roman"; r3.font.size = Pt(14); r3.bold = True

p4 = doc.add_paragraph()
p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
r4 = p4.add_run("Department of Computer Science and Engineering")
r4.font.name = "Times New Roman"; r4.font.size = Pt(13); r4.bold = True

doc.add_paragraph()

p5 = doc.add_paragraph()
p5.alignment = WD_ALIGN_PARAGRAPH.CENTER
r5 = p5.add_run("A Project Report")
r5.font.name = "Times New Roman"; r5.font.size = Pt(12)

p6 = doc.add_paragraph()
p6.alignment = WD_ALIGN_PARAGRAPH.CENTER
r6 = p6.add_run("submitted in partial fulfilment of the requirements for the award of the degree of")
r6.font.name = "Times New Roman"; r6.font.size = Pt(12)

p7 = doc.add_paragraph()
p7.alignment = WD_ALIGN_PARAGRAPH.CENTER
r7 = p7.add_run("BACHELOR OF ENGINEERING")
r7.font.name = "Times New Roman"; r7.font.size = Pt(14); r7.bold = True

p8 = doc.add_paragraph()
p8.alignment = WD_ALIGN_PARAGRAPH.CENTER
r8 = p8.add_run("in")
r8.font.name = "Times New Roman"; r8.font.size = Pt(12)

p9 = doc.add_paragraph()
p9.alignment = WD_ALIGN_PARAGRAPH.CENTER
r9 = p9.add_run("Computer Science and Engineering")
r9.font.name = "Times New Roman"; r9.font.size = Pt(13); r9.bold = True

doc.add_paragraph()

p10 = doc.add_paragraph()
p10.alignment = WD_ALIGN_PARAGRAPH.CENTER
r10 = p10.add_run("on")
r10.font.name = "Times New Roman"; r10.font.size = Pt(12)

doc.add_paragraph()

p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_title = p_title.add_run("AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System")
r_title.font.name = "Times New Roman"; r_title.font.size = Pt(16); r_title.bold = True

doc.add_paragraph()
doc.add_paragraph()

p_by = doc.add_paragraph()
p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_by = p_by.add_run("Submitted by")
r_by.font.name = "Times New Roman"; r_by.font.size = Pt(12); r_by.bold = True

doc.add_paragraph()

team = [
    ("Mohammed Shazan",  "[1KS__CS___]"),
    ("Mohan Gowda V C",  "[1KS__CS___]"),
    ("Puneeth S V",      "[1KS__CS___]"),
]
for name, usn in team:
    pm = doc.add_paragraph()
    pm.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rm = pm.add_run(f"{name}  |  USN: {usn}")
    rm.font.name = "Times New Roman"; rm.font.size = Pt(12)

doc.add_paragraph()

p_guide = doc.add_paragraph()
p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_guide = p_guide.add_run("Under the guidance of")
r_guide.font.name = "Times New Roman"; r_guide.font.size = Pt(12); r_guide.bold = True

p_guidename = doc.add_paragraph()
p_guidename.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_guidename = p_guidename.add_run("Dr. Sowbhagya M. P.")
r_guidename.font.name = "Times New Roman"; r_guidename.font.size = Pt(12)

p_guidedesig = doc.add_paragraph()
p_guidedesig.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_guidedesig = p_guidedesig.add_run("Associate Professor, Department of Computer Science and Engineering")
r_guidedesig.font.name = "Times New Roman"; r_guidedesig.font.size = Pt(12)

p_guideinst = doc.add_paragraph()
p_guideinst.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_guideinst = p_guideinst.add_run("K.S. Institute of Technology, Bengaluru — 560 109")
r_guideinst.font.name = "Times New Roman"; r_guideinst.font.size = Pt(12)

doc.add_paragraph()

p_yr = doc.add_paragraph()
p_yr.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_yr = p_yr.add_run("Academic Year: 2026–27")
r_yr.font.name = "Times New Roman"; r_yr.font.size = Pt(12); r_yr.bold = True

# ══════════════════════════════════════════════════════════════════════════════
# CERTIFICATE
# ══════════════════════════════════════════════════════════════════════════════

add_page_break(doc)
pc = doc.add_paragraph()
pc.alignment = WD_ALIGN_PARAGRAPH.CENTER
rc = pc.add_run("CERTIFICATE")
rc.font.name = "Times New Roman"; rc.font.size = Pt(16); rc.bold = True; rc.underline = True

doc.add_paragraph()
pc2 = doc.add_paragraph()
pc2.alignment = WD_ALIGN_PARAGRAPH.CENTER
rc2 = pc2.add_run("K. S. INSTITUTE OF TECHNOLOGY, BENGALURU — 560 109")
rc2.font.name = "Times New Roman"; rc2.font.size = Pt(13); rc2.bold = True

pc3 = doc.add_paragraph()
pc3.alignment = WD_ALIGN_PARAGRAPH.CENTER
rc3 = pc3.add_run("Department of Computer Science and Engineering")
rc3.font.name = "Times New Roman"; rc3.font.size = Pt(12); rc3.bold = True

doc.add_paragraph()

cert_text = (
    "This is to certify that the project entitled \"AnesthAI SafeDose: Anesthesia Dose "
    "Calculation and Safety Support System\" has been carried out by Mohammed Shazan "
    "(USN: [1KS__CS___]), Mohan Gowda V C (USN: [1KS__CS___]), and Puneeth S V "
    "(USN: [1KS__CS___]), bonafide students of the Department of Computer Science and "
    "Engineering, K. S. Institute of Technology, Bengaluru — 560 109, affiliated to "
    "Visvesvaraya Technological University, Belagavi, Karnataka, in partial fulfilment "
    "of the requirements for the award of the Degree of Bachelor of Engineering in "
    "Computer Science and Engineering during the Academic Year 2026–27."
)
p_cert = doc.add_paragraph(cert_text)
p_cert.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(p_cert)
for run in p_cert.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

doc.add_paragraph()
p_cert2 = doc.add_paragraph(
    "This project has been approved as it satisfies the academic requirements in respect "
    "of the project work prescribed for the said degree."
)
p_cert2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(p_cert2)
for run in p_cert2.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

doc.add_paragraph()
doc.add_paragraph()

# Signature table
sig_tbl = doc.add_table(rows=4, cols=3)
sig_tbl.style = "Table Grid"
labels = [
    ["Project Guide", "Head of Department", "Principal"],
    ["Dr. Sowbhagya M. P.", "[HOD Name — Placeholder]", "[Principal Name — Placeholder]"],
    ["Associate Professor", "Dept. of CSE", "K.S. Institute of Technology"],
    ["Dept. of CSE, KSIT", "K.S. Institute of Technology", "Bengaluru — 560 109"],
]
for ri, row_data in enumerate(labels):
    row = sig_tbl.rows[ri]
    for ci, val in enumerate(row_data):
        cell = row.cells[ci]
        cell.text = val
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in cell.paragraphs[0].runs:
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)
            if ri == 0:
                run.bold = True

doc.add_paragraph()
doc.add_paragraph()
p_ext = doc.add_paragraph()
r_ext = p_ext.add_run("External Examiner: ________________________")
r_ext.font.name = "Times New Roman"; r_ext.font.size = Pt(12)
p_ext.paragraph_format.space_before = Pt(12)

p_date = doc.add_paragraph()
r_date = p_date.add_run("Date of Viva Voce: [Date — Placeholder]        Venue: KSIT, Bengaluru")
r_date.font.name = "Times New Roman"; r_date.font.size = Pt(12)

# ══════════════════════════════════════════════════════════════════════════════
# DECLARATION
# ══════════════════════════════════════════════════════════════════════════════

add_page_break(doc)
pd1 = doc.add_paragraph()
pd1.alignment = WD_ALIGN_PARAGRAPH.CENTER
rd1 = pd1.add_run("DECLARATION")
rd1.font.name = "Times New Roman"; rd1.font.size = Pt(16); rd1.bold = True; rd1.underline = True

doc.add_paragraph()
decl_text = (
    "We, Mohammed Shazan (USN: [1KS__CS___]), Mohan Gowda V C (USN: [1KS__CS___]), "
    "and Puneeth S V (USN: [1KS__CS___]), students of the eighth semester, Bachelor of "
    "Engineering in Computer Science and Engineering, K. S. Institute of Technology, "
    "Bengaluru — 560 109, affiliated to Visvesvaraya Technological University, Belagavi, "
    "Karnataka, hereby declare that the project entitled \"AnesthAI SafeDose: Anesthesia "
    "Dose Calculation and Safety Support System\" has been carried out by us independently "
    "under the guidance of Dr. Sowbhagya M. P., Associate Professor, Department of "
    "Computer Science and Engineering, KSIT, Bengaluru, during the Academic Year 2026–27."
)
pd2 = doc.add_paragraph(decl_text)
pd2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(pd2)
for run in pd2.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

doc.add_paragraph()
decl2 = (
    "We further declare that this project report or any part thereof has not been submitted "
    "to any other university or institution for the award of any degree or diploma. All "
    "information pertaining to the project has been presented truthfully and accurately "
    "to the best of our knowledge. Any information taken from other sources has been "
    "duly acknowledged and cited."
)
pd3 = doc.add_paragraph(decl2)
pd3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(pd3)
for run in pd3.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

doc.add_paragraph()
decl3 = (
    "We also declare that the AnesthAI SafeDose system is a research prototype developed "
    "for academic purposes only. It is not a licensed medical device and must not be used "
    "for clinical decision-making without appropriate clinical validation and regulatory "
    "approval from competent authorities."
)
pd4 = doc.add_paragraph(decl3)
pd4.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(pd4)
for run in pd4.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

doc.add_paragraph()
doc.add_paragraph("Place: Bengaluru").runs[0].font.name = "Times New Roman"
doc.add_paragraph("Date: [Date — Placeholder]").runs[0].font.name = "Times New Roman"
doc.add_paragraph()

decl_sig = doc.add_table(rows=2, cols=3)
decl_sig.style = "Table Grid"
sig_names = [["Mohammed Shazan", "Mohan Gowda V C", "Puneeth S V"],
             ["USN: [1KS__CS___]", "USN: [1KS__CS___]", "USN: [1KS__CS___]"]]
for ri, row_data in enumerate(sig_names):
    for ci, val in enumerate(row_data):
        cell = decl_sig.rows[ri].cells[ci]
        cell.text = val
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in cell.paragraphs[0].runs:
            run.font.name = "Times New Roman"; run.font.size = Pt(11)

# ══════════════════════════════════════════════════════════════════════════════
# ACKNOWLEDGEMENT
# ══════════════════════════════════════════════════════════════════════════════

add_page_break(doc)
pa = doc.add_paragraph()
pa.alignment = WD_ALIGN_PARAGRAPH.CENTER
ra = pa.add_run("ACKNOWLEDGEMENT")
ra.font.name = "Times New Roman"; ra.font.size = Pt(16); ra.bold = True; ra.underline = True

doc.add_paragraph()
ack_paras = [
    ("We express our deepest gratitude to our project guide, Dr. Sowbhagya M. P., Associate "
     "Professor, Department of Computer Science and Engineering, K. S. Institute of Technology, "
     "Bengaluru, for her invaluable guidance, continuous encouragement, and scholarly insights "
     "throughout the duration of this project. Her expertise in machine learning, clinical "
     "informatics, and software engineering has been instrumental in shaping the direction and "
     "depth of this work. We are grateful for her patience in reviewing our progress and her "
     "constructive feedback at every stage of development."),
    ("We sincerely thank the [Head of Department — Placeholder], Head of the Department of "
     "Computer Science and Engineering, K. S. Institute of Technology, for providing the "
     "necessary academic and infrastructural facilities required for the successful completion "
     "of this project. We also thank the [Principal — Placeholder], Principal, KSIT, for "
     "creating an environment conducive to innovative research."),
    ("We place on record our heartfelt thanks to all the faculty members and staff of the "
     "Department of Computer Science and Engineering, KSIT, for their encouragement and "
     "support throughout our academic journey."),
    ("We gratefully acknowledge the open-access clinical datasets that form the empirical "
     "foundation of this project. We thank the VitalDB team (Seoul National University Hospital, "
     "Republic of Korea) for the VitalDB physiological monitoring dataset, which provided "
     "high-resolution intraoperative waveform data for training and evaluating our predictive "
     "models. We acknowledge PhysioNet and the Beth Israel Deaconess Medical Center for the "
     "MIT-BIH Arrhythmia Database, a cornerstone resource in cardiac arrhythmia research. "
     "We further acknowledge the MIMIC-IV and MIMIC-IV-ED datasets made available through "
     "PhysioNet and the Laboratory for Computational Physiology, MIT, for enabling our "
     "clinical outcome prediction tasks."),
    ("Finally, we express profound gratitude to our families and friends for their unwavering "
     "moral support, patience, and encouragement throughout the academic year. This work "
     "would not have been possible without their constant motivation."),
]
for ack_text in ack_paras:
    pa_p = doc.add_paragraph(ack_text)
    pa_p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    set_para_spacing(pa_p)
    for run in pa_p.runs:
        run.font.name = "Times New Roman"; run.font.size = Pt(12)
    doc.add_paragraph()

doc.add_paragraph()
p_names = doc.add_paragraph()
p_names.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r_names = p_names.add_run("Mohammed Shazan\nMohan Gowda V C\nPuneeth S V")
r_names.font.name = "Times New Roman"; r_names.font.size = Pt(12)

# ══════════════════════════════════════════════════════════════════════════════
# ABSTRACT
# ══════════════════════════════════════════════════════════════════════════════

add_page_break(doc)
pabs = doc.add_paragraph()
pabs.alignment = WD_ALIGN_PARAGRAPH.CENTER
rabs = pabs.add_run("ABSTRACT")
rabs.font.name = "Times New Roman"; rabs.font.size = Pt(16); rabs.bold = True; rabs.underline = True

doc.add_paragraph()
abstract_text = (
    "AnesthAI SafeDose is a comprehensive, web-based anesthesia dose calculation and safety "
    "support system developed as an academic research prototype. The system integrates machine "
    "learning-based perioperative risk prediction, clinical pharmacological calculation tools, "
    "role-based access control, and a structured audit trail within a unified platform designed "
    "to assist anesthesiology clinical workflows during the preoperative, intraoperative, and "
    "postoperative phases of surgical care."
)
pabs1 = doc.add_paragraph(abstract_text)
pabs1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(pabs1)
for run in pabs1.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

abs2 = (
    "The system employs ten machine learning tasks across three clinical datasets. Four tasks — "
    "arrhythmia detection, intraoperative hypotension prediction, hypoxia prediction, and "
    "tachycardia detection — have been independently verified through per-sample prediction "
    "files and confusion matrix records. The arrhythmia detection model (LightGBM) trained on "
    "the MIT-BIH Arrhythmia Database achieves a ROC-AUC of 0.9414 and sensitivity of 0.9201 "
    "on 17,026 test beats from 7 held-out ECG records. The intraoperative hypotension model "
    "(LightGBM, VitalDB) achieves a ROC-AUC of 0.6927 on 708,755 one-second monitoring "
    "windows across 35 test surgical cases. The hypoxia model (HistGradientBoostingClassifier) "
    "achieves a ROC-AUC of 0.9047 with a specificity of 0.9916. The tachycardia detection "
    "model achieves a ROC-AUC of 0.6980. Six additional models — Bradycardia, EmergencySeverity, "
    "BloodLoss, FluidRecommendation, ICU Admission, and Mortality — are reported from training "
    "logs but have not been independently verified via per-sample prediction files and are "
    "designated as 'reported but not independently verified.'"
)
pabs2 = doc.add_paragraph(abs2)
pabs2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(pabs2)
for run in pabs2.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

abs3 = (
    "The clinical calculation engine implements the Holliday-Segar maintenance fluid formula, "
    "estimated blood volume (EBV) based on weight and sex, ATLS hemorrhage classification "
    "(Class I–IV), Modified Aldrete Post-Anesthesia Recovery Score, and WHO Surgical Safety "
    "Checklist items for pre-induction, intraoperative timeout, and sign-out phases. These "
    "calculations are served through a FastAPI backend and consumed by a React 19.2.6 / "
    "TypeScript / Tailwind CSS frontend comprising 31 application screens plus an Emergency "
    "Portal modal."
)
pabs3 = doc.add_paragraph(abs3)
pabs3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(pabs3)
for run in pabs3.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

abs4 = (
    "Security is implemented through PBKDF2-HMAC-SHA256 password hashing (100,000 iterations), "
    "JWT HS256 authentication with 86,400-second token expiry, and a six-role RBAC matrix "
    "(Anesthesiologist, Surgeon, Nurse, Admin, Student, Break-Glass). A Break-Glass emergency "
    "access protocol allows override access with mandatory audit logging. Live intraoperative "
    "waveforms displayed on the Live OT screen are simulated using HTML5 canvas sine waves and "
    "do not represent real hardware telemetry. The system is a research prototype and is not "
    "intended for clinical use without formal validation and regulatory approval. This report "
    "documents the design, implementation, ML methodology, evaluation results, and testing "
    "procedures for the AnesthAI SafeDose system."
)
pabs4 = doc.add_paragraph(abs4)
pabs4.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
set_para_spacing(pabs4)
for run in pabs4.runs:
    run.font.name = "Times New Roman"; run.font.size = Pt(12)

p_kw = doc.add_paragraph()
run_kw = p_kw.add_run("Keywords: ")
run_kw.font.name = "Times New Roman"; run_kw.font.size = Pt(12); run_kw.bold = True
run_kw2 = p_kw.add_run(
    "Anesthesia Safety, Machine Learning, Perioperative Risk Prediction, LightGBM, "
    "FastAPI, React, RBAC, VitalDB, MIT-BIH, Clinical Decision Support, Patient Safety."
)
run_kw2.font.name = "Times New Roman"; run_kw2.font.size = Pt(12); run_kw2.italic = True

# ══════════════════════════════════════════════════════════════════════════════
# TABLE OF CONTENTS (manual)
# ══════════════════════════════════════════════════════════════════════════════

add_page_break(doc)
ptoc = doc.add_paragraph()
ptoc.alignment = WD_ALIGN_PARAGRAPH.CENTER
rtoc = ptoc.add_run("TABLE OF CONTENTS")
rtoc.font.name = "Times New Roman"; rtoc.font.size = Pt(16); rtoc.bold = True; rtoc.underline = True

doc.add_paragraph()

toc_items = [
    ("Certificate", "ii"),
    ("Declaration", "iii"),
    ("Acknowledgement", "iv"),
    ("Abstract", "v"),
    ("Table of Contents", "vi"),
    ("List of Figures", "viii"),
    ("List of Tables", "ix"),
    ("List of Abbreviations", "x"),
    ("CHAPTER 1 — INTRODUCTION", "1"),
    ("  1.1  Background and Motivation", "1"),
    ("  1.2  Problem Statement", "3"),
    ("  1.3  Objectives of the Project", "4"),
    ("  1.4  Scope and Limitations", "5"),
    ("  1.5  Organisation of the Report", "6"),
    ("CHAPTER 2 — LITERATURE SURVEY", "7"),
    ("  2.1  Perioperative Risk and Vital-Sign Prediction", "7"),
    ("  2.2  ECG Arrhythmia and Cardiac Event Detection", "9"),
    ("  2.3  EHR-Based Clinical Outcome Prediction", "11"),
    ("  2.4  Explainable AI in Healthcare", "12"),
    ("  2.5  Comparative Analysis of Related Work", "13"),
    ("  2.6  Research Gaps", "14"),
    ("  2.7  Proposed Approach", "15"),
    ("CHAPTER 3 — SYSTEM ANALYSIS", "16"),
    ("  3.1  Existing Systems and Their Limitations", "16"),
    ("  3.2  Proposed System Description", "18"),
    ("  3.3  Functional Requirements", "19"),
    ("  3.4  Non-Functional Requirements", "21"),
    ("  3.5  Hardware Requirements", "22"),
    ("  3.6  Software Requirements", "22"),
    ("  3.7  Feasibility Study", "23"),
    ("CHAPTER 4 — SYSTEM DESIGN", "25"),
    ("  4.1  System Architecture", "25"),
    ("  4.2  Three-Phase Perioperative Workflow", "27"),
    ("  4.3  Data Flow Diagrams", "29"),
    ("  4.4  Use Case Diagram", "31"),
    ("  4.5  Activity Diagram", "32"),
    ("  4.6  Sequence Diagram", "33"),
    ("  4.7  Database Design", "34"),
    ("  4.8  ML Pipeline Architecture", "36"),
    ("  4.9  Module Design", "38"),
    ("CHAPTER 5 — METHODOLOGY AND IMPLEMENTATION", "41"),
    ("  5.1  Overall Methodology", "41"),
    ("  5.2  VitalDB Dataset Collection and Preprocessing", "43"),
    ("  5.3  MIT-BIH Dataset Collection and Preprocessing", "45"),
    ("  5.4  MIMIC-IV/MIMIC-IV-ED Preprocessing", "47"),
    ("  5.5  Feature Engineering", "48"),
    ("  5.6  Model Training and Selection", "50"),
    ("  5.7  Threshold Optimisation", "52"),
    ("  5.8  Clinical Calculation Modules", "53"),
    ("  5.9  Backend Implementation", "56"),
    ("  5.10 Frontend Implementation", "58"),
    ("  5.11 Database Integration", "60"),
    ("  5.12 Security and Audit Logging", "61"),
    ("  5.13 Deployment", "63"),
    ("CHAPTER 6 — RESULTS AND DISCUSSION", "64"),
    ("  6.1  Experimental Setup", "64"),
    ("  6.2  Dataset Statistics", "65"),
    ("  6.3  Independently Verified Model Results", "66"),
    ("  6.4  Reported Model Results (Not Independently Verified)", "70"),
    ("  6.5  ROC and Precision-Recall Curve Analysis", "71"),
    ("  6.6  Frontend Screenshots", "73"),
    ("  6.7  Clinical Interpretation and Discussion", "79"),
    ("  6.8  Limitations", "81"),
    ("CHAPTER 7 — TESTING", "83"),
    ("  7.1  Testing Strategy", "83"),
    ("  7.2  Unit Testing", "84"),
    ("  7.3  Integration Testing", "85"),
    ("  7.4  Security and RBAC Testing", "86"),
    ("  7.5  ML Evaluation Testing", "87"),
    ("  7.6  Test Case Table", "88"),
    ("  7.7  API Endpoint Status", "91"),
    ("CHAPTER 8 — CONCLUSION AND FUTURE WORK", "92"),
    ("  8.1  Conclusion", "92"),
    ("  8.2  Achievements", "93"),
    ("  8.3  Current Limitations", "94"),
    ("  8.4  Future Enhancements", "95"),
    ("REFERENCES", "97"),
    ("APPENDIX A — Key Code Snippets", "103"),
    ("APPENDIX B — API Documentation", "107"),
    ("APPENDIX C — Dataset Split Manifests", "110"),
    ("APPENDIX D — Verified Prediction Metrics", "112"),
    ("APPENDIX E — Git Repository Information", "114"),
]

toc_tbl = doc.add_table(rows=len(toc_items), cols=2)
toc_tbl.style = "Table Grid"
for i, (item, pg) in enumerate(toc_items):
    row = toc_tbl.rows[i]
    row.cells[0].text = item
    row.cells[1].text = pg
    row.cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    for ci in range(2):
        for run in row.cells[ci].paragraphs[0].runs:
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)
            if item.startswith("CHAPTER") or item in ["REFERENCES", "Certificate", "Declaration",
              "Acknowledgement", "Abstract", "Table of Contents",
              "List of Figures", "List of Tables", "List of Abbreviations"] or item.startswith("APPENDIX"):
                run.bold = True

# ══════════════════════════════════════════════════════════════════════════════
# LIST OF FIGURES
# ══════════════════════════════════════════════════════════════════════════════

add_page_break(doc)
plof = doc.add_paragraph()
plof.alignment = WD_ALIGN_PARAGRAPH.CENTER
rlof = plof.add_run("LIST OF FIGURES")
rlof.font.name = "Times New Roman"; rlof.font.size = Pt(16); rlof.bold = True; rlof.underline = True

doc.add_paragraph()
figures_list = [
    ("Fig. 1.1", "Perioperative anesthesia management overview", "2"),
    ("Fig. 4.1", "System architecture — React frontend, FastAPI backend, ML engine", "26"),
    ("Fig. 4.2", "Clinical workflow: preoperative to postoperative phases", "28"),
    ("Fig. 4.3", "Data Flow Diagram — Level 0 (Context Diagram)", "30"),
    ("Fig. 4.4", "Data Flow Diagram — Level 1", "31"),
    ("Fig. 4.5", "Use Case Diagram for AnesthAI SafeDose", "32"),
    ("Fig. 4.6", "Activity Diagram — clinical session lifecycle", "33"),
    ("Fig. 4.7", "Sequence Diagram — prediction request flow", "34"),
    ("Fig. 4.8", "ML Pipeline Architecture", "37"),
    ("Fig. 5.1", "Overall system methodology flowchart", "42"),
    ("Fig. 5.2", "VitalDB preprocessing pipeline", "44"),
    ("Fig. 5.3", "MIT-BIH beat extraction and feature engineering pipeline", "46"),
    ("Fig. 6.1", "ROC and Precision-Recall curves for all four verified tasks", "72"),
    ("Fig. 6.2", "Confusion matrix — Arrhythmia (LightGBM, MIT-BIH)", "68"),
    ("Fig. 6.3", "Dashboard — AnesthAI SafeDose main overview", "73"),
    ("Fig. 6.4", "Patient Clinical Profile module", "74"),
    ("Fig. 6.5", "Preoperative Assessment module", "74"),
    ("Fig. 6.6", "Clinical Recommendations Planner", "75"),
    ("Fig. 6.7", "Drug Calculator module", "75"),
    ("Fig. 6.8", "Airway Assessment module", "76"),
    ("Fig. 6.9", "Intraoperative Live OT (simulated waveforms)", "76"),
    ("Fig. 6.10", "Intraoperative Safety and Anesthesia Record", "77"),
    ("Fig. 6.11", "Postoperative PACU and Aldrete Score", "77"),
    ("Fig. 6.12", "Emergency Portal (Break-Glass access)", "78"),
    ("Fig. 6.13", "Clinical Analytics and ML Predictions", "78"),
    ("Fig. 6.14", "Admin Security Audit Log", "79"),
]

lof_tbl = doc.add_table(rows=1 + len(figures_list), cols=3)
lof_tbl.style = "Table Grid"
for i, hdr_txt in enumerate(["Figure No.", "Caption", "Page"]):
    cell = lof_tbl.rows[0].cells[i]
    cell.text = hdr_txt
    cell.paragraphs[0].runs[0].bold = True
    cell.paragraphs[0].runs[0].font.name = "Times New Roman"
    cell.paragraphs[0].runs[0].font.size = Pt(11)
for ri, (fig_no, caption, pg) in enumerate(figures_list):
    row = lof_tbl.rows[ri + 1]
    for ci, val in enumerate([fig_no, caption, pg]):
        cell = row.cells[ci]
        cell.text = val
        for run in cell.paragraphs[0].runs:
            run.font.name = "Times New Roman"; run.font.size = Pt(10)

# ══════════════════════════════════════════════════════════════════════════════
# LIST OF TABLES
# ══════════════════════════════════════════════════════════════════════════════

add_page_break(doc)
plot = doc.add_paragraph()
plot.alignment = WD_ALIGN_PARAGRAPH.CENTER
rlot = plot.add_run("LIST OF TABLES")
rlot.font.name = "Times New Roman"; rlot.font.size = Pt(16); rlot.bold = True; rlot.underline = True

doc.add_paragraph()
tables_list = [
    ("Table 2.1", "Comparative analysis of related work in perioperative ML", "13"),
    ("Table 3.1", "Comparison of existing anesthesia information systems", "17"),
    ("Table 3.2", "Functional requirements (FR1–FR12)", "20"),
    ("Table 3.3", "Hardware requirements", "22"),
    ("Table 3.4", "Software requirements", "23"),
    ("Table 4.1", "RBAC role-permission matrix", "26"),
    ("Table 4.2", "Database entity design", "35"),
    ("Table 5.1", "VitalDB dataset characteristics", "44"),
    ("Table 5.2", "MIT-BIH record-independent split", "46"),
    ("Table 5.3", "MIMIC-IV/MIMIC-IV-ED dataset summary", "48"),
    ("Table 5.4", "Feature set for VitalDB-based models", "49"),
    ("Table 5.5", "Feature set for MIT-BIH arrhythmia model", "50"),
    ("Table 5.6", "Model hyperparameters and training configuration", "51"),
    ("Table 5.7", "Holliday-Segar fluid rate calculation rules", "54"),
    ("Table 6.1", "Dataset split summary across all tasks", "65"),
    ("Table 6.2", "Independently verified ML model performance metrics", "66"),
    ("Table 6.3", "Confusion matrices — four verified tasks", "69"),
    ("Table 6.4", "Reported model results (not independently verified)", "70"),
    ("Table 7.1", "Test case table (TC-01 through TC-50)", "88"),
    ("Table 7.2", "API endpoint status summary", "91"),
]

lot_tbl = doc.add_table(rows=1 + len(tables_list), cols=3)
lot_tbl.style = "Table Grid"
for i, hdr_txt in enumerate(["Table No.", "Caption", "Page"]):
    cell = lot_tbl.rows[0].cells[i]
    cell.text = hdr_txt
    cell.paragraphs[0].runs[0].bold = True
    cell.paragraphs[0].runs[0].font.name = "Times New Roman"
    cell.paragraphs[0].runs[0].font.size = Pt(11)
for ri, (tbl_no, caption, pg) in enumerate(tables_list):
    row = lot_tbl.rows[ri + 1]
    for ci, val in enumerate([tbl_no, caption, pg]):
        cell = row.cells[ci]
        cell.text = val
        for run in cell.paragraphs[0].runs:
            run.font.name = "Times New Roman"; run.font.size = Pt(10)

# ══════════════════════════════════════════════════════════════════════════════
# LIST OF ABBREVIATIONS
# ══════════════════════════════════════════════════════════════════════════════

add_page_break(doc)
pla = doc.add_paragraph()
pla.alignment = WD_ALIGN_PARAGRAPH.CENTER
rla = pla.add_run("LIST OF ABBREVIATIONS")
rla.font.name = "Times New Roman"; rla.font.size = Pt(16); rla.bold = True; rla.underline = True

doc.add_paragraph()
abbrevs = [
    ("AIMS",    "Anesthesia Information Management System"),
    ("API",     "Application Programming Interface"),
    ("ATLS",    "Advanced Trauma Life Support"),
    ("AUC",     "Area Under the Curve"),
    ("BE",      "Bachelor of Engineering"),
    ("CORS",    "Cross-Origin Resource Sharing"),
    ("CSE",     "Computer Science and Engineering"),
    ("CNN",     "Convolutional Neural Network"),
    ("CSRF",    "Cross-Site Request Forgery"),
    ("DBP",     "Diastolic Blood Pressure"),
    ("DOCX",    "Document format for Microsoft Word"),
    ("EBV",     "Estimated Blood Volume"),
    ("ECG",     "Electrocardiogram"),
    ("EHR",     "Electronic Health Record"),
    ("EtCO2",   "End-Tidal Carbon Dioxide"),
    ("FastAPI", "Fast Application Programming Interface (Python web framework)"),
    ("F1",      "F1 Score (harmonic mean of Precision and Recall)"),
    ("GRU",     "Gated Recurrent Unit"),
    ("HistGB",  "Histogram-based Gradient Boosting (scikit-learn)"),
    ("HR",      "Heart Rate"),
    ("HTTP",    "HyperText Transfer Protocol"),
    ("ICU",     "Intensive Care Unit"),
    ("JWT",     "JSON Web Token"),
    ("KSIT",    "K.S. Institute of Technology"),
    ("LightGBM","Light Gradient Boosting Machine"),
    ("LSTM",    "Long Short-Term Memory"),
    ("MAP",     "Mean Arterial Pressure"),
    ("MIMIC",   "Medical Information Mart for Intensive Care"),
    ("ML",      "Machine Learning"),
    ("NAAC",    "National Assessment and Accreditation Council"),
    ("PBKDF2",  "Password-Based Key Derivation Function 2"),
    ("PACU",    "Post-Anesthesia Care Unit"),
    ("PONV",    "Postoperative Nausea and Vomiting"),
    ("PR-AUC",  "Precision-Recall Area Under the Curve"),
    ("RBAC",    "Role-Based Access Control"),
    ("REST",    "Representational State Transfer"),
    ("ROC",     "Receiver Operating Characteristic"),
    ("ROC-AUC", "ROC Area Under the Curve"),
    ("RR",      "Respiratory Rate"),
    ("SBP",     "Systolic Blood Pressure"),
    ("SpO2",    "Peripheral Oxygen Saturation"),
    ("SQL",     "Structured Query Language"),
    ("TN",      "True Negative"),
    ("TP",      "True Positive"),
    ("FN",      "False Negative"),
    ("FP",      "False Positive"),
    ("VAS",     "Visual Analogue Scale (pain scoring)"),
    ("VTU",     "Visvesvaraya Technological University"),
    ("WHO",     "World Health Organization"),
    ("XAI",     "Explainable Artificial Intelligence"),
]

abbr_tbl = doc.add_table(rows=1 + len(abbrevs), cols=2)
abbr_tbl.style = "Table Grid"
for ci, hdr_txt in enumerate(["Abbreviation", "Full Form"]):
    cell = abbr_tbl.rows[0].cells[ci]
    cell.text = hdr_txt
    cell.paragraphs[0].runs[0].bold = True
    cell.paragraphs[0].runs[0].font.name = "Times New Roman"
    cell.paragraphs[0].runs[0].font.size = Pt(11)
for ri, (abbr, full) in enumerate(abbrevs):
    row = abbr_tbl.rows[ri + 1]
    for ci, val in enumerate([abbr, full]):
        row.cells[ci].text = val
        for run in row.cells[ci].paragraphs[0].runs:
            run.font.name = "Times New Roman"; run.font.size = Pt(10)

print("Preliminary pages done. Saving checkpoint...")
outpath = os.path.join(BASE, "AnesthAI_SafeDose_Final_Project_Report.docx")
doc.save(outpath)
print(f"Part 1 saved: {outpath}")
