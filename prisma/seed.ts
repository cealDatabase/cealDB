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

async function main() {

  await db.$executeRawUnsafe('DISCARD ALL'); 

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

  const users = await Promise.all<User[]>([
    await db.$queryRaw`SELECT * FROM ceal.user`,
  ]);

  const userLibrary = await Promise.all<User_Library[]>([
    await db.$queryRaw`SELECT * FROM ceal.user_library`,
  ]);

  const userRole = await Promise.all<Users_Roles[]>([
    await db.$queryRaw`SELECT * FROM ceal.users_roles`,
  ]);

  const serials = await Promise.all<Serials[]>([
    await db.$queryRaw`SELECT * FROM ceal.serials`,
  ]);

  const volumeHoldings = await Promise.all<Volume_Holdings[]>([
    await db.$queryRaw`SELECT * FROM ceal.volume_holdings`,
  ]);

  const response = await Promise.all([
    await db.role.createMany({
      data: [
        { role: "ROLE_ADMIN", name: "Super Admin" },
        { role: "ROLE_MEMBER", name: "Member Institution" },
        { role: "ROLE_ERESOURCE_EDITOR", name: "E-Resource Editor" },
        { role: "ROLE_ADMIN_ASSISTANT", name: "Assistant Admin" },
      ],
    }),
    await db.reflibrarytype.createMany({
      data: [
        { librarytype: "Canadian University" },
        { librarytype: "U.S. Non-University" },
        { librarytype: "Private U.S. University" },
        { librarytype: "Public U.S. University" },
        { librarytype: "Canadian Non-University" },
      ],
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
    }),
    await db.language.createMany({
      data: [
        { short: "CHN", full: "Chinese" },
        { short: "JPN", full: "Japanese" },
        { short: "KOR", full: "Korean" },
        { short: "NON", full: "Non-CJK" },
      ],
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
    await db.user.createMany({
      data: users[0],
    }),
    await db.user_Library.createMany({
      data: userLibrary[0],
    }),
    await db.users_Roles.createMany({
      data: userRole[0],
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
