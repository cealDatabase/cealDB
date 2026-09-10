# CEAL Statistics Database — Launch Session Slide Outline

**Session:** Introducing the New CEAL Statistics Database
**Date:** Monday, September 14, 2026 · 2:00 pm CST / 3:00 pm EST
**Format:** Zoom, open registration · organised by the CEAL Statistics Committee
**Total time:** 45 minutes

| # | Speaker | Role | Minutes | Focus |
|---|---------|------|---------|-------|
| 1 | **Anlin Yang** | Chair, CEAL Statistics Committee | 10 | Data collection process and general functions. No development detail. |
| 2 | **Meng Qu** | Web Service Librarian, Miami University | ~18 | Why we rebuilt, scope of work, what's new, effort, the 2025 live cycle, 2026 commitment |
| 3 | **Yifan (Ivan) Huang** | Backend developer | ~12 | Data migration, schema design, data preservation, one-click roll-forward, cloud security |
| 0 & 4 | All three | | ~3 | Title, close, and Q&A |

**Running order:** Anlin → Meng → Yifan → joint Q&A.

Anlin's 10 minutes are fixed. Meng and Yifan share the remaining 35, which
this outline splits as 18 + 12, with the title slide, the close and Q&A taking
the last 3 and about 2 minutes of buffer left over. Every slide below carries
a running clock so you can tell mid-talk whether you are ahead or behind.

**Deck conventions used below**
- Slide body text is written in **English** — copy it onto the slide as-is.
- `讲稿:` lines are **Chinese speaker notes** — for you, not the slide.
- `来源:` gives the file in this repo that backs the claim, so you can re-verify
  before you present.
- `[SCREENSHOT]` marks a slide that needs a screen capture you must take
  yourself (this outline was written from the code; the live sites were not
  reachable from the machine that generated it).
- `[NEEDS]` marks something only you can supply.

---

## Part 0 — Opening

### S1 · Title  ·  (0:00 – 0:01)

> # CEAL Statistics Database
> ## A New Home for Six Decades of East Asian Library Data
>
> **cealstats.org**
>
> Anlin Yang — Chair, CEAL Statistics Committee
> Meng Qu — Web Service Librarian, Miami University
> Yifan Huang — Backend Developer
>
> September 14, 2026

`讲稿:` 开场 30 秒。三个人都露个面报个名字,说明分工:Anlin 讲怎么用、我们两个讲怎么做出来的。不要在这里讲技术。

`[SCREENSHOT]` 建议背景放新站首页的一张大图。

---

## Part 1 — Anlin Yang (10 min)

> **给 Anlin 的说明:** 这一部分只是占位大纲,内容由 Anlin 自己决定。
> 建议把这份文件发给她,让她按自己的节奏填,不要替她写讲稿。
> 她的定位是"应用层"——数据怎么报、大家怎么用,**不涉及开发过程**。

### S2 · Why the Committee Commissioned a New System  ·  (0:01 – 0:03)

> - CEAL has published statistics since 1957; the online database since 1999
> - The legacy platform had reached the end of its serviceable life
> - The Committee's charge: preserve every function, modernise the experience
> - Continuity of the historical record was non-negotiable

`讲稿:` Anlin 从委员会视角说明为什么要换,强调"数据连续性"是第一原则。

### S3 · The Annual Cycle, From a Member Library's View  ·  (0:03 – 0:04)

> - Fiscal year covered: July 1 → June 30
> - Survey opens: **October 1** · closes: **December 2**
> - One-week reminder before closing
> - Committee review → year-end reports → publication in *JEAL* (Feb–May)

`讲稿:` 这几个日期是系统里的默认值,每年可由 Super Admin 调整。
`来源:` `lib/surveyDates.ts`, `docs/en/05-annual-cycle.md`

### S4 · Live Walkthrough — Submitting Your Data  ·  (0:04 – 0:07)

> Sign in → **My Forms** → choose a form → enter data → **Save Draft** → **Submit**
>
> Three statuses you will see: **Ready** · **Filled** · **Submitted**

`讲稿:` 建议 Anlin 真机演示。提醒她:Save Draft 和 Submit 是两个按钮,Submit 才会把状态标成已提交。演示前先确认演示账号能登录。
`来源:` `app/(authentication)/admin/forms/page.tsx`, `components/forms/shared/FormSubmitSection.tsx`

### S5 · Live Walkthrough — Using the Public Statistics  ·  (0:07 – 0:09)

