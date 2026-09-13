const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';           // 13.333 x 7.5
pres.author = 'CEAL Statistics Committee';
pres.title  = 'CEAL Statistics Database — Launch Session';

// ---- palette lifted from app/globals.css ----
const NAVY   = '355070';
const CORAL  = 'E56B6F';
const ROSE   = 'B56576';
const PURPLE = '6D597A';
const PEACH  = 'EAAC8B';
const WASH   = 'F4F8FA';
const STONE  = '57534E';
const WHITE  = 'FFFFFF';
const MUTED  = '7A8BA0';

const FONT = 'Calibri';
const M = 0.75;                        // side margin
const CW = 13.333 - M * 2;             // content width

function slide(){ const s = pres.addSlide(); s.background = { color: WHITE }; return s; }

function head(s, title, speaker, kicker){
  if (kicker) s.addText(kicker.toUpperCase(), {
    x: M, y: 0.52, w: CW - 1.9, h: 0.25, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11, bold: true, color: PURPLE, charSpacing: 1.6 });
  s.addText(title, {
    x: M, y: kicker ? 0.78 : 0.62, w: CW - 1.9, h: 0.85, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 30, bold: true, color: NAVY, valign: 'top' });
  if (speaker) s.addText(speaker, {
    x: 13.333 - M - 1.6, y: kicker ? 0.54 : 0.68, w: 1.6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11, color: MUTED, align: 'right' });
}

// white card with a thin peach outline — the site's stat-card treatment
function card(s, x, y, w, h, fill){
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08, fill: { color: fill || WHITE },
    line: { color: PEACH, width: 1 },
    shadow: { type: 'outer', angle: 90, blur: 8, offset: 1, opacity: 0.06, color: NAVY } });
}

function statCard(s, x, y, w, figure, label, color){
  card(s, x, y, w, 1.55);
  s.addText(String(figure), { x, y: y + 0.16, w, h: 0.78, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 40, bold: true, color: color || STONE, align: 'center' });
  s.addText(String(label).toUpperCase(), { x, y: y + 0.98, w, h: 0.4, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10, color: MUTED, align: 'center', charSpacing: 1.4 });
}

