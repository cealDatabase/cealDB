'use client'

import React from 'react'
import {
  PartProps,
  SectionH2,
  SectionH3,
  P,
  Callout,
  Code,
  StepCard,
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
        zh="这部分手把手带你完成：账号怎么来 → 怎么登录 → 登录后看到什么。如果你已经登录过了，可以直接跳到 1.3 看 Dashboard 怎么用。"
        en="This part walks you through: how your account is created → how to log in → what you'll see after login. If you've already logged in before, skip to 1.3 to learn the dashboard."
      />

      {/* ---------- 1.1 First login ---------- */}
      <SectionH3
        id="s-1-1"
        lang={lang}
        zh="1.1 第一次登录"
        en="1.1 First-time Login"
      />

      <P
        lang={lang}
        zh={
          <>
            <strong>你的账号不是自己注册的</strong>——CEAL Statistics Committee（或上一任
            机构联系人）会用你的工作邮箱给你创建账号。账号创建后，系统会
            自动把一封 “Welcome / Set Your Password” 邮件发到你的邮箱。
          </>
        }
        en={
          <>
            <strong>You don't sign up yourself</strong> — the CEAL Statistics
            Committee (or your predecessor) creates the account using your work
            email. Once created, the system auto-sends a “Welcome / Set Your
            Password” email to you.
          </>
        }
      />

      <StepCard
        step={1}
        lang={lang}
        title={{
          zh: '让 CEAL Committee 或机构内同事建账号',
          en: 'Have CEAL Committee or a colleague create your account',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              如果你是新接手的机构联系人，把你的<strong>工作邮箱</strong>、
              <strong>姓名</strong>、<strong>所在图书馆</strong> 告诉 CEAL
              Statistics Committee 或本机构上一任联系人（他们有 Super Admin
              权限可以建账号）。
            </>
          }
          en={
            <>
              If you're a new institutional contact, send your{' '}
              <strong>work email</strong>, <strong>name</strong>, and{' '}
              <strong>library</strong> to either the CEAL Statistics Committee
              or your predecessor (they have Super Admin rights to create
              accounts).
            </>
          }
        />
      </StepCard>

      <StepCard
        step={2}
        lang={lang}
        title={{
          zh: '检查邮箱，点欢迎邮件里的设置链接',
          en: 'Check your inbox; click the setup link in the welcome email',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              发件人会是 <Code>noreply@cealstats.org</Code> 或类似地址。
              <strong>24 小时内</strong>有效。如果在收件箱找不到，
              先看垃圾邮件 / Junk / Promotions 文件夹。
            </>
          }
          en={
            <>
              The sender will be <Code>noreply@cealstats.org</Code> or similar.
              The link is valid for <strong>24 hours</strong>. If you can't find
              it in Inbox, check Spam / Junk / Promotions first.
            </>
          }
        />
        <Callout
          type="warning"
          lang={lang}
          title={{
            zh: '链接过期了怎么办',
            en: 'What if the link expired',
          }}
        >
          {lang === 'zh'
            ? '直接在登录页 (cealstats.org) 点 Forgot Password，输入同一个邮箱，系统会重新发一封 reset 邮件，跟欢迎邮件效果一样。'
            : 'Just go to the login page (cealstats.org) and click Forgot Password. Enter the same email and the system will send a fresh reset email — same effect as the welcome email.'}
        </Callout>
      </StepCard>

      <StepCard
        step={3}
        lang={lang}
        title={{
          zh: '设密码 → 自动登录',
          en: 'Set password → auto-login',
        }}
      >
        <P
          lang={lang}
          zh="密码要求：8 位以上，包含字母和数字。设完密码点提交，系统会把你登录并跳到你的 Dashboard。"
          en="Password requirements: 8+ characters, mix of letters and numbers. After setting, the system logs you in and goes to your dashboard."
        />
      </StepCard>

      {/* ---------- 1.2 Forgot password ---------- */}
      <SectionH3
        id="s-1-2"
        lang={lang}
        zh="1.2 忘记密码"
        en="1.2 Forgot Password"
      />

      <P
        lang={lang}
        zh={
          <>
            在登录页点 <strong>Forgot Password</strong> → 输入你的邮箱 →
            收一封带链接的邮件 → 点链接设新密码。整个流程<strong>不需要</strong>
            找管理员，你自己能完成。
          </>
        }
        en={
          <>
            On the login page click <strong>Forgot Password</strong> → enter
            your email → receive an email with a link → click and set a new
            password. <strong>No admin needed</strong> — you can do this yourself.
          </>
        }
      />

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '没收到邮件？',
          en: 'No email arrived?',
        }}
      >
        {lang === 'zh' ? (
          <>
            ① 检查垃圾邮件文件夹。
            <br />
            ② 确认输入的邮箱与系统里登记的<strong>完全一致</strong>（大小写、
            是否有点号）。如果不一致，系统不会报错，但邮件不会发出。
            <br />
            ③ 还是没收到 → 联系 CEAL Statistics Committee 请他们重新发开通邮件。
          </>
        ) : (
          <>
            (1) Check Spam / Junk.
            <br />
            (2) Confirm the email you typed is{' '}
            <strong>exactly the same</strong> as what's on file (case, dots).
            Mismatch fails silently — no error shown.
            <br />
            (3) Still nothing → contact the CEAL Statistics Committee to resend the welcome email.
          </>
        )}
      </Callout>

      {/* ---------- 1.3 Dashboard ---------- */}
      <SectionH3
        id="s-1-3"
        lang={lang}
        zh="1.3 你的 Dashboard 长什么样"
        en="1.3 Your Dashboard at a Glance"
      />

      <P
        lang={lang}
        zh={
          <>
            登录后系统会自动把你带到 <Code>/admin</Code> 路径下你机构专属的
            Dashboard。上面会看到：
          </>
        }
        en={
          <>
            After login, the system takes you to your library's dashboard at{' '}
            <Code>/admin</Code>. You'll see:
          </>
        }
      />

      <ul className="list-disc list-inside space-y-2 my-4 text-sm text-gray-800">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>页面顶端的状态横幅</strong>：告诉你当前是开表期 / 关表期 /
              即将开放，以及具体日期。
            </li>
            <li>
              <strong>Statistics Forms 区域</strong>：10 张表的入口，每张表
              旁边会标“未填 / 草稿 / 已提交”状态。
            </li>
            <li>
              <strong>Statistics Reports 区域</strong>：查看本机构已提交数据
              的报告、下载 PDF。
            </li>
            <li>
              <strong>左上角的图书馆名字</strong>：确认你的身份对了（万一显示
              别人机构 → 立刻退出登录）。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Status banner at the top</strong>: tells you whether forms
              are currently open / closed / scheduled to open, plus the dates.
            </li>
            <li>
              <strong>Statistics Forms area</strong>: links to the 10 forms,
              each tagged with “Not Started / Draft / Submitted” status.
            </li>
            <li>
              <strong>Statistics Reports area</strong>: view your library's
              submitted data reports and download PDFs.
            </li>
            <li>
              <strong>Your library name in the top-left</strong>: confirms your
              identity. If it shows someone else's library → log out immediately.
            </li>
          </>
        )}
      </ul>

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: 'Bookmark 一下 /admin',
          en: 'Bookmark /admin',
        }}
      >
        {lang === 'zh'
          ? '把 https://cealstats.org/admin 加到浏览器书签，下次登录后直接进 dashboard，不用记路径。'
          : 'Bookmark https://cealstats.org/admin — next time you log in, this takes you straight to the dashboard without remembering the URL.'}
      </Callout>

      {/* ---------- 1.4 Form layout ---------- */}
      <SectionH3
        id="s-1-4"
        lang={lang}
        zh="1.4 表单页面布局"
        en="1.4 Form Page Layout"
      />

      <P
        lang={lang}
        zh="点开任何一张表（比如 Monographic Acquisitions），你看到的布局都是一致的："
        en="Every form (e.g. Monographic Acquisitions) follows the same layout:"
      />

      <ol className="list-decimal list-inside space-y-2 my-4 text-sm text-gray-800">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>页头</strong>：表名 + 当前年度 + 状态徽章（Active /
              Closed）。
            </li>
            <li>
              <strong>说明文字</strong>：每个字段下面有简短解释，告诉你这
              个数字应该统计什么。
            </li>
            <li>
              <strong>输入框</strong>：按语言（Chinese / Japanese / Korean）
              或类别分行。空着也行，系统不会强制。
            </li>
            <li>
              <strong>Subtotal 自动求和</strong>：你填了几个语言后，
              subtotal 那一行会自动算。
            </li>
            <li>
              <strong>Notes 备注框</strong>：每张表最下面都有一个备注框。
              如果数字异常或有特殊情况，请在这里说明，CEAL Committee
              复核数据时会看。
            </li>
            <li>
              <strong>底部 3 个按钮</strong>：
              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                <li>
                  <Code>Save Draft</Code> — 存草稿，下次能继续改
                </li>
                <li>
                  <Code>Submit</Code> — 正式提交（可以再次提交覆盖）
                </li>
                <li>
                  <Code>Import Last Year</Code> — 把去年同表数据拉过来（详见 4.2）
                </li>
              </ul>
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Header</strong>: form name + current year + status badge
              (Active / Closed).
            </li>
            <li>
              <strong>Inline descriptions</strong>: short explanation under each
              field tells you what number to enter.
            </li>
            <li>
              <strong>Input boxes</strong>: grouped by language (Chinese /
              Japanese / Korean) or by category. Leaving cells empty is fine —
              not enforced.
            </li>
            <li>
              <strong>Subtotals auto-compute</strong>: fill in language rows and
              the subtotal row updates automatically.
            </li>
            <li>
              <strong>Notes field</strong>: every form has a notes box at the
              bottom. Use it to explain unusual numbers or special situations —
              CEAL Committee reads these when reviewing.
            </li>
            <li>
              <strong>Three buttons at the bottom</strong>:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                <li>
                  <Code>Save Draft</Code> — save progress, edit later
                </li>
                <li>
                  <Code>Submit</Code> — finalize submission (can resubmit to overwrite)
                </li>
                <li>
                  <Code>Import Last Year</Code> — pull in last year's same-form data (see 4.2)
                </li>
              </ul>
            </li>
          </>
        )}
      </ol>

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '一个常见误解',
          en: 'A common misunderstanding',
        }}
      >
        {lang === 'zh'
          ? '“Save Draft” 不等于 “Submit”！草稿状态的表，CEAL 看不到、JEAL 不收。一定要在 12 月 2 日截止前点 Submit 才算数。'
          : '“Save Draft” is NOT the same as “Submit”! A draft is not visible to CEAL and not included in JEAL. You must click Submit before the December 2 deadline for it to count.'}
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
            读完第 1 部分你已经会：① 让 Committee 建账号；② 邮件设密码登录；
            ③ 看懂 Dashboard 和表单布局。接下来{' '}
            <PageLink href="#part-2">第 2 部分（年度时间表）</PageLink>{' '}
            会告诉你一年内每个时间点该做什么。
          </>
        ) : (
          <>
            After Part 1 you can: (1) have the Committee create your account;
            (2) set password via email and log in; (3) read the dashboard and
            form layout. Next:{' '}
            <PageLink href="#part-2">Part 2 (Annual Timeline)</PageLink> tells
            you what to do at each point in the year.
          </>
        )}
      </Callout>
    </div>
  )
}
