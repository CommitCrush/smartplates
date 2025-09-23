/**
 * Spoonacular Quota Monitoring Dashboard
 * Quick tool to check current API usage and quota status
 */

import { checkSpoonacularQuota, logSpoonacularQuota } from '@/utils/spoonacularQuota';

/**
 * Manual quota check for debugging
 * Run this in browser console: window.checkQuota()
 */
if (typeof window !== 'undefined') {
  (window as any).checkQuota = async () => {
    console.log('🔍 Checking Spoonacular API quota...');
    await logSpoonacularQuota();
  };

  (window as any).testApiKey = async () => {
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    
    if (!apiKey) {
      console.error('❌ NEXT_PUBLIC_SPOONACULAR_API_KEY not found');
      return;
    }

    console.log('🔑 Testing API key:', '***' + apiKey.slice(-4));

    try {
      // Test with minimal API call
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=test&number=1`
      );

      console.log('📡 Response status:', response.status);
      console.log('📊 Headers:');
      console.log('  • Quota Used:', response.headers.get('X-API-Quota-Used'));
      console.log('  • Quota Left:', response.headers.get('X-API-Quota-Left'));
      console.log('  • Quota Limit:', response.headers.get('X-API-Quota-Limit'));

      if (response.status === 200) {
        console.log('✅ API key is working correctly');
        const data = await response.json();
        console.log('📝 Sample data:', data);
      } else if (response.status === 401) {
        console.error('❌ API key is invalid or expired');
      } else if (response.status === 402) {
        console.warn('⚠️ Quota exceeded for today');
      } else {
        console.warn('⚠️ Unexpected response:', response.status, response.statusText);
      }

    } catch (error) {
      console.error('❌ API test failed:', error);
    }
  };

  // Show available debugging commands
  console.log('🛠️ Spoonacular Debugging Tools Available:');
  console.log('  • window.checkQuota() - Check current quota');
  console.log('  • window.testApiKey() - Test API key validity');
}