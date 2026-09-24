import os
import pandas as pd
from typing import Dict, List, Optional, Any
from app.graph.repository import GraphRepository
from app.models.graph import TransactionNode, CardNode, CustomerNode, DeviceProfileNode, ClosedCaseNode

class MockGraphRepository(GraphRepository):
    """Local Pandas-backed Mock Graph Repository for development and evaluation"""

    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self._tx_df: Optional[pd.DataFrame] = None
        self._identity_df: Optional[pd.DataFrame] = None
        self._closed_df: Optional[pd.DataFrame] = None

    def _ensure_loaded(self):
        if self._tx_df is None:
            sample_tx = os.path.join(self.data_dir, "sample", "sample_transactions.csv")
            tx_path = os.path.join(self.data_dir, "transactions.csv")
            if os.path.exists(sample_tx):
                tx_path = sample_tx
            elif not os.path.exists(tx_path):
                ieee_tx = os.path.join(self.data_dir, "HHGOA_IEEE", "transactions.csv")
                if os.path.exists(ieee_tx):
                    tx_path = ieee_tx
            self._tx_df = pd.read_csv(tx_path, low_memory=False)
            self._tx_df["TransactionID_str"] = self._tx_df["TransactionID"].astype(str)

        if self._identity_df is None:
            sample_id = os.path.join(self.data_dir, "sample", "sample_identity.csv")
            id_path = os.path.join(self.data_dir, "identity.csv")
            if os.path.exists(sample_id):
                id_path = sample_id
            elif not os.path.exists(id_path):
                ieee_id = os.path.join(self.data_dir, "HHGOA_IEEE", "identity.csv")
                if os.path.exists(ieee_id):
                    id_path = ieee_id
            self._identity_df = pd.read_csv(id_path, low_memory=False)
            self._identity_df["TransactionID_str"] = self._identity_df["TransactionID"].astype(str)

        if self._closed_df is None:
            sample_closed = os.path.join(self.data_dir, "sample", "sample_closed_cases.csv")
            closed_path = os.path.join(self.data_dir, "closed_cases_history.csv")
            if os.path.exists(sample_closed):
                closed_path = sample_closed
            elif not os.path.exists(closed_path):
                ieee_closed = os.path.join(self.data_dir, "HHGOA_IEEE", "closed_cases_history.csv")
                if os.path.exists(ieee_closed):
                    closed_path = ieee_closed
            self._closed_df = pd.read_csv(closed_path, low_memory=False)

    async def get_transaction(self, txn_id: str) -> Optional[TransactionNode]:
        self._ensure_loaded()
        matched = self._tx_df[self._tx_df["TransactionID_str"] == str(txn_id)]
        if matched.empty:
            return None
        row = matched.iloc[0]
        
        # Check identity details
        id_match = self._identity_df[self._identity_df["TransactionID_str"] == str(txn_id)]
        dev_info = None
        if not id_match.empty:
            dev_info = str(id_match.iloc[0]["DeviceInfo"]) if pd.notnull(id_match.iloc[0]["DeviceInfo"]) else None

        return TransactionNode(
            TransactionID=str(row["TransactionID"]),
            TransactionAmt=float(row["TransactionAmt"]),
            ts=str(row["ts"]),
            channel=str(row["channel"]),
            risk_score=float(row["risk_score"]),
            ProductCD=str(row["ProductCD"]),
            card1=int(row["card1"]) if pd.notnull(row["card1"]) else None,
            card2=float(row["card2"]) if pd.notnull(row["card2"]) else None,
            card3=float(row["card3"]) if pd.notnull(row["card3"]) else None,
            card4=str(row["card4"]) if pd.notnull(row["card4"]) else None,
            card5=float(row["card5"]) if pd.notnull(row["card5"]) else None,
            card6=str(row["card6"]) if pd.notnull(row["card6"]) else None,
            addr1=float(row["addr1"]) if pd.notnull(row["addr1"]) else None,
            addr2=float(row["addr2"]) if pd.notnull(row["addr2"]) else None,
            P_emaildomain=str(row["P_emaildomain"]) if pd.notnull(row["P_emaildomain"]) else None,
            R_emaildomain=str(row["R_emaildomain"]) if pd.notnull(row["R_emaildomain"]) else None,
            customer_id=str(row["customer_id"]),
            device_info=dev_info
        )

    async def get_card_history(self, card_id: str, limit: int = 50) -> List[TransactionNode]:
        self._ensure_loaded()
        cust_id = card_id.split("-")[0]
        matched = self._tx_df[self._tx_df["customer_id"] == cust_id].sort_values("ts", ascending=False).head(limit)
        results = []
        for _, row in matched.iterrows():
            results.append(
                TransactionNode(
                    TransactionID=str(row["TransactionID"]),
                    TransactionAmt=float(row["TransactionAmt"]),
                    ts=str(row["ts"]),
                    channel=str(row["channel"]),
                    risk_score=float(row["risk_score"]),
                    ProductCD=str(row["ProductCD"]),
                    addr1=float(row["addr1"]) if pd.notnull(row["addr1"]) else None,
                    addr2=float(row["addr2"]) if pd.notnull(row["addr2"]) else None,
                    P_emaildomain=str(row["P_emaildomain"]) if pd.notnull(row["P_emaildomain"]) else None,
                    R_emaildomain=str(row["R_emaildomain"]) if pd.notnull(row["R_emaildomain"]) else None,
                    customer_id=str(row["customer_id"])
                )
            )
        return results

    async def get_customer_history(self, customer_id: str) -> List[TransactionNode]:
        return await self.get_card_history(customer_id, limit=100)

    async def get_connected_cards(self, card_id: str) -> List[str]:
        self._ensure_loaded()
        cust_id = card_id.split("-")[0]
        # Return other cards for the same customer or sharing devices
        return []

    async def get_connected_devices(self, card_id: str) -> List[DeviceProfileNode]:
        self._ensure_loaded()
        cust_id = card_id.split("-")[0]
        cust_txs = self._tx_df[self._tx_df["customer_id"] == cust_id]["TransactionID_str"]
        matched_id = self._identity_df[self._identity_df["TransactionID_str"].isin(cust_txs)]
        profiles = []
        for _, row in matched_id.head(5).iterrows():
            d_type = str(row["DeviceType"]) if pd.notnull(row["DeviceType"]) else ""
            d_info = str(row["DeviceInfo"]) if pd.notnull(row["DeviceInfo"]) else ""
            os_val = str(row["id_30"]) if pd.notnull(row["id_30"]) else ""
            browser = str(row["id_31"]) if pd.notnull(row["id_31"]) else ""
            screen = str(row["id_33"]) if pd.notnull(row["id_33"]) else ""
            profiles.append(
                DeviceProfileNode(
                    device_profile_id=f"DEV-{row['TransactionID']}",
                    device_type=d_type,
                    device_info=d_info,
                    os=os_val,
                    browser=browser,
                    screen_res=screen
                )
            )
        return profiles

    async def get_region_activity(self, addr1: float, window_hours: int = 24) -> List[TransactionNode]:
        self._ensure_loaded()
        matched = self._tx_df[self._tx_df["addr1"] == addr1].head(20)
        return [
            TransactionNode(
                TransactionID=str(row["TransactionID"]),
                TransactionAmt=float(row["TransactionAmt"]),
                ts=str(row["ts"]),
                channel=str(row["channel"]),
                risk_score=float(row["risk_score"]),
                ProductCD=str(row["ProductCD"]),
                addr1=float(row["addr1"]) if pd.notnull(row["addr1"]) else None,
                customer_id=str(row["customer_id"])
            ) for _, row in matched.iterrows()
        ]

    async def get_email_connections(self, email_domain: str) -> List[TransactionNode]:
        self._ensure_loaded()
        matched = self._tx_df[
            (self._tx_df["P_emaildomain"] == email_domain) | (self._tx_df["R_emaildomain"] == email_domain)
        ].head(20)
        return [
            TransactionNode(
                TransactionID=str(row["TransactionID"]),
                TransactionAmt=float(row["TransactionAmt"]),
                ts=str(row["ts"]),
                channel=str(row["channel"]),
                risk_score=float(row["risk_score"]),
                ProductCD=str(row["ProductCD"]),
                customer_id=str(row["customer_id"])
            ) for _, row in matched.iterrows()
        ]

    async def get_transaction_sequence(self, card_id: str, limit: int = 10) -> List[TransactionNode]:
        return await self.get_card_history(card_id, limit=limit)

    async def search_similar_cases(self, card_id: str, customer_id: str, limit: int = 5) -> List[ClosedCaseNode]:
        self._ensure_loaded()
        matched = self._closed_df[
            (self._closed_df["customer_id"] == customer_id) | (self._closed_df["card_id"] == card_id)
        ].head(limit)
        results = []
        for _, row in matched.iterrows():
            txn_list = str(row["txn_ids"]).split("|") if pd.notnull(row["txn_ids"]) else []
            results.append(
                ClosedCaseNode(
                    case_id=str(row["case_id"]),
                    customer_id=str(row["customer_id"]),
                    card_id=str(row["card_id"]),
                    opened_at=str(row["opened_at"]),
                    closed_at=str(row["closed_at"]),
                    outcome=str(row["outcome"]),
                    pattern=str(row["pattern"]),
                    first_fraud_txn_id=str(row["first_fraud_txn_id"]),
                    txn_ids=txn_list,
                    exposure_usd=float(row["exposure_usd"]) if pd.notnull(row["exposure_usd"]) else 0.0,
                    analyst_notes=str(row["analyst_notes"]) if pd.notnull(row["analyst_notes"]) else ""
                )
            )
        return results

    async def write_investigation_case(self, case_id: str, case_data: Dict[str, Any]) -> bool:
        return True
