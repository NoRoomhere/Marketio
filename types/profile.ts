export interface FollowersCount {
  instagram?: number;
  tiktok?: number;
  youtube?: number;
}

export interface Rates {
  post: number;
  story: number;
  reels: number;
}

export interface InfluencerProfile {
  displayName?: string;
  niches: string[];
  followers: FollowersCount;
  rates: Rates;
  bio: string;
  avatarUrl: string;
  mediaKitUrl?: string;
  city: string;
  verified: boolean;
  rating: number;
  createdAt?: unknown;
}

export interface BrandProfile {
  companyName: string;
  industry: string;
  budgetRange: string;
  website: string;
  description: string;
  logoUrl: string;
}

export const defaultInfluencerProfile: InfluencerProfile = {
  niches: [],
  followers: {},
  rates: { post: 0, story: 0, reels: 0 },
  bio: "",
  avatarUrl: "",
  mediaKitUrl: "",
  city: "",
  verified: false,
  rating: 0,
};

export const defaultBrandProfile: BrandProfile = {
  companyName: "",
  industry: "",
  budgetRange: "",
  website: "",
  description: "",
  logoUrl: "",
};
