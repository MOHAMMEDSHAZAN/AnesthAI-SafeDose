import os
import subprocess
import pypdfium2
import numpy as np

# Let's test the 7 uniform figures layout
fig1 = os.path.abspath('anesth_ai_ieee/figures_polished/fig1_architecture_submission.png').replace('\\', '/')
fig2 = os.path.abspath('anesth_ai_ieee/figures_polished/fig2_workflow.png').replace('\\', '/')
fig3 = os.path.abspath('anesth_ai_ieee/figures_polished/fig3_dose_calculator.png').replace('\\', '/')
fig4 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_live_ot.png').replace('\\', '/')
fig5 = os.path.abspath('anesth_ai_ieee/figures_polished/fig5_emergency.png').replace('\\', '/')
fig6 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_roc_pr_curves.png').replace('\\', '/')
fig7 = os.path.abspath('anesth_ai_ieee/figures_polished/fig5_arrhythmia_cm.png').replace('\\', '/')

print("Building test with 7 uniform figure frames...")