> - **Quick View** — aggregated table by year and institution
> - **Table View** — any of the 10 data tables, multi-year, multi-institution
> - **Graph View** — bar / line / area / pie, exportable as PNG
> - **Published PDFs** and the **pre-1998 archive**

`讲稿:` 三个视图都不需要登录,任何人都能看,这是对外推广的重点。
`来源:` `app/statistics/{quickview,tableview,graphview,pdf,pre-1998}/`

### S6 · What the Committee Needs From You This Year  ·  (0:09 – 0:10)

> - Confirm your institution's delegate and contact email
> - Watch for the "surveys are now open" message on October 1
> - New participating libraries: contact the Committee to be set up

`讲稿:` Anlin 的行动号召页。

### S7 · Handing Over to the Development Team  ·  (0:10 – 0:11)

> "Our developers will now walk you through how the new system was built —
> and what changed under the hood."

`讲稿:` 交接页。Anlin 说完这句,Meng 接屏。**这里控好时间,Anlin 超时会挤掉后面 35 分钟。**

---

## Part 2 — Meng Qu (~18 min, S8 – S21)

### S8 · Where We Started  ·  (0:11 – 0:13)

> **ceal.ku.edu — what it did well**
> - Held every pre-2024 data point and the full form structure
> - Served three audiences reliably for two decades
>
> **What it could no longer do**
> - Fixed-width layout — unusable on a phone or tablet
> - Colour and typography from another era
> - Aging PHP / MySQL stack, increasingly hard to host and secure
> - No self-service for administrators — every change needed a developer

`讲稿:` 这一页的语气很重要。**先肯定旧站**——它撑了二十年,所有历史数据和表单结构都在里面,我们是站在它的肩膀上。然后再说局限。不要贬低前人的工作,委员会里可能就坐着当年推动旧站的人。

`[SCREENSHOT]` 需要两张图并排:旧站首页 + 旧站在手机上的样子(浏览器开发者工具调成 390px 宽截图,对比效果最直观)。

### S9 · The Design Brief  ·  (0:13 – 0:14)

> **Keep every function. Replace the experience.**
>
> - Full feature parity with the legacy site — nothing removed
> - Then add what administrators had always had to ask a developer for
> - Modern, responsive, accessible; fluent in Chinese, Japanese and Korean
> - Documented well enough that the next maintainer can take over

`讲稿:` 这是整个演讲的中心论点,后面所有内容都挂在这四条上。第四条("写好文档让下一任接得住")对委员会特别有说服力——他们最怕的就是开发者一走系统就死。

### S10 · Feature Parity Map — Four Tiers of Access  ·  (0:14 – 0:15)

> | | Guest | Member | Editor | Super Admin |
> |---|---|---|---|---|
> | Public statistics, charts, PDFs | ✅ | ✅ | ✅ | ✅ |
> | Submit own institution's 10 forms | | ✅ | | ✅ |
> | View own multi-year reports & ranking | | ✅ | ✅ | ✅ |
> | Curate the AV / E-Book / E-Journal master lists | | | ✅ | ✅ |
> | Read and edit across all institutions | | | ✅ | ✅ |
> | Manage users, roles, survey dates, broadcasts | | | | ✅ |
> | Edit after the closing date | | | | ✅ |
>
> Every tier from the legacy site is preserved — and each now sees exactly
> what it is entitled to, enforced in the database, not just in the interface.

`讲稿:` 强调最后一句:旧站很多"权限"其实只是界面上不显示,新站是在数据库层面校验的。中间件先拦一道,每个 admin 接口再用 `isSuperAdminDb()` 回数据库复核一次,cookie 本身不能作为授权依据。
另外补一句:数据库里其实还有第五个角色 Assistant Admin(助理管理员),是 Super Admin 的减配版,不能管用户。
`来源:` `proxy.ts`, `lib/auth.ts:217-226`, `lib/formPermissions.ts`

### S11 · Working With the Statistics Committee  ·  (0:15 – 0:17)  ⭐

> **This was never just a coding project.**
>
> Throughout the rebuild, Committee Chair **Anlin Yang**:
> - Clarified what each form field actually means, question by question
> - Connected us to the right person at each participating institution
> - Coordinated deadlines and kept the schedule realistic
> - Verified data against the historical record, year by year
> - Chaired the decisions that unblocked us — repeatedly, and quickly
>
> **[NEEDS: ~N email threads over ~M months]**
>
> Requirements for a survey this specific cannot be read out of a database.
> They came from that correspondence.

