import sys
import os
import asyncio

# Ensure backend directory is in path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__))))

from app.config import settings
from app.graph.mock_repository import MockGraphRepository
from app.graph.tigergraph_repository import TigerGraphRepository
from app.services.investigation_service import InvestigationService
from app.models.case import CaseAnswer

def test_hhg001_investigation_mock_repository():
    async def _run():
        repo = MockGraphRepository(data_dir=settings.DATA_DIR)
        service = InvestigationService(repository=repo, data_dir=settings.DATA_DIR)
        
        answer: CaseAnswer = await service.investigate_case("HHG-001")
        
        # Top-level assertions
        assert answer.case_id == "HHG-001"
        assert answer.case.status == "closed_legitimate"
        assert answer.case.verdict == "legitimate"
        assert answer.case.fraud_probability == 0.05
        assert answer.case.pattern == "none"
        assert answer.case.affected_txn_ids == []
        assert answer.case.exposure_usd == 0.0
        assert "CC-1066" in answer.case.similar_prior_cases
        assert answer.next_best_actions.initial[0].action == "VERIFY_WITH_CUSTOMER"
        assert answer.next_best_actions.final[0].action == "CLOSE_NO_FRAUD"

    asyncio.run(_run())

def test_hhg001_investigation_tigergraph_repository():
    async def _run():
        repo = TigerGraphRepository(
            host=settings.TG_HOST,
            secret=settings.TG_SECRET,
            graphname=settings.TG_GRAPHNAME,
            data_dir=settings.DATA_DIR
        )
        service = InvestigationService(repository=repo, data_dir=settings.DATA_DIR)
        
        answer: CaseAnswer = await service.investigate_case("HHG-001")
        
        # Compare TigerGraphRepository (fallback mode) with MockRepository
        assert answer.case_id == "HHG-001"
        assert answer.case.status == "closed_legitimate"
        assert answer.case.verdict == "legitimate"
        assert answer.case.fraud_probability == 0.05
        assert answer.next_best_actions.final[0].action == "CLOSE_NO_FRAUD"

    asyncio.run(_run())
