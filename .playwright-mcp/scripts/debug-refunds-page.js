const { chromium } = require('playwright');

async function debugRefundsPage() {
  console.log('🚀 Avvio debug della pagina refunds...');
  
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
      }
    });
    
    console.log('📱 Navigando alla pagina refunds...');
    await page.goto('http://localhost:3001/refunds', { waitUntil: 'networkidle' });
    
    // Wait for potential loading
    await page.waitForTimeout(3000);
    
    // Check for error messages
    const errorElements = await page.locator('text=/error|errore|Error/i').all();
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
    const tableRows = await page.locator('table tbody tr, [role="table"] [role="row"]').all();
    console.log(`📊 Trovate ${tableRows.length} righe nella tabella/lista`);
    
    // Check for refund-specific content
    const refundElements = await page.locator('text=/refund|rimborso/i').all();
    console.log(`💰 Trovati ${refundElements.length} elementi contenenti "refund/rimborso"`);
    
    // Look for any data display elements
    const dataElements = await page.locator('[data-testid], .data-item, .refund-item').all();
    console.log(`📋 Trovati ${dataElements.length} elementi con attributi data`);
    
    // Check for empty state messages
    const emptyMessages = await page.locator('text=/no data|nessun dato|vuoto|empty|no refunds/i').all();
    if (emptyMessages.length > 0) {
      console.log(`📭 Trovati ${emptyMessages.length} messaggi di stato vuoto`);
      for (const element of emptyMessages) {
        const text = await element.textContent();
        console.log(`   - ${text}`);
      }
    }
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: '/Users/doimo/Desktop/SYW/refunds-page-debug.png', fullPage: true });
    console.log('📷 Screenshot salvato come refunds-page-debug.png');
    
    // Check network tab for failed requests
    console.log('\n🔍 Analizzando le richieste di rete...');
    
    // Try to trigger a refresh or search to see API calls
    const searchInput = await page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="cerca"]').first();
    if (await searchInput.isVisible()) {
      console.log('🔎 Trovato input di ricerca, provo a triggerare una ricerca...');
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }
    
    // Check if there are any buttons to click (like refresh, load more, etc.)
    const actionButtons = await page.locator('button:has-text("Refresh"), button:has-text("Load"), button:has-text("Carica"), button:has-text("Aggiorna")').all();
    if (actionButtons.length > 0) {
      console.log(`🔄 Trovati ${actionButtons.length} pulsanti di azione, provo il primo...`);
      await actionButtons[0].click();
      await page.waitForTimeout(2000);
    }
    
    // Final check for content
    const bodyText = await page.locator('body').textContent();
    console.log('\n📄 Contenuto principale della pagina (primi 500 caratteri):');
    console.log(bodyText.substring(0, 500) + '...');
    
    console.log('\n✅ Debug completato. Controlla la console e lo screenshot per dettagli.');
    
  } catch (error) {
    console.error('❌ Errore durante il debug:', error);
  } finally {
    await browser.close();
  }
}

debugRefundsPage();