# SCRUM-19: View & Submit Ratings and Reviews

## 1. Scrum Details
* **Title:** View & Submit Ratings and Reviews
* **Summary:** Implement backend endpoints and database schemas to support tailor review submissions, duplicate review prevention, and aggregate average tailor ratings.
* **Description:** As a customer, I want to submit ratings and comments for tailors, and view existing reviews on tailor profiles.
* **Assignee:** sameersam648
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-28

---

## 2. Implementation Details
* **Database Changes:**
  * Created `public.reviews` table containing `id`, `tailor_id`, `customer_id`, `rating`, `comment`, `status`, and `created_at` fields with a unique constraint on `(customer_id, tailor_id)`.
* **ORM Model:**
  * Added `Review` SQLAlchemy model in [review.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/review.py).
  * Added relationship links on `Tailor` in [tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/tailor.py).
* **Validation Schemas:**
  * Created review schemas in [review.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/review.py).
* **Endpoints Built:**
  * `POST /api/v1/reviews`: Submit a review, verify tailor existence, block duplicate reviews from the same customer, auto-approve reviews, and trigger average ratings recalculation on the tailor profile.
  * `GET /api/v1/reviews/tailor/{tailor_id}`: List approved reviews for a tailor with customer names.
* **Test Verification:**
  * Added Test 15 to [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) checking review submission, duplicate checks, and review listing. Passed successfully.
