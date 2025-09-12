# Database Scripts

Questa directory contiene tutti gli script per la gestione, setup e manutenzione del database del wine marketplace.

## Struttura

```
database/
├── setup/          # Script per inizializzazione e reset del database
├── maintenance/    # Script per pulizia e riparazione del database
├── fixtures/       # Script per creare dati di test specifici
└── README.md       # Questa documentazione
```

## Setup (`setup/`)

Script per inizializzare e popolare il database:

- **`reset-database-realistic.js`** - Popola il database con dati italiani realistici
  - 10 utenti italiani con nomi, locations e bio realistiche
  - 13+ vini italiani con classificazioni DOC/DOCG corrette
  - 20 ordini con numeri realistici e stati vari
  - Uso: `node scripts/database/setup/reset-database-realistic.js`

- **`reset-database-simple.js`** - Reset semplice con dati base italiani
  - Versione semplificata per testing rapido
  - Dati essenziali per funzionalità base
  - Uso: `node scripts/database/setup/reset-database-simple.js`

## Maintenance (`maintenance/`)

Script per manutenzione e riparazione del database:

- **`database-vacuum.js`** - Pulizia e ottimizzazione del database
  - Rimuove dati orfani e ottimizza le tabelle
  - Uso: `node scripts/database/maintenance/database-vacuum.js`

- **`database-fix.sql`** - Query SQL per fix comuni
  - Correzioni per problemi strutturali ricorrenti
  - Uso: Eseguire manualmente via psql o pgAdmin

- **`database-fix-data.sql`** - Fix per problemi sui dati
  - Correzioni per inconsistenze nei dati
  - Uso: Eseguire manualmente via psql o pgAdmin

## Fixtures (`fixtures/`)

Script per creare dati di test specifici:

- **`create-refund-requests.js`** - Crea richieste di rimborso di esempio
  - 6 richieste con stati diversi (PENDING, APPROVED, DENIED, etc.)
  - Collegate a ordini esistenti con ragioni realistiche
  - Uso: `node scripts/database/fixtures/create-refund-requests.js`

- **`create-test-orders.js`** - Crea ordini di test aggiuntivi
  - Ordini con stati e configurazioni specifiche per testing
  - Uso: `node scripts/database/fixtures/create-test-orders.js`

## Prerequisiti

- Database PostgreSQL configurato e funzionante
- Prisma Client generato (`pnpm db:generate`)
- Variabili d'ambiente configurate in `.env`

## Note Importanti

⚠️ **Attenzione**: Gli script di setup cancelleranno tutti i dati esistenti!

- Utilizzare sempre su database di sviluppo
- Fare backup prima di eseguire script di manutenzione
- Verificare che l'API sia spenta prima di eseguire reset completi

## Esecuzione

Tutti gli script devono essere eseguiti dalla root del progetto:

```bash
# Esempio
node scripts/database/setup/reset-database-realistic.js
```