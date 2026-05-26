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

export default function Part4Automation({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-4"
        lang={lang}
        zh="第 4 部分 · 自动化 vs 手动"
        en="Part 4 · Automation vs Manual"
      />

      <P
        lang={lang}
        zh={'这一部分把「系统自己能做的事」和「必须你做的事」画一条清晰的线。看完你就不会问「这事是不是自动的」了。'}
        en={`This part draws a clear line between "things the system handles itself" and "things you must do". After this, you'll never wonder "is this automatic?" again.`}
      />

      {/* ---------- 4.1 What Cron does ---------- */}
      <SectionH3
        id="s-4-1"
        lang={lang}
        zh="4.1 Vercel Cron 在做什么（一张时序图）"
        en="4.1 What Vercel Cron Does (sequence diagram)"
      />

      <P
        lang={lang}
        zh={
          <>
            Vercel cron 每天 <strong>UTC 8:00 / 20:00</strong>（美东 4am / 4pm，美西 1am / 1pm）跑两次。
            它访问 <Code>/api/cron/check-form-schedules</Code>，做以下检查：
          </>
        }
        en={
          <>
            Vercel cron runs twice daily at <strong>UTC 8:00 / 20:00</strong>{' '}
            (4am/4pm Eastern, 1am/1pm Pacific). It hits{' '}
            <Code>/api/cron/check-form-schedules</Code>, which does the
            following checks:
          </>
        }
      />

      <div className="my-5 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 overflow-x-auto">
        <pre className="text-xs leading-6 font-mono whitespace-pre text-gray-800">
{`  ┌──────────────────────────────────────────────────────────────┐
  │  ${lang === 'zh' ? 'Vercel Cron 触发（UTC 8am / 8pm）' : 'Vercel Cron triggers (UTC 8am / 8pm)'}                    │
  └─────────────────────────────┬────────────────────────────────┘
                                │
                                ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  GET /api/cron/check-form-schedules                          │
  │  Authorization: Bearer \${CRON_SECRET}                        │
  └─────────────────────────────┬────────────────────────────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
  ┌──────────┐         ┌──────────────┐         ┌─────────────────┐
  │ Open?    │         │ Close?       │         │ 7d Reminder?    │
  │ openDate │         │ closeDate    │         │ closeDate-7d    │
  │  ≤ now   │         │  ≤ now       │         │  ≤ now <        │
  │ AND not  │         │ AND not      │         │ closeDate AND   │
  │ notified │         │ notified     │         │ not reminded    │
  └────┬─────┘         └──────┬───────┘         └────────┬────────┘
       │ ✅                   │ ✅                       │ ✅
       ▼                      ▼                          ▼
  ${lang === 'zh' ? '开表 + 广播' : 'Open + broadcast'}     ${lang === 'zh' ? '关表 + 通知 admin' : 'Close + notify admin'}    ${lang === 'zh' ? '发提醒邮件' : 'Send reminder email'}
       │                      │                          │
       ▼                      ▼                          ▼
  ${lang === 'zh' ? 'notifiedOnOpen=true' : 'notifiedOnOpen=true'}    ${lang === 'zh' ? 'notifiedOnClose=true' : 'notifiedOnClose=true'}    ${lang === 'zh' ? 'reminder=true' : 'reminder=true'}
       │                      │                          │
       └──────────────────────┴──────────────────────────┘
                                │
                                ▼
                  ${lang === 'zh' ? '写入审计日志，回 200 OK' : 'Write audit log, return 200 OK'}`}
        </pre>
      </div>

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '为什么是 UTC 8am？',
          en: 'Why UTC 8am?',
        }}
      >
        {lang === 'zh' ? (
          <>
            因为 closing date 是太平洋时间 11:59pm，UTC 7:59am。Cron 在 UTC 8:00 跑（仅滞后 1 分钟），
            可以在关闭后第一时间执行关表逻辑。20:00 那次是日间二次保险。
          </>
        ) : (
          <>
            Because closing date is Pacific 11:59pm = UTC 7:59am. Cron runs at
            UTC 8:00 (just 1 minute later) so the close logic fires immediately
            after closing time. The 20:00 run is a daytime backup.
          </>
        )}
      </Callout>

      {/* ---------- 4.2 Automated tasks ---------- */}
      <SectionH3
        id="s-4-2"
        lang={lang}
        zh="4.2 自动的事（你不用管）"
        en="4.2 Automated Tasks (Hands-Off)"
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '任务', en: 'Task' },
          { zh: '触发条件', en: 'Trigger' },
          { zh: '邮件模板', en: 'Email Template' },
          { zh: '审计动作', en: 'Audit action' },
        ]}
        rows={[
          [
            { zh: '到点开表', en: 'Open forms on schedule' },
            { zh: 'openingDate ≤ now & !notifiedOnOpen', en: 'openingDate ≤ now & !notifiedOnOpen' },
            { zh: 'broadcast_open_forms', en: 'broadcast_open_forms' },
            { zh: 'SYSTEM_OPEN_FORMS', en: 'SYSTEM_OPEN_FORMS' },
          ],
          [
            { zh: '到点关表', en: 'Close forms on schedule' },
            { zh: 'closingDate ≤ now & !notifiedOnClose', en: 'closingDate ≤ now & !notifiedOnClose' },
            { zh: '（仅给 Super Admin 发通知，不发广播）', en: '(notifies Super Admin only, not all users)' },
            { zh: 'SYSTEM_CLOSE_FORMS', en: 'SYSTEM_CLOSE_FORMS' },
          ],
          [
            { zh: '7 天关闭提醒', en: '7-day closing reminder' },
            { zh: 'closingDate-7d ≤ now < closingDate & !reminder', en: 'closingDate-7d ≤ now < closingDate & !reminder' },
            { zh: 'broadcast_closing_reminder', en: 'broadcast_closing_reminder' },
            { zh: 'CREATE / EmailBroadcast', en: 'CREATE / EmailBroadcast' },
          ],
          [
            { zh: '发布到 Resend Audience', en: 'Publish to Resend Audience' },
            { zh: '广播事件触发时', en: 'When broadcast event fires' },
            { zh: '同时调用 Resend Broadcasts API', en: 'Calls Resend Broadcasts API' },
            { zh: '记录 broadcast_sent', en: 'Record broadcast_sent' },
          ],
          [
            { zh: '幂等保护', en: 'Idempotency guard' },
            { zh: '检查 notified* 标志', en: 'Checks notified* flags' },
            { zh: '——', en: '—' },
            { zh: '——', en: '—' },
          ],
        ]}
      />

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '完全自动 = 你不用做任何事',
          en: 'Fully automatic = you do nothing',
        }}
      >
        {lang === 'zh'
          ? '只要你 9 月在 /admin/survey-dates 录入了正确的日期，且 SurveySession + Library_Year 都正常存在，10 月-12 月这一整段你不需要进任何后台。Cron 会自己跑。但你应该「监控」（看邮件确认事件触发了），万一出问题立刻发现。'
          : `As long as you set correct dates in /admin/survey-dates in September and the SurveySession + Library_Year rows exist, you don't need to touch the admin from October to December. Cron handles it. But you should "monitor" (check confirmation emails) so you catch issues fast.`}
      </Callout>

      {/* ---------- 4.3 Manual tasks ---------- */}
      <SectionH3
        id="s-4-3"
        lang={lang}
        zh="4.3 必须手动的事（你必须做）"
        en="4.3 Manual Tasks (Hands-On)"
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '任务', en: 'Task' },
          { zh: '页面', en: 'Page' },
          { zh: '何时', en: 'When' },
        ]}
        rows={[
          [
            { zh: '设置本年度 opening / closing 日期', en: 'Set this year\'s opening/closing dates' },
            { zh: '/admin/survey-dates', en: '/admin/survey-dates' },
            { zh: '9 月中旬', en: 'Mid-September' },
          ],
          [
            { zh: '审阅 / 修改邮件模板', en: 'Review / edit email templates' },
            { zh: '/admin/email-templates', en: '/admin/email-templates' },
            { zh: '9 月下旬', en: 'Late September' },
          ],
          [
            { zh: '发"将于...开放"预公告广播', en: 'Send pre-announcement broadcast' },
            { zh: '/admin/broadcast (Send Broadcast NOW + broadcast_announcement)', en: '/admin/broadcast (Send Broadcast NOW + broadcast_announcement)' },
            { zh: '9 月下旬', en: 'Late September' },
          ],
          [
            { zh: '新建用户 / 机构', en: 'Create user / institution' },
            { zh: '/signup, /create', en: '/signup, /create' },
            { zh: '任何时候', en: 'Anytime' },
          ],
          [
            { zh: '修改用户角色 / 删除用户', en: 'Modify user roles / delete user' },
            { zh: '/admin/users', en: '/admin/users' },
            { zh: '任何时候', en: 'Anytime' },
          ],
          [
            { zh: '导出 Year-End Reports', en: 'Export Year-End Reports' },
            { zh: '/admin/year-end-reports', en: '/admin/year-end-reports' },
            { zh: '1 月', en: 'January' },
          ],
          [
            { zh: '上传 JEAL PDF 链接', en: 'Upload JEAL PDF link' },
            { zh: '/admin/published-reports', en: '/admin/published-reports' },
            { zh: '2 月', en: 'February' },
          ],
          [
            { zh: '把本年度标记 Published', en: 'Mark this year as Published' },
            { zh: '/libraries → Participation Status', en: '/libraries → Participation Status' },
            { zh: '2-3 月', en: 'Feb-Mar' },
          ],
        ]}
      />

      {/* ---------- 4.4 Semi-manual ---------- */}
      <SectionH3
        id="s-4-4"
        lang={lang}
        zh="4.4 半自动的事（你可以介入）"
        en="4.4 Semi-Manual (Optional Override)"
      />

      <P
        lang={lang}
        zh="自动化已经覆盖正常路径，但偶尔有特殊情况需要你打破常规。这些操作都在 /admin/broadcast 上："
        en="Automation handles the happy path, but occasionally you need to break norms. These overrides live in /admin/broadcast:"
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-2">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>Open All Forms NOW</strong>：手动立即开表（绕过 cron）。
              用于：cron 没跑 / 提前开表 / 重新开表给某机构补交。
            </li>
            <li>
              <strong>Close All Forms NOW</strong>：手动立即关表。用于：提前结束本年度。
            </li>
            <li>
              <strong>Send Broadcast NOW（任意模板）</strong>：手动立即发广播。
              用于：发预公告 / 发临时通知 / 重发关闭提醒。
            </li>
            <li>
              <strong>个人重发 Opening Email</strong>（在 /admin/users 上点 ✉️ 图标）：
              单独给一个用户重发。用于：用户漏看了广播。
            </li>
            <li>
              <strong>"Pause" / "Resume" 一个 SurveySession</strong>（如果按钮存在）：
              暂停所有自动调度。极少用。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Open All Forms NOW</strong>: manually open immediately
              (bypasses cron). Use when: cron didn't run / opening early /
              re-opening so one library can catch up.
            </li>
            <li>
              <strong>Close All Forms NOW</strong>: manually close immediately.
              Use when: ending the year early.
            </li>
            <li>
              <strong>Send Broadcast NOW (any template)</strong>: send broadcast
              right away. Use for: pre-announcements / ad-hoc notices /
              resending closing reminder.
            </li>
            <li>
              <strong>Resend individual Opening Email</strong> (✉️ icon in
              /admin/users): resend to one user only. Use when: a user missed
              the broadcast.
            </li>
            <li>
              <strong>"Pause" / "Resume" a SurveySession</strong> (if buttons
              exist): pause all automated scheduling. Rarely used.
            </li>
          </>
        )}
      </ul>

      <Callout
        type="warning"
        lang={lang}
        title={{
          zh: '介入后要恢复一致性',
          en: 'After overriding, restore consistency',
        }}
      >
        {lang === 'zh' ? (
          <>
            手动介入后系统的"幂等标志"可能会乱。例如你 manual close 后又 manual open，
            <Code>notifiedOnOpen</Code> 可能还是 true（因为之前已经发过广播了），
            那么 cron 不会再次发广播。这通常是<strong>对的行为</strong>（防重复），
            但如果你<strong>故意</strong>想重发广播，必须在 /admin/broadcast 上手动点 Send Broadcast NOW。
          </>
        ) : (
          <>
            After overriding, the system's idempotency flags may be in an
            unusual state. E.g. after a manual close + manual open, the{' '}
            <Code>notifiedOnOpen</Code> may still be true (broadcast was sent
            earlier), so cron won't resend. This is usually{' '}
            <strong>correct</strong> (prevents duplicates) — but if you{' '}
            <strong>intentionally</strong> want to resend the broadcast, you
            must do it manually via Send Broadcast NOW on /admin/broadcast.
          </>
        )}
      </Callout>

      {/* ---------- 4.5 Duplicate prevention ---------- */}
      <SectionH3
        id="s-4-5"
        lang={lang}
        zh="4.5 防重复机制详解"
        en="4.5 Duplicate Prevention Mechanism"
      />

      <P
        lang={lang}
        zh={'系统用 4 类标志位来防止同一封邮件被发两次或同一个事件被处理两次。理解这些标志会帮你看懂「为什么这次 cron 没动作」。'}
        en={`The system uses 4 categories of flags to prevent emails from being sent twice or events from being processed twice. Understanding them helps you see why "cron did nothing this time".`}
      />

      <SectionH4
        id="s-4-5-flags"
        lang={lang}
        zh="4 类幂等标志"
        en="4 Categories of Idempotency Flags"
      />

      <GuideTable
        lang={lang}
        headers={[
          { zh: '标志位', en: 'Flag' },
          { zh: '位置', en: 'Location' },
          { zh: '用途', en: 'Purpose' },
          { zh: '如何重置', en: 'How to reset' },
        ]}
        rows={[
          [
            { zh: <Code>notifiedOnOpen</Code>, en: <Code>notifiedOnOpen</Code> },
            { zh: 'SurveySession', en: 'SurveySession' },
            { zh: '防止"开表广播"重复发', en: 'Prevent duplicate "open" broadcast' },
            { zh: '/admin/broadcast → Open All Forms NOW 或开发者手动改 DB', en: '/admin/broadcast → Open All Forms NOW or developer DB edit' },
          ],
          [
            { zh: <Code>notifiedOnClose</Code>, en: <Code>notifiedOnClose</Code> },
            { zh: 'SurveySession', en: 'SurveySession' },
            { zh: '防止"关表通知"重复发', en: 'Prevent duplicate "close" notify' },
            { zh: '同上', en: 'Same' },
          ],
          [
            { zh: <Code>notifiedClosingReminder</Code>, en: <Code>notifiedClosingReminder</Code> },
            { zh: 'SurveySession', en: 'SurveySession' },
            { zh: '防止"7 天提醒"重复发', en: 'Prevent duplicate "7-day reminder"' },
            { zh: '同上', en: 'Same' },
          ],
          [
            { zh: <Code>broadcast_sent</Code>, en: <Code>broadcast_sent</Code> },
            { zh: 'Library_Year', en: 'Library_Year' },
            { zh: '细粒度防止某机构被广播重复', en: 'Fine-grained per-library duplicate prevention' },
            { zh: '/admin/broadcast 的强制开表会重置', en: 'Reset by force-opening from /admin/broadcast' },
          ],
        ]}
      />

      <SectionH4
        id="s-4-5-events"
        lang={lang}
        zh="ScheduledEvent 三态"
        en="ScheduledEvent Three States"
      />

      <P
        lang={lang}
        zh={
          <>
            另一个去重层来自 <Code>ScheduledEvent</Code> 表。它记录每一次"应该触发"的事件。
            状态有 3 个：
          </>
        }
        en={
          <>
            Another dedup layer is the <Code>ScheduledEvent</Code> table. It
            records every "scheduled trigger". 3 states:
          </>
        }
      />

      <ul className="list-disc list-inside my-2 text-sm space-y-1">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>pending</strong>：等待触发
            </li>
            <li>
              <strong>completed</strong>：已成功执行
            </li>
            <li>
              <strong>cancelled</strong>：被 Super Admin 手动取消，cron 不会再处理
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>pending</strong>: awaiting trigger
            </li>
            <li>
              <strong>completed</strong>: successfully executed
            </li>
            <li>
              <strong>cancelled</strong>: manually cancelled by Super Admin —
              cron will skip it
            </li>
          </>
        )}
      </ul>

      <P
        lang={lang}
        zh={
          <>
            事件类型有 3 种：<Code>FORM_OPENING</Code> / <Code>FORM_CLOSING</Code> / <Code>BROADCAST</Code>。
            在 <Code>/admin/broadcast</Code> → Session Queue 你能看见每个事件的当前状态。
          </>
        }
        en={
          <>
            Event types: <Code>FORM_OPENING</Code> /{' '}
            <Code>FORM_CLOSING</Code> / <Code>BROADCAST</Code>. In{' '}
            <Code>/admin/broadcast</Code> → Session Queue you can see each
            event's current state.
          </>
        }
      />

      <Callout
        type="critical"
        lang={lang}
        title={{
          zh: '常见误解：标志位 ≠ 真实状态',
          en: 'Common misconception: flag ≠ actual state',
        }}
      >
        {lang === 'zh' ? (
          <>
            <Code>is_open_for_editing</Code>（在 Library_Year 上）才是表单是否开放的<strong>真实开关</strong>。
            <Code>notifiedOnOpen</Code> 只是"我是不是已经发过开表通知"。
            两者会同步但<strong>不是同一回事</strong>。极端情况下你可能看到
            <Code>is_open_for_editing=true</Code> 但 <Code>notifiedOnOpen=false</Code>
            （手工开表后没发广播）。这时 cron 下次跑会发广播，但不会重新设 is_open。
          </>
        ) : (
          <>
            <Code>is_open_for_editing</Code> on Library_Year is the{' '}
            <strong>actual switch</strong> for whether forms are open.{' '}
            <Code>notifiedOnOpen</Code> is just "have I sent the open
            broadcast?". They are usually in sync but{' '}
            <strong>not the same thing</strong>. In edge cases you may see{' '}
            <Code>is_open_for_editing=true</Code> but{' '}
            <Code>notifiedOnOpen=false</Code> (you manually opened without
            broadcasting). Next cron run will then send broadcast but not
            re-set is_open.
          </>
        )}
      </Callout>

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
            读完第 4 部分，你现在知道：① cron 一天跑两次自动检查；② 自动 vs 手动有清晰边界；
            ③ 你随时能介入，但要注意标志位状态。下面{' '}
            <PageLink href="#part-5">第 5 部分</PageLink> 解决"出问题怎么办"。
          </>
        ) : (
          <>
            After Part 4 you know: (1) cron runs twice daily for automated
            checks; (2) there's a clear line between automatic vs manual; (3)
            you can override anytime, but mind the flags.{' '}
            <PageLink href="#part-5">Part 5</PageLink> solves "what to do when
            things go wrong".
          </>
        )}
      </Callout>
    </div>
  )
}
