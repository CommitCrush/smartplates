/**
 * Forgot Password API Route
 * Handles password reset email requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/models/User';
import { sendPasswordResetEmail } from '@/services/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'E-Mail-Adresse ist erforderlich' 
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ungültiges E-Mail-Format' 
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await findUserByEmail(email);
    
    // Always return success to prevent email enumeration attacks
    // but only send email if user exists
    if (user) {
      // Generate password reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      await updateUser(user._id!, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      // Send reset email
      try {
        await sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          resetToken: resetToken,
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    // Always return success response
    return NextResponse.json({
      success: true,
      message: 'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Reset-Link gesendet.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Interner Serverfehler. Bitte versuchen Sie es erneut.' 
      },
      { status: 500 }
    );
  }
}