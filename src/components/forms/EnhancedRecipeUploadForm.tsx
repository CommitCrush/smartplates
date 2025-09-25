/**
 * Enhanced Recipe Upload Form
 * 
 * Professional recipe upload component with image handling, privacy settings,
 * and comprehensive validation that integrates with existing SmartPlates architecture
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  X, 
  Save, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon,
  Globe,
  Lock,
  Users,
  Camera,
  Trash2,
  Clock,
  Thermometer
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface RecipeImage {
  id: string;
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface EnhancedRecipeFormData {
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
  customTags: string[];
  
  // Media
  images: File[];
  
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

const COMMON_UNITS = [
  'g', 'kg', 'ml', 'l', 'Stück', 'TL', 'EL', 'Tasse', 'Prise', 
  'Zehe', 'Bund', 'Dose', 'Packung', 'nach Geschmack'
];

export function EnhancedRecipeUploadForm({
  onSubmit,
  isLoading = false,
  user,
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
    prepTime: 30,
    cookTime: 30,
    difficulty: 'medium',
    category: 'dinner',
    cuisine: '',
    dietaryTags: [],
    customTags: [],
    images: [],
    source: '',
    isOriginal: true,
    isPublic: false,
  });

  // Component states
  const [images, setImages] = useState<RecipeImage[]>([]);
  const [newIngredient, setNewIngredient] = useState({
    name: '', amount: 0, unit: '', notes: ''
  });
  const [newInstruction, setNewInstruction] = useState({
    instruction: '', time: 0, temperature: 0
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const imageError = validateField('images', images.map(img => img.file));
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

  // Image handling
  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const maxImages = validationRules.maxImages || 5;
    const maxSize = validationRules.maxImageSize || 5 * 1024 * 1024;
    
    const newImages: RecipeImage[] = [];
    
    Array.from(files).slice(0, maxImages - images.length).forEach((file) => {
      if (file.size > maxSize) {
        alert(`Datei ${file.name} ist zu groß (maximal 5MB)`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert(`Datei ${file.name} ist kein Bild`);
        return;
      }
      
      const imageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        id: imageId,
        file,
        preview,
        isPrimary: images.length === 0 && newImages.length === 0
      });
    });
    
    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      
      // Update form data
      const allFiles = [...images.map(img => img.file), ...newImages.map(img => img.file)];
      handleFieldChange('images', allFiles);
    }
  }, [images, validationRules, handleFieldChange]);

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      
      // If we removed the primary image, make the first remaining image primary
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      
      // Update form data
      handleFieldChange('images', updated.map(img => img.file));
      
      return updated;
    });
  };

  const setPrimaryImage = (imageId: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })));
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  }, [handleImageUpload]);

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
  const addTag = (tag: string, type: 'dietary' | 'custom') => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    if (type === 'dietary') {
      if (!formData.dietaryTags.includes(trimmedTag)) {
        handleFieldChange('dietaryTags', [...formData.dietaryTags, trimmedTag]);
      }
    } else {
      if (!formData.customTags.includes(trimmedTag)) {
        handleFieldChange('customTags', [...formData.customTags, trimmedTag]);
      }
    }
    
    setNewTag('');
  };

  const removeTag = (tag: string, type: 'dietary' | 'custom') => {
    if (type === 'dietary') {
      handleFieldChange('dietaryTags', formData.dietaryTags.filter(t => t !== tag));
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
        images: images.map(img => img.file)
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
        <h3 className="text-lg font-semibold mb-6">Bilder hochladen</h3>
        
        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-gray-300",
              images.length >= (validationRules.maxImages || 5) && "opacity-50 pointer-events-none"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
            
            <div className="space-y-3">
              <Camera className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium">Bilder hinzufügen</p>
                <p className="text-sm text-gray-500">
                  Ziehe Bilder hierher oder{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    wähle Dateien aus
                  </button>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Maximal {validationRules.maxImages || 5} Bilder, je bis zu 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.preview}
                      alt="Recipe preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={image.isPrimary ? "default" : "secondary"}
                      onClick={() => setPrimaryImage(image.id)}
                      className="text-xs"
                    >
                      {image.isPrimary ? 'Hauptbild' : 'Als Hauptbild'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="text-xs">
                        Hauptbild
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {errors.images && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.images}
            </p>
          )}
        </div>
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
            <Label>Diätformen & Allergien</Label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={formData.dietaryTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (formData.dietaryTags.includes(tag)) {
                      removeTag(tag, 'dietary');
                    } else {
                      addTag(tag, 'dietary');
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Tags */}
          <div className="space-y-3">
            <Label>Eigene Tags</Label>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  placeholder="Zeit (Min)"
                  value={newInstruction.time || ''}
                  onChange={(e) => setNewInstruction(prev => ({ 
                    ...prev, 
                    time: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  placeholder="Temperatur (°C)"
                  value={newInstruction.temperature || ''}
                  onChange={(e) => setNewInstruction(prev => ({ 
                    ...prev, 
                    temperature: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
              
              <Button 
                type="button" 
                onClick={addInstruction}
                disabled={!newInstruction.instruction.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
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
                  {(instruction.time || instruction.temperature) && (
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {instruction.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {instruction.time} Min
                        </span>
                      )}
                      {instruction.temperature && (
                        <span className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          {instruction.temperature}°C
                        </span>
                      )}
                    </div>
                  )}
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
            className="w-full md:w-auto px-12"
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