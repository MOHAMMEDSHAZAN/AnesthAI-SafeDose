import re

with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Split by <div class="page"
pages = html.split('<div class="page"')

for i in range(1, len(pages)):
    p_content = pages[i]
    print(f'============================== PAGE {i} ==============================')
    items = re.findall(r'(<h[1234][^>]*>.*?</h[1234]>|<div class="table-title">.*?</div>|<div class="caption">.*?</div>)', p_content)
    for it in items:
        clean = re.sub('<[^<]+?>', '', it)
        print('  *', clean.strip())
