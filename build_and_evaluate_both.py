import os
import subprocess
import pypdfium2
import numpy as np

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

# Load the current HTML from build_submission_final_clean.py
import build_submission_final_clean

html_clean = build_submission_final_clean.generate_perfect_6page_html()

# Let's inspect where Fig 1 to Fig 7 are
for i in range(1, 8):
    pos = html_clean.find(f"<b>Fig. {i}.</b>")
    print(f"Fig {i} found at {pos}")

