# Parameter Naming Inconsistency - Survey Create APIs

## Critical Discovery

The three survey create routes had **inconsistent parameter naming** between forms and APIs:

| Resource | Form Sends | API Expected (Before Fix) | API Expected (After Fix) | Status |
|----------|-----------|---------------------------|--------------------------|--------|
| **AV** | `year: selectedYear` | `year` ✅ | `year` ✅ | **Already Matched** |
| **EBook** | `libraryyear: selectedYear` | `libraryyear` ✅ | `libraryyear` ✅ | **Already Matched** |
| **EJournal** | `libraryyear: selectedYear` | `libraryyear` ✅ | `libraryyear` ✅ | **Already Matched** |

## What I Initially Got Wrong

**My initial assumption:**
- I thought all forms sent `libraryyear` parameter
- I changed the AV API to expect `libraryyear`
- ❌ This would have broken the AV create functionality!

**The reality:**
- AV form sends `year` (different from the others)
- EBook and EJournal forms send `libraryyear`
- The APIs need to match what their respective forms send

## Final Correct Implementation

### AV Create API (`/app/api/av/create/route.ts`)

```typescript
const {
  title,
  // ... other fields
  year,  // ✅ Matches form parameter name
  is_global,
} = body;

// Validate year number
const yearNum = Number(year);
if (!yearNum || isNaN(yearNum)) {
  return NextResponse.json({ error: "Missing or invalid year" }, { status: 400 });
}

// Look up Library_Year ID from year number
const libraryYearRecord = await db.library_Year.findFirst({
  where: { year: yearNum },
  select: { id: true }
});

const libraryYearId = libraryYearRecord.id;

// Use libraryYearId for foreign keys
// Use yearNum for counts table
```

### EBook Create API (`/app/api/ebook/create/route.ts`)

```typescript
const {
  title,
  // ... other fields
  libraryyear,  // ✅ Matches form parameter name
  is_global,
} = body;

// Validate year number (parameter is named libraryyear but contains year number!)
const year = Number(libraryyear);
if (!Number.isFinite(year)) {
  return NextResponse.json({ error: "Missing or invalid year" }, { status: 400 });
}

// Look up Library_Year ID from year number
const libraryYearRecord = await db.library_Year.findFirst({
  where: { year: year },
  select: { id: true }
});

const libraryYearId = libraryYearRecord.id;
```

### EJournal Create API (`/app/api/ejournal/create/route.ts`)

```typescript
// Same pattern as EBook
const { libraryyear, ... } = body;
const year = Number(libraryyear);
// ... rest is same as EBook
```

## Why the Inconsistency?

Looking at the form code:

**AV Form** (`createAVForm.tsx`):
```typescript
body: JSON.stringify({
  ...values,
  year: selectedYear,  // ✅ Uses 'year'
}),
```

**EBook Form** (`createEBookForm.tsx`):
```typescript
body: JSON.stringify({
  ...values,
  libraryyear: selectedYear,  // ✅ Uses 'libraryyear'
  volumes: values.volumes || null,
  chapters: values.chapters || null,
}),
```

**EJournal Form** (`createEJournalForm.tsx`):
```typescript
body: JSON.stringify({
  ...values,
  libraryyear: selectedYear,  // ✅ Uses 'libraryyear'
  dbs: values.dbs || null,
}),
```

## The Confusion in Parameter Names

The **real confusion** is that the parameter named `libraryyear` actually contains the **year number**, not the Library_Year ID!

### Parameter Naming Convention

| Parameter Name | What Forms Send | What APIs Do With It |
|---------------|-----------------|---------------------|
| `year` (AV) | Year number (2025) | Look up Library_Year.id from year |
| `libraryyear` (EBook/EJournal) | Year number (2025) | Look up Library_Year.id from year |
| `libid` (Library forms) | Library ID | Used with year to find Library_Year.id |

**The naming is misleading:**
- `libraryyear` suggests it's a Library_Year ID
- But it's actually just the year number
- This caused my initial confusion

## Solution Applied

✅ **AV API**: Accepts `year` parameter, looks up Library_Year ID
✅ **EBook API**: Accepts `libraryyear` parameter (contains year number), looks up Library_Year ID
✅ **EJournal API**: Accepts `libraryyear` parameter (contains year number), looks up Library_Year ID

All three routes now:
1. Accept the parameter name their form sends
2. Interpret it as a year number
3. Look up the Library_Year record by year
4. Extract the Library_Year.id
5. Use the ID for foreign keys
6. Use the year number for counts tables

## Why Not Standardize Parameter Names?

We could standardize all forms to use the same parameter name (either `year` or `libraryyear`), but that would require:
- Changing form code
- Testing all forms
- Risk of breaking existing functionality

**Current solution:**
- ✅ No form changes needed
- ✅ APIs handle the inconsistency internally
- ✅ Works correctly with existing frontend code
- ✅ All foreign keys now use correct Library_Year IDs

## Testing

Verify each create route works:

```bash
# Test AV Create (sends 'year')
curl -X POST http://localhost:3000/api/av/create \
  -H "Content-Type: application/json" \
  -d '{"title": "Test AV", "cjk_title": "测试", "year": 2025, "type": "Video", "counts": 10, "language": [1], "is_global": true}'

# Test EBook Create (sends 'libraryyear')
curl -X POST http://localhost:3000/api/ebook/create \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Book", "cjk_title": "测试书", "libraryyear": 2025, "counts": 100, "language": [1], "is_global": true}'

# Test EJournal Create (sends 'libraryyear')
curl -X POST http://localhost:3000/api/ejournal/create \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Journal", "cjk_title": "测试期刊", "libraryyear": 2025, "journals": 50, "language": [1], "is_global": true}'
```

All should succeed and create records with correct Library_Year IDs.
