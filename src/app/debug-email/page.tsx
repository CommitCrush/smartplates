/**
 * Email Debug Page
 * Test email functionality from the browser
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function EmailDebugPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Debug Test User',
    email: 'debugtest@example.com',
    password: 'password123'
  });

  const testEmailService = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'GET',
      });
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: 'Failed to test email service', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  const testRegistration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.password,
        }),
      });
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: 'Failed to test registration', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          📧 Email Debug Tool
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Email Service</h2>
          <p className="text-gray-600 mb-4">
            Test if Resend email service is configured and working.
            Should send an email to smartplates.group@gmail.com
          </p>
          <Button 
            onClick={testEmailService} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Email Service'}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Test Registration</h2>
          <p className="text-gray-600 mb-4">
            Test the complete registration flow including email sending.
          </p>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <Button 
            onClick={testRegistration} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Testing Registration...' : 'Test Registration Flow'}
          </Button>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
            
            {testResult.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-medium">✅ Success!</p>
                <p className="text-green-700 text-sm mt-1">
                  {testResult.message}
                </p>
                {testResult.autoVerified === false && (
                  <p className="text-green-700 text-sm mt-2">
                    📬 Check smartplates.group@gmail.com for the verification email
                  </p>
                )}
              </div>
            )}
            
            {testResult.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-medium">❌ Error</p>
                <p className="text-red-700 text-sm mt-1">
                  {testResult.error}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">🔍 Debug Info</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Environment:</strong> Development</p>
            <p><strong>Email Redirect:</strong> smartplates.group@gmail.com</p>
            <p><strong>Site URL:</strong> http://localhost:3000</p>
            <p><strong>Team Emails:</strong> Auto-verified (no email sent)</p>
          </div>
        </div>
      </div>
    </div>
  );
}