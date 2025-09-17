'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Plus, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface Instruction {
  id: string;
  stepNumber: number;
  instruction: string;
}

export default function RecipeUploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');

  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    category: 'dinner',
    difficulty: 'easy',
    prepTime: 30,
    cookTime: 30,
    servings: 2,
    ingredients: [] as Ingredient[],
    instructions: [] as Instruction[],
    imageUrl: '',
    tags: [] as string[],
  });

  const [forms, setForms] = useState({
    newIngredient: { name: '', amount: 0, unit: '' },
    newInstruction: '',
    newTag: '',
  });

  // Zutat hinzufügen
  const addIngredient = () => {
    if (forms.newIngredient.name && forms.newIngredient.amount && forms.newIngredient.unit) {
      setRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, {
          id: Date.now().toString(),
          ...forms.newIngredient
        }]
      }));
      setForms(prev => ({
        ...prev,
        newIngredient: { name: '', amount: 0, unit: '' }
      }));
    }
  };

  // Zutat entfernen
  const removeIngredient = (id: string) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  };

  // Anweisung hinzufügen
  const addInstruction = () => {
    if (forms.newInstruction.trim()) {
      setRecipe(prev => ({
        ...prev,
        instructions: [...prev.instructions, {
          id: Date.now().toString(),
          stepNumber: prev.instructions.length + 1,
          instruction: forms.newInstruction.trim()
        }]
      }));
      setForms(prev => ({
        ...prev,
        newInstruction: ''
      }));
    }
  };

  // Anweisung entfernen
  const removeInstruction = (id: string) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter(inst => inst.id !== id)
        .map((inst, index) => ({ ...inst, stepNumber: index + 1 }))
    }));
  };

  // Tag hinzufügen
  const addTag = () => {
    if (forms.newTag.trim() && !recipe.tags.includes(forms.newTag.trim())) {
      setRecipe(prev => ({
        ...prev,
        tags: [...prev.tags, forms.newTag.trim()]
      }));
      setForms(prev => ({
        ...prev,
        newTag: ''
      }));
    }
  };

  // Tag entfernen
  const removeTag = (tagToRemove: string) => {
    setRecipe(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Rezept hochladen
  const handleUpload = async () => {
    setIsLoading(true);
    setUploadResult('');

    try {
      const apiRecipe = {
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        difficulty: recipe.difficulty,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.prepTime + recipe.cookTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image: recipe.imageUrl,
        tags: recipe.tags,
        author: 'User', // TODO: Get from auth context
      };

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRecipe),
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult('✅ Rezept erfolgreich erstellt!');
        // Nach erfolgreicher Erstellung zur Rezept-Liste weiterleiten
        setTimeout(() => {
          router.push('/recipe');
        }, 2000);
      } else {
        setUploadResult(`❌ Fehler: ${result.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      setUploadResult(`❌ Netzwerk-Fehler: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = recipe.title && recipe.description && 
                 recipe.ingredients.length > 0 && recipe.instructions.length > 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/recipe" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Rezepten
          </Link>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Neues Rezept erstellen
          </h1>
          <p className="text-muted-foreground">
            Teile dein Lieblingsrezept mit der Community
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-8">
            {/* Grundinformationen */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Rezept-Details
              </h2>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={recipe.title}
                    onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="z.B. Spaghetti Carbonara"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschreibung *</Label>
                  <Textarea
                    id="description"
                    value={recipe.description}
                    onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beschreibe dein Rezept..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Bild URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={recipe.imageUrl}
                    onChange={(e) => setRecipe(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/bild.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Einstellungen */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <select
                    id="category"
                    value={recipe.category}
                    onChange={(e) => setRecipe(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="breakfast">Frühstück</option>
                    <option value="lunch">Mittagessen</option>
                    <option value="dinner">Abendessen</option>
                    <option value="dessert">Dessert</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Schwierigkeit</Label>
                  <select
                    id="difficulty"
                    value={recipe.difficulty}
                    onChange={(e) => setRecipe(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="easy">Einfach</option>
                    <option value="medium">Mittel</option>
                    <option value="hard">Schwer</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="prepTime">Vorbereitung (Min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={recipe.prepTime}
                    onChange={(e) => setRecipe(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cookTime">Kochzeit (Min)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={recipe.cookTime}
                    onChange={(e) => setRecipe(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="w-32">
                <Label htmlFor="servings">Portionen</Label>
                <Input
                  id="servings"
                  type="number"
                  value={recipe.servings}
                  onChange={(e) => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Zutaten */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Zutaten *</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <Input
                  placeholder="Zutat"
                  value={forms.newIngredient.name}
                  onChange={(e) => setForms(prev => ({ 
                    ...prev, 
                    newIngredient: { ...prev.newIngredient, name: e.target.value }
                  }))}
                  className="md:col-span-2"
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Menge"
                  value={forms.newIngredient.amount || ''}
                  onChange={(e) => setForms(prev => ({ 
                    ...prev, 
                    newIngredient: { ...prev.newIngredient, amount: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <Input
                  placeholder="Einheit"
                  value={forms.newIngredient.unit}
                  onChange={(e) => setForms(prev => ({ 
                    ...prev, 
                    newIngredient: { ...prev.newIngredient, unit: e.target.value }
                  }))}
                />
                <Button onClick={addIngredient} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>

              <div className="space-y-2">
                {recipe.ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <span>{ingredient.amount} {ingredient.unit} {ingredient.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeIngredient(ingredient.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {recipe.ingredients.length === 0 && (
                  <p className="text-muted-foreground text-sm py-4">Noch keine Zutaten hinzugefügt</p>
                )}
              </div>
            </div>

            {/* Anweisungen */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Anweisungen *</h3>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Anweisungsschritt beschreiben..."
                  value={forms.newInstruction}
                  onChange={(e) => setForms(prev => ({ ...prev, newInstruction: e.target.value }))}
                  rows={3}
                  className="flex-1"
                />
                <Button onClick={addInstruction} className="self-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>

              <div className="space-y-3">
                {recipe.instructions.map((instruction) => (
                  <div key={instruction.id} className="flex gap-3 p-3 bg-muted/50 rounded-md">
                    <span className="font-medium text-primary min-w-[2rem]">
                      {instruction.stepNumber}.
                    </span>
                    <span className="flex-1">{instruction.instruction}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeInstruction(instruction.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {recipe.instructions.length === 0 && (
                  <p className="text-muted-foreground text-sm py-4">Noch keine Anweisungen hinzugefügt</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tags (optional)</h3>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Tag hinzufügen (z.B. vegetarisch, schnell)"
                  value={forms.newTag}
                  onChange={(e) => setForms(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button onClick={addTag}>
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
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

            {/* Upload Button */}
            <div className="flex flex-col items-center space-y-4 pt-6 border-t">
              <Button
                onClick={handleUpload}
                disabled={isLoading || !isValid}
                size="lg"
                className="w-full md:w-auto px-8"
              >
                {isLoading ? (
                  <>🔄 Speichere Rezept...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Rezept veröffentlichen
                  </>
                )}
              </Button>

              {!isValid && (
                <p className="text-sm text-muted-foreground text-center">
                  Bitte fülle alle Pflichtfelder (*) aus und füge mindestens eine Zutat und eine Anweisung hinzu
                </p>
              )}

              {uploadResult && (
                <div className={`p-3 rounded-md text-sm text-center ${
                  uploadResult.startsWith('✅') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {uploadResult}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}