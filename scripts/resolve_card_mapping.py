import os
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "HHGOA_IEEE")

def resolve():
    df_cases = pd.read_csv(os.path.join(DATA_DIR, "case_pack.csv"))
    df_closed = pd.read_csv(os.path.join(DATA_DIR, "closed_cases_history.csv"))
    
    flagged_ids = set(df_cases["flagged_txn_id"].dropna().astype(int).tolist())
    
    tx_path = os.path.join(DATA_DIR, "transactions.csv")
    cols = ["TransactionID", "customer_id", "ts", "card1", "card2", "card3", "card4", "card5", "card6"]
    
    df_tx = pd.read_csv(tx_path, usecols=cols)
    df_tx["card_tuple"] = df_tx.apply(lambda r: f"{r['card1']}_{r['card2']}_{r['card3']}_{r['card4']}_{r['card5']}_{r['card6']}", axis=1)
    
    # Sort transactions by ts to see first appearance of each card tuple per customer
    df_tx_sorted = df_tx.sort_values("ts")
    
    # Map customer_id -> ordered list of unique card tuples by first appearance
    cust_card_order = {}
    for _, row in df_tx_sorted.iterrows():
        cust = row["customer_id"]
        ctuple = row["card_tuple"]
        if cust not in cust_card_order:
            cust_card_order[cust] = []
        if ctuple not in cust_card_order[cust]:
            cust_card_order[cust].append(ctuple)
            
    # Check flagged transactions in case pack
    df_flagged = df_tx[df_tx["TransactionID"].isin(flagged_ids)].copy()
    joined = pd.merge(df_cases, df_flagged, left_on="flagged_txn_id", right_on="TransactionID")
    
    print("\n--- Card ID to Transaction Card Fields Verification ---")
    matches = 0
    total = len(joined)
    for _, r in joined.iterrows():
        cust = r["customer_id_x"]
        card_id = r["card_id"]
        k_suffix = card_id.split("-")[-1]
        k_idx = int(k_suffix.replace("K", "")) - 1
        
        ordered_tuples = cust_card_order.get(cust, [])
        actual_tuple = r["card_tuple"]
        
        if k_idx < len(ordered_tuples) and ordered_tuples[k_idx] == actual_tuple:
            matches += 1
            print(f"PASS: {card_id} -> Card Tuple Index K{k_idx+1} matches {actual_tuple} (Cust {cust} has {len(ordered_tuples)} cards)")
        else:
            print(f"CHECK: {card_id} -> K{k_idx+1} (actual tuple: {actual_tuple}, ordered tuples: {ordered_tuples})")
            
    print(f"\nResult: {matches} / {total} Case Pack card IDs matched by first-appearance card tuple order per customer_id.")

if __name__ == "__main__":
    resolve()
