"use client";
import React, { useState } from "react";
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
  const [filters, setFilters] = useState<{ category?: string; diet?: string; allergy?: string; difficulty?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle manual ingredient input
  const handleIngredientsChange = (newIngredients: string[]) => {
    setIngredients(newIngredients);
    setShowConfirm(false);
  };

  // Handle image upload and OpenAI Vision analysis
  const handleImageUpload = async (file: File) => {
    setImage(file);
    setAnalyzing(true);
    setError(null);
    setRecognizedIngredients([]);
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
      } else {
        // Extract only ingredient names if objects are returned
        const names = data.data.ingredients.map((ing: any) => typeof ing === 'string' ? ing : ing.name).filter(Boolean);
        setRecognizedIngredients(names);
        setShowConfirm(true);
      }
    } catch (err) {
      setError('Image analysis failed. Please try again.');
      setRecognizedIngredients([]);
      setShowConfirm(false);
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
  const handleSearchRecipes = async () => {
    setRecipes([]);
    setError(null);
    setDebugResponse(null);
    const searchIngredients = [...ingredients, ...recognizedIngredients].join(',');
    const params = new URLSearchParams();
    if (searchIngredients) params.append('search', searchIngredients);
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
        else if (res.status === 500) errorMsg = 'Internal server error. Please try again later.';
        setError(errorMsg);
        setRecipes([]);
        return;
      }
      setRecipes(data.recipes || []);
    } catch (err) {
      setError('Server error. Please try again later.');
      setRecipes([]);
      setDebugResponse({ status: 500, error: err });
    }
  };

  // Handle filter change - automatische Filterung ohne Button-Klick
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setError(null);
    setDebugResponse(null);
    
    // Nur automatisch filtern wenn bereits Rezepte vorhanden sind
    if (recipes.length === 0) return;
    
    const searchIngredients = recognizedIngredients.length > 0 ? recognizedIngredients.join(',') : ingredients.join(',');
    const params = new URLSearchParams();
    if (searchIngredients) params.append('search', searchIngredients);
    if (newFilters.category) params.append('type', newFilters.category);
    if (newFilters.diet) params.append('diet', newFilters.diet);
    if (newFilters.allergy) params.append('intolerances', newFilters.allergy);
    if (newFilters.difficulty) params.append('difficulty', newFilters.difficulty);
    
    // Automatische API-Anfrage bei Filter-Änderung
    fetch(`/api/ai/search-recipes?${params.toString()}`)
      .then(async res => {
        const data = await res.json();
        setDebugResponse({ status: res.status, data });
        if (!res.ok || data.error) {
          let errorMsg = 'No recipes found with current filters.';
          if (data.error) errorMsg = data.error;
          else if (res.status === 500) errorMsg = 'Internal server error. Please try again later.';
          setError(errorMsg);
          setRecipes([]);
          return;
        }
        setRecipes(data.recipes || []);
      })
      .catch((err) => {
        setError('Server error. Please try again later.');
        setRecipes([]);
        setDebugResponse({ status: 500, error: err });
      });
  };

  // Reset for new image
  const handleNewImage = () => {
    setImage(null);
    setRecognizedIngredients([]);
    setAnalyzing(false);
    setRecipes([]);
    setShowConfirm(false);
    setError(null);
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
        <h2 className="text-2xl font-bold text-white mb-6"> Add your ingredients</h2>
        <div className="flex gap-6 mb-8">
          <div className="flex-1 bg-[#232b3e] rounded-xl border border-gray-700 flex flex-col items-center justify-center py-6 px-4 shadow hover:shadow-lg transition">
            <div className="mb-2 text-3xl text-primary"><i className="lucide lucide-image" /></div>
            <div className="font-semibold text-white mb-1">Scan your fridge or upload a fridge photo 📷</div>
            <div className="text-gray-400 text-sm mb-4 text-center">Let AI analyze what's inside your fridge.</div>
            <ImageUpload image={image} onUpload={handleImageUpload} onNewImage={handleNewImage} analyzing={analyzing} />
          </div>
          <div className="flex-1 bg-[#232b3e] rounded-xl border border-gray-700 flex flex-col items-center justify-center py-6 px-4 shadow hover:shadow-lg transition">
            <div className="mb-2 text-3xl text-primary"><i className="lucide lucide-pencil" /></div>
            <div className="font-semibold text-white mb-1">Enter what you have  ✍️</div>

            <IngredientInput ingredients={ingredients} onChange={handleIngredientsChange} />
          </div>
          
        </div>
        <div className="border-t border-gray-700 my-8" />
        {/* Section 2: Ingredient list and filters */}
        <h2 className="text-2xl font-bold text-white mb-6"> Your current ingredient </h2>
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
              + Add ingredient your AI didn't recognize
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
        {/* Main recipe search button */}
        <div className="flex justify-center mb-4">
          <button
            className={cn(
              "w-full max-w-md py-3 text-lg font-bold rounded-xl",
              "bg-lime-400 text-gray-900 shadow-lg border border-lime-500",
              "hover:bg-lime-500 hover:shadow-xl transition-all duration-150",
              analyzing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            )}
            onClick={handleSearchRecipes}
            disabled={analyzing}
          >
            FIND RECIPES
          </button>
        </div>
        
        {/* Conditional text based on recipe state */}
        {recipes.length === 0 && !error && (
          <div className="text-center text-gray-400 text-sm mt-2">
            Upload ingredients to get started! Your next meal idea is waiting.
          </div>
        )}
        
        {/* No recipes found message */}
        {recipes.length === 0 && error && (
          <div className="text-center mt-6 p-6 rounded-xl bg-yellow-900/30 border border-yellow-600">
            <div className="text-yellow-200 text-lg font-semibold mb-2">
              😔 Keine Rezepte gefunden
            </div>
            <div className="text-yellow-300 text-sm mb-4">
              Versuchen Sie andere Zutaten oder weniger Filter. Möglicherweise sind Ihre Zutaten sehr spezifisch.
            </div>
            <button
              className="px-4 py-2 bg-yellow-600 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-500 transition"
              onClick={() => {
                setFilters({});
                setError(null);
              }}
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
        
        {/* Recipe results */}
        {recipes.length > 0 && (
          <>
            <div className="text-center text-green-400 text-sm mt-2 mb-6">
              🎉 {recipes.length} Rezepte gefunden! Perfekt für Ihre Zutaten.
            </div>
            <RecipeResults recipes={recipes} />
            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/80 transition"
                onClick={handleSearchRecipes}
                disabled={analyzing}
              >
                Reload recipes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
