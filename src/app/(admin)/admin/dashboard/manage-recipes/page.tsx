"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Star, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';

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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage] = useState(10);

  const handleViewRecipe = (recipe: Recipe) => {
    // Determine the correct recipe ID for the URL
    const recipeId = recipe.spoonacularId ? `spoonacular-${recipe.spoonacularId}` : recipe._id;
    router.push(`/recipe/${recipeId}`);
  };
  
  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSource]);

  const loadRecipes = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/recipes');
      const data = await response.json();
      
      if (response.ok) {
        setRecipes(data.recipes || []);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
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
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  
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
                    <Badge variant={recipe.source === 'admin_upload' ? 'default' : 'secondary'}>
                      {recipe.source === 'admin_upload' ? 'Admin' : 
                       recipe.source === 'user_upload' ? 'User' : 'API'}
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
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
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
            <div className="flex justify-center mt-6 gap-1">
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
                // Display first page, last page, current page, and pages around current
                const pageNumber = index + 1;
                const shouldShow = 
                  pageNumber === 1 || 
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                
                if (!shouldShow) {
                  // Show dots for skipped pages, but only once
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
          )}
        </div>
      )}
    </Card>
  );
}