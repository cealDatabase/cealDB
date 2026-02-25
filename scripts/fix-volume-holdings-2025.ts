import { PrismaClient } from '@/prisma/generated/client/client';

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Migration Script: Fix Volume Holdings 2025 Submissions
 * 
 * This script updates all 2025 Volume_Holdings records to include:
 * 1. vhebooks_purchased_volume_total (from Electronic_Books form)
 * 2. vhoverall_grand_total (Physical Grand Total + Electronic Books Purchased Volume Total)
 * 
 * The issue was that while the frontend displayed these values, they were not being
 * saved to the database or included in institutional reports.
 */

interface UpdateResult {
  libraryId: number;
  libraryName: string;
  libraryYearId: number;
  previousEbooksTotal: number | null;
  newEbooksTotal: number;
  previousOverallTotal: number | null;
  newOverallTotal: number;
  physicalGrandTotal: number;
  updated: boolean;
  error?: string;
}

async function fixVolumeHoldings2025() {
  console.log('='.repeat(80));
  console.log('VOLUME HOLDINGS 2025 MIGRATION SCRIPT');
  console.log('='.repeat(80));
  console.log('Starting migration to fix Electronic Books integration...\n');

  const results: UpdateResult[] = [];
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  try {
    // Find all 2025 Library_Year records
    const libraryYears2025 = await prisma.library_Year.findMany({
      where: {
        year: 2025,
      },
      include: {
        Library: true,
        Volume_Holdings: true,
        Electronic_Books: true,
      },
      orderBy: {
        library: 'asc',
      },
    });

    console.log(`Found ${libraryYears2025.length} library records for 2025\n`);

    for (const libraryYear of libraryYears2025) {
      const result: UpdateResult = {
        libraryId: libraryYear.library,
        libraryName: libraryYear.Library?.library_name || 'Unknown',
        libraryYearId: libraryYear.id,
        previousEbooksTotal: null,
        newEbooksTotal: 0,
        previousOverallTotal: null,
        newOverallTotal: 0,
        physicalGrandTotal: 0,
        updated: false,
      };

      try {
        // Check if Volume_Holdings exists for this library year
        if (!libraryYear.Volume_Holdings) {
          console.log(`⊘ ${result.libraryName}: No Volume Holdings data - SKIPPED`);
          skippedCount++;
          continue;
        }

        const volumeHoldings = libraryYear.Volume_Holdings;
        result.previousEbooksTotal = volumeHoldings.vhebooks_purchased_volume_total;
        result.previousOverallTotal = volumeHoldings.vhoverall_grand_total;
        result.physicalGrandTotal = volumeHoldings.vhgrandtotal ?? 0;

        // Get Electronic Books Purchased Volume Total
        let ebooksPurchasedVolumeTotal = 0;
        if (libraryYear.Electronic_Books) {
          ebooksPurchasedVolumeTotal = libraryYear.Electronic_Books.ebooks_purchased_volumes_subtotal || 0;
        }

        result.newEbooksTotal = ebooksPurchasedVolumeTotal;
        result.newOverallTotal = result.physicalGrandTotal + ebooksPurchasedVolumeTotal;

        // Check if update is needed
        const needsUpdate = 
          (result.previousEbooksTotal ?? 0) !== ebooksPurchasedVolumeTotal ||
          (result.previousOverallTotal ?? 0) !== result.newOverallTotal;

        if (!needsUpdate) {
          console.log(`✓ ${result.libraryName}: Already correct - SKIPPED`);
          skippedCount++;
          continue;
        }

        // Update the Volume_Holdings record
        await prisma.volume_Holdings.update({
          where: {
            libraryyear: libraryYear.id,
          },
          data: {
            vhebooks_purchased_volume_total: ebooksPurchasedVolumeTotal,
            vhoverall_grand_total: result.newOverallTotal,
          },
        });

        result.updated = true;
        successCount++;

        console.log(`✓ ${result.libraryName}: UPDATED`);
        console.log(`  Physical Grand Total: ${result.physicalGrandTotal}`);
        console.log(`  E-Books Total: ${result.previousEbooksTotal ?? 'NULL'} → ${result.newEbooksTotal}`);
        console.log(`  Overall Grand Total: ${result.previousOverallTotal ?? 'NULL'} → ${result.newOverallTotal}\n`);

      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error';
        result.updated = false;
        errorCount++;
        console.error(`✗ ${result.libraryName}: ERROR - ${result.error}\n`);
      }

      results.push(result);
    }

    // Print summary
    console.log('='.repeat(80));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total libraries processed: ${libraryYears2025.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Skipped (no changes needed): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('='.repeat(80));

    if (successCount > 0) {
      console.log('\nUPDATED LIBRARIES:');
      console.log('-'.repeat(80));
      results
        .filter(r => r.updated)
        .forEach(r => {
          console.log(`${r.libraryName}:`);
          console.log(`  Physical: ${r.physicalGrandTotal}, E-Books: ${r.newEbooksTotal}, Total: ${r.newOverallTotal}`);
        });
    }

    if (errorCount > 0) {
      console.log('\nERRORS:');
      console.log('-'.repeat(80));
      results
        .filter(r => r.error)
        .forEach(r => {
          console.log(`${r.libraryName}: ${r.error}`);
        });
    }

    console.log('\n' + '='.repeat(80));
    console.log('MIGRATION COMPLETE');
    console.log('='.repeat(80));

    return {
      total: libraryYears2025.length,
      updated: successCount,
      skipped: skippedCount,
      errors: errorCount,
      results,
    };

  } catch (error) {
    console.error('Fatal error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixVolumeHoldings2025()
  .then((summary) => {
    console.log('\nMigration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });
