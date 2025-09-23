// scripts/post-deploy-verify.js
/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testSequenceOperations() {
  console.log("🧪 Testing sequence operations post-deployment...");
  
  const testResults = [];
  
  // Test creating a few critical records to ensure sequences work
  const testCases = [
    {
      name: "List_AV_Counts",
      test: async () => {
        // Create a test AV record first
        const testAV = await prisma.list_AV.create({
          data: {
            title: "SEQUENCE_TEST_RECORD",
            type: "test",
            is_global: false,
            updated_at: new Date(),
          }
        });
        
        // Test creating AV counts (this was failing before)
        const testCount = await prisma.list_AV_Counts.create({
          data: {
            titles: 1,
            year: 2025,
            updatedat: new Date(),
            ishidden: false,
            listav: testAV.id,
          }
        });
        
        // Clean up test records
        await prisma.list_AV_Counts.delete({ where: { id: testCount.id } });
        await prisma.list_AV.delete({ where: { id: testAV.id } });
        
        return { success: true, id: testCount.id };
      }
    },
    {
      name: "List_EBook_Counts", 
      test: async () => {
        const testEBook = await prisma.list_EBook.create({
          data: {
            title: "SEQUENCE_TEST_EBOOK",
            description: "test verification record",
            is_global: false,
            updated_at: new Date(),
          }
        });
        
        const testCount = await prisma.list_EBook_Counts.create({
          data: {
            titles: 1,
            year: 2025,
            updatedat: new Date(),
            ishidden: false,
            listebook: testEBook.id,
          }
        });
        
        await prisma.list_EBook_Counts.delete({ where: { id: testCount.id } });
        await prisma.list_EBook.delete({ where: { id: testEBook.id } });
        
        return { success: true, id: testCount.id };
      }
    },
    {
      name: "List_EJournal_Counts", 
      test: async () => {
        const testEJournal = await prisma.list_EJournal.create({
          data: {
            title: "SEQUENCE_TEST_EJOURNAL",
            description: "test verification record",
            is_global: false,
            updated_at: new Date(),
          }
        });
        
        const testCount = await prisma.list_EJournal_Counts.create({
          data: {
            journals: 1,
            dbs: 1,
            year: 2025,
            updatedat: new Date(),
            ishidden: false,
            listejournal: testEJournal.id,
          }
        });
        
        await prisma.list_EJournal_Counts.delete({ where: { id: testCount.id } });
        await prisma.list_EJournal.delete({ where: { id: testEJournal.id } });
        
        return { success: true, id: testCount.id };
      }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`   Testing ${testCase.name}...`);
      const result = await testCase.test();
      console.log(`   ✅ ${testCase.name}: Created record with ID ${result.id}`);
      testResults.push({ table: testCase.name, success: true, id: result.id });
    } catch (error) {
      console.log(`   ❌ ${testCase.name}: ${error.message}`);
      testResults.push({ table: testCase.name, success: false, error: error.message });
    }
  }
  
  const failedTests = testResults.filter(r => !r.success);
  
  if (failedTests.length > 0) {
    console.log("\n❌ SEQUENCE TESTS FAILED:");
    failedTests.forEach(test => {
      console.log(`   - ${test.table}: ${test.error}`);
    });
    return false;
  } else {
    console.log("\n✅ All sequence tests passed!");
    return true;
  }
}

async function main() {
  console.log("🚀 Post-Deployment Verification");
  console.log("=".repeat(50));
  
  const sequenceTestsPassed = await testSequenceOperations();
  
  if (sequenceTestsPassed) {
    console.log("\n🎉 Deployment verification successful!");
    process.exit(0);
  } else {
    console.log("\n❌ Deployment verification failed!");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Verification script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
