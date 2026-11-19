import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution
from extract_pages import p1, p2, p3, p4, p5, p6

# Let's test making Fig 2 span all on Page 3
# In p3, replace the figure-box for Fig 2 with column-span: all
p3_span = re.sub(
    r'<div class="figure-box">\s*(<img[^>]+fig2_workflow\.png[^>]+>)\s*<div class="caption">',
    r'<div class="figure-box" style="column-span: all; margin: 3px 0 2px 0;">\n  \1\n  <div class="caption">',
    p3
)

# In p5, replace Fig 6 with column-span: all
p5_span = re.sub(
    r'<div class="figure-box">\s*(<img[^>]+fig4_roc_pr_curves\.png[^>]+>)\s*<div class="caption">',
    r'<div class="figure-box" style="column-span: all; margin: 3px 0 2px 0;">\n  \1\n  <div class="caption">',
    p5
)

print("Running test_spanning_figures...")
res = test_distribution([p1, p2, p3_span, p4, p5_span, p6], 'test_spanning_figures')
