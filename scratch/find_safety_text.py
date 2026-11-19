import pypdfium2 as pdfium
import re

pdf_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\test_perfect_p4_fill.pdf'
pdf = pdfium.PdfDocument(pdf_path)
text = pdf[3].get_textpage().get_text_range()

for line in text.split('\n'):
    if 'Monitoring' in line or 'alerts' in line or 'status' in line:
        print("MATCH:", repr(line))
