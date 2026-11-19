with open('scratch/test_page_distribution.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Locate VI.B text on Page 6
p6_start = code.find('<!-- PAGE 6 -->')
vib_heading = '<h3 class="subsec-heading" style="margin-top: 0;">B. Authentic MIT-BIH Revalidation and Confusion Matrix</h3>'
vib_idx = code.find(vib_heading, p6_start)
tbl6_idx = code.find('<div style="margin: 2px 0;">\n      <table class="ieee-table">', p6_start)

if vib_idx != -1 and tbl6_idx != -1:
    vib_block = code[vib_idx:tbl6_idx]
    # Remove vib_block from Page 6
    code = code[:vib_idx] + code[tbl6_idx:]
    # Insert vib_block into Page 5 before </div>\n</div>\n\n<!-- PAGE 6 -->
    p5_close = code.find('</div>\n</div>\n\n<!-- PAGE 6 -->')
    code = code[:p5_close] + '\n' + vib_block + '\n  ' + code[p5_close:]
    with open('scratch/test_page_distribution.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print('SUCCESSFULLY MOVED VI.B TEXT TO PAGE 5')
else:
    print('ERROR: could not find indices', vib_idx, tbl6_idx)
