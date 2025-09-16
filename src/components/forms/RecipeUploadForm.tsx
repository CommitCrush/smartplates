'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecipeCategory, RecipeDifficulty, DietaryRestriction } from '@/types/recipe';

interface RecipeIngredientInput {
  name: string;
  amount: number | '';
  unit: string;
  notes?: string;
}

interface RecipeInstructionInput {
  instruction: string;
  duration?: number | '';
  temperature?: number | '';
}

interface RecipeFormData {
  title: string;
  description: string;
  category: RecipeCategory | '';
  difficulty: RecipeDifficulty | '';
  prepTime: number | '';
  cookTime: number | '';
  servings: number | '';
  cuisine: string;
  image?: string;
  video?: string;
  ingredients: RecipeIngredientInput[];
  instructions: RecipeInstructionInput[];
  dietaryRestrictions: DietaryRestriction[];
  tags: string[];
  nutrition?: {
    calories?: number | '';
    protein?: number | '';
    carbohydrates?: number | '';
    fat?: number | '';
    fiber?: number | '';
  };
}

interface RecipeUploadFormProps {
  onSubmit?: (data: RecipeFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<RecipeFormData>;
  isLoading?: boolean;
  className?: string;
}

const RECIPE_CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'appetizer', label: 'Appetizer' },
];

