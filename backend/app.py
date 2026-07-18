import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS

from roles_data import (
    STATIC_ROLES,
    RELATED_SKILLS,
    ALL_ROLES,
    get_role_names,
    get_role_skills,
    is_static_role,
)
from resume_parser import extract_text_from_pdf
import gemini_engine

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "skillcompass.db"

app = Flask(__name__)
CORS(app)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            role TEXT NOT NULL,
            score REAL NOT NULL,
            mode TEXT NOT NULL DEFAULT 'rule_based',
            matched_json TEXT NOT NULL,
            missing_json TEXT NOT NULL,
            recommendations_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def compute_static_analysis(role_name, resume_text):
    """The original keyword-matching + co-occurrence-boost engine."""
    skills = get_role_skills(role_name)
    if skills is None:
        return None

    text = resume_text.lower()
    matched, missing = [], []

    for skill, weight in skills:
        if skill.lower() in text:
            matched.append({"skill": skill, "weight": weight})
        else:
            missing.append({"skill": skill, "weight": weight})

    total_weight = sum(w for _, w in skills)
    matched_weight = sum(m["weight"] for m in matched)
    score = round((matched_weight / total_weight) * 100, 1) if total_weight else 0.0

    matched_names = {m["skill"] for m in matched}
    scored_missing = []
    for m in missing:
        related = RELATED_SKILLS.get(m["skill"], [])
        related_matched_count = sum(1 for r in related if r in matched_names)
        priority_score = m["weight"] + 0.5 * related_matched_count
        if related_matched_count:
            matched_related = [r for r in related if r in matched_names]
            reason = f"Builds on {', '.join(matched_related[:2])}, which you already have."
        else:
            reason = "A core requirement for this role that's currently missing."
        scored_missing.append({
            "skill": m["skill"],
            "weight": m["weight"],
            "priority_score": round(priority_score, 2),
            "reason": reason,
        })

    scored_missing.sort(key=lambda x: x["priority_score"], reverse=True)

    return {
        "role": role_name,
        "score": score,
        "matched": matched,
        "missing": missing,
        "recommendations": scored_missing[:4],
        "total_skills": len(skills),
        "matched_count": len(matched),
        "mode": "rule_based",
    }


def get_resume_text_from_request():
    """Supports either a pasted-text field or an uploaded PDF file."""
    if "resume_file" in request.files and request.files["resume_file"].filename:
        return extract_text_from_pdf(request.files["resume_file"])

    resume_text = (request.form.get("resume_text") or "").strip()
    if resume_text:
        return resume_text

    # Fallback for plain-JSON callers (e.g. quick API testing with curl)
    if request.is_json:
        return (request.json.get("resume_text") or "").strip()

    return ""


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "ai_enabled": gemini_engine.is_available()})


@app.route("/api/roles", methods=["GET"])
def roles():
    return jsonify({
        "roles": get_role_names(),
        "static_roles": list(STATIC_ROLES.keys()),
        "ai_enabled": gemini_engine.is_available(),
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():
    student_name = (request.form.get("student_name") or "").strip()
    role_name = (request.form.get("role") or "").strip()

    if request.is_json and not student_name:
        student_name = (request.json.get("student_name") or "").strip()
    if request.is_json and not role_name:
        role_name = (request.json.get("role") or "").strip()

    if not student_name or not role_name:
        return jsonify({"error": "student_name and role are both required."}), 400

    if role_name not in ALL_ROLES:
        return jsonify({"error": f"Unknown role '{role_name}'."}), 400

    try:
        resume_text = get_resume_text_from_request()
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if not resume_text:
        return jsonify({"error": "Provide resume text or upload a PDF."}), 400

    result = None
    warning = None

    if gemini_engine.is_available():
        try:
            result = gemini_engine.analyze_with_gemini(role_name, resume_text)
        except Exception as e:
            if is_static_role(role_name):
                warning = f"AI analysis failed ({e}); showing rule-based results instead."
                result = compute_static_analysis(role_name, resume_text)
            else:
                return jsonify({
                    "error": f"AI analysis failed and no rule-based data exists for "
                             f"'{role_name}': {e}"
                }), 502
    elif is_static_role(role_name):
        result = compute_static_analysis(role_name, resume_text)
    else:
        return jsonify({
            "error": f"'{role_name}' requires AI mode. Add a GEMINI_API_KEY to "
                     f"backend/.env, or pick one of: {', '.join(STATIC_ROLES.keys())}."
        }), 400

    if warning:
        result["warning"] = warning

    conn = get_db()
    conn.execute(
        """
        INSERT INTO attempts
            (student_name, role, score, mode, matched_json, missing_json, recommendations_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            student_name,
            role_name,
            result["score"],
            result["mode"],
            json.dumps(result["matched"]),
            json.dumps(result["missing"]),
            json.dumps(result["recommendations"]),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    conn.commit()
    conn.close()

    return jsonify(result)


@app.route("/api/history/<student_name>", methods=["GET"])
def history(student_name):
    conn = get_db()
    rows = conn.execute(
        """
        SELECT id, role, score, mode, created_at
        FROM attempts
        WHERE student_name = ?
        ORDER BY created_at ASC
        """,
        (student_name,),
    ).fetchall()
    conn.close()

    return jsonify({
        "student_name": student_name,
        "attempts": [dict(r) for r in rows],
    })


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
