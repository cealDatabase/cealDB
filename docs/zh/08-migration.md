# 08 — 迁移

最坏场景：必须把系统从当前厂商搬走。即使现在不用，也读一遍。

## 何时要做这件事

- Vercel 涨价或政策变了
- Neon 消失或太贵
- Resend 在你需要的 From 域名上不能用
- 委员会决定全部搬到某个会员机构内部
- 全代码库换框架（很少见、工作量巨大）

系统已从 PHP/MySQL 迁到 Next.js/Postgres 一次了 — 最难的迁移已经做过。

## 开始之前

1. 拿**两份**完整 dump（`pg_dump --format=custom`），一份"今天"一份"上次干净停机"，分开存
2. 截图当前 Vercel 项目设置（env、域名、cron）
3. 导出 Resend 受众联系人 CSV
4. 确认你能控 `cealstats.org` 的 DNS — 没 DNS 完不成迁移
5. 估算停机时间，最少"切 DNS 时间"，现实 2–6 小时含验证

## 场景

### A. 只换数据库（Neon → 别的 Postgres）

最便宜。app 留 Vercel。

1. 起新 Postgres（RDS、Supabase、Render）
2. Restore：
   ```bash
   pg_restore --no-owner --dbname="$NEW_DATABASE_URL" ceal_postgres_<date>.dump
   ```
3. `node scripts/fix-all-sequences.js`
4. Vercel env 改 `DATABASE_URL` / `DATABASE_URL_UNPOOLED` / `POSTGRES_*`
5. 重新部署
6. 验证：登录、看图表、手动调一次 cron
7. 7 天观察后停 Neon

### B. 换主机（Vercel → 其他平台）

可选 Netlify、Cloudflare Pages、AWS Amplify、自建 Node。Next.js 都跑得了，但 cron 各家不同。

1. 新主机配：
   - Node 20+
   - 所有 env（`AUTH_SECRET`、`CRON_SECRET`、`DATABASE_URL`、`RESEND_*`...）
   - 等价的定时任务，每天 2 次打 `/api/cron/check-form-schedules`，带 `Authorization: Bearer $CRON_SECRET`
2. 构建部署
3. 切 DNS：`cealstats.org` 指向新主机；等 TLS 颁发
4. 第一天紧盯日志
5. 观察期后停 Vercel

不支持 Next.js 的主机 → 在普通 Node 服务器跑 `next build && next start`，nginx 反代。校园 VM 也行。

### C. 换邮件（Resend → 别家）

可选 SES、SendGrid、Mailgun、Postmark。

1. 新厂商建账户、验证 From 域 SPF+DKIM
2. 建受众/列表，从 Resend 导出 CSV 导入
3. 改 `lib/email.ts` 调新厂商 SDK，几百行不算重写
4. 替换 `RESEND_*` env
5. dev 分支用小测试列表跑端到端
6. 一个完整广播周期成功后停 Resend

### D. 全栈搬到校园服务器

委员会强烈要求时才做。

需要：

- 持久 Linux 机（任何机构机房都行）
- Postgres 14+
- Node 20+ + nginx
- cron 调度（`crontab` 或 `systemd timers`）
- TLS（Let's Encrypt 或机构 CA）
- 出口 SMTP（机构邮件中继或继续 SaaS）

步骤：

1. 装机：Postgres、Node、nginx
2. Restore dump、跑序列修复
3. 克隆仓库、`npm install`、`npm run build`
4. `npx next start -p 3000` 加 systemd 守护
5. nginx 终止 TLS，反代到 `127.0.0.1:3000`
6. crontab 加 2 次 / 天打 cron 端点（带 Authorization）
7. 切 DNS、观察、停云厂商

最难的是**邮件送达率** — 离开 Resend 后第一个要落实的就是这个。

## Schema 迁移注意

如果换到 Aurora、CockroachDB 之类，Prisma 扩展可能不适用。当前 schema 只用标准 Postgres 特性（`serial`、`DateTime`），应能干净 restore。

dev 分支上 `prisma db push --accept-data-loss` 是好朋友。**生产绝不能跑**。

## 会坏的地方

| 症状 | 大概原因 |
|---|---|
| 登录看似 OK，页面 500 报"JWT verify failed" | 各环境 `AUTH_SECRET` 不同 |
| Cron 日志 401 | `CRON_SECRET` 不一致 |
| 群发返 200 但不到邮箱 | 新厂商 From 域没验证 |
| 表单生产 404 但预览 200 | 预览有该 `Library_Year` 行，生产没；seed 一下 |
| 每次请求都很慢 | DB 自动休眠；要么关掉自动休眠，要么加预热 ping |
| `Prisma Client did not initialize` | 构建没跑 `prisma generate`；查 build command |

## 代码库换框架（Next.js → 其他）

很少值得。schema、业务规则、双语 UI 才是价值，框架是简单部分。如果非做不可：

1. Prisma schema 直接复用
2. 重写 API（REST 或 GraphQL），形状对齐
3. 重写 UI，参考 `app/help/` 和 `app/(authentication)/admin/superguide/` 的预期
4. cron handler 在 `app/api/cron/check-form-schedules/route.ts` 很小，最后移植

预算：单人中级工程师 4–6 月。

## 收尾清单

- [ ] 三个 URL 都正常：`/`、`/statistics/quickview?year=<最近>`、`/help`
- [ ] 至少一个会员账号 + 一个超级管理员能登录
- [ ] 测试群发能收到（用小受众）
- [ ] 手动调 cron 返回 `200 OK`
- [ ] 开窗时测试提交成功
- [ ] 测试提交在审计日志里有行
- [ ] DNS、TLS、邮件 DKIM/SPF 都绿
- [ ] 新基础设施上备份在跑
- [ ] 旧基础设施**真停了**，不是隐藏

下一篇：`09-glossary.md`。
