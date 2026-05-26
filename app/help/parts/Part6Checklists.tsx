'use client'

import React from 'react'
import {
  PartProps,
  SectionH2,
  SectionH3,
  P,
  Callout,
  Checklist,
  PageLink,
} from './_shared'

export default function Part6Checklists({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-6"
        lang={lang}
        zh="第 6 部分 · 检查清单"
        en="Part 6 · Checklists"
      />
      <P
        lang={lang}
        zh="打印出来贴在桌上的实用清单。3 张：开表前 / 提交前 / 关表后。每张都可以点击勾选追踪进度。"
        en="Print and tape these to your desk. Three lists: before opening / before submit / after closing. Each item is clickable to track progress."
      />

      <Callout
        type="tip"
        lang={lang}
        title={{ zh: '打印小贴士', en: 'Printing tip' }}
      >
        {lang === 'zh'
          ? '点页面右上角的"打印"按钮，浏览器会以打印友好格式渲染（隐藏侧边栏和按钮）。如果只想打印这一部分，先滚动到 6.1，再在打印对话框里选 "Selection / 选区"。'
          : 'Click the "Print" button at the top of the page. The browser renders the guide in print-friendly mode (hides sidebar and buttons). To print only this part, scroll to 6.1 first, then choose "Selection" in the print dialog.'}
      </Callout>

      {/* 6.1 Pre-opening */}
      <SectionH3
        id="s-6-1"
        lang={lang}
        zh="6.1 ✅ 开表前准备清单（9 月底 / 10 月初）"
        en="6.1 ✅ Before Opening Day (Late Sep / Early Oct)"
      />
      <P
        lang={lang}
        zh="在 10 月 1 日表单开放前完成这些。能让你 10 月一开始就动手，不用临时找数据。"
        en="Finish these before forms open on Oct 1. You'll start filling immediately on opening day without scrambling for data."
      />
      <Checklist
        lang={lang}
        items={[
          {
            zh: '确认你能登录 cealstats.org（用上次的密码试一次；登不进就提前点 Forgot Password）',
            en: 'Confirm you can log in to cealstats.org (try your old password; if blocked, click Forgot Password ahead of time)',
          },
          {
            zh: '把 cealstats.org/admin 加书签',
            en: 'Bookmark cealstats.org/admin',
          },
          {
            zh: '问财务部门要本财政年（7/1 上一年–6/30 本年）的东亚馆所有支出明细：专著、期刊、电子资源、endowment 收入',
            en: 'Get from Finance: this fiscal year (7/1 prev–6/30 curr) EA-collection expenditures: monographs, serials, e-resources, endowment income',
          },
          {
            zh: '问 HR 拿东亚相关人员名单 + 每人 FTE 比例',
            en: 'Get from HR: list of EA-related staff + each person\'s FTE fraction',
          },
          {
            zh: '从 ILS 拉本财政年的新增/撤架/总馆藏报表（按语言）',
            en: 'Pull from ILS: this fiscal year added / withdrawn / total holdings reports (by language)',
          },
          {
            zh: '从 ILL 系统拉本财政年 lending + borrowing 的 filled / unfilled 数',
            en: 'Pull from ILL system: this fiscal year lending + borrowing filled / unfilled counts',
          },
          {
            zh: '从订阅经理拿本年订阅的电子数据库 + 电子书集合清单（含年费）',
            en: 'Get from subscriptions manager: this year\'s e-database + e-book subscriptions (with annual fees)',
          },
          {
            zh: '把所有数字汇总到一个 Excel 表里，方便填写时一行行对照',
            en: 'Consolidate all numbers into one Excel sheet for line-by-line reference while filling',
          },
          {
            zh: '日历上设提醒：10/1 开表 / 11/15 中期复查 / 11/30 必须 Submit / 12/2 关表',
            en: 'Set calendar reminders: 10/1 open / 11/15 mid-check / 11/30 must-submit / 12/2 close',
          },
        ]}
      />

      {/* 6.2 Pre-submit */}
      <SectionH3
        id="s-6-2"
        lang={lang}
        zh="6.2 ✅ 提交前自查清单（每张表都过一遍）"
        en="6.2 ✅ Pre-Submit Checklist (run on every form)"
      />
      <P
        lang={lang}
        zh="每张表在点 Submit 前，过一遍下面这 8 条。能拦掉 90% 的常见错。"
        en="Run through these 8 items on every form before clicking Submit. They catch 90% of common errors."
      />
      <Checklist
        lang={lang}
        items={[
          {
            zh: '所有数字字段都是<strong>纯整数</strong>，没有逗号、% 号、小数点（除非字段明确允许）',
            en: 'All number fields are <strong>whole integers</strong>, no commas, no %, no decimals (unless field allows)',
          },
          {
            zh: '没有空白字段 — 没数据的填 <strong>0</strong>',
            en: 'No blank fields — enter <strong>0</strong> where no data',
          },
          {
            zh: '货币字段一律 USD，不是日元/人民币/韩元原币',
            en: 'Currency fields are in USD, not original JPY/CNY/KRW',
          },
          {
            zh: '语言分类正确：CJK 材料按语言分；Non-CJK 仅指"关于东亚但非 CJK 语言"',
            en: 'Language assigned correctly: CJK by language; Non-CJK = about East Asia but in non-CJK language',
          },
          {
            zh: '与上一年比对：变化 &gt; 30% 的字段是否有原因？有的话写进 Notes',
            en: 'Compared with last year: if any field changed &gt; 30%, is there a reason? If yes, put it in Notes',
          },
          {
            zh: 'Subtotal 行的数字 = 各语言/类别之和（系统自动算，目测核对）',
            en: 'Subtotal row equals sum of language/category rows (auto-computed, eyeball it)',
          },
          {
            zh: 'Notes 字段：异常数据、财政年差异、合并/分馆口径 都已说明',
            en: 'Notes field: explained anomalies, fiscal-year differences, branch-merge scope',
          },
          {
            urgent: true,
            zh: '点了 <strong>Submit</strong>（不是 Save Draft）— 表单页面顶部状态变成 "Submitted"',
            en: 'Clicked <strong>Submit</strong> (not Save Draft) — status badge at top says "Submitted"',
          },
        ]}
      />

      <Callout
        type="warning"
        lang={lang}
        title={{ zh: '所有 10 张表都过一遍', en: 'Repeat for all 10 forms' }}
      >
        {lang === 'zh'
          ? '上面 8 条要在 10 张表上每张都过一遍。10 × 8 = 80 个检查项。听着多，每张表 5 分钟就行。'
          : 'Apply the 8 items to each of the 10 forms. 10 × 8 = 80 checks total. Sounds like a lot, but ~5 min per form.'}
      </Callout>

      {/* 6.3 After closing */}
      <SectionH3
        id="s-6-3"
        lang={lang}
        zh="6.3 ✅ 关表后核对清单（12 月初）"
        en="6.3 ✅ After Closing (Early December)"
      />
      <P
        lang={lang}
        zh="12/2 关表后，做这些来确认本年度任务真的完了。"
        en="After Dec 2 close, do these to confirm your year's work is truly complete."
      />
      <Checklist
        lang={lang}
        items={[
          {
            urgent: true,
            zh: '在 /admin Dashboard 上检查 10 张表的状态都是 "Submitted"',
            en: 'Confirm all 10 forms show "Submitted" on /admin Dashboard',
          },
          {
            zh: '收到了 "Forms Now Closed" 系统邮件',
            en: 'Received "Forms Now Closed" system email',
          },
          {
            zh: '下载本年度 PDF 报告（在 Statistics Reports 区域）做内部存档',
            en: 'Downloaded this year\'s PDF report (in Statistics Reports area) for internal archive',
          },
          {
            zh: '把所有 10 张表的最终数字另存一份 Excel，归档到机构知识库',
            en: 'Saved a final-number Excel for all 10 forms, archived to your institutional knowledge base',
          },
          {
            zh: '写一份"本年度填表笔记"：哪些数据从哪儿来、谁帮忙、有没有特殊情况，给明年的自己（或继任者）看',
            en: 'Wrote a "this year\'s filing notes": where each number came from, who helped, any special cases — for next-year you (or your successor)',
          },
          {
            zh: '如果发现已交数据有错 → 立刻邮件 CEAL Statistics Committee 请求修正',
            en: 'If you spot an error in submitted data → email CEAL Statistics Committee immediately for correction',
          },
        ]}
      />

      <Callout
        type="success"
        lang={lang}
        title={{ zh: '小结', en: 'Summary' }}
      >
        {lang === 'zh' ? (
          <>
            3 张清单——开表前、提交前、关表后——足够覆盖一整年。打印一份贴在桌上。
            最后 <PageLink href="#part-7">第 7 部分（FAQ + 术语表）</PageLink>{' '}
            把剩下零碎问题一次说清楚。
          </>
        ) : (
          <>
            Three checklists — before opening, before submit, after close —
            cover the whole year. Print and tape to your desk. Last,{' '}
            <PageLink href="#part-7">Part 7 (FAQ + Glossary)</PageLink>{' '}
            answers the loose ends.
          </>
        )}
      </Callout>
    </div>
  )
}
