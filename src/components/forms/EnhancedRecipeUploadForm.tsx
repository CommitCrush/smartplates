/**
 * Enhanced Recipe Upload Form
 * 
 * Professional recipe upload component with image handling, privacy settings,
 * and comprehensive validation that integrates with existing SmartPlates architecture
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  X, 
  Save, 
  AlertCircle, 
  Upload, 
  Globe,
  Lock,
  Clock,
  Thermometer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageUpload, { type UploadedImage } from '@/components/ui/ImageUpload';
import Image from 'next/image';

// Types for the enhanced form
interface EnhancedIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string; // "chopped", "optional", etc.
}

interface EnhancedInstruction {
  id: string;
  stepNumber: number;
  instruction: string;
  time?: number; // minutes for this step
  temperature?: number; // cooking temperature
}



export interface EnhancedRecipeFormData {
  // Basic info
  title: string;
  description: string;
  
  // Recipe details
  ingredients: EnhancedIngredient[];
  instructions: EnhancedInstruction[];
  
  // Metadata
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Categories and classification
  category: string;
  cuisine?: string;
  dietaryTags: string[];
  allergens: string[];
  customTags: string[];
  
  // Media (Cloudinary URLs)
  images: UploadedImage[];
  primaryImageUrl?: string;
  
  // Recipe source and attribution
  source?: string;
  isOriginal: boolean;
  
  // Sharing and visibility
  isPublic: boolean;
}

interface ValidationRules {
  requiredFields?: string[];
  minIngredients?: number;
  minInstructions?: number;
  maxImages?: number;
  maxImageSize?: number;
}

interface EnhancedRecipeUploadFormProps {
  onSubmit: (data: EnhancedRecipeFormData) => Promise<void>;
  isLoading?: boolean;
  user: any;
  submitButtonText?: string;
  validationRules?: ValidationRules;
}

const CATEGORIES = [
  { value: 'breakfast', label: 'Frühstück', icon: '🌅' },
  { value: 'lunch', label: 'Mittagessen', icon: '🥗' },
  { value: 'dinner', label: 'Abendessen', icon: '🍽️' },
  { value: 'dessert', label: 'Dessert', icon: '🍰' },
  { value: 'snack', label: 'Snack', icon: '🍿' },
  { value: 'appetizer', label: 'Vorspeise', icon: '🥙' },
  { value: 'beverage', label: 'Getränke', icon: '🥤' },
];

const CUISINES = [
  'Deutsch', 'Italienisch', 'Französisch', 'Spanisch', 'Griechisch',
  'Türkisch', 'Indisch', 'Chinesisch', 'Japanisch', 'Thailändisch',
  'Mexikanisch', 'Amerikanisch', 'Mediterranean', 'Asiatisch'
];

const DIETARY_TAGS = [
  'Vegetarisch', 'Vegan', 'Glutenfrei', 'Laktosefrei', 'Nussfrei',
  'Sojafrei', 'Zuckerfrei', 'Low-Carb', 'Keto', 'Paleo', 'Vollkorn'
];

const ALLERGEN_OPTIONS = [
  'Nüsse', 'Erdnüsse', 'Milchprodukte', 'Eier', 'Soja', 
  'Weizen/Gluten', 'Fisch', 'Meeresfrüchte', 'Sesam', 'Sulfite'
];

const COMMON_UNITS = [
  'g', 'kg', 'ml', 'l', 'Stück', 'TL', 'EL', 'Tasse', 'Prise', 
  'Zehe', 'Bund', 'Dose', 'Packung', 'nach Geschmack'
];

export function EnhancedRecipeUploadForm({
  onSubmit,
  isLoading = false,
  _user,
  submitButtonText = 'Rezept hochladen',
  validationRules = {}
}: EnhancedRecipeUploadFormProps) {
  // Form state
  const [formData, setFormData] = useState<EnhancedRecipeFormData>({
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'medium',
    category: 'dinner',
    cuisine: '',
    dietaryTags: [],
    allergens: [],
    customTags: [],
    images: [],
    primaryImageUrl: '',
    source: '',
    isOriginal: true,
    isPublic: false,
  });

  // Component states
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [newIngredient, setNewIngredient] = useState({
    name: '', amount: 0, unit: '', notes: ''
  });
  const [newInstruction, setNewInstruction] = useState({
    instruction: '', time: 0, temperature: 0
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  


  // Validation functions
  const validateField = (field: string, value: unknown): string => {
    const rules = validationRules;
    
    if (rules?.requiredFields?.includes(field) && !value) {
      return 'Dieses Feld ist erforderlich';
    }
    
    if (field === 'title' && value && typeof value === 'string') {
      if (value.length < 3) return 'Titel muss mindestens 3 Zeichen lang sein';
      if (value.length > 100) return 'Titel darf maximal 100 Zeichen lang sein';
    }
    
    if (field === 'description' && value && typeof value === 'string') {
      if (value.length < 10) return 'Beschreibung muss mindestens 10 Zeichen lang sein';
      if (value.length > 1000) return 'Beschreibung darf maximal 1000 Zeichen lang sein';
    }
    
    if (field === 'ingredients' && rules?.minIngredients && Array.isArray(value)) {
      if (value.length < rules.minIngredients) {
        return `Mindestens ${rules.minIngredients} Zutat(en) erforderlich`;
      }
    }
    
    if (field === 'instructions' && rules?.minInstructions && Array.isArray(value)) {
      if (value.length < rules.minInstructions) {
        return `Mindestens ${rules.minInstructions} Anweisung(en) erforderlich`;
      }
    }
    
    if (field === 'images' && rules?.maxImages && Array.isArray(value)) {
      if (value.length > rules.maxImages) {
        return `Maximal ${rules.maxImages} Bilder erlaubt`;
      }
    }
    
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate form fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof EnhancedRecipeFormData]);
      if (error) newErrors[field] = error;
    });
    
    // Validate images
    const imageError = validateField('images', uploadedImages);
    if (imageError) newErrors.images = imageError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field changes
  const handleFieldChange = <K extends keyof EnhancedRecipeFormData>(
    field: K, 
    value: EnhancedRecipeFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error if field becomes valid
    const error = validateField(field, value);
    if (!error && errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Image handling with Cloudinary
  const handleImageUpload = (uploadedImage: UploadedImage) => {
    const maxImages = validationRules.maxImages || 5;
    
    if (uploadedImages.length >= maxImages) {
      setErrors(prev => ({ ...prev, images: `Maximum ${maxImages} images allowed` }));
      return;
    }

    // Clear previous image errors
    setErrors(prev => {
      const { images: _, ...rest } = prev;
      return rest;
    });

    setUploadedImages(prev => {
      const newImages = [...prev, uploadedImage];
      
      // Set as primary if it's the first image
      if (newImages.length === 1) {
        setFormData(current => ({
          ...current,
          primaryImageUrl: uploadedImage.url,
          images: newImages
        }));
      } else {
        setFormData(current => ({
          ...current,
          images: newImages
        }));
      }
      
      return newImages;
    });
  };

  const removeImage = (imageUrl: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.url !== imageUrl);
      
      // If we removed the primary image, set the first remaining image as primary
      const wasPrimary = formData.primaryImageUrl === imageUrl;
      const newPrimaryUrl = wasPrimary && updated.length > 0 ? updated[0].url : 
                           wasPrimary ? '' : formData.primaryImageUrl;
      
      setFormData(current => ({
        ...current,
        images: updated,
        primaryImageUrl: newPrimaryUrl
      }));
      
      return updated;
    });
  };

  const setPrimaryImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      primaryImageUrl: imageUrl
    }));
  };

  // Note: Drag and drop is now handled by the ImageUpload component

  // Ingredient management
  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount && newIngredient.unit) {
      const ingredient: EnhancedIngredient = {
        id: Date.now().toString(),
        ...newIngredient
      };
      
      const updatedIngredients = [...formData.ingredients, ingredient];
      handleFieldChange('ingredients', updatedIngredients);
      setNewIngredient({ name: '', amount: 0, unit: '', notes: '' });
    }
  };

  const removeIngredient = (id: string) => {
    const updated = formData.ingredients.filter(ing => ing.id !== id);
    handleFieldChange('ingredients', updated);
  };

  // Instruction management
  const addInstruction = () => {
    if (newInstruction.instruction.trim()) {
      const instruction: EnhancedInstruction = {
        id: Date.now().toString(),
        stepNumber: formData.instructions.length + 1,
        instruction: newInstruction.instruction.trim(),
        time: newInstruction.time > 0 ? newInstruction.time : undefined,
        temperature: newInstruction.temperature > 0 ? newInstruction.temperature : undefined,
      };
      
      const updatedInstructions = [...formData.instructions, instruction];
      handleFieldChange('instructions', updatedInstructions);
      setNewInstruction({ instruction: '', time: 0, temperature: 0 });
    }
  };

  const removeInstruction = (id: string) => {
    const updated = formData.instructions
      .filter(inst => inst.id !== id)
      .map((inst, index) => ({ ...inst, stepNumber: index + 1 }));
    handleFieldChange('instructions', updated);
  };

  // Tag management
  const addTag = (tag: string, type: 'dietary' | 'allergen' | 'custom') => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    if (type === 'dietary') {
      if (!formData.dietaryTags.includes(trimmedTag)) {
        handleFieldChange('dietaryTags', [...formData.dietaryTags, trimmedTag]);
      }
    } else if (type === 'allergen') {
      if (!formData.allergens.includes(trimmedTag)) {
        handleFieldChange('allergens', [...formData.allergens, trimmedTag]);
      }
    } else {
      if (!formData.customTags.includes(trimmedTag)) {
        handleFieldChange('customTags', [...formData.customTags, trimmedTag]);
      }
    }
    
    setNewTag('');
  };

  const removeTag = (tag: string, type: 'dietary' | 'allergen' | 'custom') => {
    if (type === 'dietary') {
      handleFieldChange('dietaryTags', formData.dietaryTags.filter(t => t !== tag));
    } else if (type === 'allergen') {
      handleFieldChange('allergens', formData.allergens.filter(t => t !== tag));
    } else {
      handleFieldChange('customTags', formData.customTags.filter(t => t !== tag));
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({
        ...formData,
        images: uploadedImages
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Grundinformationen</h3>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Rezept-Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="z.B. Cremige Spaghetti Carbonara"
              className={cn("mt-1", errors.title && "border-red-500")}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Beschreibe dein Rezept: Was macht es besonders? Woher stammt es? Tipps für die Zubereitung..."
              rows={4}
              className={cn("mt-1", errors.description && "border-red-500")}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Recipe Attribution */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isOriginal"
                checked={formData.isOriginal}
                onCheckedChange={(checked) => handleFieldChange('isOriginal', checked)}
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="isOriginal">Das ist mein eigenes Originalrezept</Label>
            </div>
            
            {!formData.isOriginal && (
              <div>
                <Label htmlFor="source">Quelle des Rezepts</Label>
                <Input
                  id="source"
                  value={formData.source || ''}
                  onChange={(e) => handleFieldChange('source', e.target.value)}
                  placeholder="z.B. Omas Kochbuch, Website-Name, etc."
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Image Upload */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Recipe Images</h3>
        
        <ImageUpload
          onUpload={handleImageUpload}
          uploadType="recipe"
          maxSize={5}
          multiple={true}
          showPreview={true}
          allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
        />
        
        {/* Image Gallery */}
        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-4">Uploaded Images ({uploadedImages.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={image.publicId} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image.url}
                      alt={`Recipe image ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.primaryImageUrl === image.url ? "default" : "secondary"}
                      onClick={() => setPrimaryImage(image.url)}
                      className="text-xs"
                    >
                      {formData.primaryImageUrl === image.url ? 'Primary' : 'Set Primary'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(image.url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.primaryImageUrl === image.url && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="text-xs">
                        Primary Image
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {errors.images && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-4">
            <AlertCircle className="h-4 w-4" />
            {errors.images}
          </p>
        )}
      </Card>

      {/* Recipe Classification */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Kategorien & Eigenschaften</h3>
        
        <div className="space-y-6">
          {/* Category and Cuisine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategorie *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="cuisine">Küche (optional)</Label>
              <select
                id="cuisine"
                value={formData.cuisine || ''}
                onChange={(e) => handleFieldChange('cuisine', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">Küche wählen...</option>
                {CUISINES.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipe Properties */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Schwierigkeit</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleFieldChange('difficulty', e.target.value as 'easy' | 'medium' | 'hard')}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="easy">🟢 Einfach</option>
                <option value="medium">🟡 Mittel</option>
                <option value="hard">🔴 Schwer</option>
              </select>
            </div>

            <div>
              <Label htmlFor="prepTime">Vorbereitung (Min)</Label>
              <Input
                id="prepTime"
                type="number"
                min="0"
                max="1440"
                value={formData.prepTime}
                onChange={(e) => handleFieldChange('prepTime', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cookTime">Kochzeit (Min)</Label>
              <Input
                id="cookTime"
                type="number"
                min="0"
                max="1440"
                value={formData.cookTime}
                onChange={(e) => handleFieldChange('cookTime', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="w-32">
            <Label htmlFor="servings">Portionen</Label>
            <Input
              id="servings"
              type="number"
              min="1"
              max="50"
              value={formData.servings}
              onChange={(e) => handleFieldChange('servings', parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>

          {/* Dietary Tags */}
          <div className="space-y-3">
            <Label>Diätformen</Label>
            <p className="text-sm text-gray-600">Wählen Sie alle Diätformen aus, die auf dieses Rezept zutreffen:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIETARY_TAGS.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className={cn(
                      "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors",
                      formData.dietaryTags.includes(diet)
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-gray-300 bg-white"
                    )}
                    onClick={() => {
                      if (formData.dietaryTags.includes(diet)) {
                        removeTag(diet, 'dietary');
                      } else {
                        addTag(diet, 'dietary');
                      }
                    }}
                  >
                    {formData.dietaryTags.includes(diet) && (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <Label 
                    className="text-sm cursor-pointer"
                    onClick={() => {
                      if (formData.dietaryTags.includes(diet)) {
                        removeTag(diet, 'dietary');
                      } else {
                        addTag(diet, 'dietary');
                      }
                    }}
                  >
                    {diet}
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Selected Diets */}
            {formData.dietaryTags.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-800 font-medium">Diätformen</p>
                    <p className="text-sm text-green-700">Dieses Rezept ist geeignet für folgende Diätformen:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.dietaryTags.map((diet) => (
                        <Badge key={diet} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                          {diet}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(diet, 'dietary')}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Allergen Tags */}
          <div className="space-y-3">
            <Label>Enthält Allergene</Label>
            <p className="text-sm text-gray-600">Wählen Sie alle Allergene aus, die in diesem Rezept enthalten sind:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALLERGEN_OPTIONS.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className={cn(
                      "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors",
                      formData.allergens.includes(allergen)
                        ? "bg-red-600 border-red-600 text-white"
                        : "border-gray-300 bg-white"
                    )}
                    onClick={() => {
                      if (formData.allergens.includes(allergen)) {
                        removeTag(allergen, 'allergen');
                      } else {
                        addTag(allergen, 'allergen');
                      }
                    }}
                  >
                    {formData.allergens.includes(allergen) && (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <Label 
                    className="text-sm cursor-pointer"
                    onClick={() => {
                      if (formData.allergens.includes(allergen)) {
                        removeTag(allergen, 'allergen');
                      } else {
                        addTag(allergen, 'allergen');
                      }
                    }}
                  >
                    {allergen}
                  </Label>
                </div>
              ))}
            </div>

            {/* Selected Allergens Warning */}
            {formData.allergens.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">Allergen-Warnung</p>
                    <p className="text-sm text-red-700">Dieses Rezept enthält folgende Allergene:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.allergens.map((allergen) => (
                        <Badge key={allergen} variant="destructive" className="flex items-center gap-1">
                          {allergen}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(allergen, 'allergen')}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Tags (Optional) */}
          <div className="space-y-3">
            <Label>Eigene Tags <span className="text-gray-500 text-sm">(optional)</span></Label>
            <div className="flex gap-2">
              <Input
                placeholder="Tag hinzufügen (z.B. schnell, gesund)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newTag, 'custom');
                  }
                }}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={() => addTag(newTag, 'custom')}
                disabled={!newTag.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.customTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.customTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag, 'custom')}
                  >
                    {tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Ingredients */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Zutaten *</h3>
        
        <div className="space-y-4">
          {/* Add Ingredient Form */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <Input
              placeholder="Zutat"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
              className="md:col-span-2"
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Menge"
              value={newIngredient.amount || ''}
              onChange={(e) => setNewIngredient(prev => ({ 
                ...prev, 
                amount: parseFloat(e.target.value) || 0 
              }))}
            />
            <select
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="">Einheit</option>
              {COMMON_UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <Input
              placeholder="Notizen (optional)"
              value={newIngredient.notes || ''}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, notes: e.target.value }))}
            />
            <Button 
              type="button" 
              onClick={addIngredient}
              disabled={!newIngredient.name || !newIngredient.amount || !newIngredient.unit}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Ingredients List */}
          <div className="space-y-2">
            {formData.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex-1">
                  <span className="font-medium">
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </span>
                  {ingredient.notes && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({ingredient.notes})
                    </span>
                  )}
                </div>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeIngredient(ingredient.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {formData.ingredients.length === 0 && (
              <p className="text-muted-foreground text-sm py-4">
                Noch keine Zutaten hinzugefügt
              </p>
            )}
          </div>
          
          {errors.ingredients && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.ingredients}
            </p>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Anweisungen *</h3>
        
        <div className="space-y-4">
          {/* Add Instruction Form */}
          <div className="space-y-3">
            <Textarea
              placeholder="Anweisungsschritt beschreiben..."
              value={newInstruction.instruction}
              onChange={(e) => setNewInstruction(prev => ({ 
                ...prev, 
                instruction: e.target.value 
              }))}
              rows={3}
            />
            
            <Button 
              type="button" 
              onClick={addInstruction}
              disabled={!newInstruction.instruction.trim()}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>

          {/* Instructions List */}
          <div className="space-y-3">
            {formData.instructions.map((instruction) => (
              <div key={instruction.id} className="flex gap-3 p-3 bg-muted/50 rounded-md">
                <span className="font-medium text-primary min-w-[2rem]">
                  {instruction.stepNumber}.
                </span>
                <div className="flex-1">
                  <p>{instruction.instruction}</p>
                </div>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeInstruction(instruction.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {formData.instructions.length === 0 && (
              <p className="text-muted-foreground text-sm py-4">
                Noch keine Anweisungen hinzugefügt
              </p>
            )}
          </div>
          
          {errors.instructions && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.instructions}
            </p>
          )}
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Datenschutz & Sichtbarkeit</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 rounded-lg border">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleFieldChange('isPublic', checked)}
              className="data-[state=checked]:bg-green-600"
            />
            <div className="flex-1">
              <Label htmlFor="isPublic" className="text-base font-medium cursor-pointer">
                {formData.isPublic ? (
                  <span className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    Öffentlich teilen
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-orange-600" />
                    Privat behalten
                  </span>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                {formData.isPublic 
                  ? 'Dein Rezept wird in der öffentlichen Sammlung angezeigt und kann von anderen bewertet werden.'
                  : 'Dein Rezept bleibt privat und ist nur in deinem Profil sichtbar.'
                }
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto px-12 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {submitButtonText}
              </>
            )}
          </Button>

          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Bitte korrigiere die Fehler oben und fülle alle Pflichtfelder aus
            </p>
          )}
          
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Durch das Hochladen bestätigst du, dass du berechtigt bist, dieses Rezept zu teilen
            {formData.isPublic && ' und dass es unseren Community-Richtlinien entspricht'}.
          </p>
        </div>
      </Card>
    </form>
  );
}

export default EnhancedRecipeUploadForm;