import os
import subprocess
import pypdfium2

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

with open('build_submission_final_clean.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's test Strategy A: All 7 figures are two-column wide (column-span: all)
# with identical frame: width: 100%, height: 1.85in
# Let's replace the figures in text with a standardized wrapper
fig_frame_css = """
  .figure-box {
    text-align: center;
    margin: 2px 0 1.5px 0;
    break-inside: avoid;
  }
  .figure-frame-uniform {
    width: 100%;
    height: 1.85in;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    margin: 0 auto;
  }
  .figure-frame-uniform img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border: 0.5px solid #888;
    border-radius: 2px;
  }
"""

print("Preparing test for 7 two-column figures...")
