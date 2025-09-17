/**
 * Rating Input Component
 * 
 * Interactive rating input for users to rate recipes.
 */

'use client';

import React, { useState } from 'react';
import { RatingStars } from './RatingStars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface RatingInputProps {
  recipeId: string;
  currentUserRating?: number;
  onRatingSubmit?: (rating: number, comment?: string) => Promise<void>;
}

export function RatingInput({ 
  recipeId, 
  currentUserRating = 0,
  onRatingSubmit 
}: RatingInputProps) {
  const [rating, setRating] = useState(currentUserRating);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (onRatingSubmit) {
        await onRatingSubmit(rating, comment);
      } else {
        // Default API call
        const response = await fetch(`/api/recipes/${recipeId}/rating`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            comment: comment.trim() || undefined
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit rating');
        }
      }

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {currentUserRating > 0 ? 'Update Your Rating' : 'Rate This Recipe'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Star Rating Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Your Rating
          </label>
          <RatingStars
            rating={rating}
            interactive
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        {/* Optional Comment */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Comment (Optional)
          </label>
          <Textarea
            placeholder="Share your thoughts about this recipe..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 
           currentUserRating > 0 ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </CardContent>
    </Card>
  );
}
