import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution

with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

# Let's clean the HTML: remove figure-frame
clean_html = re.sub(r'<div class="figure-frame">\s*(<img[^>]+>)\s*</div>', r'\1', orig_html)

# Let's inspect where the section markers are
# In clean_html, we can split by sections or find where each section is
# Let's extract the actual content blocks:

# Page 1: Banner + Abstract + Intro + Sec II
# Page 2: Table I + Sec III (System Design) + Fig 1 + III-A + III-B
# Page 3: Fig 2 + Sec IV + Table II + IV-B + IV-C + IV-D
# Page 4: Table III + IV-E + Sec V + V-A + Fig 3 + V-B + V-C + V-D + Fig 4
# Page 5: V-E + Fig 5 + Sec VI + Table IV + VI-A + Table V + Fig 6 + VI-B
# Page 6: Table VI + Fig 7 + VI-C + Sec VII + Sec VIII + References

# Let's write a script to re-partition smoothly!
