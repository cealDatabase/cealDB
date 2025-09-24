// scripts/monitor-sequences.js
// Run this periodically to detect sequence drift before it causes P2002 errors
/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TABLES = [
  "List_AV", "List_AV_Counts",
  "List_EBook", "List_EBook_Counts", 
  "List_EJournal", "List_EJournal_Counts",
  "Library_Year", "User"
];

async function checkSequenceDrift(table) {
  try {
    // Get max ID from table
    const [{ max_id }] = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(MAX(id), 0) AS max_id FROM "${table}";`
    );

    // Get sequence info
    const [{ seq_name }] = await prisma.$queryRawUnsafe(
      `SELECT pg_get_serial_sequence('"${table}"','id') AS seq_name;`
    );
    
    const [{ last_value, is_called }] = await prisma.$queryRawUnsafe(
      `SELECT last_value, is_called FROM ${seq_name};`
    );

    const nextSeqValue = is_called ? Number(last_value) + 1 : Number(last_value);
    const maxId = Number(max_id);
    const drift = nextSeqValue <= maxId;

    return {
      table,
      maxId,
      nextSeqValue,
      drift,
      status: drift ? '❌ DRIFT DETECTED' : '✅ OK'
    };
  } catch (error) {
    return {
      table,
      error: error.message,
      status: '⚠️ ERROR'
    };
  }
}

async function main() {
  console.log("🔍 Monitoring sequence drift across all tables...\n");
  
  const results = [];
  for (const table of TABLES) {
    const result = await checkSequenceDrift(table);
    results.push(result);
    
    console.log(`${result.status} ${table}:`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (result.drift) {
      console.log(`   ⚠️  Max ID: ${result.maxId}, Next Seq: ${result.nextSeqValue} (CONFLICT RISK)`);
    } else {
      console.log(`   ✅ Max ID: ${result.maxId}, Next Seq: ${result.nextSeqValue}`);
    }
  }

  const driftTables = results.filter(r => r.drift);
  if (driftTables.length > 0) {
    console.log(`\n🚨 ${driftTables.length} table(s) have sequence drift!`);
    console.log("Run 'node scripts/fix-all-sequences.js' to fix them.");
  } else {
    console.log("\n🎉 All sequences are properly aligned!");
  }
}

main()
  .catch((e) => {
    console.error("❌ Monitor error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
