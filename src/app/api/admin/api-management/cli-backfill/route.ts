/**
 * CLI Backfill API Route
 * 
 * This route allows running the backfill script from the admin interface
 * It executes the script in a server process
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/authMiddleware';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runCliBackfillHandler(_req: NextRequest): Promise<NextResponse> {
  try {
    // Check if we're in a production environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        success: false,
        error: 'CLI backfill is only available in development mode',
      }, { status: 403 });
    }

    // Execute the backfill script
    let stdout = '';
    let stderr = '';
    
    try {
      const result = await execAsync('SPOONACULAR_ENABLED=true bun run backfill:spoonacular');
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (execError) {
      const error = execError as { stdout?: string, stderr?: string, message?: string };
      
      // Überprüfe auf API-Quota-Fehler
      if (error.stdout && error.stdout.includes('daily points limit')) {
        return NextResponse.json({
          success: false,
          error: 'Spoonacular API-Quota aufgebraucht. Das tägliche Limit von 50 Anfragen wurde erreicht.',
          output: error.stdout || '',
          apiLimitReached: true
        }, { status: 429 });
      }
      
      stderr = error.stderr || error.message || 'Unknown exec error';
    }

    if (stderr) {
      console.error('Script error:', stderr);
      return NextResponse.json({
        success: false,
        error: stderr,
      }, { status: 500 });
    }

    // Extrahiere Zahlen aus der Ausgabe für bessere Darstellung
    const processedMatch = stdout.match(/(\d+) recipes processed/);
    const updatedMatch = stdout.match(/(\d+) recipes updated/);
    const skippedMatch = stdout.match(/(\d+) recipes skipped/);
    
    const processed = processedMatch ? parseInt(processedMatch[1], 10) : 0;
    const updated = updatedMatch ? parseInt(updatedMatch[1], 10) : 0;
    const skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;

    return NextResponse.json({
      success: true,
      message: updated > 0 
        ? `CLI backfill completed: ${updated} recipes updated successfully` 
        : 'CLI backfill completed: No recipes needed updating',
      output: stdout,
      processed,
      updated,
      skipped
    });
  } catch (error) {
    console.error('Failed to run CLI backfill:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export const POST = withAuth(runCliBackfillHandler, true);