# CEAL Database — UI Unification Plan

> **Purpose:** Identify all UI inconsistencies across the site and provide a concrete plan to standardize titles, button placement, page layout, spacing, and component usage.

---

## 1. Executive Summary

After auditing every page in the application, the following categories of inconsistency were found:

| Category | Severity | Pages Affected |
|---|---|---|
| **Page title size/style** | High | ~15 pages |
| **Button placement (top vs bottom)** | High | ~12 pages |
| **Container/wrapper inconsistency** | Medium | ~10 pages |
| **Page description style** | Medium | ~10 pages |
| **Breadcrumb usage** | Medium | ~8 pages |
| **Button component source** | Medium | ~6 pages |
| **Card vs raw HTML sections** | Low | ~5 pages |
| **Spacing/padding patterns** | Low | ~8 pages |
| **Accessibility & heading hierarchy** | High | ~18 pages |

---

## 2. Detailed Findings

### 2.1 Page Title (`h1`) Size & Style

**Problem:** Titles vary between `text-2xl`, `text-3xl`, and unstyled `<h1>` tags across pages.

| Page | Current Title Style | 
|---|---|
| `/admin` (dashboard) | `text-2xl font-bold` via CardTitle |
| `/admin/forms` | `text-3xl font-bold` + Badge |
| `/admin/forms/[libid]/*` (10 form pages) | `text-3xl font-bold text-gray-900` |
| `/admin/reports` | `text-3xl font-bold` |
| `/admin/users` | `text-2xl font-bold` (inside `<h1>`) |
| `/admin/audit-logs` | `text-3xl font-bold text-gray-900` |
| `/admin/survey-dates` | Unstyled `<h1>` (browser default) |
| `/admin/survey-schedule` | `text-3xl font-bold` |
| `/admin/year-end-reports` | `text-3xl font-bold text-foreground` |
| `/admin/participation-reports` | `text-3xl font-bold text-foreground` |
| `/admin/survey/avdb/[year]` | `text-2xl font-bold` |
| `/admin/survey/avdb/create` | `text-2xl font-semibold` |
| `/admin/forms/[libid]/avdbedit` | `text-3xl font-bold tracking-tight` |
| `/admin/forms/[libid]/ebookedit` | `text-3xl font-bold tracking-tight` |
| `/libraries` | Unstyled `<h1>` (browser default) |
| `/statistics` | `text-3xl font-bold text-gray-900` |
| `/` (homepage) | `text-4xl+` custom hero |

**Target Standard:**
```
<h1 className="text-3xl font-bold text-gray-900 mb-2">Page Title</h1>
<p className="text-muted-foreground">Page description text.</p>
```

**Changes Required:**
- [ ] `/admin/users` — Change `text-2xl` to `text-3xl`, add `text-gray-900`
- [ ] `/admin/survey-dates` — Add `text-3xl font-bold text-gray-900` to `<h1>`
- [ ] `/admin/survey/avdb/[year]` — Change `text-2xl` to `text-3xl`, change `font-bold` to match
- [ ] `/admin/survey/avdb/create` — Change `text-2xl font-semibold` to `text-3xl font-bold text-gray-900`
- [ ] `/libraries` (LibrariesClient) — Add `text-3xl font-bold text-gray-900` to `<h1>`
- [ ] Homepage (`/`) — Keep as-is (hero section is intentionally different)

---

### 2.2 Page Description Text

**Problem:** Description paragraphs under titles use different text classes.

| Page | Description Style |
|---|---|
| `/admin/forms` | `text-gray-600 text-sm` |
| `/admin/audit-logs` | `text-gray-600` |
| `/admin/survey-dates` | `text-gray-600` |
| `/admin/survey-schedule` | `text-gray-600` |
| `/admin/year-end-reports` | `text-muted-foreground` |
| `/admin/participation-reports` | `text-muted-foreground` |
| `/admin/users` | `text-muted-foreground text-sm` |
| `/admin/survey/avdb/[year]` | `text-muted-foreground text-sm` |

**Target Standard:**
```
<p className="text-muted-foreground">Description here.</p>
```
No `text-sm` on page-level descriptions (reserve `text-sm` for card-level or form-level descriptions).

