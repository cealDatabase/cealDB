# Library_Year ID vs Year Number - Complete Audit

## Summary of Findings

✅ **FIXED - 3 Critical Issues**
❌ **POTENTIAL ISSUES - 0 routes need attention**
✅ **VERIFIED CORRECT - Multiple routes already working properly**

---

## 1. CREATE ROUTES ✅ FIXED

### Issues Found & Fixed
All three create routes were confusing Library_Year ID with year number.

**Files Fixed:**
- `/app/api/ebook/create/route.ts` ✅
- `/app/api/ejournal/create/route.ts` ✅
- `/app/api/av/create/route.ts` ✅

**What was wrong:**
- Forms pass year number (2025)
- APIs were treating it as Library_Year ID
- Would fail with 404 "Library year not found"

**How it was fixed:**
```typescript
// Before: Expected Library_Year ID
const libraryYearId = Number(libraryyear);
const libraryYearRecord = await db.library_Year.findUnique({
  where: { id: libraryYearId }  // ❌ Would look for id=2025
});

// After: Accept year number, look up ID
const year = Number(libraryyear);
const libraryYearRecord = await db.library_Year.findFirst({
  where: { year: year }  // ✅ Looks for year=2025
});
const libraryYearId = libraryYearRecord.id; // Gets correct ID (e.g., 5)
```

**Additional fix for AV:**
- Added missing `libraryyear` field assignment
- Added missing `LibraryYear_ListAV` many-to-many relationship

---

## 2. UPDATE ROUTES ✅ VERIFIED CORRECT

**Files Checked:**
- `/app/api/ebook/update/route.ts` ✅
- `/app/api/ejournal/update/route.ts` ✅
- `/app/api/av/update/route.ts` ✅

**Status:** No issues found

**Why they're correct:**
- Update routes only modify the counts table (`List_EBook_Counts`, etc.)
- They use `year` parameter for the counts table (which stores year number)
- They don't modify the `libraryyear` foreign key in the main table
- Pattern is correct:
  ```typescript
  const { id, year, counts, ... } = body;
  const y = Number(year);
  
  // Update/create counts record
  await tx.list_EBook_Counts.updateMany({
    where: { listebook: ebookId, year: y },  // ✅ year number is correct here
    data: { titles, volumes, chapters, ... }
  });
  ```

---

## 3. SUBSCRIBE/UNSUBSCRIBE ROUTES ✅ VERIFIED CORRECT

**Files Checked:**
- `/app/api/ebook/subscribe/route.ts` ✅
- `/app/api/ebook/unsubscribe/route.ts` ✅
- `/app/api/ejournal/subscribe/route.ts` ✅
- `/app/api/ejournal/unsubscribe/route.ts` ✅
- `/app/api/av/subscribe/route.ts` ✅
- `/app/api/av/unsubscribe/route.ts` ✅
- `/app/api/av/subscription-status/route.ts` ✅

**Status:** Already correct

**Why they're correct:**
- These routes properly look up Library_Year record from library + year
- Then use the ID for the many-to-many relationship
- Pattern is already correct:
  ```typescript
  const { libid, year, recordIds } = body;
  
  // Find Library_Year record by library + year
  let libraryYearRecord = await db.library_Year.findFirst({
    where: {
      library: Number(libid),
      year: Number(year),
    },
  });
  
  const libraryYearId = libraryYearRecord.id; // ✅ Correct
  
  // Use ID for m-m relationship
  await db.libraryYear_ListEBook.create({
    data: {
      libraryyear_id: libraryYearId,  // ✅ Correct - using ID
      listebook_id: Number(recordId),
    },
  });
  ```

---

## 4. COPY RECORDS ROUTE ✅ VERIFIED CORRECT

**File Checked:**
- `/app/api/copy-records/route.ts` ✅

**Status:** Correct (was just fixed in previous work)

**Why it's correct:**
- Uses `year` parameter which is the year number
- Directly creates counts records with year number
- Doesn't deal with Library_Year relationships
- Pattern:
  ```typescript
  const { resource, targetYear, records } = body;
  
  // Creates counts records
  await countsModel.create({
    data: {
      [listRefField]: idNum,
      [countsField]: val,
      year: yearNum,  // ✅ Year number is correct for counts table
      ...
    },
  });
  ```

