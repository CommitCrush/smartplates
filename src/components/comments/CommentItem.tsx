/**
 * Comment Item Component
 * 
 * Individual comment display with edit/delete functionality.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Comment } from './CommentSection';

interface CommentItemProps {
  comment: Comment;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

export function CommentItem({ 
  comment, 
  onCommentUpdated,
  onCommentDeleted 
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // TODO: Get current user from auth context
  const currentUserId = 'user-id'; // Replace with actual user ID from auth
  const isOwner = currentUserId === comment.userId;

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Comment Required",
        description: "Comment cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/recipes/${comment.recipeId}/comments/${comment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const updatedComment = await response.json();
      
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment);
      }

      setIsEditing(false);
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recipes/${comment.recipeId}/comments/${comment._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      if (onCommentDeleted) {
        onCommentDeleted(comment._id);
      }

      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="flex gap-3 p-4 border rounded-lg">
      {/* User Avatar */}
      <Avatar className="h-10 w-10">
        {comment.userAvatar ? (
          <Image 
            src={comment.userAvatar} 
            alt={comment.userName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center h-full">
            {comment.userName.charAt(0).toUpperCase()}
          </div>
        )}
      </Avatar>

      {/* Comment Content */}
      <div className="flex-1 space-y-2">
        {/* Comment Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">{comment.userName}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {formatDate(new Date(comment.createdAt))}
            </span>
          </div>

          {/* Action Menu (only for comment owner) */}
          {isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteComment}
                  className="text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment Content - Edit Mode */}
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              maxLength={1000}
              disabled={isUpdating}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {editContent.length}/1000 characters
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdateComment}
                  disabled={isUpdating || !editContent.trim()}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Comment Content - Display Mode */
          <p className="text-foreground whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Updated indicator */}
        {new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime() && !isEditing && (
          <p className="text-xs text-muted-foreground italic">
            (edited)
          </p>
        )}
      </div>
    </div>
  );
}
