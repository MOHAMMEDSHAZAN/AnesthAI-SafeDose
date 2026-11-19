import pypdfium2
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

pdf = pypdfium2.PdfDocument("AnesthAI_IEEE_Final.pdf")
for page_num, page in enumerate(pdf):
    print(f"\n==================== PAGE {page_num + 1} ====================")
    textpage = page.get_textpage()
    text = textpage.get_text_range()
    
    lines = text.split('\r\n')
    if len(lines) <= 1:
        lines = text.split('\n')
        
    for idx, l in enumerate(lines):
        clean = l.strip()
        if not clean:
            continue
            
        words = clean.split()
        for w in words:
            # Check standalone 1-2 digit numbers
            if w.isdigit():
                print(f"P{page_num+1} L{idx}: '{clean}' -> NUMBER: {w}")
