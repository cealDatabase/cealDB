import type { PdfTableConfig, HeaderTier } from './pdfExporter';

function fiscalDateRange(year: number): string {
  return `from July 1, ${year - 1} through June 30, ${year}`;
}

function asOfDate(year: number): string {
  return `as of June 30, ${year}`;
}

// =============================================================================
// Table 1 — Monograph Additions (Form 1)
// =============================================================================
export function getTable1Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 1',
    title: `Acquisitions of East Asian Materials ${fiscalDateRange(year)}`,
    subtitle: 'Monograph Additions',
    fiscalYear: year,
    notesField: 'manotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 3 },
          { label: 'Purchased', colspan: 10 },
          { label: "Rec'd but not Purchased", colspan: 10 },
          { label: 'Total Number of Additions', colspan: 10 },
        ],
      },
      {
        cells: [
          { label: '', colspan: 1 },
          { label: 'Titles', colspan: 5 },
          { label: 'Volumes', colspan: 5 },
          { label: 'Titles', colspan: 5 },
          { label: 'Volumes', colspan: 5 },
          { label: 'Titles', colspan: 5 },
          { label: 'Volumes', colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'mapurchased_titles_chinese', 'mapurchased_titles_japanese', 'mapurchased_titles_korean', 'mapurchased_titles_noncjk', 'mapurchased_titles_subtotal',
      'mapurchased_volumes_chinese', 'mapurchased_volumes_japanese', 'mapurchased_volumes_korean', 'mapurchased_volumes_noncjk', 'mapurchased_volumes_subtotal',
      'manonpurchased_titles_chinese', 'manonpurchased_titles_japanese', 'manonpurchased_titles_korean', 'manonpurchased_titles_noncjk', 'manonpurchased_titles_subtotal',
      'manonpurchased_volumes_chinese', 'manonpurchased_volumes_japanese', 'manonpurchased_volumes_korean', 'manonpurchased_volumes_noncjk', 'manonpurchased_volumes_subtotal',
      'matotal_titles_chinese', 'matotal_titles_japanese', 'matotal_titles_korean', 'matotal_titles_noncjk', 'matotal_titles',
      'matotal_volumes_chinese', 'matotal_volumes_japanese', 'matotal_volumes_korean', 'matotal_volumes_noncjk', 'matotal_volumes',
    ],
  };
}

// =============================================================================
// Table 2 — Total Volumes in Library (Form 2)
// =============================================================================
export function getTable2Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 2',
    title: `Holdings of East Asian Materials of North American Institutions ${asOfDate(year)}`,
    subtitle: 'Total Volumes in Library',
    fiscalYear: year,
    notesField: 'vhnotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: `Vols. Held June 30, ${year - 1}`, colspan: 5 },
          { label: 'Vols. Added During Year - Gross', colspan: 5 },
          { label: 'Vols. Withdrawn During Year', colspan: 5 },
          { label: 'Vols. Added During Year - Net', colspan: 5 },
          { label: `Vols. Held June 30, ${year}`, colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(),
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'vhprevious_year_chinese', 'vhprevious_year_japanese', 'vhprevious_year_korean', 'vhprevious_year_noncjk', 'vhprevious_year_subtotal',
      'vhadded_gross_chinese', 'vhadded_gross_japanese', 'vhadded_gross_korean', 'vhadded_gross_noncjk', 'vhadded_gross_subtotal',
      'vhwithdrawn_chinese', 'vhwithdrawn_japanese', 'vhwithdrawn_korean', 'vhwithdrawn_noncjk', 'vhwithdrawn_subtotal',
      'vhnet_chinese', 'vhnet_japanese', 'vhnet_korean', 'vhnet_noncjk', 'vhnet_subtotal',
      'vhend_year_chinese', 'vhend_year_japanese', 'vhend_year_korean', 'vhend_year_noncjk', 'vhend_year_subtotal',
    ],
  };
}

