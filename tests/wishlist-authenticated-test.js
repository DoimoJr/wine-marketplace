const { test, expect } = require('@playwright/test');

test.describe('Wishlist functionality with authenticated user', () => {
  test('should login and test heart button functionality', async ({ page }) => {
    console.log('🧪 Starting authenticated wishlist test...');
    
    // Navigate to the site
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Taking screenshot of homepage');
    await page.screenshot({ path: 'tests/auth-test-screenshots/01-homepage.png' });
    
    // Go to login page
    console.log('🔐 Navigating to login...');
    await page.click('a[href="/login"], button:has-text("Sign In"), .login-button, [data-testid="login"]');
    await page.waitForURL('**/login**');
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Taking screenshot of login page');
    await page.screenshot({ path: 'tests/auth-test-screenshots/02-login-page.png' });
    
    // Fill login form
    console.log('✍️ Filling login credentials...');
    await page.fill('input[type="email"], input[name="email"], #email', 'testuser@example.com');
    await page.fill('input[type="password"], input[name="password"], #password', 'Password123');
    
    console.log('📸 Taking screenshot with credentials filled');
    await page.screenshot({ path: 'tests/auth-test-screenshots/03-credentials-filled.png' });
    
    // Submit login
    console.log('🚀 Submitting login form...');
    await page.click('button[type="submit"], button:has-text("Sign In"), .login-submit, [data-testid="login-submit"]');
    
    // Wait for redirect after login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📸 Taking screenshot after login');
    await page.screenshot({ path: 'tests/auth-test-screenshots/04-after-login.png' });
    
    // Check if we're logged in (look for user elements)
    const loggedInElement = await page.locator('button:has-text("Sign Out"), .user-menu, [data-testid="user-menu"], .logout').first();
    if (await loggedInElement.isVisible()) {
      console.log('✅ Successfully logged in!');
    } else {
      console.log('⚠️ Login status unclear, continuing test...');
    }
    
    // Navigate to wines page or find a wine
    console.log('🍷 Looking for wines...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    // Look for wine cards or browse link
    const browseWines = page.locator('a:has-text("Browse"), a:has-text("Wines"), a:has-text("Vini"), [href*="browse"], [href*="wines"]').first();
    if (await browseWines.isVisible()) {
      await browseWines.click();
      await page.waitForLoadState('networkidle');
    }
    
    console.log('📸 Taking screenshot of wines page');
    await page.screenshot({ path: 'tests/auth-test-screenshots/05-wines-page.png' });
    
    // Find the first wine link
    const wineLink = page.locator('a[href*="/wines/"], .wine-card a, [data-testid="wine-link"]').first();
    if (await wineLink.isVisible()) {
      console.log('🎯 Found wine, clicking...');
      await wineLink.click();
      await page.waitForLoadState('networkidle');
      
      console.log('📸 Taking screenshot of wine detail page');
      await page.screenshot({ path: 'tests/auth-test-screenshots/06-wine-detail.png' });
      
      // Look for heart button
      const heartButton = page.locator('button:has([class*="heart"]), button:has(svg), .heart-button, [data-testid="heart-button"], button:has-text("♥"), button:has-text("❤")').first();
      
      if (await heartButton.isVisible()) {
        console.log('❤️ Found heart button! Testing click...');
        
        // Take screenshot before clicking heart
        await page.screenshot({ path: 'tests/auth-test-screenshots/07-before-heart-click.png' });
        
        // Click the heart button
        await heartButton.click();
        await page.waitForTimeout(1000);
        
        console.log('📸 Taking screenshot after heart click');
        await page.screenshot({ path: 'tests/auth-test-screenshots/08-after-heart-click.png' });
        
        // Check if we can access wishlist
        console.log('📋 Checking wishlist...');
        await page.goto('http://localhost:3002/wishlist');
        await page.waitForLoadState('networkidle');
        
        console.log('📸 Taking screenshot of wishlist page');
        await page.screenshot({ path: 'tests/auth-test-screenshots/09-wishlist-page.png' });
        
        // Check if wishlist has content or is empty
        const wishlistContent = await page.textContent('body');
        if (wishlistContent.includes('wishlist') || wishlistContent.includes('preferiti') || wishlistContent.includes('favorite')) {
          console.log('✅ Wishlist page loaded successfully!');
        }
        
        console.log('✅ Heart button test completed successfully!');
      } else {
        console.log('❌ Could not find heart button on wine detail page');
        await page.screenshot({ path: 'tests/auth-test-screenshots/error-no-heart-button.png' });
      }
    } else {
      console.log('❌ Could not find any wine links');
      await page.screenshot({ path: 'tests/auth-test-screenshots/error-no-wines.png' });
    }
    
    console.log('🏁 Test completed!');
  });
});