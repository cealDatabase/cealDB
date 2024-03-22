import prisma from "../lib/prisma";

async function main() {
  const response = await Promise.all([
    await prisma.libraryType.createMany({
      data: [
        { name: "Canadian University" },
        { name: "U.S. Non-University" },
        { name: "Private U.S. University" },
        { name: "Public U.S. University" },
        { name: "Canadian Non-University" },
      ],
    }),
    await prisma.libraryRegion.createMany({
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
    await prisma.language.createMany({
      data: [
        { shortLanName: "CHN", longLanName: "Chinese" },
        { shortLanName: "JPN", longLanName: "Japanese" },
        { shortLanName: "KOR", longLanName: "Korean" },
        { shortLanName: "NON", longLanName: "Non-CJK" },
      ],
    }),
  ]);
  console.log(response);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
