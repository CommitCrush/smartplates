/**
 * Enhanced Spoonacular Management Admin Page
 * 
 * Provides a comprehensive interface for monitoring and managing
 * enhanced Spoonacular API features including performance analytics,
 * cache optimization, and system health monitoring.
 */

'use client';

import React from 'react';
import { EnhancedSpoonacularManagement } from '@/components/admin/EnhancedSpoonacularManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';

export default function AdminEnhancedSpoonacularPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Enhanced API Management</h1>
            <p className="text-muted-foreground">
              Advanced monitoring and optimization for Spoonacular integration
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          Real-time Monitoring
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            Enhanced Features Overview
          </CardTitle>
          <CardDescription className="text-blue-600">
            This dashboard provides advanced management capabilities for the Spoonacular API integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Performance Monitoring</h4>
              <ul className="space-y-1 text-xs">
                <li>• Real-time response time tracking</li>
                <li>• Cache hit rate analytics</li>
                <li>• API quota usage monitoring</li>
                <li>• System health checks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Optimization Tools</h4>
              <ul className="space-y-1 text-xs">
                <li>• Cache warmup for popular recipes</li>
                <li>• Automatic cache optimization</li>
                <li>• Retry logic with exponential backoff</li>
                <li>• Batch processing capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Management Interface */}
      <EnhancedSpoonacularManagement />

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technical Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div>
            <strong>Cache Strategy:</strong> Multi-level caching with TTL-based expiration. 
            Recipe data cached for 7 days, search results for 24 hours.
          </div>
          <div>
            <strong>Performance Optimization:</strong> Automatic retry with exponential backoff, 
            batch processing, and intelligent quota management.
          </div>
          <div>
            <strong>Monitoring:</strong> Real-time performance metrics, health checks, 
            and proactive alerting for system issues.
          </div>
          <div className="flex items-center gap-2 pt-2">
            <strong>Documentation:</strong>
            <Button variant="link" size="sm" className="p-0 h-auto">
              <ExternalLink className="h-3 w-3 mr-1" />
              View API Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}