from pathlib import Path


IGNORED_DIRECTORIES = {
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    ".next",
    "dist",
    "build",
}


def list_project_files(project_path: str) -> list[str]:
    """
    Return all files inside a project directory,
    excluding common dependency/build directories.
    """

    root = Path(project_path)

    if not root.exists():
        raise FileNotFoundError(f"Project path does not exist: {project_path}")

    if not root.is_dir():
        raise NotADirectoryError(f"Project path is not a directory: {project_path}")

    files = []

    for path in root.rglob("*"):
        if not path.is_file():
            continue

        # Ignore files inside excluded directories
        if any(part in IGNORED_DIRECTORIES for part in path.parts):
            continue

        files.append(str(path))

    return files


def read_file(file_path: str) -> str:
    """
    Read and return the contents of a project file.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File does not exist: {file_path}")

    if not path.is_file():
        raise IsADirectoryError(f"Path is not a file: {file_path}")

    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raise ValueError(f"Unable to read file as UTF-8: {file_path}")

def is_safe_path(project_path: str, file_path: str) -> bool:
    """
    Check whether a file is located inside the project directory.
    """

    project = Path(project_path).resolve()
    file = Path(file_path).resolve()

    try:
        file.relative_to(project)
        return True
    except ValueError:
        return False

def read_project_file(project_path: str, file_path: str) -> str:
    """
    Safely read a file from inside the project directory.
    """

    if not is_safe_path(project_path, file_path):
        raise PermissionError(
            f"File is outside the project directory: {file_path}"
        )

    return read_file(file_path)