import subprocess
import pypdfium2 as pdfium

# Let's create a test HTML without rigid page divs, just pure continuous flow
html_test = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: letter;
    margin: 0.46in 0.44in 0.48in 0.44in;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, serif;
  }
  body {
    font-size: 7.8pt;
    line-height: 1.08;
    color: #000;
  }
  .banner { text-align: center; margin-bottom: 4px; }
  .content {
    column-count: 2;
    column-gap: 0.18in;
  }
  h2 { font-size: 8.5pt; text-transform: uppercase; text-align: center; margin: 3px 0 1px 0; break-after: avoid; }
  p { margin-bottom: 2px; text-indent: 1.1em; text-align: justify; }
  .fig { width: 100%; margin: 3px 0; break-inside: avoid; text-align: center; }
  .fig img { width: 100%; height: auto; display: block; border: 0.5px solid #888; }
  .cap { font-size: 7.2pt; margin-top: 2px; }
  .table-box { width: 100%; margin: 3px 0; break-inside: avoid; }
  .table-box-span { column-span: all; width: 100%; margin: 4px 0; break-inside: avoid; }
</style>
</head>
<body>
"""

# Let's test reading the actual content from test_max_h_2.25.html
with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    orig = f.read()

print('Original length:', len(orig))
