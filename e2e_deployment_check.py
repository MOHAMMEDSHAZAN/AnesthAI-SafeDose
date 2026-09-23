import urllib.request
import json

def run_e2e():
    print("=== 1. CHECKING FRONTEND HTTP GET ===")
    fe_ok = False
    try:
        with urllib.request.urlopen("http://localhost:5173/") as resp:
            print(f"Frontend HTTP Status: {resp.status} (OK)")
            content = resp.read().decode("utf-8")
            print(f"Frontend HTML Length: {len(content)} bytes")
            fe_ok = (resp.status == 200)
    except Exception as e:
        print(f"Frontend Check Failed: {e}")

    print("\n=== 2. CHECKING BACKEND /health ===")
    be_ok = False
    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/health") as resp:
            h = json.loads(resp.read().decode("utf-8"))
            print(f"Backend Status: {h.get('status')}")
            print(f"Validated Models Count: {h.get('validated_models_count')}/10")
            print(f"Missing Models: {h.get('missing_models')}")
            print(f"Demo Models: {h.get('demo_models')}")
            be_ok = (
                resp.status == 200 and
                h.get("status") == "healthy" and
                h.get("validated_models_count") == 10 and
                len(h.get("missing_models")) == 0 and
                len(h.get("demo_models")) == 0
            )
    except Exception as e:
        print(f"Backend Health Check Failed: {e}")

    print("\n=== 3. END-TO-END PREDICTION SUITE FOR ALL 10 TASKS ===")
    with open("reports/feature_lists.json") as f:
        fl = json.load(f)

    e2e_results = {}
    for task, features in fl.items():
        url = f"http://127.0.0.1:8000/predict/{task}"
        payload = {"features": {col: 1.0 for col in features}}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                e2e_results[task] = {
                    "status": "PASS",
                    "prediction": data["prediction"],
                    "probability": data["probability"],
                    "risk_category": data["risk_category"]
                }
                print(f"  {task:20} -> PASS [Pred: {data['prediction']}, Prob: {data['probability']:.4f}, Risk: {data['risk_category']}]")
        except Exception as e:
            e2e_results[task] = {"status": "FAIL", "error": str(e)}
            print(f"  {task:20} -> FAIL [{e}]")

    passed_endpoints = sum(1 for r in e2e_results.values() if r["status"] == "PASS")
    print(f"\nTotal E2E Verified: {passed_endpoints}/10")

    all_pass = fe_ok and be_ok and (passed_endpoints == 10)
    print(f"\nOVERALL E2E STATUS: {'PASS' if all_pass else 'FAIL'}")
    return all_pass

if __name__ == "__main__":
    run_e2e()
