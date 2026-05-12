# CEAL数据库 — 开表/关表操作连锁反应完整报告

> **目的**：梳理 Super Admin 开表/关表操作所引发的所有年份、日期、权限、UI 状态变化，作为系统行为的权威参考。
>
> **生成日期**：2026-05-06

---

## 一、核心机制概览

Super Admin 的开表/关表操作通过 `Library_Year.is_open_for_editing` 字段控制。这个布尔字段是整个系统状态的核心开关，配合 `SurveySession` 表实现完整的调度和权限控制。

### 关键API端点

| 操作 | 端点 | 行为 |
|------|------|------|
| 立即开表 | `POST /api/admin/manual-open-forms` | 立即开放指定年份所有表单 |
| 关表/重开 | `PATCH /api/admin/form-session` | `action: "close"` 或 `"reopen"` |
| 自动调度 | `GET /api/cron/check-form-schedules` | Cron 自动处理定时开/关 |
| 广播+开表 | `POST /api/admin/broadcast` | 发送邮件并立即/计划开表 |
| 设置日期 | `POST /api/admin/open-new-year` | 创建/更新 Library_Year 日期 |

### 数据流

```
Super Admin 操作
    ↓
更新 Library_Year.is_open_for_editing
    ↓
（同步）更新 SurveySession.isOpen
    ↓
（同步）更新 ScheduledEvent.status
    ↓
影响所有依赖这些字段的 UI 和 API
```

---

## 二、年份与日期显示逻辑

### 1. 当前年份获取方式

系统多处使用 `new Date().getFullYear()`，存在 **不一致** 风险：

| 位置 | 用途 | 默认逻辑 |
|------|------|---------|
| `app/(authentication)/admin/forms/page.tsx:41` | 表单页面年份 | 当前年 |
| `app/api/*/create/route.ts` (小表) | 查找Library_Year | 当前年，Super Admin 回退到最近年份 |
| `app/api/*/status/[libid]/route.ts` | 状态API | 当前年，回退到最近年份 |
| `app/(authentication)/admin/reports/page.tsx:71` | 报告默认年份 | **当前年 - 1**（去年） |
| `app/(authentication)/admin/survey-dates/page.tsx:18` | 日期管理页面 | 当前年 |
| `app/(authentication)/admin/survey/{avdb,ebook,ejournal}/create/page.tsx` | 大表创建页 | 当前年 |

### 2. "Date TBD" 显示规则

**位置**：`app/(authentication)/admin/forms/page.tsx:147-189`

```typescript
const areDatesSet = surveyDates.isStoredInDatabase
const hasClosed = now > closingDateTime
const shouldShowGray = !areDatesSet || hasClosed
```

| 条件 | 显示内容 | 颜色 |
|------|----------|------|
| 日期未设置 | "Active Survey Period: To Be Determined" | 灰色 |
| 日期已设置但已关闭 | "Survey Period Closed: {开始} - {结束}" | 灰色 |
| 日期已设置且开放 | "Active Survey Period: {开始} - {结束}" | 绿色（脉动） |

### 3. FAQ 动态文本

**位置**：`app/(authentication)/admin/forms/page.tsx:154-170`

| 条件 | "Input/Edit Time Frame" | "Publication Date" |
|------|------------------------|-------------------|
| `areDatesSet = true` | `从 {开始} 到 {结束} (11:59 pm Pacific Time)` | `将在 {publicationMonth} 发布于 JEAL` |
| `areDatesSet = false` | `日期待定` | `将在 {currentYear+1} 发布` |

### 4. 时区处理

| 显示位置 | 时区 | 备注 |
|----------|------|------|
| 开表日期显示 | `America/New_York` | 东部时间 |
| 关表日期显示 | `America/Los_Angeles` | 太平洋时间 |
| 数据库存储 | UTC | 转换自 Pacific Time |

**存储转换** (`lib/surveyDates.ts:33-50`):

```typescript
// Pacific Midnight = UTC 8 AM (PST) 同日
toPacificMidnight: Date.UTC(y, m-1, d, 8, 0, 0)

// Pacific 11:59 PM = UTC 7:59 AM 次日
toPacificEndOfDay: Date.UTC(y, m-1, d+1, 7, 59, 0)
```

### 5. 日期来源优先级

