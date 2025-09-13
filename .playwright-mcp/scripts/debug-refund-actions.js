const { chromium } = require('playwright');

async function debugRefundActions() {
  console.log('🔍 Debug refund approve/deny actions...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Monitor console messages for errors
    page.on('console', msg => {
      console.log(`📝 Console ${msg.type()}: ${msg.text()}`);
    });
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`🌐 Request: ${request.method()} ${request.url()}`);
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
    
    console.log('🔐 Navigando al login admin...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    // Login
    console.log('📝 Effettuando login...');
    await page.fill('input[type="email"]', 'admin@winemarketplace.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📱 Navigando alla pagina refunds...');
    await page.goto('http://localhost:3001/refunds', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Find the first pending refund
    const pendingRefunds = await page.locator('tbody tr').filter({
      hasText: 'PENDING'
    });
    
    const pendingCount = await pendingRefunds.count();
    console.log(`🔍 Trovate ${pendingCount} richieste PENDING`);
    
    if (pendingCount > 0) {
      // Click on the eye button of the first pending refund
      console.log('👁️ Cliccando sul primo refund PENDING...');
      const firstPending = pendingRefunds.first();
      const eyeButton = firstPending.locator('button[title*="dettagli"], button:has-text("👁"), button').first();
      
      await eyeButton.click();
      console.log('✅ Modal dovrebbe essere aperto');
      
      // Wait for modal
      await page.waitForTimeout(2000);
      
      // Check if modal is visible
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.count();
      console.log(`📋 Modal visibile: ${modalVisible > 0 ? 'SÌ' : 'NO'}`);
      
      if (modalVisible > 0) {
        // Screenshot del modal
        await page.screenshot({ path: '/Users/doimo/Desktop/SYW/.playwright-mcp/screenshots/refund-modal-buttons.png', fullPage: true });
        
        // Check for approve button
        const approveButton = modal.locator('button:has-text("Approve"), button:has-text("Approva")');
        const approveCount = await approveButton.count();
        console.log(`✅ Pulsante Approve trovato: ${approveCount > 0 ? 'SÌ' : 'NO'}`);
        
        if (approveCount > 0) {
          console.log('🎯 Tentativo di click su Approve...');
          await approveButton.first().highlight();
          await page.waitForTimeout(1000);
          
          try {
            await approveButton.first().click();
            console.log('✅ Click su Approve eseguito');
            await page.waitForTimeout(2000);
          } catch (error) {
            console.log(`❌ Errore nel click su Approve: ${error.message}`);
          }
        }
        
        // Check for deny button
        const denyButton = modal.locator('button:has-text("Deny"), button:has-text("Nega"), button:has-text("Rifiuta")');
        const denyCount = await denyButton.count();
        console.log(`❌ Pulsante Deny trovato: ${denyCount > 0 ? 'SÌ' : 'NO'}`);
        
        if (denyCount > 0) {
          console.log('🎯 Tentativo di click su Deny...');
          await denyButton.first().highlight();
          await page.waitForTimeout(1000);
          
          try {
            await denyButton.first().click();
            console.log('✅ Click su Deny eseguito');
            await page.waitForTimeout(2000);
          } catch (error) {
            console.log(`❌ Errore nel click su Deny: ${error.message}`);
          }
        }
        
        // Check modal content
        const modalText = await modal.textContent();
        console.log('📄 Contenuto modal (primi 300 caratteri):');
        console.log(modalText.substring(0, 300) + '...');
        
        // Look for all buttons in modal
        const allButtons = modal.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`🔘 Totale pulsanti nel modal: ${buttonCount}`);
        
        for (let i = 0; i < buttonCount; i++) {
          const button = allButtons.nth(i);
          const buttonText = await button.textContent();
          const isDisabled = await button.isDisabled();
          const isVisible = await button.isVisible();
          console.log(`  [${i}] "${buttonText}" - Disabled: ${isDisabled}, Visible: ${isVisible}`);
        }
        
      } else {
        console.log('❌ Modal non trovato');
      }
    } else {
      console.log('❌ Nessuna richiesta PENDING trovata');
    }
    
    // Final screenshot
    await page.screenshot({ path: '/Users/doimo/Desktop/SYW/.playwright-mcp/screenshots/refund-debug-final.png', fullPage: true });
    console.log('📷 Screenshot finale salvato');
    
  } catch (error) {
    console.error('❌ Errore durante il debug:', error);
  } finally {
    await browser.close();
  }
}

debugRefundActions();