import pypdfium2 as pdfium

pdf = pdfium.PdfDocument(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\test_perfect_p4_fill.pdf')
bitmap4 = pdf[3].render(scale=2.0)
bitmap4.to_pil().save(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\page_4_perfect_fill.png')
print("Rendered Page 4 of test_perfect_p4_fill.pdf to page_4_perfect_fill.png")
