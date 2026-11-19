import pypdfium2 as pdfium
import os

pdf_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\test_span_all_wide.pdf'
out_dir = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\final_qa_inspect'
os.makedirs(out_dir, exist_ok=True)

pdf = pdfium.PdfDocument(pdf_path)
print(f"Total pages: {len(pdf)}")

for i, page in enumerate(pdf):
    bitmap = page.render(scale=2.0)
    pil_image = bitmap.to_pil()
    out_path = os.path.join(out_dir, f"page_{i+1}.png")
    pil_image.save(out_path)
    print(f"Saved {out_path} ({pil_image.size})")

print("Rendering complete!")