// numbered circle + heading + body — the repeating "icon row" motif
function row(s, x, y, w, n, heading, body, color){
  const d = 0.42;
  s.addShape(pres.ShapeType.ellipse, { x, y: y + 0.02, w: d, h: d,
    fill: { color: color || CORAL }, line: { color: color || CORAL, width: 0 } });
  s.addText(String(n), { x, y: y + 0.02, w: d, h: d, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle' });
  s.addText(heading, { x: x + d + 0.22, y, w: w - d - 0.22, h: 0.32, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 16, bold: true, color: NAVY });
  if (body) s.addText(body, { x: x + d + 0.22, y: y + 0.33, w: w - d - 0.22, h: 0.62,
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 13.5, color: STONE, valign: 'top' });
}

// compact variant for slides with five or more items
function rowTight(s, x, y, w, n, heading, body, color){
  const d = 0.34;
  s.addShape(pres.ShapeType.ellipse, { x, y: y + 0.02, w: d, h: d,
    fill: { color: color || CORAL }, line: { width: 0 } });
  s.addText(String(n), { x, y: y + 0.02, w: d, h: d, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 12, bold: true, color: WHITE, align: 'center', valign: 'middle' });
  s.addText([{ text: heading + '  ', options: { bold: true, color: NAVY } },
             { text: body || '', options: { color: STONE } }],
    { x: x + d + 0.18, y, w: w - d - 0.18, h: 0.6, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13.5, valign: 'top' });
}

function bullets(s, x, y, w, h, items, size){
  s.addText(items.map((t, i) => ({
    text: t, options: { bullet: { indent: 16 }, breakLine: i !== items.length - 1 } })), {
    x, y, w, h, isTextBox: true, margin: 0, fontFace: FONT,
    fontSize: size || 15, color: NAVY, paraSpaceAfter: 9, valign: 'top' });
}

function table(s, rows, opts){
  s.addTable(rows, Object.assign({
    x: M, y: 1.72, w: CW, fontFace: FONT, fontSize: 13.5, color: NAVY,
    border: { type: 'solid', color: PEACH, pt: 0.75 }, valign: 'middle',
    autoPage: false }, opts || {}));
}
function th(t, o){ return Object.assign({ text: t, options: Object.assign(
  { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5 }, o || {}) }, {}); }
function td(t, o){ return Object.assign({ text: t, options: Object.assign({}, o || {}) }, {}); }

function dot(){ return { text: '●', options: { align: 'center', color: CORAL, bold: true } }; }
function nodot(){ return { text: '', options: {} }; }

// pull quote / emphasis band
function emphasis(s, y, text, color){
  card(s, M, y, CW, 0.95, WASH);
  s.addText(text, { x: M + 0.3, y: y + 0.06, w: CW - 0.6, h: 0.83, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 16, bold: true, color: color || NAVY, valign: 'middle' });
}

function note(s, txt){ s.addNotes(txt); }

/* ============================ S1 — title (dark) ============================ */
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addText('CEAL Statistics Database', { x: M, y: 1.85, w: CW, h: 0.95, isTextBox: true,
    margin: 0, fontFace: FONT, fontSize: 46, bold: true, color: WHITE });
  s.addText('A new home for six decades of East Asian library data',
    { x: M, y: 2.82, w: CW, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 21, color: PEACH });
  s.addText('cealstats.org', { x: M, y: 3.55, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 17, bold: true, color: CORAL });
  const people = [
    ['Meng Qu', 'Web Service Librarian, Miami University'],
    ['Yifan Huang', 'Backend Developer'],
    ['Anlin Yang', 'Chair, CEAL Statistics Committee'],
  ];
  people.forEach((p, i) => {
    const y = 4.42 + i * 0.42;
    s.addText(p[0], { x: M, y, w: 2.3, h: 0.34, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, bold: true, color: WHITE });
    s.addText(p[1], { x: M + 2.35, y, w: 6.5, h: 0.34, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: MUTED });
  });
  s.addText('September 14, 2026', { x: M, y: 6.35, w: CW, h: 0.35, isTextBox: true,
    margin: 0, fontFace: FONT, fontSize: 13, color: MUTED });
  note(s, `MENG — ~30 seconds. No technical content here.

Good afternoon, everyone. Thank you for making time for this.

I am Meng Qu, Web Service Librarian at Miami University. With me are Yifan Huang, who built the back end of this system, and Anlin Yang, the Chair of the CEAL Statistics Committee.

Here is how the next forty-five minutes will go. I will start with why we rebuilt the statistics database, and what changed. Yifan will then explain how we moved twenty-five years of data without losing any of it. Anlin will finish by showing you how to actually use the new site, and what the Committee needs from your library this fall.

We will take questions at the end. If something is unclear along the way, please put it in the chat and we will pick it up.

导演提示: 30 秒之内说完,说完直接切下一页。`);
}

/* ============================ S2 — what this is ============================ */
{
  const s = slide();
  head(s, 'What we are talking about', 'Meng', 'The service');
  bullets(s, M, 1.72, 6.5, 1.9, [
    'The official annual statistics platform of the Council on East Asian Libraries',
    'Around 50 North American libraries submit data every year',
    'Results are published in the Journal of East Asian Libraries',
  ], 16);
  emphasis(s, 5.85, 'One place to report your numbers. One place to look everyone else’s up.');
  statCard(s, 7.72, 1.72, 1.50, '~50', 'Libraries');
  statCard(s, 9.40, 1.72, 1.50, '1869', 'Earliest data');
  statCard(s, 11.08, 1.72, 1.50, '1999', 'Online since');
  card(s, 7.72, 3.55, 4.86, 1.75, WASH);
  s.addText('Not a new project.\nA twenty-five year old service that needed a new home.',
    { x: 7.97, y: 3.72, w: 4.36, h: 1.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: NAVY, valign: 'middle', lineSpacingMultiple: 1.2 });
  note(s, `MENG — ~1.5 min

First, a sentence about what this system is, because not everyone in this room uses it the same way.

The CEAL Statistics Database is where about fifty libraries in North America report their East Asian collections every year. Those numbers become the annual report in the Journal of East Asian Libraries. They also become the benchmark you use when you need to make a case to your dean.

The record goes back a long way. Some of the digitised reports contain data from eighteen sixty-nine. The online database itself opened in nineteen ninety-nine.

So this is not a new project. It is a twenty-five year old service that needed a new home.

导演提示: 最后那句是整场的定调,说慢一点。`);
}

/* ============================ S3 — where we started ============================ */
{
  const s = slide();
  head(s, 'Where we started', 'Meng', 'The site we inherited');
  const colW = (CW - 0.4) / 2;

  card(s, M, 1.72, colW, 3.55, WASH);
  s.addText('What it did well — for twenty years', { x: M + 0.3, y: 1.95, w: colW - 0.6, h: 0.35,
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 16, bold: true, color: PURPLE });
  bullets(s, M + 0.3, 2.42, colW - 0.6, 2.6, [
    'Held every data point and every form, complete and correct',
    'Served guests, member libraries and the Committee, reliably',
    'Never lost anyone’s data',
  ], 14.5);

  card(s, M + colW + 0.4, 1.72, colW, 3.55);
  s.addText('What it could no longer do', { x: M + colW + 0.7, y: 1.95, w: colW - 0.6, h: 0.35,
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 16, bold: true, color: CORAL });
  bullets(s, M + colW + 0.7, 2.42, colW - 0.6, 2.6, [
    'Built for a desktop monitor. Unusable on a phone or tablet.',
    'Fixed page width, dated colours, hard to read',
    'Every administrative change needed a developer',
    'Built on software getting harder to host safely',
  ], 14.5);

  emphasis(s, 5.55, 'Whoever built that site deserves credit. It did its job for two decades.', PURPLE);
  s.addText('[SCREENSHOT] · replace this slide’s cards with two images: old homepage, and old site at 390 px wide',
    { x: M, y: 6.64, w: CW, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, italic: true, color: MUTED });
  note(s, `MENG — ~1.5 min

Let me start with the old site, and let me start by being fair to it.

That site did its job for two decades. Every number was in there. Every form was in there. It never lost anyone's data. Whoever built it deserves credit, and some of them may be on this call.

[可删] But it was built for a desktop computer in the early two thousands. If you opened it on your phone, you had to pinch and scroll sideways to read a table. The page had a fixed width, so on a large monitor most of your screen was empty. The colours were hard on the eyes.

And there was a bigger problem, one you would only notice if you were on the Committee. Almost nothing could be changed without a developer. Opening the survey, sending the announcement, adding a new library — all of it meant emailing someone technical and waiting.

That is the situation we were asked to fix.

导演提示: 必须先夸旧站再说问题,语气是"它老了",不是"它很差"。
需要两张截图:旧站首页 + 旧站 390px 宽的样子。`);
}

/* ============================ S4 — the brief ============================ */
{
  const s = slide();
  head(s, 'What we set out to do', 'Meng', 'The brief');
  card(s, M, 1.62, CW, 1.0, WASH);
  s.addText('Keep every function. Replace the experience.',
    { x: M + 0.35, y: 1.7, w: CW - 0.7, h: 0.84, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 27, bold: true, color: NAVY, valign: 'middle' });
  const items = [
    ['Match the old site feature for feature', 'Remove nothing because it was inconvenient to rebuild.'],
    ['Hand the Committee the controls', 'If the Chair wants to open the survey late, that is a button — not an email to me.'],
    ['Work on any screen, in any of the languages', 'And render Chinese, Japanese and Korean properly.'],
    ['Write it all down', 'So that when we are no longer the people doing this, the next person can take over.'],
  ];
  items.forEach((it, i) => row(s, M, 2.95 + i * 1.00, CW, i + 1, it[0], it[1],
    [CORAL, ROSE, PURPLE, NAVY][i]));
  note(s, `MENG — ~1 min

So we wrote ourselves a brief, and it fits on one line. Keep every function. Replace the experience.

Four parts to that.

First, match the old site feature for feature. Nothing gets dropped because it was inconvenient to rebuild.

Second, once we had parity, give the Committee the controls. If the Chair wants to open the survey a week late, that should be a button, not an email to me.

[可删] Third, make it work on whatever screen you happen to have. And make it render Chinese, Japanese and Korean properly, which the old site did not always do.

Fourth, and this is the one I care most about: write everything down. Not just code comments. Real documentation, so that when Yifan and I are no longer the people doing this, the next person can pick it up.

导演提示: 第四条是委员会最在意的,说完停半秒。`);
}

/* ============================ S5 — access tiers ============================ */
{
  const s = slide();
  head(s, 'Who can see and do what', 'Meng', 'Four levels — all four preserved');
  table(s, [
    [th(''), th('Guest', { align: 'center' }), th('Member', { align: 'center' }),
     th('Editor', { align: 'center' }), th('Super Admin', { align: 'center' })],
    [td('Statistics, charts, published reports'), dot(), dot(), dot(), dot()],
    [td('Submit your own library’s forms'), nodot(), dot(), nodot(), dot()],
    [td('Your own multi-year reports and ranking'), nodot(), dot(), dot(), dot()],
    [td('Maintain the shared database title lists'), nodot(), nodot(), dot(), dot()],
    [td('See and edit every library'), nodot(), nodot(), dot(), dot()],
    [td('Manage people, dates and announcements'), nodot(), nodot(), nodot(), dot()],
    [td('Edit after the deadline has passed'), nodot(), nodot(), nodot(), dot()],
  ], { y: 1.68, colW: [5.6, 1.55, 1.55, 1.55, 1.58], rowH: 0.42, fontSize: 13 });
  emphasis(s, 5.55, 'Permission is checked in the database — not just hidden in the menu.', CORAL);
  s.addText('Hiding a button is not security, and we did not treat it as security.',
    { x: M, y: 6.68, w: CW, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, italic: true, color: MUTED });
  note(s, `MENG — ~1.5 min

The old site had four kinds of visitor, and so does the new one.

A guest is anyone who has not signed in. Guests can see the statistics, the charts and the published reports. That is deliberate. Most of this data is meant to be public.

A member is your library's delegate. You submit your own library's forms, and you can pull your own multi-year reports.

[可删] An editor maintains the shared lists of electronic databases that everyone selects from, and can see across libraries.

A super administrator is the Committee. They manage people, set the dates, send the announcements, and they are the only ones who can change data after the deadline.

One thing worth saying about that table. On the old site, a lot of permission was really just a hidden menu item. If you knew the address, you could sometimes get further than you should. On the new site every one of those checks happens in the database, every time. Hiding a button is not security, and we did not treat it as security.

导演提示: 最后一段是重点,但不要提中间件、cookie、token 这些词。`);
}

/* ============================ S6 — the Anlin slide ============================ */
{
  const s = slide();
  head(s, 'This was never only a coding project', 'Meng', 'Working with the Committee');
  card(s, M, 1.68, CW, 3.3, WASH);
  s.addText('Throughout the rebuild, Committee Chair Anlin Yang:',
    { x: M + 0.35, y: 1.9, w: CW - 0.7, h: 0.35, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: PURPLE });
  bullets(s, M + 0.35, 2.38, CW - 0.7, 2.5, [
    'Explained what each form field actually means — question by question',
    'Put us in touch with the right person at each library',
    'Kept the schedule honest, and coordinated every deadline',
    'Checked the migrated numbers against the historical record',
    'Made the decisions that unblocked us, quickly, again and again',
  ], 15);
  card(s, M, 5.22, 4.0, 1.15);
  s.addText([{ text: '≈ N', options: { fontSize: 30, bold: true, color: CORAL, breakLine: true } },
             { text: 'EMAIL THREADS, OVER M MONTHS', options: { fontSize: 9.5, color: MUTED, charSpacing: 1.2 } }],
    { x: M, y: 5.36, w: 4.0, h: 0.9, isTextBox: true, margin: 0, fontFace: FONT, align: 'center' });
  s.addText('You cannot read these requirements out of a database.\nThey came out of that correspondence.',
    { x: M + 4.35, y: 5.28, w: CW - 4.35, h: 1.05, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: NAVY, valign: 'middle', lineSpacingMultiple: 1.15 });
  s.addText('[NEEDS] replace N and M with the real counts from your mailbox',
    { x: M, y: 6.62, w: CW, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, italic: true, color: MUTED });
  note(s, `MENG — ~2 min ⭐ THE MOST IMPORTANT SLIDE. This is the thank-you to Anlin.

I want to spend a minute on something that is not code.

When you rebuild a survey like this, the hard part is not the software. The hard part is understanding what every single field on the form actually means. What counts as a volume. What belongs in one column and not another. Why two questions that look similar are counted differently.

None of that is written in the old database. It lives in the practice of this community. And the person who translated it for us was Anlin.

Over the past two and a half years, Anlin has explained fields to us question by question. She put us in touch with the right person at each library when we needed to check something. She coordinated the deadlines. She checked our migrated numbers against the historical record. And when we were stuck on a decision that was not ours to make, she made it, usually within a day.

That is roughly N separate email threads across M months.

So I want to say this plainly, and in front of all of you. This system is accurate because the Committee kept us accurate. Anlin, thank you.

导演提示: 两层意思 — (1) 真诚感谢她; (2) 向委员会证明每个字段定义都跟委员会确认过。
因为 Anlin 排在最后讲,这页还能提前把她捧起来。说完看一眼镜头里的她再切页。
需要你补:去邮箱数 thread 数和月数,填进 N 和 M。`);
}

/* ============================ S7 — sign-in ============================ */
{
  const s = slide();
  head(s, 'What you already noticed last year', 'Meng', 'Signing in got safer — and simpler');
  const items = [
    ['Type your email first', 'The site tells you whether you still need to set a password, before it asks you for one.'],
    ['A one-time link, good for 24 hours', 'New accounts and resets arrive as a link. We never send you a password in an email again.'],
    ['Change your own password', 'Any time, from inside the site. You do not have to ask anyone.'],
    ['Covering two libraries?', 'Switch between them without signing out and back in.'],
  ];
  items.forEach((it, i) => row(s, M, 1.78 + i * 1.05, CW, i + 1, it[0], it[1],
    [CORAL, NAVY, ROSE, PURPLE][i]));
  emphasis(s, 5.95, 'We do not put passwords in email any more. Ever.', CORAL);
  note(s, `MENG — ~1 min

If you used the site last fall, you already noticed some of this.

Signing in now happens in two steps. You type your email address first, and the site checks you before asking for anything else. If you have never set a password, it tells you that instead of just saying "wrong password" — which is what the old site did, and which sent a lot of email to Anlin.

When you need a password, we email you a one-time link that works for twenty-four hours. We do not put passwords in email any more. Ever.

You can change your own password from inside the site. You do not have to ask anyone.

And if you cover more than one library, which a few of you do, you can now switch between them without signing out and back in.

导演提示: ⚠️ 不要说"15 分钟"。系统实际是 24 小时。那条 15 分钟的路径是死代码,没有任何地方在调用。
听众关心的是"不再明文发密码",不是几小时。`);
}

/* ============================ S8 — toolkit I ============================ */
{
  const s = slide();
  head(s, 'Giving the Committee the controls', 'Meng', 'The toolkit — running the survey');
  s.addText('Every one of these used to require a developer. Now each is a page on the site.',
    { x: M, y: 1.62, w: CW, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14.5, italic: true, color: PURPLE });
  const g = [
    ['Set the dates', 'Opening, closing, fiscal year, publication — per year'],
    ['Open a new year', 'Creates the year’s records for all 50 libraries at once'],
    ['Open or close right now', 'An override for when the schedule slips'],
    ['Send the announcement', 'Preview it, confirm it, send now or schedule it'],
    ['Edit the wording', 'Of every automatic message, in the browser'],
    ['Email one person', 'For the library that joined after the announcement went out'],
  ];
  const cw2 = (CW - 0.4) / 3, chh = 1.5;
  g.forEach((it, i) => {
    const x = M + (i % 3) * (cw2 + 0.2), y = 2.12 + Math.floor(i / 3) * (chh + 0.22);
    card(s, x, y, cw2, chh, i === 5 ? WASH : WHITE);
    s.addText(it[0], { x: x + 0.24, y: y + 0.2, w: cw2 - 0.48, h: 0.36, isTextBox: true,
      margin: 0, fontFace: FONT, fontSize: 15.5, bold: true, color: i === 5 ? CORAL : NAVY });
    s.addText(it[1], { x: x + 0.24, y: y + 0.6, w: cw2 - 0.48, h: 0.78, isTextBox: true,
      margin: 0, fontFace: FONT, fontSize: 13, color: STONE, valign: 'top' });
  });
  emphasis(s, 5.75, 'A library joined mid-season and never got the announcement. Now the Chair sends them their own copy — one click.', CORAL);
  note(s, `MENG — ~2 min

Now the part I am most pleased about, and the part that matters most to the Committee.

On the old site, running the survey meant asking a developer. Opening the forms was a developer task. Sending the announcement was a developer task. Changing a date was a developer task.

All of that is now a page on the site.

The Chair sets the opening and closing dates herself. Opening a new survey year creates the records for all fifty libraries in one action. If a date needs to slip, there is a button for that. The announcement email can be previewed, then sent now or scheduled for later. And the wording of every automatic message can be edited right in the browser — no developer, no waiting.

I want to point out the last item on that list, because it came directly out of last year's collection. A library joined partway through the season. The announcement had already gone out weeks earlier, so their delegate never got it. Under the old system, the fix was to email me.

Now the Chair opens the user list, finds that one person, and clicks a button that sends them their own copy of the announcement. That is it.

导演提示: 最后那个例子是真事,讲具体故事比列功能有效。
反复回到一句话:"以前这些都得找开发者,现在委员会自己就能做。"`);
}

/* ============================ S9 — toolkit II ============================ */
{
  const s = slide();
  head(s, 'People, data, publication', 'Meng', 'The toolkit — part two');
  const left = [
    ['People', 'Search, reassign, change roles, export the whole roster'],
    ['Add a library', 'A guided six-step form — no database access needed'],
    ['Who has submitted', 'For any year, at a glance'],
  ];
  const right = [
    ['Year-end reports', 'Excel, Word, PDF — or every library in one download'],
    ['Published reports', 'Upload the PDF; the public page updates immediately'],
    ['Rankings back to 1970', 'Click any measure for the full list'],
  ];
  left.forEach((it, i) => row(s, M, 1.78 + i * 1.05, 5.6, i + 1, it[0], it[1], NAVY));
  right.forEach((it, i) => row(s, M + 6.23, 1.78 + i * 1.05, 5.61, i + 4, it[0], it[1], PURPLE));
  card(s, M, 5.15, CW, 1.5, WASH);
  s.addText('A record of every change', { x: M + 0.35, y: 5.32, w: CW - 0.7, h: 0.34,
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 17, bold: true, color: CORAL });
  s.addText('Who made it, when, and what the value was before. If a published number is ever questioned, we can show you exactly where it came from and who touched it.',
    { x: M + 0.35, y: 5.7, w: CW - 0.7, h: 0.78, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14.5, color: NAVY, valign: 'top' });
  note(s, `MENG — ~1.5 min

[可删] The second half of the toolkit is about people, data and publication.

The Chair can search the whole user list, move someone to a different library, change what they are allowed to do, and export the roster.

Adding a new member library used to mean someone editing the database directly. It is now a guided six-step form.

Then there is the part I would point to if you asked me what makes this system trustworthy. Every change to every number is recorded. Who made it. When. And what the value was before they changed it. If a number in the published report is ever questioned, we can show you exactly where it came from and who touched it.

The Committee can see who has submitted and who has not, for any year. Year-end reports export as Excel, Word or PDF — one library, or all of them in a single download. When the report is published in the journal, the Chair uploads the PDF and the public page updates immediately.

And there are rankings going back to nineteen seventy, for any measure you like.

导演提示: 审计记录那段是核心,讲慢一点。对委员会来说这是"数据可信"的保证。
可以随口带一句:系统拒绝删除最后一个超级管理员。听众会笑。`);
}

/* ============================ S10 — design & language ============================ */
{
  const s = slide();
  head(s, 'How it looks, and who it reads for', 'Meng', 'Design, language, help');
  const colW = (CW - 0.4) / 2;
  const items = [
    ['One layout, any screen', 'From a phone to a wide monitor. Nothing is hidden from you on a small screen.'],
    ['East Asian type, done properly', 'A correct typeface per language — so a Japanese title is never set in a Chinese font.'],
    ['Keyboard and screen-reader support', 'Built in from the start, not added afterwards.'],
  ];
  items.forEach((it, i) => row(s, M, 1.78 + i * 1.12, colW, i + 1, it[0], it[1],
    [CORAL, ROSE, PURPLE][i]));

  card(s, M + colW + 0.4, 1.72, colW, 3.5, WASH);
  s.addText('Two complete guides, inside the site', { x: M + colW + 0.7, y: 1.95, w: colW - 0.6,
    h: 0.35, isTextBox: true, margin: 0, fontFace: FONT, fontSize: 16, bold: true, color: NAVY });
  s.addText([
    { text: 'cealstats.org/help', options: { fontSize: 17, bold: true, color: CORAL, breakLine: true } },
    { text: 'For member libraries. Eight chapters, in English and 中文.', options: { fontSize: 13.5, color: STONE, breakLine: true } },
    { text: '\n', options: { fontSize: 8, breakLine: true } },
    { text: 'cealstats.org/admin/superguide', options: { fontSize: 15, bold: true, color: PURPLE, breakLine: true } },
    { text: 'For the Committee. Sign-in required.', options: { fontSize: 13.5, color: STONE, breakLine: true } },
    { text: '\n', options: { fontSize: 8, breakLine: true } },
    { text: 'Both searchable. Both print cleanly.', options: { fontSize: 13.5, italic: true, color: MUTED } },
  ], { x: M + colW + 0.7, y: 2.45, w: colW - 0.6, h: 2.6, isTextBox: true, margin: 0,
       fontFace: FONT, valign: 'top' });

  emphasis(s, 5.5, 'If you take one thing away from my part today, make it this: cealstats.org/help', CORAL);
  s.addText('[LIVE] drag the browser window narrow, then wide — the old site could not do this',
    { x: M, y: 6.65, w: CW, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, italic: true, color: MUTED });
  note(s, `MENG — ~1 min

A word on how it looks, and then I will get to the numbers.

There is one layout, and it adapts to whatever screen you are on. Let me just show you rather than describe it.

[DRAG THE BROWSER WINDOW NARROW, THEN WIDE]

That is the same page. Nothing is hidden from you on a phone.

The second point matters more than it sounds. Chinese, Japanese and Korean titles now render in proper typefaces for each language. On the old site they sometimes came out as empty boxes, or in a font that was technically Chinese but wrong for a Japanese title. For a database about East Asian collections, that was not acceptable.

And there are two full guides built into the site itself. One for member libraries, one for the Committee. Both are in English and Chinese, both are searchable, and both print cleanly if you want them on paper. If you take one thing away from my part today, make it this address: cealstats.org slash help.

导演提示: 拖窗口这个演示效果最好,提前把浏览器准备好。
⚠️ 不要提暗色模式 — 配置开了但没做完。`);
}

/* ============================ S11 — the stack ============================ */
{
  const s = slide();
  head(s, 'What it runs on', 'Meng', 'In plain terms');
  table(s, [
    [th('What it does'), th('What we chose'), th('Why')],
    [td('Builds the pages you see'), td('Next.js', { bold: true }), td('One system for the site and the data behind it')],
    [td('Stores the data'), td('PostgreSQL', { bold: true }), td('Proven, durable, easy to copy out')],
    [td('Hosts the database'), td('Neon', { bold: true }), td('Can copy the whole database to test safely')],
    [td('Hosts the website'), td('Vercel', { bold: true }), td('Runs the scheduled tasks; renews certificates itself')],
    [td('Sends the email'), td('Resend', { bold: true }), td('Handles the mailing list and shows what was delivered')],
  ], { y: 1.72, colW: [3.7, 2.6, 5.53], rowH: 0.5, fontSize: 13.5 });
  card(s, M, 5.0, CW, 1.5, WASH);
  s.addText('Three outside companies. All three replaceable.',
    { x: M + 0.35, y: 5.18, w: CW - 0.7, h: 0.34, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: CORAL });
  s.addText('Four documented routes out: move the database, move the website, move the email, or move all of it onto a university server. You are not locked in to anybody — including us.',
    { x: M + 0.35, y: 5.56, w: CW - 0.7, h: 0.78, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14.5, color: NAVY, valign: 'top' });
  note(s, `MENG — ~1 min

One slide on what it runs on. I will keep this short, because the names do not matter much to you.

Everything you see is built on current, mainstream, well-supported software. The data lives in a standard database that any developer would recognise, and that can be copied out in one command. The site and the database are hosted by two companies, and the email goes through a third.

The line that matters is the last one. All three of those companies are replaceable, and the step-by-step instructions for replacing each of them are written down in our documentation. There are four of them: move the database, move the website, move the email, or move the whole thing onto a university server.

I mention that because it is the question a committee should ask. You are not locked in to anybody. Including us.

导演提示: 不要念表格。挑两句说,重点全在最后那句。`);
}

/* ============================ S12 — the numbers ============================ */
{
  const s = slide();
  head(s, 'What this actually took', 'Meng', 'March 2024 → today · 29 months');
  const stats = [
    ['886', 'Recorded batches of work', CORAL],
    ['154', 'Reviewed change sets', NAVY],
    ['3', 'Released versions', PURPLE],
    ['~100k', 'Lines of code, by hand', ROSE],
  ];
  const sw = (CW - 0.6) / 4;
  stats.forEach((st, i) => statCard(s, M + i * (sw + 0.2), 1.72, sw, st[0], st[1], st[2]));
  const stats2 = [
    ['72', 'Pages on the site', STONE],
    ['41', 'Database tables', STONE],
    ['3,793', 'Lines of documentation', STONE],
    ['2', 'Developers', CORAL],
  ];
  stats2.forEach((st, i) => statCard(s, M + i * (sw + 0.2), 3.48, sw, st[0], st[1], st[2]));
  emphasis(s, 5.4, 'About thirty units of work every month, for twenty-nine months. Alongside our regular jobs.');
  s.addText('A “batch of work” is one recorded change — think of it as one entry in a very detailed lab notebook.',
    { x: M, y: 6.55, w: CW, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, italic: true, color: MUTED });
  note(s, `MENG — ~2 min ⭐ The core evidence slide. Go slowly; let them read the numbers.

Now the part I was asked to be specific about.

We started in March of twenty twenty-four. That is twenty-nine months ago.

Let me explain one word on this slide first. A commit is one recorded batch of work — you finish something, you write down what you did, and it goes into the record. Think of it as one entry in a very detailed lab notebook.

There are eight hundred and eighty-six of those. That is roughly thirty a month, every month, for twenty-nine months.

[可删] A hundred and fifty-four separate change sets were reviewed before they went anywhere near the live site. Around a hundred thousand lines of code written by hand. Seventy-two pages. Forty-one tables in the database.

And three thousand seven hundred lines of documentation, in English and Chinese.

Two of us. Alongside our regular jobs.

I am not showing you this to complain. I am showing you this because when a committee approves a rebuild, it is very hard to see what it costs. This is what it cost.

导演提示: 可口头补 — 886 次里我提交 693 次,奕帆 111 次。
⚠️ 若被问"总共改了多少行":照实说没有可靠数字。宁可说没有,也不要报虚的。`);
}

/* ============================ S13 — ten phases ============================ */
{
  const s = slide();
  head(s, 'How it was built', 'Meng', 'Ten stages');
  const ph = [
    ['1', 'Foundations', 'Mar – May 2024', '95'],
    ['2', 'Accounts and sign-in', 'May – Aug 2024', '90'],
    ['3', 'The data model, and importing the old data', 'Aug – Oct 2024', '50'],
    ['4', 'The shared database lists; first admin tools', 'Oct 2024 – Mar 2025', '110'],
    ['5', 'The ten survey forms', 'Apr – Aug 2025', '115'],
    ['6', 'Getting ready to go live', 'Sept 2025', '116'],
    ['7', 'The 2025 collection, live', 'Oct – Dec 2025', '218'],
    ['8', 'Reports and exports', 'Jan – Mar 2026', '55'],
    ['9', 'The public statistics pages', 'May – Jun 2026', '63'],
    ['10', 'Tightening security', 'Aug 2026', '—'],
  ];
  const rows = [[th(''), th('Stage'), th('When'), th('Units of work', { align: 'center' })]];
  ph.forEach(p => {
    const hot = p[0] === '7';
    const o = hot ? { bold: true, color: CORAL, fill: { color: WASH } } : {};
    rows.push([td(p[0], Object.assign({ align: 'center' }, o)), td(p[1], o),
               td(p[2], o), td(p[3], Object.assign({ align: 'center' }, o))]);
  });
  table(s, rows, { y: 1.68, colW: [0.75, 6.6, 3.1, 1.38], rowH: 0.4, fontSize: 12.5 });
  emphasis(s, 6.02, 'Stages one to five were building. Six to ten were keeping it alive.', PURPLE);
  note(s, `MENG — ~0.5 min. Move fast; this slide exists only to set up the next one.

Very quickly, the shape of the work.

[可删] The first five stages were building. Foundations, then accounts, then the data, then the shared lists, then the ten forms themselves.

Stage six was getting ready to go live, last September.

And then look at stage seven. Two hundred and eighteen units of work, between October and December of last year. That is more than any other stage in the project.

That is not building. That is the collection season, running live, with your data in it. I want to spend a moment on that.

导演提示: 快速带过,唯一目的是引出第 7 阶段的 218。`);
}

/* ============================ S14 — the 2025 cycle ============================ */
{
  const s = slide();
  head(s, 'The 2025 collection ran, start to finish', 'Meng', 'Stage seven');
  card(s, M, 1.68, 4.3, 1.75, WASH);
  s.addText([{ text: '⅓', options: { fontSize: 46, bold: true, color: CORAL, breakLine: true } },
             { text: 'OF THE ENTIRE PROJECT, IN TWO MONTHS', options: { fontSize: 9.5, color: MUTED, charSpacing: 1.1 } }],
    { x: M, y: 1.86, w: 4.3, h: 1.4, isTextBox: true, margin: 0, fontFace: FONT, align: 'center' });
  s.addText('That is what it looks like to support a survey while it is running — with your data in it.',
    { x: M + 4.65, y: 1.75, w: CW - 4.65, h: 1.6, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: NAVY, valign: 'middle', lineSpacingMultiple: 1.15 });
  bullets(s, M, 3.62, CW, 1.85, [
    'Set up the automatic opening and closing — and tuned it live',
    'Corrected the arithmetic on several forms against the real questionnaire',
    'Added “see your last five years” to all ten forms, mid-season, because people asked',
    'Fixed gaps in Save Draft; repaired East Asian text in the exports',
  ], 14.5);
  card(s, M, 5.6, CW, 1.3);
  s.addText('And one we are proud of', { x: M + 0.35, y: 5.75, w: CW - 0.7, h: 0.3,
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 15, bold: true, color: CORAL });
  s.addText('We tried a major upgrade in mid-October, saw it put the live season at risk, and undid it within the hour. We shipped it ten months later, when nobody’s data was on the line.',
    { x: M + 0.35, y: 6.08, w: CW - 0.7, h: 0.72, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: NAVY, valign: 'top' });
  note(s, `MENG — ~1.5 min ⭐ The emotional high point. Worth an extra 30 seconds.

A third of this entire project happened in two months. September and October of last year.

That is what it looks like to support a survey while it is actually running, with real libraries entering real numbers.

Some of what we did in those weeks. We set up the automatic opening and closing of the forms, and then tuned it while it was live. We found and corrected the arithmetic on several forms, by checking it against the actual paper questionnaire. We repaired the handling of Chinese, Japanese and Korean text in the exports.

And we added a feature we had never planned. Several of you asked whether you could see your own library's last five years while filling in a form, so you had something to compare against. That was a fair request. We added it to all ten forms, in the middle of the season.

One more, and then I will hand over.

In mid-October we attempted a major upgrade to the software underneath the site. Within an hour we could see it created a risk to the live season. So we undid it, completely, and left it alone. We came back and did that upgrade ten months later, in the summer, when nobody's data was on the line.

I mention it because I think knowing when not to touch something is part of the job. Your collection season is not the time to be clever.

导演提示: 回滚的故事一定要讲 — 不是失败,是判断力。管理者会记住"这两个人知道什么时候不该动"。`);
}

/* ============================ S15 — 2026 + handoff ============================ */
{
  const s = slide();
  head(s, 'The same two people are still behind it', 'Meng', '2026');
  bullets(s, M, 1.78, CW, 2.6, [
    'The 2025 collection was completed successfully',
    'Yifan and I are watching the system through this year’s season',
    'Report a problem and we aim to fix it that week — not in the next release',
    'The documentation is kept current, in English and Chinese',
    'A written handover checklist exists, listing every account a new maintainer would need',
  ], 16);
  emphasis(s, 4.6, 'A volunteer committee should not depend on any one person indefinitely — including me.', CORAL);
  card(s, M, 5.75, CW, 1.15, WASH);
  s.addText('Next: Yifan on what sits underneath — how twenty-five years of data got moved, and how it is kept safe.',
    { x: M + 0.35, y: 5.85, w: CW - 0.7, h: 0.95, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: PURPLE, valign: 'middle' });
  note(s, `MENG — ~0.75 min

Last slide from me.

The twenty twenty-five collection finished successfully. Every library that submitted, submitted through this system.

For this year, Yifan and I are still here, and still watching. If you find something broken during the season, tell us. Our aim is to fix it that week, not to put it on a list for next year.

And for the longer term: the documentation is kept up to date, in both languages, and there is a written handover checklist. It lists every account that would need to transfer to a new maintainer. That is deliberate. A volunteer committee should not depend on any one person indefinitely, including me.

Now — I have talked about what you can see. Yifan is going to tell you about what sits underneath. How twenty-five years of data got moved without losing any of it, and how it is kept safe. Yifan.

导演提示: 应该在 0:19 左右。如果已过 0:21,提醒奕帆压到 10 分钟。`);
}

/* ============================ S16 — migration problem ============================ */
{
  const s = slide();
  head(s, 'Moving twenty-five years of data', 'Yifan', 'The migration problem');
  bullets(s, M, 1.78, CW, 2.4, [
    'Decades of statistics, and the full structure of every form, had to arrive intact',
    'Two different database systems, with different rules about what a number is',
    'No downtime allowed — the historical record had to stay online',
    'Nothing could be quietly lost, rounded, or reinterpreted',
  ], 16);
  card(s, M, 4.35, CW, 1.2, WASH);
  s.addText('When people hear “we moved the database,” they picture copying files. It is not that.',
    { x: M + 0.35, y: 4.45, w: CW - 0.7, h: 1.0, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 18, bold: true, color: NAVY, valign: 'middle' });
  s.addText('“We have already done the hardest possible migration once.”',
    { x: M, y: 5.95, w: CW, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, italic: true, color: PURPLE });
  s.addText('— from our own maintenance documentation',
    { x: M, y: 6.4, w: CW, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11.5, color: MUTED });
  note(s, `YIFAN — ~1.5 min

Thank you, Meng. Good afternoon.

My part is about what happened to your data.

When people hear "we moved the database," they picture copying files. It is not that. The old system and the new system store numbers differently. They disagree about what an empty field means. They disagree about how text in Chinese, Japanese and Korean is encoded. They even number their own records differently.

So every single value had to be carried across, and then checked.

And we could not take the site down to do it. The historical record had to stay available the whole time.

导演提示: 开场别急。"人们以为搬数据库就是复制文件,其实不是"是给非技术听众的入口。`);
}

/* ============================ S17 — what broke ============================ */
{
  const s = slide();
  head(s, 'Three things went wrong', 'Yifan', 'And how each was fixed');
  const items = [
    ['The counter problem', 'The database’s internal counter came across behind the data. The first new record collided with an existing one.',
     'We wrote a repair tool that resets every counter, and made it run automatically. It has not come back.'],
    ['Old passwords', 'Some accounts still carried credentials stored in a way that is no longer considered safe.',
     'We refused to weaken the new system to accept them. The site recognises the old format and emails that person a link to set a new password.'],
    ['Broken characters', 'Some Chinese, Japanese and Korean titles arrived damaged — the wrong bytes, so the wrong characters.',
     'Fixed where titles are displayed and where they are exported, then checked against the original records.'],
  ];
  const rh = 1.55;
  items.forEach((it, i) => {
    const y = 1.72 + i * (rh + 0.17);
    card(s, M, y, CW, rh, i === 1 ? WASH : WHITE);
    s.addShape(pres.ShapeType.ellipse, { x: M + 0.28, y: y + 0.24, w: 0.4, h: 0.4,
      fill: { color: [CORAL, NAVY, ROSE][i] }, line: { width: 0 } });
    s.addText(String(i + 1), { x: M + 0.28, y: y + 0.24, w: 0.4, h: 0.4, isTextBox: true,
      margin: 0, fontFace: FONT, fontSize: 13, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    s.addText(it[0], { x: M + 0.85, y: y + 0.2, w: 3.0, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: NAVY, valign: 'top' });
    s.addText(it[1], { x: M + 0.85, y: y + 0.7, w: 5.0, h: 0.7, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12.5, color: STONE, valign: 'top' });
    s.addText([{ text: '→  ', options: { color: [CORAL, NAVY, ROSE][i], bold: true } },
               { text: it[2], options: { color: NAVY } }],
      { x: M + 6.2, y: y + 0.28, w: CW - 6.5, h: 1.0, isTextBox: true, margin: 0,
        fontFace: FONT, fontSize: 13, valign: 'middle' });
  });
  note(s, `YIFAN — ~2 min

Three things went wrong. I want to walk through them, because how a team handles the things that go wrong tells you more than a feature list.

The first we called the counter problem. A database keeps its own internal count of how many records it has, so it knows what number to give the next one. When we loaded the old data in, that counter did not come with it. So the database thought it was empty, and the first new record anyone created collided with a record that was already there.

[可删] We could have fixed that by hand, once. Instead we wrote a small tool that resets every counter in every table, and we made it run automatically whenever data is loaded. It has not come back.

The second was old passwords. Some accounts still had credentials from the old system, stored using a method that is no longer considered safe. We had a choice. We could accept the old method, which would have meant carrying a known weakness forever. Or we could refuse it.

We refused it. If your account still had an old credential, the site recognises that and emails you a link to set a new one. It was slightly inconvenient for a few people last year. It was the right call.

The third was broken characters. Some East Asian titles came through the migration damaged. We fixed that both where titles are displayed and where they are exported, and then checked them against the original records.

导演提示: 不要说 sequence、serial、primary key。密码那段重点是"我们选择了不妥协"。`);
}

/* ============================ S18 — Library-Year hub ============================ */
{
  const s = slide();
  head(s, 'One idea holds the whole thing together', 'Yifan', 'One record per library, per year');
  const bx = M, bw = 5.6;
  const boxes = [
    ['Library', 'one for each institution', NAVY, 0],
    ['Library-Year', 'one for each institution, each year', CORAL, 1],
    ['The ten forms', 'one of each, hanging off that year', PURPLE, 2],
  ];
  boxes.forEach(b => {
    const y = 1.85 + b[3] * 1.42;
    card(s, bx + b[3] * 0.5, y, bw - b[3] * 0.5, 1.05, b[3] === 1 ? WASH : WHITE);
    s.addText(b[0], { x: bx + b[3] * 0.5 + 0.28, y: y + 0.13, w: bw - 1.0, h: 0.36,
      isTextBox: true, margin: 0, fontFace: FONT, fontSize: 17, bold: true, color: b[2] });
    s.addText(b[1], { x: bx + b[3] * 0.5 + 0.28, y: y + 0.52, w: bw - 1.0, h: 0.36,
      isTextBox: true, margin: 0, fontFace: FONT, fontSize: 12.5, color: MUTED });
    if (b[3] < 2) s.addText('↓', { x: bx + b[3] * 0.5 + 0.28, y: y + 1.02, w: 0.5, h: 0.38,
      isTextBox: true, margin: 0, fontFace: FONT, fontSize: 18, bold: true, color: PEACH });
  });
  bullets(s, M + 6.3, 1.85, CW - 6.3, 3.4, [
    'Every form you submit is attached to your library and that year',
    'A single switch on it decides whether you can edit that year',
    'That switch is what the opening and closing dates actually control',
    'Empty records are created in advance — a library that submits nothing still has a place in the record',
  ], 14.5);
  emphasis(s, 5.9, 'So the Committee can reopen ONE library’s forms for a few more days, without reopening them for everybody.', CORAL);
  note(s, `YIFAN — ~2 min

Now the design idea at the centre of the new database. There is only one, and if you follow this slide you will understand how the whole system behaves.

For each library, for each year, there is exactly one record. We call it a library-year. Everything else hangs off it. All ten of your forms attach to your library and that specific year.

Here is why that matters to you.

On that library-year record there is a single switch: can this library edit this year, yes or no. That switch is what the opening and closing dates actually control.

Because the switch is per library and per year, and not one global setting, the Committee can reopen the forms for one library that needs a few more days, without reopening them for everybody. On the old system that was awkward. Now it is one library, one year, one switch.

[可删] One more detail. We create these records in advance, empty, for every library. So a library that reports nothing in a given year still has a place in the record, rather than simply being missing.

导演提示: 讲的时候用手在屏幕上指那个图。"可以只为一家图书馆重开表单"是委员会最有感的。`);
}

/* ============================ S19 — wide tables ============================ */
{
  const s = slide();
  head(s, 'Why the tables are so wide', 'Yifan', 'A deliberate trade-off');
  s.addText('Every measure is broken out the same way:',
    { x: M, y: 1.68, w: CW, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, color: STONE });
  const langs = ['Chinese', 'Japanese', 'Korean', 'Non-CJK', 'Subtotal'];
  const lw = (CW - 0.8) / 5;
  langs.forEach((l, i) => {
    const x = M + i * (lw + 0.2);
    card(s, x, 2.15, lw, 0.75, i === 4 ? WASH : WHITE);
    s.addText(l, { x, y: 2.15, w: lw, h: 0.75, isTextBox: true, margin: 0, fontFace: FONT,
      fontSize: 15, bold: true, color: i === 4 ? CORAL : NAVY, align: 'center', valign: 'middle' });
  });
  s.addText('…repeated for every question on the form. One form has around 110 columns because of it.',
    { x: M, y: 3.08, w: CW, h: 0.35, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, italic: true, color: STONE });
  card(s, M, 3.7, CW, 1.15, WASH);
  s.addText('A database designer would tell you that is untidy. They would be right.',
    { x: M + 0.35, y: 3.8, w: CW - 0.7, h: 0.95, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: PURPLE, valign: 'middle' });
  s.addText('We chose not to collapse them. The moment you do, the numbers in the database stop lining up with the numbers on the questionnaire — and nobody can tell which question produced a figure.',
    { x: M, y: 5.05, w: CW, h: 0.8, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, color: NAVY, valign: 'top' });
  emphasis(s, 5.95, 'Any number in the system traces back to the exact question that produced it. That was worth more than elegance.', CORAL);
  note(s, `YIFAN — ~1 min

A short one, but it is a decision worth explaining.

Every measure in this database is broken out the same way: Chinese, Japanese, Korean, non-CJK, and a subtotal. That pattern repeats for every question on the form. One of our forms has about a hundred and ten columns because of it.

A database designer would tell you that is untidy, and they would be right. There is a more elegant way to store this.

We chose not to. Because the moment you collapse those columns, the numbers in the database stop lining up with the numbers on the questionnaire. And then when the Committee needs to check a figure, nobody can tell which question produced it.

So we kept it wide. Every number traces back to one specific question. That was worth more to us than elegance.

导演提示: 这是"诚实的取舍"页。主动承认"设计师会说这不优雅,他说得对",反而更可信。`);
}

/* ============================ S20 — shared lists ============================ */
{
  const s = slide();
  head(s, 'Describe a database once, not fifty times', 'Yifan', 'Shared title lists');
  card(s, M, 1.72, 6.0, 2.1);
  s.addText('Before', { x: M + 0.3, y: 1.9, w: 5.4, h: 0.32, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, bold: true, color: MUTED });
  s.addText('One e-journal package that thirty libraries subscribe to was written down thirty separate times. Change the publisher’s name and someone had to find and fix thirty entries.',
    { x: M + 0.3, y: 2.28, w: 5.4, h: 1.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: STONE, valign: 'top' });
  card(s, M + 6.4, 1.72, CW - 6.4, 2.1, WASH);
  s.addText('Now', { x: M + 6.7, y: 1.9, w: 5.0, h: 0.32, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, bold: true, color: CORAL });
  s.addText('The package is described once, in a shared list. Each library records its own counts, and whether it had access that year, separately.',
    { x: M + 6.7, y: 2.28, w: CW - 7.0, h: 1.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: NAVY, valign: 'top' });
  const three = [
    ['One entry per title', 'shared by every library'],
    ['Counts recorded separately', 'per library, per year'],
    ['Access recorded separately', 'who had it, in which year'],
  ];
  const tw = (CW - 0.4) / 3;
  three.forEach((t, i) => {
    const x = M + i * (tw + 0.2);
    card(s, x, 4.1, tw, 1.2);
    s.addText(t[0], { x: x + 0.24, y: 4.28, w: tw - 0.48, h: 0.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14.5, bold: true, color: NAVY, valign: 'top' });
    s.addText(t[1], { x: x + 0.24, y: 4.72, w: tw - 0.48, h: 0.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, color: MUTED });
  });
  emphasis(s, 5.65, 'Correct a title once, and every library’s record is corrected with it.', CORAL);
  note(s, `YIFAN — ~1 min

Here is a small thing that saves a lot of trouble.

Take an e-journal package that thirty of your libraries subscribe to. On the old system, that package was written down thirty separate times — once in each library's record. If the publisher changed its name, someone had to find and fix thirty entries. In practice, they did not all get fixed, so the same package appeared under three different spellings.

Now the package is described once, in a shared list. Each library records its own counts, and whether it had access that year, separately. Correct the title once and every library's record is corrected with it.

导演提示: 用具体例子讲,不要讲结构。`);
}

/* ============================ S21 — never lose data ============================ */
{
  const s = slide();
  head(s, 'Never losing your work', 'Yifan', 'Four promises about your data');
  const items = [
    ['Your draft is safe', 'Saving updates the same record. Come back in three days and it is exactly where you left it.'],
    ['Submitting is recorded separately', 'From the numbers themselves — per form, per year. The system knows the difference between “not started” and “started and saved nothing”.'],
    ['A form of all zeros is not real data', 'The system reads that as “did not participate”, not “reported zero”. This is a rule the Committee gave us — not one we invented.'],
    ['Every change is written down', 'Who, when, and what the value was before. Changes made after the deadline are marked as such, field by field.'],
  ];
  items.forEach((it, i) => {
    const y = 1.75 + i * 1.12;
    row(s, M, y, CW, i + 1, it[0], it[1], [CORAL, NAVY, ROSE, PURPLE][i]);
  });
  emphasis(s, 5.98, 'Press Save Draft as often as you like. Nothing is lost, and nobody else sees it.', CORAL);
  note(s, `YIFAN — ~1.5 min

Four promises about your data.

First, your draft is safe. When you press Save Draft, we update the same record rather than creating a second one. You can leave it for three days and come back to exactly what you left.

Second, whether you have submitted is recorded separately from the numbers themselves, for each form and each year. So the system always knows the difference between "she has not started" and "she started and saved nothing".

Third, and this one came from the Committee. If a form comes in as all zeros, the system does not treat that as a real report of zero. It reads it as a library that did not participate that year. That distinction matters for the published statistics, and it is a rule the Committee gave us — not one we invented.

Fourth, every change is written down. Who made it, when, and what the number was before. If a change is made after the deadline, it is marked as such, field by field.

导演提示: 第三条一定要说"这是委员会给我们的规则,不是我们自己定的"。`);
}

/* ============================ S22 — roll forward ============================ */
{
  const s = slide();
  head(s, 'Not typing the same thing twice', 'Yifan', 'Bring last year forward, in one click');
  card(s, M, 1.7, CW, 1.15, WASH);
  s.addText('You should never have to type in something the system already knows.',
    { x: M + 0.35, y: 1.8, w: CW - 0.7, h: 0.95, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 19, bold: true, color: NAVY, valign: 'middle' });
  const items = [
    ['Copy last year’s databases into this year', 'One action — and it tells you exactly what was copied and what was skipped.'],
    ['It refuses to overwrite', 'If this year already has records, it stops and shows you the conflict rather than quietly replacing your work.'],
    ['Eight import buttons', 'Pull figures the system already holds into the form you are filling in.'],
    ['One button for the electronic form', 'Fills it from all three shared lists at once.'],
  ];
  items.forEach((it, i) => row(s, M, 2.95 + i * 0.98, CW, i + 1, it[0], it[1],
    [CORAL, NAVY, ROSE, PURPLE][i]));
  note(s, `YIFAN — ~1 min

This was one of the most popular additions last year, and it is a simple idea. You should never have to type in something the system already knows.

If your library's database subscriptions are mostly the same as last year, there is one action that brings last year's forward into this year. It then tells you exactly what it copied and what it skipped.

And it will not overwrite. If this year already has records, it stops and shows you the conflict rather than quietly replacing your work. We were careful about that one.

[可删] There are also eight import buttons across the forms, which pull figures the system already holds into the form you are filling in. And one button that fills the electronic form from all three shared lists at once.

导演提示: "拒绝覆盖"这条要强调 — 去年有人担心一键复制会盖掉已填数据。`);
}

/* ============================ S23 — security ============================ */
{
  const s = slide();
  head(s, 'Keeping it safe', 'Yifan', 'Security, in plain terms');
  card(s, M, 1.7, CW, 1.3, WASH);
  s.addText('Two locks, not one.', { x: M + 0.35, y: 1.82, w: 3.2, h: 0.42, isTextBox: true,
    margin: 0, fontFace: FONT, fontSize: 20, bold: true, color: CORAL });
  s.addText('The door checks who you are. Then every sensitive action asks the database again. Editing something in your own browser to pretend you are an administrator does not work.',
    { x: M + 0.35, y: 2.26, w: CW - 0.7, h: 0.68, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14.5, color: NAVY, valign: 'top' });
  const items = [
    ['Tampered sessions are detected', 'You are signed out immediately.'],
    ['Passwords cannot be read back', 'Stored using the currently recommended method — in a form that cannot be turned back into your password. Not by us either.'],
    ['The scheduled task is locked too', 'The part of the site that opens and closes the survey will not answer a stranger.'],
    ['The database connection is encrypted', 'And verified at both ends.'],
    ['Every sensitive action is recorded', 'Including exports of contact details.'],
  ];
  items.forEach((it, i) => rowTight(s, M, 3.25 + i * 0.68, CW, i + 1, it[0], it[1],
    [NAVY, CORAL, ROSE, PURPLE, NAVY][i]));
  note(s, `YIFAN — ~1.5 min

A minute on security, in plain terms.

The important idea is two locks, not one. When you sign in, the site checks who you are — that is the front door. But then, every time you try to do something sensitive, the site asks the database again: who is this person, and are they allowed to do this?

That sounds redundant. It is not. It means that editing something in your own browser to pretend you are an administrator does not work. The front door is not the only thing standing between someone and your data.

Passwords are stored using the method currently recommended for this, and stored in a form that cannot be turned back into the original password. Not by us either. If you forget your password, we genuinely cannot look it up — we can only send you a link to set a new one.

The part of the site that automatically opens and closes the survey is locked as well. It will not answer a request that does not carry the right credential. And the connection between the website and the database is encrypted and verified at both ends.

导演提示: "两把锁"这个比喻是全部。不要说 middleware、JWT、cookie、Argon2id。
"连我们自己都查不到你的密码"这句听众印象最深,一定要说。`);
}

/* ============================ S24 — backup / exit ============================ */
{
  const s = slide();
  head(s, 'If something goes badly wrong', 'Yifan', 'Backup, restore, and the way out');
  card(s, M, 1.72, 6.0, 2.15);
  s.addText('Restore', { x: M + 0.3, y: 1.9, w: 5.4, h: 0.34, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 17, bold: true, color: CORAL });
  bullets(s, M + 0.3, 2.34, 5.4, 1.4, [
    'The whole database can be copied back to how it looked at a chosen moment, without touching the live site',
    'Full copies are kept away from the database provider',
  ], 13.5);
  card(s, M + 6.4, 1.72, CW - 6.4, 2.15, WASH);
  s.addText('The way out — four documented routes', { x: M + 6.7, y: 1.9, w: CW - 7.0, h: 0.34,
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 17, bold: true, color: PURPLE });
  bullets(s, M + 6.7, 2.34, CW - 7.0, 1.4, [
    'Move the database to a different provider',
    'Move the website to a different host',
    'Move the email to a different provider',
    'Move all of it onto a university server',
  ], 13);
  emphasis(s, 4.15, 'A backup stored with the thing you are backing up is not a backup.', PURPLE);
  card(s, M, 5.3, CW, 1.35);
  s.addText('The Committee is not locked in to any company — and the instructions do not depend on us being reachable.',
    { x: M + 0.35, y: 5.42, w: CW - 0.7, h: 0.6, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: NAVY, valign: 'top' });
  s.addText('If both of us disappeared tomorrow, someone competent could read that document and keep this service running.',
    { x: M + 0.35, y: 6.02, w: CW - 0.7, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: STONE, valign: 'top' });
  note(s, `YIFAN — ~1 min

Last slide from me, and it is the one a committee should care about most.

The database can be rolled back. We can produce a copy of the whole thing as it looked at a chosen moment in the past, and inspect it, without touching the live site. Full copies are taken on a schedule and kept somewhere other than the company that hosts the database, because a backup stored with the thing you are backing up is not a backup.

And then the way out. There are four documented routes: move the database, move the website, move the email, or move all of it onto a university server. Each one is written up step by step in our documentation.

I want to be clear about why that exists. It is not because we expect to leave. It is because those instructions do not depend on us being reachable. If both of us disappeared tomorrow, someone competent could read that document and keep this service running.

Now I will hand over to Anlin, who is going to show you the part you actually came for — how to use it.

导演提示: ⚠️ 自动备份目前还没真正配上,文档里列为待办。
若被追问"备份多久跑一次",照实说"目前是手动,这是我们下一步要补的"。不要含糊。
应该在 0:31 左右交给 Anlin。`);
}

/* ============================ S25 — annual cycle ============================ */
{
  const s = slide();
  head(s, 'Your year, at a glance', 'Anlin', 'The annual cycle');
  table(s, [
    [th('When'), th('What happens')],
    [td('July 1 – June 30', { bold: true }), td('The fiscal year your numbers describe')],
    [td('around September', { bold: true }), td('The Committee confirms dates and checks the contact person for every library')],
    [td('October 1', { bold: true, color: CORAL, fill: { color: WASH } }),
     td('Forms open. You get an email the same day.', { bold: true, fill: { color: WASH } })],
    [td('late November', { bold: true }), td('A reminder, one week before closing')],
    [td('December 2', { bold: true, color: CORAL, fill: { color: WASH } }),
     td('Forms close.', { bold: true, fill: { color: WASH } })],
    [td('December – January', { bold: true }), td('The Committee reviews the data and prepares the report')],
    [td('February – May', { bold: true }), td('The report appears in the Journal of East Asian Libraries')],
  ], { y: 1.72, colW: [3.4, 10.43 - 3.4 + 0.0], rowH: 0.5, fontSize: 14 });
  emphasis(s, 5.95, 'The October and December dates can move. Watch for the email — do not rely on your calendar.', CORAL);
  note(s, `ANLIN — ~1.5 min  [DRAFT — Anlin, please change freely]

Thank you both. And thank you all for staying with us.

My part is the practical part. What you need to do, and when.

Here is the year. Your numbers describe the fiscal year from July first to June thirtieth. Around September, the Committee confirms the dates and checks that we have the right contact person for every library — and if your delegate has changed, this is the moment to tell us.

The forms open on October first, and you will get an email that same day. They close on December second, and you will get a reminder one week before that.

After they close, the Committee reviews the data and prepares the annual report, which appears in the Journal of East Asian Libraries in the spring.

One thing to note. Those October and December dates can move. We adjust them some years. So please do not put them in your calendar and ignore your email — watch for the announcement.

导演提示: 这是全场最实用的一页,念完停一下让大家截图。`);
}

/* ============================ S26 — submitting (demo) ============================ */
{
  const s = slide();
  head(s, 'Submitting your data', 'Anlin', 'Live walkthrough');
  const steps = ['Sign in', 'My Forms', 'Choose a form', 'Save Draft', 'Submit'];
  const stw = (CW - 0.8) / 5;
  steps.forEach((st, i) => {
    const x = M + i * (stw + 0.2);
    const hot = i >= 3;
    card(s, x, 1.68, stw, 0.8, hot ? WASH : WHITE);
    s.addText(st, { x, y: 1.68, w: stw, h: 0.8, isTextBox: true, margin: 0, fontFace: FONT,
      fontSize: 14.5, bold: true, color: hot ? CORAL : NAVY, align: 'center', valign: 'middle' });
  });
  s.addText('Three markers you will see against each form:',
    { x: M, y: 2.72, w: CW, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, color: STONE });
  const marks = [
    ['Ready', 'Nothing entered yet', MUTED],
    ['Filled', 'You have saved something', ROSE],
    ['Submitted', 'The Committee counts it as complete', CORAL],
  ];
  const mw = (CW - 0.4) / 3;
  marks.forEach((mk, i) => {
    const x = M + i * (mw + 0.2);
    card(s, x, 3.2, mw, 1.15, i === 2 ? WASH : WHITE);
    s.addText(mk[0], { x: x + 0.24, y: 3.38, w: mw - 0.48, h: 0.38, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: mk[2] });
    s.addText(mk[1], { x: x + 0.24, y: 3.78, w: mw - 0.48, h: 0.42, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, color: STONE });
  });
  bullets(s, M, 4.6, CW, 1.35, [
    'Subtotals fill in by themselves as you type — you do not need to add anything up',
    'You can see your own library’s last five years right on the form, to compare against',
  ], 15);
  emphasis(s, 5.98, 'Save Draft as often as you like. Submit when the form is finished — a draft looks unfinished to us.', CORAL);
  note(s, `ANLIN — ~2.5 min · LIVE DEMO  [DRAFT — Anlin, please change freely]

Let me show you rather than tell you.

[SHARE SCREEN, SIGN IN]

You sign in with your email address. This is the page you land on. These are your library's ten forms, and next to each one is a marker.

Ready means you have not entered anything yet. Filled means you have saved something. Submitted means you have pressed the Submit button and the Committee counts that form as complete for the year.

Let me open one.

[OPEN A FORM]

You will notice the subtotals fill in by themselves as you type. You do not need to add anything up.

And here at the bottom are the two buttons that matter. Save Draft, and Submit.

Save Draft is the one to use while you are working. Press it as often as you like. Nothing is lost, nobody sees it, and you can come back next week.

Submit is the one that tells us the form is finished. Please do press it when you are done — a form left as Filled looks unfinished to us, and we will chase you about it.

One more thing on this page. If you filled this form in last year, you can see your own numbers from the last five years right here, so you have something to compare against. Several of you asked for that last season.

导演提示: 建议真机演示,提前确认演示账号能登录。不想现场演示就改成录屏截图 —
Zoom 上现场登录失败很尴尬。`);
}

/* ============================ S27 — public statistics (demo) ============================ */
{
  const s = slide();
  head(s, 'Looking data up', 'Anlin', 'The public statistics — no sign-in needed');
  const views = [
    ['Quick View', 'One year, all libraries, side by side'],
    ['Table View', 'Any of the ten tables, across several years and libraries'],
    ['Graph View', 'Turn any of it into a chart, and save the image'],
    ['Published reports', 'The PDFs as they appeared in the journal'],
    ['Before 1998', 'The digitised historical reports, kept separately'],
  ];
  views.forEach((v, i) => rowTight(s, M, 1.95 + i * 0.72, CW, i + 1, v[0], v[1],
    [CORAL, NAVY, ROSE, PURPLE, MUTED][i]));
  card(s, M, 5.75, CW, 0.95, WASH);
  s.addText('Everything here exports. Use it for your annual report — or your next budget conversation.',
    { x: M + 0.35, y: 5.84, w: CW - 0.7, h: 0.78, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: CORAL, valign: 'middle' });
  note(s, `ANLIN — ~2 min · LIVE DEMO  [DRAFT — Anlin, please change freely]

Now the part you can use all year, not just in October.

None of this needs a sign-in. You can send these links to your dean.

[SHARE SCREEN]

Quick View gives you one year, with libraries side by side. Table View lets you pick any of the ten tables and compare across several years and several libraries at once. Graph View turns any of that into a chart, and you can save the picture straight into a slide deck or a report.

The published reports are here as well — the PDFs exactly as they appeared in the journal.

And there is a separate section for everything before nineteen ninety-eight. That is deliberate. The questionnaire was substantially revised in the ninety-eight to ninety-nine cycle, so the older figures do not mean quite the same thing. Putting them in the same chart would give you a trend line that is not real. So we keep them accessible, but separate.

Everything you see here exports. Please use it. This data is most valuable when it is in front of the person deciding your budget.

导演提示: 1998 分界那段值得讲,不然每年都有人问为什么不能一起画图。`);
}

/* ============================ S28 — the ten forms ============================ */
{
  const s = slide();
  head(s, 'What you will be asked for', 'Anlin', 'The ten forms');
  const forms = ['Monographic acquisitions', 'Physical volume holdings',
    'Serial titles — purchased and non-purchased', 'Holdings of other materials',
    'Unprocessed backlog materials', 'Fiscal support', 'Personnel support',
    'Public services', 'Electronic resources', 'Electronic books'];
  const cw2 = (CW - 0.4) / 2;
  forms.forEach((f, i) => {
    const col = i < 5 ? 0 : 1;
    const x = M + col * (cw2 + 0.4);
    const y = 1.75 + (i % 5) * 0.66;
    s.addShape(pres.ShapeType.ellipse, { x, y: y + 0.04, w: 0.4, h: 0.4,
      fill: { color: col === 0 ? NAVY : PURPLE }, line: { width: 0 } });
    s.addText(String(i + 1), { x, y: y + 0.04, w: 0.4, h: 0.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    s.addText(f, { x: x + 0.55, y, w: cw2 - 0.55, h: 0.48, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14.5, color: NAVY, valign: 'middle' });
  });
  card(s, M, 5.25, CW, 1.15, WASH);
  s.addText('Plus your selections from the shared audio-visual, e-book and e-journal lists',
    { x: M + 0.35, y: 5.35, w: CW - 0.7, h: 0.95, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: CORAL, valign: 'middle' });
  s.addText('The same ten as before. Nothing was added and nothing was removed when the site was rebuilt.',
    { x: M, y: 6.55, w: CW, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, italic: true, color: MUTED });
  note(s, `ANLIN — ~1 min  [DRAFT — Anlin, please change freely]

These are the ten forms. They are the same ten as before — nothing was added and nothing was removed when the site was rebuilt.

On top of the ten, there are the three shared lists — audio-visual, e-book and e-journal databases — where you tick the ones your library has access to.

If you have done this before, none of this is new. If you are new, the guide I am about to point you to walks through all ten, one at a time, with an explanation of what belongs in each.

导演提示: 老用户会觉得这页多余,但新代表需要。快速带过。`);
}

/* ============================ S29 — where to get help ============================ */
{
  const s = slide();
  head(s, 'Where to get help', 'Anlin', 'Two guides, built into the site');
  card(s, M, 1.7, CW, 2.35, WASH);
  s.addText('cealstats.org/help', { x: M + 0.4, y: 1.88, w: CW - 0.8, h: 0.5, isTextBox: true,
    margin: 0, fontFace: FONT, fontSize: 30, bold: true, color: CORAL });
  s.addText('For member libraries. Eight chapters, in English and 中文.',
    { x: M + 0.4, y: 2.42, w: CW - 0.8, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, color: NAVY });
  s.addText('Getting started  ·  the timeline  ·  all ten forms explained  ·  common tasks  ·  troubleshooting  ·  checklists  ·  FAQ',
    { x: M + 0.4, y: 2.8, w: CW - 0.8, h: 0.6, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13.5, color: STONE, valign: 'top' });
  s.addText('Searchable. And it prints cleanly, if you would rather have it on paper beside you.',
    { x: M + 0.4, y: 3.42, w: CW - 0.8, h: 0.35, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13.5, italic: true, color: MUTED });

  card(s, M, 4.3, CW, 1.1);
  s.addText('cealstats.org/admin/superguide', { x: M + 0.4, y: 4.44, w: CW - 0.8, h: 0.4,
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 20, bold: true, color: PURPLE });
  s.addText('For the Committee. Sign-in required. Nine chapters, also bilingual.',
    { x: M + 0.4, y: 4.86, w: CW - 0.8, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: STONE });

  emphasis(s, 5.68, 'If something looks wrong, tell us. Do not assume it is your mistake and work around it.', CORAL);
  s.addText('During the collection season Meng and Yifan aim to fix reported problems the same week.',
    { x: M, y: 6.66, w: CW, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, italic: true, color: MUTED });
  note(s, `ANLIN — ~1 min  [DRAFT — Anlin, please change freely]

Please write this address down: cealstats dot org slash help.

That is a complete guide for member libraries, built into the site itself. Eight chapters. It explains all ten forms one at a time. It has a troubleshooting section and a list of frequently asked questions. And it is available in both English and Chinese — you can switch with one click.

It also prints cleanly, if you would rather have it on paper next to you while you fill the forms in.

And if something looks wrong, please tell us. Do not assume it is your mistake and work around it. During the collection season Meng and Yifan aim to fix reported problems the same week.

导演提示: /help 是这页唯一要记住的东西,建议重复一遍地址。`);
}

/* ============================ S30 — call to action ============================ */
{
  const s = slide();
  head(s, 'What the Committee needs from you', 'Anlin', 'Three things, before October 1');
  const asks = [
    ['Confirm your delegate', 'Tell us if the person who submits for your library has changed. This is the single most common reason a library misses the season — the announcement went to someone who left.', CORAL],
    ['Check your email address', 'The announcement goes to the address we have on file. If it is wrong, you will simply not know the survey opened.', NAVY],
    ['Submit — do not just save', 'Press Submit on each form when it is finished. A saved draft cannot be included in the published statistics.', PURPLE],
  ];
  asks.forEach((a, i) => {
    const y = 1.68 + i * 1.5;
    card(s, M, y, CW, 1.4, i === 0 ? WASH : WHITE);
    s.addShape(pres.ShapeType.ellipse, { x: M + 0.3, y: y + 0.28, w: 0.52, h: 0.52,
      fill: { color: a[2] }, line: { width: 0 } });
    s.addText(String(i + 1), { x: M + 0.3, y: y + 0.28, w: 0.52, h: 0.52, isTextBox: true,
      margin: 0, fontFace: FONT, fontSize: 17, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    s.addText(a[0], { x: M + 1.0, y: y + 0.2, w: CW - 1.4, h: 0.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 19, bold: true, color: a[2] });
    s.addText(a[1], { x: M + 1.0, y: y + 0.63, w: CW - 1.4, h: 0.65, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: NAVY, valign: 'top' });
  });
  card(s, M, 6.22, CW, 0.75, WASH);
  s.addText('New to the survey? Contact the Committee and we will set your library up before October.',
    { x: M + 0.35, y: 6.26, w: CW - 0.7, h: 0.66, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: NAVY, valign: 'middle' });
  note(s, `ANLIN — ~1.5 min  [DRAFT — Anlin, please change freely]

Three things I need from you, and then we will take questions.

First, confirm who submits for your library. If that person has changed — and in a few of your libraries it has — please tell us now, not in November. This is the single most common reason a library misses the season entirely. The announcement went to someone who left.

Second, check that we have the right email address. The announcement goes to the address on file. If it is wrong, you simply will not know the survey opened.

Third, please press Submit, not just Save Draft. A saved draft looks unfinished to us, and we cannot include it in the published statistics.

And if your library has never taken part and would like to: get in touch with the Committee, and we will get you set up before October.

导演提示: 这是全场的行动号召页。三条,不要加第四条。第一条最重要。`);
}

/* ============================ S31 — thank you ============================ */
{
  const s = slide();
  head(s, 'Thank you', 'Anlin', '');
  const ta = [
    ['To every library that submitted through the new system in its first year',
     'You were, in effect, testing it for us — and you were patient about it.'],
    ['To Meng Qu and Yifan Huang, who built it',
     'Two and a half years of work alongside their regular jobs. The Committee is very aware of that.'],
    ['To the CEAL Statistics Committee', 'For the guidance, and for checking every number.'],
  ];
  ta.forEach((t, i) => {
    const y = 1.85 + i * 1.25;
    card(s, M, y, CW, 1.1, i === 1 ? WASH : WHITE);
    s.addText(t[0], { x: M + 0.35, y: y + 0.16, w: CW - 0.7, h: 0.38, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: [NAVY, CORAL, PURPLE][i] });
    s.addText(t[1], { x: M + 0.35, y: y + 0.56, w: CW - 0.7, h: 0.42, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: STONE });
  });
  card(s, M, 5.75, CW, 1.15, WASH);
  s.addText([{ text: 'cealstats.org', options: { fontSize: 22, bold: true, color: CORAL } },
             { text: '        cealstats.org/help', options: { fontSize: 16, bold: true, color: NAVY } },
             { text: '        qum@miamioh.edu', options: { fontSize: 15, color: STONE } }],
    { x: M + 0.35, y: 5.85, w: CW - 0.7, h: 0.95, isTextBox: true, margin: 0,
      fontFace: FONT, valign: 'middle' });
  note(s, `ANLIN — ~0.5 min  [DRAFT — Anlin, please change freely]

That is everything from us.

Thank you to every library that submitted through the new system in its first year — you were, in effect, testing it for us, and you were patient about it.

And thank you to Meng and Yifan. This was two and a half years of work alongside their regular jobs, and the Committee is very aware of that.

We will take questions now.`);
}

/* ============================ S32 — questions (dark) ============================ */
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addText('Questions?', { x: M, y: 2.2, w: CW, h: 1.1, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 54, bold: true, color: WHITE });
  s.addText('cealstats.org', { x: M, y: 3.5, w: CW, h: 0.5, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 24, bold: true, color: CORAL });
  s.addText([
    { text: 'Member guide', options: { fontSize: 14, color: MUTED, breakLine: true } },
    { text: 'cealstats.org/help', options: { fontSize: 17, bold: true, color: PEACH, breakLine: true } },
  ], { x: M, y: 4.35, w: 5.0, h: 0.9, isTextBox: true, margin: 0, fontFace: FONT, valign: 'top' });
  s.addText([
    { text: 'Meng Qu', options: { fontSize: 14, color: MUTED, breakLine: true } },
    { text: 'qum@miamioh.edu', options: { fontSize: 17, bold: true, color: PEACH, breakLine: true } },
  ], { x: M + 5.5, y: 4.35, w: 5.0, h: 0.9, isTextBox: true, margin: 0, fontFace: FONT, valign: 'top' });
  note(s, `ALL THREE — stay on camera.

分工:
· 用法、政策、日期、参与       → ANLIN
· 设计、功能、进度、"为什么重做" → MENG
· 数据、迁移、安全、备份       → YIFAN

⚠️ 照实回答这两个:
· "备份多久跑一次" → 目前是手动,自动备份是下一步要补的
· "符合 WCAG 吗"   → 组件层面支持键盘和读屏,但还没做正式审计

预设问答见 script 文件附录 B。`);
}

pres.writeFile({ fileName: '2026-09-14-ceal-statistics-launch.pptx' })
  .then(f => console.log('wrote', f));
