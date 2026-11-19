import os
import pypdfium2 as pdfium
import numpy as np

# Let's inspect the exact lines and text blocks on Page 4 and Page 5
with open('test_perfect_balance.py', 'r', encoding='utf-8') as f:
    text = f.read()

p4 = text.split('<!-- PAGE 4 -->')[1].split('<!-- PAGE 5 -->')[0]
p5 = text.split('<!-- PAGE 5 -->')[1].split('<!-- PAGE 6 -->')[0]

print('Length of Page 4 HTML:', len(p4))
print('Length of Page 5 HTML:', len(p5))
