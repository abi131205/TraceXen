import os
import sys
import json
import httpx
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.config import settings

def deploy_and_test():
    print("=== TIGERGRAPH SAVANNA SAMPLE DATA LOADING & LIVE VERIFICATION ===")
    
    host = settings.TG_HOST.strip() or os.getenv("TG_HOST", "").strip()
    secret = settings.TG_SECRET.strip() or os.getenv("TG_SECRET", "").strip()
    graphname = settings.TG_GRAPHNAME.strip() or os.getenv("TG_GRAPHNAME", "TraceXenGraph").strip()
    
    if not host or not secret:
        print("ERROR: TG_HOST or TG_SECRET missing.")
        return False
        
    # 1. Acquire Auth Token via /gsql/v1/tokens
    token_url = f"{host.rstrip('/')}/gsql/v1/tokens"
    token = None
    try:
        with httpx.Client(timeout=15.0, verify=False) as client:
            res = client.post(token_url, json={"secret": secret})
            if res.status_code != 200 or "token" not in res.json():
                res = client.post(token_url, json={"secret": secret, "graph": graphname})
                
            if res.status_code == 200:
                token = res.json().get("token", "") or res.json().get("results", {}).get("token", "")
                print(f"\n1. Authentication SUCCESS! Session token acquired.")
            else:
                print(f"\n1. Authentication FAILED ({res.status_code}): {res.text[:150]}")
                return False
    except Exception as e:
        print(f"\n1. Authentication exception: {e}")
        return False

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verify Schema
    schema_url = f"{host.rstrip('/')}/gsql/v1/schema?graph={graphname}"
    try:
        with httpx.Client(timeout=15.0, verify=False) as client:
            s_res = client.get(schema_url, headers=headers)
            if s_res.status_code == 200:
                data = s_res.json().get("results", {})
                g_list = data.get("Graph", [])
                v_names = [v.get("Name") for v in g_list[0].get("VertexTypes", [])] if g_list else []
                e_names = [e.get("Name") for e in g_list[0].get("EdgeTypes", [])] if g_list else []
                print(f"\n2. Live TraceXenGraph Schema Verified:")
                print(f"   Vertices ({len(v_names)}): {v_names}")
                print(f"   Edges ({len(e_names)}): {e_names}")
    except Exception as e:
        print(f"\n2. Schema check exception: {e}")

    # 3. Upsert Sample Data in Batches of 100 rows
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sample")
    sample_tx_path = os.path.join(sample_dir, "sample_transactions.csv")
    sample_closed_path = os.path.join(sample_dir, "sample_closed_cases.csv")
    
    if os.path.exists(sample_tx_path):
        print(f"\n3. Upserting sample dataset in small batches from {sample_tx_path}...")
        df_sample = pd.read_csv(sample_tx_path)
        
        batch_size = 100
        total_rows = len(df_sample)
        upsert_url = f"{host.rstrip('/')}/restpp/graph/{graphname}"
        
        accepted_v = 0
        accepted_e = 0

        # Load ONLY sample transactions (which includes 3514030)
        df_target = df_sample.copy()

        for i in range(0, len(df_target), batch_size):
            chunk = df_target.iloc[i:i+batch_size]
            vertices_payload = {"Transaction": {}, "Customer": {}, "Card": {}}
            edges_payload = {"Customer": {}, "Card": {}}
            
            for _, row in chunk.iterrows():
                tx_id = str(row["TransactionID"])
                cust_id = str(row["customer_id"])
                card_id = f"{cust_id}-K1"
                
                vertices_payload["Transaction"][tx_id] = {
                    "amount": {"value": float(row["TransactionAmt"])},
                    "ts": {"value": str(row["ts"])},
                    "channel": {"value": str(row["channel"])},
                    "risk_score": {"value": float(row["risk_score"])},
                    "product_cd": {"value": str(row["ProductCD"])},
                    "customer_id": {"value": cust_id}
                }
                vertices_payload["Customer"][cust_id] = {}
                vertices_payload["Card"][card_id] = {
                    "card_type": {"value": str(row.get("card6", "debit")) if pd.notnull(row.get("card6")) else "debit"},
                    "card_network": {"value": str(row.get("card4", "visa")) if pd.notnull(row.get("card4")) else "visa"},
                    "card_category": {"value": "standard"}
                }
                
                if cust_id not in edges_payload["Customer"]:
                    edges_payload["Customer"][cust_id] = {"OWNS": {"Card": {}}}
                edges_payload["Customer"][cust_id]["OWNS"]["Card"][card_id] = {}
                
                if card_id not in edges_payload["Card"]:
                    edges_payload["Card"][card_id] = {"MADE": {"Transaction": {}}}
                edges_payload["Card"][card_id]["MADE"]["Transaction"][tx_id] = {}

            payload = {"vertices": vertices_payload, "edges": edges_payload}
            
            try:
                with httpx.Client(timeout=20.0, verify=False) as client:
                    up_res = client.post(upsert_url, json=payload, headers=headers)
                    if up_res.status_code == 200:
                        up_data = up_res.json().get("results", [{}])[0]
                        accepted_v += up_data.get('accepted_vertices', 0)
                        accepted_e += up_data.get('accepted_edges', 0)
            except Exception as e:
                print(f"   Batch {i} exception: {e}")

        # Add Closed Cases to payload
        if os.path.exists(sample_closed_path):
            df_closed = pd.read_csv(sample_closed_path)
            c_vertices = {"ClosedCase": {}}
            c_edges = {"ClosedCase": {}}
            for _, c_row in df_closed.iterrows():
                cc_id = str(c_row["case_id"])
                c_card = str(c_row["card_id"])
                c_cust = str(c_row["customer_id"])
                c_vertices["ClosedCase"][cc_id] = {
                    "verdict": {"value": str(c_row["outcome"])},
                    "pattern": {"value": str(c_row["pattern"])},
                    "exposure": {"value": float(c_row["exposure_usd"]) if pd.notnull(c_row["exposure_usd"]) else 0.0},
                    "summary": {"value": str(c_row.get("analyst_notes", ""))} if pd.notnull(c_row.get("analyst_notes")) else {"value": ""},
                    "analyst_notes": {"value": str(c_row.get("analyst_notes", ""))} if pd.notnull(c_row.get("analyst_notes")) else {"value": ""}
                }
                if cc_id not in c_edges["ClosedCase"]:
                    c_edges["ClosedCase"][cc_id] = {"ON_CARD": {"Card": {}}}
                c_edges["ClosedCase"][cc_id]["ON_CARD"]["Card"][c_card] = {}

            try:
                with httpx.Client(timeout=20.0, verify=False) as client:
                    up_c_res = client.post(upsert_url, json={"vertices": c_vertices, "edges": c_edges}, headers=headers)
                    if up_c_res.status_code == 200:
                        c_data = up_c_res.json().get("results", [{}])[0]
                        accepted_v += c_data.get('accepted_vertices', 0)
                        accepted_e += c_data.get('accepted_edges', 0)
            except Exception as e:
                print(f"   Closed cases batch exception: {e}")

        print(f"   SUCCESS: Total accepted vertices: {accepted_v}, accepted edges: {accepted_e}")

    # 4. Authenticated Live Entity & Relationship Verification Queries
    print("\n4. Running Live Entity & Relationship Verification Queries against TraceXenGraph...")
    
    tx_verified = False
    tx_url = f"{host.rstrip('/')}/restpp/graph/{graphname}/vertices/Transaction/3514030"
    try:
        with httpx.Client(timeout=10.0, verify=False) as client:
            t_res = client.get(tx_url, headers=headers)
            if t_res.status_code == 200 and t_res.json().get("results"):
                print("   [VERIFIED] Transaction 3514030 exists in live graph!")
                tx_verified = True
            else:
                print(f"   [CHECK] Transaction 3514030 lookup ({t_res.status_code}): {t_res.text[:120]}")
    except Exception as e:
        print(f"   Transaction verification exception: {e}")

    cust_verified = False
    cust_url = f"{host.rstrip('/')}/restpp/graph/{graphname}/vertices/Customer/C12382"
    try:
        with httpx.Client(timeout=10.0, verify=False) as client:
            c_res = client.get(cust_url, headers=headers)
            if c_res.status_code == 200 and c_res.json().get("results"):
                print("   [VERIFIED] Customer C12382 exists in live graph!")
                cust_verified = True
            else:
                print(f"   [CHECK] Customer C12382 lookup ({c_res.status_code}): {c_res.text[:120]}")
    except Exception as e:
        print(f"   Customer verification exception: {e}")

    card_verified = False
    card_url = f"{host.rstrip('/')}/restpp/graph/{graphname}/vertices/Card/C12382-K1"
    try:
        with httpx.Client(timeout=10.0, verify=False) as client:
            cd_res = client.get(card_url, headers=headers)
            if cd_res.status_code == 200 and cd_res.json().get("results"):
                print("   [VERIFIED] Card C12382-K1 exists in live graph!")
                card_verified = True
            else:
                print(f"   [CHECK] Card C12382-K1 lookup ({cd_res.status_code}): {cd_res.text[:120]}")
    except Exception as e:
        print(f"   Card verification exception: {e}")

    cases_verified = 0
    target_cases = ["CC-1066", "CC-1673", "CC-2964", "CC-3587"]
    for cc_id in target_cases:
        cc_url = f"{host.rstrip('/')}/restpp/graph/{graphname}/vertices/ClosedCase/{cc_id}"
        try:
            with httpx.Client(timeout=10.0, verify=False) as client:
                cc_res = client.get(cc_url, headers=headers)
                if cc_res.status_code == 200 and cc_res.json().get("results"):
                    cases_verified += 1
        except Exception as e:
            pass
            
    print(f"   [VERIFIED] ClosedCases: {cases_verified} / {len(target_cases)} target cases verified in live graph!")

    # Verify Live Edges
    edges_verified = False
    edge_url = f"{host.rstrip('/')}/restpp/graph/{graphname}/edges/Customer/C12382/OWNS/Card/C12382-K1"
    try:
        with httpx.Client(timeout=10.0, verify=False) as client:
            edge_res = client.get(edge_url, headers=headers)
            if edge_res.status_code == 200 and edge_res.json().get("results"):
                print("   [VERIFIED] Live Edge Customer C12382 -> OWNS -> Card C12382-K1 exists!")
                edges_verified = True
    except Exception as e:
        print(f"   Edge verification exception: {e}")

    return tx_verified and cust_verified and card_verified and (cases_verified == len(target_cases)) and edges_verified

if __name__ == "__main__":
    deploy_and_test()
