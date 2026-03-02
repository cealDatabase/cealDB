/**
 * Database cleanup script to remove leading zeros from numeric fields
 * Example: "058" -> 58, "00123.45" -> 123.45
 * Preserves: 0 -> 0, 0.5 -> 0.5
 */

import 'dotenv/config'
import { PrismaClient } from '@/prisma/generated/client/client'

const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

console.log('🔗 Connecting to database...')
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable not found!')
  process.exit(1)
}

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: true,
  }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn']
})

// Helper function to check if a value needs fixing
function needsLeadingZeroFix(value: any): boolean {
  if (value === null || value === undefined) return false
  const str = String(value)
  // Check if starts with 0 but is not just "0" or "0.something"
  return /^0\d+/.test(str)
}

// Helper function to fix leading zeros
function fixLeadingZero(value: any, isDecimal: boolean): number {
  if (value === null || value === undefined) return 0
  const num = isDecimal ? parseFloat(String(value)) : parseInt(String(value), 10)
  return isNaN(num) ? 0 : num
}

async function fixTable(
  tableName: string,
  fields: { name: string; isDecimal: boolean }[]
) {
  console.log(`\n🔍 Checking ${tableName}...`)
  
  const records = await (prisma as any)[tableName].findMany()
  let fixedCount = 0

  for (const record of records) {
    const updates: any = {}
    let needsUpdate = false

    for (const field of fields) {
      const value = record[field.name]
      if (needsLeadingZeroFix(value)) {
        updates[field.name] = fixLeadingZero(value, field.isDecimal)
        needsUpdate = true
        console.log(
          `  - ${tableName}.id=${record.id}: ${field.name} "${value}" -> ${updates[field.name]}`
        )
      }
    }

    if (needsUpdate) {
      await (prisma as any)[tableName].update({
        where: { id: record.id },
        data: updates,
      })
      fixedCount++
    }
  }

  console.log(`✅ ${tableName}: Fixed ${fixedCount} records`)
  return fixedCount
}

