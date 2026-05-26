# CEAL 统计数据库 — 开发者文档（中文）

这一份是英文文档的同步翻译，写给一个**从未与前任开发者接触过**、需要冷启动接手系统的程序员。

> 英文版（`../en/`）为权威。两边不一致时，以英文为准。
> 中文版会刻意写得更紧凑，省略一些英文里冗长的解释。

## 阅读顺序

1. `01-overview.md` — 系统是什么、给谁用
2. `02-getting-started.md` — 克隆、安装、本地跑起来
3. `03-architecture.md` — 各个模块和它们之间的关系
4. `04-database.md` — 数据库 schema、关键表、迁移、播种
5. `05-annual-cycle.md` — 一年一次的问卷流程
6. `06-deployment.md` — Vercel、Neon、Resend、cron、环境变量
7. `07-maintenance.md` — 常见问题与超级管理员工具
8. `08-migration.md` — 万一要更换基础设施怎么办
9. `09-glossary.md` — 术语、链接、联系人

## 仓库里的其他文档

- `app/(authentication)/admin/superguide/` — **超级管理员指南**（应用内，双语）
- `app/help/` — **会员用户指南**（应用内，双语）
- `archive/` — 历史报告，保留作为背景资料

## 约定

- 文件路径都相对于仓库根，例如 `lib/surveyDates.ts`。
- "Super Admin"（超级管理员）= 系统最高权限角色；详见 `09-glossary.md`。
- 默认日期（10/1、12/2）只是**默认值**，超级管理员可按学年覆盖。
- "cron" 指 Vercel 的定时函数，配置见 `vercel.json`。

## 联系人

最近一任维护者：**Meng Qu**，qum@miamioh.edu，Miami University Web Service Librarian。
系统所有者：CEAL 统计委员会（CEAL Statistics Committee）。
