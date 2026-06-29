# [BACKEND] Configure Cloudinary CDN for portfolio image uploads

**Labels:** `backend`, `enhancement`  
**Assignees:** @musharraf, @amankumar

## Description

The frontend portfolio upload feature is now fully integrated with the backend APIs on the branch `feature/frontend-portfolio-upload-SCRUM-22`. 

Currently, the backend endpoint `POST /api/v1/tailors/{tailor_id}/portfolio/upload` (defined in `backend/app/api/v1/endpoints/tailors.py`) implements a fallback local file system mock which writes uploads to `/static/media/` and returns the local relative URL.

To support production CDN hosting:
1. Transition the file storage handler in `upload_portfolio_image` to upload incoming assets directly to Cloudinary.
2. Ensure that the returned `image_url` is the full Cloudinary CDN absolute path.
3. Configure the Cloudinary credentials and fallback environment variables in the UV backend config files and `.env`.
