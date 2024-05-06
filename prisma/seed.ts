import db from "../lib/db";
import seed_library from "./seed_library";

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
    await db.user.create({
      data: {
        id: 3,
        firstName: "Lena Lee",
        lastName: "Yang",
        email: "iaswr@aol.com",
        positionTitle: "Director of Library",
        workPhone: "845-225-1445",
        faxNumber: "845-225-1485",
        password:"337669",
        libraryId:2,
      },
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
