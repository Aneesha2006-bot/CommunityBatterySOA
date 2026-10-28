# Agile User Stories & Acceptance Criteria (SOA s10.t03)

## Story US-01: Guaranteed Emergency Reserve Protection
**As a** Community Battery Energy Coordinator  
**I want** the system to reserve a minimum emergency floor (30.0 kWh)  
**So that** critical community life-support services and grid stability are always maintained during power outages.

### Acceptance Criteria (Gherkin):
```gherkin
Feature: Emergency Reserve Floor Enforcement

  Scenario: Member requests energy exceeding shareable pool above reserve floor
    Given current battery charge is 68.0 kWh
    And active reserve floor is 30.0 kWh (shareable pool is 38.0 kWh)
    And member daily cap is 50.0 kWh
    When member-b submits a discharge request of 45.0 kWh
    Then the system grants exactly 38.0 kWh
    And denies 7.0 kWh with reason code "RESERVE_PROTECTED"
    And status is "PARTIALLY_GRANTED"
    And resulting battery charge is exactly 30.0 kWh
    And a RejectedRequest record is persisted with denied volume 7.0 kWh
    And a DischargeRequested event is written to the transactional outbox table
```

---

## Story US-02: Normal Member Discharge Allocation
**As a** Community Member (`member-a`)  
**I want** to request energy from the shared battery up to my daily cap  
**So that** I can power my residential appliances with stored clean energy.

### Acceptance Criteria:
```gherkin
Feature: Regular Allocation Grant

  Scenario: Member requests energy within available shareable pool
    Given current battery charge is 80.0 kWh
    And active reserve floor is 30.0 kWh (shareable pool is 50.0 kWh)
    And member-a has consumed 0.0 kWh in the rolling 24 hours
    When member-a submits a request for 12.0 kWh
    Then the system grants 12.0 kWh with status "GRANTED" and reason code "GRANTED"
    And battery charge decreases to 68.0 kWh
    And zero RejectedRequest rows are generated
    And a DischargeRequested event is published to Kafka topic soa.s10.t03.events
```

---

## Story US-03: Horizontal Privilege Escalation Prevention
**As a** Privacy-Conscious Community Member  
**I want** my energy allocation requests and consumption history to remain private  
**So that** other members cannot inspect my household activity.

### Acceptance Criteria:
```gherkin
Feature: Data Isolation & Access Control

  Scenario: Member-B attempts to query Member-A's request ID
    Given member-a has an existing discharge request with ID "req-12345"
    When member-b sends a GET request to "/api/discharges/req-12345" with valid JWT
    Then the server returns HTTP 404 Not Found
    And the existence of the record is not leaked
```

---

## Story US-04: Transactional Outbox & Idempotent Consumer
**As a** Distributed Systems Engineer  
**I want** allocation decisions to be reliably published and consumed without dual-write inconsistency  
**So that** the battery ledger is guaranteed consistent even during broker restarts or network retries.

### Acceptance Criteria:
```gherkin
Feature: Reliable Event Choreography

  Scenario: Event delivered multiple times to consumer
    Given a valid DischargeRequested event with eventId "evt-9999"
    When BatteryEventConsumer processes "evt-9999" for the first time
    Then a ledger entry is saved and battery charge is decremented
    When BatteryEventConsumer processes "evt-9999" a second time (duplicate delivery)
    Then the consumer recognizes the duplicate key in "processed_events"
    And terminates processing with zero additional charge reduction
```

---

## Story US-05: DPDP 2023 Consent & Rights Intake
**As a** Indian Citizen & Data Principal  
**I want** clear purpose-specific consent and an accessible intake for data rights  
**So that** my rights under India's Digital Personal Data Protection Act 2023 are honored.

### Acceptance Criteria:
```gherkin
Feature: DPDP 2023 Compliance Intake

  Scenario: Member exercises Right to Erasure
    Given an authenticated member with pseudonymous subject "subj-member-a"
    When the member submits a privacy request of type "ERASURE"
    Then the system records the request with an immediate tracking reference
    And registers an SLA review commit within 72 hours
```
