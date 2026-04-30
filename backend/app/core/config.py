from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # 应用
    APP_NAME: str = "企业基本情况报告填报系统"
    DEBUG: bool = False

    # 数据库
    DATABASE_URL: str = "postgresql+asyncpg://cr_user:cr_password@localhost:5432/cr_demo"

    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "cr-demo-attachments"
    MINIO_SECURE: bool = False

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:80",
        "http://localhost",
    ]

    # 文件上传限制
    MAX_DOC_SIZE_MB: int = 20
    MAX_IMG_SIZE_MB: int = 10
    ALLOWED_DOC_TYPES: List[str] = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    ALLOWED_IMG_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/gif",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
