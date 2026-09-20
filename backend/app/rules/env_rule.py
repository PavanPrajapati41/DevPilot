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


def check_environment_usage(project_path: str) -> list[dict]:
    root = Path(project_path)
    issues = []

    suspicious_patterns = [
        "AWS_ACCESS_KEY_ID=",
        "AWS_SECRET_ACCESS_KEY=",
        "DATABASE_URL=",
        "API_KEY=",
        "SECRET_KEY=",
        "OPENAI_API_KEY=",
    ]

    for path in root.rglob("*"):
        if not path.is_file():
            continue

        if any(
            part in IGNORED_DIRECTORIES
            for part in path.parts
        ):
            continue

        # Don't scan common dependency/lock files.
        if path.name in {
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
        }:
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
                            path.relative_to(root)
                        ),
                        "line": line_number,
                        "fix": (
                            "Move the secret into an environment "
                            "variable or secret manager."
                        ),
                    })

    return issues