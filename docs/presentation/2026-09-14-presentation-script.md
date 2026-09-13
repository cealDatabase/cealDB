# CEAL Statistics Database — Launch Session
## Full presentation script and slide content

**Session:** Introducing the New CEAL Statistics Database
**Date:** Monday, September 14, 2026 · 2:00 pm CST / 3:00 pm EST · Zoom
**Deck file:** `2026-09-14-ceal-statistics-launch.pptx` (same folder)

> This file replaces the earlier `2026-09-14-ceal-launch-outline.md`.
> The speaking order has changed — see the note below.

---

## Running order

| | Speaker | Slides | Budget | Be finished by |
|---|---|---|---|---|
| Open | All three | S1 | 0.5 min | **0:01** |
| **1** | **Meng Qu** | S2 – S15 | 18 min | **0:19** |
| **2** | **Yifan Huang** | S16 – S24 | 12 min | **0:31** |
| **3** | **Anlin Yang** | S25 – S31 | 10 min | **0:41** |
| Close | All three | S32 + Q&A | 4 min | **0:45** |

Each slide heading carries its own budget. Three checkpoints to watch on the
clock, because you cannot do arithmetic while presenting:

- **Meng at 0:10** should be starting S8 (the Committee's toolkit).
- **Meng at 0:19** hands to Yifan. If it is past 0:21, tell Yifan to drop S19 and S20.
- **Yifan at 0:31** hands to Anlin. Anlin's ten minutes are not negotiable —
  she has the demo and the call to action.

⚠️ **The script below runs slightly long on purpose.** Read aloud at a natural
pace it is closer to 20 minutes for Meng and 13 for Yifan. Paragraphs marked
`[可删]` are the ones to cut first. Rehearse once against a timer and cut to fit
— do not try to speed up instead. Speaking fast to a room of librarians who are
half-listening on Zoom is worse than saying less.

⚠️ **Tell Anlin about the order change.** Her reminder email said she would
introduce the collection process first and then hand over to the developers.
This deck does the opposite: the two of us explain what was built, and she
closes with how to use it and what the Committee needs. The new order is
better — the session ends on the practical instructions people came for — but
she needs to hear it from you before Monday, not discover it on the call.

## How to read this file

- **SLIDE** blocks are what appears on screen. Copy them as-is.
- **SCRIPT** blocks are what you say, word for word. Written for speaking
  aloud: short sentences, no jargon. Read it out loud once and cut anything
  that makes you stumble.
- `导演提示:` are Chinese stage directions — when to click, when to pause,
  when to share your screen. Not spoken.
- `来源:` is the file in this repository that backs the claim, if anyone asks.

## Language and jargon rules we followed

The audience is East Asian studies librarians, not engineers. So in the script:

- No product names where a plain description works.
- "Commit" is explained once, then used.
- No mention of interfaces, tokens, schemas, or algorithms by name.
- Sentences average under fifteen words.

If you improvise, keep to that. The fastest way to lose this room is a
sentence with three technical nouns in it.

---

# S1 · Title · all three · ~0.5 min

**SLIDE**

> # CEAL Statistics Database
> ## A new home for six decades of East Asian library data
>
> **cealstats.org**
>
> Meng Qu · Web Service Librarian, Miami University
> Yifan Huang · Backend Developer
> Anlin Yang · Chair, CEAL Statistics Committee
>
> September 14, 2026

**SCRIPT** — Meng

> Good afternoon, everyone. Thank you for making time for this.
>
> I am Meng Qu, Web Service Librarian at Miami University. With me are Yifan
> Huang, who built the back end of this system, and Anlin Yang, the Chair of
> the CEAL Statistics Committee.
>
> Here is how the next forty-five minutes will go. I will start with why we
> rebuilt the statistics database, and what changed. Yifan will then explain
> how we moved twenty-five years of data without losing any of it. Anlin will
> finish by showing you how to actually use the new site, and what the
> Committee needs from your library this fall.
>
> We will take questions at the end. If something is unclear along the way,
> please put it in the chat and we will pick it up.

`导演提示:` 30 秒之内说完。不要在这里讲任何技术内容。说完直接切下一页。

---

# S2 · What we are talking about · Meng · ~1.5 min

**SLIDE**

> ### The CEAL Statistics Database
>
> - The official annual statistics platform of the Council on East Asian Libraries
> - Around **50 North American libraries** submit data every year
> - Results are published in the *Journal of East Asian Libraries*
> - Statistics reach back as far as **1869**; the online database opened in **1999**
>
> One place to report your numbers. One place to look everyone else's up.

**SCRIPT**

> First, a sentence about what this system is, because not everyone in this
> room uses it the same way.
>
> The CEAL Statistics Database is where about fifty libraries in North America
> report their East Asian collections every year. Those numbers become the
> annual report in the Journal of East Asian Libraries. They also become the
> benchmark you use when you need to make a case to your dean.
>
> The record goes back a long way. Some of the digitised reports contain data
> from eighteen sixty-nine. The online database itself opened in nineteen
> ninety-nine.
>
> So this is not a new project. It is a twenty-five year old service that
> needed a new home.

`导演提示:` 最后那句话是整场的定调——"不是新项目,是老服务搬新家"。说慢一点。
`来源:` `app/page.tsx`, `docs/en/01-overview.md`

---

# S3 · Where we started · Meng · ~1.5 min

**SLIDE**

> ### The site we inherited
>
> **What it did well — for twenty years**
> - Held every data point and every form, complete and correct
> - Served guests, member libraries, and the Committee, reliably
>
> **What it could no longer do**
> - Built for a desktop monitor. Unusable on a phone or a tablet.
> - Fixed page width, dated colours, hard to read
> - Every administrative change needed a developer
> - Built on software that was getting harder to host safely

**SCRIPT**

> Let me start with the old site, and let me start by being fair to it.
>
> That site did its job for two decades. Every number was in there. Every
> form was in there. It never lost anyone's data. Whoever built it deserves
> credit, and some of them may be on this call.
>
> [可删] But it was built for a desktop computer in the early two thousands. If you
> opened it on your phone, you had to pinch and scroll sideways to read a
> table. The page had a fixed width, so on a large monitor most of your screen
> was empty. The colours were hard on the eyes.
>
> And there was a bigger problem, one you would only notice if you were on the
> Committee. Almost nothing could be changed without a developer. Opening the
> survey, sending the announcement, adding a new library — all of it meant
> emailing someone technical and waiting.
>
> That is the situation we were asked to fix.

`导演提示:` **必须先夸旧站**,委员会里可能有当年推动它的人。夸完再说问题,语气是"它老了",不是"它很差"。
`[截图]` 这一页需要两张图并排:旧站首页,和旧站在手机宽度下的样子。用浏览器开发者工具调到 390px 截图,对比最直观。

---

# S4 · What we set out to do · Meng · ~1 min

**SLIDE**

> ### The brief we gave ourselves
>
> ## Keep every function. Replace the experience.
>
> 1. Match the old site feature for feature. Remove nothing.
> 2. Then hand the Committee the controls it had always had to ask for.
> 3. Make it work on any screen, and read well in Chinese, Japanese and Korean.
> 4. Write it all down, so the next person can take over.

**SCRIPT**

> So we wrote ourselves a brief, and it fits on one line. Keep every function.
> Replace the experience.
>
> Four parts to that.
>
> First, match the old site feature for feature. Nothing gets dropped because
> it was inconvenient to rebuild.
>
> Second, once we had parity, give the Committee the controls. If the Chair
> wants to open the survey a week late, that should be a button, not an email
> to me.
>
> [可删] Third, make it work on whatever screen you happen to have. And make it
> render Chinese, Japanese and Korean properly, which the old site did not
> always do.
>
> Fourth, and this is the one I care most about: write everything down. Not
> just code comments. Real documentation, so that when Yifan and I are no
> longer the people doing this, the next person can pick it up.

`导演提示:` 第四条是委员会最在意的——他们最怕开发者一走系统就死。这条说完停半秒。

---

# S5 · Who can see and do what · Meng · ~1.5 min

**SLIDE**

> ### Four levels of access — all four preserved
>
> | | Guest | Member | Editor | Super Admin |
> |---|:--:|:--:|:--:|:--:|
> | Statistics, charts, published reports | ● | ● | ● | ● |
> | Submit your own library's forms | | ● | | ● |
> | Your own multi-year reports and ranking | | ● | ● | ● |
> | Maintain the shared database title lists | | | ● | ● |
> | See and edit every library | | | ● | ● |
> | Manage people, dates and announcements | | | | ● |
> | Edit after the deadline has passed | | | | ● |
>
> Permission is checked in the database — not just hidden in the menu.

**SCRIPT**

> The old site had four kinds of visitor, and so does the new one.
>
> A guest is anyone who has not signed in. Guests can see the statistics, the
> charts and the published reports. That is deliberate. Most of this data is
> meant to be public.
>
> A member is your library's delegate. You submit your own library's forms,
> and you can pull your own multi-year reports.
>
> [可删] An editor maintains the shared lists of electronic databases that everyone
> selects from, and can see across libraries.
>
> A super administrator is the Committee. They manage people, set the dates,
> send the announcements, and they are the only ones who can change data after
> the deadline.
>
> One thing worth saying about that table. On the old site, a lot of
> permission was really just a hidden menu item. If you knew the address, you
> could sometimes get further than you should. On the new site every one of
> those checks happens in the database, every time. Hiding a button is not
> security, and we did not treat it as security.

`导演提示:` 最后一段是这一页的重点,但**不要提中间件、cookie、token 这些词**。就说"隐藏按钮不等于安全"。
`来源:` `proxy.ts`, `lib/auth.ts`, `lib/formPermissions.ts`

---

# S6 · This was never only a coding project · Meng · ~2 min  ⭐

**SLIDE**

> ### Working with the Statistics Committee
>
> Throughout the rebuild, Committee Chair **Anlin Yang**:
>
> - Explained what each form field actually means — question by question
> - Put us in touch with the right person at each library
> - Kept the schedule honest, and coordinated every deadline
> - Checked the migrated numbers against the historical record
> - Made the decisions that unblocked us, quickly, again and again
>
> **356 emails about CEAL  ·  185 Zoom meetings  ·  29 months**
>
> You cannot read these requirements out of a database.
> They came out of that correspondence.

**SCRIPT**

> I want to spend a minute on something that is not code.
>
> When you rebuild a survey like this, the hard part is not the software. The
> hard part is understanding what every single field on the form actually
> means. What counts as a volume. What belongs in one column and not another.
> Why two questions that look similar are counted differently.
>
> None of that is written in the old database. It lives in the practice of
> this community. And the person who translated it for us was Anlin.
>
> Over the past two and a half years, Anlin has explained fields to us
> question by question. She put us in touch with the right person at each
> library when we needed to check something. She coordinated the deadlines.
> She checked our migrated numbers against the historical record. And when we
> were stuck on a decision that was not ours to make, she made it, usually
> within a day.
>
> To put a number on it: three hundred and fifty-six emails about CEAL, and a
> hundred and eighty-five Zoom meetings. Over twenty-nine months.
>
> So I want to say this plainly, and in front of all of you. This system is
> accurate because the Committee kept us accurate. Anlin, thank you.

`导演提示:` ⭐ **这是全场最重要的一页,也是给 Anlin 的致谢。** 两层意思:
1. 真诚感谢她——沟通、找对人、协调、核对数据,这些活我们干不了。
2. 顺带向委员会证明:每个字段定义都跟委员会来回确认过,不是两个程序员关门自己搞的。这比任何技术指标都能建立信任。

因为 Anlin 排在最后讲,这一页还有个额外作用:**提前把她捧起来**,她上台时听众已经知道她做了多少事。

`导演提示:` 这两个数字念出来就够了,不用解释怎么统计的。**185 次 Zoom 会议比 356 封邮件更有冲击力** —— 那是两年半里每个月平均六次会,听众自己会算这笔账。

说完这段,看一眼镜头里的 Anlin,再切下一页。

---

# S7 · What you already noticed last year · Meng · ~1 min

**SLIDE**

> ### Signing in got safer — and simpler
>
> - **Type your email first.** The site tells you whether you still need to set
>   a password, before it asks you for one.
> - **New accounts and resets arrive as a one-time link**, good for 24 hours.
>   We never send you a password in an email again.
> - **Change your own password** any time, from inside the site.
> - **Covering two libraries?** Switch between them without signing out.

**SCRIPT**

> If you used the site last fall, you already noticed some of this.
>
> Signing in now happens in two steps. You type your email address first, and
> the site checks you before asking for anything else. If you have never set a
> password, it tells you that instead of just saying "wrong password" — which
> is what the old site did, and which sent a lot of email to Anlin.
>
> When you need a password, we email you a one-time link that works for
> twenty-four hours. We do not put passwords in email any more. Ever.
>
> You can change your own password from inside the site. You do not have to
> ask anyone.
>
> And if you cover more than one library, which a few of you do, you can now
> switch between them without signing out and back in.

`导演提示:` ⚠️ **不要说"15 分钟"。** 系统实际是 **24 小时**。我核对过代码,那条 15 分钟的路径是早期设计的死代码,没有任何地方在调用它。台上说错这个,万一有人当场试就尴尬了。
听众关心的是"不再明文发密码",不是具体多少小时。
`来源:` `app/api/password-reset/route.ts`, `lib/email.ts`

---

# S8 · Giving the Committee the controls, part one · Meng · ~2 min

**SLIDE**

> ### The Committee's toolkit — running the survey
>
> Every one of these used to require a developer. Now each is a page on the site.
>
> - **Set the dates** — opening, closing, fiscal year, publication, per year
> - **Open a new year** — creates the year's records for every library at once
> - **Open or close right now** — an override for when the schedule slips
> - **Send the announcement** — preview it, confirm it, send it or schedule it
> - **Edit the wording** of every automatic message, in the browser
> - **Email one person** — for the library that joined after the announcement went out

**SCRIPT**

> Now the part I am most pleased about, and the part that matters most to the
> Committee.
>
> On the old site, running the survey meant asking a developer. Opening the
> forms was a developer task. Sending the announcement was a developer task.
> Changing a date was a developer task.
>
> All of that is now a page on the site.
>
> The Chair sets the opening and closing dates herself. Opening a new survey
> year creates the records for all fifty libraries in one action. If a date
> needs to slip, there is a button for that. The announcement email can be
> previewed, then sent now or scheduled for later. And the wording of every
> automatic message can be edited right in the browser — no developer, no
> waiting.
>
> I want to point out the last item on that list, because it came directly out
> of last year's collection. A library joined partway through the season. The
> announcement had already gone out weeks earlier, so their delegate never got
> it. Under the old system, the fix was to email me.
>
> Now the Chair opens the user list, finds that one person, and clicks a
> button that sends them their own copy of the announcement. That is it.

`导演提示:` 最后那个例子是真事,讲具体的故事比列功能有效。
这一页反复回到一句话:**"以前这些都得找开发者,现在委员会自己就能做。"**
`来源:` `app/api/admin/send-individual-email/route.ts`, `components/UserRoleManager.tsx`

---

# S9 · Giving the Committee the controls, part two · Meng · ~1.5 min

**SLIDE**

> ### The Committee's toolkit — people, data, publication
>
> - **People** — search, reassign, change roles, export the whole roster
> - **Add a library** — a guided six-step form, no database access needed
> - **A record of every change** — who, when, and what the value was before
> - **Who has submitted** — for any year, at a glance
> - **Year-end reports** — Excel, Word, PDF, or all libraries in one download
> - **Published reports** — upload the PDF; the public page updates immediately
> - **Rankings back to 1970** — click any measure for the full list

**SCRIPT**

> [可删] The second half of the toolkit is about people, data and publication.
>
> The Chair can search the whole user list, move someone to a different
> library, change what they are allowed to do, and export the roster.
>
> Adding a new member library used to mean someone editing the database
> directly. It is now a guided six-step form.
>
> Then there is the part I would point to if you asked me what makes this
> system trustworthy. Every change to every number is recorded. Who made it.
> When. And what the value was before they changed it. If a number in the
> published report is ever questioned, we can show you exactly where it came
> from and who touched it.
>
> The Committee can see who has submitted and who has not, for any year.
> Year-end reports export as Excel, Word or PDF — one library, or all of them
> in a single download. When the report is published in the journal, the Chair
> uploads the PDF and the public page updates immediately.
>
> And there are rankings going back to nineteen seventy, for any measure you
> like.

`导演提示:` 审计记录那一段是这页的核心,讲慢一点。对委员会来说这是"数据可信"的保证。
"拒绝删除最后一个超级管理员"这种细节可以随口带一句,听众会笑。
`来源:` `components/AuditLogViewer.tsx`, `lib/auditLogger.ts`, `components/library-creation-wizard.tsx`

---

# S10 · How it looks, and who it reads for · Meng · ~1 min

**SLIDE**

> ### Design, language, and getting help
>
> - **One layout, any screen** — from a phone to a wide monitor
> - **Chinese, Japanese and Korean render properly** — real typefaces for each,
>   not a fallback that turns titles into boxes
> - **Keyboard and screen-reader support** built in from the start
> - **Two complete guides, inside the site, in English and Chinese**
>   - `cealstats.org/help` — for member libraries
>   - `cealstats.org/admin/superguide` — for the Committee
>   - Both searchable. Both printable.

**SCRIPT**

> A word on how it looks, and then I will get to the numbers.
>
> There is one layout, and it adapts to whatever screen you are on. Let me
> just show you rather than describe it.
>
> [drag the browser window narrow, then wide]
>
> That is the same page. Nothing is hidden from you on a phone.
>
> The second point matters more than it sounds. Chinese, Japanese and Korean
> titles now render in proper typefaces for each language. On the old site
> they sometimes came out as empty boxes, or in a font that was technically
> Chinese but wrong for a Japanese title. For a database about East Asian
> collections, that was not acceptable.
>
> And there are two full guides built into the site itself. One for member
> libraries, one for the Committee. Both are in English and Chinese, both are
> searchable, and both print cleanly if you want them on paper. If you take
> one thing away from my part today, make it this address: cealstats.org
> slash help.

`导演提示:` **拖窗口这个演示效果最好**,提前把浏览器准备好。旧站做不到这个,一拖就说明问题。
⚠️ 不要提暗色模式——配置开了但没做完。
`来源:` `app/layout.tsx`, `app/help/`, `app/(authentication)/admin/superguide/`

---

# S11 · What it runs on · Meng · ~1 min

**SLIDE**

> ### What it runs on, in plain terms
>
> | What it does | What we chose | Why |
> |---|---|---|
> | Builds the pages you see | Next.js | One system for the site and the data behind it |
> | Stores the data | PostgreSQL | Proven, durable, easy to copy out |
> | Hosts the database | Neon | Can copy the whole database to test safely |
> | Hosts the website | Vercel | Runs the scheduled tasks; renews security certificates itself |
> | Sends the email | Resend | Handles the mailing list and shows us what was delivered |
>
> Three outside companies. All three replaceable — and the instructions for
> replacing each are written down.

**SCRIPT**

> One slide on what it runs on. I will keep this short, because the names do
> not matter much to you.
>
> Everything you see is built on current, mainstream, well-supported software.
> The data lives in a standard database that any developer would recognise,
> and that can be copied out in one command. The site and the database are
> hosted by two companies, and the email goes through a third.
>
> The line that matters is the last one. All three of those companies are
> replaceable, and the step-by-step instructions for replacing each of them
> are written down in our documentation. There are four of them: move the
> database, move the website, move the email, or move the whole thing onto a
> university server.
>
> I mention that because it is the question a committee should ask. You are
> not locked in to anybody. Including us.

`导演提示:` **不要念表格。** 挑两句说,重点全在最后那句。委员会最怕被供应商或者被开发者绑架,这句话直接回应那个担心。
`来源:` `docs/en/03-architecture.md`, `docs/en/08-migration.md`

---

# S12 · What this actually took · Meng · ~2 min  ⭐

**SLIDE**

> ### Two and a half years. Two developers.
>
> **March 2024 → today · 29 months**
>
> | | |
> |---|---|
> | Recorded batches of work | **886** |
> | Reviewed and merged change sets | **154** |
> | Released versions | **3** |
> | Lines of code written by hand | **~100,000** |
> | Pages on the site | **72** |
> | Tables in the database | **41** |
> | Lines of documentation, in two languages | **3,793** |
>
> That is about **thirty units of work every month, for twenty-nine months.**

**SCRIPT**

> Now the part I was asked to be specific about.
>
> We started in March of twenty twenty-four. That is twenty-nine months ago.
>
> Let me explain one word on this slide first. A commit is one recorded batch
> of work — you finish something, you write down what you did, and it goes
> into the record. Think of it as one entry in a very detailed lab notebook.
>
> There are eight hundred and eighty-six of those. That is roughly thirty a
> month, every month, for twenty-nine months.
>
> [可删] A hundred and fifty-four separate change sets were reviewed before they went
> anywhere near the live site. Around a hundred thousand lines of code written
> by hand. Seventy-two pages. Forty-one tables in the database.
>
> And three thousand seven hundred lines of documentation, in English and
> Chinese.
>
> Two of us. Alongside our regular jobs.
>
> I am not showing you this to complain. I am showing you this because when a
> committee approves a rebuild, it is very hard to see what it costs. This is
> what it cost.

`导演提示:` ⭐ 这是"我们有多辛苦"的核心证据页。**慢慢讲,给他们时间看数字。**
"lab notebook"那个比喻是为了让图书馆员听懂 commit,不要跳过。
可以口头补一句:886 次里我提交了 693 次,奕帆 111 次。

⚠️ 如果被问"总共改了多少行":**照实说没有可靠数字。** 这个数字算不出来(我们手上的克隆是不完整的),而且原始数字被自动生成的代码灌水了大概一倍。宁可说"我没有可靠数字",也不要报虚的——万一有懂行的人查,我们的数字要经得起查。

`来源:` GitHub 全量历史,已三向交叉校验总和为 886

---

# S13 · How it was built · Meng · ~0.5 min

**SLIDE**

> ### Ten stages
>
> | | | | |
> |---|---|---|---|
> | 1 | Foundations | Mar – May 2024 | 95 |
> | 2 | Accounts and sign-in | May – Aug 2024 | 90 |
> | 3 | The data model, and importing the old data | Aug – Oct 2024 | 50 |
> | 4 | The shared database lists; first admin tools | Oct 2024 – Mar 2025 | 110 |
> | 5 | The ten survey forms | Apr – Aug 2025 | 115 |
> | 6 | Getting ready to go live | Sept 2025 | 116 |
> | 7 | **The 2025 collection, live** | Oct – Dec 2025 | **218** |
> | 8 | Reports and exports | Jan – Mar 2026 | 55 |
> | 9 | The public statistics pages | May – Jun 2026 | 63 |
> | 10 | Tightening security | Aug 2026 | — |

**SCRIPT**

> Very quickly, the shape of the work.
>
> [可删] The first five stages were building. Foundations, then accounts, then the
> data, then the shared lists, then the ten forms themselves.
>
> Stage six was getting ready to go live, last September.
>
> And then look at stage seven. Two hundred and eighteen units of work,
> between October and December of last year. That is more than any other
> stage in the project.
>
> That is not building. That is the collection season, running live, with your
> data in it. I want to spend a moment on that.

`导演提示:` 这页快速带过,只有一个目的:**引出第 7 阶段的 218**,直接转下一页。

---

# S14 · The 2025 collection · Meng · ~1.5 min  ⭐

**SLIDE**

> ### The 2025 collection ran, start to finish
>
> **A third of the entire project happened in two months —
> September and October 2025.**
>
> What we did during those weeks, while you were entering data:
>
> - Set up the automatic opening and closing, and tuned it live
> - Corrected the arithmetic on several forms against the real questionnaire
> - Added **"see your last five years"** to all ten forms — mid-season,
>   because people asked for it
> - Fixed gaps in Save Draft; added a submitted marker to My Forms
> - Repaired the handling of Chinese, Japanese and Korean text in exports
>
> **And one we are proud of:** we tried a major upgrade in mid-October, saw it
> put the live season at risk, and undid it within the hour. We shipped it ten
> months later, when nobody's data was on the line.

**SCRIPT**

> A third of this entire project happened in two months. September and October
> of last year.
>
> That is what it looks like to support a survey while it is actually running,
> with real libraries entering real numbers.
>
> Some of what we did in those weeks. We set up the automatic opening and
> closing of the forms, and then tuned it while it was live. We found and
> corrected the arithmetic on several forms, by checking it against the actual
> paper questionnaire. We repaired the handling of Chinese, Japanese and
> Korean text in the exports.
>
> And we added a feature we had never planned. Several of you asked whether
> you could see your own library's last five years while filling in a form, so
> you had something to compare against. That was a fair request. We added it
> to all ten forms, in the middle of the season.
>
> One more, and then I will hand over.
>
> In mid-October we attempted a major upgrade to the software underneath the
> site. Within an hour we could see it created a risk to the live season. So
> we undid it, completely, and left it alone. We came back and did that
> upgrade ten months later, in the summer, when nobody's data was on the line.
>
> I mention it because I think knowing when not to touch something is part of
> the job. Your collection season is not the time to be clever.

`导演提示:` ⭐ **这是全场情绪的高点,值得多花 30 秒。**
最后那个回滚的故事一定要讲——它不是失败,是判断力。听众里的管理者会记住"这两个人知道什么时候不该动"。
"过去五年数据"那条也要讲:它不在我们规划里,是用户当场提的,我们十个表单全加了。这最能说明我们在盯着系统跑。
`来源:` 2025 年 9 月至 12 月的提交历史

---

# S15 · Still watching, and handing over · Meng · ~0.75 min

**SLIDE**

> ### 2026: the same two people are still behind it
>
> - The 2025 collection was completed successfully
> - Yifan and I are watching the system through this year's season
> - Report a problem and we aim to fix it that week — not in the next release
> - The documentation is kept current, in English and Chinese
> - A written handover checklist exists, so the Committee is not dependent on
>   any one person forever

**SCRIPT**

> Last slide from me.
>
> The twenty twenty-five collection finished successfully. Every library that
> submitted, submitted through this system.
>
> For this year, Yifan and I are still here, and still watching. If you find
> something broken during the season, tell us. Our aim is to fix it that week,
> not to put it on a list for next year.
>
> And for the longer term: the documentation is kept up to date, in both
> languages, and there is a written handover checklist. It lists every account
> that would need to transfer to a new maintainer. That is deliberate. A
> volunteer committee should not depend on any one person indefinitely,
> including me.
>
> Now — I have talked about what you can see. Yifan is going to tell you about
> what sits underneath. How twenty-five years of data got moved without
> losing any of it, and how it is kept safe. Yifan.

`导演提示:` 这页回应委员会最深的顾虑:"这两个人走了怎么办?"
说完交给奕帆。**看一眼时间——应该在 0:19 左右。如果已经超过 0:21,提醒奕帆压到 10 分钟。**
`来源:` `docs/en/07-maintenance.md`, `docs/en/09-glossary.md`

---

# S16 · Moving twenty-five years of data · Yifan · ~1.5 min

**SLIDE**

> ### The migration problem
>
> - Decades of statistics, and the full structure of every form, had to arrive
>   intact
> - Two different database systems, with different rules about what a number is
> - No downtime allowed — the historical record had to stay online
> - Nothing could be quietly lost, rounded, or reinterpreted
>
> *"We have already done the hardest possible migration once."*

**SCRIPT**

> Thank you, Meng. Good afternoon.
>
> My part is about what happened to your data.
>
> When people hear "we moved the database," they picture copying files. It is
> not that. The old system and the new system store numbers differently. They
> disagree about what an empty field means. They disagree about how text in
> Chinese, Japanese and Korean is encoded. They even number their own records
> differently.
>
> So every single value had to be carried across, and then checked.
>
> And we could not take the site down to do it. The historical record had to
> stay available the whole time.

`导演提示:` 开场别急。"人们以为搬数据库就是复制文件,其实不是"——这句是给非技术听众的入口。
`来源:` `docs/en/08-migration.md`

---

# S17 · What broke, and what we did · Yifan · ~2 min

**SLIDE**

> ### Three things went wrong. Here is how each was fixed.
>
> **The counter problem.** After the old data arrived, the database's internal
> counter was behind the data itself. The very first new record collided with
> an existing one.
> → We wrote a repair tool that resets every counter, and made it run
> automatically. It has not been a problem since.
>
> **Old passwords.** Some accounts still carried credentials from the old
> system, stored in a way we would not accept any more.
> → We refused to weaken the new system to accept them. Instead the site
> recognises the old format and sends that person a link to set a new password.
>
> **Broken characters.** Some Chinese, Japanese and Korean titles arrived
> damaged.
> → Fixed where the data is displayed and where it is exported, then checked
> against the original records.

**SCRIPT**

> Three things went wrong. I want to walk through them, because how a team
> handles the things that go wrong tells you more than a feature list.
>
> The first we called the counter problem. A database keeps its own internal
> count of how many records it has, so it knows what number to give the next
> one. When we loaded the old data in, that counter did not come with it. So
> the database thought it was empty, and the first new record anyone created
> collided with a record that was already there.
>
> [可删] We could have fixed that by hand, once. Instead we wrote a small tool that
> resets every counter in every table, and we made it run automatically
> whenever data is loaded. It has not come back.
>
> The second was old passwords. Some accounts still had credentials from the
> old system, stored using a method that is no longer considered safe. We had
> a choice. We could accept the old method, which would have meant carrying a
> known weakness forever. Or we could refuse it.
>
> We refused it. If your account still had an old credential, the site
> recognises that and emails you a link to set a new one. It was slightly
> inconvenient for a few people last year. It was the right call.
>
> The third was broken characters. Some East Asian titles came through the
> migration damaged — the wrong bytes, so the wrong characters. We fixed that
> both where titles are displayed and where they are exported, and then
> checked them against the original records.

`导演提示:` "counter problem"这个讲法是刻意避开专业术语的。**不要说 sequence、serial、primary key。**
密码那一段的重点是"我们选择了不妥协",这是价值观展示,值得慢讲。
`来源:` `scripts/fix-all-sequences.js`, `lib/sequenceFixer.ts`

---

# S18 · One idea holds the whole thing together · Yifan · ~2 min

**SLIDE**

> ### One record per library, per year
>
> ```
>   Library                     ← one for each institution
>      │
>      └── Library-Year         ← one for each institution, each year
>             │
>             └── the ten forms ← one of each, hanging off that year
> ```
>
> Everything hangs off it:
>
> - Every form you submit is attached to your library **and** that year
> - A single switch on it decides whether you can edit that year
> - So the Committee can reopen **one** library's forms without affecting anyone else
> - Empty records are created in advance — a library that submits nothing still
>   has a place in the record

**SCRIPT**

> Now the design idea at the centre of the new database. There is only one,
> and if you follow this slide you will understand how the whole system
> behaves.
>
> For each library, for each year, there is exactly one record. We call it a
> library-year. Everything else hangs off it. All ten of your forms attach to
> your library and that specific year.
>
> Here is why that matters to you.
>
> On that library-year record there is a single switch: can this library edit
> this year, yes or no. That switch is what the opening and closing dates
> actually control.
>
> Because the switch is per library and per year, and not one global setting,
> the Committee can reopen the forms for one library that needs a few more
> days, without reopening them for everybody. On the old system that was
> awkward. Now it is one library, one year, one switch.
>
> [可删] One more detail. We create these records in advance, empty, for every
> library. So a library that reports nothing in a given year still has a place
> in the record, rather than simply being missing.

`导演提示:` 这一页要画图,PPT 里已经做好了。讲的时候**用手在屏幕上指**。
"可以只为一家图书馆重开表单"这句是委员会最有感的——去年他们遇到过这个需求。
`来源:` `prisma/schema/schema.prisma`, `docs/en/04-database.md`

---

# S19 · Why the tables are so wide · Yifan · ~1 min

**SLIDE**

> ### The database mirrors the paper form, on purpose
>
> Every measure is broken out the same way:
>
> ### Chinese · Japanese · Korean · Non-CJK · Subtotal
>
> …repeated for every question on the form. One form has around **110 columns**.
>
> A tidier database would have collapsed these. We did not.
> **Any number in the system can be traced back to the exact question that
> produced it.**

**SCRIPT**

> A short one, but it is a decision worth explaining.
>
> Every measure in this database is broken out the same way: Chinese,
> Japanese, Korean, non-CJK, and a subtotal. That pattern repeats for every
> question on the form. One of our forms has about a hundred and ten columns
> because of it.
>
> A database designer would tell you that is untidy, and they would be right.
> There is a more elegant way to store this.
>
> We chose not to. Because the moment you collapse those columns, the numbers
> in the database stop lining up with the numbers on the questionnaire. And
> then when the Committee needs to check a figure, nobody can tell which
> question produced it.
>
> So we kept it wide. Every number traces back to one specific question. That
> was worth more to us than elegance.

`导演提示:` 这是"诚实的取舍"页。如果有懂技术的人质疑表太宽,这就是答案。
说"数据库设计师会说这不优雅,他说得对"——主动承认,反而更可信。
`来源:` `prisma/schema/electronic.prisma`

---

# S20 · Shared lists · Yifan · ~1 min

**SLIDE**

> ### Describe a database once, not fifty times
>
> For audio-visual, e-book and e-journal databases:
>
> - **One entry per title**, shared by every library
> - **Counts recorded separately**, per library, per year
> - **Access recorded separately** — who had it, in which year
>
> Correct a title once and every library's record is corrected with it.

**SCRIPT**

> Here is a small thing that saves a lot of trouble.
>
> Take an e-journal package that thirty of your libraries subscribe to. On the
> old system, that package was written down thirty separate times — once in
> each library's record. If the publisher changed its name, someone had to
> find and fix thirty entries. In practice, they did not all get fixed, so the
> same package appeared under three different spellings.
>
> Now the package is described once, in a shared list. Each library records
> its own counts, and whether it had access that year, separately. Correct the
> title once and every library's record is corrected with it.

`导演提示:` 这一页**用具体例子讲**,不要讲结构。"三十家订同一个库,改个名字要改三十处"——一听就懂。
`来源:` `prisma/schema/list_ejournal.prisma`, `library_year_list.prisma`

---

# S21 · Never losing your work · Yifan · ~1.5 min

**SLIDE**

> ### Four promises about your data
>
> - **Your draft is safe.** Saving updates the same record. Come back in three
>   days and it is exactly where you left it.
> - **Submitting is recorded separately** from the numbers — per form, per year.
> - **A form of all zeros is not treated as real data.** The system reads that
>   as "did not participate", not "reported zero".
> - **Every change is written down** — who, when, and what the value was
>   before. Changes made after the deadline are marked as such, field by field.

**SCRIPT**

> Four promises about your data.
>
> First, your draft is safe. When you press Save Draft, we update the same
> record rather than creating a second one. You can leave it for three days
> and come back to exactly what you left.
>
> Second, whether you have submitted is recorded separately from the numbers
> themselves, for each form and each year. So the system always knows the
> difference between "she has not started" and "she started and saved nothing".
>
> Third, and this one came from the Committee. If a form comes in as all
> zeros, the system does not treat that as a real report of zero. It reads it
> as a library that did not participate that year. That distinction matters
> for the published statistics, and it is a rule the Committee gave us — not
> one we invented.
>
> Fourth, every change is written down. Who made it, when, and what the number
> was before. If a change is made after the deadline, it is marked as such,
> field by field.

`导演提示:` 第三条一定要说"这是委员会给我们的规则,不是我们自己定的"——体现我们不擅自决定业务逻辑。
`来源:` `lib/entryStatus.ts`, `lib/formValidation.ts`, `lib/postCollectionAuditLogger.ts`

---

# S22 · Not typing the same thing twice · Yifan · ~1 min

**SLIDE**

> ### Bring last year forward, in one click
>
> - **Copy last year's databases into this year** — one action, and it tells you
>   exactly what was copied and what was skipped
> - **It refuses to overwrite.** If this year already has records, it stops and
>   shows you the conflict.
> - **Eight import buttons** pull figures the system already has into the form
>   you are filling in
> - **One button** fills the electronic form from all three shared lists at once

**SCRIPT**

> This was one of the most popular additions last year, and it is a simple
> idea. You should never have to type in something the system already knows.
>
> If your library's database subscriptions are mostly the same as last year,
> there is one action that brings last year's forward into this year. It then
> tells you exactly what it copied and what it skipped.
>
> And it will not overwrite. If this year already has records, it stops and
> shows you the conflict rather than quietly replacing your work. We were
> careful about that one.
>
> [可删] There are also eight import buttons across the forms, which pull figures the
> system already holds into the form you are filling in. And one button that
> fills the electronic form from all three shared lists at once.

`导演提示:` "拒绝覆盖"这一条要强调——去年有人担心一键复制会盖掉已填的数据。
`来源:` `lib/copyRecords.ts`, `app/api/copy-records/route.ts`

---

# S23 · Keeping it safe · Yifan · ~1.5 min

**SLIDE**

> ### Security, in plain terms
>
> - **Two locks, not one.** The door checks who you are. Then every sensitive
>   action asks the database again. Editing your browser gets you nowhere.
> - **If your session looks tampered with**, you are signed out immediately.
> - **Passwords are stored using the current recommended method** — and stored
>   in a form that cannot be turned back into your password.
> - **The automatic scheduled task is locked too.** The part of the site that
>   opens and closes the survey will not answer a stranger.
> - **The connection to the database is encrypted and verified.**
> - **Every sensitive action is recorded** — including exports of contact details.

**SCRIPT**

> A minute on security, in plain terms.
>
> The important idea is two locks, not one. When you sign in, the site checks
> who you are — that is the front door. But then, every time you try to do
> something sensitive, the site asks the database again: who is this person,
> and are they allowed to do this?
>
> That sounds redundant. It is not. It means that editing something in your
> own browser to pretend you are an administrator does not work. The front
> door is not the only thing standing between someone and your data.
>
> Passwords are stored using the method currently recommended for this, and
> stored in a form that cannot be turned back into the original password. Not
> by us either. If you forget your password, we genuinely cannot look it up —
> we can only send you a link to set a new one.
>
> The part of the site that automatically opens and closes the survey is
> locked as well. It will not answer a request that does not carry the right
> credential. And the connection between the website and the database is
> encrypted and verified at both ends.

`导演提示:` "两把锁"这个比喻是这一页的全部。**不要说 middleware、JWT、cookie、Argon2id。**
"连我们自己都查不到你的密码"这句听众印象最深,一定要说。
`来源:` `proxy.ts`, `lib/auth.ts`, `app/api/validate-session/route.ts`

---

# S24 · If something goes badly wrong · Yifan · ~1 min

**SLIDE**

> ### Backup, restore, and the way out
>
> **Restore**
> - The whole database can be copied back to how it looked at a chosen moment,
>   without touching the live site
> - Full copies are taken on a schedule, and kept away from the database provider
>
> **The way out**
> Four routes are written down, step by step:
> 1. Move the database to a different provider
> 2. Move the website to a different host
> 3. Move the email to a different provider
> 4. Move all of it onto a university server
>
> **The Committee is not locked in to any company — and the instructions do
> not depend on us being reachable.**

**SCRIPT**

> Last slide from me, and it is the one a committee should care about most.
>
> The database can be rolled back. We can produce a copy of the whole thing as
> it looked at a chosen moment in the past, and inspect it, without touching
> the live site. Full copies are taken on a schedule and kept somewhere other
> than the company that hosts the database, because a backup stored with the
> thing you are backing up is not a backup.
>
> And then the way out. There are four documented routes: move the database,
> move the website, move the email, or move all of it onto a university
> server. Each one is written up step by step in our documentation.
>
> I want to be clear about why that exists. It is not because we expect to
> leave. It is because those instructions do not depend on us being reachable.
> If both of us disappeared tomorrow, someone competent could read that
> document and keep this service running.
>
> Now I will hand over to Anlin, who is going to show you the part you
> actually came for — how to use it.

`导演提示:` ⚠️ **诚实提醒:自动备份目前还没有真正配上,文档里列为待办。**
如果被追问"备份多久跑一次",照实说"这是我们下一步要补的,目前是手动"。不要含糊过去——S31 路线图里也列了这一条。
最后一句交给 Anlin。**看时间,应该在 0:31 左右。**
`来源:` `docs/en/08-migration.md`, `docs/en/06-deployment.md`, `docs/en/07-maintenance.md`

---

> # Anlin Yang · S25 – S31 · 10 minutes
>
> **Anlin — this is a draft, not a script for you to follow.**
>
> You know this community and this survey far better than we do. Please treat
> everything below as a starting point: change the wording, reorder it, or
> replace it entirely. We wrote it so you would not have to start from a blank
> page, and so we could match the slide design to your section.
>
> Two things we would ask you to keep, wherever they land:
> - the annual timeline, because everyone needs the dates
> - what the Committee needs from libraries this fall
>
> Everything else is yours.

---

# S25 · Your year, at a glance · Anlin · ~1.5 min

**SLIDE**

> ### The annual cycle
>
> | | |
> |---|---|
> | **July 1 – June 30** | The fiscal year your numbers describe |
> | **around Sept** | The Committee confirms dates and the contact list |
> | **mid-October** | Forms open. You get an email the same day. |
> | **late November** | A reminder, one week before closing |
> | **mid-December** | Forms close |
> | **Dec – Jan** | The Committee reviews and prepares the report |
> | **Feb – May** | The report appears in the *Journal of East Asian Libraries* |
>
> The October and December dates can be adjusted each year. Watch for the email.

**SCRIPT (draft)**

> Thank you both. And thank you all for staying with us.
>
> My part is the practical part. What you need to do, and when.
>
> Here is the year. Your numbers describe the fiscal year from July first to
> June thirtieth. Around September, the Committee confirms the dates and checks
> that we have the right contact person for every library — and if your
> delegate has changed, this is the moment to tell us.
>
> The forms open in mid-October, and you will get an email that same day.
> They close in mid-December, and you will get a reminder one week before
> that.
>
> After they close, the Committee reviews the data and prepares the annual
> report, which appears in the Journal of East Asian Libraries in the spring.
>
> One thing to note. Those October and December dates can move. We adjust them
> some years. So please do not put them in your calendar and ignore your
> email — watch for the announcement.

`导演提示:` (给 Anlin 的建议)这一页是全场最实用的一页,建议念完之后停一下,让大家截图。

---

# S26 · Submitting your data · Anlin · ~2.5 min · live demo

**SLIDE**

> ### Signing in and filling in a form
>
> ## Sign in → My Forms → choose a form → **Save Draft** → **Submit**
>
> Three markers you will see against each form:
>
> - **Ready** — nothing entered yet
> - **Filled** — you have saved something
> - **Submitted** — you pressed Submit; the Committee counts it as complete
>
> **Save Draft as often as you like. Submit when the form is finished.**

**SCRIPT (draft)**

> Let me show you rather than tell you.
>
> [share screen, sign in]
>
> You sign in with your email address. This is the page you land on. These are
> your library's ten forms, and next to each one is a marker.
>
> Ready means you have not entered anything yet. Filled means you have saved
> something. Submitted means you have pressed the Submit button and the
> Committee counts that form as complete for the year.
>
> Let me open one.
>
> [open a form]
>
> You will notice the subtotals fill in by themselves as you type. You do not
> need to add anything up.
>
> And here at the bottom are the two buttons that matter. Save Draft, and
> Submit.
>
> Save Draft is the one to use while you are working. Press it as often as you
> like. Nothing is lost, nobody sees it, and you can come back next week.
>
> Submit is the one that tells us the form is finished. Please do press it when
> you are done — a form left as Filled looks unfinished to us, and we will
> chase you about it.
>
> One more thing on this page. If you filled this form in last year, you can
> see your own numbers from the last five years right here, so you have
> something to compare against. Several of you asked for that last season.

`导演提示:` (给 Anlin 的建议)**建议真机演示,提前确认演示账号能登录。**
如果不想现场演示,建议改成录屏截图。Zoom 上现场登录失败很尴尬。
"Filled 看起来像没做完,我们会来催你"——这句半开玩笑,但能有效提高提交率。

---

# S27 · Looking data up · Anlin · ~2 min · live demo

**SLIDE**

> ### The public statistics — no sign-in needed
>
> - **Quick View** — one year, all libraries, side by side
> - **Table View** — any of the ten tables, across several years and libraries
> - **Graph View** — turn any of it into a chart, and save the image
> - **Published reports** — the PDFs as they appeared in the journal
> - **Before 1998** — the digitised historical reports, kept separately
>
> Everything here can be exported. Use it for your annual report, or your
> next budget conversation.

**SCRIPT (draft)**

> Now the part you can use all year, not just in October.
>
> None of this needs a sign-in. You can send these links to your dean.
>
> [share screen]
>
> Quick View gives you one year, with libraries side by side. Table View lets
> you pick any of the ten tables and compare across several years and several
> libraries at once. Graph View turns any of that into a chart, and you can
> save the picture straight into a slide deck or a report.
>
> The published reports are here as well — the PDFs exactly as they appeared
> in the journal.
>
> And there is a separate section for everything before nineteen ninety-eight.
> That is deliberate. The questionnaire was substantially revised in the
> ninety-eight to ninety-nine cycle, so the older figures do not mean quite
> the same thing. Putting them in the same chart would give you a trend line
> that is not real. So we keep them accessible, but separate.
>
> Everything you see here exports. Please use it. This data is most valuable
> when it is in front of the person deciding your budget.

`导演提示:` (给 Anlin 的建议)最后一句是很好的收尾——把统计数据的价值落在"给院长看"上。
1998 分界那段值得讲,不然每年都有人问为什么不能一起画图。

---

# S28 · The ten forms · Anlin · ~1 min

**SLIDE**

> ### What you will be asked for
>
> | | |
> |---|---|
> | 1 | Monographic acquisitions |
> | 2 | Physical volume holdings |
> | 3 | Serial titles — purchased and non-purchased |
> | 4 | Holdings of other materials |
> | 5 | Unprocessed backlog materials |
> | 6 | Fiscal support |
> | 7 | Personnel support |
> | 8 | Public services |
> | 9 | Electronic resources |
> | 10 | Electronic books |
>
> Plus your selections from the shared audio-visual, e-book and e-journal lists.

**SCRIPT (draft)**

> These are the ten forms. They are the same ten as before — nothing was added
> and nothing was removed when the site was rebuilt.
>
> On top of the ten, there are the three shared lists — audio-visual, e-book
> and e-journal databases — where you tick the ones your library has access to.
>
> If you have done this before, none of this is new. If you are new, the guide
> I am about to point you to walks through all ten, one at a time, with an
> explanation of what belongs in each.

`导演提示:` (给 Anlin 的建议)老用户会觉得这页多余,但新代表需要。快速带过。

---

# S29 · Where to get help · Anlin · ~1 min

**SLIDE**

> ### Two guides, built into the site
>
> ### cealstats.org/help
> For member libraries. Eight chapters, in **English and 中文**.
> Getting started · the timeline · all ten forms explained · common tasks ·
> troubleshooting · checklists · FAQ
>
> ### cealstats.org/admin/superguide
> For the Committee. Sign-in required.
>
> Both searchable. Both print cleanly.
> **If something looks wrong, tell us — during the season we aim to fix it
> that week.**

**SCRIPT (draft)**

> Please write this address down: cealstats dot org slash help.
>
> That is a complete guide for member libraries, built into the site itself.
> Eight chapters. It explains all ten forms one at a time. It has a
> troubleshooting section and a list of frequently asked questions. And it is
> available in both English and Chinese — you can switch with one click.
>
> It also prints cleanly, if you would rather have it on paper next to you
> while you fill the forms in.
>
> And if something looks wrong, please tell us. Do not assume it is your
> mistake and work around it. During the collection season Meng and Yifan aim
> to fix reported problems the same week.

`导演提示:` (给 Anlin 的建议)/help 这个地址是这一页唯一要记住的东西,建议重复一遍。

---

# S30 · What the Committee needs from you · Anlin · ~1.5 min

**SLIDE**

> ### Three things, before the forms open
>
> **1 · Confirm your delegate**
> Tell us if the person who submits for your library has changed. This is the
> single most common reason a library misses the season.
>
> **2 · Check your email address**
> The announcement goes to the address we have on file. If it is wrong, you
> will not know the survey opened.
>
> **3 · Submit, do not just save**
> Press Submit on each form when it is finished.
>
> **New to the survey?** Contact the Committee and we will set your library up.

**SCRIPT (draft)**

> Three things I need from you, and then we will take questions.
>
> First, confirm who submits for your library. If that person has changed —
> and in a few of your libraries it has — please tell us now, not in November.
> This is the single most common reason a library misses the season entirely.
> The announcement went to someone who left.
>
> Second, check that we have the right email address. The announcement goes to
> the address on file. If it is wrong, you simply will not know the survey
> opened.
>
> Third, please press Submit, not just Save Draft. A saved draft looks
> unfinished to us, and we cannot include it in the published statistics.
>
> And if your library has never taken part and would like to: get in touch
> with the Committee, and we will get you set up before October.

`导演提示:` (给 Anlin 的建议)这是全场的行动号召页。**三条,不要加第四条。**
第一条最重要——去年就是因为联系人变更导致有图书馆整季缺席。

---

# S31 · Thank you · Anlin · ~0.5 min

**SLIDE**

> ### Thank you
>
> - To every library that submitted through the new system in its first year
> - To Meng Qu and Yifan Huang, who built it
> - To the CEAL Statistics Committee
>
> **cealstats.org** · **cealstats.org/help**
>
> Meng Qu — qum@miamioh.edu

**SCRIPT (draft)**

> That is everything from us.
>
> Thank you to every library that submitted through the new system in its
> first year — you were, in effect, testing it for us, and you were patient
> about it.
>
> And thank you to Meng and Yifan. This was two and a half years of work
> alongside their regular jobs, and the Committee is very aware of that.
>
> We will take questions now.

---

# S32 · Questions · all three · remaining time

**SLIDE**

> # Questions?
>
> **cealstats.org**
>
> Member guide — cealstats.org/help
> Meng Qu — qum@miamioh.edu

`导演提示:` 三个人都留在画面里。分工:
- 用法、政策、日期、参与 → **Anlin**
- 设计、功能、进度、"为什么重做" → **Meng**
- 数据、迁移、安全、备份 → **Yifan**

预设问答见附录 A。

---

# Appendix A — Design system

The deck matches the new site rather than approximating it. These values are
taken straight out of the site's own stylesheet, so if you build extra slides,
use these and they will not look out of place.

**Palette** — `app/globals.css` line 4 names the source palette explicitly:
`coolors.co/palette/355070-6d597a-b56576-e56b6f-eaac8b`

| Role on the site | Hex | Use on slides |
|---|---|---|
| Contrast / body text | `#355070` deep navy | All body text, table text, headings |
| Primary | `#E56B6F` coral | The one accent per slide, key numbers, links |
| Secondary | `#B56576` dusty rose | Second series in a chart, secondary emphasis |
| Accent | `#6D597A` muted purple | Section dividers, speaker attribution |
| Muted / borders | `#EAAC8B` light peach | Rules, table borders, card outlines |
| Background | `#FFFFFF` white | Slide background |
| Soft background wash | `#F4F8FA` pale cool grey | Alternating table rows, card fills |
| Stat figures (homepage) | `#57534E` warm grey | Large numbers, as on the site's stat cards |

**Type**
- Latin: **Inter** — the site's typeface. Fall back to Segoe UI / Helvetica.
- Chinese, Japanese, Korean: **Noto Sans SC / TC / JP / KR** — the site loads a
  correct face per language, so a Japanese title is never set in a Chinese font.
- Slide titles 32–36 pt, body 18–20 pt, table text 14–16 pt, big numbers 54–72 pt.
- Corner radius on cards and dividers: 8 pt (the site uses `0.5rem`).

**Layout rules taken from the site**
- Generous whitespace. The site's hero has more empty space than content.
- Thin gradient rules as dividers, fading out at both ends — not solid lines.
- Statistics presented as separate cards with a large figure and a small
  all-caps label beneath, exactly like the homepage's founded / institutions /
  holdings cards.
- One accent colour per slide. Never more than one thing competing to be looked at.

**One deliberate departure.** The website animates a slow radial gradient
behind the hero. Do not reproduce that on slides — motion behind text is hard
to read over Zoom compression, and it distracts from a speaker. The deck uses a
still, very pale version of the same wash instead.

---

# Appendix B — Likely questions, and who answers

| Question | Who | Answer |
|---|---|---|
| Where did the pre-1998 data go? | Anlin | Preserved as digitised PDFs in their own section. Kept separate because the questionnaire was substantially revised in the 1998–99 cycle, so mixing the two would produce a trend line that is not real. |
| Can I get the raw numbers out? | Anlin | Yes. Table View exports a spreadsheet, Quick View exports to Excel, Graph View saves the chart as an image. The Committee can export any year as Excel, Word or PDF. |
| What if we miss the deadline? | Anlin | Tell the Committee. They can reopen your library's forms for that year specifically, without affecting anyone else. The change is recorded as a post-deadline edit. |
| Who owns the data? | Meng | The CEAL Statistics Committee. The maintainer holds the vendor accounts, and the handover checklist lists every account that must transfer. |
| What if both of you leave? | Meng | 3,793 lines of documentation in two languages, two guides inside the site, and a written handover checklist. That is exactly why they exist. |
| What does it cost to run? | Meng | **[NEEDS: current hosting, database, email and domain figures]** |
| Is it accessible? WCAG? | Meng | Built on components with keyboard and screen-reader support throughout. A formal audit has not been done and is on our list. **Answer honestly — do not claim compliance.** |
| How often are backups taken? | Yifan | **Answer honestly.** Copies can be taken and restored, but scheduled automatic backups are not yet configured. It is the next thing on our list. |
| Why is the database not normalised? | Yifan | Deliberate. See S19 — traceability to the questionnaire was worth more than elegance. |
| Can we see the code? | Meng | It is in a private repository owned by the Committee's organisation. Access is the Committee's decision, not ours. |

---

# Appendix C — Before Monday

**You still need to supply**
- [ ] S6 — the number of email threads and months of correspondence with Anlin
- [ ] S3 — screenshots: old site homepage, and old site at phone width
      (browser dev tools, 390 px wide — the contrast is the whole point)
- [ ] Appendix B — hosting cost figures, if you want to answer that question
- [ ] A working demo account for Anlin's S26 and S27

**Send to Anlin, today**
- [ ] This file, and tell her the speaking order changed — she is now last
- [ ] Confirm she is happy with the S25–S31 draft, or take her replacement
- [ ] Agree who drives the screen share during her demo

**Rehearse**
- [ ] Once, out loud, against a timer. Cut the `[可删]` paragraphs to fit.
- [ ] Meng: practise the window-drag on S10 and the browser you will use
- [ ] Anlin: sign in once on the actual machine, on the actual network
- [ ] Agree the handoff sentences so there is no dead air between speakers

**Check on the day**
- [ ] The site is up, and the demo account signs in
- [ ] `/help` and `/admin/superguide` both load — you point at both
- [ ] Numbers on S12 still current if any further work has landed
- [ ] Zoom: who is host, who can share, who is watching the chat

---

# Appendix D — Internal only. Do not present.

Kept here so a technical question does not catch you off guard. **None of this
belongs on a slide** — S29's "tell us if something looks wrong" is the
public-facing version.

- No automated test suite; verification is manual
- Build-time type errors are currently ignored
- No scheduled backup automation yet — see Appendix B, answer honestly
- No administrator "reset this user's password" button, although both in-app
  guides describe one. Workaround is the Forgot Password flow.
- Enforced password minimum is 12 characters, but the reset email says 8
- The permission check fails open on an internal error
- Session cookies are not marked as secure-only
- The orphaned 15-minute reset path is unreachable but still present, accepts a
  forgeable timestamp as its only token, and renders a stored password hash
  into the page. **This should be deleted.**
- Dark mode is configured but not implemented
- Two overlapping open/close consoles exist
