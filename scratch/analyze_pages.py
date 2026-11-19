import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.findall(r'<!-- PAGE \d+ -->.*?(?=<!-- PAGE \d+ -->|</body>)', text, re.DOTALL)
print(f'Total pages found: {len(pages)}')
for i, p in enumerate(pages):
    tbls = re.findall(r'<table[^>]*>', p)
    print(f'Page {i+1}: length {len(p)} chars, tables: {len(tbls)}')
    for t in re.findall(r'Table [IVXLCDM]+:[^<\n]+', p):
        print(f'   {t}')
