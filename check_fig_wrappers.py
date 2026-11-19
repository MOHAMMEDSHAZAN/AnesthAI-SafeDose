import os
import subprocess
import pypdfium2
import numpy as np

with open('build_submission_final_clean.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect where the figures are in build_submission_final_clean.py
# Fig 1 is currently column-span: all
# Fig 2 is currently column-span: all
# Fig 3 is inside a column
# Fig 4 is inside a column
# Fig 5 is inside a column
# Fig 6 is column-span: all
# Fig 7 is inside a column

print("Checking figure wrappers in build_submission_final_clean.py...")