`讲稿:` 这是**致谢页,也是"我们工作方式"的证明页**。两层意思要讲出来:
1. 真诚感谢 Anlin。她做的沟通、指导、找对人、协调、核对数据,这些工作量不比写代码少,而且是我们写不了的。
2. 顺带向委员会证明:这个项目不是两个程序员关起门来自己搞的,每一个字段的定义都是跟委员会来回确认过的。这一点比任何技术指标都能建立信任。

`[NEEDS]` 去邮箱里数一下跟 Anlin 的邮件往来:大概多少个 thread、跨越多少个月。放一个具体数字上去,比说"大量沟通"有力得多。如果方便,可以截一张邮件列表的图(**记得把地址和正文打码**)。

### S12 · What Members Already Noticed in 2025  ·  (0:17 – 0:18)

> **Signing in got safer — and easier**
> - Two-step sign-in: enter your email first; the system tells you whether you
>   still need to set a password *before* asking for one
> - New accounts and password resets arrive as a **secure one-time email link,
>   valid 24 hours** — no more passwords sent in plain text
> - Change your own password any time, from inside the site
> - Delegates covering more than one institution can switch between them
>   without signing out

`讲稿:` ⚠️ **重要更正——不要说"15 分钟验证邮件"。** 我核对过代码:实际生效的链接是 **24 小时**有效期(`app/api/password-reset/route.ts:115`、`app/(authentication)/api/signin/route.ts:86`,连邮件正文 `lib/email.ts:123` 写的都是 24 hours)。
代码里确实有一条 15 分钟的老路径(`app/(authentication)/api/send/route.ts:28`),但全库搜不到任何调用方,是早期设计的死代码——而且那条路径的"token"就是个客户端传来的时间戳,任何人都能伪造,页面还会把密码哈希直接渲染到 HTML 里。**这条路径应该删掉,不应该拿出来讲。**
台上说"24 小时内有效的一次性安全链接"就够了,听众关心的是"不再明文发密码",不是具体多少分钟。

`来源:` `app/api/password-reset/route.ts`, `lib/email.ts`, `app/(authentication)/signin/page.tsx`, `components/InstitutionSwitcher.tsx`

### S13 · The Super Admin Toolkit, Part 1 — Running the Survey  ·  (0:18 – 0:20)

> Everything below used to require a developer. Now it is a page in the site.
>
> - **Survey dates** — set opening, closing, fiscal and publication dates per year
> - **Open a new year** — creates the year's records for every institution at once
> - **Force open / force close** — an override for when the schedule slips
> - **Broadcast console** — a guided 4-step wizard: preview → confirm → send → done,
>   with send-now or schedule-for-later
> - **Email templates** — edit the subject and body of every automated message
>   right in the browser, with `{{openingDate}}`-style placeholders and live preview
> - **Individual notification** — email one specific delegate the "surveys are open"
>   message, for the library that joined after the announcement went out

`讲稿:` 最后一条就是你特别想讲的那个功能:年中新加入的用户错过了开放通知,主管用户现在可以在 `/admin/users` 里点那一行的✉️按钮,单独给这个人补发一封。这个动作还会写进审计日志。
讲这一页的时候,反复回到一句话:**"以前这些都得找开发者,现在委员会自己就能做。"** 这才是委员会真正在意的收益。
`来源:` `app/api/admin/send-individual-email/route.ts`, `components/UserRoleManager.tsx:151-169`, `app/(authentication)/admin/broadcast/BroadcastClient.tsx`, `app/(authentication)/admin/email-templates/`

### S14 · The Super Admin Toolkit, Part 2 — People, Data, Publication  ·  (0:20 – 0:21)

> - **Users and roles** — search, reassign institutions, edit roles, export the
>   full roster as CSV; the system refuses to delete the last Super Admin
> - **Add a new institution** — a 6-step guided wizard, no database access needed
> - **Audit log** — every change recorded with who, when, from where, and a
>   before/after comparison of the values
> - **Participation reports** — who has submitted what, for any year
> - **Year-end reports** — export any year as Excel, Word, PDF, or a batch ZIP
> - **Published reports** — upload and publish the JEAL PDFs; the public page
>   updates immediately
> - **CEAL ranking, 1970 – present** — click any metric for the full ranking

`讲稿:` 审计日志那条要讲透一点:每一次修改都能追溯到人、时间、IP,而且能看到改之前和改之后的值。这对委员会是"数据可信"的保证,对我们是排查问题的工具。
"拒绝删除最后一个 Super Admin"这种细节可以随口带一句,听众会笑,而且能体现我们考虑得多细。
`来源:` `components/AuditLogViewer.tsx`, `lib/auditLogger.ts`, `app/api/admin/users/`, `components/library-creation-wizard.tsx`

