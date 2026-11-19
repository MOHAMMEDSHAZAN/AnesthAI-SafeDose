from slice_blocks import p6_raw

sec7_pos = p6_raw.find('<h2 class="sec-heading">VII. Limitations and Future Work</h2>')
p6_end_part = p6_raw[sec7_pos : p6_raw.rfind('</div>')].strip()

print(f"Sec VII + Sec VIII + References length: {len(p6_end_part)} chars")
# Let's count paragraphs and reference items
import re
print("Headings:", re.findall(r'<h2[^>]*>.*?</h2>', p6_end_part))
print("Paragraphs:", len(re.findall(r'<p[^>]*>', p6_end_part)))
print("Ref items:", len(re.findall(r'<li[^>]*>', p6_end_part)))
