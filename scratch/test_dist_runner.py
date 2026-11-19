import subprocess
import pypdfium2 as pdfium
import numpy as np
import re

def test_distribution(page_contents, test_name):
    # Base CSS
    css = """
  @page {
    size: letter;
    margin: 0.46in 0.44in 0.48in 0.44in;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif !important;
  }
  body {
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: 7.8pt;
    line-height: 1.07;
    color: #000;
    background: #fff;
    text-align: justify;
    text-justify: inter-word;
  }
  .page {
    page-break-after: always;
    break-after: page;
    height: 10.06in;
    position: relative;
    overflow: hidden;
  }
  .page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }
  .banner { text-align: center; margin-bottom: 2.0px; }
  h1.paper-title { font-size: 15.5pt; font-weight: bold; line-height: 1.14; margin-bottom: 2.0px; text-transform: uppercase; letter-spacing: 0.2px; }
  .authors-block { font-size: 9.0pt; margin-bottom: 1.5px; line-height: 1.16; }
  .authors-block .name { font-weight: bold; font-size: 9.0pt; }
  .affiliations { font-size: 7.8pt; font-style: italic; color: #111; margin-bottom: 1.0px; line-height: 1.12; }
  .emails { font-size: 7.6pt; margin-bottom: 2.5px; color: #000; }
  .abstract-box { text-align: justify; margin-bottom: 2.5px; padding: 0 1px; }
  .abstract-box b.sec-lbl { font-style: italic; font-weight: bold; font-size: 8.0pt; }
  .abstract-text { font-size: 7.8pt; font-weight: bold; line-height: 1.09; }
  .keywords { font-size: 7.8pt; margin-top: 1.5px; font-weight: bold; font-style: normal; }
  .two-col { column-count: 2; column-gap: 0.18in; height: 100%; }
  h2.sec-heading { font-size: 8.5pt; font-weight: bold; text-transform: uppercase; text-align: center; margin-top: 2.8px; margin-bottom: 1.2px; break-after: avoid; letter-spacing: 0.2px; }
  h3.subsec-heading { font-size: 8.1pt; font-weight: bold; font-style: italic; margin-top: 2.2px; margin-bottom: 1.0px; break-after: avoid; }
  p { margin-bottom: 1.2px; text-indent: 1.1em; font-size: 7.8pt; }
  p.no-indent { text-indent: 0; }
  .figure-box { width: 100%; text-align: center; margin: 2.5px 0 2.0px 0; break-inside: avoid; }
  .figure-box img { width: 100%; height: auto; display: block; margin: 0 auto; border: 0.5px solid #888; border-radius: 2px; }
  .caption { font-size: 7.2pt; line-height: 1.10; margin-top: 2.0px; text-align: center; color: #111; }
  .caption b { font-weight: bold; }
  table.ieee-table { width: 100%; border-collapse: collapse; margin: 1.5px 0; line-height: 1.05; }
  table.ieee-table th, table.ieee-table td { font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif; font-size: 7.5pt; border: 0.5px solid #444; padding: 0.7px 1.4px; text-align: left; vertical-align: middle; }
  table.ieee-table th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
  table.ieee-table td.center { text-align: center; }
  .table-title { font-size: 7.5pt; font-weight: bold; text-align: center; margin-bottom: 1.2px; text-transform: uppercase; }
  .ref-list { list-style-type: none; margin-left: 0; padding-left: 0; font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif; font-size: 6.4pt; line-height: 1.02; }
  .ref-list li { font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif; font-size: 6.4pt; margin-bottom: 0px; text-indent: -1.2em; padding-left: 1.2em; line-height: 1.02; }
  .math-block { text-align: center; font-style: italic; margin: 1.4px 0; font-size: 7.8pt; line-height: 1.14; }
  .alert-boundary { border: 0.8px solid #b91c1c; background-color: #fef2f2; padding: 1.8px 3.8px; margin: 1.4px 0; font-size: 7.8pt; line-height: 1.08; }
  #page-1 { display: flex; flex-direction: column; }
  #page-1 .two-col { flex: 1; height: auto; min-height: 0; }
"""
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>{css}</style>
</head>
<body>
"""
    for idx, p in enumerate(page_contents, 1):
        html += f'<div class="page" id="page-{idx}">\n{p}\n</div>\n'
    html += '</body>\n</html>'
    
    html_file = f'c:/Users/moham/OneDrive/Desktop/Anasthesia Antigravity/scratch/{test_name}.html'
    pdf_file = f'c:/Users/moham/OneDrive/Desktop/Anasthesia Antigravity/scratch/{test_name}.pdf'
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)
        
    cmd = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_file}",
        html_file
    ]
    subprocess.run(cmd, check=True)
    
    pdf = pdfium.PdfDocument(pdf_file)
    print(f'[{test_name}] Total pages: {len(pdf)}')
    results = []
    for i, page in enumerate(pdf):
        bitmap = page.render(scale=2.0)
        pil_image = bitmap.to_pil()
        arr = np.array(pil_image.convert('L'))
        h, w = arr.shape
        col1 = arr[:, int(0.05*w):int(0.48*w)]
        col2 = arr[:, int(0.52*w):int(0.95*w)]
        
        nonwhite_col1 = np.where(col1 < 250)
        nonwhite_col2 = np.where(col2 < 250)
        
        max_r1 = nonwhite_col1[0].max() if len(nonwhite_col1[0]) > 0 else 0
        max_r2 = nonwhite_col2[0].max() if len(nonwhite_col2[0]) > 0 else 0
        
        m1 = h - max_r1
        m2 = h - max_r2
        print(f'   Page {i+1}: Col 1 bottom margin={m1}px | Col 2 bottom margin={m2}px | diff={abs(m1-m2)}px')
        results.append((m1, m2))
    return results

print('Test distribution runner ready.')
