/**
 * Contact Form API Route
 * 
 * Handles contact form submissions from the contact page
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { sendContactEmail, sendContactConfirmation, ContactFormData } from '@/services/emailService';

// ========================================
// POST /api/contact
// ========================================
export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    // Validate required fields
    const { name, email, subject, message, contactReason } = body;
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'Name, email, subject, and message are required'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          details: 'Please provide a valid email address'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData: ContactFormData = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 100),
      subject: subject.trim().substring(0, 200),
      message: message.trim().substring(0, 2000),
      contactReason: contactReason || 'other'
    };

    // Validate contact reason
    const validReasons = ['support', 'feedback', 'partnership', 'other'];
    if (!validReasons.includes(sanitizedData.contactReason)) {
      sanitizedData.contactReason = 'other';
    }

    // Connect to database and save the contact form submission
    try {
      const db = await connectToDatabase();
      const contactCollection = db.collection('contact_submissions');

      const contactSubmission = {
        ...sanitizedData,
        submittedAt: new Date(),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'pending'
      };

      // Save to database
      const result = await contactCollection.insertOne(contactSubmission);
      console.log('Contact submission saved to database:', result.insertedId);
    } catch (dbError) {
      console.error('Failed to save to database:', dbError);
      // Continue processing - don't fail if database is unavailable
    }

    // Send email to admin
    try {
      await sendContactEmail(sanitizedData);
      console.log('Contact email sent successfully to admin');
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
      // Continue processing - don't fail the request if email fails
    }

    // Send confirmation email to user (optional)
    try {
      await sendContactConfirmation(sanitizedData.email, sanitizedData.name);
      console.log('Confirmation email sent to user');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue processing - confirmation email is optional
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Contact form submitted successfully. We will get back to you within 24 hours!',
        reference: `SP-${Date.now()}`
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'Failed to process contact form submission. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET /api/contact (for admin use - get all submissions)
// ========================================
export async function GET() {
  try {
    const db = await connectToDatabase();
    const contactCollection = db.collection('contact_submissions');
    
    const submissions = await contactCollection
      .find({})
      .sort({ submittedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(
      { 
        success: true,
        submissions 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to fetch contact submissions:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'Failed to fetch contact submissions'
      },
      { status: 500 }
    );
  }
}