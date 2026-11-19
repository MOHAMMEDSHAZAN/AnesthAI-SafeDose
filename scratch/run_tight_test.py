import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def run_test():
    with open('test_build.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Let's adjust CSS for Page 6 and tables to ensure all 25 references fit cleanly
    # 1. Update .ref-list li spacing
    content = re.sub(r'\.ref-list li\s*\{{[^}}]*\}}',
                     f""".ref-list li {{{{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: 8.0pt;
    line-height: 1.07;
    margin-bottom: 1.2px;
    text-indent: -1.2em;
    padding-left: 1.2em;
  }}}}""", content)

    # 2. Adjust paragraph margin and line height slightly
    content = content.replace('line-height: 1.12;\n    color: #000;', 'line-height: 1.095;\n    color: #000;')
    content = content.replace('margin-bottom: 2.2px;\n    text-indent: 1.1em;', 'margin-bottom: 1.6px;\n    text-indent: 1.1em;')

    # 3. Adjust table padding
    content = content.replace('padding: 0.9px 1.6px;', 'padding: 0.7px 1.4px;')

    # 4. On Page 6, ensure figure-box has minimal margin
    content = content.replace('<div class="figure-box" style="margin: 2px 0;">', '<div class="figure-box" style="margin: 1px 0;">')

    with open('test_build.py', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Executing test_build.py...")
    res = subprocess.run(['python', 'test_build.py'], capture_output=True, text=True)
    print("STDOUT:\n", res.stdout)
    if res.stderr:
        print("STDERR:\n", res.stderr)

if __name__ == '__main__':
    run_test()
