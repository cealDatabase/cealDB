const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';            // 10 x 5.625 in — matches Anlin's deck exactly
pres.author = 'CEAL Statistics Committee';
pres.title  = 'CEAL Statistics Database — Parts 1 & 2';

// ---- Anlin's theme, read out of her file (ppt/theme/theme1.xml + slide overrides) ----
const BG     = 'FFFFF0';  // lt1  ivory — her slide background
const INK    = '1D1D1D';  // dk1  near-black body text
const GREEN  = '51BD85';  // dk2
const CORAL  = 'FF6652';  // lt2  her strongest accent
const YELLOW = 'FFE534';  // accent1
const PINK   = 'FFBBDC';  // accent2
const CYAN   = '6AD2E6';  // accent3
const TAN    = 'DBC89F';  // accent4  — borders
const MINT   = 'D8E4D6';  // accent5  — card fills
const WHITE  = 'FFFFFF';  // accent6
const MUTED  = '76766B';  // derived warm grey for captions (no muted tone in her scheme)

const FONT  = 'Lexend';            // her slides override the theme's Arial with this
const FONTB = 'Lexend SemiBold';

const M = 0.5;                      // side margin
const CW = 10 - M * 2;              // 9.0 content width

function slide(){ const s = pres.addSlide(); s.background = { color: BG }; return s; }

function head(s, title, speaker, kicker){
  if (kicker) s.addText(kicker.toUpperCase(), {
    x: M, y: 0.30, w: CW - 1.5, h: 0.20, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 8.5, bold: true, color: GREEN, charSpacing: 1.2 });
  s.addText(title, {
    x: M, y: kicker ? 0.50 : 0.38, w: CW - 1.5, h: 0.62, isTextBox: true, margin: 0,
    fontFace: FONTB, fontSize: 25, bold: true, color: INK, valign: 'top' });
  if (speaker) s.addText(speaker, {
    x: 10 - M - 1.35, y: kicker ? 0.31 : 0.45, w: 1.35, h: 0.24, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 8.5, color: MUTED, align: 'right' });
}

function card(s, x, y, w, h, fill){
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06, fill: { color: fill || WHITE },
    line: { color: TAN, width: 0.75 } });
}

function statCard(s, x, y, w, figure, label, color){
  card(s, x, y, w, 1.08);
  s.addText(String(figure), { x, y: y + 0.10, w, h: 0.56, isTextBox: true, margin: 0,
    fontFace: FONTB, fontSize: 28, bold: true, color: color || INK, align: 'center' });
  s.addText(String(label).toUpperCase(), { x, y: y + 0.68, w, h: 0.30, isTextBox: true,
    margin: 0, fontFace: FONT, fontSize: 7.5, color: MUTED, align: 'center', charSpacing: 1 });
}

function row(s, x, y, w, n, heading, body, color){
  const d = 0.30;
  s.addShape(pres.ShapeType.ellipse, { x, y: y + 0.015, w: d, h: d,
    fill: { color: color || CORAL }, line: { width: 0 } });
  s.addText(String(n), { x, y: y + 0.015, w: d, h: d, isTextBox: true, margin: 0,
    fontFace: FONTB, fontSize: 10, bold: true, color: WHITE, align: 'center', valign: 'middle' });
  s.addText(heading, { x: x + d + 0.16, y, w: w - d - 0.16, h: 0.24, isTextBox: true,
    margin: 0, fontFace: FONTB, fontSize: 12.5, bold: true, color: INK });
  if (body) s.addText(body, { x: x + d + 0.16, y: y + 0.25, w: w - d - 0.16, h: 0.46,
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 10, color: INK, valign: 'top' });
}

function rowTight(s, x, y, w, n, heading, body, color){
  const d = 0.26;
  s.addShape(pres.ShapeType.ellipse, { x, y: y + 0.015, w: d, h: d,
    fill: { color: color || CORAL }, line: { width: 0 } });
  s.addText(String(n), { x, y: y + 0.015, w: d, h: d, isTextBox: true, margin: 0,
    fontFace: FONTB, fontSize: 9, bold: true, color: WHITE, align: 'center', valign: 'middle' });
  s.addText([{ text: heading + '  ', options: { bold: true, color: INK, fontFace: FONTB } },
             { text: body || '', options: { color: INK, fontFace: FONT } }],
    { x: x + d + 0.14, y, w: w - d - 0.14, h: 0.44, isTextBox: true, margin: 0,
      fontSize: 10, valign: 'top' });
}

function bullets(s, x, y, w, h, items, size){
  s.addText(items.map((t, i) => ({
    text: t, options: { bullet: { indent: 12 }, breakLine: i !== items.length - 1 } })), {
    x, y, w, h, isTextBox: true, margin: 0, fontFace: FONT,
    fontSize: size || 11, color: INK, paraSpaceAfter: 6, valign: 'top' });
}

function table(s, rows, opts){
  s.addTable(rows, Object.assign({
    x: M, y: 1.22, w: CW, fontFace: FONT, fontSize: 10, color: INK,
    border: { type: 'solid', color: TAN, pt: 0.5 }, valign: 'middle',
    autoPage: false }, opts || {}));
}
function th(t, o){ return { text: t, options: Object.assign(
  { bold: true, color: BG, fill: { color: INK }, fontSize: 9.5, fontFace: FONTB }, o || {}) }; }
function td(t, o){ return { text: t, options: Object.assign({}, o || {}) }; }
function dot(){ return { text: '●', options: { align: 'center', color: CORAL, bold: true } }; }
function nodot(){ return { text: '', options: {} }; }

function emphasis(s, y, text, color){
  card(s, M, y, CW, 0.62, MINT);
  s.addText(text, { x: M + 0.20, y: y + 0.04, w: CW - 0.40, h: 0.54, isTextBox: true,
    margin: 0, fontFace: FONTB, fontSize: 11.5, bold: true, color: color || INK, valign: 'middle' });
}

// section divider, mirroring her "Part 3: Using the Database" slide
function divider(s, part, title, sub){
  s.background = { color: INK };
  s.addText(part, { x: M, y: 1.55, w: CW, h: 0.42, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, color: YELLOW });
  s.addText(title, { x: M, y: 1.98, w: CW, h: 0.85, isTextBox: true, margin: 0,
    fontFace: FONTB, fontSize: 34, bold: true, color: BG });
  if (sub) s.addText(sub, { x: M, y: 3.00, w: CW - 1.5, h: 0.5, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11.5, color: MINT });
}

function note(s, txt){ s.addNotes(txt); }

/* ===== Part 1 divider ===== */
{
  const s = pres.addSlide();
  divider(s, 'Part 1', 'Building the New Database',
    'Why we rebuilt it, what changed, and what the work actually took.');
  note(s, `MENG — 分隔页,一句话带过。\n\n"Anlin 已经讲了为什么要换。接下来我说说我们怎么做的。"\n\n导演提示: 这一页对应 Anlin 大纲页(她的第 3 页)里 Part 1 那一行。`);
}

