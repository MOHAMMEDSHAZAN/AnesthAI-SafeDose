import subprocess
import pypdfium2
import numpy as np
import os

with open('build_submission_final_clean.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Option A: Add break-inside: avoid to Table II container
code_a = code.replace(
    '<div style="margin: 2px 0;">\n      <div class="table-title">Table II: Dataset and Preprocessing Specifications</div>',
    '<div style="break-inside: avoid; margin: 2px 0;">\n      <div class="table-title">Table II: Dataset and Preprocessing Specifications</div>'
)

# Option B: Make Table II column-span: all
code_b = code.replace(
    '<div style="margin: 2px 0;">\n      <div class="table-title">Table II: Dataset and Preprocessing Specifications</div>',
    '<div style="column-span: all; margin: 2px 0;">\n      <div class="table-title">Table II: Dataset and Preprocessing Specifications</div>'
)

def test_code(c, name):
    html_path = f'anesth_ai_ieee/temp_test_{name}.html'
    pdf_path = f'anesth_ai_ieee/temp_test_{name}.pdf'
    with open(html_path, 'w', encoding='utf-8') as out:
        out.write(c)
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    if not os.path.exists(edge_path):
        edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
    cmd = [edge_path, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf_path}', 'file:///' + os.path.abspath(html_path).replace('\\', '/')]
    subprocess.run(cmd, capture_output=True)
    
    pdf = pypdfium2.PdfDocument(pdf_path)
    print(f"\n--- {name}: {len(pdf)} PAGES ---")
    for i, page in enumerate(pdf):
        arr = np.array(page.render(scale=2).to_pil().convert('L'))
        h, w = arr.shape
        mid = w // 2
        l_bot = np.where(arr[:, :mid-20] < 240)[0].max()
        r_bot = np.where(arr[:, mid+20:] < 240)[0].max()
        bot = np.where(arr < 240)[0].max()
        print(f"Page {i+1}: Y=[{np.where(arr<240)[0].min()} to {bot}] | L={l_bot}, R={r_bot}, diff={abs(l_bot-r_bot)}px, gap={h-bot}px")

test_code(code_a, "opt_a_break_avoid")
test_code(code_b, "opt_b_column_span_all")
