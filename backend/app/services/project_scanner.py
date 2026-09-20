from pathlib import Path

from ..utils.filesystem import list_project_files


def scan_project(project_path: str) -> dict:
    root = Path(project_path)

    if not root.exists():
        raise FileNotFoundError(
            f"Project path does not exist: {project_path}"
        )

    if not root.is_dir():
        raise NotADirectoryError(
            f"Project path is not a directory: {project_path}"
        )

    files = list_project_files(project_path)

    directories = []

    for path in root.rglob("*"):
        if path.is_dir():
            relative_path = path.relative_to(root)

            # Ignore directories already handled by filesystem utility
            if any(
                part in {
                    ".git",
                    "node_modules",
                    "__pycache__",
                    ".venv",
                    "venv",
                    ".next",
                    "dist",
                    "build",
                }
                for part in relative_path.parts
            ):
                continue

            directories.append(str(relative_path))

    relative_files = [
        str(Path(file).relative_to(root))
        for file in files
    ]

    return {
        "project_path": str(root.resolve()),
        "file_count": len(relative_files),
        "directory_count": len(directories),
        "files": relative_files,
        "directories": directories,
    }