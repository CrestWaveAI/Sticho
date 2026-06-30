# Architecture Decision Log (ADR)

This file contains records of significant architectural and design choices made during the development of StitchConnect.

## Format of Decisions (ADR template)
* **Title:** Concise title of the decision.
* **Date:** Date of proposal/decision.
* **Status:** Draft / Proposed / Accepted / Rejected / Superseded.
* **Context:** What is the problem we are solving, and what constraints exist?
* **Decision:** What is the chosen solution?
* **Consequences:** What are the trade-offs, advantages, and drawbacks?

---

## ADR 1: Development Tracking System
* **Date:** 2026-06-23
* **Status:** Accepted
* **Context:** The development team wants to trace every single change, dependency addition, and architectural decision, specifically for the backend, to maintain clear project documentation and avoid code drift.
* **Decision:** Create a centralized `/docs` folder in the root directory containing tracking logs for backend tasks, git activity, and architectural choices.
* **Consequences:** Provides self-documenting visibility, making it easy to review progress and onboard additional developers, while requiring manual updates as changes are made.

---

## ADR 2: Supabase as the Database & BaaS Solution
* **Date:** 2026-06-23
* **Status:** Accepted
* **Context:** The project requires a relational database to support core entities (Tailors, Leads, Services, etc.) and a scalable backend. Since we are in the MVP phase, we want to minimize deployment complexity and leverage modern cloud-managed infrastructure.
* **Decision:** Use **Supabase** (managed PostgreSQL) as our database. We will configure the FastAPI backend to interface with the Supabase Postgres instance.
* **Consequences:**
  * **Pros:** Instantly available managed Postgres, built-in connection pooling, clean dashboard interface, and future-proof support for Supabase Auth, Storage (for tailor portfolio images), and Realtime features.
  * **Cons:** Requires network access/connectivity for local development, introduces direct dependency on a cloud service.
  * **Action:** Configure `.env.example` with Supabase credentials (`SUPABASE_URL`, `SUPABASE_KEY`, `DATABASE_URL` for Postgres direct pooler) and install Supabase/PostgreSQL client libraries on the backend.

---

## ADR 3: Migration to Supabase REST Client (`supabase-py`) for Runtime Operations
* **Date:** 2026-06-25
* **Status:** Accepted
* **Context:** Local developer machines and environments often lack IPv6 routing capability or face network translation restrictions. Because the Supabase database connection pooler and direct PostgreSQL DNS endpoints resolves to IPv6-only records in some regions (e.g. AWS Tokyo), attempting direct PostgreSQL connections via `postgresql+asyncpg://` yields host-unreachable DNS errors (`[Errno 8] nodename nor servname provided, or not known`).
* **Decision:** Migrate all runtime API endpoints (Discovery, Autocomplete, Portfolio management, Leads registration) to query the Supabase REST/PostgREST gateway via `supabase-py` instead of routing raw SQL via SQLAlchemy/asyncpg.
* **Consequences:**
  * **Pros:** Uses standard HTTP/HTTPS protocols over IPv4 to communicate with Supabase, bypassing local network IPv6 constraints entirely and eliminating connection pooling/auth propagation lag.
  * **Cons:** Loses SQLAlchemy ORM database writes/reads convenience at runtime. Requires manual dictionary mapping from PostgREST json payloads to Pydantic responses.
  * **Action:** Created `app/core/supabase_client.py` using `supabase-py`. Replaced database queries in tailors, locations, and leads endpoints. Mapped results manually to schemas. Wrote a robust `MockSupabaseClient` translating API builder queries to sqlite for in-memory integration testing.


