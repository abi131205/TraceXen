from typing import List, Literal, Optional
from pydantic import BaseModel, Field

# Action Enums & Types
ActionType = Literal[
    "ALLOW_TRANSACTION",
    "DECLINE_TRANSACTION",
    "MONITOR_CARD",
    "MONITOR_CONNECTED_CARDS",
    "WARN_CUSTOMER",
    "VERIFY_WITH_CUSTOMER",
    "STEP_UP_AUTH",
    "BLOCK_CARD",
    "BLOCK_ALL_CARDS",
    "GENERATE_REPORT",
    "CREATE_CASE",
    "FILE_REPORT",
    "ESCALATE_TO_ANALYST",
    "CLOSE_NO_FRAUD"
]

ApprovalRoute = Literal["auto", "L1", "L2"]

PatternType = Literal[
    "card_testing",
    "card_not_present_fraud",
    "card_not_present_new_device",
    "out_of_region_use",
    "account_takeover",
    "undocumented",
    "none"
]

EvidenceSource = Literal["graph", "document", "customer", "external"]
RequestType = Literal["customer_validation", "step_up_auth", "analyst_info"]
CaseStatus = Literal["open", "closed_fraud", "closed_legitimate", "escalated"]
CaseVerdict = Literal["fraud", "legitimate", "uncertain"]

class EvidenceItem(BaseModel):
    claim: str
    source: EvidenceSource
    ref: str
    entity_ids: List[str] = Field(default_factory=list)

class CaseDetail(BaseModel):
    status: CaseStatus
    verdict: CaseVerdict
    fraud_probability: float = Field(..., ge=0.0, le=1.0)
    pattern: PatternType
    pattern_description: str = ""
    affected_txn_ids: List[str] = Field(default_factory=list)
    first_suspicious_txn_id: str = ""
    connected_card_ids: List[str] = Field(default_factory=list)
    connected_device_profiles: List[str] = Field(default_factory=list)
    exposure_usd: float = 0.0
    evidence: List[EvidenceItem] = Field(default_factory=list)
    similar_prior_cases: List[str] = Field(default_factory=list)
    summary: str
    written_to_graph: bool = False
    graph_case_id: str = ""

class EvidenceRequest(BaseModel):
    type: RequestType
    asked_after_step: int
    assumed_response: str

class ActionItem(BaseModel):
    action: ActionType
    route: ApprovalRoute
    reason: str

class NextBestActions(BaseModel):
    initial: List[ActionItem] = Field(default_factory=list)
    final: List[ActionItem] = Field(default_factory=list)
    what_changed: str = "nothing"

class SARDetail(BaseModel):
    file: bool
    reason: str
    narrative: str = ""
    subjects: List[str] = Field(default_factory=list)
    total_amount_usd: float = 0.0
    activity_dates: List[str] = Field(default_factory=list)

class CaseAnswer(BaseModel):
    case_id: str
    case: CaseDetail
    evidence_requests: List[EvidenceRequest] = Field(default_factory=list)
    next_best_actions: NextBestActions
    sar: SARDetail
    stop_reason: str
    tool_calls: int = 0
    tokens: int = 0
    latency_s: float = 0.0
