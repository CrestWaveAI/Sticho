# Sticho — Frontend Optimizations & Fixes

This directory documents the changes made to the Sticho Next.js frontend to resolve GitHub Issue #13 and Issue #14.

## 1. Scroll Jitter & Repaint Lag Optimization (Issue #14)

### Problem
During scroll testing on the homepage, noticeable scroll jitter and frame rate drops (repaint lag) were observed. This was caused by the combination of `background-attachment: fixed` on the `body` element and sticky backdrop blurs (`.header` and `.filter-panel`), forcing the browser to repaint the entire page layout on every scroll event.

### Solution
We moved the fixed background gradient out of the `html, body` selector and into a dedicated compositor layer:
* **File Modified**: [globals.css](file:///h:/Projects/Stichoh/frontend/src/app/globals.css)
* **Changes**:
  * Removed `background-attachment: fixed;` and `background-image` from the `html, body` styles.
  * Added a `body::before` pseudo-element that renders the background gradient.
  * Promoted this pseudo-element to its own GPU compositor layer using `will-change: transform;` and `position: fixed;`. This allows the browser to scroll the main page content independently of the background, eliminating layout recalculation and repaint latency.

---

## 2. Autocomplete Query Parameter & Fallback Resolution Fixes (Issue #13)

### Problem
1. On certain local environments (e.g., macOS), `localhost` resolves to the IPv6 loopback address `[::1]`. Since the backend binds to the IPv4 address `127.0.0.1`, frontend fetches to `localhost:8000` failed.
2. Autocomplete selections from the locations dropdown (like `"Indiranagar, Bangalore"`) were sent raw as the `locality` query parameter. This is now split into separate `locality` and `city` parameters for cleaner API calls.

### Solution
1. **IPv4 Loopback Fallback**:
   * **File Modified**: [api.ts](file:///h:/Projects/Stichoh/frontend/src/app/api.ts)
   * **Changes**: Changed the fallback `API_BASE_URL` from `http://localhost:8000` to `http://127.0.0.1:8000`.
2. **Search Query Parameter Splitting**:
   * **File Modified**: [page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx)
   * **Changes**: Added checks in the tailors fetch `useEffect`. When `submittedQuery` contains a comma, it is split by `,`. The first part is assigned to `locality` and the second part is assigned to `city` (e.g. `"Indiranagar, Bangalore"` splits into `locality=Indiranagar` and `city=Bangalore`).
