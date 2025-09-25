/**
 * Recipe Interactions Service
 * 
 * Handles recipe likes, reviews, ratings, and user engagement features
 * with compreh            $push: {
              activity: {
                type: 'liked_recipe',
                recipeId: new ObjectId(recipeId),
                timestamp: new Date(),
              }
            } as anyvalidation and user authentication
 */

import { MongoDBService } from '@/lib/db';
import { ObjectId } from 'mongodb';

export interface RecipeReview {
  _id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  recipeId: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  isVerifiedPurchase?: boolean;
  helpfulVotes: number;
  reportedCount: number;
  status: 'active' | 'hidden' | 'reported';
}

export interface RecipeLike {
  _id?: string;
  userId: string;
  recipeId: string;
  createdAt: Date;
}

export interface RecipeRating {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface UserInteractionSummary {
  hasLiked: boolean;
  hasReviewed: boolean;
  userRating?: number;
  userReview?: RecipeReview;
}

class RecipeInteractionsService {
  private static instance: RecipeInteractionsService;
  private mongodb: MongoDBService;

  private constructor() {
    this.mongodb = MongoDBService.getInstance();
  }

  static getInstance(): RecipeInteractionsService {
    if (!RecipeInteractionsService.instance) {
      RecipeInteractionsService.instance = new RecipeInteractionsService();
    }
    return RecipeInteractionsService.instance;
  }

  /**
   * Like or unlike a recipe
   */
  async toggleRecipeLike(recipeId: string, userId: string): Promise<{
    success: boolean;
    liked: boolean;
    totalLikes: number;
    message: string;
  }> {
    try {
      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      // Check if user already liked this recipe
      const existingLike = await db.collection('recipe_likes').findOne({
        recipeId: new ObjectId(recipeId),
        userId: userId,
      });

      let liked: boolean;

      if (existingLike) {
        // Remove like
        await db.collection('recipe_likes').deleteOne({
          _id: existingLike._id,
        });

        // Update recipe likes count
        const updateResult = await db.collection('recipes').updateOne(
          { _id: new ObjectId(recipeId) as any },
          { $inc: { likes: -1 } }
        );

        liked = false;
      } else {
        // Add like
        const likeData: RecipeLike = {
          userId: userId,
          recipeId: recipeId,
          createdAt: new Date(),
        };

        await db.collection('recipe_likes').insertOne({
          ...likeData,
          _id: likeData._id ? new ObjectId(likeData._id) : undefined
        });

        // Update recipe likes count
        await db.collection('recipes').updateOne(
          { _id: new ObjectId(recipeId) as any },
          { $inc: { likes: 1 } }
        );

        // Add to user's liked recipes
        await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          { 
            $addToSet: { likedRecipes: new ObjectId(recipeId) },
            $push: {
              activity: {
                type: 'recipe_liked',
                recipeId: new ObjectId(recipeId),
                timestamp: new Date(),
              }
            } as any
          }
        );

        liked = true;
      }

      // Get updated total likes
      const recipe = await db.collection('recipes').findOne(
        { _id: new ObjectId(recipeId) as any },
        { projection: { likes: 1 } }
      );

      const totalLikes = recipe?.likes || 0;

      return {
        success: true,
        liked,
        totalLikes,
        message: liked ? 'Rezept zu Favoriten hinzugefügt' : 'Rezept aus Favoriten entfernt',
      };
    } catch (error) {
      console.error('Error toggling recipe like:', error);
      return {
        success: false,
        liked: false,
        totalLikes: 0,
        message: 'Fehler beim Aktualisieren der Bewertung',
      };
    }
  }

  /**
   * Add or update a recipe review
   */
  async submitRecipeReview(
    recipeId: string, 
    userId: string, 
    userName: string,
    rating: number, 
    comment: string,
    userAvatar?: string
  ): Promise<{
    success: boolean;
    review?: RecipeReview;
    message: string;
  }> {
    try {
      // Validate input
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          message: 'Bewertung muss zwischen 1 und 5 Sternen liegen',
        };
      }

      if (!comment.trim() || comment.length < 10) {
        return {
          success: false,
          message: 'Kommentar muss mindestens 10 Zeichen lang sein',
        };
      }

      if (comment.length > 1000) {
        return {
          success: false,
          message: 'Kommentar darf maximal 1000 Zeichen lang sein',
        };
      }

      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      // Check if user already reviewed this recipe
      const existingReview = await db.collection('recipe_reviews').findOne({
        recipeId: new ObjectId(recipeId),
        userId: userId,
      });

