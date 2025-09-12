const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Navigating directly to orders page...');
    await page.goto('http://localhost:3001/orders');
    
    // Check if we're redirected to login or already logged in
    await page.waitForTimeout(2000);
    
    if (page.url().includes('/login')) {
      console.log('🔐 Not logged in, attempting to login...');
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      
      await page.fill('input[type="email"]', 'admin@winemarketplace.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Wait for any navigation after login
      await page.waitForTimeout(3000);
      console.log(`Current URL after login: ${page.url()}`);
      
      // Navigate to orders if not already there
      if (!page.url().includes('/orders')) {
        console.log('Navigating to orders page...');
        await page.goto('http://localhost:3001/orders');
        await page.waitForTimeout(2000);
      }
      console.log('✅ Login completed');
    } else {
      console.log('✅ Already logged in');
    }
    
    // Wait for orders page to load
    await page.waitForSelector('input[placeholder*="Search orders"]', { timeout: 10000 });
    console.log('✅ Orders page loaded');
    
    // Count initial orders
    const initialOrders = await page.locator('tbody tr').count();
    console.log(`📊 Initial orders count: ${initialOrders}`);
    
    if (initialOrders === 0) {
      console.log('⚠️ No orders found to test search functionality');
      return;
    }
    
    console.log('🔍 Testing search functionality...');
    
    // Test 1: Search with a single character
    console.log('Test 1: Searching with "a"');
    await page.fill('input[placeholder*="Search orders"]', 'a');
    await page.waitForTimeout(1000); // Wait for debounce
    
    const searchResults1 = await page.locator('tbody tr').count();
    console.log(`📊 Results for "a": ${searchResults1} orders`);
    
    // Test 2: Search with more specific term
    console.log('Test 2: Searching with "xyz123"');
    await page.fill('input[placeholder*="Search orders"]', 'xyz123');
    await page.waitForTimeout(1000);
    
    const searchResults2 = await page.locator('tbody tr').count();
    console.log(`📊 Results for "xyz123": ${searchResults2} orders`);
    
    // Test 3: Search for something that shouldn't exist
    console.log('Test 3: Searching with "nonexistent"');
    await page.fill('input[placeholder*="Search orders"]', 'nonexistent');
    await page.waitForTimeout(1000);
    
    const searchResults3 = await page.locator('tbody tr').count();
    console.log(`📊 Results for "nonexistent": ${searchResults3} orders`);
    
    // Check if "No orders found" message appears
    const noOrdersMessage = await page.locator('text=No orders found').isVisible();
    if (noOrdersMessage) {
      console.log('✅ "No orders found" message displayed correctly');
    }
    
    // Test 4: Clear search
    console.log('Test 4: Clearing search');
    await page.fill('input[placeholder*="Search orders"]', '');
    await page.waitForTimeout(1000);
    
    const clearedResults = await page.locator('tbody tr').count();
    console.log(`📊 Results after clearing: ${clearedResults} orders`);
    
    if (clearedResults === initialOrders) {
      console.log('✅ Search cleared successfully, all orders visible again');
    } else {
      console.log('⚠️ Search clear might not be working correctly');
    }
    
    // Test 5: Check if search is case insensitive
    console.log('Test 5: Testing case insensitive search');
    await page.fill('input[placeholder*="Search orders"]', 'TEST');
    await page.waitForTimeout(1000);
    
    const upperCaseResults = await page.locator('tbody tr').count();
    console.log(`📊 Results for "TEST" (uppercase): ${upperCaseResults} orders`);
    
    await page.fill('input[placeholder*="Search orders"]', 'test');
    await page.waitForTimeout(1000);
    
    const lowerCaseResults = await page.locator('tbody tr').count();
    console.log(`📊 Results for "test" (lowercase): ${lowerCaseResults} orders`);
    
    if (upperCaseResults === lowerCaseResults) {
      console.log('✅ Search is case insensitive');
    } else {
      console.log('⚠️ Search might not be case insensitive');
    }
    
    console.log('🎉 Search functionality testing completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await page.waitForTimeout(5000); // Keep browser open for 5 seconds to see results
    await browser.close();
  }
})();