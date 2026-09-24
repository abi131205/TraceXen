import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))
from app.config import settings

host = settings.TG_HOST.strip()
secret = settings.TG_SECRET.strip()
graphname = settings.TG_GRAPHNAME.strip()

with httpx.Client(timeout=15.0, verify=False) as client:
    res = client.post(f"{host.rstrip('/')}/gsql/v1/tokens", json={"secret": secret, "graph": graphname})
    token = res.json().get("token", "") or res.json().get("results", {}).get("token", "")

headers = {"Authorization": f"Bearer {token}"}

vertex_types = ["Customer", "Card", "Transaction", "DeviceProfile", "EmailDomain", "BillingRegion", "ClosedCase", "InvestigationCase"]
counts = {}

with httpx.Client(timeout=10.0, verify=False) as client:
    for v_type in vertex_types:
        r = client.get(f"{host.rstrip('/')}/restpp/graph/{graphname}/vertices/{v_type}?limit=1", headers=headers)
        if r.status_code == 200:
            # Check stats or results
            counts[v_type] = len(r.json().get("results", []))

print("Vertex count sampling:", counts)

# Get built-in stats if available
with httpx.Client(timeout=10.0, verify=False) as client:
    r_stat = client.post(f"{host.rstrip('/')}/restpp/builtins/{graphname}", json={"tech": "stat_graph"}, headers=headers)
    if r_stat.status_code == 200:
        print("Graph stats:", r_stat.json())
