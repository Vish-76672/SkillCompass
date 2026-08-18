# Skill Compass

A skill-gap analysis platform for students. Paste your resume text, pick a
target role, and get a weighted gap analysis plus a ranked list of the next
skills to learn — with your progress tracked over time.

## Project Credits

Original project developed and maintained by Vishwa Venkatesh.

Collaborative credit: Keerthana

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Python, Flask
- AI: Google Gemini API
- Database: SQLite
- Deployment: Vercel + Render
- PDF Processing: pypdf

## Project structure

```
skillcompass/
  backend/          Flask API (scoring, recommendations, history)
  frontend/          React + Vite + Tailwind UI
```

## How it works (for your report)

1. **Input** — resume text can be pasted directly, or a PDF can be
   uploaded (parsed server-side with `pypdf`, see `resume_parser.py`).
   Both paths feed the same analysis pipeline.
2. **Scoring — two modes:**
   - **AI mode** (`gemini_engine.py`): if a `GEMINI_API_KEY` is set,
     Gemini is given the role name and resume text and asked to determine
     the required skills, weigh them, judge which are present, and return
     ranked recommendations — all as structured JSON in one call. This is
     what makes the role list open-ended (15 roles, no hand-written skill
     table needed for most of them).
   - **Rule-based mode** (`app.py` / `roles_data.py`): a fallback keyword
     matcher against a fixed weight table, used automatically when no API
     key is set, or if the Gemini call fails. Only the first six roles in
     `ALL_ROLES` have a table, so those are the ones guaranteed to work
     either way.
3. **Recommendation layer** — in both modes, missing skills aren't just
   sorted by weight; priority is boosted when a skill builds on something
   you already have, and the UI shows the reasoning ("Builds on X, which
   you already have").
4. **Monitoring** — every analysis (AI or rule-based, tagged via a `mode`
   column) is saved to a local SQLite database
   (`backend/skillcompass.db`, created automatically). The History view
   pulls past attempts for a given name and plots score-over-time.

## Getting a Gemini API key (optional, but needed for AI mode)

1. Go to Google AI Studio: https://ai.google.dev/gemini-api/docs/api-key
2. Create a free API key.
3. In `backend/`, copy `.env.example` to `.env` and paste the key in:
   ```
   GEMINI_API_KEY=your-key-here
   ```
4. Restart the Flask server. `/api/health` will now report
   `"ai_enabled": true`, and all 15 roles become selectable.

**Without a key**, the app still runs fully — it just uses rule-based
scoring for the six roles that have a static skill table, and the other
nine will show a message asking for a key.

## Running it locally

### 1. Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then add your GEMINI_API_KEY if you have one
python app.py
```

This starts the API on `http://localhost:5000` and creates
`skillcompass.db` on first run.

### 2. Frontend (React + Vite)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

This starts the UI on `http://localhost:5173`. The Vite dev server proxies
`/api/*` requests to the Flask backend automatically (see
`vite.config.js`), so just open `http://localhost:5173` in your browser.

### 3. Building for deployment

- **Backend → Render**: point Render at `backend/`, build command
  `pip install -r requirements.txt`, start command `python app.py` (or
  `gunicorn app:app` if you add `gunicorn` to `requirements.txt` for
  production). Add `GEMINI_API_KEY` as an environment variable in Render's
  dashboard — don't commit your real `.env` file.
- **Frontend → Vercel**: point Vercel at `frontend/`, framework preset
  "Vite". Set an environment variable or edit `src/api.js` to point at your
  deployed backend URL instead of the relative `/api` path once both are
  live.

## Extending it further

- Add more roles to `ALL_ROLES` in `roles_data.py` — no skill table needed
  unless you also want it to work without an API key.
- Swap `gemini-2.5-flash` for a different model via the `GEMINI_MODEL` env
  var if you want to compare output quality/cost.
- Add authentication so history is tied to an account instead of a typed
  name.
- Add OCR (e.g. `pytesseract`) to `resume_parser.py` for scanned/image-based
  PDFs, which `pypdf` can't extract text from.
