import { RecipeCard } from '@/components/recipe/RecipeCard';

export default function RecipeResults({ recipes }: { recipes: any[] }) {
  if (!recipes.length) return <div className="text-center text-muted-foreground mt-8">Keine Rezepte gefunden.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {recipes.map((recipe: any) => (
        <RecipeCard key={recipe.id || recipe._id} recipe={recipe} />
      ))}
    </div>
  );
}
