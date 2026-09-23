import os
import pickle
import torch
import json

# Project root audit script for AnesthAI-SafeDose models directory
models_dir = 'models'
all_files = sorted(os.listdir(models_dir))
pkl_pt = [f for f in all_files if f.endswith('.pkl') or f.endswith('.pt')]

validated_tasks = [
    'Hypotension', 'Hypoxia', 'Bradycardia', 'Tachycardia', 'Arrhythmia',
    'EmergencySeverity', 'BloodLoss', 'FluidRecommendation', 'ICU', 'Mortality'
]

non_validated_tasks = [
    'Airway', 'RiskPrediction', 'PONV', 'PACU', 'DrugSafety', 'prototype_baseline'
]

task_datasets = {
    'Hypotension': 'VitalDB High-Frequency Hemodynamics',
    'Hypoxia': 'VitalDB High-Frequency Hemodynamics',
    'Bradycardia': 'VitalDB High-Frequency Hemodynamics',
    'Tachycardia': 'VitalDB High-Frequency Hemodynamics',
    'Arrhythmia': 'MIT-BIH WFDB Arrhythmia Database',
    'EmergencySeverity': 'MIMIC-IV ED',
    'BloodLoss': 'MIMIC-IV 3.1 Clinical Database',
    'FluidRecommendation': 'MIMIC-IV 3.1 Clinical Database',
    'ICU': 'MIMIC-IV 3.1 Clinical Database',
    'Mortality': 'MIMIC-IV 3.1 Clinical Database'
}

inventory = []

for f in pkl_pt:
    path = os.path.join(models_dir, f)
    name_no_ext = os.path.splitext(f)[0]
    matched_task = None
    
    # Identify task
    for vt in validated_tasks:
        if name_no_ext == vt or name_no_ext.startswith(vt + '_'):
            matched_task = vt
            break
    if not matched_task:
        for nvt in non_validated_tasks:
            if name_no_ext == nvt or name_no_ext.startswith(nvt + '_'):
                matched_task = nvt
                break
    if not matched_task:
        matched_task = name_no_ext.split('_')[0]

    is_validated = (matched_task in validated_tasks)
    
    algorithm = 'Unknown'
    dataset = task_datasets.get(matched_task, 'Synthetic / Unverified Mock Cohort')
    
    if f.endswith('.pkl'):
        try:
            with open(path, 'rb') as fp:
                d = pickle.load(fp)
            if isinstance(d, dict):
                algorithm = d.get('algorithm', type(d.get('model')).__name__ if d.get('model') else 'Pickle Dictionary')
                if 'dataset' in d:
                    dataset = d['dataset']
            else:
                algorithm = type(d).__name__
        except Exception as e:
            algorithm = f'Error: {e}'
    elif f.endswith('.pt'):
        suffix = name_no_ext[len(matched_task):].lstrip('_')
        suffix_clean = suffix.replace('_', '-')
        algorithm = f'PyTorch {suffix_clean}' if suffix_clean else 'PyTorch Neural Network'
        try:
            ckpt = torch.load(path, map_location='cpu', weights_only=False)
            if isinstance(ckpt, dict) and 'architecture' in ckpt:
                algorithm = f'PyTorch {ckpt["architecture"]}'
        except Exception:
            pass

    reason = ''
    if not is_validated:
        if matched_task in ['Airway', 'RiskPrediction', 'PONV', 'PACU', 'DrugSafety']:
            reason = 'Unvalidated mock/heuristic demonstration dataset; lacks verified real clinical cohort benchmark validation'
        elif matched_task == 'prototype_baseline':
            reason = 'Exploratory prototype baseline trained on mock/ad-hoc features for UI demonstration only'
        else:
            reason = 'Non-standard / experimental artifact outside the 10 verified clinical benchmarks'

    # Check FastAPI loading & endpoint exposure under standard/existing .pkl loader:
    # In main_api.py standard loader:
    # model_files = [f for f in os.listdir('models') if f.endswith('.pkl')]
    # clf = data.get('model', None)
    # If clf is None (e.g. PyTorch deep learning models saved without sklearn model object in .pkl), it is skipped.
    loaded_by_fastapi = False
    if f.endswith('.pkl'):
        try:
            with open(path, 'rb') as fp:
                d = pickle.load(fp)
            if isinstance(d, dict) and d.get('model') is not None:
                loaded_by_fastapi = True
            elif not isinstance(d, dict):
                loaded_by_fastapi = True
        except Exception:
            loaded_by_fastapi = False

    exposed_endpoint = loaded_by_fastapi

    item = {
        'filename': f,
        'task': matched_task,
        'algorithm': algorithm,
        'dataset': dataset,
        'validated_or_non_validated': 'Validated' if is_validated else 'Non-validated',
        'reason_if_non_validated': reason,
        'loaded_by_fastapi': loaded_by_fastapi,
        'exposed_through_prediction_endpoint': exposed_endpoint
    }
    inventory.append(item)

# Print COMPLETE terminal output as requested
print("=" * 110)
print("SafeDose AI - MODEL INVENTORY AUDIT (models/ directory)")
print("=" * 110)
print(f"{'Filename':<35} | {'Task':<20} | {'Algorithm':<22} | {'Validated?':<14} | {'FastAPI':<8} | {'Endpoint'}")
print("-" * 110)
for item in inventory:
    val_str = item['validated_or_non_validated']
    fastapi_str = "YES" if item['loaded_by_fastapi'] else "NO"
    endpoint_str = "YES" if item['exposed_through_prediction_endpoint'] else "NO"
    print(f"{item['filename']:<35} | {item['task']:<20} | {item['algorithm']:<22} | {val_str:<14} | {fastapi_str:<8} | {endpoint_str}")
print("=" * 110)

# Summary statistics
pkl_files = [x for x in inventory if x['filename'].endswith('.pkl')]
pt_files = [x for x in inventory if x['filename'].endswith('.pt')]
val_items = [x for x in inventory if x['validated_or_non_validated'] == 'Validated']
non_val_items = [x for x in inventory if x['validated_or_non_validated'] == 'Non-validated']

validated_with_endpoints = sorted(list(set(x['task'] for x in val_items if x['exposed_through_prediction_endpoint'])))
validated_pytorch_not_loaded = sorted(list(set(x['task'] for x in val_items if x['task'] not in validated_with_endpoints)))

print("\nAUDIT SUMMARY:")
print(f"1. Total .pkl files: {len(pkl_files)}")
print(f"2. Total .pt files: {len(pt_files)}")
print(f"3. Total model artifacts: {len(inventory)}")
print(f"4. Number of validated artifacts: {len(val_items)}")
print(f"5. Number of non-validated artifacts: {len(non_val_items)}")
print(f"6. Validated tasks with usable FastAPI endpoints: {len(validated_with_endpoints)} ({', '.join(validated_with_endpoints)})")
print(f"7. Validated tasks that are PyTorch .pt/DL models (NOT loaded by existing .pkl FastAPI loader): {len(validated_pytorch_not_loaded)} ({', '.join(validated_pytorch_not_loaded)})")

# Save inventory.json in project root
output_path = 'inventory.json'
with open(output_path, 'w') as out:
    json.dump(inventory, out, indent=2)

print(f"\nSuccessfully generated {output_path} with {len(inventory)} entries.")
