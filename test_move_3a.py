import os
import subprocess
import pypdfium2
import numpy as np

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

# Let's read page_2 and page_3 contents
with open('page_2_content.html', 'r', encoding='utf-8') as f:
    p2 = f.read()

with open('page_3_content.html', 'r', encoding='utf-8') as f:
    p3 = f.read()

# Section III-A is from lines 2 to 4 of page_3
sec3a_marker = '<h3 class="subsec-heading" style="margin-top: 0;">A. Modular Implementation and Clinical UI Modules</h3>'
sec3b_marker = '<h3 class="subsec-heading">B. Three-Phase Perioperative Workflow</h3>'

parts_p3 = p3.split(sec3b_marker)
sec3a_html = parts_p3[0].replace('<div class="two-col">\n', '').replace('<div class="two-col">', '')
new_p3 = '<div class="two-col">\n    <h3 class="subsec-heading" style="margin-top: 0;">B. Three-Phase Perioperative Workflow</h3>' + parts_p3[1]

# Append sec3a_html to page_2 right before the closing </div> of two-col
new_p2 = p2[:-6] + '\n' + sec3a_html + '\n  </div>'

# Now let's assemble with page_1, page_4, page_5, page_6
with open('page_1_content.html', 'r', encoding='utf-8') as f:
    p1 = f.read()
with open('page_4_content.html', 'r', encoding='utf-8') as f:
    p4 = f.read()
with open('page_5_content.html', 'r', encoding='utf-8') as f:
    p5 = f.read()
with open('page_6_content.html', 'r', encoding='utf-8') as f:
    p6 = f.read()

# Load header and footer from generate_uniform_7fig_paper.py
with open('generate_uniform_7fig_paper.py', 'r', encoding='utf-8') as f:
    orig = f.read()

import re
head_match = re.search(r'(<!DOCTYPE html>.*?</style>\s*</head>\s*<body>)', orig, re.DOTALL)
header_css = head_match.group(1)

# Format figure paths
fig1 = os.path.abspath('anesth_ai_ieee/figures_polished/fig1_architecture_submission.png').replace('\\', '/')
fig2 = os.path.abspath('anesth_ai_ieee/figures_polished/fig2_workflow.png').replace('\\', '/')
fig3 = os.path.abspath('anesth_ai_ieee/figures_polished/fig3_dose_calculator.png').replace('\\', '/')
fig4 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_live_ot.png').replace('\\', '/')
fig5 = os.path.abspath('anesth_ai_ieee/figures_polished/fig5_emergency.png').replace('\\', '/')
fig6 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_roc_pr_curves.png').replace('\\', '/')
fig7 = os.path.abspath('anesth_ai_ieee/figures_polished/fig5_arrhythmia_cm.png').replace('\\', '/')

html_full = f"""{header_css}
<div class="page" id="page-1">
{p1}
</div>
<!-- PAGE 2 -->
<div class="page" id="page-2">
{new_p2}
</div>
<!-- PAGE 3 -->
<div class="page" id="page-3">
{new_p3}
</div>
<!-- PAGE 4 -->
<div class="page" id="page-4">
{p4}
</div>
<!-- PAGE 5 -->
<div class="page" id="page-5">
{p5}
</div>
<!-- PAGE 6 -->
<div class="page" id="page-6">
{p6}
</div>
</body>
</html>
"""
html_full = html_full.replace('{fig1}', fig1).replace('{fig2}', fig2).replace('{fig3}', fig3).replace('{fig4}', fig4).replace('{fig5}', fig5).replace('{fig6}', fig6).replace('{fig7}', fig7)

html_file = os.path.abspath('anesth_ai_ieee/test_move3a.html')
pdf_file = os.path.abspath('anesth_ai_ieee/test_move3a.pdf')
with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_full)

cmd = [
    edge_path,
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    f'--print-to-pdf={pdf_file}',
    'file:///' + html_file.replace('\\', '/')
]
subprocess.run(cmd, capture_output=True)

pdf = pypdfium2.PdfDocument(pdf_file)
print("TOTAL PAGES:", len(pdf))
for i, page in enumerate(pdf):
    arr = np.array(page.render(scale=2).to_pil().convert('L'))
    h, w = arr.shape
    mid = w // 2
    l_bot = np.where(arr[:, :mid-20] < 240)[0].max() if len(np.where(arr[:, :mid-20] < 240)[0]) > 0 else 0
    r_bot = np.where(arr[:, mid+20:] < 240)[0].max() if len(np.where(arr[:, mid+20:] < 240)[0]) > 0 else 0
    bot = np.where(arr < 240)[0].max() if len(np.where(arr < 240)[0]) > 0 else 0
    diff = abs(l_bot - r_bot)
    gap = h - bot
    print(f"Page {i+1}: Y=[{np.where(arr<240)[0].min()} to {bot}] / {h}px | L={l_bot}, R={r_bot} | diff={diff}px | gap={gap}px")
