from pathlib import Path

from ..utils.filesystem import list_project_files, read_project_file


def check_hardcoded_port(project_path: str) -> list[dict]:
    root = Path(project_path)
    issues = []

    patterns = [
        "port = 3000",
        "port=3000",
        "port = 5000",
        "port=5000",
        "port = 8000",
        "port=8000",
        ".listen(3000",
        ".listen(5000",
        ".listen(8000",
    ]

    for file_path in list_project_files(project_path):
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
            if any(
                pattern.lower() in line.lower()
                for pattern in patterns
            ):
                issues.append({
                    "rule_id": "PORT-001",
                    "severity": "high",
                    "title": "Hardcoded port detected",
                    "message": (
                        "The application appears to use a "
                        "hardcoded port."
                    ),
                    "file": str(
                        Path(file_path).relative_to(root)
                    ),
                    "line": line_number,
                    "fix": (
                        "Read the port from the PORT "
                        "environment variable."
                    ),
                })

    return issues