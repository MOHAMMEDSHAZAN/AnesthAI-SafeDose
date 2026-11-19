# -*- coding: utf-8 -*-
"""
Build Upload-Ready Modular Packages for Claude
Output Directory: out_predictions/CLAUDE_UPLOAD_READY/
Target Size: All ZIPs strictly under 15 MB using Deflate level 9.
"""

import os
import shutil
import zipfile
import hashlib

STAGE_DIR = os.path.abspath("out_predictions/staging_claude_package")
OUT_DIR = os.path.abspath("out_predictions/CLAUDE_UPLOAD_READY")

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def make_zip(zip_name, file_map):
    """
    file_map: list of tuples (source_path, arcname)
    """
    zip_path = os.path.join(OUT_DIR, zip_name)
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    print(f"Creating {zip_name} with {len(file_map)} files...")
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for src, arc in file_map:
            zf.write(src, arc)
            
    size = os.path.getsize(zip_path)
    sha = sha256_file(zip_path)
    print(f"  -> {zip_name}: {size:,} bytes ({size / (1024*1024):.2f} MB), SHA256={sha[:16]}...")
    return {
        "name": zip_name,
        "path": zip_path,
        "size": size,
        "size_mb": size / (1024 * 1024),
        "sha256": sha,
        "file_count": len(file_map),
        "files": [arc for _, arc in file_map]
    }

