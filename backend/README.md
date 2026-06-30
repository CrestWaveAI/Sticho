# StitchConnect — FastAPI Backend

This directory contains the FastAPI backend for the StitchConnect (Stichoh) application.

## Tech Stack
* **Python:** >= 3.13
* **Framework:** FastAPI
* **Package & Environment Management:** `uv`

---

## Local Development Setup

1. **Install dependencies and sync environment:**
   ```bash
   uv sync
   ```

2. **Run the local development server:**
   ```bash
   uv run uvicorn app.main:app --reload
   ```

3. **Verify the server is running:**
   Visit `http://127.0.0.1:8000/health` in your browser or run:
   ```bash
   curl http://127.0.0.1:8000/health
   ```

## Folder Structure
* `app/` — Application source code.
  * `app/main.py` — Application entrypoint.
