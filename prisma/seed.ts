import {
  Electronic,
  Electronic_Books,
  Entry_Status,
  Exclude_Year,
  Fiscal_Support,
  Library,
  Library_Year,
  LibraryYear_ListAV,
  LibraryYear_ListEBook,
  LibraryYear_ListEJournal,
  List_AV,
  List_AV_Counts,
  List_EBook,
  List_EBook_Counts,
  List_EJournal,
  List_EJournal_Counts,
  List_AV_Language,
  List_EBook_Language,
  List_EJournal_Language,
  Monographic_Acquisitions,
  Personnel_Support,
  Public_Services,
  Other_Holdings,
  Serials,
  Unprocessed_Backlog_Materials,
  User,
  User_Library,
  Users_Roles,
  Volume_Holdings,
} from "@prisma/client";
import db from "../lib/db";

// Configuration for selective schema synchronization
const SYNC_CONFIG = {
  // Set to false to preserve User, AuditLog, Session tables in public schema
  // Set to true to overwrite all tables from ceal schema (full sync)
  SYNC_AUTH_TABLES: process.env.SYNC_AUTH_TABLES === 'true' || false,
  
  // Tables to preserve in public schema when SYNC_AUTH_TABLES is false
  PRESERVED_TABLES: ['User', 'AuditLog', 'Session'] as const,
};

/**
 * Check existing data in public schema before sync
 */
