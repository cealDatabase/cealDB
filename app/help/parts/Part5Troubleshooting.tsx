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

interface IssueCardProps {
  id: string
  lang: 'zh' | 'en'
  zh: { symptom: React.ReactNode; cause: React.ReactNode; fix: React.ReactNode }
  en: { symptom: React.ReactNode; cause: React.ReactNode; fix: React.ReactNode }
}

function IssueCard({ id, lang, zh, en }: IssueCardProps) {
  const c = lang === 'zh' ? zh : en
  return (
    <div id={id} className="my-5 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-900 font-semibold text-sm">
        🔍 {lang === 'zh' ? '症状' : 'Symptom'}
      </div>
      <div className="px-4 py-3 text-sm text-gray-800">{c.symptom}</div>
      <div className="px-4 py-2 bg-blue-50 border-y border-blue-100 text-blue-900 font-semibold text-sm">
        💡 {lang === 'zh' ? '可能原因' : 'Likely cause'}
      </div>
      <div className="px-4 py-3 text-sm text-gray-800">{c.cause}</div>
      <div className="px-4 py-2 bg-emerald-50 border-y border-emerald-100 text-emerald-900 font-semibold text-sm">
        ✅ {lang === 'zh' ? '怎么解决' : 'How to fix'}
      </div>
      <div className="px-4 py-3 text-sm text-gray-800">{c.fix}</div>
    </div>
  )
}