/* ===== S2 What we are talking about ===== */
{
  const s = slide();
  head(s, 'What we are talking about', 'Meng', 'The service');
  bullets(s, M, 1.25, 5.0, 1.5, [
    'The official annual statistics platform of the Council on East Asian Libraries',
    'Around 50 North American libraries submit data every year',
    'Results are published in the Journal of East Asian Libraries',
  ], 11);
  statCard(s, 5.75, 1.25, 1.0, '~50', 'Libraries', CORAL);
  statCard(s, 6.90, 1.25, 1.0, '1869', 'Earliest', GREEN);
  statCard(s, 8.05, 1.25, 0.95, '1999', 'Online', CYAN);
  card(s, 5.75, 2.55, 3.25, 1.25, MINT);
  s.addText('Not a new project.\nA twenty-five year old service that needed a new home.',
    { x: 5.93, y: 2.66, w: 2.90, h: 1.05, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 12, bold: true, color: INK, valign: 'middle', lineSpacingMultiple: 1.15 });
  emphasis(s, 4.15, 'One place to report your numbers. One place to look everyone else’s up.');
  note(s, `MENG — ~1.5 min\n\nFirst, a sentence about what this system is, because not everyone in this room uses it the same way.\n\nThe CEAL Statistics Database is where about fifty libraries in North America report their East Asian collections every year. Those numbers become the annual report in the Journal of East Asian Libraries. They also become the benchmark you use when you need to make a case to your dean.\n\nThe record goes back a long way. Some of the digitised reports contain data from eighteen sixty-nine. The online database itself opened in nineteen ninety-nine.\n\nSo this is not a new project. It is a twenty-five year old service that needed a new home.\n\n导演提示: 最后那句是定调,说慢一点。Anlin 第 5 页会细讲这条时间线,这里别展开。`);
}

/* ===== S3 Where we started ===== */
{
  const s = slide();
  head(s, 'Where we started', 'Meng', 'The site we inherited');
  const colW = (CW - 0.25) / 2;
  card(s, M, 1.25, colW, 2.35, MINT);
  s.addText('What it did well — for twenty years', { x: M + 0.20, y: 1.38, w: colW - 0.40,
    h: 0.26, isTextBox: true, margin: 0, fontFace: FONTB, fontSize: 11.5, bold: true, color: GREEN });
  bullets(s, M + 0.20, 1.70, colW - 0.40, 1.8, [
    'Held every data point and every form, complete and correct',
    'Served guests, member libraries and the Committee, reliably',
    'Never lost anyone’s data',
  ], 10);
  card(s, M + colW + 0.25, 1.25, colW, 2.35);
  s.addText('What it could no longer do', { x: M + colW + 0.45, y: 1.38, w: colW - 0.40,
    h: 0.26, isTextBox: true, margin: 0, fontFace: FONTB, fontSize: 11.5, bold: true, color: CORAL });
  bullets(s, M + colW + 0.45, 1.70, colW - 0.40, 1.8, [
    'Built for a desktop monitor. Unusable on a phone or tablet.',
    'Fixed page width, dated colours, hard to read',
    'Every administrative change needed a developer',
    'Built on software getting harder to host safely',
  ], 10);
  emphasis(s, 3.78, 'Whoever built that site deserves credit. It did its job for two decades.', GREEN);
  s.addText('[截图] 用两张图替掉上面两个卡片：旧站首页 / 旧站 390px 宽',
    { x: M, y: 4.55, w: CW, h: 0.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 8, italic: true, color: MUTED });
  note(s, `MENG — ~1.5 min\n\nLet me start with the old site, and let me start by being fair to it.\n\nThat site did its job for two decades. Every number was in there. Every form was in there. It never lost anyone's data. Whoever built it deserves credit, and some of them may be on this call.\n\n[可删] But it was built for a desktop computer in the early two thousands. If you opened it on your phone, you had to pinch and scroll sideways to read a table. The page had a fixed width, so on a large monitor most of your screen was empty. The colours were hard on the eyes.\n\nAnd there was a bigger problem, one you would only notice if you were on the Committee. Almost nothing could be changed without a developer. Opening the survey, sending the announcement, adding a new library — all of it meant emailing someone technical and waiting.\n\nThat is the situation we were asked to fix.\n\n导演提示: 必须先夸旧站再说问题。Anlin 第 2 页已经讲了 KU 停止托管那条线,这里不要重复,直接讲"网站本身老了"。`);
}

/* ===== S4 The brief ===== */
{
  const s = slide();
  head(s, 'What we set out to do', 'Meng', 'The brief');
  card(s, M, 1.20, CW, 0.70, MINT);
  s.addText('Keep every function. Replace the experience.',
    { x: M + 0.22, y: 1.25, w: CW - 0.44, h: 0.60, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 19, bold: true, color: INK, valign: 'middle' });
  const items = [
    ['Match the old site feature for feature', 'Remove nothing because it was inconvenient to rebuild.'],
    ['Hand the Committee the controls', 'If the Chair wants to open the survey late, that is a button — not an email to me.'],
    ['Work on any screen, in any of the languages', 'And render Chinese, Japanese and Korean properly.'],
    ['Write it all down', 'So the next person can take over when we are no longer doing this.'],
  ];
  items.forEach((it, i) => row(s, M, 2.10 + i * 0.78, CW, i + 1, it[0], it[1],
    [CORAL, GREEN, CYAN, INK][i]));
  note(s, `MENG — ~1 min\n\nSo we wrote ourselves a brief, and it fits on one line. Keep every function. Replace the experience.\n\nFour parts to that.\n\nFirst, match the old site feature for feature. Nothing gets dropped because it was inconvenient to rebuild.\n\nSecond, once we had parity, give the Committee the controls. If the Chair wants to open the survey a week late, that should be a button, not an email to me.\n\n[可删] Third, make it work on whatever screen you happen to have. And make it render Chinese, Japanese and Korean properly, which the old site did not always do.\n\nFourth, and this is the one I care most about: write everything down. Real documentation, so that when Yifan and I are no longer the people doing this, the next person can pick it up.\n\n导演提示: 第四条是委员会最在意的,说完停半秒。`);
}

/* ===== S5 Access tiers ===== */
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
  ], { y: 1.22, colW: [4.2, 1.18, 1.18, 1.18, 1.26], rowH: 0.30, fontSize: 9.5 });
  emphasis(s, 4.05, 'Permission is checked in the database — not just hidden in the menu.', CORAL);
  note(s, `MENG — ~1.5 min\n\nThe old site had four kinds of visitor, and so does the new one.\n\nA guest is anyone who has not signed in. Guests can see the statistics, the charts and the published reports. That is deliberate. Most of this data is meant to be public.\n\nA member is your library's delegate. You submit your own library's forms, and you can pull your own multi-year reports.\n\n[可删] An editor maintains the shared lists of electronic databases that everyone selects from, and can see across libraries.\n\nA super administrator is the Committee. They manage people, set the dates, send the announcements, and they are the only ones who can change data after the deadline.\n\nOne thing worth saying about that table. On the old site, a lot of permission was really just a hidden menu item. If you knew the address, you could sometimes get further than you should. On the new site every one of those checks happens in the database, every time. Hiding a button is not security, and we did not treat it as security.\n\n导演提示: 最后一段是重点,不要提中间件、cookie、token 这些词。`);
}