// =============================================================================
// Table 3-1 — Serials Purchased & Non-Purchased (Form 3)
// =============================================================================
export function getTable3_1Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 3-1',
    title: `Number of Serial Titles: Purchased and Non-Purchased Received ${asOfDate(year)}`,
    fiscalYear: year,
    notesField: 'snotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 3 },
          { label: 'PURCHASED (Includes Subscriptions)', colspan: 10 },
          { label: 'NON-PURCHASED (Gift/Exchange, Ceased titles, One-time)', colspan: 10 },
        ],
      },
      {
        cells: [
          { label: '', colspan: 1 },
          { label: '1.1 Electronic', colspan: 5 },
          { label: '1.2 Print and Other Formats', colspan: 5 },
          { label: '2.1 Electronic', colspan: 5 },
          { label: '2.2 Prints and Other Formats', colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(),
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      's_epurchased_chinese', 's_epurchased_japanese', 's_epurchased_korean', 's_epurchased_noncjk', 's_epurchased_subtotal',
      'spurchased_chinese', 'spurchased_japanese', 'spurchased_korean', 'spurchased_noncjk', 'spurchased_subtotal',
      's_enonpurchased_chinese', 's_enonpurchased_japanese', 's_enonpurchased_korean', 's_enonpurchased_noncjk', 's_enonpurchased_subtotal',
      'snonpurchased_chinese', 'snonpurchased_japanese', 'snonpurchased_korean', 'snonpurchased_noncjk', 'snonpurchased_subtotal',
    ],
  };
}

// =============================================================================
// Table 3-2 — Serials Totals (Form 3)
// =============================================================================
export function getTable3_2Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 3-2',
    title: `Number of Serial Titles: Purchased and Non-Purchased Received ${asOfDate(year)}`,
    fiscalYear: year,
    notesField: 'snotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: '(1.1+2.1 = 3.1) Total Electronic', colspan: 5 },
          { label: '(1.2+2.2 = 3.2) Total Print and Other Formats', colspan: 5 },
          { label: '3.3 Total Number of Serials Held', colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(),
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      's_etotal_chinese', 's_etotal_japanese', 's_etotal_korean', 's_etotal_noncjk', 's_egrandtotal',
      'stotal_chinese', 'stotal_japanese', 'stotal_korean', 'stotal_noncjk', 'sgrandtotal',
      'stotal_overall_chinese', 'stotal_overall_japanese', 'stotal_overall_korean', 'stotal_overall_noncjk', 'stotal_overall',
    ],
  };
}

// =============================================================================
// Table 4-1 — Other Holdings Physical (Form 4)
// =============================================================================
export function getTable4_1Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 4-1',
    title: `Holdings of Other East Asian Materials in North American Institutions ${asOfDate(year)}`,
    subtitle: 'Other Library Materials',
    fiscalYear: year,
    notesField: 'ohnotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: 'Microform', colspan: 5 },
          { label: 'Cartographic and Graphic', colspan: 5 },
          { label: 'Audio', colspan: 5 },
          { label: 'Video', colspan: 5 },
          { label: 'DVD', colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(),
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'ohmicroform_chinese', 'ohmicroform_japanese', 'ohmicroform_korean', 'ohmicroform_noncjk', 'ohmicroform_subtotal',
      'ohcarto_graphic_chinese', 'ohcarto_graphic_japanese', 'ohcarto_graphic_korean', 'ohcarto_graphic_noncjk', 'ohcarto_graphic_subtotal',
      'ohaudio_chinese', 'ohaudio_japanese', 'ohaudio_korean', 'ohaudio_noncjk', 'ohaudio_subtotal',
      'ohfilm_video_chinese', 'ohfilm_video_japanese', 'ohfilm_video_korean', 'ohfilm_video_noncjk', 'ohfilm_video_subtotal',
      'ohdvd_chinese', 'ohdvd_japanese', 'ohdvd_korean', 'ohdvd_noncjk', 'ohdvd_subtotal',
    ],
  };
}

