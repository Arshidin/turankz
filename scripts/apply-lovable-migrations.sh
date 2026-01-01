#!/bin/bash

# ============================================================================
# Script to apply database migrations for Lovable + Supabase project
# ============================================================================
# This script helps apply migrations through Supabase Dashboard
# Since Lovable uses Supabase, migrations should be applied via Dashboard
# ============================================================================

set -e

echo "=========================================="
echo "Lovable + Supabase Migration Helper"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Migration files
MIGRATIONS=(
  "supabase/migrations/20250122000001_enhance_fsm_enforcement.sql"
  "supabase/migrations/20250122000002_transaction_support_functions.sql"
  "supabase/migrations/20250122000003_reconciliation_functions.sql"
)

echo -e "${YELLOW}This script will help you apply migrations to Supabase.${NC}"
echo -e "${YELLOW}Since Lovable uses Supabase, migrations should be applied via Supabase Dashboard.${NC}"
echo ""
echo "Migration files to apply:"
for i in "${!MIGRATIONS[@]}"; do
  echo "  $((i+1)). ${MIGRATIONS[$i]}"
done
echo ""

# Check if files exist
echo "Checking migration files..."
for migration in "${MIGRATIONS[@]}"; do
  if [ ! -f "$migration" ]; then
    echo -e "${RED}ERROR: Migration file not found: $migration${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓${NC} Found: $migration"
done

echo ""
echo "=========================================="
echo "Instructions:"
echo "=========================================="
echo ""
echo "1. Open your Supabase Dashboard:"
echo "   https://supabase.com/dashboard"
echo ""
echo "2. Select your project (Turan Standard Pool)"
echo ""
echo "3. Go to SQL Editor → New Query"
echo ""
echo "4. Apply migrations in order:"
echo ""

for i in "${!MIGRATIONS[@]}"; do
  echo "   Step $((i+1)): Apply ${MIGRATIONS[$i]}"
  echo "   - Copy the contents of the file"
  echo "   - Paste into SQL Editor"
  echo "   - Click 'Run' (or Cmd/Ctrl + Enter)"
  echo "   - Verify success"
  echo ""
done

echo "5. Verify migrations:"
echo ""
echo "   Run this SQL to check functions:"
echo "   SELECT routine_name FROM information_schema.routines"
echo "   WHERE routine_schema = 'public'"
echo "   AND routine_name IN ("
echo "     'finalize_matching_with_execution',"
echo "     'create_matching_with_updates',"
echo "     'detect_missing_executions',"
echo "     'run_reconciliation_report'"
echo "   );"
echo ""
echo "   Should return 4 functions."
echo ""

# Option to display migration contents
read -p "Do you want to display migration contents? (y/n) " -n 1 -r
echo
if [[ $REply =~ ^[Yy]$ ]]; then
  for migration in "${MIGRATIONS[@]}"; do
    echo ""
    echo "=========================================="
    echo "Contents of: $migration"
    echo "=========================================="
    cat "$migration"
    echo ""
    read -p "Press Enter to continue to next migration..."
  done
fi

echo ""
echo -e "${GREEN}Migration guide complete!${NC}"
echo ""
echo "For detailed instructions, see: docs/LOVABLE_MIGRATION_GUIDE.md"

