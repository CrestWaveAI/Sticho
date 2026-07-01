# SCRUM-39: Frontend Hookup — Sentry Error Monitoring & Alerts

## 1. Scrum Details
* **Jira Ticket:** [SCRUM-39](https://006amanraj.atlassian.net/browse/SCRUM-39) (Set Up Sentry Error Monitoring & Alerts)
* **Summary:** Install Sentry SDK, configure Next.js build-time integrations, and wire up client/server error capture wrappers.
* **Assignee:** `@jeelan80` (USER)
* **Date Assigned:** 2026-06-28
* **Date PR Raised:** 2026-07-01

---

## 2. Implementation Details

### Sentry SDK Configurations
- Installed `@sentry/nextjs` dependency in the frontend project.
- Created Sentry config files in the frontend root:
  - [sentry.client.config.ts](file:///h:/Projects/Stichoh/frontend/sentry.client.config.ts): Initializes Sentry for browser error capture, binding `NEXT_PUBLIC_SENTRY_DSN` with a default trace sample rate of `1.0`.
  - [sentry.server.config.ts](file:///h:/Projects/Stichoh/frontend/sentry.server.config.ts): Initializes Sentry for API routes and Node.js server environments.
  - [sentry.edge.config.ts](file:///h:/Projects/Stichoh/frontend/sentry.edge.config.ts): Initializes Sentry for Edge runtime and middleware contexts.
- Updated [next.config.ts](file:///h:/Projects/Stichoh/frontend/next.config.ts) to wrap the NextConfig with `withSentryConfig`, enabling sourcemap uploads during production compilations.

### Verification Page
- Added a validation test route [sentry-test/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/sentry-test/page.tsx) rendering a card interface with a "Trigger Test Error" button.
- Clicking the button throws a runtime client exception `throw new Error("Sentry Frontend Verification Success")` to verify tracking dashboard integration.

---

## 3. Hydration Mismatch Fixes (GitHub Issue #55)
- Resolved React/Next.js hydration mismatch bugs by replacing synchronous `localStorage` reading in `useState` initializers with deferred asynchronous updates:
  - Modified [dashboard/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/page.tsx) and [page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx).
  - Defer state loading on mount by setting states within `setTimeout(() => { ... }, 0)` inside `useEffect`, preventing DOM structure mismatch alerts.

---

## 4. Lead Management Page API Hookup (GitHub Issue #56)
- Created the `fetchLeads` api helper in [api.ts](file:///h:/Projects/Stichoh/frontend/src/app/api.ts) querying `GET /api/v1/leads?tailor_id={tailor_id}` with Bearer credentials.
- Updated [dashboard/leads/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/leads/page.tsx) to fetch, paginate, filter, and display leads dynamically from the live database rather than the local hardcoded mock data.
