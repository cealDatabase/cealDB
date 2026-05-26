# 01 — 系统总览

## 这个系统是什么

**CEAL 统计数据库**（cealstats.org）是 **Council on East Asian Libraries**（亚洲学会下属的东亚图书馆协会）的官方年度统计平台。北美约 50 家拥有东亚馆藏的学术图书馆每年通过它提交数据，结果发表在 **Journal of East Asian Libraries (JEAL)**，并在网站上公开展示。

它取代了原先放在 `ceal.ku.edu` 的旧 PHP 系统。当前 Next.js 应用在 1999 年首次上线（首页横幅写明），2007 年补充了早期数字化报告，并在本仓库里基于 **Next.js 16 + Postgres** 重建。

- 公网地址：<https://cealstats.org>
- 上级委员会：<https://www.eastasianlib.org/newsite/statistics/>

## 谁在用

三种角色，详细定义见 `09-glossary.md`：

| 角色 | 身份 | 主要权限 |
|---|---|---|
| **Super Admin（超级管理员）** | CEAL 统计委员会主席 / 干事 | 开关问卷窗口、群发邮件、修改任何机构的数据、管理用户 |
| **Assistant Admin（助理管理员）** | 指定的协助者 | 大部分超级管理员能力，但不能管用户、不能调整时间 |
| **Member（会员）** | 每个参与馆的指定填表人 | 只能在窗口期内提交并修改本馆的 10 张表 |

未登录的公众也可查看汇总统计与历史 PDF。

## 一句话工作流程

每年一次（默认 10/1–12/2 PT，可调），超级管理员开窗。每个会员图书馆收到邮件后，提交十张标准化表格：纸本采购、卷册馆藏、连续出版物、其他馆藏、未编目积压、经费支持、人员编制、读者服务、电子资源、电子书。窗口关闭后，超级管理员复核数据，导出年度报告，**手动**交给 JEAL 编辑，刊登在某一期 JEAL 上。系统会永久保留并支持检索历史数据。

## 这个系统不做什么

- 不是实时仪表盘 — 会员每年只填一次。
- 不是 CEAL 委员会主站的 CMS — eastasianlib.org 是另一个项目。
- 不是公开报名入口 — 新会员要经委员会审批。
- 1998 之前数据**不权威** — 1998–1999 周期方法论有变，schema 不同，详见 `app/statistics/pre-1998/page.tsx`。

## 各组件位置

| 层 | 是什么 | 位置 |
|---|---|---|
| 前端 | Next.js 16 App Router、React 19、Tailwind 4 | `app/`、`components/` |
| API | Next.js Route Handlers | `app/api/` |
| ORM | Prisma 7 多文件 schema | `prisma/schema/*.prisma` |
| 数据库 | Postgres on Neon（云） | 外部 |
| 邮件 | Resend | `lib/email.ts` |
| 定时 | Vercel cron，每天 2 次 | `vercel.json` + `app/api/cron/` |
| 鉴权 | Cookie + JWT + Argon2id | `lib/auth.ts`、`app/(authentication)/api/signin/` |
| 部署 | Vercel | 外部 |

详见 `03-architecture.md`。

## 年度问卷数据流

```
超级管理员           Cron（每天 2 次）         会员图书馆
   |                       |                        |
   | -- 设置日期 --------> |                        |
   | -- 发预告广播 ------> |                        |
   |                       | -- 到 opening_date --> | 表单解锁
   |                       |                        | 提交 / 修改
   |                       | -- 关闭前 7 天 ------> | 提醒邮件
   |                       | -- 到 closing_date --> | 表单冻结
   | -- 导出报告 -------->                          |
   | -- 手动交 JEAL                                 |
```

## "1998 cutoff" 是什么意思

1998–1999 周期问卷大改：新增电子资源 / 电子书表，语言细分（中 / 日 / 韩 / 非 CJK）标准化。1998 之前的数据保留在专门的归档页（`app/statistics/pre-1998/page.tsx`），**不要**与 1998 之后数据合并查询。

## 接下来

- 上手实操：`02-getting-started.md`
- 代码结构：`03-architecture.md`
- 表 / schema：`04-database.md`