/* ===== S6 The Anlin slide ===== */
{
  const s = slide();
  head(s, 'This was never only a coding project', 'Meng', 'Working with the Committee');
  card(s, M, 1.22, CW, 2.15, MINT);
  s.addText('Throughout the rebuild, Committee Chair Anlin Yang:',
    { x: M + 0.22, y: 1.34, w: CW - 0.44, h: 0.26, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 11.5, bold: true, color: GREEN });
  bullets(s, M + 0.22, 1.66, CW - 0.44, 1.6, [
    'Explained what each form field actually means — question by question',
    'Put us in touch with the right person at each library',
    'Kept the schedule honest, and coordinated every deadline',
    'Checked the migrated numbers against the historical record',
    'Made the decisions that unblocked us, quickly, again and again',
  ], 10);
  card(s, M, 3.52, 2.55, 0.78);
  s.addText([{ text: '≈ N', options: { fontSize: 20, bold: true, color: CORAL, fontFace: FONTB, breakLine: true } },
             { text: 'EMAIL THREADS, OVER M MONTHS', options: { fontSize: 7, color: MUTED, fontFace: FONT, charSpacing: 0.8 } }],
    { x: M, y: 3.60, w: 2.55, h: 0.64, isTextBox: true, margin: 0, align: 'center' });
  s.addText('You cannot read these requirements out of a database.\nThey came out of that correspondence.',
    { x: M + 2.80, y: 3.56, w: CW - 2.80, h: 0.72, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 12, bold: true, color: INK, valign: 'middle', lineSpacingMultiple: 1.1 });
  s.addText('[需要你补] 把 N 和 M 换成邮箱里的真实数字',
    { x: M, y: 4.48, w: CW, h: 0.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 8, italic: true, color: MUTED });
  note(s, `MENG — ~2 min ⭐ 全场最重要的一页,也是给 Anlin 的致谢。\n\nI want to spend a minute on something that is not code.\n\nWhen you rebuild a survey like this, the hard part is not the software. The hard part is understanding what every single field on the form actually means. What counts as a volume. What belongs in one column and not another. Why two questions that look similar are counted differently.\n\nNone of that is written in the old database. It lives in the practice of this community. And the person who translated it for us was Anlin.\n\nOver the past two and a half years, Anlin has explained fields to us question by question. She put us in touch with the right person at each library when we needed to check something. She coordinated the deadlines. She checked our migrated numbers against the historical record. And when we were stuck on a decision that was not ours to make, she made it, usually within a day.\n\nThat is roughly N separate email threads across M months.\n\nSo I want to say this plainly, and in front of all of you. This system is accurate because the Committee kept us accurate. Anlin, thank you.\n\n导演提示: 因为 Anlin 排在最后讲,这一页还能提前把她捧起来。说完看一眼镜头里的她再切页。\n需要你补:去邮箱数 thread 数和月数。`);
}

/* ===== S7 sign-in ===== */
{
  const s = slide();
  head(s, 'What you already noticed last year', 'Meng', 'Signing in got safer — and simpler');
  const items = [
    ['Type your email first', 'The site tells you whether you still need to set a password, before it asks for one.'],
    ['A one-time link, good for 24 hours', 'New accounts and resets arrive as a link. We never send you a password in an email again.'],
    ['Change your own password', 'Any time, from inside the site. You do not have to ask anyone.'],
    ['Covering two libraries?', 'Switch between them without signing out and back in.'],
  ];
  items.forEach((it, i) => row(s, M, 1.25 + i * 0.80, CW, i + 1, it[0], it[1],
    [CORAL, GREEN, CYAN, INK][i]));
  emphasis(s, 4.48, 'We do not put passwords in email any more. Ever.', CORAL);
  note(s, `MENG — ~1 min\n\nIf you used the site last fall, you already noticed some of this.\n\nSigning in now happens in two steps. You type your email address first, and the site checks you before asking for anything else. If you have never set a password, it tells you that instead of just saying "wrong password" — which is what the old site did, and which sent a lot of email to Anlin.\n\nWhen you need a password, we email you a one-time link that works for twenty-four hours. We do not put passwords in email any more. Ever.\n\nYou can change your own password from inside the site. You do not have to ask anyone.\n\nAnd if you cover more than one library, which a few of you do, you can now switch between them without signing out and back in.\n\n导演提示: ⚠️ 不要说"15 分钟"。系统实际是 24 小时。`);
}

/* ===== S8 toolkit I ===== */
{
  const s = slide();
  head(s, 'Giving the Committee the controls', 'Meng', 'The toolkit — running the survey');
  s.addText('Every one of these used to require a developer. Now each is a page on the site.',
    { x: M, y: 1.18, w: CW, h: 0.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, italic: true, color: GREEN });
  const g = [
    ['Set the dates', 'Opening, closing, fiscal year, publication — per year'],
    ['Open a new year', 'Creates the year’s records for all 50 libraries at once'],
    ['Open or close right now', 'An override for when the schedule slips'],
    ['Send the announcement', 'Preview it, confirm it, send now or schedule it'],
    ['Edit the wording', 'Of every automatic message, in the browser'],
    ['Email one person', 'For the library that joined after the announcement went out'],
  ];
  const cw2 = (CW - 0.3) / 3, chh = 1.02;
  g.forEach((it, i) => {
    const x = M + (i % 3) * (cw2 + 0.15), y = 1.52 + Math.floor(i / 3) * (chh + 0.16);
    card(s, x, y, cw2, chh, i === 5 ? MINT : WHITE);
    s.addText(it[0], { x: x + 0.16, y: y + 0.12, w: cw2 - 0.32, h: 0.26, isTextBox: true,
      margin: 0, fontFace: FONTB, fontSize: 11, bold: true, color: i === 5 ? CORAL : INK });
    s.addText(it[1], { x: x + 0.16, y: y + 0.40, w: cw2 - 0.32, h: 0.54, isTextBox: true,
      margin: 0, fontFace: FONT, fontSize: 9, color: INK, valign: 'top' });
  });
  emphasis(s, 4.02, 'A library joined mid-season and never got the announcement. Now the Chair sends them their own copy — one click.', CORAL);
  note(s, `MENG — ~2 min\n\nNow the part I am most pleased about, and the part that matters most to the Committee.\n\nOn the old site, running the survey meant asking a developer. Opening the forms was a developer task. Sending the announcement was a developer task. Changing a date was a developer task.\n\nAll of that is now a page on the site.\n\nThe Chair sets the opening and closing dates herself. Opening a new survey year creates the records for all fifty libraries in one action. If a date needs to slip, there is a button for that. The announcement email can be previewed, then sent now or scheduled for later. And the wording of every automatic message can be edited right in the browser — no developer, no waiting.\n\nI want to point out the last item on that list, because it came directly out of last year's collection. A library joined partway through the season. The announcement had already gone out weeks earlier, so their delegate never got it. Under the old system, the fix was to email me.\n\nNow the Chair opens the user list, finds that one person, and clicks a button that sends them their own copy of the announcement. That is it.\n\n导演提示: 最后那个例子是真事,讲具体故事比列功能有效。`);
}

