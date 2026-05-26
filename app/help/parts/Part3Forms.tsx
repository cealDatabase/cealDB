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
  PageLink,
} from './_shared'

export default function Part3Forms({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-3"
        lang={lang}
        zh="第 3 部分 · 10 张表详细说明"
        en="Part 3 · The 10 Forms Explained"
      />
      <P
        lang={lang}
        zh="这一部分按主题把 10 张表分成 4 组，每张表讲：① 要统计什么；② 关键字段；③ 数据从哪儿找；④ 容易踩的坑。"
        en="This part groups the 10 forms into 4 themes. For each form: (1) what to count; (2) key fields; (3) where to source the data; (4) common pitfalls."
      />

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '通用规则（适用所有 10 张表）',
          en: 'Universal rules (apply to all 10 forms)',
        }}
      >
        <ul className="list-disc list-inside space-y-1 mt-1">
          {lang === 'zh' ? (
            <>
              <li>
                <strong>财政年度</strong>：7 月 1 日到次年 6 月 30 日（默认）。
                你机构若用不同财政年，请在 Notes 里说明。
              </li>
              <li>
                <strong>数字格式</strong>：整数（不带逗号、不带百分号）。需要小数的字段会单独提示。
              </li>
              <li>
                <strong>没有数据</strong>：填 <Code>0</Code>，不要留空白也不要填 N/A。
              </li>
              <li>
                <strong>货币</strong>：一律换算成 <strong>美元 USD</strong>。
              </li>
              <li>
                <strong>分支馆 / 法学院</strong>：一个机构提交一份合并报告。
                法学图书馆通常单独提交。
              </li>
              <li>
                <strong>语言分类</strong>：Chinese / Japanese / Korean / Non-CJK。
                Non-CJK = 关于东亚但用英文等非 CJK 语言出版的。
              </li>
              <li>
                <strong>异常变化</strong>：和去年差距很大（如增减 &gt; 30%），
                请务必在 Notes 里解释。
              </li>
            </>
          ) : (
            <>
              <li>
                <strong>Fiscal year</strong>: July 1 to June 30 (default). If
                yours differs, explain in Notes.
              </li>
              <li>
                <strong>Number format</strong>: whole numbers (no commas, no %).
                Fields needing decimals are flagged.
              </li>
              <li>
                <strong>No data</strong>: enter <Code>0</Code>, not blank, not
                N/A.
              </li>
              <li>
                <strong>Currency</strong>: convert everything to{' '}
                <strong>USD</strong>.
              </li>
              <li>
                <strong>Branches / law libraries</strong>: one combined report
                per institution. Law libraries usually report separately.
              </li>
              <li>
                <strong>Languages</strong>: Chinese / Japanese / Korean /
                Non-CJK. “Non-CJK” = about East Asia, but published in
                English or other non-CJK languages.
              </li>
              <li>
                <strong>Large changes</strong>: if &gt; 30% up/down from last
                year, explain in Notes.
              </li>
            </>
          )}
        </ul>
      </Callout>

      {/* ---------- 3.A Collections ---------- */}
      <SectionH3
        id="s-3-A"
        lang={lang}
        zh="3.A 馆藏统计组（5 张表）"
        en="3.A Collection Statistics Group (5 forms)"
      />

      <P
        lang={lang}
        zh="这一组数你的馆藏：买了多少、藏了多少、订了多少。是最常用 Import Last Year 的一组——年与年之间变化通常不大。"
        en="This group counts your collection: what you acquired, what you hold, what you subscribe to. These benefit most from Import Last Year — year-over-year changes are usually small."
      />

      {/* 1. Monographic */}
      <SectionH4
        id="s-3-A-1"
        lang={lang}
        zh="表 1 · Monographic Acquisitions（专著入藏）"
        en="Form 1 · Monographic Acquisitions"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '本财政年新购入的图书数量（按语言、按购买/接受方式）', en: 'Volumes of books newly acquired this fiscal year, by language and by purchase / non-purchase' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            { zh: 'Purchased / Non-purchased × Chinese / Japanese / Korean / Non-CJK', en: 'Purchased / Non-purchased × Chinese / Japanese / Korean / Non-CJK' },
          ],
          [
            { zh: '数据从哪找', en: 'Where to find data' },
            { zh: 'Acquisition 模块的年度统计、ILS（Sierra / Alma 等）报表', en: 'Acquisitions module annual stats; ILS (Sierra / Alma, etc.) reports' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '只数本年度"入藏"的，不要把历史所有馆藏当作"新购入"', en: 'Count only THIS year\'s new acquisitions — not your total historical holdings' },
          ],
        ]}
      />

      {/* 2. Volume Holdings */}
      <SectionH4
        id="s-3-A-2"
        lang={lang}
        zh="表 2 · Physical Volume Holdings（实物卷册馆藏）"
        en="Form 2 · Physical Volume Holdings"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '截至本财政年末，你馆所有实体卷册的总量（cumulative）', en: 'Cumulative count of all physical volumes held at end of fiscal year' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            { zh: '本年新增量 / 撤架量 / 期末总量（按语言）', en: 'Added this year / withdrawn / total at year-end (by language)' },
          ],
          [
            { zh: '数据从哪找', en: 'Where to find data' },
            { zh: 'ILS 中的 "title count" / "item count" 报表', en: 'ILS "title count" / "item count" reports' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '"期末总量"应当 = 上年末总量 + 新增 - 撤架。如果对不上，先查 ILS', en: 'End-year total should = last year-end + added − withdrawn. If they don\'t match, check ILS' },
          ],
        ]}
      />

      {/* 3. Serials */}
      <SectionH4
        id="s-3-A-3"
        lang={lang}
        zh="表 3 · Serial Titles（连续出版物）"
        en="Form 3 · Serial Titles: Purchased and Non-Purchased"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '本年订阅 / 接受的连续出版物（含期刊、报纸等）题数', en: 'Number of serial titles subscribed / received this year (journals, newspapers, etc.)' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            { zh: 'Purchased / Non-purchased × 语言。注意：是"题数"不是"卷册数"', en: 'Purchased / Non-purchased × language. Note: counts TITLES, not volumes' },
          ],
          [
            { zh: '关键按钮', en: 'Key button' },
            { zh: '"Import E-Journals from List" 可以把你订阅的电子期刊批量拉进来', en: '"Import E-Journals from List" pulls subscribed e-journals in bulk' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '同名期刊不要重复算（如纸版 + 电子版 = 1 题）', en: 'Don\'t double-count same title (print + electronic = 1 title)' },
          ],
        ]}
      />

      {/* 4. Other Holdings */}
      <SectionH4
        id="s-3-A-4"
        lang={lang}
        zh="表 4 · Holdings of Other Materials（其他载体馆藏）"
        en="Form 4 · Holdings of Other Materials"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '非图书的实体载体：微缩、音像、手稿、电子记录媒介 (CD/DVD) 等', en: 'Non-book physical formats: microform, AV, manuscripts, optical media (CD/DVD), etc.' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            { zh: 'Manuscripts / Microform / Cartographic / Graphic / Audio / Film & Video / Computer Files 等分类', en: 'Manuscripts / Microform / Cartographic / Graphic / Audio / Film & Video / Computer Files, etc.' },
          ],
          [
            { zh: '关键按钮', en: 'Key button' },
            { zh: '"Import AV from List" 可拉本机构 AV 列表数据', en: '"Import AV from List" pulls your library\'s AV list data' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '电子资源（在线流媒体、数据库）<strong>不</strong>填这里——它们在表 9/10', en: 'Electronic resources (streaming, databases) do NOT go here — those are in Forms 9/10' },
          ],
        ]}
      />

      {/* 5. Unprocessed */}
      <SectionH4
        id="s-3-A-5"
        lang={lang}
        zh="表 5 · Unprocessed Backlog（未编目积压）"
        en="Form 5 · Unprocessed Backlog Materials"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '已入藏但还没编目上架的卷册或件数', en: 'Volumes or pieces received but not yet cataloged/shelved' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            { zh: '按语言分。可以估算（你不可能逐本数）', en: 'By language. Estimates OK (impossible to count each)' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '没有积压请填 0，不要留空', en: 'No backlog → enter 0, not blank' },
          ],
        ]}
      />

      {/* ---------- 3.B Fiscal & Personnel ---------- */}
      <SectionH3
        id="s-3-B"
        lang={lang}
        zh="3.B 财政与人员组（2 张表）"
        en="3.B Fiscal & Personnel Group (2 forms)"
      />

      <P
        lang={lang}
        zh="这一组数字最容易出错——因为不在 ILS 里，要找财务和 HR。建议 10 月就开始联系相关部门。"
        en="The most error-prone group — numbers don't live in ILS. You'll need finance and HR. Start coordinating in October."
      />

      {/* 6. Fiscal */}
      <SectionH4
        id="s-3-B-6"
        lang={lang}
        zh="表 6 · Fiscal Support（财政支出）"
        en="Form 6 · Fiscal Support"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '东亚馆本财政年的所有支出（一律换 USD）', en: 'All EA-collection expenditures this fiscal year (in USD)' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            { zh: '专著 / 期刊 / 电子资源 / 其他 / Endowment / 总收入等', en: 'Monographs / Serials / E-Resources / Other / Endowment / Total Appropriated, etc.' },
          ],
          [
            { zh: '数据从哪找', en: 'Where to find data' },
            { zh: '财务部门年终报表；订阅经理；endowment 财报', en: 'Finance year-end report; subscriptions manager; endowment financial statement' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '人员工资（salary）不填在这里——它在表 7。这张表只统计"图书资料"花费', en: 'Staff salaries do NOT go here — those are in Form 7. This form only tracks "library materials" expenditure' },
          ],
        ]}
      />

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '汇率',
          en: 'Currency conversion',
        }}
      >
        {lang === 'zh'
          ? '如果你机构用日元 / 人民币 / 韩元结算订阅，用本财政年末（6/30）的汇率换算成美元即可。汇率来源可在 Notes 注明。'
          : 'If your library bills in JPY / CNY / KRW, use the fiscal year-end exchange rate (6/30). You can note the source of the rate in Notes.'}
      </Callout>

      {/* 7. Personnel */}
      <SectionH4
        id="s-3-B-7"
        lang={lang}
        zh="表 7 · Personnel Support（人员支持）"
        en="Form 7 · Personnel Support"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '东亚馆相关人员的 FTE（Full-Time Equivalent，全职等效数）', en: 'FTE (Full-Time Equivalent) of EA-collection-related staff' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            { zh: 'Professional Librarians / Support Staff / Student Assistants / Others，按 FTE 算', en: 'Professional Librarians / Support Staff / Student Assistants / Others, in FTE' },
          ],
          [
            { zh: 'FTE 怎么算', en: 'How FTE works' },
            { zh: '1 个全职 = 1.0；半职 = 0.5；学生工 10 小时/周 = ~0.25', en: '1 full-time = 1.0; half-time = 0.5; student 10 hr/wk = ~0.25' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '只算 EA 部分。如果一个馆员一半时间做东亚一半时间做中文文献服务 → 计 0.5 FTE', en: 'Count only EA portion. A librarian splitting time 50/50 → counts as 0.5 FTE' },
          ],
        ]}
      />

      {/* ---------- 3.C Public Services ---------- */}
      <SectionH3
        id="s-3-C"
        lang={lang}
        zh="3.C 公共服务（1 张表）"
        en="3.C Public Services (1 form)"
      />

      {/* 8. Public Services */}
      <SectionH4
        id="s-3-C-8"
        lang={lang}
        zh="表 8 · Public Services（参考、ILL、流通等）"
        en="Form 8 · Public Services"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '面向用户的服务量：讲座、参考咨询、流通、馆际互借（ILL）等', en: 'User-facing service volume: presentations, reference, circulation, ILL, etc.' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            {
              zh: 'Presentations / Participants / Reference Transactions / Total Circulations / Lending & Borrowing Filled & Unfilled',
              en: 'Presentations / Participants / Reference Transactions / Total Circulations / Lending & Borrowing Filled & Unfilled',
            },
          ],
          [
            { zh: '数据从哪找', en: 'Where to find data' },
            { zh: 'ILL 系统（ILLiad、Tipasa）；参考统计（LibAnswers、纸笔记录）；ILS 流通报表', en: 'ILL system (ILLiad, Tipasa); reference stats (LibAnswers, paper logs); ILS circulation reports' },
          ],
          [
            { zh: '关键变化', en: 'Important change' },
            { zh: '新系统只填"subtotal"字段，不再按语言细分。直接填一年总数', en: 'New system only takes "subtotal" fields, no per-language breakdown. Just enter the year total' },
          ],
        ]}
      />

      {/* ---------- 3.D E-Resources ---------- */}
      <SectionH3
        id="s-3-D"
        lang={lang}
        zh="3.D 电子资源组（2 张表）"
        en="3.D Electronic Resources Group (2 forms)"
      />

      <P
        lang={lang}
        zh="这一组最特殊：系统有一个跨机构共享的主资源列表（CEAL Statistics Committee 维护），你只需在你订阅的资源旁打勾。"
        en="Special group: the system maintains a master resource list shared across institutions (curated by CEAL Statistics Committee). You only tick the box next to resources YOU subscribe to."
      />

      {/* 9. Electronic */}
      <SectionH4
        id="s-3-D-9"
        lang={lang}
        zh="表 9 · Electronic（电子数据库订阅）"
        en="Form 9 · Electronic (Database Subscriptions)"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '本馆本年订阅的所有电子数据库（CNKI、JapanKnowledge、KISS 等）', en: 'All e-database subscriptions for your library this year (CNKI, JapanKnowledge, KISS, etc.)' },
          ],
          [
            { zh: '怎么填', en: 'How to fill' },
            { zh: '勾选你订阅的资源 + 输入花费 + 填入访问量 (titles, sessions, searches)', en: 'Tick resources you subscribe to + enter cost + access stats (titles, sessions, searches)' },
          ],
          [
            { zh: '关键按钮', en: 'Key button' },
            { zh: '"Copy Records from Previous Year" 一键复制去年订阅', en: '"Copy Records from Previous Year" — one-click copy last year\'s subscriptions' },
          ],
          [
            { zh: '找不到你订的资源？', en: 'Resource not in the list?' },
            { zh: '联系 CEAL Statistics Committee 让他们加进主列表', en: 'Contact CEAL Statistics Committee to add it to the master list' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '已取消订阅的资源记得本年取消勾选', en: 'Untick anything you no longer subscribe to this year' },
          ],
        ]}
      />

      {/* 10. Electronic Books */}
      <SectionH4
        id="s-3-D-10"
        lang={lang}
        zh="表 10 · Electronic Books（电子书）"
        en="Form 10 · Electronic Books"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '项', en: 'Item' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: '统计什么', en: 'What to count' },
            { zh: '本馆订阅或拥有的电子书集合（按语言分）', en: 'Subscribed or owned e-book collections (by language)' },
          ],
          [
            { zh: '关键字段', en: 'Key fields' },
            { zh: 'Subscription titles / Subscription volumes / Purchased titles / Purchased volumes', en: 'Subscription titles / Subscription volumes / Purchased titles / Purchased volumes' },
          ],
          [
            { zh: '关键按钮', en: 'Key button' },
            { zh: '"Import Subscription Titles / Volumes" 从你机构 E-Book 列表批量导入', en: '"Import Subscription Titles / Volumes" — bulk import from your library\'s E-Book list' },
          ],
          [
            { zh: '常见坑', en: 'Common pitfall' },
            { zh: '"titles" 不等于 "volumes"。一套 100 卷的书 = 1 title / 100 volumes', en: '"titles" ≠ "volumes". A 100-volume set = 1 title / 100 volumes' },
          ],
        ]}
      />

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '小结 + 下一步',
          en: 'Summary + Next',
        }}
      >
        {lang === 'zh' ? (
          <>
            10 张表的"该填什么"你已经清楚了。接下来{' '}
            <PageLink href="#part-4">第 4 部分（常见操作）</PageLink>
            讲怎么操作：存草稿、导入、修改、导出 PDF。
          </>
        ) : (
          <>
            You now know what to fill for all 10 forms. Next:{' '}
            <PageLink href="#part-4">Part 4 (Common Tasks)</PageLink> covers
            how to operate: save draft, import, edit, export PDF.
          </>
        )}
      </Callout>
    </div>
  )
}
