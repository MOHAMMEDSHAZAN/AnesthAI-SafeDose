import re
from slice_blocks import p3_raw, p4_raw, p5_raw, p6_raw

print("--- P4 BLOCKS ---")
for m in re.finditer(r'(<h[23][^>]*>.*?</h[23]>|<div class="table-title">.*?</div>|<div class="caption">.*?</div>)', p4_raw):
    print(f"Index {m.start()}: {re.sub('<[^<]+?>', '', m.group(0))}")

print("\n--- P5 BLOCKS ---")
for m in re.finditer(r'(<h[23][^>]*>.*?</h[23]>|<div class="table-title">.*?</div>|<div class="caption">.*?</div>)', p5_raw):
    print(f"Index {m.start()}: {re.sub('<[^<]+?>', '', m.group(0))}")

print("\n--- P6 BLOCKS ---")
for m in re.finditer(r'(<h[23][^>]*>.*?</h[23]>|<div class="table-title">.*?</div>|<div class="caption">.*?</div>)', p6_raw):
    print(f"Index {m.start()}: {re.sub('<[^<]+?>', '', m.group(0))}")
