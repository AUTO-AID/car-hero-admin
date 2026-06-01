export interface Review {
  _id: string;
  user?: { fullName?: string; phoneNumber?: string };
  provider?: { businessName?: string; phone?: string };
  rating: number;
  comment?: string;
  isVisible: boolean;
  isReported: boolean;
  reportReason?: string;
  createdAt: Date | string;
  serviceQuality?: number;
  punctuality?: number;
  professionalism?: number;
  valueForMoney?: number;
  providerResponse?: string;
  providerRespondedAt?: Date | string;
  response?: { comment?: string; repliedAt?: Date | string };
  helpfulCount?: number;
}
