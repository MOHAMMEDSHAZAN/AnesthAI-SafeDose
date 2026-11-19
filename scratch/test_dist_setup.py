import os
import subprocess
import pypdfium2
import numpy as np

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

# Figure paths
fig1 = os.path.abspath('anesth_ai_ieee/figures_polished/fig1_architecture_submission.png').replace('\\', '/')
fig2 = os.path.abspath('anesth_ai_ieee/figures_polished/fig2_workflow.png').replace('\\', '/')
fig3 = os.path.abspath('anesth_ai_ieee/figures_polished/fig3_dose_calculator.png').replace('\\', '/')
fig4 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_live_ot.png').replace('\\', '/')
fig5 = os.path.abspath('anesth_ai_ieee/figures_polished/fig5_emergency.png').replace('\\', '/')
fig6 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_roc_pr_curves.png').replace('\\', '/')
fig7 = os.path.abspath('anesth_ai_ieee/figures_polished/fig5_arrhythmia_cm.png').replace('\\', '/')

def make_fig(fig_id, img_path, caption_text):
    return f"""<div class="figure-box">
  <div class="figure-frame">
    <img src="{img_path}" alt="{caption_text}">
  </div>
  <div class="caption"><b>Fig. {fig_id}.</b> {caption_text}</div>
</div>"""

print("Test script setup ready.")
