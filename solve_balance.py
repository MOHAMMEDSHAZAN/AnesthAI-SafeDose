import os
import subprocess
import pypdfium2
import numpy as np
import re

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

# Let's read the full HTML from generate_uniform_7fig_paper.py
with open('generate_uniform_7fig_paper.py', 'r', encoding='utf-8') as f:
    orig = f.read()

# Let's extract the header up to body and the footer
head_match = re.search(r'(<!DOCTYPE html>.*?</style>\s*</head>\s*<body>)', orig, re.DOTALL)
header_css = head_match.group(1)

print("Extracted header length:", len(header_css))
