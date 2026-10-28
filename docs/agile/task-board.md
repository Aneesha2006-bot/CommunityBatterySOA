# Agile Task Board & Sprint Execution

| Work Item ID | Requirement | User Story | Component | Status | Verification Evidence |
|---|---|---|---|---|---|
| **TASK-01** | B1, CO1 | Architecture Plan | Monorepo root | **DONE** | `docs/architecture.md`, `implementation-plan.md` |
| **TASK-02** | B5, CO4 | Domain Allocator | `common-domain` | **DONE** | `ReserveAllocatorTest.java` (16/16 tests pass) |
| **TASK-03** | B4, CO3 | Service Discovery | `discovery-server` | **DONE** | Eureka server running on port 8761 |
| **TASK-04** | B3, B4 | Edge Gateway & Routing | `api-gateway` | **DONE** | `GatewaySecurityConfig.java`, `application.yml` |
| **TASK-05** | B3, CO2 | RS256 Auth & JWKS | `auth-service` | **DONE** | `AuthServiceIntegrationTest.java` (4/4 tests pass) |
| **TASK-06** | B1, CO1 | Reserve Policy & Lock | `reserve-policy-service` | **DONE** | `ReservePolicyIntegrationTest.java` (3/3 tests pass) |
| **TASK-07** | B1, B2 | Battery State & Ledger | `battery-state-service` | **DONE** | `BatteryStateIntegrationTest.java` (2/2 tests pass) |
| **TASK-08** | B1, B2 | Discharge & Outbox | `discharge-allocation-service` | **DONE** | `DischargeAllocationIntegrationTest.java` (3/3 tests pass) |
| **TASK-09** | B2, CO1 | Kafka Topic & DLT | Events Spec | **DONE** | `docs/events/events.md`, `DischargeRequested.v1.schema.json` |
| **TASK-10** | B5, CO4 | Schema Contract Test | `discharge-allocation-service` | **DONE** | `DischargeRequestedEventSchemaTest.java` (4/4 pass) |
| **TASK-11** | B5, CO4 | Deliberate Break Script | Scripts | **DONE** | `scripts/verify-contract-break.ps1` (`docs/evidence/contract-break-failure.txt`) |
| **TASK-12** | W-BIZ | Business Config & Check | `web/src/config/business.ts` | **DONE** | `scripts/check-placeholders.cjs` |
| **TASK-13** | W-A11Y | WCAG 2.2 AA Contrast | Web CSS & Components | **DONE** | `scripts/check-contrast.cjs` (All pairings pass >= 4.5:1) |
| **TASK-14** | W-LEGAL | DPDP Legal Pages | Web Legal Reader | **DONE** | Privacy Policy, Terms, Cookie Policy, Refund, A11y |
| **TASK-15** | W-SEO | Static Prerender & SSG | Web Vite & Scripts | **DONE** | `scripts/prerender.cjs`, `sitemap.xml`, `robots.txt`, `llms.txt` |
| **TASK-16** | B5 | Concurrent Load Test | Scripts | **DONE** | `scripts/load-test.js`, `scripts/load-test-runner.js` |
| **TASK-17** | B6 | Full Automated Demo | Scripts | **DONE** | `scripts/run-demo.ps1`, `docs/evidence/demo-run.txt` |
