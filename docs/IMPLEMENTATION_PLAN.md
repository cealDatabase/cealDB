# CEAL数据库 - 代码修改实施计划

> **基于**：`OPEN_CLOSE_FORMS_CASCADE_REPORT.md` 中提取的高优先级、中优先级和新需求
> 
> **创建日期**：2026-05-06 21:50 UTC-4
> **最后更新**：2026-05-06 23:05 UTC-4
> 
> **状态**：进行中 (Task 1 & 2 完成, Task 3 全部完成, Task 3e 测试验证进行中)

---

## 任务清单概览

| 任务 | 优先级 | 状态 | 预估工时 | 实际完成时间 |
|------|--------|------|---------|-------------|
| 1. 三张大表 API 添加 `is_open_for_editing` 检查 | 🔴 高 | ✅ 完成 | 2h | 2026-05-06 21:53 |
| 2. 三种状态 UI 时间显示重新设计 | 🟡 中 | ✅ 完成 | 3h | 2026-05-06 21:57 |
| 3. 大表用户勾选条目显示 + 自定义数量 | 🟢 新需求 | ✅ 完成 | 6h | 2026-05-06 23:05 |

---

## 执行记录

### 2026-05-06 21:53 UTC-4 - Task 1 完成 ✅
**改动文件**：
- `app/api/av/create/route.ts` - 添加 `isSuperAdmin` 导入和权限检查
- `app/api/ebook/create/route.ts` - 同上
- `app/api/ejournal/create/route.ts` - 同上

**验证点**：
- [ ] 开表时所有用户可正常创建记录
- [ ] 关表后普通用户收到 403 错误
- [ ] 关表后 Super Admin 仍可创建记录

### 2026-05-06 21:57 UTC-4 - Task 2 完成 ✅
**改动文件**：
- `data/fetchSurveyDates.ts` - 添加 `status`, `daysUntilOpening`, `daysUntilClosing`, `daysSinceClosed`
- `app/(authentication)/admin/forms/page.tsx` - 使用新状态系统，更新 badge 和 FAQ 显示

**四种状态显示**：
| 状态 | 颜色 | 显示文本 |
|------|------|---------|
| Not Set | 灰色 | "To Be Determined" |
| Scheduled | 蓝色 | "Opens in N days (日期)" |
| Open | 绿色脉动 | "Open - Closes in N days" |
| Closed | 红色 | "Closed N days ago" |

### 2026-05-06 22:25 UTC-4 - Task 3 后端完成 ✅
**已完成**：
- ✅ 数据库 Migration - 在 junction tables 添加 `is_selected`, `custom_count`, `updated_at`
- ✅ 创建三个 save-selections API 端点 (`/api/survey/av/save-selections`, `/ebook/`, `/ejournal/`)
- ✅ 修改数据获取函数 - `GetAVListWithUserSelections`, `GetEBookListWithUserSelections`, `GetEJournalListWithUserSelections`
- ✅ 修改 page.tsx - 使用新函数并传递用户选择数据
- ✅ 修改客户端组件类型 - 支持 `listAVWithSelection` 等新类型
- ✅ 后端测试验证 - 数据库 schema、API 端点、数据获取函数均正常工作

**验证结果**：
- ✅ 数据库表结构验证：`is_selected` (BOOLEAN), `custom_count` (INTEGER), `updated_at` (TIMESTAMP)
- ✅ 测试数据插入成功：3 条测试记录 (libraryYearId=2816, listAVId=1,2,3)
- ✅ upsert 操作测试成功：创建、更新、删除均正常

---

## 任务 1：三张大表 API 添加 `is_open_for_editing` 检查

### 1.1 问题描述

三张大表的 create API 未检查 `Library_Year.is_open_for_editing`，导致：
- 关表后普通用户仍可能通过 API 创建记录
- 与十张小表的权限控制不一致

### 1.2 涉及文件