**Changes Required:**
- [ ] `/admin/forms` — Change `text-gray-600 text-sm` to `text-muted-foreground`
- [ ] `/admin/audit-logs` — Change `text-gray-600` to `text-muted-foreground`
- [ ] `/admin/survey-dates` — Change `text-gray-600` to `text-muted-foreground`
- [ ] `/admin/survey-schedule` — Change `text-gray-600` to `text-muted-foreground`
- [ ] `/admin/users` — Remove `text-sm`, use `text-muted-foreground`
- [ ] `/admin/survey/avdb/[year]` — Remove `text-sm` from page description

---

### 2.3 Button Placement (Top vs Bottom)

**Problem:** Action buttons appear at the top of the page on some pages and at the bottom on others.

| Page | Button Position | Button Type |
|---|---|---|
| `/admin` (dashboard) | Inside cards (middle of page) | Navigation cards |
| `/admin/forms` | N/A (navigation links only) | — |
| `/admin/forms/[libid]/*` (10 forms) | **Top** (toolbar) + **Bottom** (submit) | Instructions toggle + Submit |
| `/admin/reports` | **Bottom** of each card section | Export buttons |
| `/admin/year-end-reports` | **Top** (year selector area) + per-card | Export All + individual |
| `/admin/participation-reports` | **Top** (year selector area) + per-card | Batch + individual |
| `/admin/users` | Inside `UserRoleManager` component | — |
| `/admin/survey-dates` | **Bottom** of form | Submit button |
| `/admin/survey-schedule` | **Bottom** of form | Submit button |
| `/admin/broadcast` | Inside form steps | — |

**Target Standard:**
- **Page-level action buttons** (Export All, Create New, etc.) → **Top right**, aligned with the page title in a flex row
- **Form submit/save buttons** → **Bottom** of the form (this is already correct)
- **Toolbar buttons** (Instructions toggle, Past Years) → **Top**, between title and content (this is already correct on form pages)

**Changes Required:**
- [ ] `/admin/reports` — Move primary export buttons to the top (next to year selector), keep individual export buttons inline
- [ ] Standardize pattern: Title row = `flex justify-between items-center` with title on left, primary action on right

---

### 2.4 Container & Wrapper Inconsistency

**Problem:** Pages use different wrapper patterns.

| Page | Wrapper |
|---|---|
| `/admin` | `<Container>` |
| `/admin/forms` | `<Container>` inside `<main>` |
| `/admin/forms/[libid]/*` | `<Container>` |
| `/admin/reports` | `<Container>` |
| `/admin/users` | `<Container>` |
| `/admin/audit-logs` | `<div className="container mx-auto px-4 py-8">` |
| `/admin/survey-dates` | `<Container>` → `max-w-5xl mx-auto` |
| `/admin/survey-schedule` | `<Container className="py-8">` |
| `/admin/year-end-reports` | `<div className="container mx-auto px-6 py-8">` |
| `/admin/participation-reports` | `<div className="container mx-auto px-6 py-8">` |
| `/admin/survey/avdb/[year]` | `<Container className="bg-white pb-12 max-w-full">` |
| `/statistics` | `<Container className="py-12 max-w-4xl mx-auto">` |
| `/libraries` | `<main>` → `<Container className="py-8">` |

**Target Standard:**
```tsx
<main>
  <Container className="py-8">
    {/* Page header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
    {/* Page content */}
  </Container>
</main>
```

**Changes Required:**
- [ ] `/admin/audit-logs` — Replace `<div className="container mx-auto px-4 py-8">` with `<Container className="py-8">`
- [ ] `/admin/year-end-reports` — Replace `<div className="container mx-auto px-6 py-8">` with `<Container className="py-8">`
- [ ] `/admin/participation-reports` — Same as above
- [ ] `/admin/survey-schedule` — Already uses `<Container>`, just verify padding consistency

---

### 2.5 Breadcrumb Usage

**Problem:** Some pages have breadcrumbs, others don't. Styles vary.

