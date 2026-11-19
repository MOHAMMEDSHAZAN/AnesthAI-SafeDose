import pypdfium2 as pdfium

pdf = pdfium.PdfDocument(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\test_spanning_figures.pdf')
bitmap = pdf[3].render(scale=2.0)
bitmap.to_pil().save(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\page_4_single_col_fig4.png')
print("Rendered Page 4 of test_spanning_figures to page_4_single_col_fig4.png")
