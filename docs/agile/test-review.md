# Quality Assurance & Test Review Report (SOA s10.t03)

## 1. Executive Summary
- **Total Automated Test Cases**: 32 backend tests + contract break suite + WCAG contrast suite + static build suite.
- **Backend Pass Rate**: 100% (32/32 tests passing across all reactor modules).
- **Domain Edge Case Verification**: Confirmed in pure unit test, repository slice test, and end-to-end integration test.
- **Frontend Performance Budget**: 72.21 kB gzip total bundle size (budget limit: $\le 170\text{ kB}$).
- **Accessibility Compliance**: WCAG 2.2 AA verified with automated contrast checker.

## 2. Test Suite Breakdown

### 2.1 Pure Domain Logic (`common-domain`)
- **Suite**: `com.communitybattery.domain.ReserveAllocatorTest`
- **Count**: 16 tests
- **Key Verifications**:
  - `memberB_CaseRule_LandsOnFloor`: 45.0 requested at 68.0 charge, 30.0 floor -> 38.0 granted, 7.0 denied with `RESERVE_PROTECTED`.
  - Boundary conditions: Zero requested, negative values, NaN, and excessive draws rejected with `INVALID_REQUEST`.
  - Member rolling 24h cap limitation: Request exceeding daily cap curtailed with `MEMBER_CAP`.
  - Coordinator emergency authorization: Authorized draws allow using reserve up to 5.0 kWh absolute safety margin.
  - Member unauthorized emergency: Yields `PENDING_COORDINATOR_REVIEW` and zero reserve breach.

### 2.2 Auth Service (`auth-service`)
- **Suite**: `com.communitybattery.auth.AuthServiceIntegrationTest`
- **Count**: 4 tests
- **Key Verifications**:
  - Valid user login generates signed RS256 token containing subject, roles, issuer, and expiration.
  - Invalid password returns HTTP 401 Unauthorized.
  - JWKS endpoint (`/.well-known/jwks.json`) returns RSA public key matching token signature.
  - DPDP Consent recording endpoint correctly updates consent state.

### 2.3 Reserve Policy Service (`reserve-policy-service`)
- **Suite**: `com.communitybattery.policy.ReservePolicyIntegrationTest`
- **Count**: 3 tests
- **Key Verifications**:
  - Member can read reserve policy (`GET /api/reserve/policy`).
  - Coordinator can update reserve floor and member cap (`PUT /api/reserve/policy`).
  - Non-coordinator updating policy is rejected with HTTP 403 Forbidden.

### 2.4 Battery State Service (`battery-state-service`)
- **Suite**: `com.communitybattery.battery.BatteryStateIntegrationTest`
- **Count**: 2 tests
- **Key Verifications**:
  - Consuming `DischargeRequested` updates `currentChargeKwh` and creates `DischargeLedgerEntry`.
  - Idempotent deduplication: duplicate delivery of identical `eventId` yields zero extra deduction.

### 2.5 Discharge Allocation Service (`discharge-allocation-service`)
- **Suite**: `com.communitybattery.discharge.DischargeAllocationIntegrationTest`
- **Count**: 3 tests
- **Key Verifications**:
  - Normal flow: 10.0 kWh requested -> 10.0 kWh granted, outbox row persisted.
  - THE CASE RULE: 45.0 kWh requested at 68.0 kWh charge -> 38.0 kWh granted, 7.0 kWh denied, `RESERVE_PROTECTED`, `RejectedRequest` persisted.
  - Horizontal Privilege Escalation prevention: member-b accessing member-a's request ID returns HTTP 404 Not Found.

### 2.6 Event Schema Contract Verification
- **Suite**: `com.communitybattery.discharge.contract.DischargeRequestedEventSchemaTest`
- **Count**: 4 tests
- **Key Verifications**:
  - Valid payload conforms to Draft 2020-12 schema in `docs/events/DischargeRequested.v1.schema.json`.
  - Missing required field (`grantedKwh`) causes contract validation failure.
  - Renamed field (`grantedEnergyKwh`) causes contract validation failure.
  - Invalid enum value causes schema validation error.
