from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from pathlib import Path, PurePosixPath
from tempfile import TemporaryDirectory

from app.models.audit import (
    AuditRequest,
    AuditResponse,
    AuditIssue,
)
from app.services.project_scanner import scan_project
from app.services.project_detector import detect_project_type
from app.rules.engine import run_rules
from app.services.ai_analyzer import analyze_issues


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

        try:
            ai_analysis = analyze_issues(
                raw_issues,
                project_types,
            )
        except Exception as error:
            ai_analysis = (
                "AI analysis unavailable. "
                f"Deterministic audit completed successfully: {error}"
            )

        return AuditResponse(
            status="completed",
            project_path=scan_result["project_path"],
            project_types=project_types,
            files_scanned=scan_result["file_count"],
            issues_found=len(issues),
            issues=issues,
            ai_analysis=ai_analysis,
        )

    except (
        FileNotFoundError,
        NotADirectoryError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.post("/audit/upload", response_model=AuditResponse)
async def audit_uploaded_project(
    files: list[UploadFile] = File(...)
):

    if not files:
        raise HTTPException(
            status_code=400,
            detail="No project files uploaded"
        )

    with TemporaryDirectory(
        prefix="devpilot_"
    ) as temp_dir:

        project_root = Path(temp_dir)

        for uploaded_file in files:

            if not uploaded_file.filename:
                continue

            relative_path = PurePosixPath(
                uploaded_file.filename.replace("\\", "/")
            )

            destination = project_root.joinpath(
                *relative_path.parts
            )

            destination.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            content = await uploaded_file.read()

            destination.write_bytes(content)

        scan_result = scan_project(
            str(project_root)
        )

        project_types = detect_project_type(
            str(project_root)
        )

        raw_issues = run_rules(
            str(project_root),
            project_types
        )

        issues = [
            AuditIssue(**issue)
            for issue in raw_issues
        ]

        try:
            ai_analysis = await run_in_threadpool(
                analyze_issues,
                raw_issues,
                project_types,
            )
        except Exception as error:
            ai_analysis = (
                "AI analysis unavailable. "
                f"Deterministic audit completed successfully: {error}"
            )

        return AuditResponse(
            status="completed",
            project_path=str(project_root),
            project_types=project_types,
            files_scanned=scan_result["file_count"],
            issues_found=len(issues),
            issues=issues,
            ai_analysis=ai_analysis,
        )