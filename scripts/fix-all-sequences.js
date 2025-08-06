// Fix all auto-increment sequences after database reset/seed
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllSequences() {
  try {
    console.log('🔧 Fixing all auto-increment sequences after database reset...');
    
    // List of tables with auto-increment id fields that need sequence fixes
    const tables = [
      'Library_Year',
      'List_AV',
      'List_AV_Counts',
      // Add other tables as needed
    ];
    
    for (const table of tables) {
      try {
        console.log(`\n📊 Fixing sequence for table: ${table}`);
        
        // Get the maximum ID from the table
        const maxIdQuery = `SELECT COALESCE(MAX(id), 0) as max_id FROM "${table}"`;
        const maxIdResult = await prisma.$queryRawUnsafe(maxIdQuery);
        
        const maxId = maxIdResult[0].max_id;
        console.log(`   Current max ID: ${maxId}`);
        
        // Reset the sequence to start from max_id + 1
        const nextId = maxId + 1;
        const sequenceQuery = `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), ${nextId}, false)`;
        await prisma.$executeRawUnsafe(sequenceQuery);
        
        console.log(`   ✅ Reset sequence to start from: ${nextId}`);
        
      } catch (error) {
        console.error(`   ❌ Error fixing sequence for ${table}:`, error.message);
      }
    }
    
    console.log('\n🎉 All sequences have been processed!');
    
  } catch (error) {
    console.error('❌ Error fixing sequences:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllSequences();
