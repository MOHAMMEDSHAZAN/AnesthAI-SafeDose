import sys

libs = [
    "pandas", "numpy", "sklearn", "xgboost", "lightgbm", "catboost",
    "optuna", "shap", "lime", "fastapi", "uvicorn", "wfdb", 
    "torch", "pytorch_tabnet", "scipy"
]

print("Python version:", sys.version)
print("Executable:", sys.executable)
print("\nChecking libraries:")
for lib in libs:
    try:
        __import__(lib)
        print(f"  {lib}: AVAILABLE")
    except ImportError as e:
        print(f"  {lib}: NOT AVAILABLE ({e})")
