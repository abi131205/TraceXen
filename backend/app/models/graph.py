from typing import Dict, List, Optional, Any
from pydantic import BaseModel

class TransactionNode(BaseModel):
    TransactionID: str
    TransactionAmt: float
    ts: str
    channel: str
    risk_score: float
    ProductCD: str
    card1: Optional[int] = None
    card2: Optional[float] = None
    card3: Optional[float] = None
    card4: Optional[str] = None
    card5: Optional[float] = None
    card6: Optional[str] = None
    addr1: Optional[float] = None
    addr2: Optional[float] = None
    P_emaildomain: Optional[str] = None
    R_emaildomain: Optional[str] = None
    customer_id: str
    device_info: Optional[str] = None

class CardNode(BaseModel):
    card_id: str
    customer_id: str
    card_type: str = "unknown"
    card_network: str = "unknown"

class CustomerNode(BaseModel):
    customer_id: str
    card_ids: List[str] = []

class DeviceProfileNode(BaseModel):
    device_profile_id: str
    device_type: str = ""
    device_info: str = ""
    os: str = ""
    browser: str = ""
    screen_res: str = ""

class ClosedCaseNode(BaseModel):
    case_id: str
    customer_id: str
    card_id: str
    opened_at: str
    closed_at: str
    outcome: str
    pattern: str
    first_fraud_txn_id: str
    txn_ids: List[str]
    exposure_usd: float
    analyst_notes: str
