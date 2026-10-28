# Third-Party Audit & External Dependency Review

## 1. Scope
Audit of all external runtime dependencies, content delivery networks (CDNs), remote APIs, and data processing vendors.

## 2. External Service Assessment

| Service / Dependency | Provider | Location | Purpose | Data Transmitted | Privacy Assessment |
|---|---|---|---|---|---|
| Frontend Hosting | Self-hosted / Nginx | Local / Cloud VPC | Serves React static bundles | HTTP request headers | No third-party data processing |
| Edge Gateway | Spring Cloud Gateway | Internal Cluster | Routing & Auth | JWT tokens | Internal network only |
| Identity Issuer | Auth Service | Internal Cluster | Token generation | Synthetic usernames | No external identity vendor |
| Font Delivery | Self-hosted (Inter / System) | Local Bundle | UI typography | None | Zero external HTTP requests |
| Analytics / Telemetry | Server-side MDC Logging | Local / VPC | Operational logging | Pseudonymized actor ref | Zero PII transmitted |

## 3. Sub-Processor Registry
- Current Sub-processors: **Zero**.
- In the current architecture, all storage and processing occur within the controlled boundary of the application's PostgreSQL and Kafka clusters.
- If cloud infrastructure (AWS/GCP/Azure) is provisioned for production deployment, standard Data Processing Addendums (DPAs) containing DPDP 2023 compliance clauses must be executed with the respective cloud vendor.
