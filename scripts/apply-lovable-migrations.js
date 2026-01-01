#!/usr/bin/env node

/**
 * Lovable + Supabase Migration Helper
 * 
 * This script helps apply database migrations for Lovable projects.
 * Since Lovable uses Supabase, migrations should be applied via Supabase Dashboard.
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS = [
  'supabase/migrations/20250122000001_enhance_fsm_enforcement.sql',
  'supabase/migrations/20250122000002_transaction_support_functions.sql',
  'supabase/migrations/20250122000003_reconciliation_functions.sql',
];

console.log('==========================================');
console.log('Lovable + Supabase Migration Helper');
console.log('==========================================');
console.log('');

// Check if files exist
console.log('Checking migration files...');
let allExist = true;
for (const migration of MIGRATIONS) {
  if (fs.existsSync(migration)) {
    console.log(`✓ Found: ${migration}`);
  } else {
    console.error(`✗ Missing: ${migration}`);
    allExist = false;
  }
}

if (!allExist) {
  console.error('\nERROR: Some migration files are missing!');
  process.exit(1);
}

console.log('\n==========================================');
console.log('Instructions:');
console.log('==========================================');
console.log('');
console.log('1. Open your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard');
console.log('');
console.log('2. Select your project (Turan Standard Pool)');
console.log('');
console.log('3. Go to SQL Editor → New Query');
console.log('');
console.log('4. Apply migrations in order:');
console.log('');

MIGRATIONS.forEach((migration, index) => {
  console.log(`   Step ${index + 1}: Apply ${migration}`);
  console.log('   - Copy the contents of the file');
  console.log('   - Paste into SQL Editor');
  console.log('   - Click "Run" (or Cmd/Ctrl + Enter)');
  console.log('   - Verify success');
  console.log('');
});

console.log('5. Verify migrations:');
console.log('');
console.log('   Run this SQL to check functions:');
console.log('   SELECT routine_name FROM information_schema.routines');
console.log('   WHERE routine_schema = \'public\'');
console.log('   AND routine_name IN (');
console.log('     \'finalize_matching_with_execution\',');
console.log('     \'create_matching_with_updates\',');
console.log('     \'detect_missing_executions\',');
console.log('     \'run_reconciliation_report\'');
console.log('   );');
console.log('');
console.log('   Should return 4 functions.');
console.log('');

// Ask if user wants to display contents
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Do you want to display migration contents? (y/n) ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    MIGRATIONS.forEach((migration, index) => {
      console.log('');
      console.log('==========================================');
      console.log(`Contents of: ${migration}`);
      console.log('==========================================');
      const content = fs.readFileSync(migration, 'utf8');
      console.log(content);
      console.log('');
      
      if (index < MIGRATIONS.length - 1) {
        rl.question('Press Enter to continue to next migration...', () => {});
      }
    });
  }
  
  console.log('');
  console.log('Migration guide complete!');
  console.log('');
  console.log('For detailed instructions, see: docs/LOVABLE_MIGRATION_GUIDE.md');
  rl.close();
});

