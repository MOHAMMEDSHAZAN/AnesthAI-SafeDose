import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution

with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    orig = f.read()

# Remove figure-frame wrapper
clean = re.sub(r'<div class="figure-frame">\s*(<img[^>]+>)\s*</div>', r'\1', orig)

# Let's extract the blocks cleanly
# We will create an automated tester that tests moving blocks between pages

# Extract Page 1
p1_match = re.search(r'<div class="page" id="page-1">(.*?)</div>\s*<!-- PAGE 2 -->', clean, re.DOTALL)
p1 = p1_match.group(1)

# Extract Page 2
p2_match = re.search(r'<div class="page" id="page-2">(.*?)</div>\s*<!-- PAGE 3 -->', clean, re.DOTALL)
p2 = p2_match.group(1)

# Extract Page 3
p3_match = re.search(r'<div class="page" id="page-3">(.*?)</div>\s*<!-- PAGE 4 -->', clean, re.DOTALL)
p3 = p3_match.group(1)

# Extract Page 4
p4_match = re.search(r'<div class="page" id="page-4">(.*?)</div>\s*<!-- PAGE 5 -->', clean, re.DOTALL)
p4 = p4_match.group(1)

# Extract Page 5
p5_match = re.search(r'<div class="page" id="page-5">(.*?)</div>\s*<!-- PAGE 6 -->', clean, re.DOTALL)
p5 = p5_match.group(1)

# Extract Page 6
p6_match = re.search(r'<div class="page" id="page-6">(.*?)</div>\s*</body>', clean, re.DOTALL)
p6 = p6_match.group(1)

print('All 6 pages cleanly extracted!')
