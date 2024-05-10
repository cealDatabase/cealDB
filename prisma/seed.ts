import db from "../lib/db";
import seed_library from "./seed_library";
import seed_user from "./seed_user";

async function main() {
  const response = await Promise.all([
    await db.libraryType.createMany({
      data: [
        { typeName: "Canadian University" },
        { typeName: "U.S. Non-University" },
        { typeName: "Private U.S. University" },
        { typeName: "Public U.S. University" },
        { typeName: "Canadian Non-University" },
      ],
    }),
    await db.libraryRegion.createMany({
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
      data: seed_library,
    }),
    await db.user.createMany({
      data: seed_user,
    }),
  ]);
  console.log(response);
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