// =============================================================================
// Table 4-2 — Other Holdings Online (Form 4)
// =============================================================================
export function getTable4_2Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 4-2',
    title: `Holdings of Other East Asian Materials in North American Institutions ${asOfDate(year)}`,
    subtitle: 'Other Library Materials',
    fiscalYear: year,
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: 'Online Map', colspan: 5 },
          { label: 'Online Image/Photograph', colspan: 5 },
          { label: 'Streaming Audio/Music', colspan: 5 },
          { label: 'Streaming Film/Video', colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(),
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'ohonlinemapchinese', 'ohonlinemapjapanese', 'ohonlinemapkorean', 'ohonlinemapnoncjk', 'ohonlinemapsubtotal',
      'ohonlineimagechinese', 'ohonlineimagejapanese', 'ohonlineimagekorean', 'ohonlineimagenoncjk', 'ohonlineimagesubtotal',
      'ohstreamingchinese', 'ohstreamingjapanese', 'ohstreamingkorean', 'ohstreamingnoncjk', 'ohstreamingsubtotal',
      'ohstreamingvideochinese', 'ohstreamingvideojapanese', 'ohstreamingvideokorean', 'ohstreamingvideononcjk', 'ohstreamingvideosubtotal',
    ],
  };
}

// =============================================================================
// Table 4-3 — Other Holdings Custom + Total (Form 4)
// =============================================================================
export function getTable4_3Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 4-3',
    title: `Holdings of Other East Asian Materials in North American Institutions ${asOfDate(year)}`,
    subtitle: 'Other Library Materials',
    fiscalYear: year,
    notesField: 'ohnotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: 'Custom type 1', colspan: 5 },
          { label: 'Custom type 2', colspan: 5 },
          { label: 'Custom type 3', colspan: 5 },
          { label: 'Custom type 4', colspan: 5 },
          { label: 'Total Other Library Materials', colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(),
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'ohcustom1chinese', 'ohcustom1japanese', 'ohcustom1korean', 'ohcustom1noncjk', 'ohcustom1subtotal',
      'ohcustom2chinese', 'ohcustom2japanese', 'ohcustom2korean', 'ohcustom2noncjk', 'ohcustom2subtotal',
      'ohcustom3chinese', 'ohcustom3japanese', 'ohcustom3korean', 'ohcustom3noncjk', 'ohcustom3subtotal',
      'ohcustom4chinese', 'ohcustom4japanese', 'ohcustom4korean', 'ohcustom4noncjk', 'ohcustom4subtotal',
      'ohtotal_chinese', 'ohtotal_japanese', 'ohtotal_korean', 'ohtotal_noncjk', 'ohtotal_grandtotal',
    ],
  };
}

// =============================================================================
// Table 5 — Total East Asian Collections (Cross-form composite)
// =============================================================================
export function getTable5Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 5',
    title: `Total East Asian Collections of North American Institutions ${asOfDate(year)}`,
    fiscalYear: year,
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: `Total Physical Volumes Held as of June 30, ${year}`, colspan: 5 },
          { label: 'Total Electronic Books Volumes Held', colspan: 1 },
          { label: 'Total Other Library Materials', colspan: 1 },
          { label: 'GRAND TOTAL MATERIALS HELD', colspan: 2 },
          { label: 'Number of Unprocessed/Backlog Materials', colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: '', colspan: 1 },
          { label: '', colspan: 1 },
          { label: 'w/o E-Books', colspan: 1 }, { label: 'w/ E-Books', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'vhend_year_chinese', 'vhend_year_japanese', 'vhend_year_korean', 'vhend_year_noncjk', 'vhend_year_subtotal',
      'ebooks_total_volumes',
      'ohtotal_grandtotal',
      'grand_total_without_ebooks',
      'grand_total_with_ebooks',
      'ubchinese', 'ubjapanese', 'ubkorean', 'ubnoncjk', 'ubtotal',
    ],
  };
}

