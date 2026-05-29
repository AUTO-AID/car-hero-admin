export interface SubscriptionPlan {
  _id?: string;
  id?: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  durationDays: number;
  features?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscriber {
  _id?: string;
  id?: string;
  user: {
    _id?: string;
    id?: string;
    fullName: string;
    phoneNumber: string;
  };
  plan: {
    _id?: string;
    id?: string;
    name: string;
    nameAr?: string;
  };
  status: "active" | "expired" | "cancelled" | string;
  startDate: string;
  endDate: string;
  createdAt?: string;
}
