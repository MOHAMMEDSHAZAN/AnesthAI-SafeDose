import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.findall(r'<!-- PAGE \d+ -->.*?(?=<!-- PAGE \d+ -->|</body>)', text, re.DOTALL)
for i in range(len(pages)):
    print(f"Page {i+1} has {len(pages[i])} chars")
