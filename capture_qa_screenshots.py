import os
import time
import subprocess

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
screenshot_dir = os.path.abspath('reports/website_qa/screenshots')
os.makedirs(screenshot_dir, exist_ok=True)

views = [
    ("landing", "http://localhost:5173/?view=landing"),
    ("auth", "http://localhost:5173/?view=auth"),
    ("dashboard", "http://localhost:5173/?view=dashboard&auth=true"),
    ("patients", "http://localhost:5173/?view=patients&auth=true"),
    ("liveot", "http://localhost:5173/?view=liveot&auth=true"),
    ("safety_overview", "http://localhost:5173/?view=safety-overview&auth=true"),
    ("drugcalc", "http://localhost:5173/?view=drugcalc&auth=true"),
    ("preoperative", "http://localhost:5173/?view=preoperative&auth=true"),
    ("planner", "http://localhost:5173/?view=planner&auth=true"),
    ("airway", "http://localhost:5173/?view=airway&auth=true"),
    ("pacu", "http://localhost:5173/?view=pacu&auth=true"),
    ("clinicalmodels", "http://localhost:5173/?view=clinicalmodels&auth=true"),
    ("intraop_safety", "http://localhost:5173/?view=intraop-safety&auth=true"),
    ("analytics", "http://localhost:5173/?view=analytics&auth=true"),
    ("admin", "http://localhost:5173/?view=admin&auth=true"),
    ("emergency_portal", "http://localhost:5173/?view=emergency&auth=true")
]

viewports = [
    ("desktop", 1920, 1080),
    ("mobile", 390, 844)
]

print(f"Starting screenshot captures into {screenshot_dir}...")
captured = []

for name, url in views:
    for vp_name, width, height in viewports:
        out_file = os.path.join(screenshot_dir, f"{name}_{vp_name}.png")
        cmd = [
            edge_path,
            '--headless=new',
            '--disable-gpu',
            '--hide-scrollbars',
            f'--window-size={width},{height}',
            f'--screenshot={out_file}',
            url
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
                captured.append((name, vp_name, os.path.getsize(out_file)))
                print(f"[OK] Captured: {name}_{vp_name}.png ({os.path.getsize(out_file)} bytes)")
            else:
                print(f"[WARN] Failed or empty: {name}_{vp_name}.png")
        except Exception as e:
            print(f"[ERR] Error capturing {name}_{vp_name}: {e}")

print(f"\nTotal screenshots successfully captured: {len(captured)} / {len(views)*len(viewports)}")
