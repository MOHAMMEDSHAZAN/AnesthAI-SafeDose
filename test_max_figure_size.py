import os, subprocess, pypdfium2, numpy as np
from test_perfect_flow_balance import generate_html, edge_path

for h_val in [2.20, 2.25, 2.28, 2.30, 2.35]:
    html_code = generate_html(fig_h=h_val, body_pt=7.8, p_margin=1.2, line_h=1.07)
    tmp_html = os.path.abspath(f'anesth_ai_ieee/test_max_h_{h_val}.html')
    tmp_pdf = os.path.abspath(f'anesth_ai_ieee/test_max_h_{h_val}.pdf')
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(html_code)
    cmd = [
        edge_path,
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        f'--print-to-pdf={tmp_pdf}',
        'file:///' + tmp_html.replace('\\', '/')
    ]
    subprocess.run(cmd, capture_output=True)
    if os.path.exists(tmp_pdf):
        pdf = pypdfium2.PdfDocument(tmp_pdf)
        print(f'=== fig_h={h_val}in: TOTAL PAGES={len(pdf)} ===')
        for i, p in enumerate(pdf):
            arr = np.array(p.render(scale=2).to_pil().convert('L'))
            h, w = arr.shape
            mid = w // 2
            l_bot = np.where(arr[:, :mid-20] < 240)[0].max() if len(np.where(arr[:, :mid-20] < 240)[0]) > 0 else 0
            r_bot = np.where(arr[:, mid+20:] < 240)[0].max() if len(np.where(arr[:, mid+20:] < 240)[0]) > 0 else 0
            bot = np.where(arr < 240)[0].max() if len(np.where(arr < 240)[0]) > 0 else 0
            print(f'   Page {i+1}: bot={bot}/{h}px | L={l_bot}, R={r_bot} | diff={abs(l_bot-r_bot)}px | gap={h-bot}px')
