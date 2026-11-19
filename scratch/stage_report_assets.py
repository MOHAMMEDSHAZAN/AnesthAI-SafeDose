import os
import shutil

base_dir = "FINAL_ANESTHAI_PROJECT_REPORT"

# 1. Project Architecture Diagrams
arch_dir = os.path.join(base_dir, "Project_Architecture_Diagrams")
arch_sources = [
    ("anesth_ai_ieee/figures_polished/fig1_architecture.png", "fig1_system_architecture.png"),
    ("anesth_ai_ieee/figures_polished/fig1_architecture_submission.png", "fig1_architecture_detailed.png"),
    ("anesth_ai_ieee/figures_polished/fig2_workflow.png", "fig2_clinical_workflow.png")
]
for src, dst in arch_sources:
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(arch_dir, dst))
        print(f"Copied arch diagram: {dst}")

# 2. Project Screenshots
screens_dir = os.path.join(base_dir, "Project_Screenshots")
screens_src_dir = "out_predictions/staging_claude_package/05_WEBSITE_SCREENSHOTS"
if os.path.exists(screens_src_dir):
    for f in os.listdir(screens_src_dir):
        if f.endswith(".png") or f.endswith(".md"):
            shutil.copy2(os.path.join(screens_src_dir, f), os.path.join(screens_dir, f))
            print(f"Copied screenshot: {f}")

# 3. Model Results and Graphs
graphs_dir = os.path.join(base_dir, "Model_Results_and_Graphs")
graph_sources = [
    ("anesth_ai_ieee/figures_polished/fig4_roc_pr_curves.png", "roc_pr_curves_4_tasks.png"),
    ("anesth_ai_ieee/figures_polished/fig5_arrhythmia_cm.png", "arrhythmia_confusion_matrix.png"),
    ("out_predictions/CLAUDE_EXPORT/verified_metrics.csv", "verified_metrics.csv"),
    ("out_predictions/CLAUDE_EXPORT/confusion_matrices.csv", "confusion_matrices.csv"),
    ("out_predictions/CLAUDE_EXPORT/Arrhythmia_threshold.txt", "Arrhythmia_threshold.txt"),
    ("out_predictions/CLAUDE_EXPORT/Hypotension_threshold.txt", "Hypotension_threshold.txt"),
    ("out_predictions/CLAUDE_EXPORT/Hypoxia_threshold.txt", "Hypoxia_threshold.txt"),
    ("out_predictions/CLAUDE_EXPORT/Tachycardia_threshold.txt", "Tachycardia_threshold.txt")
]
for src, dst in graph_sources:
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(graphs_dir, dst))
        print(f"Copied model result: {dst}")

# Also copy from all_task_plots if present
task_plots_src = "out_predictions/staging_claude_package/04_FIGURES_AND_GRAPHS/all_task_plots"
if os.path.exists(task_plots_src):
    plots_dest = os.path.join(graphs_dir, "all_task_plots")
    os.makedirs(plots_dest, exist_ok=True)
    for f in os.listdir(task_plots_src):
        if f.endswith(".png"):
            shutil.copy2(os.path.join(task_plots_src, f), os.path.join(plots_dest, f))
    print("Copied all_task_plots")

# 4. References and Bibliography
refs_dir = os.path.join(base_dir, "References_and_Bibliography")
ref_sources = [
    ("anesth_ai_ieee/references.bib", "references.bib"),
    ("REFERENCE_VERIFICATION_REPORT.md", "REFERENCE_VERIFICATION_REPORT.md"),
    ("out_predictions/staging_claude_package/07_REFERENCE_MATERIAL/PUBLICATION_METADATA.md", "PUBLICATION_METADATA.md")
]
for src, dst in ref_sources:
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(refs_dir, dst))
        print(f"Copied reference: {dst}")

print("Assets successfully staged!")

