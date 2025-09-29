#!/bin/bash

# Script per avviare tutti i servizi di sviluppo con porte fisse
# API: 3010, Web: 3000, Admin: 3001

set -e

echo "🧹 Pulizia porte esistenti..."

# Chiudi eventuali processi esistenti sulle porte standard
lsof -ti:3000,3001,3010 2>/dev/null | xargs kill -9 2>/dev/null || true

# Aspetta un momento per garantire la chiusura
sleep 1

echo "🚀 Avvio servizi di sviluppo..."
echo "   📡 API Server: http://localhost:3010"
echo "   🌐 Web App: http://localhost:3000"
echo "   ⚙️  Admin Dashboard: http://localhost:3001"
echo ""

# Avvia tutti i servizi in parallelo usando concurrently
pnpm concurrently \
  --prefix-colors "cyan,green,yellow" \
  --names "API,WEB,ADMIN" \
  "cd apps/api && PORT=3010 pnpm dev" \
  "cd apps/web && pnpm dev" \
  "cd apps/admin && pnpm dev"