def build_all_packages():
    os.makedirs(OUT_DIR, exist_ok=True)
    packages_info = []

    # -------------------------------------------------------------
    # 1. AnesthAI_01_Manuscript.zip
    # -------------------------------------------------------------
    p01_files = []
    dir_01 = os.path.join(STAGE_DIR, "01_MANUSCRIPT")
    for root, _, files in os.walk(dir_01):
        for f in files:
            full_p = os.path.join(root, f)
            arc_p = os.path.relpath(full_p, dir_01).replace("\\", "/")
            p01_files.append((full_p, arc_p))
    info_01 = make_zip("AnesthAI_01_Manuscript.zip", p01_files)
    packages_info.append(info_01)

    # -------------------------------------------------------------
    # 2. AnesthAI_02_Audit_and_Metrics.zip
    # -------------------------------------------------------------
    p02_files = []
    dir_02 = os.path.join(STAGE_DIR, "02_INDEPENDENT_AUDIT")
    for root, _, files in os.walk(dir_02):
        for f in files:
            full_p = os.path.join(root, f)
            arc_p = os.path.relpath(full_p, dir_02).replace("\\", "/")
            p02_files.append((full_p, arc_p))
    info_02 = make_zip("AnesthAI_02_Audit_and_Metrics.zip", p02_files)
    packages_info.append(info_02)

    # -------------------------------------------------------------
    # 3. AnesthAI_03_Prediction_Evidence.zip
    # Exclude nested zip to prevent duplicate 10.4MB bloat
    # -------------------------------------------------------------
    p03_files = []
    dir_03 = os.path.join(STAGE_DIR, "03_PREDICTION_DATA")
    for root, _, files in os.walk(dir_03):
        for f in files:
            if f.endswith(".zip"):
                continue  # skip nested zip duplicate
            full_p = os.path.join(root, f)
            arc_p = os.path.relpath(full_p, dir_03).replace("\\", "/")
            p03_files.append((full_p, arc_p))
    info_03 = make_zip("AnesthAI_03_Prediction_Evidence.zip", p03_files)
    packages_info.append(info_03)

    # -------------------------------------------------------------
    # 4. AnesthAI_04_Project_Documentation.zip
    # -------------------------------------------------------------
    p04_files = []
    dir_04 = os.path.join(STAGE_DIR, "06_PROJECT_DOCUMENTATION")
    for root, _, files in os.walk(dir_04):
        for f in files:
            full_p = os.path.join(root, f)
            arc_p = os.path.relpath(full_p, dir_04).replace("\\", "/")
            p04_files.append((full_p, arc_p))
    info_04 = make_zip("AnesthAI_04_Project_Documentation.zip", p04_files)
    packages_info.append(info_04)

    # -------------------------------------------------------------
    # 5. AnesthAI_05_Figures_and_Screenshots.zip
    # -------------------------------------------------------------
    p05_files = []
    dir_figs = os.path.join(STAGE_DIR, "04_FIGURES_AND_GRAPHS")
    for root, _, files in os.walk(dir_figs):
        for f in files:
            full_p = os.path.join(root, f)
            arc_p = os.path.join("04_FIGURES_AND_GRAPHS", os.path.relpath(full_p, dir_figs)).replace("\\", "/")
            p05_files.append((full_p, arc_p))
            
    dir_shots = os.path.join(STAGE_DIR, "05_WEBSITE_SCREENSHOTS")
    for root, _, files in os.walk(dir_shots):
        for f in files:
            full_p = os.path.join(root, f)
            arc_p = os.path.join("05_WEBSITE_SCREENSHOTS", os.path.relpath(full_p, dir_shots)).replace("\\", "/")
            p05_files.append((full_p, arc_p))
    info_05 = make_zip("AnesthAI_05_Figures_and_Screenshots.zip", p05_files)
    packages_info.append(info_05)

    # -------------------------------------------------------------
    # 6. AnesthAI_06_Claude_Instructions.zip
    # Combines instructions + reference bibliography audit
    # -------------------------------------------------------------
    p06_files = []
    dir_inst = os.path.join(STAGE_DIR, "08_CLAUDE_INSTRUCTIONS")
    for root, _, files in os.walk(dir_inst):
        for f in files:
            full_p = os.path.join(root, f)
            arc_p = os.path.relpath(full_p, dir_inst).replace("\\", "/")
            p06_files.append((full_p, arc_p))
            
    dir_ref = os.path.join(STAGE_DIR, "07_REFERENCE_MATERIAL")
    for root, _, files in os.walk(dir_ref):
        for f in files:
            full_p = os.path.join(root, f)
            arc_p = os.path.join("REFERENCE_AUDIT", os.path.relpath(full_p, dir_ref)).replace("\\", "/")
            p06_files.append((full_p, arc_p))
    info_06 = make_zip("AnesthAI_06_Claude_Instructions.zip", p06_files)
    packages_info.append(info_06)

    # -------------------------------------------------------------
    # VALIDATION: Test extraction of all 6 ZIPs
    # -------------------------------------------------------------
    val_root = os.path.abspath("out_predictions/staging_val_upload")
    if os.path.exists(val_root):
        shutil.rmtree(val_root)
    os.makedirs(val_root, exist_ok=True)
    
    print("\n--- Running Integrity Validation on All 6 Packages ---")
    for pkg in packages_info:
        pkg_val_dir = os.path.join(val_root, pkg["name"].replace(".zip", ""))
        os.makedirs(pkg_val_dir, exist_ok=True)
        with zipfile.ZipFile(pkg["path"], "r") as zf:
            zf.extractall(pkg_val_dir)
        extracted_count = sum(len(files) for _, _, files in os.walk(pkg_val_dir))
        assert extracted_count == pkg["file_count"], f"Mismatch in {pkg['name']}: {extracted_count} vs {pkg['file_count']}"
        assert pkg["size_mb"] < 15.0, f"Package {pkg['name']} exceeds 15 MB limit: {pkg['size_mb']:.2f} MB"
        print(f"  [PASS] {pkg['name']}: Extracted {extracted_count} files successfully. Size: {pkg['size_mb']:.2f} MB (< 15 MB).")

    shutil.rmtree(val_root)
    print("Validation directory cleaned up.\n")

    # -------------------------------------------------------------
    # WRITE PACKAGE_MANIFEST.md
    # -------------------------------------------------------------
    manifest_md = f"""# Claude Upload Package Manifest & Verification
**Directory:** `out_predictions/CLAUDE_UPLOAD_READY/`  
**Created:** November 6, 2026  
**Compression Engine:** ZIP DEFLATED (Compression Level 9)  
**Maximum Target Size:** Strictly < 15 MB per package  

---

## 1. Package Summary & Checksums

| Package Filename | File Count | Uncompressed Focus | Compressed Size | SHA-256 Checksum |
| :--- | :---: | :--- | :---: | :--- |
| **`AnesthAI_01_Manuscript.zip`** | {info_01['file_count']} | Final 6.0-page IEEE PDF, LaTeX (`main_final.tex`, `main.tex`), `references.bib`, `IEEEtran.cls`, `figures_polished/` | **{info_01['size_mb']:.2f} MB** | `{info_01['sha256']}` |
| **`AnesthAI_02_Audit_and_Metrics.zip`** | {info_02['file_count']} | `FINAL_RELEASE_AUDIT.md`, `reviewer_report.md`, `corrections_summary.md`, `Metrics_Verification.md`, author queries | **{info_02['size_mb']:.2f} MB** | `{info_02['sha256']}` |
| **`AnesthAI_03_Prediction_Evidence.zip`** | {info_03['file_count']} | 4 verified CSV prediction files ($2,143,291$ rows), threshold specs, contingency tables, export scripts | **{info_03['size_mb']:.2f} MB** | `{info_03['sha256']}` |
| **`AnesthAI_04_Project_Documentation.zip`** | {info_04['file_count']} | System architecture, API catalog, database schema, clinical formulas (Holliday-Segar, EBV), test QA logs | **{info_04['size_mb']:.2f} MB** | `{info_04['sha256']}` |
| **`AnesthAI_05_Figures_and_Screenshots.zip`** | {info_05['file_count']} | Figs. 1–7 publication figures, 12 authentic UI screenshots, all 10 clinical task ROC/CM plots, figure scripts | **{info_05['size_mb']:.2f} MB** | `{info_05['sha256']}` |
| **`AnesthAI_06_Claude_Instructions.zip`** | {info_06['file_count']} | `START_HERE.md`, `PROJECT_EVIDENCE_GUIDE.md`, `FINAL_CLAUDE_PAPER_PROMPT.md`, 25 verified reference audit | **{info_06['size_mb']:.2f} MB** | `{info_06['sha256']}` |

---

## 2. Detailed Internal Contents per Package

### `AnesthAI_01_Manuscript.zip` ({info_01['size_mb']:.2f} MB)
"""
    for f in sorted(info_01["files"]):
        manifest_md += f"- `{f}`\n"

    manifest_md += f"\n### `AnesthAI_02_Audit_and_Metrics.zip` ({info_02['size_mb']:.2f} MB)\n"
    for f in sorted(info_02["files"]):
        manifest_md += f"- `{f}`\n"

    manifest_md += f"\n### `AnesthAI_03_Prediction_Evidence.zip` ({info_03['size_mb']:.2f} MB)\n"
    for f in sorted(info_03["files"]):
        manifest_md += f"- `{f}`\n"

    manifest_md += f"\n### `AnesthAI_04_Project_Documentation.zip` ({info_04['size_mb']:.2f} MB)\n"
    for f in sorted(info_04["files"]):
        manifest_md += f"- `{f}`\n"

    manifest_md += f"\n### `AnesthAI_05_Figures_and_Screenshots.zip` ({info_05['size_mb']:.2f} MB)\n"
    for f in sorted(info_05["files"]):
        manifest_md += f"- `{f}`\n"

    manifest_md += f"\n### `AnesthAI_06_Claude_Instructions.zip` ({info_06['size_mb']:.2f} MB)\n"
    for f in sorted(info_06["files"]):
        manifest_md += f"- `{f}`\n"

    manifest_path = os.path.join(OUT_DIR, "PACKAGE_MANIFEST.md")
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest_md)
    print("PACKAGE_MANIFEST.md created.")

    # -------------------------------------------------------------
    # WRITE UPLOAD_ORDER.md
    # -------------------------------------------------------------
    upload_order_md = """# Claude Upload Order & Interaction Guide

This guide explains the optimal sequence for uploading the split ZIP packages to Claude so you never hit context or file size limits, and Claude gets the exact evidence in the logical order it needs.

---

## Recommended Upload Workflow

```mermaid
flowchart TD
    Step1["1. Upload AnesthAI_06_Claude_Instructions.zip<br/>(Master prompt, evidence map & rules)"] --> Step2["2. Upload AnesthAI_02_Audit_and_Metrics.zip<br/>(Ground truth metrics & audit reports)"]
    Step2 --> Step3["3. Upload AnesthAI_01_Manuscript.zip<br/>(LaTeX template, final PDF & bibliography)"]
    Step3 --> Step4["4. Upload AnesthAI_04_Project_Documentation.zip<br/>(Architecture, API endpoints, physiological formulas)"]
    Step4 --> Step5["5. Upload AnesthAI_05_Figures_and_Screenshots.zip<br/>(Visual figures, ROC/PR curves & UI screenshots)"]
    Step5 --> Step6["6. Upload AnesthAI_03_Prediction_Evidence.zip<br/>(Raw CSV prediction files - if detailed re-plotting needed)"]
```

---

## Step-by-Step Instructions

### Step 1: Upload `AnesthAI_06_Claude_Instructions.zip` (0.02 MB)
* **Why First:** This package contains `START_HERE.md`, `PROJECT_EVIDENCE_GUIDE.md`, and `FINAL_CLAUDE_PAPER_PROMPT.md`.
* **Prompt to Give Claude:**
  > *"I am providing the instructions and evidence guide for writing my IEEE research paper: 'AnesthAI SafeDose: Anesthesia Dose Calculation and Safety Support System'. Please unpack this archive, inspect `START_HERE.md` and `FINAL_CLAUDE_PAPER_PROMPT.md`, and confirm you understand the ground-truth rules and strict 6.0-page IEEE format."*

### Step 2: Upload `AnesthAI_02_Audit_and_Metrics.zip` (0.03 MB)
* **Why Second:** This package contains `FINAL_RELEASE_AUDIT.md`, `Metrics_Verification.md`, and `reviewer_report.md`.
* **Prompt to Give Claude:**
  > *"Here is the authoritative release audit and metric verification package. `FINAL_RELEASE_AUDIT.md` is your primary source of truth. Note the exact 4 CSV prediction tasks (Arrhythmia AUC 0.9414, Hypotension AUC 0.6927 at threshold 0.500, Hypoxia AUC 0.9047, Tachycardia AUC 0.6980) and the 6 locked audit-baseline tasks. Confirm receipt of the ground truth."*

### Step 3: Upload `AnesthAI_01_Manuscript.zip` (6.55 MB)
* **Why Third:** This package contains the existing 6.0-page PDF (`AnesthAI_IEEE_Final.pdf`), LaTeX source (`main_final.tex`), `IEEEtran.cls`, and `references.bib`.
* **Prompt to Give Claude:**
  > *"Here is the current manuscript source code and compiled PDF. Inspect `main_final.tex` to understand how the sections, tables (Tables I–VI), and figures (Figs. 1–7) are structured in two-column IEEE format."*

### Step 4: Upload `AnesthAI_04_Project_Documentation.zip` (0.02 MB)
* **Why Fourth:** Provides background on deterministic formulas (Holliday-Segar, Nadler EBV, ATLS, Janmahasatian), API endpoints, and system architecture.
* **Prompt to Give Claude:**
  > *"Here is the system architecture, clinical calculations, and software test documentation to support the methodology and clinical justification in Sections III and IV."*

### Step 5: Upload `AnesthAI_05_Figures_and_Screenshots.zip` (11.17 MB)
* **Why Fifth:** Contains high-resolution publication figures (Figs. 1–7), ROC/PR curves, confusion matrices, and 12 authentic application screenshots.
* **Prompt to Give Claude:**
  > *"Here are the high-resolution figures, confusion matrices, and application screenshots referenced in the paper. Refer to `figure_inventory.md` for exact captions and dimensions."*

### Step 6 (Optional / As Needed): Upload `AnesthAI_03_Prediction_Evidence.zip` (9.80 MB)
* **Why Last:** This package contains the four raw CSV prediction files ($2,143,291$ total samples) and evaluation scripts.
* **When Needed:** Claude already has all exact verified metrics in `Metrics_Verification.md` (from Step 2). Only upload this package if you want Claude to perform fresh data analysis or re-plot graphs directly from raw CSV data.

---

## Size Verification Guarantee
Every package in this folder is strictly **below 15 MB**:
- `AnesthAI_06_Claude_Instructions.zip`: 0.02 MB
- `AnesthAI_02_Audit_and_Metrics.zip`: 0.03 MB
- `AnesthAI_04_Project_Documentation.zip`: 0.02 MB
- `AnesthAI_01_Manuscript.zip`: 6.55 MB
- `AnesthAI_03_Prediction_Evidence.zip`: 9.80 MB
- `AnesthAI_05_Figures_and_Screenshots.zip`: 11.17 MB

No upload will fail Claude's file size threshold!
"""
    upload_order_path = os.path.join(OUT_DIR, "UPLOAD_ORDER.md")
    with open(upload_order_path, "w", encoding="utf-8") as f:
        f.write(upload_order_md)
    print("UPLOAD_ORDER.md created.")

if __name__ == "__main__":
    build_all_packages()

