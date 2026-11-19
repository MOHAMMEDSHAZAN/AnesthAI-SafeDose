import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image

with open('test_build.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Set font size 7.70pt across all normal text elements
pt_str = "7.70pt"
content = re.sub(r'font-size:\s*[\d\.]+pt;', f'font-size: {pt_str};', content)

# But restore title, section headings, table title, captions font sizes
content = content.replace(f'h1.paper-title {{{{ font-size: {pt_str};', 'h1.paper-title {{ font-size: 16.0pt;')
content = content.replace(f'h2.sec-heading {{{{ font-size: {pt_str};', 'h2.sec-heading {{ font-size: 8.6pt;')
content = content.replace(f'h3.subsec-heading {{{{ font-size: {pt_str};', 'h3.subsec-heading {{ font-size: 8.2pt;')
content = content.replace(f'.caption {{{{ font-size: {pt_str};', '.caption {{ font-size: 7.0pt;')
content = content.replace(f'.table-title {{{{ font-size: {pt_str};', '.table-title {{ font-size: 7.5pt;')

with open('test_build_770.py', 'w', encoding='utf-8') as f:
    f.write(content)

res = subprocess.run(['python', 'test_build_770.py'], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
