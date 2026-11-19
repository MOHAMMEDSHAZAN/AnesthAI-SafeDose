import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def run_test():
    with open('test_build_770.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Let's inspect where Section V-E and Fig 5 are on Page 5
    # Section V-E block:
    ve_block_match = re.search(r'(<h3 class="subsec-heading"[^>]*>E\. Security.*?</div>\s*</div>)', content, re.DOTALL)
    if not ve_block_match:
        print("ve_block not matched by regex, searching manually...")
        p5_idx = content.find('<!-- PAGE 5 -->')
        sec6_idx = content.find('<h2 class="sec-heading">VI. Results and Evaluation</h2>')
        ve_block = content[content.find('<h3', p5_idx):sec6_idx]
    else:
        ve_block = ve_block_match.group(1)

    print("Found ve_block len:", len(ve_block))

if __name__ == '__main__':
    run_test()
