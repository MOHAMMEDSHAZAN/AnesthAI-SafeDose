import re

with open('test_build.py', 'r', encoding='utf-8') as f:
    content = f.read()

parts = re.split(r'<!-- PAGE \d+ -->', content)
for i in [3, 4, 5, 6]:
    print(f"=== PAGE {i} ===")
    matches = re.findall(r'<(?:h2|h3|table|img)[^>]*>.*?(?:</(?:h2|h3|table)>|/>|(?=<))', parts[i], re.DOTALL)
    for m in matches[:10]:
        print("  ", m[:100].replace('\n', ' '))
