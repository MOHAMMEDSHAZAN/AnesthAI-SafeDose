import os
import subprocess
import pypdfium2
import numpy as np

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

# Let's inspect the current HTML generator and create test harnesses
print("Edge path:", edge_path)
