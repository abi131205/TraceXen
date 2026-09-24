# TraceXen: Agentic Graph Intelligence for Fraud Investigation & Next-Best Action

**TraceXen** is an AI agent system for financial fraud investigation and next-best-action determination, built for the **TigerGraph × Hacker House Goa 2026** challenge using the IEEE-CIS Fraud Detection dataset.

---

## 🚀 Key Features

1. **Graph-Native Evidence Traversal**: Explores entity connections across Customers, Cards, Transactions, Device Profiles, Email Domains, and Billing Regions.
2. **Historical Case Memory**: Retrieves similar past closed cases (`closed_cases_history.csv`) and writes newly closed investigations to graph memory.
3. **Deterministic Policy Engine**: Enforces exact bank Fraud Policy rules R1–R10, approval routes (`auto`, `L1`, `L2`), and SAR regulatory reporting requirements (`FILE_REPORT`).
4. **Interactive State Machine**: Manages initial next-best actions, evidence requests (customer validation, step-up auth, analyst info), and post-evidence action adaptation.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11, FastAPI, Pydantic v2, Pandas, LangGraph
- **Graph Database**: TigerGraph 4.2.5 / Savanna (GSQL, TigerGraph MCP)
- **Frontend**: React, Vite, Tailwind CSS

---

## 📂 Project Architecture

```
TraceXen/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Settings and environment variables
│   │   ├── graph/               # Repository interfaces (Mock & TigerGraph)
│   │   │   ├── repository.py
│   │   │   ├── mock_repository.py
│   │   │   └── tigergraph_repository.py
│   │   ├── models/              # Pydantic data models
│   │   │   ├── case.py
│   │   │   └── graph.py
│   │   └── policy/              # Deterministic Fraud Policy Engine (R1-R10)
│   │       ├── policy_engine.py
│   │       └── rules.py
├── graph/                       # GSQL Schema and Queries
│   ├── schema.gsql
│   └── queries.gsql
├── scripts/                     # Preprocessing & Analysis Scripts
│   ├── inspect_dataset.py
│   └── resolve_card_mapping.py
├── docs/                        # Specifications & Design Documentation
│   ├── DATASET_ANALYSIS.md
│   └── CARD_ID_MAPPING.md
├── data/                        # Extracted Dataset (HHGOA_IEEE)
├── cases/                       # Generated Benchmark Answers (HHG-001 to HHG-020)
├── .env.example
├── .gitignore
└── requirements.txt
```

---

## ⚡ Quick Start

### 1. Setup Environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your TigerGraph Savanna credentials
```

### 3. Run FastAPI Health & REST API Service
```bash
uvicorn app.main:app --app-dir backend --reload --port 8000
```
Visit http://localhost:8000/health or http://localhost:8000/api/v1/system/status to verify operational status.

### 4. Run TraceXen React Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173 to launch the interactive investigation console.

---

## 📊 Benchmark Evaluation Summary

TraceXen was evaluated against all 20 benchmark cases (`HHG-001` through `HHG-020`) using the live TigerGraph Savanna environment (`TraceXenGraph`).

- **Total Cases Processed**: 20 / 20 (100% Pass)
- **Backend Tests**: 6 / 6 Passed
- **TigerGraph Integration**: LIVE (`https://savanna.tgcloud.io`)
- **Mock Fallback**: Disabled / None
- **SAR Regulatory Reports Filed**: 2 (`HHG-010`, `HHG-014`)
- **Deterministic Policy Engine**: 100% compliant with bank rules R1–R10.