/* ===== S9 toolkit II ===== */
{
  const s = slide();
  head(s, 'People, data, publication', 'Meng', 'The toolkit — part two');
  const left = [
    ['People', 'Search, reassign, change roles, export the roster'],
    ['Add a library', 'A guided six-step form — no database access'],
    ['Who has submitted', 'For any year, at a glance'],
  ];
  const right = [
    ['Year-end reports', 'Excel, Word, PDF — or every library in one download'],
    ['Published reports', 'Upload the PDF; the public page updates immediately'],
    ['Rankings back to 1970', 'Click any measure for the full list'],
  ];
  left.forEach((it, i) => row(s, M, 1.25 + i * 0.78, 4.3, i + 1, it[0], it[1], GREEN));
  right.forEach((it, i) => row(s, M + 4.7, 1.25 + i * 0.78, 4.3, i + 4, it[0], it[1], CYAN));
  card(s, M, 3.68, CW, 1.02, MINT);
  s.addText('A record of every change', { x: M + 0.22, y: 3.78, w: CW - 0.44, h: 0.26,
    isTextBox: true, margin: 0, fontFace: FONTB, fontSize: 12, bold: true, color: CORAL });
  s.addText('Who made it, when, and what the value was before. If a published number is ever questioned, we can show you exactly where it came from and who touched it.',
    { x: M + 0.22, y: 4.06, w: CW - 0.44, h: 0.56, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, color: INK, valign: 'top' });
  note(s, `MENG — ~1.5 min\n\n[可删] The second half of the toolkit is about people, data and publication.\n\nThe Chair can search the whole user list, move someone to a different library, change what they are allowed to do, and export the roster.\n\nAdding a new member library used to mean someone editing the database directly. It is now a guided six-step form.\n\nThen there is the part I would point to if you asked me what makes this system trustworthy. Every change to every number is recorded. Who made it. When. And what the value was before they changed it. If a number in the published report is ever questioned, we can show you exactly where it came from and who touched it.\n\nThe Committee can see who has submitted and who has not, for any year. Year-end reports export as Excel, Word or PDF — one library, or all of them in a single download. When the report is published in the journal, the Chair uploads the PDF and the public page updates immediately.\n\nAnd there are rankings going back to nineteen seventy, for any measure you like.\n\n导演提示: 审计记录那段是核心,讲慢一点。`);
}

/* ===== S10 design & language ===== */
{
  const s = slide();
  head(s, 'How it looks, and who it reads for', 'Meng', 'Design, language, help');
  const colW = (CW - 0.25) / 2;
  const items = [
    ['One layout, any screen', 'From a phone to a wide monitor. Nothing is hidden on a small screen.'],
    ['East Asian type, done properly', 'A correct typeface per language — a Japanese title is never set in a Chinese font.'],
    ['Keyboard and screen-reader support', 'Built in from the start, not added afterwards.'],
  ];
  items.forEach((it, i) => row(s, M, 1.28 + i * 0.82, colW, i + 1, it[0], it[1],
    [CORAL, GREEN, CYAN][i]));
  card(s, M + colW + 0.25, 1.22, colW, 2.55, MINT);
  s.addText('Two complete guides, inside the site', { x: M + colW + 0.45, y: 1.34, w: colW - 0.40,
    h: 0.26, isTextBox: true, margin: 0, fontFace: FONTB, fontSize: 11.5, bold: true, color: INK });
  s.addText([
    { text: 'cealstats.org/help', options: { fontSize: 12.5, bold: true, color: CORAL, fontFace: FONTB, breakLine: true } },
    { text: 'For member libraries. Eight chapters, English and 中文.', options: { fontSize: 9.5, color: INK, fontFace: FONT, breakLine: true } },
    { text: ' ', options: { fontSize: 6, breakLine: true } },
    { text: 'cealstats.org/admin/superguide', options: { fontSize: 11, bold: true, color: GREEN, fontFace: FONTB, breakLine: true } },
    { text: 'For the Committee. Sign-in required.', options: { fontSize: 9.5, color: INK, fontFace: FONT, breakLine: true } },
    { text: ' ', options: { fontSize: 6, breakLine: true } },
    { text: 'Both searchable. Both print cleanly.', options: { fontSize: 9.5, italic: true, color: MUTED, fontFace: FONT } },
  ], { x: M + colW + 0.45, y: 1.68, w: colW - 0.40, h: 1.95, isTextBox: true, margin: 0, valign: 'top' });
  emphasis(s, 3.92, 'If you take one thing away from my part today: cealstats.org/help', CORAL);
  note(s, `MENG — ~1 min\n\nA word on how it looks, and then I will get to the numbers.\n\nThere is one layout, and it adapts to whatever screen you are on. Let me just show you rather than describe it.\n\n[拖动浏览器窗口:窄 → 宽]\n\nThat is the same page. Nothing is hidden from you on a phone.\n\nThe second point matters more than it sounds. Chinese, Japanese and Korean titles now render in proper typefaces for each language. On the old site they sometimes came out as empty boxes, or in a font that was technically Chinese but wrong for a Japanese title. For a database about East Asian collections, that was not acceptable.\n\nAnd there are two full guides built into the site itself. One for member libraries, one for the Committee. Both are in English and Chinese, both are searchable, and both print cleanly. If you take one thing away from my part today, make it this address: cealstats.org slash help.\n\n导演提示: 拖窗口这个演示效果最好,提前把浏览器准备好。Anlin 第 11、12 页会演示表单和报表,这里只讲"设计",别抢她的内容。`);
}

/* ===== S11 the stack ===== */
{
  const s = slide();
  head(s, 'What it runs on', 'Meng', 'In plain terms');
  table(s, [
    [th('What it does'), th('What we chose'), th('Why')],
    [td('Builds the pages you see'), td('Next.js', { bold: true }), td('One system for the site and the data behind it')],
    [td('Stores the data'), td('PostgreSQL', { bold: true }), td('Proven, durable, easy to copy out')],
    [td('Hosts the database'), td('Neon', { bold: true }), td('Can copy the whole database to test safely')],
    [td('Hosts the website'), td('Vercel', { bold: true }), td('Runs scheduled tasks; renews certificates itself')],
    [td('Sends the email'), td('Resend', { bold: true }), td('Handles the mailing list and delivery logs')],
  ], { y: 1.22, colW: [2.7, 1.9, 4.4], rowH: 0.36, fontSize: 10 });
  card(s, M, 3.48, CW, 1.05, MINT);
  s.addText('Three outside companies. All three replaceable.',
    { x: M + 0.22, y: 3.58, w: CW - 0.44, h: 0.26, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 12, bold: true, color: CORAL });
  s.addText('Four documented routes out: move the database, move the website, move the email, or move all of it onto a university server. You are not locked in to anybody — including us.',
    { x: M + 0.22, y: 3.86, w: CW - 0.44, h: 0.56, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, color: INK, valign: 'top' });
  note(s, `MENG — ~1 min\n\nOne slide on what it runs on. I will keep this short, because the names do not matter much to you.\n\nEverything you see is built on current, mainstream, well-supported software. The data lives in a standard database that any developer would recognise, and that can be copied out in one command. The site and the database are hosted by two companies, and the email goes through a third.\n\nThe line that matters is the last one. All three of those companies are replaceable, and the step-by-step instructions for replacing each of them are written down in our documentation. There are four of them: move the database, move the website, move the email, or move the whole thing onto a university server.\n\nI mention that because it is the question a committee should ask. You are not locked in to anybody. Including us.\n\n导演提示: 不要念表格。重点全在最后那句。`);
}