const RECIPE_DIFFICULTIES: { value: RecipeDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const DIETARY_RESTRICTIONS: { value: DietaryRestriction; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
];

const COMMON_UNITS = [
  'g', 'kg', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'pieces', 'slices', 'cloves', 'large', 'medium', 'small'
];

export function RecipeUploadForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  className
}: RecipeUploadFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    difficulty: initialData?.difficulty || '',
    prepTime: initialData?.prepTime || '',
    cookTime: initialData?.cookTime || '',
    servings: initialData?.servings || '',
    cuisine: initialData?.cuisine || '',
    image: initialData?.image || '',
    video: initialData?.video || '',
    ingredients: initialData?.ingredients || [{ name: '', amount: '', unit: '' }],
    instructions: initialData?.instructions || [{ instruction: '' }],
    dietaryRestrictions: initialData?.dietaryRestrictions || [],
    tags: initialData?.tags || [],
    nutrition: initialData?.nutrition || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.difficulty) newErrors.difficulty = 'Difficulty is required';
    if (!formData.prepTime) newErrors.prepTime = 'Prep time is required';
    if (!formData.cookTime && formData.cookTime !== 0) newErrors.cookTime = 'Cook time is required';
    if (!formData.servings) newErrors.servings = 'Servings is required';

    // Validate ingredients
    const validIngredients = formData.ingredients.filter(
      ing => ing.name.trim() && ing.amount && ing.unit.trim()
    );
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one complete ingredient is required';
    }

    // Validate instructions
    const validInstructions = formData.instructions.filter(
      inst => inst.instruction.trim()
    );
    if (validInstructions.length === 0) {
      newErrors.instructions = 'At least one instruction is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handlers
  const handleInputChange = (field: keyof RecipeFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredientInput, value: string | number) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const handleInstructionChange = (index: number, field: keyof RecipeInstructionInput, value: string | number) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = { ...newInstructions[index], [field]: value };
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { instruction: '' }]
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, instructions: newInstructions }));
    }
  };

  const handleDietaryRestrictionToggle = (restriction: DietaryRestriction) => {
    const isSelected = formData.dietaryRestrictions.includes(restriction);
    const newRestrictions = isSelected
      ? formData.dietaryRestrictions.filter(r => r !== restriction)
      : [...formData.dietaryRestrictions, restriction];
    
    setFormData(prev => ({ ...prev, dietaryRestrictions: newRestrictions }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleNutritionChange = (field: string, value: number | '') => {
    setFormData(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean and prepare data
    const cleanedData = {
      ...formData,
      ingredients: formData.ingredients.filter(
        ing => ing.name.trim() && ing.amount && ing.unit.trim()
      ),
      instructions: formData.instructions.filter(
        inst => inst.instruction.trim()
      )
    };

    await onSubmit?.(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Recipe Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter recipe title"
                className={cn(errors.title && 'border-destructive')}
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your recipe"
                rows={3}
                className={cn(errors.description && 'border-destructive')}
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as RecipeCategory)}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  errors.category && 'border-destructive'
                )}
              >
                <option value="">Select category</option>
                {RECIPE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty *</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value as RecipeDifficulty)}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  errors.difficulty && 'border-destructive'
                )}
              >
                <option value="">Select difficulty</option>
                {RECIPE_DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
              {errors.difficulty && <p className="text-sm text-destructive mt-1">{errors.difficulty}</p>}
            </div>

            <div>
              <Label htmlFor="prepTime">Prep Time (minutes) *</Label>
              <Input
                id="prepTime"
                type="number"
                min="1"
                value={formData.prepTime}
                onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value) || '')}
                placeholder="30"
                className={cn(errors.prepTime && 'border-destructive')}
              />
              {errors.prepTime && <p className="text-sm text-destructive mt-1">{errors.prepTime}</p>}
            </div>

            <div>
              <Label htmlFor="cookTime">Cook Time (minutes) *</Label>
              <Input
                id="cookTime"
                type="number"
                min="0"
                value={formData.cookTime}
                onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value) || '')}
                placeholder="45"
                className={cn(errors.cookTime && 'border-destructive')}
              />
              {errors.cookTime && <p className="text-sm text-destructive mt-1">{errors.cookTime}</p>}
            </div>

            <div>
              <Label htmlFor="servings">Servings *</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || '')}
                placeholder="4"
                className={cn(errors.servings && 'border-destructive')}
              />
              {errors.servings && <p className="text-sm text-destructive mt-1">{errors.servings}</p>}
            </div>

            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine"
                value={formData.cuisine}
                onChange={(e) => handleInputChange('cuisine', e.target.value)}
                placeholder="e.g., Italian, Asian, Mexican"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/recipe-image.jpg"
            />
          </div>

          <div>
            <Label htmlFor="video">Video URL</Label>
            <Input
              id="video"
              type="url"
              value={formData.video}
              onChange={(e) => handleInputChange('video', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <div className="md:col-span-2">
                <Label htmlFor={`ingredient-name-${index}`}>Name</Label>
                <Input
                  id={`ingredient-name-${index}`}
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  placeholder="Ingredient name"
                />
              </div>
              <div>
                <Label htmlFor={`ingredient-amount-${index}`}>Amount</Label>
                <Input
                  id={`ingredient-amount-${index}`}
                  type="number"
                  step="0.1"
                  min="0"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', parseFloat(e.target.value) || '')}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor={`ingredient-unit-${index}`}>Unit</Label>
                <select
                  id={`ingredient-unit-${index}`}
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Unit</option>
                  {COMMON_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  disabled={formData.ingredients.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addIngredient}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
          
          {errors.ingredients && <p className="text-sm text-destructive">{errors.ingredients}</p>}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`instruction-${index}`}>Step {index + 1}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeInstruction(index)}
                  disabled={formData.instructions.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Textarea
                id={`instruction-${index}`}
                value={instruction.instruction}
                onChange={(e) => handleInstructionChange(index, 'instruction', e.target.value)}
                placeholder="Describe this step in detail"
                rows={2}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`instruction-duration-${index}`}>Duration (minutes)</Label>
                  <Input
                    id={`instruction-duration-${index}`}
                    type="number"
                    min="0"
                    value={instruction.duration}
                    onChange={(e) => handleInstructionChange(index, 'duration', parseInt(e.target.value) || '')}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor={`instruction-temperature-${index}`}>Temperature (°C)</Label>
                  <Input
                    id={`instruction-temperature-${index}`}
                    type="number"
                    min="0"
                    value={instruction.temperature}
                    onChange={(e) => handleInstructionChange(index, 'temperature', parseInt(e.target.value) || '')}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addInstruction}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
          
          {errors.instructions && <p className="text-sm text-destructive">{errors.instructions}</p>}
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Dietary Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <Badge
                key={restriction.value}
                variant={formData.dietaryRestrictions.includes(restriction.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleDietaryRestrictionToggle(restriction.value)}
              >
                {restriction.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Information (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={formData.nutrition?.calories || ''}
                onChange={(e) => handleNutritionChange('calories', parseInt(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                value={formData.nutrition?.protein || ''}
                onChange={(e) => handleNutritionChange('protein', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                step="0.1"
                value={formData.nutrition?.carbohydrates || ''}
                onChange={(e) => handleNutritionChange('carbohydrates', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                value={formData.nutrition?.fat || ''}
                onChange={(e) => handleNutritionChange('fat', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="fiber">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                min="0"
                step="0.1"
                value={formData.nutrition?.fiber || ''}
                onChange={(e) => handleNutritionChange('fiber', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Save Recipe
            </>
          )}
        </Button>
      </div>
    </form>
  );
}