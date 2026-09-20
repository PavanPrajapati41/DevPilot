from pydantic import BaseModel
from typing import Literal


class AuditRequest(BaseModel):
    project_path: str


class AuditIssue(BaseModel):
    rule_id: str
    severity: Literal[
        "low",
        "medium",
        "high",
        "critical"
    ]
    title: str
    message: str
    file: str | None = None
    line: int | None = None
    fix: str | None = None


class AuditResponse(BaseModel):
    status: str
    project_path: str
    project_types: list[str]
    files_scanned: int
    issues_found: int
    issues: list[AuditIssue]