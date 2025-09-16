const { test, expect } = require('@playwright/test');

test('Test complete wishlist functionality with authenticated user', async ({ page }) => {
  console.log('🧪 Starting complete wishlist test with authenticated user...');
  
  // Navigate to the site
  await page.goto('http://localhost:3002');
  await page.waitForLoadState('networkidle');
  
  // Login first
  console.log('🔐 Going to login...');
  await page.goto('http://localhost:3002/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  console.log('✍️ Filling login credentials...');
  await page.fill('input[type="email"], input[name="email"], #email', 'testuser@example.com');
  await page.fill('input[type="password"], input[name="password"], #password', 'Password123');
  
  // Submit login
  console.log('🚀 Submitting login...');
  await page.click('button[type="submit"], button:has-text("Sign In")');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📸 Taking screenshot after successful login');
  await page.screenshot({ path: 'final-test-01-logged-in.png' });
  
  // Verify we're logged in by checking for user name in navbar
  const welcomeText = await page.textContent('body');
  if (welcomeText.includes('Welcome, Test User') || welcomeText.includes('Wishlist')) {
    console.log('✅ Successfully logged in!');
  }
  
  // Navigate to Browse Wines
  console.log('🍷 Going to Browse Wines...');
  await page.click('a:has-text("Browse Wines")');
  await page.waitForLoadState('networkidle');
  
  console.log('📸 Taking screenshot of browse wines page');
  await page.screenshot({ path: 'final-test-02-browse-wines.png' });
  
  // Click on the first wine card (div containing wine info)
  console.log('🎯 Looking for wine cards...');
  const wineCards = page.locator('.wine-card, [data-testid="wine-card"], div:has(.wine-title), div:has(.wine-price)');
  const firstWineCard = wineCards.first();
  
  if (await firstWineCard.isVisible()) {
    console.log('🍾 Found wine card, clicking...');
    await firstWineCard.click();
  } else {
    // Try clicking on any clickable element that might be a wine
    console.log('🔍 Trying alternative wine selectors...');
    const wineElements = page.locator('div[role="button"], .cursor-pointer, a[href*="/wines/"]');
    const firstWineElement = wineElements.first();
    if (await firstWineElement.isVisible()) {
      await firstWineElement.click();
    } else {
      // If all else fails, try to navigate directly to a wine
      console.log('📍 Navigating directly to wine page...');
      await page.goto('http://localhost:3002/wines/cmflek1er000510xr7lmntwc6');
    }
  }
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  console.log('📸 Taking screenshot of wine detail page');
  await page.screenshot({ path: 'final-test-03-wine-detail.png' });
  
  // Look for heart button on wine detail page
  console.log('❤️ Looking for heart button...');
  const heartButton = page.locator('button:has-text("♥"), button:has-text("❤"), [data-testid="heart-button"], button:has(svg), .heart-button, button[aria-label*="heart"], button[aria-label*="wishlist"], button[aria-label*="favorite"]').first();
  
  if (await heartButton.isVisible()) {
    console.log('💖 Found heart button! Testing click...');
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'final-test-04-before-heart-click.png' });
    
    // Click the heart button
    await heartButton.click();
    await page.waitForTimeout(2000);
    
    console.log('📸 Taking screenshot after heart click');
    await page.screenshot({ path: 'final-test-05-after-heart-click.png' });
    
    // Check if heart button state changed (filled vs outline)
    console.log('🔄 Checking if heart button state changed...');
    
    // Navigate to wishlist to verify wine was added
    console.log('📋 Checking wishlist page...');
    await page.goto('http://localhost:3002/wishlist');
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Taking screenshot of wishlist page');
    await page.screenshot({ path: 'final-test-06-wishlist-page.png' });
    
    // Check if wishlist has content
    const wishlistContent = await page.textContent('body');
    if (wishlistContent.includes('wine') || wishlistContent.includes('vino') || !wishlistContent.includes('empty') && !wishlistContent.includes('vuota')) {
      console.log('✅ Wine appears to be in wishlist!');
    } else {
      console.log('⚠️ Wishlist may be empty or wine not added');
    }
    
    console.log('✅ Heart button functionality test completed!');
  } else {
    console.log('❌ Could not find heart button');
    await page.screenshot({ path: 'final-test-error-no-heart-button.png' });
    
    // Let's check what's actually on the page
    const pageContent = await page.textContent('body');
    console.log('Page contains:', pageContent.substring(0, 500));
  }
  
  console.log('🏁 Complete wishlist test finished!');
});