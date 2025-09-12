const { chromium } = require('playwright');

async function debugRefundsPageWithLogin() {
  console.log('🚀 Avvio debug della pagina refunds con login...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Monitor console messages
    page.on('console', msg => {
      console.log(`🔍 Console ${msg.type()}: ${msg.text()}`);
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
    console.log('📝 Inserendo credenziali di login...');
    await page.fill('input[type="email"], input[name="email"]', 'admin@winemarketplace.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    
    // Submit login
    console.log('🔑 Effettuando login...');
    await page.click('button[type="submit"], button:has-text("Sign in")');
    
    // Wait for redirect after login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📱 Navigando alla pagina refunds...');
    await page.goto('http://localhost:3001/refunds', { waitUntil: 'networkidle' });
    
    // Wait for potential loading
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`🌐 URL attuale: ${currentUrl}`);
    
    // Check for error messages
    const errorElements = await page.locator('text=/error|errore|Error|Failed/i').all();
    if (errorElements.length > 0) {
      console.log(`❌ Trovati ${errorElements.length} elementi di errore`);
      for (const element of errorElements) {
        const text = await element.textContent();
        console.log(`   - ${text}`);
      }
    }
    
    // Check for loading indicators
    const loadingElements = await page.locator('text=/loading|caricamento|Loading/i').all();
    if (loadingElements.length > 0) {
      console.log(`⏳ Trovati ${loadingElements.length} elementi di caricamento`);
    }
    
    // Check for table or list elements that should contain refunds
    const tableRows = await page.locator('table tbody tr, [role="table"] [role="row"], .refund-row, [data-testid*="refund"]').all();
    console.log(`📊 Trovate ${tableRows.length} righe nella tabella/lista refunds`);
    
    // Look for any table headers
    const tableHeaders = await page.locator('table thead th, [role="columnheader"]').all();
    if (tableHeaders.length > 0) {
      console.log(`📋 Trovate ${tableHeaders.length} intestazioni tabella:`);
      for (const header of tableHeaders) {
        const text = await header.textContent();
        console.log(`   - ${text?.trim()}`);
      }
    }
    
    // Check for refund-specific content
    const refundElements = await page.locator('text=/refund|rimborso|Refund/i').all();
    console.log(`💰 Trovati ${refundElements.length} elementi contenenti "refund/rimborso"`);
    
    // Check for empty state messages
    const emptyMessages = await page.locator('text=/no data|nessun dato|vuoto|empty|no refunds|nessun rimborso/i').all();
    if (emptyMessages.length > 0) {
      console.log(`📭 Trovati ${emptyMessages.length} messaggi di stato vuoto`);
      for (const element of emptyMessages) {
        const text = await element.textContent();
        console.log(`   - ${text}`);
      }
    }
    
    // Check for any API call to refunds endpoint
    console.log('🔍 Verificando chiamate API ai refunds...');
    
    // Look for page title/heading
    const pageTitle = await page.locator('h1, h2, [role="heading"]').first();
    if (await pageTitle.isVisible()) {
      const titleText = await pageTitle.textContent();
      console.log(`📌 Titolo pagina: ${titleText}`);
    }
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: '/Users/doimo/Desktop/SYW/refunds-page-logged-in.png', fullPage: true });
    console.log('📷 Screenshot salvato come refunds-page-logged-in.png');
    
    // Get all text content to analyze
    const bodyText = await page.locator('body').textContent();
    console.log('\n📄 Contenuto principale della pagina (primi 800 caratteri):');
    console.log(bodyText.substring(0, 800) + '...');
    
    console.log('\n✅ Debug completato. Controlla la console e lo screenshot per dettagli.');
    
  } catch (error) {
    console.error('❌ Errore durante il debug:', error);
  } finally {
    await browser.close();
  }
}

debugRefundsPageWithLogin();