`data/fetchSurveyDates.ts:22-52`：

1. **优先**：`Library_Year.opening_date` / `closing_date`（数据库）
2. **回退**：默认 Oct 1 - Dec 2（`lib/surveyDates.ts:53-56`）

`isStoredInDatabase` 标志区分两种情况，影响 "TBD" 显示。

---

## 三、十张小表 (Small Forms) — 编辑权限控制

### 表单清单

| # | 表单名称 | 数据表 | 路径 |
|---|---------|--------|------|
| 1 | Monographic Acquisitions | `Monographic_Acquisitions` | `/admin/forms/[libid]/monographic` |
| 2 | Physical Volume Holdings | `Volume_Holdings` | `/admin/forms/[libid]/volumeHoldings` |
| 3 | Serial Titles | `Serials` | `/admin/forms/[libid]/serials` |
| 4 | Holdings of Other Materials | `Other_Holdings` | `/admin/forms/[libid]/otherHoldings` |
| 5 | Unprocessed Backlog | `Unprocessed_Backlog_Materials` | `/admin/forms/[libid]/unprocessed` |
| 6 | Fiscal Support | `Fiscal_Support` | `/admin/forms/[libid]/fiscal` |
| 7 | Personnel Support | `Personnel_Support` | `/admin/forms/[libid]/personnel` |
| 8 | Public Services | `Public_Services` | `/admin/forms/[libid]/public-services` |
| 9 | Electronic | `Electronic` | `/admin/forms/[libid]/electronic` |
| 10 | Electronic Books | `Electronic_Books` | `/admin/forms/[libid]/electronic-books` |

### 权限判断流程

```
用户打开表单页面
    ↓
useFormStatusChecker 调用 /api/{form}/status/[libid]
    ↓ 返回 LibraryYearStatus
    ↓ (libraryYearStatus.year)
调用 /api/form-permissions?year={year}
    ↓ 调用 checkFormEditPermission(year, userRoles)
    ↓ 返回 FormPermission
综合得到：canEdit / isReadOnly / isPrivilegedPostClosing
```

### 角色矩阵

`lib/formPermissions.ts:13-111`

| 角色 | 角色ID | 开表期间 | 关表后 | 开表前 |
|------|--------|---------|--------|--------|
| **Super Admin** | `1` | ✅ 可编辑 | ✅ 可编辑 (`isPrivilegedPostClosing=true`) | ✅ 可编辑 |
| **Editor** | `3` | ✅ 可编辑 | ❌ 只读 | ❌ 只读 |
| **Member** | `2` | ✅ 可编辑 | ❌ 只读 | ❌ 只读 |

> **注意**：当年份没有 `SurveySession` 记录时，`checkFormEditPermission` 默认允许所有人编辑（`canEdit: true`）。

### 后端 API 双重防护

所有10张小表的 `create` API 都有以下保护（参考 `app/api/monographic/create/route.ts:52-102`）：

```typescript
// ① 年份回退（Super Admin 特权）
let libraryYear = await db.library_Year.findFirst({
  where: { library: libraryId, year: currentYear },
});
if (!libraryYear) {
  if (await isSuperAdmin()) {
    libraryYear = await db.library_Year.findFirst({
      where: { library: libraryId },
      orderBy: { year: 'desc' }, // 最近年份
    });
  }
}

// ② 关表后编辑检查（Super Admin 特权）
if (!libraryYear.is_open_for_editing) {
  if (!(await isSuperAdmin())) {
    return 403; // 普通用户被拒绝
  }
  // Super Admin 继续执行
}
```

### Status API 行为

`app/api/personnel/status/[libid]/route.ts:18-44`（其他9个status API结构相同）：

- **当前年份不存在** → 自动回退到最近年份
- 这意味着**任何用户**（不只是 Super Admin）都能看到回退年份的数据
- `is_open_for_editing` 直接来自该回退年份的记录

### 关表后 UI 表现

`components/forms/shared/FormWrapper.tsx:73-89`:

```tsx
{isReadOnly && (
  <Card className="border-blue-200 bg-blue-50">
    <Lock /> Read-Only Mode
    <p>{readOnlyReason || "The survey period has closed..."}</p>
  </Card>
)}
```

