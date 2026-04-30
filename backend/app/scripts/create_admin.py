"""
初始化管理员账号脚本

使用方法：
    docker compose exec backend python -m app.scripts.create_admin
    或：
    python -m app.scripts.create_admin
"""
import asyncio
import sys
import os

# 添加项目根目录到 sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.core.database import AsyncSessionLocal
from app.crud.user import get_user_by_username, create_user


async def main():
    username = os.getenv("ADMIN_USERNAME", "admin")
    email = os.getenv("ADMIN_EMAIL", "admin@cr-demo.local")
    password = os.getenv("ADMIN_PASSWORD", "Admin@123456")

    async with AsyncSessionLocal() as db:
        existing = await get_user_by_username(db, username)
        if existing:
            print(f"管理员账号 '{username}' 已存在，跳过创建")
            return

        user = await create_user(
            db,
            username=username,
            email=email,
            password=password,
            role="admin",
        )
        print(f"管理员账号创建成功:")
        print(f"  用户名: {user.username}")
        print(f"  邮箱:   {email}")
        print(f"  密码:   {password}")
        print(f"  ⚠️  请立即登录并修改默认密码！")


if __name__ == "__main__":
    asyncio.run(main())
