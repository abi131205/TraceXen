from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from app.models.graph import TransactionNode, CardNode, CustomerNode, DeviceProfileNode, ClosedCaseNode

class GraphRepository(ABC):
    """Abstract Repository Interface for Graph Operations (Mock or TigerGraph)"""

    @abstractmethod
    async def get_transaction(self, txn_id: str) -> Optional[TransactionNode]:
        pass

    @abstractmethod
    async def get_card_history(self, card_id: str, limit: int = 50) -> List[TransactionNode]:
        pass

    @abstractmethod
    async def get_customer_history(self, customer_id: str) -> List[TransactionNode]:
        pass

    @abstractmethod
    async def get_connected_cards(self, card_id: str) -> List[str]:
        pass

    @abstractmethod
    async def get_connected_devices(self, card_id: str) -> List[DeviceProfileNode]:
        pass

    @abstractmethod
    async def get_region_activity(self, addr1: float, window_hours: int = 24) -> List[TransactionNode]:
        pass

    @abstractmethod
    async def get_email_connections(self, email_domain: str) -> List[TransactionNode]:
        pass

    @abstractmethod
    async def get_transaction_sequence(self, card_id: str, limit: int = 10) -> List[TransactionNode]:
        pass

    @abstractmethod
    async def search_similar_cases(self, card_id: str, customer_id: str, limit: int = 5) -> List[ClosedCaseNode]:
        pass

    @abstractmethod
    async def write_investigation_case(self, case_id: str, case_data: Dict[str, Any]) -> bool:
        pass
