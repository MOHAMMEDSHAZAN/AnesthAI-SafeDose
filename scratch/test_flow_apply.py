import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def apply_flow():
    with open('test_build_770.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Locate ve_block in Page 5
    p5_idx = content.find('<!-- PAGE 5 -->')
    sec6_heading = '<h2 class="sec-heading">VI. Results and Evaluation</h2>'
    sec6_idx = content.find(sec6_heading)
    h3_idx = content.find('<h3 class="subsec-heading"', p5_idx)
    ve_block = content[h3_idx:sec6_idx]

    # Remove ve_block from Page 5
    content = content[:h3_idx] + content[sec6_idx:]

    # Add ve_block to bottom of Page 4 (before </div>\n</div>\n\n<!-- PAGE 5 -->)
    p4_close_idx = content.find('</div>\n</div>\n\n<!-- PAGE 5 -->')
    content = content[:p4_close_idx] + ve_block + "\n  " + content[p4_close_idx:]

    # Locate Section VI-B text on Page 6
    p6_idx = content.find('<!-- PAGE 6 -->')
    vib_heading = '<h3 class="subsec-heading" style="margin-top: 0;">B. Authentic MIT-BIH Revalidation and Confusion Matrix</h3>'
    tbl6_idx = content.find('<table class="ieee-table"', p6_idx)
    vib_idx = content.find(vib_heading)
    vib_text = content[vib_idx:tbl6_idx]

    # Remove vib_text from Page 6
    content = content[:vib_idx] + content[tbl6_idx:]

    # Add vib_text to Page 5 after Fig 6 (before </div>\n</div>\n\n<!-- PAGE 6 -->)
    p5_close_idx = content.find('</div>\n</div>\n\n<!-- PAGE 6 -->')
    content = content[:p5_close_idx] + vib_text + "\n  " + content[p5_close_idx:]

    with open('test_build_flow.py', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Running test_build_flow.py...")
    res = subprocess.run(['python', 'test_build_flow.py'], capture_output=True, text=True)
    print("STDOUT:\n", res.stdout)
    if res.stderr:
        print("STDERR:\n", res.stderr)

if __name__ == '__main__':
    apply_flow()
