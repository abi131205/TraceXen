import os
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "HHGOA_IEEE")

def inspect_hhg001():
    print("=== INSPECTING HHG-001 ===")
    df_cases = pd.read_csv(os.path.join(DATA_DIR, "case_pack.csv"))
    c001 = df_cases[df_cases["case_id"] == "HHG-001"].iloc[0]
    print("HHG-001 Case Pack row:")
    print(dict(c001))

    flagged_id = int(c001["flagged_txn_id"])
    cust_id = str(c001["customer_id"])

    # Load transactions for C12382
    tx_path = os.path.join(DATA_DIR, "transactions.csv")
    df_tx = pd.read_csv(tx_path, low_memory=False)
    
    cust_txs = df_tx[df_tx["customer_id"] == cust_id].sort_values("ts")
    print(f"\nTotal transactions for customer {cust_id}: {len(cust_txs)}")
    print(cust_txs[["TransactionID", "ts", "TransactionAmt", "channel", "risk_score", "ProductCD", "addr1", "addr2", "P_emaildomain", "R_emaildomain"]].to_string())

    # Check identity for flagged txn
    id_path = os.path.join(DATA_DIR, "identity.csv")
    df_id = pd.read_csv(id_path, low_memory=False)
    flagged_id_rec = df_id[df_id["TransactionID"] == flagged_id]
    print(f"\nIdentity record for flagged txn {flagged_id}:")
    if not flagged_id_rec.empty:
        print(flagged_id_rec.to_dict(orient="records")[0])
    else:
        print("No identity record (in_person / channel W).")

    # Check closed cases for customer C12382
    closed_path = os.path.join(DATA_DIR, "closed_cases_history.csv")
    df_closed = pd.read_csv(closed_path, low_memory=False)
    cust_closed = df_closed[df_closed["customer_id"] == cust_id]
    print(f"\nClosed cases for customer {cust_id}: {len(cust_closed)}")
    if not cust_closed.empty:
        print(cust_closed.to_dict(orient="records"))

if __name__ == "__main__":
    inspect_hhg001()
