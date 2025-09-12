const { chromium } = require('playwright');

async function testRefundModal() {
  console.log('🚀 Testing refund modal buttons...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Monitor console messages for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warn') {
        console.log(`🟡 Console Warning: ${msg.text()}`);
      }
    });
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`📡 Request: ${request.method()} ${request.url()}`);
      }
    });
    
    // Monitor network responses
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`📨 Response: ${response.status()} ${response.url()}`);
        if (response.status() >= 400) {
          console.log(`❌ Error response: ${response.status()} for ${response.url()}`);
        }
      }
    });
    
    console.log('🔐 Navigando alla pagina di login...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    // Fill login form
    console.log('📝 Effettuando login...');
    await page.fill('input[type="email"], input[name="email"]', 'admin@winemarketplace.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Sign in")');
    
    // Wait for redirect after login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📱 Navigando alla pagina refunds...');
    await page.goto('http://localhost:3001/refunds', { waitUntil: 'networkidle' });
    
    // Wait for refunds to load
    await page.waitForTimeout(3000);
    
    // Check if there are any refund rows
    const refundRows = await page.locator('tbody tr').count();
    console.log(`📊 Trovate ${refundRows} righe di refunds`);
    
    if (refundRows > 0) {
      // Click on the eye button (view details) of the first refund
      console.log('👁️ Cliccando sul pulsante "occhio" (visualizza dettagli)...');
      const eyeButton = page.locator('tbody tr').first().locator('button', { hasNotText: 'PencilIcon' }).first();
      
      if (await eyeButton.isVisible()) {
        await eyeButton.click();
        console.log('✅ Pulsante occhio cliccato');
        
        // Wait for modal to appear
        await page.waitForTimeout(2000);
        
        // Check if modal is visible
        const modal = page.locator('[role="dialog"], .modal, div[class*="modal"]');
        const modalVisible = await modal.count();
        console.log(`📋 Modal visibile: ${modalVisible > 0 ? 'SÌ' : 'NO'}`);
        
        if (modalVisible > 0) {
          // Take screenshot of modal
          await page.screenshot({ path: '/Users/doimo/Desktop/SYW/refund-modal-open.png', fullPage: true });
          console.log('📷 Screenshot del modal salvato come refund-modal-open.png');
          
          // Look for modal content
          const modalContent = await modal.first().textContent();
          console.log('📄 Contenuto del modal (primi 200 caratteri):');
          console.log(modalContent.substring(0, 200) + '...');
          
          // Try to close modal
          console.log('❌ Tentativo di chiudere il modal...');
          const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel")');
          if (await closeButton.count() > 0) {
            await closeButton.first().click();
            console.log('✅ Modal chiuso');
          }
        } else {
          console.log('❌ Modal non trovato dopo il click');
        }
      } else {
        console.log('❌ Pulsante occhio non trovato o non visibile');
      }
    } else {
      console.log('❌ Nessun refund trovato nella tabella');
    }
    
    // Final screenshot
    await page.screenshot({ path: '/Users/doimo/Desktop/SYW/refunds-final-test.png', fullPage: true });
    console.log('📷 Screenshot finale salvato');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  } finally {
    await browser.close();
  }
}

testRefundModal();