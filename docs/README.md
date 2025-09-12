# Documentation

Documentazione completa per il Wine Marketplace - piattaforma stile Vinted per la compravendita di vini.

## Struttura

```
docs/
├── admin/          # Documentazione pannello amministrativo
├── deployment/     # Guide per deploy e produzione
├── development/    # Guide per sviluppatori
└── README.md       # Questo indice
```

## Admin (`admin/`)

Documentazione specifica per il pannello amministrativo:

- **`ADMIN_ENHANCEMENT_PLAN.md`** - Piano di miglioramenti per il pannello admin
- **`ADMIN_CREDENTIALS.md`** - Credenziali di accesso per l'ambiente di sviluppo

## Deployment (`deployment/`)

Guide e configurazioni per il deployment:

- **`DEPLOYMENT.md`** - Guida completa per il deploy su Render e configurazione produzione

## Development (`development/`)

Risorse per sviluppatori:

- **`MCP_SERVERS_GUIDE.md`** - Guida ai server MCP configurati (PostgreSQL, GitHub, Playwright, FileSystem, Fetch)

## Documentazione Principale

Altre risorse importanti nella root del progetto:

- **`README.md`** - Panoramica generale del progetto
- **`CLAUDE.md`** - Istruzioni specifiche per Claude Code
- **`.env.example`** - Template per variabili d'ambiente

## Quick Links

### Per Iniziare
1. Leggere il `README.md` principale
2. Configurare l'ambiente seguendo `docs/development/MCP_SERVERS_GUIDE.md`
3. Utilizzare gli script in `scripts/database/` per popolare il DB

### Per Admin
1. Credenziali: vedere `docs/admin/ADMIN_CREDENTIALS.md`
2. Funzionalità: consultare `docs/admin/ADMIN_ENHANCEMENT_PLAN.md`

### Per Deploy
1. Seguire la guida `docs/deployment/DEPLOYMENT.md`
2. Configurare le variabili d'ambiente di produzione

## Contribuire alla Documentazione

- Mantenere la documentazione aggiornata con le modifiche al codice
- Utilizzare formato Markdown per consistenza
- Includere esempi pratici quando possibile
- Organizzare i contenuti per categoria e livello di esperienza