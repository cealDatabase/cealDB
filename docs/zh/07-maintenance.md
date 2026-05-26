# 07 — 维护

操作手册。系统已部署、出问题、要变更时看这里。

## 常见操作

### "提前 / 推迟开窗"

`/admin/survey-dates` 改日期保存，下次 cron 拾起。要立即开 → `/admin/broadcast` "Open forms now" 或 `manual-open-forms` API。

### "重发某个广播"

`/admin/broadcast` 每个模板有"立即发送"按钮。`SurveySession` 上的标志位决定是否再发：

- `notifiedOnOpen`、`notifiedOnClose`、`notifiedClosingReminder`、`announcementSentAt`

把对应字段改回 `false`（或 `announcementSentAt` 改 NULL），下次 cron 满足日期条件时会再发。

### "某馆数据关闭后才发现错"

两条路：

1. **会员侧**：让该馆代表登录改。`is_open_for_editing` 不为 true 他改不了。
2. **超级管理员 override**：`/admin/superguide/parts/Part5...` 文档说明的 post-collection edit 模式。10 张表的 API 都查 `isSuperAdmin()`，绕过编辑闸门。审计日志用 `POST_COLLECTION_EDIT`。

### "加一个新会员图书馆"

会员指南让公众发邮件给委员会。审批通过后：

1. 插一行 `Library`
2. 插一行当年的 `Library_Year`
3. 建 `User`、通过 `User_Library` 关联
4. `/admin/users` 发开窗邮件

第 1 步目前没 UI，要手写 SQL（或 Prisma Studio）。

### "重置某用户密码"

`/admin/users` → 找到 → "Reset password"。会发一条短期有效的 token 邮件。重置页 `/reset-password?token=...`。

完全收不到邮件 → 自己生成 token 或把 `requires_password_reset=true`，链接线下给。

### "把去年的电子资源订阅复制到今年"

`/admin/...copy-records`，走 `app/api/copy-records/route.ts`。**幂等保护**：目标年存在重复就拒绝复制。要重复制，先手删目标行。

### "Restore 完后修序列"

```bash
node scripts/fix-all-sequences.js
```

正常运维不需要。只在 `pg_restore` 或显式 ID 大批量插入后跑。

## 排错

### 登录"user not found"

- 大小写：handler 有大小写不敏感兜底，但手插数据可能破坏
- `User.isactive`：禁用用户故意返回 not found
- `User.email_verified`：未验证可能被卡

### 登录"incorrect password"

- 支持 bcrypt（`$2y$/$2a$/$2b$`）、MD5-crypt（`$1$`）、Argon2id
- 密码列空 → "需要重置"，发重置链接

### 表单提交 403 / 404

- 403 = `is_open_for_editing=false` 且非超级管理员
- 404 = 当年无 `Library_Year`。超级管理员路径下 API 会回退到最近年；看 `lib/libraryYearHelper.ts`

### Cron 不动

参考 `06-deployment.md` "Cron 不动了"。

### 群发未送达

- `RESEND_API_KEY` 在 Vercel 里设了吗
- From 域名在 Resend 验证了吗
- 受众 UUID 等于 `RESEND_BROADCAST_LIST_ID` 吗
- Resend → Logs 看硬退/抑制
- 本地 dev 不发邮件，只打日志，正常

### `/statistics/quickview` 看不到图

- `/api/statistics/metadata` 有非空 `years` 吗
- 该年有 `Library_Year` 行吗
- metadata 过滤掉 `year !== 1900`，1900 是占位忽略
- 1998 之前的数据**不**走这个端点，只在 `/statistics/pre-1998`

## 备份（必须自己做）

仓库当前没自动备份。建议：

```bash
pg_dump --no-owner --format=custom \
  "$DATABASE_URL_UNPOOLED" \
  > "ceal_postgres_$(date +%Y-%m-%d).dump"
```

异地保存（S3、Drive、机构存储）。月备 12 + 周备 4。问卷窗口期改晚备份。

## 轮换密钥

何时轮换：

- 维护人离职
- 任何值历史上出现过在公开 commit（本仓库历史 `.env` 就是这种）
- 厂商建议轮换

流程：

1. 生成新值（`openssl rand -base64 32` 给 AUTH/CRON；Resend 控制台给 API key）
2. 更新 Vercel env（Production + Preview）
3. 重新部署生产
4. （`AUTH_SECRET`）所有 JWT cookie 失效，用户被强制重登。挑非高峰
5. （`RESEND_API_KEY`）旧 key 在 Resend 控制台禁用

## 健康检查

目前没有 `/health`。建议加：

- `/api/health` 返回 DB 连通性 + cron 状态
- UptimeRobot 类的简单监控打 `/`

## 日志

- **应用日志**：Vercel → Deployments → Logs，按路由筛
- **审计日志**：`AuditLog` 表，Prisma Studio 或后台 UI
- **邮件日志**：Resend 控制台
- **DB 慢查询**：Neon → Project → Monitoring

## 周期性任务

| 时点 | 任务 |
|---|---|
| 开窗前 1 月 | `curl` 测 cron、dev 分支测群发 |
| 开窗前 1 周 | 轮换 `CRON_SECRET`，校对用户列表 |
| 开窗当天 | 紧盯日志几个小时 |
| 窗口中段 | 看 Resend bounce、催促未交馆 |
| 关窗当天 | 确认表锁住，导整库 dump |
| 关窗后 | 出年度报告，归档 `Library_Year` |
| 每年 | 续域名、清查 Vercel/Neon/Resend 成员名单 |

下一篇：`08-migration.md`。
