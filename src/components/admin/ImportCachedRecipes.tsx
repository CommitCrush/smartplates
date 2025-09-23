'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Upload } from 'lucide-react';

export default function ImportCachedRecipes() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleImport = async () => {
    setImporting(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/import-cached-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
      
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Import Cached Recipes
        </CardTitle>
        <CardDescription>
          Import the cached recipes from JSON file to MongoDB
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          onClick={handleImport}
          disabled={importing}
          className="w-full"
          variant="default"
        >
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Start Import
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <AlertDescription>
              ✅ Import completed successfully!<br />
              • Imported: {result.imported || 0} recipes<br />
              • Skipped: {result.skipped || 0} recipes<br />
              • Errors: {result.errors || 0}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}