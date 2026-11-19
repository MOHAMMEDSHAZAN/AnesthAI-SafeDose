import re
import sys
sys.path.append(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch')
from test_dist_runner import test_distribution
from extract_pages import p1, p2, p3, p4, p5, p6

# Let's inspect where Fig 2 is in p3
fig2_match = re.search(r'(<div class="figure-box">.*?Fig\.\s*2\..*?</div>\s*</div>)', p3, re.DOTALL)
if fig2_match:
    fig2 = fig2_match.group(1)
    p3_no_fig2 = p3.replace(fig2, '')
    p2_with_fig2 = p2 + '\n' + fig2
    print('Testing moving Fig 2 to Page 2...')
    res = test_distribution([p1, p2_with_fig2, p3_no_fig2, p4, p5, p6], 'test_move_fig2_to_p2')
else:
    print('Fig 2 not matched!')
