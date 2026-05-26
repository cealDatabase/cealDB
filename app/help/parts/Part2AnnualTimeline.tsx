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
  GuideTable,
  PageLink,
} from './_shared'

export default function Part2AnnualTimeline({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-2"
        lang={lang}
        zh="第 2 部分 · 年度时间表"
        en="Part 2 · The Annual Timeline"
      />
      <P
        lang={lang}
        zh="把这一部分当作日历。每年同样的节奏：10 月 1 日开表 → 12 月 2 日关表 → 2 月发表。每一步该做什么、该收到什么邮件，下面逐月讲。"
        en="Think of this part as your calendar. The yearly rhythm is identical: open Oct 1 → close Dec 2 → publish in February. Below is what happens (and what email you should expect) at each point."
      />

      {/* ---------- 2.1 Key dates ---------- */}
      <SectionH3
        id="s-2-1"
        lang={lang}
        zh="2.1 关键日期一览"
        en="2.1 Key Dates at a Glance"
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '日期', en: 'Date' },
          { zh: '发生什么', en: 'What happens' },
          { zh: '你需要做什么', en: 'What you do' },
        ]}
        rows={[
          [
            { zh: '约 9 月中', en: 'Around mid-September' },
            { zh: 'CEAL 发"即将开放"预公告邮件', en: 'CEAL sends "opening soon" pre-announcement' },
            { zh: '把日期记到日历上；开始预收数据', en: 'Add dates to calendar; start gathering data' },
          ],
          [
            { zh: '10 月 1 日（Pacific Time 9:00 PM 后）', en: 'Oct 1 (after 9:00 PM Pacific)' },
            { zh: '🟢 10 张表正式开放编辑', en: '🟢 The 10 forms officially open for editing' },
            { zh: '登录 → 开始填表', en: 'Log in → start filling' },
          ],
          [
            { zh: '10 月–11 月', en: 'October–November' },
            { zh: '自由填写时段（约 60 天）', en: 'Free filling period (~60 days)' },
            { zh: '随时存草稿；不必一次填完', en: 'Save draft anytime; no need to finish in one go' },
          ],
          [
            { zh: '约 11 月 25 日', en: 'Around Nov 25' },
            { zh: 'CEAL 发提醒邮件', en: 'CEAL sends a reminder email' },
            { zh: '复查没填完的表；准备提交', en: 'Review remaining forms; prepare to submit' },
          ],
          [
            { zh: '12 月 2 日（Pacific Time 11:59 PM）', en: 'Dec 2 (11:59 PM Pacific)' },
            { zh: '🔴 表单自动关闭', en: '🔴 Forms auto-close' },
            { zh: '必须在此之前点 Submit', en: 'Must click Submit before this' },
          ],
          [
            { zh: '12 月–1 月', en: 'December–January' },
            { zh: 'CEAL 审核、整理数据', en: 'CEAL reviews and compiles data' },
            { zh: '可能被 CEAL 邮件核实异常数字', en: 'May be emailed to verify unusual numbers' },
          ],
          [
            { zh: '约 2 月', en: 'Around February' },
            { zh: 'JEAL 学刊发表年度报告 PDF', en: 'JEAL journal publishes annual report PDF' },
            { zh: '主页能查全行业汇总数据', en: 'Aggregated data viewable on homepage' },
          ],
        ]}
      />

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '所有时间都按 Pacific Time（太平洋时区）',
          en: 'All times are Pacific Time',
        }}
      >
        {lang === 'zh'
          ? '系统以美国西海岸时间为准。如果你在东岸，关表是 12 月 3 日凌晨 2:59 AM ET；如果你在亚洲，是 12 月 3 日下午。如果你在最后一天提交，请按 Pacific Time 计算！'
          : 'The system uses U.S. West Coast time. If you\'re on the East Coast, closing is at 2:59 AM ET on Dec 3; in Asia, the afternoon of Dec 3. If submitting on the last day, count in Pacific Time!'}
      </Callout>

      {/* ---------- 2.2 Oct 1 ---------- */}
      <SectionH3
        id="s-2-2"
        lang={lang}
        zh="2.2 10 月 1 日：开表日"
        en="2.2 Oct 1: Opening Day"
      />

      <MonthCard
        lang={lang}
        color="green"
        month={{ zh: '10 月 1 日', en: 'October 1' }}
        title={{ zh: '🟢 表单开放', en: '🟢 Forms Open' }}
      >
        <ul className="list-disc list-inside space-y-1">
          {lang === 'zh' ? (
            <>
              <li>
                <strong>你应当收到的邮件</strong>：标题包含 “CEAL Annual Statistics
                Survey Now Open” 之类。从{' '}
                <Code>noreply@cealstats.org</Code> 或 CEAL 邮件列表发出。
              </li>
              <li>
                <strong>登录后会看到</strong>：每张表旁边的状态变成
                <Code>Active</Code> / <Code>Not Started</Code>。
              </li>
              <li>
                <strong>建议第一件事</strong>：先打开 1–2 张表，点{' '}
                <Code>Import Last Year</Code>{' '}
                按钮，把去年同表的数据拉过来——这能给你一个起点，避免从零开始。
              </li>
            </>
          ) : (
            <>
              <li>
                <strong>Email you should receive</strong>: subject contains
                something like “CEAL Annual Statistics Survey Now Open”. From{' '}
                <Code>noreply@cealstats.org</Code> or the CEAL mailing list.
              </li>
              <li>
                <strong>After login you'll see</strong>: each form status
                changes to <Code>Active</Code> / <Code>Not Started</Code>.
              </li>
              <li>
                <strong>First thing to do</strong>: open 1–2 forms and click the{' '}
                <Code>Import Last Year</Code> button — this pulls in last year's
                data and saves you from starting from zero.
              </li>
            </>
          )}
        </ul>
      </MonthCard>

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '没收到开表邮件？',
          en: 'Did not receive the opening email?',
        }}
      >
        {lang === 'zh'
          ? '① 看垃圾邮件；② 直接访问 cealstats.org 看登录页有没有变化；③ 如果都没动静，联系 CEAL Statistics Committee 确认你的账号是否在订阅名单里。'
          : '(1) Check spam; (2) Visit cealstats.org directly to see if the login page changed; (3) If nothing, contact the CEAL Statistics Committee to confirm your account is in the subscription list.'}
      </Callout>

      {/* ---------- 2.3 Oct-Nov ---------- */}
      <SectionH3
        id="s-2-3"
        lang={lang}
        zh="2.3 10 月–11 月：填表阶段"
        en="2.3 October–November: Filling Period"
      />

      <P
        lang={lang}
        zh="60 天填 10 张表，平均一张 6 天。不要全堆到最后一周。建议这样安排："
        en="60 days to fill 10 forms — averaging 6 days per form. Don't pile it all into the last week. Suggested pacing:"
      />

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '10 月上旬', en: 'Early October' }}
        title={{
          zh: '先填"用导入就能填完"的表',
          en: 'Start with import-friendly forms',
        }}
      >
        {lang === 'zh'
          ? 'Monographic Acquisitions / Volume Holdings / Serials — 这些表大部分数字跟去年差别不大，用 Import 拉过来调调就行。'
          : 'Monographic Acquisitions / Volume Holdings / Serials — most numbers don\'t change much year over year; import and tweak.'}
      </MonthCard>

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '10 月下旬', en: 'Late October' }}
        title={{
          zh: '财政 + 人员',
          en: 'Fiscal + Personnel',
        }}
      >
        {lang === 'zh'
          ? '财政表需要你从财务部门要本年度数字；人员表要点本馆人头数（FTE）。这两张表通常要跨部门沟通，预留 1–2 周。'
          : 'Fiscal form needs current-year figures from your finance department; Personnel needs FTE counts. These usually require cross-department coordination — allow 1–2 weeks.'}
      </MonthCard>

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '11 月上旬', en: 'Early November' }}
        title={{
          zh: 'Public Services + Electronic',
          en: 'Public Services + Electronic',
        }}
      >
        {lang === 'zh'
          ? '公共服务（参考咨询、ILL 等）需要从 ILL 系统、统计报表拉数据；Electronic 资源订阅状态可能需要联系订阅经理。'
          : 'Public Services (reference, ILL) needs data from your ILL system and stat reports; Electronic resource subscription status may require checking with your subscriptions manager.'}
      </MonthCard>

      <MonthCard
        lang={lang}
        color="blue"
        month={{ zh: '11 月中旬', en: 'Mid-November' }}
        title={{
          zh: '复查、点 Submit',
          en: 'Review and click Submit',
        }}
      >
        {lang === 'zh'
          ? '所有 10 张表过一遍，对照上一年看哪一项变化太大；该解释的在 Notes 里写清楚；逐张点 Submit。'
          : 'Walk through all 10 forms, compare to last year for outsized changes, explain in Notes if needed, then Submit each one.'}
      </MonthCard>

      {/* ---------- 2.4 Reminder ---------- */}
      <SectionH3
        id="s-2-4"
        lang={lang}
        zh="2.4 11 月底：提醒邮件"
        en="2.4 Late November: Reminder Email"
      />

      <MonthCard
        lang={lang}
        color="amber"
        month={{ zh: '约 11 月 25 日', en: 'Around November 25' }}
        title={{ zh: '🟡 自动提醒邮件', en: '🟡 Automatic Reminder Email' }}
      >
        {lang === 'zh'
          ? '系统在关表前约一周自动给所有成员发提醒。如果你 10 张表都点过 Submit，可以放心忽略这封邮件——它不区分谁填没填，是统一群发。'
          : 'The system auto-sends a reminder to all members about a week before close. If you\'ve already Submitted all 10 forms, ignore this email — it\'s sent to everyone uniformly, not targeted at incomplete submissions.'}
      </MonthCard>

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '怎么确认自己已经"全提交"了',
          en: 'How to confirm you\'ve "fully submitted"',
        }}
      >
        {lang === 'zh'
          ? '在 /admin Dashboard 上看每张表旁边的状态。10 张全显示 "Submitted" 才算完。如果显示 "Draft" 说明只存了草稿没提交，要回去点 Submit。'
          : 'On /admin dashboard, check the status next to each form. All 10 must show "Submitted". Any "Draft" means only saved — go back and click Submit.'}
      </Callout>

      {/* ---------- 2.5 Closing ---------- */}
      <SectionH3
        id="s-2-5"
        lang={lang}
        zh="2.5 12 月 2 日：截止日"
        en="2.5 December 2: Deadline"
      />

      <MonthCard
        lang={lang}
        color="red"
        month={{ zh: '12 月 2 日 11:59 PM PT', en: 'Dec 2, 11:59 PM PT' }}
        title={{ zh: '🔴 表单关闭', en: '🔴 Forms Close' }}
      >
        <ul className="list-disc list-inside space-y-1">
          {lang === 'zh' ? (
            <>
              <li>系统自动把所有表单切到只读状态。</li>
              <li>之后任何输入框都灰掉，Submit 按钮消失。</li>
              <li>已经 Submit 的数据保留；只是不能再改。</li>
              <li>当晚你应当收到 “Forms Now Closed” 邮件确认。</li>
            </>
          ) : (
            <>
              <li>The system flips all forms to read-only.</li>
              <li>All input boxes go grey; Submit button disappears.</li>
              <li>Already-submitted data is preserved — just not editable.</li>
              <li>You should receive a “Forms Now Closed” confirmation that evening.</li>
            </>
          )}
        </ul>
      </MonthCard>

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '没赶上 12/2 怎么办？',
          en: 'Missed the Dec 2 deadline?',
        }}
      >
        {lang === 'zh'
          ? '不要慌，但要快。立刻邮件 CEAL Statistics Committee，说明：①你的机构；②你想提交哪些表；③解释原因（数据没到位 / 病假 / 出差等）。Committee 有权短暂重开表单让你补完，或者帮你直接把数字录进去。但请尽量不要等到这一步。'
          : 'Don\'t panic, but act fast. Email the CEAL Statistics Committee right away with: (1) your institution; (2) which forms you need to submit; (3) the reason (data delayed / sick leave / travel). The Committee can briefly reopen the form for you or enter the numbers directly. But try not to get to this point.'}
      </Callout>

      {/* ---------- 2.6 Publication ---------- */}
      <SectionH3
        id="s-2-6"
        lang={lang}
        zh="2.6 2 月–3 月：报告发表"
        en="2.6 February–March: Report Published"
      />

      <MonthCard
        lang={lang}
        color="green"
        month={{ zh: '约 2 月', en: 'Around February' }}
        title={{ zh: '📖 JEAL 发表年度报告', en: '📖 JEAL Publishes Annual Report' }}
      >
        {lang === 'zh' ? (
          <>
            <ul className="list-disc list-inside space-y-1">
              <li>
                JEAL（Journal of East Asian Libraries）2 月号刊登 CEAL 年度
                统计报告 PDF。
              </li>
              <li>
                CEAL Committee 在系统里把本年度数据标记为 "Published"，
                此后主页和 /reports 路径就能查到所有机构的汇总。
              </li>
              <li>
                你的机构数据也会在主页上对其他成员公开（数字本身，
                不含你的备注）。
              </li>
            </ul>
          </>
        ) : (
          <>
            <ul className="list-disc list-inside space-y-1">
              <li>
                The Feb issue of JEAL (Journal of East Asian Libraries)
                publishes the CEAL annual statistics report PDF.
              </li>
              <li>
                CEAL Committee marks this year's data as "Published" inside the
                system; after that the homepage and /reports show aggregated
                data for all institutions.
              </li>
              <li>
                Your library's numbers become visible to other members on the
                homepage (numbers only — your Notes stay private).
              </li>
            </ul>
          </>
        )}
      </MonthCard>

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '一年结束了！',
          en: 'That\'s the cycle!',
        }}
      >
        {lang === 'zh'
          ? '到这里你这一年的工作就结束了。下个 10 月 1 日再回来。3 月–9 月期间，系统对你来说基本是只读：能查历年数据，但不用填什么。'
          : 'That\'s the end of your work for this year. Come back next Oct 1. During March–September the system is essentially read-only for you: you can view historical data, but nothing to fill in.'}
      </Callout>

      <P
        lang={lang}
        zh={
          <>
            接下来 <PageLink href="#part-3">第 3 部分</PageLink>{' '}
            一张一张讲清楚 10 张表到底要填什么。
          </>
        }
        en={
          <>
            Next, <PageLink href="#part-3">Part 3</PageLink> explains each of
            the 10 forms in detail.
          </>
        }
      />
    </div>
  )
}