| 用户 | 看到 |
|------|------|
| Super Admin | 表单可编辑，显示"Read-Only Mode"提示但带特权解锁 |
| Editor/Member | 表单只读，所有输入框禁用 |
| 任何人（无 Library_Year） | 显示 "Form Not Available" 错误页 |

---

## 四、三张大表 (Big Forms / Survey Tables) — 特殊逻辑

### 表单清单

| # | 表单 | 主表 | 计数表 | 路径 |
|---|------|------|--------|------|
| 1 | AV Database | `List_AV` | `List_AV_Counts` | `/admin/survey/avdb` |
| 2 | EBook Database | `List_EBook` | `List_EBook_Counts` | `/admin/survey/ebook` |
| 3 | EJournal Database | `List_EJournal` | `List_EJournal_Counts` | `/admin/survey/ejournal` |

### 与小表的关键区别

| 特性 | 十张小表 | 三张大表 |
|------|----------|----------|
| 数据结构 | 一库一条记录（upsert） | 多条记录（按语言/类型） |
| 权限检查 | 严格检查 `is_open_for_editing` | **仅检查 Library_Year 是否存在** |
| Super Admin 年份回退 | ✅ 有 | ✅ 有（仅 monographic 等小表完整实现）|
| 创建入口 | 表单内保存 | 独立 `/create` 页面 |

### 大表 create API 权限分析

**`app/api/av/create/route.ts:40-73`**:

```typescript
if (!is_global) {
  if (library_id) {
    // ✅ 检查 Library_Year 存在
    const record = await db.library_Year.findFirst({
      where: { year: yearNum, library: Number(library_id) },
    });
    if (!record) return 404;
    // ❌ 没有检查 is_open_for_editing
  }
}
```

**`app/api/ebook/create/route.ts:40-74`** 和 **`app/api/ejournal/create/route.ts:39-73`** 同样处理。

### ⚠️ 风险点

三张大表的 create API **没有 `is_open_for_editing` 检查**：

- 关表后，任何能访问创建页面的用户仍可调用 API 创建记录
- 前端 UI 可能不显示创建按钮，但 API 层无防护
- **建议**：参照小表加入 `isSuperAdmin()` + `is_open_for_editing` 检查

### 大表创建页面年份来源

`app/(authentication)/admin/survey/{avdb,ebook,ejournal}/create/page.tsx`：

```typescript
const year = searchParams.year || new Date().getFullYear().toString();
```

- 默认当前年份
- 可通过 URL 参数 `?year=2025` 指定
- **不依赖** `Library_Year.is_open_for_editing`

---

## 五、Reports 报告系统的年份处理

### 报告页面年份选择

`app/(authentication)/admin/reports/page.tsx:71-78`:

```typescript
const currentYear = new Date().getFullYear() - 1;  // ⚠️ 去年！
const years = [];
for (let i = 0; i < 20; i++) {
  years.push(currentYear - i);  // 过去20年
}
setSelectedSurveyYear(currentYear.toString());  // 默认选中去年
```

> **重要**：报告页默认显示**去年**作为初始年份，与表单页（当前年）**不一致**。

### 可用年份 API

`app/api/available-years/route.ts:23-88`:

| 角色 | 返回的年份 |
|------|-----------|
| Super Admin (1) / Editor (3) | 所有 `Library_Year` 中存在的年份（除1900外） |
| Member (2) | 仅该图书馆 `Entry_Status.espublished = true` 的年份 |

### 报告生成 API

`app/api/export/supplementary-reports/route.ts:59-83`:

- **必须传 `year` 参数**，否则返回 400
- 不依赖当前日期、不依赖 `is_open_for_editing`
- 报告内容由数据库中该年份的实际数据决定

### Reports 与开关表的关系

| 操作 | 对 Reports 的影响 |
|------|------------------|
| 关表 | ❌ 无影响。报告仍可按所选年份生成 |
| 开表 | ❌ 无影响。报告系统独立运作 |
| 数据被修改（关表后 Super Admin 编辑） | ⚠️ 报告内容会反映最新数据 |
| `Entry_Status.espublished` 切换 | ✅ 影响 Member 用户在报告页能看到的年份 |

---

## 六、Session 状态与 Queue UI

### 三种状态

`components/EnhancedSessionQueue.tsx:33-43`:

