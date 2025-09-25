/**
 * Contact Form API Route
 * 
 * Handles contact form submissions from the contact page
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactReason: 'support' | 'feedback' | 'partnership' | 'other';
}

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

    // Connect to database and save the contact form submission
    await connectToDatabase();

    // For now, we'll just log the contact form submission
    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    
    console.log('Contact form submission received:', {
      name,
      email,
      subject,
      contactReason,
      submittedAt: new Date().toISOString(),
      messageLength: message.length
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, you might save to a contacts collection:
    /*
    const contactsCollection = db.collection('contacts');
    const contactEntry = {
      name,
      email,
      subject,
      message,
      contactReason,
      status: 'new',
      submittedAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    await contactsCollection.insertOne(contactEntry);
    */

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      data: {
        submittedAt: new Date().toISOString(),
        contactReason,
        reference: `SP-${Date.now()}` // Simple reference number
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to submit contact form',
        details: 'Please try again later or contact us directly via email'
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET /api/contact (for admin purposes)
// ========================================
export async function GET(request: NextRequest) {
  try {
    // This could be used by admin to retrieve contact submissions
    // For now, just return a simple status
    
    return NextResponse.json({
      status: 'Contact API is working',
      endpoints: {
        POST: 'Submit contact form',
        GET: 'Admin: Retrieve contact submissions (not implemented)'
      }
    });

  } catch (error) {
    console.error('Contact API GET error:', error);
    
    return NextResponse.json(
      { error: 'API error' },
      { status: 500 }
    );
  }
}