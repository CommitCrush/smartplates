export default function RecipeFilterDropdown({ filters, onChange }: { filters: any; onChange: (filters: any) => void }) {
  const categories = [
    { value: '', label: 'All categories' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'snack', label: 'Snack' },
  ];
  const diets = [
    { value: '', label: 'All diets' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten free', label: 'Gluten free' },
    { value: 'ketogenic', label: 'Ketogenic' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'primal', label: 'Primal' },
    { value: 'whole30', label: 'Whole30' },
  ];
  const allergies = [
    { value: '', label: 'No allergy' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'egg', label: 'Egg' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'peanut', label: 'Peanut' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'sesame', label: 'Sesame' },
    { value: 'soy', label: 'Soy' },
    { value: 'sulfite', label: 'Sulfite' },
    { value: 'tree nut', label: 'Tree nut' },
    { value: 'wheat', label: 'Wheat' },
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      <div>
        <label className="block mb-1">Category</label>
        <select className="border rounded px-2 py-1" value={filters.category} onChange={e => onChange({ ...filters, category: e.target.value })}>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1">Diet</label>
        <select className="border rounded px-2 py-1" value={filters.diet} onChange={e => onChange({ ...filters, diet: e.target.value })}>
          {diets.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1">Allergy</label>
        <select className="border rounded px-2 py-1" value={filters.allergy} onChange={e => onChange({ ...filters, allergy: e.target.value })}>
          {allergies.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>
    </div>
  );
}
