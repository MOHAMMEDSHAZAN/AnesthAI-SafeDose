import os, re, glob, json, subprocess

print("=== S14: DOCKERFILE SEARCH ===")
dockerfiles = []
for root, _, files in os.walk('.'):
    for f in files:
        if 'docker' in f.lower():
            dockerfiles.append(os.path.join(root, f))
print(f"Dockerfiles found: {dockerfiles}")

print("\n=== S15: TESTS LIST ===")
test_files = []
for root, _, files in os.walk('.'):
    if any(x in root for x in ['venv', '.git', 'node_modules']): continue
    for f in files:
        if f.startswith('test_') and f.endswith('.py') or '.test.' in f:
            test_files.append(os.path.join(root, f))
print(f"Total test files: {len(test_files)}")
for tf in sorted(test_files):
    print(f"  {tf}")

if os.path.exists('test_system_acceptance.py'):
    with open('test_system_acceptance.py', 'r', encoding='utf-8') as f:
        t_lines = f.readlines()
    test_funcs = [l.strip() for l in t_lines if l.strip().startswith('def test_')]
    print(f"test_system_acceptance.py test case count: {len(test_funcs)}")
    for tf in test_funcs:
        print(f"    {tf}")

print("\n=== S16: REACT VERSION IN PACKAGE.JSON ===")
with open('package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)
print("Dependencies react:", pkg.get('dependencies', {}).get('react'))
with open('package.json', 'r', encoding='utf-8') as f:
    for idx, l in enumerate(f.readlines()):
        if '"react"' in l:
            print(f"Line {idx+1}: {l.strip()}")

print("\n=== S17: PORTS ===")
with open('backend/main_api.py', 'r', encoding='utf-8') as f:
    for idx, l in enumerate(f.readlines()):
        if 'port' in l.lower() and ('8000' in l or '8001' in l or 'uvicorn' in l or 'argparse' in l):
            print(f"main_api.py:{idx+1} -> {l.strip()}")

if os.path.exists('src/config/api.ts'):
    with open('src/config/api.ts', 'r', encoding='utf-8') as f:
        for idx, l in enumerate(f.readlines()):
            if '800' in l or 'PORT' in l or 'API' in l:
                print(f"src/config/api.ts:{idx+1} -> {l.strip()}")

if os.path.exists('vite.config.ts'):
    with open('vite.config.ts', 'r', encoding='utf-8') as f:
        for idx, l in enumerate(f.readlines()):
            if 'port' in l.lower() or 'server' in l.lower():
                print(f"vite.config.ts:{idx+1} -> {l.strip()}")

if os.path.exists('.env'):
    with open('.env', 'r', encoding='utf-8') as f:
        for idx, l in enumerate(f.readlines()):
            print(f".env:{idx+1} -> {l.strip()}")

print("\n=== S18: LIVE OT ===")
with open('src/views/LiveOT.tsx', 'r', encoding='utf-8') as f:
    lot = f.readlines()
for idx, l in enumerate(lot):
    if any(k in l.lower() for k in ['vitaldb', 'procedural', 'drawwaveform', 'sine', 'canvas', 'fetch', 'simulate']):
        if any(term in l for term in ['fetch', 'VitalDB', 'Math.sin', 'canvas', 'requestAnimationFrame', 'api/vitaldb']):
            print(f"LiveOT.tsx:{idx+1} -> {l.strip()[:100]}")

print("\n=== S19: SUPABASE ===")
for root, _, files in os.walk('src'):
    for f in files:
        if 'supabase' in f.lower():
            p = os.path.join(root, f)
            print(f"Found {p}:")
            with open(p, 'r', encoding='utf-8') as fp:
                for idx, l in enumerate(fp.readlines()[:40]):
                    print(f"  {idx+1}: {l.strip()}")

print("\n=== S20: DEMO / NON-VALIDATED LABELS ===")
for root, _, files in os.walk('src/views'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                for idx, l in enumerate(fp.readlines()):
                    if any(term in l.lower() for term in ['non-validated', 'demo only', 'prototype only', 'synthetic demo', 'research prototype']):
                        print(f"{p}:{idx+1} -> {l.strip()[:120]}")

