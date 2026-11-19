import re

html_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if style_match:
    print(style_match.group(1))
