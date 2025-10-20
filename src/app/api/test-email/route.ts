/**
 * Resend Email Test API Route
 * Test endpoint to verify Resend email functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmailVerification } from '@/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and name are required' 
        },
        { status: 400 }
      );
    }

    // Test sending verification email
    await sendEmailVerification({
      email: email,
      name: name,
      verificationToken: 'test-token-123',
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully via Resend',
    });

  } catch (error) {
    console.error('Test email error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🧪 Testing Resend configuration...');
    
    // Check environment variables
    const config = {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing',
      RESEND_API_KEY_PREFIX: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 8) + '...' : 'Not set',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    };
    
    console.log('📋 Resend Configuration:', config);

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Resend API Key not configured',
        config,
        instructions: 'Add RESEND_API_KEY to your .env.local file'
      }, { status: 400 });
    }

    // Try sending a test email to admin
    await sendEmailVerification({
      email: 'smartplates.group@gmail.com',
      name: 'Test Admin',
      verificationToken: 'test-token-' + Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Resend test email sent successfully to admin!',
      config,
      testData: {
        to: 'smartplates.group@gmail.com',
        from: 'SmartPlates <noreply@smartplates.app>',
        subject: 'Welcome to SmartPlates! Please verify your email 🍽️'
      }
    });

  } catch (error) {
    console.error('Resend test error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test email via Resend',
        details: error instanceof Error ? error.message : 'Unknown error',
        config: {
          RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing',
        }
      },
      { status: 500 }
    );
  }
}