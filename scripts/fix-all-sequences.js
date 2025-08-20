// scripts/fix-all-sequences.js
/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TABLES = [
  "Library_Year",
  "List_AV",
  "List_AV_Counts",
  "List_EBook",
  "List_EBook_Counts",
  "List_EJournal",
  "List_EJournal_Counts",
  "Monographic_Acquisitions",
  "Volume_Holdings",
  "Serials",
];

async function resetSequenceFor(table) {
  // 1) get max(id)
  const [{ max_id }] = await prisma.$queryRawUnsafe(
    `SELECT COALESCE(MAX(id), 0) AS max_id FROM "${table}";`
  );

  // 2) set sequence to max(id), mark as "already called"
  //    => nextval() will return max(id) + 1
  await prisma.$executeRawUnsafe(
    `SELECT setval(
       pg_get_serial_sequence('"${table}"','id'),
       ${Number(max_id)},
       TRUE
     );`
  );

  // (optional) print the sequence state for sanity
  const [{ seq_name }] = await prisma.$queryRawUnsafe(
    `SELECT pg_get_serial_sequence('"${table}"','id') AS seq_name;`
  );
  const [{ last_value, is_called }] = await prisma.$queryRawUnsafe(
    `SELECT last_value, is_called FROM ${seq_name};`
  );

  console.log(
    `   ${table}: max_id=${max_id}  seq=${seq_name}  last_value=${last_value}  is_called=${is_called}`
  );
}

async function main() {
  console.log("🔧 Fixing auto-increment sequences (idempotent)…");
  for (const table of TABLES) {
    try {
      console.log(`\n📊 ${table}`);
      await resetSequenceFor(table);
      console.log("   ✅ done");
    } catch (e) {
      console.error(`   ❌ failed: ${e.message}`);
    }
  }
  console.log("\n🎉 All sequences processed.");
}

main()
  .catch((e) => {
    console.error("❌ Script error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
