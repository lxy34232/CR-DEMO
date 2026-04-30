import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    report_no: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        Enum("draft", "submitted", "revision", "rejected", "approved", name="report_status"),
        nullable=False,
        default="draft",
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    revision_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    company: Mapped["Company"] = relationship("Company", back_populates="reports", lazy="selectin")
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by], lazy="selectin")
    modules: Mapped[list["ModuleData"]] = relationship(
        "ModuleData", back_populates="report", lazy="select", cascade="all, delete-orphan"
    )
    attachments: Mapped[list["Attachment"]] = relationship(
        "Attachment", back_populates="report", lazy="select", cascade="all, delete-orphan"
    )
