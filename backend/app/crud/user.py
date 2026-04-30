import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.security import get_password_hash


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == uuid.UUID(str(user_id))))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    username: str,
    email: str,
    password: str,
    role: str = "enterprise",
    company_id: uuid.UUID | None = None,
    real_name: str | None = None,
    phone: str | None = None,
) -> User:
    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(password),
        role=role,
        company_id=company_id,
        real_name=real_name,
        phone=phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
