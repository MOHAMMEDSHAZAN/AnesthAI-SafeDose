with open('build_perfect_master_paper.py', 'r', encoding='utf-8') as f:
    text = f.read()

parts = text.split('<!-- PAGE ')
for p in parts[1:]:
    p_num = p.split(' -->')[0]
    p_body = p.split(' -->')[1].split('</div>\n</div>')[0]
    print(f"Page {p_num}: {len(p_body)} characters")