| 状态 | 条件 | UI 显示 |
|------|------|---------|
| `scheduled` | 有日期但 `is_open_for_editing = false` 且未到开表日 | 蓝色 "Scheduled" + "Opens in N days" |
| `active` | `is_open_for_editing = true` | 绿色 "Active" |
| `closed` | `is_open_for_editing = false` 且已过关表日 | 灰色 "Closed" |

### ScheduledEvent 三种事件

| 事件类型 | 含义 | 触发 |
|---------|------|------|
| `BROADCAST` | 发送广播邮件 | Resend 自动调度 |
| `FORM_OPENING` | 开表 | Cron 任务 |
| `FORM_CLOSING` | 关表 | Cron 任务 |

每个事件有 `pending` / `completed` / `cancelled` 三种状态。

### 自动 Cron 任务行为

`app/api/cron/check-form-schedules/route.ts:320-480`:

**开表分支**（`SurveySession.openingDate <= now AND notifiedOnOpen = false`）:
1. `updateMany Library_Year` → `is_open_for_editing: true`
2. 发送广播给所有用户
3. 标记 `SurveySession.notifiedOnOpen = true`（防重复）
4. 写 audit log `SYSTEM_OPEN_FORMS`

**关表分支**（`SurveySession.closingDate <= now AND notifiedOnClose = false`）:
1. `updateMany Library_Year` → `is_open_for_editing: false`
2. **验证** 所有表单已关闭
3. **仅向 Super Admin** 发送关表通知（用户不收到）
4. 标记 `SurveySession.notifiedOnClose = true`
5. 写 audit log `SYSTEM_CLOSE_FORMS`

---

## 七、连锁反应总览

### 当 Super Admin 开表（立即）

```
POST /api/admin/manual-open-forms
└── updateMany Library_Year { is_open_for_editing: true }
    ├── 十张小表：所有成员可编辑，绿色 "Active"
    ├── 三张大表：可继续创建记录
    ├── Reports：无直接影响
    ├── Session Queue：状态变 "Active"
    └── ScheduledEvent FORM_OPENING → completed
```

### 当 Super Admin 关表（立即）

```
PATCH /api/admin/form-session { action: "close" }
└── updateMany Library_Year { is_open_for_editing: false }
    ├── 十张小表：
    │   ├── Super Admin → 仍可编辑（isPrivilegedPostClosing=true，看到 lock icon）
    │   └── Editor/Member → 只读，"Survey period has closed"
    ├── 三张大表：
    │   ├── 前端：不应显示创建按钮（取决于 UI）
    │   └── ⚠️ API 层未严格阻止（潜在风险）
    ├── Reports：无影响
    ├── 邮件通知：仅 Super Admin 收到关表确认（用户不收到）
    └── Session Queue：状态变 "Closed"
```

### 当 Super Admin 通过 Broadcast 立即开表

```
POST /api/admin/broadcast { sendImmediately: true }
└── updateMany Library_Year:
    ├── is_open_for_editing: true
    ├── opening_date / closing_date 写入
    ├── fiscal_year_start / fiscal_year_end 写入
    ├── publication_date 写入
    └── broadcast_sent: true
└── upsert SurveySession { isOpen: true, notifiedOnOpen: true }
└── 创建 3 个 ScheduledEvent（BROADCAST / FORM_OPENING / FORM_CLOSING）
└── Resend 立即发送广播邮件
└── Forms 页面：FAQ 动态更新为新日期，badge 变绿
└── Reports：无影响
```

### 当 Super Admin 计划开表（未来）

```
POST /api/admin/broadcast { sendImmediately: false }
└── updateMany Library_Year:
    ├── is_open_for_editing: false  ← 仍关闭
    ├── 写入 opening/closing dates
    └── broadcast_sent: false
└── 创建 SurveySession（isOpen: false）
└── 创建 3 个 pending ScheduledEvent
└── Resend 计划发送（scheduledAt）
└── Forms 页面：badge 变灰显示 "Scheduled"
└── 等到 openingDate，Cron 自动触发开表流程
```

---

## 八、需要关注的风险点和建议

### 🔴 高优先级

#### 1. 三张大表 API 未检查 `is_open_for_editing`

**问题**：`api/av/create`、`api/ebook/create`、`api/ejournal/create` 关表后仍可创建记录。

