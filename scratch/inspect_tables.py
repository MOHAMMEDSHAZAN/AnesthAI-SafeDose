import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.findall(r'<!-- PAGE \d+ -->.*?(?=<!-- PAGE \d+ -->|</body>)', text, re.DOTALL)
for i, page in enumerate(pages):
    print(f"=== PAGE {i+1} ===")
    tbl_matches = list(re.finditer(r'(<div[^>]*table-title[^>]*>.*?</div>\s*<table.*?</table>)', page, re.DOTALL))
    if not tbl_matches:
        tbl_matches = list(re.finditer(r'(<table.*?</table>)', page, re.DOTALL))
    print(f"Found {len(tbl_matches)} tables on page {i+1}")
    for tm in tbl_matches:
        snippet = tm.group(1)[:200].replace('\n', ' ')
        print(f"  Snippet: {snippet}...")
