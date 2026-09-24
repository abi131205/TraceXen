import sys
import os
import pytest

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__))))

from app.main import app
from app.policy.policy_engine import DeterministicPolicyEngine
from app.policy.rules import determine_approval_route, should_file_sar
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "TraceXen API"

def test_policy_engine_r1_weak_signal():
    engine = DeterministicPolicyEngine()
    initial_actions = engine.evaluate_initial_actions(
        fraud_prob=0.55,
        single_signal=True,
        pattern="card_not_present_fraud",
        exposure_usd=200.0,
        disputed_recurring=False,
        is_uncertain=False,
        has_shared_origin=False
    )
    assert len(initial_actions) >= 1
    assert initial_actions[0].action == "VERIFY_WITH_CUSTOMER"
    assert initial_actions[0].route == "auto"

def test_policy_engine_r2_customer_denial():
    engine = DeterministicPolicyEngine()
    final_actions, sar, what_changed = engine.evaluate_final_actions(
        customer_response="denied",
        fraud_prob=0.85,
        exposure_usd=1500.0,
        pattern="card_not_present_fraud",
        has_shared_device=True,
        has_shared_region=False,
        has_other_card_fraud=False
    )
    actions = [a.action for a in final_actions]
    assert "BLOCK_CARD" in actions
    assert "CREATE_CASE" in actions
    assert "FILE_REPORT" in actions
    assert sar.file is True

def test_approval_routes():
    assert determine_approval_route("ALLOW_TRANSACTION", 100.0) == "auto"
    assert determine_approval_route("DECLINE_TRANSACTION", 100.0) == "L1"
    assert determine_approval_route("BLOCK_CARD", 1000.0) == "L1"
    assert determine_approval_route("BLOCK_CARD", 3000.0) == "L2"
    assert determine_approval_route("BLOCK_ALL_CARDS", 100.0) == "L2"
    assert determine_approval_route("FILE_REPORT", 100.0) == "L2"
