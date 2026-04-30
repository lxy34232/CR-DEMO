import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_enterprise
from app.crud import report as report_crud
from app.models.user import User
from app.models.draft import Draft
from app.schemas.report import ModuleSaveRequest, DraftSaveRequest
from app.schemas.response import ok
from sqlalchemy import select

router = APIRouter()

VALID_MODULES = {f"module_{i:02d}" for i in range(1, 15)}


def _check_module_code(module_code: str):
    if module_code not in VALID_MODULES:
        raise HTTPException(status_code=400, detail=f"无效的模块编码: {module_code}")


async def _check_report_access(db, report_id: str, user: User):
    report = await report_crud.get_report_by_id(db, uuid.UUID(report_id))
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    if user.role == "enterprise" and report.company_id != user.company_id:
        raise HTTPException(status_code=403, detail="无权访问该报告")
    return report


@router.get("/{report_id}/modules/{module_code}", response_model=dict)
async def get_module(
    report_id: str,
    module_code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _check_module_code(module_code)
    await _check_report_access(db, report_id, current_user)
    module = await report_crud.get_module_data(db, uuid.UUID(report_id), module_code)
    if not module:
        return ok({"module_code": module_code, "data": {}, "is_completed": False})
    return ok({
        "id": str(module.id),
        "module_code": module.module_code,
        "data": module.data,
        "is_completed": module.is_completed,
        "updated_at": module.updated_at.isoformat(),
    })


@router.put("/{report_id}/modules/{module_code}", response_model=dict)
async def save_module(
    report_id: str,
    module_code: str,
    body: ModuleSaveRequest,
    current_user: User = Depends(require_enterprise),
    db: AsyncSession = Depends(get_db),
):
    _check_module_code(module_code)
    report = await _check_report_access(db, report_id, current_user)
    if report.status not in ("draft", "revision"):
        raise HTTPException(status_code=400, detail="报告已提交，不能修改")

    module = await report_crud.save_module_data(
        db, uuid.UUID(report_id), module_code, body.data, body.is_completed
    )
    return ok({
        "id": str(module.id),
        "module_code": module.module_code,
        "is_completed": module.is_completed,
        "updated_at": module.updated_at.isoformat(),
    }, message="保存成功")


@router.post("/{report_id}/drafts/{module_code}", response_model=dict)
async def save_draft(
    report_id: str,
    module_code: str,
    body: DraftSaveRequest,
    current_user: User = Depends(require_enterprise),
    db: AsyncSession = Depends(get_db),
):
    _check_module_code(module_code)
    await _check_report_access(db, report_id, current_user)

    # 查找现有草稿
    result = await db.execute(
        select(Draft).where(
            Draft.report_id == uuid.UUID(report_id),
            Draft.module_code == module_code,
        )
    )
    draft = result.scalar_one_or_none()
    if draft:
        draft.data = body.data
        draft.saved_at = datetime.now(timezone.utc)
        draft.version += 1
    else:
        draft = Draft(
            report_id=uuid.UUID(report_id),
            module_code=module_code,
            data=body.data,
        )
        db.add(draft)
    await db.commit()
    await db.refresh(draft)
    return ok({
        "id": str(draft.id),
        "module_code": draft.module_code,
        "saved_at": draft.saved_at.isoformat(),
        "version": draft.version,
    }, message="草稿保存成功")


@router.get("/{report_id}/drafts/{module_code}", response_model=dict)
async def get_draft(
    report_id: str,
    module_code: str,
    current_user: User = Depends(require_enterprise),
    db: AsyncSession = Depends(get_db),
):
    _check_module_code(module_code)
    await _check_report_access(db, report_id, current_user)

    result = await db.execute(
        select(Draft).where(
            Draft.report_id == uuid.UUID(report_id),
            Draft.module_code == module_code,
        )
    )
    draft = result.scalar_one_or_none()
    if not draft:
        return ok(None)
    return ok({
        "id": str(draft.id),
        "module_code": draft.module_code,
        "data": draft.data,
        "saved_at": draft.saved_at.isoformat(),
        "version": draft.version,
    })
