# 🚀 Crypto Transaction Reconciliation Engine

## 📌 Overview

This project implements a **Transaction Reconciliation Engine** in Node.js that ingests two imperfect datasets of crypto transactions — one from a user and one from an exchange — and reconciles them into a structured report.

The system is designed to handle **real-world messy data**, including missing fields, inconsistent formats, and mismatched records, while ensuring **no silent data loss**.

---

## 🎯 Objectives

* Parse and ingest transaction data from CSV files
* Handle data inconsistencies and validation errors
* Match transactions across two sources using configurable tolerances
* Categorize results into:

  * ✅ Matched
  * ⚠️ Conflicting
  * ❌ Unmatched (User only)
  * ❌ Unmatched (Exchange only)
* Provide REST APIs to trigger reconciliation and fetch reports

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **CSV Parsing:** csv-parser
* **Utilities:** uuid, dotenv, json2csv

---

## 📁 Project Structure

```
crypto-reconciliation-engine/
│
├── src/
│   ├── config/           # DB connection
│   ├── controllers/      # API logic
│   ├── services/         # Core reconciliation logic
│   ├── models/           # MongoDB schemas
│   ├── utils/            # CSV parser & helpers
│   ├── routes/           # API routes
│   └── app.js
│
├── data/                 # Input CSV files
├── server.js             # Entry point
├── .env                  # Configuration
└── README.md
```

---

## ⚙️ Configuration

The reconciliation engine supports configurable tolerances:

```
TIMESTAMP_TOLERANCE_SECONDS=300
QUANTITY_TOLERANCE_PCT=0.01
```

These can be overridden via the `/reconcile` API request.

---

## 🔄 System Workflow

### 1. CSV Ingestion

* Reads `user_transactions.csv` and `exchange_transactions.csv`
* Parses each row and converts it into structured data
* Validates:

  * Timestamp format
  * Quantity format
* Invalid rows are:

  * Stored with `validationErrors`
  * Marked as `isValid: false`
  * NOT silently dropped

---

### 2. Data Normalization

To ensure consistency across datasets:

* Asset normalization:

  * `BTC`, `Bitcoin` → `BTC`
  * `ETH`, `Ethereum` → `ETH`
* Type normalization:

  * `TRANSFER_IN` ↔ `TRANSFER_OUT` (based on perspective)
* Case-insensitive matching applied

---

### 3. Matching Engine

A **scoring-based matching algorithm** is used instead of naive matching.

#### Matching Criteria:

* Asset must match (after normalization)
* Type must match (after mapping)
* Timestamp within tolerance
* Quantity within tolerance

#### Matching Strategy:

* For each user transaction:

  * Evaluate all candidate exchange transactions
  * Compute score:

    ```
    score = time_difference + quantity_difference
    ```
  * Select the **best (lowest score) match**

---

### 4. Categorization

Each transaction is categorized into:

| Category               | Description                           |
| ---------------------- | ------------------------------------- |
| ✅ Matched              | Within tolerance                      |
| ⚠️ Conflicting         | Match found but exceeds tolerance     |
| ❌ Unmatched (User)     | No corresponding exchange transaction |
| ❌ Unmatched (Exchange) | No corresponding user transaction     |

Each record includes:

* Original transaction data
* Match status
* Reason for classification

---

### 5. Report Generation

Results are stored in MongoDB and exposed via APIs.

Additionally, reports can be exported as CSV.

---

## 🌐 API Endpoints

### 🔹 Trigger Reconciliation

```
POST /reconcile
```

**Body:**

```json
{
  "timestampTolerance": 300,
  "quantityTolerance": 0.01
}
```

---

### 🔹 Get Full Report

```
GET /report/:runId
```

---

### 🔹 Get Summary

```
GET /report/:runId/summary
```

**Response:**

```json
{
  "matched": 10,
  "conflicting": 5,
  "unmatchedUser": 3,
  "unmatchedExchange": 4,
  "matchRate": "62.5%"
}
```

---

### 🔹 Get Unmatched Records

```
GET /report/:runId/unmatched
```

---

### 🔹 Export CSV Report

```
GET /report/:runId/export
```

---

## 🧠 Key Design Decisions

* **Fault Tolerance:** Invalid data is flagged, not dropped
* **Scalability:** Modular architecture (services, controllers, models)
* **Flexibility:** Configurable tolerances
* **Accuracy:** Score-based matching improves reliability
* **Traceability:** Each result includes reasoning

---

## ⚠️ Edge Cases Handled

* Invalid timestamps (`Invalid Date`)
* Missing or malformed quantities
* Asset name inconsistencies
* Type mismatches (TRANSFER_IN vs TRANSFER_OUT)
* Duplicate or near-duplicate transactions

---

## 🧪 How to Run

```bash
npm install
npm run dev
```

---

## 📊 System Architecture

```
CSV Files
   ↓
CSV Parser (Validation + Normalization)
   ↓
MongoDB (Transactions Storage)
   ↓
Matching Engine (Scoring + Tolerance)
   ↓
Match Results Storage
   ↓
REST APIs → Reports / CSV Export
```

---

## 🏁 Conclusion

This system simulates a real-world reconciliation engine by handling imperfect data, applying intelligent matching logic, and producing structured reports. It is designed with **production-grade practices**, including modular design, error handling, and configurability.