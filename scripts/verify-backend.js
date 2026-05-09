#!/usr/bin/env node
/**
 * Backend verification script
 * Run with: node scripts/verify-backend.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabaseSchema() {
  console.log('\n=== Database Schema Verification ===\n');
  
  try {
    // Check if new columns exist by querying
    const avResult = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'LibraryYear_ListAV' 
      AND column_name IN ('is_selected', 'custom_count', 'updated_at')
      ORDER BY column_name
    `;
    
    console.log('✅ LibraryYear_ListAV columns:');
    avResult.forEach(col => console.log(`   - ${col.column_name}: ${col.data_type}`));
    
    const ebookResult = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'LibraryYear_ListEBook' 
      AND column_name IN ('is_selected', 'custom_count', 'updated_at')
      ORDER BY column_name
    `;
    
    console.log('\n✅ LibraryYear_ListEBook columns:');
    ebookResult.forEach(col => console.log(`   - ${col.column_name}: ${col.data_type}`));
    
    const ejournalResult = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'LibraryYear_ListEJournal' 
      AND column_name IN ('is_selected', 'custom_count', 'updated_at')
      ORDER BY column_name
    `;
    
    console.log('\n✅ LibraryYear_ListEJournal columns:');
    ejournalResult.forEach(col => console.log(`   - ${col.column_name}: ${col.data_type}`));
    
    return avResult.length === 3 && ebookResult.length === 3 && ejournalResult.length === 3;
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    return false;
  }
}

async function verifyTestData() {
  console.log('\n=== Test Data Verification ===\n');
  
  try {
    // Test upsert operation
    const testRecord = await prisma.libraryYear_ListAV.upsert({
      where: {
        libraryyear_id_listav_id: {
          libraryyear_id: 2816,
          listav_id: 999,
        },
      },
      update: {
        is_selected: true,
        custom_count: 42,
        updated_at: new Date(),
      },
      create: {
        libraryyear_id: 2816,
        listav_id: 999,
        is_selected: true,
        custom_count: 42,
        updated_at: new Date(),
      },
    });
    
    console.log('✅ Upsert test successful');
    console.log('   Record:', JSON.stringify(testRecord, null, 2));
    
    // Clean up
    await prisma.libraryYear_ListAV.deleteMany({
      where: {
        libraryyear_id: 2816,
        listav_id: 999,
      },
    });
    
    console.log('✅ Cleanup successful');
    return true;
  } catch (error) {
    console.error('❌ Test data verification failed:', error.message);
    return false;
  }
}

async function verifyPrismaModels() {
  console.log('\n=== Prisma Models Verification ===\n');
  
  try {
    // Try to query using Prisma client
    const avSelections = await prisma.libraryYear_ListAV.findMany({
      where: { libraryyear_id: 2816 },
      take: 3,
    });
    
    console.log(`✅ Prisma AV query successful (${avSelections.length} records)`);
    
    const ebookSelections = await prisma.libraryYear_ListEBook.findMany({
      where: { libraryyear_id: 2816 },
      take: 3,
    });
    
    console.log(`✅ Prisma EBook query successful (${ebookSelections.length} records)`);
    
    const ejournalSelections = await prisma.libraryYear_ListEJournal.findMany({
      where: { libraryyear_id: 2816 },
      take: 3,
    });
    
    console.log(`✅ Prisma EJournal query successful (${ejournalSelections.length} records)`);
    
    return true;
  } catch (error) {
    console.error('❌ Prisma models verification failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Backend Verification Suite');
  console.log('='.repeat(60));
  
  const results = {
    schema: await verifyDatabaseSchema(),
    testData: await verifyTestData(),
    prismaModels: await verifyPrismaModels(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([name, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${name}: ${status}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log('='.repeat(60));
  console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
  console.log('='.repeat(60));
  
  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