**建议**：参考小表加入：

```typescript
if (!libraryYearRecord.is_open_for_editing) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Form is not available" }, { status: 403 });
  }
}
```

#### 2. 年份显示不一致

- 表单页：当前年
- 报告页：当前年 - 1
- API 创建：当前年（Super Admin 回退）

**建议**：建立一个权威的"当前调查年份"来源（如 `SurveySession.academicYear` 中最新的开放/已关闭项），所有页面统一使用。

### 🟡 中优先级

#### 3. Date TBD 与 Closed 视觉相同

两者都显示灰色 badge，可能导致混淆。

**建议**：区分两种状态：
- TBD：灰色 + "To Be Determined"
- Closed：橙色或棕色 + "Survey Period Closed"

#### 4. Status API 的回退行为

所有10个小表的 status API 在当前年份不存在时，**对所有用户**都回退到最近年份。这导致：

- 普通成员看到 N-1 年的数据，可能误以为是当前年
- `year` 字段会跟着回退，但 UI 可能不明显标注

**建议**：在 UI 上明显标注"当前查看年份：YYYY"，特别是当与 `currentYear` 不一致时。

### 🟢 低优先级

#### 5. 时区处理

开表日 East Coast、关表日 West Coast 显示，对用户可能造成混淆。

**建议**：统一使用 Pacific Time 显示，或显式标注时区。

#### 6. 防重复通知机制

`SurveySession.notifiedOnOpen` / `notifiedOnClose` 一旦置为 `true` 永不重置。如果 Super Admin 关表后又重开，用户**不会再次收到邮件**。

**建议**：在重开（manual-open-forms）时考虑是否重置该标志（当前没有重置）。

---

## 九、关键文件索引

### 后端 API

| 功能 | 文件 |
|------|------|
| 立即开表 | `app/api/admin/manual-open-forms/route.ts` |
| 关表/重开 | `app/api/admin/form-session/route.ts` |
| 自动调度 | `app/api/cron/check-form-schedules/route.ts` |
| 广播+开表 | `app/api/admin/broadcast/route.ts` |
| 设置日期 | `app/api/admin/open-new-year/route.ts` |
| 删除Session | `app/api/admin/delete-session/route.ts` |
| 表单权限 | `app/api/form-permissions/route.ts` |
| 可用年份 | `app/api/available-years/route.ts` |
| 表单状态（10个） | `app/api/{monographic,volumeHoldings,...}/status/[libid]/route.ts` |
| 表单创建（10个） | `app/api/{monographic,volumeHoldings,...}/create/route.ts` |
| 大表创建（3个） | `app/api/{av,ebook,ejournal}/create/route.ts` |
| 报告生成 | `app/api/export/supplementary-reports/route.ts` |

### 前端页面

| 功能 | 文件 |
|------|------|
| Forms 列表 | `app/(authentication)/admin/forms/page.tsx` |
| 广播管理 | `app/(authentication)/admin/broadcast/BroadcastClient.tsx` |
| 日期管理 | `app/(authentication)/admin/survey-dates/page.tsx` |
| 报告页 | `app/(authentication)/admin/reports/page.tsx` |
| 大表创建（3个） | `app/(authentication)/admin/survey/{avdb,ebook,ejournal}/create/page.tsx` |

### 共享库 / Hooks / 组件

| 功能 | 文件 |
|------|------|
| 权限检查逻辑 | `lib/formPermissions.ts` |
| Super Admin 检查 | `lib/libraryYearHelper.ts` |
| 日期计算 | `lib/surveyDates.ts` |
| 日期获取 | `data/fetchSurveyDates.ts` |
| 表单状态 Hook | `hooks/useFormStatusChecker.ts` |
| Form Wrapper | `components/forms/shared/FormWrapper.tsx` |
| Session Queue UI | `components/EnhancedSessionQueue.tsx` |
| 状态 Badge | `components/FormStatusBadge.tsx` / `components/FormsAvailabilityBadge.tsx` |
| 本地时间显示 | `components/LocalDateTime.tsx` |

### 数据模型（Prisma）

- `Library_Year` — 核心表（含 `is_open_for_editing`、`opening_date`、`closing_date`、`broadcast_sent` 等）
- `SurveySession` — 调度状态（含 `isOpen`、`notifiedOnOpen`、`notifiedOnClose`）
- `ScheduledEvent` — 三种事件的状态记录
- `Entry_Status` — 表单提交状态（含 `espublished`）

