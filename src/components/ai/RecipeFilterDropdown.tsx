import { ChefHat, Leaf, AlertTriangle, Clock } from 'lucide-react';

export default function RecipeFilterDropdown({ filters, onChange }: { filters: any; onChange: (filters: any) => void }) {
  const categories = [
    { value: '', label: '🍽️ All Categories' },
    { value: 'breakfast', label: '🥞 Breakfast' },
    { value: 'lunch', label: '🥗 Lunch' },
    { value: 'dinner', label: '🍖 Dinner' },
    { value: 'dessert', label: '🍰 Dessert' },
    { value: 'snack', label: '🥨 Snack' },
    { value: 'appetizer', label: '🥙 Appetizer' },
  ];
  const diets = [
    { value: '', label: '🌱 All Diets' },
    { value: 'vegetarian', label: '🥬 Vegetarian' },
    { value: 'vegan', label: '🌿 Vegan' },
    { value: 'gluten free', label: '🌾 Gluten Free' },
    { value: 'ketogenic', label: '🥑 Ketogenic' },
    { value: 'paleo', label: '🥩 Paleo' },
    { value: 'dairy-free', label: '🥛 Dairy Free' },
  ];
  const allergies = [
    { value: '', label: '⚠️ No Allergies' },
    { value: 'dairy', label: '🧀 No Dairy' },
    { value: 'egg', label: '🥚 No Eggs' },
    { value: 'gluten', label: '🍞 No Gluten' },
    { value: 'peanut', label: '🥜 No Peanuts' },
    { value: 'seafood', label: '🦐 No Seafood' },
    { value: 'sesame', label: '🌰 No Sesame' },
    { value: 'soy', label: '🫘 No Soy' },
    { value: 'sulfite', label: '🧪 No Sulfites' },
    { value: 'tree nut', label: '🌰 No Tree Nuts' },
    { value: 'wheat', label: '🌾 No Wheat' },
  ];

  const difficulties = [
    { value: '', label: '⏰ All Difficulties' },
    { value: 'easy', label: '⚡ Easy (≤30 min)' },
    { value: 'medium', label: '🔥 Medium (30-60 min)' },
    { value: 'hard', label: '💪 Hard (>60 min)' },
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="relative">
        <select 
          className="appearance-none bg-[#232b3e] border border-gray-600 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:border-primary hover:border-gray-500 transition" 
          value={filters.category} 
          onChange={e => onChange({ ...filters, category: e.target.value })}
        >
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <ChefHat className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      <div className="relative">
        <select 
          className="appearance-none bg-[#232b3e] border border-gray-600 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:border-primary hover:border-gray-500 transition" 
          value={filters.diet} 
          onChange={e => onChange({ ...filters, diet: e.target.value })}
        >
          {diets.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <Leaf className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      <div className="relative">
        <select 
          className="appearance-none bg-[#232b3e] border border-gray-600 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:border-primary hover:border-gray-500 transition" 
          value={filters.allergy} 
          onChange={e => onChange({ ...filters, allergy: e.target.value })}
        >
          {allergies.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <AlertTriangle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      <div className="relative">
        <select 
          className="appearance-none bg-[#232b3e] border border-gray-600 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:border-primary hover:border-gray-500 transition" 
          value={filters.difficulty} 
          onChange={e => onChange({ ...filters, difficulty: e.target.value })}
        >
          {difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
