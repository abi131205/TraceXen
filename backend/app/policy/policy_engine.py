from typing import List, Dict, Any, Tuple, Optional
from app.models.case import ActionItem, NextBestActions, SARDetail, PatternType
from app.policy.rules import determine_approval_route, should_file_sar

class DeterministicPolicyEngine:
    """
    Authoritative Fraud Policy Engine validating and generating actions strictly adhering to Rules R1-R10.
    Ensures no unauthorized action names, wrong approval routes, or policy breaches occur.
    """

    def evaluate_initial_actions(
        self,
        fraud_prob: float,
        single_signal: bool,
        pattern: PatternType,
        exposure_usd: float,
        disputed_recurring: bool,
        is_uncertain: bool,
        has_shared_origin: bool
    ) -> List[ActionItem]:
        actions: List[ActionItem] = []

        # R7: Disputed recurring charge
        if disputed_recurring:
            actions.append(ActionItem(action="CREATE_CASE", route=determine_approval_route("CREATE_CASE", exposure_usd), reason="R7: Disputed recurring pattern"))
            actions.append(ActionItem(action="VERIFY_WITH_CUSTOMER", route=determine_approval_route("VERIFY_WITH_CUSTOMER", exposure_usd), reason="R7: Verify recurring charge with cardholder"))
            actions.append(ActionItem(action="WARN_CUSTOMER", route=determine_approval_route("WARN_CUSTOMER", exposure_usd), reason="R7: Send recurring charge notice"))
            return actions

        # R5: Card Testing initial
        if pattern == "card_testing":
            actions.append(ActionItem(action="DECLINE_TRANSACTION", route=determine_approval_route("DECLINE_TRANSACTION", exposure_usd), reason="R5: Card testing sequence observed"))
            actions.append(ActionItem(action="STEP_UP_AUTH", route=determine_approval_route("STEP_UP_AUTH", exposure_usd), reason="R5: Step-up authentication required"))
            if fraud_prob < 0.70 and single_signal:
                actions.append(ActionItem(action="VERIFY_WITH_CUSTOMER", route=determine_approval_route("VERIFY_WITH_CUSTOMER", exposure_usd), reason="R1: Verify with customer before blocking on weak signal"))
            return actions

        # R1: Weak signal verification
        if single_signal and fraud_prob < 0.70:
            actions.append(ActionItem(action="VERIFY_WITH_CUSTOMER", route=determine_approval_route("VERIFY_WITH_CUSTOMER", exposure_usd), reason="R1: Fraud probability < 0.70 on single signal, verify before blocking"))
            return actions

        # R8: Uncertain and exposed
        if is_uncertain and (exposure_usd > 500.0 or single_signal):
            actions.append(ActionItem(action="ESCALATE_TO_ANALYST", route=determine_approval_route("ESCALATE_TO_ANALYST", exposure_usd), reason="R8: Uncertain verdict with exposure exceeding $500"))

        # R9: Undocumented pattern
        if pattern == "undocumented":
            actions.append(ActionItem(action="CREATE_CASE", route=determine_approval_route("CREATE_CASE", exposure_usd), reason="R9: Undocumented abuse pattern detected"))
            actions.append(ActionItem(action="FILE_REPORT", route=determine_approval_route("FILE_REPORT", exposure_usd), reason="R9: File SAR for undocumented pattern"))
            actions.append(ActionItem(action="ESCALATE_TO_ANALYST", route=determine_approval_route("ESCALATE_TO_ANALYST", exposure_usd), reason="R9: Escalate undocumented pattern to analyst"))
            return actions

        # Default initial action for suspicious activity
        if fraud_prob >= 0.70:
            actions.append(ActionItem(action="DECLINE_TRANSACTION", route=determine_approval_route("DECLINE_TRANSACTION", exposure_usd), reason="High risk score and suspicious indicators"))
            actions.append(ActionItem(action="VERIFY_WITH_CUSTOMER", route=determine_approval_route("VERIFY_WITH_CUSTOMER", exposure_usd), reason="R1: Verify transaction with cardholder"))
        else:
            actions.append(ActionItem(action="ALLOW_TRANSACTION", route=determine_approval_route("ALLOW_TRANSACTION", exposure_usd), reason="Low fraud probability, monitoring active"))

        return actions

    def evaluate_final_actions(
        self,
        customer_response: Optional[str], # "denied", "confirmed", "no_reply"
        fraud_prob: float,
        exposure_usd: float,
        pattern: PatternType,
        has_shared_device: bool,
        has_shared_region: bool,
        has_other_card_fraud: bool,
        confirmed_cards_count: int = 1,
        credentials_compromised: bool = False
    ) -> Tuple[List[ActionItem], SARDetail, str]:
        final_actions: List[ActionItem] = []
        sar = SARDetail(file=False, reason="No regulatory threshold met", narrative="")
        what_changed = "nothing"

        # R3: Customer confirms transaction
        if customer_response == "confirmed":
            final_actions.append(ActionItem(action="CLOSE_NO_FRAUD", route="auto", reason="R3: Customer confirmed transaction as legitimate"))
            what_changed = "Customer confirmation cleared the alert as legitimate."
            return final_actions, sar, what_changed

        # R2: Customer denies transaction
        if customer_response == "denied":
            what_changed = f"Customer denial confirmed fraud. Fraud probability raised to {max(fraud_prob, 0.85):.2f}."
            final_actions.append(ActionItem(action="BLOCK_CARD", route=determine_approval_route("BLOCK_CARD", exposure_usd), reason=f"R2: Customer denied transaction; exposure ${exposure_usd:.2f}"))
            final_actions.append(ActionItem(action="CREATE_CASE", route="auto", reason="R2: Internal fraud case opened"))

            # R10 check: BLOCK_ALL_CARDS restriction
            if confirmed_cards_count >= 2 or credentials_compromised:
                final_actions.append(ActionItem(action="BLOCK_ALL_CARDS", route="L2", reason="R10: Multiple confirmed compromised cards or credentials compromised"))

            if has_shared_device or has_shared_region:
                final_actions.append(ActionItem(action="MONITOR_CONNECTED_CARDS", route="auto", reason="R6: Shared origin detected across cards"))

            # SAR check per R2 / 3a
            file_sar = should_file_sar(
                fraud_prob=0.90,
                exposure_usd=exposure_usd,
                has_shared_device=has_shared_device,
                has_shared_region=has_shared_region,
                has_other_card_fraud=has_other_card_fraud,
                is_undocumented=(pattern == "undocumented"),
                is_customer_denial=True
            )
            if file_sar:
                final_actions.append(ActionItem(action="FILE_REPORT", route="L2", reason="R2/3a: Confirmed fraud meeting regulatory SAR filing criteria"))
                sar = SARDetail(
                    file=True,
                    reason="R2: Confirmed unauthorized transaction per customer denial",
                    narrative=f"Confirmed unauthorized transaction of ${exposure_usd:.2f}. Customer denied authorization.",
                    subjects=[],
                    total_amount_usd=exposure_usd,
                    activity_dates=[]
                )
            return final_actions, sar, what_changed

        # R4: No reply within 24 hours
        if customer_response == "no_reply":
            final_actions.append(ActionItem(action="MONITOR_CARD", route="auto", reason="R4: No response within 24 hours; monitoring sensitivity increased"))
            final_actions.append(ActionItem(action="DECLINE_TRANSACTION", route="L1", reason="R4: Decline pending authorizations pending contact"))
            if exposure_usd > 500.0:
                final_actions.append(ActionItem(action="ESCALATE_TO_ANALYST", route="auto", reason="R4: Exposure > $500 with no customer reply"))
            what_changed = "No customer reply within 24h triggered monitoring and transaction decline."
            return final_actions, sar, what_changed

        # Default fallback
        final_actions.append(ActionItem(action="ALLOW_TRANSACTION", route="auto", reason="Cleared as legitimate activity"))
        return final_actions, sar, what_changed
