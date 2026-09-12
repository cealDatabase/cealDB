# Meng 的讲稿 — Part 1
### 对应 `CEAL_Statistics_Database_Introcution.pptx` 第 4–20 页

按你现在排出来的 41 页 deck 重写。**以 PPT 为准**,原讲稿里和现在幻灯片对不上的地方都改了,
改动的地方在每页下面用 `⚠️ 改了什么` 标出来。

时间:第 4 页开始,第 20 页交给一凡。预算 18 分钟。
照下面全念大约 **19.5 分钟**(第 7 页加了新旧对比那段,多 1 分钟),
标了 `[可删]` 的段落先砍 —— 砍完回到 18 分钟出头。

---

## 开讲前要先处理的三件事

**1 · 第 11、12 页是重复的,删掉。**
第 9、11、12 页是同一页工具箱的三个副本。第 9 页最完整(多了 `REAL-WORLD USE CASE` 这个标签),
第 12 页和第 9 页逐字节相同,第 11 页是少了那个标签的早期版本。
**留第 9 页,删第 11 和第 12 页。** 下面的讲稿是按"只有一页工具箱"写的。

**2 · 第 3 页(Session Outline)还是 Lorem Ipsum。**
那是 Anlin 的页,但里面 Part 1 / Part 2 两行是留给你们的。建议填:
- Part 1: Building the New Database
- Part 2: Moving the Data, Safely

**3 · deck 里嵌的备注是旧版的。**
你现在这份 pptx 里每页的 speaker notes 还是我上一版给的文字,和这份讲稿已经不一致了
(尤其第 7、8、9、19 页)。上台如果看演讲者视图,请以这份文件为准,或者告诉我,我把
备注重新生成一遍塞回 pptx。

---

# 第 4 页 · Part 1 分隔页 · ~15 秒

**SCRIPT**

> Thank you, Anlin.
>
> Anlin has just told you why the database had to move. I am going to tell you
> what we built, and what it took.

`导演提示:` 别停留。一句话就切。

---

# 第 5 页 · What we are talking about · ~1.5 分钟

**SCRIPT**

> First, one sentence on what this system is, because not everyone in this room
> uses it the same way.
>
> The CEAL Statistics Database is where about fifty libraries in North America
> report their East Asian collections every year. Those numbers become the
> annual report in the Journal of East Asian Libraries. They also become the
> benchmark you reach for when you need to make a case to your dean.
>
> The record goes back a long way. Some of the digitised reports contain data
> from eighteen sixty-nine. The online database itself opened in nineteen
> ninety-nine.
>
> So this is not a new project. It is a twenty-five year old service that
> needed a new home.

`导演提示:` 最后一句定调,说慢一点。Anlin 第 32 页会细讲这条时间线,这里别展开。

---

# 第 6 页 · Where we started · ~1.5 分钟

**SCRIPT**

> Let me start with the old site, and let me start by being fair to it.
>
> That site did its job for two decades. Every number was in there. Every form
> was in there. It never lost anyone's data. Whoever built it deserves credit,
> and some of them may be on this call.
>
> [指左边] This is what you saw after signing in. Everything works. But it is a
> wall of links, and you have to already know what you are looking for.
>
> [指右边] This is the same moment on the new site. Your name, your institution,
> what you are allowed to do, and the three things you most likely came to do.
>
> [可删] It was built for a desktop monitor in the early two thousands. On a
> phone you had to pinch and scroll sideways to read a table.
>
> That is what we set out to replace. Not the data — the data was fine. The way
> you had to work with it.

`⚠️ 改了什么:` 删掉了原来那段"旧站几乎什么都得找开发者改"。
**那是我写的推断,你没法证实** —— 你没管过旧站。而且你自己的截图里,旧站会员区导航条上
就有 `Admin ▾` 菜单,说明它是有管理界面的。这句话台下坐着 KU 时期的人就能当场反驳。
现在只讲你**亲身能证实**的:用起来是什么感觉。

`导演提示:` 两张图都是"登录后第一屏",对比公平,不会被说挑软柿子。
先夸旧站再说问题。Anlin 第 2 页已经讲了 KU 停止托管,**不要重复那条线**。
**全程不要评价旧站的后台权限模型** —— 你不知道,不必知道,说错了反而丢分。

---

# 第 7 页 · What we set out to do · ~2 分钟

**SCRIPT**