// =============================================================================
// Table 6-1 — Fiscal Appropriations (Form 6)
// =============================================================================
export function getTable6_1Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 6-1',
    title: `Fiscal Support of East Asian Libraries and Collections in North America ${fiscalDateRange(year)}`,
    subtitle: 'Appropriations (US$)',
    fiscalYear: year,
    notesField: 'fsnotes',
    formatAsCurrency: true,
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 3 },
          { label: 'Chinese', colspan: 5 },
          { label: 'Japanese', colspan: 5 },
          { label: 'Korean', colspan: 5 },
          { label: 'N-CJK', colspan: 5 },
          { label: 'Total Appropriations (US$)', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: '', colspan: 1 },
          ...fiscalSubHeaders(), ...fiscalSubHeaders(), ...fiscalSubHeaders(), ...fiscalSubHeaders(),
          { label: '', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          { label: 'Mono', colspan: 1 }, { label: 'Serial', colspan: 1 }, { label: 'Other', colspan: 1 }, { label: 'Elec', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'Mono', colspan: 1 }, { label: 'Serial', colspan: 1 }, { label: 'Other', colspan: 1 }, { label: 'Elec', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'Mono', colspan: 1 }, { label: 'Serial', colspan: 1 }, { label: 'Other', colspan: 1 }, { label: 'Elec', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'Mono', colspan: 1 }, { label: 'Serial', colspan: 1 }, { label: 'Other', colspan: 1 }, { label: 'Elec', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: '', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'fschinese_appropriations_monographic', 'fschinese_appropriations_serial', 'fschinese_appropriations_other_material', 'fschinese_appropriations_electronic', 'fschinese_appropriations_subtotal',
      'fsjapanese_appropriations_monographic', 'fsjapanese_appropriations_serial', 'fsjapanese_appropriations_other_material', 'fsjapanese_appropriations_electronic', 'fsjapanese_appropriations_subtotal',
      'fskorean_appropriations_monographic', 'fskorean_appropriations_serial', 'fskorean_appropriations_other_material', 'fskorean_appropriations_electronic', 'fskorean_appropriations_subtotal',
      'fsnoncjk_appropriations_monographic', 'fsnoncjk_appropriations_serial', 'fsnoncjk_appropriations_other_material', 'fsnoncjk_appropriations_electronic', 'fsnoncjk_appropriations_subtotal',
      'fstotal_appropriations',
    ],
  };
}

// =============================================================================
// Table 6-2 — Fiscal Other Funding (Form 6)
// =============================================================================
export function getTable6_2Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 6-2',
    title: `Fiscal Support of East Asian Libraries and Collections in North America ${fiscalDateRange(year)}`,
    fiscalYear: year,
    notesField: 'fsnotes',
    formatAsCurrency: true,
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: 'Endowments (US$)', colspan: 5 },
          { label: 'Grants (US$)', colspan: 5 },
          { label: 'East Asian Program Support (US$)', colspan: 5 },
          { label: 'Total Acquisitions (US$)', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'N-CJK', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: '', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'fsendowments_chinese', 'fsendowments_japanese', 'fsendowments_korean', 'fsendowments_noncjk', 'fsendowments_subtotal',
      'fsgrants_chinese', 'fsgrants_japanese', 'fsgrants_korean', 'fsgrants_noncjk', 'fsgrants_subtotal',
      'fseast_asian_program_support_chinese', 'fseast_asian_program_support_japanese', 'fseast_asian_program_support_korean', 'fseast_asian_program_support_noncjk', 'fseast_asian_program_support_subtotal',
      'fstotal_acquisition_budget',
    ],
  };
}

// =============================================================================
// Table 7 — Personnel Support (Form 7)
// =============================================================================
export function getTable7Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 7',
    title: `Personnel Support of East Asian Libraries and Collections in North America ${fiscalDateRange(year)}`,
    fiscalYear: year,
    notesField: 'psfnotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: 'Professional Staff, FTE', colspan: 5 },
          { label: 'Support Staff, FTE', colspan: 5 },
          { label: 'Student Assistant, FTE', colspan: 5 },
          { label: 'Others FTE', colspan: 1 },
          { label: 'Outsourcing', colspan: 2 },
          { label: 'Total FTE', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'East Asian', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'East Asian', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'JPN', colspan: 1 }, { label: 'KOR', colspan: 1 }, { label: 'East Asian', colspan: 1 }, { label: 'Total', colspan: 1 },
          { label: '', colspan: 1 },
          { label: 'Acquisition', colspan: 1 }, { label: 'Processing', colspan: 1 },
          { label: '', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'psfprofessional_chinese', 'psfprofessional_japanese', 'psfprofessional_korean', 'psfprofessional_eastasian', 'psfprofessional_subtotal',
      'psfsupport_staff_chinese', 'psfsupport_staff_japanese', 'psfsupport_staff_korean', 'psfsupport_staff_eastasian', 'psfsupport_staff_subtotal',
      'psfstudent_assistants_chinese', 'psfstudent_assistants_japanese', 'psfstudent_assistants_korean', 'psfstudent_assistants_eastasian', 'psfstudent_assistants_subtotal',
      'psfothers',
      'psfosacquisition', 'psfosprocessing',
      'psftotal',
    ],
  };
}

