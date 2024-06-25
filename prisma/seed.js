import { Library } from "@prisma/client";
import db from "../lib/db";
// import seed_lirbaries from "../prisma/fetchLibrary";

async function main() {
  const libraries = await Promise.all([
    await db.$queryRaw`SELECT * FROM ceal.library`,
  ]);

  // console.log(libraries[0]);

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
        { typeName: "Canadian University" },
        { typeName: "U.S. Non-University" },
        { typeName: "Private U.S. University" },
        { typeName: "Public U.S. University" },
        { typeName: "Canadian Non-University" },
      ],
    }),
    await db.reflibraryregion.createMany({
      data: [
        { regionName: "New England" },
        { regionName: "Middle Atlantic" },
        { regionName: "East North Central" },
        { regionName: "West North Central" },
        { regionName: "South Atlantic" },
        { regionName: "East South Central" },
        { regionName: "West South Central" },
        { regionName: "Mountain" },
        { regionName: "Pacific" },
        { regionName: "Canada" },
        { regionName: "Mexico" },
      ],
    }),
    await db.language.createMany({
      data: [
        { shortLanName: "CHN", longLanName: "Chinese" },
        { shortLanName: "JPN", longLanName: "Japanese" },
        { shortLanName: "KOR", longLanName: "Korean" },
        { shortLanName: "NON", longLanName: "Non-CJK" },
      ],
    }),
    await db.library.createMany({
      data: libraries[0],
    }),
    // await db.user.createMany({
    //   data: seed_user,
    // }),
  ]);
  // console.log(response);
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
