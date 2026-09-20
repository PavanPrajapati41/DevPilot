from pathlib import Path


IGNORED_DIRECTORIES = {
    ".git",
    ".env",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
}


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

    for path in root.rglob("*"):
        if not path.is_file():
            continue

        if any(
            part in IGNORED_DIRECTORIES
            for part in path.parts
        ):
            continue

        try:
            content = path.read_text(
                encoding="utf-8",
                errors="ignore"
            )
        except OSError:
            continue

        for line_number, line in enumerate(
            content.splitlines(),
            start=1
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
                    "file": str(path.relative_to(root)),
                    "line": line_number,
                    "fix": (
                        "Read the port from the PORT "
                        "environment variable."
                    ),
                })

    return issues