// src/components/my_meal_plan/edit.tsx
'use client';
import React, { useEffect, useState } from 'react';
import GroceryListGenerator from '@/components/grocery/GroceryListGenerator';

export default function MealPlanEditor() {
  const [items, setItems] = useState<any[]>([]);
  const [mealPlanId, setMealPlanId] = useState<string>('12345'); // example
  const [showLegacyView, setShowLegacyView] = useState(false);

  const fetchList = async () => {
    const res = await fetch(`/api/grocery-list?mealPlanId=${mealPlanId}`);
    const data = await res.json();
    setItems(data.items);
  };

  const exportPdf = async () => {
    const res = await fetch(`/api/grocery-list?mealPlanId=${mealPlanId}&export=pdf`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.pdf';
    a.click();
  };

  useEffect(() => {
    if (showLegacyView) {
      fetchList();
    }
  }, [mealPlanId, showLegacyView]);

  if (showLegacyView) {
    return (
      <div>
        <div className="mb-4">
          <button 
            onClick={() => setShowLegacyView(false)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Switch to Enhanced View
          </button>
        </div>
        
        <h2>Meal Plan Grocery List (Legacy)</h2>
        <ul>
          {items.map((i) => (
            <li key={i.name}>
              {i.name}: {i.quantity} {i.unit}
            </li>
          ))}
        </ul>
        <button onClick={exportPdf}>Export to PDF</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Meal Plan Grocery List
        </h1>
        <button 
          onClick={() => setShowLegacyView(true)}
          className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Legacy View
        </button>
      </div>

      <GroceryListGenerator 
        mealPlanId={mealPlanId}
        mealPlanName="Weekly Meal Plan"
      />
    </div>
  );
}
