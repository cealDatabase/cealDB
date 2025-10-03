# Library_Year ID vs Year Number Fix

## Problem Identified

All three create APIs (AV, EBook, EJournal) were confusing **Library_Year ID** with **year number**, causing incorrect data to be stored in relationships.

### Key Issue

The `Library_Year` table has TWO different fields:
- `id` - Primary key (e.g., 1, 2, 3, 4...)
- `year` - The actual year number (e.g., 2024, 2025, 2026...)

The code was using one variable (`year`) for both purposes, which caused:
1. **Wrong foreign key values** in the many-to-many relationship tables
2. **Incorrect libraryyear references** in List_AV, List_EBook, List_EJournal

### Example of the Problem

If a Library_Year record has:
- `id = 5`
- `year = 2025`

**Before the fix:**
- `libraryyear_id` in relationship table would be set to `2025` ❌ (should be `5`)
- `libraryyear` in main table would be set to `2025` ❌ (should be `5`)
- `year` in counts table would be set to `2025` ✅ (correct!)

**After the fix:**
- `libraryyear_id` in relationship table is set to `5` ✅
- `libraryyear` in main table is set to `5` ✅
- `year` in counts table is set to `2025` ✅

## Solution Implemented

Updated all three create routes to properly distinguish between Library_Year ID and year number:

### Files Fixed
1. `/app/api/ebook/create/route.ts`
2. `/app/api/ejournal/create/route.ts`
3. `/app/api/av/create/route.ts`

### Code Pattern

```typescript
// 1. Accept libraryyear as parameter (this is the Library_Year ID)
const { libraryyear, ...otherFields } = body;

// 2. Validate and store the Library_Year ID
const libraryYearId = Number(libraryyear);
if (!Number.isFinite(libraryYearId)) {
  return NextResponse.json(
    { error: "Missing or invalid libraryyear" },
    { status: 400 }
  );
}

// 3. Fetch the Library_Year record to get the actual year number
const libraryYearRecord = await db.library_Year.findUnique({
  where: { id: libraryYearId },
  select: { year: true }
});

if (!libraryYearRecord) {
  return NextResponse.json(
    { error: "Library year not found" },
    { status: 404 }
  );
}

// 4. Now we have both values - use them correctly
const year = libraryYearRecord.year; // Actual year number (e.g., 2025)

// 5. Use libraryYearId for foreign keys and relationships
await tx.list_EBook.create({
  data: {
    // ... other fields
    libraryyear: libraryYearId,  // ✅ Correct - FK to Library_Year.id
  },
});

await tx.libraryYear_ListEBook.createMany({
  data: [{ 
    libraryyear_id: libraryYearId,  // ✅ Correct - FK to Library_Year.id
    listebook_id: book.id 
  }],
});

// 6. Use year for the counts table (stores actual year number)
await tx.list_EBook_Counts.create({
  data: {
    year,  // ✅ Correct - Actual year number (2025)
    // ... other fields
  },
});
```

## Schema References

### Library_Year Table
```prisma
model Library_Year {
  id                 Int       @id @default(autoincrement())
  library            Int?
  year               Int       // <-- Actual year number
  is_open_for_editing Boolean? @default(false)
  // ... other fields
}
```

### Relationship Tables
```prisma
model LibraryYear_ListEBook {
  libraryyear_id Int           // <-- References Library_Year.id
  listebook_id   Int
  Library_Year   Library_Year  @relation(fields: [libraryyear_id], references: [id])
  List_EBook     List_EBook    @relation(fields: [listebook_id], references: [id])
  
  @@id([libraryyear_id, listebook_id])
}
```

### Main Tables
```prisma
model List_EBook {
  id          Int       @id @default(autoincrement())
  libraryyear Int?      // <-- References Library_Year.id
  Library_Year Library_Year? @relation(fields: [libraryyear], references: [id])
  // ... other fields
}
```

### Counts Tables
```prisma
model List_EBook_Counts {
  id        Int       @id @default(autoincrement())
  year      Int?      // <-- Stores actual year number (2025)
  listebook Int?      // <-- References List_EBook.id
  titles    Int?
  volumes   Int?
  chapters  Int?
  // ... other fields
}
```

## Testing

### Manual Test Steps

1. **Create a new EBook/EJournal/AV entry**
   - Select a library year from the dropdown (e.g., "2025")
   - Fill in all required fields
   - Submit the form

