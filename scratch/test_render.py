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

# Let's inspect where html is generated
# We will create a test script that updates the references, in-text citations, and font styles
