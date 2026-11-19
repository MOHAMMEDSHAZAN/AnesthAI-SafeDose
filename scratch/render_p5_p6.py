import pypdfium2 as pdfium

pdf = pdfium.PdfDocument(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\test_spanning_figures.pdf')

bitmap5 = pdf[4].render(scale=2.0)
bitmap5.to_pil().save(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\page_5_spanning.png')

bitmap6 = pdf[5].render(scale=2.0)
bitmap6.to_pil().save(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\page_6_spanning.png')

print("Rendered Page 5 and Page 6 of test_spanning_figures")
