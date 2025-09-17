/**
 * Share Modal Component
 * 
 * Modal with various sharing options for recipes.
 */

'use client';

import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { SocialShareButtons } from './SocialShareButtons';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  recipeTitle: string;
  recipeImage?: string;
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  recipeId, 
  recipeTitle,
  recipeImage 
}: ShareModalProps) {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const recipeUrl = `${window.location.origin}/recipe/${recipeId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Recipe link copied to clipboard!",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Share Recipe</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Recipe Preview */}
          <div className="flex gap-3 p-3 bg-muted rounded-lg">
            {recipeImage && (
              <div className="w-16 h-16 rounded overflow-hidden bg-background flex-shrink-0">
                <img 
                  src={recipeImage} 
                  alt={recipeTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2">
                {recipeTitle}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                SmartPlates Recipe
              </p>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div>
            <h4 className="text-sm font-medium mb-3">Share on social media</h4>
            <SocialShareButtons
              url={recipeUrl}
              title={recipeTitle}
              description={`Check out this amazing recipe: ${recipeTitle}`}
            />
          </div>

          {/* Copy Link */}
          <div>
            <h4 className="text-sm font-medium mb-3">Or copy link</h4>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono truncate">
                {recipeUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className={cn(
                  "flex-shrink-0",
                  copied && "bg-green-50 border-green-200 text-green-700"
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
