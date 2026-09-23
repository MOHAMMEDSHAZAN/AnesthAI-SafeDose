import pypdf
import re

reader = pypdf.PdfReader('AnesthAI_IEEE_Final.pdf')
assert len(reader.pages) == 6, f'Expected 6 pages, got {len(reader.pages)}'

found_issues = []

for page_idx, page in enumerate(reader.pages):
    text = page.extract_text()
    lines = text.split('\n')
    for line_idx, line in enumerate(lines):
        clean = line.strip()
        # check for standalone number line
        if clean.isdigit():
            found_issues.append(f'Page {page_idx+1} line {line_idx}: Standalone number "{clean}"')
        # check for list numbers at start of line like "1. ", "1) "
        if re.match(r'^[0-9]+[\.\)]\s+[A-Za-z]', clean):
            # check if it is part of Table III or References
            if not ('Hypotension' in clean or 'VitalDB' in clean or clean.startswith('[')):
                found_issues.append(f'Page {page_idx+1} line {line_idx}: Potential leading list number "{clean[:50]}"')

print('Verification Results:')
if found_issues:
    for issue in found_issues:
        print('  ISSUE:', issue)
else:
    print('  PERFECT! Zero standalone numbers and zero unwanted leading list markers found across all 6 pages!')

# Verify key elements
full_text = '\n'.join([p.extract_text() for p in reader.pages])
checks = [
    ('I. INTRODUCTION', 'I. Introduction'),
    ('II. LITERATURE SURVEY', 'II. Literature Survey'),
    ('III. SYSTEM DESIGN', 'III. System Design'),
    ('IV. DATASETS', 'IV. Datasets'),
    ('V. CLINICAL CALCULATION', 'V. Clinical Calculation'),
    ('VI. RESULTS', 'VI. Results'),
    ('VII. LIMITATIONS', 'VII. Limitations'),
    ('VIII. CONCLUSION', 'VIII. Conclusion'),
    ('Fig. 1.', 'Figure 1'),
    ('Fig. 2.', 'Figure 2'),
    ('Fig. 3.', 'Figure 3'),
    ('Fig. 4.', 'Figure 4'),
    ('Fig. 5.', 'Figure 5'),
    ('Fig. 6.', 'Figure 6'),
    ('Fig. 7.', 'Figure 7'),
    ('Table I:', 'Table I'),
    ('Table II:', 'Table II'),
    ('Table III:', 'Table III'),
    ('Table IV:', 'Table IV'),
    ('Table V:', 'Table V'),
    ('Table VI:', 'Table VI'),
    ('[1]', 'Reference 1'),
    ('[25]', 'Reference 25'),
    ('VitalDB', 'VitalDB'),
    ('MIT-BIH', 'MIT-BIH'),
    ('MIMIC-IV', 'MIMIC-IV'),
    ('Janmahasatian', 'Janmahasatian'),
    ('85.62%', 'MIT-BIH accuracy'),
    ('92.01%', 'MIT-BIH sensitivity'),
]

for pattern, label in checks:
    assert pattern.lower() in full_text.lower(), f'Missing {label}: {pattern}'

print('All 29 critical IEEE structural, architectural, clinical, and experimental markers verified!')
