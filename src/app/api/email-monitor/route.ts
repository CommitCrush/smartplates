/**
 * Email Monitoring API
 * Simple endpoint to check email sending status and logs
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory log storage for development
let emailLogs: Array<{
  timestamp: string;
  type: 'verification' | 'password-reset' | 'test';
  email: string;
  status: 'success' | 'error';
  message: string;
  details?: any;
}> = [];

export function addEmailLog(log: {
  type: 'verification' | 'password-reset' | 'test';
  email: string;
  status: 'success' | 'error';
  message: string;
  details?: any;
}) {
  emailLogs.unshift({
    timestamp: new Date().toISOString(),
    ...log
  });
  
  // Keep only last 50 logs
  if (emailLogs.length > 50) {
    emailLogs = emailLogs.slice(0, 50);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clear = searchParams.get('clear');
    
    if (clear === 'true') {
      emailLogs = [];
      return NextResponse.json({
        success: true,
        message: 'Email logs cleared',
        logs: []
      });
    }

    return NextResponse.json({
      success: true,
      totalLogs: emailLogs.length,
      logs: emailLogs,
      environment: process.env.NODE_ENV,
      resendConfigured: !!process.env.RESEND_API_KEY,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email monitor error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve email logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'test') {
      // Add a test log entry
      addEmailLog({
        type: 'test',
        email: 'test@example.com',
        status: 'success',
        message: 'Manual test log entry',
        details: { manual: true, timestamp: Date.now() }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Test log added',
        totalLogs: emailLogs.length
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Email monitor POST error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}