import os
import shutil

with open('scratch/test_gen_pdf.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace output pdf path to scratch/test_p5_reordered.pdf
text = text.replace("anesth_ai_ieee/output/AnesthAI_IEEE_Final.pdf", "scratch/test_p5_reordered.pdf")
text = text.replace("shutil.copyfile(pdf_out, 'AnesthAI_IEEE_Final.pdf')", "# skipping root copy")

with open('scratch/test_gen_pdf_run.py', 'w', encoding='utf-8') as f:
    f.write(text)

print('Wrote scratch/test_gen_pdf_run.py')