/* ===== S12 the numbers ===== */
{
  const s = slide();
  head(s, 'What this actually took', 'Meng', 'March 2024 → today · 29 months');
  const sw = (CW - 0.45) / 4;
  [['886','Recorded batches of work',CORAL],['154','Reviewed change sets',GREEN],
   ['3','Released versions',CYAN],['~100k','Lines of code, by hand',INK]]
   .forEach((st, i) => statCard(s, M + i * (sw + 0.15), 1.22, sw, st[0], st[1], st[2]));
  [['72','Pages on the site',INK],['41','Database tables',INK],
   ['3,793','Lines of documentation',INK],['2','Developers',CORAL]]
   .forEach((st, i) => statCard(s, M + i * (sw + 0.15), 2.45, sw, st[0], st[1], st[2]));
  emphasis(s, 3.70, 'About thirty units of work every month, for twenty-nine months. Alongside our regular jobs.');
  s.addText('A “batch of work” is one recorded change — think of it as one entry in a very detailed lab notebook.',
    { x: M, y: 4.44, w: CW, h: 0.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 8.5, italic: true, color: MUTED });
  note(s, `MENG — ~2 min ⭐ 核心证据页。慢慢讲,给他们时间看数字。\n\nNow the part I was asked to be specific about.\n\nWe started in March of twenty twenty-four. That is twenty-nine months ago.\n\nLet me explain one word on this slide first. A commit is one recorded batch of work — you finish something, you write down what you did, and it goes into the record. Think of it as one entry in a very detailed lab notebook.\n\nThere are eight hundred and eighty-six of those. That is roughly thirty a month, every month, for twenty-nine months.\n\n[可删] A hundred and fifty-four separate change sets were reviewed before they went anywhere near the live site. Around a hundred thousand lines of code written by hand. Seventy-two pages. Forty-one tables in the database.\n\nAnd three thousand seven hundred lines of documentation, in English and Chinese.\n\nTwo of us. Alongside our regular jobs.\n\nI am not showing you this to complain. I am showing you this because when a committee approves a rebuild, it is very hard to see what it costs. This is what it cost.\n\n导演提示: 可口头补 — 886 次里我提交 693 次,奕帆 111 次。\n⚠️ 若被问"总共改了多少行":照实说没有可靠数字。`);
}

/* ===== S13 ten phases ===== */
{
  const s = slide();
  head(s, 'How it was built', 'Meng', 'Ten stages');
  const ph = [
    ['1','Foundations','Mar – May 2024','95'],['2','Accounts and sign-in','May – Aug 2024','90'],
    ['3','The data model, and importing the old data','Aug – Oct 2024','50'],
    ['4','The shared database lists; first admin tools','Oct 2024 – Mar 2025','110'],
    ['5','The ten survey forms','Apr – Aug 2025','115'],['6','Getting ready to go live','Sept 2025','116'],
    ['7','The 2025 collection, live','Oct – Dec 2025','218'],['8','Reports and exports','Jan – Mar 2026','55'],
    ['9','The public statistics pages','May – Jun 2026','63'],['10','Tightening security','Aug 2026','—'],
  ];
  const rows = [[th(''), th('Stage'), th('When'), th('Units', { align: 'center' })]];
  ph.forEach(p => {
    const hot = p[0] === '7';
    const o = hot ? { bold: true, color: CORAL, fill: { color: MINT }, fontFace: FONTB } : {};
    rows.push([td(p[0], Object.assign({ align: 'center' }, o)), td(p[1], o), td(p[2], o),
               td(p[3], Object.assign({ align: 'center' }, o))]);
  });
  table(s, rows, { y: 1.20, colW: [0.55, 4.85, 2.35, 1.25], rowH: 0.275, fontSize: 9 });
  emphasis(s, 4.35, 'Stages one to five were building. Six to ten were keeping it alive.', GREEN);
  note(s, `MENG — ~0.5 min。快速带过,唯一目的是引出第 7 阶段的 218。\n\nVery quickly, the shape of the work.\n\n[可删] The first five stages were building. Foundations, then accounts, then the data, then the shared lists, then the ten forms themselves.\n\nStage six was getting ready to go live, last September.\n\nAnd then look at stage seven. Two hundred and eighteen units of work, between October and December of last year. That is more than any other stage in the project.\n\nThat is not building. That is the collection season, running live, with your data in it.`);
}

/* ===== S14 the 2025 cycle ===== */
{
  const s = slide();
  head(s, 'The 2025 collection ran, start to finish', 'Meng', 'Stage seven');
  card(s, M, 1.22, 2.85, 1.15, MINT);
  s.addText([{ text: '⅓', options: { fontSize: 30, bold: true, color: CORAL, fontFace: FONTB, breakLine: true } },
             { text: 'OF THE PROJECT, IN TWO MONTHS', options: { fontSize: 7, color: MUTED, fontFace: FONT, charSpacing: 0.8 } }],
    { x: M, y: 1.32, w: 2.85, h: 0.95, isTextBox: true, margin: 0, align: 'center' });
  s.addText('That is what it looks like to support a survey while it is running — with your data in it.',
    { x: M + 3.10, y: 1.28, w: CW - 3.10, h: 1.05, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 12, bold: true, color: INK, valign: 'middle', lineSpacingMultiple: 1.1 });
  bullets(s, M, 2.55, CW, 1.35, [
    'Set up the automatic opening and closing — and tuned it live',
    'Corrected the arithmetic on several forms against the real questionnaire',
    'Added “see your last five years” to all ten forms, mid-season, because people asked',
    'Fixed gaps in Save Draft; repaired East Asian text in the exports',
  ], 10);
  card(s, M, 4.02, CW, 0.92);
  s.addText('And one we are proud of', { x: M + 0.22, y: 4.10, w: CW - 0.44, h: 0.24,
    isTextBox: true, margin: 0, fontFace: FONTB, fontSize: 10.5, bold: true, color: CORAL });
  s.addText('We tried a major upgrade in mid-October, saw it put the live season at risk, and undid it within the hour. We shipped it ten months later, when nobody’s data was on the line.',
    { x: M + 0.22, y: 4.36, w: CW - 0.44, h: 0.50, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 9.5, color: INK, valign: 'top' });
  note(s, `MENG — ~1.5 min ⭐ 全场情绪高点,值得多花 30 秒。\n\nA third of this entire project happened in two months. September and October of last year.\n\nThat is what it looks like to support a survey while it is actually running, with real libraries entering real numbers.\n\nSome of what we did in those weeks. We set up the automatic opening and closing of the forms, and then tuned it while it was live. We found and corrected the arithmetic on several forms, by checking it against the actual paper questionnaire. We repaired the handling of Chinese, Japanese and Korean text in the exports.\n\nAnd we added a feature we had never planned. Several of you asked whether you could see your own library's last five years while filling in a form, so you had something to compare against. That was a fair request. We added it to all ten forms, in the middle of the season.\n\nOne more, and then I will hand over.\n\nIn mid-October we attempted a major upgrade to the software underneath the site. Within an hour we could see it created a risk to the live season. So we undid it, completely, and left it alone. We came back and did that upgrade ten months later, in the summer, when nobody's data was on the line.\n\nI mention it because I think knowing when not to touch something is part of the job. Your collection season is not the time to be clever.\n\n导演提示: 回滚的故事一定要讲 — 不是失败,是判断力。`);
}

/* ===== S15 2026 + handoff ===== */
{
  const s = slide();
  head(s, 'The same two people are still behind it', 'Meng', '2026');
  bullets(s, M, 1.28, CW, 1.9, [
    'The 2025 collection was completed successfully',
    'Yifan and I are watching the system through this year’s season',
    'Report a problem and we aim to fix it that week — not in the next release',
    'The documentation is kept current, in English and Chinese',
    'A written handover checklist lists every account a new maintainer would need',
  ], 11);
  emphasis(s, 3.28, 'A volunteer committee should not depend on any one person indefinitely — including me.', CORAL);
  card(s, M, 4.10, CW, 0.82, MINT);
  s.addText('Next: Yifan on what sits underneath — how twenty-five years of data got moved, and how it is kept safe.',
    { x: M + 0.22, y: 4.16, w: CW - 0.44, h: 0.70, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 11, bold: true, color: GREEN, valign: 'middle' });
  note(s, `MENG — ~0.75 min\n\nLast slide from me.\n\nThe twenty twenty-five collection finished successfully. Every library that submitted, submitted through this system.\n\nFor this year, Yifan and I are still here, and still watching. If you find something broken during the season, tell us. Our aim is to fix it that week, not to put it on a list for next year.\n\nAnd for the longer term: the documentation is kept up to date, in both languages, and there is a written handover checklist. It lists every account that would need to transfer to a new maintainer. That is deliberate. A volunteer committee should not depend on any one person indefinitely, including me.\n\nNow — I have talked about what you can see. Yifan is going to tell you about what sits underneath.\n\n导演提示: 说完交给奕帆。看一眼时间。`);
}

