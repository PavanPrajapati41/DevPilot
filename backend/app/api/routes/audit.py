from fastapi import APIRouter, HTTPException

from app.models.audit import (
    AuditRequest,
    AuditResponse,
    AuditIssue,
)
from app.services.project_scanner import scan_project
from app.services.project_detector import detect_project_type
from app.rules.engine import run_rules


router = APIRouter()


@router.post("/audit", response_model=AuditResponse)
def audit_project(request: AuditRequest):

    try:
        scan_result = scan_project(
            request.project_path
        )

        project_types = detect_project_type(
            request.project_path
        )

        raw_issues = run_rules(
            request.project_path,
            project_types
        )

        issues = [
            AuditIssue(**issue)
            for issue in raw_issues
        ]

        return AuditResponse(
            status="completed",
            project_path=scan_result["project_path"],
            project_types=project_types,
            files_scanned=scan_result["file_count"],
            issues_found=len(issues),
            issues=issues,
        )

    except (
        FileNotFoundError,
        NotADirectoryError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )