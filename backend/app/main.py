from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.api.v1 import auth, reports, modules, files, admin
from app.core.database import engine
from app.models import base  # 确保所有模型被注册

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="企业基本情况报告填报系统",
    version="1.0.0",
    description="企业基本情况报告线上数据填报系统 API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由注册
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["报告"])
app.include_router(modules.router, prefix="/api/v1/reports", tags=["模块数据"])
app.include_router(files.router, prefix="/api/v1/files", tags=["文件"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["管理员"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
