/**
 * Meal Planning Toolbar Component
 * 
 * Provides toolbar actions for meal planning functionality
 */

import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Copy, 
  Save, 
  RotateCcw, 
  Download, 
  Share2, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealPlanningToolbarProps {
  onAddMeal?: () => void;
  onCopyWeek?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  className?: string;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

export function MealPlanningToolbar({
  onAddMeal,
  onCopyWeek,
  onSave,
  onReset,
  onExport,
  onShare,
  onSettings,
  className,
  saveStatus = 'idle'
}: MealPlanningToolbarProps) {
  return (
    <div className={cn('flex items-center gap-2 p-2 bg-muted/50 rounded-lg', className)}>
      {/* Add meal button */}
      {onAddMeal && (
        <Button variant="outline" size="sm" onClick={onAddMeal}>
          <Plus className="h-4 w-4 mr-1" />
          Add Meal
        </Button>
      )}

      {/* Copy week button */}
      {onCopyWeek && (
        <Button variant="outline" size="sm" onClick={onCopyWeek}>
          <Copy className="h-4 w-4 mr-1" />
          Copy Week
        </Button>
      )}

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Save button */}
      {onSave && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSave}
          disabled={saveStatus === 'saving'}
        >
          <Save className="h-4 w-4 mr-1" />
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
      )}

      {/* Reset button */}
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Export button */}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      )}

      {/* Share button */}
      {onShare && (
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      )}

      {/* Settings button */}
      {onSettings && (
        <Button variant="outline" size="sm" onClick={onSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}