async function checkExistingData() {
  try {
    const userCount = await db.user.count();
    const libraryCount = await db.library.count();
    const libraryYearCount = await db.library_Year.count();
    
    console.log('\n📊 Current data in public schema:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Libraries: ${libraryCount}`);
    console.log(`   Library Years: ${libraryYearCount}`);
    
    if (userCount > 0 && !SYNC_CONFIG.SYNC_AUTH_TABLES) {
      console.log('✅ User data will be preserved');
    } else if (userCount > 0 && SYNC_CONFIG.SYNC_AUTH_TABLES) {
      console.log('⚠️  WARNING: User data will be overwritten!');
    }
    
    return { userCount, libraryCount, libraryYearCount };
  } catch (error) {
    console.log('📋 No existing data found (fresh database)');
    return { userCount: 0, libraryCount: 0, libraryYearCount: 0 };
  }
}

/**
 * Display backup and safety recommendations
 */
function displaySafetyRecommendations() {
  console.log('\n🛡️  SAFETY RECOMMENDATIONS:');
  console.log('   1. Backup your public schema before running this sync');
  console.log('   2. Test in a development environment first');
  console.log('   3. Verify SYNC_AUTH_TABLES setting matches your intent');
  console.log('   4. Check that ceal schema is clean and up-to-date');
  console.log('');
}

async function main() {

  await db.$executeRawUnsafe('DISCARD ALL');

  displaySafetyRecommendations();
  
  console.log('🔄 Starting selective schema synchronization...');
  console.log(`📋 Auth tables sync: ${SYNC_CONFIG.SYNC_AUTH_TABLES ? 'ENABLED' : 'DISABLED'}`);
  
  if (!SYNC_CONFIG.SYNC_AUTH_TABLES) {
    console.log(`🛡️  Preserving tables in public schema: ${SYNC_CONFIG.PRESERVED_TABLES.join(', ')}`);
  }

  // Check existing data before proceeding
  const existingData = await checkExistingData();

  // Clear tables that will be synced (preserve auth tables if configured)
  console.log('🧹 Clearing tables for fresh sync...');
  
  // Always clear non-auth data tables
  await Promise.all([
    db.public_Services.deleteMany({}),
    db.unprocessed_Backlog_Materials.deleteMany({}),
    db.volume_Holdings.deleteMany({}),
    db.serials.deleteMany({}),
    db.other_Holdings.deleteMany({}),
    db.personnel_Support.deleteMany({}),
    db.monographic_Acquisitions.deleteMany({}),
    db.fiscal_Support.deleteMany({}),
    db.electronic_Books.deleteMany({}),
    db.electronic.deleteMany({}),
    db.exclude_Year.deleteMany({}),
    db.entry_Status.deleteMany({}),
    // List and survey tables
    db.libraryYear_ListEJournal.deleteMany({}),
    db.libraryYear_ListEBook.deleteMany({}),
    db.libraryYear_ListAV.deleteMany({}),
    db.list_EJournal_Language.deleteMany({}),
    db.list_EBook_Language.deleteMany({}),
    db.list_AV_Language.deleteMany({}),
    db.list_EJournal_Counts.deleteMany({}),
    db.list_EJournal.deleteMany({}),
    db.list_EBook_Counts.deleteMany({}),
    db.list_EBook.deleteMany({}),
    db.list_AV_Counts.deleteMany({}),
    db.list_AV.deleteMany({}),
    db.library_Year.deleteMany({}),
    db.library.deleteMany({}),
    // Reference tables (safe to recreate)
    db.language.deleteMany({}),
    db.reflibraryregion.deleteMany({}),
    db.reflibrarytype.deleteMany({}),
    db.role.deleteMany({}),
  ]);

  // Conditionally clear auth tables only if we're syncing them
  if (SYNC_CONFIG.SYNC_AUTH_TABLES) {
    console.log('🔄 Clearing authentication tables for full sync...');
    await Promise.all([
      db.users_Roles.deleteMany({}),
      db.user_Library.deleteMany({}),
      db.user.deleteMany({}),
    ]);
  } else {
    console.log('🛡️  Preserving authentication tables in public schema');
  } 

  const electronic = await Promise.all<Electronic[]>([
    await db.$queryRaw`SELECT * FROM ceal.electronic`,
  ]);

  const electronicBooks = await Promise.all<Electronic_Books[]>([
    await db.$queryRaw`SELECT * FROM ceal.electronic_books`,
  ]);

  const entryStatus = await Promise.all<Entry_Status[]>([
    await db.$queryRaw`SELECT * FROM ceal.entryStatus`,
  ]);

  const excludeYear = await Promise.all<Exclude_Year[]>([
    await db.$queryRaw`SELECT * FROM ceal.exclude_year`,
  ]);

  const fiscalSupport = await Promise.all<Fiscal_Support[]>([
    await db.$queryRaw`SELECT * FROM ceal.fiscal_support`,
  ]);
  const libraries = await Promise.all<Library[]>([
    await db.$queryRaw`SELECT * FROM ceal.library`,
  ]);

  const libraryYear = await Promise.all<Library_Year[]>([
    await db.$queryRaw`SELECT * FROM ceal.library_year`,
  ]);

  const libraryYearListAV = await Promise.all<LibraryYear_ListAV[]>([
    await db.$queryRaw`SELECT * FROM ceal.libraryyear_listav`,
  ]);

  const libraryYearListEBook = await Promise.all<LibraryYear_ListEBook[]>([
    await db.$queryRaw`SELECT * FROM ceal.libraryyear_listebook`,
  ]);

  const listAV = await Promise.all<List_AV[]>([
    await db.$queryRaw`SELECT * FROM ceal.list_av`,
  ]);

  const listAVCounts = await Promise.all<List_AV_Counts[]>([
    await db.$queryRaw`SELECT * FROM ceal.list_av_counts`,
  ]);

  const listEBook = await Promise.all<List_EBook[]>([
    await db.$queryRaw`SELECT * FROM ceal.list_ebook`,
  ]);

  const listEBookCounts = await Promise.all<List_EBook_Counts>([
    await db.$queryRaw`SELECT * FROM ceal.list_ebook_counts`,
  ]);

  const listEJournal = await Promise.all<List_EJournal>([
    await db.$queryRaw`SELECT * FROM ceal.list_ejournal`,
  ]);

  const listEJournalCounts = await Promise.all<List_EJournal_Counts>([
    await db.$queryRaw`SELECT * FROM ceal.list_ejournal_counts`,
  ]);

  const listAVLanguage = await Promise.all<List_AV_Language>([
    await db.$queryRaw`SELECT * FROM ceal.listav_language`,
  ]);

  const ListEBookLanguage = await Promise.all<List_EBook_Language>([
    await db.$queryRaw`SELECT * FROM ceal.listebook_language`,
  ]);

  const ListEJournalLanguage = await Promise.all<List_EJournal_Language>([
    await db.$queryRaw`SELECT * FROM ceal.listejournal_language`,
  ]);
  
  const libraryYearListEJournal = await Promise.all<LibraryYear_ListEJournal[]>(
    [await db.$queryRaw`SELECT * FROM ceal.libraryyear_listejournal`]
  );

  const monographicAcquisitions = await Promise.all<Monographic_Acquisitions[]>(
    [await db.$queryRaw`SELECT * FROM ceal.monographic_acquisitions`]
  );
  const personnelSupport = await Promise.all<Personnel_Support[]>([
    await db.$queryRaw`SELECT * FROM ceal.personnel_support_fte`,
  ]);
  // Public Services with field mapping from old schema to new granular schema
  interface OldPublicServicesRecord {
    id: number;
    entryid: string | null;
    libraryyear: number | null;
    pslibrary_presentations: number | null;
    psparticipants: number | null;
    psreference_transactions: number | null;
    psnumber_of_total_circulation: number | null;
    pslending_requests_filled: number | null;
    pslending_requests_unfilled: number | null;
    psborrowing_requests_filled: number | null;
    psborrowing_requests_unfilled: number | null;
    psnotes: string | null;
  }

  const publicServicesRaw = await db.$queryRaw<OldPublicServicesRecord[]>`SELECT * FROM ceal.public_services`;
  
  // Map old consolidated fields to new granular schema
  const publicServices = publicServicesRaw.map((oldRecord: OldPublicServicesRecord) => ({
    id: oldRecord.id,
    entryid: oldRecord.entryid,
    libraryyear: oldRecord.libraryyear,
    
    // Map old pslibrary_presentations to new presentation fields (put in subtotal)
    pspresentations_chinese: null,
    pspresentations_japanese: null,
    pspresentations_korean: null,
    pspresentations_eastasian: null,
    pspresentations_subtotal: oldRecord.pslibrary_presentations,
    
    // Map old psparticipants to new presentation participants fields (put in subtotal)
    pspresentation_participants_chinese: null,
    pspresentation_participants_japanese: null,
    pspresentation_participants_korean: null,
    pspresentation_participants_eastasian: null,
    pspresentation_participants_subtotal: oldRecord.psparticipants,
    
    // Map old psreference_transactions to new reference transaction fields (put in subtotal)
    psreference_transactions_chinese: null,
    psreference_transactions_japanese: null,
    psreference_transactions_korean: null,
    psreference_transactions_eastasian: null,
    psreference_transactions_subtotal: oldRecord.psreference_transactions,
    
    // Map old psnumber_of_total_circulation to new total circulation fields (put in subtotal)
    pstotal_circulations_chinese: null,
    pstotal_circulations_japanese: null,
    pstotal_circulations_korean: null,
    pstotal_circulations_eastasian: null,
    pstotal_circulations_subtotal: oldRecord.psnumber_of_total_circulation,
    
    // Map old pslending_requests_filled to new lending filled fields (put in subtotal)
    pslending_requests_filled_chinese: null,
    pslending_requests_filled_japanese: null,
    pslending_requests_filled_korean: null,
    pslending_requests_filled_eastasian: null,
    pslending_requests_filled_subtotal: oldRecord.pslending_requests_filled,
    
    // Map old pslending_requests_unfilled to new lending unfilled fields (put in subtotal)
    pslending_requests_unfilled_chinese: null,
    pslending_requests_unfilled_japanese: null,
    pslending_requests_unfilled_korean: null,
    pslending_requests_unfilled_eastasian: null,
    pslending_requests_unfilled_subtotal: oldRecord.pslending_requests_unfilled,
    
    // Map old psborrowing_requests_filled to new borrowing filled fields (put in subtotal)
    psborrowing_requests_filled_chinese: null,
    psborrowing_requests_filled_japanese: null,
    psborrowing_requests_filled_korean: null,
    psborrowing_requests_filled_eastasian: null,
    psborrowing_requests_filled_subtotal: oldRecord.psborrowing_requests_filled,
    
    // Map old psborrowing_requests_unfilled to new borrowing unfilled fields (put in subtotal)
    psborrowing_requests_unfilled_chinese: null,
    psborrowing_requests_unfilled_japanese: null,
    psborrowing_requests_unfilled_korean: null,
    psborrowing_requests_unfilled_eastasian: null,
    psborrowing_requests_unfilled_subtotal: oldRecord.psborrowing_requests_unfilled,
    
    // Map notes field directly
    psnotes: oldRecord.psnotes
  }));
  const unprocessedBacklogMaterials = await Promise.all<Unprocessed_Backlog_Materials[]>([
    await db.$queryRaw`SELECT * FROM ceal.unprocessed_backlog_materials`,
  ]);

  const otherHoldings = await Promise.all<Other_Holdings[]>([
    await db.$queryRaw`SELECT * FROM ceal.other_holdings`,
  ]);

  // Conditionally fetch user-related tables based on sync configuration
  let users: User[] = [];
  let userLibrary: User_Library[] = [];
  let userRole: Users_Roles[] = [];
  
  if (SYNC_CONFIG.SYNC_AUTH_TABLES) {
    console.log('📥 Fetching user tables from ceal schema...');
    users = await db.$queryRaw<User[]>`SELECT * FROM ceal.user`;
    userLibrary = await db.$queryRaw<User_Library[]>`SELECT * FROM ceal.user_library`;
    userRole = await db.$queryRaw<Users_Roles[]>`SELECT * FROM ceal.users_roles`;
  } else {
    console.log('🛡️  Skipping user tables sync - preserving public schema data');
  }

  const serials = await Promise.all<Serials[]>([
    await db.$queryRaw`SELECT * FROM ceal.serials`,
  ]);

  const volumeHoldings = await Promise.all<Volume_Holdings[]>([
    await db.$queryRaw`SELECT * FROM ceal.volume_holdings`,
  ]);

  console.log('📥 Inserting fresh data from ceal schema...');
  
  const response = await Promise.all([
    await db.role.createMany({
      data: [
        { role: "ROLE_ADMIN", name: "Super Admin" },
        { role: "ROLE_MEMBER", name: "Member Institution" },
        { role: "ROLE_ERESOURCE_EDITOR", name: "E-Resource Editor" },
        { role: "ROLE_ADMIN_ASSISTANT", name: "Assistant Admin" },
      ],
      skipDuplicates: true,
    }),
    await db.reflibrarytype.createMany({
      data: [
        { librarytype: "Canadian University" },
        { librarytype: "U.S. Non-University" },
        { librarytype: "Private U.S. University" },
        { librarytype: "Public U.S. University" },
        { librarytype: "Canadian Non-University" },
      ],
      skipDuplicates: true,
    }),
    await db.reflibraryregion.createMany({
      data: [
        { libraryregion: "New England" },
        { libraryregion: "Middle Atlantic" },
        { libraryregion: "East North Central" },
        { libraryregion: "West North Central" },
        { libraryregion: "South Atlantic" },
        { libraryregion: "East South Central" },
        { libraryregion: "West South Central" },
        { libraryregion: "Mountain" },
        { libraryregion: "Pacific" },
        { libraryregion: "Canada" },
        { libraryregion: "Mexico" },
      ],
      skipDuplicates: true,
    }),
    await db.language.createMany({
      data: [
        { short: "CHN", full: "Chinese" },
        { short: "JPN", full: "Japanese" },
        { short: "KOR", full: "Korean" },
        { short: "NON", full: "Non-CJK" },
      ],
      skipDuplicates: true,
    }),
    await db.library.createMany({
      data: libraries[0],
    }),
    await db.library_Year.createMany({
      data: libraryYear[0],
    }),
    await db.list_AV.createMany({
      data: listAV[0],
    }),
    await db.list_AV_Counts.createMany({
      data: listAVCounts[0],
    }),
    await db.list_EBook.createMany({
      data: listEBook[0],
    }),
    await db.list_EBook_Counts.createMany({
      data: listEBookCounts[0],
    }),
    await db.list_EJournal.createMany({
      data: listEJournal[0],
    }),
    await db.list_EJournal_Counts.createMany({
      data: listEJournalCounts[0],
    }),
    await db.list_AV_Language.createMany({
      data: listAVLanguage[0],
    }),
    await db.list_EBook_Language.createMany({
      data: ListEBookLanguage[0],
    }),
    await db.list_EJournal_Language.createMany({
      data: ListEJournalLanguage[0],
    }),
    await db.libraryYear_ListAV.createMany({
      data: libraryYearListAV[0],
    }),
    await db.libraryYear_ListEBook.createMany({
      data: libraryYearListEBook[0],
    }),
    await db.libraryYear_ListEJournal.createMany({
      data: libraryYearListEJournal[0],
    }),
    await db.monographic_Acquisitions.createMany({
      data: monographicAcquisitions[0],
    }),
    await db.personnel_Support.createMany({
      data: personnelSupport[0],
    }),
    await db.other_Holdings.createMany({
      data: otherHoldings[0],
    }),
    await db.electronic.createMany({
      data: electronic[0],
    }),
    await db.electronic_Books.createMany({
      data: electronicBooks[0],
    }),
    await db.entry_Status.createMany({
      data: entryStatus[0],
    }),
    await db.exclude_Year.createMany({
      data: excludeYear[0],
    }),
    await db.fiscal_Support.createMany({
      data: fiscalSupport[0],
    }),
    await db.serials.createMany({
      data: serials[0],
    }),
    await db.volume_Holdings.createMany({
      data: volumeHoldings[0],
    }),
    await db.public_Services.createMany({
      data: publicServices,
    }),
    await db.unprocessed_Backlog_Materials.createMany({
      data: unprocessedBacklogMaterials[0],
    }),
  ]);

  // Conditionally sync user-related tables
  if (SYNC_CONFIG.SYNC_AUTH_TABLES) {
    console.log('🔄 Syncing authentication tables from ceal schema...');
    
    const userSyncResponse = await Promise.all([
      await db.user.createMany({
        data: users,
        skipDuplicates: true,
      }),
      await db.user_Library.createMany({
        data: userLibrary,
        skipDuplicates: true,
      }),
      await db.users_Roles.createMany({
        data: userRole,
        skipDuplicates: true,
      }),
    ]);
    
    console.log(`✅ Authentication tables synced: ${users.length} users, ${userLibrary.length} user-library relationships, ${userRole.length} role assignments`);
  } else {
    console.log('⏭️  Authentication tables preserved in public schema');
  }

  // Final verification
  const finalUserCount = await db.user.count();
  const finalLibraryCount = await db.library.count();
  const finalLibraryYearCount = await db.library_Year.count();
  
  console.log('\n✅ Schema synchronization completed successfully!');
  console.log('📊 Final data summary:');
  console.log(`   Users: ${finalUserCount} (${SYNC_CONFIG.SYNC_AUTH_TABLES ? 'synced from ceal' : 'preserved from public'})`);
  console.log(`   Libraries: ${finalLibraryCount}`);
  console.log(`   Library Years: ${finalLibraryYearCount}`);
  console.log('🎉 All done!');
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error:", e.message);
    await db.$disconnect();
    process.exit(1);
  });
