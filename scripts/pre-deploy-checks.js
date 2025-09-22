// scripts/pre-deploy-checks.js
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
  "Unprocessed_Backlog_Materials",
  "Fiscal_Support",
  "Personnel_Support",
  "Public_Services",
  "Electronic",
  "Electronic_Books",
  "User",
];

async function checkSequenceHealth(table) {
  try {
    // Get max ID from table
    const [{ max_id }] = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(MAX(id), 0) AS max_id FROM "${table}";`
    );

    // Get sequence info
    const [{ seq_name }] = await prisma.$queryRawUnsafe(
      `SELECT pg_get_serial_sequence('"${table}"','id') AS seq_name;`
    );
    
    if (!seq_name) {
      console.log(`   ⚠️  ${table}: No sequence found (might not have auto-increment)`);
      return { healthy: true, table, issue: 'no_sequence' };
    }

    const [{ last_value, is_called }] = await prisma.$queryRawUnsafe(
      `SELECT last_value, is_called FROM ${seq_name};`
    );

    // Calculate what the next sequence value would be
    const nextSeqValue = is_called ? Number(last_value) + 1 : Number(last_value);
    const maxId = Number(max_id);

    // Check if sequence is healthy
    const isHealthy = nextSeqValue > maxId;
    
    if (isHealthy) {
      console.log(`   ✅ ${table}: Healthy (max_id=${maxId}, next_seq=${nextSeqValue})`);
      return { healthy: true, table, max_id: maxId, next_seq: nextSeqValue };
    } else {
      console.log(`   ❌ ${table}: UNHEALTHY (max_id=${maxId}, next_seq=${nextSeqValue}) - WILL CAUSE CONFLICTS!`);
      return { 
        healthy: false, 
        table, 
        max_id: maxId, 
        next_seq: nextSeqValue,
        issue: 'sequence_behind'
      };
    }
  } catch (error) {
    console.log(`   ❌ ${table}: Error checking sequence - ${error.message}`);
    return { healthy: false, table, issue: 'check_error', error: error.message };
  }
}

async function main() {
  console.log("🔍 Pre-deployment Database Sequence Health Check");
  console.log("=".repeat(60));
  
  const results = [];
  let hasIssues = false;

  for (const table of TABLES) {
    console.log(`\n📊 Checking ${table}...`);
    const result = await checkSequenceHealth(table);
    results.push(result);
    
    if (!result.healthy && result.issue === 'sequence_behind') {
      hasIssues = true;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 SUMMARY");
  console.log("=".repeat(60));

  const healthyTables = results.filter(r => r.healthy);
  const unhealthyTables = results.filter(r => !r.healthy && r.issue === 'sequence_behind');
  const errorTables = results.filter(r => !r.healthy && r.issue === 'check_error');

  console.log(`✅ Healthy sequences: ${healthyTables.length}`);
  console.log(`❌ Unhealthy sequences: ${unhealthyTables.length}`);
  console.log(`⚠️  Errors during check: ${errorTables.length}`);

  if (unhealthyTables.length > 0) {
    console.log("\n🚨 CRITICAL: The following tables have sequence issues:");
    unhealthyTables.forEach(table => {
      console.log(`   - ${table.table}: max_id=${table.max_id}, next_seq=${table.next_seq}`);
    });
    console.log("\n💡 SOLUTION: Run 'node scripts/fix-all-sequences.js' before deployment");
  }

  if (errorTables.length > 0) {
    console.log("\n⚠️  WARNINGS: Could not check these tables:");
    errorTables.forEach(table => {
      console.log(`   - ${table.table}: ${table.error}`);
    });
  }

  if (hasIssues) {
    console.log("\n❌ DEPLOYMENT BLOCKED: Fix sequence issues before proceeding");
    process.exit(1);
  } else {
    console.log("\n🎉 All sequences are healthy! Safe to deploy.");
    process.exit(0);
  }
}

main()
  .catch((e) => {
    console.error("❌ Health check script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
