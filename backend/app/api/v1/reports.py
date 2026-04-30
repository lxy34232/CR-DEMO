import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_enterprise
from app.crud import report as report_crud
from app.models.user import User
from app.schemas.report import ReportResponse, ReportStatusUpdate
from app.schemas.response import ok

router = APIRouter()


def _format_report(report, completion=None) -> dict:
    return {
        "id": str(report.id),
        "report_no": report.report_no,
        "status": report.status,
        "version": report.version,
        "revision_reason": report.revision_reason,
        "submitted_at": report.submitted_at.isoformat() if report.submitted_at else None,
        "created_at": report.created_at.isoformat(),
        "updated_at": report.updated_at.isoformat(),
        "company": {
            "id": str(report.company.id),
            "name_cn": report.company.name_cn,
            "credit_code": report.company.credit_code,
        },
        "creator": {
            "id": str(report.creator.id),
            "username": report.creator.username,
            "real_name": report.creator.real_name,
        },
        "completion": completion,
    }


async def _generate_report_no(db: AsyncSession, company_credit_code: str) -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"CR-{year}-{company_credit_code[:6].upper()}"
    from sqlalchemy import select, func
    from app.models.report import Report
    count_result = await db.execute(
        select(func.count()).select_from(Report).where(Report.report_no.like(f"{prefix}%"))
    )
    seq = (count_result.scalar() or 0) + 1
    return f"{prefix}-{seq:03d}"


@router.get("", response_model=dict)
async def list_my_reports(
    current_user: User = Depends(require_enterprise),
    db: AsyncSession = Depends(get_db),
):
    reports = await report_crud.get_reports_by_company(db, current_user.company_id)
    result = []
    for r in reports:
        completion = await report_crud.get_completion_stats(db, r.id)
        result.append(_format_report(r, completion))
    return ok(result)


@router.post("", response_model=dict)
async def create_report(
    current_user: User = Depends(require_enterprise),
    db: AsyncSession = Depends(get_db),
):
    # 检查是否已有草稿
    existing = await report_crud.get_reports_by_company(db, current_user.company_id)
    drafts = [r for r in existing if r.status == "draft"]
    if drafts:
        raise HTTPException(status_code=400, detail="已有草稿报告，请先完成当前报告")

    report_no = await _generate_report_no(db, current_user.company.credit_code)
    report = await report_crud.create_report(db, current_user.company_id, current_user.id, report_no)
    return ok(_format_report(report), message="报告创建成功")


@router.get("/{report_id}", response_model=dict)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_crud.get_report_by_id(db, uuid.UUID(report_id))
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    # 企业用户只能查看本企业报告
    if current_user.role == "enterprise" and report.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="无权访问该报告")

    completion = await report_crud.get_completion_stats(db, report.id)
    return ok(_format_report(report, completion))


@router.post("/{report_id}/submit", response_model=dict)
async def submit_report(
    report_id: str,
    current_user: User = Depends(require_enterprise),
    db: AsyncSession = Depends(get_db),
):
    report = await report_crud.get_report_by_id(db, uuid.UUID(report_id))
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    if report.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="无权操作该报告")
    if report.status not in ("draft", "revision"):
        raise HTTPException(status_code=400, detail=f"当前状态({report.status})不允许提交")

    report = await report_crud.submit_report(db, report)
    return ok(_format_report(report), message="报告提交成功")
