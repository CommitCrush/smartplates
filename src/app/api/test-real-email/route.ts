/**
 * Simple Email Test Route
 * Sends a real email to test Resend functionality
 */

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    console.log('🧪 Sending real test email...');
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not configured'
      }, { status: 400 });
    }

    // Send real email to your Gmail
    const result = await resend.emails.send({
      from: 'SmartPlates Test <onboarding@resend.dev>',
      to: 'smartplates.group@gmail.com',
      subject: '🧪 SmartPlates Resend Test - Real Email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px; }
              .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 10px; }
              .success { color: #22c55e; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 SmartPlates Test Email</h1>
                <p>Resend Integration Test</p>
              </div>
              <div class="content">
                <h2 class="success">✅ E-Mail funktioniert!</h2>
                <p>Diese E-Mail wurde erfolgreich über Resend gesendet.</p>
                <p><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
                <p><strong>API Key:</strong> ${process.env.RESEND_API_KEY?.substring(0, 8)}...</p>
                <p><strong>Von:</strong> SmartPlates Test &lt;onboarding@resend.dev&gt;</p>
                <p><strong>An:</strong> smartplates.group@gmail.com</p>
                
                <hr style="margin: 20px 0;">
                
                <h3>🔧 Test Details:</h3>
                <ul>
                  <li>✅ Resend API Key konfiguriert</li>
                  <li>✅ From-Domain verifiziert (onboarding@resend.dev)</li>
                  <li>✅ E-Mail Template funktioniert</li>
                  <li>✅ Echte E-Mail-Zustellung</li>
                </ul>
                
                <p><em>Dies bedeutet, dass die E-Mail-Verifikation für Benutzerregistrierungen jetzt funktioniert!</em></p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    console.log('✅ Email sent successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Real email sent to smartplates.group@gmail.com',
      emailId: result.data?.id,
      result: result
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}