# 🍷 Wine Marketplace

Un marketplace per la compravendita di vini stile Vinted, costruito come monorepo moderno con backend NestJS e frontend Next.js.

## 🏗️ Architettura

### Apps (Deployabili separatamente)
- **`apps/api`** - API REST NestJS con WebSocket per chat real-time
- **`apps/web`** - Frontend utenti con Next.js
- **`apps/admin`** - Dashboard amministrazione con Next.js

### Packages (Librerie condivise)  
- **`packages/database`** - Schema Prisma e client database
- **`packages/shared`** - Tipi TypeScript, utilities e costanti
- **`packages/ui`** - Componenti React riusabili

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- pnpm 8+
- PostgreSQL (o account Neon)

### 1. Clona e installa dipendenze
```bash
git clone <repo-url>
cd wine-marketplace
pnpm install
```

### 2. Setup database locale (opzionale)
```bash
# Avvia PostgreSQL e Redis con Docker
docker-compose up -d postgres redis

# Oppure usa Neon (consigliato)
# Crea un database su https://neon.tech
```

### 3. Configurazione environment
```bash
# Root per API
cp .env.example .env
# Modifica con le tue credenziali

# Web app  
cp apps/web/.env.local.example apps/web/.env.local

# Admin dashboard
cp apps/admin/.env.local.example apps/admin/.env.local
```

### 4. Setup database
```bash
# Genera client Prisma
pnpm db:generate

# Applica migrations
pnpm db:push

# Seed dati di esempio
pnpm --filter database db:seed
```

### 5. Avvia applicazioni
```bash
# Tutte le app insieme
pnpm dev

# O individualmente:
pnpm --filter api dev      # API su :3002
pnpm --filter web dev      # Web su :3000  
pnpm --filter admin dev    # Admin su :3001
```

## 📖 Documentazione API

Con l'API in esecuzione, visita:
- **Swagger UI**: http://localhost:3002/api/docs
- **Database Studio**: `pnpm --filter database db:studio`

## 🎯 Funzionalità Principali

### Per gli Utenti
- ✅ **Autenticazione**: JWT + Google OAuth
- ✅ **Catalogo vini**: Ricerca avanzata con filtri (regione, annata, prezzo)
- ✅ **Gestione profilo**: Statistiche vendite, recensioni, indirizzi spedizione
- ✅ **Chat real-time**: Messaggistica tra compratori e venditori
- ✅ **Sistema ordini**: Carrello, checkout, tracking spedizioni
- ✅ **Pagamenti**: PayPal (+ preparazione Stripe/Escrow)
- ✅ **Upload immagini**: Multi-upload con validazione

### Per i Venditori
- ✅ **Listing vini**: Form completo con dettagli tecnici
- ✅ **Gestione inventario**: Stati, quantità, prezzi
- ✅ **Dashboard vendite**: Statistiche e storico ordini
- ✅ **Etichette spedizione**: Generazione automatica

### Per gli Admin
- ✅ **Dashboard analytics**: Statistiche utenti, vendite, revenue
- ✅ **Moderazione**: Approvazione vini, gestione utenti
- ✅ **Sistema rimborsi**: Workflow dispute e refund
- ✅ **Audit logs**: Tracciamento azioni amministrative

## 🛠️ Comandi Utili

```bash
# Build tutto
pnpm build

# Lint e type checking
pnpm lint
pnpm type-check

# Database operations
pnpm db:generate     # Rigenera client Prisma
pnpm db:push         # Push schema senza migration
pnpm db:migrate      # Crea e applica migration
pnpm --filter database db:studio  # Apri Prisma Studio

# Test
pnpm --filter api test           # Unit tests
pnpm --filter api test:e2e       # E2E tests
pnpm --filter api test:cov       # Coverage

# Cleanup
pnpm clean          # Pulisce build artifacts
```

## 🏭 Deploy in Produzione

### API (Render/Railway)
1. Collega repo GitHub a Render
2. Build command: `pnpm --filter api build`
3. Start command: `pnpm --filter api start:prod`
4. Aggiungi variabili environment da `.env.example`

### Frontend (Vercel/Netlify) 
1. **Web app**: Build da `apps/web`
2. **Admin**: Build da `apps/admin`  
3. Configure environment variables

### Database
- **Consigliato**: [Neon](https://neon.tech) per PostgreSQL managed
- **Alternative**: Railway, Supabase, AWS RDS

## 🔧 Configurazione Avanzata

### OAuth Setup
```bash
# Google Console: https://console.developers.google.com
# 1. Crea progetto
# 2. Abilita Google+ API
# 3. Crea credenziali OAuth 2.0
# 4. Aggiungi redirect URI: http://localhost:3002/api/auth/google/callback
```

### Payments Setup
```bash
# PayPal Developer: https://developer.paypal.com
# 1. Crea app sandbox
# 2. Ottieni client ID e secret
# 3. Configure webhooks per http://localhost:3002/api/payments/paypal/webhook
```

### File Storage
```bash
# Locale: files salvati in apps/api/uploads/
# Produzione: configurare AWS S3 in .env
AWS_S3_BUCKET="wine-marketplace-uploads"
AWS_REGION="us-east-1"
```

## 🐛 Troubleshooting

### Database Connection
```bash
# Verifica connessione
pnpm --filter database db:studio

# Reset database
pnpm --filter database db:push --force-reset
pnpm --filter database db:seed
```

### Port Conflicts
```bash
# Cambia porte in:
# apps/api/src/main.ts -> PORT=3002  
# apps/web/package.json -> "dev": "next dev -p 3000"
# apps/admin/package.json -> "dev": "next dev -p 3001"
```

### Build Errors
```bash
# Pulisci e reinstalla
pnpm clean
rm -rf node_modules
pnpm install

# Verifica TypeScript
pnpm type-check
```

## 📝 TODO / Roadmap

- [ ] Sistema notifiche push
- [ ] App mobile React Native  
- [ ] Integrazione corrieri (DHL, BRT)
- [ ] Sistema aste per vini rari
- [ ] ML per raccomandazioni vini
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA support

## 🤝 Contributing

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)  
5. Apri Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙋‍♂️ Support

- 📧 Email: support@winemarketplace.com
- 💬 Discord: [Wine Marketplace Community](https://discord.gg/winemarketplace)
- 📖 Docs: [docs.winemarketplace.com](https://docs.winemarketplace.com)

---

**Built with ❤️ using NestJS, Next.js, Prisma & TypeScript**