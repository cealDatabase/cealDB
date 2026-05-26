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
  StepCard,
  GuideTable,
  Checklist,
  PageLink,
} from './_shared'

export default function Part1GettingStarted({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-1"
        lang={lang}
        zh="第 1 部分 · 上手准备"
        en="Part 1 · Getting Started"
      />

      <P
        lang={lang}
        zh="如果你是刚刚被任命为 CEAL Super Admin，那么在你能开始正常工作之前，必须先完成本部分列出的几件事。否则到年度循环开始时你会发现自己缺凭据、缺数据、不知道找谁。"
        en="If you have just been appointed as the CEAL Super Admin, you must complete the items in this section before you can do your job effectively. Otherwise, when the annual cycle begins, you'll find yourself missing credentials, missing data, and not knowing whom to contact."
      />

      {/* ---------- 1.1 What to ask the predecessor ---------- */}
      <SectionH3
        id="s-1-1"
        lang={lang}
        zh="1.1 接手时该向前任 Super Admin 索取什么"
        en="1.1 What to Get from the Outgoing Super Admin"
      />

      <P
        lang={lang}
        zh="这是一份移交清单。理想情况下你和前任应当面或视频会议过一遍。把每一项确认到手再签字接手。"
        en="This is a handover checklist. Ideally you and the outgoing admin should go through it together (in-person or video call). Confirm each item before formally taking over."
      />

      <Checklist
        lang={lang}
        items={[
          {
            urgent: true,
            zh: '你自己的 cealstats.org 账号已被赋予 Super Admin 角色（Role ID 1），能登录 /admin。',
            en: 'Your own cealstats.org account has been given the Super Admin role (Role ID 1) and can log into /admin.',
          },
          {
            urgent: true,
            zh: 'Vercel 项目的 Owner/Admin 权限（前任把你加入 Vercel 团队）。',
            en: 'Vercel project Owner/Admin access (previous admin added you to the Vercel team).',
          },
          {
            urgent: true,
            zh: 'Neon 数据库项目的 Member/Admin 权限（前任把你加入 Neon 组织）。',
            en: 'Neon database project Member/Admin access (previous admin added you to the Neon org).',
          },
          {
            urgent: true,
            zh: 'Resend 账户的 Member 权限（前任把你加入 Resend 团队）。能看 cealstats.org domain 和 Audience。',
            en: 'Resend account Member access (added to the Resend team). Able to see the cealstats.org domain and Audience.',
          },
          {
            urgent: true,
            zh: '域名 cealstats.org 在哪个注册商（Namecheap、GoDaddy、Google Domains 等）以及由谁付费/续费。',
            en: 'Which registrar holds cealstats.org (Namecheap, GoDaddy, Google Domains, etc.) and who pays for renewal.',
          },
          {
            zh: 'GitHub 仓库 (cealDatabase/cealDB) 的 Read 权限（不必要写权限）。便于查看代码、issue。',
            en: 'GitHub repo (cealDatabase/cealDB) Read access (write not required). Useful for code/issues lookup.',
          },
          {
            zh: '开发者联系方式：Miami University Web Service Librarian Meng Qu（qum@miamioh.edu）以及任何其他贡献者。',
            en: 'Developer contact info: Miami University Web Service Librarian Meng Qu (qum@miamioh.edu) and any other contributors.',
          },
          {
            zh: '上一年的 Year-End Report 工作流程文档（如果有）：哪个 JEAL 编辑负责接收、提交格式、截稿日期。',
            en: "Last year's Year-End Report workflow doc (if any): which JEAL editor receives it, format requirements, deadline.",
          },
          {
            zh: '上一年的 SurveySession 记录（在 /admin/broadcast 页面能看到）：可以参考当年的开关日期。',
            en: 'Last year\'s SurveySession record (visible in /admin/broadcast): reference for that year\'s open/close dates.',
          },
          {
            zh: '所有"自定义"做法的口头交接：例如"我们一般给 X 学校宽限到 12 月 15 日"、"日本组的 Y 总是要发两次提醒"。',
            en: 'Verbal handover of any "tribal knowledge": e.g. "we always give X University until Dec 15", "the Japan group always needs two reminders".',
          },
          {
            zh: '密码管理：如果前任用过共享密码管理器（1Password、LastPass）的 CEAL vault，把你加进去。',
            en: 'Password management: if a shared password manager (1Password, LastPass) CEAL vault exists, get added to it.',
          },
        ]}
      />

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '没拿到任何一项怎么办？',
          en: 'What if you cannot obtain any item?',
        }}
      >
        {lang === 'zh' ? (
          <>
            如果前任已经联系不上了（退休、跳槽、离世），不要慌：①
            <strong>立刻联系 Meng Qu (qum@miamioh.edu, Miami University Web Service Librarian)</strong>，
            她是这个项目的长期开发者，知道大部分服务的归属；②
            <strong>同时联系 CEAL 委员会主席</strong>，由委员会出具正式信函向各服务商证明你接手的合法性，重新获取所有权。
          </>
        ) : (
          <>
            If the predecessor is unreachable (retired, moved, deceased), don't
            panic: (1){' '}
            <strong>
              Contact Meng Qu (qum@miamioh.edu, Miami University Web Service Librarian) immediately
            </strong>{' '}
            — she is the long-term developer and knows most service ownership;
            (2){' '}
            <strong>contact the CEAL Committee Chair simultaneously</strong> so
            the committee can issue a formal handover letter to each service
            provider proving your authority and reclaim ownership.
          </>
        )}
      </Callout>

      {/* ---------- 1.2 First login ---------- */}
      <SectionH3
        id="s-1-2"
        lang={lang}
        zh="1.2 第一次登录 cealstats.org"
        en="1.2 First Login to cealstats.org"
      />

      <StepCard
        step={1}
        lang={lang}
        title={{
          zh: '让前任 Super Admin 在 /signup 给你建账号',
          en: 'Have the outgoing Super Admin create your account via /signup',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              前任登录后访问 <Code>/signup</Code>，填入：
              <ul className="my-2 list-disc list-inside space-y-1">
                <li>
                  <strong>Username</strong>：你的工作邮箱
                </li>
                <li>
                  <strong>Institution</strong>：你所在的图书馆
                </li>
                <li>
                  <strong>Role</strong>：
                  <strong>Super Admin</strong>（不是 Member！）
                </li>
              </ul>
              系统会自动发一封"欢迎邮件"到你的邮箱，里面有<strong>初始设置链接</strong>（24 小时有效）。
            </>
          }
          en={
            <>
              The outgoing admin logs in and goes to <Code>/signup</Code>, fills
              in:
              <ul className="my-2 list-disc list-inside space-y-1">
                <li>
                  <strong>Username</strong>: your work email
                </li>
                <li>
                  <strong>Institution</strong>: your library
                </li>
                <li>
                  <strong>Role</strong>: <strong>Super Admin</strong> (not
                  Member!)
                </li>
              </ul>
              The system auto-sends a welcome email to you with an{' '}
              <strong>initial setup link</strong> (valid 24 hours).
            </>
          }
        />
      </StepCard>

      <StepCard
        step={2}
        lang={lang}
        title={{
          zh: '点开邮件设置密码',
          en: 'Click the email and set your password',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              如果邮件没收到，先检查垃圾邮件文件夹。还是没有的话，让前任去
              <Code>/admin/users</Code> 找你的账号，点 <Code>Send Opening Email</Code>
              图标可重发。或者直接在登录页用 <strong>Forgot Password</strong> 也能触发重置邮件。
            </>
          }
          en={
            <>
              If the email never arrives, check spam first. Still nothing? Ask
              the outgoing admin to go to <Code>/admin/users</Code>, find your
              account, and click the <Code>Send Opening Email</Code> icon to
              resend. Or use <strong>Forgot Password</strong> on the login page
              to trigger a reset email.
            </>
          }
        />
      </StepCard>

      <StepCard
        step={3}
        lang={lang}
        title={{
          zh: '登录后立刻去 /admin 确认你看得到 "Super Admin Toolkit"',
          en: 'After login, go to /admin and confirm you see "Super Admin Toolkit"',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              <Code>/admin</Code> 页面分几个区块。如果你是 Super Admin，应当看到最下面有一块带红色边框的
              "Super Admin Toolkit"，里面有 Survey Dates、Broadcast、Email Templates、Manage Users 等卡片。
              如果<strong>看不到这一块</strong>，说明你的账号没被赋予 Role 1。回到第 1 步让前任检查。
            </>
          }
          en={
            <>
              The <Code>/admin</Code> page is split into several sections. If
              you are Super Admin, you should see a red-bordered{' '}
              <strong>"Super Admin Toolkit"</strong> at the bottom with cards
              for Survey Dates, Broadcast, Email Templates, Manage Users, etc.
              If you <strong>don't see it</strong>, your account was not given
              Role 1. Go back to Step 1 and have the outgoing admin fix it.
            </>
          }
        />
      </StepCard>

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '验证账号已经是 Super Admin 的方法',
          en: 'How to verify your account is really Super Admin',
        }}
      >
        {lang === 'zh' ? (
          <>
            浏览器打开开发者工具（F12 或 Cmd-Option-I）→ Application → Cookies →
            cealstats.org → 找到名为 <Code>role</Code> 的 Cookie，应当显示
            <Code>{'["1"]'}</Code> 或包含 <Code>"1"</Code>。如果只显示
            <Code>{'["2"]'}</Code> 你就只是 Member。
          </>
        ) : (
          <>
            Open browser DevTools (F12 or Cmd-Option-I) → Application → Cookies
            → cealstats.org → find the cookie named <Code>role</Code>. It should
            be <Code>{'["1"]'}</Code> or contain <Code>"1"</Code>. If it only
            shows <Code>{'["2"]'}</Code> you are still just a Member.
          </>
        )}
      </Callout>

      {/* ---------- 1.3 /admin layout ---------- */}
      <SectionH3
        id="s-1-3"
        lang={lang}
        zh={'1.3 /admin 页面布局：你的「工具柜」'}
        en="1.3 /admin Page Layout: Your Toolkit"
      />

      <P
        lang={lang}
        zh={
          <>
            登录后点右上角"Admin"或直接访问 <Code>/admin</Code>。Super Admin 看到的页面分四大块（从上到下）：
          </>
        }
        en={
          <>
            After login, click "Admin" in the top-right or go to{' '}
            <Code>/admin</Code>. As Super Admin you will see four major
            sections (top to bottom):
          </>
        }
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '区块', en: 'Section' },
          { zh: '颜色', en: 'Color' },
          { zh: '内容', en: 'Contains' },
          { zh: '谁能看到', en: 'Visible to' },
        ]}
        rows={[
          [
            { zh: 'Statistics Forms', en: 'Statistics Forms' },
            { zh: '蓝色', en: 'Blue' },
            {
              zh: '我的表单：10 张小表的入口（按机构）',
              en: 'My Forms: 10 small forms (by institution)',
            },
            { zh: '所有 1/2/3/4 角色', en: 'All roles 1/2/3/4' },
          ],
          [
            { zh: 'Statistics Reports', en: 'Statistics Reports' },
            { zh: '绿色', en: 'Emerald' },
            {
              zh: '查询/导出年度报告',
              en: 'Query/export annual reports',
            },
            { zh: '所有 1/2/3/4 角色', en: 'All roles 1/2/3/4' },
          ],
          [
            { zh: 'E-Resource Editor', en: 'E-Resource Editor' },
            { zh: '紫色', en: 'Purple' },
            {
              zh: 'AV/EBook/EJournal 三大表 + Year-End Reports + Participation Reports',
              en: 'AV/EBook/EJournal three big tables + Year-End Reports + Participation Reports',
            },
            { zh: '角色 1/3/4', en: 'Roles 1/3/4' },
          ],
          [
            { zh: 'Super Admin Toolkit', en: 'Super Admin Toolkit' },
            { zh: '红色', en: 'Red' },
            {
              zh: 'Survey Dates、Broadcast、Email Templates、Manage Users、Add User、Manage Libraries、Add Library、Published Reports、Audit Logs',
              en: 'Survey Dates, Broadcast, Email Templates, Manage Users, Add User, Manage Libraries, Add Library, Published Reports, Audit Logs',
            },
            { zh: '只有角色 1/4', en: 'Only roles 1/4' },
          ],
        ]}
      />

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '路径速记表',
          en: 'Path cheat sheet',
        }}
      >
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <Code>/admin</Code> —{' '}
            {lang === 'zh' ? '主仪表盘' : 'Main dashboard'}
          </li>
          <li>
            <Code>/admin/forms</Code> —{' '}
            {lang === 'zh'
              ? '10 张小表的入口列表'
              : '10 small forms entry list'}
          </li>
          <li>
            <Code>/admin/survey-dates</Code> —{' '}
            {lang === 'zh'
              ? '设置今年的开关日期'
              : 'Set this year\'s open/close dates'}{' '}
            ⚠️
          </li>
          <li>
            <Code>/admin/broadcast</Code> —{' '}
            {lang === 'zh'
              ? '开关表 + 发广播邮件'
              : 'Open/close forms + send broadcast'}{' '}
            ⚠️
          </li>
          <li>
            <Code>/admin/email-templates</Code> —{' '}
            {lang === 'zh' ? '编辑邮件模板' : 'Edit email templates'}
          </li>
          <li>
            <Code>/admin/users</Code> —{' '}
            {lang === 'zh' ? '用户列表 / 角色管理' : 'User list / role mgmt'}
          </li>
          <li>
            <Code>/signup</Code> —{' '}
            {lang === 'zh' ? '新增用户' : 'Create new user'}
          </li>
          <li>
            <Code>/libraries</Code> —{' '}
            {lang === 'zh'
              ? '所有机构 / 参与状态 / 发布开关'
              : 'All institutions / participation / publish toggle'}
          </li>
          <li>
            <Code>/create</Code> —{' '}
            {lang === 'zh' ? '新增机构' : 'Create new library'}
          </li>
          <li>
            <Code>/admin/published-reports</Code> —{' '}
            {lang === 'zh'
              ? 'JEAL 已出版的报告 PDF 链接管理'
              : 'Manage JEAL published report PDF links'}
          </li>
          <li>
            <Code>/admin/year-end-reports</Code> —{' '}
            {lang === 'zh' ? '年终报告导出' : 'Year-End Report exports'}
          </li>
          <li>
            <Code>/admin/participation-reports</Code> —{' '}
            {lang === 'zh' ? '参与报告' : 'Participation reports'}
          </li>
          <li>
            <Code>/admin/audit-logs</Code> —{' '}
            {lang === 'zh' ? '审计日志' : 'Audit logs'}
          </li>
          <li>
            <Code>/admin/superguide</Code> —{' '}
            {lang === 'zh'
              ? '本指南（你现在就在这里）'
              : 'This guide (you are here)'}
          </li>
        </ul>
      </Callout>

      {/* ---------- 1.4 Glossary preview ---------- */}
      <SectionH3
        id="s-1-4"
        lang={lang}
        zh="1.4 关键术语速查（核心 8 个）"
        en="1.4 Key Terminology Quick Reference (the core 8)"
      />

      <P
        lang={lang}
        zh="第 8 部分有完整的术语表。这里只列你立刻需要知道的 8 个，因为后面的章节会反复用到它们。"
        en="Part 8 has the complete glossary. Here are just the 8 terms you need to know right now — later sections refer to them constantly."
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '术语', en: 'Term' },
          { zh: '含义', en: 'Meaning' },
        ]}
        rows={[
          [
            { zh: <Code>Library_Year</Code>, en: <Code>Library_Year</Code> },
            {
              zh: '系统里最重要的一张表。每个（机构 × 年份）一条记录。包含 is_open_for_editing、opening_date、closing_date 这些核心字段。',
              en: 'The most important table. One row per (institution × year). Holds the core fields is_open_for_editing, opening_date, closing_date.',
            },
          ],
          [
            { zh: <Code>SurveySession</Code>, en: <Code>SurveySession</Code> },
            {
              zh: '每个年份一条记录。负责调度（开/关时间）、邮件去重标志（notifiedOnOpen / notifiedOnClose）。',
              en: 'One row per year. Handles scheduling (open/close times) and email dedup flags (notifiedOnOpen / notifiedOnClose).',
            },
          ],
          [
            { zh: <Code>ScheduledEvent</Code>, en: <Code>ScheduledEvent</Code> },
            {
              zh: '三种事件：BROADCAST / FORM_OPENING / FORM_CLOSING。每个有 pending / completed / cancelled 三态。',
              en: 'Three event types: BROADCAST / FORM_OPENING / FORM_CLOSING. Each has pending / completed / cancelled state.',
            },
          ],
          [
            { zh: <Code>Entry_Status</Code>, en: <Code>Entry_Status</Code> },
            {
              zh: '记录每个机构-年份的"哪些表已经填了"。它的 espublished 字段决定一个 Member 用户能否看到该年的报告。',
              en: 'Records "which forms have been filled" for each (library, year). Its espublished field decides whether a Member user can see that year\'s report.',
            },
          ],
          [
            { zh: <Code>is_open_for_editing</Code>, en: <Code>is_open_for_editing</Code> },
            {
              zh: 'Library_Year 上的核心 boolean。true=开表，false=关表。Super Admin 关表后仍能编辑，其他人不能。',
              en: 'Core boolean on Library_Year. true = open, false = closed. Super Admin can edit after close, others cannot.',
            },
          ],
          [
            { zh: <Code>espublished</Code>, en: <Code>espublished</Code> },
            {
              zh: 'Entry_Status 上的 boolean。true=该机构-年份的数据已"发布"，Member 可在 /admin/reports 看到该年。',
              en: 'Boolean on Entry_Status. true = that (library, year) is "published" and visible to Members in /admin/reports for that year.',
            },
          ],
          [
            { zh: <Code>broadcast_sent</Code>, en: <Code>broadcast_sent</Code> },
            {
              zh: 'Library_Year 上的 boolean。防止广播邮件被重复发送的保险丝。Super Admin 立即重开时一般会重置。',
              en: 'Boolean on Library_Year. Fuse to prevent duplicate broadcast sends. Reset when Super Admin manually re-opens.',
            },
          ],
          [
            { zh: <Code>Cron Job</Code>, en: <Code>Cron Job</Code> },
            {
              zh: 'Vercel 每天自动跑两次（UTC 8am / 8pm，即东部 4am / 4pm）的后台任务。它去检查"是不是到点开表/关表/发提醒了"。',
              en: 'A background task Vercel runs twice daily (UTC 8am/8pm = ET 4am/4pm). It checks "is it time to open/close forms or send reminders?"',
            },
          ],
        ]}
      />

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '小结：把这一部分搞定了，就可以开始正式工作',
          en: 'Summary: once you finish this part, you are ready to work',
        }}
      >
        {lang === 'zh' ? (
          <>
            完成了 1.1 移交清单 + 1.2 第一次登录 + 大致看懂 1.3 工具柜的布局 +
            知道 1.4 的 8 个术语，你就可以翻到{' '}
            <PageLink href="#part-2">
              第 2 部分（年度循环）
            </PageLink>{' '}
            开始按月份做事了。
          </>
        ) : (
          <>
            Done with 1.1 handover + 1.2 first login + skimmed 1.3 toolkit
            layout + know the 8 terms in 1.4 → you are ready to jump to{' '}
            <PageLink href="#part-2">
              Part 2 (Annual Cycle)
            </PageLink>{' '}
            and start doing things by month.
          </>
        )}
      </Callout>
    </div>
  )
}
