/**
 * Email Service for SmartPlates
 * SendGrid: Contact forms
 * Resend: Email verification and password reset
 */

import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY);

// SendGrid configuration for contact forms
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email configuration
const ADMIN_EMAIL = 'smartplates.group@gmail.com';
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'smartplates.group@gmail.com';
const RESEND_FROM_EMAIL = 'SmartPlates <onboarding@resend.dev>';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactReason: 'support' | 'feedback' | 'partnership' | 'other';
}

export interface EmailVerificationData {
  email: string;
  name: string;
  verificationToken: string;
}

export interface PasswordResetData {
  email: string;
  name: string;
  resetToken: string;
}

/**
 * Send contact form email to admin using SendGrid
 */
export async function sendContactEmail(formData: ContactFormData): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured');
  }

  const reasonLabels = {
    support: 'Technical Support',
    feedback: 'Feedback & Suggestions',
    partnership: 'Business Partnership',
    other: 'Other Inquiries'
  };

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { 
            background: linear-gradient(135deg, #a6ba8d, #0bb669); 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
            border-radius: 8px 8px 0 0; 
          }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px 20px; background: #f9faf8; }
          .field { margin-bottom: 20px; }
          .label { font-weight: 600; color: #5e6a41; margin-bottom: 8px; display: block; }
          .value { 
            background: white; 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #a6ba8d;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .reason-badge { 
            background: #a6ba8d; 
            color: white; 
            padding: 6px 16px; 
            border-radius: 20px; 
            display: inline-block; 
            font-size: 14px; 
            font-weight: 500;
          }
          .footer {
            background: #f4f4f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 8px 8px;
          }
          .brand { color: #a6ba8d; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">SmartPlates Contact Form</p>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Contact Reason:</span>
              <div class="value">
                <span class="reason-badge">${reasonLabels[formData.contactReason]}</span>
              </div>
            </div>
            <div class="field">
              <span class="label">👤 Name:</span>
              <div class="value">${formData.name}</div>
            </div>
            <div class="field">
              <span class="label">📧 Email:</span>
              <div class="value">${formData.email}</div>
            </div>
            <div class="field">
              <span class="label">📝 Subject:</span>
              <div class="value">${formData.subject}</div>
            </div>
            <div class="field">
              <span class="label">💬 Message:</span>
              <div class="value">${formData.message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from the <span class="brand">SmartPlates</span> contact form</p>
            <p>Received on: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await sgMail.send({
      to: ADMIN_EMAIL,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: 'SmartPlates Contact Form'
      },
      replyTo: {
        email: formData.email,
        name: formData.name
      },
      subject: `[SmartPlates] ${reasonLabels[formData.contactReason]}: ${formData.subject}`,
      html: htmlTemplate,
    });

    console.log('✅ Contact email sent successfully via SendGrid');
  } catch (error) {
    console.error('❌ Failed to send contact email via SendGrid:', error);
    throw error;
  }
}

/**
 * Send email verification using Resend
 */
export async function sendEmailVerification(verificationData: EmailVerificationData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key not configured');
  }

  // Development mode: redirect all emails to owner email for testing
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const actualEmail = isDevelopment ? 'smartplates.group@gmail.com' : verificationData.email;
  
  console.log(`📧 ${isDevelopment ? '[DEV MODE]' : ''} Sending verification email to: ${actualEmail} (original: ${verificationData.email})`);

  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationData.verificationToken}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { 
            background: linear-gradient(135deg, #22c55e, #16a34a); 
            color: white; 
            padding: 40px 20px; 
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
          .content { padding: 40px 30px; background: #f9fafb; }
          .welcome-text { font-size: 18px; margin-bottom: 25px; color: #374151; }
          .cta-container { text-align: center; margin: 35px 0; }
          .cta-button {
            background: #22c55e;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);
            transition: all 0.3s ease;
          }
          .cta-button:hover { background: #16a34a; transform: translateY(-2px); }
          .link-fallback { 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 20px;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 6px;
            border-left: 4px solid #22c55e;
          }
          .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 25px;
            text-align: center;
            font-size: 12px;
          }
          .brand { color: #22c55e; font-weight: 600; }
          .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400e;
          }
          .dev-notice {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to SmartPlates!</h1>
            <p>Please verify your email address to get started</p>
          </div>
          <div class="content">
            ${isDevelopment ? `
            <div class="dev-notice">
              🧪 <strong>Development Mode:</strong> Diese E-Mail wurde an smartplates.group@gmail.com umgeleitet, da Resend im Test-Modus nur an die Owner-E-Mail senden kann. Original-E-Mail: ${verificationData.email}
            </div>
            ` : ''}
            
            <p class="welcome-text">Hi <strong>${verificationData.name}</strong>,</p>
            
            <p>Thank you for joining <span class="brand">SmartPlates</span>! To complete your registration and start planning your meals, please verify your email address.</p>
            
            <div class="cta-container">
              <a href="${verificationUrl}" class="cta-button">
                ✅ Verify Email Address
              </a>
            </div>
            
            <div class="link-fallback">
              <strong>Button not working?</strong><br>
              Copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #22c55e; word-break: break-all;">${verificationUrl}</a>
            </div>
            
            <div class="security-note">
              🔒 <strong>Security Note:</strong> This verification link will expire in 24 hours for your security.
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul style="color: #374151;">
              <li>🍽️ Save and organize your favorite recipes</li>
              <li>📅 Plan your weekly meals with our smart calendar</li>
              <li>🛒 Generate automatic shopping lists</li>
              <li>🤖 Get AI-powered recipe recommendations</li>
            </ul>
            
            <p>We're excited to help you on your meal planning journey!</p>
            
            <p>Best regards,<br><span class="brand">The SmartPlates Team</span></p>
          </div>
          <div class="footer">
            <p>This email was sent by <span class="brand">SmartPlates</span></p>
            <p>If you didn't sign up for SmartPlates, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: actualEmail,
      subject: 'Welcome to SmartPlates! Please verify your email 🍽️',
      html: htmlTemplate,
    });

    console.log('✅ Email verification sent successfully via Resend to:', actualEmail);
  } catch (error) {
    console.error('❌ Failed to send email verification via Resend:', error);
    throw error;
  }
}

/**
 * Send confirmation email to user using SendGrid
 */
export async function sendContactConfirmation(userEmail: string, userName: string): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Would send confirmation email to ${userEmail}`);
    return;
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { 
            background: linear-gradient(135deg, #a6ba8d, #0bb669); 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
            border-radius: 8px 8px 0 0; 
          }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px 20px; background: #f9faf8; }
          .footer {
            background: #f4f4f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 8px 8px;
          }
          .brand { color: #a6ba8d; font-weight: 600; }
          .cta {
            background: #fa6552;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Thank You for Contacting Us!</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">SmartPlates</p>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Thank you for reaching out to <span class="brand">SmartPlates</span>! We've successfully received your message and our team will get back to you within 24 hours.</p>
            
            <p>In the meantime, feel free to explore our platform:</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/recipe" class="cta">🍽️ Browse Recipes</a>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/meal-planning" class="cta">📅 Plan Your Meals</a>
            </div>
            
            <p>We appreciate your interest in SmartPlates and look forward to helping you with your meal planning journey!</p>
            
            <p>Best regards,<br><span class="brand">The SmartPlates Team</span></p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation from <span class="brand">SmartPlates</span></p>
            <p>If you didn't send this message, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await sgMail.send({
      to: userEmail,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: 'SmartPlates'
      },
      subject: 'Thank you for contacting SmartPlates! 🍽️',
      html: htmlTemplate,
    });

    console.log('✅ Confirmation email sent successfully via SendGrid');
  } catch (error) {
    console.error('❌ Failed to send confirmation email via SendGrid:', error);
    // Don't throw error for confirmation emails - they're optional
  }
}

/**
 * Send password reset email using Resend
 */
export async function sendPasswordResetEmail(resetData: PasswordResetData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key not configured');
  }

  // Development mode: redirect all emails to owner email for testing
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const actualEmail = isDevelopment ? 'smartplates.group@gmail.com' : resetData.email;
  
  console.log(`📧 ${isDevelopment ? '[DEV MODE]' : ''} Sending password reset email to: ${actualEmail} (original: ${resetData.email})`);

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetData.resetToken}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { 
            background: linear-gradient(135deg, #f59e0b, #d97706); 
            color: white; 
            padding: 40px 20px; 
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; background: #f9fafb; }
          .cta-container { text-align: center; margin: 35px 0; }
          .cta-button {
            background: #dc2626;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
          }
          .link-fallback { 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 20px;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 6px;
            border-left: 4px solid #dc2626;
          }
          .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 25px;
            text-align: center;
            font-size: 12px;
          }
          .brand { color: #22c55e; font-weight: 600; }
          .security-note {
            background: #fee2e2;
            border: 1px solid #dc2626;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #7f1d1d;
          }
          .dev-notice {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Passwort zurücksetzen</h1>
            <p>SmartPlates Passwort-Reset</p>
          </div>
          <div class="content">
            ${isDevelopment ? `
            <div class="dev-notice">
              🧪 <strong>Development Mode:</strong> Diese E-Mail wurde an smartplates.group@gmail.com umgeleitet, da Resend im Test-Modus nur an die Owner-E-Mail senden kann. Original-E-Mail: ${resetData.email}
            </div>
            ` : ''}
            
            <p>Hallo <strong>${resetData.name}</strong>,</p>
            
            <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr <span class="brand">SmartPlates</span>-Konto gestellt.</p>
            
            <div class="cta-container">
              <a href="${resetUrl}" class="cta-button">
                🔑 Neues Passwort setzen
              </a>
            </div>
            
            <div class="link-fallback">
              <strong>Button funktioniert nicht?</strong><br>
              Kopieren Sie diesen Link in Ihren Browser:<br>
              <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
            </div>
            
            <div class="security-note">
              ⏰ <strong>Wichtig:</strong> Dieser Reset-Link ist nur 1 Stunde gültig und kann nur einmal verwendet werden.
            </div>
            
            <p><strong>Falls Sie diese Anfrage nicht gestellt haben:</strong></p>
            <ul>
              <li>Ignorieren Sie diese E-Mail einfach</li>
              <li>Ihr Passwort bleibt unverändert</li>
              <li>Der Link wird automatisch ungültig</li>
            </ul>
            
            <p>Für Ihre Sicherheit loggen wir alle Passwort-Reset-Anfragen und setzen Ihre aktiven Sessions zurück, sobald ein neues Passwort gesetzt wird.</p>
            
            <p>Bei Fragen wenden Sie sich gerne an unser Support-Team.</p>
            
            <p>Beste Grüße,<br><span class="brand">Das SmartPlates Team</span></p>
          </div>
          <div class="footer">
            <p>Diese E-Mail wurde von <span class="brand">SmartPlates</span> gesendet</p>
            <p>SmartPlates - Ihre Meal-Planning-Plattform</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: actualEmail,
      subject: 'Passwort zurücksetzen - SmartPlates 🔐',
      html: htmlTemplate,
    });

    console.log('✅ Password reset email sent successfully via Resend to:', actualEmail);
  } catch (error) {
    console.error('❌ Failed to send password reset email via Resend:', error);
    throw error;
  }
}
