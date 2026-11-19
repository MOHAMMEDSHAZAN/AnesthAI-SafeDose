import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'(Table [IVXLCDM]+:[^\n<]*).*?(<table[^>]*>).*?(?=</table>)', text, re.DOTALL):
    title = m.group(1)
    tag = m.group(2)
    # first row
    first_row = m.group(0)[:m.group(0).find('</tr>') + 5]
    print(f'{title}\n  Tag: {tag}\n')
