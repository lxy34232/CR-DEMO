import uuid
from datetime import datetime, timezone

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.models.module_data import ModuleData


async def get_report_by_id(db: AsyncSession, report_id: uuid.UUID) -> Report | None:
    result = await db.execute(select(Report).where(Report.id == report_id))
    return result.scalar_one_or_none()


async def get_reports_by_company(db: AsyncSession, company_id: uuid.UUID) -> list[Report]:
    result = await db.execute(
        select(Report)
        .where(Report.company_id == company_id)
        .order_by(Report.created_at.desc())
    )
    return list(result.scalars().all())


async def get_all_reports(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    status: str | None = None,
    keyword: str | None = None,
) -> tuple[list[Report], int]:
    from app.models.company import Company
    from sqlalchemy.orm import selectinload

    query = select(Report).options(selectinload(Report.company), selectinload(Report.creator))
    if status:
        query = query.where(Report.status == status)
    if keyword:
        query = query.join(Company).where(
            Company.name_cn.ilike(f"%{keyword}%")
            | Company.credit_code.ilike(f"%{keyword}%")
            | Report.report_no.ilike(f"%{keyword}%")
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    query = query.order_by(Report.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def create_report(db: AsyncSession, company_id: uuid.UUID, created_by: uuid.UUID, report_no: str) -> Report:
    report = Report(
        company_id=company_id,
        created_by=created_by,
        report_no=report_no,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


async def submit_report(db: AsyncSession, report: Report) -> Report:
    report.status = "submitted"
    report.submitted_at = datetime.now(timezone.utc)
    report.version += 1
    await db.commit()
    await db.refresh(report)
    return report


async def update_report_status(
    db: AsyncSession, report: Report, status: str, reason: str | None = None
) -> Report:
    report.status = status
    if reason:
        report.revision_reason = reason
    await db.commit()
    await db.refresh(report)
    return report


async def get_module_data(
    db: AsyncSession, report_id: uuid.UUID, module_code: str
) -> ModuleData | None:
    result = await db.execute(
        select(ModuleData)
        .where(ModuleData.report_id == report_id, ModuleData.module_code == module_code)
    )
    return result.scalar_one_or_none()


async def save_module_data(
    db: AsyncSession,
    report_id: uuid.UUID,
    module_code: str,
    data: dict,
    is_completed: bool = False,
) -> ModuleData:
    existing = await get_module_data(db, report_id, module_code)
    if existing:
        existing.data = data
        existing.is_completed = is_completed
        existing.updated_at = datetime.now(timezone.utc)
    else:
        existing = ModuleData(
            report_id=report_id,
            module_code=module_code,
            data=data,
            is_completed=is_completed,
        )
        db.add(existing)
    await db.commit()
    await db.refresh(existing)
    return existing


async def get_completion_stats(db: AsyncSession, report_id: uuid.UUID) -> dict:
    result = await db.execute(
        select(ModuleData.module_code, ModuleData.is_completed)
        .where(ModuleData.report_id == report_id)
    )
    rows = result.all()
    completed = sum(1 for r in rows if r.is_completed)
    return {"total": 14, "completed": completed, "modules": {r.module_code: r.is_completed for r in rows}}
