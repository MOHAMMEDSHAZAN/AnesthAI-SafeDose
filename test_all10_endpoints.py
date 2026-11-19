import urllib.request
import json
import os
import sys

project_root = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(project_root, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from auth_utils import create_jwt_token
from rbac_matrix import ROLE_ANESTHESIOLOGIST

token = create_jwt_token({"sub": "test_user", "role": ROLE_ANESTHESIOLOGIST}, expires_in=3600)
BASE_URL = os.environ.get("VITE_API_URL", os.environ.get("API_URL", "http://127.0.0.1:8000")).strip('"').strip("'")
if not BASE_URL.startswith("http"):
    BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    print(f"=== TESTING {BASE_URL}/health ===")
    req = urllib.request.Request(f'{BASE_URL}/health')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print(json.dumps(data, indent=2))
        assert data["status"] == "healthy", "Health check status not healthy!"
        assert data["validated_models_count"] == 10, f"Expected 10 validated models, found {data['validated_models_count']}"
        assert len(data["missing_models"]) == 0, f"Missing models: {data['missing_models']}"

    print(f"\n=== TESTING ALL 10 PREDICTION ENDPOINTS ON {BASE_URL} ===")
    with open('reports/feature_lists.json') as f:
        fl = json.load(f)

    results = []
    for task, features in fl.items():
        url = f'{BASE_URL}/predict/{task}'
        payload = {'features': {col: 1.0 for col in features}}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
            }
        )
        try:
            with urllib.request.urlopen(req) as resp:
                out = json.loads(resp.read().decode('utf-8'))
                pred = out['prediction']
                prob = out['probability']
                risk = out['risk_category']
                results.append((task, 'PASS', pred, prob, risk))
                print(f"PASS: {task:20} -> Pred: {pred}, Prob: {prob:.4f}, Risk: {risk}")
        except Exception as e:
            results.append((task, 'FAIL', str(e)))
            print(f"FAIL: {task:20} -> Error: {e}")

    passes = sum(1 for r in results if r[1] == 'PASS')
    print(f"\nENDPOINT VERIFICATION SUMMARY: {passes}/{len(fl)} endpoints passed!")
    return passes == len(fl)

if __name__ == '__main__':
    test_endpoints()
