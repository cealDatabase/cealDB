'use client'

import React from 'react'
import {
  PartProps,
  SectionH2,
  SectionH3,
  P,
  Callout,
  Code,
  MonthCard,
  StepCard,
  GuideTable,
  PageLink,
  Checklist,
} from './_shared'

export default function Part2AnnualCycle({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-2"
        lang={lang}
        zh="第 2 部分 · 年度循环（按月份）"
        en="Part 2 · The Annual Cycle (Month by Month)"
      />

      <P
        lang={lang}
        zh={'这是本指南最重要的一部分。它按月份告诉你「我现在应该做什么」。每个月份是一张卡片，你只需要顺着往下看。'}
        en="This is the most important part of the guide. It tells you 'what I should be doing right now' month by month. Each month is a card — just read straight through."
      />

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '关于"默认日期"',
          en: 'About "default dates"',
        }}
      >
        {lang === 'zh' ? (
          <>
            10 月 1 日开表、12 月 2 日关表是<strong>历史惯例的默认</strong>，写在
            <Code>lib/surveyDates.ts</Code> 里。<strong>每年都可以由统计委员会决定调整</strong>——比如某年节假日多就推后一周。你的工作是
            <strong>确认本年度的实际日期</strong>并在 9 月把它录入系统。
          </>
        ) : (
          <>
            Oct 1 opening and Dec 2 closing are the{' '}
            <strong>historical default</strong>, hardcoded in{' '}
            <Code>lib/surveyDates.ts</Code>.{' '}
            <strong>
              The Statistics Committee can adjust these every year
            </strong>{' '}
            (e.g. push back a week if it conflicts with holidays). Your job is
            to <strong>confirm this year's actual dates</strong> with the
            committee and enter them into the system in September.
          </>
        )}
      </Callout>

      {/* ---------- 2.1 Aug-Sep ---------- */}
      <SectionH3
        id="s-2-1"
        lang={lang}
        zh="2.1 8 月-9 月初：与统计委员会沟通"
        en="2.1 August-Early September: Coordinate with Statistics Committee"
      />

      <MonthCard
        lang={lang}
        color="gray"
        month={{ zh: '8 月 - 9 月初', en: 'Aug - Early Sep' }}
        title={{ zh: '决定本年度调查日期', en: 'Decide this year\'s survey dates' }}
      >
        <P
          lang={lang}
          zh="CEAL 年会一般在 3 月，但统计委员会一般在 6-8 月就开始为下一轮调查做准备。你要做的事："
          en="The CEAL annual meeting is in March, but the Statistics Committee usually starts prep for the next survey cycle in June-August. Your tasks:"
        />
        <ul className="list-disc list-inside space-y-1 my-2 text-sm">
          {lang === 'zh' ? (
            <>
              <li>
                和统计委员会确认本年度的 <strong>opening date</strong>（一般 10 月 1 日）
                和 <strong>closing date</strong>（一般 12 月 2 日）。
              </li>
              <li>
                确认 <strong>fiscal year</strong> 范围（一般 7 月 1 日 - 6 月 30 日，即 FY24 = 2023-07-01 至 2024-06-30）。
              </li>
              <li>
                确认 <strong>publication month</strong>（一般是次年 2 月）和 JEAL 编辑联系人。
              </li>
              <li>
                跟新加入或要退出的机构沟通（如有，参见 3.D.7 新建图书馆）。
              </li>
            </>
          ) : (
            <>
              <li>
                Confirm the <strong>opening date</strong> (typically Oct 1) and{' '}
                <strong>closing date</strong> (typically Dec 2) with the
                Statistics Committee.
              </li>
              <li>
                Confirm the <strong>fiscal year</strong> range (typically Jul 1
                – Jun 30, i.e. FY24 = 2023-07-01 to 2024-06-30).
              </li>
              <li>
                Confirm the <strong>publication month</strong> (typically Feb
                next year) and the JEAL editor contact.
              </li>
              <li>
                Communicate with newly joining or departing institutions (if
                any — see 3.D.7 Add Library).
              </li>
            </>
          )}
        </ul>
        <P
          lang={lang}
          zh="这些信息你都需要在 9 月录入系统，所以现在拿到一份书面确认（邮件即可）会很有帮助。"
          en="You will enter all of this into the system in September, so getting written confirmation now (an email is fine) is very helpful."
        />
      </MonthCard>

      {/* ---------- 2.2 Mid Sep ---------- */}
      <SectionH3
        id="s-2-2"
        lang={lang}
        zh="2.2 9 月中旬：在 /admin/survey-dates 设置日期"
        en="2.2 Mid-September: Set Survey Dates in /admin/survey-dates"
      />

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '9 月中旬', en: 'Mid-September' }}
        title={{
          zh: '⚠️ 关键：录入开关日期 + 创建本年度 Library_Year 记录',
          en: '⚠️ Critical: Enter open/close dates + create this year\'s Library_Year records',
        }}
      >
        <StepCard
          step={1}
          lang={lang}
          title={{
            zh: '登录后访问 /admin/survey-dates',
            en: 'Log in and go to /admin/survey-dates',
          }}
        >
          <P
            lang={lang}
            zh={
              <>
                这个页面让你统一为<strong>所有机构</strong>设置同一个开/关日期。它会调用
                <Code>POST /api/admin/open-new-year</Code>，对每个机构 upsert 一条
                Library_Year 记录（当年度），并写入 opening_date、closing_date、fiscal_year_start、
                fiscal_year_end、publication_date。
              </>
            }
            en={
              <>
                This page lets you uniformly set the same open/close dates for{' '}
                <strong>all institutions</strong>. It calls{' '}
                <Code>POST /api/admin/open-new-year</Code> which upserts a
                Library_Year row for each library (current year) and writes
                opening_date, closing_date, fiscal_year_start, fiscal_year_end,
                publication_date.
              </>
            }
          />
        </StepCard>

        <StepCard
          step={2}
          lang={lang}
          title={{
            zh: '填写四组日期',
            en: 'Fill in four sets of dates',
          }}
        >
          <ul className="list-disc list-inside text-sm space-y-1 my-2">
            {lang === 'zh' ? (
              <>
                <li>
                  <strong>Opening Date</strong>：表单开放日，默认 10/1
                </li>
                <li>
                  <strong>Closing Date</strong>：表单关闭日，默认 12/2
                </li>
                <li>
                  <strong>Fiscal Year Start/End</strong>：会计年度，默认 7/1 → 6/30
                </li>
                <li>
                  <strong>Publication Date</strong>：JEAL 出版日，默认次年 2 月
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong>Opening Date</strong>: when forms open, default 10/1
                </li>
                <li>
                  <strong>Closing Date</strong>: when forms close, default 12/2
                </li>
                <li>
                  <strong>Fiscal Year Start/End</strong>: default 7/1 → 6/30
                </li>
                <li>
                  <strong>Publication Date</strong>: JEAL publication, default
                  Feb next year
                </li>
              </>
            )}
          </ul>
        </StepCard>

        <Callout
          type="warning"
          lang={lang}
          title={{
            zh: '日期 = 太平洋时间',
            en: 'Dates = Pacific Time',
          }}
        >
          {lang === 'zh' ? (
            <>
              所有日期在数据库里存为 UTC，但显示和"截止"都按
              <strong>太平洋时间 11:59 PM</strong>。例如设 12/2 关表，意思是
              <strong>12 月 2 日太平洋时间晚上 11:59</strong> 关。即太平洋以东的人
              不要以为 12/2 早上 8 点东部时间还能填。
            </>
          ) : (
            <>
              All dates are stored as UTC but displayed and enforced as{' '}
              <strong>Pacific Time 11:59 PM</strong>. E.g. setting closing date
              12/2 means <strong>Pacific Time 11:59 PM on Dec 2</strong>. People
              east of Pacific should not assume they can still submit at 8 AM
              Eastern on 12/2.
            </>
          )}
        </Callout>

        <StepCard
          step={3}
          lang={lang}
          title={{
            zh: '点 "Save / Open New Year" 提交',
            en: 'Click "Save / Open New Year" to submit',
          }}
        >
          <P
            lang={lang}
            zh={
              <>
                后端会对所有机构做 upsert，并返回一个汇总（多少新建、多少跳过、多少出错）。
                <strong>重要</strong>：这个操作<strong>不会立即开表</strong>。它只是写入日期。
                <Code>is_open_for_editing</Code> 仍然是 <strong>false</strong>，
                Library_Year 状态显示为 "Scheduled"（蓝色）直到 cron 在开表日把它翻为 true。
              </>
            }
            en={
              <>
                The backend upserts for all libraries and returns a summary
                (created / skipped / errors).{' '}
                <strong>Important</strong>: this does <strong>not</strong>{' '}
                immediately open forms. It only writes the dates.{' '}
                <Code>is_open_for_editing</Code> stays <strong>false</strong>{' '}
                and Library_Year shows "Scheduled" (blue) until the cron flips
                it to true on opening day.
              </>
            }
          />
        </StepCard>

        <Callout
          type="critical"
          lang={lang}
          title={{
            zh: '此步骤的隐藏副作用',
            en: 'Hidden side-effects of this step',
          }}
        >
          {lang === 'zh' ? (
            <>
              如果某机构的 Library_Year 已经存在但日期不同，这里会
              <strong>覆盖</strong>原来的日期。如果你只想给个别机构延期，
              <strong>不要</strong>用这个页面——应当直接在数据库或用
              <Code>/admin/broadcast</Code> 单独处理。
            </>
          ) : (
            <>
              If a library's Library_Year already exists with different dates,
              this page will <strong>overwrite</strong> them. If you only want
              to extend the deadline for one institution,{' '}
              <strong>don't</strong> use this page — handle it directly in the
              DB or via <Code>/admin/broadcast</Code>.
            </>
          )}
        </Callout>
      </MonthCard>

      {/* ---------- 2.3 Late Sep ---------- */}
      <SectionH3
        id="s-2-3"
        lang={lang}
        zh="2.3 9 月下旬：检查 4 封邮件模板"
        en="2.3 Late September: Review the 4 Email Templates"
      />

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '9 月下旬', en: 'Late September' }}
        title={{
          zh: '审阅 /admin/email-templates 里的 4 封模板',
          en: 'Review the 4 templates in /admin/email-templates',
        }}
      >
        <P
          lang={lang}
          zh="系统里有 4 个邮件模板。前 3 个是广播（发给所有 CEAL 用户），第 4 个是单用户重发。每个模板支持占位符自动填入年份/日期。"
          en="There are 4 email templates. The first 3 are broadcasts (sent to all CEAL users); the 4th is for resending to a single user. Each template supports placeholders that auto-fill year/dates."
        />

        <GuideTable
          lang={lang}
          headers={[
            { zh: '模板 Key', en: 'Template Key' },
            { zh: '用途', en: 'Purpose' },
            { zh: '发送方式', en: 'Delivery' },
          ]}
          rows={[
            [
              {
                zh: <Code>broadcast_announcement</Code>,
                en: <Code>broadcast_announcement</Code>,
              },
              {
                zh: '预公告："调查将于 [openingDate] 开放"',
                en: 'Pre-announcement: "Survey will open on [openingDate]"',
              },
              {
                zh: '🖐️ 手动 — 在 email-templates 页面点 "Send broadcast now"',
                en: '🖐️ Manual — click "Send broadcast now" in email-templates page',
              },
            ],
            [
              {
                zh: <Code>broadcast_open_forms</Code>,
                en: <Code>broadcast_open_forms</Code>,
              },
              {
                zh: '"调查现已开放"',
                en: '"Survey is now open"',
              },
              {
                zh: '🤖 自动 — cron 在开表日发送（Resend scheduledAt 主，cron 备）',
                en: '🤖 Auto — cron sends on opening day (Resend scheduledAt + cron backup)',
              },
            ],
            [
              {
                zh: <Code>broadcast_closing_reminder</Code>,
                en: <Code>broadcast_closing_reminder</Code>,
              },
              {
                zh: '"还有 1 周关闭"提醒',
                en: '"1 week to close" reminder',
              },
              {
                zh: '🤖 自动 — cron 在关闭日前 7 天发送',
                en: '🤖 Auto — cron sends 7 days before closing date',
              },
            ],
            [
              {
                zh: <Code>individual_open_forms</Code>,
                en: <Code>individual_open_forms</Code>,
              },
              {
                zh: '单用户重发开表通知',
                en: 'Resend opening notification to a single user',
              },
              {
                zh: '🖐️ 手动 — 在 /admin/users 上某个用户点 "Send" 图标',
                en: '🖐️ Manual — click "Send" icon next to a user in /admin/users',
              },
            ],
          ]}
        />

        <Callout
          type="tip"
          lang={lang}
          title={{
            zh: '支持的占位符',
            en: 'Supported placeholders',
          }}
        >
          {lang === 'zh' ? (
            <>
              模板正文里写 <Code>{'{{year}}'}</Code> 会自动替换为本年度数字。还有
              <Code>{'{{prevYear}}'}</Code>、<Code>{'{{nextYear}}'}</Code>、
              <Code>{'{{openingDate}}'}</Code>（东部时间格式化）、
              <Code>{'{{closingDate}}'}</Code>（太平洋时间格式化）、
              <Code>{'{{fiscalYearStart}}'}</Code>、<Code>{'{{fiscalYearEnd}}'}</Code>、
              <Code>{'{{publicationMonth}}'}</Code>、<Code>{'{{siteUrl}}'}</Code>。预览页面会从最近一条 SurveySession 拉数据。
            </>
          ) : (
            <>
              Writing <Code>{'{{year}}'}</Code> in the template body auto-replaces with this year's number. Also{' '}
              <Code>{'{{prevYear}}'}</Code>, <Code>{'{{nextYear}}'}</Code>,{' '}
              <Code>{'{{openingDate}}'}</Code> (formatted Eastern Time),{' '}
              <Code>{'{{closingDate}}'}</Code> (formatted Pacific Time),{' '}
              <Code>{'{{fiscalYearStart}}'}</Code>,{' '}
              <Code>{'{{fiscalYearEnd}}'}</Code>,{' '}
              <Code>{'{{publicationMonth}}'}</Code>,{' '}
              <Code>{'{{siteUrl}}'}</Code>. The preview pulls from the most recent SurveySession.
            </>
          )}
        </Callout>

        <P
          lang={lang}
          zh="去年那批模板每年都能复用，但务必检查日期占位符渲染出来是不是今年的。点每个模板右侧的 Preview 看看渲染效果。如果改动了模板，按 Save。如果想清空回默认，点 Reset to Default。"
          en="Last year's templates are reusable, but verify that the date placeholders render correctly for this year. Click Preview on each template to see how it renders. Save if changed; click Reset to Default to clear customizations."
        />
      </MonthCard>

      {/* ---------- 2.4 Oct 1 Auto Open ---------- */}
      <SectionH3
        id="s-2-4"
        lang={lang}
        zh="2.4 10 月 1 日：自动开表日"
        en="2.4 October 1: Auto-Opening Day"
      />

      <MonthCard
        lang={lang}
        color="green"
        month={{ zh: '10 月 1 日 8am UTC', en: 'Oct 1, 8am UTC' }}
        title={{
          zh: '🤖 Cron 自动开表 + 广播给所有用户',
          en: '🤖 Cron auto-opens forms + broadcasts to all users',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              凌晨（美东 4am）Vercel cron 自动触发 <Code>/api/cron/check-form-schedules</Code>。它会：
            </>
          }
          en={
            <>
              At dawn (4 AM Eastern) Vercel cron triggers{' '}
              <Code>/api/cron/check-form-schedules</Code>. It will:
            </>
          }
        />
        <ol className="list-decimal list-inside space-y-1 my-2 text-sm">
          {lang === 'zh' ? (
            <>
              <li>
                查 SurveySession 是不是有 <Code>openingDate &lt;= now</Code> 且
                <Code>notifiedOnOpen=false</Code> 的——找到了！
              </li>
              <li>
                对所有 Library_Year 执行 <Code>{'updateMany { is_open_for_editing: true }'}</Code>。
              </li>
              <li>
                通过 Resend 发广播邮件（Audience 名单），用
                <Code>broadcast_open_forms</Code> 模板。
              </li>
              <li>
                标记 <Code>notifiedOnOpen=true</Code> 防止再发。
              </li>
              <li>
                写入审计日志 <Code>SYSTEM_OPEN_FORMS</Code>。
              </li>
            </>
          ) : (
            <>
              <li>
                Query SurveySessions where{' '}
                <Code>openingDate &lt;= now</Code> AND{' '}
                <Code>notifiedOnOpen=false</Code> — found!
              </li>
              <li>
                Run{' '}
                <Code>{'updateMany { is_open_for_editing: true }'}</Code> on all
                Library_Year rows.
              </li>
              <li>
                Send broadcast via Resend (Audience list) using the{' '}
                <Code>broadcast_open_forms</Code> template.
              </li>
              <li>
                Mark <Code>notifiedOnOpen=true</Code> to prevent re-sending.
              </li>
              <li>
                Write audit log <Code>SYSTEM_OPEN_FORMS</Code>.
              </li>
            </>
          )}
        </ol>

        <Callout
          type="warning"
          lang={lang}
          title={{
            zh: 'Super Admin 当天该做什么',
            en: 'What Super Admin should do that day',
          }}
        >
          <ul className="list-disc list-inside space-y-1 mt-1">
            {lang === 'zh' ? (
              <>
                <li>
                  上午检查你的邮箱：你应该作为 Audience 成员收到广播邮件。
                  <strong>没收到就有问题</strong>。
                </li>
                <li>
                  访问 <Code>/admin/forms</Code>，确认 badge 已经从蓝色 "Scheduled" 变为绿色 "Active"。
                </li>
                <li>
                  访问 <Code>/admin/broadcast</Code> 看 Session Queue，FORM_OPENING 事件应当是 "completed"。
                </li>
                <li>
                  访问 <Code>/admin/audit-logs</Code>，最上面应当能看到一条
                  <Code>SYSTEM_OPEN_FORMS</Code>。
                </li>
                <li>
                  在 Resend Dashboard（dashboard.resend.com）→ Broadcasts 看是否真的有一条 sent 状态。
                </li>
              </>
            ) : (
              <>
                <li>
                  Check your inbox in the morning: as an Audience member you
                  should have received the broadcast. <strong>If not, something is wrong.</strong>
                </li>
                <li>
                  Visit <Code>/admin/forms</Code> — the badge should have
                  flipped from blue "Scheduled" to green "Active".
                </li>
                <li>
                  Visit <Code>/admin/broadcast</Code> → Session Queue: the
                  FORM_OPENING event should be "completed".
                </li>
                <li>
                  Visit <Code>/admin/audit-logs</Code> — the top row should be
                  a <Code>SYSTEM_OPEN_FORMS</Code> entry.
                </li>
                <li>
                  In Resend Dashboard (dashboard.resend.com) → Broadcasts,
                  confirm a "sent" status row exists.
                </li>
              </>
            )}
          </ul>
        </Callout>

        <Callout
          type="danger"
          lang={lang}
          title={{
            zh: '如果 cron 没跑怎么办？',
            en: 'What if the cron did not run?',
          }}
        >
          {lang === 'zh' ? (
            <>
              ① 立刻去 Vercel Dashboard → Cron Jobs 看运行日志。一般是因为
              Vercel 限制免费用户每天只能跑 2 次，但本项目就是 2 次所以应该没问题。② 如果确认没跑，去
              <Code>/admin/broadcast</Code> 手动点 "Open All Forms NOW" 立即开表。
              ③ 也可以手动 GET <Code>/api/cron/check-form-schedules</Code>（需要 Bearer token，CRON_SECRET）。详见
              {' '}
              <PageLink href="#s-5-7">5.7 Cron 没运行</PageLink>。
            </>
          ) : (
            <>
              (1) Go to Vercel Dashboard → Cron Jobs immediately and check the
              run logs. Normally Vercel free-tier limits 2 runs/day, but this
              project schedules exactly 2 so it should be fine. (2) If
              confirmed not run, go to <Code>/admin/broadcast</Code> and click
              "Open All Forms NOW" manually. (3) You can also manually GET{' '}
              <Code>/api/cron/check-form-schedules</Code> with Bearer token
              (CRON_SECRET). See{' '}
              <PageLink href="#s-5-7">5.7 Cron did not run</PageLink>.
            </>
          )}
        </Callout>
      </MonthCard>

      {/* ---------- 2.5 Oct-Nov monitoring ---------- */}
      <SectionH3
        id="s-2-5"
        lang={lang}
        zh="2.5 10 月-11 月：监控参与情况"
        en="2.5 October-November: Monitor Participation"
      />

      <MonthCard
        lang={lang}
        color="green"
        month={{ zh: '10 月 - 11 月', en: 'Oct - Nov' }}
        title={{
          zh: '机构填表中，你的工作是"客服 + 监控"',
          en: 'Institutions are filling forms — your job is "support + monitoring"',
        }}
      >
        <P
          lang={lang}
          zh="这两个月是数据采集阶段。机构图书馆员登录、填表、保存草稿、最终提交。Super Admin 此时主要做以下几件事："
          en="These two months are the data collection phase. Member librarians log in, fill out forms, save drafts, and submit. As Super Admin you do the following:"
        />

        <ul className="list-disc list-inside space-y-2 my-3 text-sm">
          {lang === 'zh' ? (
            <>
              <li>
                <strong>每周巡视 1-2 次</strong> <Code>/libraries</Code> → Participation Status 标签页。
                选当前年份，看每个机构哪些表已填、哪些还没填。绿色勾 ✅ = 已填且有数据。
              </li>
              <li>
                <strong>回复用户邮件</strong>。常见问题：
                <ul className="list-circle list-inside ml-4 mt-1 space-y-1">
                  <li>"我忘记密码了" → 让他用登录页 Forgot Password；或你在 /admin/users 帮他重发。</li>
                  <li>"我新来这个图书馆，没账号" → 你在 /signup 给他建账号。</li>
                  <li>"这个表里的字段是啥意思" → 翻去年 JEAL 报告 + 当前调查指引。</li>
                  <li>"我们机构要不要参加电子资源大表" → 是否选择填 AV/EBook/EJournal 是机构自愿。</li>
                </ul>
              </li>
              <li>
                <strong>单独催某个机构</strong>。打开 <Code>/admin/users</Code>，找到该机构的联系人，
                点用户卡片上的 ✉️ "Send Opening Email" 图标。会用
                <Code>individual_open_forms</Code> 模板单发一封邮件。
              </li>
              <li>
                <strong>Impersonate（代某机构查看）</strong>：你可以模拟某个机构登录看他们填到哪里了。
                参见 3.D.6 InstitutionSwitcher。
              </li>
            </>
          ) : (
            <>
              <li>
                <strong>Patrol 1–2 times a week</strong>:{' '}
                <Code>/libraries</Code> → Participation Status tab. Select the
                current year and see which forms each institution has/hasn't
                filled. Green ✅ = filled with real data.
              </li>
              <li>
                <strong>Reply to user emails</strong>. Common questions:
                <ul className="list-circle list-inside ml-4 mt-1 space-y-1">
                  <li>
                    "I forgot my password" → tell them to use Forgot Password,
                    or you can resend from /admin/users.
                  </li>
                  <li>
                    "I'm new at this library, no account" → create one for them
                    at /signup.
                  </li>
                  <li>
                    "What does this field mean?" → refer to last year's JEAL
                    report + current survey guidelines.
                  </li>
                  <li>
                    "Should we fill the e-resource forms?" — choosing to fill
                    AV/EBook/EJournal is voluntary per institution.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Nudge a specific institution</strong>: open{' '}
                <Code>/admin/users</Code>, find that library's contact, click
                the ✉️ "Send Opening Email" icon on their card. It sends one
                email using the <Code>individual_open_forms</Code> template.
              </li>
              <li>
                <strong>Impersonate (view as another library)</strong>: simulate
                logging in as a member to see how far they've filled. See 3.D.6
                InstitutionSwitcher.
              </li>
            </>
          )}
        </ul>

        <Callout
          type="tip"
          lang={lang}
          title={{
            zh: '提示：保留电话/Slack 等带外渠道',
            en: 'Tip: keep an out-of-band channel',
          }}
        >
          {lang === 'zh'
            ? '总有人电话或 Slack 联系你而不是发邮件。提前在 CEAL 通讯录公布你的电话/Slack/手机号，可以避免邮件被忽视。'
            : "Some people will phone or Slack you instead of emailing. Publish your phone/Slack in the CEAL directory ahead of time so urgent issues don't get buried in email."}
        </Callout>
      </MonthCard>

      {/* ---------- 2.6 Late Nov Reminder ---------- */}
      <SectionH3
        id="s-2-6"
        lang={lang}
        zh="2.6 11 月底：自动 1 周关闭提醒"
        en="2.6 Late November: Auto 1-Week Closing Reminder"
      />

      <MonthCard
        lang={lang}
        color="amber"
        month={{
          zh: '11 月 25 日左右（关闭日 - 7 天）',
          en: '~Nov 25 (closing - 7 days)',
        }}
        title={{
          zh: '🤖 Cron 自动发关闭提醒广播',
          en: '🤖 Cron auto-sends the closing-reminder broadcast',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              当 SurveySession 的 <Code>closingDate</Code> 进入"还有 7 天"窗口
              (<Code>closingDate - 7d &lt;= now &lt; closingDate</Code>)，
              且 <Code>notifiedClosingReminder=false</Code>，cron 会自动发
              <Code>broadcast_closing_reminder</Code> 模板。
            </>
          }
          en={
            <>
              When a SurveySession's <Code>closingDate</Code> enters the
              "within 7 days" window (
              <Code>closingDate - 7d &lt;= now &lt; closingDate</Code>) and{' '}
              <Code>notifiedClosingReminder=false</Code>, cron auto-sends the{' '}
              <Code>broadcast_closing_reminder</Code> template.
            </>
          }
        />
        <P
          lang={lang}
          zh="这封邮件会催还没填完的机构赶紧提交。你不用做任何事——但应该确认它发出去了。"
          en="This email nudges institutions that haven't finished. You don't need to do anything — but you should verify it went out."
        />
        <Callout
          type="info"
          lang={lang}
          title={{
            zh: '验证方式',
            en: 'How to verify',
          }}
        >
          {lang === 'zh' ? (
            <>
              ① 检查自己的邮箱有这封提醒；② Resend Dashboard → Broadcasts 看记录；③
              <Code>/admin/audit-logs</Code> 找
              <Code>CREATE / EmailBroadcast / auto:broadcast_closing_reminder:[year]</Code>。
            </>
          ) : (
            <>
              (1) Check your own inbox for the reminder; (2) Resend Dashboard →
              Broadcasts to see the entry; (3) <Code>/admin/audit-logs</Code>{' '}
              search for{' '}
              <Code>
                CREATE / EmailBroadcast / auto:broadcast_closing_reminder:[year]
              </Code>
              .
            </>
          )}
        </Callout>
      </MonthCard>

      {/* ---------- 2.7 Dec 2 Closing ---------- */}
      <SectionH3
        id="s-2-7"
        lang={lang}
        zh="2.7 12 月 2 日：自动关表日"
        en="2.7 December 2: Auto-Closing Day"
      />

      <MonthCard
        lang={lang}
        color="red"
        month={{ zh: '12 月 3 日 8am UTC', en: 'Dec 3, 8am UTC' }}
        title={{
          zh: '🤖 Cron 自动关表（注意是 12/3 凌晨执行，因为 12/2 11:59pm PT 之后才到）',
          en: '🤖 Cron auto-closes forms (runs Dec 3 dawn — because PT 11:59pm 12/2 = UTC 7:59am 12/3)',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              SurveySession 的 <Code>closingDate</Code> 是 12/2 PT 23:59 = 12/3 UTC 07:59。
              Vercel cron 在 12/3 UTC 08:00 跑（即关闭后第 1 分钟），找到符合条件的 session：
            </>
          }
          en={
            <>
              The SurveySession's <Code>closingDate</Code> is 12/2 PT 23:59 =
              12/3 UTC 07:59. Vercel cron runs at 12/3 UTC 08:00 (the first
              minute after closing) and finds matching sessions:
            </>
          }
        />
        <ol className="list-decimal list-inside space-y-1 my-2 text-sm">
          {lang === 'zh' ? (
            <>
              <li>
                对所有 Library_Year 执行 <Code>{'updateMany { is_open_for_editing: false }'}</Code>。
              </li>
              <li>
                <strong>验证</strong>所有表确实已关——如果还有 open，throw error。
              </li>
              <li>
                <strong>仅发邮件给 Super Admin</strong>（不发给普通用户！）。
                你会收到一封"Forms closed for [year]"的确认。
              </li>
              <li>
                标记 <Code>notifiedOnClose=true</Code>。
              </li>
              <li>
                写审计日志 <Code>SYSTEM_CLOSE_FORMS</Code>。
              </li>
            </>
          ) : (
            <>
              <li>
                Run <Code>{'updateMany { is_open_for_editing: false }'}</Code>{' '}
                on all Library_Year rows.
              </li>
              <li>
                <strong>Verify</strong> all forms are indeed closed — if any are
                still open, throw an error.
              </li>
              <li>
                <strong>Email Super Admins only</strong> (NOT regular users!).
                You'll receive a "Forms closed for [year]" confirmation.
              </li>
              <li>
                Mark <Code>notifiedOnClose=true</Code>.
              </li>
              <li>
                Write audit log <Code>SYSTEM_CLOSE_FORMS</Code>.
              </li>
            </>
          )}
        </ol>

        <Callout
          type="warning"
          lang={lang}
          title={{
            zh: '关表后非 Super Admin 不能再改',
            en: 'Non-Super-Admins cannot edit after close',
          }}
        >
          {lang === 'zh' ? (
            <>
              关表后 Member/Editor 用户访问表单页会看到"Read-Only Mode"提示。Super Admin
              可以继续编辑，但表单上方会显示一个带 🔒 锁图标的提示
              <Code>isPrivilegedPostClosing=true</Code>，让你知道当前编辑的是已关闭的数据。
            </>
          ) : (
            <>
              After close, Member/Editor users see a "Read-Only Mode" notice on
              form pages. Super Admin can still edit, but a 🔒 lock-icon
              banner appears (<Code>isPrivilegedPostClosing=true</Code>) to
              remind you that you're editing closed data.
            </>
          )}
        </Callout>
      </MonthCard>

      {/* ---------- 2.8 December Review ---------- */}
      <SectionH3
        id="s-2-8"
        lang={lang}
        zh="2.8 12 月：审核数据 & 补救漏交"
        en="2.8 December: Review Data & Patch Missing Submissions"
      />

      <MonthCard
        lang={lang}
        color="amber"
        month={{ zh: '12 月（关表后）', en: 'December (post-close)' }}
        title={{
          zh: '数据清理、补救、给宽限的机构开窗口',
          en: 'Data cleanup, patch missing, give extensions to stragglers',
        }}
      >
        <ul className="list-disc list-inside space-y-2 my-2 text-sm">
          {lang === 'zh' ? (
            <>
              <li>
                <strong>巡视 Participation Status</strong>：哪些机构哪些表还是空白？
                哪些数字异常（去年 10 万册突然变成 1 万册）？
              </li>
              <li>
                <strong>给漏交的机构开"绿色通道"</strong>：
                <ol className="list-decimal list-inside ml-4 mt-1">
                  <li>选项 A（推荐）：你自己作为 Super Admin 进入 /admin/forms/[libid]/[form] 帮他录入。</li>
                  <li>选项 B：去 /admin/broadcast 点 "Re-open Forms"，所有人都能改。完事记得关回去。</li>
                  <li>选项 C：联系开发者直接改数据库（最后手段）。</li>
                </ol>
              </li>
              <li>
                <strong>校核异常数据</strong>。用 /admin/reports 跨年比较，找出
                3 倍以上的跳变。和当事机构核实。
              </li>
              <li>
                <strong>处理新加入机构的历史空档</strong>：他们 Library_Year 只从今年开始，
                往年数据是空的。这一般没事，因为他们也没在统计里。
              </li>
            </>
          ) : (
            <>
              <li>
                <strong>Patrol Participation Status</strong>: which institutions
                left which forms empty? Any anomalous numbers (last year 100k
                volumes, this year suddenly 10k)?
              </li>
              <li>
                <strong>Give "green channel" to stragglers</strong>:
                <ol className="list-decimal list-inside ml-4 mt-1">
                  <li>
                    Option A (recommended): as Super Admin, go to
                    /admin/forms/[libid]/[form] and enter the data for them.
                  </li>
                  <li>
                    Option B: in /admin/broadcast click "Re-open Forms" — opens
                    for everyone. Remember to close again afterwards.
                  </li>
                  <li>
                    Option C: contact developer to edit DB directly (last
                    resort).
                  </li>
                </ol>
              </li>
              <li>
                <strong>Validate anomalies</strong>: use /admin/reports to
                cross-year compare. Investigate 3x+ jumps with the institution.
              </li>
              <li>
                <strong>Handle new-joiners' empty history</strong>: their
                Library_Year only starts this year — past years are empty.
                Usually fine since they weren't in past stats.
              </li>
            </>
          )}
        </ul>
      </MonthCard>

      {/* ---------- 2.9 Jan Reports ---------- */}
      <SectionH3
        id="s-2-9"
        lang={lang}
        zh="2.9 1 月：导出年终报告交给 JEAL"
        en="2.9 January: Export Year-End Reports for JEAL"
      />

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '1 月', en: 'January' }}
        title={{
          zh: '生成 Excel + PDF 报告，发给 JEAL 编辑',
          en: 'Generate Excel + PDF reports, send to JEAL editor',
        }}
      >
        <ol className="list-decimal list-inside space-y-2 my-2 text-sm">
          {lang === 'zh' ? (
            <>
              <li>
                访问 <Code>/admin/year-end-reports</Code>。这页能批量导出本年度的
                "supplementary reports"（各种分项 Excel/PDF 文件）。
              </li>
              <li>
                同时访问 <Code>/admin/participation-reports</Code>，导出本年度参与情况报告。
              </li>
              <li>
                把所有导出文件打包发给 JEAL 编辑（具体编辑联系人由 CEAL 委员会定，参见 1.1）。
              </li>
              <li>
                通常 JEAL 编辑会反馈一些修订意见。修完后再导出一遍。
              </li>
              <li>
                同时通知 CEAL 委员会，告知已交稿。
              </li>
            </>
          ) : (
            <>
              <li>
                Go to <Code>/admin/year-end-reports</Code>. Batch-export this
                year's "supplementary reports" (various Excel/PDF subreports).
              </li>
              <li>
                Also go to <Code>/admin/participation-reports</Code>, export
                this year's participation report.
              </li>
              <li>
                Bundle all exported files and email to the JEAL editor (contact
                provided by CEAL committee — see 1.1).
              </li>
              <li>
                JEAL editors usually send back revision notes. Re-export after
                fixes.
              </li>
              <li>
                Notify the CEAL committee that the submission has been made.
              </li>
            </>
          )}
        </ol>
      </MonthCard>

      {/* ---------- 2.10 Feb Upload PDF ---------- */}
      <SectionH3
        id="s-2-10"
        lang={lang}
        zh="2.10 2 月：上传 JEAL PDF 链接"
        en="2.10 February: Upload JEAL PDF Link"
      />

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '2 月（JEAL 出版后）', en: 'February (after JEAL publishes)' }}
        title={{
          zh: '把 JEAL PDF 链接放到 /admin/published-reports',
          en: 'Add JEAL PDF link to /admin/published-reports',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              JEAL 出版后会有一个稳定 URL（通常托管在 BYU ScholarsArchive）。
              访问 <Code>/admin/published-reports</Code>，点 "Add new"，填入：
            </>
          }
          en={
            <>
              Once JEAL publishes, you get a stable URL (usually on BYU
              ScholarsArchive). Go to <Code>/admin/published-reports</Code>,
              click "Add new", and fill in:
            </>
          }
        />
        <ul className="list-disc list-inside space-y-1 my-2 text-sm">
          <li>
            <strong>Academic Year</strong>:{' '}
            {lang === 'zh' ? '本年度数字（默认当前年-1）' : "this year's number (defaults to current year - 1)"}
          </li>
          <li>
            <strong>Title</strong>: e.g. "2025 Annual Statistical Survey of CEAL Library Members"
          </li>
          <li>
            <strong>URL</strong>: {lang === 'zh' ? 'JEAL 文章的稳定链接' : 'JEAL article stable URL'}
          </li>
          <li>
            <strong>Journal</strong>: "Journal of East Asian Libraries, vol. X, no. Y, [date]"
          </li>
          <li>
            <strong>Is Published</strong>:{' '}
            {lang === 'zh' ? '勾上即可立刻在首页/报告页展示' : 'check to immediately surface on homepage / reports page'}
          </li>
        </ul>
        <Callout
          type="tip"
          lang={lang}
          title={{
            zh: '为什么这一步很重要',
            en: 'Why this step matters',
          }}
        >
          {lang === 'zh'
            ? '首页和 reports 页面会自动用 lib/publishedReports.ts 的逻辑按 decade 分组展示这些链接，让访客能直接看到所有历年报告。如果你不录入，看不到。'
            : 'The homepage and reports page auto-groups these links by decade via lib/publishedReports.ts, letting visitors see all past reports. If you don\'t enter it, no one sees it.'}
        </Callout>
      </MonthCard>

      {/* ---------- 2.11 Feb Publish year ---------- */}
      <SectionH3
        id="s-2-11"
        lang={lang}
        zh="2.11 2-3 月：把本年度标记为 Published"
        en="2.11 Feb-Mar: Mark This Year as Published"
      />

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '2 - 3 月', en: 'Feb - Mar' }}
        title={{
          zh: '在 /libraries → Participation Status 把所有机构勾 Published',
          en: 'Tick "Published" for all institutions in /libraries → Participation Status',
        }}
      >
        <P
          lang={lang}
          zh={
            <>
              这是<strong>对 Member 用户开放</strong>的关键开关。Member 在
              <Code>/admin/reports</Code> 上能看到的年份，
              <strong>仅限那些 Entry_Status.espublished=true 的年份</strong>。
              Super Admin / Editor / Assistant Admin 看全部年份，不受此限制。
            </>
          }
          en={
            <>
              This is the key switch <strong>that unlocks data for Members</strong>. In{' '}
              <Code>/admin/reports</Code>, Members only see years where{' '}
              <strong>Entry_Status.espublished=true</strong>. Super Admin /
              Editor / Assistant Admin see all years regardless.
            </>
          }
        />
        <ol className="list-decimal list-inside space-y-1 my-2 text-sm">
          {lang === 'zh' ? (
            <>
              <li>
                访问 <Code>/libraries</Code>，切到 "Participation Status" 标签页。
              </li>
              <li>顶上的年份选择器选刚出版的那年。</li>
              <li>右上角点 "Edit"（铅笔图标）。</li>
              <li>每个机构右侧的 "Published" 开关全部打开。</li>
              <li>点 "Save Changes"。</li>
            </>
          ) : (
            <>
              <li>
                Go to <Code>/libraries</Code>, switch to the "Participation
                Status" tab.
              </li>
              <li>Select the just-published year in the year picker.</li>
              <li>Click "Edit" (pencil icon) top-right.</li>
              <li>
                Toggle ON the "Published" switch for every institution.
              </li>
              <li>Click "Save Changes".</li>
            </>
          )}
        </ol>
        <Callout
          type="warning"
          lang={lang}
          title={{
            zh: '不要混淆两个 "Published"',
            en: 'Don\'t confuse the two "Published" concepts',
          }}
        >
          {lang === 'zh' ? (
            <>
              <strong>Published Report (PDF) 链接</strong>（2.10）是给所有人看 JEAL 文章。
              <strong>Entry_Status.espublished</strong>（这里 2.11）是控制 Member 在
              /admin/reports 上能看到哪些年的数据。两者是独立的，必须分别做。
            </>
          ) : (
            <>
              <strong>Published Report (PDF) link</strong> (2.10) is the link to
              the JEAL article visible to everyone.{' '}
              <strong>Entry_Status.espublished</strong> (this section 2.11)
              controls which years a Member can see in /admin/reports. They are
              independent — you must do both.
            </>
          )}
        </Callout>
      </MonthCard>

      {/* ---------- 2.12 Year-round tasks ---------- */}
      <SectionH3
        id="s-2-12"
        lang={lang}
        zh="2.12 任意时刻：日常事务"
        en="2.12 Year-Round Tasks"
      />

      <MonthCard
        lang={lang}
        color="gray"
        month={{ zh: '全年任何时候', en: 'Any time of year' }}
        title={{
          zh: '不分季节的常规工作',
          en: 'Routine work, season-agnostic',
        }}
      >
        <Checklist
          lang={lang}
          items={[
            {
              zh: '新机构申请加入 CEAL：在 /create 添加 → 在 /signup 给他们建联系人账号 → 跑 /admin/survey-dates 给他们生成本年 Library_Year',
              en: 'New institution joins CEAL: add at /create → create their contact at /signup → run /admin/survey-dates to give them this year\'s Library_Year',
            },
            {
              zh: '老用户离职：在 /admin/users 找到他，点垃圾桶图标删除（保留审计日志，删除登录+角色+图书馆关联）',
              en: 'Existing user leaves: find them in /admin/users, click trash icon (preserves audit log, removes login + role + library association)',
            },
            {
              zh: '修改某用户的角色：/admin/users → 点 Edit Roles',
              en: 'Modify a user\'s roles: /admin/users → click Edit Roles',
            },
            {
              zh: '某机构改名/换地址：/libraries → 点该机构 → Edit',
              en: 'Institution renames / changes address: /libraries → click the library → Edit',
            },
            {
              zh: '电子资源编辑：让 E-Resource Editor（Role 3）去 /admin/survey/{avdb,ebook,ejournal} 增删改 List_* 主表',
              en: 'E-resource editing: have E-Resource Editor (Role 3) go to /admin/survey/{avdb,ebook,ejournal} to add/edit/delete List_* tables',
            },
            {
              zh: '审计可疑活动：定期翻 /admin/audit-logs，重点看失败的登录尝试、批量删除',
              en: 'Audit suspicious activity: periodically scan /admin/audit-logs — focus on failed logins, bulk deletes',
            },
            {
              zh: '回应来自统计委员会的"补数据"请求：例如有人发现某机构 5 年前数据有误，需要修正',
              en: "Respond to Statistics Committee 'fix old data' requests: e.g. someone discovers an error from 5 years ago that needs correcting",
            },
            {
              zh: '每季度复查 Resend Audience 名单，确保所有 active user 都在里面',
              en: 'Quarterly: review Resend Audience list, ensure all active users are included',
            },
          ]}
        />
      </MonthCard>

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
            读完第 2 部分，你已经知道一年要做什么、什么时候做。接下来
            <PageLink href="#part-3">
              第 3 部分
            </PageLink>
            会详细介绍每个 Admin 页面的"按钮级"用法，遇到具体页面查它。
          </>
        ) : (
          <>
            After reading Part 2 you know what to do all year and when. Next,{' '}
            <PageLink href="#part-3">Part 3</PageLink> covers each Admin page at
            the button level — refer to it for any specific page.
          </>
        )}
      </Callout>
    </div>
  )
}
