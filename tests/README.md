# Test Directory

Questa directory contiene tutti i test automatizzati per il wine marketplace.

## Struttura

```
tests/
├── e2e/         # Test end-to-end
└── README.md    # Questa documentazione
```

## End-to-End Tests (`e2e/`)

Test che simulano il comportamento dell'utente reale attraverso l'intera applicazione:

- **`admin-e2e.test.js`** - Test completo del pannello amministrativo
  - Test di login admin
  - Navigazione tra le diverse sezioni
  - Gestione utenti, ordini, vini e rimborsi
  - Verifica funzionalità CRUD complete

## Esecuzione dei Test

### Prerequisiti
- Server di sviluppo attivo (API su porta 3010, Admin su porta 3001)
- Database popolato con dati di test
- Playwright installato

### Comandi

```bash
# Eseguire i test e2e admin
node tests/e2e/admin-e2e.test.js

# Per test specifici di Playwright, vedere la directory .playwright-mcp/
```

## Note

- I test e2e richiedono che i server siano in esecuzione
- Utilizzare dati di test consistenti per risultati affidabili
- I test Playwright per debugging specifico sono organizzati in `.playwright-mcp/scripts/`
- Screenshots e trace files vengono salvati automaticamente in caso di errori

## Framework e Strumenti

- **Playwright**: Per automazione browser e test e2e
- **Node.js**: Runtime per l'esecuzione dei test
- **Custom test utilities**: Helper per setup e teardown

## Aggiungere Nuovi Test

1. Creare il file test nella directory appropriata
2. Seguire le convenzioni di naming: `nome-funzionalita.test.js`
3. Utilizzare i pattern esistenti per consistency
4. Documentare test complessi nel README