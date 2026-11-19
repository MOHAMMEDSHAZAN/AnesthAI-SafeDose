import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def build_perfect_layout():
    # Let's inspect test_build.py
    with open('test_build.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Let's write a python script that assembles the exact 6 pages cleanly
    print("Testing layout script...")

if __name__ == '__main__':
    build_perfect_layout()
