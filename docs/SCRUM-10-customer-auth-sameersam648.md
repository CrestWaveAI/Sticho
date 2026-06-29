# SCRUM-10: Customer Registration & Login (Email + Google OAuth)

## 1. Scrum Details
* **Title:** Customer Registration & Login (Email + Google OAuth)
* **Summary:** Implement backend endpoints and database schemas to support customer registration and login via Email/Password and Google OAuth.
* **Description:** As a customer, I want to register and log in using my email or Google account, so that I can save my activity and access the platform securely.
* **Assignee:** sameersam648
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-28

---

## 2. Implementation Details
* **Database Changes:**
  * Created `public.customers` table containing `id`, `name`, `email`, `hashed_password`, `google_id`, and `created_at` fields.
* **ORM Model:**
  * Added `Customer` SQLAlchemy model in [customer.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/customer.py).
* **Validation Schemas:**
  * Created customer schemas in [customer_auth.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/customer_auth.py).
* **Endpoints Built:**
  * `POST /api/v1/customer-auth/register`: Register new customer with email uniqueness checks.
  * `POST /api/v1/customer-auth/login`: Authenticate customer with PBKDF2-HMAC-SHA256 password hash checking.
  * `POST /api/v1/customer-auth/google`: Link google account and sign in/up customers.
* **Token Auth & Security:**
  * Added token verification dependency `get_current_customer_id` in [security.py](file:///Users/amankumar/Aman/Sticho/backend/app/core/security.py) to secure client requests.
* **Test Verification:**
  * Added Test 14 to [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) checking registration, duplicate rejection, standard login, and Google OAuth login. Passed successfully.
