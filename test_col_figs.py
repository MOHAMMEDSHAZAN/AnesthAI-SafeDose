import subprocess
import pypdfium2
import os

html_path = os.path.abspath("anesth_ai_ieee/test_single_col.html")
pdf_path = os.path.abspath("anesth_ai_ieee/test_single_col.pdf")

fig1 = os.path.abspath('anesth_ai_ieee/figures_polished/fig1_architecture_submission.png').replace('\\', '/')
fig6 = os.path.abspath('anesth_ai_ieee/figures_polished/fig4_roc_pr_curves.png').replace('\\', '/')

html = f"""<!DOCTYPE html>
<html>
<head>
<style>
  @page {{ size: letter; margin: 0.5in; }}
  .col {{ width: 3.45in; border: 1px solid red; font-family: sans-serif; }}
  .fig-box {{
    width: 3.45in;
    height: 2.1in;
    border: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
  }}
  .fig-box img {{
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }}
</style>
</head>
<body>
  <div class="col">
    <h3>Single Column 3.45in Test: Fig 1</h3>
    <div class="fig-box">
      <img src="file:///{fig1}">
    </div>
    <h3>Single Column 3.45in Test: Fig 6</h3>
    <div class="fig-box">
      <img src="file:///{fig6}">
    </div>
  </div>
</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

cmd = [edge_path, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf_path}', 'file:///' + html_path.replace('\\', '/')]
res = subprocess.run(cmd, capture_output=True)

pdf = pypdfium2.PdfDocument(pdf_path)
img = pdf[0].render(scale=2).to_pil()
img.save('anesth_ai_ieee/test_single_col.png')
print("Rendered single col test successfully.")
