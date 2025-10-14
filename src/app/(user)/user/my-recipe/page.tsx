/**
 * User My Recipes Page
 *
 * Shows all user's planned, uploaded, and saved recipes in organized tabs
 */

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Heart,
  Upload,
  Calendar,
  Plus,
  Search,
  Filter,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/authContext";
import { useMealPlanSync } from "@/hooks/useMealPlanSync";

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cookingTime: number;
  difficulty?: "easy" | "medium" | "hard"; // Make optional since we calculate it dynamically
  category: string;
  isPublic: boolean;
  createdAt: string;
  plannedDate?: string;
  weekRange?: string;
  mealType?: string;
  servings?: number;
  notes?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  recipeCount: number;
  createdAt: string;
}

type TabType = "uploaded" | "saved" | "planned" | "shopping-list";

export default function MyRecipesPage() {
  const { data: _session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("uploaded");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const {
    favorites,
    refetch: fetchFavorites,
    toggleFavorite,
    isFavorited,
  } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { syncCounter, triggerSync } = useMealPlanSync();
  const [data, setData] = useState<{
    uploaded: Recipe[];
    saved: Recipe[];
    planned: Recipe[];
    "shopping-list": ShoppingList[];
  }>({
    uploaded: [],
    saved: [],
    planned: [],
    "shopping-list": [],
  });
  const [loading, setLoading] = useState(true);

  // Helper function to calculate total time like in RecipeCard
  const getTotalTime = (recipe: Recipe) => {
    // Prioritize readyInMinutes to match filterByDifficulty logic
    if ((recipe as any).readyInMinutes) return (recipe as any).readyInMinutes;
    if (recipe.cookingTime) return recipe.cookingTime; // Local recipe field
    if ((recipe as any).totalTime) return (recipe as any).totalTime;
    if ((recipe as any).preparationMinutes && (recipe as any).cookingMinutes) {
      return (
        (recipe as any).preparationMinutes + (recipe as any).cookingMinutes
      );
    }
    return 30; // Default fallback
  };

  // Helper function to calculate difficulty exactly like filterByDifficulty function
  const getDifficultyFromTime = (
    cookTime: number
  ): "easy" | "medium" | "hard" => {
    if (cookTime <= 15) return "easy";
    if (cookTime > 15 && cookTime < 35) return "medium";
    if (cookTime >= 35) return "hard";
    return "medium"; // fallback
  };

  // Helper function to extract actual recipe ID from planned recipe composite IDs
  const getActualRecipeId = (recipeId: string) => {
    // Format: planned-{actualRecipeId}-{date}-{mealType}-{index}
    // Example: planned-68eaba68ecac730ee175d7b1-2025-10-12-breakfast-0
    if (recipeId.startsWith("planned-")) {
      const parts = recipeId.split("-");
      if (parts.length >= 3) {
        // Check if it's already a spoonacular recipe: planned-spoonacular-715421-...
        if (parts[1] === "spoonacular" && parts.length >= 4) {
          return `spoonacular-${parts[2]}`;
        }

        // For MongoDB ObjectIds, they might represent Spoonacular recipes
        // but we need the actual Spoonacular ID which should be in the recipe data
        const extractedId = parts[1];
        console.log("🔍 Extracting recipe ID:", {
          original: recipeId,
          extracted: extractedId,
        });

        // For now, return the extracted ID and let the planned recipe data
        // provide the correct recipeId through the originalRecipeId field
        return extractedId;
      }
    }
    return recipeId;
  };

  // Handle favorite click for saved recipes (remove when clicked)
  const handleFavoriteClick = async (e: React.MouseEvent, recipe: Recipe) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated && activeTab === "saved") {
      await toggleFavorite(
        recipe.id,
        recipe.title,
        recipe.image || "/placeholder-recipe.svg"
      );
      // Refresh data to update the saved recipes list
      loadUserData();
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      loadUserData();
    }
  }, [status, router]);

  // 🔄 SYNC: Reload data when meal plans change on other pages
  useEffect(() => {
    if (status === "authenticated" && syncCounter > 0) {
      console.log('🔄 My Recipes: Syncing data due to meal plan changes');
      loadUserData();
    }
  }, [syncCounter, status]);

  // Update saved recipes when favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      setData((prevData) => ({
        ...prevData,
        saved: favorites.map((fav) => ({
          id: fav.recipeId,
          title: fav.recipeTitle || "Recipe",
          description: "",
          image: fav.recipeImage || "/placeholder-recipe.svg",
          cookingTime: 30,
          // Don't hard-code difficulty - let it be calculated
          category: "Various",
          isPublic: true,
          createdAt: fav.createdAt,
        })),
      }));
    } else if (favorites.length === 0 && status === "authenticated") {
      // Clear saved recipes if no favorites
      setData((prevData) => ({
        ...prevData,
        saved: [],
      }));
    }
  }, [favorites, status]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      let plannedRecipes: Recipe[] = [];

      try {
        const plannedResponse = await fetch("/api/users/planned-recipes");
        if (plannedResponse.ok) {
          const plannedData = await plannedResponse.json();
          let rawPlannedRecipes = plannedData.data || [];

          const seenIds = new Set();
          plannedRecipes = rawPlannedRecipes.filter((recipe: Recipe) => {
            if (seenIds.has(recipe.id)) {
              console.warn(
                `Duplicate recipe ID found: ${recipe.id}, skipping duplicate`
              );
              return false;
            }
            seenIds.add(recipe.id);
            return true;
          });
        }
      } catch (error) {
        console.error("Error loading planned recipes:", error);
      }

      // Load favorites
      await fetchFavorites();

      const mockData = {
        uploaded: [
          {
            id: "1",
            title: "My Famous Pasta Carbonara",
            description: "A family recipe passed down for generations",
            image: "/placeholder-recipe.svg",
            cookingTime: 25,
            // Don't hard-code difficulty - let it be calculated
            category: "Italian",
            isPublic: true,
            createdAt: "2024-09-20",
          },
          {
            id: "2",
            title: "Homemade Pizza Margherita", 
            description: "Fresh mozzarella and basil on homemade dough",
            image: "/placeholder-recipe.svg",
            cookingTime: 45,
            // Don't hard-code difficulty - let it be calculated
            category: "Italian",
            isPublic: false,
            createdAt: "2024-09-18",
          },
        ],
        saved: favorites.map((fav) => ({
          id: fav.recipeId,
          title: fav.recipeTitle || "Recipe",
          description: "",
          image: fav.recipeImage || "/placeholder-recipe.svg",
          cookingTime: 30, // This might be the issue - hard-coded cookingTime  
          // Don't hard-code difficulty - let it be calculated dynamically
          category: "Various",
          isPublic: true,
          createdAt: fav.createdAt,
        })),
        planned: plannedRecipes.map((recipe) => {
          const totalTime = getTotalTime(recipe);
          const calculatedDifficulty = getDifficultyFromTime(totalTime);

          return {
            ...recipe,
            // Override difficulty and time calculation for proper display
            difficulty: calculatedDifficulty, // Force calculated difficulty
            cookingTime: totalTime,
          };
        }),
        "shopping-list": [
          {
            id: "sl1",
            name: "Weekly Groceries",
            recipeCount: 5,
            createdAt: "2024-09-21",
          },
          {
            id: "sl2",
            name: "Dinner Party Prep",
            recipeCount: 3,
            createdAt: "2024-09-20",
          },
        ],
      };

      setData(mockData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = data[activeTab].filter((item) => {
    if (activeTab === "shopping-list") {
      const shoppingList = item as ShoppingList;
      return shoppingList.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    const recipe = item as Recipe;
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.description &&
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" || recipe.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Italian", "Indian", "Mediterranean", "Dessert"];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Recipes</h1>
            <p className="text-gray-600">
              Manage your uploaded, saved, and planned recipes
            </p>
          </div>
        </div>
        <Link
          href="/user/my_added_recipes/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Recipe</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("uploaded")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "uploaded"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Uploaded ({data.uploaded.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "saved"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Saved ({data.saved.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("planned")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "planned"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Planned ({data.planned.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("shopping-list")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "shopping-list"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>My Shopping List ({data["shopping-list"].length})</span>
        </button>
      </div>

      {/* Content Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "shopping-list"
            ? (filteredItems as ShoppingList[]).map((list) => (
                <div
                  key={list.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 flex items-center justify-center bg-gray-100 rounded-t-lg">
                    <ShoppingCart className="h-16 w-16 text-gray-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {list.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {list.recipeCount} recipes
                    </p>
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <span>
                          Created{" "}
                          {new Date(list.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        href={`#`}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        View List
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            : (filteredItems as Recipe[]).map((recipe) => {
                const totalTime = getTotalTime(recipe);
                // Always calculate difficulty based on time, regardless of recipe source
                const calculatedDifficulty = getDifficultyFromTime(totalTime);

                // For planned recipes, check if there's a separate recipeId field
                let actualRecipeId = recipe.id;
                if (recipe.id.startsWith("planned-")) {
                  // Try to get the original recipeId if available from multiple possible fields
                  const originalRecipeId =
                    (recipe as any).recipeId ||
                    (recipe as any).originalRecipeId ||
                    (recipe as any).spoonacularId ||
                    (recipe as any).sourceRecipeId;

                  if (originalRecipeId) {
                    // If we have an original recipe ID, use it
                    actualRecipeId = originalRecipeId;
                    console.log("✅ Using original recipe ID:", {
                      compositeId: recipe.id,
                      originalId: originalRecipeId,
                    });
                  } else {
                    // Fallback to parsing the composite ID
                    actualRecipeId = getActualRecipeId(recipe.id);
                    console.log(
                      "⚠️ No original recipe ID found, using parsed ID:",
                      { compositeId: recipe.id, parsedId: actualRecipeId }
                    );
                  }
                }

                return (
                  <div
                    key={recipe.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow relative"
                  >
                    {/* Favorite Button for Saved Recipes - Red and removes on click */}
                    {activeTab === "saved" && isAuthenticated && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFavoriteClick(e, recipe)}
                        className={cn(
                          "absolute top-2 right-2 z-10 w-8 h-8 p-0 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 text-red-500 hover:text-red-600"
                        )}
                      >
                        <Heart className="w-4 h-4 fill-current transition-all duration-200" />
                      </Button>
                    )}

                    <Link href={`/recipe/${actualRecipeId}`}>
                      <div className="relative h-48">
                        <Image
                          src={recipe.image}
                          alt={recipe.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        {activeTab === "uploaded" && (
                          <div className="absolute top-2 left-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                recipe.isPublic
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {recipe.isPublic ? "Public" : "Private"}
                            </span>
                          </div>
                        )}
                        {activeTab === "planned" && recipe.plannedDate && (
                          <div className="absolute top-2 left-2 space-y-1">
                            <span className="block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {new Date(
                                recipe.plannedDate
                              ).toLocaleDateString()}
                            </span>
                            {recipe.mealType && (
                              <span className="block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                {recipe.mealType}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                          {recipe.title}
                        </h3>

                        {/* {activeTab === 'planned' && recipe.notes && (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <span className="font-medium text-yellow-800">Note:</span>
                          <span className="text-yellow-700 ml-1">{recipe.notes}</span>
                        </div>
                      )} */}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-500">
                              {totalTime} min
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                calculatedDifficulty
                              )}`}
                            >
                              {calculatedDifficulty}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {activeTab === "planned" && recipe.weekRange ? (
                              <div>
                                <div>{recipe.weekRange}</div>
                                <div>
                                  Added{" "}
                                  {new Date(
                                    recipe.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                {recipe.servings && (
                                  <div className="mt-1 text-blue-600">
                                    {recipe.servings} serving
                                    {recipe.servings !== 1 ? "s" : ""}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span>
                                Added{" "}
                                {new Date(
                                  recipe.createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === "shopping-list"
              ? "No shopping lists found"
              : "No recipes found"}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === "uploaded" &&
              "You haven't uploaded any recipes yet."}
            {activeTab === "saved" && "You haven't saved any recipes yet."}
            {activeTab === "planned" && "You don't have any planned recipes."}
            {activeTab === "shopping-list" &&
              "You don't have any shopping lists yet."}
          </p>
          {activeTab === "uploaded" && (
            <Link
              href="/user/my_added_recipes/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Your First Recipe</span>
            </Link>
          )}
          {activeTab === "saved" && (
            <Link
              href="/recipe"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Recipes</span>
            </Link>
          )}
          {activeTab === "planned" && (
            <Link
              href="/user/meal-plan/current"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Start Meal Planning</span>
            </Link>
          )}
          {activeTab === "shopping-list" && (
            <Link
              href="#" // Link to a page to create a new shopping list
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Shopping List</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
