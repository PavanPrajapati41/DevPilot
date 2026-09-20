import json
from pathlib import Path


def check_start_command(project_path: str) -> list[dict]:
    root = Path(project_path)
    issues = []

    package_file = root / "package.json"

    if not package_file.exists():
        return issues

    try:
        package_data = json.loads(
            package_file.read_text(
                encoding="utf-8"
            )
        )
    except (OSError, json.JSONDecodeError):
        return [{
            "rule_id": "START-001",
            "severity": "high",
            "title": "Invalid package.json",
            "message": "package.json could not be parsed.",
            "file": "package.json",
            "line": None,
            "fix": "Fix the JSON syntax in package.json.",
        }]

    scripts = package_data.get("scripts", {})

    if "start" not in scripts:
        issues.append({
            "rule_id": "START-001",
            "severity": "high",
            "title": "Missing production start command",
            "message": (
                "No 'start' script was found in package.json. "
                "The deployment platform may not know how to start "
                "the application."
            ),
            "file": "package.json",
            "line": None,
            "fix": (
                "Add a production start script, for example "
                "'start': 'node server.js'."
            ),
        })

    return issues