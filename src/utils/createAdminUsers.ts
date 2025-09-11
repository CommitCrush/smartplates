/**
 * Admin User Creation Script
 * Creates default admin users for testing and initial setup
 */

import { createUser, findUserByEmail } from '@/models/User';
import { User } from '@/types/user';

/**
 * Result type for admin user creation
 */
type AdminCreationResult = 
  | { success: true; admin: User }
  | { success: false; error: string; admin?: undefined };

export async function createDefaultAdminUsers() {
  const adminUsers = [
    {
      name: 'Admin User',
      email: 'admin@smartplates.dev',
      password: 'admin123',
      role: 'admin' as const,
    },
    {
      name: 'Super Admin',
      email: 'superadmin@smartplates.dev', 
      password: 'superadmin123',
      role: 'admin' as const,
    }
  ];

  const results = [];

  for (const adminData of adminUsers) {
    try {
      // Check if admin already exists
      const existingAdmin = await findUserByEmail(adminData.email);
      
      if (existingAdmin) {
        console.log(`✅ Admin ${adminData.email} already exists`);
        results.push({ email: adminData.email, status: 'exists' });
        continue;
      }

      // Create admin user
      const newAdmin = await createUser(adminData);
      console.log(`🎉 Created admin: ${adminData.email}`);
      results.push({ 
        email: adminData.email, 
        status: 'created',
        id: newAdmin._id 
      });

    } catch (error) {
      console.error(`❌ Failed to create admin ${adminData.email}:`, error);
      results.push({ 
        email: adminData.email, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Create a single admin user
 */
export async function createAdminUser(
  name: string, 
  email: string, 
  password: string
): Promise<AdminCreationResult> {
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const adminUser = await createUser({
      name,
      email,
      password,
      role: 'admin',
    });

    return { success: true, admin: adminUser };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
