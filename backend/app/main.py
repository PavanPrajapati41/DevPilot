from fastapi import FastAPI
from app.api.routes.audit import router as audit_router
from app.rules.dependency_rule import check_dependencies

app = FastAPI(
    title="DevPilot API",
    description="Local pre-deployment auditor",
    version="0.1.0",
)


app.include_router(
    audit_router,
    prefix="/api"
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "DevPilot API"
    }