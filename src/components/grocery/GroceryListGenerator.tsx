'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Settings, 
  DollarSign,
  Filter,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GroceryListOptions } from '@/types/mealplan';
import GroceryListDisplay from './GroceryListDisplay';

interface GroceryListGeneratorProps {
  mealPlanId: string;
  mealPlanName?: string;
  className?: string;
}

export default function GroceryListGenerator({
  mealPlanId,
  mealPlanName = 'Meal Plan',
  className = ''
}: GroceryListGeneratorProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<GroceryListOptions>({
    includeEstimates: false,
    categorizeItems: true,
    mergeSimilarItems: true,
    excludeStaples: false
  });
  const [groceryListGenerated, setGroceryListGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateList = async () => {
    setIsGenerating(true);
    try {
      // The GroceryListDisplay component will automatically fetch the list
      setGroceryListGenerated(true);
    } catch (error) {
      console.error('Error generating grocery list:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionChange = (key: keyof GroceryListOptions, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
    
    // If we already generated a list, regenerate with new options
    if (groceryListGenerated) {
      // The GroceryListDisplay will automatically refresh with new options
    }
  };

  const handleExport = (format: 'pdf' | 'text') => {
    console.log(`Exported grocery list as ${format}`);
    // Could show a success toast here
  };

  if (!groceryListGenerated) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 text-green-600" size={24} />
              Generate Grocery List
            </CardTitle>
            <p className="text-gray-600">
              Create a shopping list from your {mealPlanName} meal plan.
            </p>
          </CardHeader>
          
          <CardContent>
            {/* Options Panel */}
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                className="mb-4"
              >
                <Settings size={16} className="mr-2" />
                {showOptions ? 'Hide Options' : 'Show Options'}
              </Button>

              {showOptions && (
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                  <h4 className="font-medium text-gray-800">Generation Options</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-green-600" />
                        <Label htmlFor="includeEstimates">Include cost estimates</Label>
                      </div>
                      <Switch
                        id="includeEstimates"
                        checked={options.includeEstimates}
                        onCheckedChange={(checked) => handleOptionChange('includeEstimates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Filter size={16} className="text-blue-600" />
                        <Label htmlFor="categorizeItems">Group by category</Label>
                      </div>
                      <Switch
                        id="categorizeItems"
                        checked={options.categorizeItems}
                        onCheckedChange={(checked) => handleOptionChange('categorizeItems', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package size={16} className="text-purple-600" />
                        <Label htmlFor="mergeSimilarItems">Merge similar ingredients</Label>
                      </div>
                      <Switch
                        id="mergeSimilarItems"
                        checked={options.mergeSimilarItems}
                        onCheckedChange={(checked) => handleOptionChange('mergeSimilarItems', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-600">🧂</span>
                        <Label htmlFor="excludeStaples">Exclude pantry staples</Label>
                      </div>
                      <Switch
                        id="excludeStaples"
                        checked={options.excludeStaples}
                        onCheckedChange={(checked) => handleOptionChange('excludeStaples', checked)}
                      />
                    </div>
                  </div>

                  {/* Option descriptions */}
                  <div className="mt-4 text-xs text-gray-500 space-y-1">
                    <p><strong>Cost estimates:</strong> Show approximate prices for grocery items.</p>
                    <p><strong>Group by category:</strong> Organize items by grocery store sections (produce, dairy, etc.).</p>
                    <p><strong>Merge similar ingredients:</strong> Combine same ingredients with different units.</p>
                    <p><strong>Exclude pantry staples:</strong> Skip common items like salt, pepper, and oil.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateList}
              disabled={isGenerating}
              className="w-full md:w-auto"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating List...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} className="mr-2" />
                  Generate Grocery List
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Options Toggle (when list is generated) */}
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Settings size={16} className="mr-2" />
          {showOptions ? 'Hide Options' : 'Adjust Options'}
        </Button>
      </div>

      {/* Options Panel (collapsed version) */}
      {showOptions && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeEstimates-live"
                  checked={options.includeEstimates}
                  onCheckedChange={(checked) => handleOptionChange('includeEstimates', checked)}
                  size="sm"
                />
                <Label htmlFor="includeEstimates-live" className="text-sm">
                  Cost estimates
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="categorizeItems-live"
                  checked={options.categorizeItems}
                  onCheckedChange={(checked) => handleOptionChange('categorizeItems', checked)}
                  size="sm"
                />
                <Label htmlFor="categorizeItems-live" className="text-sm">
                  Categorize
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="mergeSimilarItems-live"
                  checked={options.mergeSimilarItems}
                  onCheckedChange={(checked) => handleOptionChange('mergeSimilarItems', checked)}
                  size="sm"
                />
                <Label htmlFor="mergeSimilarItems-live" className="text-sm">
                  Merge similar
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="excludeStaples-live"
                  checked={options.excludeStaples}
                  onCheckedChange={(checked) => handleOptionChange('excludeStaples', checked)}
                  size="sm"
                />
                <Label htmlFor="excludeStaples-live" className="text-sm">
                  Exclude staples
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grocery List Display */}
      <GroceryListDisplay
        mealPlanId={mealPlanId}
        showEstimates={options.includeEstimates}
        groupByCategory={options.categorizeItems}
        onExport={handleExport}
      />
    </div>
  );
}