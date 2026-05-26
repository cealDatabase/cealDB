# 05 — 年度周期

这是文档里**操作上**最重要的一页。系统就是为了一年一次的问卷而存在，很多代码只有放在这个语境下才说得通。

## 速览时间线（默认值，每年可调）

```
   7/1（前一年）                          ─┬─  财政年开始（信息字段）
                                            │
   9 月（约）                                │
   ├─ 超级管理员打开 admin/survey-dates     │
   ├─ 复核日期与用户列表                    │
   └─（可选）发预告广播                     │   ← Broadcast 1（手动）
                                            │
   10/1（默认 00:00 PT）             ─────►│   ← cron 翻 is_open_for_editing
   ├─ cron 发"问卷已开启"                   │   ← Broadcast 2（自动）
   └─ 会员图书馆开始填 10 张表              │
                                            │
   11/25（关闭 - 7 天，默认）       ─────►│   ← cron 发关闭提醒
                                            │       ← Broadcast 3（自动）
                                            │
   12/2（默认 23:59 PT）             ─────►│   ← cron 翻 is_open_for_editing OFF
                                            │       （超级管理员仍可绕过编辑闸门，
                                            │        见 07-maintenance）
                                            │
   12 月 — 次年 1 月                        │
   ├─ 超级管理员复核数据                    │
   ├─ 导出年度 Excel + PDF                  │
   └─ 移交 JEAL 编辑                        │
                                            │
   2 月 — 5 月（典型，**不强制**）         │   ← 手动发表到 JEAL
   └─ JEAL 收录该报告                       │      实际期号视编辑日程
                                            │
   6/30（学年）                       ─────►─┴─  财政年结束（信息字段）
```

> **重点**：10/1、12/2 是**默认值**。超级管理员可在 `app/(authentication)/admin/survey-dates/page.tsx` 内按学年覆盖。

> **JEAL 发表是手动的。** 系统不会自动推到 JEAL。数据库里的 `publication_date` 只是参考，真实发表在 **2–5 月** 之间起伏，看 JEAL 编辑当年节奏。

## 各步骤代码位置

| 步骤 | 文件 / 路由 |
|---|---|
| 默认日期计算 | `lib/surveyDates.ts:getSurveyDates()` |
| 单年覆盖 UI | `app/(authentication)/admin/survey-dates/page.tsx` |
| 单年覆盖 API | `app/api/admin/...`（admin 下 set-dates handler） |
| 手动群发 | `app/(authentication)/admin/broadcast/BroadcastClient.tsx` |
| 群发 API | `app/api/admin/broadcast/route.ts` |
| Cron handler（每天 2 次） | `app/api/cron/check-form-schedules/route.ts` |
| Cron 调度 | `vercel.json` |
| 邮件模板 | `lib/emailTemplate.ts` + `email_template` 表 |
| 强制开/关 | `app/api/admin/manual-open-forms/route.ts` 等 |
| 年度 Excel/PDF | `app/(authentication)/admin/year-end-reports/page.tsx`、`lib/excelExporter.ts`、`lib/pdfExporter.ts` |
| 参与情况报告 | `app/(authentication)/admin/participation-reports/page.tsx` |

## 默认日期，精确版（PT）

| 字段 | 默认值 |
|---|---|
| `opening_date` | 学年 10/1 00:00 |
| `closing_date` | 学年 12/2 23:59 |
| `fiscal_year_start` | 前一年 7/1 |
| `fiscal_year_end` | 学年 6/30 |
| `publication_date` | 次年 2/1 |

> Prisma schema 注释里写"default Dec 1"，`lib/surveyDates.ts` 里是 12/2。**以代码为准**，注释错。

## Cron 怎么跑

`vercel.json` 写：

```
0 8 * * *   →  UTC 08:00（PT 凌晨）
0 20 * * *  →  UTC 20:00（PT 中午）
```

每次 handler 做：

1. 鉴权：必须有 `Authorization: Bearer $CRON_SECRET`（Vercel 自动加；手动调用要自己加）
2. 取活动的 `SurveySession`
3. 对每个：
   - `now ≥ openingDate` 且 `notifiedOnOpen=false` → 发 `broadcast_open_forms`，翻该年所有 `Library_Year.is_open_for_editing=true`
   - `now ≥ closingDate − 7d` 且 `notifiedClosingReminder=false` → 发 `broadcast_closing_reminder`
   - `now ≥ closingDate` 且 `notifiedOnClose=false` → 翻 `is_open_for_editing=false`
4. 写审计日志

幂等性：每个动作都用 `SurveySession` 上的标志位卡死，重跑不会重发。

## 三种群发

| key | 触发 | 主题模板 |
|---|---|---|
| `broadcast_announcement` | 手动 | "CEAL Statistics Survey — opens {{openingDate}}" |
| `broadcast_open_forms` | 自动（开窗日） | "CEAL Statistics Survey is NOW OPEN" |
| `broadcast_closing_reminder` | 自动（关闭前 7 天） | "Reminder: CEAL Statistics Survey Closes in One Week ({{closingDate}})" |
| `individual_open_forms` | 手动单发 | （单独提醒某个填表人） |

正文存在 Postgres 的 `email_template`，超级管理员在 UI 改。`lib/emailTemplate.ts` 里的默认值是兜底。

## 表单开关

会员能提交，必须**同时满足**：

- 已登录
- 该用户对该 library 有 `member` 角色
- `(library_id, current_year)` 有 `Library_Year` 行
- 该行 `is_open_for_editing=true`

不满足 → API 返 403。超级管理员（和受限的助理管理员）可以绕过，看 `lib/libraryYearHelper.ts:isSuperAdmin()` 与 `07-maintenance.md` 里的 override 模式。

## 年度报告发表

关闭后：

1. 超级管理员去 `/admin/year-end-reports`，选年
2. 单馆或批量（ZIP）导出 Excel / PDF。生成器：`lib/excelExporter.ts`、`lib/pdfExporter.ts`
3. `/admin/participation-reports` 看谁交了谁没交
4. **系统外**，把结果交给 JEAL 编辑，登在某期 JEAL（典型 2–5 月）
5. 发表后翻 `PublishedReport.isPublished=true`，`/statistics/pdf` 才显示

没有自动推送到 JEAL。也没有自动 PDF 推送。`publication_date` 只是参考。

## 日期需要调整怎么办

进 `app/(authentication)/admin/survey-dates/page.tsx`：

- 改活动 `SurveySession` 的 `openingDate` / `closingDate`
- 下次 cron 拾起新值
- 改成**已过去**的日期 → 下次 cron 必发，注意
- 改成**未来更晚**的日期 → 旧标志不会自动重置；如要重新发关闭提醒，手动把 `notifiedClosingReminder=false`

## Cron 坏了怎么办

超级管理员有手动 override：

- `app/api/admin/manual-open-forms/route.ts` — 立即开
- 同样有关闭端点
- Broadcast 页面有"立即发送"按钮

是兜底工具。优先修复 cron。

下一篇：`06-deployment.md`。