// =============================================================================
// Table 8 — Public Services (Form 8)
// =============================================================================
export function getTable8Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 8',
    title: `Public Services of East Asian Libraries and Collections in North America ${fiscalDateRange(year)}`,
    fiscalYear: year,
    notesField: 'psnotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 3 },
          { label: 'Number of Library Presentations', colspan: 1, rowspan: 3 },
          { label: 'Participants in Presentations', colspan: 1, rowspan: 3 },
          { label: 'Number of Reference Transactions', colspan: 1, rowspan: 3 },
          { label: 'Number of Total Circulation', colspan: 1, rowspan: 3 },
          { label: 'Interlibrary Loans', colspan: 4 },
        ],
      },
      {
        cells: [
          { label: '', colspan: 1 },
          { label: '', colspan: 1 },
          { label: '', colspan: 1 },
          { label: '', colspan: 1 },
          { label: '', colspan: 1 },
          { label: 'Lending Requests', colspan: 2 },
          { label: 'Borrowing Requests', colspan: 2 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          { label: '', colspan: 1 },
          { label: '', colspan: 1 },
          { label: '', colspan: 1 },
          { label: '', colspan: 1 },
          { label: 'Filled', colspan: 1 }, { label: 'Unfilled', colspan: 1 },
          { label: 'Filled', colspan: 1 }, { label: 'Unfilled', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'pspresentations_subtotal',
      'pspresentation_participants_subtotal',
      'psreference_transactions_subtotal',
      'pstotal_circulations_subtotal',
      'pslending_requests_filled_subtotal',
      'pslending_requests_unfilled_subtotal',
      'psborrowing_requests_filled_subtotal',
      'psborrowing_requests_unfilled_subtotal',
    ],
  };
}

// =============================================================================
// Table 9-1 — Electronic Computer Files (Form 9)
// =============================================================================
export function getTable9_1Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 9-1',
    title: `Electronic Resources of East Asian Materials ${asOfDate(year)}`,
    subtitle: 'Computer Files',
    fiscalYear: year,
    notesField: 'enotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: 'Computer Files (one time monographic purchase)', colspan: 5 },
          { label: 'Accompanied Computer Files', colspan: 5 },
          { label: 'One Time Gift Computer Files', colspan: 5 },
          { label: 'Total Computer Files', colspan: 5 },
          { label: 'Previous Year Total Computer Files', colspan: 5 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkNonCjkSubtotalHeaders(), ...cjkNonCjkSubtotalHeaders(), ...cjkNonCjkSubtotalHeaders(),
          ...cjkNonCjkSubtotalHeaders(), ...cjkNonCjkSubtotalHeaders(),
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'eonetime_computer_title_chinese', 'eonetime_computer_title_japanese', 'eonetime_computer_title_korean', 'eonetime_computer_title_noncjk', 'eonetime_computer_title_subtotal',
      'eaccompanied_computer_title_chinese', 'eaccompanied_computer_title_japanese', 'eaccompanied_computer_title_korean', 'eaccompanied_computer_title_noncjk', 'eaccompanied_computer_title_subtotal',
      'egift_computer_title_chinese', 'egift_computer_title_japanese', 'egift_computer_title_korean', 'egift_computer_title_noncjk', 'egift_computer_title_subtotal',
      'etotal_computer_title_chinese', 'etotal_computer_title_japanese', 'etotal_computer_title_korean', 'etotal_computer_title_noncjk', 'etotal_computer_title_subtotal',
      'eprevious_total_title_chinese', 'eprevious_total_title_japanese', 'eprevious_total_title_korean', 'eprevious_total_title_noncjk', 'eprevious_total_title_subtotal',
    ],
  };
}

