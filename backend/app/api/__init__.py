from fastapi import APIRouter

from app.models.audit import AuditRequest, AuditResponse


router = APIRouter()


@router.post("/audit", response_model=AuditResponse)
def audit_project(request: AuditRequest):
    return AuditResponse(
        status="completed",
        project_path=request.project_path,
        issues=[]
    )