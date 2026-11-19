import pypdfium2 as pdfium
import os

pdf_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\test_perfect_p4_fill.pdf'
pdf = pdfium.PdfDocument(pdf_path)

out_dir = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\final_qa_inspect'
os.makedirs(out_dir, exist_ok=True)

for i, page in enumerate(pdf):
    bmp = page.render(scale=2.0)
    img = bmp.to_pil()
    out_file = os.path.join(out_dir, f'page_{i+1}.png')
    img.save(out_file)
    print(f'Saved page {i+1} to {out_file}')

print('All pages rendered!')
