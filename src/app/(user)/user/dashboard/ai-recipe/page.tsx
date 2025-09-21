"use client";
import IngredientInput from '@/components/ai/IngredientInput';
import ImageUpload from '@/components/ai/ImageUpload';
import RecipeResults from '@/components/ai/RecipeResults';
import RecipeFilterDropdown from '@/components/ai/RecipeFilterDropdown';
import { useState } from 'react';

export default function AIRecipePage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recognizedIngredients, setRecognizedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filters, setFilters] = useState({ category: '', diet: '', allergy: '' });
  const [showConfirm, setShowConfirm] = useState(false);

  // Handler for ingredient input
  const handleIngredientsChange = (newIngredients: string[]) => {
    setIngredients(newIngredients);
  };

  // Handler for image upload
  const handleImageUpload = async (file: File) => {
    setImage(file);
    setAnalyzing(true);
    setShowConfirm(false);
    // Bild in Base64 umwandeln und als JSON senden
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const res = await fetch('/api/ai/analyze-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64 })
      });
      const data = await res.json();
      console.log('API Response:', data);
      let detected: string[] = [];
      const ingredientsArr = data.data?.ingredients || [];
      if (Array.isArray(ingredientsArr)) {
        if (typeof ingredientsArr[0] === 'string') {
          detected = ingredientsArr as string[];
        } else if (typeof ingredientsArr[0] === 'object' && ingredientsArr[0]?.name) {
          detected = ingredientsArr.map((ing: any) => ing.name);
        }
      }
      setRecognizedIngredients(detected);
      setShowConfirm(true);
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  // Handler for recipe search
  const handleSearchRecipes = async () => {
  setRecipes([]);
  // Use 'search' param for ingredients, and map filters to API params
  const searchIngredients = [...ingredients, ...recognizedIngredients].join(',');
  const params = new URLSearchParams();
  if (searchIngredients) params.append('search', searchIngredients);
  if (filters.category) params.append('category', filters.category);
  if (filters.diet) params.append('dietaryRestrictions', filters.diet);
  if (filters.allergy) params.append('dietaryRestrictions', filters.allergy);
  const res = await fetch(`/api/recipes?${params.toString()}`);
  const data = await res.json();
  setRecipes(data.recipes || []);
  };

  // Handler for filter change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Always trigger recipe search when filter changes
    const searchIngredients = recognizedIngredients.length > 0 ? recognizedIngredients.join(',') : ingredients.join(',');
    const params = new URLSearchParams();
    if (searchIngredients) params.append('search', searchIngredients);
    if (newFilters.category) params.append('category', newFilters.category);
    if (newFilters.diet) params.append('dietaryRestrictions', newFilters.diet);
    if (newFilters.allergy) params.append('dietaryRestrictions', newFilters.allergy);
    fetch(`/api/recipes?${params.toString()}`)
      .then(res => res.json())
      .then(data => setRecipes(data.recipes || []));
  };

  // Handler for new image
  const handleNewImage = () => {
  setImage(null);
  setRecognizedIngredients([]);
  setAnalyzing(false);
  setRecipes([]);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-primary">Rezeptideen aus deinem Kühlschrank oder Zutaten einscannen oder eingeben</h1>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1">
          <IngredientInput ingredients={ingredients} onChange={handleIngredientsChange} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <ImageUpload image={image} onUpload={handleImageUpload} onNewImage={handleNewImage} analyzing={analyzing} />
        </div>
      </div>
      {/* Image upload: show confirmation options */}
      {showConfirm && (
        <div className="mb-6 rounded-xl shadow-lg bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 p-6">
          <h2 className="text-xl font-bold mb-4 text-green-900 dark:text-green-200">Analysierte Zutaten</h2>
          {recognizedIngredients.length > 0 ? (
            <>
              <ul className="mb-4 grid grid-cols-2 gap-2">
                {recognizedIngredients.map((ing: string, idx: number) => (
                  <li key={idx} className="bg-white dark:bg-green-950 rounded px-3 py-2 text-center font-medium shadow border border-green-300 dark:border-green-700">{ing}</li>
                ))}
              </ul>
              <div className="flex gap-4 mt-2">
                <button className="bg-primary text-white font-semibold rounded-lg px-4 py-2 shadow hover:bg-green-600 transition flex-1" onClick={async () => {
                  setShowConfirm(false);
                  setRecipes([]);
                  // Immediately fetch recipes after confirmation
                  const searchIngredients = recognizedIngredients.join(',');
                  const params = new URLSearchParams();
                  if (searchIngredients) params.append('search', searchIngredients);
                  if (filters.category) params.append('category', filters.category);
                  if (filters.diet) params.append('dietaryRestrictions', filters.diet);
                  if (filters.allergy) params.append('dietaryRestrictions', filters.allergy);
                  const res = await fetch(`/api/recipes?${params.toString()}`);
                  const data = await res.json();
                  setIngredients([]); // Do not update input field
                  setRecipes(data.recipes || []);
                }}>Zutaten übernehmen & Rezepte anzeigen</button>
                <button className="btn btn-outline flex-1" onClick={handleNewImage}>Neues Bild hochladen</button>
                <button className="border border-green-500 text-green-700 dark:text-green-200 bg-white dark:bg-green-950 rounded-lg px-4 py-2 shadow hover:bg-green-100 dark:hover:bg-green-800 transition flex-1" onClick={handleNewImage}>Neues Bild hochladen</button>
              </div>
            </>
          ) : (
            <div className="text-red-600 mb-2">Keine Zutaten erkannt. Bitte ein anderes Bild hochladen.</div>
          )}
        </div>
      )}
      {/* Manual entry: show button to confirm and see recipes */}
      {!showConfirm && ingredients.length > 0 && !image && (
        <div className="mb-6 flex justify-center">
          <button className="bg-primary text-white font-semibold rounded-lg px-6 py-2 shadow hover:bg-green-600 transition" onClick={handleSearchRecipes} disabled={analyzing}>
            Rezepte anzeigen
          </button>
        </div>
      )}
      {/* Show confirmed ingredients only after search or confirmation */}
      {recipes.length > 0 && (
        <div className="mb-8 rounded-xl shadow-lg bg-gradient-to-r from-green-50 to-green-200 dark:from-green-900 dark:to-green-800 p-6">
          <h2 className="text-xl font-bold mb-4 text-green-900 dark:text-green-200">Bestätigte Zutaten</h2>
          <ul className="mb-2 grid grid-cols-2 gap-2">
            {recognizedIngredients.map((ing: string, idx: number) => (
              <li key={idx} className="bg-white dark:bg-green-950 rounded px-3 py-2 text-center font-medium shadow border border-green-300 dark:border-green-700">{ing}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Only show recipe results after search/confirmation */}
      {recipes.length > 0 && (
        <div>
          <RecipeFilterDropdown filters={filters} onChange={handleFilterChange} />
          <RecipeResults recipes={recipes} />
        </div>
      )}
    </div>
  );
}
