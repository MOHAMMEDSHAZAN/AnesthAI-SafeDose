import re

with open('test_perfect_balance.py', 'r', encoding='utf-8') as f:
    text = f.read()

ref_match = re.search(r'<ul class="ref-list">(.*?)</ul>', text, re.DOTALL)
if ref_match:
    refs_html = ref_match.group(1)
    items = re.findall(r'<li>(.*?)</li>', refs_html, re.DOTALL)
    print(f"Total references: {len(items)}")
    for i, item in enumerate(items):
        # check year
        years = re.findall(r'\b(2023|2024|2025)\b', item)
        # check IEEE
        has_ieee = 'IEEE' in item
        # check doi
        has_doi = '10.1109/' in item
        print(f"[{i+1}] Year: {years} | IEEE: {has_ieee} | DOI: {has_doi}")
        if not years or not has_ieee:
            print(f"   WARNING in Ref [{i+1}]: {item}")
else:
    print("Could not find ref-list in text!")
