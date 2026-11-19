import pypdfium2

pdf = pypdfium2.PdfDocument("AnesthAI_IEEE_Final.pdf")
for page_num, page in enumerate(pdf):
    print(f"\n==================== PAGE {page_num + 1} ====================")
    textpage = page.get_textpage()
    num_chars = textpage.count_chars()
    text = textpage.get_text_range()
    
    # Let's inspect lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for idx, l in enumerate(lines):
        # Check if line contains standalone numbers or strange tokens
        tokens = l.split()
        for t in tokens:
            # If token is pure digits and not in a common range or standalone
            if t.isdigit() and len(t) < 4:
                # print line context
                pass
        # Check if entire line is just a number
        if l.isdigit():
            print(f"  [STANDALONE NUMBER LINE]: {l}")
        # Check for duplicate section or figure numbers
        if l.startswith("Fig.") or l.startswith("Table") or any(l.startswith(s) for s in ["I.", "II.", "III.", "IV.", "V.", "VI.", "VII.", "VIII."]):
            print(f"  [HEADING/OBJECT]: {l[:60]}")

print("\nDone inspecting PDF textpage.")
