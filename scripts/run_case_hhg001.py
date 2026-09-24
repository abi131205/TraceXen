import os
import sys
import asyncio
import json
from dotenv import load_dotenv

load_dotenv()

# Ensure backend app is in path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.config import Settings
settings = Settings()
from app.graph.mock_repository import MockGraphRepository
from app.graph.tigergraph_repository import TigerGraphRepository
from app.services.investigation_service import InvestigationService
from app.models.case import CaseAnswer

async def run_hhg001():
    print("=== RUNNING HHG-001 BENCHMARK CASE ===")
    if settings.TG_HOST and settings.TG_SECRET:
        print("Using TigerGraphRepository connected to live TigerGraph Savanna...")
        repo = TigerGraphRepository(
            host=settings.TG_HOST,
            secret=settings.TG_SECRET,
            graphname=settings.TG_GRAPHNAME,
            data_dir=settings.DATA_DIR
        )
    else:
        print("Using MockGraphRepository...")
        repo = MockGraphRepository(data_dir=settings.DATA_DIR)
    
    service = InvestigationService(repository=repo, data_dir=settings.DATA_DIR)
    
    answer: CaseAnswer = await service.investigate_case("HHG-001")
    
    # Ensure cases/ directory exists
    cases_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cases")
    os.makedirs(cases_dir, exist_ok=True)
    
    output_path = os.path.join(cases_dir, "HHG-001.json")
    
    # Dump JSON formatted
    json_data = answer.model_dump()
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2)
        
    print(f"\nSuccessfully generated and validated {output_path}!")
    if isinstance(repo, TigerGraphRepository):
        print(f"TigerGraph Live Execution Verified: Fallback Used = {repo.fallback_used}")
    print("\nCase Output Preview:")
    print(json.dumps(json_data, indent=2))

if __name__ == "__main__":
    asyncio.run(run_hhg001())
