import re

html_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Split by <div class="page"
pages_raw = html.split('<div class="page"')
print(f'Pages found: {len(pages_raw) - 1}')

for idx, p in enumerate(pages_raw[1:], 1):
    id_match = re.search(r'id="([^"]+)"', p)
    pid = id_match.group(1) if id_match else f'page-{idx}'
    # extract h2, h3, tables, figures
    items = []
    for line in p.split('\n'):
        line_s = line.strip()
        if '<h2' in line_s or '<h3' in line_s:
            items.append(re.sub('<[^<]+?>', '', line_s))
        elif 'class="figure-box"' in line_s or 'figure-frame' in line_s:
            # find which figure
            fig_m = re.search(r'Fig\.\s*\d+', p)
        elif 'TABLE' in line_s and ('<b>' in line_s or 'table-title' in line_s):
            items.append(re.sub('<[^<]+?>', '', line_s))
    # find all captions in this page
    caps = re.findall(r'<b>(Fig\.\s*\d+[^<]*)</b>', p)
    for c in caps:
        items.append(c)
    print(f'=== {pid} ===')
    for it in items:
        print(f'   - {it}')