| 文件 | 类型 | 修改内容 |
|------|------|---------|
| `app/api/av/create/route.ts` | API | 添加 `is_open_for_editing` 检查 |
| `app/api/ebook/create/route.ts` | API | 添加 `is_open_for_editing` 检查 |
| `app/api/ejournal/create/route.ts` | API | 添加 `is_open_for_editing` 检查 |
| `lib/libraryYearHelper.ts` | 工具 | 确认 `isSuperAdmin()` 可用 |

### 1.3 实施步骤

**步骤 1**：确认 `lib/libraryYearHelper.ts` 已有 `isSuperAdmin()` 函数

```typescript
// 应该已有此函数，不需要修改
export async function isSuperAdmin(): Promise<boolean> {
  // 从 role cookie 检查是否包含 '1'
}
```

**步骤 2**：修改 `app/api/av/create/route.ts`（第 40-75 行区域）

在获取 `libraryYearRecord` 后，添加权限检查：

```typescript
// 在 line 57 之后（获取 libraryYearRecord 后）
if (libraryYearRecord) {
  // 检查 is_open_for_editing
  if (!libraryYearRecord.is_open_for_editing) {
    const superAdmin = await isSuperAdmin();
    if (!superAdmin) {
      return NextResponse.json(
        { 
          error: "Form submission not allowed", 
          message: "This survey is currently closed. Please contact the administrator for assistance." 
        },
        { status: 403 }
      );
    }
    console.log("[AV Create] Super Admin bypassing is_open_for_editing check");
  }
}
```

**步骤 3**：同样修改 `app/api/ebook/create/route.ts` 和 `app/api/ejournal/create/route.ts`

在获取 `libraryYearRecord` 的相同位置添加相同逻辑。

### 1.4 验证点

- [ ] 开表时所有用户可正常创建记录
- [ ] 关表后普通用户收到 403 错误
- [ ] 关表后 Super Admin 仍可创建记录
- [ ] 错误消息清晰提示 "survey is currently closed"

---

## 任务 2：三种状态 UI 时间显示重新设计

### 2.1 需求描述

按三种状态重新确定 UI 显示的时间：

| 状态 | 英文 | 触发条件 | 显示内容 |
|------|------|---------|---------|
| 已设定但未开放 | Scheduled | `opening_date` 存在且未来，或 `is_open_for_editing = false` | 显示 "Opens in N days" + 开表日 |
| 开放中 | Open | `is_open_for_editing = true` | 显示 "Closes in N days" + 时间段 |
| 已关闭 | Closed | `closing_date` 已过，或关表操作后 | 显示 "Closed since {date}" + 已过时间 |

### 2.2 涉及文件

| 文件 | 类型 | 修改内容 |
|------|------|---------|
| `app/(authentication)/admin/forms/page.tsx` | 页面 | 修改状态 badge 和 FAQ 显示逻辑 |
| `components/EnhancedSessionQueue.tsx` | 组件 | 已支持三种状态，验证一致性 |
| `components/FormStatusBadge.tsx` | 组件 | 按三种状态显示不同样式 |
| `data/fetchSurveyDates.ts` | 数据 | 添加状态计算字段 |

### 2.3 实施步骤

**步骤 1**：在 `data/fetchSurveyDates.ts` 添加状态计算

```typescript
export async function getFormattedSurveyDates(year?: number): Promise<FormattedSurveyDates> {
  // ... 现有代码获取 dates ...
  
  const now = new Date();
  const openingDateTime = surveyDates.openingDate ? new Date(surveyDates.openingDate) : null;
  const closingDateTime = surveyDates.closingDate ? new Date(surveyDates.closingDate) : null;
  
  // 计算三种状态
  let status: 'scheduled' | 'open' | 'closed' | 'not_set' = 'not_set';
  let daysUntilOpening: number | null = null;
  let daysUntilClosing: number | null = null;
  let daysSinceClosed: number | null = null;
  
  if (!isStoredInDatabase) {
    status = 'not_set';
  } else if (isCurrentlyOpen) {
    status = 'open';
    if (closingDateTime) {
      daysUntilClosing = Math.ceil((closingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  } else if (openingDateTime && now < openingDateTime) {
    status = 'scheduled';
    daysUntilOpening = Math.ceil((openingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    status = 'closed';
    if (closingDateTime) {
      daysSinceClosed = Math.floor((now.getTime() - closingDateTime.getTime()) / (1000 * 60 * 60 * 24));
    }
  }
  
  return {
    // ... 现有字段 ...
    status,
    daysUntilOpening,
    daysUntilClosing,
    daysSinceClosed,
  };
}
```

