
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import jsPDF from 'jspdf';
import toast, { Toaster } from 'react-hot-toast'; // Import toast

// Interfaces
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

interface SavedList {
  _id: string;
  name: string;
  createdAt: string;
  ingredients: Ingredient[];
}

export default function ShoppingListPage() {
  const { data: session } = useSession();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user's primary (active) shopping list
  const fetchShoppingList = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const response = await fetch('/api/grocery-list');
      if (response.ok) {
        const data = await response.json();
        const initialIngredients = (data.ingredients || []).map((ing: Omit<Ingredient, 'checked'>) => ({ ...ing, checked: false }));
        setIngredients(initialIngredients);
      } else {
        const errorData = await response.json();
        setError(`Failed to load shopping list: ${errorData.message}`);
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching the shopping list.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Fetch all saved lists for the user
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
    fetchShoppingList();
    fetchSavedLists();
  }, [fetchShoppingList, fetchSavedLists]);

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
    const promise = fetch('/api/saved-grocery-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: listName, ingredients }),
    }).then(async (response) => {
      if (response.ok) {
        setListName('');
        fetchSavedLists(); // Refresh the list of saved lists
        return 'List saved successfully!';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save list.');
      }
    });

    toast.promise(promise, {
      loading: 'Saving list...',
      success: (message) => message,
      error: (err) => err.message,
    });
  };

  const handleLoadList = (listToLoad: SavedList) => {
    if (window.confirm(`Are you sure you want to load "${listToLoad.name}"? This will replace your current list.`)) {
      setIngredients(listToLoad.ingredients);
      toast.success(`List "${listToLoad.name}" loaded!`);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this list?')) {
      const promise = fetch(`/api/saved-grocery-lists/${listId}`, {
        method: 'DELETE',
      }).then(async (response) => {
        if (response.ok) {
          fetchSavedLists(); // Refresh the list
          return 'List deleted successfully.';
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete list.');
        }
      });

      toast.promise(promise, {
        loading: 'Deleting list...',
        success: (message) => message,
        error: (err) => err.message,
      });
    }
  };
  
  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Shopping List', 20, 20);
    doc.setFontSize(12);
    let y = 30;
    ingredients.forEach(ingredient => {
      const text = `${ingredient.checked ? '[X]' : '[ ]'} ${ingredient.name} - ${ingredient.quantity} ${ingredient.unit}`;
      const splitText = doc.splitTextToSize(text, 170);
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(splitText, 20, y);
      y += (splitText.length * 5) + 5;
    });
    doc.save('shopping-list.pdf');
  };

  if (loading) return <div className="text-center p-8">Loading your shopping list...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Main Shopping List Section */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Shopping List</h1>
        <div className="flex space-x-2">
          <button onClick={handlePrint} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Print">Print</button>
          <button onClick={handleDownloadPdf} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Download PDF">PDF</button>
        </div>
      </div>
      
      {/* List Items */}
      {ingredients.length > 0 ? (
        <ul className="space-y-4 mb-8">
          {ingredients.map((ing, i) => (
            <li key={i} onClick={() => handleToggleIngredient(i)} className={`flex items-center p-4 rounded-lg shadow-md cursor-pointer transition-all ${ing.checked ? 'bg-green-50 dark:bg-gray-700 opacity-70' : 'bg-white dark:bg-gray-800'}`}>
                <input type="checkbox" checked={ing.checked} readOnly className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mr-4 print:hidden" />
                <div className={ing.checked ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}>
                  <span className="font-semibold">{ing.name}</span>
                  <span className="text-sm"> - {ing.quantity} {ing.unit}</span>
                </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-gray-600 dark:text-gray-400">Your current shopping list is empty. Add items from a recipe!</p>}

      {/* Save List Section */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-inner print:hidden">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Save Current List</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input 
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name (e.g., Weekly Groceries)"
                  className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button onClick={handleSaveList} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Save List</button>
          </div>
      </div>

      {/* Saved Lists Section */}
      <div className="mt-12 print:hidden">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Saved Lists</h2>
        {savedLists.length > 0 ? (
          <div className="space-y-4">
            {savedLists.map(list => (
              <div key={list._id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-2 sm:mb-0">
                  <p className="font-bold text-gray-900 dark:text-white">{list.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Saved on: {new Date(list.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleLoadList(list)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold">Load</button>
                  <button onClick={() => handleDeleteList(list._id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-600 dark:text-gray-400">You haven't saved any lists yet.</p>}
      </div>
    </div>
  );
}
