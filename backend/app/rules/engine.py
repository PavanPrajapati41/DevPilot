from .port_rule import check_hardcoded_port
from .env_rule import check_environment_usage
from .start_rule import check_start_command
from .dependency_rule import check_dependencies

RULES = [
    check_hardcoded_port,
    check_environment_usage,
    check_start_command,
    check_dependencies,
]


def run_rules(
    project_path: str,
    project_type: list[str],
) -> list[dict]:

    issues = []

    for rule in RULES:
        issues.extend(
            rule(project_path)
        )

    return issues