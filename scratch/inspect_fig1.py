from extract_pages import p2
import re

fig1_match = re.search(r'<div class="figure-box">.*?Fig\.\s*1\..*?</div>', p2, re.DOTALL)
if fig1_match:
    print(fig1_match.group(0))
