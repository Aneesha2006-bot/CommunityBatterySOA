# Claims Register & Product Representation

## 1. Compliance Statement
In compliance with the **Consumer Protection Act 2019 (Misleading Advertisements Regulations)** and the **Advertising Standards Council of India (ASCI) Code**, all public-facing statements, marketing representations, and technical claims in the application have been audited and cataloged below.

## 2. Register of Statements and Substantiations

| Claim ID | Public Statement / Feature Claim | Substantiation / Evidence in Code | Verification Status | Caveats & Disclaimers |
|---|---|---|---|---|
| CL-01 | "Guaranteed 30 kWh Emergency Reserve Floor" | Implemented in `ReserveAllocator.java`: `shareablePool = max(0, charge - floor)`. Verified by 16 pure unit tests in `ReserveAllocatorTest.java`. | **VERIFIED** | Reserve holds assuming physical battery cells are operational and non-degraded. |
| CL-02 | "Sub-50ms Allocation Decision Latency" | Measured via integration tests and k6 load tests using synchronous in-memory evaluation and transactional outbox. | **VERIFIED** | Dependent on network latency between client and Edge Gateway. |
| CL-03 | "Strict Idempotency - Zero Double Deductions" | Implemented via `processed_events` table with unique constraint on `event_id` in `BatteryEventConsumer.java`. | **VERIFIED** | Verified by duplicate event delivery integration test. |
| CL-04 | "Zero Non-Essential Cookies" | Frontend codebase contains zero `document.cookie` writers for advertising or tracking. Verified by code audit. | **VERIFIED** | Auth token retained in ephemeral memory and sessionStorage only. |
| CL-05 | "Designed to Support India DPDP Act 2023" | Features explicit consent recording, granular purpose withdrawal, right to access, right to erasure, and right to grievance redressal. | **VERIFIED (DESIGN-LEVEL)** | Legal pages are marked as Draft requiring qualified legal counsel prior to commercial grid deployment. |
| CL-06 | "Synthetic Demo Environment" | Prominently disclosed in global header, footer, and `src/config/business.ts`. All energy units, currency, and users are simulated. | **VERIFIED** | Not connected to live utility distribution grid (DISCOM). |
