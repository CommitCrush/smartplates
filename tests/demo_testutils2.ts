/**
 * Demo der testUtils2.ts Funktionen
 * Zeigt alle Features der production-ready Test-Infrastruktur
 */

import { 
  testSeeder, 
  testAssertions, 
  jestHooks
} from '@/lib/testing/testUtils2';

async function demoTestUtils2() {
  console.log('🧪 Demo: testUtils2.ts Features');
  console.log('===============================\n');

  try {
    // Setup mit testUtils2.ts
    await jestHooks.beforeAll();
    await jestHooks.beforeEach();

    // 1. Basic Data Seeding (Hauptfeature!)
    console.log('1️⃣ Creating complete test data with seedBasicData()...');
    const basicData = await testSeeder.seedBasicData();
    
    console.log(`✅ Created complete test environment:`);
    console.log(`   👥 Users: ${basicData.users.length}`);
    console.log(`   📂 Categories: ${basicData.categories.length}`);
    console.log(`   🍽️ Recipes: ${basicData.recipes.length}`);

    // 2. Zeige Details
    console.log('\n📊 Detailed Data:');
    basicData.users.forEach((user, i) => {
      console.log(`   User ${i+1}: ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    basicData.categories.forEach((cat, i) => {
      console.log(`   Category ${i+1}: ${cat.displayName} (${cat.name})`);
    });
    
    basicData.recipes.forEach((recipe, i) => {
      console.log(`   Recipe ${i+1}: ${recipe.title} - ${recipe.description}`);
    });

    // 3. Test Assertions
    console.log('\n3️⃣ Validating data with testAssertions...');
    
    basicData.users.forEach((user, i) => {
      testAssertions.isValidUser(user);
      console.log(`   ✅ User ${i+1} validation passed`);
    });

    basicData.recipes.forEach((recipe, i) => {
      testAssertions.isValidRecipe(recipe);
      console.log(`   ✅ Recipe ${i+1} validation passed`);
    });

    basicData.categories.forEach((cat, i) => {
      testAssertions.isValidCategory(cat);
      console.log(`   ✅ Category ${i+1} validation passed`);
    });

    console.log('\n🎉 Demo complete! Check MongoDB Atlas:');
    console.log('💡 Database: smartplates_test');
    console.log('📁 Collections: users, recipes, categories');
    
    // Cleanup
    await jestHooks.afterEach();
    await jestHooks.afterAll();

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

demoTestUtils2();