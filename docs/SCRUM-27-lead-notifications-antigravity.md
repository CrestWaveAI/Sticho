# SCRUM-27: Receive Lead Notifications

## 1. Scrum Details
* **Title:** Receive Lead Notifications
* **Summary:** Support tailor notification preferences (SMS/WhatsApp) and automatic background alerts triggered on profile views, click-throughs, and lead captures.
* **Description:** As a tailor, I want to receive a WhatsApp or SMS alert when a customer views or contacts me, so that I don't miss potential business.
  * Given a profile view or contact click occurs, when the event fires, then a notification is triggered within a defined time window.
  * Given a tailor has opted out, when events occur, then no notifications are sent.
  * Given a tailor opts back in, when events occur, then notifications resume via WhatsApp or SMS.
* **Assignee:** Mush4rr4f (Backend) / Antigravity (Backend)
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-29

---

## 2. Implementation Details
* **Database Columns:**
  * Added `notifications_enabled` (boolean, default true) and `notification_channel` (text, default 'whatsapp') columns to the `tailors` table.
* **Models and Schemas:**
  * Mapped new fields on the `Tailor` SQLAlchemy ORM model in [tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/tailor.py) using `server_default` constraints.
  * Exposed fields in Pydantic models `TailorBase`, `TailorUpdate`, and `TailorPrivateResponse` in [tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/tailor.py).
* **Notification Simulation Service:**
  * Implemented `NotificationService` helper in [notification.py](file:///Users/amankumar/Aman/Sticho/backend/app/services/notification.py) to parse alert preferences and write mock SMS/WhatsApp delivery records to [mock_notifications.log](file:///Users/amankumar/Aman/Sticho/docs/mock_notifications.log).
* **Asynchronous Integration Triggers:**
  * Integrated FastAPI `BackgroundTasks` to asynchronously dispatch notification tasks on events:
    * **Profile Views:** Intercepted `GET /api/v1/tailors/{tailor_id}` in [tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py).
    * **Contact Click:** Intercepted `POST /api/v1/tailors/{tailor_id}/track-click` in [tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py).
    * **Lead Capture:** Intercepted `POST /api/v1/leads` in [leads.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/leads.py).
* **Test Verification:**
  * Added test cases to Test 17 in [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) checking trigger execution, preference changes, and opt-out filters. All tests pass successfully.