---

## 十、总结表

| 维度 | 受影响 | 不受影响 |
|------|--------|---------|
| 十张小表编辑 | ✅ Member/Editor 关表后只读 | Super Admin 永远可编辑 |
| 三张大表编辑 | ⚠️ 仅 UI 层受影响（API无防护） | API 层无年份开关检查 |
| Reports 生成 | ❌ 不受开关表影响 | 永远按选定年份生成 |
| 报告页可见年份 | ✅ Member 受 `espublished` 影响 | Super Admin/Editor 看全部 |
| 表单状态 Badge | ✅ 直接反映 `is_open_for_editing` | — |
| 邮件通知 | ✅ 开表通知所有人；关表只通知 Super Admin | — |
| 日期 TBD 显示 | ✅ 仅当 `Library_Year` 无日期数据时 | 关表后改显示 "Closed" |
| Session Queue | ✅ scheduled / active / closed 三状态 | — |
| Audit Log | ✅ 所有开关表操作均记录 | — |

---

**原报告结束**。如需修改建议或代码改动，请基于第八节"风险点和建议"展开讨论。

---

## 附录 A：自原报告以来的变更（更新于 2026-05-11）

### A.1 已解决的风险

| 原风险编号 | 状态 | 实现位置 |
|---|---|---|
| **#1** 三张大表 API 未检查 `is_open_for_editing` | ✅ 已解决 | `app/api/av/create/route.ts`, `app/api/ebook/create/route.ts`, `app/api/ejournal/create/route.ts` 均加入 `is_open_for_editing` + `isSuperAdmin()` 旁路 |
| **#2** 年份显示不一致（forms vs reports） | ✅ 已解决 | 新增 `lib/currentSurveyYear.ts` 与 `app/api/current-survey-year/route.ts`；`/admin/forms` 与 `/admin/reports` 均通过其取年份 |
| **#3** "Date TBD" 与 "Closed" 视觉相同 | ✅ 已解决 | `/admin/forms/page.tsx` 使用四态 `not_set` / `scheduled` / `open` / `closed`，颜色分别为 灰 / 蓝 / 绿 / 红 |
| **#4** Status API 回退年份未在 UI 标注 | ✅ 已解决 | `components/forms/shared/FormWrapper.tsx` 新增黄色横幅，当 `libraryYearStatus.year < calendarYear` 时提示当前查看年份 |
| **#5** 时区处理（开表 ET / 关表 PT） | ⏸️ 设计意图 | 该差异为有意设计，给跨时区用户更多缓冲时间，不视为 bug |
| **#6** 手动重开后 `notifiedOnOpen/Close` 不重置 | ✅ 已解决 | `app/api/admin/manual-open-forms/route.ts` 重开时同时设置 `notifiedOnOpen: true` 与 `notifiedOnClose: false`，让下次到关表日时 cron 仍可发关闭通知 |

### A.2 新增功能：可编辑邮件模板

Super Admin 现可在 `/admin/email-templates` 编辑邮件主题与正文。模板存于新表 `EmailTemplate` 中，使用 `{{placeholder}}` 占位符自动填入年份与日期。

#### 三封广播邮件 + 一封个人重发（共 4 个模板键）

| Key | 用途 | 发送方式 | 触发位置 |
|---|---|---|---|
| **`broadcast_announcement`** | 预公告：通知用户调查 *将* 在某日开放 | **手动** —— Super Admin 在 `/admin/email-templates` 点 "Send broadcast now" | `app/api/admin/email-templates/[key]/send/route.ts` |
| **`broadcast_open_forms`** | 调查 *现在已开放* | **自动** —— 到达开表日期时由 cron 发送（Resend `scheduledAt` 为主，cron backup） | `app/api/cron/check-form-schedules/route.ts` (Step 1 broadcast backup) |
| **`broadcast_closing_reminder`** | 调查将在 1 周后关闭 | **自动** —— 关闭日期前 7 天由 cron 发送 | `app/api/cron/check-form-schedules/route.ts` (Step 2.5 — 新增) |
| `individual_open_forms` | 单用户重发开表通知 | 手动（针对单个用户） | `app/api/admin/send-individual-email/route.ts` |

