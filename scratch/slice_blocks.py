import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution

with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    orig = f.read()

# Remove figure-frame wrapper
clean = re.sub(r'<div class="figure-frame">\s*(<img[^>]+>)\s*</div>', r'\1', orig)

# Let's extract the exact page contents inside .two-col for each page
def extract_inner(html_str, page_id):
    pattern = rf'<div class="page" id="{page_id}">\s*(.*?)\s*</div>\s*(?=<!-- PAGE|<div class="page"|</body>)'
    m = re.search(pattern, html_str, re.DOTALL)
    if not m:
        raise ValueError(f"Could not find {page_id}")
    inner = m.group(1)
    # If it contains banner on page 1, handle it
    return inner

p1_raw = extract_inner(clean, 'page-1')
p2_raw = extract_inner(clean, 'page-2')
p3_raw = extract_inner(clean, 'page-3')
p4_raw = extract_inner(clean, 'page-4')
p5_raw = extract_inner(clean, 'page-5')
p6_raw = extract_inner(clean, 'page-6')

print("All raw pages extracted successfully.")

# On Page 4, find Table III, IV-E, Sec V intro, Sec V-A
# Let's see what is inside p4_raw:
# It starts with: <div class="two-col"> ...
# Inside p4_raw:
# <div style="margin: 2.0px 0;">\s*<div class="table-title">Table III...
# Let's split p4_raw into parts:
# part A: Table III + IV-E + Sec V + Sec V-A
# part B: Fig 3 onwards