**步骤 2**：修改 `app/(authentication)/admin/forms/page.tsx` 状态显示

替换现有的 `shouldShowGray` 逻辑为三种状态显示：

```typescript
// 移除旧的：
// const shouldShowGray = !areDatesSet || hasClosed

// 使用新的 status 字段：
const { status, daysUntilOpening, daysUntilClosing, daysSinceClosed } = surveyDates;

// 三种状态 badge
const statusConfig = {
  not_set: {
    text: "To Be Determined",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    icon: "Clock",
  },
  scheduled: {
    text: daysUntilOpening ? `Opens in ${daysUntilOpening} day${daysUntilOpening !== 1 ? 's' : ''}` : "Scheduled",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    icon: "Calendar",
  },
  open: {
    text: daysUntilClosing ? `Open - Closes in ${daysUntilClosing} day${daysUntilClosing !== 1 ? 's' : ''}` : "Open",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: "CheckCircle",
  },
  closed: {
    text: daysSinceClosed ? `Closed ${daysSinceClosed} day${daysSinceClosed !== 1 ? 's' : ''} ago` : "Closed",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    icon: "XCircle",
  },
}[status];
```

**步骤 3**：更新 FAQ 动态文本

```typescript
const dynamicInstructionGroup = {
  ...instructionGroup,
  "Survey Time Frame and Publication": [
    {
      question: "Input/Edit Time Frame",
      answer: status === 'not_set'
        ? `The ${previousYear} - ${currentYear} Online Survey input/edit dates are to be determined.`
        : status === 'scheduled'
        ? `The ${previousYear} - ${currentYear} Online Survey will open on ${openingDate} (12:00 AM ET) and close on ${closingDate} (11:59 PM PT). ${daysUntilOpening ? `Opening in ${daysUntilOpening} days.` : ''}`
        : status === 'open'
        ? `The ${previousYear} - ${currentYear} Online Survey is currently open for editing. Input/edit time frame: ${openingDate} to ${closingDate} (11:59 pm Pacific Time). ${daysUntilClosing ? `Closes in ${daysUntilClosing} days.` : ''}`
        : `The ${previousYear} - ${currentYear} Online Survey closed on ${closingDate}. Survey period has ended.`,
    },
    // ... Publication Date 同理 ...
  ],
};
```

### 2.4 视觉设计规范

| 状态 | 背景色 | 文字色 | 图标 | 动画 |
|------|--------|--------|------|------|
| Not Set | `bg-gray-100` | `text-gray-600` | Clock | 无 |
| Scheduled | `bg-blue-100` | `text-blue-800` | Calendar | 无 |
| Open | `bg-green-100` | `text-green-800` | CheckCircle | 脉动/呼吸效果 |
| Closed | `bg-red-100` | `text-red-800` | XCircle | 无 |

### 2.5 验证点

- [ ] Not Set：灰色显示 "To Be Determined"
- [ ] Scheduled：蓝色显示倒计时 "Opens in N days"
- [ ] Open：绿色显示倒计时 "Closes in N days" + 脉动效果
- [ ] Closed：红色显示 "Closed N days ago"
- [ ] FAQ 文本随状态动态变化

---

## 任务 3：大表用户勾选条目显示 + 自定义数量

### 3.1 需求描述

**背景**：当前用户在大表中勾选条目后，下次返回时需要重新勾选，没有记忆功能。

**需求**：
1. 用户勾选的条目要在列表中高亮/预勾选显示
2. 用户自定义的数量要显示在对应条目中
3. 即使中断后返回，也能看到之前的操作状态

