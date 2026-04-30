from datetime import datetime
from typing import Any, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class ResponseModel(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: T | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PagedData(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


def ok(data: Any = None, message: str = "success") -> dict:
    return {"code": 200, "message": message, "data": data}


def err(message: str, code: int = 400) -> dict:
    return {"code": code, "message": message, "data": None}