| Page | Has Breadcrumb | Type |
|---|---|---|
| `/admin` | No | — |
| `/admin/forms` | No | — |
| `/admin/forms/[libid]/*` | Yes | `<AdminBreadcrumb>` |
| `/admin/users` | Yes | `<Breadcrumb>` (shadcn) |
| `/admin/survey-dates` | Yes | `<Breadcrumb>` (shadcn) |
| `/admin/survey-schedule` | No (has back link `← Back to Admin Guide`) | Plain `<Link>` |
| `/admin/audit-logs` | No | — |
| `/admin/reports` | No | — |
| `/admin/year-end-reports` | No | — |
| `/admin/participation-reports` | No | — |
| `/admin/survey/avdb/[year]` | Yes | `<SurveyBreadcrumb>` |
| `/admin/forms/[libid]/avdbedit` | Yes | `<SubscriptionBreadcrumb>` |

**Target Standard:**
All admin sub-pages should have a breadcrumb using `<Breadcrumb>` (shadcn) with consistent structure: `Home / Admin / Page Name`. Top-level admin dashboard does not need breadcrumb.

**Changes Required:**
- [ ] `/admin/audit-logs` — Add breadcrumb
- [ ] `/admin/reports` — Add breadcrumb
- [ ] `/admin/year-end-reports` — Add breadcrumb
- [ ] `/admin/participation-reports` — Add breadcrumb
- [ ] `/admin/survey-schedule` — Replace back-link with breadcrumb
- [ ] `/admin/broadcast` — Add breadcrumb (currently inside BroadcastClient)

---

### 2.6 Button Component Source

**Problem:** Two different `Button` components are used across pages.

| Import Path | Pages Using It |
|---|---|
| `@/components/Button` (custom) | `/admin/survey-dates`, `/admin/survey-schedule`, `/admin/broadcast`, `/admin/superguide`, `/admin/published-reports`, signin page |
| `@/components/ui/button` (shadcn) | `/admin/forms/[libid]/*`, `/admin/reports`, `/admin/year-end-reports`, `/admin/participation-reports`, `/statistics` |

**Target Standard:**
Use `@/components/ui/button` (shadcn) everywhere for consistency. The custom `@/components/Button` can remain for the public-facing auth pages if it provides a distinct style.

**Changes Required:**
- [ ] `/admin/survey-dates` — Switch from `@/components/Button` to `@/components/ui/button`
- [ ] `/admin/survey-schedule` — Same
- [ ] `/admin/broadcast` — Same
- [ ] `/admin/superguide` — Same
- [ ] `/admin/published-reports` — Same

---

### 2.7 Header Area Spacing

**Problem:** The gap between breadcrumb → title → description → content varies.

**Target Standard:**
```
Breadcrumb: mb-4
Title block: mb-8 (contains h1 mb-2 + description)
Content: starts directly after
```

**Changes Required:**
- Apply consistent `mb-8` to the header section across all pages
- Ensure breadcrumb uses `mb-4` spacing before the title

---

### 2.8 Card Usage for Sections

**Problem:** Some pages use shadcn `Card` components for content sections while others use raw `<div>` with border/shadow.

| Page | Card Style |
|---|---|
| `/admin/year-end-reports` | shadcn `<Card>` |
| `/admin/participation-reports` | shadcn `<Card>` |
| `/admin/survey-dates` | Raw `<div>` with `bg-white rounded-lg border` |
| `/admin/survey-schedule` | Raw `<div>` with `bg-white rounded-lg shadow` |

**Target Standard:**
Use shadcn `<Card>` for all content sections within admin pages.

**Changes Required:**
- [ ] `/admin/survey-dates` — Wrap form in `<Card>` + `<CardHeader>` + `<CardContent>`
- [ ] `/admin/survey-schedule` — Same

---

### 2.9 Accessibility & Heading Hierarchy

**Problem:** Heading levels (`h1`–`h6`) are used inconsistently and sometimes violate the semantic document outline required by screen readers and accessibility standards (WCAG 2.1 Level AA). Several pages also lack proper ARIA attributes, `<label>` associations, and landmark roles.

#### 2.9.1 Heading Hierarchy Violations

