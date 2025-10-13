"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Star, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface Recipe {
  _id: string;
  spoonacularId?: number;
  title: string;
  author: string;
  authorType: string;
  status: string;
  source: string;
  averageRating: number;
  reviews: number;
  createdAt: string;
}

export default function RecipeManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage] = useState(20);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Bei Spoonacular-Rezepten direkt zur _id navigieren
  const handleViewRecipe = (recipe: Recipe) => {
    if (recipe.source === 'spoonacular_api' || recipe.spoonacularId) {
      // Wir verwenden die MongoDB _id für alle Rezepte, auch für Spoonacular
      router.push(`/recipe/${recipe._id}`);
    } else {
      // Für normale Rezepte einfach die _id
      router.push(`/recipe/${recipe._id}`);
    }
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    try {
      // Determine the correct collection and ID based on recipe source
      let apiUrl = '';
      let recipeId = '';
      
      console.log('Deleting recipe:', { 
        id: recipe._id, 
        spoonacularId: recipe.spoonacularId, 
        source: recipe.source,
        authorType: recipe.authorType 
      });

      if (recipe.spoonacularId && recipe.source === 'spoonacular_api') {
        // Spoonacular recipe - use MongoDB _id but indicate spoonacular source
        recipeId = recipe._id;
        apiUrl = `/api/admin/recipes/${recipeId}?source=spoonacular`;
        console.log('Using spoonacular deletion with MongoDB ID:', recipeId);
      } else if (recipe.source === 'user_upload' || recipe.authorType === 'user') {
        // User recipe
        recipeId = recipe._id;
        apiUrl = `/api/admin/recipes/${recipeId}?source=user`;
      } else {
        // Admin recipe or other
        recipeId = recipe._id;
        apiUrl = `/api/admin/recipes/${recipeId}?source=admin`;
      }

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Remove recipe from local state
        setRecipes(prevRecipes => prevRecipes.filter(r => r._id !== recipe._id));
        setDeleteConfirm(null);
        
        toast({
          title: 'Recipe Deleted',
          description: `"${recipe.title}" has been successfully deleted from ${result.deletedFrom || 'the database'}.`,
          variant: 'default',
        });
        
        console.log('Recipe deleted successfully:', result);
      } else {
        const error = await response.json();
        console.error('Failed to delete recipe:', error);
        
        toast({
          title: 'Delete Failed',
          description: error.message || 'Failed to delete recipe. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the recipe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteRecipe = (recipe: Recipe) => {
    setDeleteConfirm(recipe._id);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };
  
  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSource]);

  const loadRecipes = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setLoading(true);
      
      // Add cache-busting query parameter to prevent caching
      const response = await fetch(`/api/admin/recipes?_t=${Date.now()}`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (response.ok) {
        // Sort by creation date to ensure consistent ordering
        const sortedRecipes = [...(data.recipes || [])].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setRecipes(sortedRecipes);
        console.log('Loaded recipes:', sortedRecipes.length);
        console.log('Recipe sources:', sortedRecipes.reduce((acc, recipe) => {
          acc[recipe.source] = (acc[recipe.source] || 0) + 1;
          return acc;
        }, {}));
        
        // Reset to first page when new data is loaded
        setCurrentPage(1);
      } else {
        console.error('API error:', data.error);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('User state changed:', user?.email, user?.role);
    if (user?.role === 'admin') {
      console.log('Loading recipes for admin...');
      loadRecipes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filter recipes based on search and filter criteria
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'all' || recipe.source === filterSource;
    return matchesSearch && matchesSource;
  });
  
  // Calculate pagination
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / recipesPerPage));
  
  console.log('Pagination:', { 
    total: filteredRecipes.length,
    currentPage, 
    totalPages,
    showing: `${indexOfFirstRecipe + 1}-${Math.min(indexOfLastRecipe, filteredRecipes.length)} of ${filteredRecipes.length}`
  });
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recipe Management</h3>
        <Button onClick={loadRecipes} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Sources</option>
          <option value="admin_upload">Admin Uploads</option>
          <option value="user_upload">User Uploads</option>
          <option value="spoonacular_api">API Recipes</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Recipe</th>
                <th className="text-left p-2">Author</th>
                <th className="text-left p-2">Source</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Rating</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecipes.map((recipe) => (
                <tr key={recipe._id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{recipe.title}</td>
                  <td className="p-2">{recipe.author}</td>
                  <td className="p-2">
                    <Badge variant={
                      recipe.source === 'admin_upload' || recipe.authorType === 'admin' ? 'default' : 
                      recipe.source === 'spoonacular_api' ? 'outline' :
                      'secondary'
                    }>
                      {recipe.source === 'admin_upload' || recipe.authorType === 'admin' ? 'Admin' : 
                       recipe.source === 'user_upload' || recipe.authorType === 'user' ? 'User' : 
                       recipe.source === 'spoonacular_api' ? 'Spoonacular' : 'External'}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="default">{recipe.status}</Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{recipe.averageRating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewRecipe(recipe)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => confirmDeleteRecipe(recipe)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRecipes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No recipes found.
            </div>
          )}
          
          {/* Pagination */}
          {filteredRecipes.length > 0 && (
            <div className="mt-6">
              <div className="text-sm text-muted-foreground text-center mb-2">
                Showing {indexOfFirstRecipe + 1} to {Math.min(indexOfLastRecipe, filteredRecipes.length)} of {filteredRecipes.length} recipes
              </div>
              
              <div className="flex justify-center items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className="px-2"
                >
                  &lt; Previous
                </Button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  
                  // Show more pages for better navigation
                  const shouldShow = 
                    pageNumber === 1 || 
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2) ||
                    (totalPages <= 10);
                  
                  if (!shouldShow) {
                    if (pageNumber === 2 || pageNumber === totalPages - 1) {
                      return <span key={`dots-${pageNumber}`} className="px-3 py-1">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => paginate(pageNumber)}
                      className="min-w-[36px]"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-2"
                >
                  Next &gt;
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            {(() => {
              const recipe = recipes.find(r => r._id === deleteConfirm);
              return (
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    Are you sure you want to delete this recipe? This action cannot be undone.
                  </p>
                  {recipe && (
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="font-medium text-sm text-gray-900">{recipe.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Source: {recipe.source === 'spoonacular_api' ? 'Spoonacular' : 
                                recipe.source === 'user_upload' ? 'User Upload' : 
                                'Admin Recipe'} • Author: {recipe.author}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  const recipe = recipes.find(r => r._id === deleteConfirm);
                  if (recipe) {
                    handleDeleteRecipe(recipe);
                  }
                }}
              >
                Delete Recipe
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}