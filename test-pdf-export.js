// Simple test to verify PDF export functionality with new SmartPlates logo
const testMealPlanData = {
  title: "Week of January 20, 2025",
  weekStartDate: "2025-01-20",
  days: [
    {
      date: "2025-01-20",
      breakfast: [
        { name: "Oatmeal with Berries", servings: 2, prepTime: 10 },
        { name: "Greek Yogurt", servings: 1, prepTime: 5 }
      ],
      lunch: [
        { name: "Quinoa Salad", servings: 4, prepTime: 20, cookingTime: 15 },
        { name: "Grilled Chicken Wrap", servings: 2, prepTime: 15 }
      ],
      dinner: [
        { name: "Salmon with Vegetables", servings: 3, prepTime: 25, cookingTime: 20 },
        { name: "Brown Rice", servings: 4, prepTime: 5, cookingTime: 45 }
      ],
      snacks: [
        { name: "Apple with Almond Butter", servings: 1 },
        { name: "Trail Mix", servings: 2 }
      ]
    },
    {
      date: "2025-01-21",
      breakfast: [
        { name: "Avocado Toast", servings: 2, prepTime: 10 },
        { name: "Smoothie Bowl", servings: 1, prepTime: 8 }
      ],
      lunch: [
        { name: "Mediterranean Bowl", servings: 3, prepTime: 15 },
        { name: "Hummus & Vegetables", servings: 2, prepTime: 5 }
      ],
      dinner: [
        { name: "Pasta Primavera", servings: 4, prepTime: 30, cookingTime: 25 },
        { name: "Garlic Bread", servings: 6, prepTime: 5, cookingTime: 12 }
      ],
      snacks: [
        { name: "Mixed Nuts", servings: 1 },
        { name: "Dark Chocolate", servings: 1 }
      ]
    },
    // Add more days for a complete week...
    {
      date: "2025-01-22",
      breakfast: [{ name: "Pancakes", servings: 3, prepTime: 20 }],
      lunch: [{ name: "Caesar Salad", servings: 2, prepTime: 15 }],
      dinner: [{ name: "Stir-fry Vegetables", servings: 4, prepTime: 25 }],
      snacks: [{ name: "Fruit Bowl", servings: 2 }]
    },
    {
      date: "2025-01-23",
      breakfast: [{ name: "Eggs Benedict", servings: 2, prepTime: 25 }],
      lunch: [{ name: "Sushi Bowl", servings: 1, prepTime: 30 }],
      dinner: [{ name: "Grilled Steak", servings: 2, prepTime: 15, cookingTime: 20 }],
      snacks: [{ name: "Protein Bar", servings: 1 }]
    },
    {
      date: "2025-01-24",
      breakfast: [{ name: "French Toast", servings: 4, prepTime: 20 }],
      lunch: [{ name: "Turkey Sandwich", servings: 2, prepTime: 10 }],
      dinner: [{ name: "Fish Tacos", servings: 3, prepTime: 30 }],
      snacks: [{ name: "Cheese & Crackers", servings: 2 }]
    },
    {
      date: "2025-01-25",
      breakfast: [{ name: "Bagel with Cream Cheese", servings: 2, prepTime: 5 }],
      lunch: [{ name: "Ramen Bowl", servings: 1, prepTime: 20 }],
      dinner: [{ name: "BBQ Ribs", servings: 4, prepTime: 45, cookingTime: 60 }],
      snacks: [{ name: "Ice Cream", servings: 2 }]
    },
    {
      date: "2025-01-26",
      breakfast: [{ name: "Cereal with Milk", servings: 1, prepTime: 3 }],
      lunch: [{ name: "Chicken Caesar Wrap", servings: 2, prepTime: 12 }],
      dinner: [{ name: "Pizza Night", servings: 6, prepTime: 25, cookingTime: 18 }],
      snacks: [{ name: "Popcorn", servings: 4 }]
    }
  ],
  groceryList: [
    { name: "Oats", amount: "500g", unit: "grams" },
    { name: "Mixed Berries", amount: "2", unit: "cups" },
    { name: "Greek Yogurt", amount: "1", unit: "container" },
    { name: "Quinoa", amount: "200g", unit: "grams" },
    { name: "Chicken Breast", amount: "1", unit: "kg" },
    { name: "Salmon Fillet", amount: "600g", unit: "grams" },
    { name: "Brown Rice", amount: "500g", unit: "grams" },
    { name: "Avocados", amount: "4", unit: "pieces" },
    { name: "Whole Grain Bread", amount: "1", unit: "loaf" }
  ]
};

console.log("Test meal plan data structure:");
console.log("Days:", testMealPlanData.days.length);
console.log("Total meals:", testMealPlanData.days.reduce((total, day) => {
  return total + 
    (day.breakfast?.length || 0) + 
    (day.lunch?.length || 0) + 
    (day.dinner?.length || 0) + 
    (day.snacks?.length || 0);
}, 0));
console.log("Grocery items:", testMealPlanData.groceryList.length);

// The PDF export function can be tested in the browser console by:
// 1. Go to the meal planning page
// 2. Open browser developer tools
// 3. In console, run: 
//    await exportMealPlanToPDF(testMealPlanData, { filename: 'test-smartplates-meal-plan.pdf' });

console.log("✅ Test data ready! Use this data structure to test the PDF export in browser console.");