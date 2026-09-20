from pathlib import Path

from ..utils.filesystem import list_project_files, read_project_file


def check_environment_usage(project_path: str) -> list[dict]:
    issues = []

    suspicious_patterns = [
        "AWS_ACCESS_KEY_ID=",
        "AWS_SECRET_ACCESS_KEY=",
        "DATABASE_URL=",
        "API_KEY=",
        "SECRET_KEY=",
        "OPENAI_API_KEY=",
    ]

    ignored_files = {
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
    }

    for file_path in list_project_files(project_path):
        path = Path(file_path)

        if path.name in ignored_files:
            continue

        try:
            content = read_project_file(
                project_path,
                file_path,
            )
        except (OSError, ValueError, PermissionError):
            continue

        for line_number, line in enumerate(
            content.splitlines(),
            start=1,
        ):
            for pattern in suspicious_patterns:
                if pattern in line:
                    issues.append({
                        "rule_id": "ENV-001",
                        "severity": "critical",
                        "title": "Possible hardcoded secret",
                        "message": (
                            "A potentially sensitive "
                            "environment variable appears to "
                            "be hardcoded in source code."
                        ),
                       "file": str(
                         path.relative_to(Path(project_path))
                        ),
                        "line": line_number,
                        "fix": (
                            "Move the secret into an environment "
                            "variable or secret manager."
                        ),
                    })

    return issues