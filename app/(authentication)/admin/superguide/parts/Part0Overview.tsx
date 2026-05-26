'use client'

import React from 'react'
import {
  PartProps,
  SectionH2,
  SectionH3,
  P,
  Callout,
  Code,
  GuideTable,
  RoleBadge,
} from './_shared'

export default function Part0Overview({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-0"
        lang={lang}
        zh="第 0 部分 · 系统总览"
        en="Part 0 · System Overview"
      />

      <P
        lang={lang}
        zh="这一部分给你一个高层次的全貌：CEAL Statistics Database 是什么、谁在用、一年里大致发生什么、它依赖哪些外部服务。读完这一部分,你应该能在心里画出整个系统的全景图。"
        en="This part gives you the bird's-eye view: what CEAL Statistics Database is, who uses it, what happens during a typical year, and which external services it depends on. After reading this, you should be able to mentally picture the whole system."
      />

      {/* ---------- 0.1 What is CEAL DB ---------- */}
      <SectionH3
        id="s-0-1"
        lang={lang}
        zh="0.1 CEAL 数据库是什么"
        en="0.1 What is the CEAL Database"
      />

      <P
        lang={lang}
        zh={
          <>
            <strong>CEAL Statistics Database</strong>（运行在
            <Code>https://cealstats.org</Code>）是北美东亚图书馆委员会（Council on East Asian Libraries, CEAL）的
            <strong>年度统计调查系统</strong>。每年约 60-70 所成员图书馆把它们当年关于中、日、韩文（CJK）馆藏、采访、人员、电子资源等的统计数据，通过这个系统提交。然后由 Super Admin（你）汇总，生成
            <strong>年终报告（Year-End Report）</strong>，发布在
            <em>Journal of East Asian Libraries (JEAL)</em> 上，作为整个东亚馆界一年的"年鉴"。
          </>
        }
        en={
          <>
            <strong>CEAL Statistics Database</strong> (hosted at{' '}
            <Code>https://cealstats.org</Code>) is the{' '}
            <strong>annual statistical survey system</strong> for the Council on
            East Asian Libraries (CEAL) in North America. Each year about 60-70
            member libraries submit their statistics — holdings, acquisitions,
            personnel, electronic resources — for Chinese, Japanese, and Korean
            (CJK) materials. The Super Admin (you) compiles them into a{' '}
            <strong>Year-End Report</strong> published in the{' '}
            <em>Journal of East Asian Libraries (JEAL)</em>, serving as the
            annual record of the entire East Asian library community.
          </>
        }
      />

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '这本指南是写给谁看的',
          en: 'Who this guide is for',
        }}
      >
        {lang === 'zh' ? (
          <>
            这本指南假设你是一位
            <strong>东亚图书馆员，刚刚接手 Super Admin 这个角色</strong>，你
            <strong>不需要</strong>会写代码。你只需要会用浏览器、会读邮件、会点按钮。
            遇到真正的技术问题（数据库挂了、域名失效），看
            <strong>第 5 部分（故障排查）</strong>和<strong>第 6 部分（外部服务）</strong>找到要联系的人。
          </>
        ) : (
          <>
            This guide assumes you are an{' '}
            <strong>
              East Asian librarian who has just inherited the Super Admin role
            </strong>
            . You <strong>do not need to write code</strong>. You only need to
            use a browser, read emails, and click buttons. For real technical
            issues (database down, domain expired), see{' '}
            <strong>Part 5 (Troubleshooting)</strong> and{' '}
            <strong>Part 6 (External Services)</strong> for whom to contact.
          </>
        )}
      </Callout>

      <SectionH3
        id="s-0-1-tech"
        lang={lang}
        zh="0.1.1 它在技术上是什么"
        en="0.1.1 What it is technically"
      />

      <P
        lang={lang}
        zh={
          <>
            技术上，这是一个用 Next.js（一种流行的 React Web 框架）构建的网站，部署在 Vercel（云托管平台）上，数据存在 Neon（云 PostgreSQL 数据库）里，邮件通过 Resend 服务发送。
            <strong>但作为 Super Admin 你不需要懂这些。</strong>
            你的工作只是在网站的 <Code>/admin</Code> 区域点按钮、设置日期、监控状态。
          </>
        }
        en={
          <>
            Technically, it is a website built with Next.js (a popular React web
            framework), deployed on Vercel (a cloud hosting platform), with data
            stored in Neon (a cloud PostgreSQL database), and emails sent via
            Resend.{' '}
            <strong>
              But as Super Admin you do not need to understand any of this.
            </strong>{' '}
            Your job is just to click buttons, set dates, and monitor status in
            the <Code>/admin</Code> area of the website.
          </>
        }
      />

      {/* ---------- 0.2 Four roles ---------- */}
      <SectionH3
        id="s-0-2"
        lang={lang}
        zh="0.2 四种用户角色"
        en="0.2 Four User Roles"
      />

      <P
        lang={lang}
        zh="系统里一共只有四种角色。每个用户可以同时拥有多个角色（在数据库中是 Users_Roles 这张关联表）。理解这四种角色的权限差异，是理解整个系统行为的基础。"
        en="The system has exactly four roles. A user can have multiple roles simultaneously (stored in the Users_Roles join table). Understanding the differences in their permissions is the foundation for understanding all system behavior."
      />

      <div className="my-4 flex flex-wrap gap-2">
        <RoleBadge id={1} lang={lang} />
        <RoleBadge id={2} lang={lang} />
        <RoleBadge id={3} lang={lang} />
        <RoleBadge id={4} lang={lang} />
      </div>

      <GuideTable
        lang={lang}
        headers={[
          { zh: '角色 ID', en: 'Role ID' },
          { zh: '内部名称', en: 'Internal Name' },
          { zh: '可以做什么', en: 'What they can do' },
        ]}
        rows={[
          [
            { zh: '1', en: '1' },
            { zh: 'ROLE_ADMIN（Super Admin）', en: 'ROLE_ADMIN (Super Admin)' },
            {
              zh: '全权：开关表、发邮件、改任何机构的数据、管理用户、发布年份、看审计日志。关表后仍能编辑（特权）。',
              en: 'Full access: open/close forms, send emails, edit any library data, manage users, publish years, view audit logs. Can still edit after close (privileged).',
            },
          ],
          [
            { zh: '2', en: '2' },
            {
              zh: 'ROLE_MEMBER（成员机构）',
              en: 'ROLE_MEMBER (Member Institution)',
            },
            {
              zh: '只能查看/编辑自己机构本年的表单。关表后只读。看不到其他机构的数据。',
              en: 'Can only view/edit their own institution\'s current-year forms. Read-only after close. Cannot see other institutions\' data.',
            },
          ],
          [
            { zh: '3', en: '3' },
            {
              zh: 'ROLE_ERESOURCE_EDITOR（电子资源编辑者）',
              en: 'ROLE_ERESOURCE_EDITOR (E-Resource Editor)',
            },
            {
              zh: '类似 Member，但可以编辑全局的 AV/EBook/EJournal 资源列表（List_AV/EBook/EJournal）。通常给 1-2 位负责整理电子资源元数据的志愿者。',
              en: 'Like Member, but can edit the global AV/EBook/EJournal resource lists (List_AV/EBook/EJournal). Usually given to 1-2 volunteers who curate e-resource metadata.',
            },
          ],
          [
            { zh: '4', en: '4' },
            {
              zh: 'ROLE_ADMIN_ASSISTANT（助理管理员）',
              en: 'ROLE_ADMIN_ASSISTANT (Assistant Admin)',
            },
            {
              zh: '协助 Super Admin 的角色：可以查看本指南、新建用户和图书馆，但不能开关表、不能发广播。给值得信赖的助理或副手。',
              en: 'Helper role for Super Admin: can view this guide, create users and libraries, but cannot open/close forms or send broadcasts. For trusted deputies.',
            },
          ],
        ]}
      />

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '常见误解：每个 Role 都是独立的',
          en: 'Common misconception: roles stack, not replace',
        }}
      >
        {lang === 'zh' ? (
          <>
            一个用户被赋予 <Code>[1, 3]</Code> 表示他<strong>同时</strong>是
            Super Admin <strong>和</strong> E-Resource Editor，权限取
            <strong>并集</strong>。系统里 Cookie 中的 <Code>role</Code> 字段是个 JSON 数组（如
            <Code>{'["1","3"]'}</Code>）。一些页面用 <Code>userRoles.length === 1 && userRoles[0] === "2"</Code> 这种判断来识别"<strong>纯粹的 Member</strong>"，因此给 Member 兼 Editor 不会让他失去 Editor 权限。
          </>
        ) : (
          <>
            A user with <Code>[1, 3]</Code> is{' '}
            <strong>both Super Admin and E-Resource Editor at the same time</strong> — permissions are the <strong>union</strong>. The <Code>role</Code> cookie stores a JSON array (e.g. <Code>{'["1","3"]'}</Code>). Some pages
            check <Code>userRoles.length === 1 && userRoles[0] === "2"</Code> to identify a "<strong>pure Member</strong>", so giving a Member additional Editor role won't strip the Editor access.
          </>
        )}
      </Callout>

      {/* ---------- 0.3 Annual cycle at a glance ---------- */}
      <SectionH3
        id="s-0-3"
        lang={lang}
        zh="0.3 一年节奏速览（一张图就懂）"
        en="0.3 Annual Cycle at a Glance (one diagram)"
      />

      <P
        lang={lang}
        zh="这是 CEAL 数据库一年的标准节奏。第 2 部分会按月详细说每一步该做什么，这里先有个整体印象。"
        en="This is the standard annual rhythm of the CEAL Database. Part 2 walks through every step month by month — here is the overall impression first."
      />

      <div className="my-6 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 overflow-x-auto">
        <pre className="text-xs leading-6 font-mono whitespace-pre text-gray-800">
{`  ┌─────────────────────────────────────────────────────────────┐
  │  ${lang === 'zh' ? '夏天（8 月）' : 'Summer (August)        '}    │  ${lang === 'zh' ? '召开统计委员会会议，决定本年度日期' : 'Statistics Committee meeting, decide annual dates'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  ${lang === 'zh' ? '9 月中旬       ' : 'Mid-September         '}    │  /admin/survey-dates    ${lang === 'zh' ? '→ 设置开/关日期' : '→ Set open/close dates'}
  │                                       │  /admin/email-templates ${lang === 'zh' ? '→ 检查邮件模板' : '→ Review email templates'}
  │                                       │  /admin/broadcast       ${lang === 'zh' ? '→ 发"将于...开放"公告' : '→ Send "will open..." announcement'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  ⏰ ${lang === 'zh' ? '10 月 1 日（默认）' : 'October 1 (default)   '} │  🤖 Cron ${lang === 'zh' ? '自动开表 + 自动广播邮件给所有用户' : 'auto-opens forms + sends broadcast to all users'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  ${lang === 'zh' ? '10-11 月        ' : 'Oct-Nov               '}    │  ${lang === 'zh' ? '机构填表中。你监控 /libraries 参与情况。' : 'Institutions fill forms. You monitor /libraries.'}
  │                                       │  ${lang === 'zh' ? '回复邮件求助，必要时手动重发开表通知给个别用户。' : 'Reply to help requests, manually resend opening email to individuals if needed.'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  ⏰ ${lang === 'zh' ? '11 月底（关闭前 7 天）' : 'Late Nov (T-7 days)'}    │  🤖 Cron ${lang === 'zh' ? '自动发"还有一周关闭"提醒邮件' : 'auto-sends "1 week to closing" reminder'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  ⏰ ${lang === 'zh' ? '12 月 2 日（默认）' : 'December 2 (default) '} │  🤖 Cron ${lang === 'zh' ? '自动关表 + 仅通知 Super Admin' : 'auto-closes forms + notifies Super Admin only'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  ${lang === 'zh' ? '12 月          ' : 'December              '}    │  ${lang === 'zh' ? '审核数据，补救漏交的机构（Super Admin 可继续编辑）' : 'Review data, patch missing institutions (Super Admin can still edit)'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  ${lang === 'zh' ? '1 月            ' : 'January               '}    │  /admin/year-end-reports ${lang === 'zh' ? '→ 导出 Excel/PDF' : '→ Export Excel/PDF'}
  │                                       │  ${lang === 'zh' ? '→ 发给 JEAL 编辑出版' : '→ Send to JEAL editor for publication'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  ${lang === 'zh' ? '2 月（JEAL 出版后）' : 'February (after JEAL) '} │  /admin/published-reports ${lang === 'zh' ? '→ 上传 PDF 链接' : '→ Upload PDF link'}
  │                                       │  /libraries → Participation ${lang === 'zh' ? '→ 标记 Published' : '→ Mark Published'}
  └─────────────────────────────────────────────────────────────┘
                            ↓
                  ${lang === 'zh' ? '← 回到上面，开始下一年 →' : '← Back to top, next year →'}`}
        </pre>
      </div>

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '关键洞察',
          en: 'Key insight',
        }}
      >
        {lang === 'zh' ? (
          <>
            标 🤖 <strong>Cron</strong> 的步骤是 <strong>Vercel 服务器每天自动跑两次</strong>（美东 4am 和 4pm），你
            <strong>不需要</strong>手动做。你的责任只有：① 9 月把日期设好；② 10-12 月监控；
            ③ 12-1 月审核数据并生成报告；④ 2 月把出版的 PDF 链接放上去。整个一年你
            <strong>不需要写一行代码</strong>。
          </>
        ) : (
          <>
            Steps marked 🤖 <strong>Cron</strong> are{' '}
            <strong>run automatically by Vercel servers twice a day</strong>{' '}
            (4am and 4pm Eastern). You <strong>do not need to do them manually</strong>. Your responsibilities are
            only: (1) set dates in September; (2) monitor in Oct-Dec; (3) review
            data and generate reports in Dec-Jan; (4) upload published PDF link
            in Feb. You will not need to write a single line of code all year.
          </>
        )}
      </Callout>

      {/* ---------- 0.4 External services ---------- */}
      <SectionH3
        id="s-0-4"
        lang={lang}
        zh="0.4 外部服务关系图"
        en="0.4 External Services Diagram"
      />

      <P
        lang={lang}
        zh="网站本身只是一个外壳，它依赖以下几个外部服务才能跑起来。任何一个挂掉都会影响系统的某一部分。"
        en="The website itself is only a shell. It relies on the following external services to function. If any one goes down, some part of the system will be affected."
      />

      <div className="my-6 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 overflow-x-auto">
        <pre className="text-xs leading-6 font-mono whitespace-pre text-gray-800">
{`                  ┌──────────────────────┐
                  │   USER'S BROWSER     │
                  │  (librarian / admin) │
                  └──────────┬───────────┘
                             │ HTTPS
                             ▼
              ┌─────────────────────────────────┐
              │  cealstats.org (domain)         │
              │  ${lang === 'zh' ? '→ DNS 解析到 Vercel' : '→ DNS points to Vercel'}            │
              └─────────────────┬───────────────┘
                                │
                                ▼
         ┌────────────────────────────────────────────┐
         │   VERCEL  (${lang === 'zh' ? '托管 Next.js 应用' : 'hosts Next.js app'})           │
         │   • ${lang === 'zh' ? '运行所有页面和 API 路由' : 'Runs all pages and API routes'}            │
         │   • ${lang === 'zh' ? 'Cron Jobs: 每天 8am / 8pm UTC 自动跑' : 'Cron Jobs: runs auto at 8am/8pm UTC daily'}  │
         └──────┬─────────────────────┬───────────────┘
                │                     │
                ▼                     ▼
      ┌──────────────────┐  ┌──────────────────────┐
      │  NEON            │  │  RESEND              │
      │  (PostgreSQL DB) │  │  (Email Service)     │
      │  • ${lang === 'zh' ? '存所有数据' : 'Stores all data'} │  │  • ${lang === 'zh' ? '发广播邮件' : 'Sends broadcasts'}  │
      │  • ${lang === 'zh' ? 'Library_Year' : 'Library_Year'}     │  │  • ${lang === 'zh' ? '发密码邮件' : 'Sends password mail'}  │
      │  • ${lang === 'zh' ? '审计日志等' : 'Audit log, etc'}     │  │  • ${lang === 'zh' ? '订阅者管理' : 'Audience mgmt'}    │
      └──────────────────┘  └──────────────────────┘`}
        </pre>
      </div>

      <GuideTable
        lang={lang}
        headers={[
          { zh: '服务', en: 'Service' },
          { zh: '用途', en: 'Purpose' },
          { zh: '挂了会发生什么', en: 'What happens if it goes down' },
        ]}
        rows={[
          [
            { zh: 'Vercel', en: 'Vercel' },
            {
              zh: '托管整个网站，跑所有页面和 API。也跑 cron 任务（每天 8am/8pm UTC）。',
              en: 'Hosts the whole website, runs all pages and APIs. Also runs cron jobs (8am/8pm UTC daily).',
            },
            {
              zh: '🔴 整个网站打不开。立刻联系开发者。',
              en: '🔴 Whole site goes offline. Contact developer immediately.',
            },
          ],
          [
            { zh: 'Neon', en: 'Neon' },
            {
              zh: '云 PostgreSQL 数据库。存所有用户、图书馆、表单数据、审计日志。',
              en: 'Cloud PostgreSQL database. Stores all users, libraries, form data, audit logs.',
            },
            {
              zh: '🔴 页面能打开但所有功能报错。Neon 偶尔有免费层"睡眠"问题——刷新几次通常会自己醒。',
              en: '🔴 Pages load but every feature errors out. Neon free-tier may "sleep" — refresh a few times and it usually wakes up.',
            },
          ],
          [
            { zh: 'Resend', en: 'Resend' },
            {
              zh: '邮件发送服务。所有自动/手动邮件都通过它。Audience 管理订阅者名单。',
              en: 'Email sending service. All auto/manual emails go through it. Audience manages subscriber list.',
            },
            {
              zh: '🟡 网站正常但发不出邮件。用户收不到登录/广播。检查 RESEND_API_KEY 是否过期。',
              en: '🟡 Site works but no emails sent. Users can\'t get login/broadcast. Check if RESEND_API_KEY expired.',
            },
          ],
          [
            { zh: '域名 cealstats.org', en: 'Domain cealstats.org' },
            {
              zh: '域名注册。每年续费。DNS 指向 Vercel。',
              en: 'Domain registration. Renewed yearly. DNS points to Vercel.',
            },
            {
              zh: '🔴 网站打不开（DNS 解析失败）。检查域名注册商续费状态。',
              en: '🔴 Site unreachable (DNS fails). Check renewal status with registrar.',
            },
          ],
          [
            { zh: 'GitHub', en: 'GitHub' },
            {
              zh: '存放源代码。Vercel 自动从 GitHub 部署。',
              en: 'Source code repository. Vercel auto-deploys from GitHub.',
            },
            {
              zh: '🟢 不影响生产运行，只影响开发者改代码。',
              en: '🟢 Does not affect production, only affects developers making changes.',
            },
          ],
        ]}
      />

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '账号所有权很重要',
          en: 'Account ownership is critical',
        }}
      >
        {lang === 'zh' ? (
          <>
            上面这五个服务的账号——Vercel、Neon、Resend、域名注册商、GitHub——的
            <strong>登录凭据和组织管理员权限</strong>必须由 CEAL 组织持有，<strong>而不是任何一个个人</strong>。如果上一任 Super Admin 离任时没有把所有权移交给你（或 CEAL 委员会），你
            <strong>第一件事就是要把这件事搞清楚</strong>。详情见第 1 部分。
          </>
        ) : (
          <>
            <strong>Login credentials and organization-admin rights</strong> for
            all five services above — Vercel, Neon, Resend, domain registrar,
            GitHub — <strong>must be owned by CEAL the organization</strong>,
            not any one individual. If the previous Super Admin left without
            transferring ownership to you (or the CEAL committee),{' '}
            <strong>this is the first thing you must sort out</strong>. See Part
            1 for details.
          </>
        )}
      </Callout>
    </div>
  )
}
