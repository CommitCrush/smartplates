
import { useState } from 'react';
import { INGREDIENTS } from '@/lib/ingredients';

export default function IngredientInput({ ingredients = [], onChange, label }: { ingredients?: string[]; onChange: (ingredients: string[]) => void; label?: string }) {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSuggestions = input.length > 0
    ? INGREDIENTS.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !ingredients.includes(s)).slice(0, 15)
    : [];
  const handleAdd = () => {
    if (input.trim() && !ingredients.includes(input.trim())) {
      onChange([...ingredients, input.trim()]);
      setInput('');
  setShowDropdown(false);
    }
  };

  const handleRemove = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    onChange(newIngredients);
  };

  return (
    <div className="relative">
      <label className="block mb-2 font-medium">{label || 'Enter ingredients'}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowDropdown(e.target.value.length > 0);
          }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="border rounded px-3 py-2 flex-1"
          placeholder="z.B. Tomaten"
          autoComplete="off"
        />
        <button type="button" className="btn btn-secondary" onClick={handleAdd}>+</button>
      </div>
      {showDropdown && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 bg-white dark:bg-gray-900 border rounded w-full mt-1 shadow-lg max-h-40 overflow-auto">
          {filteredSuggestions.map((s, idx) => (
            <li
              key={idx}
              className="px-3 py-2 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900"
              onClick={() => {
                onChange([...ingredients, s]);
                setInput('');
                setShowDropdown(false);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2 flex-wrap mt-2">
        {ingredients.map((ing, i) => (
          <span key={i} className="bg-green-100 px-3 py-1 rounded-full flex items-center gap-2">
            {ing}
            <button type="button" className="text-red-500" onClick={() => handleRemove(i)}>&times;</button>
          </span>
        ))}
      </div>
    </div>
  );
}
