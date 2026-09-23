import urllib.request
import json

def test_endpoints():
    print("=== TESTING /health ===")
    req = urllib.request.Request('http://127.0.0.1:8000/health')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print(json.dumps(data, indent=2))
        assert data["status"] == "healthy", "Health check status not healthy!"
        assert data["validated_models_count"] == 10, f"Expected 10 validated models, found {data['validated_models_count']}"
        assert len(data["missing_models"]) == 0, f"Missing models: {data['missing_models']}"

    print("\n=== TESTING ALL 10 PREDICTION ENDPOINTS ===")
    with open('reports/feature_lists.json') as f:
        fl = json.load(f)

    results = []
    for task, features in fl.items():
        url = f'http://127.0.0.1:8000/predict/{task}'
        payload = {'features': {col: 1.0 for col in features}}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
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