      const reviewData: Partial<RecipeReview> = {
        userId: userId,
        userName: userName,
        userAvatar: userAvatar,
        recipeId: recipeId,
        rating: rating,
        comment: comment.trim(),
        updatedAt: new Date(),
        helpfulVotes: 0,
        reportedCount: 0,
        status: 'active',
      };

      let review: RecipeReview;

      if (existingReview) {
        // Update existing review
        reviewData.createdAt = existingReview.createdAt;
        
        await db.collection('recipe_reviews').updateOne(
          { _id: existingReview._id },
          { $set: reviewData }
        );

        review = { ...reviewData, _id: existingReview._id.toString() } as RecipeReview;
      } else {
        // Create new review
        reviewData.createdAt = new Date();
        
        const result = await db.collection('recipe_reviews').insertOne({
          ...reviewData,
          _id: reviewData._id ? new ObjectId(reviewData._id) : undefined
        });
        review = { ...reviewData, _id: result.insertedId.toString() } as RecipeReview;

        // Add to user activity
        await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          {
            $push: {
              activity: {
                type: 'reviewed_recipe',
                recipeId: new ObjectId(recipeId),
                rating: reviewData.rating!,
                timestamp: new Date(),
              }
            } as any
          }
        );
      }

      // Recalculate recipe rating statistics
      await this.updateRecipeRatingStats(recipeId);

      return {
        success: true,
        review,
        message: existingReview ? 'Bewertung aktualisiert' : 'Bewertung hinzugefügt',
      };
    } catch (error) {
      console.error('Error submitting recipe review:', error);
      return {
        success: false,
        message: 'Fehler beim Speichern der Bewertung',
      };
    }
  }

  /**
   * Get all reviews for a recipe with pagination
   */
  async getRecipeReviews(
    recipeId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' = 'newest'
  ): Promise<{
    success: boolean;
    reviews: RecipeReview[];
    totalReviews: number;
    currentPage: number;
    totalPages: number;
    ratingStats: RecipeRating;
  }> {
    try {
      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      // Define sort options
      const sortOptions: Record<string, any> = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        rating_high: { rating: -1, createdAt: -1 },
        rating_low: { rating: 1, createdAt: -1 },
        helpful: { helpfulVotes: -1, createdAt: -1 },
      };

      const skip = (page - 1) * limit;

      // Get reviews with pagination
      const reviews = await db.collection('recipe_reviews')
        .find({ 
          recipeId: recipeId,
          status: 'active',
        })
        .sort(sortOptions[sortBy])
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get total count
      const totalReviews = await db.collection('recipe_reviews').countDocuments({
        recipeId: recipeId,
        status: 'active',
      });

      const totalPages = Math.ceil(totalReviews / limit);

      // Get rating statistics
      const ratingStats = await this.getRecipeRatingStats(recipeId);

      return {
        success: true,
        reviews: reviews.map(review => ({
          ...review,
          _id: review._id.toString()
        })) as RecipeReview[],
        totalReviews,
        currentPage: page,
        totalPages,
        ratingStats,
      };
    } catch (error) {
      console.error('Error getting recipe reviews:', error);
      return {
        success: false,
        reviews: [],
        totalReviews: 0,
        currentPage: 1,
        totalPages: 0,
        ratingStats: {
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }
  }

  /**
   * Get user's interaction status with a recipe
   */
  async getUserRecipeInteractionStatus(
    recipeId: string,
    userId: string
  ): Promise<UserInteractionSummary> {
    try {
      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      // Check if user liked the recipe
      const like = await db.collection('recipe_likes').findOne({
        recipeId: recipeId,
        userId: userId,
      });

      // Check if user reviewed the recipe
      const review = await db.collection('recipe_reviews').findOne({
        recipeId: recipeId,
        userId: userId,
        status: 'active',
      });

      return {
        hasLiked: !!like,
        hasReviewed: !!review,
        userRating: review?.rating,
        userReview: review ? { ...review, _id: review._id.toString() } as RecipeReview : undefined,
      };
    } catch (error) {
      console.error('Error getting user interaction status:', error);
      return {
        hasLiked: false,
        hasReviewed: false,
      };
    }
  }

  /**
   * Get recipe rating statistics
   */
  async getRecipeRatingStats(recipeId: string): Promise<RecipeRating> {
    try {
      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      // Get rating distribution using aggregation
      const ratingStats = await db.collection('recipe_reviews').aggregate([
        {
          $match: {
            recipeId: recipeId,
            status: 'active',
          }
        },
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratings: { $push: '$rating' },
          }
        },
        {
          $addFields: {
            ratingDistribution: {
              5: {
                $size: {
                  $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 5] } }
                }
              },
              4: {
                $size: {
                  $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 4] } }
                }
              },
              3: {
                $size: {
                  $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 3] } }
                }
              },
              2: {
                $size: {
                  $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 2] } }
                }
              },
              1: {
                $size: {
                  $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 1] } }
                }
              },
            }
          }
        }
      ]).toArray();

      if (ratingStats.length === 0) {
        return {
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }

      const stats = ratingStats[0];
      return {
        totalRatings: stats.totalRatings,
        averageRating: Math.round(stats.averageRating * 10) / 10, // Round to 1 decimal
        ratingDistribution: stats.ratingDistribution,
      };
    } catch (error) {
      console.error('Error getting recipe rating stats:', error);
      return {
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
  }

  /**
   * Update recipe rating statistics in the main recipe document
   */
  private async updateRecipeRatingStats(recipeId: string): Promise<void> {
    try {
      const stats = await this.getRecipeRatingStats(recipeId);

      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      await db.collection('recipes').updateOne(
        { _id: new ObjectId(recipeId) as any },
        {
          $set: {
            averageRating: stats.averageRating,
            totalReviews: stats.totalRatings,
            ratingDistribution: stats.ratingDistribution,
            updatedAt: new Date(),
          }
        }
      );
    } catch (error) {
      console.error('Error updating recipe rating stats:', error);
    }
  }

  /**
   * Delete a review (admin or user self-delete)
   */
  async deleteRecipeReview(
    reviewId: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      // Find the review
      const review = await db.collection('recipe_reviews').findOne({
        _id: new ObjectId(reviewId) as any,
      });

      if (!review) {
        return {
          success: false,
          message: 'Bewertung nicht gefunden',
        };
      }

      // Check permissions
      if (!isAdmin && review.userId !== userId) {
        return {
          success: false,
          message: 'Keine Berechtigung zum Löschen dieser Bewertung',
        };
      }

      // Delete the review
      await db.collection('recipe_reviews').deleteOne({
        _id: new ObjectId(reviewId) as any,
      });

      // Update recipe statistics
      await this.updateRecipeRatingStats(review.recipeId);

      return {
        success: true,
        message: 'Bewertung gelöscht',
      };
    } catch (error) {
      console.error('Error deleting recipe review:', error);
      return {
        success: false,
        message: 'Fehler beim Löschen der Bewertung',
      };
    }
  }

  /**
   * Report a review for inappropriate content
   */
  async reportReview(
    reviewId: string,
    reportingUserId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      // Increment report count
      await db.collection('recipe_reviews').updateOne(
        { _id: new ObjectId(reviewId) as any },
        { $inc: { reportedCount: 1 } }
      );

      // Create report record
      await db.collection('review_reports').insertOne({
        reviewId: new ObjectId(reviewId),
        reportingUserId: reportingUserId,
        reason: reason,
        createdAt: new Date(),
        status: 'pending',
      });

      return {
        success: true,
        message: 'Bewertung gemeldet',
      };
    } catch (error) {
      console.error('Error reporting review:', error);
      return {
        success: false,
        message: 'Fehler beim Melden der Bewertung',
      };
    }
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(
    reviewId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    helpfulCount: number;
  }> {
    try {
      await this.mongodb.connect();
      const db = await this.mongodb.getDatabase();

      // Check if user already marked as helpful
      const existingVote = await db.collection('helpful_votes').findOne({
        reviewId: new ObjectId(reviewId),
        userId: userId,
      });

      if (existingVote) {
        return {
          success: false,
          message: 'Bereits als hilfreich markiert',
          helpfulCount: 0,
        };
      }

      // Add helpful vote
      await db.collection('helpful_votes').insertOne({
        reviewId: new ObjectId(reviewId),
        userId: userId,
        createdAt: new Date(),
      });

      // Increment helpful count
      const result = await db.collection('recipe_reviews').updateOne(
        { _id: new ObjectId(reviewId) as any },
        { $inc: { helpfulVotes: 1 } }
      );

      const review = await db.collection('recipe_reviews').findOne(
        { _id: new ObjectId(reviewId) as any },
        { projection: { helpfulVotes: 1 } }
      );

      return {
        success: true,
        message: 'Als hilfreich markiert',
        helpfulCount: review?.helpfulVotes || 0,
      };
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return {
        success: false,
        message: 'Fehler beim Markieren als hilfreich',
        helpfulCount: 0,
      };
    }
  }
}

export const recipeInteractionsService = RecipeInteractionsService.getInstance();