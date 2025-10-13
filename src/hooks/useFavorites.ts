import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';

interface FavoriteRecipe {
  _id: string;
  userId: string;
  recipeId: string;
  recipeTitle: string;
  recipeImage?: string;
  createdAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const toggleFavorite = async (recipeId: string, recipeTitle: string, recipeImage?: string) => {
    if (!isAuthenticated) return false;

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
        
        // Update local state
        if (data.favorited) {
          // Added to favorites
          setFavorites(prev => [...prev, {
            _id: Date.now().toString(), // Temporary ID
            userId: '',
            recipeId,
            recipeTitle,
            recipeImage: recipeImage || '/placeholder-recipe.svg',
            createdAt: new Date().toISOString()
          }]);
        } else {
          // Removed from favorites
          setFavorites(prev => prev.filter(fav => fav.recipeId !== recipeId));
        }
        
        return data.favorited;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    
    return false;
  };

  const isFavorited = (recipeId: string) => {
    return favorites.some(fav => fav.recipeId === recipeId);
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited,
    refetch: fetchFavorites
  };
}