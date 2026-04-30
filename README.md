# 企业基本情况报告线上数据填报系统

> 铁道产品质量认证评审专用数字化填报平台

## 项目简介

本系统替代传统 Excel 手工填报方式，将 **14 个核心业务模块** 的企业基本情况报告数字化，实现企业信息在线采集、草稿自动保存、管理员审核等全流程管理。

---

## 在线演示（GitHub Pages）

> 无需安装，直接访问，数据保存在浏览器本地

🔗 **演示地址**：[https://lxy34232.github.io/CR-DEMO/](https://lxy34232.github.io/CR-DEMO/)

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 企业填报用户 | `enterprise` | `demo123` | 可查看和填写 14 个模块表单 |
| 管理员 | `admin` | `admin123` | 可查看所有报告、审核、退回 |

---

## 功能模块

### 企业端

| 功能 | 说明 |
|------|------|
| 登录注册 | JWT 认证，支持企业自助注册 |
| 填报工作台 | 14 个模块完成进度总览，一键跳转填报 |
| 模块01：企业概况 | 企业名称、信用代码、人员构成、认证情况、销售收入等 |
| 模块02：高层管理人员 | 动态表格，可增删行 |
| 模块03-14 | 管理制度、设备、工艺、检测、供方、外包等 |
| 草稿自动保存 | 每 3 分钟自动保存，离开页面前提示 |
| 报告提交 | 全量校验通过后提交，生成唯一报告编号 |

### 管理员端

| 功能 | 说明 |
|------|------|
| 数据看板 | 统计卡片 + 模块完成热力图 |
| 报告管理 | 列表查看、搜索筛选、查看详情 |
| 审核操作 | 批准 / 要求修改（附退回原因）/ 驳回 |
| 用户管理 | 账号列表、启用/禁用账号 |
| 审计日志 | 所有关键操作记录 |

---

## 技术架构

```
┌─────────────────────────────────────┐
│  前端：Vue 3 + Element Plus + Vite  │
├─────────────────────────────────────┤
│  后端：Python FastAPI + SQLAlchemy  │
├─────────────────────────────────────┤
│  数据库：PostgreSQL 16              │
├─────────────────────────────────────┤
│  文件存储：MinIO（S3 兼容）         │
├─────────────────────────────────────┤
│  容器化：Docker + Docker Compose    │
├─────────────────────────────────────┤
│  反向代理：Nginx 1.26               │
└─────────────────────────────────────┘
```

---

## 本地部署（完整版，含后端）

### 环境要求

- Docker 25+
- Docker Compose v2
- Node.js 20+（仅构建前端时需要）

### 快速启动

```bash
# 1. 克隆代码
git clone https://github.com/lxy34232/CR-DEMO.git
cd CR-DEMO

# 2. 切换到开发分支
git checkout dev

# 3. 复制并配置环境变量
cp .env.example .env
# 编辑 .env，修改数据库密码、JWT Secret、MinIO 密钥

# 4. 构建前端
cd frontend
npm install
npm run build
cd ..

# 5. 启动所有服务
docker compose up -d

# 6. 执行数据库迁移
docker compose exec backend alembic upgrade head

# 7. 创建管理员账号
docker compose exec backend python -m app.scripts.create_admin
```

启动后访问：`http://localhost`

### API 文档

- Swagger UI：`http://localhost/api/docs`
- ReDoc：`http://localhost/api/redoc`

---

## 本地开发（前端热更新）

```bash
# 启动后端服务（数据库 + API）
docker compose up -d postgres minio backend

# 执行数据库迁移
docker compose exec backend alembic upgrade head

# 启动前端开发服务器（自动代理 /api 到后端）
cd frontend
npm install
npm run dev
```

访问：`http://localhost:5173/CR-DEMO/`

---

## 项目结构

```
CR-DEMO/
├── frontend/                   # Vue 3 前端
│   ├── src/
│   │   ├── api/                # Axios API 客户端
│   │   ├── composables/        # 组合式函数（自动保存等）
│   │   ├── layouts/            # 页面布局组件
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia 状态管理
│   │   ├── utils/              # 工具函数和模块配置
│   │   └── views/              # 页面视图
│   └── Dockerfile
├── backend/                    # FastAPI 后端
│   ├── app/
│   │   ├── api/v1/             # API 路由（auth/reports/modules/files/admin）
│   │   ├── core/               # 配置、数据库、安全、依赖注入
│   │   ├── crud/               # 数据库 CRUD 操作
│   │   ├── models/             # SQLAlchemy ORM 模型
│   │   ├── schemas/            # Pydantic 请求/响应 Schema
│   │   └── scripts/            # 工具脚本（创建管理员等）
│   ├── alembic/                # 数据库迁移脚本
│   └── Dockerfile
├── nginx/
│   └── nginx.conf              # 反向代理配置
├── docker-compose.yml          # 服务编排
├── .env.example                # 环境变量模板
├── 技术方案设计文档.md          # 完整技术方案
└── 表单设计方案.md             # 14 个模块字段定义
```

---

## 部署模式说明

本项目支持两种部署模式：

| 模式 | 分支 | 后端 | 数据存储 | 适用场景 |
|------|------|------|----------|----------|
| **Demo 模式** | `main` / `demo` | ❌ 无 | localStorage | GitHub Pages 展示 |
| **完整模式** | `dev` | ✅ FastAPI | PostgreSQL + MinIO | 服务器真实部署 |

Demo 模式通过 `VITE_DEMO_MODE=true` 环境变量启用，前端自动降级为本地存储。

---

## 14 个填报模块

| 编号 | 模块名称 |
|------|---------|
| 01 | 申请企业基本情况报告 |
| 02 | 高层管理人员情况 |
| 03 | 主要管理制度目录 |
| 04 | 售后服务人员情况 |
| 05 | 成熟的产品研发业绩 |
| 06 | 生产基础设施 |
| 07 | 主要设备 |
| 08 | 工艺装备 |
| 09 | 检测试验手段 |
| 10 | 主要供方清单 |
| 11 | 主要外包方清单 |
| 12 | 依托外部试验资源情况 |
| 13 | 国内外联合研发情况 |
| 14 | 制造/维修相关产品近三年使用情况 |

---

## 安全说明

- 密码使用 bcrypt（cost=12）哈希存储
- JWT Access Token 有效期 30 分钟，Refresh Token 7 天
- 所有文件上传经过 Magic Bytes 校验（防伪造扩展名）
- 文件通过 MinIO 预签名 URL 访问，有效期 1 小时
- 企业用户数据严格隔离，只能访问本企业报告
- 全站 HTTPS（Nginx 配置 TLS 1.2+）

---

## 开发进度

- [x] Phase 1：后端框架（FastAPI + PostgreSQL + JWT + MinIO）
- [x] Phase 1：前端 API 层（Axios + 自动刷新 Token）  
- [x] Phase 1：数据库模型与迁移脚本
- [x] Phase 2：14 个业务模块表单页面
- [x] Phase 2：草稿自动保存 Composable
- [x] Phase 3：报告提交与状态管理
- [x] Phase 4：管理员审核与统计看板
- [ ] Phase 4：数据导出（CSV/Excel）
- [ ] Phase 4：报告 PDF 下载
- [ ] Phase 4：用户注册界面

---

## 许可证

MIT License
