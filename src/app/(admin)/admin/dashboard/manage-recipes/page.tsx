"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RecipeManagementPage({ recipes = [], handleRecipeModeration, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) {
  const filteredRecipes = (recipes || []).filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
      recipe.author.toLowerCase().includes(searchTerm?.toLowerCase() || '');
    const matchesFilter = filterStatus === 'all' || recipe.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recipe Management</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Recipe</th>
              <th className="text-left p-2">Author</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Rating</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.map((recipe, index) => (
              <tr key={`${recipe._id}-${index}`} className="border-b hover:bg-muted/50">
                <td className="p-2">
                  <div>
                    <p className="font-medium">{recipe.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(recipe.createdAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                </td>
                <td className="p-2">{recipe.author}</td>
                <td className="p-2">
                  <Badge
                    variant={recipe.status === 'published' ? 'default' : 'secondary'}
                  >
                    {recipe.status}
                  </Badge>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{recipe.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({recipe.reviews})
                    </span>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/recipe/${recipe._id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {recipe.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleRecipeModeration(recipe._id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRecipeModeration(recipe._id, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRecipeModeration(recipe._id, 'remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
