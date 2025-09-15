/**
 * SmartPlates Team Configuration
 * 
 * Manages admin access and role assignment for the development team.
 * This file contains the team member emails and role configuration.
 */

export interface TeamConfig {
  admins: string[];
  devMode: boolean;
  defaultRole: 'user' | 'admin';
  teamName: string;
}

/**
 * Team configuration for SmartPlates development
 * Add your team member emails here to grant admin access
 */
export const teamConfig: TeamConfig = {
  // 👥 Team Member Admin List
  admins: [
    // Core Development Team
    'esse@gmail.com',           // Team Member - Esse
    'rozen@gmail.com',          // Team Member - Rozen  
    'monika@gmail.com',         // Team Member - Monika
    'balta@gmail.com',          // Team Member - Balta
    'hana@gmail.com',           // Team Member - Hana
    
    // Alternative email patterns (add variations if needed)
    'esse.dev@gmail.com',
    'rozen.dev@gmail.com', 
    'monika.dev@gmail.com',
    'balta.dev@gmail.com',
    'hana.dev@gmail.com',
    
    // Shared admin account
    'admin@smartplates.com',
    'smartplates.admin@gmail.com',
  ],
  
  // Development mode: disabled for proper role-based access control
  devMode: false, // Keep false for proper admin-only access
  
  // Default role for new users (non-team members)
  defaultRole: 'user', // Only team members get admin access
  
  // Team identifier
  teamName: 'SmartPlates Development Team',
};

/**
 * Determines if an email should have admin access
 * @param email - User email to check
 * @returns True if user should be admin
 */
export function shouldBeAdmin(email: string): boolean {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // 🔒 Development mode: disabled for proper role-based access
  if (teamConfig.devMode) {
    console.log(`[Team Config] Development mode: ${normalizedEmail} granted admin access`);
    return true;
  }
  
  // ✅ Check if email is in team admin list
  if (teamConfig.admins.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail)) {
    console.log(`[Team Config] Team member: ${normalizedEmail} granted admin access`);
    return true;
  }
  
  // ✅ Check if email contains 'admin' keyword
  if (normalizedEmail.includes('admin')) {
    console.log(`[Team Config] Admin keyword: ${normalizedEmail} granted admin access`);
    return true;
  }
  
  // 📋 Default role configuration for non-team members
  const isDefaultAdmin = teamConfig.defaultRole === 'admin';
  if (isDefaultAdmin) {
    console.log(`[Team Config] Default admin role: ${normalizedEmail} granted admin access`);
  }
  
  return isDefaultAdmin;
}

/**
 * Get team member info for admin dashboard
 * @returns Array of team member information
 */
export function getTeamInfo() {
  return {
    teamName: teamConfig.teamName,
    memberCount: teamConfig.admins.filter(email => !email.includes('admin')).length,
    devMode: teamConfig.devMode,
    defaultRole: teamConfig.defaultRole,
  };
}

/**
 * Check if email belongs to a team member
 * @param email - Email to check
 * @returns True if email is a team member
 */
export function isTeamMember(email: string): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return teamConfig.admins.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
}
