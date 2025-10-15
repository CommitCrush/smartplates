import { RecipeCard } from '@/components/recipe/RecipeCard';

export default function RecipeResults({ recipes }: { recipes: any[] }) {
  if (!recipes.length) return <div className="text-center text-muted-foreground mt-8">Keine Rezepte gefunden.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {recipes.map((recipe: any) => (
        <div key={recipe.id || recipe._id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  );
}
