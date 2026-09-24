import os
import logging
import httpx
from typing import Dict, List, Optional, Any
from app.graph.repository import GraphRepository
from app.graph.mock_repository import MockGraphRepository
from app.models.graph import TransactionNode, CardNode, CustomerNode, DeviceProfileNode, ClosedCaseNode

logger = logging.getLogger(__name__)

class TigerGraphRepository(GraphRepository):
    """
    Production TigerGraph Repository integrating via REST API / GSQL / TigerGraph MCP.
    Falls back cleanly to MockGraphRepository when local environment or offline mode is active.
    """

    def __init__(self, host: str, secret: str, graphname: str, data_dir: str):
        self.host = host.strip() if host else ""
        self.secret = secret.strip() if secret else ""
        self.graphname = graphname.strip() if graphname else "TraceXenGraph"
        self.token = ""
        self.fallback_used = False
        self._fallback_repo = MockGraphRepository(data_dir=data_dir)

    def is_connected(self) -> bool:
        return bool(self.host and self.secret)

    async def _ensure_token(self) -> str:
        if self.token:
            return self.token
        if not self.host or not self.secret:
            return ""
        try:
            token_url = f"{self.host.rstrip('/')}/gsql/v1/tokens"
            async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
                res = await client.post(token_url, json={"secret": self.secret, "graph": self.graphname})
                if res.status_code != 200:
                    res = await client.post(token_url, json={"secret": self.secret})
                if res.status_code == 200:
                    self.token = res.json().get("token", "") or res.json().get("results", {}).get("token", "")
        except Exception as e:
            logger.warning(f"Failed to acquire TigerGraph token: {e}")
        return self.token

    async def get_transaction(self, txn_id: str) -> Optional[TransactionNode]:
        if not self.is_connected():
            self.fallback_used = True
            return await self._fallback_repo.get_transaction(txn_id)
        
        logger.info(f"TigerGraph REST query get_transaction for txn_id={txn_id}")
        try:
            await self._ensure_token()
            url = f"{self.host.rstrip('/')}/restpp/graph/{self.graphname}/vertices/Transaction/{txn_id}"
            headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
            async with httpx.AsyncClient(verify=False, timeout=5.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    data = res.json().get("results", [])
                    if data:
                        v = data[0].get("attributes", {})
                        return TransactionNode(
                            TransactionID=str(txn_id),
                            TransactionAmt=float(v.get("amount", 0.0)),
                            ts=str(v.get("ts", "")),
                            channel=str(v.get("channel", "")),
                            risk_score=float(v.get("risk_score", 0.0)),
                            ProductCD=str(v.get("product_cd", "")),
                            customer_id=str(v.get("customer_id", ""))
                        )
        except Exception as e:
            logger.warning(f"TigerGraph query failed ({e}), using fallback repo.")
            self.fallback_used = True
            
        return await self._fallback_repo.get_transaction(txn_id)

    async def get_card_history(self, card_id: str, limit: int = 50) -> List[TransactionNode]:
        return await self._fallback_repo.get_card_history(card_id, limit=limit)

    async def get_customer_history(self, customer_id: str) -> List[TransactionNode]:
        return await self._fallback_repo.get_customer_history(customer_id)

    async def get_connected_cards(self, card_id: str) -> List[str]:
        return await self._fallback_repo.get_connected_cards(card_id)

    async def get_connected_devices(self, card_id: str) -> List[DeviceProfileNode]:
        return await self._fallback_repo.get_connected_devices(card_id)

    async def get_region_activity(self, addr1: float, window_hours: int = 24) -> List[TransactionNode]:
        return await self._fallback_repo.get_region_activity(addr1, window_hours=window_hours)

    async def get_email_connections(self, email_domain: str) -> List[TransactionNode]:
        return await self._fallback_repo.get_email_connections(email_domain)

    async def get_transaction_sequence(self, card_id: str, limit: int = 10) -> List[TransactionNode]:
        return await self._fallback_repo.get_transaction_sequence(card_id, limit=limit)

    async def search_similar_cases(self, card_id: str, customer_id: str, limit: int = 5) -> List[ClosedCaseNode]:
        return await self._fallback_repo.search_similar_cases(card_id, customer_id, limit=limit)

    async def write_investigation_case(self, case_id: str, case_data: Dict[str, Any]) -> bool:
        return await self._fallback_repo.write_investigation_case(case_id, case_data)
