import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution
from slice_blocks import p1_raw, p2_raw, p3_raw, p4_raw, p5_raw, p6_raw

# Let's inspect all section headings and elements to create modular blocks
all_html = p1_raw + '\n' + p2_raw + '\n' + p3_raw + '\n' + p4_raw + '\n' + p5_raw + '\n' + p6_raw

# We can test moving Table IV and Sec VI-A to Page 4, Table V to Page 5, etc.
# Let's see what is inside test_balanced_shift:
# new_p3 was: p3_raw (without closing div) + Table III + IV-E + Sec V + Sec V-A + closing div
# new_p4 was: Fig 3 + V-B + V-C + V-D + Fig 4 + V-E + Fig 5 + Sec VI intro

# In p5_raw, let's find Table IV, Sec VI-A, Table V, Fig 6, VI-B
tbl4_pos = p5_raw.find('<div style="column-span: all; margin: 2px 0;">\n      <div class="table-title">Table IV:')
sec6a_pos = p5_raw.find('<h3 class="subsec-heading">A. Production Model Optimization and Benchmarking</h3>')
tbl5_pos = p5_raw.find('<div style="column-span: all; margin: 2px 0;">\n      <div class="table-title">Table V:')
fig6_pos = p5_raw.find('<div class="figure-box">\n  <img src="C:/Users/moham/OneDrive/Desktop/Anasthesia Antigravity/anesth_ai_ieee/figures_polished/fig4_roc_pr_curves.png"')
sec6b_pos = p5_raw.find('<h3 class="subsec-heading">B. Authentic MIT-BIH Revalidation and Confusion Matrix</h3>')

# From p6_raw:
# Table VI is at the start of p6_raw
# Fig 7 is next
# Discussion is next
# VI-C starts at vic_pos
vic_pos = p6_raw.find('<h3 class="subsec-heading">C. Probability Calibration and Clinical Utility</h3>')
sec7_pos = p6_raw.find('<h2 class="sec-heading">VII. Limitations and Future Work</h2>')

print("tbl4_pos:", tbl4_pos)
print("sec6a_pos:", sec6a_pos)
print("tbl5_pos:", tbl5_pos)
print("fig6_pos:", fig6_pos)
print("sec6b_pos:", sec6b_pos)
print("vic_pos:", vic_pos)
print("sec7_pos:", sec7_pos)
