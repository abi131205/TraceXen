# TraceXen: Dataset Analysis & Schema Specification

## Executive Summary
This document details the structure, line counts, field meanings, and relationships of the **TigerGraph × Hacker House Goa 2026 IEEE-CIS Fraud Investigation Dataset**.

---

## 1. File Inventory & Quantitative Verification

| File Name | File Size | Row Count | Column Count | Primary Key / Joins | Description |
|---|---|---|---|---|---|
| `transactions.csv` | 707.9 MB | 590,742 | 397 | `TransactionID` | Primary ledger of 6 months of card transactions (July–Dec 2016). Includes original 393 Vesta columns plus added `customer_id`, `ts`, `channel`, `risk_score`. |
| `identity.csv` | 26.7 MB | 144,432 | 41 | `TransactionID` | Identity and device telemetry for online transactions. Joins to `transactions.csv` on `TransactionID`. |
| `closed_cases_history.csv` | 2.7 MB | 5,565 | 15 | `case_id` | Completed historical bank investigations (July–Oct 2016). Contains 4,665 confirmed fraud and 900 cleared cases. |
| `case_pack.csv` | 3.5 KB | 20 | 8 | `case_id` | The 20 benchmark exam alerts (`HHG-001` to `HHG-020`) from November and December 2016. |
| `README.md` | 38.6 KB | 473 lines | N/A | N/A | Authoritative specification covering Fraud Policy R1–R10, action names, approval routes, answer schema, stopping criteria, and SAR guidance. |

---

## 2. Key Added Columns & Behavioral Constraints

1. **`risk_score` (0.0 to 1.0)**:
   - **Crucial Rule**: `risk_score` is an **input signal, NOT a fraud verdict**.
   - Scores above 0.70 frequently correspond to legitimate transactions (false positives), while genuine fraud can have low risk scores.
   - TraceXen must never evaluate `risk_score > threshold = fraud`.

2. **`customer_id`** (e.g., `C01234`):
   - Derived from card issuer fields; groups cards held by the same customer.

3. **`ts`**:
   - Real timestamp in `YYYY-MM-DD HH:MM:SS` format (July 2 to December 31, 2016).

4. **`channel`**:
   - `in_person` (ProductCD `W`, no identity record) vs `online` (ProductCD `C`, `H`, `R`, `S`, identity record present).

---

## 3. Standard Anonymous Feature Treatment

The dataset includes anonymized features from Vesta:
- **`C1`–`C14`**: Counting features (e.g., addresses, phone numbers associated with card).
- **`D1`–`D15`**: Time deltas in days (e.g., days since previous transaction).
- **`M1`–`M9`**: Match flags (e.g., name/address match).
- **`V1`–`V339`**: Engineered model feature interactions (ranks, counts).
- **`id_01`–`id_11`**: Encoded numerical identity ratings (proxy rating, IP domain rating).
- **`id_12`–`id_38`**: Categorical identity fields (`id_15` = New/Found device, `id_23` = proxy type, `id_30` = OS, `id_31` = browser, `id_33` = screen resolution, `id_34` = match status).

**Constraint**: TraceXen will cite these features honestly as observed dataset feature values without inventing unverified semantic meanings.

---

## 4. Benchmark Case Pack Summary (`HHG-001` to `HHG-020`)

The 20 cases span three trigger types:
- **`risk_score`**: 12 cases triggered by high model risk scores.
- **`customer_report`**: 7 cases triggered by cardholder disputes ("I never made this purchase...").
- **`analyst_request`**: 1 case (`HHG-014`) triggered by analyst investigation into shared device profiles.

---

## 5. Regulatory & Memory Retrieval Integration
- Historical closed cases in `closed_cases_history.csv` serve as the bank's long-term memory.
- TraceXen retrieves past cases with matching customer, card, device, or pattern characteristics and incorporates them into `similar_prior_cases`.
- Newly resolved TraceXen cases are saved to the graph repository as `InvestigationCase` vertices to serve as memory for future cases.