### 3.2 数据库设计

#### 方案选择

**选择**：在现有的 junction table（`LibraryYear_ListAV` 等）中添加字段

**原因**：
- 已有 `libraryYear_ListAV` 表记录 Library-Year-AV 的关联
- 在此基础上添加 `is_selected` 和 `custom_count` 字段最自然
- 不需要创建新表，最小化改动

#### Prisma Schema 修改

**文件**：`prisma/schema/library_year_list.prisma`

```prisma
model LibraryYear_ListAV {
  libraryyear_id Int
  listav_id      Int
  
  // 新增字段
  is_selected    Boolean? @default(false)  // 用户是否勾选了此条目
  custom_count   Int?                      // 用户自定义数量（覆盖默认）
  updated_at     DateTime? @default(now()) // 记录更新时间
  
  Library_Year   Library_Year @relation(fields: [libraryyear_id], references: [id])
  List_AV        List_AV      @relation(fields: [listav_id], references: [id])

  @@id([libraryyear_id, listav_id])
}

model LibraryYear_ListEBook {
  libraryyear_id Int
  listebook_id   Int
  
  // 新增字段
  is_selected    Boolean? @default(false)
  custom_count   Int?
  updated_at     DateTime? @default(now())
  
  Library_Year   Library_Year @relation(fields: [libraryyear_id], references: [id])
  List_EBook   List_EBook   @relation(fields: [listebook_id], references: [id])

  @@id([libraryyear_id, listebook_id])
}

model LibraryYear_ListEJournal {
  libraryyear_id  Int
  listejournal_id Int
  
  // 新增字段
  is_selected    Boolean? @default(false)
  custom_count   Int?
  updated_at     DateTime? @default(now())
  
  Library_Year    Library_Year  @relation(fields: [libraryyear_id], references: [id])
  List_EJournal List_EJournal @relation(fields: [listejournal_id], references: [id])

  @@id([libraryyear_id, listejournal_id])
}
```

### 3.3 API 设计

#### 3.3.1 保存用户选择 API

**新端点**：
- `POST /api/survey/av/save-selections`
- `POST /api/survey/ebook/save-selections`
- `POST /api/survey/ejournal/save-selections`

**请求体**：
```typescript
{
  year: number,
  libraryId: number,
  selections: [
    { listId: number, isSelected: boolean, customCount?: number },
    // ...
  ]
}
```

**逻辑**：
1. 验证用户有权限编辑该 Library-Year
2. 使用 `upsert` 更新 junction table
3. 返回成功状态

**实现示例**（AV）：

```typescript
// app/api/survey/av/save-selections/route.ts
export async function POST(req: Request) {
  const { year, libraryId, selections } = await req.json();
  
  // 获取 Library_Year ID
  const libraryYear = await db.library_Year.findFirst({
    where: { year, library: libraryId },
    select: { id: true, is_open_for_editing: true }
  });
  
  if (!libraryYear) return NextResponse.json({ error: "Library year not found" }, { status: 404 });
  
  // 权限检查（参考十张小表逻辑）
  if (!libraryYear.is_open_for_editing) {
    const superAdmin = await isSuperAdmin();
    if (!superAdmin) return NextResponse.json({ error: "Survey closed" }, { status: 403 });
  }
  
  // 批量 upsert
  await db.$transaction(
    selections.map(sel => 
      db.libraryYear_ListAV.upsert({
        where: {
          libraryyear_id_listav_id: {
            libraryyear_id: libraryYear.id,
            listav_id: sel.listId
          }
        },
        update: {
          is_selected: sel.isSelected,
          custom_count: sel.customCount,
          updated_at: new Date()
        },
        create: {
          libraryyear_id: libraryYear.id,
          listav_id: sel.listId,
          is_selected: sel.isSelected,
          custom_count: sel.customCount
        }
      })
    )
  );
  
  return NextResponse.json({ success: true });
}
```

#### 3.3.2 获取用户选择 API（整合到现有数据获取）

