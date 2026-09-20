import json
from pathlib import Path

from ..utils.filesystem import read_project_file


def check_dependencies(project_path: str) -> list[dict]:
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
        return issues

    dependencies = package_data.get(
        "dependencies",
        {}
    )

    dev_dependencies = package_data.get(
        "devDependencies",
        {}
    )

    all_dependencies = {
        **dependencies,
        **dev_dependencies,
    }

    if not all_dependencies:
        issues.append({
            "rule_id": "DEP-001",
            "severity": "medium",
            "title": "No dependencies detected",
            "message": (
                "package.json does not contain any "
                "dependencies."
            ),
            "file": "package.json",
            "line": None,
            "fix": (
                "Verify that package.json contains the "
                "dependencies required by the application."
            ),
        })

    return issues