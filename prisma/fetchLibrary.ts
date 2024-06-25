import db from "../lib/db";

async function main() {
  const response = await Promise.all([
    await db.$queryRaw`SELECT * FROM ceal.library`,
  ]);
  return response;
}

// main()
//   .then(async () => {
//     await db.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await db.$disconnect();
//     process.exit(1);
//   });

const seed_lirbaries = main();

export default seed_lirbaries;