修改现有的数据获取函数，加入用户选择状态：

**文件**：`data/fetchPrisma.ts`

```typescript
// 新增或修改函数
export const getListAVWithUserSelections = async (year: number, libraryId: number) => {
  const libraryYearId = await getLibraryYearId(libraryId, year);
  if (!libraryYearId) return { globalAVs: [], userSelections: [] };
  
  // 获取全局 AV 列表
  const globalAVs = await db.list_AV.findMany({
    where: { is_global: true },
    include: {
      List_AV_Counts: {
        where: { year, ishidden: false },
        select: { titles: true }
      },
      List_AV_Language: true
    }
  });
  
  // 获取用户选择
  const userSelections = await db.libraryYear_ListAV.findMany({
    where: { libraryyear_id: libraryYearId },
    select: {
      listav_id: true,
      is_selected: true,
      custom_count: true
    }
  });
  
  return { globalAVs, userSelections };
};
```

### 3.4 前端修改

#### 3.4.1 数据表组件修改

**文件**：`app/(authentication)/admin/survey/avdb/components/avDataTableClient.tsx`（假设文件路径类似）

```typescript
interface AVDataTableClientProps {
  data: any[];
  year: number;
  roleIdPassIn?: string;
  libid?: number;
  userRoles?: string[] | null;
  userSelections?: Array<{
    listav_id: number;
    is_selected: boolean;
    custom_count: number | null;
  }>;
  // ...
}

// 初始化时根据 userSelections 预勾选
const [selectedRows, setSelectedRows] = useState<Set<number>>(() => {
  if (userSelections) {
    return new Set(userSelections.filter(s => s.is_selected).map(s => s.listav_id));
  }
  return new Set();
});

// 显示自定义数量
const getDisplayCount = (avId: number, defaultCount: number) => {
  const userSel = userSelections?.find(s => s.listav_id === avId);
  if (userSel?.custom_count != null) {
    return userSel.custom_count;
  }
  return defaultCount;
};

// 保存按钮（新增）
const handleSaveSelections = async () => {
  const selections = Array.from(selectedRows).map(id => ({
    listId: id,
    isSelected: true,
    customCount: customCounts[id] // 用户自定义的数量
  }));
  
  await fetch('/api/survey/av/save-selections', {
    method: 'POST',
    body: JSON.stringify({ year, libraryId: libid, selections })
  });
  
  toast.success("Selections saved!");
};
```

#### 3.4.2 UI 设计

| 状态 | 视觉表现 |
|------|---------|
| 已勾选 | Checkbox 选中 + 行高亮（浅蓝色背景） |
| 未勾选 | Checkbox 未选中 + 默认背景 |
| 有自定义数量 | 数量输入框显示用户值，旁边显示默认值的对比 |
| 仅默认数量 | 显示默认数量（不可编辑或编辑后标记为自定义） |

**建议的自定义数量显示方式**：

```tsx
// 在表格列中
<td className="text-right">
  <div className="flex items-center gap-2 justify-end">
    {hasCustomCount && (
      <span className="text-xs text-blue-600">
        Custom: {customCount}
      </span>
    )}
    <Input 
      type="number"
      value={displayCount}
      onChange={(e) => handleCustomCountChange(row.id, e.target.value)}
      className={cn(
        "w-20 text-right",
        hasCustomCount && "border-blue-500 bg-blue-50"
      )}
    />
    {hasCustomCount && (
      <button 
        onClick={() => resetToDefault(row.id)}
        className="text-xs text-gray-500 hover:text-gray-700"
        title="Reset to default"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    )}
  </div>
</td>
```

### 3.5 涉及文件清单

