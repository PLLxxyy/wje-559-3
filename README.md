# CommunityGov

CommunityGov 是一个面向居民、网格员、部门管理员、超级管理员的社区治理与便民服务后端 API，提供投诉工单、服务申请、公告审核、网格员管理、审计日志和统计看板能力。

## 主要功能

- JWT 双 Token 认证、bcrypt 密码加密、角色 RBAC。
- 投诉工单提交、分派、处理、审核、完结、关闭、重开，含状态流转日志和评论。
- 便民服务申请、受理、办结、驳回、居民评价。
- 社区公告草稿、审核发布、退回、撤回、公开查询。
- 网格员 CRUD、区域分配、区域查询、工单统计。
- 审计日志、Redis 限流、Swagger API 文档。

## 快速启动 Docker Compose

```bash
docker compose up -d --build
curl http://localhost:38306/api/health
```

访问地址：

- API: http://localhost:38306
- Swagger UI: http://localhost:38306/api/docs

停止服务：

```bash
docker compose down
```

## 本地开发

```bash
cd backend
npm install
DATABASE_HOST=localhost DATABASE_PORT=5432 DATABASE_USER=postgres DATABASE_PASSWORD=postgres DATABASE_NAME=wjegov REDIS_HOST=localhost REDIS_PORT=6379 npm run start:dev
```

本地开发仍需要 PostgreSQL 和 Redis。推荐直接使用 Docker Compose。

## 测试账号与种子数据

所有种子账号密码均为 `Pass1234`。

| 账号 | 角色 | 说明 |
| --- | --- | --- |
| `superadmin` | `SUPER_ADMIN` | 超级管理员，审核公告和全局权限 |
| `deptadmin` | `DEPT_ADMIN` | 部门管理员，分派工单和管理网格 |
| `gridworker` | `GRID_WORKER` | 网格员，处理工单和服务 |
| `resident` | `RESIDENT` | 居民，提交投诉和服务申请 |

启动时会自动创建部门、角色权限、示例投诉、示例公告和一个网格员。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 后端框架 | NestJS |
| ORM | TypeORM |
| 数据库 | PostgreSQL 16 |
| 缓存/限流 | Redis 7 |
| 认证 | JWT accessToken + refreshToken |
| 密码 | bcrypt salt rounds = 10 |
| API 文档 | Swagger |
| 部署 | Docker Compose |

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `COMPOSE_PROJECT_NAME` | `wjegov` | Compose 项目名，避免依赖中文目录名 |
| `PORT` | `38306` | 后端监听端口 |
| `DATABASE_HOST` | `postgres` | PostgreSQL 主机 |
| `DATABASE_PORT` | `5432` | PostgreSQL 端口 |
| `DATABASE_USER` / `DB_USER` | `postgres` | 数据库用户 |
| `DATABASE_PASSWORD` / `DB_PASSWORD` | `postgres` | 数据库密码 |
| `DATABASE_NAME` / `DB_NAME` | `wjegov` | 数据库名 |
| `REDIS_HOST` | `redis` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `JWT_SECRET` | `your-secret-key` | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | `15m` | accessToken 过期时间 |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | refreshToken 过期时间 |

## 目录结构

```text
backend/src/
├── main.ts
├── app.module.ts
├── routes/
│   ├── auth.routes.ts
│   ├── complaints.routes.ts
│   ├── services.routes.ts
│   ├── announcements.routes.ts
│   ├── grids.routes.ts
│   └── dashboard.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── complaints.controller.ts
│   ├── services.controller.ts
│   ├── announcements.controller.ts
│   ├── grids.controller.ts
│   ├── dashboard.controller.ts
│   └── health.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── complaints.service.ts
│   ├── services.service.ts
│   ├── announcements.service.ts
│   ├── grids.service.ts
│   ├── dashboard.service.ts
│   ├── audit.service.ts
│   ├── notification.service.ts
│   └── seed.service.ts
├── models/
│   ├── user.entity.ts
│   ├── role.entity.ts
│   ├── complaint.entity.ts
│   ├── complaint-log.entity.ts
│   ├── complaint-comment.entity.ts
│   ├── service-request.entity.ts
│   ├── announcement.entity.ts
│   ├── grid-worker.entity.ts
│   ├── department.entity.ts
│   └── audit-log.entity.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── audit.middleware.ts
│   ├── error-handler.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── role.middleware.ts
├── constants/
│   ├── enums.ts
│   └── permissions.ts
├── utils/
│   ├── id-generator.ts
│   ├── response-formatter.ts
│   ├── pagination.ts
│   └── validator.ts
├── types/
│   ├── request-with-user.ts
│   ├── pagination.type.ts
│   └── api-response.type.ts
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
└── database/
    ├── migrations/
    │   ├── 001-create-users.ts
    │   ├── 002-create-complaints.ts
    │   ├── 003-create-services.ts
    │   ├── 004-create-announcements.ts
    │   └── 005-create-grid-workers.ts
    └── seeds/
        ├── admin.seed.ts
        ├── departments.seed.ts
        ├── sample-complaints.seed.ts
        └── sample-announcements.seed.ts
```

## 共享枚举引用关系清单

