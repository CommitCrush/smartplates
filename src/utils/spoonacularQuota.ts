/**
 * Utility to check Spoonacular API quota and usage
 */

export interface SpoonacularQuotaInfo {
  requestsRemaining: number;
  totalQuota: number;
  usedRequests: number;
  resetDate?: string;
}

/**
 * Check current Spoonacular API quota by making a minimal API call
 * @returns Promise with quota information or null if unavailable
 */
export async function checkSpoonacularQuota(): Promise<SpoonacularQuotaInfo | null> {
  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
  
  if (!apiKey) {
    console.warn('Spoonacular API key not found');
    return null;
  }

  try {
    // Make a minimal API call to get quota headers
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=test&number=1`
    );

    // Extract quota information from headers
    const headers = response.headers;
    const requestsRemaining = parseInt(headers.get('X-API-Quota-Left') || '0');
    const totalQuota = parseInt(headers.get('X-API-Quota-Limit') || '0');
    const usedRequests = totalQuota - requestsRemaining;

    return {
      requestsRemaining,
      totalQuota,
      usedRequests,
      resetDate: headers.get('X-API-Quota-Reset') || undefined
    };

  } catch (error) {
    console.error('Error checking Spoonacular quota:', error);
    return null;
  }
}

/**
 * Log current quota status to console
 */
export async function logSpoonacularQuota(): Promise<void> {
  const quota = await checkSpoonacularQuota();
  
  if (!quota) {
    console.log('❌ Unable to check Spoonacular quota');
    return;
  }

  const percentUsed = ((quota.usedRequests / quota.totalQuota) * 100).toFixed(1);
  
  console.log('📊 Spoonacular API Quota Status:');
  console.log(`   • Used: ${quota.usedRequests}/${quota.totalQuota} (${percentUsed}%)`);
  console.log(`   • Remaining: ${quota.requestsRemaining} requests`);
  
  if (quota.resetDate) {
    console.log(`   • Resets: ${quota.resetDate}`);
  }
  
  // Warning if quota is running low
  if (quota.requestsRemaining < 10) {
    console.warn('⚠️ Spoonacular quota running low! Consider caching or upgrading plan.');
  }
}

/**
 * Development helper to check quota on page load
 */
if (process.env.NODE_ENV === 'development') {
  // Auto-check quota when this module is imported
  setTimeout(() => {
    logSpoonacularQuota();
  }, 2000);
}