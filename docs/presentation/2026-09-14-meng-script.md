# Meng 的讲稿 — Part 1
### 对应 `CEAL_Statistics_Database_Introcution.pptx` 第 4–20 页

按你现在排出来的 41 页 deck 重写。**以 PPT 为准**,原讲稿里和现在幻灯片对不上的地方都改了,
改动的地方在每页下面用 `⚠️ 改了什么` 标出来。

时间:第 4 页开始,第 20 页交给一凡。预算 18 分钟。
照下面全念大约 18.5 分钟,标了 `[可删]` 的段落先砍。

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
> And there was a second problem, one you would only notice if you were on the
> Committee. Almost nothing could be changed without a developer. Opening the
> survey, sending the announcement, adding a new library — all of it meant
> emailing someone technical and waiting.
>
> That is the situation we were asked to fix.

`导演提示:` 两张图都是"登录后第一屏",对比公平,不会被说挑软柿子。
先夸旧站再说问题。Anlin 第 2 页已经讲了 KU 停止托管,**不要重复那条线**。

---

# 第 7 页 · What we set out to do · ~1 分钟

**SCRIPT**

> So we wrote ourselves a brief, and it fits on one line. Keep most functions.
> Replace the experience.
>
> Four parts to that.
>
> First, match the old site function for function, as closely as we could. The
> rule we held ourselves to was this: nothing gets dropped just because it
> would be inconvenient to rebuild.
>
> Second, once we had that, hand the controls over. If the Chair wants to open
> the survey a week late, that should be a button — not an email to me.
>
> [可删] Third, work on whatever screen you happen to have, and render Chinese,
> Japanese and Korean properly, which the old site did not always do.
>
> Fourth, and this is the one I care most about: write it all down. Real
> documentation, so that when Yifan and I are no longer the people doing this,
> the next person can pick it up.

`⚠️ 改了什么:` 你把标题从 "Keep **every** function" 改成了 "Keep **most** functions",
原讲稿还在说 "every function"、"Nothing gets dropped",对不上。现在改成
"as closely as we could" + "nothing gets dropped **just because** it would be
inconvenient" —— 和 "most" 完全自洽:有些功能是**有意**不搬的,但没有一个是嫌麻烦才不搬的。

`⚠️ 要准备:` 说了 "most" 就可能被追问 **"那哪些没搬过来?"**。
这个答案只有你知道,**上台前想好一两个例子**,而且要能说出"为什么不搬"
(比如没人用了、或者被更好的功能取代了)。答不上来会很被动。

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
> One thing worth saying about that table. On the old site, a lot of permission
> was really just a hidden menu item. If you knew the address, you could
> sometimes get further than you should. On the new site, every one of those
> checks happens in the database, every time. Hiding a button is not security,
> and we did not treat it as security.

`⚠️ 改了什么:` 原讲稿写的是 "A super administrator **is the Committee**" —— 这句不准确,
和你第 9 页要强调的是同一个问题。**Super Admin 是系统里的一个角色,委员会是一个组织**,
两者不等同。改成直接描述这个角色能做什么。

`导演提示:` 最后一段是重点。**不要提中间件、cookie、token 这些词。**

---

# 第 9 页 · Super Admin has all controls · ~2 分钟

> ⚠️ **这一页的标题建议改掉。** 现在是 "Giving the Committee the controls" /
> "THE TOOLKIT — RUNNING THE SURVEY"。按你说的,应该是 **Super Admin**,不是 Committee。
> 建议:
> - 大标题 → **Super Admin has all controls**
> - 上面那行小标 → **THE TOOLKIT**
>
> 讲稿按改完之后写。

**SCRIPT**

> Now the part that matters most to whoever is running the survey.
>
> I want to be precise about who "whoever" is. These controls do not belong to
> the Committee as a body. They belong to one role in the system: Super Admin.
> Today that is the Chair and one or two officers. Most Committee members hold
> a different role — E-Resource Editor — which lets them maintain the shared
> database lists, but not open the survey or manage accounts.
>
> That distinction is the whole point of the previous slide. The system does
> not ask who you are on the Committee. It asks what role your account holds.
>
> So — what can a Super Admin do?
>
> [指截图] Set the survey dates for the year. Open a new year, which creates the
> records for all fifty libraries in one action. Force the forms open or closed
> when the schedule slips. Send the announcement — preview it, then send now or
> schedule it. Edit the wording of every automatic message, right in the browser.
>
> Every one of those used to be a developer task. Every one of them meant
> emailing me and waiting.
>
> And the last one on that list came straight out of last year's collection. A
> library joined partway through the season. The announcement had gone out
> weeks earlier, so their delegate never received it. Under the old system, the
> fix was to email me.
>
> Now the Super Admin opens the user list, finds that one person, and clicks a
> button that sends them their own copy. That is it.

`⚠️ 改了什么:` 整页从 "Committee" 改成 **"Super Admin"**,并且**开头就把区别讲清楚**——
这是你要的重点。多加了一句解释:大多数委员会成员其实是 E-Resource Editor,不是 Super Admin。
这个说法有依据:新站 Dashboard 上 E-Resource Editor 那一栏的说明就是
"Statistics Committee members use this section to manage e-resource database lists"。

`导演提示:` 截图本身已经把六个工具列全了,**别一个个念**。挑三个说,重点放在最后那个真实例子上。
如果听众里有委员会成员,这一页会让他们清楚自己账号能做什么、不能做什么——很实用。

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
| 8 | 删掉 "A super administrator **is the Committee**" 这个不准确的等号 |
| 9 | 整页从 Committee 改为 **Super Admin**,开头加了角色 vs 组织的区分 |
| 13 | "The Chair can…" → **"A Super Admin can…"**,口径与第 9 页统一 |
| 18 | 结尾不再是"交棒",改成引出致谢页 |
| 19 | 因为挪到了靠后位置,开头重写成"前面十五分钟讲的都是软件,现在讲不是软件的那部分" |
| 20 | 交棒语保留在这里 |
| 全篇 | 页码全部改成现在这份 41 页 deck 的真实页码 |
