import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_enterprise, get_current_user
from app.core.config import settings
from app.models.attachment import Attachment
from app.models.user import User
from app.schemas.response import ok
from sqlalchemy import select

router = APIRouter()

ALLOWED_MAGIC_BYTES = {
    b"\x25\x50\x44\x46": "application/pdf",          # PDF: %PDF
    b"\xd0\xcf\x11\xe0": "application/msword",        # DOC
    b"\x50\x4b\x03\x04": None,                         # ZIP (DOCX/XLSX)
    b"\xff\xd8\xff": "image/jpeg",                     # JPEG
    b"\x89\x50\x4e\x47": "image/png",                 # PNG
    b"\x47\x49\x46\x38": "image/gif",                 # GIF
}

ALLOWED_MIME_TYPES = set(settings.ALLOWED_DOC_TYPES + settings.ALLOWED_IMG_TYPES)
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".gif"}


def _check_magic_bytes(content: bytes, mime_type: str) -> bool:
    """校验文件 Magic Bytes，防止伪造扩展名"""
    for magic, expected_mime in ALLOWED_MAGIC_BYTES.items():
        if content.startswith(magic):
            if expected_mime is None:
                # ZIP 格式（DOCX/XLSX 均为 ZIP 容器），允许
                return True
            return expected_mime == mime_type or mime_type in ALLOWED_MIME_TYPES
    return False


def _get_minio_client():
    from minio import Minio
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_SECURE,
    )


def _ensure_bucket(client):
    if not client.bucket_exists(settings.MINIO_BUCKET):
        client.make_bucket(settings.MINIO_BUCKET)


@router.post("/upload", response_model=dict)
async def upload_file(
    report_id: str = Form(...),
    module_code: str = Form(...),
    field_name: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_enterprise),
    db: AsyncSession = Depends(get_db),
):
    import io
    import os

    # 校验扩展名
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"不支持的文件格式: {ext}")

    # 校验 MIME 类型
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"不支持的文件类型: {file.content_type}")

    content = await file.read()

    # 校验文件大小
    size = len(content)
    is_image = file.content_type in settings.ALLOWED_IMG_TYPES
    max_size = settings.MAX_IMG_SIZE_MB * 1024 * 1024 if is_image else settings.MAX_DOC_SIZE_MB * 1024 * 1024
    if size > max_size:
        max_mb = settings.MAX_IMG_SIZE_MB if is_image else settings.MAX_DOC_SIZE_MB
        raise HTTPException(status_code=400, detail=f"文件大小超过限制（最大 {max_mb}MB）")

    # 校验 Magic Bytes
    if not _check_magic_bytes(content, file.content_type):
        raise HTTPException(status_code=400, detail="文件内容与扩展名不匹配，拒绝上传")

    # 生成存储路径
    now = datetime.now(timezone.utc)
    stored_name = f"{now.strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}_{file.filename}"
    minio_path = f"{module_code}/{stored_name}"

    # 上传到 MinIO
    try:
        client = _get_minio_client()
        _ensure_bucket(client)
        client.put_object(
            settings.MINIO_BUCKET,
            minio_path,
            io.BytesIO(content),
            length=size,
            content_type=file.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

    # 记录到数据库
    attachment = Attachment(
        report_id=uuid.UUID(report_id),
        module_code=module_code,
        field_name=field_name,
        original_name=file.filename,
        stored_name=stored_name,
        minio_path=minio_path,
        file_size=size,
        mime_type=file.content_type,
        uploaded_by=current_user.id,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)

    return ok({
        "id": str(attachment.id),
        "original_name": attachment.original_name,
        "file_size": attachment.file_size,
        "mime_type": attachment.mime_type,
    }, message="上传成功")


@router.get("/{file_id}/url", response_model=dict)
async def get_file_url(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Attachment).where(Attachment.id == uuid.UUID(file_id)))
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        client = _get_minio_client()
        url = client.presigned_get_object(
            settings.MINIO_BUCKET,
            attachment.minio_path,
            expires=timedelta(hours=1),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取下载链接失败: {str(e)}")

    return ok({"url": url, "original_name": attachment.original_name})


@router.delete("/{file_id}", response_model=dict)
async def delete_file(
    file_id: str,
    current_user: User = Depends(require_enterprise),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Attachment).where(Attachment.id == uuid.UUID(file_id)))
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=404, detail="文件不存在")
    if attachment.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除该文件")

    try:
        client = _get_minio_client()
        client.remove_object(settings.MINIO_BUCKET, attachment.minio_path)
    except Exception:
        pass  # MinIO 删除失败不阻塞数据库清理

    await db.delete(attachment)
    await db.commit()
    return ok(None, message="删除成功")
