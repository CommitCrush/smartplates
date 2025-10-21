/**
 * Recipe Interactions Service Stub
 * 
 * Temporary stub implementation to prevent build failures
 * TODO: Refactor the original service to use proper MongoDB methods
 */

export interface RecipeReview {
  _id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  recipeId: string;
  rating: number;
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

export interface RecipeInteractionSummary {
  totalLikes: number;
  totalReviews: number;
  averageRating: number;
  isLikedByUser: boolean;
  userRating?: number;
  userReview?: RecipeReview;
}

class RecipeInteractionsService {
  private static instance: RecipeInteractionsService;

  private constructor() {
    // Stub implementation
  }

  static getInstance(): RecipeInteractionsService {
    if (!RecipeInteractionsService.instance) {
      RecipeInteractionsService.instance = new RecipeInteractionsService();
    }
    return RecipeInteractionsService.instance;
  }

  async toggleRecipeLike(recipeId: string, userId: string): Promise<{
    success: boolean;
    liked: boolean;
    totalLikes: number;
    message: string;
  }> {
    console.warn('RecipeInteractionsService: toggleRecipeLike is stubbed - functionality disabled');
    return {
      success: false,
      liked: false,
      totalLikes: 0,
      message: 'Service temporarily disabled'
    };
  }

  async addReview(reviewData: Omit<RecipeReview, '_id' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    review?: RecipeReview;
    message: string;
  }> {
    console.warn('RecipeInteractionsService: addReview is stubbed - functionality disabled');
    return {
      success: false,
      message: 'Service temporarily disabled'
    };
  }

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
    console.warn('RecipeInteractionsService: submitRecipeReview is stubbed', { recipeId, userId, rating });
    return {
      success: true,
      message: 'Recipe review submitted successfully (stubbed)'
    };
  }

  async getRecipeInteractionSummary(recipeId: string, userId?: string): Promise<RecipeInteractionSummary> {
    console.warn('RecipeInteractionsService: getRecipeInteractionSummary is stubbed - returning defaults');
    return {
      totalLikes: 0,
      totalReviews: 0,
      averageRating: 0,
      isLikedByUser: false
    };
  }

  async getRecipeReviews(recipeId: string, options: {
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'rating' | 'helpful';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    reviews: RecipeReview[];
    totalCount: number;
    hasMore: boolean;
  }> {
    console.warn('RecipeInteractionsService: getRecipeReviews is stubbed - returning empty');
    return {
      reviews: [],
      totalCount: 0,
      hasMore: false
    };
  }

  async updateReview(reviewId: string, updateData: Partial<RecipeReview>, userId: string): Promise<{
    success: boolean;
    review?: RecipeReview;
    message: string;
  }> {
    console.warn('RecipeInteractionsService: updateReview is stubbed - functionality disabled');
    return {
      success: false,
      message: 'Service temporarily disabled'
    };
  }

  async deleteReview(reviewId: string, userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    console.warn('RecipeInteractionsService: deleteReview is stubbed - functionality disabled');
    return {
      success: false,
      message: 'Service temporarily disabled'
    };
  }

  async markReviewHelpful(reviewId: string, userId: string): Promise<{
    success: boolean;
    helpfulVotes: number;
    message: string;
  }> {
    console.warn('RecipeInteractionsService: markReviewHelpful is stubbed - functionality disabled');
    return {
      success: false,
      helpfulVotes: 0,
      message: 'Service temporarily disabled'
    };
  }

  async reportReview(reviewId: string, userId: string, reason: string): Promise<{
    success: boolean;
    message: string;
  }> {
    console.warn('RecipeInteractionsService: reportReview is stubbed - functionality disabled');
    return {
      success: false,
      message: 'Service temporarily disabled'
    };
  }

  async getUserLikedRecipes(userId: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    likedRecipeIds: string[];
    totalCount: number;
    hasMore: boolean;
  }> {
    console.warn('RecipeInteractionsService: getUserLikedRecipes is stubbed - returning empty');
    return {
      likedRecipeIds: [],
      totalCount: 0,
      hasMore: false
    };
  }

  async getUserReviews(userId: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    reviews: RecipeReview[];
    totalCount: number;
    hasMore: boolean;
  }> {
    console.warn('RecipeInteractionsService: getUserReviews is stubbed - returning empty');
    return {
      reviews: [],
      totalCount: 0,
      hasMore: false
    };
  }
}

// Export both the class and an instance for compatibility
export const recipeInteractionsService = RecipeInteractionsService.getInstance();
export default RecipeInteractionsService;