/**
 * Change Email API Route
 * 
 * Allows authenticated users to change their email address with verification
 * PUT /api/users/change-email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase, getCollection, COLLECTIONS } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { newEmail, currentPassword } = await request.json();

    // Validation
    if (!newEmail || !currentPassword) {
      return NextResponse.json(
        { error: 'New email and current password are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (newEmail === session.user.email) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const usersCollection = await getCollection(COLLECTIONS.USERS);

    // Find current user
    const user = await usersCollection.findOne({
      email: session.user.email
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    if (!user.password) {
      return NextResponse.json(
        { error: 'No password set for this account. This account may be using social login and cannot change email.' },
        { status: 400 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new email is already in use
    const existingUser = await usersCollection.findOne({
      email: newEmail
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email address is already in use by another account' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store pending email change
    await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          pendingEmailChange: {
            newEmail: newEmail,
            verificationToken: verificationToken,
            expiresAt: verificationExpiry,
            createdAt: new Date()
          },
          updatedAt: new Date()
        }
      }
    );

    // In a real application, you would send an email here
    // For this demo, we'll just log the verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email-change?token=${verificationToken}`;
    
    console.log(`📧 Email change verification URL for ${session.user.email} -> ${newEmail}:`);
    console.log(`🔗 ${verificationUrl}`);

    // In production, send email using a service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer
    // - Resend
    /*
    await sendVerificationEmail({
      to: newEmail,
      from: 'noreply@smartplates.app',
      subject: 'Verify Your New Email Address - SmartPlates',
      html: `
        <h2>Email Change Verification</h2>
        <p>You requested to change your SmartPlates email address from <strong>${session.user.email}</strong> to <strong>${newEmail}</strong>.</p>
        <p>Please click the link below to verify your new email address:</p>
        <a href="${verificationUrl}">Verify New Email Address</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this change, please ignore this email.</p>
      `
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Verification email sent to your new email address',
      // For demo purposes, include the verification URL
      verificationUrl: process.env.NODE_ENV === 'development' ? verificationUrl : undefined
    });

  } catch (error) {
    console.error('PUT /api/users/change-email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate email change',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}