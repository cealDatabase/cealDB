#!/usr/bin/env node
/**
 * Download remaining PDFs with better timeout handling
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'docs', 'historical');

// Just the remaining PDFs that likely weren't downloaded
const PDFS = [
  ['1987', 'https://ceal.ku.edu/download/1987'],
  ['1968', 'https://ceal.ku.edu/download/2005'],
  ['1967', 'https://ceal.ku.edu/download/2006'],
  ['1965', 'https://ceal.ku.edu/download/1965'],
  ['1964', 'https://ceal.ku.edu/download/1964'],
  ['1957', 'https://ceal.ku.edu/download/1957'],
  ['1930-1975', 'https://ceal.ku.edu/download/1930_75'],
];

// Post-1998 PDFs
const POST_1998 = [
  ['1998-1999-revised', 'http://kuscholarworks.ku.edu/dspace/bitstream/1808/10162/1/CEALstats_1998_1999_revised.pdf'],
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
];

const HANDLE_PDFS = [
  ['2014-2015', 'http://hdl.handle.net/1808/20316'],
  ['2015-2016', 'http://hdl.handle.net/1808/22713'],
  ['2016-2017', 'https://kuscholarworks.ku.edu/handle/1808/26456'],
  ['2017-2018', 'http://hdl.handle.net/1808/29620'],
  ['2018-2019', 'http://hdl.handle.net/1808/30603'],
  ['2019-2020', 'http://hdl.handle.net/1808/31584'],
];

const BYU_PDFS = [
  ['2021-2022', 'https://scholarsarchive.byu.edu/cgi/viewcontent.cgi?article=2835&context=jeal'],
  ['2022-2023', 'https://scholarsarchive.byu.edu/cgi/viewcontent.cgi?article=2856&context=jeal'],
];

function getFilename(year, url) {
  if (url.includes('kuscholarworks')) {
    // Try to extract from URL
    const match = url.match(/\/([^/]+\.pdf)$/);
    if (match) return decodeURIComponent(match[1]);
  }
  return `ceal-stats-${year}.pdf`;
}

function downloadFile(url, outputPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => reject(new Error('Timeout')), 60000);

    const request = protocol.get(url, (response) => {
      clearTimeout(timeout);

      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, outputPath, maxRedirects - 1).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`));
      }

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', reject);
    });

    request.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function downloadBatch(pdfs) {
  for (const [year, url] of pdfs) {
    const filename = getFilename(year, url);
    const outputPath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(outputPath)) {
      const size = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
      console.log(`[SKIP] ${year} - ${size} MB`);
      continue;
    }

    console.log(`[DOWNLOAD] ${year} - ${filename}`);
    try {
      await downloadFile(url, outputPath);
      const size = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
      console.log(`  ✓ ${size} MB`);
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  }
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\n=== Pre-1998 remaining ===');
  await downloadBatch(PDFS);

  console.log('\n=== Post-1998 KU ScholarWorks ===');
  await downloadBatch(POST_1998);

  console.log('\n=== Handle.net links ===');
  await downloadBatch(HANDLE_PDFS);

  console.log('\n=== BYU ScholarsArchive ===');
  await downloadBatch(BYU_PDFS);

  console.log('\n=== Done ===');
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.pdf'));
  console.log(`Total PDFs: ${files.length}`);
  files.forEach(f => {
    const size = (fs.statSync(path.join(OUTPUT_DIR, f)).size / 1024 / 1024).toFixed(1);
    console.log(`  ${f} (${size} MB)`);
  });
}

main().catch(console.error);
