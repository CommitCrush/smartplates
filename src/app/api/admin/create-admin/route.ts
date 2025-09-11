/**
 * Admin Creation API Route
 * Creates admin users for testing purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDefaultAdminUsers, createAdminUser } from '@/utils/createAdminUsers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if request is for creating default admins
    if (body.action === 'create-defaults') {
      const results = await createDefaultAdminUsers();
      
      return NextResponse.json({
        success: true,
        message: 'Default admin creation completed',
        results
      });
    }
    
    // Create custom admin user
    const { name, email, password } = body;
    
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and password are required'
      }, { status: 400 });
    }
    
    const result = await createAdminUser(name, email, password);
    
    if (result.success && result.admin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        admin: {
          id: result.admin._id?.toString(),
          name: result.admin.name,
          email: result.admin.email,
          role: result.admin.role
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin creation endpoint',
    usage: {
      'POST with action: create-defaults': 'Creates default admin users',
      'POST with name, email, password': 'Creates custom admin user'
    }
  });
}
