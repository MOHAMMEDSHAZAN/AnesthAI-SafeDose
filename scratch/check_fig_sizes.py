from PIL import Image
import os

fig_paths = [
    r"c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\figures_polished\fig1_architecture_submission.png",
    r"c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\figures_polished\fig2_workflow.png",
    r"c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\figures_polished\fig3_dose_calculator.png",
    r"c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\figures_polished\fig4_live_ot.png",
    r"c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\figures_polished\fig5_emergency.png",
    r"c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\figures_polished\fig4_roc_pr_curves.png",
    r"c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\figures_polished\fig5_arrhythmia_cm.png"
]

for i, p in enumerate(fig_paths):
    img = Image.open(p)
    w, h = img.size
    print(f'Fig {i+1}: file={os.path.basename(p)} size={w}x{h}, aspect_ratio={w/h:.3f}')
