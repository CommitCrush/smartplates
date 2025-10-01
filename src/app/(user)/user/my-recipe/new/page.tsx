/**
 * Recipe Upload Page
 * 
 * Comprehensive form for users to upload their own recipes
 * Includes image upload, ingredient management, and step-by-step instructions
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Plus, 
  Minus, 
  Clock, 
  Users, 
  ChefHat, 
  Camera,
  Save,
  X,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  id: string;
  instruction: string;
  duration?: number;
}

interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  isPublic: boolean;
  image?: string;
}

const CATEGORIES = [
  'Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American',
  'French', 'Thai', 'Greek', 'Japanese', 'Vegetarian', 'Vegan',
  'Gluten-Free', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'
];

const UNITS = [
  'cups', 'tbsp', 'tsp', 'oz', 'lbs', 'g', 'kg', 'ml', 'l',
  'pieces', 'slices', 'cloves', 'pinch', 'to taste'
];

export default function NewRecipePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    prepTime: 30,
    cookTime: 30,
    servings: 4,
    ingredients: [{ id: '1', name: '', amount: '', unit: 'cups' }],
    steps: [{ id: '1', instruction: '' }],
    tags: [],
    isPublic: true
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Ingredient management
  const addIngredient = () => {
    const newId = Date.now().toString();
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: newId, name: '', amount: '', unit: 'cups' }]
    }));
  };

  const removeIngredient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    }));
  };

  // Step management
  const addStep = () => {
    const newId = Date.now().toString();
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { id: newId, instruction: '' }]
    }));
  };

  const removeStep = (id: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== id)
    }));
  };

  const updateStep = (id: string, field: keyof Step, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    }));
  };

  // Tag management
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload recipes.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast({
        title: "Recipe title required",
        description: "Please enter a title for your recipe.",
        variant: "destructive",
      });
      return;
    }

    if (formData.ingredients.some(ing => !ing.name.trim())) {
      toast({
        title: "Complete ingredients list",
        description: "Please fill in all ingredient names.",
        variant: "destructive",
      });
      return;
    }

    if (formData.steps.some(step => !step.instruction.trim())) {
      toast({
        title: "Complete instructions",
        description: "Please fill in all cooking steps.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - replace with actual recipe upload API
      const recipeData = {
        ...formData,
        userId: session.user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate image upload if provided
      let uploadedImageUrl = '';
      if (imageFile) {
        // Mock image upload - replace with actual image service (Cloudinary, etc.)
        uploadedImageUrl = '/placeholder-recipe.svg';
        console.log('Image would be uploaded:', imageFile.name);
      }

      recipeData.image = uploadedImageUrl;

      console.log('Recipe data to be submitted:', recipeData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Recipe uploaded successfully!",
        description: `"${formData.title}" has been added to your recipes.`,
      });

      router.push('/user/my-recipe');
    } catch (error) {
      console.error('Error uploading recipe:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/user/my-recipe"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to My Recipes
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-6">
        <Upload className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Upload New Recipe</h1>
          <p className="text-gray-600">Share your favorite recipe with the SmartPlates community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipe Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your recipe title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your recipe..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Image
              </label>
              <div className="flex items-center space-x-4">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Recipe preview"
                      width={120}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Image
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Category and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Time and Servings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  Servings
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                  placeholder="Ingredient name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                {formData.ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(ingredient.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
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
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mt-2">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <textarea
                    value={step.instruction}
                    onChange={(e) => updateStep(step.id, 'instruction', e.target.value)}
                    placeholder="Describe this cooking step..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                {formData.steps.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="mt-2"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </CardContent>
        </Card>

        {/* Tags and Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Tags & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Make this recipe public (others can view and save it)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/user/my-recipe')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Upload Recipe
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}