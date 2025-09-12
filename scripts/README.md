# Scripts Directory

Questa directory contiene tutti gli script di utilità per il wine marketplace, organizzati per categoria e funzione.

## Struttura

```
scripts/
├── database/       # Script per gestione database
└── README.md       # Questa documentazione
```

## Database Scripts (`database/`)

Script completi per la gestione del database PostgreSQL:

- **Setup**: Inizializzazione e popolamento del database
- **Maintenance**: Pulizia, ottimizzazione e riparazione
- **Fixtures**: Creazione di dati di test specifici

Vedere `database/README.md` per la documentazione completa.

## Convenzioni

### Naming
- Utilizzare kebab-case per i nomi dei file
- Includere l'estensione appropriata (`.js`, `.sql`)
- Prefissi descrittivi: `reset-`, `create-`, `fix-`, `cleanup-`

### Struttura dei Script
- Includere documentazione inline
- Gestire errori appropriatamente
- Utilizzare logging per debugging
- Supportare opzioni da riga di comando quando utile

### Esecuzione
- Tutti gli script devono essere eseguiti dalla root del progetto
- Includere check per prerequisiti (database, env vars, etc.)
- Fornire messaggi informativi durante l'esecuzione

## Aggiungere Nuovi Script

1. **Identificare la categoria**: Database, deployment, testing, etc.
2. **Creare la directory** se necessaria
3. **Seguire le convenzioni** di naming e struttura
4. **Documentare** nel README appropriato
5. **Testare** in ambiente di sviluppo

## Esempi di Uso

```bash
# Script database
node scripts/database/setup/reset-database-realistic.js
node scripts/database/maintenance/database-vacuum.js
node scripts/database/fixtures/create-refund-requests.js
```

## Note di Sicurezza

⚠️ **Importante**:
- Non includere credenziali hardcoded negli script
- Utilizzare sempre variabili d'ambiente per configurazioni sensibili
- Testare su dati di sviluppo prima dell'uso in produzione
- Verificare backup prima di script distruttivi

## Futuro

Possibili categorie future per l'organizzazione:
- `deployment/` - Script per deploy e CI/CD
- `migration/` - Script per migrazioni dati
- `monitoring/` - Script per health check e monitoring
- `backup/` - Script per backup automatici