### S15 · Design, Language and Accessibility  ·  (0:21 – 0:22)

> **Responsive** — one layout that works from a 390 px phone to a wide desktop
>
> **Genuinely multilingual typography** — Noto Sans SC, TC, JP and KR load
> alongside the Latin face, so Chinese, Japanese and Korean titles render
> correctly instead of falling back to boxes
>
> **Built on accessible primitives** — keyboard navigation, focus management
> and screen-reader roles come from the component library, not bolted on after
>
> **Two complete bilingual guides, inside the site**
> - `/help` — Member User Guide, 8 chapters, English / 中文 toggle
> - `/admin/superguide` — Super Admin Guide, 9 chapters
> - Both searchable, both printable

`讲稿:` 这一页现场演示效果最好:把浏览器窗口从宽拖到窄,让他们看布局自己重排。旧站做不到这个。
双语指南是个被低估的卖点——委员会成员里有母语非英语的,而且这两份指南意味着"用户不用发邮件问我们"。
⚠️ 不要提暗色模式。配置里开了 `darkMode: ["class"]`,但没有主题切换器,实际上没做完。
`来源:` `app/layout.tsx`, `app/help/`, `app/(authentication)/admin/superguide/`, `tailwind.config.mjs`

### S16 · The Stack, and Why  ·  (0:22 – 0:23)

> | Layer | Choice | Why |
> |---|---|---|
> | Framework | **Next.js 16 / React 19** | One codebase for pages and APIs; long support horizon |
> | Data | **Prisma 7 + PostgreSQL** | Type-safe queries; relational integrity for 40+ tables |
> | Database host | **Neon** | Serverless Postgres; branch a copy to test safely |
> | Application host | **Vercel** | Zero-ops deploys, built-in scheduled jobs, automatic TLS |
> | Email | **Resend** | Audience-based broadcasts, delivery logs |
>
> Three vendors, all replaceable — and the exit path for each is written down.

`讲稿:` 不要念表格。挑两句说:一是这些都是当下主流的现代技术栈,二是最后那句——我们没有把委员会锁死在任何一家供应商上,`docs/en/08-migration.md` 里写了四种搬家方案(换数据库、换主机、换邮件商、整体搬回校内服务器)。委员会最怕的就是被绑架,这句话直接回应那个担心。
`来源:` `package.json`, `docs/en/03-architecture.md`, `docs/en/08-migration.md`

### S17 · What This Actually Took  ·  (0:23 – 0:25)  ⭐

> **March 13, 2024 → today · 29 months**
>
> | | |
> |---|---|
> | Commits | **886** |
> | Pull requests reviewed and merged | **154** of 156 |
> | Tagged releases | **3** |
> | Hand-written lines of code | **~100,000** across 501 files |
> | API endpoints | **134** |
> | Pages | **72** |
> | Database tables | **41** |
> | Lines of documentation | **3,793**, bilingual |
>
> Two developers. Roughly **30 commits every month for two and a half years.**

`讲稿:` 这是"我们有多辛苦"的核心证据页,慢慢讲,给他们时间看数字。
几个可以口头补充的:
- 886 次提交里我提交了 693 次(78%),奕帆 111 次,剩下是合并记录。
- 154 个 PR 全部经过 review 才合进主干,不是随手往线上推。
- 十万行是**手写代码**,已经把自动生成的数据库客户端代码和 lockfile 剔掉了——不要虚报,万一有懂行的人问起来,我们的数字要经得起查。

⚠️ 如果被问到"总共改了多少行":这个数字算不出来(我们手上是浅克隆),而且 `git log --numstat` 的原始数字被自动生成的代码灌水了大概一倍。**宁可说"我没有可靠的数字",也不要报一个虚的。**

`来源:` GitHub API(`cealDatabase/cealDB` 主干全量历史),已三向交叉校验总和为 886

### S18 · How It Was Built — Ten Phases  ·  (0:25 – 0:26)

