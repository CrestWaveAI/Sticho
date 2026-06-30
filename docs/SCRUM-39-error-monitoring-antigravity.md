# SCRUM-39: Set Up Error Monitoring & Alerts

## 1. Scrum Details
* **Title:** Set Up Error Monitoring & Alerts
* **Summary:** Integrate Sentry SDK in the backend, configure environment variables, and create error testing endpoint.
* **Description:** As a development team, I want frontend and backend errors tracked in a monitoring tool, so production issues get caught fast.
  * Given an error occurs, when thrown on frontend or backend, then it's captured by the monitoring tool.
  * Given a critical error, when logged, then it triggers a Slack or email alert to the team.
  * Given the monitoring dashboard, when accessed, then all 4 developers have visibility.
* **Assignee:** Mush4rr4f (Backend) / Antigravity (Backend)
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-30

---

## 2. Implementation Details
* **Environment Variables:**
  * Added `SENTRY_DSN` placeholder to [backend/.env.example](file:///Users/amankumar/Aman/Sticho/backend/.env.example) and configured the real project ingestion DSN (`https://238c4552533609ad3fb011c06edc605b@o4511654805635073.ingest.us.sentry.io/4511654816120832`) in local [backend/.env](file:///Users/amankumar/Aman/Sticho/backend/.env).
* **Sentry SDK Integration:**
  * Initialized `sentry_sdk` in [backend/app/main.py](file:///Users/amankumar/Aman/Sticho/backend/app/main.py) with the `FastApiIntegration` and `send_default_pii=True` enabled. It loads only when `SENTRY_DSN` is configured.
* **Testing Endpoint:**
  * Appended `GET /sentry-debug` endpoint to [backend/app/main.py](file:///Users/amankumar/Aman/Sticho/backend/app/main.py). This route intentionally raises a `ZeroDivisionError` to let developers trigger and test Sentry capture flows.
* **Test Verification:**
  * Added **Test 18** to [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) which initializes Sentry with a mock DSN, calls the `/sentry-debug` endpoint, and asserts that exception capturing operates correctly. Passed successfully.