/* ===== Part 2 divider ===== */
{
  const s = pres.addSlide();
  divider(s, 'Part 2', 'Moving the Data, Safely',
    'How twenty-five years of records were migrated, and how they are kept.');
  note(s, `YIFAN — 分隔页,一句话带过。\n\n导演提示: 对应 Anlin 大纲页里 Part 2 那一行。`);
}

/* ===== S16 migration problem ===== */
{
  const s = slide();
  head(s, 'Moving twenty-five years of data', 'Yifan', 'The migration problem');
  bullets(s, M, 1.28, CW, 1.6, [
    'Decades of statistics, and the full structure of every form, had to arrive intact',
    'Two different database systems, with different rules about what a number is',
    'No downtime allowed — the historical record had to stay online',
    'Nothing could be quietly lost, rounded, or reinterpreted',
  ], 11);
  card(s, M, 3.00, CW, 0.82, MINT);
  s.addText('When people hear “we moved the database,” they picture copying files. It is not that.',
    { x: M + 0.22, y: 3.06, w: CW - 0.44, h: 0.70, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 13, bold: true, color: INK, valign: 'middle' });
  s.addText('“We have already done the hardest possible migration once.”',
    { x: M, y: 4.02, w: CW, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11.5, italic: true, color: GREEN });
  s.addText('— from our own maintenance documentation',
    { x: M, y: 4.32, w: CW, h: 0.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 8.5, color: MUTED });
  note(s, `YIFAN — ~1.5 min\n\nThank you, Meng. Good afternoon.\n\nMy part is about what happened to your data.\n\nWhen people hear "we moved the database," they picture copying files. It is not that. The old system and the new system store numbers differently. They disagree about what an empty field means. They disagree about how text in Chinese, Japanese and Korean is encoded. They even number their own records differently.\n\nSo every single value had to be carried across, and then checked.\n\nAnd we could not take the site down to do it. The historical record had to stay available the whole time.`);
}

