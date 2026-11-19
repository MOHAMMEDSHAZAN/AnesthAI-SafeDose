import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

# Let's inspect where the page boundaries are in test_build.py
with open('test_build.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's see the page splits
pages = text.split('<!-- PAGE ')
print(f"Total parts: {len(pages)}")
for i in range(1, len(pages)):
    num = pages[i][:2].strip()
    print(f"Part {i}: Page {num}, length: {len(pages[i])}")
