# TraceXen: Card ID Mapping Specification

## Executive Summary
This document establishes the deterministic mapping between transaction rows in `transactions.csv`, customer IDs, Vesta card attributes (`card1`–`card6`), and case card identifiers (`card_id` format `CXXXXX-KY`) present in `case_pack.csv` and `closed_cases_history.csv`.

---

## 1. Card ID Format & Components

In the investigation case pack and historical closed cases, card identifiers take the form:
$$\text{CardID} = \text{customer\_id} + \text{"-K"} + \text{card\_index}$$

**Examples**:
- `C12382-K1` -> Customer `C12382`, Card 1
- `C08623-K2` -> Customer `C08623`, Card 2
- `C09933-K2` -> Customer `C09933`, Card 2

---

## 2. Deterministic Mapping Pipeline

### A. Customer Relationship
1. Every transaction row in `transactions.csv` explicitly carries a `customer_id` (e.g. `C12382`).
2. A customer can hold one or multiple payment cards over the 6-month timeline.

### B. Payment Card Definition
A physical or virtual payment card is uniquely represented by the 6-tuple of Vesta card fields:
$$\text{CardTuple} = (\text{card1}, \text{card2}, \text{card3}, \text{card4}, \text{card5}, \text{card6})$$
where:
- `card1`: Primary account number / issuer hash
- `card2`: Card issuer code
- `card3`: Card country code
- `card4`: Card network (`visa`, `mastercard`, `american express`, `discover`)
- `card5`: Card category code
- `card6`: Card type (`debit`, `credit`)

### C. Programmatic Resolution Algorithm

```python
def resolve_card_id(customer_id: str, card_tuple: tuple, customer_card_catalog: dict) -> str:
    """
    Deterministically resolves a transaction's (customer_id, card1..card6) into a canonical Card ID.
    
    1. Retrieve the list of unique card_tuples registered for customer_id, ordered by first transaction timestamp (ts).
    2. Find the 0-based index `i` of `card_tuple` in customer_card_catalog[customer_id].
    3. Return f"{customer_id}-K{i + 1}".
    """
    card_list = customer_card_catalog.get(customer_id, [])
    if card_tuple in card_list:
        card_index = card_list.index(card_tuple) + 1
    else:
        # Fallback if card tuple has missing values or is new
        card_index = 1
    return f"{customer_id}-K{card_index}"
```

---

## 3. Empirical Verification Against Case Pack

Verification across all 20 benchmark cases (`HHG-001` through `HHG-020`) confirms:
1. `customer_id` in `case_pack.csv` matches `customer_id` in `transactions.csv` for every flagged transaction.
2. Flagged transactions with `card_id` matching `CXXXXX-K1` correspond to the primary/first card tuple used by customer `CXXXXX`.
3. Flagged transactions with `card_id` matching `CXXXXX-K2` correspond to the secondary card tuple registered for customer `CXXXXX`.

---

## 4. Graph Implementation Specification

In the TigerGraph schema and local mock graph repository:
- **`Customer` Vertices**: Primary ID = `customer_id` (e.g. `C12382`).
- **`Card` Vertices**: Primary ID = `card_id` (e.g. `C12382-K1`), storing properties `card1`..`card6`, `card_type` (`card6`), `card_network` (`card4`).
- **Edge `Customer -> OWNS -> Card`**: Connects customer `C12382` to card `C12382-K1`.
- **Edge `Card -> MADE -> Transaction`**: Connects card `C12382-K1` to `Transaction` vertex (e.g. `3514030`).
