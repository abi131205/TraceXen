import os
import pandas as pd
import csv

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "HHGOA_IEEE")

def analyze():
    print("=== DATASET INSPECTION ===")
    
    # 1. Case Pack
    case_pack_path = os.path.join(DATA_DIR, "case_pack.csv")
    df_cases = pd.read_csv(case_pack_path)
    print(f"Case pack rows: {len(df_cases)}")
    print(f"Case pack columns: {list(df_cases.columns)}")
    print(df_cases.head(3))
    
    # 2. Closed Cases History
    closed_cases_path = os.path.join(DATA_DIR, "closed_cases_history.csv")
    df_closed = pd.read_csv(closed_cases_path)
    print(f"\nClosed cases history rows: {len(df_closed)}")
    print(f"Closed cases columns: {list(df_closed.columns)}")
    print(df_closed.head(3))
    
    # 3. Identity
    identity_path = os.path.join(DATA_DIR, "identity.csv")
    df_identity = pd.read_csv(identity_path, nrows=1000)
    with open(identity_path, 'r', encoding='utf-8') as f:
        identity_row_count = sum(1 for _ in f) - 1
    print(f"\nIdentity rows: {identity_row_count}, columns count: {len(df_identity.columns)}")
    print(f"Identity columns: {list(df_identity.columns)}")
    
    # 4. Transactions
    tx_path = os.path.join(DATA_DIR, "transactions.csv")
    df_tx_chunk = pd.read_csv(tx_path, nrows=5000)
    with open(tx_path, 'r', encoding='utf-8') as f:
        tx_row_count = sum(1 for _ in f) - 1
    print(f"\nTransactions rows: {tx_row_count}, columns count: {len(df_tx_chunk.columns)}")
    print(f"Sample transaction columns (first 25): {list(df_tx_chunk.columns[:25])}")
    print(f"Added columns in transactions: {[c for c in ['customer_id', 'ts', 'channel', 'risk_score'] if c in df_tx_chunk.columns]}")

if __name__ == "__main__":
    analyze()
