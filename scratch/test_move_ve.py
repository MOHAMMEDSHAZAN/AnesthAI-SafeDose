import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution
from extract_pages import p1, p2, p3, p4, p5, p6

# Let's inspect p4 and p5
# On Page 4:
# Currently p4 has: Table III, IV-E, Sec V, Sec V-A, Fig 3, Sec V-B, Sec V-C, Sec V-D, Fig 4
# In p5:
# starts with: Sec V-E + Fig 5 + Sec VI intro + Table IV ...
# Let's move Sec V-E + Fig 5 from p5 to p4!

# In p5, find where Sec VI starts
sec6_pos = p5.find('<h2 class="sec-heading">VI. Results and Evaluation</h2>')
ve_fig5_content = p5[p5.find('>')+1 : sec6_pos].strip()

# Add ve_fig5_content into p4 before the closing </div> of .two-col
p4_last_div = p4.rfind('</div>')
new_p4 = p4[:p4_last_div] + '\n' + ve_fig5_content + '\n</div>'

# New p5 starts with Sec VI intro
new_p5 = '<div class="two-col">\n' + p5[sec6_pos : p5.rfind('</div>')].strip() + '\n</div>'

# Also let's keep Fig 1 spanning on Page 2, Fig 2 spanning on Page 3
p2_span_fig1 = re.sub(
    r'<div class="figure-box">\s*(<img[^>]+fig1_architecture_submission\.png[^>]+>)\s*<div class="caption">',
    r'<div class="figure-box" style="column-span: all; margin: 3px 0 2px 0;">\n  \1\n  <div class="caption">',
    p2
)

p3_span_fig2 = re.sub(
    r'<div class="figure-box">\s*(<img[^>]+fig2_workflow\.png[^>]+>)\s*<div class="caption">',
    r'<div class="figure-box" style="column-span: all; margin: 3px 0 2px 0;">\n  \1\n  <div class="caption">',
    p3
)

# In new_p5, what about Fig 6?
# Let's see how new_p5 measures first
print("Testing moving V-E and Fig 5 to Page 4...")
res = test_distribution([p1, p2_span_fig1, p3_span_fig2, new_p4, new_p5, p6], 'test_move_ve_fig5')
