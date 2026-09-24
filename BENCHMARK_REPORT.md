# TraceXen: 20-Case Benchmark Evaluation Report

## Executive Summary
This document summarizes the end-to-end execution of the **TraceXen Agentic Graph Intelligence Engine** against all 20 benchmark cases (`HHG-001` through `HHG-020`) using the live TigerGraph Savanna repository (`TraceXenGraph`).

---

## 1. Execution Overview

| Metric | Value |
| :--- | :--- |
| **Total Cases Processed** | 20 / 20 |
| **Successful Cases** | 20 |
| **Failed Cases** | 0 (None) |
| **Cases Requiring Manual Review** | 0 (None) |
| **Live TigerGraph Connected** | YES (`https://tg-42b9ad92-ebff-4220-97f5-93f25f0a1f7e.tg-3452941248.i.tgcloud.io`) |
| **Mock Fallback Used** | NO (100% Live TigerGraph Queries) |
| **Total Benchmark Latency** | 55.59s |

---

## 2. Analytical Distributions

### A. Final Action Distribution
- **`CLOSE_NO_FRAUD`**: 6
- **`BLOCK_CARD`**: 14
- **`CREATE_CASE`**: 14
- **`FILE_REPORT`**: 2
- **`BLOCK_ALL_CARDS`**: 1
- **`MONITOR_CONNECTED_CARDS`**: 1

### B. Fraud Pattern Distribution
- **`none`**: 6
- **`card_not_present_fraud`**: 13
- **`account_takeover`**: 1

### C. Approval Route Distribution
- **`auto`**: 41
- **`L1`**: 28
- **`L2`**: 3

### D. Evidence Request Frequency
- **`customer_validation`**: 19
- **`step_up_auth`**: 1

---

## 3. Suspicious Activity Reports (SAR)
Total SARs Filed: **2**

- **HHG-010** (\$ 1000.03): R2: Confirmed unauthorized transaction per customer denial
- **HHG-014** (\$ 74.96): R2: Confirmed unauthorized transaction per customer denial


---

## 4. Per-Case Benchmark Results Matrix

| Case ID | Verdict | Fraud Prob | Fraud Pattern | Exposure (USD) | Initial Actions | Final Actions | SAR Filed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| HHG-001 | LEGITIMATE | 0.05 | `none` | \$ 0.00 | `VERIFY_WITH_CUSTOMER` | `CLOSE_NO_FRAUD` | NO |
| HHG-002 | FRAUD | 0.90 | `card_not_present_fraud` | \$ 292.36 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-003 | FRAUD | 0.95 | `card_not_present_fraud` | \$ 49.00 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-004 | FRAUD | 0.95 | `card_not_present_fraud` | \$ 128.33 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-005 | LEGITIMATE | 0.05 | `none` | \$ 0.00 | `VERIFY_WITH_CUSTOMER` | `CLOSE_NO_FRAUD` | NO |
| HHG-006 | FRAUD | 0.95 | `card_not_present_fraud` | \$ 482.12 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-007 | FRAUD | 0.90 | `card_not_present_fraud` | \$ 111.92 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-008 | FRAUD | 0.95 | `card_not_present_fraud` | \$ 55.68 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-009 | FRAUD | 0.95 | `card_not_present_fraud` | \$ 30.02 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-010 | FRAUD | 0.90 | `card_not_present_fraud` | \$ 1000.03 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE, FILE_REPORT` | YES |
| HHG-011 | FRAUD | 0.95 | `card_not_present_fraud` | \$ 131.30 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-012 | LEGITIMATE | 0.05 | `none` | \$ 0.00 | `VERIFY_WITH_CUSTOMER` | `CLOSE_NO_FRAUD` | NO |
| HHG-013 | LEGITIMATE | 0.05 | `none` | \$ 0.00 | `VERIFY_WITH_CUSTOMER` | `CLOSE_NO_FRAUD` | NO |
| HHG-014 | FRAUD | 0.92 | `account_takeover` | \$ 74.96 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE, BLOCK_ALL_CARDS, MONITOR_CONNECTED_CARDS, FILE_REPORT` | YES |
| HHG-015 | FRAUD | 0.90 | `card_not_present_fraud` | \$ 599.94 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-016 | FRAUD | 0.95 | `card_not_present_fraud` | \$ 59.67 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-017 | LEGITIMATE | 0.05 | `none` | \$ 0.00 | `VERIFY_WITH_CUSTOMER` | `CLOSE_NO_FRAUD` | NO |
| HHG-018 | FRAUD | 0.95 | `card_not_present_fraud` | \$ 39.08 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-019 | FRAUD | 0.90 | `card_not_present_fraud` | \$ 99.92 | `DECLINE_TRANSACTION, VERIFY_WITH_CUSTOMER` | `BLOCK_CARD, CREATE_CASE` | NO |
| HHG-020 | LEGITIMATE | 0.05 | `none` | \$ 0.00 | `VERIFY_WITH_CUSTOMER` | `CLOSE_NO_FRAUD` | NO |


---

## 5. System Compliance & Integrity
- **Fraud Policy Rules R1–R10**: 100% enforced deterministically via `DeterministicPolicyEngine`.
- **Schema Compliance**: All generated outputs strictly adhere to Pydantic `CaseAnswer` schema.
- **TigerGraph Memory Persistence**: All 20 investigation cases were persisted back to live TigerGraph as `InvestigationCase` nodes.
