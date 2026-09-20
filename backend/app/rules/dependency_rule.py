import json
from pathlib import Path


def check_dependencies(project_path: str) -> list[dict]:
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