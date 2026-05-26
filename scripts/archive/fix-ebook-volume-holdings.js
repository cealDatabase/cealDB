// Migration script: Fix Volume_Holdings.vhebooks_purchased_volume_total and vhoverall_grand_total
// by pulling the correct E-Books Purchased Volumes Subtotal from Electronic_Books
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  const DRY_RUN = process.argv.includes('--dry-run');

  if (DRY_RUN) {
    console.log('=== DRY RUN MODE - No changes will be made ===\n');
  } else {
    console.log('=== LIVE MODE - Will update database ===\n');
  }

  try {
    // Find all Volume_Holdings records that have a matching Electronic_Books record
    const { rows: records } = await client.query(`
      SELECT 
        vh.id as vh_id,
        vh.vhgrandtotal,
        vh.vhebooks_purchased_volume_total as old_ebook_total,
        vh.vhoverall_grand_total as old_overall_total,
        eb.id as ebook_id,
        eb.ebooks_purchased_volumes_subtotal,
        eb.ebooks_purchased_volumes_chinese,
        eb.ebooks_purchased_volumes_japanese,
        eb.ebooks_purchased_volumes_korean,
        eb.ebooks_purchased_volumes_noncjk,
        eb.ebooks_purchased_prev_volumes_chinese,
        eb.ebooks_purchased_prev_volumes_japanese,
        eb.ebooks_purchased_prev_volumes_korean,
        eb.ebooks_purchased_prev_volumes_noncjk,
        eb.ebooks_purchased_add_volumes_chinese,
        eb.ebooks_purchased_add_volumes_japanese,
        eb.ebooks_purchased_add_volumes_korean,
        eb.ebooks_purchased_add_volumes_noncjk,
        ly.year,
        lib.library_name
      FROM "Volume_Holdings" vh
      JOIN "Library_Year" ly ON ly.id = vh.libraryyear
      JOIN "Library" lib ON lib.id = ly.library
      LEFT JOIN "Electronic_Books" eb ON eb.libraryyear = ly.id
      ORDER BY ly.year DESC, lib.library_name
    `);

    console.log(`Total Volume_Holdings records: ${records.length}\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    const updates = [];

    for (const r of records) {
      const vhGrandTotal = Number(r.vhgrandtotal || 0);
      const oldEbookTotal = Number(r.old_ebook_total || 0);
      const oldOverallTotal = Number(r.old_overall_total || 0);

      // Determine the correct E-Books Purchased Volume Total
      let correctEbookTotal = 0;

      if (r.ebook_id) {
        // Use stored subtotal if available
        if (r.ebooks_purchased_volumes_subtotal != null) {
          correctEbookTotal = Number(r.ebooks_purchased_volumes_subtotal);
        } else {
          // Calculate from total fields (prev+add already computed)
          const chi = r.ebooks_purchased_volumes_chinese != null ? Number(r.ebooks_purchased_volumes_chinese) :
            (Number(r.ebooks_purchased_prev_volumes_chinese || 0) + Number(r.ebooks_purchased_add_volumes_chinese || 0));
          const jpn = r.ebooks_purchased_volumes_japanese != null ? Number(r.ebooks_purchased_volumes_japanese) :
            (Number(r.ebooks_purchased_prev_volumes_japanese || 0) + Number(r.ebooks_purchased_add_volumes_japanese || 0));
          const kor = r.ebooks_purchased_volumes_korean != null ? Number(r.ebooks_purchased_volumes_korean) :
            (Number(r.ebooks_purchased_prev_volumes_korean || 0) + Number(r.ebooks_purchased_add_volumes_korean || 0));
          const ncjk = r.ebooks_purchased_volumes_noncjk != null ? Number(r.ebooks_purchased_volumes_noncjk) :
            (Number(r.ebooks_purchased_prev_volumes_noncjk || 0) + Number(r.ebooks_purchased_add_volumes_noncjk || 0));
          correctEbookTotal = chi + jpn + kor + ncjk;
        }
      }

      const correctOverallTotal = vhGrandTotal + correctEbookTotal;

      // Check if update is needed
      if (oldEbookTotal !== correctEbookTotal || oldOverallTotal !== correctOverallTotal) {
        updatedCount++;
        updates.push({
          vh_id: r.vh_id,
          year: r.year,
          library: r.library_name,
          oldEbookTotal,
          newEbookTotal: correctEbookTotal,
          oldOverallTotal,
          newOverallTotal: correctOverallTotal,
          vhGrandTotal,
        });

        if (!DRY_RUN) {
          await client.query(
            `UPDATE "Volume_Holdings" SET vhebooks_purchased_volume_total = $1, vhoverall_grand_total = $2 WHERE id = $3`,
            [correctEbookTotal, correctOverallTotal, r.vh_id]
          );
        }
      } else {
        skippedCount++;
      }
    }

    console.log('=== CHANGES ===\n');
    for (const u of updates) {
      console.log(`Year: ${u.year} | Library: ${u.library} | VH ID: ${u.vh_id}`);
      console.log(`  vhebooks_purchased_volume_total: ${u.oldEbookTotal} → ${u.newEbookTotal}`);
      console.log(`  vhoverall_grand_total: ${u.oldOverallTotal} → ${u.newOverallTotal} (physical: ${u.vhGrandTotal} + ebook: ${u.newEbookTotal})`);
      console.log('');
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total Volume_Holdings records: ${records.length}`);
    console.log(`Records updated: ${updatedCount}`);
    console.log(`Records already correct (skipped): ${skippedCount}`);
    if (DRY_RUN) {
      console.log('\nThis was a DRY RUN. Run without --dry-run to apply changes.');
    } else {
      console.log('\nAll changes applied successfully.');
    }

  } finally {
    client.release();
  }
}

main()
  .catch(console.error)
  .finally(() => pool.end());
