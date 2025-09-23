'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Download, 
  FileText, 
  Check, 
  Square,
  DollarSign,
  Calendar,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GroceryList, GroceryItem } from '@/types/mealplan';

interface GroceryListDisplayProps {
  mealPlanId: string;
  onExport?: (format: 'pdf' | 'text') => void;
  showEstimates?: boolean;
  groupByCategory?: boolean;
  className?: string;
}

export default function GroceryListDisplay({
  mealPlanId,
  onExport,
  showEstimates = false,
  groupByCategory = true,
  className = ''
}: GroceryListDisplayProps) {
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  // Fetch grocery list data
  useEffect(() => {
    fetchGroceryList();
  }, [mealPlanId]);

  const fetchGroceryList = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        mealPlanId,
        includeEstimates: showEstimates.toString(),
        categorizeItems: groupByCategory.toString()
      });

      const response = await fetch(`/api/grocery-list?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch grocery list');
      }

      const data = await response.json();
      setGroceryList(data.groceryList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = async (itemName: string, isPurchased: boolean) => {
    if (!groceryList) return;
    
    try {
      setUpdatingItem(itemName);
      
      const response = await fetch(`/api/grocery-list?id=${groceryList._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName,
          isPurchased
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item status');
      }

      const data = await response.json();
      setGroceryList(data.groceryList);
    } catch (err) {
      console.error('Error updating item:', err);
      // Optionally show error toast here
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleExport = async (format: 'pdf' | 'text') => {
    if (!groceryList) return;

    try {
      const params = new URLSearchParams({
        mealPlanId,
        export: format,
        includeEstimates: showEstimates.toString(),
        categorizeItems: groupByCategory.toString()
      });

      const response = await fetch(`/api/grocery-list?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to export ${format}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${groceryList.name.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onExport?.(format);
    } catch (err) {
      console.error(`Error exporting ${format}:`, err);
      // Optionally show error toast here
    }
  };

  const renderGroceryItem = (item: GroceryItem) => (
    <div 
      key={item.name}
      className={`flex items-center space-x-3 p-2 rounded-lg border transition-colors ${
        item.isPurchased 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <Checkbox
        id={item.name}
        checked={item.isPurchased}
        onCheckedChange={(checked) => handleItemToggle(item.name, checked as boolean)}
        disabled={updatingItem === item.name}
        className="flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className={`flex items-center justify-between ${
          item.isPurchased ? 'line-through opacity-60' : ''
        }`}>
          <span className="font-medium text-sm">
            {item.displayName}
          </span>
          <span className="text-sm text-gray-600 ml-2">
            {item.quantity} {item.unit}
          </span>
        </div>
        
        {/* Recipe sources */}
        {item.recipes && item.recipes.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            Used in: {item.recipes.slice(0, 2).join(', ')}
            {item.recipes.length > 2 && ` +${item.recipes.length - 2} more`}
          </div>
        )}
        
        {/* Cost estimate */}
        {showEstimates && item.estimatedCost && (
          <div className="mt-1 text-xs text-green-600 flex items-center">
            <DollarSign size={12} className="mr-1" />
            ~${item.estimatedCost.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );

  const renderCategorizedItems = () => {
    if (!groceryList || !groupByCategory || !groceryList.categories) {
      return null;
    }

    return Object.entries(groceryList.categories).map(([category, items]) => (
      <div key={category} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <ShoppingCart size={18} className="mr-2 text-green-600" />
          {category}
          <Badge variant="secondary" className="ml-2 text-xs">
            {items.length}
          </Badge>
        </h3>
        <div className="space-y-2">
          {items.map(renderGroceryItem)}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Generating grocery list...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchGroceryList} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!groceryList) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">No grocery list available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <ShoppingCart className="mr-2 text-green-600" size={24} />
              {groceryList.name}
            </CardTitle>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" />
                Generated {new Date(groceryList.generatedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock size={14} className="mr-1" />
                {groceryList.itemsCount} items
              </span>
              {groceryList.purchasedCount > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {groceryList.purchasedCount}/{groceryList.itemsCount} completed
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              size="sm"
            >
              <Download size={16} className="mr-2" />
              PDF
            </Button>
            <Button
              onClick={() => handleExport('text')}
              variant="outline"
              size="sm"
            >
              <FileText size={16} className="mr-2" />
              Text
            </Button>
          </div>
        </div>

        {/* Summary */}
        {showEstimates && groceryList.totalEstimatedCost && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Estimated Total Cost
              </span>
              <span className="text-lg font-semibold text-green-600">
                ${groceryList.totalEstimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {groupByCategory && groceryList.categories ? (
          renderCategorizedItems()
        ) : (
          <div className="space-y-2">
            {groceryList.items.map(renderGroceryItem)}
          </div>
        )}

        {groceryList.isCompleted && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <Check size={24} className="mx-auto text-green-600 mb-2" />
            <p className="text-green-800 font-medium">
              All items completed! 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}