Every page should have **exactly one `<h1>`**, and headings must not skip levels (e.g., `h1 → h3` without an `h2` in between).

| Page | Issue |
|---|---|
| `/admin` (dashboard) | **No `<h1>` at all.** Page starts with `<h2>` sections ("E-Resource Editor Section", "Super Admin Toolkit"). Screen readers cannot identify the page topic. |
| `/admin/forms` | `<h1>` is unstyled ("Statistics Forms"). Then jumps to `<h2>` for sections — **correct hierarchy** but `<h3>` inside FAQ accordion is fine. |
| `/admin/forms/[libid]/*` (10 form pages) | **Correct.** `<h1>` for page title, form sections handled by shared components. |
| `/admin/survey-dates` | `<h1>` is unstyled. Jumps to `<h3>` ("Currently Active Survey Dates") **skipping `<h2>`**. Then uses `<h2>` for the form section — out of order. |
| `/admin/survey-schedule` | **Correct.** `<h1>` → `<h2>` → `<h3>` → `<h4>` → `<h5>` (in email preview). Good hierarchy. |
| `/admin/broadcast` (BroadcastClient) | `<h1>` present. But then uses `<h2>` and `<h3>` inconsistently — some `<h3>` appear before any `<h2>` in certain step states. Success screen jumps to `<h2>` then `<h3>`. |
| `/admin/superguide` (AdminHelpClient) | `<h1>` present. **Correct** `<h1>` → `<h2>` → `<h3>` structure throughout. However, has **duplicate `id` attributes** on headings (e.g., multiple `id="editingothertextonthesite"`, `id="openingupasurveyforagiventimeperiod"`), which breaks anchor navigation and is invalid HTML. |
| `/admin/audit-logs` | **Correct.** Single `<h1>`, no sub-headings on the page itself. |
| `/admin/year-end-reports` | **Correct.** `<h1>` → `CardTitle` (which renders `<h3>` by default in shadcn). |
| `/admin/participation-reports` | **Correct.** Same pattern as year-end-reports. |
| `/admin/published-reports` | Heading structure handled in client component. Needs verification. |
| `/admin/survey/avdb/[year]` | **Correct.** Single `<h1>`. |
| `/admin/survey/avdb/create` | Uses `<h1>` with `text-2xl font-semibold` — heading level is correct but style is inconsistent (covered in 2.1). |
| `/admin/forms/[libid]/avdbedit` | Uses `<h2>` for error states ("Library ID Missing", "Invalid Library ID") but `<h1>` for the main view. Inconsistent: error pages should also use `<h1>`. |
| `/admin/forms/[libid]/ebookedit` | Same issue as avdbedit — error states use `<h2>` instead of `<h1>`. |
| `/libraries` (LibrariesClient) | `<h1>` is unstyled ("Institution Information") — heading level correct but no `<h2>` sub-sections. |
| `/statistics` | **Correct.** Single `<h1>`, `CardTitle` for sub-sections. |
| `/` (homepage) | **Correct.** Single `<h1>` hero. |

**Target Standard:**
```
h1 — Page title (exactly one per page)
  h2 — Major section headings
    h3 — Sub-section headings
      h4 — Sub-sub-section (rare, e.g., modal titles, email preview sections)
```
Never skip levels. Every page must have an `<h1>`.

**Changes Required:**
- [ ] `/admin` (dashboard) — Add an `<h1>` (e.g., "Admin Dashboard" or the welcome greeting) before the section `<h2>` elements
- [ ] `/admin/survey-dates` — Change the `<h3>` ("Currently Active Survey Dates") to `<h2>` so it follows the `<h1>` without skipping
- [ ] `/admin/broadcast` — Audit each step state to ensure `<h2>` always appears before `<h3>` within that view
- [ ] `/admin/superguide` — Fix duplicate `id` attributes on headings (6+ duplicates)
- [ ] `/admin/forms/[libid]/avdbedit` — Change `<h2>` to `<h1>` in error state renders
- [ ] `/admin/forms/[libid]/ebookedit` — Same as avdbedit

#### 2.9.2 Missing Form Labels & Associations

