# TraceXen: 3–5 Minute Live Hackathon Demo Guide

This document provides a step-by-step presentation script for demoing **TraceXen** to judges during the **TigerGraph × Hacker House Goa 2026** evaluation.

---

## ⏱️ Demo Outline (3:30 Minutes Total)

| Time | Section | Key Talking Point |
| :--- | :--- | :--- |
| **0:00 – 0:45** | **Hero & Problem Statement** | Why ML probability alone fails in fraud investigation; intro to TraceXen. |
| **0:45 – 1:30** | **Case 1: HHG-001 (Legitimate)** | Subgraph traversal of prior closed cases `CC-*` proving legitimate behavior. |
| **1:30 – 2:30** | **Case 2: HHG-014 (Account Takeover)** | Shared device graph pattern `dev_3032488`, multi-card blocking & SAR generation. |
| **2:30 – 3:15** | **Benchmark Lab & System Provenance** | 20/20 audit pass rate, 6/6 tests passing, live TigerGraph Savanna connection. |
| **3:15 – 3:30** | **Closing & Q&A** | Summary of auditable graph-native fraud decisioning. |

---

## 🎬 Step-by-Step Walkthrough Script

### 1. Landing Hero (0:00 – 0:45)
- Open [trace-xen.vercel.app](https://trace-xen.vercel.app/).
- **Say**: *"Welcome to TraceXen — Agentic Graph Intelligence built for TigerGraph Savanna. Financial institutions struggle because machine learning scores are black boxes. TraceXen exposes entity networks, enforces deterministic bank policy rules R1–R10, and generates regulatory SAR reports."*
- Highlight system badges: `TIGERGRAPH CONNECTED`, `20 BENCHMARK CASES`, `6/6 BACKEND TESTS`.

### 2. Legitimate Case Walkthrough: `HHG-001` (0:45 – 1:30)
- Click **Open Investigation** (or select `HHG-001`).
- **Show**: Left panel shows Transaction `3514030` ($77.07) with risk score `0.61`.
- **Show Graph**: Center React Flow graph shows Customer `C12382` and 4 historical closed cases (`CC-1066`, `CC-1673`, `CC-2964`, `CC-3587`).
- **Explain**: *"Because TigerGraph historical memory shows 4 prior cases all closed as legitimate, Policy Engine resolves verdict as `legitimate` (0.05 probability) and adapts initial action `VERIFY_WITH_CUSTOMER` to final action `CLOSE_NO_FRAUD`."*

### 3. Account Takeover & SAR Walkthrough: `HHG-014` (1:30 – 2:30)
- Select `HHG-014` from the **SELECT BENCHMARK CASE** dropdown.
- **Show Graph**: Point to device profile `dev_3032488` linking multiple customer accounts.
- **Show Decision Panel**: Highlight triggered pattern `account_takeover` and Policy Rule R8.
- **Show Actions**: Highlight adapted actions: `BLOCK_CARD`, `CREATE_CASE`, `BLOCK_ALL_CARDS`, `MONITOR_CONNECTED_CARDS`, `FILE_REPORT`.
- **Show SAR Brief**: Scroll to **SAR REGULATORY BRIEF**: Highlight `sar.file = true` with narrative *"Confirmed unauthorized transaction of $74.96. Customer denied authorization."*

### 4. Benchmark Lab & Provenance (2:30 – 3:15)
- Click **Benchmark Lab** in top navigation.
- **Show**: 20/20 benchmark cases pass rate grid with 13 Fraud, 7 Legitimate, and 2 SAR filings (`HHG-010`, `HHG-014`).
- **Show System Provenance**: Navigate to **System** tab to demonstrate live TigerGraph 4.2.5 Savanna schema (8 vertex types, 10 edge types) and Rule Registry R1–R10.

---

## 🎯 Key Summary to Emphasize to Judges
1. **Live TigerGraph Integration**: Queries run directly against TigerGraph Savanna RESTPP API (`TraceXenGraph`).
2. **Auditability**: Every decision provides a complete graph evidence trail, rule violation breakdown, and human approval route (`auto`, `L1`, `L2`).
3. **100% Benchmark Completion**: All 20 benchmark cases evaluated and verified.
