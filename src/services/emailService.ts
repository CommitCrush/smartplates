/**
 * Email Service for SmartPlates
 * Handles all email functionality including contact forms and notifications
 */

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Email configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const ADMIN_EMAIL = 'smartplates.group@gmail.com';

// SendGrid configuration
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create transporter
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Email functionality will be limited.');
    return null;
  }
  
  return nodemailer.createTransport(SMTP_CONFIG);
};

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactReason: 'support' | 'feedback' | 'partnership' | 'other';
}

/**
 * Send contact form email to admin using SendGrid
 */
export async function sendContactEmailSendGrid(formData: ContactFormData): Promise<void> {
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

  const msg = {
    to: ADMIN_EMAIL,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@smartplates.app',
      name: 'SmartPlates Contact Form'
    },
    replyTo: {
      email: formData.email,
      name: formData.name
    },
    subject: `[SmartPlates] ${reasonLabels[formData.contactReason]}: ${formData.subject}`,
    html: htmlTemplate,
    text: `
Contact Form Submission - SmartPlates

Contact Reason: ${reasonLabels[formData.contactReason]}
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
Received on: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
    `.trim(),
  };

  await sgMail.send(msg);
}

/**
 * Send confirmation email to user using SendGrid
 */
export async function sendContactConfirmationSendGrid(userEmail: string, userName: string): Promise<void> {
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
              <a href="https://smartplates.app/recipe" class="cta">🍽️ Browse Recipes</a>
              <a href="https://smartplates.app/meal-planning" class="cta">📅 Plan Your Meals</a>
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

  const msg = {
    to: userEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@smartplates.app',
      name: 'SmartPlates'
    },
    subject: 'Thank you for contacting SmartPlates! 🍽️',
    html: htmlTemplate,
    text: `
Hi ${userName},

Thank you for reaching out to SmartPlates! We've successfully received your message and our team will get back to you within 24 hours.

In the meantime, feel free to explore our platform:
- Browse Recipes: https://smartplates.app/recipe
- Plan Your Meals: https://smartplates.app/meal-planning

We appreciate your interest in SmartPlates and look forward to helping you with your meal planning journey!

Best regards,
The SmartPlates Team

---
This is an automated confirmation from SmartPlates.
If you didn't send this message, please ignore this email.
    `.trim(),
  };

  await sgMail.send(msg);
}

/**
 * Send contact form email to admin (Primary function - tries SendGrid first, falls back to SMTP)
 */
export async function sendContactEmail(formData: ContactFormData): Promise<void> {
  try {
    // Try SendGrid first (preferred method)
    if (process.env.SENDGRID_API_KEY) {
      await sendContactEmailSendGrid(formData);
      console.log('✅ Contact email sent successfully via SendGrid');
      return;
    }
  } catch (error) {
    console.error('❌ SendGrid failed, trying SMTP fallback:', error);
  }

  // Fallback to SMTP if SendGrid fails or is not configured
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`📧 Contact form submission logged: ${formData.email} - ${formData.subject}`);
      console.log(`💬 Message: ${formData.message}`);
      return;
    }

    const reasonLabels = {
      support: 'Technical Support',
      feedback: 'Feedback & Suggestions',
      partnership: 'Business Partnership',
      other: 'Other Inquiries'
    };

    const mailOptions = {
      from: `"SmartPlates Contact Form" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      replyTo: formData.email,
      subject: `[SmartPlates Contact] ${reasonLabels[formData.contactReason]}: ${formData.subject}`,
      html: `
        <h2>New Contact Form Submission - SmartPlates</h2>
        <p><strong>Contact Reason:</strong> ${reasonLabels[formData.contactReason]}</p>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
      `,
      text: `
Contact Form Submission - SmartPlates

Contact Reason: ${reasonLabels[formData.contactReason]}
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully via SMTP');
  } catch (error) {
    console.error('❌ Both SendGrid and SMTP failed:', error);
    // Log the submission for manual processing
    console.log(`📝 MANUAL PROCESSING NEEDED: Contact from ${formData.email}`);
    throw error;
  }
}

/**
 * Send confirmation email to user (Primary function - tries SendGrid first, falls back to SMTP)
 */
export async function sendContactConfirmation(userEmail: string, userName: string): Promise<void> {
  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      await sendContactConfirmationSendGrid(userEmail, userName);
      console.log('✅ Confirmation email sent successfully via SendGrid');
      return;
    }
  } catch (error) {
    console.error('❌ SendGrid confirmation failed, trying SMTP fallback:', error);
  }

  // Fallback to SMTP
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`📧 Would send confirmation email to ${userEmail}`);
      return;
    }

    const mailOptions = {
      from: `"SmartPlates" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Thank you for contacting SmartPlates!',
      html: `
        <h2>Thank You for Contacting SmartPlates!</h2>
        <p>Hi ${userName},</p>
        <p>We've received your message and our team will get back to you within 24 hours.</p>
        <p>In the meantime, feel free to explore our recipes and meal planning features!</p>
        <p>Best regards,<br>The SmartPlates Team</p>
      `,
      text: `
Hi ${userName},

We've received your message and our team will get back to you within 24 hours.

In the meantime, feel free to explore our recipes and meal planning features!

Best regards,
The SmartPlates Team
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent successfully via SMTP');
  } catch (error) {
    console.error('❌ Confirmation email failed (not critical):', error);
    // Don't throw error for confirmation emails - they're optional
  }
}

/**
 * Dummy-Implementierung für Passwort-Reset-Mail
 * In Produktion: Echte E-Mail-Logik einbauen!
 */
export async function sendPasswordResetEmail(email: string, userId: string): Promise<void> {
	// Hier würde die echte E-Mail-Logik stehen (z.B. mit nodemailer, SendGrid, etc.)
	console.log(`Sende Passwort-Reset-Link an ${email} für User ${userId}`);
	// Simuliere kurze Verzögerung
	await new Promise((resolve) => setTimeout(resolve, 500));
}
