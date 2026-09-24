import os
import pandas as pd

full_tx_path = r"e:\HH Goa Fraud Agent\data\HHGOA_IEEE\transactions.csv"
sample_tx_path = r"e:\HH Goa Fraud Agent\data\sample\sample_transactions.csv"

# Load sample transactions
df_sample = pd.read_csv(sample_tx_path)

if 3514030 not in df_sample["TransactionID"].values:
    print("Extracting row 3514030 from full transactions.csv...")
    row_3514030 = None
    for chunk in pd.read_csv(full_tx_path, chunksize=100000, low_memory=False):
        matched = chunk[chunk["TransactionID"] == 3514030]
        if not matched.empty:
            row_3514030 = matched
            break
    
    if row_3514030 is not None:
        df_sample = pd.concat([df_sample, row_3514030], ignore_index=True)
        df_sample.to_csv(sample_tx_path, index=False)
        print(f"Successfully added Transaction 3514030 to sample_transactions.csv. Total rows: {len(df_sample)}")
else:
    print("Transaction 3514030 is already present in sample_transactions.csv.")
