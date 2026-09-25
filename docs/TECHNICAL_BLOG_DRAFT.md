# TraceXen: Building an Auditable Agentic Graph Intelligence Engine on TigerGraph Savanna

**Authors**: TraceXen Team  
**Event**: TigerGraph × Hacker House Goa 2026 Hackathon  
**Live UI**: [trace-xen.vercel.app](https://trace-xen.vercel.app/)  
**Live API**: [tracexen.onrender.com](https://tracexen.onrender.com)  

---

## Abstract
Modern financial fraud detection relies heavily on machine learning models trained on tabular transaction logs. While these models yield numerical risk probabilities, they suffer from two critical limitations: they are blind to complex multi-account graph topologies (such as shared device rings and IP subnets) and cannot explain their decisions to compliance auditors.

In this article, we present **TraceXen**, an auditable graph intelligence engine built on **TigerGraph Savanna 4.2.5** and **FastAPI**. TraceXen connects transaction events across an 8-vertex, 10-edge graph schema, evaluates graph evidence against a deterministic bank policy engine (Rules R1–R10), determines adaptive next-best actions, and automatically drafts regulatory Suspicious Activity Reports (SAR).

---

## 1. Graph Pattern Modeling on TigerGraph 4.2.5

TraceXen models the IEEE-CIS Fraud Detection dataset into an 8-vertex graph schema in GSQL:

```gsql
CREATE VERTEX Customer (PRIMARY_ID cust_id STRING)
CREATE VERTEX Card (PRIMARY_ID card_id STRING)
CREATE VERTEX Device (PRIMARY_ID device_id STRING)
CREATE VERTEX IP (PRIMARY_ID ip_address STRING)
CREATE VERTEX Merchant (PRIMARY_ID merchant_id STRING)
CREATE VERTEX Transaction (PRIMARY_ID tx_id STRING, amount DOUBLE, flagged BOOL)
CREATE VERTEX Case (PRIMARY_ID case_id STRING, status STRING, verdict STRING)
CREATE VERTEX Rule (PRIMARY_ID rule_id STRING, rule_name STRING)
```

### Entity Resolution
To model multi-card accounts accurately, TraceXen resolves card identifiers using a deterministic mapping algorithm:
$$\text{CardID} = \text{CustomerID} + \text{"-K"} + \text{CardIndex}$$

This enables TigerGraph to query card ownership (`OWNS_CARD`), shared hardware devices (`SHARES_DEVICE_WITH`), and historical closed cases (`HAS_CLOSED_CASE`) in sub-millisecond RESTPP graph traversals.

---

## 2. Deterministic Fraud Policy Engine

Machine learning scores are inputs, not final verdicts. TraceXen passes the graph evidence payload and risk signal to the `DeterministicPolicyEngine`, enforcing bank rules R1 through R10:

```python
class DeterministicPolicyEngine:
    def evaluate(self, risk_score: float, graph_evidence: Dict[str, Any]) -> PolicyDecision:
        # Rule R8: Account Takeover Pattern
        if graph_evidence.get("shared_device_count", 0) >= 3 and risk_score >= 0.70:
            return PolicyDecision(
                verdict="fraud_confirmed",
                pattern="account_takeover",
                initial_action="DECLINE_TRANSACTION",
                final_actions=["BLOCK_CARD", "CREATE_CASE", "BLOCK_ALL_CARDS", "FILE_REPORT"],
                approval_route="L2",
                sar_file=True
            )
```

---

## 3. Benchmark Evaluation Results

TraceXen was benchmarked against all 20 authoritative exam pack cases (`HHG-001` through `HHG-020`):

- **Execution Pass Rate**: 20 / 20 Cases (100%)
- **Backend Tests**: 6 / 6 Pytest Suite Passed
- **TigerGraph Connection**: Live TigerGraph Savanna (`TraceXenGraph`)
- **SAR Filings**: 2 Cases (`HHG-010`, `HHG-014`)

---

## 4. Conclusion & Future Directions

TraceXen demonstrates that uniting graph database topologies with deterministic policy engines provides financial institutions with both high-accuracy fraud detection and 100% regulatory auditability.

Future enhancements include integrating real-time streaming GSQL graph analytics via Kafka and expanding multi-tenant graph partitioning on TigerGraph Cloud.
