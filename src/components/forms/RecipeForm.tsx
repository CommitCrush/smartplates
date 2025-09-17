'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, AlertCircle } from 'lucide-react';

// Types for the form
interface FormIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface FormInstruction {
  id: string;
  stepNumber: number;
  instruction: string;
}

interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: FormIngredient[];
  instructions: FormInstruction[];
  imageUrl: string;
  tags: string[];
}

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
  title?: string;
  showImageUpload?: boolean;
  validationRules?: {
    minIngredients?: number;
    minInstructions?: number;
    requiredFields?: string[];
  };
}

function RecipeForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Rezept speichern',
  title = 'Rezept bearbeiten',
  showImageUpload = true,
  validationRules = {
    minIngredients: 1,
    minInstructions: 1,
    requiredFields: ['title', 'description']
  }
}: RecipeFormProps) {
  // Form state
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    category: 'dinner',
    difficulty: 'easy',
    prepTime: 30,
    cookTime: 30,
    servings: 2,
    ingredients: [],
    instructions: [],
    imageUrl: '',
    tags: [],
    ...initialData
  });

  // Input states for adding new items
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: 0, unit: '' });
  const [newInstruction, setNewInstruction] = useState('');
  const [newTag, setNewTag] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categories and difficulties
  const categories = [
    { value: 'breakfast', label: 'Frühstück' },
    { value: 'lunch', label: 'Mittagessen' },
    { value: 'dinner', label: 'Abendessen' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'snack', label: 'Snack' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Einfach' },
    { value: 'medium', label: 'Mittel' },
    { value: 'hard', label: 'Schwer' },
  ];

  // Validation functions
  const validateField = (field: string, value: unknown): string => {
    const rules = validationRules;
    
    if (rules?.requiredFields?.includes(field) && !value) {
      return 'Dieses Feld ist erforderlich';
    }
    
    if (field === 'title' && value && typeof value === 'string' && value.length < 3) {
      return 'Titel muss mindestens 3 Zeichen lang sein';
    }
    
    if (field === 'description' && value && typeof value === 'string' && value.length < 10) {
      return 'Beschreibung muss mindestens 10 Zeichen lang sein';
    }
    
    if (field === 'ingredients' && rules?.minIngredients && Array.isArray(value) && value.length < rules.minIngredients) {
      return `Mindestens ${rules.minIngredients} Zutat(en) erforderlich`;
    }
    
    if (field === 'instructions' && rules?.minInstructions && Array.isArray(value) && value.length < rules.minInstructions) {
      return `Mindestens ${rules.minInstructions} Anweisung(en) erforderlich`;
    }
    
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof RecipeFormData]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field changes with validation
  const handleFieldChange = (field: keyof RecipeFormData, value: RecipeFormData[keyof RecipeFormData]) => {
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

  // Ingredient management
  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount && newIngredient.unit) {
      const ingredient: FormIngredient = {
        id: Date.now().toString(),
        ...newIngredient
      };
      
      const updatedIngredients = [...formData.ingredients, ingredient];
      handleFieldChange('ingredients', updatedIngredients);
      setNewIngredient({ name: '', amount: 0, unit: '' });
    }
  };

  const removeIngredient = (id: string) => {
    const updatedIngredients = formData.ingredients.filter(ing => ing.id !== id);
    handleFieldChange('ingredients', updatedIngredients);
  };

  // Instruction management
  const addInstruction = () => {
    if (newInstruction.trim()) {
      const instruction: FormInstruction = {
        id: Date.now().toString(),
        stepNumber: formData.instructions.length + 1,
        instruction: newInstruction.trim()
      };
      
      const updatedInstructions = [...formData.instructions, instruction];
      handleFieldChange('instructions', updatedInstructions);
      setNewInstruction('');
    }
  };

  const removeInstruction = (id: string) => {
    const updatedInstructions = formData.instructions
      .filter(inst => inst.id !== id)
      .map((inst, index) => ({ ...inst, stepNumber: index + 1 }));
    handleFieldChange('instructions', updatedInstructions);
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const updatedTags = [...formData.tags, newTag.trim()];
      handleFieldChange('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    handleFieldChange('tags', updatedTags);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Grundinformationen</h3>
          
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                  onBlur={() => {
                    const error = validateField('title', formData.title);
                    if (error) setErrors(prev => ({ ...prev, title: error }));
                  }}
              placeholder="z.B. Spaghetti Carbonara"
              className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
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
              onBlur={() => {
                const error = validateField('description', formData.description);
                if (error) setErrors(prev => ({ ...prev, description: error }));
              }}
              placeholder="Beschreibe dein Rezept..."
              rows={4}
              className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </p>
            )}
          </div>

          {showImageUpload && (
            <div>
              <Label htmlFor="imageUrl">Bild URL (optional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                placeholder="https://example.com/bild.jpg"
                className="mt-1"
              />
            </div>
          )}
        </div>

        {/* Recipe Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Einstellungen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="difficulty">Schwierigkeit</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="prepTime">Vorbereitung (Min)</Label>
              <Input
                id="prepTime"
                type="number"
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
              value={formData.servings}
              onChange={(e) => handleFieldChange('servings', parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Zutaten *</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
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
              onChange={(e) => setNewIngredient(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              placeholder="Einheit"
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
            />
            <Button type="button" onClick={addIngredient} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>

          <div className="space-y-2">
            {formData.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span>{ingredient.amount} {ingredient.unit} {ingredient.name}</span>
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
              <p className="text-muted-foreground text-sm py-4">Noch keine Zutaten hinzugefügt</p>
            )}
          </div>
          
          {errors.ingredients && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.ingredients}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Anweisungen *</h3>
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Anweisungsschritt beschreiben..."
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              rows={3}
              className="flex-1"
            />
            <Button type="button" onClick={addInstruction} className="self-start">
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>

          <div className="space-y-3">
            {formData.instructions.map((instruction) => (
              <div key={instruction.id} className="flex gap-3 p-3 bg-muted/50 rounded-md">
                <span className="font-medium text-primary min-w-[2rem]">
                  {instruction.stepNumber}.
                </span>
                <span className="flex-1">{instruction.instruction}</span>
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
              <p className="text-muted-foreground text-sm py-4">Noch keine Anweisungen hinzugefügt</p>
            )}
          </div>
          
          {errors.instructions && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.instructions}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tags (optional)</h3>
          
          <div className="flex gap-2">
            <Input
              placeholder="Tag hinzufügen (z.B. vegetarisch, schnell)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
              className="flex-1"
            />
            <Button type="button" onClick={addTag}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeTag(tag)}
              >
                {tag} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-center space-y-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto px-8"
          >
            {isLoading ? (
              <>🔄 Speichere...</>
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
        </div>
      </form>
    </Card>
  );
}

export default RecipeForm;
export { RecipeForm };