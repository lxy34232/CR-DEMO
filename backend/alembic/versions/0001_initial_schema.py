"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-04-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE user_role AS ENUM ('enterprise', 'admin')")
    op.execute("CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'revision', 'rejected', 'approved')")

    op.create_table(
        "companies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name_cn", sa.String(200), nullable=False),
        sa.Column("name_en", sa.String(400), nullable=True),
        sa.Column("credit_code", sa.String(18), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_companies_credit_code", "companies", ["credit_code"])

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("email", sa.String(200), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("enterprise", "admin", name="user_role"), nullable=False),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=True),
        sa.Column("real_name", sa.String(50), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("report_no", sa.String(50), nullable=False, unique=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False),
        sa.Column("status", sa.Enum("draft", "submitted", "revision", "rejected", "approved", name="report_status"), nullable=False),
        sa.Column("version", sa.Integer, nullable=False, default=1),
        sa.Column("revision_reason", sa.Text, nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_reports_report_no", "reports", ["report_no"])

    op.create_table(
        "module_data",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("report_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("reports.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_code", sa.String(50), nullable=False),
        sa.Column("data", postgresql.JSONB, nullable=False),
        sa.Column("is_completed", sa.Boolean, nullable=False, default=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("report_id", "module_code", name="uq_module_data_report_module"),
    )

    op.create_table(
        "drafts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("report_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("reports.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_code", sa.String(50), nullable=False),
        sa.Column("data", postgresql.JSONB, nullable=False),
        sa.Column("saved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("version", sa.Integer, nullable=False, default=1),
    )

    op.create_table(
        "attachments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("report_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("reports.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_code", sa.String(50), nullable=False),
        sa.Column("field_name", sa.String(100), nullable=False),
        sa.Column("original_name", sa.String(500), nullable=False),
        sa.Column("stored_name", sa.String(500), nullable=False),
        sa.Column("minio_path", sa.String(1000), nullable=False),
        sa.Column("file_size", sa.BigInteger, nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("uploaded_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("resource", sa.String(100), nullable=True),
        sa.Column("resource_id", sa.String(100), nullable=True),
        sa.Column("ip_address", sa.String(50), nullable=True),
        sa.Column("user_agent", sa.Text, nullable=True),
        sa.Column("detail", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("attachments")
    op.drop_table("drafts")
    op.drop_table("module_data")
    op.drop_table("reports")
    op.drop_table("users")
    op.drop_table("companies")
    op.execute("DROP TYPE IF EXISTS report_status")
    op.execute("DROP TYPE IF EXISTS user_role")
