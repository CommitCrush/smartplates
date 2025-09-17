/**
 * Recipe Instructions Component
 * 
 * Displays step-by-step cooking instructions.
 * Includes interactive step tracking.
 */

'use client';

import React, { useState } from 'react';
import { Clock, Check } from 'lucide-react';
import { RecipeStep } from '@/types/recipe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RecipeInstructionsProps {
  instructions: RecipeStep[];
}

export function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStepComplete = (stepNumber: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepNumber)
        ? prev.filter(s => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const isStepCompleted = (stepNumber: number) => completedSteps.includes(stepNumber);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
        {completedSteps.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Progress: {completedSteps.length} of {instructions.length} steps completed
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {instructions.map((step, index) => (
            <div 
              key={step.stepNumber || index} 
              className={cn(
                "flex gap-4 p-4 rounded-lg border transition-all",
                isStepCompleted(step.stepNumber || index + 1)
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "bg-background border-border"
              )}
            >
              {/* Step Number Circle */}
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStepComplete(step.stepNumber || index + 1)}
                  className={cn(
                    "h-8 w-8 rounded-full p-0",
                    isStepCompleted(step.stepNumber || index + 1)
                      ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                      : "hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {isStepCompleted(step.stepNumber || index + 1) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">
                      {step.stepNumber || index + 1}
                    </span>
                  )}
                </Button>
              </div>

              {/* Step Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">
                    Step {step.stepNumber || index + 1}
                  </h4>
                  
                  {/* Step timing info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {(step as any).duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{(step as any).duration} min</span>
                      </div>
                    )}
                    {(step as any).temperature && (
                      <span>{(step as any).temperature}°C</span>
                    )}
                  </div>
                </div>

                <p className={cn(
                  "text-foreground leading-relaxed",
                  isStepCompleted(step.stepNumber || index + 1) && "line-through opacity-70"
                )}>
                  {(step as any).instruction}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Completion summary */}
        {completedSteps.length === instructions.length && instructions.length > 0 && (
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-950/30 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              🎉 Recipe Complete!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Great job! You have completed all the steps. Enjoy your meal!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
