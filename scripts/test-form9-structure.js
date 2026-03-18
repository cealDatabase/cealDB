// Test script to verify Form 9 (Electronic) structure
const { formFieldMappings } = require('../lib/formFieldMappings.ts');

console.log('=== FORM 9 (Electronic Resources) Structure Analysis ===\n');

const electronicFields = formFieldMappings.electronic;
const fieldKeys = Object.keys(electronicFields);

console.log(`Total fields in formFieldMappings.electronic: ${fieldKeys.length}`);
console.log('\nField list:');
fieldKeys.forEach((key, index) => {
  console.log(`${index + 1}. ${key} => ${electronicFields[key]}`);
});

// Expected header structure from the API
const tier1 = [
  { label: 'Institution', colspan: 1 },
  { label: '1. Computer Files (CD-ROMs)', colspan: 60 },
  { label: '2. Electronic Resources', colspan: 15 },
  { label: '3. Expenditure', colspan: 1 }
];

const tier2 = [
  { label: '', colspan: 1 },
  { label: '1.1 One-time Purchases', colspan: 10 },
  { label: '1.2 Accompanied Materials', colspan: 10 },
  { label: '1.3 Gifts', colspan: 10 },
  { label: '1.4 Total Current Year', colspan: 10 },
  { label: '1.5 Previous Year', colspan: 10 },
  { label: '1.6 Grand Total', colspan: 10 },
  { label: '2.1 Electronic Indexes', colspan: 5 },
  { label: '2.2 Full-text Database', colspan: 5 },
  { label: '2.3 Total Electronic', colspan: 5 },
  { label: '', colspan: 1 }
];

const tier1Total = tier1.reduce((sum, h) => sum + h.colspan, 0);
const tier2Total = tier2.reduce((sum, h) => sum + h.colspan, 0);

console.log(`\n=== Header Structure ===`);
console.log(`Tier 1 total colspan: ${tier1Total}`);
console.log(`Tier 2 total colspan: ${tier2Total}`);
console.log(`Field count: ${fieldKeys.length}`);

console.log('\n=== Validation ===');
if (tier1Total === fieldKeys.length && tier2Total === fieldKeys.length) {
  console.log('✓ Header colspans match field count');
} else {
  console.log('✗ MISMATCH DETECTED!');
  console.log(`  Tier 1: ${tier1Total} columns`);
  console.log(`  Tier 2: ${tier2Total} columns`);
  console.log(`  Fields: ${fieldKeys.length} columns`);
  console.log(`  Difference: ${Math.abs(tier1Total - fieldKeys.length)}`);
}
