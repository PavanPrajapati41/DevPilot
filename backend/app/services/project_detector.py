from pathlib import Path


def detect_project_type(project_path: str) -> list[str]:
    root = Path(project_path)

    detected = []

    if (root / "package.json").exists():
        detected.append("node")

    if (root / "requirements.txt").exists():
        detected.append("python")

    if (root / "pyproject.toml").exists() and "python" not in detected:
        detected.append("python")

    if (root / "Dockerfile").exists():
        detected.append("docker")

    if (root / "vercel.json").exists():
        detected.append("vercel")

    if (root / "render.yaml").exists():
        detected.append("render")

    return detected