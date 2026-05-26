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
  StepCard,
} from './_shared'

export default function Part3AdminPages({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-3"
        lang={lang}
        zh="第 3 部分 · Admin 页面详细说明"
        en="Part 3 · Admin Pages Detailed Guide"
      />
      <P
        lang={lang}
        zh={'这一部分按 /admin Dashboard 的 4 大区块逐一介绍。每个页面的「是什么 / 谁能看 / 关键按钮 / 副作用 / 常见坑」都会写清楚。当你进入某个页面不知道某个按钮干啥用，回到这里查。'}
        en="This part walks through every page under the four /admin Dashboard sections. For each page: 'what it is / who can see it / key buttons / side effects / common pitfalls'. If a button confuses you on a page, look it up here."
      />

      {/* ---------------- 3.A Statistics Forms ---------------- */}
      <SectionH3
        id="s-3-A"
        lang={lang}
        zh="3.A 统计表单 (Statistics Forms)"
        en="3.A Statistics Forms"
      />

      <SectionH4
        id="s-3-A-1"
        lang={lang}
        zh="3.A.1 /admin/forms — 表单总入口"
        en="3.A.1 /admin/forms — Forms Entry Page"
      />

      <P
        lang={lang}
        zh={
          <>
            访问 <Code>/admin/forms</Code> 看到的页面分两种：
            <ul className="list-disc list-inside my-2">
              <li>
                <strong>Member 用户</strong>：只看到自己机构本年度的表单卡片（10 张小表 + 3 张大表入口）。
              </li>
              <li>
                <strong>Super Admin / Assistant Admin</strong>：先看到一个
                <strong>InstitutionSwitcher</strong>，可以选任何机构进入"模拟视图"，
                看那个机构填到什么程度。
              </li>
            </ul>
          </>
        }
        en={
          <>
            <Code>/admin/forms</Code> shows different things depending on the user:
            <ul className="list-disc list-inside my-2">
              <li>
                <strong>Member</strong>: just their institution's current-year
                form cards (10 small forms + 3 big-form entries).
              </li>
              <li>
                <strong>Super Admin / Assistant Admin</strong>: first sees an{' '}
                <strong>InstitutionSwitcher</strong> — pick any institution to
                enter "simulated view" and see how far they have filled.
              </li>
            </ul>
          </>
        }
      />

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '小表 vs 大表',
          en: 'Small forms vs Big forms',
        }}
      >
        {lang === 'zh' ? (
          <>
            <strong>10 张小表</strong>每张就是几个数字（如 Monographic、Volume Holdings、Personnel 等），
            机构图书馆员快速填完。<strong>3 张大表</strong>（AV/EBook/EJournal）是从全局
            "List_AV"、"List_EBook"、"List_EJournal" 的资源库里
            <strong>勾选这家机构订阅了哪些</strong>，并可填 custom_count。
          </>
        ) : (
          <>
            <strong>10 small forms</strong> each contain just a handful of
            numbers (Monographic, Volume Holdings, Personnel, etc.) — quick to
            fill. <strong>3 big forms</strong> (AV/EBook/EJournal) are{' '}
            <strong>multi-select against the global List_AV/EBook/EJournal</strong>{' '}
            tables, ticking which subscriptions this library has, plus an
            optional custom_count override per row.
          </>
        )}
      </Callout>

      <SectionH4
        id="s-3-A-2"
        lang={lang}
        zh="3.A.2 /admin/forms/[libid]/{form} — 10 张小表"
        en="3.A.2 /admin/forms/[libid]/{form} — The 10 Small Forms"
      />

      <P
        lang={lang}
        zh="10 张小表覆盖以下统计领域："
        en="The 10 small forms cover the following statistics domains:"
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '路径段', en: 'URL segment' },
          { zh: '内容', en: 'Contains' },
        ]}
        rows={[
          [
            { zh: <Code>monographic</Code>, en: <Code>monographic</Code> },
            {
              zh: '专著采访（购买、捐赠、分语种）',
              en: 'Monographic acquisitions (purchase, gift, by language)',
            },
          ],
          [
            { zh: <Code>volumes</Code>, en: <Code>volumes</Code> },
            { zh: '册数累积', en: 'Volume holdings cumulative' },
          ],
          [
            { zh: <Code>serial</Code>, en: <Code>serial</Code> },
            { zh: '连续出版物', en: 'Serial publications' },
          ],
          [
            { zh: <Code>otherholdings</Code>, en: <Code>otherholdings</Code> },
            {
              zh: '其他馆藏（缩微、视听、地图等）',
              en: 'Other holdings (microform, A/V, maps, etc.)',
            },
          ],
          [
            { zh: <Code>unprocessed</Code>, en: <Code>unprocessed</Code> },
            { zh: '未编（积压）', en: 'Unprocessed (backlog)' },
          ],
          [
            { zh: <Code>fund</Code>, en: <Code>fund</Code> },
            { zh: '经费来源', en: 'Funding sources' },
          ],
          [
            { zh: <Code>personnel</Code>, en: <Code>personnel</Code> },
            {
              zh: '人员（FTE 分中日韩、专业/支持）',
              en: 'Personnel (FTE by CJK, professional/support)',
            },
          ],
          [
            { zh: <Code>publicservice</Code>, en: <Code>publicservice</Code> },
            {
              zh: '公共服务（参考咨询、流通、馆际互借）',
              en: 'Public service (reference, circulation, ILL)',
            },
          ],
          [
            { zh: <Code>electronic</Code>, en: <Code>electronic</Code> },
            {
              zh: '电子总览（汇总指标）',
              en: 'Electronic overview (summary metrics)',
            },
          ],
          [
            { zh: <Code>electronicbook</Code>, en: <Code>electronicbook</Code> },
            {
              zh: '电子书数量（与 List_EBook 不同——这是自报数字）',
              en: 'E-book counts (different from List_EBook — self-reported numbers)',
            },
          ],
        ]}
      />

      <P
        lang={lang}
        zh={
          <>
            每张表的 UI 都是一个 form，点 <strong>Submit</strong> 保存到对应的 <Code>{`Monographic_Acquisitions / Volume_Holdings / ...`}</Code> 表。
            后端会自动写一条审计日志和把 Entry_Status.[form_field] 标记为 true。
          </>
        }
        en={
          <>
            Each form has the same shape: a form view, click <strong>Submit</strong> to save into the corresponding{' '}
            <Code>{`Monographic_Acquisitions / Volume_Holdings / ...`}</Code> table. The backend auto-writes an audit log and marks the matching{' '}
            <Code>Entry_Status.[form_field]</Code> as true.
          </>
        }
      />

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '关表后的 Read-Only Mode',
          en: 'Read-Only mode after close',
        }}
      >
        {lang === 'zh' ? (
          <>
            关表后（<Code>is_open_for_editing=false</Code>）非 Super Admin 会在表单上方看到一条提示：
            <em>"This form is currently in Read-Only mode."</em>
            字段全部 disabled，Submit 按钮也会被隐藏或 disabled。Super Admin 仍能编辑，
            但会显示 🔒 图标提醒"你正在 privileged 编辑已关闭的表单"。
          </>
        ) : (
          <>
            After close (<Code>is_open_for_editing=false</Code>), non-Super-Admin users see a banner at the top:{' '}
            <em>"This form is currently in Read-Only mode."</em> — all inputs disabled, Submit hidden/disabled. Super Admin can still edit, but a 🔒 icon
            reminds: "you are privileged-editing a closed form".
          </>
        )}
      </Callout>

      <SectionH4
        id="s-3-A-3"
        lang={lang}
        zh="3.A.3 /admin/forms/[libid]/{avdbedit, ebookedit, ejournaledit} — 3 张大表"
        en="3.A.3 /admin/forms/[libid]/{avdbedit, ebookedit, ejournaledit} — The 3 Big Forms"
      />

      <P
        lang={lang}
        zh={'3 张大表的逻辑：先有一张全局资源主表（List_AV、List_EBook、List_EJournal），它的每一行是一个 e-resource 元数据。各机构在自己的填表页「勾选」自己有哪些订阅。'}
        en="The 3 big forms work like this: there's a global resource master table (List_AV, List_EBook, List_EJournal) — each row is an e-resource entry. Each library 'ticks' which subscriptions they have on their form page."
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>勾选状态</strong> = <Code>Library_AV / Library_EBook / Library_EJournal</Code> 关联表。
            </li>
            <li>
              <strong>Custom Count</strong>：可选，覆盖 List_* 主表的默认 titles/volumes/chapters/dbs。
            </li>
            <li>
              <strong>过滤器</strong>：CJK 语种、Subscription type 等。
            </li>
            <li>
              <strong>Member 用户对全局资源主表只读</strong>，要新增条目得请 E-Resource Editor。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Selection state</strong> = <Code>Library_AV / Library_EBook / Library_EJournal</Code> join tables.
            </li>
            <li>
              <strong>Custom Count</strong>: optional — overrides the default titles/volumes/chapters/dbs from the List_* master.
            </li>
            <li>
              <strong>Filters</strong>: CJK language, subscription type, etc.
            </li>
            <li>
              <strong>Members are read-only on the global master table</strong>{' '}
              — adding new entries requires an E-Resource Editor.
            </li>
          </>
        )}
      </ul>

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '"Pure Member" 限制',
          en: '"Pure Member" restriction',
        }}
      >
        {lang === 'zh' ? (
          <>
            如果一个用户角色数组就是 <Code>["2"]</Code>（纯 Member）或 <Code>["4"]</Code>（纯 Assistant Admin），
            大表的 Actions 列会被隐藏，只能勾选/取消，不能编辑全局元数据。Super Admin / 多角色用户能看到所有按钮。
          </>
        ) : (
          <>
            If a user's role array is exactly <Code>["2"]</Code> (pure Member) or <Code>["4"]</Code> (pure Assistant Admin), the Actions column on big forms is hidden — they can only tick/untick, not edit global metadata. Super Admin / multi-role users see all buttons.
          </>
        )}
      </Callout>

      <SectionH4
        id="s-3-A-4"
        lang={lang}
        zh="3.A.4 Copy Records 跨年复制"
        en="3.A.4 Copy Records (Cross-Year Copy)"
      />

      <P
        lang={lang}
        zh={
          <>
            填大表时，机构可以点 <strong>Copy from Last Year</strong> 把上一年的 Library_* 关联表复制过来。
            后端调 <Code>POST /api/admin/copy-records</Code>，对 (libid, prevYear) 的所有
            Library_AV/EBook/EJournal 行复制成 (libid, currYear)，跳过已经存在的。
          </>
        }
        en={
          <>
            On a big form, an institution can click <strong>Copy from Last Year</strong> to copy the previous year's Library_* join rows over. Backend calls <Code>POST /api/admin/copy-records</Code> — copies all (libid, prevYear) Library_AV/EBook/EJournal rows into (libid, currYear), skipping duplicates.
          </>
        }
      />

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '什么时候用',
          en: 'When to use',
        }}
      >
        {lang === 'zh'
          ? '机构每年的电子资源订阅大体不变。先 Copy from Last Year 节省 90% 工作量，再删掉/添加少数变化。'
          : "Most institutions' e-resource subscriptions don't change much year-over-year. Copy from Last Year saves 90% of the work; then just remove/add the few that changed."}
      </Callout>

      {/* ---------------- 3.B Statistics Reports ---------------- */}
      <SectionH3
        id="s-3-B"
        lang={lang}
        zh="3.B 统计报告 (Statistics Reports)"
        en="3.B Statistics Reports"
      />

      <SectionH4
        id="s-3-B-1"
        lang={lang}
        zh="3.B.1 /admin/reports — 跨年/跨机构报告"
        en="3.B.1 /admin/reports — Cross-Year Cross-Institution Reports"
      />

      <P
        lang={lang}
        zh={
          <>
            <Code>/admin/reports</Code> 是给所有用户的查询/导出入口。可以选：
          </>
        }
        en={
          <>
            <Code>/admin/reports</Code> is the query/export entry for all users. You can pick:
          </>
        }
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>哪些机构</strong>（Super Admin 看全部；Member 默认只看自己的）
            </li>
            <li>
              <strong>哪些年份</strong>（Member 受 Entry_Status.espublished 限制，只看已发布年）
            </li>
            <li>
              <strong>哪个统计领域</strong>（Monographic、Volumes、Personnel 等）
            </li>
            <li>导出 Excel / CSV / 在线表格视图</li>
          </>
        ) : (
          <>
            <li>
              <strong>Which institutions</strong> (Super Admin sees all; Member defaults to their own)
            </li>
            <li>
              <strong>Which years</strong> (Member limited by Entry_Status.espublished — only published years)
            </li>
            <li>
              <strong>Which statistics domain</strong> (Monographic, Volumes, Personnel, etc.)
            </li>
            <li>Export to Excel / CSV / online table view</li>
          </>
        )}
      </ul>

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: 'Member 看不到本年的关键原因',
          en: 'Why Members can\'t see the current year',
        }}
      >
        {lang === 'zh' ? (
          <>
            本年度的数据虽然已经填了，但 Entry_Status.espublished 还是 false，
            所以 Member 在 reports 上看不到。<strong>必须等你（Super Admin）在 2-3 月手动把
            该年标记为 Published（参见 2.11）</strong>，他们才能看到。
          </>
        ) : (
          <>
            Current-year data may have been filled, but Entry_Status.espublished is still false, so Members can't see it in /admin/reports.{' '}
            <strong>You (Super Admin) must manually mark the year as Published in Feb-Mar (see 2.11)</strong>, then they can see it.
          </>
        )}
      </Callout>

      {/* ---------------- 3.C E-Resource Editor ---------------- */}
      <SectionH3
        id="s-3-C"
        lang={lang}
        zh="3.C E-Resource 编辑区"
        en="3.C E-Resource Editor Section"
      />

      <P
        lang={lang}
        zh={
          <>
            这一区块在 <Code>/admin</Code> 上有紫色边框，对 Role 1/3/4 可见。
            它管理 3 张全局资源主表 + 2 张报告导出页。
          </>
        }
        en={
          <>
            This section has purple border in <Code>/admin</Code>, visible to roles 1/3/4. It manages the 3 global resource master tables + 2 report export pages.
          </>
        }
      />

      <SectionH4
        id="s-3-C-1"
        lang={lang}
        zh="3.C.1 /admin/survey/avdb/[year] — AV 数据库管理"
        en="3.C.1 /admin/survey/avdb/[year] — AV Database"
      />
      <P
        lang={lang}
        zh={
          <>
            管理全局 <Code>List_AV</Code> 表。每行是一个 AV 资源（VHS/DVD/streaming 等）。
            E-Resource Editor 可以：① 新增条目；② 编辑 title/publisher/format；
            ③ 设置默认 titles/volumes/chapters。
          </>
        }
        en={
          <>
            Manages the global <Code>List_AV</Code> table. Each row is an AV resource (VHS/DVD/streaming, etc.). E-Resource Editors can: (1) add new entries; (2) edit title/publisher/format; (3) set default titles/volumes/chapters.
          </>
        }
      />

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '⚠️ 影响所有机构',
          en: '⚠️ Affects every institution',
        }}
      >
        {lang === 'zh'
          ? '编辑这张表的字段（如改默认 chapters）会立即反映到所有勾选了该资源的机构的统计。改之前最好通知统计委员会。'
          : 'Editing fields in this table (e.g. default chapters) immediately affects every library that has selected this resource. Notify the Statistics Committee before changing.'}
      </Callout>

      <SectionH4
        id="s-3-C-2"
        lang={lang}
        zh="3.C.2 /admin/survey/ebook/[year] — EBook 数据库管理"
        en="3.C.2 /admin/survey/ebook/[year] — EBook Database"
      />
      <P
        lang={lang}
        zh={
          <>
            管理全局 <Code>List_EBook</Code> 表。和 AV 类似，但额外有
            <strong> custom counts per library</strong>，机构可在自己页面填覆盖默认值的 titles/volumes/chapters。
          </>
        }
        en={
          <>
            Manages the global <Code>List_EBook</Code> table. Similar to AV but
            with{' '}
            <strong>per-library custom counts</strong> — libraries can override defaults for titles/volumes/chapters on their own page.
          </>
        }
      />

      <SectionH4
        id="s-3-C-3"
        lang={lang}
        zh="3.C.3 /admin/survey/ejournal/[year] — EJournal 数据库管理"
        en="3.C.3 /admin/survey/ejournal/[year] — EJournal Database"
      />
      <P
        lang={lang}
        zh="管理全局 List_EJournal 表。其字段更多（journals, dbs, subscription type）。机构可填 journals 和 dbs 的覆盖值。"
        en="Manages global List_EJournal. More fields (journals, dbs, subscription type). Libraries can override journals and dbs."
      />

      <SectionH4
        id="s-3-C-4"
        lang={lang}
        zh="3.C.4 /admin/year-end-reports — 年终报告导出"
        en="3.C.4 /admin/year-end-reports — Year-End Report Exports"
      />
      <P
        lang={lang}
        zh={
          <>
            一站式导出本年度所有"supplementary reports"。每个统计领域（Monographic、Volumes、Personnel 等）
            生成一个 Excel + 一个 PDF。常用于：
          </>
        }
        en={
          <>
            One-stop export of all "supplementary reports" for this year. Each statistics domain (Monographic, Volumes, Personnel, etc.) produces one Excel + one PDF. Commonly used for:
          </>
        }
      />
      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>每年 1 月给 JEAL 编辑提交</li>
            <li>统计委员会成员审阅</li>
            <li>归档到本机或 SharePoint</li>
          </>
        ) : (
          <>
            <li>Submitting to JEAL editor every January</li>
            <li>Statistics Committee review</li>
            <li>Local or SharePoint archive</li>
          </>
        )}
      </ul>

      <SectionH4
        id="s-3-C-5"
        lang={lang}
        zh="3.C.5 /admin/participation-reports — 参与报告"
        en="3.C.5 /admin/participation-reports — Participation Reports"
      />
      <P
        lang={lang}
        zh={'按年份导出「哪个机构填了哪些表」的清单。用于 ① 年终统计数据完整度；② 给统计委员会汇报参与率。'}
        en={`Per-year export of "which institution filled which forms". Used for: (1) data-completeness audit at year-end; (2) reporting participation rates to the committee.`}
      />

      {/* ---------------- 3.D Super Admin Toolkit ---------------- */}
      <SectionH3
        id="s-3-D"
        lang={lang}
        zh="3.D Super Admin 工具箱"
        en="3.D Super Admin Toolkit"
      />

      <P
        lang={lang}
        zh={'红色边框区块，只对 Role 1（必要时 Role 4）可见。这是你的「司令部」。'}
        en={'The red-bordered section, visible only to Role 1 (and Role 4 where applicable). This is your "command center".'}
      />

      {/* ---------- 3.D.1 Survey Dates ---------- */}
      <SectionH4
        id="s-3-D-1"
        lang={lang}
        zh="3.D.1 /admin/survey-dates — ⚠️ 日期管理"
        en="3.D.1 /admin/survey-dates — ⚠️ Survey Dates"
      />

      <P
        lang={lang}
        zh="每年 9 月最关键的页面。已在 2.2 详细介绍，这里只列重点："
        en="The most critical page every September. Already detailed in 2.2; key points only here:"
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>
              一次性<strong>统一</strong>设置所有机构的 opening / closing / fiscal_year / publication_date
            </li>
            <li>
              如果 Library_Year 已经存在会被<strong>覆盖</strong>。要注意。
            </li>
            <li>
              提交后系统状态变 <strong>"Scheduled"</strong>（蓝色徽章）。仍未开表。
            </li>
            <li>
              此操作会同时<strong>创建/更新 SurveySession</strong>记录。
            </li>
          </>
        ) : (
          <>
            <li>
              One-shot bulk set of opening / closing / fiscal_year / publication_date for all libraries
            </li>
            <li>
              If Library_Year exists, it will be{' '}
              <strong>overwritten</strong> — be careful.
            </li>
            <li>
              After submit, status badge becomes{' '}
              <strong>"Scheduled"</strong> (blue). Still not open.
            </li>
            <li>
              Also <strong>creates/updates the SurveySession</strong> row.
            </li>
          </>
        )}
      </ul>

      {/* ---------- 3.D.2 Broadcast ---------- */}
      <SectionH4
        id="s-3-D-2"
        lang={lang}
        zh="3.D.2 /admin/broadcast — ⚠️ 广播 + 开关表"
        en="3.D.2 /admin/broadcast — ⚠️ Broadcast + Open/Close Forms"
      />

      <P
        lang={lang}
        zh="这一页是 Super Admin 的「应急按钮」。它有 4 个主要功能区："
        en={`This page is the Super Admin's "emergency button". It has 4 main functional areas:`}
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '功能区', en: 'Area' },
          { zh: '按钮 / 操作', en: 'Buttons / Actions' },
          { zh: '副作用', en: 'Side effects' },
        ]}
        rows={[
          [
            { zh: 'Session Queue', en: 'Session Queue' },
            {
              zh: '查看本年度 ScheduledEvent 的进度（FORM_OPENING / FORM_CLOSING / BROADCAST 各自 pending/completed/cancelled）',
              en: 'See ScheduledEvent progress (FORM_OPENING / FORM_CLOSING / BROADCAST in pending/completed/cancelled)',
            },
            { zh: '只读', en: 'Read-only' },
          ],
          [
            { zh: 'Open All Forms NOW', en: 'Open All Forms NOW' },
            {
              zh: '强制立即开表，绕过 cron。会重置 broadcast_sent 让广播能再发。',
              en: 'Force open forms immediately, bypassing cron. Resets broadcast_sent so broadcasts can resend.',
            },
            {
              zh: '所有 Library_Year.is_open_for_editing → true；写审计日志',
              en: 'All Library_Year.is_open_for_editing → true; writes audit log',
            },
          ],
          [
            { zh: 'Close All Forms NOW', en: 'Close All Forms NOW' },
            {
              zh: '强制立即关表，绕过 cron。',
              en: 'Force close forms immediately, bypassing cron.',
            },
            {
              zh: '所有 Library_Year.is_open_for_editing → false；写审计日志；标记 notifiedOnClose',
              en: 'All Library_Year.is_open_for_editing → false; writes audit log; marks notifiedOnClose',
            },
          ],
          [
            { zh: 'Send Broadcast NOW', en: 'Send Broadcast NOW' },
            {
              zh: '立刻用某模板发广播（不等开表日）。常用于"调查将于 [date] 开放"预公告',
              en: 'Send broadcast with a template right now (no waiting for cron). Often used for the "Survey will open on [date]" pre-announcement',
            },
            {
              zh: '通过 Resend Broadcasts API 发；写审计日志 (auto:[templateKey]:[year])',
              en: 'Sends via Resend Broadcasts API; writes audit log (auto:[templateKey]:[year])',
            },
          ],
        ]}
      />

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '"Re-open Forms" 后记得"Close Again"',
          en: 'After "Re-open Forms", remember to "Close Again"',
        }}
      >
        {lang === 'zh' ? (
          <>
            如果你为了让某个机构补交而重新开表，<strong>所有人都能改</strong>。
            补完后<strong>务必</strong>再来这页点 Close All Forms NOW，
            否则下次 cron 跑时它已经被你弄乱了。
          </>
        ) : (
          <>
            If you re-open forms to let one library catch up,{' '}
            <strong>everyone can edit</strong>. After they finish,{' '}
            <strong>you must</strong> return here and click Close All Forms NOW
            — otherwise the cron will be in a confused state next run.
          </>
        )}
      </Callout>

      {/* ---------- 3.D.3 Email Templates ---------- */}
      <SectionH4
        id="s-3-D-3"
        lang={lang}
        zh="3.D.3 /admin/email-templates — 邮件模板"
        en="3.D.3 /admin/email-templates — Email Templates"
      />

      <P
        lang={lang}
        zh="编辑 4 个模板的 subject + html_body + text_body。已在 2.3 详述。这里补充："
        en="Edit subject + html_body + text_body of the 4 templates. Detailed in 2.3. Additional notes:"
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>Preview</strong>：右侧实时渲染当前 SurveySession 的占位符
            </li>
            <li>
              <strong>Send Test Email</strong>：发到你自己邮箱测试样式
            </li>
            <li>
              <strong>Reset to Default</strong>：恢复到代码里硬编码的默认模板
            </li>
            <li>
              <strong>Save</strong>：保存成 EmailTemplate 表里的 override
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Preview</strong>: live-render with the current SurveySession's placeholder values
            </li>
            <li>
              <strong>Send Test Email</strong>: ship a test email to your own inbox to check styling
            </li>
            <li>
              <strong>Reset to Default</strong>: revert to the hardcoded default template in code
            </li>
            <li>
              <strong>Save</strong>: persist as an override in the EmailTemplate table
            </li>
          </>
        )}
      </ul>

      {/* ---------- 3.D.4 Users ---------- */}
      <SectionH4
        id="s-3-D-4"
        lang={lang}
        zh="3.D.4 /admin/users — 用户管理"
        en="3.D.4 /admin/users — User Management"
      />

      <P
        lang={lang}
        zh={
          <>
            列出所有用户（按机构分组）。每张用户卡片可：
          </>
        }
        en={
          <>
            Lists all users (grouped by institution). Each user card lets you:
          </>
        }
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>Edit Roles</strong>：勾选这个用户的 1/2/3/4 角色（多选）
            </li>
            <li>
              <strong>Send Opening Email</strong>（✉️ 图标）：单独给这个用户重发开表通知
            </li>
            <li>
              <strong>Reset Password</strong>：触发 Forgot Password 流程
            </li>
            <li>
              <strong>Delete</strong>（🗑️ 图标）：软删除——删除登录、角色、图书馆关联，但审计日志保留
            </li>
            <li>
              <strong>Move to another institution</strong>：通过编辑 Library 关联
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Edit Roles</strong>: tick the user's 1/2/3/4 roles (multi-select)
            </li>
            <li>
              <strong>Send Opening Email</strong> (✉️ icon): resend the opening notice to this user only
            </li>
            <li>
              <strong>Reset Password</strong>: trigger the Forgot Password flow
            </li>
            <li>
              <strong>Delete</strong> (🗑️ icon): soft-delete — removes login/roles/library link, audit log preserved
            </li>
            <li>
              <strong>Move to another institution</strong>: via editing the Library association
            </li>
          </>
        )}
      </ul>

      {/* ---------- 3.D.5 Add User ---------- */}
      <SectionH4
        id="s-3-D-5"
        lang={lang}
        zh="3.D.5 /signup — 新建用户"
        en="3.D.5 /signup — Create New User"
      />

      <P
        lang={lang}
        zh="不是注册页，是 Super Admin 替别人建账号的页面。提交后系统会发欢迎邮件，含 24 小时内有效的初始密码链接。"
        en="Not a public sign-up — it's the page where Super Admin creates accounts for others. After submit, the system sends a welcome email with an initial-password link valid 24 hours."
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        <li>
          <strong>Email</strong>:{' '}
          {lang === 'zh' ? '工作邮箱（也是登录用户名）' : 'Work email (also the login username)'}
        </li>
        <li>
          <strong>Institution</strong>:{' '}
          {lang === 'zh' ? '从下拉菜单选机构（必须先在 /create 建好）' : 'Pick from dropdown (institution must already exist via /create)'}
        </li>
        <li>
          <strong>Role(s)</strong>:{' '}
          {lang === 'zh' ? '可多选；最常见是单选 Member' : 'Multi-select; most often a single Member'}
        </li>
        <li>
          <strong>Add to Resend Audience</strong>:{' '}
          {lang === 'zh' ? '默认勾上，让用户能收到广播' : 'Checked by default — adds user to broadcast list'}
        </li>
      </ul>

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '没收到欢迎邮件怎么办',
          en: "What if welcome email doesn't arrive",
        }}
      >
        {lang === 'zh' ? (
          <>
            ① 让用户检查垃圾邮件；② 你回 /admin/users 找到这个新用户，点 Send Opening Email 重发；
            ③ 极端情况：开发者直接在 DB 里设密码哈希（最后手段）。
          </>
        ) : (
          <>
            (1) Have the user check spam; (2) Go to /admin/users, find them, click Send Opening Email to resend; (3) Worst case: developer sets the password hash directly in the DB (last resort).
          </>
        )}
      </Callout>

      {/* ---------- 3.D.6 Libraries ---------- */}
      <SectionH4
        id="s-3-D-6"
        lang={lang}
        zh="3.D.6 /libraries — 机构管理（3 个标签页）"
        en="3.D.6 /libraries — Institutions (3 Tabs)"
      />

      <P
        lang={lang}
        zh="这个页面有 3 个标签页，每个的功能完全不同："
        en="This page has 3 tabs with completely different functions:"
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '标签', en: 'Tab' },
          { zh: '内容', en: 'Contents' },
          { zh: '常用操作', en: 'Common actions' },
        ]}
        rows={[
          [
            { zh: 'Institutions', en: 'Institutions' },
            {
              zh: '所有机构的列表 + 基本信息（名称、地址、联系人）',
              en: 'List of all institutions + basic info (name, address, contact)',
            },
            {
              zh: '点机构进入详情；编辑机构信息；新增/删除机构（去 /create）',
              en: 'Click into a library detail page; edit info; add/delete (go /create)',
            },
          ],
          [
            { zh: 'Participation Status', en: 'Participation Status' },
            {
              zh: '矩阵：行=机构、列=表单类型、单元格=填表状态 + Published 开关',
              en: 'Matrix: rows = institutions, cols = form types, cells = filled status + Published toggle',
            },
            {
              zh: '审核谁填了谁没填；2-3 月勾 Published 开关',
              en: 'Audit who has filled what; tick Published in Feb-Mar',
            },
          ],
          [
            { zh: 'Export', en: 'Export' },
            { zh: '一键导出参与情况 Excel', en: 'One-click export participation Excel' },
            { zh: '给统计委员会汇报', en: 'Report to Statistics Committee' },
          ],
        ]}
      />

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: 'InstitutionSwitcher 在哪',
          en: 'Where is InstitutionSwitcher',
        }}
      >
        {lang === 'zh' ? (
          <>
            Super Admin 在 <Code>/admin/forms</Code> 顶部能看到一个机构选择器。
            选了某机构后，整个表单页就"扮演"这家机构看到的视图（Impersonate）。
            退出 impersonation 在 InstitutionSwitcher 上点 "Reset"。
          </>
        ) : (
          <>
            On <Code>/admin/forms</Code> top, Super Admin sees an Institution selector. After picking one, the form pages "act as" that institution (impersonate). Click "Reset" on the switcher to exit.
          </>
        )}
      </Callout>

      {/* ---------- 3.D.7 Add Library ---------- */}
      <SectionH4
        id="s-3-D-7"
        lang={lang}
        zh="3.D.7 /create — 新建机构"
        en="3.D.7 /create — Create New Library"
      />

      <P
        lang={lang}
        zh={
          <>
            新机构加入 CEAL 时用。填入名称、地址、State、Type（私立/公立/研究型）等。
            提交后系统：
          </>
        }
        en={
          <>
            Use when a new institution joins CEAL. Enter name, address, state, type (private/public/research), etc. After submit, the system:
          </>
        }
      />

      <ol className="list-decimal list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>创建 Library 行（拿到新 libid）</li>
            <li>对当年度自动创建 Library_Year（如果当年已设 SurveySession）</li>
            <li>写审计日志</li>
          </>
        ) : (
          <>
            <li>Creates the Library row (gets a new libid)</li>
            <li>Auto-creates the current-year Library_Year (if SurveySession exists)</li>
            <li>Writes audit log</li>
          </>
        )}
      </ol>

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '建好后还要做',
          en: 'What else to do after creation',
        }}
      >
        {lang === 'zh' ? (
          <>
            ① 去 /signup 给该机构建一个 Member 联系人账号 ；
            ② 让该联系人加入 Resend Audience ；
            ③ 通知统计委员会"已添加 X 大学"。
          </>
        ) : (
          <>
            (1) Go to /signup and create a Member contact account for this library; (2) Add the contact to the Resend Audience; (3) Notify Statistics Committee "X University has been added".
          </>
        )}
      </Callout>

      {/* ---------- 3.D.8 Published Reports ---------- */}
      <SectionH4
        id="s-3-D-8"
        lang={lang}
        zh="3.D.8 /admin/published-reports — JEAL 出版的 PDF"
        en="3.D.8 /admin/published-reports — JEAL Published PDFs"
      />

      <P
        lang={lang}
        zh={'管理首页和 reports 页面上展示的「历年 JEAL 出版报告」链接列表。已在 2.10 详述。'}
        en="Manages the list of past JEAL-published report links shown on homepage and reports page. Detailed in 2.10."
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>列表：所有历年 PDF 链接（按 academic_year 倒序）</li>
            <li>Add new：每年 2 月 JEAL 出版后添加</li>
            <li>Edit：可改链接、标题、是否 Published</li>
            <li>Delete：永久删除（小心）</li>
          </>
        ) : (
          <>
            <li>List: all past PDF links (descending by academic_year)</li>
            <li>Add new: add after JEAL publication every February</li>
            <li>Edit: change URL, title, or is_published</li>
            <li>Delete: permanent delete (careful)</li>
          </>
        )}
      </ul>

      {/* ---------- 3.D.9 Audit Logs ---------- */}
      <SectionH4
        id="s-3-D-9"
        lang={lang}
        zh="3.D.9 /admin/audit-logs — 审计日志"
        en="3.D.9 /admin/audit-logs — Audit Logs"
      />

      <P
        lang={lang}
        zh={
          <>
            <strong>所有修改</strong>都会写一条审计日志。登录失败、表单提交、删除用户、cron 操作、广播发送——全在这里。
          </>
        }
        en={
          <>
            <strong>Every modification</strong> writes an audit log entry. Failed logins, form submissions, user deletions, cron operations, broadcast sends — all here.
          </>
        }
      />

      <P
        lang={lang}
        zh="搜索字段："
        en="Search fields:"
      />
      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>action</strong>: CREATE / UPDATE / DELETE / LOGIN / LOGIN_FAILED / SYSTEM_OPEN_FORMS / SYSTEM_CLOSE_FORMS
            </li>
            <li>
              <strong>entity</strong>: User / Library / Library_Year / EmailBroadcast / SurveySession / ...
            </li>
            <li>
              <strong>userId</strong>: 谁做的；系统操作 = 0
            </li>
            <li>
              <strong>before / after JSON</strong>: 修改前/后的字段对比
            </li>
            <li>
              <strong>timestamp</strong>: 严格 UTC，可按时间窗筛选
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>action</strong>: CREATE / UPDATE / DELETE / LOGIN / LOGIN_FAILED / SYSTEM_OPEN_FORMS / SYSTEM_CLOSE_FORMS
            </li>
            <li>
              <strong>entity</strong>: User / Library / Library_Year / EmailBroadcast / SurveySession / ...
            </li>
            <li>
              <strong>userId</strong>: who did it; system operations = 0
            </li>
            <li>
              <strong>before / after JSON</strong>: field-level diff
            </li>
            <li>
              <strong>timestamp</strong>: strict UTC, filterable by window
            </li>
          </>
        )}
      </ul>

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '审计日志的 5 大用法',
          en: '5 main uses of audit logs',
        }}
      >
        <ol className="list-decimal list-inside space-y-1 mt-1">
          {lang === 'zh' ? (
            <>
              <li>查"昨晚的 cron 跑了没"——找 SYSTEM_OPEN_FORMS / SYSTEM_CLOSE_FORMS</li>
              <li>查"X 用户什么时候登录的"——找 LOGIN（按 userId 过滤）</li>
              <li>查"X 机构数据什么时候改的"——按 entity=Library_Year + libid 过滤</li>
              <li>查"广播邮件发了几次"——entity=EmailBroadcast</li>
              <li>查疑似攻击——LOGIN_FAILED 短时间大量同 IP</li>
            </>
          ) : (
            <>
              <li>"Did last night's cron run?" — find SYSTEM_OPEN_FORMS / SYSTEM_CLOSE_FORMS</li>
              <li>"When did user X log in?" — find LOGIN (filter by userId)</li>
              <li>"When was institution X's data changed?" — filter entity=Library_Year + libid</li>
              <li>"How many broadcasts went out?" — entity=EmailBroadcast</li>
              <li>"Suspected attack" — LOGIN_FAILED bursts from same IP</li>
            </>
          )}
        </ol>
      </Callout>

      {/* ---------- 3.D.10 Superguide ---------- */}
      <SectionH4
        id="s-3-D-10"
        lang={lang}
        zh="3.D.10 /admin/superguide — 本指南"
        en="3.D.10 /admin/superguide — This Guide"
      />

      <P
        lang={lang}
        zh="你正在看的页面。Super Admin / Assistant Admin 都能访问。建议设为浏览器书签，遇到问题第一站。"
        en="The page you're looking at. Available to Super Admin / Assistant Admin. Bookmark it as your first stop for any question."
      />

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
            读完第 3 部分，你已经知道每一页是干什么的、有哪些按钮、按下去会发生什么。
            接下来{' '}
            <PageLink href="#part-4">第 4 部分</PageLink> 把"自动 vs 手动"的边界讲清楚，让你心里有底。
          </>
        ) : (
          <>
            After Part 3 you know what every page does, what each button does, and what happens when you click. Next,{' '}
            <PageLink href="#part-4">Part 4</PageLink> draws the line between "automatic" and "manual" so you'll always know who's responsible.
          </>
        )}
      </Callout>
    </div>
  )
}