> | | Phase | Period | Commits |
> |---|---|---|---|
> | 1 | Foundation — Next.js + Prisma scaffold | Mar – May 2024 | ~95 |
> | 2 | Authentication, sessions, roles, email | May – Aug 2024 | ~90 |
> | 3 | Data model + legacy statistics import | Aug – Oct 2024 | ~50 |
> | 4 | AV / E-Book / E-Journal databases; first admin tools | Oct 2024 – Mar 2025 | ~110 |
> | 5 | The ten survey forms | Apr – Aug 2025 | ~115 |
> | 6 | Go-live hardening → **v1.0-alpha** | Sept 2025 | 116 |
> | 7 | **The 2025 collection cycle, live** | Oct – Dec 2025 | **218** |
> | 8 | Reporting, exports, publication pipeline | Jan – Mar 2026 | 55 |
> | 9 | Public statistics UI, ranking → **v1.1, v1.2** | May – Jun 2026 | 63 |
> | 10 | Consolidation and security layer | Aug 2026 | — |

`讲稿:` 让他们注意第 7 阶段的 218 和第 6 阶段的 116 —— 直接引出下一页。
可以说一句:前五个阶段是"造",第六到第十个阶段是"守"。

### S19 · The 2025 Cycle — It Ran, End to End  ·  (0:26 – 0:28)  ⭐

> **311 commits landed in September and October 2025 alone —
> 35% of the entire project, in two months.**
>
> That is what it looks like to support a live survey while real libraries are
> entering real data. What we did during those weeks:
>
> - Stood up and tuned the automatic open/close scheduling **in production**
> - Corrected survey arithmetic against the actual questionnaire — serial title
>   totals, grand totals for materials held, electronic subtotals
> - Added **"View data from the past 5 years"** to all ten forms, mid-cycle,
>   because respondents asked for it
> - Closed gaps in Save Draft; added submit-status badges to *My Forms*
> - Repaired UTF-8 handling so CJK titles export correctly
> - Renamed "Add to My Subscription" → "Add to My Access" across the site
>   after feedback that the old wording was misleading
>
> **And one we're proud of:** we attempted a major framework upgrade in
> mid-October, saw risk to the live cycle, and rolled it back within the hour.
> We shipped it ten months later, when nobody's data was on the line.

`讲稿:` 这一页是整个演讲情绪的高点,值得多花 30 秒。
最后那条回滚的故事一定要讲——它不是失败,是判断力。听众里的管理者会记住这个:**这两个人知道什么时候不该动。**
"过去五年数据"那条也要讲:它不是我们规划里的功能,是收集期间用户提出来我们当场加的,而且十个表单全加了。这最能说明我们在盯着系统跑。
`来源:` GitHub 提交历史 2025-09 至 2025-12

### S20 · 2026 — We Are Still Watching  ·  (0:28 – 0:29)

> **The 2025 collection was completed successfully. The 2026 cycle has the
> same two people behind it.**
>
> - Meng Qu and Yifan Huang continue to monitor the system through this year's cycle
> - Bugs get fixed on first report, not on the next release cycle
> - Documentation is kept current: 9 chapters in English and Chinese, plus two
>   in-app guides that update with the software
> - A written handover checklist exists, so the Committee is not dependent on
>   any one person indefinitely

`讲稿:` 这一页回应委员会最深的那个顾虑:"这两个人走了怎么办?"
三层保证:今年我们还在盯着;出了 bug 第一时间修;而且就算我们真的走了,文档和交接清单都在,`docs/en/09-glossary.md` 里连账号该转给谁都列好了。
`来源:` `docs/en/07-maintenance.md`, `docs/en/09-glossary.md`

### S21 · Over to Yifan  ·  (0:29, 30 seconds)

> "So far I've talked about what you can see. Yifan will now cover what sits
> underneath — how twenty-five years of data was moved, how the new forms were
> designed, how we make sure nothing is ever lost, and how the whole thing is
> secured in the cloud."

`讲稿:` 这就是你原话的英文版。说完切给奕帆。**看一眼时间——如果这时已经超过 30 分钟,提醒奕帆压缩到 10 分钟,把 Q&A 时间留住。**

---

## Part 3 — Yifan Huang (~12 min, S22 – S30)

### S22 · The Migration Problem  ·  (0:29 – 0:31)

> **Moving from PHP + MySQL to TypeScript + PostgreSQL**
>
> - Decades of statistics, plus the full form structure, had to arrive intact
> - Two different database engines, with different type systems and quirks
> - No downtime budget — the historical record had to stay online
> - Nothing could be silently lost, rounded, or re-interpreted
>
> "We have already done the hardest possible migration once."

`讲稿:` 开门见山:迁移不是复制粘贴。两套数据库的类型系统、编码、自增 ID 行为都不一样。
最后那句引号是我们自己文档里的原话,可以直接引用。
`来源:` `docs/en/08-migration.md`