**Problem:** Some `<input>` elements use adjacent `<label>` elements without `htmlFor`/`id` pairing, or use `<div>`/`<p>` as visual labels without semantic association. While shadcn form components handle this internally, custom forms do not.

| Page | Issue |
|---|---|
| `/admin/survey-dates` | `<label>` uses `className` block text but has no `htmlFor` linking to the `<input>`. Screen readers cannot associate label with field. |
| `/admin/survey-schedule` | Same issue — labels exist visually but lack `htmlFor`/`id` pairing. |
| `/statistics` | Custom dropdown trigger and year buttons lack `aria-label` for screen readers. |

**Target Standard:**
```tsx
<label htmlFor="opening-date" className="...">Opening Date *</label>
<input id="opening-date" type="date" ... />
```
All interactive elements must have an accessible name — either via `<label htmlFor>`, `aria-label`, or `aria-labelledby`.

**Changes Required:**
- [ ] `/admin/survey-dates` — Add `htmlFor`/`id` pairs to all 3 form fields (year, opening date, closing date)
- [ ] `/admin/survey-schedule` — Add `htmlFor`/`id` pairs to all 3 form fields
- [ ] `/statistics` — Add `aria-label` to the institution dropdown trigger and year selector buttons

#### 2.9.3 Interactive Elements Without Accessible Names

**Problem:** Some buttons use only icons (no visible text or `aria-label`) and some clickable `<div>` or `<span>` elements should be `<button>` elements.

| Page | Issue |
|---|---|
| `/admin/survey-schedule` | Close button in modal is `<button>×</button>` with no `aria-label`. |
| `/admin/survey-schedule` | "Delete" text links in the session table are plain `<button>` elements without `aria-label` describing which session they delete. |
| `/statistics` | "Clear all" and individual badge remove buttons lack descriptive `aria-label`. |

**Target Standard:**
- Icon-only buttons must have `aria-label="Close"`, `aria-label="Delete session for year 2025"`, etc.
- Clickable elements must use `<button>` or `<a>`, never raw `<div onClick>` or `<span onClick>`.

**Changes Required:**
- [ ] `/admin/survey-schedule` — Add `aria-label="Close preview"` to the modal close button
- [ ] `/admin/survey-schedule` — Add `aria-label` to delete buttons in session table (e.g., `aria-label={\`Delete schedule for ${session.academicYear}\`}`)
- [ ] `/statistics` — Add `aria-label` to Clear all button and badge remove buttons

#### 2.9.4 Landmark Roles & Page Structure

**Problem:** Not all pages use semantic HTML landmarks (`<main>`, `<nav>`, `<section>`, `<aside>`) consistently.

| Page | Issue |
|---|---|
| `/admin/audit-logs` | No `<main>` wrapper — content starts with `<div>`. |
| `/admin/year-end-reports` | Outer wrapper is `<div className="min-h-screen">` — should be `<main>`. |
| `/admin/participation-reports` | Same as year-end-reports. |
| `/libraries` | Uses `<main>` — **correct**. |
| `/statistics` | Uses `<main>` — **correct**. |

**Target Standard:**
Every page should wrap its content in `<main>` for landmark navigation. The site layout likely provides a `<nav>` already.

**Changes Required:**
- [ ] `/admin/audit-logs` — Wrap content in `<main>`
- [ ] `/admin/year-end-reports` — Change outer `<div>` to `<main>`
- [ ] `/admin/participation-reports` — Same

#### 2.9.5 Color Contrast & Focus Indicators

**Problem:** Several status indicators and informational text use light color combinations that may not meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text). Additionally, custom interactive elements (plain `<button>`, `<a>`) may not have visible focus outlines.

**General audit needed:**
- [ ] Verify all `text-gray-400`, `text-gray-500` on `bg-white` or `bg-gray-50` backgrounds meet 4.5:1 contrast
- [ ] Verify colored status badges (green on green, blue on blue, etc.) meet contrast requirements
- [ ] Ensure all custom buttons and links show a visible `:focus-visible` ring
- [ ] Check that `disabled` button states are still readable

---

