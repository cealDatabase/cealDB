# 03 — 架构

## 高层结构

```
                    ┌─────────────────────────────┐
                    │       Vercel（托管）        │
                    │  ┌───────────────────────┐  │
   浏览器 ─HTTPS────┼─▶│   Next.js 16 (app/)   │  │
                    │  │  - 页面               │  │
                    │  │  - Route Handlers     │  │
                    │  │  - Server Actions     │  │
                    │  └─────┬─────────────┬───┘  │
                    │        │             │      │
                    │  ┌─────▼─────┐ ┌────▼────┐  │
                    │  │ Prisma 7  │ │ Resend  │  │
                    │  │  client   │ │（邮件） │  │
                    │  └─────┬─────┘ └────┬────┘  │
                    │        │            │       │
                    │  ┌─────▼─────┐      │       │
                    │  │  Cron     │      │       │
                    │  │ (vercel)  │      │       │
                    │  └─────┬─────┘      │       │
                    └────────┼────────────┼───────┘
                             ▼            ▼
                    ┌─────────────┐  ┌─────────────┐
                    │ Neon        │  │ Resend SaaS │
                    │ Postgres    │  │（受众 / 群发）│
                    └─────────────┘  └─────────────┘
```

## 框架：Next.js 16 App Router

- **服务端组件为默认**。`app/` 下的文件除非以 `"use client"` 开头，都是服务端渲染。
- **Route Handlers** 在 `app/api/.../route.ts`，导出 `GET`/`POST` 等。
- **Server Actions** 用于服务端组件触发的表单/变更，集中在 `actions/`。
- 鉴权页面在 `app/(authentication)/`。括号是 Next.js 的 *route group*，只是组织结构，不在 URL 里。

### 目录速览

```
app/
├── (authentication)/        # 登录后页面
│   ├── admin/               # 超级 / 助理管理员工具
│   │   ├── page.tsx         # Dashboard
│   │   ├── survey/          # 10 张表的录入 UI
│   │   ├── survey-dates/    # 调整开关 / 发布日期
│   │   ├── broadcast/       # 群发邮件
│   │   ├── users/           # 用户管理
│   │   ├── year-end-reports/# 年度报告导出（Excel / PDF）
│   │   ├── superguide/      # 应用内超级管理员指南（双语）
│   │   └── ...
│   ├── api/                 # 鉴权 API（signin/signup/signout）
│   ├── signin/, signup/, forgot/, reset-password/, ...
│   └── ...
├── api/                     # 公共 + 管理员 API
│   ├── cron/                # cron 入口（vercel.json 指向这里）
│   ├── statistics/          # 公共图表 / 表格数据接口
│   ├── admin/               # 仅管理员的查询和变更
│   ├── monographic/, serials/, electronic/, ...   # 10 张表的 API
│   └── ...
├── help/                    # 会员指南（双语，公共）
├── statistics/              # 公共统计视图
│   ├── quickview/           # 按年/机构汇总表
│   ├── tableview/           # 基础 + 高级表格
│   ├── graphview/           # 基础 + 高级图表
│   ├── pdf/                 # 已发表 PDF 索引
│   └── pre-1998/            # 1998 之前历史归档
├── libraries/               # 机构列表 / 详情
├── searchingdatabase/       # 公共检索入口
└── page.tsx                 # 公共首页
```

## 数据层：Prisma 7 多文件 schema

schema 拆分在 `prisma/schema/*.prisma`，Prisma 7 原生支持多文件，**不要**合并。

```
prisma/
├── schema/
│   ├── schema.prisma                  # generator + datasource + Library_Year + User
│   ├── library.prisma                 # Library
│   ├── monographic.prisma             # Form 1
│   ├── volume_holdings.prisma         # Form 2
│   ├── serials.prisma                 # Form 3
│   ├── other_holdings.prisma          # Form 4
│   ├── unprocessed_backlog_materials.prisma  # Form 5
│   ├── fiscal_support.prisma          # Form 6
│   ├── personnel_support.prisma       # Form 7
│   ├── public_services.prisma         # Form 8
│   ├── electronic.prisma              # Form 9
│   ├── electronic_books.prisma        # Form 10
│   ├── list_av.prisma                 # AV 标题表
│   ├── list_ebook.prisma              # 电子书标题表
│   ├── list_ejournal.prisma           # 电子期刊标题表
│   ├── library_year_list.prisma       # 年-列表多对多
│   ├── survey_session.prisma          # SurveySession + ScheduledEvent（cron 状态）
│   ├── email_template.prisma          # 可编辑邮件模板
│   ├── entry_status.prisma            # 单馆当年提交进度
│   ├── published_report.prisma        # /statistics/pdf 列表
│   └── ...
├── seed.ts
└── generated/                         # Prisma 客户端（运行时 gitignore）
```

