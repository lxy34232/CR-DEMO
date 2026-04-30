import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class ModuleSaveRequest(BaseModel):
    data: dict[str, Any] = Field(..., description="模块表单数据")
    is_completed: bool = Field(False, description="是否标记为已完成")


class ModuleDataResponse(BaseModel):
    id: str
    module_code: str
    data: dict[str, Any]
    is_completed: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReportCreate(BaseModel):
    pass  # 系统自动生成报告编号


class ReportStatusUpdate(BaseModel):
    status: str
    reason: str | None = None


class CompanyInfo(BaseModel):
    id: str
    name_cn: str
    credit_code: str

    model_config = {"from_attributes": True}


class UserInfo(BaseModel):
    id: str
    username: str
    real_name: str | None

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    id: str
    report_no: str
    status: str
    version: int
    revision_reason: str | None
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime
    company: CompanyInfo
    creator: UserInfo
    completion: dict | None = None

    model_config = {"from_attributes": True}


class DraftSaveRequest(BaseModel):
    data: dict[str, Any]


class DraftResponse(BaseModel):
    id: str
    module_code: str
    data: dict[str, Any]
    saved_at: datetime
    version: int

    model_config = {"from_attributes": True}
