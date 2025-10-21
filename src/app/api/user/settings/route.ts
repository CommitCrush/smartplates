/**
 * User Settings API Route Stub
 * 
 * Temporary stub implementation to prevent build failures
 * TODO: Refactor to use proper MongoDB methods
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.warn('User Settings API: GET is stubbed - functionality disabled');
    
    return NextResponse.json({
      success: false,
      message: 'User settings API temporarily disabled'
    }, { status: 503 });

  } catch (error) {
    console.error('User Settings API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.warn('User Settings API: PUT is stubbed - functionality disabled');
    
    return NextResponse.json({
      success: false,
      message: 'User settings API temporarily disabled'
    }, { status: 503 });

  } catch (error) {
    console.error('User Settings API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}