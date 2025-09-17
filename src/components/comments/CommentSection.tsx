/**
 * Comment Section Component
 * 
 * Main component that displays comments and comment form.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

// Comment interface
export interface Comment {
  _id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CommentSectionProps {
  recipeId: string;
  initialComments?: Comment[];
}

export function CommentSection({ recipeId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch comments if not provided initially
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [recipeId, initialComments.length]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`);
      if (response.ok) {
        const fetchedComments = await response.json();
        setComments(fetchedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev => 
      prev.map(comment => 
        comment._id === updatedComment._id ? updatedComment : comment
      )
    );
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Comment Form */}
        <CommentForm 
          recipeId={recipeId}
          onCommentAdded={handleCommentAdded}
        />

        {/* Comments List */}
        <CommentList
          comments={comments}
          isLoading={isLoading}
          onCommentUpdated={handleCommentUpdated}
          onCommentDeleted={handleCommentDeleted}
        />
      </CardContent>
    </Card>
  );
}