> So we wrote ourselves a brief, and this is what we set out to do: keep most
> functions, replace the experience.
>
> Four parts to that.
>
> First, rebuild the functions people actually use. The rule we held ourselves
> to was this: we don't skip a function just because it's hard to rebuild.
>
> Second, once we had that, hand the controls over. If the Chair wants to open
> the survey a week late, that should be a button — not an email to me.
>
> Third, work on whatever screen you happen to have — the layout rearranges
> itself for a phone — and render Chinese, Japanese and Korean properly.
>
> Fourth, and this is the one I care most about: write it all down. Real
> documentation, so that when Yifan and I are no longer the people doing this,
> the next person can pick it up.
>
> [停一下,手指向右边两张图]
>
> Look at the two panels on the right. Same person, same account. Both of them
> are the page you land on right after you sign in.
>
> The top one is the old site. It is a menu. Modify institution information.
> Change password. E-resources. Every one of those still exists today. That is
> the "keep most functions" half of the line.
>
> The bottom one is the new site. Before you click anything, it already tells
> you where you stand. Your name. Your email. Your institution. The roles you
> hold. And when you last signed in — so if a login shows up that was not you,
> you can see it.
>
> Nothing was taken away. The page just answers the questions first, instead of
> making you click around to find out. That is the other half: replace the
> experience.

`导演提示:` **最后三段是这一页的落点,不要赶。** 前面四条是清单,听众会走神;
右边那两张图是他们真正认得的东西——那是他们自己每年登录看到的页面。

说到 "Look at the two panels on the right" 的时候**停半秒再往下说**,给他们时间把眼睛移过去。
四条清单可以念快一点,这三段要慢。

`⚠️ 幻灯片上要改:` 第 1 条标题现在是 "**feature** Rebuild the functions people actually use",
开头那个 `feature` 是上一版 "Match the old site feature for feature" 没删干净的残留,**删掉**。

`⚠️ 讲稿改了什么:`
1. 第一条从 "match the old site function for function" 改成 "rebuild the functions
   people actually use" —— 和你 PPT 上的新标题一致。原来那句是绝对说法("function for
   function"),和标题里的 "**most** functions" 打架。
2. 第三条按你 PPT 的措辞重写,去掉了重复和语法错。
3. **新增最后三段**,把右边的新旧对比讲出来。原来那两张图在屏幕上没人提。

`⚠️ 要准备:` 说了 "most" 就可能被追问 **"那哪些没搬过来?"**。
这个答案只有你知道,**上台前想好一两个例子**,而且要能说出"为什么不搬"
(比如没人用了、或者被更好的功能取代了)。答不上来会很被动。

`⚠️ 时间:` 这一页从 ~1 分钟变成 ~2 分钟。你整段是 18 分钟,多出来的 1 分钟
要从别处找补 —— 见文件末尾的时间表。

---

# 第 8 页 · Who can see and do what · ~1.5 分钟

**SCRIPT**

> The old site had four kinds of visitor, and so does the new one.
>
> A guest is anyone who has not signed in. Guests see the statistics, the
> charts and the published reports. That is deliberate — most of this data is
> meant to be public.
>
> A member is your library's delegate. You submit your own library's forms, and
> you can pull your own multi-year reports.
>
> [可删] An editor maintains the shared lists of electronic databases that
> everyone selects from, and can see across libraries.
>
> And a Super Admin can do all of it, including the one thing nobody else can:
> change data after the deadline has passed.
>
> One row on that table deserves a closer look: "See and edit every library."
>
> On the old site this mattered a great deal. Someone had to be able to open
> another institution's numbers — to check a figure, to help a delegate who was
> stuck, to see what had actually been submitted. That was not a convenience;
> it was how the Committee did its work. So we kept it, in full.
>
> Here is how it works now. You stay signed in as yourself. You pick another
> institution from a switcher at the top of the page, and the site shows you
> that institution's forms and data as they stand. A banner appears telling you
> whose data you are looking at — it says "Super Admin View" or "Editor View"
> and names the institution — so you never lose track of where you are. When
> you are done, you switch back.
>
> Same person, same account, same log. Just pointed at a different institution.
>
> And it is one of the two roles at the right of that table who can do it. A
> Member sees their own library and nothing else.

`⚠️ 改了什么(两处):`
1. 删掉 "A super administrator **is the Committee**" —— 角色 ≠ 组织,和第 9 页是同一个问题。
2. **整段换成机构切换器**,按你说的。原来那段讲"旧站权限只是藏了个菜单项"是我编的,
   你没法证实,而且和第 6 页删掉的那句是同一个毛病。

