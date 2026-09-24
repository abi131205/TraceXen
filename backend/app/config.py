import os
from dotenv import load_dotenv, find_dotenv

# Load .env file automatically from project root
load_dotenv(find_dotenv(usecwd=True))
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "TraceXen: Agentic Graph Intelligence for Fraud Investigation & Next-Best Action"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # TigerGraph Credentials & Configuration (Environment variables only)
    TG_HOST: str = os.getenv("TG_HOST", "")
    TG_SECRET: str = os.getenv("TG_SECRET", "")
    TG_GRAPHNAME: str = os.getenv("TG_GRAPHNAME", "TraceXenGraph")
    TG_USERNAME: str = os.getenv("TG_USERNAME", "tigergraph")
    TG_PASSWORD: str = os.getenv("TG_PASSWORD", "")
    
    # LLM Provider Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Data Directory
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "HHGOA_IEEE")

settings = Settings()
