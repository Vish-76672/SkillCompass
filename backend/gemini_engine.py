"""
Dynamic skill-gap analysis using the Gemini API.

Instead of a hand-written weight table, Gemini is given the target role and
resume text and asked to determine the required skills, weigh them, check
which are present, and produce ranked recommendations -- all in one
structured-JSON call. This is what makes the role list open-ended: adding a
role to ALL_ROLES in roles_data.py needs no matching skill table here.

Falls back gracefully: if GEMINI_API_KEY isn't set, or the call fails for
any reason after retries, app.py catches it and uses the static rule-based
engine instead (for the six roles that have one).
"""

import json
import os
import time

from google import genai
from google.genai import types

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")

_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def is_available():
    return _client is not None


PROMPT_TEMPLATE = """You are a technical recruiter evaluating a candidate's resume
against a specific target role.

Target role: "{role}"

Resume text:
\"\"\"
{resume_text}
\"\"\"

Task:
1. Identify 10 to 14 of the most important skills or technologies required
   for this role. Give each one an importance weight from 1 (nice-to-have)
   to 5 (essential/core).
2. For each skill, decide whether it is clearly demonstrated in the resume
   text (matched) or not (missing). Judge based on substance, not just
   exact keyword spelling -- e.g. "built REST APIs" counts as "REST API".
3. Compute an overall score: (sum of weights of matched skills / sum of
   weights of all skills) * 100, rounded to 1 decimal place.
4. From the missing skills, pick the 4 highest-priority ones to recommend
   next. Priority should favor skills that build naturally on what the
   candidate already has. Give each a one-sentence, specific reason.

Return ONLY valid JSON in exactly this shape, no markdown fences, no extra
commentary:

{{
  "score": <number>,
  "matched": [{{"skill": "<string>", "weight": <number>}}, ...],
  "missing": [{{"skill": "<string>", "weight": <number>}}, ...],
  "recommendations": [
    {{"skill": "<string>", "priority_score": <number>, "reason": "<string>"}}, ...
  ]
}}
"""


def _is_retryable_error(e):
    """
    Detect transient overload errors (503 / UNAVAILABLE) across SDK versions
    without depending on one specific exception class, since google-genai's
    error hierarchy has shifted between versions.
    """
    text = str(e)
    code = getattr(e, "code", None) or getattr(e, "status_code", None)
    return code == 503 or "503" in text or "UNAVAILABLE" in text


def _generate_with_retry(prompt, max_retries=3):
    """Retries on transient Gemini overload (503) with exponential backoff.
    Re-raises immediately on any non-retryable error (bad JSON schema,
    auth failure, invalid request, etc.) -- retrying those just wastes time."""
    last_error = None
    for attempt in range(max_retries):
        try:
            return _client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            last_error = e
            if not _is_retryable_error(e) or attempt == max_retries - 1:
                raise
            wait = 2 ** attempt  # 1s, 2s, 4s
            time.sleep(wait)
    raise last_error


def analyze_with_gemini(role_name, resume_text):
    """Returns a result dict matching the app's API contract, or raises."""
    if _client is None:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    prompt = PROMPT_TEMPLATE.format(role=role_name, resume_text=resume_text[:12000])

    response = _generate_with_retry(prompt)

    data = json.loads(response.text)

    matched = data.get("matched", [])
    missing = data.get("missing", [])
    recommendations = data.get("recommendations", [])[:4]

    return {
        "role": role_name,
        "score": round(float(data.get("score", 0)), 1),
        "matched": matched,
        "missing": missing,
        "recommendations": recommendations,
        "total_skills": len(matched) + len(missing),
        "matched_count": len(matched),
        "mode": "ai",
    }
