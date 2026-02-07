// Script to check Electronic Books purchased volumes data and Volume Holdings mismatches
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
  // Find all Electronic_Books records
  const { rows: records } = await client.query(`
    SELECT 
      eb.id as ebook_id,
      ly.year,
      ly.library as library_id,
      lib.library_name,
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
      vh.id as vh_id,
      vh.vhebooks_purchased_volume_total,
      vh.vhgrandtotal,
      vh.vhoverall_grand_total
    FROM "Electronic_Books" eb
    JOIN "Library_Year" ly ON ly.id = eb.libraryyear
    JOIN "Library" lib ON lib.id = ly.library
    LEFT JOIN "Volume_Holdings" vh ON vh.libraryyear = ly.id
    ORDER BY ly.year DESC, lib.library_name
  `);

  console.log(`\nTotal Electronic_Books records: ${records.length}\n`);

  let mismatchCount = 0;
  const mismatches = [];

  for (const r of records) {
    // Calculate what the subtotal SHOULD be from prev+add
    const prevChi = Number(r.ebooks_purchased_prev_volumes_chinese || 0);
    const prevJpn = Number(r.ebooks_purchased_prev_volumes_japanese || 0);
    const prevKor = Number(r.ebooks_purchased_prev_volumes_korean || 0);
    const prevNcjk = Number(r.ebooks_purchased_prev_volumes_noncjk || 0);
    const addChi = Number(r.ebooks_purchased_add_volumes_chinese || 0);
    const addJpn = Number(r.ebooks_purchased_add_volumes_japanese || 0);
    const addKor = Number(r.ebooks_purchased_add_volumes_korean || 0);
    const addNcjk = Number(r.ebooks_purchased_add_volumes_noncjk || 0);

    const calcChi = prevChi + addChi;
    const calcJpn = prevJpn + addJpn;
    const calcKor = prevKor + addKor;
    const calcNcjk = prevNcjk + addNcjk;
    const calculatedSubtotal = calcChi + calcJpn + calcKor + calcNcjk;

    const storedSubtotal = Number(r.ebooks_purchased_volumes_subtotal || 0);
    const vhEbookTotal = Number(r.vhebooks_purchased_volume_total || 0);
    const vhGrandTotal = Number(r.vhgrandtotal || 0);
    const vhOverallGrandTotal = Number(r.vhoverall_grand_total || 0);

    // Check if there's a mismatch
    const subtotalMismatch = storedSubtotal !== calculatedSubtotal;
    const vhMismatch = r.vh_id && vhEbookTotal !== calculatedSubtotal;
    const overallMismatch = r.vh_id && vhOverallGrandTotal !== (vhGrandTotal + calculatedSubtotal);

    if (subtotalMismatch || vhMismatch) {
      mismatchCount++;
      mismatches.push({
        year: r.year,
        library: r.library_name,
        ebook_id: r.ebook_id,
        vh_id: r.vh_id,
        prev: { chi: prevChi, jpn: prevJpn, kor: prevKor, ncjk: prevNcjk },
        add: { chi: addChi, jpn: addJpn, kor: addKor, ncjk: addNcjk },
        calculatedSubtotal,
        storedSubtotal,
        vhEbookTotal,
        vhGrandTotal,
        vhOverallGrandTotal,
        correctOverallGrandTotal: vhGrandTotal + calculatedSubtotal,
      });
    }
  }

  console.log(`Records with mismatches: ${mismatchCount}\n`);
  
  if (mismatches.length > 0) {
    console.log('=== MISMATCHED RECORDS ===\n');
    for (const m of mismatches) {
      console.log(`Year: ${m.year} | Library: ${m.library}`);
      console.log(`  E-Book ID: ${m.ebook_id} | VH ID: ${m.vh_id || 'N/A'}`);
      console.log(`  Prev volumes: Chi=${m.prev.chi} Jpn=${m.prev.jpn} Kor=${m.prev.kor} NonCJK=${m.prev.ncjk}`);
      console.log(`  Add volumes:  Chi=${m.add.chi} Jpn=${m.add.jpn} Kor=${m.add.kor} NonCJK=${m.add.ncjk}`);
      console.log(`  Calculated subtotal: ${m.calculatedSubtotal}`);
      console.log(`  Stored ebooks_purchased_volumes_subtotal: ${m.storedSubtotal} ${m.storedSubtotal !== m.calculatedSubtotal ? '❌ WRONG' : '✅'}`);
      console.log(`  VH vhebooks_purchased_volume_total: ${m.vhEbookTotal} ${m.vh_id && m.vhEbookTotal !== m.calculatedSubtotal ? '❌ WRONG' : '✅'}`);
      console.log(`  VH vhgrandtotal (physical): ${m.vhGrandTotal}`);
      console.log(`  VH vhoverall_grand_total: ${m.vhOverallGrandTotal} → should be: ${m.correctOverallGrandTotal} ${m.vhOverallGrandTotal !== m.correctOverallGrandTotal ? '❌ WRONG' : '✅'}`);
      console.log('');
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total E-Book records: ${records.length}`);
  console.log(`Records needing update: ${mismatchCount}`);

  } finally {
    client.release();
  }
}

main()
  .catch(console.error)
  .finally(() => pool.end());
