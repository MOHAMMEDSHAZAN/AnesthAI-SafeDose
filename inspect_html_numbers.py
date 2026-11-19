import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find all text outside tags and inspect
# Also let's check for any numbers appearing between paragraphs or sections
paras = re.findall(r'<p[^>]*>(.*?)</p>', content, re.DOTALL)
headings = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', content, re.DOTALL)
divs = re.findall(r'<div[^>]*>(.*?)</div>', content, re.DOTALL)

print(f"Total paragraphs: {len(paras)}")
print(f"Total headings: {len(headings)}")

# Check headings for duplicate numbers or strange tokens
for h in headings:
    print(f"HEADING: {h.strip()}")

# Check all text between </p> and <p> or </div> and <div
between_tags = re.findall(r'</(?:p|div|table|h\d)>\s*([^\s<][^<]*)\s*<', content)
print(f"Text between closing and opening tags: {between_tags}")
