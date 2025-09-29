#!/bin/bash

# Script per chiudere tutti i servizi di sviluppo

echo "🛑 Chiusura di tutti i servizi di sviluppo..."

# Chiudi processi sulle porte specifiche
echo "   Chiusura servizi su porte 3000, 3001, 3010..."
lsof -ti:3000,3001,3010 2>/dev/null | xargs kill -9 2>/dev/null || true

# Chiudi tutti i processi pnpm dev
echo "   Chiusura processi pnpm dev..."
pkill -f "pnpm.*dev" 2>/dev/null || true

# Chiudi tutti i processi nest
echo "   Chiusura processi nest..."
pkill -f "nest.*start" 2>/dev/null || true

# Chiudi tutti i processi next
echo "   Chiusura processi next..."
pkill -f "next.*dev" 2>/dev/null || true

echo "✅ Tutti i servizi sono stati chiusi."