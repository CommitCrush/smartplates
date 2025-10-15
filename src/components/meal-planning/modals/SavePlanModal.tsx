/**
 * Save Plan Options Modal
 * 
 * Modal for choosing how to save the meal plan:
 * - Save locally as PDF
 * - Save to Google Calendar
 * - Save to both
 */

'use client';

import React, { useState } from 'react';
import { Save, Calendar, Download, FileText, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface SavePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (options: SaveOptions) => Promise<void>;
  isLoading?: boolean;
}

export interface SaveOptions {
  saveLocally: boolean;
  saveToGoogleCalendar: boolean;
  exportFormat?: 'pdf' | 'text' | 'json';
  mealPlanTitle?: string;
  includeShoppingList?: boolean;
}

export function SavePlanModal({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false 
}: SavePlanModalProps) {
  const [saveOptions, setSaveOptions] = useState<SaveOptions>({
    saveLocally: true,
    saveToGoogleCalendar: false,
    exportFormat: 'pdf',
    mealPlanTitle: '',
    includeShoppingList: false
  });

  const handleSave = async () => {
    try {
      await onSave(saveOptions);
      onClose();
    } catch (error) {
      console.error('Failed to save meal plan:', error);
      // Professional error handling
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      // You can replace this with a toast notification in the future
      alert(`Unable to save meal plan: ${errorMessage}. Please try again.`);
    }
  };

  const handleOptionChange = (key: keyof SaveOptions, value: boolean | string) => {
    setSaveOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-[#f8faf8] to-[#f0f4f0]">
        <DialogHeader className="text-center pb-4">
          {/* SmartPlates Logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#a8b89c] rounded-full p-3">
              <Save className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-[#4a5c4a] flex items-center justify-center gap-3">
            Save Meal Plan
          </DialogTitle>
          <DialogDescription className="text-[#6b7c6b] text-base">
            Export your weekly meal plan as a beautifully formatted PDF or sync with Google Calendar for easy access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meal Plan Title */}
          <div className="bg-white rounded-lg p-4 border border-[#d1ddd1] shadow-sm">
            <label className="text-sm font-semibold text-[#4a5c4a] mb-3 block">
              📋 Meal Plan Title
            </label>
            <input
              type="text"
              placeholder="e.g., Week of October 13, 2025"
              value={saveOptions.mealPlanTitle}
              onChange={(e) => handleOptionChange('mealPlanTitle', e.target.value)}
              className="w-full px-4 py-3 border border-[#d1ddd1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a8b89c] focus:border-transparent bg-[#fafcfa] text-[#4a5c4a] placeholder-[#8a9a8a]"
            />
          </div>

          {/* Save Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4a5c4a] flex items-center gap-2">
              💾 Export Options
            </h3>
            
            {/* Save as PDF */}
            <Card className={`border-2 transition-all duration-200 hover:shadow-md ${
              saveOptions.saveLocally 
                ? 'border-[#a8b89c] bg-[#f8faf8] shadow-sm' 
                : 'border-[#d1ddd1] hover:border-[#b8c8b8] bg-white'
            }`}>
              <CardContent className="p-5">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    id="save-locally"
                    checked={saveOptions.saveLocally}
                    onChange={(e) => handleOptionChange('saveLocally', e.target.checked)}
                    className="w-5 h-5 text-[#a8b89c] border-[#b8c8b8] rounded focus:ring-[#a8b89c] focus:ring-2 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="save-locally" className="flex items-center gap-3 font-semibold text-[#4a5c4a] cursor-pointer">
                      <FileText className="h-5 w-5 text-[#a8b89c]" />
                      Download as PDF
                    </label>
                    <p className="text-sm text-[#6b7c6b] mt-2 leading-relaxed">
                      Generate a beautifully formatted PDF with your weekly meal plan, perfect for printing or sharing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Include Shopping List */}
            <Card className={`border-2 transition-all duration-200 hover:shadow-md ${
              saveOptions.includeShoppingList 
                ? 'border-[#a8b89c] bg-[#f8faf8] shadow-sm' 
                : 'border-[#d1ddd1] hover:border-[#b8c8b8] bg-white'
            }`}>
              <CardContent className="p-5">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    id="include-shopping-list"
                    checked={saveOptions.includeShoppingList}
                    onChange={(e) => handleOptionChange('includeShoppingList', e.target.checked)}
                    className="w-5 h-5 text-[#a8b89c] border-[#b8c8b8] rounded focus:ring-[#a8b89c] focus:ring-2 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="include-shopping-list" className="flex items-center gap-3 font-semibold text-[#4a5c4a] cursor-pointer">
                      <ShoppingCart className="h-5 w-5 text-[#a8b89c]" />
                      Download Shopping List
                    </label>
                    <p className="text-sm text-[#6b7c6b] mt-2 leading-relaxed">
                      Generate a comprehensive grocery list with all ingredients from your meal plan, organized by category.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save to Google Calendar */}
            <Card className={`border-2 transition-all duration-200 hover:shadow-md ${
              saveOptions.saveToGoogleCalendar 
                ? 'border-[#7ba87b] bg-[#f8faf8] shadow-sm' 
                : 'border-[#d1ddd1] hover:border-[#b8c8b8] bg-white'
            }`}>
              <CardContent className="p-5">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    id="save-google"
                    checked={saveOptions.saveToGoogleCalendar}
                    onChange={(e) => handleOptionChange('saveToGoogleCalendar', e.target.checked)}
                    className="w-5 h-5 text-[#7ba87b] border-[#b8c8b8] rounded focus:ring-[#7ba87b] focus:ring-2 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="save-google" className="flex items-center gap-3 font-semibold text-[#4a5c4a] cursor-pointer">
                      <Calendar className="h-5 w-5 text-[#7ba87b]" />
                      Sync with Google Calendar
                    </label>
                    <p className="text-sm text-[#6b7c6b] mt-2 leading-relaxed">
                      Create calendar events for each meal with prep times and cooking instructions for seamless planning.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-[#d1ddd1]">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border-[#b8c8b8] text-[#6b7c6b] hover:bg-[#f0f4f0] hover:border-[#a8b89c] hover:text-[#4a5c4a] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || (!saveOptions.saveLocally && !saveOptions.saveToGoogleCalendar && !saveOptions.includeShoppingList)}
              className="px-8 py-2 bg-[#a8b89c] hover:bg-[#98a88c] text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Plan
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}