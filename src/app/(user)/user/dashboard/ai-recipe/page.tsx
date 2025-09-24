
"use client";
import React, { useState } from "react";
import IngredientInput from '@/components/ai/IngredientInput';
import ImageUpload from '@/components/ai/ImageUpload';
import RecipeResults from '@/components/ai/RecipeResults';
import RecipeFilterDropdown from '@/components/ai/RecipeFilterDropdown';

export default function AiRecipePage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [recognizedIngredients, setRecognizedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ category?: string; diet?: string; allergy?: string }>({});
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
    const searchIngredients = [...ingredients, ...recognizedIngredients].join(',');
    const params = new URLSearchParams();
    if (searchIngredients) params.append('search', searchIngredients);
    if (filters.category) params.append('category', filters.category);
    if (filters.diet) params.append('dietaryRestrictions', filters.diet);
    if (filters.allergy) params.append('dietaryRestrictions', filters.allergy);
    try {
      const res = await fetch(`/api/recipes?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'No recipes found.');
        setRecipes([]);
        return;
      }
      setRecipes(data.recipes || []);
    } catch (err) {
      setError('Server error. Please try again later.');
      setRecipes([]);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setError(null);
    const searchIngredients = recognizedIngredients.length > 0 ? recognizedIngredients.join(',') : ingredients.join(',');
    const params = new URLSearchParams();
    if (searchIngredients) params.append('search', searchIngredients);
    if (newFilters.category) params.append('category', newFilters.category);
    if (newFilters.diet) params.append('dietaryRestrictions', newFilters.diet);
    if (newFilters.allergy) params.append('dietaryRestrictions', newFilters.allergy);
    fetch(`/api/recipes?${params.toString()}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || 'No recipes found.');
          setRecipes([]);
          return;
        }
        setRecipes(data.recipes || []);
      })
      .catch(() => {
        setError('Server error. Please try again later.');
        setRecipes([]);
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-green-700 dark:text-green-300">Smart Meal Planner: AI Recipe Suggestions</h1>
      <div className="mb-6">
  <IngredientInput ingredients={ingredients} onChange={handleIngredientsChange} />
      </div>
      <div className="mb-6">
        <ImageUpload image={image} onUpload={handleImageUpload} onNewImage={handleNewImage} analyzing={analyzing} />
      </div>
      <div className="mb-6">
        <RecipeFilterDropdown filters={filters} onChange={handleFilterChange} />
      </div>
      {/* Error display */}
      {error && (
        <div className="mb-8 rounded-xl shadow-lg bg-gradient-to-r from-red-50 to-red-200 dark:from-red-900 dark:to-red-800 p-6">
          <h2 className="text-xl font-bold mb-4 text-red-900 dark:text-red-200">Error</h2>
          <div className="text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}
      {/* Confirmed ingredients after image analysis */}
      {showConfirm && recognizedIngredients.length > 0 && (
        <div className="mb-8 rounded-xl shadow-lg bg-gradient-to-r from-green-50 to-green-200 dark:from-green-900 dark:to-green-800 p-6">
          <h2 className="text-xl font-bold mb-4 text-green-900 dark:text-green-200">Confirmed Ingredients</h2>
          <ul className="mb-2 grid grid-cols-2 gap-2">
            {recognizedIngredients.map((ing, idx) => (
              <li key={idx} className="bg-white dark:bg-green-950 rounded px-3 py-2 text-center font-medium shadow border border-green-300 dark:border-green-700">{ing}</li>
            ))}
          </ul>
          <div className="flex gap-4 mt-2">
            <button className="bg-primary text-white font-semibold rounded-lg px-4 py-2 shadow hover:bg-green-600 transition flex-1" onClick={handleSearchRecipes} disabled={analyzing}>
              Confirm ingredients & show recipes
            </button>
            <button className="btn btn-outline flex-1" onClick={handleNewImage} disabled={analyzing}>Upload new image</button>
          </div>
        </div>
      )}
      {/* Manual entry: show button to confirm and see recipes */}
      {!showConfirm && ingredients.length > 0 && !image && (
        <div className="mb-6 flex justify-center">
          <button className="bg-primary text-white font-semibold rounded-lg px-6 py-2 shadow hover:bg-green-600 transition" onClick={handleSearchRecipes} disabled={analyzing}>
            Show recipes
          </button>
        </div>
      )}
      {/* Recipe results */}
      {recipes.length > 0 && (
        <>
          <RecipeResults recipes={recipes} />
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/80 transition"
              onClick={handleSearchRecipes}
              disabled={analyzing}
            >
              Rezepte neu laden
            </button>
          </div>
        </>
      )}
    </div>
  );
}
