'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import toast, { Toaster } from 'react-hot-toast';

// --- Iconos SVG ---
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

interface OriginalIngredient {
  name: string;
  originalQuantity: number;
  unit: string;
}

interface SavedList {
  _id: string;
  name: string;
  createdAt: string;
  ingredients: Ingredient[];
}

interface RecipeInfo {
  title: string;
  servings: number;
}

export default function ShoppingListGridView() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [originalIngredients, setOriginalIngredients] = useState<OriginalIngredient[]>([]);
  const [recipeInfo, setRecipeInfo] = useState<RecipeInfo | null>(null);
  const [servings, setServings] = useState(1);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [listName, setListName] = useState('');
  const [activeListTitle, setActiveListTitle] = useState('My Shopping List');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);

  const fetchShoppingList = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const response = await fetch('/api/grocery-list');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched shopping list data:', data);
        const initialIngredients = (data.ingredients || []).map((ing: Omit<Ingredient, 'checked'>) => ({ ...ing, checked: false }));
        console.log('Processed ingredients:', initialIngredients);
        setIngredients(initialIngredients);
        setActiveListTitle('My Shopping List');
      } else {
        const errorData = await response.json();
        console.error('Error fetching shopping list:', errorData);
        setError(`Failed to load shopping list: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Fetch shopping list error:', err);
      setError('An unexpected error occurred while fetching the shopping list.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchSavedLists = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch('/api/saved-grocery-lists');
      if (response.ok) {
        setSavedLists(await response.json());
      } else {
        console.error('Failed to fetch saved lists');
      }
    } catch (err) {
      console.error('Error fetching saved lists:', err);
    }
  }, [session]);

  useEffect(() => {
    const currentRecipeId = searchParams.get('recipeId');
    const servingsParam = searchParams.get('servings');
    setRecipeId(currentRecipeId);

    if (currentRecipeId) {
      // When coming from a recipe, first load the current shopping list to see if ingredients were already added
      setLoading(true);
      const loadDataForRecipe = async () => {
        try {
          // First, check if there's already a shopping list
          const listResponse = await fetch('/api/grocery-list');
          if (listResponse.ok) {
            const listData = await listResponse.json();
            console.log('Loaded shopping list data:', listData);
            if (listData.ingredients && listData.ingredients.length > 0) {
              // If shopping list has ingredients, use them
              const initialIngredients = listData.ingredients.map((ing: Omit<Ingredient, 'checked'>) => ({ ...ing, checked: false }));
              console.log('Setting ingredients from shopping list:', initialIngredients);
              setIngredients(initialIngredients);
              setActiveListTitle('My Shopping List');
              setLoading(false);
              return;
            }
          }

          // If no shopping list found, load recipe details to show recipe ingredients
          const response = await fetch(`/api/recipes/${currentRecipeId}`);
          if (response.ok) {
            const data = await response.json();
            const initialServings = servingsParam ? parseInt(servingsParam, 10) : data.servings || 1;
            setRecipeInfo({ title: data.title, servings: data.servings });
            setServings(initialServings);
            setListName(data.title || '');
            setActiveListTitle(data.title || 'My Shopping List');
            
            // Handle both Spoonacular (extendedIngredients) and Community (ingredients) recipes
            const ingredientSource = data.extendedIngredients || data.ingredients || [];
            console.log('Recipe ingredients for shopping list:', ingredientSource);
            
            const baseIngredients = ingredientSource.map((ing: any) => {
              // Handle different ingredient formats
              if (typeof ing === 'string') {
                // Parse string ingredients like "1 cup flour"
                const parts = ing.trim().split(' ');
                const amount = parseFloat(parts[0]) || 1;
                const unit = parts[1] || '';
                const name = parts.slice(2).join(' ') || ing;
                
                return { 
                  name: name, 
                  originalQuantity: amount, 
                  unit: unit 
                };
              }
              
              return { 
                name: ing.name || ing.original || 'Unknown ingredient', 
                originalQuantity: ing.amount || ing.quantity || 1, 
                unit: ing.unit || '' 
              };
            });
            
            console.log('Processed base ingredients:', baseIngredients);
            setOriginalIngredients(baseIngredients);
          } else {
            setError('Failed to fetch recipe details');
          }
        } catch (err) {
          setError('Error loading shopping list data.');
        } finally {
          setLoading(false);
        }
      };
      loadDataForRecipe();
    } else {
      fetchShoppingList();
    }
    fetchSavedLists();
  }, [searchParams, session, fetchShoppingList, fetchSavedLists]);

  useEffect(() => {
    if (!recipeInfo || originalIngredients.length === 0) return;
    const scaleFactor = recipeInfo.servings > 0 ? servings / recipeInfo.servings : 1;
    const checkedMap = new Map(ingredients.map(ing => [ing.name, ing.checked]));
    setIngredients(originalIngredients.map(origIng => ({
      name: origIng.name,
      quantity: parseFloat((origIng.originalQuantity * scaleFactor).toFixed(2)),
      unit: origIng.unit,
      checked: checkedMap.get(origIng.name) || false
    })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servings, originalIngredients, recipeInfo]);

  const handleToggleIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].checked = !newIngredients[index].checked;
    setIngredients(newIngredients);
  };

  const handleSaveList = async () => {
    if (!listName.trim()) {
      toast.error('Please enter a name for your list.');
      return;
    }
    const ingredientsToSave = ingredients.filter(ing => ing.checked);
    if (ingredientsToSave.length === 0) {
        toast.error('Please select at least one ingredient to save.');
        return;
    }

    const promise = fetch('/api/saved-grocery-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: listName, ingredients: ingredientsToSave }),
    }).then(async (response) => {
      if (response.ok) {
        setListName('');
        fetchSavedLists();
        return 'List saved successfully!';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save list.');
      }
    });
    toast.promise(promise, { loading: 'Saving list...', success: (message) => message, error: (err) => err.message });
  };

  const handleLoadList = (listToLoad: SavedList) => {
    setRecipeInfo(null);
    setOriginalIngredients([]);
    setIngredients(listToLoad.ingredients.map(ing => ({ ...ing, checked: false })));
    setListName(listToLoad.name);
    setActiveListTitle(listToLoad.name);
    toast.success(`List "${listToLoad.name}" loaded!`);
  };

  const handleDeleteList = async (listId: string) => {
      const promise = fetch(`/api/saved-grocery-lists/${listId}`, { method: 'DELETE' }).then(async (response) => {
        if (response.ok) {
          fetchSavedLists();
          if (activeListTitle === listName) {
            setActiveListTitle('My Shopping List');
            setIngredients([]);
            setListName('');
          }
          return 'List deleted successfully.';
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete list.');
        }
      });
      toast.promise(promise, { loading: 'Deleting list...', success: (message) => message, error: (err) => err.message });
  };
  
  const handleEditList = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    toast('Edit functionality will be implemented in the future.');
  };

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(activeListTitle, 20, 20);
    doc.setFontSize(12);
    let y = 30;
    if (recipeInfo) {
      doc.text(`Serves: ${servings}`, 20, y); y += 10;
    }
    ingredients.forEach(ingredient => {
      const text = `${ingredient.checked ? '[X]' : '[ ]'} ${ingredient.name} - ${ingredient.quantity} ${ingredient.unit}`;
      const splitText = doc.splitTextToSize(text, 170);
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(splitText, 20, y);
      y += (splitText.length * 5) + 5;
    });
    doc.save(`${listName || 'shopping-list'}.pdf`);
  };

  if (loading) return <div className="w-full min-h-screen flex justify-center items-center bg-[#FEFEFD] dark:bg-[#373739] text-[#7D966D] dark:text-[#CDE7C0]">Loading your shopping list...</div>;
  if (error) return <div className="w-full min-h-screen flex justify-center items-center bg-[#FEFEFD] dark:bg-[#373739] text-[#F96850] dark:text-[#F16B59]">{error}</div>;

  return (
    <div className="bg-[#FEFEFD] dark:bg-[#373739] min-h-screen font-sans">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        style: {
          background: '#373739',
          color: '#CDE7C0',
        }
      }}/>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/recipe" className="inline-flex items-center text-[#AABC91] dark:text-[#C1D3AF] hover:text-[#7D966D] dark:hover:text-white transition-colors">
              <BackIcon />
              Back to Recipes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          {/* Columna Izquierda: Lista de compras */}
          <div className="lg:col-span-2 bg-[#EFF4E6] dark:bg-[#373739] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <h1 className="text-3xl font-bold text-[#7D966D] dark:text-[#CDE7C0]">{activeListTitle}</h1>
              <div className="flex items-center space-x-3">
                <button onClick={handlePrint} className="p-2 rounded-full text-[#AABC91] dark:text-[#C1D3AF] hover:bg-[#AABC91]/30 dark:hover:bg-[#C1D3AF]/30 transition-colors" title="Print">
                    <PrintIcon />
                </button>
                <button onClick={handleDownloadPdf} className="p-2 rounded-full text-[#AABC91] dark:text-[#C1D3AF] hover:bg-[#AABC91]/30 dark:hover:bg-[#C1D3AF]/30 transition-colors" title="Download PDF">
                    <PdfIcon />
                </button>
              </div>
            </div>

            {recipeInfo && (
              <div className="mb-6 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                <h2 className="text-xl font-bold text-[#7D966D] dark:text-[#CDE7C0]">{recipeInfo.title}</h2>
                <div className="flex items-center space-x-2 mt-2 mb-2">
                  <label htmlFor="servings-input" className="text-md text-[#7D966D] dark:text-[#CDE7C0]">Servings:</label>
                  <input id="servings-input" type="number" min="1" value={servings} onChange={(e) => setServings(Number(e.target.value) || 1)} className="w-20 p-2 border border-[#AABC91] dark:border-[#74766D] bg-transparent rounded-lg text-[#7D966D] dark:text-white focus:ring-[#F96850] focus:border-[#F96850] dark:focus:ring-[#F16B59] dark:focus:border-[#F16B59]" />
                </div>
                {recipeId && <Link href={`/recipe/${recipeId}`} className="text-sm text-[#F96850] dark:text-[#F16B59] hover:underline">View Full Recipe</Link>}
              </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto pr-3 -mr-3">
              {ingredients.length > 0 ? (
                <ul className="space-y-3">
                  {ingredients.map((ing, i) => (
                    <li key={i} onClick={() => handleToggleIngredient(i)} className={`flex items-center p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-300 ${ing.checked ? 'bg-[#AABC91]/50 dark:bg-[#C1D3AF]/30' : 'bg-white/80 dark:bg-black/20'}`}>
                      <div className="relative h-6 w-6 flex-shrink-0">
                          <input type="checkbox" checked={ing.checked} readOnly className="appearance-none h-6 w-6 border-2 border-[#AABC91] dark:border-[#C1D3AF] rounded-md checked:bg-[#F96850] dark:checked:bg-[#F16B59] checked:border-transparent focus:outline-none" />
                          {ing.checked && <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <div className={`ml-4 text-[#7D966D] dark:text-[#CDE7C0] transition-opacity ${ing.checked ? 'opacity-50' : 'opacity-100'}`}>
                        <span className="font-semibold">{ing.name}</span>
                        <span className="text-sm"> - {ing.quantity} {ing.unit}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <div className="flex flex-col items-center justify-center text-center p-10 bg-white/50 dark:bg-black/10 rounded-xl">
                    <p className="text-lg font-semibold text-[#7D966D] dark:text-[#CDE7C0]">Your list is empty</p>
                    <p className="text-sm text-[#AABC91] dark:text-[#C1D3AF]">Add items from your saved recipes.</p>
                  </div>
              }
            </div>

            <div className="mt-8 print:hidden">
                <h2 className="text-xl font-bold mb-4 text-[#7D966D] dark:text-[#CDE7C0]">Save Current List</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <input type="text" value={listName} onChange={(e) => setListName(e.target.value)} placeholder="Weekly Groceries, BBQ Party..." className="flex-grow p-3 border border-[#AABC91] dark:border-[#74766D] bg-white/80 dark:bg-black/20 rounded-lg text-[#7D966D] dark:text-white focus:ring-[#F96850] focus:border-[#F96850] dark:focus:ring-[#F16B59] dark:focus:border-[#F16B59] placeholder:text-[#AABC91] dark:placeholder:text-[#C1D3AF]/70" />
                <button onClick={handleSaveList} disabled={ingredients.length === 0} className="px-6 py-3 bg-[#F96850] text-white rounded-lg font-semibold hover:bg-[#F96850]/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">Save List</button>
                </div>
            </div>

          </div>

          {/* Columna Derecha: Listas guardadas */}
          <div className="lg:col-span-1">
            <div className="bg-[#EFF4E6] dark:bg-[#373739] p-6 rounded-2xl shadow-lg h-full border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-[#7D966D] dark:text-[#CDE7C0]">Your Saved Lists</h2>
                {savedLists.length > 0 ? (
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-3 -mr-3">
                    {savedLists.map(list => (
                        <div key={list._id} onClick={() => handleLoadList(list)} className="p-4 bg-white/80 dark:bg-black/20 rounded-xl flex justify-between items-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all">
                        <div>
                            <p className="font-bold text-[#7D966D] dark:text-[#CDE7C0]">{list.name}</p>
                            <p className="text-sm text-[#AABC91] dark:text-[#C1D3AF]">Saved on: {new Date(list.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <button onClick={(e) => handleEditList(e, list._id)} className="p-2 rounded-full text-[#AABC91] dark:text-[#C1D3AF] hover:bg-[#AABC91]/30 dark:hover:bg-[#C1D3AF]/30 transition-colors" title="Edit">
                                <EditIcon />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteList(list._id); }} className="p-2 rounded-full text-[#F96850] dark:text-[#F16B59] hover:bg-[#F96850]/30 dark:hover:bg-[#F16B59]/30 transition-colors" title="Delete">
                                <DeleteIcon />
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : <div className="flex flex-col items-center justify-center text-center p-10 h-full">
                    <p className="text-lg font-semibold text-[#7D966D] dark:text-[#CDE7C0]">No saved lists yet</p>
                    <p className="text-sm text-[#AABC91] dark:text-[#C1D3AF]">Your saved shopping lists will appear here.</p>
                    </div>
                }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
