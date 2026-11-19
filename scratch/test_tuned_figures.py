import os
import re
import subprocess
import pypdfium2 as pdfium
import numpy as np
from PIL import Image

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

# Read test_perfect_balance.py as template
with open('test_perfect_balance.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update Page 5 layout: reorder Subsection E -> Section VI -> Fig 5
p5_old = '''    <h3 class="subsec-heading" style="margin-top: 0;">E. Security, Role-Based Access, and Emergency Break-Glass</h3>
    <p class="no-indent">System security is governed by role-based access control (RBAC), restricting clinical configuration, patient telemetry, and audit log inspection [1], [4]. For acute emergencies requiring immediate clinical access, the platform implements an audited Emergency Break-Glass workflow (Fig. 5). Activating Break-Glass grants temporary scoped access while mandating clinical justification (&ge;10 characters), logging attending credentials and timestamps, and presenting quick-dial links to Indian national emergency services (112 &mdash; National Emergency Number; 108 &mdash; Ambulance / EMS). The system provides clinical decision support; it does not perform automated emergency dispatch or autonomous intervention.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig5}" alt="Emergency Break-Glass Portal" style="width: 96%;">
      <div class="caption"><b>Fig. 5.</b> Emergency Break-Glass access interface with audited emergency access controls.</div>
    </div>

    <h2 class="sec-heading">VI. Results and Evaluation</h2>
    <p class="no-indent">The ten operational clinical prediction tasks were systematically evaluated on untouched, patient-independent held-out cohorts under zero-leakage protocols [25]. Table IV summarizes the baseline performance across all ten tasks.</p>'''

p5_new = '''    <h3 class="subsec-heading" style="margin-top: 0;">E. Security, Role-Based Access, and Emergency Break-Glass</h3>
    <p class="no-indent">System security is governed by role-based access control (RBAC), restricting clinical configuration, patient telemetry, and audit log inspection [1], [4]. For acute emergencies requiring immediate clinical access, the platform implements an audited Emergency Break-Glass workflow (Fig. 5). Activating Break-Glass grants temporary scoped access while mandating clinical justification (&ge;10 characters), logging attending credentials and timestamps, and presenting quick-dial links to Indian national emergency services (112 &mdash; National Emergency Number; 108 &mdash; Ambulance / EMS). The system provides clinical decision support; it does not perform automated emergency dispatch or autonomous intervention.</p>

    <h2 class="sec-heading" style="margin-top: 2.0px;">VI. Results and Evaluation</h2>
    <p class="no-indent">The ten operational clinical prediction tasks were systematically evaluated on untouched, patient-independent held-out cohorts under zero-leakage protocols [25]. Table IV summarizes the baseline performance across all ten tasks.</p>

    <div class="figure-box" style="margin: 1.5px 0;">
      <img src="{fig5}" alt="Emergency Break-Glass Portal" style="width: 100%; height: auto; display: block; margin: 0 auto; border: 0.5px solid #888; border-radius: 2px;">
      <div class="caption"><b>Fig. 5.</b> Emergency Break-Glass access interface with audited emergency access controls.</div>
    </div>'''

code = code.replace(p5_old, p5_new)

# 2. Increase figure sizes:
# Fig 1: from width: 96% to 98%
code = code.replace('img src="{fig1}" alt="Overall System Architecture" style="width: 96%;"', 'img src="{fig1}" alt="Overall System Architecture" style="width: 99%; height: auto; display: block; margin: 0 auto;"')

# Fig 2: from width: 96% to 99%
code = code.replace('img src="{fig2}" alt="Three-Phase Perioperative Clinical Workflow" style="width: 96%;"', 'img src="{fig2}" alt="Three-Phase Perioperative Clinical Workflow" style="width: 99%; height: auto; display: block; margin: 0 auto;"')

# Fig 3: from width: 75% to 88%
code = code.replace('img src="{fig3}" alt="Drug Dose Calculation Support" style="width: 75%;"', 'img src="{fig3}" alt="Drug Dose Calculation Support" style="width: 88%; height: auto; display: block; margin: 0 auto;"')

# Fig 4: from width: 72% to 84%
code = code.replace('img src="{fig4}" alt="Live Operating Theater Monitoring" style="width: 72%;"', 'img src="{fig4}" alt="Live Operating Theater Monitoring" style="width: 84%; height: auto; display: block; margin: 0 auto;"')

# Fig 6: from width: 96% to 100% with slight margin adjustment
code = code.replace('img src="{fig6}" alt="ROC and PR Performance Curves" style="width: 96%;"', 'img src="{fig6}" alt="ROC and PR Performance Curves" style="width: 100%; height: auto; display: block; margin: 0 auto;"')

# Fig 7: from width: 54% to 70%
code = code.replace('img src="{fig7}" alt="Arrhythmia Confusion Matrix" style="width: 54%;"', 'img src="{fig7}" alt="Arrhythmia Confusion Matrix" style="width: 72%; height: auto; display: block; margin: 0 auto;"')

# 3. Output to test pdf
code = code.replace("anesth_ai_ieee/output/AnesthAI_IEEE_Final.pdf", "scratch/test_tuned.pdf")
code = code.replace("shutil.copyfile(pdf_out, 'AnesthAI_IEEE_Final.pdf')", "# skip root copy")

with open('scratch/run_tuned_test.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved scratch/run_tuned_test.py. Ready to run.")
