import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution
from extract_pages import p1, p2, p3, p4, p5, p6

# Test Fig 1 spanning on Page 2
# In p2, replace Fig 1 with column-span: all
p2_span_fig1 = re.sub(
    r'<div class="figure-box">\s*(<img[^>]+fig1_architecture_submission\.png[^>]+>)\s*<div class="caption">',
    r'<div class="figure-box" style="column-span: all; margin: 3px 0 2px 0;">\n  \1\n  <div class="caption">',
    p2
)

# Also test with Fig 2, Fig 4, Fig 6 spanning
p3_span = re.sub(
    r'<div class="figure-box">\s*(<img[^>]+fig2_workflow\.png[^>]+>)\s*<div class="caption">',
    r'<div class="figure-box" style="column-span: all; margin: 3px 0 2px 0;">\n  \1\n  <div class="caption">',
    p3
)

p4_span_fig4 = re.sub(
    r'<div class="figure-box">\s*(<img[^>]+fig4_live_ot\.png[^>]+>)\s*<div class="caption">',
    r'<div class="figure-box" style="column-span: all; margin: 3px 0 2px 0;">\n  \1\n  <div class="caption">',
    p4
)

p5_span = re.sub(
    r'<div class="figure-box">\s*(<img[^>]+fig4_roc_pr_curves\.png[^>]+>)\s*<div class="caption">',
    r'<div class="figure-box" style="column-span: all; margin: 3px 0 2px 0;">\n  \1\n  <div class="caption">',
    p5
)

print("Testing Fig 1 spanning on Page 2...")
res = test_distribution([p1, p2_span_fig1, p3_span, p4_span_fig4, p5_span, p6], 'test_span_all_wide')
