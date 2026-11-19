import re

html_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

breaks = re.findall(r'style="[^"]*break-[^"]*"', html)
print('Breaks found:', len(breaks))
for b in breaks:
    print(b)

# Check all figure-box instances
fig_boxes = re.findall(r'(<div class="figure-box".*?</div>\s*</div>)', html, re.DOTALL)
print(f'Figure boxes count: {len(fig_boxes)}')
for i, b in enumerate(fig_boxes):
    print(f'--- FIG BOX {i+1} ---')
    print(b[:200])
