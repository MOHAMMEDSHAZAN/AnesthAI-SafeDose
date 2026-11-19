import re

html_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

pages = re.findall(r'<div class="page"[^>]*>(.*?)</div>\s*(?=<div class="page"|</body>)', html, re.DOTALL)
print(f'Total pages in HTML: {len(pages)}')

for i, p in enumerate(pages):
    # Find headings and figures inside each page
    headings = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', p)
    figures = re.findall(r'<b>(Fig\.\s*\d+[^<]*)</b>', p)
    tables = re.findall(r'<b>(TABLE\s+[I|V|X]+[^<]*)</b>', p)
    print(f'=== Page {i+1} ===')
    print('  Headings:', headings)
    print('  Figures:', figures)
    print('  Tables:', tables)
    print('  Char length:', len(p))