2. **Verify the data in the database**

   **Check main record (List_EBook):**
   ```sql
   SELECT id, title, libraryyear 
   FROM "List_EBook" 
   WHERE id = <new_record_id>;
   ```
   Expected: `libraryyear` should be the Library_Year.id (e.g., 5), NOT the year number (2025)

   **Check relationship table (LibraryYear_ListEBook):**
   ```sql
   SELECT libraryyear_id, listebook_id 
   FROM "LibraryYear_ListEBook" 
   WHERE listebook_id = <new_record_id>;
   ```
   Expected: `libraryyear_id` should be the Library_Year.id (e.g., 5), NOT the year number (2025)

   **Check counts record (List_EBook_Counts):**
   ```sql
   SELECT id, listebook, year, titles, volumes, chapters
   FROM "List_EBook_Counts" 
   WHERE listebook = <new_record_id>;
   ```
   Expected: `year` should be the actual year number (e.g., 2025) ✅

3. **Verify Library_Year lookup**
   ```sql
   SELECT id, year 
   FROM "Library_Year" 
   WHERE id = <library_year_id>;
   ```
   This confirms the mapping between Library_Year.id and the actual year number.

## Impact

### Before Fix
- Foreign key relationships were broken
- Many-to-many tables had incorrect IDs
- Data integrity issues
- Potential cascade failures on deletes

### After Fix
- ✅ Correct foreign key values in all relationship tables
- ✅ Proper data integrity with referential constraints
- ✅ Year number correctly stored in counts tables
- ✅ Consistent pattern across all three resource types (AV, EBook, EJournal)

## Additional Improvements

### AV Create Route
The AV create route was also missing:
1. The `libraryyear` field assignment (foreign key to Library_Year)
2. The many-to-many relationship creation in `LibraryYear_ListAV`

These have been added to match the pattern used in EBook and EJournal routes.

## Critical Discovery During Testing

### Forms Pass Year Number, Not Library_Year ID! 🚨

While fixing the create routes, I discovered that **the forms actually pass the year number (2025), NOT the Library_Year ID**.

**The flow**:
1. User clicks "Create New Entry" → URL: `/admin/survey/ebook/create?year=2025`
2. Create page gets year from URL: `searchParams.get("year")` → `2025`
3. Form submits: `libraryyear: 2025` (year number)
4. API receives: `libraryyear: 2025`

**The confusion**:
- The parameter is named `libraryyear` (suggesting it's a Library_Year ID)
- But it actually contains the year number (2025)
- The API must look up the Library_Year ID from the year number

### Final Solution

The create APIs now:
1. Accept `libraryyear` parameter (which is actually the year number)
2. Look up the Library_Year record: `findFirst({ where: { year: year } })`
3. Extract the Library_Year ID from the result
4. Use the ID for foreign keys and relationships
5. Use the year number for the counts table

### Code Pattern (Final Version)

```typescript
// 1. Accept libraryyear parameter (it's the year number, not ID)
const { libraryyear, ...otherFields } = body;

// 2. Validate year number
const year = Number(libraryyear);
if (!Number.isFinite(year)) {
  return NextResponse.json(
    { error: "Missing or invalid year" },
    { status: 400 }
  );
}

// 3. Look up Library_Year ID from year number
const libraryYearRecord = await db.library_Year.findFirst({
  where: { year: year },
  select: { id: true }
});

if (!libraryYearRecord) {
  return NextResponse.json(
    { error: `Library year ${year} not found` },
    { status: 404 }
  );
}

// 4. Now we have both values
const libraryYearId = libraryYearRecord.id; // For foreign keys
// year is already available for counts table
```

## Status

✅ **FIXED** - All three create routes now properly handle the year number parameter and look up the correct Library_Year ID

### What Was Fixed
- ✅ EBook create route: Accepts year number, looks up Library_Year ID
- ✅ EJournal create route: Accepts year number, looks up Library_Year ID  
- ✅ AV create route: Accepts year number, looks up Library_Year ID, adds m-m relationship
- ✅ All foreign keys now use Library_Year.id (not year number)
- ✅ All counts tables use actual year number
- ✅ Consistent pattern across all three resource types

## Notes

- The form passes `libraryyear` which is the Library_Year.id
- We fetch the Library_Year record to get the actual year number
- We use `libraryYearId` for all foreign keys and relationships
- We use `year` (the actual year number) only for the counts table
- This pattern is now consistent across all three resource types
