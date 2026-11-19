import os
import re
import subprocess
import pypdfium2 as pdfium
import numpy as np

# Let's write a script that tests moving Fig 3 to Column 1 (end of Subsection A)
with open('scratch/run_tuned_test.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Currently in code:
# Where is Fig 3?
# It's after Holliday-Segar Maintenance Rate in Subsection B.
# We want Fig 3 to be right after Subsection A paragraph.

fig3_block = '''    <div class="figure-box" style="margin: 2px 0;">
      <img src="{fig3}" alt="Drug Dose Calculation Support" style="width: 88%; height: auto; display: block; margin: 0 auto;">
      <div class="caption"><b>Fig. 3.</b> Anesth AI anesthesia dose-calculation decision-support interface.</div>
    </div>'''

# Remove Fig 3 from Subsection B
code_no_fig3 = code.replace(fig3_block, '')

# Insert Fig 3 at the end of Subsection A paragraph
target_sub_a = '''Specific drug dosing parameters not provided in verified project references remain under attending clinician determination. The module provides calculation support and requires clinician verification before clinical use.</p>'''

replacement_sub_a = target_sub_a + '\n\n' + fig3_block

new_code = code_no_fig3.replace(target_sub_a, replacement_sub_a)

with open('scratch/run_tuned_test_2.py', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Saved scratch/run_tuned_test_2.py. Ready to test.")
