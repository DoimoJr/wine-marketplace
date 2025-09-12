const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Testing search with Italian names...');
    await page.goto('http://localhost:3001/orders');
    
    // Check if we're redirected to login or already logged in
    await page.waitForTimeout(2000);
    
    if (page.url().includes('/login')) {
      console.log('🔐 Logging in...');
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.fill('input[type="email"]', 'admin@winemarketplace.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      if (!page.url().includes('/orders')) {
        await page.goto('http://localhost:3001/orders');
        await page.waitForTimeout(2000);
      }
    }
    
    // Wait for orders page to load
    await page.waitForSelector('input[placeholder*="Search orders"]', { timeout: 10000 });
    console.log('✅ Orders page loaded');
    
    const testCases = [
      { search: 'Marco', expected: 'Marco Rossi' },
      { search: 'Giulia', expected: 'Giulia Bianchi' },
      { search: 'gmail', expected: 'giulia.bianchi@gmail.com' },
      { search: 'Ferrari', expected: 'Luca Ferrari' },
      { search: 'SOFIA', expected: 'Sofia Romano (case insensitive)' },
      { search: 'Rossi', expected: 'Marco Rossi' },
      { search: 'Alessandro', expected: 'Alessandro Verdi' },
      { search: 'Francesca', expected: 'Francesca Neri' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: "${testCase.search}" (expecting ${testCase.expected})`);
      
      // Clear previous search
      await page.fill('input[placeholder*="Search orders"]', '');
      await page.waitForTimeout(500);
      
      // Perform search
      await page.fill('input[placeholder*="Search orders"]', testCase.search);
      await page.waitForTimeout(1000); // Wait for debounce
      
      const results = await page.locator('tbody tr').count();
      console.log(`📊 Found ${results} orders`);
      
      if (results > 0) {
        // Get the text content of the first few rows to verify
        const firstRowText = await page.locator('tbody tr').first().textContent();
        console.log(`📝 First result contains: ${firstRowText.slice(0, 100)}...`);
        
        // Check if the expected name appears in any of the visible rows
        const allRowsText = await page.locator('tbody tr').allTextContents();
        const foundMatch = allRowsText.some(row => 
          row.toLowerCase().includes(testCase.search.toLowerCase()) ||
          (testCase.search === 'gmail' && row.includes('giulia.bianchi@gmail.com'))
        );
        
        if (foundMatch) {
          console.log(`✅ Search successful - found expected match!`);
        } else {
          console.log(`⚠️ Search returned results but expected match not found`);
        }
      } else {
        console.log(`❌ No results found for "${testCase.search}"`);
      }
      
      await page.waitForTimeout(500);
    }
    
    console.log('\n🎉 Italian names search testing completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await page.waitForTimeout(5000); // Keep browser open to see results
    await browser.close();
  }
})();