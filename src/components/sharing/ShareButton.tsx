/**
 * Share Button Component
 * 
 * Main share button that triggers the share modal.
 */

'use client';

import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
  recipeId: string;
  recipeTitle: string;
  recipeImage?: string;
  size?: 'sm' | 'lg' | 'default' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function ShareButton({ 
  recipeId,
  recipeTitle,
  recipeImage,
  size = 'default',
  variant = 'outline',
  className 
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipeId={recipeId}
        recipeTitle={recipeTitle}
        recipeImage={recipeImage}
      />
    </>
  );
}
