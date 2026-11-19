import re
from extract_pages import p5

for line in p5.split('\n'):
    if 'VI.' in line or 'Results' in line:
        print(line)
