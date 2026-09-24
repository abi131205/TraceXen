import os
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "HHGOA_IEEE")
SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sample")

def prepare_sample():
    print("=== PREPARING SMALL REPRESENTATIVE SAMPLE FOR SMOKE TEST ===")
    os.makedirs(SAMPLE_DIR, exist_ok=True)
    
    # 1. Target customer & case pack flagged transactions
    df_cases = pd.read_csv(os.path.join(DATA_DIR, "case_pack.csv"))
    target_txns = set(df_cases["flagged_txn_id"].dropna().astype(int).tolist())
    target_custs = set(df_cases["customer_id"].dropna().astype(str).tolist())
    
    # 2. Extract sample from transactions.csv
    tx_path = os.path.join(DATA_DIR, "transactions.csv")
    cols = ["TransactionID", "TransactionAmt", "ts", "channel", "risk_score", "ProductCD", "card1", "card2", "card3", "card4", "card5", "card6", "addr1", "addr2", "P_emaildomain", "R_emaildomain", "customer_id"]
    
    # Read transactions in chunks
    sample_tx_list = []
    chunksize = 100000
    for chunk in pd.read_csv(tx_path, chunksize=chunksize, low_memory=False):
        # Match target customers or flagged txns
        matched = chunk[(chunk["customer_id"].isin(target_custs)) | (chunk["TransactionID"].isin(target_txns))]
        if not matched.empty:
            sample_tx_list.append(matched)
            
        if sum(len(c) for c in sample_tx_list) >= 500:
            break
            
    df_sample_tx = pd.concat(sample_tx_list, ignore_index=True)
    sample_tx_path = os.path.join(SAMPLE_DIR, "sample_transactions.csv")
    df_sample_tx.to_csv(sample_tx_path, index=False)
    print(f"Created {sample_tx_path} with {len(df_sample_tx)} transactions.")
    
    # 3. Extract sample identity records
    sample_txn_ids = set(df_sample_tx["TransactionID"].astype(int).tolist())
    id_path = os.path.join(DATA_DIR, "identity.csv")
    df_id = pd.read_csv(id_path, low_memory=False)
    df_sample_id = df_id[df_id["TransactionID"].isin(sample_txn_ids)]
    sample_id_path = os.path.join(SAMPLE_DIR, "sample_identity.csv")
    df_sample_id.to_csv(sample_id_path, index=False)
    print(f"Created {sample_id_path} with {len(df_sample_id)} identity records.")
    
    # 4. Extract sample closed cases
    closed_path = os.path.join(DATA_DIR, "closed_cases_history.csv")
    df_closed = pd.read_csv(closed_path, low_memory=False)
    df_sample_closed = df_closed[df_closed["customer_id"].isin(target_custs)]
    sample_closed_path = os.path.join(SAMPLE_DIR, "sample_closed_cases.csv")
    df_sample_closed.to_csv(sample_closed_path, index=False)
    print(f"Created {sample_closed_path} with {len(df_sample_closed)} closed cases.")
    
    print("\nSample Data Preparation Complete!")

if __name__ == "__main__":
    prepare_sample()