- `ComplaintCategory`：`src/constants/enums.ts` → `src/models/complaint.entity.ts` → `src/services/complaints.service.ts` → `src/controllers/complaints.controller.ts` → `src/routes/complaints.routes.ts`
- `TicketStatus`：`src/constants/enums.ts` → `src/models/complaint.entity.ts` → `src/services/complaints.service.ts` → `src/controllers/complaints.controller.ts` → `src/routes/complaints.routes.ts`
- `Priority`：`src/constants/enums.ts` → `src/models/complaint.entity.ts` → `src/services/complaints.service.ts` → `src/controllers/complaints.controller.ts`
- `UserRole`：`src/constants/enums.ts` → `src/models/user.entity.ts` → `src/services/auth.service.ts` → `src/middlewares/role.middleware.ts` → `src/middlewares/auth.middleware.ts` → 所有需要权限校验的 controller
- `ServiceType`：`src/constants/enums.ts` → `src/models/service-request.entity.ts` → `src/services/services.service.ts` → `src/controllers/services.controller.ts` → `src/routes/services.routes.ts`
- `ServiceStatus`：`src/constants/enums.ts` → `src/models/service-request.entity.ts` → `src/services/services.service.ts` → `src/controllers/services.controller.ts`
- `AnnouncementCategory`：`src/constants/enums.ts` → `src/models/announcement.entity.ts` → `src/services/announcements.service.ts` → `src/controllers/announcements.controller.ts` → `src/routes/announcements.routes.ts`
- `AnnouncementStatus`：`src/constants/enums.ts` → `src/models/announcement.entity.ts` → `src/services/announcements.service.ts` → `src/controllers/announcements.controller.ts`
- `GridWorkerStatus`：`src/constants/enums.ts` → `src/models/grid-worker.entity.ts` → `src/services/grids.service.ts` → `src/controllers/grids.controller.ts` → `src/routes/grids.routes.ts`

## 核心实体数据流说明

以 Complaint 投诉工单为例：

```text
PostgreSQL complaints 表
  → src/models/complaint.entity.ts
  → src/services/complaints.service.ts
  → src/controllers/complaints.controller.ts
  → src/routes/complaints.routes.ts
  → /api/complaints 响应
```

状态流转由 `ComplaintsService` 校验，状态变化写入 `complaint_logs`，写操作由 `AuditMiddleware` 写入 `audit_logs`。枚举由 `src/constants/enums.ts` 统一维护。

## 角色权限矩阵

| 操作 | RESIDENT | GRID_WORKER | DEPT_ADMIN | SUPER_ADMIN |
| --- | --- | --- | --- | --- |
| 注册/登录/个人资料 | 是 | 是 | 是 | 是 |
| 提交投诉 | 是 | 是 | 是 | 是 |
| 查看投诉 | 仅自己 | 仅分配给自己 | 本部门/未分派 | 全部 |
| 分派投诉 | 否 | 否 | 是 | 是 |
| 处理/提交审核 | 否 | 是 | 是 | 是 |
| 审核完结 | 否 | 否 | 是 | 是 |
| 关闭/重开 | 仅自己 | 否 | 是 | 是 |
| 提交服务申请/评价 | 是 | 是 | 是 | 是 |
| 受理/办结/驳回服务 | 否 | 是 | 是 | 是 |
| 创建公告 | 否 | 否 | 是 | 是 |
| 审核公告 | 否 | 否 | 否 | 是 |
| 管理网格员 | 否 | 否 | 是 | 是 |
| 删除网格员 | 否 | 否 | 否 | 是 |
| 查看统计看板 | 否 | 否 | 是 | 是 |

## curl 测试示例

```bash
# 1. 注册居民账号
curl -X POST http://localhost:38306/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"resident1","password":"Pass1234","realName":"张三","phone":"13800138000"}'

# 2. 登录
curl -X POST http://localhost:38306/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"resident1","password":"Pass1234"}'

# 3. 提交投诉（使用登录返回的 accessToken）
curl -X POST http://localhost:38306/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"category":"噪音","title":"楼下装修噪音扰民","description":"连续三天早上7点开始电钻","priority":"HIGH","location":"3号楼2单元"}'

# 4. 查询工单列表（分页+筛选）
curl -X GET "http://localhost:38306/api/complaints?page=1&limit=10&status=SUBMITTED" \
  -H "Authorization: Bearer <accessToken>"

# 5. 分派工单（需部门管理员权限）
curl -X PUT http://localhost:38306/api/complaints/1/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{"handlerId":3,"assignedDeptId":1,"comment":"转交网格员处理"}'
```

## 主要接口

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`
- `POST /api/complaints`
- `GET /api/complaints`
- `PUT /api/complaints/:id/assign`
- `PUT /api/complaints/:id/process`
- `PUT /api/complaints/:id/review`
- `PUT /api/complaints/:id/resolve`
- `PUT /api/complaints/:id/close`
- `PUT /api/complaints/:id/reopen`
- `POST /api/services`
- `PUT /api/services/:id/accept`
- `PUT /api/services/:id/complete`
- `POST /api/services/:id/rate`
- `GET /api/announcements/published`
- `POST /api/announcements`
- `PUT /api/announcements/:id/approve`
- `GET /api/grids/workers`
- `GET /api/dashboard/overview`

## Docker 部署说明

`docker-compose.yml` 不使用 `version:` 字段，顶层声明 `name: wjegov`，并通过 `.env` 中的 `COMPOSE_PROJECT_NAME=wjegov` 固定项目名。容器名分别为：

- `${COMPOSE_PROJECT_NAME:-wjegov}-backend`
- `${COMPOSE_PROJECT_NAME:-wjegov}-postgres`
- `${COMPOSE_PROJECT_NAME:-wjegov}-redis`

PostgreSQL 和 Redis 使用健康检查，后端依赖 PostgreSQL 健康和 Redis 健康后启动。PostgreSQL 数据通过命名卷 `postgres_data` 持久化。

## License

MIT
