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

interface QA {
  q: { zh: React.ReactNode; en: React.ReactNode }
  a: { zh: React.ReactNode; en: React.ReactNode }
}

function FAQList({ lang, items }: { lang: 'zh' | 'en'; items: QA[] }) {
  return (
    <div className="my-4 space-y-3">
      {items.map((it, i) => (
        <details
          key={i}
          className="rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <summary className="cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50 select-none">
            Q{i + 1}. {lang === 'zh' ? it.q.zh : it.q.en}
          </summary>
          <div className="px-4 pb-3 pt-1 text-sm text-gray-700 border-t bg-gray-50">
            {lang === 'zh' ? it.a.zh : it.a.en}
          </div>
        </details>
      ))}
    </div>
  )
}

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

export default function Part7FAQ({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-7"
        lang={lang}
        zh="第 7 部分 · 常见问题 + 术语表"
        en="Part 7 · FAQ + Glossary"
      />
      <P
        lang={lang}
        zh="收尾的两节：① 把前面没单独讲的零散问题汇集 FAQ；② 一个术语表，方便你看不懂某个词时回查。"
        en="Two closing sections: (1) FAQ collects scattered questions not covered earlier; (2) a glossary to look up any unfamiliar term."
      />

      {/* ---------- 7.1 FAQ ---------- */}
      <SectionH3
        id="s-7-1"
        lang={lang}
        zh="7.1 常见问题 FAQ"
        en="7.1 Frequently Asked Questions"
      />

      <FAQList
        lang={lang}
        items={[
          {
            q: {
              zh: '我们机构今年人手不够，能延期提交吗？',
              en: 'Can we get an extension if we\'re short-staffed?',
            },
            a: {
              zh: <>可以协商，但要<strong>提前</strong>。在 12/2 之前邮件 CEAL Statistics Committee 说明情况；他们可能给你延长几天或派人协助。<strong>不要等到 12/2 之后</strong>再问——那时表单已关，恢复流程繁琐得多。</>,
              en: <>Yes — but request <strong>before the deadline</strong>. Email CEAL Statistics Committee before 12/2 explaining; they may grant a few days' extension or offer assistance. <strong>Don't wait until after 12/2</strong> — by then forms are closed and the recovery process is much more complicated.</>,
            },
          },
          {
            q: {
              zh: '我们今年不参加，怎么操作？',
              en: 'We\'re skipping this year — what to do?',
            },
            a: {
              zh: <>邮件 CEAL Statistics Committee 说明本年度不参与。他们会把你机构的 Library_Year 标记为非参与，你就不会出现在催报名单里。来年想恢复时再邮件他们。</>,
              en: <>Email CEAL Statistics Committee saying you're not participating this year. They'll mark your library's Library_Year as non-participating; you won't show up on reminder lists. Email them again next year when ready to resume.</>,
            },
          },
          {
            q: {
              zh: '我填的数字会公开吗？数据保密吗？',
              en: 'Will my numbers be public? How private is the data?',
            },
            a: {
              zh: (
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>JEAL 发表后</strong>：每张表的数字会按机构公开，主页和 /reports 路径都能查到。</li>
                  <li><strong>Notes 字段</strong>：只供 CEAL Statistics Committee 内部审核，不会随报告公开。</li>
                  <li><strong>草稿数据</strong>：JEAL 发表前，未提交的草稿只有你和 Super Admin 能看。</li>
                </ul>
              ),
              en: (
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>After JEAL publication</strong>: per-institution numbers are public on homepage and /reports.</li>
                  <li><strong>Notes field</strong>: visible only to CEAL Statistics Committee for review; not published.</li>
                  <li><strong>Draft data</strong>: before publication, draft state is visible only to you and Super Admin.</li>
                </ul>
              ),
            },
          },
          {
            q: {
              zh: '提交以后能不能修改？',
              en: 'Can I edit after submitting?',
            },
            a: {
              zh: <>关表前可以无限次再次提交覆盖。关表后（12/2 之后）就不能自己改了——必须邮件 CEAL Statistics Committee 请求修正。所以建议关表前留 1–2 天复查时间。</>,
              en: <>Before close, you can resubmit unlimited times to overwrite. After close (post-12/2), you cannot edit — must email CEAL Statistics Committee for correction. So leave 1–2 days for review before close.</>,
            },
          },
          {
            q: {
              zh: '数字格式：要不要带千分位逗号？百分号？',
              en: 'Number format: include thousands commas? percent signs?',
            },
            a: {
              zh: <>都不要。<strong>纯整数</strong>，不带任何符号。例如 12345，不是 12,345 或 12345.00 或 50%。需要小数的字段（极少见）会单独提示。</>,
              en: <>None. <strong>Whole integers</strong>, no symbols. E.g. 12345, not 12,345 or 12345.00 or 50%. Decimal fields (very rare) are flagged explicitly.</>,
            },
          },
          {
            q: {
              zh: '我们财政年不是 7/1–6/30 怎么办？',
              en: 'Our fiscal year isn\'t July 1 – June 30 — what now?',
            },
            a: {
              zh: <>按照你<strong>实际的</strong>财政年填，并在 Notes 里说明（例如"FY 2024–25 = 1/1/2024 – 12/31/2024"）。CEAL 在汇总时会做对应处理，重要的是要一致和透明。</>,
              en: <>Report using your <strong>actual</strong> fiscal year and explain in Notes (e.g. "FY 2024–25 = 1/1/2024 – 12/31/2024"). CEAL handles the harmonization; what matters is consistency and transparency.</>,
            },
          },
          {
            q: {
              zh: '分馆 / 法学院图书馆要单独填吗？',
              en: 'Should branches / law libraries file separately?',
            },
            a: {
              zh: <>一般情况下：<strong>一个机构一份合并报告</strong>。<strong>例外</strong>：法学图书馆通常单独提交。具体看你机构在 CEAL 上的登记方式——不确定就问 Committee。</>,
              en: <>Normally: <strong>one combined report per institution</strong>. <strong>Exception</strong>: law libraries usually file separately. Depends on how your library is registered with CEAL — ask Committee if unsure.</>,
            },
          },
          {
            q: {
              zh: '我同时是好几家分馆的联系人，怎么切换？',
              en: 'I represent multiple branches — how do I switch?',
            },
            a: {
              zh: <>一个邮箱只能对应一家图书馆。如果你需要为多家机构填表，请联系 CEAL Statistics Committee 用<strong>不同邮箱</strong>分别建账号。或者你可以让他们把另一家机构的填写权限单独给一位同事。</>,
              en: <>One email maps to one library. If you need to file for multiple, ask CEAL Statistics Committee to create <strong>separate accounts with different emails</strong>. Alternatively, have a colleague hold the other library\'s account.</>,
            },
          },
          {
            q: {
              zh: 'JEAL 发表后我能再下载本机构的 PDF 吗？',
              en: 'After JEAL publishes, can I still download my library\'s PDF?',
            },
            a: {
              zh: <>能。任何已发表年份的 PDF 都能在 Statistics Reports 区域永久下载。也建议你<strong>关表后立刻下载一份</strong>作为本地存档，免得日后系统不可访问。</>,
              en: <>Yes. Any published year\'s PDF is permanently downloadable from the Statistics Reports area. Also recommend you <strong>download a copy right after closing</strong> for local archive, in case of any future access issues.</>,
            },
          },
          {
            q: {
              zh: '我们去年同事填的数字有问题，今年想纠正历史数据怎么办？',
              en: 'We found errors in past-year data — how to correct historical data?',
            },
            a: {
              zh: <>邮件 CEAL Statistics Committee 说明：① 哪一年；② 哪张表；③ 哪个字段从 X 改成 Y；④ 修正理由。如果错误已经在 JEAL 发表过，Committee 会决定是否需要发勘误。</>,
              en: <>Email CEAL Statistics Committee with: (1) which year; (2) which form; (3) which field, from X to Y; (4) reason. If the wrong value already appeared in a published JEAL, Committee will decide whether an erratum is needed.</>,
            },
          },
          {
            q: {
              zh: '本机构以外的其他用户能看到我的数据吗？',
              en: 'Can users at other institutions see my data?',
            },
            a: {
              zh: <>关表前：不能（草稿只有你和 Super Admin 可见）。JEAL 发表后：能看到你的数字（不含 Notes）。这是 CEAL 统计的初衷——成员间互相比对。</>,
              en: <>Before close: no (drafts only visible to you and Super Admin). After JEAL publication: yes, they see your numbers (not Notes). This is the whole point of CEAL stats — members compare each other.</>,
            },
          },
          {
            q: {
              zh: '联系 CEAL Statistics Committee 一般多久回复？',
              en: 'How fast does CEAL Statistics Committee usually reply?',
            },
            a: {
              zh: <>通常工作日 1–3 天。10–12 月开关表期间他们也忙，紧急情况（如关表当天遇到问题）请在邮件主题写 [URGENT]。</>,
              en: <>Usually 1–3 business days. During Oct–Dec they\'re busy too; for urgent issues (e.g. problems on closing day) put [URGENT] in the subject line.</>,
            },
          },
        ]}
      />

      {/* ---------- 7.2 Glossary ---------- */}
      <SectionH3
        id="s-7-2"
        lang={lang}
        zh="7.2 术语表"
        en="7.2 Glossary"
      />

      <P
        lang={lang}
        zh="按字母 / 拼音排序的常用术语。看到不懂的词回查这里。"
        en="Common terms in alphabetical order. Look here for any unfamiliar term."
      />

      <GlossaryList
        lang={lang}
        terms={[
          {
            term: 'Academic Year',
            zh: <>学年。CEAL 的 2024–2025 学年 = 2025 年 10 月开始收集的那一轮数据，2026 年 2 月发表。系统里通常用结束年份 (2025) 表示。</>,
            en: <>Academic year. CEAL\'s 2024–2025 academic year = data collected starting Oct 2025, published Feb 2026. The system typically uses the ending year (2025) for it.</>,
          },
          {
            term: 'CEAL',
            zh: <>Council on East Asian Libraries。北美东亚图书馆理事会。本系统的所有者。</>,
            en: <>Council on East Asian Libraries. The owner of this system.</>,
          },
          {
            term: 'CJK',
            zh: <>Chinese / Japanese / Korean。中日韩三种文字与语言的统称。</>,
            en: <>Chinese / Japanese / Korean. The three languages and scripts.</>,
          },
          {
            term: 'Closing Date',
            zh: <>关表日。每年 12 月 2 日 23:59 Pacific Time，系统自动锁定所有表单。</>,
            en: <>Closing date. Dec 2 at 23:59 Pacific Time each year, when the system auto-locks all forms.</>,
          },
          {
            term: 'Dashboard',
            zh: <>登录后的主页面（/admin 路径）。从这里进入 10 张表 + 查看本机构报告。</>,
            en: <>The main page after login (/admin path). From here you reach the 10 forms + your library\'s reports.</>,
          },
          {
            term: 'Draft（草稿）',
            zh: <>未提交的填表状态。已保存到数据库但 CEAL 看不到、JEAL 不收。</>,
            en: <>Unsubmitted form state. Saved in the database but invisible to CEAL and not included in JEAL.</>,
          },
          {
            term: 'Fiscal Year（财政年）',
            zh: <>默认 7 月 1 日到次年 6 月 30 日。统计支出和馆藏增量时用这个时段。</>,
            en: <>Default July 1 to June 30. Use this range when reporting expenditures and collection additions.</>,
          },
          {
            term: 'FTE',
            zh: <>Full-Time Equivalent，全职等效数。1 个全职 = 1.0；半职 = 0.5；学生工 10 小时/周 ≈ 0.25。用于人员表 (Form 7)。</>,
            en: <>Full-Time Equivalent. 1 full-time = 1.0; half-time = 0.5; student 10 hrs/week ≈ 0.25. Used in Personnel (Form 7).</>,
          },
          {
            term: 'Import Last Year',
            zh: <>表单按钮，把上一年同表数据拉过来作为本年起点。不等于 Submit——你还能改。</>,
            en: <>Form button that pulls last year\'s same-form data as a starting point. Not the same as Submit — you can still edit.</>,
          },
          {
            term: 'JEAL',
            zh: <>Journal of East Asian Libraries。CEAL 出版的学刊，每年 2 月号刊登统计报告 PDF。</>,
            en: <>Journal of East Asian Libraries. CEAL\'s journal; the Feb issue publishes the annual statistics report PDF.</>,
          },
          {
            term: 'Library_Year',
            zh: <>数据库里的一条记录，对应"你机构在某年是否参与 / 是否能编辑 / 是否已发表"。普通用户不直接看，但出问题时这个词会被提到。</>,
            en: <>A database row representing "is your library participating in a given year / editable / published". Member users don\'t see this directly but the term comes up when issues arise.</>,
          },
          {
            term: 'Member Institution',
            zh: <>成员机构。CEAL 的会员图书馆。你的角色就是其中一家机构的联系人。</>,
            en: <>Member library of CEAL. Your role is the contact person for one such library.</>,
          },
          {
            term: 'Non-CJK',
            zh: <>关于东亚研究但用英文等非 CJK 语言出版的资料。</>,
            en: <>Materials about East Asia but published in English or other non-CJK languages.</>,
          },
          {
            term: 'Notes（备注）',
            zh: <>每张表底部的文本框。用来解释异常数字、说明财政年差异。只供 CEAL Committee 内部审核，不公开。</>,
            en: <>Text box at the bottom of every form. Use to explain unusual numbers or fiscal-year differences. Visible only to CEAL Committee for review; not published.</>,
          },
          {
            term: 'Opening Date',
            zh: <>开表日。每年 10 月 1 日 Pacific Time 晚上 9 点后，系统自动开放编辑。</>,
            en: <>Opening date. Oct 1 at 9 PM Pacific Time each year, when forms auto-open for editing.</>,
          },
          {
            term: 'Pacific Time / PT',
            zh: <>太平洋时区。系统所有日期都以此为准。东岸 +3 小时，亚洲 +15~16 小时。</>,
            en: <>Pacific Time zone. All system dates are in PT. East Coast is +3 hrs; Asia is +15~16 hrs.</>,
          },
          {
            term: 'Published',
            zh: <>本年度数据"已发表"状态。JEAL 2 月发表后由 CEAL 标记。标 published 后主页就能查到本年度数据。</>,
            en: <>State of "data published" for the year. Marked by CEAL after JEAL\'s Feb publication. Once published, this year\'s data appears on the homepage.</>,
          },
          {
            term: 'Save Draft',
            zh: <>底部按钮，把当前填的存为草稿。<strong>不等于</strong> Submit。</>,
            en: <>Bottom button to save as draft. <strong>NOT</strong> the same as Submit.</>,
          },
          {
            term: 'Statistics Committee',
            zh: <>CEAL 下设的统计委员会，负责本年度政策、表单字段、技术支持。任何问题最终找他们。</>,
            en: <>The CEAL Statistics Committee, responsible for annual policy, form fields, and technical support. Your ultimate point of contact for any issue.</>,
          },
          {
            term: 'Submit（提交）',
            zh: <>底部按钮，把表单正式交给 CEAL。可以再次 Submit 覆盖（关表前）。10 张表都 Submit 才算完成本年度任务。</>,
            en: <>Bottom button to officially submit to CEAL. Resubmit to overwrite (before close). You\'re done for the year only when all 10 forms are Submitted.</>,
          },
          {
            term: 'Subtotal',
            zh: <>每个语言/类别求和栏。系统会自动算，你只需要填明细行。</>,
            en: <>Per-language/category sum row. Auto-computed by the system; you only fill detail rows.</>,
          },
          {
            term: 'USD',
            zh: <>美元。所有货币字段一律换算成美元填。换算汇率可在 Notes 注明。</>,
            en: <>U.S. Dollars. All currency fields must be in USD. Note the exchange rate source in Notes if needed.</>,
          },
        ]}
      />

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '🎉 你已经读完了整本指南',
          en: '🎉 You\'ve finished the entire guide',
        }}
      >
        {lang === 'zh' ? (
          <>
            到这里，你已经掌握了：① 这个系统是干什么的；② 怎么登录上手；③ 一年里
            什么时候做什么；④ 10 张表怎么填；⑤ 常见操作；⑥ 出错怎么办；⑦ 检查
            清单；⑧ FAQ + 术语表。
            <br />
            <br />
            遇到指南没覆盖的情况？记下来邮件给 CEAL Statistics Committee——
            我们会在下次更新时加进去。这本指南是活的。
          </>
        ) : (
          <>
            By now you've mastered: (1) what this system does; (2) how to log
            in; (3) what to do throughout the year; (4) how to fill the 10
            forms; (5) common tasks; (6) troubleshooting; (7) checklists; (8)
            FAQ + glossary.
            <br />
            <br />
            Encountered a case the guide doesn\'t cover? Note it and email the
            CEAL Statistics Committee — we\'ll add it in the next update. This
            guide is meant to evolve.
          </>
        )}
      </Callout>

      <P
        lang={lang}
        zh={
          <>
            <strong>祝你填表顺利。</strong>{' '}
            有任何疑问，先 Ctrl/Cmd + F 搜索本指南，搜不到就联系{' '}
            <PageLink href="https://www.eastasianlib.org/newsite/statistics/">
              CEAL Statistics Committee
            </PageLink>
            。
          </>
        }
        en={
          <>
            <strong>Best of luck with your statistics submission.</strong> When
            in doubt, Ctrl/Cmd + F this guide first; if nothing matches,
            contact the{' '}
            <PageLink href="https://www.eastasianlib.org/newsite/statistics/">
              CEAL Statistics Committee
            </PageLink>
            .
          </>
        }
      />
    </div>
  )
}
