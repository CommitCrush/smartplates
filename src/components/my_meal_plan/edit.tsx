// src/components/my_meal_plan/edit.tsx
'use client';
import React, { useEffect, useState } from 'react';

export default function MealPlanEditor() {
  const [items, setItems] = useState<any[]>([]);
  const [mealPlanId, setMealPlanId] = useState<string>('12345'); // example

  const fetchList = async () => {
    const res = await fetch(`/api/grocery-list?mealPlanId=${mealPlanId}`);
    const data = await res.json();
    setItems(data.items);
  };

  const exportPdf = async () => {
    const res = await fetch(`/api/grocery-list?mealPlanId=${mealPlanId}&export=true`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.pdf';
    a.click();
  };

  useEffect(() => {
    fetchList();
  }, [mealPlanId]);

  return (
    <div>
      <h2>Meal Plan Grocery List</h2>
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
