# SCRUM-27: Receive Lead Notifications - Frontend Hookup

## 1. Scrum Details
* **Title:** Receive Lead Notifications
* **Summary:** Hook up tailor notification preferences (SMS/WhatsApp) toggles.
* **Description:** As a tailor, I want to receive a WhatsApp or SMS alert when a customer views or contacts me, so that I don't miss potential business.
  * Given a tailor has opted out, when events occur, then no notifications are sent.
  * Given a tailor opts back in, when events occur, then notifications resume via WhatsApp or SMS.
* **Assignee:** `@jeelan80` (USER)
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-30

---

## 2. Implementation Details
- **API Interface**: Added `notifications_enabled` and `notification_channel` properties to `Tailor` interface and `updateTailor` payload.
- **Settings Page Controls**: Created UI toggles on the settings dashboard:
  - Checkbox toggle to enable/disable lead alerts (`notifications_enabled`).
  - Dropdown selection to choose the notification channel: WhatsApp, SMS, or Both (`notification_channel`).
  - Fetches preferences on mount and persists updates directly to backend tailors table.
