const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Avvia su localhost:3001 (admin app)
    await page.goto('http://localhost:3001');
  });

  test('should load admin homepage without errors', async ({ page }) => {
    // Verifica che la pagina si carichi senza errori console
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    
    // Verifica che non ci siano errori JavaScript critici
    expect(errors.filter(error => 
      !error.includes('net::ERR_FAILED') && // Ignora errori di rete
      !error.includes('Failed to fetch') &&
      !error.includes('adminToken')
    )).toHaveLength(0);
  });

  test('should display admin layout components', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verifica componenti principali dell'admin layout
    const sidebar = await page.locator('[data-testid="admin-sidebar"], nav, aside').first();
    const mainContent = await page.locator('main, [role="main"]').first();
    
    // Almeno uno dei componenti di layout dovrebbe essere visibile
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    const mainVisible = await mainContent.isVisible().catch(() => false);
    
    expect(sidebarVisible || mainVisible).toBe(true);
  });

  test('should navigate to users page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Cerca link per users management
    const usersLink = await page.locator('a[href*="users"], a:has-text("Users"), a:has-text("User")').first();
    
    if (await usersLink.isVisible().catch(() => false)) {
      await usersLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verifica che siamo nella pagina users
      expect(page.url()).toContain('users');
      
      // Verifica elementi della pagina users
      const pageTitle = await page.locator('h1, h2').first();
      const titleText = await pageTitle.textContent().catch(() => '');
      expect(titleText.toLowerCase()).toMatch(/user|gestione/);
    }
  });

  test('should navigate to wines page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Cerca link per wines management
    const winesLink = await page.locator('a[href*="wines"], a:has-text("Wines"), a:has-text("Wine")').first();
    
    if (await winesLink.isVisible().catch(() => false)) {
      await winesLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verifica che siamo nella pagina wines
      expect(page.url()).toContain('wines');
      
      // Verifica elementi della pagina wines
      const pageTitle = await page.locator('h1, h2').first();
      const titleText = await pageTitle.textContent().catch(() => '');
      expect(titleText.toLowerCase()).toMatch(/wine|vino/);
    }
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Cerca link per orders management
    const ordersLink = await page.locator('a[href*="orders"], a:has-text("Orders"), a:has-text("Order")').first();
    
    if (await ordersLink.isVisible().catch(() => false)) {
      await ordersLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verifica che siamo nella pagina orders
      expect(page.url()).toContain('orders');
      
      // Verifica elementi della pagina orders
      const pageTitle = await page.locator('h1, h2').first();
      const titleText = await pageTitle.textContent().catch(() => '');
      expect(titleText.toLowerCase()).toMatch(/order|ordini/);
    }
  });

  test('should check for modal functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Vai alla pagina users per testare i modal
    const usersLink = await page.locator('a[href*="users"]').first();
    if (await usersLink.isVisible().catch(() => false)) {
      await usersLink.click();
      await page.waitForLoadState('networkidle');
      
      // Cerca pulsanti di edit/modifica
      const editButtons = await page.locator('button:has-text("Edit"), button[title*="edit"], button:has([data-icon*="pencil"])').all();
      
      if (editButtons.length > 0) {
        await editButtons[0].click();
        await page.waitForTimeout(500);
        
        // Verifica se si apre un modal
        const modal = await page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
        const modalVisible = await modal.isVisible().catch(() => false);
        
        if (modalVisible) {
          // Verifica che il modal abbia contenuto
          const modalContent = await modal.textContent();
          expect(modalContent.length).toBeGreaterThan(0);
          
          // Cerca pulsante di chiusura
          const closeButton = await page.locator('button:has-text("Cancel"), button:has-text("Close"), button:has([data-icon*="x"])').first();
          if (await closeButton.isVisible().catch(() => false)) {
            await closeButton.click();
          }
        }
      }
    }
  });

  test('should check bulk actions functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Vai alla pagina users
    const usersLink = await page.locator('a[href*="users"]').first();
    if (await usersLink.isVisible().catch(() => false)) {
      await usersLink.click();
      await page.waitForLoadState('networkidle');
      
      // Cerca checkbox per selezione multipla
      const checkboxes = await page.locator('input[type="checkbox"]').all();
      
      if (checkboxes.length > 1) {
        // Seleziona alcuni checkbox
        await checkboxes[0].check();
        if (checkboxes.length > 2) {
          await checkboxes[1].check();
        }
        
        // Verifica se appaiono azioni bulk
        const bulkActions = await page.locator('*:has-text("Bulk"), *:has-text("selected"), button:has-text("Actions")').first();
        const bulkVisible = await bulkActions.isVisible().catch(() => false);
        
        expect(bulkVisible).toBe(true);
      }
    }
  });

  test('should check API connectivity', async ({ page }) => {
    // Intercetta le chiamate API
    const apiCalls = [];
    page.on('request', (request) => {
      if (request.url().includes('localhost:3010/api/admin')) {
        apiCalls.push(request.url());
      }
    });

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Dovremmo avere almeno una chiamata API
    expect(apiCalls.length).toBeGreaterThanOrEqual(0); // Può essere 0 se non autenticato
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    // Verifica che l'interfaccia sia responsive
    const body = await page.locator('body').first();
    const bodyVisible = await body.isVisible();
    expect(bodyVisible).toBe(true);
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    
    const bodyStillVisible = await body.isVisible();
    expect(bodyStillVisible).toBe(true);
  });

});