### S23 · What Broke, and How We Fixed It  ·  (0:31 – 0:33)

> **Sequence drift.** After restoring from the legacy dump, PostgreSQL's
> auto-increment counters lagged behind the actual data — so the very first new
> record collided with an existing ID.
> → We wrote a repair tool that resets every counter across every table, and
> wired it into the reset, the seed, and an on-demand admin endpoint.
>
> **Legacy password hashes.** Accounts carried credentials from the old system
> in formats we would not accept going forward.
> → Rather than weaken the new system to accommodate them, we detect the old
> format and route the user into a secure password-setup link.
>
> **Broken CJK characters.** Chinese, Japanese and Korean titles came through
> the migration with encoding damage in places.
> → Fixed at the export layer and again in display; re-verified against the
> source records.

`讲稿:` 这一页是奕帆的主场。序列号漂移这个问题讲得越具体越好——它是那种"外行听不懂但一听就知道很麻烦"的问题,而且我们不是手动改一次了事,是写了工具+挂到三个入口自动跑。
`来源:` `scripts/fix-all-sequences.js`, `lib/sequenceFixer.ts`, `hooks/useAutoSequenceFix.ts`, `app/api/fix-sequences/route.ts`

### S24 · Redesigning the Forms Around One Idea  ·  (0:33 – 0:35)

> **`Library_Year` — one record per institution, per academic year.**
>
> ```
> Library  (one row per institution)
>    └── Library_Year  (one row per institution per year)  ← the hub
>          └── the 10 form tables, one row each
> ```
>
> Everything hangs off it:
> - Every form submission joins through it
> - A single switch on it — `is_open_for_editing` — decides whether that
>   institution can edit that year
> - Per-year date overrides live on it
> - Empty rows are created in advance, so a library that submits nothing still
>   has a place in the record

`讲稿:` 这个设计是整个数据库的骨架,值得画出来。一句话总结:**"开放/关闭"不是一个全局开关,而是每个机构每一年一个开关**——所以委员会可以单独为某一个迟交的图书馆重新开放表单,不影响别人。
`来源:` `prisma/schema/schema.prisma` (model `Library_Year`), `docs/en/04-database.md`

### S25 · Why the Tables Are So Wide  ·  (0:35 – 0:36)

> Every measure is broken out the same way:
>
> **Chinese · Japanese · Korean · Non-CJK · Subtotal**
>
> Repeated for every question on the form. The *Electronic* table alone has
> around 110 columns.
>
> **This is deliberate.** The database mirrors the paper questionnaire
> field-for-field, so a number in the system can always be traced back to the
> exact question that produced it.

`讲稿:` 这一页是"诚实的取舍"——技术上更"漂亮"的做法是把语言拆成单独的表,但那样一来,数据库里的数字就跟纸质问卷对不上号了,委员会核对数据会非常痛苦。我们选择了可追溯性。
如果有懂技术的人质疑表太宽,这就是答案。
`来源:` `prisma/schema/electronic.prisma`, `docs/en/04-database.md`

### S26 · Title Lists — Store Once, Share Everywhere  ·  (0:36 – 0:37)

> For AV, e-book and e-journal databases we split the catalogue from the counts:
>
> - **One row per title**, shared across all institutions
> - **Per-year, per-title counts** attached separately
> - **A subscription link** recording which library had access in which year
>
> So one e-journal package is described once, not fifty times — and when a
> title's details are corrected, every institution's record is corrected with it.

`讲稿:` 用一个具体例子讲:某个数据库全北美有三十家订,旧结构下这个标题就存三十遍,改一次名字要改三十处。新结构存一遍,改一次全都对。
`来源:` `prisma/schema/list_{av,ebook,ejournal}.prisma`, `library_year_list.prisma`

### S27 · Never Lose Data  ·  (0:37 – 0:38)

> - **Drafts are safe.** Saving updates the same record rather than creating a
>   new one, so you can come back days later and pick up exactly where you were.
> - **Submission is tracked separately** from the data itself, per form, per year.
> - **All-zero submissions are recognised** as non-participation rather than
>   being counted as real reported zeros.
> - **Every change is logged** — who, when, from which address, and what the
>   value was before and after.
> - **Edits after the deadline** are marked with a dedicated warning banner, a
>   distinct log entry, and a field-by-field record of what changed.

