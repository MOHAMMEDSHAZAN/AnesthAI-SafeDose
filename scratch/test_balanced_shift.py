import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution
from slice_blocks import p1_raw, p2_raw, p3_raw, p4_raw, p5_raw, p6_raw

# 1. Page 3 modification:
# In p4_raw, find the figure-box for Fig 3
fig3_pos = p4_raw.find('<!-- FIGURE 3')
if fig3_pos == -1:
    fig3_pos = p4_raw.find('<div class="figure-box">\n  <img src="C:/Users/moham/OneDrive/Desktop/Anasthesia Antigravity/anesth_ai_ieee/figures_polished/fig3_dose_calculator.png"')

# The part of p4 before Fig 3 is: Table III + IV-E + Sec V + Sec V-A
p4_pre_fig3 = p4_raw[p4_raw.find('>')+1 : fig3_pos].strip()

# Append this into p3_raw before the closing </div> of .two-col
# In p3_raw, find the last </div>
p3_last_div = p3_raw.rfind('</div>')
new_p3 = p3_raw[:p3_last_div] + '\n' + p4_pre_fig3 + '\n</div>'

# 2. Page 4 modification:
# Page 4 starts with Fig 3 up to the end of p4_raw (Fig 4), PLUS from p5_raw: V-E + Fig 5 + Sec VI intro!
# In p5_raw, find Table IV
tbl4_pos = p5_raw.find('<div style="column-span: all; margin: 2px 0;">\n      <div class="table-title">Table IV:')
p5_pre_tbl4 = p5_raw[p5_raw.find('>')+1 : tbl4_pos].strip()

p4_content = p4_raw[fig3_pos : p4_raw.rfind('</div>')].strip()
new_p4 = '<div class="two-col">\n' + p4_content + '\n' + p5_pre_tbl4 + '\n</div>'

# 3. Page 5 modification:
# Page 5 starts with Table IV up to VI-B, PLUS VI-C from Page 6!
# In p6_raw, find where VI-C starts
vic_pos = p6_raw.find('<h3 class="subsec-heading">C. Probability Calibration and Clinical Utility</h3>')
# find where VI-C ends (Sec VII)
sec7_pos = p6_raw.find('<h2 class="sec-heading">VII. Limitations and Future Work</h2>')

vic_content = p6_raw[vic_pos : sec7_pos].strip()

p5_content = p5_raw[tbl4_pos : p5_raw.rfind('</div>')].strip()
new_p5 = '<div class="two-col">\n' + p5_content + '\n' + vic_content + '\n</div>'

# 4. Page 6 modification:
# Page 6 has Table VI + Fig 7 + discussion, and then Sec VII + Sec VIII + References!
p6_part1 = p6_raw[p6_raw.find('>')+1 : vic_pos].strip()
p6_part2 = p6_raw[sec7_pos : p6_raw.rfind('</div>')].strip()
new_p6 = '<div class="two-col">\n' + p6_part1 + '\n' + p6_part2 + '\n</div>'

print("Running test_balanced_shift...")
res = test_distribution([p1_raw, p2_raw, new_p3, new_p4, new_p5, new_p6], 'test_balanced_shift')
