import pypdf
import re

reader = pypdf.PdfReader('anesth_ai_ieee/output/AnesthAI_IEEE_Final.pdf')
print('Page count:', len(reader.pages))

full_text = ''
for i, page in enumerate(reader.pages):
    t = page.extract_text()
    full_text += f'\n--- PAGE {i+1} ---\n' + t

# 1. Check prohibited product name
if 'AnesthAI SafeDose' in full_text:
    print('FAIL: Found AnesthAI SafeDose')
else:
    print('PASS: No AnesthAI SafeDose')

# 2. Check forbidden claims
forbidden = [
    'clinically proven',
    'clinically validated',
    'hospital deployed',
    'autonomous drug',
    'fully automated anesthesia',
    'replacement for anesthesiologist',
    '15 Clinical Prediction Models',
    '9 Clinical Outcomes',
]
for term in forbidden:
    if term.lower() in full_text.lower():
        print(f'FAIL: Found forbidden term "{term}"')
    else:
        print(f'PASS: No "{term}"')

# Exact phrase "Patient is safe" check (as an assertion)
if re.search(r'\bpatient is safe\b', full_text, re.I):
    # Check context
    matches = re.findall(r'.{0,40}patient is safe.{0,40}', full_text, re.I)
    print(f'Context for "patient is safe": {matches}')

# 3. Check model counts
print('Count of "ten production":', len(re.findall(r'ten production', full_text, re.I)))

# 4. Check numbers from Table III
checks = [
    ('Hypotension accuracy', '69.88%'),
    ('Hypotension ROC', '0.6974'),
    ('Hypoxia accuracy', '98.67%'),
    ('Hypoxia ROC', '0.9047'),
    ('Bradycardia accuracy', '77.48%'),
    ('Bradycardia ROC', '0.6448'),
    ('Tachycardia accuracy', '67.73%'),
    ('Tachycardia ROC', '0.6980'),
    ('Arrhythmia accuracy', '85.62%'),
    ('Arrhythmia ROC', '0.9414'),
    ('Arrhythmia PR-AUC', '0.9494'),
    ('Emergency Severity ROC', '0.6657'),
    ('Blood Loss ROC', '0.8349'),
    ('Fluid Recommendation ROC', '0.8687'),
    ('ICU Admission ROC', '0.8814'),
    ('Mortality ROC', '0.8663'),
    ('Mortality accuracy', '97.38%'),
    ('Brier hypotension', '0.1924'),
    ('Brier arrhythmia', '0.0613'),
    ('MIT-BIH TN', '9,202'),
    ('MIT-BIH FP', '1,981'),
    ('MIT-BIH FN', '467'),
    ('MIT-BIH TP', '5,376')
]

all_passed = True
for name, val in checks:
    if val in full_text:
        print(f'PASS: Found {name} ({val})')
    else:
        print(f'FAIL: Missing {name} ({val})')
        all_passed = False

print(f'\nOVERALL NUMERICAL AUDIT: {"PASS" if all_passed else "FAIL"}')
