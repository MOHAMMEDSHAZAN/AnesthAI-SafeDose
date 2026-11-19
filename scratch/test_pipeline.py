import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

# Load build_submission_final_6page.py
with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's inspect the ref-list in build_submission_final_6page.py
old_ref_start = code.find('<ul class="ref-list">')
old_ref_end = code.find('</ul>', old_ref_start) + 5
print(f"Old ref list found from {old_ref_start} to {old_ref_end}")
