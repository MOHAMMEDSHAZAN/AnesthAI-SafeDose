import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def run_cascade():
    with open('test_build.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Let's extract the text of each page between <!-- PAGE X --> and <!-- PAGE X+1 -->
    parts = re.split(r'<!-- PAGE \d+ -->', content)
    header = parts[0] # everything up to PAGE 1
    page1 = parts[1]
    page2 = parts[2]
    page3 = parts[3]
    page4 = parts[4]
    page5 = parts[5]
    page6 = parts[6]

    print("Header len:", len(header))
    print("Page 1 len:", len(page1))
    print("Page 2 len:", len(page2))
    print("Page 3 len:", len(page3))
    print("Page 4 len:", len(page4))
    print("Page 5 len:", len(page5))
    print("Page 6 len:", len(page6))

if __name__ == '__main__':
    run_cascade()
