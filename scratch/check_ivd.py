import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

with open('test_build.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect where IV-D starts and ends
# In Page 4:
p4_start = text.find('<!-- PAGE 4 -->')
p5_start = text.find('<!-- PAGE 5 -->')
p6_start = text.find('<!-- PAGE 6 -->')

# Let's inspect Section IV-D in Page 4
iv_d_text = text[text.find('<h3 class="subsec-heading" style="margin-top: 0;">D. Operational Machine Learning Architectures</h3>'):text.find('<h3 class="subsec-heading">E. Explainable AI (XAI) Attribution</h3>')]
print("IV-D len:", len(iv_d_text))