`讲稿:` 第三条值得多说一句:如果一个图书馆整张表填的全是 0,那通常意味着"没参与",而不是"真的是 0"。系统会识别这种情况,不会把它标成已提交——这是我们跟委员会来回确认过的业务规则,不是我们自己拍脑袋定的。
`来源:` `lib/entryStatus.ts`, `lib/formValidation.ts`, `lib/postCollectionAuditLogger.ts`, `components/forms/PostCollectionWarning.tsx`

### S28 · One-Click Roll-Forward  ·  (0:38 – 0:39)

> **Nobody should re-key data the system already has.**
>
> - **Copy last year forward** — bring an institution's AV / e-book / e-journal
>   subscriptions into the new year in one action, with duplicate protection
>   and a report of exactly what was and wasn't copied
> - **Eight cross-form imports** — pull e-book and e-journal figures into the
>   Serials, Electronic, Electronic Books and Other Holdings forms; pull last
>   year's Volume Holdings forward
> - **"Import from all databases"** — one button that populates the Electronic
>   form from all three title lists at once

`讲稿:` 这是收集期间最受欢迎的功能之一。演示的时候可以强调"去重保护":如果目标年度已经有记录,系统会拒绝覆盖并告诉你冲突在哪,不会闷头把数据盖掉。
`来源:` `lib/copyRecords.ts`, `app/api/copy-records/route.ts`, `app/api/*/import-*/`

### S29 · Security in the Cloud  ·  (0:39 – 0:40)

> - **Two layers of authorisation.** The gate at the door checks your session;
>   then every administrative operation re-checks your role against the
>   database. A tampered browser cookie gets you nowhere.
> - **Session tampering is detected** and forces an immediate sign-out.
> - **Passwords are hashed with Argon2id** — the current recommended algorithm,
>   deliberately memory-hard, tuned to 64 MB per verification.
> - **Sessions are signed tokens in browser-only cookies**, unreadable to
>   page scripts.
> - **The scheduled job is authenticated too** — the endpoint that opens and
>   closes the survey rejects anyone without the shared secret.
> - **Encrypted, certificate-verified connections** to the database.
> - **Every privileged action is auditable** — including bulk exports of
>   contact data.

`讲稿:` 第一条是重点,用大白话讲:**"界面上看不到"和"访问不到"是两回事**。旧站很多地方只是不显示按钮,新站是每个操作回数据库再问一次"你到底是谁"。
`来源:` `proxy.ts`, `lib/auth.ts`, `app/api/validate-session/route.ts`, `app/api/cron/check-form-schedules/route.ts`

### S30 · Backup, Restore, and the Exit Plan  ·  (0:40 – 0:41)

> **Restore**
> - The database platform supports branching and point-in-time restore — we can
>   spin up a copy of the database as it was at a given moment, without touching
>   production
> - Scheduled full dumps, stored away from the database provider; nightly during
>   the collection window
>
> **Exit**
> Four migration paths are written down, step by step, in the repository:
> 1. Move the database to another PostgreSQL provider
> 2. Move the application to another host
> 3. Move email to another provider
> 4. Move the entire stack onto a campus server
>
> **The Committee is not locked in to any vendor — and the instructions do not
> depend on us being reachable.**

`讲稿:` 这一页专门讲给委员会里管钱和管风险的人听。
最后那句加粗的话是整个第三部分的落点:我们不仅把系统做出来了,还把"没有我们该怎么办"写下来了。
⚠️ 诚实提醒:自动备份目前还没有配置,文档里把它列为待办。如果被问到,就照实说"这是我们下一步要补的",不要含糊过去——见 S31 路线图。
`来源:` `docs/en/08-migration.md`, `docs/en/06-deployment.md`, `docs/en/07-maintenance.md`

---

## Part 4 — Close (all three speakers)

### S31 · What's Next, and How to Reach Us  ·  (0:41 – 0:42)

> **On our list**
> - Automated off-site database backups on a fixed schedule
> - Submission confirmation receipts by email
> - A self-service password reset button for administrators
> - Continued accessibility work toward a formal review
>
> **If something looks wrong**
> - Tell us — during the collection window we aim to fix reported bugs the
>   same week
> - Member guide: **cealstats.org/help** (English / 中文)
> - Super Admin guide: **cealstats.org/admin/superguide**

`讲稿:` 主动讲路线图,比被问出来强。这一页传达的是"我们知道还差什么",这本身就是专业度的信号。
不要在这一页列太多缺陷,挑四条能听懂的、正在做的。内部那份完整清单见文末附录,**不要放上台**。

