import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    orig_script = f.read()

# Let's inspect where generate_perfect_6page_html begins and ends
start_func = orig_script.find('def generate_perfect_6page_html():')
end_func = orig_script.find('def build_pdf():')

print(f"generate_perfect_6page_html is from {start_func} to {end_func}")
