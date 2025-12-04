// scripts/fix-all-sequences.js
 
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TABLES = [
  "Library",
  "Library_Year",
  "List_AV",
  "List_AV_Counts",
  "List_EBook",
  "List_EBook_Counts",
  "List_EJournal",
  "List_EJournal_Counts",
  "Monographic_Acquisitions",
  "Volume_Holdings",
  "Other_Holdings",
  "Serials",
  "Unprocessed_Backlog_Materials",
  "Fiscal_Support",
  "Personnel_Support",
  "Public_Services",
  "Electronic",
  "Electronic_Books",
  "User",
];

async function resetSequenceFor(table) {
  // 1) get max(id)
  const [{ max_id }] = await prisma.$queryRawUnsafe(
    `SELECT COALESCE(MAX(id), 0) AS max_id FROM "${table}";`
  );

  // 2) set sequence to max(id), mark as "already called"
  //    => nextval() will return max(id) + 1
  //    If table is empty (max_id = 0), set sequence to 1 with is_called=false
  const sequenceValue = Number(max_id);
  const isCalled = sequenceValue > 0;
  const setValue = sequenceValue > 0 ? sequenceValue : 1;

  await prisma.$executeRawUnsafe(
    `SELECT setval(
       pg_get_serial_sequence('"${table}"','id'),
       ${setValue},
       ${isCalled}
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