切换器这个替换好得多:它对应表格里 "See and edit every library" 那一行,是听众真正在用的功能,
而且是**你能百分之百证实**的。核对过代码:切换器只对 Editor(角色 3)和 Super Admin(角色 1)
显示(`components/InstitutionSwitcher.tsx:163-167`),横幅文字确实是 "Super Admin View:" /
"Editor View:"(同文件 267 行)。

`✅ 更新:` 写这份稿子的时候,这个功能的访问控制是坏的,我让你别把它说成安全特性。
**那个洞已经修好并合并了。** 现在你可以准确地讲它,甚至可以加一句"每次提交都会校验机构归属"。
细节和可选的补充句见文件末尾那一节。

`导演提示:` 最后一段是重点。**不要提中间件、cookie、token 这些词。**

---

# 第 9 页 · The Super Admin has all controls · ~2 分钟

**SCRIPT**

> Everything on this page sits behind a single role: Super Admin.
>
> I want to stay on that word for a moment. Role. These controls are not
> attached to a person. They are attached to a role — and a role is something
> you can hand to someone else.
>
> Here is what that means in practice.
>
> Say the Chair finishes their term. Their account does not go anywhere. They
> keep it. They keep their name, their institution, their sign-in, their
> history. One thing changes: the Super Admin role comes off, and they carry
> on as a member of their own library, the same as everybody else in this room.
>
> And the next Chair does not get a new account, and does not get a password
> passed to them in an email. They get that role added to the account they
> already have.
>
> [指右边截图] A Super Admin does this right here. Manage Users. Pick the
> person, change which roles they hold, save. It takes about as long as it took
> me to say it.
>
> [可删] And every one of those changes is written to a log. So a year from now,
> you can still see who handed what to whom, and when.
>
> That is what I mean when I say we handed the controls over. We did not hand
> them to a person. We handed them to a role — and the role moves.
>
> So — what can a Super Admin do?
>
> [指截图] Set the survey dates for the year. Open a new year, which creates the
> records for all fifty libraries in one action. Force the forms open or closed
> when the schedule slips. Send the announcement — preview it, then send now or
> schedule it. Edit the wording of every automatic message, right in the browser.
>
> The last one came straight out of last year's collection. A library joined
> partway through the season. The announcement had gone out weeks earlier, so
> their delegate never received it. The fix, back then, was to email me.
>
> Now the Super Admin opens the user list, finds that one person, and clicks a
> button that sends them their own copy. That is it.

`导演提示:` **这一页的重点是"交接",不是"权限"。**

前半段讲角色可以移交,后半段讲这个角色能做什么。中间那句
"We did not hand them to a person. We handed them to a role — and the role moves."
是这一页的落点,**说完停一下再往下**。

台下坐的是委员会的人,他们真正关心的问题是"等你们俩不干了怎么办"。
这一页就是答案,而且第 20 页会再接一次。

`⚠️ 改了什么(按你的要求重写):`

1. **删掉了整段"谁没有这些权限"** —— 原来那段列举 Editor 不行、Member 不行。
   你说不需要强调这个,删了。而且删掉之后这一页干净很多:原来是"我们有、你们没有",
   现在是"这套东西可以交给下一个人"。语气完全不同。
2. **新增交接那一整段**,按你说的:卸任的人账号保留,可以继续当普通 member,
   另一个人被指派成 Super Admin。
3. 结尾去掉 "and only that role can" —— 同样是"别人不行"的说法。

`✅ 这段话技术上全部核实过:`

- 角色存在**单独的表**(`Users_Roles`),不在账号上。所以改角色**完全不碰账号本身** ——
  用户名、密码、机构关联、历史记录一条都不动(`prisma/schema/schema.prisma:147`)。
- 一个账号**可以同时挂多个角色**(表上是 user_id + role_id 的组合),所以"卸任后继续当
  member"是系统本来就支持的,不是变通做法。
- 改角色的接口是 `PUT /api/admin/users/[userId]/roles`,**只有 Super Admin 能调**,
  而且是拿签名过的 session 去数据库核对身份的。
- 每次改角色都写审计日志,**记录改之前和改之后的角色**
  (`app/api/admin/users/[userId]/roles/route.ts`)。所以"一年后还能查是谁交给谁的"
  这句是真的,可以放心讲。

`⚠️ 幻灯片文字:` 现在的标题和副标题已经对了。右边截图里 Manage Users 那一块写的是
"Assign users as super admins, assistant admins, e-resource editors, or member
institution users" —— **正好就是你要讲的那件事**,指过去的时候可以顺手点它。

