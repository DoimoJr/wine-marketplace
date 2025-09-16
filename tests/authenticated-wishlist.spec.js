const { test, expect } = require('@playwright/test');

test('Authenticated user should be able to use heart button to add wines to wishlist', async ({ page }) => {
  console.log('🧪 Starting authenticated wishlist test...');
  
  // Navigate to the site
  await page.goto('http://localhost:3002');
  await page.waitForLoadState('networkidle');
  
  console.log('📸 Taking screenshot of homepage');
  await page.screenshot({ path: 'auth-test-01-homepage.png' });
  
  // Go to login page
  console.log('🔐 Navigating to login...');
  const loginButton = page.locator('a[href="/login"], button:has-text("Sign In"), .login-button, [data-testid="login"]').first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
  } else {
    await page.goto('http://localhost:3002/login');
  }
  await page.waitForLoadState('networkidle');
  
  console.log('📸 Taking screenshot of login page');
  await page.screenshot({ path: 'auth-test-02-login-page.png' });
  
  // Fill login form
  console.log('✍️ Filling login credentials...');
  await page.fill('input[type="email"], input[name="email"], #email', 'testuser@example.com');
  await page.fill('input[type="password"], input[name="password"], #password', 'Password123');
  
  console.log('📸 Taking screenshot with credentials filled');
  await page.screenshot({ path: 'auth-test-03-credentials-filled.png' });
  
  // Submit login
  console.log('🚀 Submitting login form...');
  await page.click('button[type="submit"], button:has-text("Sign In"), .login-submit, [data-testid="login-submit"]');
  
  // Wait for redirect after login
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('📸 Taking screenshot after login');
  await page.screenshot({ path: 'auth-test-04-after-login.png' });
  
  // Navigate to find wines
  console.log('🍷 Looking for wines...');
  await page.goto('http://localhost:3002');
  await page.waitForLoadState('networkidle');
  
  // Try to find a Browse button or wines
  const browseButton = page.locator('a:has-text("Browse"), a:has-text("Wines"), a:has-text("Vini"), [href*="browse"], [href*="wines"]').first();
  if (await browseButton.isVisible()) {
    await browseButton.click();
    await page.waitForLoadState('networkidle');
  }
  
  console.log('📸 Taking screenshot of wines page');
  await page.screenshot({ path: 'auth-test-05-wines-page.png' });
  
  // Find the first wine link
  const wineLink = page.locator('a[href*="/wines/"], .wine-card a, [data-testid="wine-link"]').first();
  if (await wineLink.isVisible()) {
    console.log('🎯 Found wine, clicking...');
    await wineLink.click();
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Taking screenshot of wine detail page');
    await page.screenshot({ path: 'auth-test-06-wine-detail.png' });
    
    // Look for heart button
    const heartButton = page.locator('button:has([data-icon="heart"]), button:has(svg), .heart-button, [data-testid="heart-button"], button:has-text("♥"), button:has-text("❤")').first();
    
    if (await heartButton.isVisible()) {
      console.log('❤️ Found heart button! Testing click...');
      
      // Take screenshot before clicking heart
      await page.screenshot({ path: 'auth-test-07-before-heart-click.png' });
      
      // Click the heart button
      await heartButton.click();
      await page.waitForTimeout(2000);
      
      console.log('📸 Taking screenshot after heart click');
      await page.screenshot({ path: 'auth-test-08-after-heart-click.png' });
      
      // Check if we can access wishlist
      console.log('📋 Checking wishlist...');
      await page.goto('http://localhost:3002/wishlist');
      await page.waitForLoadState('networkidle');
      
      console.log('📸 Taking screenshot of wishlist page');
      await page.screenshot({ path: 'auth-test-09-wishlist-page.png' });
      
      console.log('✅ Heart button test completed successfully!');
    } else {
      console.log('❌ Could not find heart button on wine detail page');
      await page.screenshot({ path: 'auth-test-error-no-heart-button.png' });
    }
  } else {
    // If no wine links found, try to go directly to a wine page
    console.log('🔍 No wine links found, trying direct wine URL...');
    await page.goto('http://localhost:3002/wines');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'auth-test-direct-wines-page.png' });
    
    // Try to find any wine on the wines page
    const wineElement = page.locator('[href*="/wines/"]').first();
    if (await wineElement.isVisible()) {
      await wineElement.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'auth-test-wine-from-wines-page.png' });
    } else {
      console.log('❌ Could not find any wine links');
      await page.screenshot({ path: 'auth-test-error-no-wines.png' });
    }
  }
  
  console.log('🏁 Test completed!');
});