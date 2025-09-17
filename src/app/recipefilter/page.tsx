import RecipeSearchFilter from '@/components/recipe/RecipeSearchFilter';
export default function RecipePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-neutral-900 py-12">
      <h1 className="text-4xl font-bold mb-8 text-white">Rezeptsuche & Filter</h1>
      <div className="w-full max-w-2xl">
        <RecipeSearchFilter className="bg-neutral-100 dark:bg-neutral-800 shadow-lg" />
      </div>
    </main>
  );
}
