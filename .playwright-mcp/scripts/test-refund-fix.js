const { chromium } = require('playwright');

async function testRefundFix() {
  console.log('🔧 Testando il fix per approve/deny refunds...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Monitor console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      } else {
        console.log(`📝 Console ${msg.type()}: ${msg.text()}`);
      }
    });
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`🌐 ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`📨 ${response.status()} ${response.url()}`);
        if (response.status() >= 400) {
          console.log(`⚠️ Error ${response.status()}: ${response.url()}`);
        }
      }
    });
    
    console.log('🔐 Login admin...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', 'admin@winemarketplace.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📋 Navigando ai refunds...');
    await page.goto('http://localhost:3001/refunds', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Clicca sul tab PENDING per essere sicuri di vedere solo pending
    await page.click('button:has-text("Pending")');
    await page.waitForTimeout(1000);
    
    // Cerca refunds pending
    const pendingRows = await page.locator('tbody tr:has-text("PENDING")').count();
    console.log(`🔍 Refunds PENDING trovati: ${pendingRows}`);
    
    if (pendingRows > 0) {
      console.log('👁️ Aprendo primo refund PENDING...');
      // Clicca sul primo pulsante occhio di un refund PENDING
      await page.locator('tbody tr:has-text("PENDING")').first().locator('button').first().click();
      
      await page.waitForTimeout(2000);
      
      // Verifica che il modal sia aperto
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.count();
      console.log(`📋 Modal aperto: ${modalOpen > 0 ? '✅ SÌ' : '❌ NO'}`);
      
      if (modalOpen > 0) {
        // Screenshot
        await page.screenshot({ path: '/Users/doimo/Desktop/SYW/.playwright-mcp/screenshots/refund-modal-test.png' });
        
        console.log('🎯 Testando pulsante APPROVE...');
        const approveBtn = modal.locator('button:has-text("Approve")');
        const approveBtnExists = await approveBtn.count();
        console.log(`✅ Pulsante Approve trovato: ${approveBtnExists > 0 ? 'SÌ' : 'NO'}`);
        
        if (approveBtnExists > 0) {
          await approveBtn.click();
          await page.waitForTimeout(3000); // Aspetta la response
          console.log('✅ Approve eseguito - verificare console per errori');
        }
      }
      
    } else {
      console.log('❌ Nessun refund PENDING trovato per il test');
    }
    
  } catch (error) {
    console.error('❌ Errore nel test:', error);
  } finally {
    await page.waitForTimeout(5000); // Tempo per vedere il risultato
    await browser.close();
  }
}

testRefundFix();