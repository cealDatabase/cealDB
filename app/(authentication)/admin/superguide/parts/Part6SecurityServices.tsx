'use client'

import React from 'react'
import {
  PartProps,
  SectionH2,
  SectionH3,
  SectionH4,
  P,
  Callout,
  Code,
  GuideTable,
  KeyValueList,
  PageLink,
} from './_shared'

export default function Part6SecurityServices({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-6"
        lang={lang}
        zh="第 6 部分 · 安全 & 外部服务"
        en="Part 6 · Security & External Services"
      />
      <P
        lang={lang}
        zh="网站本身只是个外壳，它依赖几个外部服务才能正常运行。这一部分告诉你这些服务的账户在哪、怎么登录、出问题该联系谁。"
        en="The website itself is just a shell — it relies on several external services to function. This part tells you where the accounts live, how to log in, and whom to contact when something breaks."
      />

      {/* ---------- 6.1 Env vars ---------- */}
      <SectionH3
        id="s-6-1"
        lang={lang}
        zh="6.1 必备的环境变量清单"
        en="6.1 Required Environment Variables"
      />

      <P
        lang={lang}
        zh={
          <>
            环境变量保存在 <strong>Vercel Project → Settings → Environment Variables</strong>。
            正常情况下你不需要碰它们，但如果哪个外部服务的密钥更换、需要 rotate，你必须知道
            去哪里改。以下是<strong>不能少</strong>的 7 个变量：
          </>
        }
        en={
          <>
            Environment variables live in{' '}
            <strong>Vercel Project → Settings → Environment Variables</strong>.
            Normally you won't touch them, but if any external-service key
            rotates, you must know where to change it. The 7{' '}
            <strong>required</strong> variables are:
          </>
        }
      />

      <KeyValueList
        items={[
          {
            key: 'DATABASE_URL',
            value:
              lang === 'zh'
                ? 'Neon PostgreSQL 连接字符串。格式：postgres://user:pass@host/db?sslmode=require'
                : 'Neon PostgreSQL connection string. Format: postgres://user:pass@host/db?sslmode=require',
            note:
              lang === 'zh'
                ? '如果改了这个，全网站立即重启。绝对不要乱动。'
                : 'Change this and the whole site restarts. Never touch casually.',
          },
          {
            key: 'AUTH_SECRET',
            value:
              lang === 'zh'
                ? 'Auth.js 用来签 JWT session 的密钥。32 字节随机字符串。'
                : "Auth.js's secret to sign JWT sessions. 32-byte random string.",
            note:
              lang === 'zh'
                ? '换这个会让所有用户被强制登出。'
                : 'Rotating this forces all users to re-login.',
          },
          {
            key: 'JWT_SECRET',
            value:
              lang === 'zh'
                ? '某些自定义 JWT 流（密码重置链接等）的签名密钥。'
                : 'Signing key for some custom JWT flows (password reset links, etc.).',
            note:
              lang === 'zh'
                ? '换这个会让正在飞着的密码重置链接全部失效。'
                : 'Rotating this invalidates all in-flight password reset links.',
          },
          {
            key: 'RESEND_API_KEY',
            value:
              lang === 'zh'
                ? 'Resend 邮件服务的 API key。re_xxxxx 格式。'
                : 'Resend email service API key. Format: re_xxxxx.',
            note:
              lang === 'zh'
                ? '过期后所有邮件停发。在 dashboard.resend.com → API Keys 重新生成。'
                : 'When expired, all email stops. Regenerate at dashboard.resend.com → API Keys.',
          },
          {
            key: 'RESEND_BROADCAST_LIST_ID',
            value:
              lang === 'zh'
                ? 'Resend Audience（订阅者名单）的 ID。UUID 格式。'
                : 'Resend Audience (subscriber list) ID. UUID format.',
            note:
              lang === 'zh' ? (
                <>
                  当前值参考代码：<Code>24628150-380e-4a25-8c2a-617e7ff5c1db</Code>
                </>
              ) : (
                <>
                  Current value (reference):{' '}
                  <Code>24628150-380e-4a25-8c2a-617e7ff5c1db</Code>
                </>
              ),
          },
          {
            key: 'CRON_SECRET',
            value:
              lang === 'zh'
                ? '保护 cron API 的 Bearer token。Vercel 自动注入或自己设。'
                : "Bearer token protecting the cron API. Auto-injected by Vercel or set yourself.",
            note:
              lang === 'zh'
                ? '改了就要在 vercel.json cron 配置里同步。'
                : 'If changed, must sync the value in vercel.json cron config.',
          },
          {
            key: 'BASE_URL',
            value:
              lang === 'zh'
                ? '生产域名。https://cealstats.org（不要带尾斜杠）。'
                : 'Production domain. https://cealstats.org (no trailing slash).',
            note:
              lang === 'zh'
                ? '邮件里的所有链接都用这个拼。'
                : 'All links in emails are constructed from this.',
          },
        ]}
      />

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '改密钥前先备份',
          en: 'Back up before rotating',
        }}
      >
        {lang === 'zh' ? (
          <>
            改任何环境变量前，<strong>先把当前值复制到一个安全的地方（如 1Password）</strong>。
            Vercel 改完后会自动 redeploy，从那一刻起新值生效。如果新值有问题，
            你需要立刻把旧值粘回去。
          </>
        ) : (
          <>
            Before rotating any env var,{' '}
            <strong>copy the current value to somewhere safe (e.g. 1Password)</strong>. Vercel auto-redeploys after the change and the new value takes effect immediately. If the new value breaks something, you need to paste the old one back fast.
          </>
        )}
      </Callout>

      {/* ---------- 6.2 Resend ---------- */}
      <SectionH3
        id="s-6-2"
        lang={lang}
        zh="6.2 Resend（邮件服务）"
        en="6.2 Resend (Email Service)"
      />

      <P
        lang={lang}
        zh={
          <>
            <strong>Resend</strong>（<Code>resend.com</Code>）是这个项目的邮件发送服务。所有邮件——
            登录验证、密码重置、广播——都通过它。
          </>
        }
        en={
          <>
            <strong>Resend</strong> (<Code>resend.com</Code>) is the project's
            email-sending provider. All emails — login verification, password
            reset, broadcasts — go through it.
          </>
        }
      />

      <SectionH4
        id="s-6-2-login"
        lang={lang}
        zh="登录入口"
        en="How to log in"
      />
      <P
        lang={lang}
        zh={
          <>
            <PageLink href="https://resend.com/login">resend.com/login</PageLink>。
            用 CEAL 团队邮箱 + 密码登录，或者请前任 Super Admin 把你加为 Team Member。
          </>
        }
        en={
          <>
            <PageLink href="https://resend.com/login">resend.com/login</PageLink>. Log in with the CEAL team email + password, or have the outgoing Super Admin add you as Team Member.
          </>
        }
      />

      <SectionH4
        id="s-6-2-tabs"
        lang={lang}
        zh="你需要熟悉的 4 个标签页"
        en="The 4 tabs you should know"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '标签', en: 'Tab' },
          { zh: '用途', en: 'Purpose' },
          { zh: '常用操作', en: 'Common actions' },
        ]}
        rows={[
          [
            { zh: 'Emails', en: 'Emails' },
            { zh: '所有发送过的单次邮件日志（搜索用户邮箱可定位）', en: 'Log of all individual sends (search by recipient email)' },
            { zh: '排查用户没收到邮件', en: 'Diagnose missing emails' },
          ],
          [
            { zh: 'Broadcasts', en: 'Broadcasts' },
            { zh: '广播邮件历史（每次群发是一条）', en: 'Broadcast history (one row per mass send)' },
            { zh: '验证 cron 真的发了广播', en: 'Verify cron actually sent broadcasts' },
          ],
          [
            { zh: 'Audiences', en: 'Audiences' },
            { zh: '订阅者名单（含 unsubscribed / bounced）', en: 'Subscriber list (incl. unsubscribed / bounced)' },
            { zh: '检查谁在名单上、谁退订了', en: 'Check who is in the list / unsubscribed' },
          ],
          [
            { zh: 'Domains', en: 'Domains' },
            { zh: '已验证的发件域名（cealstats.org 应当是 verified）', en: 'Verified sending domains (cealstats.org should be verified)' },
            { zh: '每年检查一次 DNS 记录是否还在', en: 'Annually check DNS records are still in place' },
          ],
        ]}
      />

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '免费额度限制',
          en: 'Free tier limits',
        }}
      >
        {lang === 'zh' ? (
          <>
            Resend 免费层每月 3000 封邮件 / 每天 100 封。CEAL 项目一年发几千封。
            如果某天突然激增（比如忘了去重发了 N 次），可能撞上限。在 Dashboard → Usage 看用量。
          </>
        ) : (
          <>
            Resend free tier is 3000 emails/month / 100 per day. CEAL sends a few thousand per year. A sudden spike (e.g. accidentally resending many times) might hit the limit. Check Dashboard → Usage.
          </>
        )}
      </Callout>

      {/* ---------- 6.3 Vercel ---------- */}
      <SectionH3
        id="s-6-3"
        lang={lang}
        zh="6.3 Vercel（托管平台）"
        en="6.3 Vercel (Hosting)"
      />

      <P
        lang={lang}
        zh={
          <>
            <strong>Vercel</strong>（<Code>vercel.com</Code>）托管整个 Next.js 应用，
            并跑后台 cron 任务。每次开发者 push 到 GitHub main 分支，
            Vercel 会自动部署一个新版本。
          </>
        }
        en={
          <>
            <strong>Vercel</strong> (<Code>vercel.com</Code>) hosts the whole
            Next.js app and runs background cron jobs. Every push to the
            GitHub <Code>main</Code> branch auto-deploys a new version.
          </>
        }
      />

      <SectionH4
        id="s-6-3-tabs"
        lang={lang}
        zh="你需要熟悉的 4 个区域"
        en="The 4 areas you should know"
      />
      <ul className="list-disc list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>Deployments</strong>：每次部署的历史。如果某次部署搞砸了网站，
              可以右上角点 "..." → <strong>Promote to Production</strong> 把上一个稳定版本顶上来（rollback）。
            </li>
            <li>
              <strong>Logs / Runtime Logs</strong>：实时看后端日志。排查"为什么 API 报错"。
            </li>
            <li>
              <strong>Cron Jobs</strong>：看每次 cron 触发的状态、运行时长、是否成功。失败会有 stack trace。
            </li>
            <li>
              <strong>Settings → Environment Variables</strong>：环境变量管理（见 6.1）。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Deployments</strong>: history of every deploy. If a
              deploy broke the site, click "..." →{' '}
              <strong>Promote to Production</strong> on the previous stable one
              to roll back.
            </li>
            <li>
              <strong>Logs / Runtime Logs</strong>: live backend logs. Diagnose
              "why is this API failing".
            </li>
            <li>
              <strong>Cron Jobs</strong>: shows each cron invocation's status,
              duration, success/fail. Failures include stack traces.
            </li>
            <li>
              <strong>Settings → Environment Variables</strong>: env var
              management (see 6.1).
            </li>
          </>
        )}
      </ul>

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '免费层限制',
          en: 'Free tier limits',
        }}
      >
        {lang === 'zh'
          ? 'Vercel Hobby 免费每月 100 GB-Hours runtime + 100 GB bandwidth。CEAL 项目用量很小，从未触限。但 cron 任务在 Hobby 下每天最多 2 次（这就是为什么我们配了 8am + 8pm UTC）。'
          : 'Vercel Hobby free tier: 100 GB-Hours/month runtime + 100 GB bandwidth. CEAL usage is small, never hits limits. But Hobby cron is capped at 2/day (which is why we configure 8am + 8pm UTC).'}
      </Callout>

      {/* ---------- 6.4 Neon ---------- */}
      <SectionH3
        id="s-6-4"
        lang={lang}
        zh="6.4 Neon（PostgreSQL 数据库）"
        en="6.4 Neon (PostgreSQL Database)"
      />

      <P
        lang={lang}
        zh={
          <>
            <strong>Neon</strong>（<Code>neon.tech</Code>）是云 PostgreSQL，存所有数据。
            每次代码访问 DATABASE_URL，最终都打到 Neon。
          </>
        }
        en={
          <>
            <strong>Neon</strong> (<Code>neon.tech</Code>) is cloud PostgreSQL
            that stores all data. Every DATABASE_URL connection lands on Neon.
          </>
        }
      />

      <SectionH4
        id="s-6-4-things"
        lang={lang}
        zh="你需要知道的 4 件事"
        en="4 things you should know"
      />
      <ul className="list-disc list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>免费层"睡眠"行为</strong>：闲置 5 分钟后数据库自动停。下一次访问会冷启动 ~3 秒。
              如果用户报"页面卡了一下又恢复"，通常就是这个。
            </li>
            <li>
              <strong>Branches（分支）</strong>：Neon 支持像 git 一样分支数据库。Production 是 main 分支。
              开发者可能有 dev 分支用于测试。
            </li>
            <li>
              <strong>Point-in-Time Recovery</strong>：免费层保留 7 天历史。如果数据被改坏，
              开发者能在 Neon Console 创建一个 7 天前任意时刻的分支恢复数据。
            </li>
            <li>
              <strong>SQL Editor</strong>：Console 里有 SQL 编辑器。开发者用它做紧急查询/修复。
              你<strong>不应当</strong>直接写 UPDATE/DELETE，除非有开发者监督。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Free-tier "sleep" behavior</strong>: idle 5 minutes and
              the DB auto-stops. Next access cold-starts ~3 seconds. Users
              reporting "page froze and recovered" usually means this.
            </li>
            <li>
              <strong>Branches</strong>: Neon supports git-like branching of
              the DB. Production is the <Code>main</Code> branch. Developers
              may keep a <Code>dev</Code> branch for testing.
            </li>
            <li>
              <strong>Point-in-Time Recovery</strong>: free tier retains 7 days
              of history. If data is corrupted, developer can create a branch
              at any moment within the last 7 days.
            </li>
            <li>
              <strong>SQL Editor</strong>: Console has a SQL editor. Developer
              uses it for emergency queries / fixes. You{' '}
              <strong>should not</strong> directly write UPDATE/DELETE unless
              supervised by a developer.
            </li>
          </>
        )}
      </ul>

      {/* ---------- 6.5 Domain ---------- */}
      <SectionH3
        id="s-6-5"
        lang={lang}
        zh="6.5 域名 cealstats.org"
        en="6.5 Domain cealstats.org"
      />

      <P
        lang={lang}
        zh={
          <>
            域名是付费资源——<strong>每年都要续费</strong>。一旦过期，几小时内全网站打不开，
            邮件可能发不出（因为 SPF/DKIM/DMARC DNS 记录失效）。
          </>
        }
        en={
          <>
            The domain is a paid resource — <strong>renewed every year</strong>. Once expired, the whole site is unreachable within hours, and emails may stop sending (SPF/DKIM/DMARC DNS records become invalid).
          </>
        }
      />

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '续费监控',
          en: 'Renewal monitoring',
        }}
      >
        {lang === 'zh' ? (
          <>
            ① <strong>找到注册商</strong>（Namecheap、GoDaddy、Google Domains 等），登录看 expiration date。
            ② <strong>开自动续费</strong>，绑定一张不会过期的信用卡（最好是 CEAL 组织的卡）。
            ③ <strong>设置日历提醒</strong>到期前 60 天给自己提个醒。
            ④ DNS 记录里至少要有：A/CNAME 指向 Vercel（cname.vercel-dns.com），TXT 是 Resend 的 SPF/DKIM 验证。
          </>
        ) : (
          <>
            (1) <strong>Identify the registrar</strong> (Namecheap, GoDaddy,
            Google Domains, etc.), log in, check expiration date.
            (2) <strong>Enable auto-renew</strong> with a card that won't
            expire (preferably the CEAL organization's card).
            (3) <strong>Set a calendar reminder</strong> 60 days before
            expiration.
            (4) DNS must contain at minimum: A/CNAME pointing to Vercel
            (cname.vercel-dns.com), and TXT records for Resend SPF/DKIM
            verification.
          </>
        )}
      </Callout>

      {/* ---------- 6.6 When to contact developer ---------- */}
      <SectionH3
        id="s-6-6"
        lang={lang}
        zh="6.6 何时联系开发者"
        en="6.6 When to Contact Developer"
      />

      <P
        lang={lang}
        zh={
          <>
            主要开发者：<strong>Meng Qu（Miami University Web Service Librarian）</strong>，邮箱{' '}
            <Code>qum@miamioh.edu</Code>。下面这些情况你<strong>必须</strong>联系她：
          </>
        }
        en={
          <>
            Primary developer:{' '}
            <strong>Meng Qu (Miami University Web Service Librarian)</strong>, email{' '}
            <Code>qum@miamioh.edu</Code>. <strong>Must</strong> contact her in
            these situations:
          </>
        }
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '症状', en: 'Symptom' },
          { zh: '紧急程度', en: 'Urgency' },
          { zh: '联系前先做什么', en: 'Before contacting' },
        ]}
        rows={[
          [
            { zh: '整个网站打不开', en: 'Whole site is down' },
            { zh: '🔴 立即', en: '🔴 Immediate' },
            { zh: '截图错误页 + 看 vercel.com 状态页是否有 incident', en: 'Screenshot error + check vercel.com status page for incidents' },
          ],
          [
            { zh: '页面打开但所有功能 500 错误', en: 'Pages load but all actions 500-error' },
            { zh: '🔴 立即', en: '🔴 Immediate' },
            { zh: '看 Vercel Logs 错误信息', en: 'Check Vercel Logs error messages' },
          ],
          [
            { zh: '数据被改坏想恢复', en: 'Need to recover corrupted data' },
            { zh: '🟠 当天', en: '🟠 Same-day' },
            { zh: '记下机构、表名、损坏前的最后正确状态时间点', en: 'Record library, table, last-known-good timestamp' },
          ],
          [
            { zh: 'P2002 Unique constraint 错误', en: 'P2002 unique constraint error' },
            { zh: '🟡 24 小时', en: '🟡 24h' },
            { zh: '复制完整错误信息 + 哪个页面触发', en: 'Copy full error + which page triggered' },
          ],
          [
            { zh: 'Cron 不跑', en: 'Cron not running' },
            { zh: '🟠 当天', en: '🟠 Same-day' },
            { zh: '看 Vercel Cron Jobs 标签页 + audit-logs', en: 'Check Vercel Cron Jobs tab + audit-logs' },
          ],
          [
            { zh: 'Resend / Neon API key 过期', en: 'Resend / Neon API key expired' },
            { zh: '🟡 24 小时', en: '🟡 24h' },
            { zh: '从对应 Dashboard 拿到新 key', en: 'Get new key from respective Dashboard' },
          ],
          [
            { zh: '需要新功能或新统计字段', en: 'Need a new feature or new stat field' },
            { zh: '🟢 计划', en: '🟢 Plan' },
            { zh: '写清楚需求和截止日期', en: 'Document the requirement and deadline' },
          ],
          [
            { zh: '我搞不定的任何技术问题', en: 'Anything technical I cannot solve' },
            { zh: '🟢 工作时间', en: '🟢 Business hours' },
            { zh: '把已经尝试的步骤写下来', en: 'Write down what you have already tried' },
          ],
        ]}
      />

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '联系开发者的最佳模板',
          en: 'Best email template for developer',
        }}
      >
        {lang === 'zh' ? (
          <>
            Subject: <strong>[CEAL] [紧急程度] 简短问题描述</strong>
            <br />
            Body:
            <ul className="list-disc list-inside ml-4 my-1">
              <li>问题症状</li>
              <li>什么时候开始</li>
              <li>影响哪些用户/机构</li>
              <li>已经试过什么</li>
              <li>截图 / 错误日志</li>
              <li>你想要的紧急程度（"今天解决"/"本周内"/"何时方便"）</li>
            </ul>
          </>
        ) : (
          <>
            Subject: <strong>[CEAL] [Urgency] Short problem description</strong>
            <br />
            Body:
            <ul className="list-disc list-inside ml-4 my-1">
              <li>Problem symptom</li>
              <li>When it started</li>
              <li>Which users/institutions are affected</li>
              <li>What you've tried already</li>
              <li>Screenshots / error logs</li>
              <li>Desired urgency ("solve today" / "by end of week" / "when convenient")</li>
            </ul>
          </>
        )}
      </Callout>

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: 'Meng 不在的应急预案',
          en: 'Backup plan if Meng is unreachable',
        }}
      >
        {lang === 'zh'
          ? '如果 Meng 度假/离职，联系 Miami University Libraries IT 部门询问替补人员。同时通知 CEAL 委员会主席考虑长期开发者继任。'
          : 'If Meng is on vacation / leaves, contact Miami University Libraries IT for a backup. Also notify the CEAL Committee Chair to consider long-term developer succession.'}
      </Callout>

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '小结',
          en: 'Summary',
        }}
      >
        {lang === 'zh' ? (
          <>
            读完第 6 部分你已经知道：① 7 个关键环境变量；② 4 个外部服务怎么登录；
            ③ 域名续费要监控；④ 何时该联系开发者。最后{' '}
            <PageLink href="#part-7">第 7 部分</PageLink> 是可打印的快速检查清单。
          </>
        ) : (
          <>
            After Part 6 you know: (1) the 7 key env vars; (2) how to log into
            the 4 external services; (3) domain renewal must be monitored; (4)
            when to contact the developer.{' '}
            <PageLink href="#part-7">Part 7</PageLink> next — printable quick
            checklists.
          </>
        )}
      </Callout>
    </div>
  )
}
