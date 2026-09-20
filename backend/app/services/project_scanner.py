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


def scan_project(project_path: str) -> dict:
    root = Path(project_path)

    if not root.exists():
        raise FileNotFoundError(f"Project path does not exist: {project_path}")

    if not root.is_dir():
        raise NotADirectoryError(f"Project path is not a directory: {project_path}")

    files = []
    directories = []

    for path in root.rglob("*"):
        if any(part in IGNORED_DIRECTORIES for part in path.parts):
            continue

        if path.is_dir():
            directories.append(str(path.relative_to(root)))
        elif path.is_file():
            files.append(str(path.relative_to(root)))

    return {
        "project_path": str(root.resolve()),
        "file_count": len(files),
        "directory_count": len(directories),
        "files": files,
        "directories": directories,
    }