---

# 第 10 页 · Signing in got safer — and simpler · ~1 分钟

**SCRIPT**

> If you used the site last fall, you already noticed some of this.
>
> Signing in now happens in two steps. You type your email first, and the site
> checks you before asking for anything else. If you have never set a password,
> it tells you that — instead of just saying "wrong password", which is what
> the old site did, and which sent a lot of email to Anlin.
>
> When you need a password, we email you a one-time link that works for
> twenty-four hours. We do not put passwords in email any more. Ever.
>
> You can change your own password from inside the site. You do not have to ask
> anyone.
>
> And if you cover more than one library — a few of you do — you can switch
> between them without signing out and back in.

`导演提示:` ⚠️ **不要说"15 分钟"。系统实际是 24 小时。**
听众关心的是"不再明文发密码",不是几小时。

---

# 第 13 页 · The toolkit, part two · ~1.5 分钟

> (第 11、12 页删掉之后,这一页就接在第 10 页后面)

**SCRIPT**

> [可删] The second half of the toolkit is about people, data and publication.
>
> A Super Admin can search the whole user list, move someone to a different
> library, change what they are allowed to do, and export the roster.
>
> Adding a new member library used to mean someone editing the database
> directly. It is now a guided six-step form.
>
> Then the part I would point to if you asked me what makes this system
> trustworthy. Every change to every number is recorded. Who made it. When. And
> what the value was before they changed it. If a published number is ever
> questioned, we can show you exactly where it came from and who touched it.
>
> You can also see who has submitted and who has not, for any year. Year-end
> reports export as Excel, Word or PDF — one library, or all of them in a
> single download. When the report is published in the journal, the PDF gets
> uploaded and the public page updates immediately.
>
> And there are rankings going back to nineteen seventy, for any measure you
> like.

`⚠️ 改了什么:` 原讲稿一路说 "The Chair can…",现在统一改成 **"A Super Admin can…"**,
和第 9 页的口径一致。具体举例的时候说"the Chair"没问题(她确实是 Super Admin),
但讲**权限本身**的时候要说角色。

`导演提示:` 审计记录那一段是核心,讲慢一点。这是委员会"数据可信"的保证。

---

# 第 14 页 · How it looks, and who it reads for · ~1 分钟

**SCRIPT**

> A word on how it looks, and then I will get to the numbers.
>
> There is one layout, and it adapts to whatever screen you are on. Let me show
> you rather than describe it.
>
> [拖动浏览器窗口:窄 → 宽]
>
> That is the same page. Nothing is hidden from you on a phone.
>
> The second point matters more than it sounds. Chinese, Japanese and Korean
> titles now render in a proper typeface for each language. On the old site
> they sometimes came out as empty boxes, or in a font that was technically
> Chinese but wrong for a Japanese title. For a database about East Asian
> collections, that was not acceptable.
>
> And there are two full guides built into the site itself. One for member
> libraries, one for administrators. Both in English and Chinese, both
> searchable, both print cleanly. If you take one thing away from my part
> today, make it this address: cealstats dot org slash help.

`导演提示:` 拖窗口这个演示效果最好,**提前把浏览器准备好**。
⚠️ 不要提暗色模式——配置开了但没做完。

---

# 第 15 页 · What it runs on · ~1 分钟

**SCRIPT**

> One slide on what it runs on. I will keep this short, because the names do
> not matter much to you.
>
> Everything you see is built on current, mainstream, well-supported software.
> The data lives in a standard database that any developer would recognise, and
> that can be copied out in one command. The site and the database are hosted
> by two companies, and the email goes through a third.
>
> The line that matters is the last one. All three of those companies are
> replaceable, and the step-by-step instructions for replacing each of them are
> written down in our documentation. There are four of them: move the database,
> move the website, move the email, or move the whole thing onto a university
> server.
>
> I mention it because it is the question a committee should ask. You are not
> locked in to anybody. Including us.

`导演提示:` **不要念表格。** 挑两句说,重点全在最后那句。

---

# 第 16 页 · What this actually took · ~2 分钟 ⭐

**SCRIPT**

