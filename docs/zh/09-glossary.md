# 09 — 术语表 / 链接 / 联系人

参考用，不是教程。代码看不懂时先看这里。

## 人和机构

| 词 | 含义 |
|---|---|
| **CEAL** | Council on East Asian Libraries，母委员会 |
| **AAS** | Association for Asian Studies；CEAL 是 AAS 的下属委员会 |
| **Statistics Committee** | 拥有本数据库的 CEAL 子委员会，制定时间表与政策 |
| **JEAL** | *Journal of East Asian Libraries*，由 BYU 主办 |
| **Super Admin** | 系统最高权限，统计委员会主席 / 干事 |
| **Assistant Admin** | 助理角色，多数权限但范围受限 |
| **Member** | 单馆代表，提交本馆年度数据 |

## 角色

| 角色 | 看所有馆 | 改任意馆 | 发广播 | 管用户 |
|---|:-:|:-:|:-:|:-:|
| Super Admin | ✅ | ✅ | ✅ | ✅ |
| Assistant Admin | ✅ | ✅（受限） | ✅（受限） | ❌ |
| Member | 仅本馆 | 仅本馆，且窗口期 | ❌ | ❌ |

权限实现：`lib/libraryYearHelper.ts`、`lib/formPermissions.ts`、各 `app/api/admin/` 路由内检查。

## 年度周期

| 词 | 含义 |
|---|---|
| **Academic year（学年）** | 标记年份，如 "2024" 表示 2024-2025 周期 |
| **Fiscal year（财政年）** | 数据覆盖的会计期，默认 7/1（前年）–6/30（学年） |
| **Opening date（开窗日）** | 表单对会员开放，默认 PT 10/1 |
| **Closing date（关窗日）** | 表单冻结，默认 PT 12/2 |
| **Publication date（发表日）** | JEAL 发表参考目标，默认次年 2/1。**实际 2–5 月起伏** |
| **Survey window（问卷窗口）** | 开窗 → 关窗 |

## 系统术语

| 词 | 含义 |
|---|---|
| `Library_Year` | 单馆单年一行，中心枢纽 |
| `is_open_for_editing` | `Library_Year` 上的写权限开关 |
| `SurveySession` | 单年一行，cron 真值源 |
| `Email_Template` | 群发模板 |
| `Broadcast` | 全 CEAL 受众群发邮件 |
| `Audience`（Resend） | 邮件供应商里的联系人列表 |
| `Cron` | Vercel 定时函数；`0 8 * * *` 和 `0 20 * * *` UTC |
| `Override` / 超级管理员覆盖 | 超级管理员绕过编辑闸门或年份不匹配的特殊路径 |
| `Post-collection edit` | 关窗后的编辑，仅特权可做，审计日志会标记 |

## 关键链接

| URL | 内容 |
|---|---|
| <https://cealstats.org> | 生产首页 |
| <https://www.eastasianlib.org/newsite/statistics/> | CEAL 统计委员会主页 |
| <https://scholarsarchive.byu.edu/jeal/> | JEAL 期刊归档（发表目标） |
| `/help` | 公共会员指南 |
| `/admin` | 特权后台（需登录） |
| `/admin/superguide` | 应用内超级管理员指南（双语） |
| `/admin/survey-dates` | 单年日期覆盖 |
| `/admin/broadcast` | 手动群发 UI |
| `/admin/users` | 用户管理 |
| `/admin/year-end-reports` | Excel/PDF 导出 |
| `/admin/participation-reports` | 谁交了 / 没交 |
| `/statistics/quickview` | 公共汇总表 |
| `/statistics/tableview` | 公共表格视图 |
| `/statistics/graphview` | 公共图表视图 |
| `/statistics/pdf` | 已发表 PDF（1998 之后） |
| `/statistics/pre-1998` | 1998 之前历史归档 |
| `/api/cron/check-form-schedules` | Cron 端点（auth：`Bearer $CRON_SECRET`） |

## 代码地标

| 文件 | 重要在哪 |
|---|---|
| `vercel.json` | Cron 调度 |
| `lib/surveyDates.ts` | 默认日期 |
| `lib/email.ts` | 邮件发送 + dev 模式日志 |
| `lib/emailTemplate.ts` | 模板 key 和默认正文 |
| `lib/auth.ts` | JWT 签发/校验、角色查询 |
| `lib/libraryYearHelper.ts` | `isSuperAdmin()` + 年份回退 |
| `lib/auditLogger.ts` | 审计 action union、`logAuditEvent()` |
| `app/api/cron/check-form-schedules/route.ts` | **最重要的自动化文件** |
| `prisma/schema/schema.prisma` | Library_Year + User 等 |
| `prisma/schema/survey_session.prisma` | SurveySession（cron 状态） |
| `app/(authentication)/admin/superguide/` | 应用内超级管理员指南 |
| `app/help/` | 应用内会员指南 |
| `app/statistics/pre-1998/page.tsx` | 1998 之前归档 |

## 环境变量速查

| 变量 | 必填？ | 来源 |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon 控制台（池化） |
| `DATABASE_URL_UNPOOLED` | ✅ | Neon 控制台（直连） |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `ALG` | ✅ | 常量：`HS256` |
| `CRON_SECRET` | ✅（生产） | `openssl rand -base64 32` |
| `RESEND_API_KEY` | ✅（生产） | Resend 控制台 |
| `RESEND_BROADCAST_LIST_ID` | ✅（生产） | Resend 受众 UUID |
| `BROADCAST_FROM_EMAIL` | 可选 | Resend 验证过的域名 |
| `BROADCAST_FROM_NAME` | 可选 | 自由文本 |
| `SYNC_AUTH_TABLES` | 可选 | `true`/`false`，默认 false |

## 联系人

| 角色 | 人 / 通道 |
|---|---|
| 最近一任维护者 | **瞿萌（Meng Qu）** — qum@miamioh.edu，Web Service Librarian, Miami University |
| 系统所有者 | CEAL Statistics Committee |
| 邮件厂商（Resend） | Resend 账户持有人（目前瞿萌） |
| 托管（Vercel） | Vercel 项目所有者（目前瞿萌） |
| 数据库（Neon） | Neon 项目所有者（目前瞿萌） |
| 域名（`cealstats.org`） | 询注册商 |

维护人变更时，新维护人必须加进：

1. GitHub 仓库（`cealDatabase/cealDB`）
2. Vercel 项目（Owner / Admin）
3. Neon 项目成员
4. Resend 团队成员
5. 域名注册商凭证持有人

建议建一份 `MAINTAINER_HANDOFF.md` 清单。

## Pre-1998 cutoff（FAQ）

**Q：为什么不能把 1995 和 2020 画在一张图上？**
A：1998-1999 周期问卷大改，pre-1998 的报告 schema 不同，列含义有变。混合会静默地误导趋势。详见 `/statistics/pre-1998`。

**Q：那些数据去哪了？**
A：Pre-1998 数字化报告列在 `/statistics/pre-1998` 和 `/statistics/pdf/year-pdf-version`。原始数字没有重新录入新 schema，今天**不能**与现代数据一起查询。

**Q：要不要在数据库里硬挡 pre-1998 查询？**
A：目前只是文档约定。要硬挡，去 `app/api/statistics/metadata/route.ts` 和 chart-data API 加过滤。

---

到此结束。用户视角细节请看应用内指南（`/admin/superguide`、`/help`）。
