import { NextRequest, NextResponse } from 'next/server';
import { analyzeFridge } from '@/ai/flows/analyze-fridge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }
    
    // Call the AI flow
    const result = await analyzeFridge({
      imageData: body.imageData,
      userPreferences: body.userPreferences,
    });
    
    return NextResponse.json({
      success: true,
      data: result,
    });
    
  } catch (error) {
    console.error('Fridge analysis error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze fridge' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Fridge analysis API endpoint',
    methods: ['POST'],
    endpoint: '/api/ai/analyze-fridge',
    description: 'Upload an image of your fridge to get ingredient detection and recipe suggestions',
  });
}