/* ===== S17 what broke ===== */
{
  const s = slide();
  head(s, 'Three things went wrong', 'Yifan', 'And how each was fixed');
  const items = [
    ['The counter problem', 'The database’s internal counter came across behind the data. The first new record collided with an existing one.',
     'We wrote a repair tool that resets every counter, and made it run automatically. It has not come back.'],
    ['Old passwords', 'Some accounts still carried credentials stored in a way that is no longer considered safe.',
     'We refused to weaken the new system. The site recognises the old format and emails that person a link to set a new password.'],
    ['Broken characters', 'Some Chinese, Japanese and Korean titles arrived damaged — the wrong bytes, so the wrong characters.',
     'Fixed where titles are displayed and where they are exported, then checked against the original records.'],
  ];
  const rh = 1.06;
  items.forEach((it, i) => {
    const y = 1.24 + i * (rh + 0.12);
    card(s, M, y, CW, rh, i === 1 ? MINT : WHITE);
    s.addShape(pres.ShapeType.ellipse, { x: M + 0.18, y: y + 0.16, w: 0.28, h: 0.28,
      fill: { color: [CORAL, GREEN, CYAN][i] }, line: { width: 0 } });
    s.addText(String(i + 1), { x: M + 0.18, y: y + 0.16, w: 0.28, h: 0.28, isTextBox: true,
      margin: 0, fontFace: FONTB, fontSize: 9.5, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    s.addText(it[0], { x: M + 0.56, y: y + 0.13, w: 2.1, h: 0.30, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 11, bold: true, color: INK, valign: 'top' });
    s.addText(it[1], { x: M + 0.56, y: y + 0.44, w: 3.4, h: 0.52, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 8.5, color: INK, valign: 'top' });
    s.addText([{ text: '→  ', options: { color: [CORAL, GREEN, CYAN][i], bold: true, fontFace: FONTB } },
               { text: it[2], options: { color: INK, fontFace: FONT } }],
      { x: M + 4.15, y: y + 0.18, w: CW - 4.35, h: 0.72, isTextBox: true, margin: 0,
        fontSize: 9, valign: 'middle' });
  });
  note(s, `YIFAN — ~2 min\n\nThree things went wrong. I want to walk through them, because how a team handles the things that go wrong tells you more than a feature list.\n\nThe first we called the counter problem. A database keeps its own internal count of how many records it has, so it knows what number to give the next one. When we loaded the old data in, that counter did not come with it. So the database thought it was empty, and the first new record anyone created collided with a record that was already there.\n\n[可删] We could have fixed that by hand, once. Instead we wrote a small tool that resets every counter in every table, and we made it run automatically whenever data is loaded. It has not come back.\n\nThe second was old passwords. Some accounts still had credentials from the old system, stored using a method that is no longer considered safe. We had a choice. We could accept the old method, which would have meant carrying a known weakness forever. Or we could refuse it.\n\nWe refused it. If your account still had an old credential, the site recognises that and emails you a link to set a new one. It was slightly inconvenient for a few people last year. It was the right call.\n\nThe third was broken characters. Some East Asian titles came through the migration damaged. We fixed that both where titles are displayed and where they are exported, and then checked them against the original records.\n\n导演提示: 不要说 sequence、serial、primary key。`);
}

/* ===== S18 Library-Year hub ===== */
{
  const s = slide();
  head(s, 'One idea holds the whole thing together', 'Yifan', 'One record per library, per year');
  const bw = 4.05;
  [['Library','one for each institution',INK,0],
   ['Library-Year','one for each institution, each year',CORAL,1],
   ['The ten forms','one of each, hanging off that year',GREEN,2]].forEach(b => {
    const y = 1.30 + b[3] * 1.02;
    card(s, M + b[3] * 0.35, y, bw - b[3] * 0.35, 0.76, b[3] === 1 ? MINT : WHITE);
    s.addText(b[0], { x: M + b[3] * 0.35 + 0.18, y: y + 0.09, w: bw - 0.7, h: 0.26,
      isTextBox: true, margin: 0, fontFace: FONTB, fontSize: 12, bold: true, color: b[2] });
    s.addText(b[1], { x: M + b[3] * 0.35 + 0.18, y: y + 0.37, w: bw - 0.7, h: 0.26,
      isTextBox: true, margin: 0, fontFace: FONT, fontSize: 8.5, color: MUTED });
    if (b[3] < 2) s.addText('↓', { x: M + b[3] * 0.35 + 0.18, y: y + 0.72, w: 0.4, h: 0.28,
      isTextBox: true, margin: 0, fontFace: FONT, fontSize: 13, bold: true, color: TAN });
  });
  bullets(s, M + 4.55, 1.30, CW - 4.55, 2.5, [
    'Every form you submit is attached to your library and that year',
    'A single switch on it decides whether you can edit that year',
    'That switch is what the opening and closing dates actually control',
    'Empty records are created in advance — a library that submits nothing still has a place',
  ], 10);
  emphasis(s, 4.10, 'So the Committee can reopen ONE library’s forms for a few more days, without reopening them for everybody.', CORAL);
  note(s, `YIFAN — ~2 min\n\nNow the design idea at the centre of the new database. There is only one, and if you follow this slide you will understand how the whole system behaves.\n\nFor each library, for each year, there is exactly one record. We call it a library-year. Everything else hangs off it. All ten of your forms attach to your library and that specific year.\n\nHere is why that matters to you.\n\nOn that library-year record there is a single switch: can this library edit this year, yes or no. That switch is what the opening and closing dates actually control.\n\nBecause the switch is per library and per year, and not one global setting, the Committee can reopen the forms for one library that needs a few more days, without reopening them for everybody. On the old system that was awkward. Now it is one library, one year, one switch.\n\n[可删] One more detail. We create these records in advance, empty, for every library.\n\n导演提示: 讲的时候用手在屏幕上指那个图。`);
}

/* ===== S19 wide tables ===== */
{
  const s = slide();
  head(s, 'Why the tables are so wide', 'Yifan', 'A deliberate trade-off');
  s.addText('Every measure is broken out the same way:',
    { x: M, y: 1.22, w: CW, h: 0.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10.5, color: INK });
  const langs = ['Chinese', 'Japanese', 'Korean', 'Non-CJK', 'Subtotal'];
  const lw = (CW - 0.6) / 5;
  langs.forEach((l, i) => {
    const x = M + i * (lw + 0.15);
    card(s, x, 1.55, lw, 0.52, i === 4 ? MINT : WHITE);
    s.addText(l, { x, y: 1.55, w: lw, h: 0.52, isTextBox: true, margin: 0, fontFace: FONTB,
      fontSize: 11, bold: true, color: i === 4 ? CORAL : INK, align: 'center', valign: 'middle' });
  });
  s.addText('…repeated for every question on the form. One form has around 110 columns because of it.',
    { x: M, y: 2.20, w: CW, h: 0.26, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10.5, italic: true, color: INK });
  card(s, M, 2.58, CW, 0.78, MINT);
  s.addText('A database designer would tell you that is untidy. They would be right.',
    { x: M + 0.22, y: 2.64, w: CW - 0.44, h: 0.66, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 12.5, bold: true, color: GREEN, valign: 'middle' });
  s.addText('We chose not to collapse them. The moment you do, the numbers in the database stop lining up with the numbers on the questionnaire — and nobody can tell which question produced a figure.',
    { x: M, y: 3.50, w: CW, h: 0.56, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10.5, color: INK, valign: 'top' });
  emphasis(s, 4.16, 'Any number in the system traces back to the exact question that produced it. That was worth more than elegance.', CORAL);
  note(s, `YIFAN — ~1 min\n\nA short one, but it is a decision worth explaining.\n\nEvery measure in this database is broken out the same way: Chinese, Japanese, Korean, non-CJK, and a subtotal. That pattern repeats for every question on the form. One of our forms has about a hundred and ten columns because of it.\n\nA database designer would tell you that is untidy, and they would be right. There is a more elegant way to store this.\n\nWe chose not to. Because the moment you collapse those columns, the numbers in the database stop lining up with the numbers on the questionnaire. And then when the Committee needs to check a figure, nobody can tell which question produced it.\n\nSo we kept it wide. Every number traces back to one specific question. That was worth more to us than elegance.\n\n导演提示: 主动承认"设计师会说这不优雅,他说得对",反而更可信。`);
}

/* ===== S20 shared lists ===== */
{
  const s = slide();
  head(s, 'Describe a database once, not fifty times', 'Yifan', 'Shared title lists');
  const colW = (CW - 0.25) / 2;
  card(s, M, 1.25, colW, 1.35);
  s.addText('Before', { x: M + 0.20, y: 1.36, w: colW - 0.4, h: 0.24, isTextBox: true, margin: 0,
    fontFace: FONTB, fontSize: 11, bold: true, color: MUTED });
  s.addText('One e-journal package that thirty libraries subscribe to was written down thirty separate times. Change the publisher’s name and someone had to find and fix thirty entries.',
    { x: M + 0.20, y: 1.64, w: colW - 0.4, h: 0.88, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 9.5, color: INK, valign: 'top' });
  card(s, M + colW + 0.25, 1.25, colW, 1.35, MINT);
  s.addText('Now', { x: M + colW + 0.45, y: 1.36, w: colW - 0.4, h: 0.24, isTextBox: true,
    margin: 0, fontFace: FONTB, fontSize: 11, bold: true, color: CORAL });
  s.addText('The package is described once, in a shared list. Each library records its own counts, and whether it had access that year, separately.',
    { x: M + colW + 0.45, y: 1.64, w: colW - 0.4, h: 0.88, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 9.5, color: INK, valign: 'top' });
  const three = [['One entry per title','shared by every library'],
                 ['Counts recorded separately','per library, per year'],
                 ['Access recorded separately','who had it, in which year']];
  const tw = (CW - 0.3) / 3;
  three.forEach((t, i) => {
    const x = M + i * (tw + 0.15);
    card(s, x, 2.78, tw, 0.82);
    s.addText(t[0], { x: x + 0.16, y: 2.90, w: tw - 0.32, h: 0.28, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 10, bold: true, color: INK, valign: 'top' });
    s.addText(t[1], { x: x + 0.16, y: 3.18, w: tw - 0.32, h: 0.28, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 8.5, color: MUTED });
  });
  emphasis(s, 3.80, 'Correct a title once, and every library’s record is corrected with it.', CORAL);
  note(s, `YIFAN — ~1 min\n\nHere is a small thing that saves a lot of trouble.\n\nTake an e-journal package that thirty of your libraries subscribe to. On the old system, that package was written down thirty separate times — once in each library's record. If the publisher changed its name, someone had to find and fix thirty entries. In practice, they did not all get fixed, so the same package appeared under three different spellings.\n\nNow the package is described once, in a shared list. Each library records its own counts, and whether it had access that year, separately. Correct the title once and every library's record is corrected with it.\n\n导演提示: 用具体例子讲,不要讲结构。Anlin 第 10 页会讲怎么用这些 list,这里只讲为什么这样设计。`);
}

/* ===== S21 never lose data ===== */
{
  const s = slide();
  head(s, 'Never losing your work', 'Yifan', 'Four promises about your data');
  const items = [
    ['Your draft is safe', 'Saving updates the same record. Come back in three days and it is exactly where you left it.'],
    ['Submitting is recorded separately', 'From the numbers themselves — per form, per year.'],
    ['A form of all zeros is not real data', 'The system reads that as “did not participate”. This is a rule the Committee gave us — not one we invented.'],
    ['Every change is written down', 'Who, when, and what the value was before. Changes after the deadline are marked, field by field.'],
  ];
  items.forEach((it, i) => row(s, M, 1.26 + i * 0.82, CW, i + 1, it[0], it[1],
    [CORAL, GREEN, CYAN, INK][i]));
  emphasis(s, 4.56, 'Press Save Draft as often as you like. Nothing is lost, and nobody else sees it.', CORAL);
  note(s, `YIFAN — ~1.5 min\n\nFour promises about your data.\n\nFirst, your draft is safe. When you press Save Draft, we update the same record rather than creating a second one. You can leave it for three days and come back to exactly what you left.\n\nSecond, whether you have submitted is recorded separately from the numbers themselves, for each form and each year.\n\nThird, and this one came from the Committee. If a form comes in as all zeros, the system does not treat that as a real report of zero. It reads it as a library that did not participate that year. That distinction matters for the published statistics, and it is a rule the Committee gave us — not one we invented.\n\nFourth, every change is written down. Who made it, when, and what the number was before.\n\n导演提示: 第三条一定要说"这是委员会给我们的规则"。Anlin 第 11 页会讲 Save/Submit 的操作,这里讲的是底层保证,不冲突。`);
}

/* ===== S22 roll forward ===== */
{
  const s = slide();
  head(s, 'Not typing the same thing twice', 'Yifan', 'Bring last year forward, in one click');
  card(s, M, 1.22, CW, 0.76, MINT);
  s.addText('You should never have to type in something the system already knows.',
    { x: M + 0.22, y: 1.27, w: CW - 0.44, h: 0.66, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 13.5, bold: true, color: INK, valign: 'middle' });
  const items = [
    ['Copy last year’s databases into this year', 'One action — and it tells you exactly what was copied and what was skipped.'],
    ['It refuses to overwrite', 'If this year already has records, it stops and shows you the conflict rather than replacing your work.'],
    ['Eight import buttons', 'Pull figures the system already holds into the form you are filling in.'],
    ['One button for the electronic form', 'Fills it from all three shared lists at once.'],
  ];
  items.forEach((it, i) => row(s, M, 2.14 + i * 0.78, CW, i + 1, it[0], it[1],
    [CORAL, GREEN, CYAN, INK][i]));
  note(s, `YIFAN — ~1 min\n\nThis was one of the most popular additions last year, and it is a simple idea. You should never have to type in something the system already knows.\n\nIf your library's database subscriptions are mostly the same as last year, there is one action that brings last year's forward into this year. It then tells you exactly what it copied and what it skipped.\n\nAnd it will not overwrite. If this year already has records, it stops and shows you the conflict rather than quietly replacing your work. We were careful about that one.\n\n[可删] There are also eight import buttons across the forms, which pull figures the system already holds into the form you are filling in. And one button that fills the electronic form from all three shared lists at once.\n\n导演提示: "拒绝覆盖"这条要强调。Anlin 第 11 页也会提 Import,可以说"Anlin 待会会演示怎么用"。`);
}

/* ===== S23 security ===== */
{
  const s = slide();
  head(s, 'Keeping it safe', 'Yifan', 'Security, in plain terms');
  card(s, M, 1.22, CW, 0.92, MINT);
  s.addText('Two locks, not one.', { x: M + 0.22, y: 1.29, w: 2.2, h: 0.30, isTextBox: true,
    margin: 0, fontFace: FONTB, fontSize: 15, bold: true, color: CORAL });
  s.addText('The door checks who you are. Then every sensitive action asks the database again. Editing something in your own browser to pretend you are an administrator does not work.',
    { x: M + 0.22, y: 1.60, w: CW - 0.44, h: 0.48, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, color: INK, valign: 'top' });
  const items = [
    ['Tampered sessions are detected', 'You are signed out immediately.'],
    ['Passwords cannot be read back', 'Stored so they cannot be turned back into your password. Not by us either.'],
    ['The scheduled task is locked too', 'The part that opens and closes the survey will not answer a stranger.'],
    ['The database connection is encrypted', 'And verified at both ends.'],
    ['Every sensitive action is recorded', 'Including exports of contact details.'],
  ];
  items.forEach((it, i) => rowTight(s, M, 2.32 + i * 0.52, CW, i + 1, it[0], it[1],
    [INK, CORAL, GREEN, CYAN, INK][i]));
  note(s, `YIFAN — ~1.5 min\n\nA minute on security, in plain terms.\n\nThe important idea is two locks, not one. When you sign in, the site checks who you are — that is the front door. But then, every time you try to do something sensitive, the site asks the database again: who is this person, and are they allowed to do this?\n\nThat sounds redundant. It is not. It means that editing something in your own browser to pretend you are an administrator does not work. The front door is not the only thing standing between someone and your data.\n\nPasswords are stored using the method currently recommended for this, and stored in a form that cannot be turned back into the original password. Not by us either. If you forget your password, we genuinely cannot look it up — we can only send you a link to set a new one.\n\nThe part of the site that automatically opens and closes the survey is locked as well. And the connection between the website and the database is encrypted and verified at both ends.\n\n导演提示: "两把锁"这个比喻是全部。不要说 middleware、JWT、cookie、Argon2id。\n"连我们自己都查不到你的密码"这句听众印象最深,一定要说。`);
}

/* ===== S24 backup / exit ===== */
{
  const s = slide();
  head(s, 'If something goes badly wrong', 'Yifan', 'Backup, restore, and the way out');
  const colW = (CW - 0.25) / 2;
  card(s, M, 1.25, colW, 1.45);
  s.addText('Restore', { x: M + 0.20, y: 1.36, w: colW - 0.4, h: 0.26, isTextBox: true,
    margin: 0, fontFace: FONTB, fontSize: 12, bold: true, color: CORAL });
  bullets(s, M + 0.20, 1.66, colW - 0.4, 0.95, [
    'The whole database can be copied back to how it looked at a chosen moment, without touching the live site',
    'Full copies are kept away from the database provider',
  ], 9);
  card(s, M + colW + 0.25, 1.25, colW, 1.45, MINT);
  s.addText('The way out — four documented routes', { x: M + colW + 0.45, y: 1.36,
    w: colW - 0.4, h: 0.26, isTextBox: true, margin: 0, fontFace: FONTB, fontSize: 12,
    bold: true, color: GREEN });
  bullets(s, M + colW + 0.45, 1.66, colW - 0.4, 0.95, [
    'Move the database to a different provider',
    'Move the website to a different host',
    'Move the email to a different provider',
    'Move all of it onto a university server',
  ], 9);
  emphasis(s, 2.86, 'A backup stored with the thing you are backing up is not a backup.', GREEN);
  card(s, M, 3.62, CW, 1.00);
  s.addText('The Committee is not locked in to any company — and the instructions do not depend on us being reachable.',
    { x: M + 0.22, y: 3.70, w: CW - 0.44, h: 0.46, isTextBox: true, margin: 0,
      fontFace: FONTB, fontSize: 12, bold: true, color: INK, valign: 'top' });
  s.addText('If both of us disappeared tomorrow, someone competent could read that document and keep this service running.',
    { x: M + 0.22, y: 4.16, w: CW - 0.44, h: 0.38, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 9.5, color: INK, valign: 'top' });
  note(s, `YIFAN — ~1 min\n\nLast slide from me, and it is the one a committee should care about most.\n\nThe database can be rolled back. We can produce a copy of the whole thing as it looked at a chosen moment in the past, and inspect it, without touching the live site. Full copies are taken on a schedule and kept somewhere other than the company that hosts the database, because a backup stored with the thing you are backing up is not a backup.\n\nAnd then the way out. There are four documented routes: move the database, move the website, move the email, or move all of it onto a university server. Each one is written up step by step in our documentation.\n\nI want to be clear about why that exists. It is not because we expect to leave. It is because those instructions do not depend on us being reachable. If both of us disappeared tomorrow, someone competent could read that document and keep this service running.\n\nNow I will hand over to Anlin, who is going to show you the part you actually came for — how to use it.\n\n导演提示: ⚠️ 自动备份目前还没真正配上,若被追问,照实说"目前是手动,下一步要补"。\n最后一句交给 Anlin。`);
}

pres.writeFile({ fileName: 'CEAL-Parts1-2-Anlin-theme.pptx' }).then(f => console.log('wrote', f));