// =============================================================================
// Table 9-2 — Electronic Databases & Serials (Form 9)
// =============================================================================
export function getTable9_2Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 9-2',
    title: `Electronic Resources of East Asian Materials ${asOfDate(year)}`,
    subtitle: 'Electronic Databases & Serials',
    fiscalYear: year,
    notesField: 'enotes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 2 },
          { label: 'Grand Total Computer Files', colspan: 10 },
          { label: 'Electronic Indexes and Reference Tools (opt.)', colspan: 5 },
          { label: 'Electronic Full Text Periodicals (opt.)', colspan: 5 },
          { label: 'Electronic Subscriptions Total', colspan: 5 },
          { label: 'Total Electronic Resources Expenditure', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          { label: 'CHN', colspan: 1 }, { label: 'CDs', colspan: 1 },
          { label: 'JPN', colspan: 1 }, { label: 'CDs', colspan: 1 },
          { label: 'KOR', colspan: 1 }, { label: 'CDs', colspan: 1 },
          { label: 'N-CJK', colspan: 1 }, { label: 'CDs', colspan: 1 },
          { label: 'Total', colspan: 1 }, { label: 'CDs', colspan: 1 },
          ...cjkSubHeaders(),
          ...cjkSubHeaders(),
          ...cjkSubHeaders(),
          { label: '', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'egrand_total_title_chinese', 'egrand_total_cd_chinese',
      'egrand_total_title_japanese', 'egrand_total_cd_japanese',
      'egrand_total_title_korean', 'egrand_total_cd_korean',
      'egrand_total_title_noncjk', 'egrand_total_cd_noncjk',
      'egrand_total_title_subtotal', 'egrand_total_cd_subtotal',
      'eindex_electronic_title_chinese', 'eindex_electronic_title_japanese', 'eindex_electronic_title_korean', 'eindex_electronic_title_noncjk', 'eindex_electronic_title_subtotal',
      'efulltext_electronic_title_chinese', 'efulltext_electronic_title_japanese', 'efulltext_electronic_title_korean', 'efulltext_electronic_title_noncjk', 'efulltext_electronic_title_subtotal',
      'etotal_electronic_title_chinese', 'etotal_electronic_title_japanese', 'etotal_electronic_title_korean', 'etotal_electronic_title_noncjk', 'etotal_electronic_title_subtotal',
      'etotal_expenditure_grandtotal',
    ],
  };
}

// =============================================================================
// Table 10-1 — Electronic Books Titles (Form 10)
// =============================================================================
export function getTable10_1Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 10-1',
    title: `Electronic Books Holdings of East Asian Materials ${asOfDate(year)}`,
    subtitle: 'Electronic Books in Library — Titles',
    fiscalYear: year,
    notesField: 'ebooks_notes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 3 },
          { label: 'Purchased', colspan: 15 },
          { label: 'Non-Purchased', colspan: 5 },
          { label: 'Subscription', colspan: 5 },
          { label: 'Titles Total', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: '', colspan: 1 },
          { label: `Held June 30, ${year - 1}`, colspan: 5 },
          { label: 'Added During Year', colspan: 5 },
          { label: `Held June 30, ${year}`, colspan: 5 },
          { label: '', colspan: 5 },
          { label: '', colspan: 5 },
          { label: '', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(),
          ...cjkSubHeaders(), ...cjkSubHeaders(),
          { label: '', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'ebooks_purchased_prev_titles_chinese', 'ebooks_purchased_prev_titles_japanese', 'ebooks_purchased_prev_titles_korean', 'ebooks_purchased_prev_titles_noncjk', 'ebooks_purchased_prev_titles_subtotal',
      'ebooks_purchased_add_titles_chinese', 'ebooks_purchased_add_titles_japanese', 'ebooks_purchased_add_titles_korean', 'ebooks_purchased_add_titles_noncjk', 'ebooks_purchased_add_titles_subtotal',
      'ebooks_purchased_titles_chinese', 'ebooks_purchased_titles_japanese', 'ebooks_purchased_titles_korean', 'ebooks_purchased_titles_noncjk', 'ebooks_purchased_titles_subtotal',
      'ebooks_nonpurchased_titles_chinese', 'ebooks_nonpurchased_titles_japanese', 'ebooks_nonpurchased_titles_korean', 'ebooks_nonpurchased_titles_noncjk', 'ebooks_nonpurchased_titles_subtotal',
      'ebooks_subscription_titles_chinese', 'ebooks_subscription_titles_japanese', 'ebooks_subscription_titles_korean', 'ebooks_subscription_titles_noncjk', 'ebooks_subscription_titles_subtotal',
      'ebooks_total_titles',
    ],
  };
}