export default function Part5Troubleshooting({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-5"
        lang={lang}
        zh="第 5 部分 · 故障排查"
        en="Part 5 · Troubleshooting"
      />
      <P
        lang={lang}
        zh="这里列了 6 个最常见的问题。每一条按「症状 → 可能原因 → 怎么解决」的格式写，对照自己的情况找。"
        en={`Six most common problems below. Each follows the "Symptom → Likely cause → How to fix" pattern. Match yours and follow.`}
      />

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '走完这一节还没解决？',
          en: "Didn't solve it after this section?",
        }}
      >
        {lang === 'zh' ? (
          <>
            邮件{' '}
            <PageLink href="https://www.eastasianlib.org/newsite/statistics/">
              CEAL Statistics Committee
            </PageLink>{' '}
            描述：① 你的机构；② 哪张表 / 哪个页面；③ 你看到的具体错误信息或截图；④ 你已经尝试过的步骤。
          </>
        ) : (
          <>
            Email the{' '}
            <PageLink href="https://www.eastasianlib.org/newsite/statistics/">
              CEAL Statistics Committee
            </PageLink>{' '}
            describing: (1) your institution; (2) which form / page; (3) the
            exact error or a screenshot; (4) what you've already tried.
          </>
        )}
      </Callout>

      {/* 5.1 No login email */}
      <SectionH3
        id="s-5-1"
        lang={lang}
        zh="5.1 收不到登录 / 重置密码邮件"
        en="5.1 Login / Password Reset Email Not Received"
      />
      <IssueCard
        id="issue-5-1"
        lang={lang}
        zh={{
          symptom: <>点了 Forgot Password 或被告知建了账号，但 30 分钟内还没收到邮件。</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>被你机构的反垃圾邮件系统拦截</li>
              <li>邮箱地址拼错了（你以为对，系统里其实是另一个）</li>
              <li>邮箱已被取消订阅 broadcast 列表（很少见）</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>检查 Spam / Junk / Promotions 文件夹</li>
              <li>让 IT 把 <Code>noreply@cealstats.org</Code> 加进 allowlist</li>
              <li>10 分钟后再点一次 Forgot Password</li>
              <li>还是没有 → 联系 Committee 让他们核对邮箱拼写并重发</li>
            </ol>
          ),
        }}
        en={{
          symptom: <>You clicked Forgot Password or were told your account was created, but no email arrives within 30 minutes.</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>Your institution's spam filter blocked it</li>
              <li>The email on file is misspelled vs what you think</li>
              <li>You're marked unsubscribed (rare)</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>Check Spam / Junk / Promotions folders</li>
              <li>Ask IT to allowlist <Code>noreply@cealstats.org</Code></li>
              <li>Wait 10 min and try Forgot Password again</li>
              <li>Still nothing → email Committee to verify spelling and resend</li>
            </ol>
          ),
        }}
      />

      {/* 5.2 Wrong password */}
      <SectionH3
        id="s-5-2"
        lang={lang}
        zh="5.2 密码不对 / 登不进去"
        en="5.2 Wrong Password / Cannot Log In"
      />
      <IssueCard
        id="issue-5-2"
        lang={lang}
        zh={{
          symptom: <>系统说 "Invalid email or password" 或 "Incorrect password"。</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>密码真的输错了（大小写、空格）</li>
              <li>用错邮箱（个人邮箱 vs 工作邮箱）</li>
              <li>账号是别人新建的，但你没点欢迎邮件里的设置密码链接</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>确认输入的邮箱是 CEAL 系统里登记的那个</li>
              <li>注意 Caps Lock + 浏览器自动填充错误</li>
              <li>直接点 Forgot Password 重设。这是最快办法。</li>
              <li>重设链接 24 小时内有效，过期再点一次即可</li>
            </ol>
          ),
        }}
        en={{
          symptom: <>System says "Invalid email or password" or "Incorrect password".</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>Password really mistyped (case, spaces)</li>
              <li>Wrong email (personal vs work)</li>
              <li>Account was just created and you never clicked the welcome-email setup link</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>Verify the email matches what's on file with CEAL</li>
              <li>Check Caps Lock + browser auto-fill mishaps</li>
              <li>Click Forgot Password — fastest path</li>
              <li>Reset link is valid 24h; click again if expired</li>
            </ol>
          ),
        }}
      />

      {/* 5.3 Greyed buttons */}
      <SectionH3
        id="s-5-3"
        lang={lang}
        zh="5.3 输入框/按钮灰色，点不动"
        en="5.3 Buttons / Inputs Greyed Out"
      />
      <IssueCard
        id="issue-5-3"
        lang={lang}
        zh={{
          symptom: <>表单可以打开，能看到数字，但所有输入框灰色，Submit 按钮也消失或灰掉。</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>表单已关闭（过了 12/2，或还没到 10/1）</li>
              <li>表单虽开但 CEAL Committee 把你机构标为不参与本年度（罕见）</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>看表单页头的状态徽章：是 Closed 还是 Scheduled？</li>
              <li>Closed = 已超期 → 联系 Committee 请求恢复（见 4.4 情况 B）</li>
              <li>Scheduled = 还没到开表日 → 等到 10/1</li>
              <li>都不是 → 截图整页发给 Committee 排查</li>
            </ol>
          ),
        }}
        en={{
          symptom: <>Form opens, you see numbers, but all inputs are greyed and Submit is gone or disabled.</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>Form is closed (past Dec 2, or before Oct 1)</li>
              <li>Form is open but your library is marked non-participating this year (rare)</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>Check the status badge at the top of the form: Closed or Scheduled?</li>
              <li>Closed = past deadline → contact Committee for recovery (see 4.4 case B)</li>
              <li>Scheduled = not yet opening day → wait until Oct 1</li>
              <li>Neither → screenshot the page and email Committee</li>
            </ol>
          ),
        }}
      />

      {/* 5.4 Shows last year data */}
      <SectionH3
        id="s-5-4"
        lang={lang}
        zh="5.4 表单里显示的是去年的数据"
        en="5.4 Form Shows Last Year's Data"
      />
      <IssueCard
        id="issue-5-4"
        lang={lang}
        zh={{
          symptom: <>打开本年度表单，里面字段已经有数字了，看着像去年的。</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>你之前点过 Import Last Year，把去年数据填进来了</li>
              <li>是为本年度准备的草稿，已被自动加载</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>这其实是好事——你不用从零开始</li>
              <li>把每个字段按本年度实际情况修改，然后点 Submit</li>
              <li>如果你<strong>真的</strong>想全部清空重填：手动逐字段删除，目前没有"一键清空"按钮</li>
            </ol>
          ),
        }}
        en={{
          symptom: <>You open this year's form and it already has numbers, looking like last year's.</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>You previously clicked Import Last Year</li>
              <li>The values were auto-loaded as a draft for this year</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>This is actually helpful — saves you from starting from zero</li>
              <li>Edit each field to reflect this year's actuals, then Submit</li>
              <li>If you <strong>really</strong> want a blank form, manually clear each field; there's no "reset" button</li>
            </ol>
          ),
        }}
      />

      {/* 5.5 Cannot save */}
      <SectionH3
        id="s-5-5"
        lang={lang}
        zh="5.5 数字保存不上去 / 提交失败"
        en="5.5 Numbers Won't Save / Submit Fails"
      />
      <IssueCard
        id="issue-5-5"
        lang={lang}
        zh={{
          symptom: <>点 Save Draft 或 Submit 后，页面没反应 / 弹错误 / 数字消失了。</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>输入框里有非法字符（如逗号、% 号、中文逗号）</li>
              <li>网络瞬时断开</li>
              <li>登录会话过期（闲置太久）</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>所有数字字段只能填<strong>纯整数</strong>。删掉逗号 / % / 空格再试</li>
              <li>F5 刷新页面（如果有未保存的草稿可能会丢，先把数字复制到文本编辑器备份）</li>
              <li>退出登录重新登录，再回到这张表</li>
              <li>还是不行 → 截图错误 + 你填的字段值 → 邮件 Committee</li>
            </ol>
          ),
        }}
        en={{
          symptom: <>Click Save Draft or Submit and nothing happens / error pops / numbers disappear.</>,
          cause: (
            <ul className="list-disc list-inside space-y-1">
              <li>Illegal chars in input (commas, %, full-width chars)</li>
              <li>Transient network drop</li>
              <li>Session expired from being idle too long</li>
            </ul>
          ),
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>Number fields accept <strong>whole integers only</strong>. Remove commas / % / spaces and retry</li>
              <li>F5 to refresh (if you have unsaved draft, copy values to a text editor first)</li>
              <li>Log out and log back in, return to the form</li>
              <li>Still fails → screenshot the error + your values → email Committee</li>
            </ol>
          ),
        }}
      />

      {/* 5.6 Cannot find colleague */}
      <SectionH3
        id="s-5-6"
        lang={lang}
        zh="5.6 找不到本机构的同事账号"
        en="5.6 Cannot Find a Colleague's Account"
      />
      <IssueCard
        id="issue-5-6"
        lang={lang}
        zh={{
          symptom: <>你想知道本机构还有谁能登录这个系统，或要给新同事开账号。</>,
          cause: <>普通用户只能看到自己的账号，看不到机构内其他成员名单。账号管理是 Super Admin 的权限。</>,
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>邮件 CEAL Statistics Committee 索要本机构当前登记的账号列表</li>
              <li>新增同事账号：把新同事的<strong>工作邮箱 + 姓名 + 角色（Member Institution）</strong>发给 Committee，请他们建账号</li>
              <li>注销离职同事账号：发邮件给 Committee 请求停用</li>
            </ol>
          ),
        }}
        en={{
          symptom: <>You want to know who else at your library can log in, or add an account for a new colleague.</>,
          cause: <>Member users can only see their own account, not the institutional member list. Account management is a Super Admin function.</>,
          fix: (
            <ol className="list-decimal list-inside space-y-1">
              <li>Email CEAL Statistics Committee for the current list of accounts for your library</li>
              <li>Add a new colleague: send <strong>work email + name + role (Member Institution)</strong> to Committee and ask them to create</li>
              <li>Remove departed colleague: email Committee to deactivate</li>
            </ol>
          ),
        }}
      />

      <Callout
        type="success"
        lang={lang}
        title={{ zh: '小结', en: 'Summary' }}
      >
        {lang === 'zh' ? (
          <>
            常见的 6 个坑你都见过了。{' '}
            <PageLink href="#part-6">第 6 部分</PageLink>{' '}
            是几张可打印的检查清单——填表前后照着勾，能避免大多数错误。
          </>
        ) : (
          <>
            You've now seen the 6 most common pitfalls.{' '}
            <PageLink href="#part-6">Part 6</PageLink> contains printable
            checklists — tick them off and you'll avoid most mistakes.
          </>
        )}
      </Callout>
    </div>
  )
}
