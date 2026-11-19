import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's see the sections and paragraphs
pages = re.findall(r'<!-- PAGE \d+ -->.*?(?=<!-- PAGE \d+ -->|</body>)', text, re.DOTALL)
for i, page in enumerate(pages):
    print(f"==================== PAGE {i+1} ====================")
    headings = re.findall(r'<(?:h1|h2|h3)[^>]*>(.*?)</(?:h1|h2|h3)>', page)
    print("Headings:", headings)
    paras = re.findall(r'<p[^>]*>(.*?)</p>', page, re.DOTALL)
    print(f"Number of paragraphs: {len(paras)}")
    for j, p in enumerate(paras):
        clean_p = re.sub(r'<[^>]+>', '', p).strip()[:100]
        print(f"  P{j+1}: {clean_p}...")