async function main() {
  console.log('🚀 Starting database cleanup for leading zeros...\n')
  
  let totalFixed = 0

  // Form 1: Monographic_Acquisitions - all integers
  totalFixed += await fixTable('monographic_Acquisitions', [
    { name: 'mapurchased_titles_chinese', isDecimal: false },
    { name: 'mapurchased_titles_japanese', isDecimal: false },
    { name: 'mapurchased_titles_korean', isDecimal: false },
    { name: 'mapurchased_titles_noncjk', isDecimal: false },
    { name: 'mapurchased_volumes_chinese', isDecimal: false },
    { name: 'mapurchased_volumes_japanese', isDecimal: false },
    { name: 'mapurchased_volumes_korean', isDecimal: false },
    { name: 'mapurchased_volumes_noncjk', isDecimal: false },
    { name: 'manonpurchased_titles_chinese', isDecimal: false },
    { name: 'manonpurchased_titles_japanese', isDecimal: false },
    { name: 'manonpurchased_titles_korean', isDecimal: false },
    { name: 'manonpurchased_titles_noncjk', isDecimal: false },
    { name: 'manonpurchased_volumes_chinese', isDecimal: false },
    { name: 'manonpurchased_volumes_japanese', isDecimal: false },
    { name: 'manonpurchased_volumes_korean', isDecimal: false },
    { name: 'manonpurchased_volumes_noncjk', isDecimal: false },
  ])

  // Form 2: Volume_Holdings - all integers
  totalFixed += await fixTable('volume_Holdings', [
    { name: 'vhchinese', isDecimal: false },
    { name: 'vhjapanese', isDecimal: false },
    { name: 'vhkorean', isDecimal: false },
    { name: 'vhnoncjk', isDecimal: false },
  ])

  // Form 3: Serials - all integers
  totalFixed += await fixTable('serials', [
    { name: 's_epurchased_chinese', isDecimal: false },
    { name: 's_epurchased_japanese', isDecimal: false },
    { name: 's_epurchased_korean', isDecimal: false },
    { name: 's_epurchased_noncjk', isDecimal: false },
    { name: 's_enonpurchased_chinese', isDecimal: false },
    { name: 's_enonpurchased_japanese', isDecimal: false },
    { name: 's_enonpurchased_korean', isDecimal: false },
    { name: 's_enonpurchased_noncjk', isDecimal: false },
    { name: 'spurchased_chinese', isDecimal: false },
    { name: 'spurchased_japanese', isDecimal: false },
    { name: 'spurchased_korean', isDecimal: false },
    { name: 'spurchased_noncjk', isDecimal: false },
    { name: 'snonpurchased_chinese', isDecimal: false },
    { name: 'snonpurchased_japanese', isDecimal: false },
    { name: 'snonpurchased_korean', isDecimal: false },
    { name: 'snonpurchased_noncjk', isDecimal: false },
  ])

  // Form 4: Other_Holdings - all integers
  totalFixed += await fixTable('other_Holdings', [
    { name: 'ohmicroforms_chinese', isDecimal: false },
    { name: 'ohmicroforms_japanese', isDecimal: false },
    { name: 'ohmicroforms_korean', isDecimal: false },
    { name: 'ohmicroforms_noncjk', isDecimal: false },
    { name: 'ohcartographic_chinese', isDecimal: false },
    { name: 'ohcartographic_japanese', isDecimal: false },
    { name: 'ohcartographic_korean', isDecimal: false },
    { name: 'ohcartographic_noncjk', isDecimal: false },
    { name: 'ohaudio_chinese', isDecimal: false },
    { name: 'ohaudio_japanese', isDecimal: false },
    { name: 'ohaudio_korean', isDecimal: false },
    { name: 'ohaudio_noncjk', isDecimal: false },
    { name: 'ohvideo_chinese', isDecimal: false },
    { name: 'ohvideo_japanese', isDecimal: false },
    { name: 'ohvideo_korean', isDecimal: false },
    { name: 'ohvideo_noncjk', isDecimal: false },
    { name: 'ohdvd_chinese', isDecimal: false },
    { name: 'ohdvd_japanese', isDecimal: false },
    { name: 'ohdvd_korean', isDecimal: false },
    { name: 'ohdvd_noncjk', isDecimal: false },
  ])

  // Form 5: Unprocessed_Backlog_Materials - all integers
  totalFixed += await fixTable('unprocessed_Backlog_Materials', [
    { name: 'ubchinese', isDecimal: false },
    { name: 'ubjapanese', isDecimal: false },
    { name: 'ubkorean', isDecimal: false },
    { name: 'ubnoncjk', isDecimal: false },
  ])

  // Form 6: Fiscal_Support - all decimals (currency)
  totalFixed += await fixTable('fiscal_Support', [
    { name: 'fschinese_appropriations_monographic', isDecimal: true },
    { name: 'fschinese_appropriations_serial', isDecimal: true },
    { name: 'fschinese_appropriations_other_material', isDecimal: true },
    { name: 'fschinese_appropriations_electronic', isDecimal: true },
    { name: 'fsjapanese_appropriations_monographic', isDecimal: true },
    { name: 'fsjapanese_appropriations_serial', isDecimal: true },
    { name: 'fsjapanese_appropriations_other_material', isDecimal: true },
    { name: 'fsjapanese_appropriations_electronic', isDecimal: true },
    { name: 'fskorean_appropriations_monographic', isDecimal: true },
    { name: 'fskorean_appropriations_serial', isDecimal: true },
    { name: 'fskorean_appropriations_other_material', isDecimal: true },
    { name: 'fskorean_appropriations_electronic', isDecimal: true },
    { name: 'fsnoncjk_appropriations_monographic', isDecimal: true },
    { name: 'fsnoncjk_appropriations_serial', isDecimal: true },
    { name: 'fsnoncjk_appropriations_other_material', isDecimal: true },
    { name: 'fsnoncjk_appropriations_electronic', isDecimal: true },
    { name: 'fsendowments_chinese', isDecimal: true },
    { name: 'fsendowments_japanese', isDecimal: true },
    { name: 'fsendowments_korean', isDecimal: true },
    { name: 'fsendowments_noncjk', isDecimal: true },
    { name: 'fsgrants_chinese', isDecimal: true },
    { name: 'fsgrants_japanese', isDecimal: true },
    { name: 'fsgrants_korean', isDecimal: true },
    { name: 'fsgrants_noncjk', isDecimal: true },
    { name: 'fseast_asian_program_support_chinese', isDecimal: true },
    { name: 'fseast_asian_program_support_japanese', isDecimal: true },
    { name: 'fseast_asian_program_support_korean', isDecimal: true },
    { name: 'fseast_asian_program_support_noncjk', isDecimal: true },
  ])

  // Form 7: Personnel_Support - all decimals (FTE counts)
  totalFixed += await fixTable('personnel_Support', [
    { name: 'psfprofessional_chinese', isDecimal: true },
    { name: 'psfprofessional_japanese', isDecimal: true },
    { name: 'psfprofessional_korean', isDecimal: true },
    { name: 'psfprofessional_eastasian', isDecimal: true },
    { name: 'psfsupport_staff_chinese', isDecimal: true },
    { name: 'psfsupport_staff_japanese', isDecimal: true },
    { name: 'psfsupport_staff_korean', isDecimal: true },
    { name: 'psfsupport_staff_eastasian', isDecimal: true },
    { name: 'psfstudent_assistants_chinese', isDecimal: true },
    { name: 'psfstudent_assistants_japanese', isDecimal: true },
    { name: 'psfstudent_assistants_korean', isDecimal: true },
    { name: 'psfstudent_assistants_eastasian', isDecimal: true },
    { name: 'psfothers', isDecimal: true },
    { name: 'psfoutsourcing_acquisition', isDecimal: true },
    { name: 'psfoutsourcing_processing', isDecimal: true },
  ])

  // Form 8: Public_Services - all integers
  totalFixed += await fixTable('public_Services', [
    { name: 'pspresentation_chinese', isDecimal: false },
    { name: 'pspresentation_japanese', isDecimal: false },
    { name: 'pspresentation_korean', isDecimal: false },
    { name: 'pspresentation_eastasian', isDecimal: false },
    { name: 'psgate_count_chinese', isDecimal: false },
    { name: 'psgate_count_japanese', isDecimal: false },
    { name: 'psgate_count_korean', isDecimal: false },
    { name: 'psgate_count_eastasian', isDecimal: false },
    { name: 'psreference_transaction_chinese', isDecimal: false },
    { name: 'psreference_transaction_japanese', isDecimal: false },
    { name: 'psreference_transaction_korean', isDecimal: false },
    { name: 'psreference_transaction_eastasian', isDecimal: false },
    { name: 'psservice_population_chinese', isDecimal: false },
    { name: 'psservice_population_japanese', isDecimal: false },
    { name: 'psservice_population_korean', isDecimal: false },
    { name: 'psservice_population_eastasian', isDecimal: false },
    { name: 'psphysical_circulation_chinese', isDecimal: false },
    { name: 'psphysical_circulation_japanese', isDecimal: false },
    { name: 'psphysical_circulation_korean', isDecimal: false },
    { name: 'psphysical_circulation_eastasian', isDecimal: false },
  ])

  // Form 9: Electronic - all integers
  totalFixed += await fixTable('electronic', [
    { name: 'eonetime_computer_title_chinese', isDecimal: false },
    { name: 'eonetime_computer_title_japanese', isDecimal: false },
    { name: 'eonetime_computer_title_korean', isDecimal: false },
    { name: 'eonetime_computer_title_noncjk', isDecimal: false },
    { name: 'eaccompanied_computer_title_chinese', isDecimal: false },
    { name: 'eaccompanied_computer_title_japanese', isDecimal: false },
    { name: 'eaccompanied_computer_title_korean', isDecimal: false },
    { name: 'eaccompanied_computer_title_noncjk', isDecimal: false },
    { name: 'egift_computer_title_chinese', isDecimal: false },
    { name: 'egift_computer_title_japanese', isDecimal: false },
    { name: 'egift_computer_title_korean', isDecimal: false },
    { name: 'egift_computer_title_noncjk', isDecimal: false },
    { name: 'egrand_total_title_chinese', isDecimal: false },
    { name: 'egrand_total_title_japanese', isDecimal: false },
    { name: 'egrand_total_title_korean', isDecimal: false },
    { name: 'egrand_total_title_noncjk', isDecimal: false },
    { name: 'egrand_total_cd_chinese', isDecimal: false },
    { name: 'egrand_total_cd_japanese', isDecimal: false },
    { name: 'egrand_total_cd_korean', isDecimal: false },
    { name: 'egrand_total_cd_noncjk', isDecimal: false },
    { name: 'eindex_electronic_title_chinese', isDecimal: false },
    { name: 'eindex_electronic_title_japanese', isDecimal: false },
    { name: 'eindex_electronic_title_korean', isDecimal: false },
    { name: 'eindex_electronic_title_noncjk', isDecimal: false },
    { name: 'efulltext_electronic_title_chinese', isDecimal: false },
    { name: 'efulltext_electronic_title_japanese', isDecimal: false },
    { name: 'efulltext_electronic_title_korean', isDecimal: false },
    { name: 'efulltext_electronic_title_noncjk', isDecimal: false },
    { name: 'etotal_electronic_title_chinese', isDecimal: false },
    { name: 'etotal_electronic_title_japanese', isDecimal: false },
    { name: 'etotal_electronic_title_korean', isDecimal: false },
    { name: 'etotal_electronic_title_noncjk', isDecimal: false },
  ])

  // Form 10: Electronic_Books - all integers except expenditure
  totalFixed += await fixTable('electronic_Books', [
    { name: 'ebpurchased_titles_chinese', isDecimal: false },
    { name: 'ebpurchased_titles_japanese', isDecimal: false },
    { name: 'ebpurchased_titles_korean', isDecimal: false },
    { name: 'ebpurchased_titles_noncjk', isDecimal: false },
    { name: 'ebpurchased_volumes_chinese', isDecimal: false },
    { name: 'ebpurchased_volumes_japanese', isDecimal: false },
    { name: 'ebpurchased_volumes_korean', isDecimal: false },
    { name: 'ebpurchased_volumes_noncjk', isDecimal: false },
    { name: 'ebnonpurchased_titles_chinese', isDecimal: false },
    { name: 'ebnonpurchased_titles_japanese', isDecimal: false },
    { name: 'ebnonpurchased_titles_korean', isDecimal: false },
    { name: 'ebnonpurchased_titles_noncjk', isDecimal: false },
    { name: 'ebnonpurchased_volumes_chinese', isDecimal: false },
    { name: 'ebnonpurchased_volumes_japanese', isDecimal: false },
    { name: 'ebnonpurchased_volumes_korean', isDecimal: false },
    { name: 'ebnonpurchased_volumes_noncjk', isDecimal: false },
    { name: 'ebsubscription_titles_chinese', isDecimal: false },
    { name: 'ebsubscription_titles_japanese', isDecimal: false },
    { name: 'ebsubscription_titles_korean', isDecimal: false },
    { name: 'ebsubscription_titles_noncjk', isDecimal: false },
    { name: 'ebsubscription_volumes_chinese', isDecimal: false },
    { name: 'ebsubscription_volumes_japanese', isDecimal: false },
    { name: 'ebsubscription_volumes_korean', isDecimal: false },
    { name: 'ebsubscription_volumes_noncjk', isDecimal: false },
    { name: 'ebexpenditure_grandtotal', isDecimal: true },
  ])

  console.log(`\n✨ Cleanup complete! Total records fixed: ${totalFixed}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
