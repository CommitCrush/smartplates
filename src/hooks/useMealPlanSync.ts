/**
 * Meal Plan Synchronization Hook
 * 
 * Ensures all pages (My Recipes, My Saved Meal Plans, Meal Plan Calendar) 
 * display synchronized data and update in real-time when changes occur.
 */

import { useState, useCallback, useEffect } from 'react';

// Global state for meal plan synchronization
let globalSyncTrigger = 0;
const syncListeners: Set<() => void> = new Set();

export function useMealPlanSync() {
  const [syncCounter, setSyncCounter] = useState(globalSyncTrigger);

  // Register this component to receive sync updates
  const triggerSync = useCallback(() => {
    globalSyncTrigger++;
    syncListeners.forEach(listener => listener());
  }, []);

  // Subscribe to global sync updates
  const onSync = useCallback(() => {
    setSyncCounter(globalSyncTrigger);
  }, []);

  // Register/unregister sync listener
  useEffect(() => {
    syncListeners.add(onSync);
    return () => {
      syncListeners.delete(onSync);
    };
  }, [onSync]);

  return {
    syncCounter, // Use this as a dependency to trigger re-fetching
    triggerSync, // Call this after making changes to meal plans
  };
}

// Export for manual triggering from anywhere
export const triggerGlobalMealPlanSync = () => {
  globalSyncTrigger++;
  syncListeners.forEach(listener => listener());
};