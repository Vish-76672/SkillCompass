"""
Static skill-weight tables per target role, plus a small skill co-occurrence
graph used for content-based recommendation boosting.

These six roles double as the rule-based fallback engine (used when no
GEMINI_API_KEY is configured, or if the Gemini call fails). For the full
15-role list, see ALL_ROLES below -- the other nine only work in AI mode,
since Gemini determines their required skills dynamically at request time
instead of relying on a hand-written weight table.
"""

STATIC_ROLES = {
    "Backend Developer": {
        "skills": [
            ("Python", 5), ("Java", 4), ("SQL", 5), ("REST API", 5),
            ("Docker", 4), ("Redis", 3), ("System Design", 4),
            ("Node.js", 3), ("PostgreSQL", 4), ("Unit Testing", 3),
            ("Git", 3), ("Microservices", 3), ("Kafka", 2), ("AWS", 3),
        ],
    },
    "Frontend Developer": {
        "skills": [
            ("JavaScript", 5), ("React", 5), ("HTML", 4), ("CSS", 4),
            ("TypeScript", 4), ("Tailwind", 3), ("Redux", 3),
            ("REST API", 3), ("Webpack", 2), ("Accessibility", 3),
            ("Git", 3), ("Testing Library", 2), ("Next.js", 3),
        ],
    },
    "Full Stack Developer": {
        "skills": [
            ("JavaScript", 5), ("React", 4), ("Node.js", 4), ("SQL", 4),
            ("REST API", 5), ("Docker", 3), ("Git", 3), ("MongoDB", 3),
            ("System Design", 3), ("CSS", 3), ("AWS", 3), ("Testing", 3),
            ("Python", 2), ("CI/CD", 2),
        ],
    },
    "Data Analyst": {
        "skills": [
            ("SQL", 5), ("Excel", 4), ("Python", 4), ("Power BI", 4),
            ("Tableau", 3), ("Statistics", 4), ("Pandas", 4),
            ("Data Cleaning", 3), ("A/B Testing", 2), ("NumPy", 2),
            ("Data Visualization", 3), ("Google Sheets", 2),
        ],
    },
    "Machine Learning Engineer": {
        "skills": [
            ("Python", 5), ("Machine Learning", 5), ("Deep Learning", 4),
            ("PyTorch", 4), ("TensorFlow", 3), ("NumPy", 3), ("Pandas", 3),
            ("SQL", 3), ("Statistics", 4), ("Model Deployment", 3),
            ("Docker", 3), ("Scikit-learn", 3), ("NLP", 2), ("MLOps", 2),
        ],
    },
    "DevOps Engineer": {
        "skills": [
            ("Docker", 5), ("Kubernetes", 5), ("CI/CD", 5), ("AWS", 4),
            ("Linux", 4), ("Terraform", 3), ("Bash Scripting", 3),
            ("Monitoring", 3), ("Git", 3), ("Ansible", 2),
            ("System Design", 3), ("Networking", 2),
        ],
    },
}

# skill -> list of related skills. If a missing skill's related skills are
# already present on the resume, its recommendation priority gets boosted --
# the idea being "you're already adjacent to this, it's a natural next step."
RELATED_SKILLS = {
    "Docker": ["Kubernetes", "CI/CD", "AWS", "Linux"],
    "Kubernetes": ["Docker", "CI/CD", "Terraform"],
    "React": ["JavaScript", "Redux", "Next.js", "TypeScript"],
    "Node.js": ["JavaScript", "REST API", "MongoDB"],
    "SQL": ["PostgreSQL", "Data Cleaning", "Python"],
    "Python": ["Pandas", "NumPy", "Machine Learning", "SQL"],
    "Machine Learning": ["Python", "Statistics", "Scikit-learn", "Pandas"],
    "Deep Learning": ["PyTorch", "TensorFlow", "Machine Learning"],
    "AWS": ["Docker", "CI/CD", "System Design"],
    "System Design": ["Microservices", "Redis", "SQL"],
    "CI/CD": ["Docker", "Git", "Kubernetes"],
    "TypeScript": ["JavaScript", "React"],
    "Tableau": ["Power BI", "Data Visualization"],
    "Power BI": ["Excel", "Tableau", "Data Visualization"],
    "Statistics": ["Python", "Machine Learning", "A/B Testing"],
}

# The full role list shown in the dropdown. The first six have a static
# weight table above and work with or without an API key. The rest require
# AI mode (GEMINI_API_KEY set) since Gemini determines their skill list
# dynamically -- no hand-written table needed to add a new role here.
ALL_ROLES = list(STATIC_ROLES.keys()) + [
    "Data Scientist",
    "Data Engineer",
    "Mobile App Developer",
    "Cloud Engineer",
    "Cybersecurity Analyst",
    "QA / Test Automation Engineer",
    "Site Reliability Engineer",
    "Embedded Systems Engineer",
    "UI/UX Designer",
]


def get_role_names():
    return ALL_ROLES


def is_static_role(role_name):
    return role_name in STATIC_ROLES


def get_role_skills(role_name):
    role = STATIC_ROLES.get(role_name)
    return role["skills"] if role else None
