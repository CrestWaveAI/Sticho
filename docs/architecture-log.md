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

