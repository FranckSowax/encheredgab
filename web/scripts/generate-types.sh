#!/bin/bash

# Script pour régénérer les types TypeScript depuis Supabase
# Usage: npm run generate:types

echo "🔄 Génération des types TypeScript depuis Supabase..."

npx supabase gen types typescript --project-id lwhxmrfddlwmfjfrtdzk > types/database.types.ts

echo "✅ Types générés avec succès dans types/database.types.ts"
