import re

with open('generate_uniform_7fig_paper.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's see what is inside page-1, page-2, page-3, page-4, page-5, page-6
pages = re.findall(r'<div class="page" id="page-(\d+)">(.*?)</div>\s*(?=(?:<!-- PAGE|<div class="page"|</body>))', text, re.DOTALL)
print(f"Extracted {len(pages)} pages.")

for p_num, p_content in pages:
    with open(f'page_{p_num}_content.html', 'w', encoding='utf-8') as pf:
        pf.write(p_content.strip())
    print(f"Page {p_num}: length={len(p_content)} chars")
