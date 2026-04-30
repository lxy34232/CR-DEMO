import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.deps import require_admin
from app.crud import report as report_crud
from app.models.user import User
from app.models.report import Report
from app.models.company import Company
from app.models.audit_log import AuditLog
from app.schemas.response import ok

router = APIRouter()


@router.get("/reports", response_model=dict)
async def list_all_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    keyword: str | None = Query(None),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    reports, total = await report_crud.get_all_reports(db, page, page_size, status, keyword)
    items = []
    for r in reports:
        completion = await report_crud.get_completion_stats(db, r.id)
        items.append({
            "id": str(r.id),
            "report_no": r.report_no,
            "status": r.status,
            "version": r.version,
            "revision_reason": r.revision_reason,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
            "created_at": r.created_at.isoformat(),
            "updated_at": r.updated_at.isoformat(),
            "company": {
                "id": str(r.company.id),
                "name_cn": r.company.name_cn,
                "credit_code": r.company.credit_code,
            },
            "creator": {
                "id": str(r.creator.id),
                "username": r.creator.username,
                "real_name": r.creator.real_name,
            },
            "completion": completion,
        })
    return ok({"items": items, "total": total, "page": page, "page_size": page_size})


@router.post("/reports/{report_id}/review", response_model=dict)
async def review_report(
    report_id: str,
    body: dict,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    action = body.get("action")  # "approve" or "revision"
    reason = body.get("reason")

    if action not in ("approve", "revision", "reject"):
        raise HTTPException(status_code=400, detail="无效的操作类型")

    report = await report_crud.get_report_by_id(db, uuid.UUID(report_id))
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    if report.status != "submitted":
        raise HTTPException(status_code=400, detail="只能对已提交报告进行审核")

    status_map = {"approve": "approved", "revision": "revision", "reject": "rejected"}
    new_status = status_map[action]
    report = await report_crud.update_report_status(db, report, new_status, reason)

    # 写入审计日志
    log = AuditLog(
        user_id=current_user.id,
        action=f"report_{action}",
        resource="report",
        resource_id=report_id,
        detail=reason,
    )
    db.add(log)
    await db.commit()

    return ok({"status": new_status}, message=f"操作成功")


@router.get("/stats", response_model=dict)
async def get_stats(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count()).select_from(Report))).scalar()
    submitted = (await db.execute(
        select(func.count()).select_from(Report).where(Report.status == "submitted")
    )).scalar()
    revision = (await db.execute(
        select(func.count()).select_from(Report).where(Report.status == "revision")
    )).scalar()
    draft = (await db.execute(
        select(func.count()).select_from(Report).where(Report.status == "draft")
    )).scalar()
    return ok({
        "total": total,
        "submitted": submitted,
        "revision": revision,
        "draft": draft,
    })


@router.get("/audit-logs", response_model=dict)
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count()).select_from(AuditLog))).scalar()
    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    logs = result.scalars().all()
    items = [
        {
            "id": log.id,
            "user_id": str(log.user_id) if log.user_id else None,
            "action": log.action,
            "resource": log.resource,
            "resource_id": log.resource_id,
            "ip_address": log.ip_address,
            "detail": log.detail,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
    return ok({"items": items, "total": total, "page": page, "page_size": page_size})


@router.get("/users", response_model=dict)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    from app.models.user import User as UserModel
    total = (await db.execute(select(func.count()).select_from(UserModel))).scalar()
    result = await db.execute(
        select(UserModel)
        .order_by(UserModel.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    users = result.scalars().all()
    items = [
        {
            "id": str(u.id),
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "real_name": u.real_name,
            "is_active": u.is_active,
            "company_name": u.company.name_cn if u.company else None,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]
    return ok({"items": items, "total": total, "page": page, "page_size": page_size})


@router.patch("/users/{user_id}/status", response_model=dict)
async def toggle_user_status(
    user_id: str,
    body: dict,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    from app.models.user import User as UserModel
    result = await db.execute(select(UserModel).where(UserModel.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    user.is_active = body.get("is_active", user.is_active)
    await db.commit()
    return ok({"is_active": user.is_active}, message="状态更新成功")
