import { NextRequest, NextResponse } from 'next/server';
import { getSpoonacularRecipe } from '@/services/spoonacularService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing recipe id' }, { status: 400 });
  }
  
  try {
    // Make sure we have a valid ID format
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: `Invalid recipe id format: ${id}` }, { status: 400 });
    }
    
    // Add proper prefix for the service function
    const details = await getSpoonacularRecipe(`spoonacular-${id}`);
    if (!details) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    return NextResponse.json(details);
  } catch (error: any) {
    console.error(`Error fetching Spoonacular recipe ${id}:`, error);
    return NextResponse.json({ 
      error: 'Failed to fetch recipe details', 
      details: error?.message 
    }, { status: 500 });
  }
}
