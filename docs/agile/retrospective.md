# Sprint Retrospective (SOA s10.t03)

## 1. What Went Well
- **Decoupled Architecture**: Separating the pure mathematical allocator into `common-domain` without Spring framework dependencies made unit testing fast, deterministic, and 100% reliable.
- **Contract-First Event Choreography**: Documenting the event schema in JSON Schema draft 2020-12 and validating it with automated tests eliminated schema drift between the allocation publisher and battery consumer.
- **Transactional Outbox with Concurrency Control**: Implementing `SELECT ... FOR UPDATE SKIP LOCKED` allows dual instances of `discharge-allocation-service` to run simultaneously without duplicate Kafka event emissions.
- **Zero-Trust Security**: Having domain services independently validate RS256 JWT tokens rather than blindly trusting Gateway headers guarantees end-to-end defense-in-depth.
- **Zero-Cookie Privacy Approach**: Choosing an architectural zero non-essential cookie stance avoided messy banner overlays, eliminated tracking liability under DPDP 2023, and preserved clean WCAG 2.2 AA accessibility.

## 2. Challenges & Engineering Solutions

| Challenge Encountered | Root Cause | Engineering Solution Implemented |
|---|---|---|
| **Windows OneDrive File Locking** | OneDrive sync locks target directory during rapid `mvn clean` commands. | Replaced clean cycle in rapid iterations with standard target build updates; isolated maven tasks. |
| **Outbox Relay Lock Contention in Web Tests** | Background scheduled thread in MockMvc slice test competing for in-memory H2 table lock. | Utilized `@MockitoBean private OutboxRelayService outboxRelay;` in web slice tests, fully isolating the web transaction. |
| **JWT Principal Null Checks in Tests** | Mockito Security mock principal doesn't always populate full Nimbus Jwt subject claim. | Controller gracefully falls back to `principal.getName()` when `jwt.getSubject()` is absent. |
| **JSX Tag Escaping in Legal Pages** | Literal `<header>` tags inside markdown-style backticks were intercepted by TypeScript JSX compiler. | Escaped HTML entity tags (`&lt;header&gt;`) inside prose. |

## 3. Future Improvements (Commercial Production Roadmap)
- Transition from local `auth-service` to clustered Keycloak 24+ deployment via Helm chart on Kubernetes.
- Deploy Kafka Connect with Debezium Postgres CDC connector as an alternative outbox engine if direct database polling is phased out.
- Integrate WebSockets/SSE on Spring Cloud Gateway for push-based live telemetry updates to the React client.