---

## 5. OTHER FORM ROUTES ✅ VERIFIED CORRECT

**Files Checked:**
- `/app/api/personnel/create/route.ts` ✅
- `/app/api/public-services/create/route.ts` ✅
- `/app/api/monographic/create/route.ts` ✅
- `/app/api/serials/create/route.ts` ✅
- `/app/api/electronic/create/route.ts` ✅
- `/app/api/electronic-books/create/route.ts` ✅
- `/app/api/volumeHoldings/create/route.ts` ✅

**Status:** Already correct

**Why they're correct:**
- These routes receive `libid` and `year` parameters
- They look up Library_Year by `library + year` combination
- Then use the `Library_Year.id` for foreign keys
- Pattern is already correct:
  ```typescript
  const { libid, year, ...formData } = body;
  
  // Find unique Library_Year by library + year
  const libraryYear = await db.library_Year.findFirst({
    where: {
      library: Number(libid),
      year: Number(year),
    },
  });
  
  // Use the ID
  const data = {
    libraryyear: libraryYear.id,  // ✅ Correct - using ID
    ...formData
  };
  ```

---

## Key Differences Between Route Types

### Survey Routes (AV, EBook, EJournal)
- **Don't** have library context (global records)
- Forms pass only year number
- Need to look up Library_Year by year only: `findFirst({ where: { year } })`

### Library Form Routes (Personnel, Monographic, etc.)
- **Have** library context (library-specific records)
- Forms pass both `libid` and `year`
- Look up Library_Year by library + year: `findFirst({ where: { library, year } })`

---

## Complete Status Report

| Route Category | Status | Files Count | Issues Found | Issues Fixed |
|---------------|--------|-------------|--------------|--------------|
| Survey Create | ✅ FIXED | 3 | 3 | 3 |
| Survey Update | ✅ OK | 3 | 0 | 0 |
| Survey Subscribe/Unsubscribe | ✅ OK | 7 | 0 | 0 |
| Copy Records | ✅ OK | 1 | 0 | 0 |
| Library Forms Create | ✅ OK | 7+ | 0 | 0 |
| **TOTAL** | **✅ COMPLETE** | **21+** | **3** | **3** |

---

## Conclusion

✅ **All issues have been identified and fixed**

The only problematic routes were the three survey create routes (AV, EBook, EJournal). All other routes were already handling Library_Year correctly.

### What Could Go Wrong in Future

**Watch out for:**
1. New create routes that might make the same mistake
2. Any route that receives `libraryyear` parameter - verify if it's ID or year number
3. When creating many-to-many relationships, always use Library_Year.id
4. When creating counts records, always use the year number

### Testing Checklist

To verify the fixes work:

**EBook Create:**
```bash
# Test creating a new ebook for year 2025
curl -X POST http://localhost:3000/api/ebook/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "cjk_title": "测试书",
    "libraryyear": 2025,
    "counts": 100,
    "volumes": 5,
    "chapters": 50,
    "language": [1, 2],
    "is_global": true
  }'
```

**Verify in database:**
```sql
-- Check main record has correct Library_Year ID
SELECT id, title, libraryyear FROM "List_EBook" ORDER BY id DESC LIMIT 1;

-- Check m-m relationship has correct Library_Year ID
SELECT * FROM "LibraryYear_ListEBook" ORDER BY listebook_id DESC LIMIT 1;

-- Check counts record has correct year number
SELECT * FROM "List_EBook_Counts" ORDER BY id DESC LIMIT 1;

-- Verify Library_Year mapping
SELECT id, year FROM "Library_Year" WHERE year = 2025;
```

All three values should match:
- `List_EBook.libraryyear` = Library_Year.id (e.g., 5)
- `LibraryYear_ListEBook.libraryyear_id` = Library_Year.id (e.g., 5)  
- `List_EBook_Counts.year` = 2025
