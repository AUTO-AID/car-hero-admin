export interface Review {
  _id: string;
  user: {
    fullName: string;
  };
  provider: {
    businessName: string;
  };
  rating: number;
  comment: string;
  isVisible: boolean;
  isReported: boolean;
  createdAt: Date | string;
  serviceQuality?: number;
  punctuality?: number;
  professionalism?: number;
  valueForMoney?: number;
  providerResponse?: string;
  providerRespondedAt?: Date | string;
}

export interface ReviewResponse {
  reviews: Review[];
  total: number;
}
