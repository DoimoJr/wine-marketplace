import { User } from './user';
import { Wine } from './wine';

export interface Wishlist {
  id: string;
  userId: string;
  user?: User;
  wineId: string;
  wine: Wine;
  createdAt: Date;
}

export interface AddToWishlistRequest {
  wineId: string;
}

export interface WishlistResponse {
  wishlistItems: Wishlist[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WishlistItemStatus {
  isInWishlist: boolean;
}

export interface WishlistFilters {
  page?: number;
  limit?: number;
}