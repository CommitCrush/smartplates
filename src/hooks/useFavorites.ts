import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/authContext';

const FAVORITES_CACHE_KEY = 'smartplates-favorites-cache';
const FAVORITES_CACHE_TIMESTAMP = 'smartplates-favorites-timestamp';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface FavoriteRecipe {
  _id: string;
  userId: string;
  recipeId: string;
  recipeTitle: string;
  recipeImage?: string;
  createdAt: string;
}

/**
 * Custom hook for managing user favorite recipes with optimized caching.
 * Reduces API calls by implementing:
 * 1. localStorage caching with TTL
 * 2. Debounced fetch requests
 * 3. Optimistic UI updates
 * 4. Smart refetch behavior
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const fetchTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingToggles = useRef<Set<string>>(new Set());
  const lastAuthState = useRef<boolean | null>(null);

  /**
   * Load favorites from localStorage cache
   */
  const loadFromCache = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem(FAVORITES_CACHE_KEY);
        const timestamp = localStorage.getItem(FAVORITES_CACHE_TIMESTAMP);
        
        if (cachedData && timestamp) {
          const parsedTimestamp = parseInt(timestamp, 10);
          const now = Date.now();
          
          // If cache is still valid (within TTL)
          if (now - parsedTimestamp < CACHE_TTL) {
            setFavorites(JSON.parse(cachedData));
            setLastFetched(parsedTimestamp);
            setLoading(false);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading favorites from cache:', error);
      return false;
    }
  }, []);

  /**
   * Save favorites to localStorage cache
   */
  const saveToCache = useCallback((data: FavoriteRecipe[]) => {
    try {
      if (typeof window !== 'undefined') {
        const timestamp = Date.now();
        localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(FAVORITES_CACHE_TIMESTAMP, timestamp.toString());
        setLastFetched(timestamp);
      }
    } catch (error) {
      console.error('Error saving favorites to cache:', error);
    }
  }, []);

  /**
   * Debounced fetch favorites implementation
   * Uses caching, prevents duplicate requests, and updates last fetched time
   */
  const fetchFavorites = useCallback(async (force: boolean = false) => {
    // Skip fetch if not authenticated
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    // Skip fetch if we already have recent data and it's not forced
    if (
      !force && 
      lastFetched && 
      Date.now() - lastFetched < CACHE_TTL &&
      pendingToggles.current.size === 0
    ) {
      setLoading(false);
      return;
    }

    // Clear any pending fetch timers
    if (fetchTimer.current) {
      clearTimeout(fetchTimer.current);
      fetchTimer.current = null;
    }

    // Try to load from cache first if not forced
    if (!force && loadFromCache()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        const favoritesData = data.favorites || [];
        
        // Update state and cache
        setFavorites(favoritesData);
        saveToCache(favoritesData);
        pendingToggles.current.clear();
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, lastFetched, loadFromCache, saveToCache]);

  /**
   * Debounced refetch implementation that prevents excessive API calls
   */
  const debouncedFetch = useCallback((force: boolean = false) => {
    if (fetchTimer.current) {
      clearTimeout(fetchTimer.current);
    }
    
    fetchTimer.current = setTimeout(() => {
      fetchFavorites(force);
      fetchTimer.current = null;
    }, 300);
  }, [fetchFavorites]);

  /**
   * Effect to fetch favorites when authentication state changes
   */
  useEffect(() => {
    // Don't refetch if auth state hasn't actually changed
    if (lastAuthState.current === isAuthenticated) {
      return;
    }
    
    lastAuthState.current = isAuthenticated;
    
    if (isAuthenticated) {
      // First try to load from cache
      if (!loadFromCache()) {
        // If no cache or expired, fetch from API
        fetchFavorites();
      }
    } else {
      // Clear favorites if not authenticated
      setFavorites([]);
      setLoading(false);
    }
    
    return () => {
      if (fetchTimer.current) {
        clearTimeout(fetchTimer.current);
      }
    };
  }, [isAuthenticated, fetchFavorites, loadFromCache]);

  /**
   * Toggle favorite status with optimistic UI updates and automatic cache handling
   */
  const toggleFavorite = async (recipeId: string, recipeTitle: string, recipeImage?: string) => {
    if (!isAuthenticated) return false;
    
    // Track this recipe as having a pending toggle operation
    pendingToggles.current.add(recipeId);

    // Optimistic UI update
    const isFavorite = favorites.some(fav => fav.recipeId === recipeId);
    
    // Optimistically update UI immediately
    if (isFavorite) {
      // Remove from favorites optimistically
      setFavorites(prev => prev.filter(fav => fav.recipeId !== recipeId));
    } else {
      // Add to favorites optimistically
      const optimisticFavorite = {
        _id: `temp-${Date.now()}`, // Temporary ID
        userId: '',
        recipeId,
        recipeTitle,
        recipeImage: recipeImage || '/placeholder-recipe.svg',
        createdAt: new Date().toISOString()
      };
      setFavorites(prev => [...prev, optimisticFavorite]);
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId,
          recipeTitle,
          recipeImage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local cache after successful API call
        saveToCache(favorites);
        
        // Fetch the latest data to ensure sync, but debounce to avoid multiple calls
        debouncedFetch(true);
        
        return data.favorited;
      } else {
        // Revert optimistic update on error
        fetchFavorites(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      fetchFavorites(true);
    } finally {
      pendingToggles.current.delete(recipeId);
    }
    
    return false;
  };

  /**
   * Check if a recipe is favorited
   */
  const isFavorited = useCallback((recipeId: string) => {
    return favorites.some(fav => fav.recipeId === recipeId);
  }, [favorites]);

  /**
   * Manually refetch favorites with optional force parameter
   * Smart refetch only loads new data if:
   * 1. Force is true
   * 2. Cache is expired (older than TTL)
   * 3. There are pending toggles to sync
   * 4. Initial load (no previous data)
   */
  const refetch = useCallback((force: boolean = false) => {
    // Skip unnecessary fetches when data is fresh
    if (!force && 
        lastFetched && 
        (Date.now() - lastFetched < CACHE_TTL) && 
        pendingToggles.current.size === 0 && 
        favorites.length > 0) {
      return;
    }
    
    // Debounce the actual fetch request to prevent rapid successive calls
    debouncedFetch(force);
  }, [lastFetched, favorites.length, debouncedFetch]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited,
    refetch
  };
}