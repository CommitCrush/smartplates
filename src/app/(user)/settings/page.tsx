/**
 * Settings page redirect
 * Redirects to user-specific settings page
 */

import { redirect } from 'next/navigation';

export default function SettingsPage() {
  // Redirect to user-specific settings
  redirect('/user/settings');
}