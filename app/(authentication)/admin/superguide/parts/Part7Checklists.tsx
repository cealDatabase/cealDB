'use client'

import React from 'react'
import {
  PartProps,
  SectionH2,
  SectionH3,
  P,
  Callout,
  Code,
  Checklist,
  PageLink,
} from './_shared'

export default function Part7Checklists({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-7"
        lang={lang}
        zh="第 7 部分 · 快速检查清单"
        en="Part 7 · Quick Checklists"
      />
      <P
        lang={lang}
        zh="把这一部分打印出来贴在桌上。每一份是一张可勾选的清单，对应年度循环里的一个关键节点。"
        en="Print this part and tape it to your desk. Each list is a printable checklist for a key point in the annual cycle."
      />

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '打印小贴士',
          en: 'Printing tip',
        }}
      >
        {lang === 'zh' ? (
          <>
            点页面右上角的 <strong>Print 按钮</strong>，浏览器会以打印友好的方式渲染整个指南
            （隐藏侧边栏、目录、按钮）。如果你只想打印这一部分，先滚动到 7.1，
            浏览器打印对话框里选 "Selection / 选区" 就只打这一部分。
          </>
        ) : (
          <>
            Click the <strong>Print button</strong> in the top-right — the
            browser renders the whole guide print-friendly (sidebar / nav /
            buttons hidden). To print just this part, scroll to 7.1 first, then
            in the browser print dialog choose "Selection".
          </>
        )}
      </Callout>

      {/* ---------- 7.1 30 days before ---------- */}
      <SectionH3
        id="s-7-1"
        lang={lang}
        zh="7.1 ✅ 学年开始前 30 天清单"
        en="7.1 ✅ 30 Days Before Cycle Starts"
      />
      <P
        lang={lang}
        zh="9 月初前完成。让你在 10/1 自动开表前一切准备就绪。"
        en="Complete by early September. Ensures everything is ready before 10/1 auto-opens."
      />
      <Checklist
        lang={lang}
        items={[
          {
            zh: '已与统计委员会会议确认本年度的 opening / closing / fiscal year / publication 日期',
            en: 'Confirmed this year\'s opening / closing / fiscal year / publication dates with Statistics Committee',
          },
          {
            zh: '能登录 cealstats.org，且 /admin 页面看得到红色 "Super Admin Toolkit"',
            en: 'Can log in to cealstats.org and see the red "Super Admin Toolkit" on /admin',
          },
          {
            zh: '能登录 Vercel Dashboard，看到 cealDB project',
            en: 'Can log in to Vercel Dashboard and see the cealDB project',
          },
          {
            zh: '能登录 Resend Dashboard，看到 cealstats.org domain 是 verified',
            en: 'Can log in to Resend Dashboard and see cealstats.org domain as verified',
          },
          {
            zh: '能登录 Neon Console，看到生产 database',
            en: 'Can log in to Neon Console and see the production database',
          },
          {
            zh: '知道 Meng Qu 的联系方式（qum@miamioh.edu），并已发邮件 say hi',
            en: "Have Meng Qu's contact info (qum@miamioh.edu) and have emailed to say hi",
          },
          {
            zh: '已在 /libraries 检查机构清单：确认本年度参与机构没有漏的或新加的',
            en: 'Reviewed institution list in /libraries: confirm no missing or new participants for this year',
          },
          {
            zh: '已在 /admin/users 抽查用户数：每个机构至少有 1 个 active 联系人',
            en: 'Spot-checked user count in /admin/users: each institution has at least 1 active contact',
          },
          {
            zh: '已检查上一年度的 SurveySession（在 /admin/broadcast Session Queue 看），notifiedOnOpen / notifiedOnClose 都是 true（说明去年正常关）',
            en: 'Checked last year\'s SurveySession (via /admin/broadcast Session Queue): notifiedOnOpen / notifiedOnClose both true (last year closed cleanly)',
          },
          {
            zh: '已在 /admin/email-templates 预览所有 4 个模板，确认日期占位符渲染出来是本年度',
            en: 'Previewed all 4 templates in /admin/email-templates, confirmed date placeholders render this year correctly',
          },
          {
            zh: '已设置日历提醒：10/1 开表当天 / 11/25 提醒邮件 / 12/2 关表 / 1/15 报告交稿 / 2/15 上传 PDF',
            en: 'Set calendar reminders: 10/1 opening / 11/25 reminder email / 12/2 closing / 1/15 report submission / 2/15 PDF upload',
          },
          {
            zh: '已在 /admin/survey-dates 输入今年 4 组日期，并确认所有 Library_Year 状态为 Scheduled',
            en: 'Entered this year\'s 4 date sets in /admin/survey-dates and confirmed all Library_Year statuses are Scheduled',
          },
          {
            zh: '在 /admin/broadcast 用 broadcast_announcement 模板发了"将于 10/1 开放"的预公告',
            en: 'Sent "will open on 10/1" pre-announcement using broadcast_announcement template via /admin/broadcast',
          },
        ]}
      />

      {/* ---------- 7.2 Opening Day ---------- */}
      <SectionH3
        id="s-7-2"
        lang={lang}
        zh="7.2 ✅ 开表当天清单（10 月 1 日）"
        en="7.2 ✅ Opening Day (October 1)"
      />
      <P
        lang={lang}
        zh="当天上午（开表后几小时内）要做的检查。"
        en="Checks to do that morning (within hours of auto-open)."
      />
      <Checklist
        lang={lang}
        items={[
          {
            urgent: true,
            zh: '检查自己邮箱：收到 broadcast_open_forms 邮件',
            en: 'Check your own inbox: received the broadcast_open_forms email',
          },
          {
            urgent: true,
            zh: '访问 /admin/forms，确认 badge 由蓝色 Scheduled 变为绿色 Active',
            en: 'Visit /admin/forms — badge flipped from blue Scheduled to green Active',
          },
          {
            zh: '访问 /admin/broadcast → Session Queue，FORM_OPENING 事件状态为 completed',
            en: '/admin/broadcast → Session Queue: FORM_OPENING event is completed',
          },
          {
            zh: '访问 /admin/audit-logs，最上面有一条 SYSTEM_OPEN_FORMS 记录（system 用户 ID=0）',
            en: '/admin/audit-logs: top row is SYSTEM_OPEN_FORMS (system user ID=0)',
          },
          {
            zh: 'Resend Dashboard → Broadcasts：本年度 broadcast_open_forms 状态为 sent',
            en: 'Resend Dashboard → Broadcasts: this year\'s broadcast_open_forms status is sent',
          },
          {
            zh: '在 /libraries → Participation Status 用本年度年份过滤，确认所有机构 Library_Year 都已就绪',
            en: '/libraries → Participation Status, filter by current year, confirm all institutions have Library_Year ready',
          },
          {
            zh: '回复几个用户来询的"我登录不了"问题（用 Forgot Password 引导他们）',
            en: 'Reply to a few "I cannot log in" inquiries (point them to Forgot Password)',
          },
          {
            zh: '在 CEAL 邮件列表 / Slack 上发一条非正式提醒"今天是开表日"',
            en: 'Post an informal "Forms are open today" reminder to CEAL email list / Slack',
          },
        ]}
      />

      {/* ---------- 7.3 After closing ---------- */}
      <SectionH3
        id="s-7-3"
        lang={lang}
        zh="7.3 ✅ 关表后清单（12 月 3 日开始）"
        en="7.3 ✅ After Closing (starting Dec 3)"
      />
      <P
        lang={lang}
        zh="关表后两周内的工作。"
        en="Work to do within two weeks after closing."
      />
      <Checklist
        lang={lang}
        items={[
          {
            urgent: true,
            zh: '收到 SYSTEM_CLOSE_FORMS 通知邮件 + 访问 /admin/audit-logs 验证 SYSTEM_CLOSE_FORMS 已记录',
            en: 'Received SYSTEM_CLOSE_FORMS notify email + /admin/audit-logs shows SYSTEM_CLOSE_FORMS entry',
          },
          {
            urgent: true,
            zh: '/admin/forms badge 显示红色 Closed',
            en: '/admin/forms badge shows red Closed',
          },
          {
            zh: '访问 /libraries → Participation Status，列出 X 家机构有空白表单',
            en: '/libraries → Participation Status: list institutions with blank forms',
          },
          {
            zh: '给空白机构发邮件：① 直接联系机构联系人；② 询问是否需要延期',
            en: 'Email institutions with blanks: (1) contact directly; (2) ask if extension needed',
          },
          {
            zh: '对每个延期的机构，决定用 Option A（替他改）或 Option B（短暂重开）补救',
            en: 'For each extension, decide between Option A (edit for them) or Option B (briefly re-open)',
          },
          {
            zh: '若用 Option B 重开了，机构改完后立刻去 /admin/broadcast 点 Close All Forms NOW',
            en: 'If Option B was used, immediately Close All Forms NOW in /admin/broadcast after the library finishes',
          },
          {
            zh: '在 /admin/reports 查异常数据（与上一年对比 3 倍以上变化的）',
            en: '/admin/reports: check anomalous data (3x+ change from last year)',
          },
          {
            zh: '联系异常机构核实数字',
            en: 'Contact those institutions to verify numbers',
          },
          {
            zh: '在 /admin/participation-reports 导出本年度参与情况，发给统计委员会',
            en: '/admin/participation-reports: export participation report, send to Statistics Committee',
          },
          {
            zh: '在 /admin/year-end-reports 导出所有 supplementary reports（Excel + PDF）',
            en: '/admin/year-end-reports: export all supplementary reports (Excel + PDF)',
          },
        ]}
      />

      {/* ---------- 7.4 After JEAL Publication ---------- */}
      <SectionH3
        id="s-7-4"
        lang={lang}
        zh="7.4 ✅ JEAL 发布后清单（2 月）"
        en="7.4 ✅ After JEAL Publication (February)"
      />
      <Checklist
        lang={lang}
        items={[
          {
            urgent: true,
            zh: '在 /admin/published-reports 添加新 PDF 链接：academic_year, title, URL, journal, is_published=true',
            en: '/admin/published-reports: add new PDF link with academic_year, title, URL, journal, is_published=true',
          },
          {
            urgent: true,
            zh: '在 /libraries → Participation Status 切到本年度，编辑模式，所有机构 Published 开关打开 → Save',
            en: '/libraries → Participation Status: switch to this year, edit mode, toggle Published on for every institution → Save',
          },
          {
            zh: '在首页和 /admin/reports 验证 Member 用户能看到本年度数据',
            en: 'Verify on homepage and /admin/reports that Members can now see this year\'s data',
          },
          {
            zh: '通知 CEAL 邮件列表：报告已发表，附 JEAL 链接',
            en: 'Notify CEAL mailing list: report published, include JEAL link',
          },
          {
            zh: '更新本指南或私人笔记：把本年度的特殊情况记下来（哪个机构延期了、哪个数据后改了）',
            en: 'Update this guide or your private notes: document this year\'s special cases (which library extended, which data was patched)',
          },
        ]}
      />

      {/* ---------- 7.5 Emergencies ---------- */}
      <SectionH3
        id="s-7-5"
        lang={lang}
        zh="7.5 🚨 紧急情况清单"
        en="7.5 🚨 Emergency Checklist"
      />
      <P
        lang={lang}
        zh={
          <>
            按"先做这件事，再做下一件"的顺序。<strong>不要慌</strong>，所有数据都有审计日志和 7 天 Neon 历史。
          </>
        }
        en={
          <>
            In "do this first, then next" order. <strong>Don't panic</strong> — all data has audit logs and 7-day Neon history.
          </>
        }
      />

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '🔴 整个网站打不开',
          en: '🔴 Whole site is down',
        }}
      >
        <ol className="list-decimal list-inside space-y-1 mt-1 text-sm">
          {lang === 'zh' ? (
            <>
              <li>检查 vercel.com/status 是否有 incident</li>
              <li>试试不同设备 / 不同网络（确认不是你这边问题）</li>
              <li>登录 Vercel Dashboard → Deployments，最新一次部署是 Failed？</li>
              <li>是的话，找前一个 Ready 状态的部署，"..." → Promote to Production 回滚</li>
              <li>不是的话，立刻邮件 Meng：<Code>qum@miamioh.edu</Code></li>
              <li>同时在 CEAL 邮件列表发紧急通知"系统暂时不可用，正在修复"</li>
            </>
          ) : (
            <>
              <li>Check vercel.com/status for incidents</li>
              <li>Test on different device / network (confirm it's not your end)</li>
              <li>Vercel Dashboard → Deployments: latest one Failed?</li>
              <li>If yes, find previous Ready deploy, "..." → Promote to Production to roll back</li>
              <li>If no, email Meng immediately: <Code>qum@miamioh.edu</Code></li>
              <li>Send emergency note to CEAL list: "system temporarily down, being fixed"</li>
            </>
          )}
        </ol>
      </Callout>

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '🔴 数据被改坏 / 大批数据丢失',
          en: '🔴 Data corrupted / mass data loss',
        }}
      >
        <ol className="list-decimal list-inside space-y-1 mt-1 text-sm">
          {lang === 'zh' ? (
            <>
              <li>不要再做任何改动</li>
              <li>截图损坏的画面 + 记下时间</li>
              <li>查 /admin/audit-logs 找最近的 UPDATE 看 before JSON</li>
              <li>邮件 Meng：附时间戳 + 想恢复到哪个时间点</li>
              <li>Neon 7 天 PITR 能恢复，但需要开发者操作</li>
              <li>恢复期间该机构表单暂时只读</li>
            </>
          ) : (
            <>
              <li>Stop making any further changes</li>
              <li>Screenshot the broken view + note the time</li>
              <li>Search /admin/audit-logs for recent UPDATE, inspect before JSON</li>
              <li>Email Meng: include timestamp + target restore point</li>
              <li>Neon 7-day PITR can restore but needs developer to execute</li>
              <li>During restore, that institution's form is temporarily read-only</li>
            </>
          )}
        </ol>
      </Callout>

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '🟠 关表日 cron 没跑',
          en: '🟠 Closing-day cron did not run',
        }}
      >
        <ol className="list-decimal list-inside space-y-1 mt-1 text-sm">
          {lang === 'zh' ? (
            <>
              <li>访问 /admin/broadcast 立刻点 Close All Forms NOW（手动关）</li>
              <li>这会把所有 is_open_for_editing 设为 false</li>
              <li>检查审计日志确认有 SYSTEM_CLOSE_FORMS 记录（手动也会写）</li>
              <li>若广播未发：手动 Send Broadcast NOW，选合适模板</li>
              <li>邮件 Meng 报告 cron 故障，留作下次修复参考</li>
            </>
          ) : (
            <>
              <li>Go to /admin/broadcast and click Close All Forms NOW immediately (manual close)</li>
              <li>That sets all is_open_for_editing to false</li>
              <li>Verify audit log has SYSTEM_CLOSE_FORMS (manual writes one too)</li>
              <li>If broadcast not sent: Send Broadcast NOW with appropriate template</li>
              <li>Email Meng about the cron failure for follow-up fix</li>
            </>
          )}
        </ol>
      </Callout>

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '🟠 Resend / Neon API key 突然失效',
          en: '🟠 Resend / Neon API key suddenly invalid',
        }}
      >
        <ol className="list-decimal list-inside space-y-1 mt-1 text-sm">
          {lang === 'zh' ? (
            <>
              <li>登录对应 Dashboard 生成新 key</li>
              <li>邮件 Meng：附新 key + 让她更新 Vercel 环境变量并触发 redeploy</li>
              <li>恢复后用 /admin/broadcast Send Broadcast NOW 测试一封</li>
              <li>检查 Resend Dashboard 确认 sent</li>
            </>
          ) : (
            <>
              <li>Log into the respective Dashboard, generate new key</li>
              <li>Email Meng: include new key + ask her to update Vercel env var and trigger redeploy</li>
              <li>After fix, test with /admin/broadcast Send Broadcast NOW</li>
              <li>Check Resend Dashboard for sent confirmation</li>
            </>
          )}
        </ol>
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
            把这一部分打印出来贴在桌上。读完{' '}
            <PageLink href="#part-8">
              第 8 部分（术语表）
            </PageLink>{' '}
            就是你完整的指南了。
          </>
        ) : (
          <>
            Print this part and tape it to your desk. After reading{' '}
            <PageLink href="#part-8">Part 8 (Glossary)</PageLink> you have the
            complete guide.
          </>
        )}
      </Callout>
    </div>
  )
}
