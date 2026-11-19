import pypdfium2 as pdfium
import re

pdf_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\scratch\test_perfect_p4_fill.pdf'
pdf = pdfium.PdfDocument(pdf_path)
print(f"Total pages: {len(pdf)}")
assert len(pdf) == 6, f"Expected 6 pages, got {len(pdf)}"

full_text = ""
for i, page in enumerate(pdf):
    text = page.get_textpage().get_text_range()
    full_text += f"\n--- PAGE {i+1} ---\n" + text

norm_text = re.sub(r'\s+', ' ', full_text)

# Check Figures
for fig in range(1, 8):
    assert f"Fig. {fig}." in norm_text or f"Fig. {fig}" in norm_text, f"Missing Fig. {fig}"
print("All 7 figures verified in text!")

# Check References [1] to [25]
for ref in range(1, 26):
    assert f"[{ref}]" in norm_text, f"Missing reference [{ref}]"
print("All 25 references verified in text!")

# Check Tables I to VI
for tbl in ["Table I", "Table II", "Table III", "Table IV", "Table V", "Table VI"]:
    assert tbl in norm_text, f"Missing {tbl}"
print("All 6 tables verified in text!")

# Check Safety Statement
assert "Monitoring status: No configured alerts currently triggered." in norm_text, "Safety statement missing!"
print("Clinical Safety Statement verified verbatim!")

# Check 10 production tasks
tasks = [
    "Hypotension", "Hypoxia", "Bradycardia", "Tachycardia", "Arrhythmia",
    "Emergency Severity", "Blood Loss", "Fluid Recommendation", "ICU Admission", "Mortality"
]
for t in tasks:
    assert t in norm_text, f"Missing task {t}"
print("All 10 production tasks verified!")

# Check No Acknowledgment section heading exists
assert not re.search(r'ACKNOWLEDGMENT|ACKNOWLEDGEMENTS', norm_text, re.IGNORECASE), "Acknowledgment found!"
print("No Acknowledgment section exists!")

print("\n*** ALL FINAL STRICT QA CRITERIA PASSED 100% ***")
