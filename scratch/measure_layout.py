# Let's test different distributions of sections and measure the exact pixel heights of each page
# when rendered with Edge headless.

import subprocess
import pypdfium2 as pdfium
import numpy as np
from PIL import Image

def render_html_and_measure(html_content, test_name):
    html_file = f'c:/Users/moham/OneDrive/Desktop/Anasthesia Antigravity/scratch/{test_name}.html'
    pdf_file = f'c:/Users/moham/OneDrive/Desktop/Anasthesia Antigravity/scratch/{test_name}.pdf'
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
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
        
        print(f'   Page {i+1}: Col 1 bottom={h - max_r1}px | Col 2 bottom={h - max_r2}px')

print('Test measurement function ready.')
