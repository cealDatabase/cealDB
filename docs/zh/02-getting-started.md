# 02 — 上手指南

第 1 天指南。完成本页后，本地应用应能连接 Postgres 跑起来。

## 前置工具

| 工具 | 版本下限 | 用途 |
|---|---|---|
| Node.js | 20.x LTS | Next.js 16 最低要求 |
| npm | 随 Node 自带 | 包管理（`package.json` 是 npm 风格） |
| Git | 任意近期版本 | 版本控制 |
| Postgres | 14+ 或用 Neon 云 | 生产用 Neon Postgres |

不用 yarn / pnpm，统一 npm，避免 lockfile 抖动。

## 1. 克隆

```bash
git clone https://github.com/cealDatabase/cealDB.git
cd cealDB
```

## 2. 安装

```bash
npm install
```

会自动跑 `prisma generate`，把 Prisma 客户端写到 `prisma/generated/client/`。如果遇到 "client not found"，手动 `npx prisma generate`。

## 3. 拿到环境变量

仓库**不**附带可用的 `.env`。请向当前维护者（见 `09-glossary.md`）索取。需要的变量：

```ini
DATABASE_URL=postgres://USER:PASSWORD@HOST/DB?sslmode=require
DATABASE_URL_UNPOOLED=postgres://USER:PASSWORD@DIRECT_HOST/DB?sslmode=require

AUTH_SECRET=<随机 32+ 字符>
ALG=HS256

CRON_SECRET=<openssl rand -base64 32 生成；与 Vercel cron 头一致>

RESEND_API_KEY=<re_... Resend 控制台密钥>
RESEND_BROADCAST_LIST_ID=<Resend 受众 UUID>

BROADCAST_FROM_EMAIL="CEAL Database <notifications@cealstats.org>"
BROADCAST_FROM_NAME="CEAL Database"
```

> ⚠️ **不要提交 `.env`。** 已在 `.gitignore`，但历史上提交过一次（`git log -p -- .env`）。轮换密钥时，凡是历史里出现过的值都要换。

文件放在仓库根：`cealDB/.env`。

## 4. 拿到一个数据库

三种合理选择：

### A. 用 Neon 分支（推荐）

让维护者从生产数据库拉个 branch；他给你的连接串直接替换 `DATABASE_URL`。有真实数据，且与生产隔离。

### B. 本地 Postgres + 还原 dump

```bash
createdb cealdb_local
pg_restore -d cealdb_local /path/to/ceal_postgres_<date>.dump
```

`.env` 里 `DATABASE_URL=postgresql://localhost/cealdb_local`。

### C. 空 schema + seed

```bash
npm run db:reset
```

跑 `prisma db push --force-reset && prisma db seed && node scripts/fix-all-sequences.js`。schema 正确，但内容稀少；缺历史数据和会员图书馆。

## 5. 运行

```bash
npm run dev
```

访问 <http://localhost:3000>。用已知账号登录，或走注册流程（如果你重置过 DB）。

## 6. 自检清单

| 检查 | 期望 |
|---|---|
| 打开 `/` | 首页含年份、机构数、馆藏总量 |
| `/statistics/quickview?year=2024` | 当年机构表能渲染 |
| `/statistics/pre-1998` | 历史归档页正常 |
| `/help`（未登录） | 会员指南显示 |
| `/admin/superguide`（超级管理员登录） | 超级管理员指南显示 |
| `npx prisma studio` | <http://localhost:5555> 出 schema 浏览器 |

## 7. 常见首日坑

- **`Prisma client not generated`** → `npx prisma generate`
- **`P1001: Can't reach database server`** → `DATABASE_URL` 错或 Neon 分支休眠
- **登录总报「user not found」** → schema 有但用户没 seed；要 dump 或自注册
- **群发邮件不到** → `RESEND_API_KEY` 缺；本地 dev 只会打 log，不发邮件，正常
- **本地 cron 不动** → Vercel cron 只在 Vercel 跑，本地手动 `curl` 加 `Authorization: Bearer $CRON_SECRET` 测

## 8. 常用 npm scripts

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器 |
| `npm run build` | Prisma 生成 + Next 构建 |
| `npm run start` | 跑生产构建 |
| `npm run lint` | ESLint |
| `npm run db:push` | 不走 migration 直接同步 schema |
| `npm run db:reset` | 清库重建（**会毁掉数据**，绝对不要在生产跑） |
| `npm run db:seed` | 重新 seed（也会修改某些表） |
| `npm run prisma:studio` | <http://localhost:5555> |

> 注意：`package.json` 里 `db:check` 和 `db:verify` 引用的 `pre-deploy-checks.js` / `post-deploy-verify.js` **当前不存在**，是失效条目，直到有人补回来或删掉。

下一篇：`03-architecture.md`。
