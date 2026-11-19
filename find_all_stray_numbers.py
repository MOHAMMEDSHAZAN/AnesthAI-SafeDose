import pypdfium2
import sys

# Set stdout to utf-8
sys.stdout.reconfigure(encoding='utf-8')

pdf = pypdfium2.PdfDocument("AnesthAI_IEEE_Final.pdf")
print(f"Total pages: {len(pdf)}")

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
            
        # Is the line ONLY a number? (stray page number, floating number)
        if clean.isdigit():
            print(f"  [ISOLATED NUMBER] P{page_num+1} L{idx}: '{clean}'")
        elif len(clean) <= 4 and any(c.isdigit() for c in clean) and not clean.startswith('[') and not clean.startswith('('):
            print(f"  [SHORT NUMBER LINE] P{page_num+1} L{idx}: '{clean}'")

print("\nScan for isolated/stray numbers complete.")
