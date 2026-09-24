import os
import pandas as pd

case_pack_path = r"e:\HH Goa Fraud Agent\data\HHGOA_IEEE\case_pack.csv"
sample_tx_path = r"e:\HH Goa Fraud Agent\data\sample\sample_transactions.csv"
full_tx_path = r"e:\HH Goa Fraud Agent\data\HHGOA_IEEE\transactions.csv"

case_df = pd.read_csv(case_pack_path)
sample_df = pd.read_csv(sample_tx_path)

case_tx_ids = case_df["flagged_txn_id"].dropna().astype(int).tolist()
sample_tx_ids = set(sample_df["TransactionID"].astype(int).tolist())

missing = [tx for tx in case_tx_ids if tx not in sample_tx_ids]
print(f"Total benchmark cases: {len(case_tx_ids)}")
print(f"Present in sample_transactions.csv: {len(case_tx_ids) - len(missing)}")
print(f"Missing from sample_transactions.csv: {missing}")

if missing:
    print("\nExtracting missing benchmark transactions from full transactions.csv...")
    missing_set = set(missing)
    found_rows = []
    for chunk in pd.read_csv(full_tx_path, chunksize=100000, low_memory=False):
        matched = chunk[chunk["TransactionID"].isin(missing_set)]
        if not matched.empty:
            found_rows.append(matched)
            missing_set -= set(matched["TransactionID"].astype(int).tolist())
            if not missing_set:
                break
    
    if found_rows:
        df_missing = pd.concat(found_rows, ignore_index=True)
        sample_df = pd.concat([sample_df, df_missing], ignore_index=True).drop_duplicates(subset=["TransactionID"])
        sample_df.to_csv(sample_tx_path, index=False)
        print(f"Updated sample_transactions.csv! Total rows now: {len(sample_df)}")
