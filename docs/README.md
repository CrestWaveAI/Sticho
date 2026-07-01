# StitchConnect — Development & Change Tracker

This directory is used to track every change, decision, branch, and feature implemented during the development of StitchConnect (Stichoh).

## Documentation Index

1. **[Backend Tracker](file:///Users/amankumar/Aman/Sticho/docs/backend-tracker.md)**
   * Tracks FastAPI backend changes, package additions, models, database schemas, and endpoints.
2. **[Git & Branch Tracker](file:///Users/amankumar/Aman/Sticho/docs/git-tracker.md)**
   * Logs branches created, PRs opened, and conventional commit logs.
3. **[Architecture Log](file:///Users/amankumar/Aman/Sticho/docs/architecture-log.md)**
   * Architecture Decision Records (ADRs) explaining technical choices (e.g., choice of DB, authentication methods).
4. **[Testing Guide](file:///Users/amankumar/Aman/Sticho/docs/testing.md)**
   * Instructions for running backend unit and integration tests and logs of execution results.
5. **[Frontend Documentation](file:///Users/amankumar/Aman/Sticho/docs/frontend/README.md)**
   * Outlines frontend scroll performance optimizations and autocomplete connection fixes.
6. **[Jeelan's Profile Creation Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-21-create-tailor-profile-jeelan80.md)**
   * Summary of Jeelan's work on tailor profile creation, registration flow, onboarding forms, and localStorage sync.
7. **[Antigravity's Contact Details Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-25-contact-details-antigravity.md)**
   * Summary of Antigravity's work on separate WhatsApp & Call number fields, Pydantic schemas, and endpoints mapping.
8. **[Resolve Unused Variables warnings](file:///Users/amankumar/Aman/Sticho/docs/BUGFIX-unused-vars-jeelan80.md)**
   * Summary of cleaning up unused variables and imports in analytics, notifications, and reviews.
9. **[Tailor Registration & Login (Email + Google OAuth) Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-20-email-auth-amankumar.md)**
   * Summary of backend work on register, login, Google OAuth endpoints, model properties, and OTP rollback.
10. **[Universal Search Autocomplete Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-13-search-autocomplete-jeelan80.md)**
    * Summary of universal search autocomplete supporting shops, locations, and categories with keyboard support and glassmorphism.
11. **[Save / Shortlist Tailors Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-14-save-shortlist-jeelan80.md)**
    * Summary of client-side shortlist storage and toggleable visual dashboard widgets.
12. **[Upload Portfolio Images Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-22-upload-portfolio-jeelan80.md)**
    * Summary of dynamic portfolio dashboard uploads, size/type constraints, deletions, and position reordering.
13. **[Cloudinary Backend Issue Setup](file:///Users/amankumar/Aman/Sticho/docs/BACKEND_CLOUDINARY_ISSUE.md)**
    * Blueprint for the backend team to hook up Cloudinary storage.
14. **[Cloudinary CDN Integration Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-22-cloudinary-cdn-amankumar.md)**
    * Summary of backend Cloudinary configuration, SDK integration, and upload handler implementation with local fallback.
15. **[Browse Portfolio Gallery Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-16-browse-portfolio-amankumar.md)**
    * Summary of backend support for retrieving and returning portfolio images sorted by position.
16. **[Contact Tailor via WhatsApp Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-17-whatsapp-contact-amankumar.md)**
    * Summary of backend WhatsApp number response properties and click tracking analytics.
17. **[Contact Tailor via Call Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-18-call-contact-amankumar.md)**
    * Summary of backend contact number response properties and click tracking analytics.
18. **[View Profile Dashboard Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-26-tailor-dashboard-amankumar.md)**
    * Summary of tailor performance metrics tracking and profile completeness analytics.
19. **[Set Working Hours Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-24-working-hours-antigravity.md)**
    * Summary of working hours validation schema and day-level schedule configuration.
20. **[Receive Lead Notifications Log](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-27-lead-notifications-antigravity.md)**
    * Summary of SMS/WhatsApp preference settings and background alert flows for customer interactions.
21. **[Customer Auth, Ratings & Dashboard Integration Log](file:///h:/Projects/Stichoh/docs/SCRUM-10-19-26-customer-auth-reviews-dashboard-jeelan80.md)**
    * Summary of frontend work integrating customer session login, ratings/reviews lists and submission forms, and Tailor Dashboard dynamic statistics.
22. **[Error Monitoring & Alerts Log (Backend)](file:///Users/amankumar/Aman/Sticho/docs/SCRUM-39-error-monitoring-antigravity.md)**
    * Summary of Sentry SDK backend configuration, alerts setup, and testing endpoint.
23. **[Error Monitoring & Alerts Log (Frontend)](file:///h:/Projects/Stichoh/docs/SCRUM-39-sentry-error-monitoring-jeelan80.md)**
    * Summary of Sentry SDK frontend configuration, hydration mismatch fixes, and Lead Management page hookups.
24. **[Simulated Services & Production Hookups Guide](file:///Users/amankumar/Aman/Sticho/docs/simulated-data-and-endpoints.md)**
    * Comprehensive guide cataloging backend mocks (SMS, Google OAuth, Sentry, Cloudinary fallback) and production transition steps.



---

## Active Milestone: Phase 1 — Discovery & Lead Gen MVP
* Objective: Setup projects, bootstrap FastAPI/Next.js, and implement tailor profiles + lead capture.
