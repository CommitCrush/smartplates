import { NextRequest, NextResponse } from 'next/server';
import { analyzeFridge } from '@/ai/flows/analyze-fridge';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    let imageData: string;
    let userPreferences: any = {};
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData upload
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;
      
      if (!imageFile) {
        return NextResponse.json(
          { error: 'Image file is required' },
          { status: 400 }
        );
      }
      
      // Convert file to base64
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageData = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
      
    } else {
      // Handle JSON upload
      const body = await request.json();
      
      if (!body.imageData) {
        return NextResponse.json(
          { error: 'Image data is required' },
          { status: 400 }
        );
      }
      
      imageData = body.imageData;
      userPreferences = body.userPreferences || {};
    }
    
    // Call the AI flow
    const result = await analyzeFridge({
      imageData,
      userPreferences,
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