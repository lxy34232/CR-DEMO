import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.crud.user import get_user_by_username, create_user, get_user_by_id
from app.models.company import Company
from app.schemas.auth import UserLogin, UserRegister, TokenResponse, RefreshRequest
from app.schemas.response import ok
from sqlalchemy import select

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=dict)
@limiter.limit("10/minute")
async def login(request: Request, body: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_username(db, body.username)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="账号已被禁用")

    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    company_name = user.company.name_cn if user.company else None
    return ok(
        TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=str(user.id),
            username=user.username,
            role=user.role,
            company_name=company_name,
        ).model_dump()
    )


@router.post("/register", response_model=dict)
@limiter.limit("5/minute")
async def register(request: Request, body: UserRegister, db: AsyncSession = Depends(get_db)):
    # 检查用户名是否已存在
    if await get_user_by_username(db, body.username):
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 查找或创建企业
    result = await db.execute(select(Company).where(Company.credit_code == body.credit_code))
    company = result.scalar_one_or_none()
    if not company:
        company = Company(
            name_cn=body.company_name,
            credit_code=body.credit_code,
        )
        db.add(company)
        await db.flush()

    user = await create_user(
        db,
        username=body.username,
        email=body.email,
        password=body.password,
        role="enterprise",
        company_id=company.id,
        real_name=body.real_name,
        phone=body.phone,
    )
    return ok({"user_id": str(user.id), "username": user.username}, message="注册成功")


@router.post("/refresh", response_model=dict)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="无效的刷新令牌")

    user = await get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="用户不存在或已禁用")

    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token_new = create_refresh_token(token_data)

    return ok({"access_token": access_token, "refresh_token": refresh_token_new, "token_type": "bearer"})
