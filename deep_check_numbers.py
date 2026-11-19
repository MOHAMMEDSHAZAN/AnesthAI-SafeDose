import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect all headings
print("--- ALL HEADINGS ---")
for h in re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', text):
    print(h)

# Let's inspect all table titles
print("\n--- ALL TABLE TITLES ---")
for t in re.findall(r'class="table-title">(.*?)</div>', text):
    print(t)

# Let's inspect all captions
print("\n--- ALL CAPTIONS ---")
for c in re.findall(r'class="caption">(.*?)</div>', text):
    print(c)

# Let's inspect references
print("\n--- ALL REFERENCES ---")
refs = re.findall(r'<li>(\[\d+\].*?)</li>', text)
print(f"Total references: {len(refs)}")
for r in refs[:5]:
    print(" ", r)
for r in refs[-3:]:
    print(" ", r)

# Search for any standalone number or stray numbers
# e.g., patterns like "> \d+ <" or ">\d+<" or "\n\d+\n"
stray = re.findall(r'>\s*(\d+)\s*<', text)
print("\n--- NUMBERS DIRECTLY IN TAGS (> <) ---")
print(stray)
