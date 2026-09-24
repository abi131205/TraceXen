"""
Authoritative Fraud Policy Rules R1-R10 Definitions & Validation Logic
"""
from typing import List, Dict, Any
from app.models.case import ActionItem, ActionType, ApprovalRoute

def determine_approval_route(action: ActionType, exposure_usd: float) -> ApprovalRoute:
    """
    Evaluates approval route strictly per Section 2 of Fraud Policy:
    auto: ALLOW_TRANSACTION, MONITOR_CARD, MONITOR_CONNECTED_CARDS, WARN_CUSTOMER,
          VERIFY_WITH_CUSTOMER, STEP_UP_AUTH, GENERATE_REPORT, CREATE_CASE,
          ESCALATE_TO_ANALYST, CLOSE_NO_FRAUD
    L1: DECLINE_TRANSACTION; BLOCK_CARD when exposure <= $2,500
    L2: BLOCK_CARD when exposure > $2,500; BLOCK_ALL_CARDS always; FILE_REPORT always
    """
    if action in [
        "ALLOW_TRANSACTION", "MONITOR_CARD", "MONITOR_CONNECTED_CARDS",
        "WARN_CUSTOMER", "VERIFY_WITH_CUSTOMER", "STEP_UP_AUTH",
        "GENERATE_REPORT", "CREATE_CASE", "ESCALATE_TO_ANALYST", "CLOSE_NO_FRAUD"
    ]:
        return "auto"

    if action == "DECLINE_TRANSACTION":
        return "L1"

    if action == "BLOCK_CARD":
        return "L1" if exposure_usd <= 2500.0 else "L2"

    if action in ["BLOCK_ALL_CARDS", "FILE_REPORT"]:
        return "L2"

    return "auto"

def should_file_sar(
    fraud_prob: float,
    exposure_usd: float,
    has_shared_device: bool,
    has_shared_region: bool,
    has_other_card_fraud: bool,
    is_undocumented: bool,
    is_customer_denial: bool
) -> bool:
    """
    Evaluates SAR filing rule per Section 3a of Fraud Policy:
    File report when fraud is confirmed or strongly suspected AND at least one of:
    - exposure > $1,000
    - shared device profile
    - shared region cluster
    - another customer's fraud
    - coordinated or undocumented pattern (R9)
    """
    if fraud_prob < 0.50 and not is_customer_denial:
        return False

    if exposure_usd > 1000.0 or has_shared_device or has_shared_region or has_other_card_fraud or is_undocumented:
        return True

    return False