## 3. Priority Order for Implementation

### Phase 1: High Impact (Quick Wins)
1. **Standardize all `<h1>` titles** to `text-3xl font-bold text-gray-900 mb-2`
2. **Fix heading hierarchy violations** — add missing `<h1>` tags, fix skipped levels
3. **Standardize all page descriptions** to `text-muted-foreground` (no `text-sm`)
4. **Unify Button imports** to `@/components/ui/button` on all admin pages

### Phase 2: Layout Consistency
5. **Standardize Container wrappers** — all admin pages use `<Container className="py-8">`
6. **Add breadcrumbs** to all admin sub-pages that are missing them
7. **Standardize header spacing** — `mb-8` for header block, `mb-4` for breadcrumb
8. **Add `<main>` landmarks** to pages missing them

### Phase 3: Component & Accessibility Refinement
9. **Convert raw div sections to Card** on survey-dates and survey-schedule pages
10. **Move primary action buttons** to top-right alignment where applicable
11. **Review and unify info/alert box patterns** across pages
12. **Add `htmlFor`/`id` label associations** on all custom form inputs
13. **Add `aria-label`** to all icon-only buttons and non-descriptive interactive elements
14. **Fix duplicate HTML `id` attributes** in superguide page
15. **Audit color contrast** for status badges and light-colored text

---

## 4. Pages Checklist

| Page | Title | Description | Container | Breadcrumb | Buttons | Cards | A11y Headings |
|---|---|---|---|---|---|---|
| `/` (homepage) | ✅ (hero) | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `/admin` | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ❌ no h1 |
| `/admin/forms` | ✅ | ❌ text-sm | ✅ | ❌ | ✅ | ✅ | ✅ |
| `/admin/forms/[libid]/*` (x10) | ✅ | N/A | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/reports` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `/admin/users` | ❌ 2xl | ❌ text-sm | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/audit-logs` | ✅ | ❌ gray-600 | ❌ raw div | ❌ | ✅ | ✅ | ✅ (no main) |
| `/admin/survey-dates` | ❌ unstyled | ❌ gray-600 | ✅ | ✅ | ❌ wrong Button | ❌ raw div | ❌ skips h2 |
| `/admin/survey-schedule` | ✅ | ❌ gray-600 | ✅ | ❌ back-link | ❌ wrong Button | ❌ raw div | ✅ |
| `/admin/broadcast` | ✅ | ✅ | ✅ | ✅ | ❌ wrong Button | ✅ | ❌ h3 before h2 |
| `/admin/superguide` | ✅ | ✅ | ✅ | ✅ | ❌ wrong Button | ✅ | ❌ dup IDs |
| `/admin/year-end-reports` | ✅ | ✅ | ❌ raw div | ❌ | ✅ | ✅ | ✅ (no main) |
| `/admin/participation-reports` | ✅ | ✅ | ❌ raw div | ❌ | ✅ | ✅ | ✅ (no main) |
| `/admin/published-reports` | ✅ | ✅ | ✅ | ❌ | ❌ wrong Button | ✅ | ✅ |
| `/admin/survey/avdb/[year]` | ❌ 2xl | ❌ text-sm | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/survey/avdb/create` | ❌ 2xl semi | N/A | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/forms/[libid]/avdbedit` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ error h2 |
| `/admin/forms/[libid]/ebookedit` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ error h2 |
| `/libraries` | ❌ unstyled | N/A | ✅ | ❌ | ✅ | ✅ | ✅ |
| `/statistics` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |

**Legend:** ✅ = matches standard, ❌ = needs fix, N/A = not applicable

---

## 5. Estimated Effort

| Phase | Changes | Estimated Files | Complexity |
|---|---|---|---|
| Phase 1 | Titles + Heading hierarchy + Descriptions + Buttons | ~15 files | Low |
| Phase 2 | Containers + Breadcrumbs + Spacing + Landmarks | ~12 files | Medium |
| Phase 3 | Cards + Button position + Labels + ARIA + Contrast | ~10 files | Medium |

**Total estimated:** ~30+ file modifications, mostly small find-and-replace style edits with some structural additions for accessibility.
