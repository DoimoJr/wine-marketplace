const { test, expect } = require('@playwright/test');

test('Debug heart button cursor and click behavior', async ({ page }) => {
  console.log('🔍 Starting heart button debugging test...');
  
  // Navigate to the site and login
  await page.goto('http://localhost:3002');
  await page.waitForLoadState('networkidle');
  
  // Go to login page
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
  
  // Navigate to a specific wine page
  console.log('🍷 Going to wine page...');
  await page.goto('http://localhost:3002/wines/cmfgxiipg000pr116l8caxn4f');
  await page.waitForLoadState('networkidle');
  
  console.log('📸 Taking screenshot of wine page');
  await page.screenshot({ path: 'debug-heart-01-wine-page.png' });
  
  // Find the heart button
  const heartButton = page.locator('button:has([data-icon="heart"]), button:has(svg), .heart-button, [data-testid="heart-button"], button:has-text("♥"), button:has-text("❤"), button:has(.h-5.w-5)').first();
  
  if (await heartButton.isVisible()) {
    console.log('❤️ Heart button found!');
    
    // Check if button is disabled
    const isDisabled = await heartButton.getAttribute('disabled');
    console.log('🔒 Button disabled?', isDisabled !== null);
    
    // Check cursor style
    const cursorStyle = await heartButton.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        cursor: computedStyle.cursor,
        pointerEvents: computedStyle.pointerEvents,
        opacity: computedStyle.opacity,
        classes: el.className
      };
    });
    console.log('🖱️ Button computed styles:', cursorStyle);
    
    // Check if there are any overlays
    const boundingBox = await heartButton.boundingBox();
    console.log('📐 Button bounding box:', boundingBox);
    
    // Take screenshot before hover
    await page.screenshot({ path: 'debug-heart-02-before-hover.png' });
    
    // Hover over the button to see cursor change
    console.log('🖱️ Hovering over heart button...');
    await heartButton.hover();
    await page.waitForTimeout(1000);
    
    // Take screenshot during hover
    await page.screenshot({ path: 'debug-heart-03-during-hover.png' });
    
    // Enable console message capture
    page.on('console', msg => console.log('🖥️ Browser console:', msg.text()));
    
    // Try to click the button
    console.log('👆 Attempting to click heart button...');
    try {
      await heartButton.click();
      console.log('✅ Heart button clicked successfully!');
    } catch (error) {
      console.log('❌ Error clicking heart button:', error.message);
    }
    
    await page.waitForTimeout(2000);
    
    // Take screenshot after click attempt
    await page.screenshot({ path: 'debug-heart-04-after-click.png' });
    
    // Check if wishlistLoading state is stuck
    const buttonState = await heartButton.evaluate((el) => {
      return {
        disabled: el.disabled,
        className: el.className,
        innerHTML: el.innerHTML
      };
    });
    console.log('🔄 Button state after click:', buttonState);
    
  } else {
    console.log('❌ Heart button not found');
    await page.screenshot({ path: 'debug-heart-error-no-button.png' });
    
    // Let's see what buttons are actually on the page
    const allButtons = await page.locator('button').all();
    console.log('🔍 Found', allButtons.length, 'buttons on page');
    
    for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
      const buttonText = await allButtons[i].textContent();
      const buttonClass = await allButtons[i].getAttribute('class');
      console.log(`Button ${i + 1}:`, { text: buttonText, class: buttonClass });
    }
  }
  
  console.log('🏁 Heart button debug test completed!');
});