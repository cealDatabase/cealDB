# 06 — 部署

## 当前生产位置

| 层 | 提供方 | 你需要 |
|---|---|---|
| 托管 | Vercel | 项目所有者权限；可看/改环境变量 |
| 数据库 | Neon (Postgres) | 项目权限；主分支 + 子分支 |
| 邮件 | Resend | API key + 受众 ID |
| 域名 | (注册商) | `cealstats.org` 解析到 Vercel |

完整生产部署或灾难恢复需要这 4 套凭证。具体持有人见 `09-glossary.md`。

## Vercel 项目

- **框架**：Next.js（自动识别）
- **构建命令**：`npm run build`（即 `prisma generate && next build`）
- **输出目录**：`.next`
- **Node 版本**：20.x 或 Next.js 16 当前要求

Cron 通过仓库根 `vercel.json` 部署，**不**在 Vercel 控制台单独配。

## 环境变量（Vercel → Project Settings → Environment Variables）

Production 必须有（Preview 也建议有）：

```
DATABASE_URL                # Neon 池化
DATABASE_URL_UNPOOLED       # Neon 直连
PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGHOST_UNPOOLED   # 别名
POSTGRES_URL, POSTGRES_PRISMA_URL, ...                    # 模板别名
AUTH_SECRET                 # JWT 签名
ALG=HS256
CRON_SECRET                 # 必须，否则 cron 端点谁都能调
RESEND_API_KEY              # 群发邮件
RESEND_BROADCAST_LIST_ID    # CEAL 受众 UUID
BROADCAST_FROM_EMAIL        # 可选
BROADCAST_FROM_NAME         # 可选
SYNC_AUTH_TABLES            # 不要设；默认 false
```

改完任何 env 必须**重新部署**。Cron 函数运行时读，下一次跑就拿到新值；页面构建会缓存。

## 构建流水线

```
Vercel → npm install → prisma generate → next build → deploy
```

`build` 脚本里包含了 `prisma generate`：

```json
"build": "prisma generate && next build"
```

如果生产日志看到 "Cannot find module '@prisma/client/...'"，说明这一步没跑，去看构建输出。

## Cron 安全

Cron 路径公开可达：

```
https://cealstats.org/api/cron/check-form-schedules
```

Vercel 自动注入 `Authorization: Bearer <CRON_SECRET>`。Handler **拒绝**其他请求（401）。手动测试：

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  https://cealstats.org/api/cron/check-form-schedules
```

`CRON_SECRET` 不要提交。轮换：

```bash
openssl rand -base64 32
```

更新 Vercel env，并同步给所有需要手动调用的人。

## DNS

`cealstats.org` 指向 Vercel。验证：

```bash
dig +short cealstats.org
```

应看到 Vercel 的 IP 或 `cname.vercel-dns.com`。换主机时新主机重新配，等 DNS 传播。

## Resend

- **API keys**：保留一个 `cealstats production`，仅 Sending 权限
- **Audiences**：单一 `CEAL Members` 受众；UUID = `RESEND_BROADCAST_LIST_ID`。受众成员是普通邮件联系人，不是 Resend 用户
- **Domains**：From 地址的域名必须验证 SPF/DKIM。换 From 要重新验证
- From 地址必须匹配已验证域，否则 Resend 静默丢弃

没接 webhook，bounce/complaint 处理是手动的。

## Neon

- **项目**：cealDB 或类似名
- **生产分支**：`main`，连接串等于 `DATABASE_URL`
- **dev 分支**：每个开发者一个；共享存储但写隔离
- **连接池**：app 用池化串；Prisma 迁移和 Studio 用直连串
- **自动休眠**：Neon 空闲后挂起，首次请求会慢；生产不影响，dev 注意

## 部署流程

非紧急：

1. 从 `main` 拉分支
2. 提 PR，Vercel 自动构建预览 URL
3. 在预览 URL 用 Neon dev 分支测试
4. 合并到 `main`，Vercel 自动上生产
5. 生产烟测：登录、看一张表、看一个图表

紧急：

1. 创建 patch 分支
2. cherry-pick 或直推（如果有权限）
3. 盯 Vercel 构建
4. 失败立刻 rollback —— 生产会自动停在上次绿构建

## Cron 不动了

1. Vercel → Project → Cron Jobs 看历史和报错
2. `curl` 手动调一下看响应
3. 401 → `CRON_SECRET` 不一致
4. 200 但啥都没干 → 看 `SurveySession` 的标志位是不是已经 `true` 了

## 部署失败

1. Vercel 上看构建日志
2. 常见：
   - Prisma generate 报错（本地 `npx prisma generate` 复现）
   - TS 报错（本地 `npm run build`）
   - 内存不够（少见）
3. 环境性的 → 把上一个绿构建 "Promote to Production"

## 域名 / TLS

Vercel 自动签证书。`https://cealstats.org` 报证书错误：

- 域名是否还指向 Vercel
- DNS 是否过期/换了
- Vercel 项目里是否还列着这个域

下一篇：`07-maintenance.md`。
