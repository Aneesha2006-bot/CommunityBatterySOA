# Data Inventory & Mapping (DPDP Act 2023 / Rules 2025)

## 1. Overview & Data Fiduciary Details
- **Data Fiduciary**: Community Battery Reserve System (Academic / Research Prototype)
- **Status**: Draft - requires review by a qualified lawyer before production use.
- **Scope**: Identifies all personal and non-personal data elements ingested, processed, and stored across the microservices ecosystem.

## 2. Data Classification Matrix

| Data Item | Classification | Service Owner | Storage | Legal Basis (DPDP Sec. 4/6) | Retention Period | Cross-Border Transfer |
|---|---|---|---|---|---|---|
| Username | Identity Data | `auth-service` | PostgreSQL `app_users` | Explicit Consent / Contract | Active account + 30 days | None (India only) |
| Password (BCrypt Hash) | Credential | `auth-service` | PostgreSQL `app_users` | Explicit Consent / Contract | Active account | None |
| Pseudonymous Member Reference (`sub`) | Pseudonymous ID | All services | PostgreSQL / Kafka | Legitimate Uses / Allocation | 1 year for audit log | None |
| Roles (`member`, `energyCoordinator`) | Access Attribute | `auth-service` | PostgreSQL `app_users` | Contractual Necessity | Active account | None |
| Consent Records (Purpose, Timestamp, Status) | Compliance Record | `auth-service` | PostgreSQL `consent_records` | Legal Obligation (DPDP Sec 6) | 7 years (statutory requirement) | None |
| Privacy Rights Intake Requests | Compliance Record | `auth-service` | PostgreSQL `privacy_requests` | Legal Obligation (DPDP Sec 11-14) | 3 years post-resolution | None |
| Discharge Energy Request (Requested kWh, Granted kWh, Timestamp) | Operational Telemetry | `discharge-allocation-service` | PostgreSQL `discharge_requests` | Contractual Necessity / Allocation | 90 days operational; aggregated after | None |
| Rejected Discharge Request (Denied kWh, Reason Code, Correlation ID) | Operational Audit | `discharge-allocation-service` | PostgreSQL `rejected_requests` | Legitimate Uses / Grid Safety | 1 year | None |
| Physical Battery Charge (Current kWh, Capacity kWh) | Non-Personal Telemetry | `battery-state-service` | PostgreSQL `battery_state` | N/A (Non-Personal Asset) | Indefinite | None |
| Reserve Floor Policy (Floor kWh, Member Cap kWh) | Non-Personal Configuration | `reserve-policy-service` | PostgreSQL `reserve_policy` | N/A (Policy Asset) | Indefinite | None |

## 3. Data Protection Principles Enforced
1. **Purpose Limitation**: Member references (`sub`) are utilized solely for computing individual daily quotas (e.g. 50 kWh/day cap) and validating access rights.
2. **Data Minimization**: Passwords are salted with BCrypt; no names, physical addresses, phone numbers, or Aadhaar numbers are collected or stored.
3. **Storage Limitation**: Rejected requests and operational ledger entries are maintained strictly for energy accounting and audit trail purposes.
4. **Security Safeguards**: Encrypted communication over TLS, independent RS256 signature verification, and zero direct external database access.
