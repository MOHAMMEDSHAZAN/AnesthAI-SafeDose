import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution

with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

# Extract the 6 page inner contents
# Each page is: <div class="page" id="page-X"> ... </div>
pages_raw = orig_html.split('<div class="page"')

page_contents = []
for p in pages_raw[1:]:
    # remove the closing </div> of .page at the end
    # find id="..."
    content = p.split('>', 1)[1]
    # find the last </div>
    last_div = content.rfind('</div>')
    content = content[:last_div]
    # Remove figure-frame divs, keep img
    content = re.sub(r'<div class="figure-frame">\s*(<img[^>]+>)\s*</div>', r'\1', content)
    page_contents.append(content)

print(f'Extracted {len(page_contents)} pages. Running test_natural_figures...')
res = test_distribution(page_contents, 'test_natural_figures')
