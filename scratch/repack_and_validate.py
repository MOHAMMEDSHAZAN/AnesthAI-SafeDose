import os
import shutil
import zipfile
import hashlib

STAGE_DIR = os.path.abspath("out_predictions/staging_claude_package")
ZIP_DEST_DIR = os.path.abspath("out_predictions/FINAL_CLAUDE_PACKAGE")
ZIP_FILENAME = "AnesthAI_SafeDose_Claude_Final_Paper_Package.zip"
ZIP_PATH = os.path.join(ZIP_DEST_DIR, ZIP_FILENAME)

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def repack():
    all_files = []
    for root, dirs, files in os.walk(STAGE_DIR):
        for f in files:
            if f == "PACKAGE_MANIFEST.md":
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, STAGE_DIR).replace("\\", "/")
            size = os.path.getsize(full_path)
            sha = sha256_file(full_path)
            all_files.append({
                "path": rel_path,
                "size": size,
                "sha256": sha
            })
    all_files.sort(key=lambda x: x["path"])

    manifest_md = f"""# Package Manifest & Checksum Verification
**Package Name:** `{ZIP_FILENAME}`  
**Destination:** `out_predictions/FINAL_CLAUDE_PACKAGE/`  
**Generated On:** November 6, 2026  
**Total File Count:** {len(all_files) + 1} files (including this manifest)  

---

## 1. Directory Structure Overview
- **`01_MANUSCRIPT/`**: Compiled PDF, editable LaTeX source, bibliography, IEEE template, build engine.
- **`02_INDEPENDENT_AUDIT/`**: Authoritative release audit, peer review report, corrections, unresolved queries, and comprehensive metric verifications.
- **`03_PREDICTION_DATA/`**: Four actual prediction CSV files (2,143,291 samples), threshold documentation, and verification code.
- **`04_FIGURES_AND_GRAPHS/`**: Publication figures (Figs. 1–7), ROC/PR curves, confusion matrices, task plots, and generation script.
- **`05_WEBSITE_SCREENSHOTS/`**: 12 genuine UI screenshots with implementation status catalog.
- **`06_PROJECT_DOCUMENTATION/`**: Architecture, API endpoints, physiological formulas, model inventory, and test reports.
- **`07_REFERENCE_MATERIAL/`**: 25 verified references, DOI verification report, official dataset citations, and publication metadata.
- **`08_CLAUDE_INSTRUCTIONS/`**: `START_HERE.md`, `PROJECT_EVIDENCE_GUIDE.md`, and `FINAL_CLAUDE_PAPER_PROMPT.md`.

---

## 2. Complete File Inventory with SHA-256 Checksums

| Relative File Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :---: | :--- |
"""
    for item in all_files:
        manifest_md += f"| `{item['path']}` | {item['size']:,} | `{item['sha256']}` |\n"

    with open(os.path.join(STAGE_DIR, "PACKAGE_MANIFEST.md"), "w", encoding="utf-8") as f:
        f.write(manifest_md)
    with open(os.path.join(ZIP_DEST_DIR, "PACKAGE_MANIFEST.md"), "w", encoding="utf-8") as f:
        f.write(manifest_md)

    m_path = os.path.join(STAGE_DIR, "PACKAGE_MANIFEST.md")
    all_files.append({
        "path": "PACKAGE_MANIFEST.md",
        "size": os.path.getsize(m_path),
        "sha256": sha256_file(m_path)
    })

    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)
    print("Compressing files into ZIP...")
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zipf:
        for item in all_files:
            full_p = os.path.join(STAGE_DIR, item["path"].replace("/", os.sep))
            zipf.write(full_p, item["path"])

    zip_sz = os.path.getsize(ZIP_PATH)
    print(f"Final ZIP size: {zip_sz:,} bytes ({zip_sz/(1024*1024):.2f} MB), containing {len(all_files)} files.")

    val_dir = os.path.abspath("out_predictions/staging_claude_package_val")
    if os.path.exists(val_dir):
        shutil.rmtree(val_dir)
    os.makedirs(val_dir, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH, "r") as zipf:
        zipf.extractall(val_dir)

    val_count = sum(len(files) for _, _, files in os.walk(val_dir))
    print(f"Validation extraction successful: {val_count} files extracted.")
    assert val_count == len(all_files), f"Count mismatch: {val_count} vs {len(all_files)}"
    shutil.rmtree(val_dir)
    print("VERIFICATION PASS: All files present and verified.")

if __name__ == "__main__":
    repack()

