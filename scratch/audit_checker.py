import os, re, glob, json

print("=== S4: App.tsx and src/views ===")
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_txt = f.read()
routes = re.findall(r'<Route\s+path=["\']([^"\']+)["\']\s+element=\{<([A-Za-z0-9]+)', app_txt)
print(f"Total Route tags in App.tsx: {len(routes)}")
for r in routes:
    print(f"  path: {r[0]} -> {r[1]}")

views_files = [f for f in os.listdir('src/views') if f.endswith('.tsx') or f.endswith('.ts')]
print(f"Total view files in src/views: {len(views_files)}")
print(sorted(views_files))

print("\n=== S5: Roles in rbac_matrix.py and AppContext.tsx ===")
with open('backend/rbac_matrix.py', 'r', encoding='utf-8') as f:
    rbac_txt = f.read()

# Let's inspect roles and permissions in rbac_matrix.py
for match in re.finditer(r'([A-Z_]+)\s*=\s*RolePermissions\((.*?)\)', rbac_txt, re.DOTALL):
    role_name = match.group(1)
    perms = re.findall(r'Permission\.([A-Z_]+)', match.group(2))
    print(f"  {role_name}: {len(perms)} permissions")

# Check role enum or dict
with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    ac_txt = f.read()
m_role = re.search(r'export type UserRole\s*=\s*([^;]+);', ac_txt)
if m_role:
    print(f"AppContext.tsx UserRole: {m_role.group(1).strip()}")

print("\n=== S6: backend/auth_utils.py ===")
if os.path.exists('backend/auth_utils.py'):
    with open('backend/auth_utils.py', 'r', encoding='utf-8') as f:
        auth_lines = f.readlines()
    for idx, l in enumerate(auth_lines):
        if any(k in l.lower() for k in ['pbkdf2', 'iteration', 'salt', 'algorithm', 'expir', 'jwt']):
            print(f"  Line {idx+1}: {l.strip()}")
else:
    print("backend/auth_utils.py NOT FOUND")

print("\n=== S7: Break-glass routes ===")
with open('backend/main_api.py', 'r', encoding='utf-8') as f:
    api_lines = f.readlines()
for idx, l in enumerate(api_lines):
    if 'break-glass' in l or 'break_glass' in l:
        print(f"  Line {idx+1}: {l.strip()}")

print("\n=== S8: Audit log function & SHA-256 ===")
for idx, l in enumerate(api_lines):
    if 'audit' in l.lower() and ('def ' in l or 'sha256' in l.lower() or 'hash' in l.lower()):
        print(f"  Line {idx+1}: {l.strip()}")

print("\n=== S9 & S10: Fluid engine & Safety rules ===")
with open('backend/clinical_safety.py', 'r', encoding='utf-8') as f:
    cs_lines = f.readlines()
for idx, l in enumerate(cs_lines):
    if any(k in l.lower() for k in ['holliday', 'atls', '30', '0.5', 'ebv', 'map', 'threshold', 'hemorrhage']):
        if 'def ' in l or 'class ' in l or '=' in l:
            print(f"  Line {idx+1}: {l.strip()}")

print("\n=== S11: ASA pre-fill & backend ===")
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'asascore' in content.lower() or 'asa_score' in content.lower() or 'asaclass' in content.lower():
                    for idx, l in enumerate(content.splitlines()):
                        if 'asa' in l.lower() and ('score' in l.lower() or 'class' in l.lower() or 'status' in l.lower()):
                            print(f"  {path}:{idx+1} -> {l.strip()[:100]}")

