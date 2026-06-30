# SCRUM-17: Contact Tailor via WhatsApp

## 1. Scrum Details
* **Title:** Contact Tailor via WhatsApp
* **Summary:** As a customer, I want to tap a button to start a WhatsApp chat with a tailor, so that I can contact them instantly without manually saving their number.
* **Description:**
  * Given a tailor profile with a WhatsApp number, when the WhatsApp button is tapped, then a WhatsApp chat opens pre-filled with the tailor's number.
  * Given the button is tapped, when the action fires, then a click event is logged to analytics.
  * Given a tailor has no WhatsApp number set, when the profile loads, then the button is hidden or disabled.
* **Assignee:** amankumar
* **Date Assigned:** June 29, 2026
* **Date PR Raised:** June 29, 2026

---

## 2. Implementation Details
* **Gated Access:**
  * `whatsapp_number` is returned on `TailorPrivateResponse` structure after lead submission has unlocked contact access.
* **Analytics Click Log Endpoint:**
  * `POST /api/v1/tailors/{tailor_id}/track-click` implements increments to tailor call/WhatsApp click count tracking.
* **Test Verification:**
  * Endpoint analytics increments were verified with unit tests checking database increment functions in `test_endpoints.py`.
