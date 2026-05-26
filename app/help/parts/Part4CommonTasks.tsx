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

export default function Part4CommonTasks({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-4"
        lang={lang}
        zh="第 4 部分 · 常见操作"
        en="Part 4 · Common Tasks"
      />
      <P
        lang={lang}
        zh="这一部分手把手讲填表时最常用的 5 件事。"
        en="This part walks you through the 5 most common things you'll do while filling forms."
      />

      {/* ---------- 4.1 Save Draft vs Submit ---------- */}
      <SectionH3
        id="s-4-1"
        lang={lang}
        zh="4.1 Save Draft（存草稿）vs Submit（提交）"
        en="4.1 Save Draft vs Submit"
      />

      <P
        lang={lang}
        zh="每张表底部都有这两个按钮。它们的区别非常重要："
        en="Every form has these two buttons at the bottom. The difference is important:"
      />

      <div className="grid md:grid-cols-2 gap-3 my-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="font-semibold text-amber-900 mb-2">
            <Code>Save Draft</Code>
          </h4>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-800">
            {lang === 'zh' ? (
              <>
                <li>把当前输入保存到数据库（不会丢）</li>
                <li>状态：<strong>Draft</strong></li>
                <li>CEAL <strong>看不到</strong>，JEAL <strong>不收</strong></li>
                <li>可以随便存几次、随时改</li>
                <li>不验证数据完整性</li>
              </>
            ) : (
              <>
                <li>Saves current input to the database (won't be lost)</li>
                <li>Status: <strong>Draft</strong></li>
                <li>CEAL <strong>cannot see it</strong>, JEAL won't include it</li>
                <li>Save freely; edit anytime</li>
                <li>No validation enforced</li>
              </>
            )}
          </ul>
        </div>
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
          <h4 className="font-semibold text-emerald-900 mb-2">
            <Code>Submit</Code>
          </h4>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-800">
            {lang === 'zh' ? (
              <>
                <li>正式提交给 CEAL</li>
                <li>状态：<strong>Submitted</strong></li>
                <li>会出现在 CEAL 年度报告里</li>
                <li>可以再次 Submit 覆盖（在关表前）</li>
                <li>关表后无法再改</li>
              </>
            ) : (
              <>
                <li>Officially submits to CEAL</li>
                <li>Status: <strong>Submitted</strong></li>
                <li>Will appear in the CEAL annual report</li>
                <li>Can re-Submit to overwrite (before close)</li>
                <li>After close, cannot edit</li>
              </>
            )}
          </ul>
        </div>
      </div>

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '最重要的一点',
          en: 'Most important point',
        }}
      >
        {lang === 'zh'
          ? '在 12/2 关表前，10 张表都必须显示 "Submitted" 才算完成。Draft 不会被收。每次填完一段就点一次 Submit，等于 Save Draft + 提交，更省心。'
          : 'Before Dec 2 closes, all 10 forms must show "Submitted" to count. Drafts are not collected. Tip: click Submit at the end of each session — it acts like Save Draft + submit, simpler to manage.'}
      </Callout>

      {/* ---------- 4.2 Import Last Year ---------- */}
      <SectionH3
        id="s-4-2"
        lang={lang}
        zh="4.2 导入上一年的数据"
        en="4.2 Import Last Year's Data"
      />

      <P
        lang={lang}
        zh="馆藏类的表（专著、卷册、连续出版物等）大部分数字跟去年差别不大。用 Import 能省一大半工作。"
        en="Collection forms (monographs, volumes, serials) usually change little year over year. Import saves you most of the work."
      />

      <StepCard
        step={1}
        lang={lang}
        title={{ zh: '打开任意一张表', en: 'Open any form' }}
      >
        {lang === 'zh'
          ? '比如 Monographic Acquisitions。'
          : 'E.g. Monographic Acquisitions.'}
      </StepCard>

      <StepCard
        step={2}
        lang={lang}
        title={{
          zh: '点 "Import Last Year" 按钮',
          en: 'Click "Import Last Year" button',
        }}
      >
        <P
          lang={lang}
          zh="按钮通常在表单顶部或底部。点了以后你会看到一个确认对话框。"
          en="The button is usually at the top or bottom of the form. A confirmation dialog appears."
        />
      </StepCard>

      <StepCard
        step={3}
        lang={lang}
        title={{
          zh: '确认 → 表单自动填入去年的数字',
          en: 'Confirm → form auto-fills with last year\'s numbers',
        }}
      >
        {lang === 'zh'
          ? '注意：这只是"填入"，并没有 Submit。你还可以改任意字段。'
          : 'Note: this only "fills in" — it does NOT submit. You can still edit any field.'}
      </StepCard>

      <StepCard
        step={4}
        lang={lang}
        title={{
          zh: '把数字按今年的实际情况修改',
          en: 'Adjust numbers to this year\'s actuals',
        }}
      >
        {lang === 'zh'
          ? '只修改有变化的字段。其他保持不变即可。'
          : 'Edit only changed fields; leave others alone.'}
      </StepCard>

      <StepCard
        step={5}
        lang={lang}
        title={{ zh: '点 Submit', en: 'Click Submit' }}
      >
        {lang === 'zh' ? '搞定。' : 'Done.'}
      </StepCard>

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '已经填了数据再点 Import 会怎样？',
          en: 'What if I already filled data and click Import?',
        }}
      >
        {lang === 'zh'
          ? '系统会覆盖你已经填的字段为去年的值。所以如果你已经动手了，不要再点 Import，否则白干。'
          : 'The system overwrites your already-filled fields with last year\'s values. If you\'ve already started, do not click Import — your work will be lost.'}
      </Callout>

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '电子资源表的 Copy 按钮',
          en: 'E-Resource Copy button',
        }}
      >
        {lang === 'zh'
          ? '表 9 (Electronic) 和表 10 (Electronic Books) 不叫 "Import Last Year" 而叫 "Copy Records from Previous Year"，行为类似——把去年订阅勾选拉过来。如果某资源你今年取消订阅了，记得手动取消勾选。'
          : 'Form 9 (Electronic) and Form 10 (Electronic Books) call this button "Copy Records from Previous Year". Same behavior — pulls last year\'s subscription ticks. If you cancelled any subscription this year, manually untick it.'}
      </Callout>

      {/* ---------- 4.3 View your data ---------- */}
      <SectionH3
        id="s-4-3"
        lang={lang}
        zh="4.3 查看自己机构的数据"
        en="4.3 View Your Library's Data"
      />

      <P
        lang={lang}
        zh="提交完数据后，你想看一眼「系统记下的数字」是不是对，可以这样做："
        en="After submitting, you can verify what the system recorded:"
      />

      <ul className="list-disc list-inside space-y-2 my-4 text-sm text-gray-800">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>看本年度</strong>：Dashboard → Statistics Reports →
              点你机构 → 看本年度的汇总表。
            </li>
            <li>
              <strong>看历年</strong>：同上，年份切换器选择想看的年份。
            </li>
            <li>
              <strong>看主页公开数据</strong>：主页（cealstats.org）有
              "Member Browsing" 区域，已发表的数据所有成员都能查到。
              本年度数据要等 2 月 JEAL 发表后才出现。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>This year</strong>: Dashboard → Statistics Reports → click
              your library → see this year's summary table.
            </li>
            <li>
              <strong>Historical years</strong>: same path, use the year
              selector to switch.
            </li>
            <li>
              <strong>Public homepage data</strong>: the homepage
              (cealstats.org) has a "Member Browsing" area; all members can see
              already-published data. This year's data appears only after the
              February JEAL publication.
            </li>
          </>
        )}
      </ul>

      {/* ---------- 4.4 Edit submitted ---------- */}
      <SectionH3
        id="s-4-4"
        lang={lang}
        zh="4.4 修改已提交的表"
        en="4.4 Edit a Submitted Form"
      />

      <P
        lang={lang}
        zh="发现自己填错了？分两种情况："
        en="Found an error in what you submitted? Two scenarios:"
      />

      <div className="space-y-3 my-4">
        <div className="rounded-lg border-l-4 border-l-emerald-600 bg-emerald-50 p-3">
          <h4 className="font-semibold text-emerald-900 mb-1">
            {lang === 'zh' ? '情况 A：还没到 12 月 2 日' : 'Case A: Before Dec 2'}
          </h4>
          <p className="text-sm text-gray-800">
            {lang === 'zh'
              ? '直接打开那张表 → 改字段 → 再次点 Submit。系统会用新数据覆盖旧数据。无需 Committee 介入。'
              : 'Just open the form → edit fields → click Submit again. The system overwrites old data with new. No Committee involvement needed.'}
          </p>
        </div>
        <div className="rounded-lg border-l-4 border-l-red-700 bg-red-50 p-3">
          <h4 className="font-semibold text-red-900 mb-1">
            {lang === 'zh'
              ? '情况 B：已经过了 12 月 2 日'
              : 'Case B: After Dec 2'}
          </h4>
          <p className="text-sm text-gray-800">
            {lang === 'zh'
              ? '表单已锁定，你自己改不了。立即邮件 CEAL Statistics Committee，说明：①你的机构；②哪张表；③哪个字段从 X 改成 Y；④为什么。Committee 会决定是替你改还是临时重开。'
              : "The form is locked; you can't edit. Email the CEAL Statistics Committee immediately with: (1) your institution; (2) which form; (3) which field, from X to Y; (4) why. The Committee will decide whether to edit for you or briefly reopen the form."}
          </p>
        </div>
      </div>

      {/* ---------- 4.5 Export PDF ---------- */}
      <SectionH3
        id="s-4-5"
        lang={lang}
        zh="4.5 导出本机构 PDF 报告"
        en="4.5 Export Your Library's PDF Report"
      />

      <P
        lang={lang}
        zh="JEAL 发表之后，你可以下载本机构的统计 PDF（一年一份），用于内部存档、向上级汇报、申请经费等。"
        en="Once JEAL is published, you can download your library's statistics PDF (one per year) for internal archiving, reporting up, grant applications, etc."
      />

      <StepCard
        step={1}
        lang={lang}
        title={{
          zh: '进入 Dashboard',
          en: 'Go to Dashboard',
        }}
      >
        {lang === 'zh' ? '登录后默认就在。' : 'You\'re there by default after login.'}
      </StepCard>

      <StepCard
        step={2}
        lang={lang}
        title={{
          zh: '在 Statistics Reports 区域找年份',
          en: 'In Statistics Reports area, pick the year',
        }}
      >
        {lang === 'zh' ? '可选当年或往年。' : 'Current year or any past year.'}
      </StepCard>

      <StepCard
        step={3}
        lang={lang}
        title={{ zh: '点 Download PDF', en: 'Click Download PDF' }}
      >
        {lang === 'zh'
          ? '浏览器会下载一个一页的统计 PDF。'
          : 'Browser downloads a one-page statistics PDF.'}
      </StepCard>

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '提示',
          en: 'Tip',
        }}
      >
        {lang === 'zh'
          ? '导出的 PDF 适合给上级汇报用。如果你要的是全行业 (所有机构汇总) 的 PDF，去主页找 JEAL Published Reports 链接。'
          : 'The exported PDF is great for reporting to your supervisors. For the full-industry (all-institution aggregated) PDF, find the JEAL Published Reports link on the homepage.'}
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
            你现在会：① 区分 Save Draft 和 Submit；② Import 上一年；③ 查本机构
            数据；④ 改已交的表；⑤ 导出 PDF。{' '}
            <PageLink href="#part-5">第 5 部分（故障排查）</PageLink>{' '}
            处理常见出错情况。
          </>
        ) : (
          <>
            You can now: (1) distinguish Save Draft vs Submit; (2) Import last
            year; (3) view your library data; (4) edit submitted forms; (5)
            export PDF. <PageLink href="#part-5">Part 5
              (Troubleshooting)</PageLink>{' '}
            covers common problems.
          </>
        )}
      </Callout>
    </div>
  )
}
