import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    real_name: str | None = Field(None, max_length=50)
    phone: str | None = Field(None, max_length=20)
    company_name: str = Field(..., min_length=2, max_length=200)
    credit_code: str = Field(..., min_length=18, max_length=18)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("密码需包含字母")
        if not re.search(r"\d", v):
            raise ValueError("密码需包含数字")
        return v


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    role: str
    company_name: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str
