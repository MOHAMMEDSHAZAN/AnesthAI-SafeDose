import re

with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    html = f.read()

# find all table occurrences and their parent containers
matches = re.finditer(r'<table[^>]*>', html)
for m in matches:
    start = max(0, m.start() - 300)
    end = min(len(html), m.end() + 100)
    print('--- TABLE CONTEXT ---')
    print(html[start:end])
