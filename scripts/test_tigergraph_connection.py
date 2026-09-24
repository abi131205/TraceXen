import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.config import settings

def test_connection():
    print("=== TIGERGRAPH LIVE SAVANNA CONNECTION DIAGNOSTIC ===")
    
    host = settings.TG_HOST.strip() or os.getenv("TG_HOST", "").strip()
    secret = settings.TG_SECRET.strip() or os.getenv("TG_SECRET", "").strip()
    graphname = settings.TG_GRAPHNAME.strip() or os.getenv("TG_GRAPHNAME", "TraceXenGraph").strip()
    
    print(f"Target TG_HOST     : {host if host else '(Not set)'}")
    print(f"Target TG_GRAPHNAME: {graphname}")
    print(f"Secret Configured  : {'YES' if secret else 'NO'}")
    
    if not host:
        print("\n[INFO] TG_HOST is not set.")
        return False

    version_url = f"{host.rstrip('/')}/restpp/version"
    
    print(f"\n1. Testing network reachability to {host}...")
    rest_reachable = False
    try:
        with httpx.Client(timeout=10.0, verify=False) as client:
            resp = client.get(version_url)
            if resp.status_code in [200, 403]:
                print(f"   SUCCESS: Reached live TigerGraph Savanna RESTPP service!")
                rest_reachable = True
            elif "Failed to start workspace" in resp.text:
                print(f"   [NOTICE] TigerGraph Savanna Workspace is currently in STOPPED state.")
                print(f"   Message: {resp.text.strip()[:120]}")
                print(f"   Action: Please click 'Start' on Workspace-1 at https://savanna.tgcloud.io to wake up the database.")
                return False
            else:
                print(f"   HTTP Response Code: {resp.status_code}")
    except Exception as e:
        print(f"   [NOTICE] Connection attempt exception: {e}")

    auth_success = False
    token = None
    if secret:
        print("\n2. Testing authentication token request...")
        auth_url = f"{host.rstrip('/')}/gsql/v1/tokens"
        try:
            with httpx.Client(timeout=10.0, verify=False) as client:
                res = client.post(auth_url, json={"secret": secret, "graph": graphname})
                if res.status_code == 200:
                    data = res.json()
                    token = data.get("token", "") or data.get("results", {}).get("token", "")
                    if token:
                        print(f"   SUCCESS: Authentication token generated successfully!")
                        auth_success = True
                elif "Failed to start workspace" in res.text:
                    print(f"   [NOTICE] TigerGraph Savanna Workspace is currently in STOPPED state.")
                    print(f"   Action: Please click 'Start' on Workspace-1 at https://savanna.tgcloud.io")
                else:
                    print(f"   Auth endpoint ({res.status_code}): {res.text[:100]}")
        except Exception as e:
            print(f"   Auth request exception: {e}")
                
        if auth_success and token:
            print("\n3. Verifying live TraceXenGraph schema access...")
            schema_url = f"{host.rstrip('/')}/gsql/v1/schema?graph={graphname}"
            headers = {"Authorization": f"Bearer {token}"}
            try:
                with httpx.Client(timeout=10.0, verify=False) as client:
                    s_res = client.get(schema_url, headers=headers)
                    if s_res.status_code == 200:
                        print(f"   SUCCESS: Live TraceXenGraph schema fetched!")
                        s_data = s_res.json().get("results", {})
                        g_list = s_data.get("Graph", [])
                        v_types = [v.get("Name") for v in g_list[0].get("VertexTypes", [])] if g_list else []
                        e_types = [e.get("Name") for e in g_list[0].get("EdgeTypes", [])] if g_list else []
                        print(f"   Live Vertices ({len(v_types)}): {v_types}")
                        print(f"   Live Edges ({len(e_types)}): {e_types}")
                    else:
                        print(f"   Schema endpoint ({s_res.status_code}): {s_res.text[:150]}")
            except Exception as e:
                print(f"   Schema query exception: {e}")
    else:
        print("\n2. Authentication test skipped (TG_SECRET is empty in .env).")

    print("\nDiagnostic check summary:")
    print(f" - Live Host Reachable : {'SUCCESS' if rest_reachable else 'FAILED'}")
    print(f" - Authentication      : {'SUCCESS' if auth_success else 'FAILED / STOPPED'}")
    return rest_reachable and auth_success

if __name__ == "__main__":
    test_connection()
