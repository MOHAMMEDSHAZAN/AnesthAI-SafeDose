with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'class="page"' in l or "class='page'" in l or 'id="page' in l:
        print(f'Line {i+1}: {l.strip()[:100]}')
