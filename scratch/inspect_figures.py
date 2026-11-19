import re

html_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# find css rules for figures
css_matches = re.findall(r'(\.figure[^{]*\{[^}]*\})', html)
for c in css_matches:
    print('CSS:', c)

# find figure tags / divs
fig_blocks = re.findall(r'(<div class="figure-container".*?</div>\s*</div>)', html, re.DOTALL)
print(f'Figure blocks count: {len(fig_blocks)}')
for i, b in enumerate(fig_blocks):
    print(f'=== Fig {i+1} ===')
    print(b)
