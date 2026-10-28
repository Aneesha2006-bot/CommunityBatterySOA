# Legal, Regulatory & Technical Risk Register

## 1. Risk Evaluation Framework
Risks are evaluated under Indian Law (DPDP Act 2023, Information Technology Act 2000, Consumer Protection Act 2019, Electricity Act 2003) and distributed systems reliability standards.
Severity Levels: **Low**, **Medium**, **High**, **Critical**.

## 2. Risk Register Matrix

| Risk ID | Risk Description | Regulatory / Technical Domain | Initial Severity | Mitigation Implemented | Residual Severity |
|---|---|---|---|---|---|
| **R-01** | Unauthorized processing of personal data without consent | DPDP Act 2023, Section 6 | **High** | Purpose-specific consent intake (`POST /api/consent`) with unticked checkboxes, transparent notice, and granular revocation endpoint (`DELETE /api/consent/{purpose}`). | **Low** |
| **R-02** | Exposure of user energy consumption habits (behavioral profiling) | DPDP Act 2023 / Privacy | **Medium** | Pseudonymous identifiers (`subj-member-a`) across domain services and Kafka events; PII redacted from logs. | **Low** |
| **R-03** | Horizontal privilege escalation (Member-B accessing Member-A's requests) | OWASP Top 10 API Security / IT Act Sec 43 | **Critical** | Service-layer ownership verification (`request.getMemberRef().equals(subject)`). Returns 404 Not Found to prevent leaking existence. | **Low** |
| **R-04** | Reserve double-spending due to eventual consistency latency window | Distributed Concurrency / SOA B1 | **High** | Framework-free pure domain logic with 5 kWh safety buffer; Hibernate `@Version` optimistic locking; single DB transaction for decision + outbox. | **Low** |
| **R-05** | Duplicate Kafka message causing redundant battery charge deduction | Message Delivery Semantics / SOA B2 | **High** | Idempotent consumer with `processed_events(event_id UNIQUE)` table; duplicate payloads produce zero business effect. | **Low** |
| **R-06** | Outbox double-publishing across dual discharge instances | High Availability Race Conditions | **Medium** | Postgres `SELECT ... FOR UPDATE SKIP LOCKED` in `OutboxRelayService`. Concurrent instances process disjoint batches. | **Low** |
| **R-07** | Misleading claims regarding grid certification or DISCOM sanction | Consumer Protection Act 2019 | **High** | Clear synthetic demo mode disclaimers in `src/config/business.ts` and global header/footer. No false certifications claimed. | **Low** |
| **R-08** | Inaccessible user interface for disabled community members | Rights of Persons with Disabilities Act 2016 / WCAG 2.2 AA | **Medium** | Semantic HTML5 landmarks, skip-link, 4.5:1 color contrast ratio verification, keyboard navigation, and aria-live announcements. | **Low** |
| **R-09** | Failure to respond to Data Principal grievance requests within statutory timelines | DPDP Rules 2025 / Grievance Redressal | **Medium** | Direct intake endpoint (`POST /api/privacy/requests`) tracking request timestamp, status, and SLA monitoring. | **Low** |
| **R-10** | Stale contract breakage between microservices | Distributed System Evolution | **Medium** | JSON Schema validator test and deliberate contract break test script (`scripts/verify-contract-break.ps1`) executed in CI. | **Low** |
