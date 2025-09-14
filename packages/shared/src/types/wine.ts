import { WineType, WineCondition, WineStatus, WineSortBy } from './enums';
import { User } from './user';

export interface Wine {
  id: string;
  title: string;
  description: string;
  price: number;
  annata?: number;
  region?: string;
  country?: string;
  producer?: string;
  grapeVariety?: string;
  alcoholContent?: number;
  volume?: number;
  wineType: WineType;
  condition: WineCondition;
  quantity: number;
  status: WineStatus;
  images: string[];
  sellerId: string;
  seller?: User;
  createdAt: Date;
  updatedAt: Date;
  soldAt?: Date;
  averageRating?: number;
  totalReviews?: number;
}

export interface WineFilters {
  search?: string;
  wineType?: WineType[];
  country?: string[];
  region?: string[];
  producer?: string[];
  priceMin?: number;
  priceMax?: number;
  annataMin?: number;
  annataMax?: number;
  condition?: WineCondition[];
  alcoholContentMin?: number;
  alcoholContentMax?: number;
  sortBy?: WineSortBy;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateWineRequest {
  title: string;
  description: string;
  price: number;
  annata?: number;
  region?: string;
  country?: string;
  producer?: string;
  grapeVariety?: string;
  alcoholContent?: number;
  volume?: number;
  wineType: WineType;
  condition: WineCondition;
  quantity: number;
  images: string[];
}

export interface UpdateWineRequest extends Partial<CreateWineRequest> {
  status?: WineStatus;
}

export interface WineSearchResult {
  wines: Wine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    countries: string[];
    regions: string[];
    producers: string[];
    wineTypes: WineType[];
    priceRange: { min: number; max: number };
    annataRange: { min: number; max: number };
  };
}

