# Cookie & Local Storage Inventory

## 1. Inventory Summary
This application adheres to a strict **Zero Non-Essential Cookie Policy**. No third-party tracking, profiling, marketing, or advertising cookies are utilized.

| Identifier | Type | Storage Mechanism | Purpose | Category | Expiry | Third-Party Access |
|---|---|---|---|---|---|---|
| `cb_access_token` | Auth Token | In-Memory (JavaScript state) / `sessionStorage` | Session authentication with API Gateway | Strictly Necessary | Session (cleared on tab close) | None |
| `cb_theme_mode` | Preference | `localStorage` | Dark/Light visual theme preference | Strictly Necessary (UX) | Persistent | None |
| `cb_consent_state` | Compliance | `localStorage` | Cache of user's declared DPDP privacy preferences | Strictly Necessary | 1 year | None |

## 2. Third-Party Tracker Audit
- Google Analytics: **None**
- Meta Pixel: **None**
- Advertising Trackers: **None**
- External Font Trackers: **None** (fonts are self-hosted)
- External CDN Trackers: **None**
