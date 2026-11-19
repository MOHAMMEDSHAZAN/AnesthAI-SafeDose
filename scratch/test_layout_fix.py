import os
import re
import subprocess
import pypdfium2 as pdfium
import numpy as np
from PIL import Image

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

# Read test_perfect_balance.py
with open('test_perfect_balance.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Make sure fig1 is using the updated 10-model image
# Let's check how fig1 is defined
# In test_perfect_balance.py:
# fig1 = os.path.abspath('anesth_ai_ieee/figures_polished/fig1_architecture_submission.png').replace('\\', '/')

# On Page 5:
# Reorder Subsection E, Section VI, and Fig 5 so Section VI starts in Column 1 and Fig 5 is in Column 2
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

if p5_old in code:
    code = code.replace(p5_old, p5_new)
    print("Successfully replaced Page 5 layout!")
else:
    print("Warning: p5_old not found in code!")

# Save to test script
with open('scratch/test_gen_pdf.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved scratch/test_gen_pdf.py")