> Now the part I was asked to be specific about.
>
> We started in March of twenty twenty-four. That is twenty-nine months ago.
>
> Let me explain one word on this slide first. A commit is one recorded batch
> of work — you finish something, you write down what you did, and it goes into
> the record. Think of it as one entry in a very detailed lab notebook.
>
> There are eight hundred and eighty-six of those. Roughly thirty a month,
> every month, for twenty-nine months.
>
> [可删] A hundred and fifty-four separate change sets were reviewed before they
> went anywhere near the live site. Around a hundred thousand lines of code
> written by hand. Seventy-two pages. Forty-one tables in the database.
>
> And three thousand seven hundred lines of documentation, in English and
> Chinese.
>
> Two of us. Alongside our regular jobs.
>
> I am not showing you this to complain. I am showing you this because when a
> committee approves a rebuild, it is very hard to see what it costs. This is
> what it cost.

`导演提示:` **慢慢讲,给他们时间看数字。**
可口头补:886 次里我提交 693 次,奕帆 111 次。
⚠️ 若被问"总共改了多少行":**照实说没有可靠数字**。宁可说没有,也不要报虚的。

---

# 第 17 页 · How it was built · ~30 秒

**SCRIPT**

> Very quickly, the shape of the work.
>
> [可删] The first five stages were building. Foundations, then accounts, then
> the data, then the shared lists, then the ten forms themselves.
>
> Stage six was getting ready to go live, last September.
>
> And then look at stage seven. Two hundred and eighteen units of work, between
> October and December of last year. More than any other stage in the project.
>
> That is not building. That is the collection season, running live, with your
> data in it.

`导演提示:` 快速带过。**唯一目的是引出第 7 阶段的 218**,直接转下一页。

---

# 第 18 页 · The 2025 collection ran, start to finish · ~1.5 分钟 ⭐

**SCRIPT**

> A third of this entire project happened in two months. September and October
> of last year.
>
> That is what it looks like to support a survey while it is actually running,
> with real libraries entering real numbers.
>
> Some of what we did in those weeks. We set up the automatic opening and
> closing of the forms, then tuned it while it was live. We found and corrected
> the arithmetic on several forms by checking it against the actual
> questionnaire. We repaired the handling of Chinese, Japanese and Korean text
> in the exports.
>
> And we added a feature we had never planned. Several of you asked whether you
> could see your own library's last five years while filling in a form, so you
> had something to compare against. That was a fair request. We added it to all
> ten forms, in the middle of the season.
>
> One more, and then I want to say something else.
>
> In mid-October we attempted a major upgrade to the software underneath the
> site. Within an hour we could see it created a risk to the live season. So we
> undid it, completely, and left it alone. We came back and did that upgrade
> ten months later, in the summer, when nobody's data was on the line.
>
> I mention it because knowing when not to touch something is part of the job.
> Your collection season is not the time to be clever.

`导演提示:` ⭐ **全场情绪高点,值得多花 30 秒。**
回滚那个故事一定要讲——不是失败,是判断力。管理者会记住"这两个人知道什么时候不该动"。

`⚠️ 改了什么:` 结尾那句从 "and then I will hand over" 改成 "and then I want to say
something else" —— 因为你把致谢页挪到了这后面,不是马上交棒。

---

# 第 19 页 · This was never only a coding project · ~2 分钟 ⭐

**SCRIPT**

> I have just spent fifteen minutes showing you software. I want to spend two
> on something that is not.
>
> When you rebuild a survey like this, the hard part is not the code. The hard
> part is understanding what every single field on the form actually means.
> What counts as a volume. What belongs in one column and not another. Why two
> questions that look similar are counted differently.
>
> None of that is written down in the old database. It lives in the practice of
> this community. And the person who translated it for us was Anlin.
>
> Over the past two and a half years, Anlin explained fields to us question by
> question. She put us in touch with the right person at each library when we
> needed to check something. She coordinated the deadlines. She checked our
> migrated numbers against the historical record. And when we were stuck on a
> decision that was not ours to make, she made it — usually within a day.
>
> To put a number on it: three hundred and fifty-six emails about CEAL, and a
> hundred and eighty-five Zoom meetings. Over twenty-nine months.
>
> So let me say this plainly, and in front of all of you. This system is
> accurate because the Committee kept us accurate. Anlin — thank you.

`⚠️ 改了什么:` 这一页你从我原来的第 6 位(很靠前)挪到了第 19 位(很靠后)。
**挪得好** —— 放在这里更有力:先让他们看完 886 次提交、29 个月、2025 年那一季的硬功夫,
再说"但真正让它准确的是委员会",分量完全不一样。
所以开头改成了 "I have just spent fifteen minutes showing you software. I want to
spend two on something that is not." —— 明确把前面所有内容当作铺垫。

