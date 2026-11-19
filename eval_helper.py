import os
import subprocess
import pypdfium2
import numpy as np

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

def compile_and_check(html_content, label="test"):
    html_file = os.path.abspath(f'anesth_ai_ieee/temp_{label}.html')
    pdf_file = os.path.abspath(f'anesth_ai_ieee/temp_{label}.pdf')
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    cmd = [
        edge_path,
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        f'--print-to-pdf={pdf_file}',
        'file:///' + html_file.replace('\\', '/')
    ]
    subprocess.run(cmd, capture_output=True)
    
    pdf = pypdfium2.PdfDocument(pdf_file)
    print(f"[{label}] TOTAL PAGES: {len(pdf)}")
    results = []
    for i, page in enumerate(pdf):
        arr = np.array(page.render(scale=2).to_pil().convert('L'))
        h, w = arr.shape
        mid = w // 2
        l_bot = np.where(arr[:, :mid-20] < 240)[0].max() if len(np.where(arr[:, :mid-20] < 240)[0]) > 0 else 0
        r_bot = np.where(arr[:, mid+20:] < 240)[0].max() if len(np.where(arr[:, mid+20:] < 240)[0]) > 0 else 0
        bot = np.where(arr < 240)[0].max() if len(np.where(arr < 240)[0]) > 0 else 0
        diff = abs(l_bot - r_bot)
        gap = h - bot
        res_str = f"Page {i+1}: Y=[{np.where(arr<240)[0].min()} to {bot}] / {h}px | L={l_bot}, R={r_bot} | diff={diff}px | gap={gap}px"
        print("  " + res_str)
        results.append((len(pdf), gap, diff))
    return results

print("Balancer helper loaded.")
