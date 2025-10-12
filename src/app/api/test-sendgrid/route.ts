/**
 * SendGrid Test API Route
 * Test endpoint to verify SendGrid configuration
 */

import { NextResponse } from 'next/server';
import { sendContactEmailSendGrid } from '@/services/emailService';

export async function GET() {
  try {
    console.log('🧪 Testing SendGrid configuration...');
    
    // Check environment variables
    const config = {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Missing',
      SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'noreply@smartplates.app',
    };
    
    console.log('📋 SendGrid Configuration:', config);

    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'SendGrid API Key not configured',
        config,
        instructions: 'Add SENDGRID_API_KEY to your .env.local file'
      }, { status: 400 });
    }

    // Send test email
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'SendGrid Test Email',
      message: 'Dies ist eine Test-Email um die SendGrid Konfiguration zu überprüfen.',
      contactReason: 'support' as const
    };

    await sendContactEmailSendGrid(testData);

    return NextResponse.json({
      success: true,
      message: 'SendGrid test email sent successfully!',
      config,
      testData: {
        to: 'smartplates.group@gmail.com',
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@smartplates.app',
        subject: testData.subject
      }
    });

  } catch (error) {
    console.error('❌ SendGrid test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: {
        checkApiKey: 'Verify SENDGRID_API_KEY is correct',
        checkFromEmail: 'Verify SENDGRID_FROM_EMAIL domain is verified in SendGrid',
        checkSenderVerification: 'Make sure sender email is verified in SendGrid dashboard'
      }
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'Use GET method to test SendGrid configuration'
  }, { status: 405 });
}