import sys, os, re, json

sys.stdout.reconfigure(encoding='utf-8')

print("=== S15: test_system_acceptance.py inspection ===")
with open('test_system_acceptance.py', 'r', encoding='utf-8') as f:
    tsa_lines = f.readlines()
# Find lines with record_test
tests = [l.strip() for l in tsa_lines if 'record_test(' in l]
print(f"record_test calls in test_system_acceptance.py: {len(tests)}")
for t in tests:
    print(f"  {t}")

print("\n=== S19: Supabase Client ===")
with open('src/supabaseClient.ts', 'r', encoding='utf-8') as f:
    for idx, l in enumerate(f.readlines()):
        print(f"supabaseClient.ts:{idx+1} -> {l.rstrip()}")

print("\n=== S20: Demo / Non-validated labels in UI ===")
labels = []
for root, _, files in os.walk('src/views'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                for idx, l in enumerate(fp.readlines()):
                    if any(term in l.lower() for term in ['non-validated', 'demo only', 'synthetic demo', 'research prototype', 'not validated', 'prototype only']):
                        labels.append((p, idx+1, l.strip()))
print(f"Found {len(labels)} demo/non-validated labels:")
for p, lno, txt in labels[:25]:
    print(f"  {p}:{lno} -> {txt[:100]}")

print("\n=== N1: Sowbhagya vs Sowbahgya ===")
sowb1 = [] # Sowbhagya
sowb2 = [] # Sowbahgya
exclude_dirs = {'venv', '.git', 'node_modules', 'datasets', 'models', '.system_generated', '__pycache__', 'dist'}
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for f in files:
        if f.endswith(('.py', '.ts', '.tsx', '.md', '.tex', '.json', '.txt', '.csv', '.html')):
            p = os.path.join(root, f)
            try:
                with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                    txt = fp.read()
                    if 'Sowbhagya' in txt:
                        sowb1.append(p)
                    if 'Sowbahgya' in txt:
                        sowb2.append(p)
            except Exception:
                pass
print(f"Files with 'Sowbhagya' ({len(sowb1)}):")
for f in sorted(sowb1):
    print(f"  {f}")
print(f"Files with 'Sowbahgya' ({len(sowb2)}):")
for f in sorted(sowb2):
    print(f"  {f}")

print("\n=== N2: anesth_ai_ieee/ files and latest manuscript ===")
if os.path.exists('anesth_ai_ieee'):
    ieee_files = []
    for f in os.listdir('anesth_ai_ieee'):
        p = os.path.join('anesth_ai_ieee', f)
        mtime = os.path.getmtime(p)
        ieee_files.append((mtime, f, p))
    ieee_files.sort(reverse=True)
    print(f"Total files in anesth_ai_ieee: {len(ieee_files)}")
    print("Top 10 most recent files:")
    import datetime
    for mtime, f, p in ieee_files[:10]:
        dt = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
        print(f"  {dt} | {f} ({os.path.getsize(p)} bytes)")

print("\n=== N3: System architecture image ===")
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for f in files:
        if any(term in f.lower() for term in ['architecture', 'arch', 'system_overview', 'pipeline', 'workflow']) and any(f.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.svg']):
            p = os.path.join(root, f)
            print(f"  {p} -> {os.path.getsize(p)} bytes")
