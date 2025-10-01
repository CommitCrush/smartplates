/**
 * Save Plan Options Modal
 * 
 * Modal for choosing how to save the meal plan:
 * - Save locally
 * - Save to Google Calendar
 * - Save to both
 */

'use client';

import React, { useState } from 'react';
import { Save, Calendar, Download, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Using regular HTML checkbox for now
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface SavePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (options: SaveOptions) => Promise<void>;
  isLoading?: boolean;
}

export interface SaveOptions {
  saveLocally: boolean;
  saveToGoogleCalendar: boolean;
  includeShoppingList: boolean;
  exportFormat?: 'pdf' | 'text' | 'json';
  mealPlanTitle?: string;
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
    includeShoppingList: true,
    exportFormat: 'pdf',
    mealPlanTitle: ''
  });

  const handleSave = async () => {
    try {
      await onSave(saveOptions);
      onClose();
    } catch (error) {
      console.error('Failed to save meal plan:', error);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Meal Plan
          </DialogTitle>
          <DialogDescription>
            Choose how you&apos;d like to save your meal plan. You can save locally, to Google Calendar, or both.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meal Plan Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Meal Plan Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Week of September 15, 2025"
              value={saveOptions.mealPlanTitle}
              onChange={(e) => handleOptionChange('mealPlanTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Save Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Save Options</h3>
            
            {/* Save Locally */}
            <Card className="border-2 hover:border-primary-200 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="save-locally"
                    checked={saveOptions.saveLocally}
                    onChange={(e) => handleOptionChange('saveLocally', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="save-locally" className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer">
                      <Download className="h-4 w-4 text-primary-600" />
                      Save to App Database
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Save your meal plan to your SmartPlates account for easy access and editing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save to Google Calendar */}
            <Card className="border-2 hover:border-primary-200 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="save-google"
                    checked={saveOptions.saveToGoogleCalendar}
                    onChange={(e) => handleOptionChange('saveToGoogleCalendar', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="save-google" className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Add to Google Calendar
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Create calendar events for each meal, including prep time and cooking instructions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Include Shopping List */}
            <Card className="border-2 hover:border-primary-200 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="include-shopping"
                    checked={saveOptions.includeShoppingList}
                    onChange={(e) => handleOptionChange('includeShoppingList', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="include-shopping" className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer">
                      <Check className="h-4 w-4 text-green-600" />
                      Generate Shopping List
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically create a shopping list based on your planned meals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || (!saveOptions.saveLocally && !saveOptions.saveToGoogleCalendar)}
              className="min-w-[100px]"
            >
              {isLoading ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}