'use client'

import React from 'react'
import {
  PartProps,
  SectionH2,
  SectionH3,
  P,
  Callout,
  Code,
  PageLink,
} from './_shared'

interface Term {
  term: string
  zh: React.ReactNode
  en: React.ReactNode
}

function GlossaryList({ lang, terms }: { lang: 'zh' | 'en'; terms: Term[] }) {
  return (
    <dl className="my-4 divide-y divide-gray-200 border border-gray-200 rounded-lg">
      {terms.map((t) => (
        <div key={t.term} className="px-4 py-3">
          <dt className="font-mono font-semibold text-gray-900">{t.term}</dt>
          <dd className="mt-1 text-sm text-gray-700">
            {lang === 'zh' ? t.zh : t.en}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function Part8Glossary({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-8"
        lang={lang}
        zh="第 8 部分 · 术语表"
        en="Part 8 · Glossary"
      />
      <P
        lang={lang}
        zh="按主题分组的中英对照术语表。看不懂前面任何一个词时，回到这里查。"
        en="Bilingual glossary grouped by topic. When you encounter an unfamiliar term in earlier parts, come here to look it up."
      />

      {/* ---------- 8.1 Roles & access ---------- */}
      <SectionH3
        id="s-8-1"
        lang={lang}
        zh="8.1 角色与权限"
        en="8.1 Roles & Access"
      />
      <GlossaryList
        lang={lang}
        terms={[
          {
            term: 'Super Admin (role 1)',
            zh: <>超级管理员。能看到所有页面、所有机构数据，能执行所有操作（开关表单、广播、改用户、改数据）。这就是你。</>,
            en: <>Super Admin. Can see every page and every institution's data, and perform every action (open/close forms, broadcast, edit users, edit data). That's you.</>,
          },
          {
            term: 'Member Institution (role 2)',
            zh: <>成员机构用户。每家参与机构有 1–3 个这种账号。只能填写自己机构的 10 张表，看自己的报告。约 100+ 用户。</>,
            en: <>Member institution user. Each participating institution has 1–3 of these. Can only fill its own 10 forms and view its own reports. ~100+ users.</>,
          },
          {
            term: 'E-Resource Editor (role 3)',
            zh: <>电子资源专员。可以管理 AV / EBook / EJournal 三个主资源列表（共享于所有机构）。</>,
            en: <>E-resource specialist. Manages AV / EBook / EJournal master lists (shared across all institutions).</>,
          },
          {
            term: 'Assistant Admin (role 4)',
            zh: <>助理管理员。权限介于 Super Admin 和 Member 之间。能看 admin 页面但不能改用户、不能广播。备份继任者就是这个角色。</>,
            en: <>Assistant Admin. Between Super Admin and Member. Can see admin pages but cannot edit users or broadcast. Backup successor uses this role.</>,
          },
          {
            term: 'Impersonation (代填)',
            zh: <>Super Admin 用某机构身份打开表单，代填或核对数据。URL 里加 ?library=123 或写 cookie。审计日志会记录是谁代填的。</>,
            en: <>Super Admin opens a form acting as a specific library to fill in or verify data. Done via URL ?library=123 or a cookie. Audit log records who impersonated.</>,
          },
        ]}
      />

      {/* ---------- 8.2 Annual Cycle ---------- */}
      <SectionH3
        id="s-8-2"
        lang={lang}
        zh="8.2 年度循环"
        en="8.2 Annual Cycle"
      />
      <GlossaryList
        lang={lang}
        terms={[
          {
            term: 'Academic Year (学年)',
            zh: <>统计学年。比如 2024–2025 学年的数据，10/1/2025 开始收集，2/2026 发表。本系统数据库里通常用结束年份表示，如 year=2025。</>,
            en: <>Academic year. E.g. 2024–2025 data is collected starting 10/1/2025 and published 2/2026. The DB usually stores it as the ending year, e.g. year=2025.</>,
          },
          {
            term: 'Fiscal Year (财政年)',
            zh: <>机构内部的财政年起止日期，由 SurveySession.fiscalYearStart/End 记录。每家机构都用同一个 CEAL 设定的财政年。</>,
            en: <>Institutional fiscal year start/end, stored in SurveySession.fiscalYearStart/End. All libraries follow the same CEAL-set fiscal year.</>,
          },
          {
            term: 'Opening Date (开表日)',
            zh: <>每年 10 月 1 日 9:00 PM Pacific Time（约等于 UTC 4:00 AM 次日）。Cron 在 UTC 8:00 跑时把表单切到 Active。</>,
            en: <>Every Oct 1, 9:00 PM Pacific Time (≈ UTC 4:00 AM next day). Cron at UTC 8:00 flips forms to Active.</>,
          },
          {
            term: 'Closing Date (关表日)',
            zh: <>每年 12 月 2 日 11:59 PM Pacific Time。Cron 切到 Closed。一切编辑都被禁止（除非 Super Admin 介入）。</>,
            en: <>Every Dec 2, 11:59 PM Pacific Time. Cron flips to Closed. All editing is blocked (unless a Super Admin intervenes).</>,
          },
          {
            term: 'Reminder Email (提醒邮件)',
            zh: <>关表前一周（约 11/25）发的中间广播，提醒还没填完的机构尽快提交。模板是 broadcast_reminder。</>,
            en: <>Mid-cycle broadcast about a week before close (~Nov 25), prompting laggard institutions to submit. Template: broadcast_reminder.</>,
          },
          {
            term: 'Publication Date (发表日)',
            zh: <>JEAL（Journal of East Asian Libraries）2 月发表号刊登 CEAL 报告的日期。统计 PDF 发表后，主页才对成员开放本年度数据。</>,
            en: <>The Feb issue date of JEAL (Journal of East Asian Libraries) where CEAL reports appear. Only after the PDF is published does the homepage open this year's data to members.</>,
          },
          {
            term: 'Library_Year',
            zh: <>数据库表，每行 = 某机构在某年是否参与 + 是否开放编辑 + 是否已发表。每一组 (library, year) 都对应一行。</>,
            en: <>DB table; each row = whether a library participates in a given year + is_open_for_editing + is_published. One row per (library, year) pair.</>,
          },
          {
            term: 'is_open_for_editing',
            zh: <>Library_Year 上的布尔字段。true = 表单可编辑；false = 只读。是 cron 自动管理的核心开关。</>,
            en: <>Boolean field on Library_Year. true = form editable; false = read-only. The core switch managed by cron.</>,
          },
          {
            term: 'is_published',
            zh: <>Library_Year 上的布尔字段。true = JEAL 已发表，公众/Member 可看；false = 数据藏起来。</>,
            en: <>Boolean field on Library_Year. true = JEAL published, Member/public can view; false = hidden.</>,
          },
          {
            term: 'is_active',
            zh: <>Library_Year 上的布尔字段。true = 该机构本年度参与；false = 跳过此年（极少用）。</>,
            en: <>Boolean field on Library_Year. true = library participates this year; false = skip this year (rarely used).</>,
          },
        ]}
      />

      {/* ---------- 8.3 Forms & data ---------- */}
      <SectionH3
        id="s-8-3"
        lang={lang}
        zh="8.3 表单与数据"
        en="8.3 Forms & Data"
      />
      <GlossaryList
        lang={lang}
        terms={[
          {
            term: 'The 10 Forms (10 张表)',
            zh: <>Monographic Acquisitions / Volume Holdings / Serials / Other Holdings / Unprocessed / Fiscal / Personnel / Public Services / Electronic / Electronic Books。每个机构每年要填 10 张。</>,
            en: <>Monographic Acquisitions / Volume Holdings / Serials / Other Holdings / Unprocessed / Fiscal / Personnel / Public Services / Electronic / Electronic Books. Each library fills 10 per year.</>,
          },
          {
            term: 'Save Draft (存草稿)',
            zh: <>填表时按这个能保存当前内容但不提交。下次回来还能继续改。Super Admin 在关表后也能 Save Draft（普通用户不行）。</>,
            en: <>Saves current form content without submitting. Returns later to keep editing. Super Admin can Save Draft after close (normal users cannot).</>,
          },
          {
            term: 'Submit (提交)',
            zh: <>把表单标记为已提交。在 Entry_Status 表上写一条 status=submitted。可重复提交（覆盖）。</>,
            en: <>Marks the form as submitted. Writes status=submitted to the Entry_Status table. Can resubmit (overwrites).</>,
          },
          {
            term: 'Entry_Status',
            zh: <>数据库表。记录每个机构每年每张表的状态：submitted / reopened / draft 等。审计追踪用。</>,
            en: <>DB table tracking each form's status per (library, year): submitted / reopened / draft, etc. Used for audit trails.</>,
          },
          {
            term: 'Copy Records (复制记录)',
            zh: <>电子资源表（AV/EBook/EJournal）独有。把上一年订阅过的资源 ID 复制到本年，省得机构重新勾选。有去重检查防止重复复制。</>,
            en: <>Specific to e-resource forms (AV/EBook/EJournal). Copies last year's subscribed resource IDs into this year to spare libraries from re-checking. Has dedup checks against double-copy.</>,
          },
          {
            term: 'Import (导入)',
            zh: <>把本机构上一年同表的数据填入本年表单，作为起点再修改。Save Draft / Submit 才真正写入。</>,
            en: <>Pre-fills this year's form with this library's last-year data as a starting point. Only Save Draft / Submit actually persists.</>,
          },
          {
            term: 'Subtotal Field (合计字段)',
            zh: <>每个语言/类型的小计求和栏。Public Services 等表只用 _subtotal 字段，不再细分语种。</>,
            en: <>Sum-of-rows column. Forms like Public Services use only _subtotal columns and no longer break out by language.</>,
          },
        ]}
      />

      {/* ---------- 8.4 Automation ---------- */}
      <SectionH3
        id="s-8-4"
        lang={lang}
        zh="8.4 自动化"
        en="8.4 Automation"
      />
      <GlossaryList
        lang={lang}
        terms={[
          {
            term: 'Cron Job (定时任务)',
            zh: <>每天 UTC 8:00 + UTC 20:00 自动跑的服务端脚本（Vercel 配置）。检查所有 ScheduledEvent，到点执行。</>,
            en: <>Server script auto-running daily at UTC 8:00 + UTC 20:00 (Vercel configured). Checks ScheduledEvent rows and triggers what's due.</>,
          },
          {
            term: 'ScheduledEvent',
            zh: <>数据库表。每条记录一个未来要做的事：发广播 / 开表 / 关表 / 发提醒。带 scheduledFor 时间和 status 字段。</>,
            en: <>DB table; each row = a future action: send broadcast / open forms / close forms / send reminder. Has scheduledFor + status fields.</>,
          },
          {
            term: 'SurveySession',
            zh: <>数据库表。每年一条主"会话"记录，串起这一年所有 ScheduledEvent + 关键日期 + 通知状态（notifiedOnOpen / notifiedOnClose）。</>,
            en: <>DB table; one master "session" row per year, linking that year's ScheduledEvent rows + key dates + notification flags (notifiedOnOpen / notifiedOnClose).</>,
          },
          {
            term: 'Idempotency (幂等)',
            zh: <>同一个动作执行多次的结果跟执行一次一样。靠 notifiedOnOpen / notifiedOnClose 等标志位实现：cron 看到已经发过广播就跳过，绝不重发。</>,
            en: <>Running the same action multiple times yields the same result as once. Implemented via flags like notifiedOnOpen / notifiedOnClose: cron skips if a broadcast was already sent, never duplicates.</>,
          },
          {
            term: 'Broadcast (广播)',
            zh: <>群发邮件。一次广播 = 一封邮件发给 Resend Audience 上所有订阅者。系统有 4 种：announcement / open / reminder / close。</>,
            en: <>Mass-send email. One broadcast = one email to every subscriber on the Resend Audience. The system has 4 types: announcement / open / reminder / close.</>,
          },
          {
            term: 'Audit Log (审计日志)',
            zh: <>记录"谁在什么时候做了什么"。在 /admin/audit-logs 查看。每个写操作（包括 cron 的）都会留痕。</>,
            en: <>Records "who did what when". Viewable at /admin/audit-logs. Every write op (including cron's) is logged.</>,
          },
        ]}
      />

      {/* ---------- 8.5 External Services ---------- */}
      <SectionH3
        id="s-8-5"
        lang={lang}
        zh="8.5 外部服务"
        en="8.5 External Services"
      />
      <GlossaryList
        lang={lang}
        terms={[
          {
            term: 'Vercel',
            zh: <>托管 Next.js 应用的平台。代码在 GitHub，每次 push 到 main 自动部署。也跑 cron。</>,
            en: <>Platform hosting the Next.js app. Code lives on GitHub; every push to main auto-deploys. Also runs cron.</>,
          },
          {
            term: 'Neon',
            zh: <>云 PostgreSQL 数据库提供商。所有数据存这里。免费层闲置 5 分钟会自动睡眠（首次访问会有几秒延迟）。</>,
            en: <>Cloud PostgreSQL provider. All data lives here. Free tier auto-sleeps after 5 minutes idle (causing a few-seconds wake delay on first hit).</>,
          },
          {
            term: 'Resend',
            zh: <>邮件发送服务。所有邮件——验证、密码重置、广播——都通过它。在 dashboard.resend.com 看历史。</>,
            en: <>Email-sending service. All emails — verification, password reset, broadcast — go through it. View history at dashboard.resend.com.</>,
          },
          {
            term: 'Resend Audience',
            zh: <>Resend 里的订阅者名单。新用户 signup 时会自动加到这个名单。退订的用户标记 unsubscribed=true，广播会跳过。</>,
            en: <>Subscriber list within Resend. New users from signup are auto-added. Unsubscribed users (unsubscribed=true) are skipped on broadcast.</>,
          },
          {
            term: 'Auth.js',
            zh: <>Next.js 的认证库（前身 NextAuth）。负责登录、JWT 会话。我们用 credentials provider 做邮箱+密码登录。</>,
            en: <>Next.js auth library (formerly NextAuth). Handles login + JWT sessions. We use the credentials provider for email+password login.</>,
          },
          {
            term: 'Argon2id',
            zh: <>当前推荐的密码哈希算法。新用户的密码用这个存。老用户可能还是 bcrypt 或 MD5-crypt（系统自动识别格式）。</>,
            en: <>Recommended modern password hashing. New users' passwords use this. Legacy users may still be bcrypt or MD5-crypt (system auto-detects format).</>,
          },
          {
            term: 'JWT (JSON Web Token)',
            zh: <>登录后存浏览器 cookie 里的加密令牌。包含 userId + roles。每次请求时后端解码以确认是谁。</>,
            en: <>Encrypted token stored in browser cookie after login. Contains userId + roles. Backend decodes on each request to identify who.</>,
          },
        ]}
      />

      {/* ---------- 8.6 Tech / Infra ---------- */}
      <SectionH3
        id="s-8-6"
        lang={lang}
        zh="8.6 技术 / 基础设施"
        en="8.6 Tech / Infrastructure"
      />
      <GlossaryList
        lang={lang}
        terms={[
          {
            term: 'Next.js',
            zh: <>本系统用的 React 框架。App Router 模式（即每个 URL 对应一个 page.tsx 文件）。版本 15。</>,
            en: <>The React framework powering this system. Uses App Router (each URL = a page.tsx file). Version 15.</>,
          },
          {
            term: 'Prisma',
            zh: <>数据库 ORM。代码里写 db.user.findFirst({'{...}'}) 这样的语法，Prisma 翻译成 SQL。schema 在 /prisma/schema.prisma。</>,
            en: <>Database ORM. Code writes things like db.user.findFirst({'{...}'}); Prisma translates to SQL. Schema at /prisma/schema.prisma.</>,
          },
          {
            term: 'PostgreSQL',
            zh: <>本系统的数据库。SQL 关系型数据库。Neon 提供托管。</>,
            en: <>The system's database. A SQL relational database. Hosted on Neon.</>,
          },
          {
            term: 'P2002 Error',
            zh: <>Prisma 抛的"唯一约束冲突"错误。常见原因：自增 ID 序列偏移。系统已部署 auto-fix 机制。看见这个先重试一次，再不行联系 Meng。</>,
            en: <>Prisma's "unique constraint violation" error. Common cause: auto-increment sequence drift. The system has auto-fix in place. On seeing this, retry once; if it persists, contact Meng.</>,
          },
          {
            term: 'Environment Variable (环境变量)',
            zh: <>不写在代码里的密钥/配置。在 Vercel Settings → Environment Variables 管理。改了会自动 redeploy。</>,
            en: <>Secrets/config not in code. Managed in Vercel Settings → Environment Variables. Changing one auto-redeploys.</>,
          },
          {
            term: 'Deploy (部署)',
            zh: <>把新代码送上 Vercel 生产环境。每次 main 分支 push 自动触发。也可在 Vercel 手动 redeploy。</>,
            en: <>Pushing new code to Vercel production. Auto-triggered on every main-branch push. Manual redeploy also possible in Vercel.</>,
          },
          {
            term: 'Rollback (回滚)',
            zh: <>把生产换回上一个稳定部署。Vercel Deployments 里 Promote to Production 即可。</>,
            en: <>Reverting production to a previous stable deploy. Done via Vercel Deployments → Promote to Production.</>,
          },
          {
            term: 'Pacific Time (PT) / UTC',
            zh: <>所有面向用户的日期都是 Pacific Time（CEAL 总部时区）。所有数据库时间戳都是 UTC。Cron 在 UTC 8:00 + 20:00 跑。</>,
            en: <>All user-facing dates are Pacific Time (CEAL HQ tz). All DB timestamps are UTC. Cron runs at UTC 8:00 + 20:00.</>,
          },
        ]}
      />

      {/* ---------- 8.7 People / Orgs ---------- */}
      <SectionH3
        id="s-8-7"
        lang={lang}
        zh="8.7 人与组织"
        en="8.7 People & Organizations"
      />
      <GlossaryList
        lang={lang}
        terms={[
          {
            term: 'CEAL',
            zh: <>Council on East Asian Libraries。全美东亚图书馆理事会。本系统的所有者。</>,
            en: <>Council on East Asian Libraries. The owner of this system.</>,
          },
          {
            term: 'Statistics Committee (统计委员会)',
            zh: <>CEAL 下设的委员会，负责本年度统计政策、表单字段、报告内容。Super Admin 通常向它汇报。</>,
            en: <>A CEAL committee setting annual statistics policy, form fields, and report content. Super Admin usually reports to it.</>,
          },
          {
            term: 'JEAL',
            zh: <>Journal of East Asian Libraries。CEAL 出版的学刊。本系统每年的统计报告会发表在 JEAL 2 月号上。</>,
            en: <>Journal of East Asian Libraries. CEAL's journal. The annual statistics report is published in the Feb issue.</>,
          },
          {
            term: 'Member Institution',
            zh: <>参与统计的会员机构。截至当前 100+ 家东亚图书馆，分布在北美。</>,
            en: <>Member institution participating in the statistics. Currently 100+ East-Asian libraries across North America.</>,
          },
          {
            term: 'Meng Qu',
            zh: <>本系统的主开发者，Miami University Web Service Librarian。<Code>qum@miamioh.edu</Code>。技术问题先找她。</>,
            en: <>Lead developer of this system, Miami University Web Service Librarian. <Code>qum@miamioh.edu</Code>. First contact for technical issues.</>,
          },
          {
            term: 'Miami University Libraries',
            zh: <>位于 Oxford, Ohio 的 Miami University 图书馆。其 Web Service Librarian Meng Qu 承担了 CEAL DB 系统的开发与维护。</>,
            en: <>Miami University Libraries, located in Oxford, Ohio. Its Web Service Librarian Meng Qu develops and maintains the CEAL DB system.</>,
          },
        ]}
      />

      {/* ---------- 8.8 Misc admin / page names ---------- */}
      <SectionH3
        id="s-8-8"
        lang={lang}
        zh="8.8 关键 URL"
        en="8.8 Key URLs"
      />
      <GlossaryList
        lang={lang}
        terms={[
          {
            term: '/admin',
            zh: <>管理员仪表盘。Super Admin 登录后第一站。看到红色 Toolkit 表示权限正常。</>,
            en: <>Admin dashboard. First stop after Super Admin login. The red Toolkit indicates proper privileges.</>,
          },
          {
            term: '/admin/survey-dates',
            zh: <>设置本年度 4 组关键日期（announcement / opening / reminder / closing）。改了会重排 ScheduledEvent。</>,
            en: <>Set this year's 4 key date sets (announcement / opening / reminder / closing). Changes reschedule ScheduledEvent rows.</>,
          },
          {
            term: '/admin/broadcast',
            zh: <>广播管理 + 紧急开关表单。Session Queue 看本年度所有 ScheduledEvent 状态。</>,
            en: <>Broadcast management + emergency open/close. Session Queue shows all ScheduledEvent statuses.</>,
          },
          {
            term: '/admin/email-templates',
            zh: <>编辑 4 种广播邮件模板。改了立刻生效（下次广播用新模板）。</>,
            en: <>Edit the 4 broadcast email templates. Changes take effect immediately (next broadcast uses new templates).</>,
          },
          {
            term: '/admin/users',
            zh: <>用户管理。新增 / 改角色 / 重置密码 / 删除 / 发"开表通知"邮件。</>,
            en: <>User management. Add / change role / reset password / delete / send "form open" notification.</>,
          },
          {
            term: '/admin/forms',
            zh: <>查看本年度所有机构 10 张表的提交状态总览。Active / Scheduled / Closed badge 在右上角。</>,
            en: <>Overview of all institutions × 10 forms × current year submission status. Active / Scheduled / Closed badge in the top right.</>,
          },
          {
            term: '/admin/year-end-reports',
            zh: <>导出年终报告（整年 Excel + 每机构 PDF）。提供给 Statistics Committee 用。</>,
            en: <>Export year-end reports (full-year Excel + per-institution PDF). Used by the Statistics Committee.</>,
          },
          {
            term: '/admin/participation-reports',
            zh: <>导出参与情况报告（哪些机构填了哪些没填）。</>,
            en: <>Export participation report (who submitted, who didn't).</>,
          },
          {
            term: '/admin/published-reports',
            zh: <>登记 JEAL 已发表的 PDF 链接。Member 在主页看到的"历史报告"列表是从这里来的。</>,
            en: <>Register JEAL-published PDF links. Members see the "historical reports" list on the homepage from here.</>,
          },
          {
            term: '/admin/audit-logs',
            zh: <>审计日志页。任何"谁动了什么"的疑问，先来这里搜。</>,
            en: <>Audit log page. For any "who touched what" question, search here first.</>,
          },
          {
            term: '/libraries',
            zh: <>所有机构概览页（Super Admin 视图）。3 个 tab：信息 / 参与状态 / 导出。Participation Status tab 有 Published 切换开关。</>,
            en: <>All-institutions overview (Super Admin view). 3 tabs: info / participation / export. The Participation tab has the Published toggle.</>,
          },
          {
            term: '/admin/superguide',
            zh: <>本指南页面。书签它。</>,
            en: <>This guide page. Bookmark it.</>,
          },
        ]}
      />

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '🎉 你已经读完了整本指南',
          en: '🎉 You finished the entire guide',
        }}
      >
        {lang === 'zh' ? (
          <>
            到这里，你已经掌握了：① 系统全貌；② 第一次登录怎么走；③ 年度循环每个月做什么；
            ④ 每个 admin 页面的用法；⑤ 自动 vs 手动；⑥ 排错；⑦ 安全 & 外部服务；
            ⑧ 检查清单；⑨ 术语表。任何一处忘了就回来翻——这一页是你的"手册"。
            <br />
            <br />
            遇到指南没覆盖的情况？把它记下来，下次更新时加进去。这本指南是活的。
          </>
        ) : (
          <>
            By now you have mastered: (1) the system as a whole; (2) the first
            login walkthrough; (3) what to do each month of the annual cycle;
            (4) how each admin page works; (5) automated vs manual tasks; (6)
            troubleshooting; (7) security & external services; (8) checklists;
            (9) glossary. Whenever you forget something, come back here — this
            page is your manual.
            <br />
            <br />
            Encountered a case the guide doesn't cover? Note it down and add it
            in the next update. This guide is meant to evolve.
          </>
        )}
      </Callout>

      <P
        lang={lang}
        zh={
          <>
            <strong>祝你顺利。</strong> 有疑问不要犹豫，先 Ctrl+F 搜索本指南；
            搜不到就发邮件给 <Code>qum@miamioh.edu</Code>。
          </>
        }
        en={
          <>
            <strong>Best of luck.</strong> When in doubt, Ctrl+F this guide
            first; if nothing matches, email <Code>qum@miamioh.edu</Code>.
          </>
        }
      />
    </div>
  )
}
