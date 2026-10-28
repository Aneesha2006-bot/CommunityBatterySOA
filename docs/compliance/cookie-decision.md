# Architectural Decision Record: Zero Non-Essential Cookies

## Context
Under India's Digital Personal Data Protection (DPDP) Act 2023 and global privacy frameworks (GDPR, ePrivacy Directive), non-essential cookies (such as analytics, tracking pixels, and advertising beacons) require prior, informed, granular, and affirmative consent via invasive banner prompts. Such banners frequently impair user accessibility, degrade performance, and introduce regulatory liability.

## Decision
We made a conscious architectural decision to implement a **Zero Non-Essential Cookie Architecture**:
1. All user session state is managed via cryptographically signed RS256 JWT bearer tokens stored strictly in ephemeral JavaScript memory (with optional session storage during tab lifetime).
2. No third-party analytics (Google Analytics, Mixpanel, Hotjar) are integrated. Telemetry is purely operational, server-side, pseudonymized, and logged via Spring Cloud Gateway.
3. No external font CDNs or third-party script tags are embedded. All static assets and font glyphs are bundled locally with Vite.

## Consequences
- **Positive**:
  - Full compliance with DPDP Act 2023 without annoying, disruptive banner overlays.
  - Zero leakage of IP addresses or browsing behavior to third-party ad networks.
  - Sub-second page load times and zero network overhead from analytics scripts.
  - Clean accessibility (WCAG 2.2 AA) with no intrusive modals blocking screen readers or keyboard navigation.
- **Negative / Trade-offs**:
  - Aggregated web visitor funnel analytics must be derived from gateway server-side access logs rather than client-side event trackers.
