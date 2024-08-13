import {
  Electronic,
  Electronic_Books,
  Entry_Status,
  Library,
  Library_Year,
  User,
  User_Library,
  Users_Roles,
} from "@prisma/client";
import db from "../lib/db";

async function main() {
  const libraries = await Promise.all<Library[]>([
    await db.$queryRaw`SELECT * FROM ceal.library`,
  ]);

  const libraryYear = await Promise.all<Library_Year[]>([
    await db.$queryRaw`SELECT * FROM ceal.library_year`,
  ]);

  const electronic = await Promise.all<Electronic[]>([
    await db.$queryRaw`SELECT * FROM ceal.electronic`,
  ]);

  const electronicBooks = await Promise.all<Electronic_Books[]>([
    await db.$queryRaw`SELECT * FROM ceal.electronic_books`,
  ]);

  const entryStatus = await Promise.all<Entry_Status[]>([
    await db.$queryRaw`SELECT * FROM ceal.entryStatus`,
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

  const response = await Promise.all([
    await db.role.createMany({
      data: [
        { role: "ROLE_ADMIN", name: "Super Admin" },
        { role: "ROLE_MEMBER", name: "Member Institution" },
        { role: "ROLE_EBOOK_EDITOR", name: "E-Book/E-Journal Editor" },
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
    await db.electronic.createMany({
      data: electronic[0],
    }),
    await db.electronic_Books.createMany({
      data: electronicBooks[0],
    }),
    await db.entry_Status.createMany({
      data: entryStatus[0],
    }),
    await db.library_Year.createMany({
      data: libraryYear[0],
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
  ]);
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