#### 三封广播的去重机制

| 邮件 | 去重字段（SurveySession） | 重置时机 |
|---|---|---|
| Announcement | `announcementSentAt` (timestamp) | 用作"上次发送时间"展示；不强制只发一次（Super Admin 可重发） |
| Open forms | `notifiedOnOpen` (bool) | `manual-open-forms` 重开时设为 true（不再补发） |
| Closing reminder | `notifiedClosingReminder` (bool) | `manual-open-forms` 重开时设为 false（如果重开并延期，下一个 7 天窗口会再发一次） |

#### 支持的占位符

`{{year}}`, `{{prevYear}}`, `{{nextYear}}`, `{{openingDate}}`（东部时间格式化）, `{{closingDate}}`（太平洋时间格式化）, `{{fiscalYearStart}}`, `{{fiscalYearEnd}}`, `{{publicationMonth}}`, `{{siteUrl}}`。预览页面会拉取最近一条 `SurveySession` 的日期，若无则使用日历年的默认 Oct 1 / Dec 2。

#### 涉及文件

| 文件 | 说明 |
|---|---|
| `prisma/schema/email_template.prisma` | 新模型定义 |
| `prisma/schema/survey_session.prisma` | 新增 `notifiedClosingReminder` 与 `announcementSentAt` 字段 |
| `prisma/migrations/add_email_templates.sql` | 创建 `EmailTemplate` 表 + `SurveySession` 两个新列（也可用 `prisma migrate dev`） |
| `lib/emailTemplate.ts` | 加载、占位符替换、4 个内置默认模板 + delivery 模式标签 |
| `app/api/admin/email-templates/route.ts` | 列表接口（含每个模板的 delivery 模式与会话元数据） |
| `app/api/admin/email-templates/[key]/route.ts` | 详情/保存/重置接口 |
| `app/api/admin/email-templates/[key]/send/route.ts` | **新增** —— Super Admin 手动发送 `broadcast_announcement`（仅 `manual_broadcast` 类型可用；body 需 `{confirm:true}` 否则只 dry-run） |
| `app/api/cron/check-form-schedules/route.ts` | 新增 Step 2.5：关闭日期前 7 天自动发 `broadcast_closing_reminder` |
| `app/(authentication)/admin/email-templates/page.tsx` + `EmailTemplatesClient.tsx` | 编辑器 UI：左侧模板列表 + 右侧 delivery 模式横幅 + 主题/HTML 编辑 + 实时预览 + （仅 `manual_broadcast`）"Send broadcast now" 按钮 |

#### 部署步骤

1. **执行迁移**（任选其一）：
   ```bash
   psql "$DATABASE_URL" -f prisma/migrations/add_email_templates.sql
   # 或
   npx prisma migrate dev --name add_email_templates
   npx prisma generate
   ```
2. 重启 Next.js 服务，访问 `/admin/email-templates`（需 Super Admin 角色）。
3. 第一次进入时模板均显示为"Default"——尚未写入 DB；编辑保存后会写入并标为"Customized"。
4. "Reset to default" 删除 DB 行，恢复内置默认。
5. 三处 send 路径 (`broadcast`, `send-individual-email`, cron 备用发送) 现统一通过 `renderTemplate(...)` 取 HTML，硬编码块已移除/弃用。

#### 与其他模块的关系

- **与 `/admin/broadcast` 的协作**：广播页右侧预览不变，但 HTML 来源已切到 `EmailTemplate`。预览顶部新增链接指向 `/admin/email-templates` 让 Super Admin 直接跳去编辑。
- **与 `/admin/survey-dates` 的协作**：占位符值由 `SurveySession` 自动填入 → 编辑邮件时无需手动输入开/关日期。
- **不发送任何邮件**：本次变更仅替换"邮件内容来源"，未改变发送时机或逻辑。

### A.3 仍待评估

- 邮件正文目前以原始 HTML 文本编辑，未来如果需要可换成 WYSIWYG（如 TipTap/Slate）。
- `EmailTemplate.updated_by` 暂未做外键，仅写入 cookie 中的 `user_id` 作为软追踪。
- 未做模板版本历史；如需"撤回到上次版本"，可加一张 `EmailTemplateRevision` 表。
