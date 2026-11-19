import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    text = f.read()

ref_idx = text.find('<h2 class="sec-heading">References')
body_text = text[:ref_idx]

# Find all citations and their line context
lines = body_text.split('\n')
for idx, line in enumerate(lines):
    matches = re.findall(r'\[\d+\]', line)
    if matches:
        print(f"Line {idx+1}: {matches} -> {line.strip()[:140]}")
