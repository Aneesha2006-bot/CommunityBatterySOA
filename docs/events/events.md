# Event Architecture & Contract Specifications (SOA s10.t03)

## 1. Overview
The Community Battery SOA uses asynchronous event choreography to propagate discharge allocation decisions from `discharge-allocation-service` to `battery-state-service`. This ensures that request decisions can be made with high throughput and decoupled from downstream ledger persistence.

## 2. Topic Topology
- **Primary Topic**: `soa.s10.t03.events`
  - Partitions: 3
  - Replication Factor: 1 (local/demo) / 3 (production)
  - Keying Strategy: `record.key = aggregateId` (guarantees strict FIFO ordering per discharge request aggregate across partitions).
- **Dead-Letter Topic (DLT)**: `soa.s10.t03.events.DLT`
  - Consumes malformed, non-compliant, or poison-pill messages after 3 retry attempts with exponential backoff.

## 3. Event Contract: `DischargeRequested` (Schema Version 1)
- **JSON Schema Path**: `docs/events/DischargeRequested.v1.schema.json`
- **Schema ID**: `https://communitybattery.local/schemas/DischargeRequested.v1.json`
- **Owner**: `discharge-allocation-service`
- **Consumer**: `battery-state-service`

### Payload Specification
| Field | Type | Required | Description |
|---|---|---|---|
| `eventId` | UUID string | Yes | Unique event instance ID for idempotent consumer deduplication |
| `aggregateId` | string | Yes | Request ID (aggregate root identifier, used as Kafka message key) |
| `schemaVersion` | integer (const: 1) | Yes | Contract version for backward/forward compatibility checks |
| `occurredAt` | ISO-8601 UTC string | Yes | Instant when allocation decision occurred |
| `correlationId` | string | Yes | Tracing correlation ID propagated from HTTP/Gateway |
| `eventType` | string ("DischargeRequested") | Yes | Domain event type discriminator |
| `memberRef` | string | Yes | Pseudonymous member reference (e.g. `subj-member-a`), zero raw PII |
| `requestedKwh` | number (double) | Yes | Amount requested by member |
| `grantedKwh` | number (double) | Yes | Amount granted by reserve allocator |
| `deniedKwh` | number (double) | Yes | Amount denied to protect reserve or member cap |
| `reasonCode` | string enum | Yes | `GRANTED`, `RESERVE_PROTECTED`, `MEMBER_CAP`, `INVALID_REQUEST` |
| `status` | string enum | Yes | `GRANTED`, `PARTIALLY_GRANTED`, `DENIED`, `PENDING_COORDINATOR_REVIEW` |
| `reserveFloorKwh` | number (double) | Yes | Active reserve floor snapshot at decision time |
| `emergency` | boolean | Yes | Whether request was an authorized coordinator emergency draw |

## 4. Reliability Mechanisms

### 4.1 Transactional Outbox Pattern
To prevent dual-write anomalies between Postgres and Kafka:
1. `DischargeAllocationService` performs business logic and writes `DischargeRequest`, `RejectedRequest` (if applicable), and `OutboxEvent` in a **single atomic database transaction**.
2. An asynchronous `OutboxRelayService` polls `outbox_events` table using `SELECT ... FOR UPDATE SKIP LOCKED`.
3. In a multi-instance deployment (dual instances of `discharge-allocation-service`), `SKIP LOCKED` ensures that instances never compete for or double-publish the same outbox record.
4. Once Kafka broker acknowledges publish (`future.whenComplete(...)`), outbox record is marked `published = true`.

### 4.2 Idempotent Consumer Pattern
In `battery-state-service`:
1. `BatteryEventConsumer` intercepts each event from `soa.s10.t03.events`.
2. Inspects `processed_events` table: `processedEventRepository.existsByEventId(eventId)`.
3. If already present, consumer logs duplicate reception and returns immediately with **zero extra business effect**.
4. If not present:
   - Persists `ProcessedEvent(eventId, eventType, aggregateId, processedAt)`.
   - Records `DischargeLedgerEntry(requestId, memberRef, grantedKwh, ...)`.
   - Updates `BatteryState(currentChargeKwh = currentChargeKwh - grantedKwh, version = version + 1)` within the **same atomic transaction**.

### 4.3 Poison Pill & DLT Recovery
- Messages with unrecognized JSON syntax, missing required fields, or mismatched schema versions are intercepted by Spring Kafka's `DefaultErrorHandler`.
- After 3 delivery attempts with backoff, the payload is directed to `soa.s10.t03.events.DLT` along with diagnostic headers (`x-exception-message`, `x-exception-stacktrace`).
