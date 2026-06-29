# SCRUM-18: Contact Tailor via Call

## 1. Scrum Details
* **Title:** Contact Tailor via Call
* **Summary:** As a customer, I want to tap a button to call a tailor directly, so that I can speak with them immediately.
* **Description:**
  * Given a mobile device, when the Call button is tapped, then a phone dialer opens with the tailor's number pre-filled.
  * Given a desktop device without dialing capability, when viewed, then the number is displayed for manual dialing.
  * Given the button is tapped, when the action fires, then a click event is logged to analytics.
* **Assignee:** amankumar
* **Date Assigned:** June 29, 2026
* **Date PR Raised:** June 29, 2026

---

## 2. Implementation Details
* **Gated Access:**
  * `contact_number` is returned on `TailorPrivateResponse` structure after lead submission has unlocked contact access.
* **Analytics Click Log Endpoint:**
  * `POST /api/v1/tailors/{tailor_id}/track-click` implements increments to tailor call/WhatsApp click count tracking.
* **Test Verification:**
  * Endpoint analytics increments were verified with unit tests checking database increment functions in `test_endpoints.py`.
