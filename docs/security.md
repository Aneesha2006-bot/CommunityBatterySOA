# Security Architecture & Identity Specification (SOA s10.t03 / B3, CO2)

## 1. Zero-Trust Security Model

In this architecture, every microservice adheres to a **Zero-Trust** security baseline:
1. **Edge Gateway Validation**: `api-gateway` validates the incoming Bearer JWT against `auth-service` JWKS (`/.well-known/jwks.json`) before routing.
2. **Independent Downstream Validation**: Every domain service (`battery-state-service`, `reserve-policy-service`, `discharge-allocation-service`) independently inspects and validates the cryptographic RS256 signature, issuer (`http://localhost:8080/auth`), audience (`community-battery-api`), and expiration.
3. **No Header Spoofing**: Downstream services NEVER trust client-supplied headers like `X-User-Id` or `X-Roles`. All principal identities and roles are extracted directly from the verified cryptographic JWT claims via `@AuthenticationPrincipal Jwt jwt`.

## 2. JWT Specification & Claims
- **Algorithm**: RS256 (RSA Signature with SHA-256)
- **Key Identifier (`kid`)**: `cb-auth-key-1`
- **Public Key Endpoint**: `http://localhost:8080/auth/.well-known/jwks.json`
- **Claims Schema**:
  - `iss`: Token issuer (`http://localhost:8080/auth`)
  - `sub`: Pseudonymous user identifier (e.g., `subj-member-a`, `subj-coord-1`)
  - `aud`: Intended audience (`community-battery-api`)
  - `iat`: Issued-at timestamp (epoch seconds)
  - `exp`: Expiration timestamp (short-lived: 1 hour default)
  - `jti`: Unique token identifier UUID
  - `roles`: Array of granted role strings (`["ROLE_member"]`, `["ROLE_energyCoordinator"]`)

## 3. Role-Based Access Control (RBAC)

| Endpoint | Method | Permitted Roles | Description |
|---|---|---|---|
| `/auth/token` | POST | Anonymous | Synthetic user login endpoint |
| `/.well-known/jwks.json` | GET | Anonymous | RS256 public key distribution |
| `/api/battery/state` | GET | `member`, `energyCoordinator` | Summary for members; full telemetry for coordinator |
| `/api/reserve/policy` | GET | `member`, `energyCoordinator` | Read active floor and daily caps |
| `/api/reserve/policy` | PUT | `energyCoordinator` | Update reserve floor and caps (`@PreAuthorize("hasRole('energyCoordinator')")`) |
| `/api/discharges` | POST | `member`, `energyCoordinator` | Submit energy discharge request |
| `/api/discharges` | GET | `member`, `energyCoordinator` | Member views own requests; coordinator views all |
| `/api/discharges/{id}` | GET | `member`, `energyCoordinator` | Record-level access check: owner `sub` must match |
| `/api/discharges/rejected` | GET | `member`, `energyCoordinator` | Member views own rejections; coordinator views all |
| `/api/consent` | POST / DELETE | `member`, `energyCoordinator` | Manage privacy consent purposes |
| `/api/privacy/requests` | POST | `member`, `energyCoordinator` | Submit DPDP data access/erasure requests |

## 4. Horizontal Privilege Escalation Prevention

To prevent member-b from viewing or tampering with member-a's records:
```java
// DischargeAllocationService.java
if (!isCoordinator && !request.getMemberRef().equals(subject)) {
    // Return 404 Not Found to prevent leaking record existence
    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
}
```
If a member queries `/api/discharges/{id}` where the record belongs to another member, the service responds with HTTP `404 Not Found`, giving zero indication of whether the ID exists.

## 5. Audit Logging & PII Redaction

All security events (logins, policy updates, allocation decisions, consent modifications) are recorded in structured JSON format with sensitive personal data redacted:
```json
{
  "timestamp": "2026-10-28 20:12:46.061",
  "level": "INFO",
  "logger": "com.communitybattery.discharge.service.DischargeAllocationService",
  "message": "Discharge decision: id=4b1b53de-6fe7-44d3-9a7e-01ad2a5a6725, member=[REDACTED], req=45.0, granted=38.0, denied=7.0, status=PARTIALLY_GRANTED, instanceId=discharge-allocation-service:8084"
}
```
Passwords, JWT tokens, email addresses, and residential identifiers are never written to disk or logs.

## 6. Enterprise Identity Provider Migration Path

To migrate from the lightweight local `auth-service` to enterprise identity providers:
- **Keycloak**: Configure a realm `community-battery` and set `spring.security.oauth2.resourceserver.jwt.issuer-uri=https://sso.example.com/realms/community-battery`.
- **Auth0**: Configure API audience `community-battery-api` and set domain `https://community-battery.auth0.com/`.
- **Microsoft Entra ID (Azure AD)**: Register app registration and set issuer `https://login.microsoftonline.com/{tenantId}/v2.0`.
Because all downstream domain services rely on standard OIDC discovery and RFC 7517 JWKS, **zero Java code changes** are required in domain services—only updating the `issuer-uri` in `application.yml`.