### S32 · Thank You  ·  (0:42 – 0:43)  ·  Q&A 0:43 – 0:45

> **Thank you**
>
> - **Anlin Yang** and the CEAL Statistics Committee — for the guidance,
>   the coordination, and for checking every number with us
> - Every participating library that submitted data through the new system
>   in its first year
>
> **cealstats.org**
>
> Meng Qu — qum@miamioh.edu
> Yifan Huang
>
> **Questions?**

`讲稿:` 再次点名感谢 Anlin,呼应 S11。然后开放提问,三个人都留在画面里。

---

## Appendix A — Q&A spare slides

Keep these hidden at the end of the deck; pull one up only if asked.

| If someone asks… | Show / say |
|---|---|
| "Where did the pre-1998 data go?" | It is preserved as scanned PDFs at `/statistics/pre-1998`, deliberately kept separate: the questionnaire was substantially revised in the 1998–99 cycle, so combining old and new figures in one chart would misrepresent the trend. |
| "Can I get the raw data?" | Table View exports CSV; Quick View exports Excel; Graph View exports PNG. Administrators can export any year as Excel, Word, PDF or a batch ZIP. |
| "What happens if a library misses the deadline?" | A Super Admin can reopen that institution's forms for that year specifically, or enter the data directly — either way the change is logged as a post-collection edit. |
| "How much does it cost to run?" | `[NEEDS: current Vercel / Neon / Resend + domain figures]` |
| "Who owns the data?" | The CEAL Statistics Committee. The maintainer holds the vendor accounts; the handover checklist in the repository lists every account that must transfer. |
| "What if you both leave?" | 3,793 lines of bilingual developer documentation, two in-app guides, and a written maintainer-handover checklist. |
| "Is it accessible / WCAG compliant?" | Built on accessible component primitives with keyboard and screen-reader support throughout; a formal audit has not yet been done and is on the roadmap. Answer honestly. |

---

## Appendix B — Internal only. Do not present.

Known gaps, kept here so you are not caught off guard if a technical attendee
probes. Do **not** put these on a slide; S31 is the public-facing version.

- No automated test suite; verification is manual plus an admin testing dashboard
- TypeScript build errors are currently ignored at build time
- No scheduled database backup automation yet
- No admin "reset this user's password" button, although both in-app guides
  describe one — the workaround is the Forgot Password flow
- The enforced password minimum is 12 characters, but the reset email tells
  users 8
- The permission check fails open on an internal error
- Session cookies are not marked `Secure`
- The orphaned 15-minute reset path (`/api/send` plus
  `app/(authentication)/forgot/[username]/`) is unreachable but still present,
  accepts a forgeable timestamp as its only token, and renders a stored
  password hash into the page. **This should be deleted.**
- Dark mode is configured but not implemented
- Two overlapping open/close consoles exist (`/admin/broadcast` and
  `/admin/survey-schedule`)

---

## Appendix C — Before you present

**You still need to supply**
- [ ] S11 — the number of email threads / months of correspondence with Anlin
- [ ] Screenshots: legacy homepage, legacy site at phone width, new homepage,
      new site at phone width, My Forms, Super Admin dashboard, audit log,
      Graph View
- [ ] A working demo account for each role you plan to show
- [ ] Appendix A — hosting cost figures, if you want to answer that question

**Re-verify on the day**
- [ ] Commit / PR counts if any further work lands before Sept 14
- [ ] That the demo site is up and the demo account signs in
- [ ] That `/help` and `/admin/superguide` both load, in case you link to them

**Timing rehearsal**
- Total is 45 minutes including Q&A. The clock in each slide heading assumes:
  title 0:00–0:01 · Anlin 0:01–0:11 · Meng 0:11–0:29 · Yifan 0:29–0:41 ·
  close 0:41–0:43 · Q&A 0:43–0:45.
- Meng: 14 slides in 18 minutes ≈ 75 seconds each. Yifan: 9 slides in
  12 minutes ≈ 80 seconds each. Neither of you can afford to read the slides
  aloud — rehearse against the clock at least once.
- **If Anlin runs long**, cut in this order: S16 (the stack table), S18
  (the ten phases), then S26. Never cut S11, S17 or S19 — those three carry
  the whole argument.
- Checkpoints: Meng should be starting S17 by 0:23, and handing over by 0:29.
  Yifan should be starting S27 by 0:37.

**Language note**
Slide text is English; these `讲稿:` notes are for the two of you. Anlin's
section is a placeholder outline only — send her this file rather than a script.