// =============================================================================
// Table 10-2 — Electronic Books Volumes (Form 10)
// =============================================================================
export function getTable10_2Config(year: number): Omit<PdfTableConfig, 'data'> {
  return {
    tableNumber: 'Table 10-2',
    title: `Electronic Books Holdings of East Asian Materials ${asOfDate(year)}`,
    subtitle: 'Electronic Books in Library — Volumes',
    fiscalYear: year,
    notesField: 'ebooks_notes',
    headerTiers: [
      {
        cells: [
          { label: '', colspan: 1, rowspan: 3 },
          { label: 'Purchased', colspan: 15 },
          { label: 'Non-Purchased', colspan: 5 },
          { label: 'Subscription', colspan: 5 },
          { label: 'Volumes Total', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: '', colspan: 1 },
          { label: `Held June 30, ${year - 1}`, colspan: 5 },
          { label: 'Added During Year', colspan: 5 },
          { label: `Held June 30, ${year}`, colspan: 5 },
          { label: '', colspan: 5 },
          { label: '', colspan: 5 },
          { label: '', colspan: 1 },
        ],
      },
      {
        cells: [
          { label: 'Institutions', colspan: 1 },
          ...cjkSubHeaders(), ...cjkSubHeaders(), ...cjkSubHeaders(),
          ...cjkSubHeaders(), ...cjkSubHeaders(),
          { label: '', colspan: 1 },
        ],
      },
    ],
    fieldKeys: [
      'Library_Year.Library.library_name',
      'ebooks_purchased_prev_volumes_chinese', 'ebooks_purchased_prev_volumes_japanese', 'ebooks_purchased_prev_volumes_korean', 'ebooks_purchased_prev_volumes_noncjk', 'ebooks_purchased_prev_volumes_subtotal',
      'ebooks_purchased_add_volumes_chinese', 'ebooks_purchased_add_volumes_japanese', 'ebooks_purchased_add_volumes_korean', 'ebooks_purchased_add_volumes_noncjk', 'ebooks_purchased_add_volumes_subtotal',
      'ebooks_purchased_volumes_chinese', 'ebooks_purchased_volumes_japanese', 'ebooks_purchased_volumes_korean', 'ebooks_purchased_volumes_noncjk', 'ebooks_purchased_volumes_subtotal',
      'ebooks_nonpurchased_volumes_chinese', 'ebooks_nonpurchased_volumes_japanese', 'ebooks_nonpurchased_volumes_korean', 'ebooks_nonpurchased_volumes_noncjk', 'ebooks_nonpurchased_volumes_subtotal',
      'ebooks_subscription_volumes_chinese', 'ebooks_subscription_volumes_japanese', 'ebooks_subscription_volumes_korean', 'ebooks_subscription_volumes_noncjk', 'ebooks_subscription_volumes_subtotal',
      'ebooks_total_volumes',
    ],
  };
}

// =============================================================================
// Helper functions for sub-headers
// =============================================================================

function cjkSubHeaders() {
  return [
    { label: 'CHN', colspan: 1 },
    { label: 'JPN', colspan: 1 },
    { label: 'KOR', colspan: 1 },
    { label: 'N-CJK', colspan: 1 },
    { label: 'Total', colspan: 1 },
  ];
}

function cjkNonCjkSubtotalHeaders() {
  return [
    { label: 'CHN', colspan: 1 },
    { label: 'JPN', colspan: 1 },
    { label: 'KOR', colspan: 1 },
    { label: 'N-CJK', colspan: 1 },
    { label: 'Subtotal', colspan: 1 },
  ];
}

function fiscalSubHeaders() {
  return [
    { label: '', colspan: 5 },
  ];
}
