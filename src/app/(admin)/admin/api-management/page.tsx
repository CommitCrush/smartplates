'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Database, RefreshCw, AlertTriangle, Check, 
  SearchIcon, PlusCircle, Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Recipe {
  id: string;
  title: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  newTotal: number;
  recipes?: Recipe[];
  totalCount?: number;
  savedCount?: number;
  duplicateCount?: number;
}

interface BackfillResult {
  success: boolean;
  message: string;
  backfilledCount: number;
  recipes?: Recipe[];
  totalChecked?: number;
}

export default function ApiManagementPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [isRunningCliBackfill, setIsRunningCliBackfill] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(null);
  const [cliBackfillResult, setCliBackfillResult] = useState<{
    success: boolean;
    message?: string;
    output?: string;
    error?: string;
    apiLimitReached?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Import form state
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [limit, setLimit] = useState(20);
  
  const handleImport = async () => {
    try {
      setIsImporting(true);
      setError(null);
      setImportResult(null);
      
      const response = await fetch('/api/admin/api-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query || 'main course', // Standardwert, wenn keine Abfrage eingegeben wurde
          cuisine: cuisine !== 'any' ? cuisine : undefined,
          limit: Number(limit),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import recipes');
      }
      
      // Erweitere die Ergebnisdaten mit zusätzlichen Zählern
      setImportResult({
        ...data,
        savedCount: data.importedCount || 0,
        totalCount: (data.recipes?.length || 0) + (data.duplicateCount || 0),
        duplicateCount: data.duplicateCount || ((data.recipes?.length || 0) - (data.importedCount || 0))
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleBackfill = async () => {
    try {
      setIsBackfilling(true);
      setError(null);
      setBackfillResult(null);
      
      const response = await fetch('/api/admin/api-management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to backfill recipes');
      }
      
      setBackfillResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during backfill');
    } finally {
      setIsBackfilling(false);
    }
  };
  
  // Definiere die CLI-Backfill-Funktionalität
  const runCliBackfill = async () => {
    try {
      setIsRunningCliBackfill(true);
      setError(null);
      setCliBackfillResult(null);
      
      const response = await fetch('/api/admin/api-management/cli-backfill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Wenn der Status 429 ist, handelt es sich um ein API-Limit-Problem
        if (response.status === 429) {
          setCliBackfillResult({
            success: false,
            error: data.error || 'API-Limit erreicht',
            apiLimitReached: true,
            output: data.output || ''
          });
          return;
        }
        throw new Error(data.error || 'Failed to run CLI backfill');
      }
      
      setCliBackfillResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during CLI backfill');
    } finally {
      setIsRunningCliBackfill(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Management</h1>
        <p className="text-muted-foreground">
          Manage Spoonacular API integration and recipe imports
        </p>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Error</p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Import New Recipes
            </CardTitle>
              <CardDescription>
              Import new recipes by cuisine, meal type, or diet from Spoonacular API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Search Query
                  </label>
                  <div className="flex items-center gap-2">
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. pasta, vegetarian, quick"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Category Filter
                    </label>
                    <Select value={cuisine} onValueChange={setCuisine}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        <SelectItem value="any">All categories</SelectItem>
                        
                        {/* Cuisines */}
                        <SelectItem value="african">African</SelectItem>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="british">British</SelectItem>
                        <SelectItem value="cajun">Cajun</SelectItem>
                        <SelectItem value="caribbean">Caribbean</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="eastern-european">Eastern European</SelectItem>
                        <SelectItem value="european">European</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="greek">Greek</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="irish">Irish</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="jewish">Jewish</SelectItem>
                        <SelectItem value="korean">Korean</SelectItem>
                        <SelectItem value="latin-american">Latin American</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                        <SelectItem value="nordic">Nordic</SelectItem>
                        <SelectItem value="southern">Southern</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="thai">Thai</SelectItem>
                        <SelectItem value="vietnamese">Vietnamese</SelectItem>
                        
                        {/* Meal Types */}
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="brunch">Brunch</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                        <SelectItem value="appetizer">Appetizer</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                        <SelectItem value="beverage">Beverage</SelectItem>
                        <SelectItem value="soup">Soup</SelectItem>
                        <SelectItem value="salad">Salad</SelectItem>
                        
                        {/* Diet Types */}
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="gluten-free">Gluten Free</SelectItem>
                        <SelectItem value="dairy-free">Dairy Free</SelectItem>
                        <SelectItem value="low-carb">Low Carb</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Limit
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting}
                  className="mt-2"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import Recipes
                    </>
                  )}
                </Button>
              </div>
              
              {importResult && (
                <div className="border rounded-md p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mt-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
                    <Check className="h-5 w-5" />
                    <span>{importResult.message}</span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Rezepte gefunden</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{importResult.totalCount || 0}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gespeichert</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{importResult.importedCount || 0}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Duplikate übersprungen</p>
                        <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{importResult.duplicateCount || 0}</p>
                      </div>
                    </div>
                    
                    {importResult.importedCount > 0 && importResult.recipes && importResult.recipes.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Importierte Rezepte:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {importResult.recipes.slice(0, 10).map((recipe) => (
                            <Badge key={recipe.id} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              {recipe.title || 'Unnamed Recipe'}
                            </Badge>
                          ))}
                          {importResult.recipes.length > 10 && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              +{importResult.recipes.length - 10} mehr
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Backfill Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backfill Recipe Details
            </CardTitle>
            <CardDescription>
              Update existing recipes with missing information from Spoonacular API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border border-yellow-400 dark:border-yellow-700 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">API Usage Warning</p>
                    <p className="text-yellow-700 dark:text-yellow-200 text-sm">
                      Backfilling recipes uses API quota. The process runs in batches to manage
                      rate limits. For large datasets, consider using the CLI script.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleBackfill} 
                  disabled={isBackfilling}
                  variant="outline"
                  className="justify-start"
                >
                  {isBackfilling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Backfilling (Web)...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Web Backfill (Small Batches)
                    </>
                  )}
                </Button>
                
                <div className="flex flex-col">
                  <Button
                    onClick={runCliBackfill}
                    variant="outline"
                    className="justify-start"
                    disabled={isRunningCliBackfill}
                  >
                    {isRunningCliBackfill ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running CLI Backfill...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Run CLI Backfill (Full Database)
                      </>
                    )}
                  </Button>
                  
                  {/* Kleine Statusanzeige unter dem Button */}
                  {cliBackfillResult?.apiLimitReached && (
                    <p className="text-xs text-amber-500 dark:text-amber-400 mt-1 ml-1">
                      API-Limit erreicht. Bitte morgen erneut versuchen.
                    </p>
                  )}
                  {cliBackfillResult?.error && !cliBackfillResult.apiLimitReached && (
                    <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1 ml-1">
                      Fehler beim Backfill-Prozess.
                    </p>
                  )}
                  {cliBackfillResult?.success && (
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1 ml-1">
                      {cliBackfillResult.output?.includes("recipes updated") 
                        ? `${(cliBackfillResult.output.match(/(\d+) recipes updated/) || ['','0'])[1]} Rezepte aktualisiert`
                        : "Backfill erfolgreich"}
                    </p>
                  )}
                </div>
              </div>
              
              {backfillResult && (
                <div className="border rounded-md p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mt-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
                    <Check className="h-5 w-5" />
                    <span>{backfillResult.message}</span>
                  </div>
                  
                  {backfillResult.backfilledCount > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Successfully updated {backfillResult.backfilledCount} recipes with missing details
                      </p>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-green-800 dark:text-green-200">
                          Updated Recipes:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {backfillResult.recipes?.slice(0, 10).map((recipe: Recipe) => (
                            <Badge key={recipe.id} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              {recipe.title || 'Unnamed Recipe'}
                            </Badge>
                          ))}
                          {backfillResult.recipes && backfillResult.recipes.length > 10 && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              +{backfillResult.recipes.length - 10} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* CLI Backfill Result wird nicht mehr als große Box angezeigt - stattdessen nur kleine Hinweise unter dem Button */}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* API Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
          <CardDescription>
            Spoonacular API quota usage and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md border shadow-sm">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Daily API Calls</div>
              <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-50">?? / 150</div>
            </div>
            
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md border shadow-sm">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Quota Used</div>
              <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-50">?? %</div>
            </div>
            
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md border shadow-sm">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Reset In</div>
              <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-50">~12h</div>
            </div>
          </div>
          
          <div className="text-center text-slate-600 dark:text-slate-300 text-sm mt-4">
            API status monitoring is under development. Status shown is placeholder.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}