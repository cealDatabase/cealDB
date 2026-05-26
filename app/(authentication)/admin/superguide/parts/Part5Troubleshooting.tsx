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

export default function Part5Troubleshooting({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-5"
        lang={lang}
        zh="第 5 部分 · 故障排查手册"
        en="Part 5 · Troubleshooting Playbook"
      />
      <P
        lang={lang}
        zh={'按「症状 → 怀疑原因 → 你怎么诊断 → 你怎么修」的格式列出 10 类常见故障。出问题先翻这一节。'}
        en={`Listed in "symptom → likely cause → how to diagnose → how to fix" format. 10 common scenarios. When something breaks, start here.`}
      />

      {/* 5.1 No login email */}
      <SectionH3
        id="s-5-1"
        lang={lang}
        zh="5.1 用户说收不到登录邮件"
        en="5.1 User Cannot Receive Login Email"
      />
      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '症状',
          en: 'Symptom',
        }}
      >
        {lang === 'zh'
          ? '新用户/重置密码用户说"我等了 30 分钟还没收到邮件"。'
          : `New user / password-reset user says "I've waited 30 minutes, no email."`}
      </Callout>
      <SectionH4
        id="s-5-1-diag"
        lang={lang}
        zh="排查步骤"
        en="Diagnosis steps"
      />
      <ol className="list-decimal list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>让用户检查 <strong>垃圾邮件 / Promotions</strong>。Resend 邮件常被 Gmail 归为 Promotions。</li>
            <li>登录 Resend Dashboard → Emails，搜该用户邮箱。看 status 是 delivered / bounced / complained / queued？</li>
            <li>
              如果 <strong>bounced</strong>：邮件地址错或目标邮箱拒收。让用户提供正确地址。
            </li>
            <li>
              如果 <strong>complained</strong>：用户曾把 cealstats.org 的邮件标记为垃圾。需要他们去自己邮箱"取消标记"。
            </li>
            <li>
              如果 <strong>delivered</strong> 但用户说没看到：100% 是垃圾邮件文件夹。让他们搜索发件人 <Code>noreply@cealstats.org</Code>。
            </li>
            <li>
              如果 Resend 里<strong>根本没有这个邮件</strong>：去 /admin/audit-logs 找该用户 CREATE / UPDATE 时间，看附近是否有
              <Code>EmailBroadcast</Code> 或 <Code>EmailTemplate</Code> 操作。可能后端发送步骤报错了。
            </li>
          </>
        ) : (
          <>
            <li>Have user check <strong>Spam / Promotions</strong>. Resend mail often hits Gmail Promotions.</li>
            <li>Log into Resend Dashboard → Emails, search the user's email. Status: delivered / bounced / complained / queued?</li>
            <li>
              If <strong>bounced</strong>: address wrong or rejected by destination. Get the correct address.
            </li>
            <li>
              If <strong>complained</strong>: user previously marked cealstats.org mail as spam. They need to "unmark" in their inbox.
            </li>
            <li>
              If <strong>delivered</strong> but user can't find it: 100% spam folder. Have them search sender <Code>noreply@cealstats.org</Code>.
            </li>
            <li>
              If <strong>no email at all in Resend</strong>: go to /admin/audit-logs, find the user's CREATE / UPDATE time, check whether nearby <Code>EmailBroadcast</Code> or <Code>EmailTemplate</Code> events exist. Backend send may have errored.
            </li>
          </>
        )}
      </ol>
      <SectionH4
        id="s-5-1-fix"
        lang={lang}
        zh="解决方法"
        en="Fixes"
      />
      <ul className="list-disc list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>邮箱地址错：在 /admin/users 编辑该用户，改邮箱后重发。</li>
            <li>目标邮箱拒收：换一个邮箱（个人 Gmail）让用户先用，他设完密码再去更新自己的工作邮箱。</li>
            <li>Resend 服务挂了：等几分钟。或检查 dashboard.resend.com 状态页。</li>
            <li>RESEND_API_KEY 过期：联系开发者去 Vercel 环境变量更新。</li>
          </>
        ) : (
          <>
            <li>Address wrong: edit the user in /admin/users, change email, resend.</li>
            <li>Inbox rejects: use a personal Gmail for the user temporarily, then update to work email after they log in.</li>
            <li>Resend down: wait a few minutes, or check dashboard.resend.com status.</li>
            <li>RESEND_API_KEY expired: contact developer to update the env var in Vercel.</li>
          </>
        )}
      </ul>

      {/* 5.2 Wrong password */}
      <SectionH3
        id="s-5-2"
        lang={lang}
        zh="5.2 用户说密码不对"
        en="5.2 User Says Password Is Wrong"
      />
      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '最常见原因',
          en: 'Most likely cause',
        }}
      >
        {lang === 'zh'
          ? '用户记错了。让他们点登录页 "Forgot Password"，输入邮箱，会收到新密码。如果还是不行：'
          : `They forgot. Have them click "Forgot Password" on the login page, enter their email, get a new password. If that fails:`}
      </Callout>
      <ul className="list-disc list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>邮箱拼写：用户输的登录邮箱可能错。让他对照 /admin/users 里的拼写。</li>
            <li>账号被删除：去 /admin/users 找不到？说明被删了。重新建。</li>
            <li>账号被锁：连续登录失败 N 次后可能锁。审计日志 LOGIN_FAILED 多条。等 X 分钟自动解锁，或 Super Admin 手动重置密码。</li>
            <li>大小写：邮箱本身在数据库存 lower-case，前端会自动 lower。一般无碍。</li>
          </>
        ) : (
          <>
            <li>Email typo: the login email user entered may be wrong. Have them check spelling against /admin/users.</li>
            <li>Account deleted: can't find them in /admin/users? Was deleted. Recreate.</li>
            <li>Account locked: after N failed attempts may lock. Many LOGIN_FAILED rows in audit log. Wait X minutes for auto-unlock, or Super Admin manually resets password.</li>
            <li>Case sensitivity: email is stored lowercase in DB, frontend lowercases automatically. Normally fine.</li>
          </>
        )}
      </ul>

      {/* 5.3 Forms not available */}
      <SectionH3
        id="s-5-3"
        lang={lang}
        zh={'5.3 用户看到 「Forms not available」'}
        en="5.3 User Sees 'Forms Not Available'"
      />
      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '症状',
          en: 'Symptom',
        }}
      >
        {lang === 'zh'
          ? '用户登录后访问 /admin/forms，看到"This year is not open yet"或没有任何表单卡片。'
          : `User logs in, goes to /admin/forms, sees "This year is not open yet" or no form cards at all.`}
      </Callout>
      <SectionH4
        id="s-5-3-diag"
        lang={lang}
        zh="可能原因"
        en="Possible causes"
      />
      <ol className="list-decimal list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>没到开表日期</strong>：是不是还没到 10/1？让用户耐心等。
            </li>
            <li>
              <strong>opening_date 设错了</strong>：去 /admin/survey-dates 检查。如果设到了未来某天，那么 cron 没机会开表。
            </li>
            <li>
              <strong>该机构 Library_Year 不存在</strong>：通常这是新机构刚加入，9 月那次 /admin/survey-dates 没把他们包进去。
              手动去 /admin/survey-dates 再跑一次（会 upsert 新机构）。
            </li>
            <li>
              <strong>cron 没跑</strong>：到了开表日但 cron 失败。去 /admin/broadcast 手动 Open All Forms NOW。
            </li>
            <li>
              <strong>SurveySession 不存在</strong>：极罕见，需开发者建。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Not yet opening day</strong>: is it before 10/1? User
              should wait.
            </li>
            <li>
              <strong>opening_date misconfigured</strong>: check
              /admin/survey-dates. If set to a future date, cron has no chance
              to open.
            </li>
            <li>
              <strong>Library_Year missing for this institution</strong>:
              usually a new library just added, missed by the September
              /admin/survey-dates run. Run it again (upserts new libraries).
            </li>
            <li>
              <strong>Cron didn't run</strong>: opening day passed but cron
              failed. Go to /admin/broadcast and Open All Forms NOW.
            </li>
            <li>
              <strong>SurveySession missing</strong>: very rare, needs
              developer.
            </li>
          </>
        )}
      </ol>

      {/* 5.4 Edit after closing */}
      <SectionH3
        id="s-5-4"
        lang={lang}
        zh="5.4 关表后某机构需要修改"
        en="5.4 Library Needs Edit After Closing"
      />
      <P
        lang={lang}
        zh="3 种处理方法，从最推荐到最不推荐："
        en="Three options, from most to least recommended:"
      />
      <ol className="list-decimal list-inside text-sm space-y-2 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>方法 A — Super Admin 替他改</strong>（推荐）：你以 Super Admin
              身份进 /admin/forms/[libid]/[form] 直接改。系统允许（isPrivilegedPostClosing）。
              改完写一条审计日志说明谁要求改的。
            </li>
            <li>
              <strong>方法 B — 重开表给所有人</strong>：去 /admin/broadcast → Open All Forms NOW。
              全部机构都开了。<strong>务必</strong>该机构改完后立刻 Close All Forms NOW 关回去。
              缺点：广播标志位状态会乱（不会再发广播）。
            </li>
            <li>
              <strong>方法 C — 直接改数据库</strong>（最后手段）：联系开发者用 Neon Console SQL 改。
              没有审计日志，留下 Mystery 修改。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Option A — Super Admin edits for them</strong>{' '}
              (recommended): you, as Super Admin, go to
              /admin/forms/[libid]/[form] and edit directly. System allows it
              (isPrivilegedPostClosing). Add an audit-log note documenting why.
            </li>
            <li>
              <strong>Option B — Re-open for everyone</strong>: /admin/broadcast
              → Open All Forms NOW. All libraries open.{' '}
              <strong>Must</strong> Close All Forms NOW immediately after the
              one library finishes. Drawback: broadcast flag state gets
              confused (no broadcast resends).
            </li>
            <li>
              <strong>Option C — Direct DB edit</strong> (last resort): contact
              developer, use Neon Console SQL. No audit log → mysterious
              change.
            </li>
          </>
        )}
      </ol>

      {/* 5.5 Shows last year data */}
      <SectionH3
        id="s-5-5"
        lang={lang}
        zh="5.5 表单显示去年的数据"
        en="5.5 Form Shows Last Year's Data"
      />
      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '症状',
          en: 'Symptom',
        }}
      >
        {lang === 'zh'
          ? '机构填表时看到上面已经预填了去年的数字。'
          : "Library opens a form and sees last year's numbers pre-filled."}
      </Callout>
      <P
        lang={lang}
        zh={
          <>
            通常是<strong>正常的</strong>——大表（AV/EBook/EJournal）有 "Copy from Last Year" 功能（参见 3.A.4）。
            或者前端显示了"上一年的数字"作为参考（比对用）。
          </>
        }
        en={
          <>
            Usually <strong>expected behavior</strong> — big forms
            (AV/EBook/EJournal) have "Copy from Last Year" (see 3.A.4). Or the
            UI shows last year's number as reference for comparison.
          </>
        }
      />
      <P
        lang={lang}
        zh="如果是小表上看到去年数字，说明用户去年的 Monographic_Acquisitions 等记录的 year 字段写错了。罕见，需开发者诊断。"
        en="If a small form shows last year's numbers, the user's Monographic_Acquisitions etc. row's year field was set wrong last year. Rare — needs developer diagnosis."
      />

      {/* 5.6 Broadcast failed */}
      <SectionH3
        id="s-5-6"
        lang={lang}
        zh="5.6 广播邮件没发出去"
        en="5.6 Broadcast Email Did Not Send"
      />
      <SectionH4
        id="s-5-6-diag"
        lang={lang}
        zh="排查步骤"
        en="Diagnosis"
      />
      <ol className="list-decimal list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              检查 Resend Dashboard → Broadcasts。看本年度 broadcast_open_forms / closing_reminder 状态。
              没有？说明压根没创建。
            </li>
            <li>
              检查 /admin/audit-logs。搜
              <Code>EmailBroadcast</Code>。有 CREATE 行吗？
            </li>
            <li>
              检查 SurveySession 的 <Code>notifiedOnOpen</Code>。如果是 true，说明系统认为已经发过了。
            </li>
            <li>
              检查 Resend Audience。是不是所有用户都在里面？空名单 = 0 收件人。
            </li>
            <li>
              环境变量 <Code>RESEND_BROADCAST_LIST_ID</Code> 是不是有效。
            </li>
          </>
        ) : (
          <>
            <li>
              Resend Dashboard → Broadcasts. Check this year's
              broadcast_open_forms / closing_reminder status. Nothing? Then it
              was never created.
            </li>
            <li>
              /admin/audit-logs. Search <Code>EmailBroadcast</Code>. Any CREATE
              rows?
            </li>
            <li>
              SurveySession's <Code>notifiedOnOpen</Code>. If true, system
              thinks it already sent.
            </li>
            <li>
              Resend Audience. Are all users in it? Empty list = 0 recipients.
            </li>
            <li>
              Env var <Code>RESEND_BROADCAST_LIST_ID</Code> still valid?
            </li>
          </>
        )}
      </ol>
      <SectionH4
        id="s-5-6-fix"
        lang={lang}
        zh="解决方法"
        en="Fix"
      />
      <ul className="list-disc list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>立即重发</strong>：去 /admin/broadcast → Send Broadcast NOW，选 broadcast_open_forms 模板。
            </li>
            <li>
              <strong>名单空</strong>：去 Resend Dashboard → Audience，手动 import 用户，或让开发者跑 sync 脚本。
            </li>
            <li>
              <strong>API key 失效</strong>：开发者更新 <Code>RESEND_API_KEY</Code> 在 Vercel 环境变量里。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Resend manually</strong>: /admin/broadcast → Send
              Broadcast NOW with broadcast_open_forms template.
            </li>
            <li>
              <strong>Empty list</strong>: Resend Dashboard → Audience, manually
              import users, or have developer run a sync script.
            </li>
            <li>
              <strong>API key expired</strong>: developer updates{' '}
              <Code>RESEND_API_KEY</Code> in Vercel env vars.
            </li>
          </>
        )}
      </ul>

      {/* 5.7 Cron did not run */}
      <SectionH3
        id="s-5-7"
        lang={lang}
        zh="5.7 Cron 没跑"
        en="5.7 Cron Did Not Run"
      />
      <SectionH4
        id="s-5-7-diag"
        lang={lang}
        zh="排查步骤（怀疑顺序）"
        en="Diagnosis (in priority order)"
      />
      <ol className="list-decimal list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              Vercel Dashboard → Project → Cron Jobs 标签页。看本日 8:00 / 20:00 那两次的状态。
            </li>
            <li>
              如果状态是 <strong>Failed</strong>：点开看 invocation log，错误信息。
            </li>
            <li>
              如果<strong>没有调用记录</strong>：可能是 vercel.json 里的 cron 配置失效。让开发者检查。
            </li>
            <li>
              如果 cron 确实跑了但<strong>没动作</strong>：通常是 SurveySession 上 notifiedOn* 已经 true（已经处理过了）。
              这是正常的去重，不是 bug。
            </li>
            <li>
              手工触发：在 terminal 里 <Code>curl -H "Authorization: Bearer [CRON_SECRET]" https://cealstats.org/api/cron/check-form-schedules</Code>。
            </li>
          </>
        ) : (
          <>
            <li>
              Vercel Dashboard → Project → Cron Jobs tab. Check today's 8:00 /
              20:00 runs.
            </li>
            <li>
              If status <strong>Failed</strong>: click into invocation log, see
              error.
            </li>
            <li>
              If <strong>no invocations</strong>: vercel.json cron config may
              have broken. Have developer inspect.
            </li>
            <li>
              If cron <strong>did run but did nothing</strong>: usually
              SurveySession's notifiedOn* is already true (already processed).
              That's correct dedup, not a bug.
            </li>
            <li>
              Manual trigger:{' '}
              <Code>
                curl -H "Authorization: Bearer [CRON_SECRET]"
                https://cealstats.org/api/cron/check-form-schedules
              </Code>
              .
            </li>
          </>
        )}
      </ol>
      <Callout
        type="info"
        lang={lang}
        title={{
          zh: 'CRON_SECRET 在哪',
          en: 'Where is CRON_SECRET',
        }}
      >
        {lang === 'zh'
          ? 'Vercel Project → Settings → Environment Variables → CRON_SECRET。和开发者要。'
          : 'Vercel Project → Settings → Environment Variables → CRON_SECRET. Ask the developer.'}
      </Callout>

      {/* 5.8 Sequence */}
      <SectionH3
        id="s-5-8"
        lang={lang}
        zh="5.8 P2002 / Unique constraint 错误"
        en="5.8 P2002 / Unique Constraint Error"
      />
      <P
        lang={lang}
        zh={
          <>
            如果你在某些操作（特别是新建 Library / SurveySession）时看到
            <Code>PrismaClientKnownRequestError: P2002</Code>，原因通常是：
          </>
        }
        en={
          <>
            If you see{' '}
            <Code>PrismaClientKnownRequestError: P2002</Code> on certain ops
            (especially creating Library / SurveySession), causes are usually:
          </>
        }
      />
      <ul className="list-disc list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>PostgreSQL 序列漂移</strong>：自动序列号比真实最大 ID 小，所以下一个 INSERT 撞了已有 ID。
              开发者在 Neon Console 跑 <Code>SELECT setval('table_id_seq', (SELECT MAX(id) FROM table) + 1);</Code> 修。
            </li>
            <li>
              <strong>真实重复</strong>：例如建机构名重复。改名字再试。
            </li>
            <li>
              <strong>种子脚本运行了多次</strong>：dev 环境才会，prod 极罕见。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>PostgreSQL sequence drift</strong>: auto-sequence number
              is below the real max ID, next INSERT collides with existing ID.
              Developer runs in Neon Console:{' '}
              <Code>
                SELECT setval('table_id_seq', (SELECT MAX(id) FROM table) + 1);
              </Code>
              .
            </li>
            <li>
              <strong>Actual duplicate</strong>: e.g. duplicate library name.
              Rename and retry.
            </li>
            <li>
              <strong>Seed script ran multiple times</strong>: dev only,
              extremely rare in prod.
            </li>
          </>
        )}
      </ul>

      {/* 5.9 Data missing */}
      <SectionH3
        id="s-5-9"
        lang={lang}
        zh="5.9 数据看起来不对/丢失了"
        en="5.9 Data Looks Wrong / Missing"
      />
      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '深呼吸 — 真正"丢失"的概率很低',
          en: "Deep breath — truly 'lost' is very rare",
        }}
      >
        {lang === 'zh' ? (
          <>
            数据库每行修改都有审计日志（包含 before/after JSON）。即使被改坏了也能恢复。
            按以下顺序排查：
          </>
        ) : (
          <>
            Every row mutation has an audit log (with before/after JSON). Even
            if data was overwritten, you can recover. Triage in this order:
          </>
        )}
      </Callout>
      <ol className="list-decimal list-inside text-sm space-y-1 my-2">
        {lang === 'zh' ? (
          <>
            <li>
              先<strong>截图</strong>"看起来不对的画面"。
            </li>
            <li>
              在 /admin/audit-logs 找该机构 + 该实体类型（Volume_Holdings 等）+ 近期时间窗。
              看最后一次 UPDATE 的 before/after。
            </li>
            <li>
              如果 after 看起来错，但 before 是对的：人为编辑错了。让他们重新填。
            </li>
            <li>
              如果<strong>没有任何记录</strong>：从来没填过。让他们填。
            </li>
            <li>
              如果数据真的<strong>消失</strong>（之前有现在没）：联系开发者从 Neon point-in-time 恢复。
              Neon 能回退到 7 天前。
            </li>
          </>
        ) : (
          <>
            <li>
              First, <strong>screenshot</strong> the broken view.
            </li>
            <li>
              In /admin/audit-logs filter by institution + entity (Volume_Holdings, etc.) + recent time window. Inspect last UPDATE's before/after.
            </li>
            <li>
              If after looks wrong but before was right: human error. Have them refill.
            </li>
            <li>
              If <strong>no audit row at all</strong>: never filled. Have them fill it now.
            </li>
            <li>
              If data truly <strong>disappeared</strong> (there before, gone
              now): contact developer for Neon point-in-time restore. Neon
              keeps 7 days history.
            </li>
          </>
        )}
      </ol>

      {/* 5.10 Cannot find page */}
      <SectionH3
        id="s-5-10"
        lang={lang}
        zh="5.10 找不到要找的页面"
        en="5.10 Cannot Find a Page"
      />
      <P
        lang={lang}
        zh="这一指南的「1.3 工具柜」和「3 Admin 页面详细说明」是地图。如果还找不到，最常见的几个隐藏页面："
        en="The 'Toolkit' (1.3) and Part 3 are your map. If still missing, the commonly-hidden pages are:"
      />
      <GuideTable
        lang={lang}
        headers={[
          { zh: '路径', en: 'Path' },
          { zh: '说明', en: 'Description' },
        ]}
        rows={[
          [
            { zh: <Code>/admin/superguide</Code>, en: <Code>/admin/superguide</Code> },
            { zh: '本指南（你正在看的）', en: 'This guide (you are here)' },
          ],
          [
            { zh: <Code>/admin/audit-logs</Code>, en: <Code>/admin/audit-logs</Code> },
            { zh: '审计日志（一般不挂在 dashboard）', en: 'Audit logs (often not surfaced on dashboard)' },
          ],
          [
            { zh: <Code>/admin/forms/[libid]/avdbedit</Code>, en: <Code>/admin/forms/[libid]/avdbedit</Code> },
            { zh: '某机构的 AV 大表编辑（用 InstitutionSwitcher 进）', en: 'A library\'s AV big form edit (enter via InstitutionSwitcher)' },
          ],
          [
            { zh: <Code>/admin/forms/[libid]/ebookedit</Code>, en: <Code>/admin/forms/[libid]/ebookedit</Code> },
            { zh: 'EBook 大表编辑', en: 'EBook big form edit' },
          ],
          [
            { zh: <Code>/admin/forms/[libid]/ejournaledit</Code>, en: <Code>/admin/forms/[libid]/ejournaledit</Code> },
            { zh: 'EJournal 大表编辑', en: 'EJournal big form edit' },
          ],
          [
            { zh: <Code>/api/cron/check-form-schedules</Code>, en: <Code>/api/cron/check-form-schedules</Code> },
            { zh: '手动触发 cron（需 CRON_SECRET）', en: 'Manually trigger cron (needs CRON_SECRET)' },
          ],
        ]}
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
            排查时永远先<strong>看审计日志</strong>，再<strong>看 Resend Dashboard</strong>，再<strong>联系开发者</strong>。
            90% 的问题在审计日志里就能查清。
          </>
        ) : (
          <>
            Always check <strong>audit logs first</strong>, then{' '}
            <strong>Resend Dashboard</strong>, then{' '}
            <strong>contact developer</strong>. 90% of issues are explained by
            the audit log.
          </>
        )}
      </Callout>
    </div>
  )
}
