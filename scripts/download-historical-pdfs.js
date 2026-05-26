#!/usr/bin/env node
/**
 * Download historical CEAL PDFs from the legacy ceal.ku.edu site
 * and save them to /public/docs/historical/
 *
 * Run: node scripts/download-historical-pdfs.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'docs', 'historical');

// PDF links extracted from https://ceal.ku.edu/year-pdf-version
// Format: [year label, URL, optional filename override]
const PDFS = [
  // 1990s pre-revision
  ['1997-1998', 'https://ceal.ku.edu/download/1998', 'ceal-stats-1997-1998.pdf'],
  ['1996-1997', 'https://ceal.ku.edu/download/1997', 'ceal-stats-1996-1997.pdf'],
  ['1995-1996', 'https://ceal.ku.edu/download/1996', 'ceal-stats-1995-1996.pdf'],
  ['1994-1995', 'https://ceal.ku.edu/download/1995', 'ceal-stats-1994-1995.pdf'],
  ['1993-1994', 'https://ceal.ku.edu/download/1994', 'ceal-stats-1993-1994.pdf'],
  ['1992-1993', 'https://ceal.ku.edu/download/1993', 'ceal-stats-1992-1993.pdf'],
  ['1991-1992', 'https://ceal.ku.edu/download/1992', 'ceal-stats-1991-1992.pdf'],
  ['1990-1991', 'https://ceal.ku.edu/download/1991', 'ceal-stats-1990-1991.pdf'],

  // 1980s
  ['1989', 'https://ceal.ku.edu/download/1989', 'ceal-stats-1989.pdf'],
  ['1988', 'https://ceal.ku.edu/download/1988', 'ceal-stats-1988.pdf'],
  ['1987', 'https://ceal.ku.edu/download/1987', 'ceal-stats-1987.pdf'],
  ['1979-1980', 'https://ceal.ku.edu/download/1980', 'ceal-stats-1979-1980.pdf'],

  // 1970s
  ['1975', 'https://ceal.ku.edu/download/1975', 'ceal-stats-1975.pdf'],
  ['1973', 'https://ceal.ku.edu/download/1973', 'ceal-stats-1973.pdf'],
  ['1970', 'https://ceal.ku.edu/download/1970', 'ceal-stats-1970.pdf'],

  // Pre-1970
  ['1968', 'https://ceal.ku.edu/download/2005', 'ceal-stats-1968.pdf'], // note: URL has different ID
  ['1967', 'https://ceal.ku.edu/download/2006', 'ceal-stats-1967.pdf'], // note: URL has different ID
  ['1965', 'https://ceal.ku.edu/download/1965', 'ceal-stats-1965.pdf'],
  ['1964', 'https://ceal.ku.edu/download/1964', 'ceal-stats-1964.pdf'],
  ['1957', 'https://ceal.ku.edu/download/1957', 'ceal-stats-1957.pdf'],
  ['1930-1975', 'https://ceal.ku.edu/download/1930_75', 'ceal-stats-1930-1975-growth.pdf'],
];

// Additional PDFs with different URL patterns (scholarworks, etc.)
const ADDITIONAL_PDFS = [
  ['1998-1999 Revised', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10162/1/CEALstats_1998_1999_revised.pdf'],
  ['1999-2000', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10492/1/cealstat99_00.pdf'],
  ['2000-2001', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10160/3/cealstats_2000_2001.pdf'],
  ['2001-2002', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10159/3/Doll-CEAL%20Statistics%202001-2002.pdf'],
  ['2002-2003', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10158/3/CEALstats_2002_2003.pdf'],
  ['2003-2004', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10156/1/cealstat03_04.pdf'],
  ['2004-2005', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10157/1/cealstat04_05.pdf'],
  ['2005-2006', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10155/1/cealstat05_06.pdf'],
  ['2006-2007', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10154/1/cealstat06_07.pdf'],
  ['2007-2008', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10153/1/cealstat2007_08.pdf'],
  ['2008-2009', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10152/1/cealstats2008_09.pdf'],
  ['2009-2010', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10120/1/cealstats2009_10.pdf'],
  ['2010-2011', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10118/1/cealstats2010_11%5b1%5d.pdf'],
  ['2011-2012', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10956/1/cealstats2011_12.pdf'],
  ['2012-2013', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/13414/1/cealstats2012_2013.pdf'],
  ['2014-2015', 'http://hdl.handle.net/1808/20316'],
  ['2015-2016', 'http://hdl.handle.net/1808/22713'],
  ['2016-2017', 'https://kuscholarworks.ku.edu/handle/1808/26456'],
  ['2017-2018', 'http://hdl.handle.net/1808/29620'],
  ['2018-2019', 'http://hdl.handle.net/1808/30603'],
  ['2019-2020', 'http://hdl.handle.net/1808/31584'],
  ['2021-2022', 'https://scholarsarchive.byu.edu/cgi/viewcontent.cgi?article=2835&context=jeal'],
  ['2022-2023', 'https://scholarsarchive.byu.edu/cgi/viewcontent.cgi?article=2856&context=jeal'],
];

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    // Handle redirects
    const request = protocol.get(url, { followRedirect: true }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`  ↳ Following redirect to ${response.headers.location}`);
        return downloadFile(response.headers.location, outputPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`));
      }

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(outputPath);
        console.log(`  ✓ Downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
        resolve();
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  console.log(`Downloading historical CEAL PDFs to:\n${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Combine all PDFs
  const allPdfs = [
    ...PDFS.map(([year, url, filename]) => [year, url, filename]),
    ...ADDITIONAL_PDFS.map(([year, url]) => {
      // Generate filename from URL
      const parsed = new URL(url);
      const basename = path.basename(parsed.pathname).replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = basename.endsWith('.pdf') ? basename : `ceal-stats-${year.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      return [year, url, filename];
    })
  ];

  let succeeded = 0;
  let failed = 0;

  for (const [year, url, filename] of allPdfs) {
    const outputPath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(outputPath)) {
      console.log(`[SKIP] ${year} - already exists (${filename})`);
      succeeded++;
      continue;
    }

    console.log(`[DOWNLOAD] ${year}`);
    console.log(`  URL: ${url}`);
    console.log(`  File: ${filename}`);

    try {
      await downloadFile(url, outputPath);
      succeeded++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      failed++;
      // Remove partial file if exists
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }

    // Small delay to be polite to servers
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n========================================`);
  console.log(`Download complete:`);
  console.log(`  Succeeded: ${succeeded}/${allPdfs.length}`);
  console.log(`  Failed: ${failed}/${allPdfs.length}`);
  console.log(`========================================`);
}

main().catch(console.error);