| 层级 | 文件 | 修改类型 |
|------|------|---------|
| Database | `prisma/schema/library_year_list.prisma` | 添加字段 |
| Database | `prisma/schema.prisma`（合并后） | 添加字段 |
| API | `app/api/survey/av/save-selections/route.ts` | 新建 |
| API | `app/api/survey/ebook/save-selections/route.ts` | 新建 |
| API | `app/api/survey/ejournal/save-selections/route.ts` | 新建 |
| Data | `data/fetchPrisma.ts` | 修改（添加获取用户选择的函数） |
| Data | `lib/av-utils.ts` | 修改（添加用户选择相关函数） |
| 页面 | `app/(authentication)/admin/survey/avdb/[year]/page.tsx` | 修改（传递 userSelections） |
| 页面 | `app/(authentication)/admin/survey/ebook/[year]/page.tsx` | 修改 |
| 页面 | `app/(authentication)/admin/survey/ejournal/[year]/page.tsx` | 修改 |
| 组件 | `app/(authentication)/admin/survey/avdb/components/avDataTableClient.tsx` | 修改（预勾选 + 自定义数量） |
| 组件 | `app/(authentication)/admin/survey/ebook/components/ebookDataTableClient.tsx` | 修改 |
| 组件 | `app/(authentication)/admin/survey/ejournal/components/ejournalDataTableClient.tsx` | 修改 |

### 3.6 实施步骤

**步骤 1**：数据库 Migration

```bash
# 1. 修改 schema 文件
# 2. 生成 migration
npx prisma migrate dev --name add_user_selections_to_survey_tables

# 3. 生成 client
npx prisma generate
```

**步骤 2**：创建 API 端点（三个文件）

**步骤 3**：修改数据获取函数

**步骤 4**：修改前端组件

**步骤 5**：测试验证

### 3.7 验证点

- [ ] 用户勾选条目后，刷新页面仍保持勾选状态
- [ ] 用户修改自定义数量后，刷新页面显示自定义值
- [ ] "Reset to default" 按钮可清除自定义数量
- [ ] "Save Selections" 按钮保存当前所有状态
- [ ] 不同用户的选择互不干扰
- [ ] 不同年份的选择互不干扰
- [ ] 关表后仍可查看已保存的选择（只读）

---

## 执行顺序建议

```
Phase 1: 高优先级（任务 1）
├── 修改三个 create API
├── 测试权限控制
└── 部署到生产

Phase 2: 中优先级（任务 2）
├── 修改 fetchSurveyDates
├── 修改 forms page UI
├── 更新 FAQ 动态文本
└── 测试三种状态显示

Phase 3: 新需求（任务 3）
├── 数据库 migration
├── 创建三个 save-selections API
├── 修改数据获取函数
├── 修改三个大表的前端组件
└── 完整测试流程
```

---

## 附录

### A. 相关文件路径速查

```
# 任务 1
app/api/av/create/route.ts
app/api/ebook/create/route.ts
app/api/ejournal/create/route.ts
lib/libraryYearHelper.ts

# 任务 2
app/(authentication)/admin/forms/page.tsx
data/fetchSurveyDates.ts
components/FormStatusBadge.tsx
components/EnhancedSessionQueue.tsx

# 任务 3
prisma/schema/library_year_list.prisma
data/fetchPrisma.ts
lib/av-utils.ts
app/api/survey/av/save-selections/route.ts (新建)
app/api/survey/ebook/save-selections/route.ts (新建)
app/api/survey/ejournal/save-selections/route.ts (新建)
app/(authentication)/admin/survey/avdb/[year]/page.tsx
app/(authentication)/admin/survey/avdb/components/avDataTableClient.tsx
```

### B. 数据库字段说明

| 表名 | 字段名 | 类型 | 说明 |
|------|--------|------|------|
| `LibraryYear_ListAV` | `is_selected` | `Boolean?` | 用户是否勾选此 AV 条目 |
| `LibraryYear_ListAV` | `custom_count` | `Int?` | 用户自定义的 counts 数量 |
| `LibraryYear_ListAV` | `updated_at` | `DateTime?` | 最后更新时间 |

（EBook、EJournal 同理）

---

**End of Plan**

> 下一步：根据此计划创建分支，逐个任务执行。
> 
> 建议创建 tracking issue 或使用 todo list 标记进度。
