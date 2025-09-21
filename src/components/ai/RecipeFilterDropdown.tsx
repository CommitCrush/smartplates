export default function RecipeFilterDropdown({ filters, onChange }: { filters: any; onChange: (filters: any) => void }) {
  const categories = [
    { value: '', label: 'Alle Kategorien' },
    { value: 'breakfast', label: 'Frühstück' },
    { value: 'lunch', label: 'Mittagessen' },
    { value: 'dinner', label: 'Abendessen' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'snack', label: 'Snack' },
  ];
  const diets = [
    { value: '', label: 'Alle Diäten' },
    { value: 'vegetarian', label: 'Vegetarisch' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten free', label: 'Glutenfrei' },
    { value: 'ketogenic', label: 'Ketogen' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'primal', label: 'Primal' },
    { value: 'whole30', label: 'Whole30' },
  ];
  const allergies = [
    { value: '', label: 'Keine Allergie' },
    { value: 'dairy', label: 'Milch' },
    { value: 'egg', label: 'Ei' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'peanut', label: 'Erdnuss' },
    { value: 'seafood', label: 'Meeresfrüchte' },
    { value: 'sesame', label: 'Sesam' },
    { value: 'soy', label: 'Soja' },
    { value: 'sulfite', label: 'Sulfite' },
    { value: 'tree nut', label: 'Schalenfrüchte' },
    { value: 'wheat', label: 'Weizen' },
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      <div>
        <label className="block mb-1">Kategorie</label>
        <select className="border rounded px-2 py-1" value={filters.category} onChange={e => onChange({ ...filters, category: e.target.value })}>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1">Diät</label>
        <select className="border rounded px-2 py-1" value={filters.diet} onChange={e => onChange({ ...filters, diet: e.target.value })}>
          {diets.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1">Allergie</label>
        <select className="border rounded px-2 py-1" value={filters.allergy} onChange={e => onChange({ ...filters, allergy: e.target.value })}>
          {allergies.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>
    </div>
  );
}
