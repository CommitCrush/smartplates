"use client";
import React, { useState, useEffect } from "react";
import IngredientInput from '@/components/ai/IngredientInput';
import ImageUpload from '@/components/ai/ImageUpload';
import RecipeResults from '@/components/ai/RecipeResults';
import RecipeFilterDropdown from '@/components/ai/RecipeFilterDropdown';
import { cn } from "@/lib/utils";

export default function AiRecipePage() {
  const [debugResponse, setDebugResponse] = useState<any>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [recognizedIngredients, setRecognizedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ category?: string; diet?: string; allergy?: string; difficulty?: string }>({
    category: '',
    diet: '',
    allergy: '',
    difficulty: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // ✅ Neue States für automatische Rezept-Generierung
  const [hasInitialGeneration, setHasInitialGeneration] = useState(false);
  const [autoGenerateTimer, setAutoGenerateTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 6;

  // ✅ Neue States für Refresh und Notifications
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    category: 'ingredients' | 'recipes' | 'general'; // ✅ NEW: Kategorie für kontextuelle Platzierung
  }>>([]);

  // Pagination Logic
  const totalPages = Math.ceil(recipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const currentRecipes = recipes.slice(startIndex, endIndex);

  // Reset pagination when recipes change
  const setRecipesWithPagination = (newRecipes: any[]) => {
    setRecipes(newRecipes);
    setCurrentPage(1); // Reset to first page
  };

  // ✅ Smart Notification System mit Kategorien
  const addNotification = (
    type: 'success' | 'error' | 'info', 
    message: string, 
    category: 'ingredients' | 'recipes' | 'general' = 'general'
  ) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message, category }]);
    
    // ✅ Auto-remove nach 7 Sekunden (verlängert für bessere Lesbarkeit)
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 7000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ✅ Komponente für kontextuelle Notifications
  const ContextualNotifications = ({ category }: { category: 'ingredients' | 'recipes' }) => {
    const categoryNotifications = notifications.filter(n => n.category === category);
    
    if (categoryNotifications.length === 0) return null;
    
    return (
      <div className="mb-4 space-y-2">
        {categoryNotifications.map(notification => (
          <div
            key={notification.id}
            className={cn(
              "px-3 py-2 rounded-lg shadow-md transition-all duration-300 transform animate-in slide-in-from-top",
              "flex items-center justify-between border-l-4 text-sm",
              notification.type === 'success' && "bg-green-600/90 text-white border-green-400",
              notification.type === 'error' && "bg-red-600/90 text-white border-red-400",
              notification.type === 'info' && "bg-blue-600/90 text-white border-blue-400"
            )}
          >
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-white/80 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  // ✅ Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoGenerateTimer) {
        clearTimeout(autoGenerateTimer);
      }
    };
  }, [autoGenerateTimer]);

  // ✅ Auto-generate recipes when filters change (after initial generation)
  useEffect(() => {
    if (!hasInitialGeneration) return;
    
    const allIngredients = [...ingredients, ...recognizedIngredients];
    if (allIngredients.length === 0) return;

    // Clear existing timer
    if (autoGenerateTimer) {
      clearTimeout(autoGenerateTimer);
    }

    // Set new timer for auto-generation (debounced)
    const timer = setTimeout(() => {
      handleAutoSearchRecipes();
    }, 1000); // 1 second delay

    setAutoGenerateTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [filters, hasInitialGeneration]); // ✅ filters als dependency hinzugefügt

  // Handle manual ingredient input
  const handleIngredientsChange = (newIngredients: string[]) => {
    setIngredients(newIngredients);
    setShowConfirm(false);
    
    // ✅ Auto-generate recipes if initial generation already happened
    if (hasInitialGeneration && newIngredients.length > 0) {
      // Clear existing timer
      if (autoGenerateTimer) {
        clearTimeout(autoGenerateTimer);
      }
      
      // Set new timer for auto-generation (debounced)
      const timer = setTimeout(() => {
        handleAutoSearchRecipes();
      }, 1500); // 1.5 second delay after ingredient change
      
      setAutoGenerateTimer(timer);
      // ✅ Auto-generate ohne störende Notification
      // addNotification('info', '🤖 Auto-generating new recipes...', 'recipes');
    }
  };

  // Handle image upload and OpenAI Vision analysis
  const handleImageUpload = async (file: File) => {
    setImage(file);
    setAnalyzing(true);
    setError(null);
    setRecognizedIngredients([]);
    addNotification('info', '🤖 AI is analyzing your fridge photo...', 'ingredients');
    
    try {
      const res = await fetch('/api/ai/analyze-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: await fileToBase64(file) })
      });
      const data = await res.json();
      console.log('AI analyze-fridge response:', data);
      if (!res.ok || !data.success || !Array.isArray(data.data?.ingredients)) {
        setError(data.error || 'No ingredients recognized.');
        setRecognizedIngredients([]);
        setShowConfirm(false);
        addNotification('error', '❌ No ingredients detected. Try a clearer photo.', 'ingredients');
      } else {
        // Extract only ingredient names if objects are returned
        const names = data.data.ingredients.map((ing: any) => typeof ing === 'string' ? ing : ing.name).filter(Boolean);
        setRecognizedIngredients(names);
        setShowConfirm(true);
        addNotification('success', `🎯 ${names.length} ingredients successfully detected!`, 'ingredients');
      }
    } catch (err) {
      setError('Image analysis failed. Please try again.');
      setRecognizedIngredients([]);
      setShowConfirm(false);
      addNotification('error', '🚨 AI analysis failed. Please try again.', 'ingredients');
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle recipe search (manual or confirmed ingredients)
  const handleSearchRecipes = async (randomize = false) => {
    setRecipesWithPagination([]);
    setError(null);
    setDebugResponse(null);
    setHasInitialGeneration(true); // ✅ Mark initial generation as done
    
    const searchIngredients = [...ingredients, ...recognizedIngredients].join(',');
    const params = new URLSearchParams();
    if (searchIngredients) params.append('search', searchIngredients);
    
    // ✅ Filter nur anwenden wenn NICHT randomize
    if (!randomize) {
      if (filters.category) params.append('type', filters.category);
      if (filters.diet) params.append('diet', filters.diet);
      if (filters.allergy) params.append('intolerances', filters.allergy);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
    }
    
    // ✅ Random Parameter für zufällige Rezepte
    if (randomize) params.append('randomize', 'true');
    
    try {
      const res = await fetch(`/api/ai/search-recipes?${params.toString()}`);
      const data = await res.json();
      setDebugResponse({ status: res.status, data });
      if (!res.ok || data.error) {
        let errorMsg = 'No recipes found.';
        if (data.error) errorMsg = data.error;
        else if (res.status === 500) errorMsg = 'Internal server error. Please try again later.';
        setError(errorMsg);
        setRecipesWithPagination([]);
        return;
      }
      setRecipesWithPagination(data.recipes || []);
      const messagePrefix = randomize ? '🎲' : '🎉';
      addNotification('success', `${messagePrefix} ${data.recipes?.length || 0} recipes found!`, 'recipes');
    } catch (err) {
      setError('Server error. Please try again later.');
      setRecipesWithPagination([]);
      setDebugResponse({ status: 500, error: err });
      addNotification('error', 'Error loading recipes. Please try again.', 'recipes');
    }
  };

  // ✅ Auto-search function for automatic recipe generation
  const handleAutoSearchRecipes = async () => {
    if (!hasInitialGeneration) return;
    
    setError(null);
    setDebugResponse(null);
    
    const searchIngredients = [...ingredients, ...recognizedIngredients].join(',');
    if (!searchIngredients) {
      setRecipesWithPagination([]);
      return;
    }
    
    const params = new URLSearchParams();
    params.append('search', searchIngredients);
    if (filters.category) params.append('type', filters.category);
    if (filters.diet) params.append('diet', filters.diet);
    if (filters.allergy) params.append('intolerances', filters.allergy);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    
    try {
      const res = await fetch(`/api/ai/search-recipes?${params.toString()}`);
      const data = await res.json();
      setDebugResponse({ status: res.status, data });
      if (!res.ok || data.error) {
        let errorMsg = 'No recipes found.';
        if (data.error) errorMsg = data.error;
        setError(errorMsg);
        setRecipesWithPagination([]);
        addNotification('error', 'No recipes found with new ingredients.', 'recipes');
        return;
      }
      setRecipesWithPagination(data.recipes || []);
      addNotification('success', `✨ ${data.recipes?.length || 0} new recipes auto-generated!`, 'recipes');
    } catch (err) {
      setError('Server error. Please try again later.');
      setRecipesWithPagination([]);
      addNotification('error', 'Error auto-generating recipes.', 'recipes');
    }
  };

  // Handle filter change - automatische Filterung ohne Button-Klick
  const handleFilterChange = async (newFilters: any) => {
    const hadFilters = Object.keys(filters).some(key => filters[key as keyof typeof filters] && filters[key as keyof typeof filters] !== 'all' && filters[key as keyof typeof filters] !== 'none');
    
    setFilters(newFilters);
    setError(null);
    setDebugResponse(null);
    
    // ✅ Prüfen ob Filter zurückgesetzt wurden
    const isFilterReset = Object.keys(newFilters).every(key => 
      !newFilters[key] || newFilters[key] === 'all' || newFilters[key] === 'none'
    );
    
    // ✅ Wenn Filter zurückgesetzt und wir bereits Rezepte generiert haben
    if (isFilterReset && hadFilters && hasInitialGeneration && (ingredients.length > 0 || recognizedIngredients.length > 0)) {
      // ✅ Filter-Reset ohne störende Notification
      // addNotification('info', '🔄 Filters cleared. Regenerating recipes...', 'recipes');
      // Die automatische Generierung wird durch useEffect ausgelöst
      return;
    }
    
    // Nur automatisch filtern wenn bereits Rezepte vorhanden sind
    if (recipes.length === 0) return;
    
    setIsFiltering(true);
    // ✅ Filter-Anwendung ohne störende Notification
    // addNotification('info', '🔍 Applying filters...', 'recipes');
    
    const searchIngredients = recognizedIngredients.length > 0 ? recognizedIngredients.join(',') : ingredients.join(',');
    const params = new URLSearchParams();
    if (searchIngredients) params.append('search', searchIngredients);
    if (newFilters.category) params.append('type', newFilters.category);
    if (newFilters.diet) params.append('diet', newFilters.diet);
    if (newFilters.allergy) params.append('intolerances', newFilters.allergy);
    if (newFilters.difficulty) params.append('difficulty', newFilters.difficulty);
    
    // Automatische API-Anfrage bei Filter-Änderung
    try {
      const res = await fetch(`/api/ai/search-recipes?${params.toString()}`);
      const data = await res.json();
      setDebugResponse({ status: res.status, data });
      
      if (!res.ok || data.error) {
        let errorMsg = 'No recipes found with current filters.';
        if (data.error) errorMsg = data.error;
        else if (res.status === 500) errorMsg = 'Internal server error. Please try again later.';
        setError(errorMsg);
        setRecipesWithPagination([]);
        addNotification('error', 'No recipes found with current filters.');
        return;
      }
      setRecipesWithPagination(data.recipes || []);
      addNotification('success', `✅ ${data.recipes?.length || 0} recipes found with filters!`);
    } catch (err) {
      setError('Server error. Please try again later.');
      setRecipesWithPagination([]);
      setDebugResponse({ status: 500, error: err });
      addNotification('error', 'Error applying filters. Please try again.');
    } finally {
      setIsFiltering(false);
    }
  };

  // Reset for new image
  const handleNewImage = () => {
    setImage(null);
    setRecognizedIngredients([]);
    setAnalyzing(false);
    setRecipesWithPagination([]);
    setShowConfirm(false);
    setError(null);
    setHasInitialGeneration(false); // ✅ Reset auto-generation state
    
    // Clear any pending timers
    if (autoGenerateTimer) {
      clearTimeout(autoGenerateTimer);
      setAutoGenerateTimer(null);
    }
  };

  // Pagination Navigation Functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // ✅ Intelligenter Refresh mit verbessertem Feedback
  const handleRefreshRecipes = async () => {
    setIsRefreshing(true);
    setError(null);
    
    // ✅ Alle Filter explizit zurücksetzen beim Refresh (leere Strings für Dropdown-Reset)
    const resetFilters = {
      category: '',
      diet: '',
      allergy: '',
      difficulty: ''
    };
    setFilters(resetFilters);
    
    // ✅ Kurze Verzögerung um sicherzustellen, dass UI-Update vor API-Call erfolgt
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // ✅ Random Rezepte beim Refresh holen (ohne Filter)
      await handleSearchRecipes(true);
      addNotification('success', '✅ Random recipes loaded and all filters cleared!', 'recipes');
      
      // Kurze Verzögerung für visuelles Feedback
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      setIsRefreshing(false);
      addNotification('error', 'Refresh failed. Please try again.', 'recipes');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#23293a] via-[#181e2a] to-[#232b3e] flex flex-col items-center justify-start">
      {/* Hero Section */}
      <div className="w-full flex justify-center items-center pt-10 pb-2 px-0">
        <div className="flex flex-row items-stretch justify-center w-full max-w-5xl gap-0 h-[340px]">
          {/* Left: Headline & Button */}
          <div className="flex-1 flex flex-col justify-center items-start pl-16 pr-8 bg-transparent z-10">
                        <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              Smart Fridge AI<br />
              <span className="text-primary">Your Fridge's Potential. Unlocked by AI!</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              Discover meal ideas based on your fridge contents. Scan or upload a fridge photo and let AI inspire your next recipe.
            </p>
          
          </div>
          {/* Right: Fridge image as background */}
          <div className="flex-1 relative h-full">
            <div
              className="absolute inset-0 w-full h-full rounded-r-2xl"
              style={{
                backgroundImage: "url('/ein-kuehlschrank-voller-lebensmittel_1021598-278.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(0.98)',
              }}
            />
          </div>
        </div>
      </div>
            <div className="w-full max-w-4xl mx-auto px-0 py-10">
        {/* Section 1: Input options */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Add your ingredients
          {hasInitialGeneration && (
            <span className="ml-3 text-lg text-primary font-normal">
              ✨ Auto-generating recipes as you add ingredients
            </span>
          )}
        </h2>
        <div className="flex gap-6 mb-8">
          <div className="flex-1 bg-[#232b3e] rounded-xl border border-gray-700 flex flex-col items-center justify-center py-6 px-4 shadow hover:shadow-lg transition">
            <div className="mb-2 text-3xl text-primary"><i className="lucide lucide-image" /></div>
            <div className="font-semibold text-white mb-1">Scan your fridge or upload a photo 📷</div>
            <div className="text-gray-400 text-sm mb-4 text-center">Let AI analyze what's inside your fridge.</div>
            <ImageUpload image={image} onUpload={handleImageUpload} onNewImage={handleNewImage} analyzing={analyzing} />
          </div>
          <div className="flex-1 bg-[#232b3e] rounded-xl border border-gray-700 flex flex-col items-center justify-center py-6 px-4 shadow hover:shadow-lg transition">
            <div className="mb-2 text-3xl text-primary"><i className="lucide lucide-pencil" /></div>
            <div className="font-semibold text-white mb-1">Enter what you have ✍️</div>

            <IngredientInput ingredients={ingredients} onChange={handleIngredientsChange} />
          </div>
          
        </div>
        
        {/* ✅ Zutaten-bezogene Notifications */}
        <ContextualNotifications category="ingredients" />
        
        <div className="border-t border-gray-700 my-8" />
        {/* Section 2: Ingredient list and filters */}
        <h2 className="text-2xl font-bold text-white mb-6">Your current ingredients</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Ingredient chips: green, red, gray */}
          {[...ingredients, ...recognizedIngredients].map((ing, idx) => (
            <span
              key={idx}
              className={cn(
                "px-6 py-2 rounded-full flex items-center gap-3 font-semibold text-base",
                "bg-[#232b3e] border-2 border-lime-400 text-white shadow"
              )}
            >
              {ing}
              <button
                className="ml-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition text-white text-lg font-bold border-2 border-white"
                onClick={() => {
                  if (ingredients.includes(ing)) setIngredients(ingredients.filter(i => i !== ing));
                  if (recognizedIngredients.includes(ing)) setRecognizedIngredients(recognizedIngredients.filter(i => i !== ing));
                }}
                aria-label="Remove ingredient"
              >
                &#10005;
              </button>
            </span>
          ))}
        </div>

        {/* Add ingredient button - nur nach AI-Analyse anzeigen, zentriert unter den Zutaten */}
        {recognizedIngredients.length > 0 && (
          <div className="flex justify-center mb-6">
            <button
              className="bg-gray-700 text-white rounded-full px-6 py-3 font-semibold shadow hover:bg-gray-600 transition border border-gray-600"
              onClick={() => {
                // Focus the manual input field by triggering IngredientInput's input
                const inputEl = document.querySelector('#ingredient-manual-input') as HTMLInputElement;
                if (inputEl) inputEl.focus();
              }}
            >
              + Add ingredients AI didn't recognize
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <RecipeFilterDropdown filters={filters} onChange={handleFilterChange} />
        </div>
        {/* Error display */}
        {error && (
          <div className="mb-8 rounded-xl shadow-lg bg-gradient-to-r from-red-900 to-red-800 p-6">
            <h2 className="text-xl font-bold mb-4 text-red-200">Error</h2>
            <div className="text-red-300">{error}</div>
          </div>
        )}
        
        {/* Main recipe search button - nur anzeigen wenn keine Rezepte UND kein Error UND Zutaten vorhanden */}
        {recipes.length === 0 && !error && (ingredients.length > 0 || recognizedIngredients.length > 0) && (
          <div className="flex justify-center mb-4">
            <button
              className={cn(
                "w-full max-w-md py-3 text-lg font-bold rounded-xl",
                "bg-lime-400 text-gray-900 shadow-lg border border-lime-500",
                "hover:bg-lime-500 hover:shadow-xl transition-all duration-150",
                analyzing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              )}
              onClick={() => handleSearchRecipes(false)}
              disabled={analyzing}
            >
              FIND RECIPES
            </button>
          </div>
        )}
        
        {/* Conditional text based on recipe state */}
        {recipes.length === 0 && !error && (ingredients.length === 0 && recognizedIngredients.length === 0) && (
          <div className="text-center text-gray-400 text-sm mt-2">
            Upload ingredients to get started! Your next meal idea is waiting.
          </div>
        )}
        
        {/* ✅ Notifications wenn keine Rezepte vorhanden (z.B. während AI-Analyse) */}
        {recipes.length === 0 && notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={cn(
                  "px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform animate-in slide-in-from-top",
                  "flex items-center justify-between border-l-4 mx-auto max-w-lg",
                  notification.type === 'success' && "bg-green-600/90 text-white border-green-400",
                  notification.type === 'error' && "bg-red-600/90 text-white border-red-400",
                  notification.type === 'info' && "bg-blue-600/90 text-white border-blue-400"
                )}
              >
                <span className="text-sm font-medium">{notification.message}</span>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-3 text-white/80 hover:text-white text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}        {/* No recipes found message */}
        {recipes.length === 0 && error && (
          <div className="text-center mt-6 p-6 rounded-xl bg-yellow-900/30 border border-yellow-600">
            <div className="text-yellow-200 text-lg font-semibold mb-2">
              😔 No recipes found
            </div>
            <div className="text-yellow-300 text-sm mb-4">
              Try different ingredients or fewer filters. Your ingredients might be very specific.
            </div>
            
            {/* ✅ Action Buttons für No Results Scenario */}
            <div className="flex gap-3 justify-center">
              <button
                className={cn(
                  "px-6 py-3 rounded-xl font-bold transition-all duration-200",
                  isRefreshing 
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
                    : "bg-accent text-white hover:bg-accent/80"
                )}
                onClick={handleRefreshRecipes}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent inline-block mr-2" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    🎲 Get New Recipes (No Filters)
                  </>
                )}
              </button>
              
              <button
                className="px-6 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition"
                onClick={() => {
                  // ✅ Complete page refresh - reset ALL state
                  window.location.reload();
                }}
              >
                🗑️ Start Fresh
              </button>
            </div>
          </div>
        )}
        
        {/* Recipe results with pagination */}
        {recipes.length > 0 && (
          <>
            {/* Entferne den redundanten Erfolgstext - Notifications zeigen bereits die Information */}
            {totalPages > 1 && (
              <div className="text-center text-gray-400 text-xs mb-6">
                Page {currentPage} of {totalPages} (Showing {currentRecipes.length} of {recipes.length} recipes)
              </div>
            )}
            
            {/* ✅ Layout mit kontextuellen Notifications */}
            <div className="flex gap-6 items-start">
              {/* Recipe Results - Hauptinhalt */}
              <div className="flex-1">
                {/* ✅ Rezept-bezogene Notifications direkt vor den Rezepten */}
                <ContextualNotifications category="recipes" />
                <RecipeResults recipes={currentRecipes} />
              </div>
              
              {/* General Notifications Sidebar - Nur für allgemeine Meldungen */}
              {notifications.filter(n => n.category === 'general').length > 0 && (
                <div className="w-80 space-y-2 sticky top-20">
                  {notifications.filter(n => n.category === 'general').map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        "px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform animate-in slide-in-from-right",
                        "flex items-center justify-between border-l-4",
                        notification.type === 'success' && "bg-green-600/90 text-white border-green-400",
                        notification.type === 'error' && "bg-red-600/90 text-white border-red-400",
                        notification.type === 'info' && "bg-blue-600/90 text-white border-blue-400"
                      )}
                    >
                      <span className="text-sm font-medium">{notification.message}</span>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="ml-3 text-white/80 hover:text-white text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 mb-6">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition",
                    currentPage === 1
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-500"
                  )}
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-lg font-semibold transition",
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "bg-gray-600 text-white hover:bg-gray-500"
                      )}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition",
                    currentPage === totalPages
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-500"
                  )}
                >
                  Next →
                </button>
              </div>
            )}
            
            {/* Action buttons - nur wenn Rezepte vorhanden */}
            {recipes.length > 0 && (
              <div className="flex justify-center mt-8 gap-4">
                <button
                className={cn(
                  "px-6 py-3 rounded-xl font-bold transition-all duration-200",
                  isRefreshing 
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
                    : "bg-accent text-white hover:bg-accent/80 hover:scale-105"
                )}
                onClick={handleRefreshRecipes}
                disabled={analyzing || isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent inline-block mr-2" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    🔄 Clear Filters & Get Random Recipes
                  </>
                )}
              </button>
              
              <button
                className="px-6 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition"
                onClick={() => {
                  // ✅ Complete page refresh - reset ALL state
                  window.location.reload();
                }}
              >
                🗑️ Clear All
              </button>
              </div>
            )}
          </>
        )}

        {/* Filter Loading Anzeige */}
        {isFiltering && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm bg-gray-800/50 px-4 py-2 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-r-transparent" />
              Applying filters...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
