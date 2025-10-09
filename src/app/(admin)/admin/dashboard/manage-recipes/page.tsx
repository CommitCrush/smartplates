"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Star, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/authContext';

interface Recipe {
  _id: string;
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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');

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
  }, [user]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'all' || recipe.source === filterSource;
    return matchesSearch && matchesSource;
  });

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
              {filteredRecipes.map((recipe) => (
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
                      <Button variant="ghost" size="sm">
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
        </div>
      )}
    </Card>
  );
}