import json
from pathlib import Path

from ..utils.filesystem import read_project_file


def check_start_command(project_path: str) -> list[dict]:
    issues = []

    package_file = Path(project_path) / "package.json"

    if not package_file.exists():
        return issues

    try:
        content = read_project_file(
            project_path,
            str(package_file),
        )
        package_data = json.loads(content)

    except (OSError, ValueError, PermissionError, json.JSONDecodeError):
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