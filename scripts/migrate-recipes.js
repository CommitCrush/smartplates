#!/usr/bin/env node

/**
 * Standalone Migration Script
 * 
 * Kann direkt ausgeführt werden, um die Recipe-Migration durchzuführen
 * Usage: node scripts/migrate-recipes.js
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

async function runMigration() {
  try {
    console.log('🚀 Starting Recipe Migration...\n');
    
    // Dynamic import to avoid module resolution issues
    const { migrateRecipeTimeFields, validateMigration } = await import('../src/utils/migrateRecipeData');
    
    // Run pre-migration validation
    console.log('📋 Pre-migration validation:');
    await validateMigration();
    console.log('');
    
    // Run the migration
    const result = await migrateRecipeTimeFields();
    
    if (result.success) {
      console.log('\n✅ Migration completed successfully!');
      
      // Run post-migration validation
      console.log('\n📋 Post-migration validation:');
      await validateMigration();
      
    } else {
      console.error('\n❌ Migration failed:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Script error:', error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration };