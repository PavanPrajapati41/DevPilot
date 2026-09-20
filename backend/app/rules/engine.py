from app.rules.port_rule import check_hardcoded_port
from app.rules.env_rule import check_environment_usage
from app.rules.start_rule import check_start_command


RULES = [
    check_hardcoded_port,
    check_environment_usage,
    check_start_command,
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