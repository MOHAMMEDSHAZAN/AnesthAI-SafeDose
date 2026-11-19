import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def test_font_size(pt_size):
    with open('test_build.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Update body, p, table th/td, ref-list font size to pt_size
    pt_str = f"{pt_size:.2f}pt"
    content = re.sub(r'font-size:\s*[\d\.]+pt;', f'font-size: {pt_str};', content)

    # Keep h1, h2, h3, captions as they are
    # Write to a temporary file
    temp_file = f'test_build_{pt_size}.py'
    with open(temp_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\n--- Testing font size: {pt_str} ---")
    res = subprocess.run(['python', temp_file], capture_output=True, text=True)
    if os.path.exists(temp_file):
        os.remove(temp_file)

    for line in res.stdout.split('\n'):
        if 'Page 6:' in line or 'EXACT 6 PAGES' in line:
            print(" ", line)

if __name__ == '__main__':
    for size in [7.5, 7.6, 7.7, 7.8]:
        test_font_size(size)
