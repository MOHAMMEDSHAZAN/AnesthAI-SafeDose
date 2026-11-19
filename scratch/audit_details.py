import os, re, glob, json

print("=== CHECKING APP.TSX FOR ROUTES ===")
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_txt = f.read()
# print first 50 lines and search for routes or view switching
for idx, l in enumerate(app_txt.splitlines()[:60]):
    print(f"{idx+1}: {l}")

print("\n=== SEARCHING FOR ROUTES OR SCREENS IN APP.TSX ===")
screens = re.findall(r'case\s+[\'\"]([^\'\"]+)[\'\"]:\s*return\s*<([A-Za-z0-9]+)', app_txt)
if screens:
    print(f"Found switch-case screens: {len(screens)}")
    for s in screens:
        print(f"  {s[0]} -> {s[1]}")
else:
    # check activeTab or currentView
    screens2 = re.findall(r'activeTab\s*===?\s*[\'\"]([^\'\"]+)[\'\"]', app_txt)
    print(f"activeTab checks: {len(set(screens2))}")
    print(set(screens2))

print("\n=== RBAC MATRIX ROLES AND PERMISSION COUNTS ===")
with open('backend/rbac_matrix.py', 'r', encoding='utf-8') as f:
    rbac_lines = f.readlines()
current_role = None
role_perms = {}
for idx, l in enumerate(rbac_lines):
    m = re.match(r'^([A-Z_]+)\s*=\s*RolePermissions\(', l.strip())
    if m:
        current_role = m.group(1)
        role_perms[current_role] = []
    elif current_role:
        perms = re.findall(r'Permission\.([A-Z_]+)', l)
        role_perms[current_role].extend(perms)
        if ')' in l and not l.strip().startswith('Permission'):
            current_role = None
for r, p in role_perms.items():
    print(f"{r}: {len(p)} permissions")

print("\n=== BREAK-GLASS MODELS & FIELDS ===")
with open('backend/main_api.py', 'r', encoding='utf-8') as f:
    api_txt = f.read()

for m in re.finditer(r'class\s+(?:BreakGlass|EmergencyBreakGlass)[A-Za-z0-9_]*\(BaseModel\):(.*?)(?=\nclass|\n@|\Z)', api_txt, re.DOTALL):
    print(m.group(0))

print("\n=== AUDIT LOG HASH CHAIN ===")
m_audit = re.search(r'def log_audit_action.*?(?=\n@app|\ndef [a-zA-Z])', api_txt, re.DOTALL)
if m_audit:
    for idx, line in enumerate(m_audit.group(0).splitlines()[:40]):
        print(f"{idx+1}: {line}")

print("\n=== S12: SHAP / LIME CALLS ===")
for root, _, files in os.walk('.'):
    if 'venv' in root or '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.py') or file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    c = f.read()
                    if 'shap.' in c or 'lime.' in c or 'shap_values' in c:
                        for l_idx, line in enumerate(c.splitlines()):
                            if any(k in line for k in ['shap.', 'lime.', 'shap_values', 'TreeExplainer', 'LinearExplainer']):
                                print(f"  {path}:{l_idx+1} -> {line.strip()[:100]}")
            except Exception as e:
                pass

print("\n=== S13: INCIDENT ANALYSIS CONFIDENCE SCORE ===")
for idx, l in enumerate(api_txt.splitlines()):
    if 'confidence_score' in l or 'analyze-incident' in l or 'incident' in l and 'confidence' in l:
        print(f"  main_api.py:{idx+1} -> {l.strip()}")

