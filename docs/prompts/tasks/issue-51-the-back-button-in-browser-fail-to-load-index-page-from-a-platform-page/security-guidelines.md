# Security Guidelines — Issue 51: Browser Back Button Fails to Load Index Page from a Platform Page

## Scope

This change is confined to adding a navigation lifecycle hook that resets the singleton extraction state to idle whenever the index page is entered. No new packages, no new network calls, no new user-facing inputs, and no changes to the Netlify Function boundary are required. The security surface introduced is therefore narrow; the rules below reflect that scope and guard against the realistic risks it does touch.

---

## Rules

### 1. The state reset must be unconditional and must not branch on any value derived from the URL, query string, or route parameters

**What:** The reset logic must not read, evaluate, or act on any data carried in the navigation event (route path, query parameters, hash fragment, or navigation metadata) to decide whether or not to perform the reset.

**Where:** `src/pages/index.vue` (component lifecycle hook) or `src/router/index.ts` (global `beforeEach` guard), whichever layer is chosen for the implementation.

**Why:** If the reset is gated on a URL-derived value, an attacker who can influence the URL (e.g., via a crafted link sent to the user) could suppress the reset and keep stale or attacker-influenced state visible on the index page. Unconditional reset eliminates this class of attack entirely.

---

### 2. Route identity used to scope the reset must be compared against a hardcoded constant, not a value from the navigation event

**What:** The condition that restricts the reset to the index page only (Rule 3 of the business spec) must compare the destination route against a literal string or imported route name defined in source code — never against a value derived from the incoming navigation object itself in a way that could be spoofed or mutated at runtime.

**Where:** `src/pages/index.vue` or `src/router/index.ts`.

**Why:** If the route-identity check relies on a mutable or externally-supplied value rather than a source-controlled constant, a crafted navigation could cause the reset to execute on the wrong route or be skipped on the index route. Either outcome represents a logic-level integrity violation.

---

### 3. The reset must operate only on the shared extraction state composable and must not touch browser storage, cookies, or any persistence layer

**What:** The reset operation must be limited to mutating the in-memory module-level reactive state exposed by `useArticleState`. It must not read from or write to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies as part of this fix.

**Where:** `src/composables/useArticleState.ts` (the reset contract it already exposes), consumed from `src/pages/index.vue` or `src/router/index.ts`.

**Why:** Client-side storage is readable by any script on the same origin and, for cookies, by the server. Writing navigation state transitions to storage unnecessarily widens the persistence attack surface. The in-memory singleton is sufficient and is already the established pattern (ADR-002).

---

### 4. No new external dependencies may be introduced by this change

**What:** The fix must be implemented exclusively with Vue Router's built-in navigation lifecycle hooks and the existing `useArticleState` composable. No new npm packages may be added.

**Where:** `package.json`, `src/pages/index.vue`, `src/router/index.ts`.

**Why:** Each new dependency is a supply-chain risk. Given that the fix requires only a built-in Vue Router hook and an already-present composable, adding any package would introduce unnecessary exposure to compromised or malicious packages.

---

### 5. In-flight network requests cancelled by back-navigation must not be permitted to mutate visible state after the reset has executed

**What:** If an extraction request is in progress when the user navigates back, the result of that request (whether success or error) must not be able to overwrite the idle state that the reset has established. The reset must be the last write to the shared state from the perspective of the index page render cycle.

**Where:** `src/composables/useArticleState.ts` (reset contract), `src/composables/useArticleExtractor.ts` (the async workflow that performs the network call), `src/pages/index.vue`.

**Why:** A race condition between an in-flight fetch callback and the reset hook could result in post-reset state being overwritten with a `success`, `error`, or `loading` value. If an attacker can influence the timing (e.g., by causing a deliberately slow response), they could craft a scenario where stale or unexpected content appears on the reset page, constituting a UI integrity violation and a potential information disclosure vector.

---

### 6. The navigation guard or lifecycle hook must not log, expose, or forward route or state data to any external endpoint

**What:** The implementation must not include any analytics call, logging statement, or third-party beacon that transmits the previous route, the current route, or any portion of the extraction state to an external service.

**Where:** `src/pages/index.vue`, `src/router/index.ts`.

**Why:** Route transitions and state values may carry implicit information about user activity. Emitting this data externally during a navigation hook would introduce an unintended data-exfiltration path that is not required by the fix and is not covered by any existing privacy or data-handling policy in this codebase.

---

### 7. The fix must not alter or relax the Netlify Function domain whitelist or any existing HTTP security headers

**What:** The `netlify/functions/fetch-article.ts` function's domain whitelist (`iamjeremie.me`, `jeremielitzler.fr`) and any Content-Security-Policy, X-Frame-Options, or other HTTP response headers set at the Netlify layer must remain unchanged.

**Where:** `netlify/functions/fetch-article.ts`, `netlify.toml` (or equivalent header configuration).

**Why:** This fix is scoped to client-side navigation state. Any modification to the server-side allowlist or HTTP security headers would be out of scope and could inadvertently open the CORS proxy to unwhitelisted domains or weaken browser-enforced protections (ADR-006).

---

### 8. XSS surface must not be expanded: no new use of `v-html` or dynamic HTML rendering may be introduced on the index page as part of this fix

**What:** The index page reset hook must not introduce any new binding of state values to `v-html` or any other raw HTML rendering mechanism.

**Where:** `src/pages/index.vue`.

**Why:** The existing XSS mitigation pattern (DOMPurify on `v-html`, documented in ADR-007) is scoped to `PlatformMedium.vue`. Introducing `v-html` on the index page without the same DOMPurify guard would create an unmitigated XSS surface. The reset logic has no legitimate need to render raw HTML.

---

### 9. Environment variables and secrets must not be referenced or accessed within the navigation hook or the reset logic

**What:** The reset implementation must not read any `import.meta.env` variable, process environment variable, or secret value.

**Where:** `src/pages/index.vue`, `src/router/index.ts`, `src/composables/useArticleState.ts`.

**Why:** Navigation hooks run in the browser and are fully visible to any script on the page. Reading environment variables in this context risks exposing values intended to be build-time-only, and there is no functional justification for accessing secrets in a pure state-reset operation.

status: ready
