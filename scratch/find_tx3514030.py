import os
import pandas as pd

tx_path = r"e:\HH Goa Fraud Agent\data\HHGOA_IEEE\transactions.csv"
print("Checking for 3514030 in transactions.csv...")
for chunk in pd.read_csv(tx_path, chunksize=50000, low_memory=False):
    match = chunk[chunk["TransactionID"] == 3514030]
    if not match.empty:
        print("Found row 3514030:")
        print(match[["TransactionID", "TransactionAmt", "ts", "channel", "risk_score", "ProductCD", "customer_id", "card1", "card4", "card6"]])
        break