`导演提示:` **185 次 Zoom 会议比 356 封邮件更有冲击力** —— 两年半平均每月六次会,
听众自己会算这笔账。念完停一秒。
说完最后那句,**看一眼镜头里的 Anlin**,再切下一页。

---

# 第 20 页 · The same two people are still behind it · ~45 秒

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
> volunteer committee should not depend on any one person indefinitely —
> including me.
>
> Now, I have talked about what you can see. Yifan is going to tell you about
> what sits underneath. Yifan.

`导演提示:` 这一页回应委员会最深的顾虑:"这两个人走了怎么办?"
说完交棒给奕帆。**看一眼时间** —— 这里应该在第 22 分钟左右(含 Anlin 开场的 3 页)。

---

## 附:这一版相对旧讲稿改了哪些

| 页 | 改动 |
|---|---|
| 7 | "Keep every function" → **"Keep most functions"**,并去掉 "Nothing gets dropped" 的绝对说法 |
| 7 | 第一条改成 "rebuild the functions people actually use",与 PPT 新标题一致;第三条按 PPT 重写;**新增结尾三段讲右边的新旧 personal information 对比** |
| 8 | 删掉 "A super administrator **is the Committee**" 这个不准确的等号 |
| 6 | 删掉"旧站什么都得找开发者"——无法证实,且旧站有 Admin 菜单 |
| 9 | 整页从 Committee 改为 **Super Admin**;删掉"Editor/Member 没有权限"那一段,改讲**角色可以移交**:卸任的人保留账号继续当 member,下一个人在自己已有的账号上加这个角色 |
| 13 | "The Chair can…" → **"A Super Admin can…"**,口径与第 9 页统一 |
| 18 | 结尾不再是"交棒",改成引出致谢页 |
| 19 | 因为挪到了靠后位置,开头重写成"前面十五分钟讲的都是软件,现在讲不是软件的那部分" |
| 20 | 交棒语保留在这里 |
| 全篇 | 页码全部改成现在这份 41 页 deck 的真实页码 |

---

## ✅ 已修复:机构切换 / 跨机构写入的访问控制

写这份讲稿时我发现这个功能的访问控制是坏的,当时提醒你别把它说成安全特性。
**那个洞已经修好并合并进 main 了**([PR #166](https://github.com/cealDatabase/cealDB/pull/166),
`b48a648`)。这一节保留下来,是因为它现在变成了你**可以讲**的东西。

**当时是什么问题:** 十个表单的提交接口从请求体里取 `libid`,但从不验证调用者和那个机构有没有关系。
`/api/switch-library` 也一样,不检查登录也不检查角色。结果是:只要某个机构年度开放着,
**任何人都能往那个机构的表单里写数据 —— 不需要是该馆代表,甚至不需要登录。**

**怎么确认的:** 不是读代码推断的。起了一个真的 PostgreSQL,建了个开放年度的馆,
不带任何 cookie 发 POST,拿到 200,数据库里真的多了一行。

**怎么修的:** `lib/auth.ts` 里本来就有个 `canAccessLibrary()` 是专门防这个的,
但十个表单接口一个都没接上。现在十个全接上了,`switch-library` 加了登录 + 角色校验,
`observe_library` cookie 改成 `httpOnly`。

**修完验证过(真库真服务器,七个场景):** 不登录写别人馆 → 403;别的馆代表写 → 403;
本馆代表写 → 200(没坏);Super Admin 跨机构写 → 200(**切换功能没坏**);
switch-library 不登录 → 401,普通成员 → 403,Super Admin → 200 且 cookie 带 HttpOnly。

---

### 所以第 8 页那段现在可以加一句

你原来让我删掉的那句"权限在数据库里逐次校验"当时确实不成立,**现在成立了**。
如果你想在切换器那段后面补一句,可以这么说:

> And it is checked on the way in, not just in the menu. Every submission
> verifies that your account is entitled to that institution before it writes
> anything — so pointing your browser at someone else's library does not get
> you their forms.

`导演提示:` 这句**可加可不加**。不加也完全说得通,机构切换本身已经是个好故事。
加的话好处是:万一 Q&A 有人问"那我能不能看别人馆的数据",你已经答过了。
⚠️ 但**别主动讲"我们最近修了个漏洞"** —— 那是内部工程过程,不是给委员会的内容,
而且会把听众的注意力从"这个系统做得好"引到"这个系统出过问题"。
真被直接问到,照实说"发现了一个权限校验的缺口,已经修了,在表单开放前"。
