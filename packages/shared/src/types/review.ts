import { ReviewType } from './enums';
import { User } from './user';
import { Wine } from './wine';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewer: User;
  target?: User;
  wine?: Wine;
  type: ReviewType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  targetId: string;
  wineId?: string;
  type: ReviewType;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