### 关键关系

- **Library** ←→ **Library_Year**（1:N）：每馆每学年一行。
- **Library_Year** ←→ **10 张表的每张**（1:1）：表挂在 Library_Year 上而不是 Library。
- **Library_Year.is_open_for_editing** 是**编辑开关**。Cron 在 `opening_date` 翻为 true、`closing_date` 翻为 false。超级管理员可手动覆盖。
- **SurveySession** 是当前问卷周期日期与广播状态的真值源。

详见 `04-database.md`。

## 鉴权：Cookie + JWT + Argon2id

文件：`lib/auth.ts`、`lib/password.ts`、`app/(authentication)/api/signin/route.ts`。

- 密码用 **Argon2id** 哈希。
- 登录时签发 JWT（`HS256`，密钥 `AUTH_SECRET`），写入 `httpOnly` cookie。
- 角色来自 `Users_Roles`；超级管理员判断在 `lib/libraryYearHelper.ts:isSuperAdmin()`。
- 两步密码重置用 `User.password_reset_token` / `password_reset_expires`。

为兼容旧用户，仍支持 **bcrypt**（`$2y$/$2a$/$2b$`）和 **MD5-crypt**（`$1$`）。在所有现存活跃用户都重置过之前不要拿掉这段。

## 邮件：Resend

文件：`lib/email.ts`、`lib/emailTemplate.ts`。

- 模板存在 Postgres 的 `email_template` 表，超级管理员可在 UI 内编辑主题与正文。
- 4 个 key：
  - `broadcast_announcement`（手动预告）
  - `broadcast_open_forms`（自动 — 开窗当日）
  - `broadcast_closing_reminder`（自动 — 关闭前 7 天）
  - `individual_open_forms`（手动单发，给某一会员）
- Audience UUID 对应 Resend 里的"CEAL 受众"，要与 `User` 表内容保持同步。

`RESEND_API_KEY` 缺失时只打日志不发邮件，方便本地开发。

## Cron：Vercel 定时函数

文件：`vercel.json`、`app/api/cron/check-form-schedules/route.ts`。

```json
"crons": [
  { "path": "/api/cron/check-form-schedules", "schedule": "0 8 * * *" },
  { "path": "/api/cron/check-form-schedules", "schedule": "0 20 * * *" }
]
```

两次都打同一个 handler。每次运行：

1. 取活动的 `SurveySession`。
2. 到 `opening_date` 且未发过 → 发 `broadcast_open_forms`。
3. 到 `closing_date - 7d` 且未发过 → 发 `broadcast_closing_reminder`。
4. 边界日翻 `Library_Year.is_open_for_editing`。
5. 写审计日志。

幂等：`notifiedOnOpen` / `notifiedClosingReminder` 等标志位避免重发。

## 托管：Vercel + Neon

- **Vercel**：构建、上线、运行 cron。环境变量在 Vercel 控制台。
- **Neon**：托管 Postgres。**池化**连接串（`DATABASE_URL`）给应用、**直连**串（`DATABASE_URL_UNPOOLED`）给迁移和 Prisma Studio。
- **Resend**：邮件提供商。Vercel env 里的 API key 必须对应 Resend 项目，且受众已配置好。

## 取舍

- 依赖 **3 个外部 SaaS**（Vercel、Neon、Resend）。任何一个挂了，按 `08-migration.md` 处理。
- **Cron 在 UTC**，业务日期（10/1、12/2）按 PT。冬天可能差 8 小时，handler 已容忍。
- **没用 job queue**，所有定时工作都在 cron handler 里。如果广播逻辑变复杂，应另起队列。

下一篇：`04-database.md`。
