# 04 — 数据库

绝对真值看 `prisma/schema/*.prisma`。这页解释**为什么**长这样。

## 顶层结构

```
Library  （每个机构一行，约 50 个活跃）
   │
   │ 1 : N
   ▼
Library_Year  （每个机构每学年一行）
   │
   │ 1 : 1（每张表）
   ▼
┌────────────────────────────────────────────────────────┐
│  10 张表 — 每行挂在一个 Library_Year 上：              │
│  Monographic_Acquisitions   Volume_Holdings            │
│  Serials                    Other_Holdings             │
│  Unprocessed_Backlog_Materials   Fiscal_Support        │
│  Personnel_Support          Public_Services            │
│  Electronic                 Electronic_Books           │
└────────────────────────────────────────────────────────┘

侧表（编目风格的标题表）：
  List_AV、List_EBook、List_EJournal
  + 各自语言连接表
  + LibraryYear_List* 多对多
```

## 周期 / 调度相关表

| 表 | 用途 |
|---|---|
| `SurveySession` | 每学年一行。cron 用的开关日期 + 通知标志。 |
| `ScheduledEvent`* | 在 `survey_session.prisma` 里。具体待触发事件。 |
| `Email_Template` | 各 broadcast key 的可编辑主题/正文。 |
| `Entry_Status` | 单馆单年的提交进度（哪几张表保存/已交）。 |
| `AuditLog` | 所有重要变更；由 `lib/auditLogger.ts` 写入。 |

\* 表名以 schema 文件为准。

## Library_Year — 中心枢纽

打开 `prisma/schema/schema.prisma` 看 `model Library_Year`。所有提交、所有编辑闸门、所有年度报表都通过它 join。

主要字段：

```
id                   serial 主键
library              FK -> Library.id
year                 学年（如 2024 = 2024-2025 周期）
is_open_for_editing  编辑开关（cron / 超级管理员翻）
admin_notes          自由文本
opening_date         本年覆盖；NULL 表示用默认
closing_date         本年覆盖
fiscal_year_start    信息字段；数据"截止"日
fiscal_year_end      信息字段
publication_date     信息字段；预定 JEAL 期
broadcast_sent       legacy 标志，新逻辑看 SurveySession
is_active            软删除
```

每个机构每学年都有一条 `Library_Year`，**无论**是否提交。空行充当占位，让窗口可以为它打开。

## 10 张表

| # | 表 | 计什么 |
|---|---|---|
| 1 | `Monographic_Acquisitions` | 当年新购入的纸本，按语种 |
| 2 | `Volume_Holdings` | 累计卷册数，按语种 |
| 3 | `Serials` | 纸本连续出版物 |
| 4 | `Other_Holdings` | AV、缩微等 |
| 5 | `Unprocessed_Backlog_Materials` | 未编目积压 |
| 6 | `Fiscal_Support` | 采购与运营经费 |
| 7 | `Personnel_Support` | FTE — 馆员、辅助、学生 |
| 8 | `Public_Services` | 参考、培训、ILL、流通 |
| 9 | `Electronic` | 电子资源（数据库等） |
| 10 | `Electronic_Books` | 电子书（含 import 快捷） |

通用模式：

- 外键 `library_year` → `Library_Year.id`，严格 1:1
- 语种列：`_chinese` / `_japanese` / `_korean` / `_noncjk` / `_subtotal`。`Public_Services` 简化为只剩 subtotal。
- `notes` 自由文本
- 都有 `created_at` / `updated_at` 类字段（名字可能不同）

类型用 `prisma/generated/client/`，不要手写 interface。

## 标题表（catalog + counts）

```
List_EJournal     ← 每个标题一行；跨馆共享
List_EJournal_Counts  ← 每年每标题计数
LibraryYear_ListEJournal  ← 某年某馆订了哪些标题
List_EJournal_Language    ← 标题语种细分
```

`List_AV` / `List_EBook` 同样模式。

## 序列与自增 ID

旧 MySQL dump 的 ID 与 Postgres `serial` 序列在 restore 后常常错位。**任何** `pg_restore` 之后必须跑：

```bash
node scripts/fix-all-sequences.js
```

它把每张 serial PK 表的序列重置到 `MAX(id) + 1`。`npm run db:reset` 和 `npm run db:seed` 自动跑；只有手动 restore 时才需手动跑。

## 迁移 vs `db push`

当前用 `prisma db push` 做快速迭代，大改动用 `prisma/migrations/` 和 `prisma/schema/migrations/` 里的 SQL。**没有** `prisma migrate dev` 历史，是有意为之。

生产改 schema 流程：

1. 编辑 `prisma/schema/*.prisma`
2. 本地 `npx prisma db push` 到 Neon dev branch
3. Prisma Studio 验证
4. 生产用 Vercel 注入的 `DATABASE_URL` 重复一次，或手动跑 `prisma/migrations/*.sql`

要切到 `prisma migrate`，先要 baseline 现有 schema。

## Seeding

入口：`prisma/seed.ts`。**不是** "全新安装" 类型 — 默认 `SYNC_AUTH_TABLES=false`，会保留 `User` / `AuditLog` / `Session`，只同步其余表。

仔细读 `prisma/seed.ts` 顶部。`SYNC_AUTH_TABLES=true` 才会覆盖用户，仅在还原可信 dump 时使用。

## 审计日志

`lib/auditLogger.ts` 定义 payload。每个重要变更都调 `logAuditEvent(...)`。

允许的 action（TS union）：

```
'CREATE' | 'UPDATE' | 'DELETE' | 'SIGNIN' | 'SIGNOUT' |
'SIGNIN_FAILED' | 'UPDATE_ROLES' | 'SYSTEM_OPEN_FORMS' |
'SYSTEM_CLOSE_FORMS' | 'POST_COLLECTION_EDIT' | 'IMPORT'
```

新加变更路由时，**必须**调审计 logger。

## 备份（你必须自己负责）

仓库目前没自动备份。建议：

```bash
pg_dump --no-owner --format=custom \
  "$DATABASE_URL_UNPOOLED" \
  > "ceal_postgres_$(date +%Y-%m-%d).dump"
# 上传到 Neon 之外（S3、Drive、机构存储）
```

留至少 12 月 + 4 周。问卷窗口（10–12 月）改为每晚备份。

下一篇：`05-annual-cycle.md`。
