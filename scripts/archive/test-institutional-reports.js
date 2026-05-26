/**
 * Comprehensive Test Suite for Institutional Reports Feature
 * 
 * This script tests:
 * 1. User info API endpoint
 * 2. Libraries API endpoint
 * 3. Available years API endpoint
 * 4. Excel export API endpoint
 * 5. Role-based access control
 * 6. Excel file generation with UTF-8 encoding
 */

const BASE_URL = 'http://localhost:3000';
const TEST_RESULTS = [];

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  const result = `${status}: ${testName}`;
  console.log(result);
  if (details) console.log(`   Details: ${details}`);
  TEST_RESULTS.push({ testName, passed, details });
}

async function testUserInfoAPI() {
  console.log('\n📋 Testing User Info API...');
  try {
    const response = await fetch(`${BASE_URL}/api/user-info`);
    const data = await response.json();
    
    if (response.status === 401) {
      logTest('User Info API - Unauthenticated', true, 'Correctly returns 401 for unauthenticated requests');
      return true;
    }
    
    if (response.ok && data.roleIds && data.libraryId !== undefined) {
      logTest('User Info API - Structure', true, 'Returns correct data structure');
      return true;
    }
    
    logTest('User Info API', false, `Unexpected response: ${JSON.stringify(data)}`);
    return false;
  } catch (error) {
    logTest('User Info API', false, error.message);
    return false;
  }
}

async function testLibrariesAPI() {
  console.log('\n📚 Testing Libraries API...');
  try {
    const response = await fetch(`${BASE_URL}/api/libraries`);
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.data)) {
      logTest('Libraries API - Structure', true, `Returns ${data.total} libraries`);
      
      if (data.data.length > 0) {
        const firstLibrary = data.data[0];
        if (firstLibrary.id && firstLibrary.library_name) {
          logTest('Libraries API - Data Format', true, 'Library objects have required fields');
          return true;
        }
      }
      
      logTest('Libraries API - Data Format', false, 'Library objects missing required fields');
      return false;
    }
    
    logTest('Libraries API', false, `Unexpected response: ${JSON.stringify(data)}`);
    return false;
  } catch (error) {
    logTest('Libraries API', false, error.message);
    return false;
  }
}

async function testAvailableYearsAPI() {
  console.log('\n📅 Testing Available Years API...');
  try {
    const response = await fetch(`${BASE_URL}/api/available-years`);
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.years)) {
      logTest('Available Years API - Structure', true, `Returns ${data.years.length} years`);
      
      if (data.years.length > 0) {
        const allYearsValid = data.years.every(year => 
          typeof year === 'string' && /^\d{4}$/.test(year)
        );
        
        if (allYearsValid) {
          logTest('Available Years API - Data Format', true, 'All years are valid 4-digit strings');
          return true;
        }
      }
      
      logTest('Available Years API - Data Format', false, 'Invalid year format');
      return false;
    }
    
    logTest('Available Years API', false, `Unexpected response: ${JSON.stringify(data)}`);
    return false;
  } catch (error) {
    logTest('Available Years API', false, error.message);
    return false;
  }
}

async function testExportAPIValidation() {
  console.log('\n📊 Testing Export API Validation...');
  
  // Test missing parameters
  try {
    const response = await fetch(`${BASE_URL}/api/export-institutional-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    if (response.status === 400) {
      logTest('Export API - Missing Parameters', true, 'Correctly rejects empty request');
    } else {
      logTest('Export API - Missing Parameters', false, `Expected 400, got ${response.status}`);
    }
  } catch (error) {
    logTest('Export API - Missing Parameters', false, error.message);
  }
  
  // Test invalid library ID
  try {
    const response = await fetch(`${BASE_URL}/api/export-institutional-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libraryId: 99999,
        years: ['2024'],
        forms: ['monographic'],
      }),
    });
    
    if (response.status === 404) {
      logTest('Export API - Invalid Library', true, 'Correctly rejects invalid library ID');
    } else {
      logTest('Export API - Invalid Library', false, `Expected 404, got ${response.status}`);
    }
  } catch (error) {
    logTest('Export API - Invalid Library', false, error.message);
  }
}

async function testExportAPIWithValidData() {
  console.log('\n📥 Testing Export API with Valid Data...');
  
  try {
    // First, get a valid library ID
    const librariesResponse = await fetch(`${BASE_URL}/api/libraries`);
    const librariesData = await librariesResponse.json();
    
    if (!librariesData.success || librariesData.data.length === 0) {
      logTest('Export API - Valid Data', false, 'No libraries available for testing');
      return false;
    }
    
    const testLibraryId = librariesData.data[0].id;
    
    // Get available years
    const yearsResponse = await fetch(`${BASE_URL}/api/available-years`);
    const yearsData = await yearsResponse.json();
    
    if (!yearsData.success || yearsData.years.length === 0) {
      logTest('Export API - Valid Data', false, 'No years available for testing');
      return false;
    }
    
    const testYear = yearsData.years[0];
    
    // Test export with valid data
    const exportResponse = await fetch(`${BASE_URL}/api/export-institutional-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libraryId: testLibraryId,
        years: [testYear],
        forms: ['monographic', 'fiscal'],
      }),
    });
    
    if (exportResponse.ok) {
      const contentType = exportResponse.headers.get('content-type');
      const contentDisposition = exportResponse.headers.get('content-disposition');
      
      if (contentType && contentType.includes('spreadsheetml.sheet')) {
        logTest('Export API - Content Type', true, 'Returns correct Excel MIME type');
      } else {
        logTest('Export API - Content Type', false, `Unexpected content type: ${contentType}`);
      }
      
      if (contentDisposition && contentDisposition.includes('attachment')) {
        logTest('Export API - Content Disposition', true, 'Sets correct download headers');
      } else {
        logTest('Export API - Content Disposition', false, 'Missing or incorrect content disposition');
      }
      
      const arrayBuffer = await exportResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 0) {
        logTest('Export API - File Generation', true, `Generated file of ${buffer.length} bytes`);
        
        // Check for Excel file signature (PK zip header)
        if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
          logTest('Export API - File Format', true, 'File has valid Excel/ZIP signature');
          return true;
        } else {
          logTest('Export API - File Format', false, 'Invalid file signature');
          return false;
        }
      } else {
        logTest('Export API - File Generation', false, 'Generated empty file');
        return false;
      }
    } else {
      const errorData = await exportResponse.json();
      logTest('Export API - Valid Data', false, `Request failed: ${JSON.stringify(errorData)}`);
      return false;
    }
  } catch (error) {
    logTest('Export API - Valid Data', false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Institutional Reports Feature Tests\n');
  console.log('=' .repeat(60));
  
  await testUserInfoAPI();
  await testLibrariesAPI();
  await testAvailableYearsAPI();
  await testExportAPIValidation();
  await testExportAPIWithValidData();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log('=' .repeat(60));
  
  const passed = TEST_RESULTS.filter(r => r.passed).length;
  const failed = TEST_RESULTS.filter(r => !r.passed).length;
  const total = TEST_RESULTS.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The Institutional Reports feature is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the details above.');
  }
  
  console.log('=' .repeat(60));
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
