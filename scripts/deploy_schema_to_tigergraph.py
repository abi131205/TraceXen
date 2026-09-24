import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.config import settings

def deploy_schema():
    print("=== DEPLOYING SCHEMA TO TRACEXENGRAPH ===")
    
    host = settings.TG_HOST.strip() or os.getenv("TG_HOST", "").strip()
    secret = settings.TG_SECRET.strip() or os.getenv("TG_SECRET", "").strip()
    graphname = settings.TG_GRAPHNAME.strip() or os.getenv("TG_GRAPHNAME", "TraceXenGraph").strip()
    
    if not host or not secret:
        print("ERROR: TG_HOST or TG_SECRET missing.")
        return False

    # 1. Acquire Token
    token_url = f"{host.rstrip('/')}/gsql/v1/tokens"
    token = None
    try:
        with httpx.Client(timeout=10.0, verify=False) as client:
            res = client.post(token_url, json={"secret": secret})
            if res.status_code != 200 or "token" not in res.json():
                res = client.post(token_url, json={"secret": secret, "graph": graphname})
                
            if res.status_code == 200:
                token = res.json().get("token", "") or res.json().get("results", {}).get("token", "")
                print(f"1. Token acquired successfully!")
            else:
                print(f"1. Token error ({res.status_code}): {res.text[:150]}")
                return False
    except Exception as e:
        print(f"1. Token exception: {e}")
        return False

    headers_plain = {"Authorization": f"Bearer {token}", "Content-Type": "text/plain"}
    endpoint = f"{host.rstrip('/')}/gsql/v1/statements"

    # Schema change job binding global types to TraceXenGraph
    stmts = [
        f"USE GRAPH {graphname}",
        f"CREATE GLOBAL SCHEMA_CHANGE JOB add_tracexen_types {{ ADD VERTEX Customer, Card, Transaction, DeviceProfile, EmailDomain, BillingRegion, ClosedCase, InvestigationCase TO GRAPH {graphname}; ADD EDGE OWNS, MADE, FROM_DEVICE, PURCHASER_EMAIL, BILLED_IN, NEXT, INVOLVES, ON_CARD, CONNECTED_TO, INVESTIGATES TO GRAPH {graphname}; }}",
        "RUN GLOBAL SCHEMA_CHANGE JOB add_tracexen_types",
        "DROP JOB add_tracexen_types"
    ]

    print(f"\n2. Executing GSQL schema change job on {graphname}...")
    for stmt in stmts:
        try:
            with httpx.Client(timeout=60.0, verify=False) as client:
                res = client.post(endpoint, content=stmt, headers=headers_plain)
                print(f"   Stmt [{stmt[:65]}...] -> HTTP {res.status_code}: {res.text.strip()[:200]}")
        except Exception as e:
            print(f"   Stmt exception: {e}")

    # 3. Verify Live Schema
    schema_url = f"{host.rstrip('/')}/gsql/v1/schema?graph={graphname}"
    deployed = False
    try:
        headers_auth = {"Authorization": f"Bearer {token}"}
        with httpx.Client(timeout=10.0, verify=False) as client:
            s_res = client.get(schema_url, headers=headers_auth)
            if s_res.status_code == 200:
                s_data = s_res.json().get("results", {})
                g_list = s_data.get("Graph", [])
                v_types = []
                e_types = []
                if g_list:
                    v_types = [v.get("Name") for v in g_list[0].get("VertexTypes", [])]
                    e_types = [e.get("Name") for e in g_list[0].get("EdgeTypes", [])]
                elif "VertexTypes" in s_data:
                    v_types = [v.get("Name") for v in s_data.get("VertexTypes", [])]
                    e_types = [e.get("Name") for e in s_data.get("EdgeTypes", [])]
                    
                print(f"\n3. Live Schema Status on {graphname}:")
                print(f"   Vertices ({len(v_types)}): {v_types}")
                print(f"   Edges ({len(e_types)}): {e_types}")
                if len(v_types) > 0:
                    deployed = True
    except Exception as e:
        print(f"Schema verification exception: {e}")

    return deployed

if __name__ == "__main__":
    deploy_schema()
